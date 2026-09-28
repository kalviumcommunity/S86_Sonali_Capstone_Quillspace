const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const crypto = require('crypto');

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    const { title, content, tags, coverImage, coverImageSettings, status } = req.body;

    // Generate slug and ensure uniqueness
    const baseSlug = (title || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug || crypto.randomBytes(4).toString('hex');

    // Use upsert-style retry — MongoDB unique index is the ultimate guard (#6)
    let slugAccepted = false;
    let attempts = 0;
    while (!slugAccepted && attempts < 10) {
      const existing = await Post.findOne({ slug });
      if (!existing) {
        slugAccepted = true;
      } else {
        slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
        attempts++;
      }
    }

    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      tags: tags || [],
      coverImage: coverImage || '',
      coverImageSettings: coverImageSettings || { zoom: 1, x: 50, y: 50, fit: 'contain' },
      slug,
      status: status || 'published',
    });

    await post.populate('author', 'username email profileImage');

    sendSuccess(res, 201, 'Post created successfully', { post });
  } catch (error) {
    // If MongoDB unique key error on slug, regenerate
    if (error.code === 11000 && error.keyPattern?.slug) {
      return sendError(res, 409, 'Failed to generate unique slug. Please try again.');
    }
    next(error);
  }
};

/**
 * @desc    Get all posts with pagination and filtering
 * @route   GET /api/posts
 * @access  Public
 */
const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // cap at 100
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Draft visibility (#10 — only the author or admin can see their own drafts)
    if (req.query.includeDrafts === 'true') {
      // Only allow if authenticated AND requesting own posts
      const requestedAuthor = req.query.author;
      const reqUserId = req.user?.id || req.user?._id?.toString();
      if (reqUserId && requestedAuthor && reqUserId === requestedAuthor) {
        // Authenticated author viewing own posts — show all statuses
      } else {
        // Not authorized to see drafts — only published
        filter.status = 'published';
      }
    } else {
      filter.status = 'published';
    }

    if (req.query.author) {
      filter.author = req.query.author;
    }

    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    // Search by title, content, tags, or author name (#8)
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      const User = require('../models/User');
      const matchingUsers = await User.find({
        $or: [{ username: searchRegex }, { name: searchRegex }],
      }).select('_id');
      const matchingUserIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex },
        ...(matchingUserIds.length > 0 ? [{ author: { $in: matchingUserIds } }] : []),
      ];
    }

    // Sorting (#9 — was hardcoded to createdAt, now supports query param)
    let sortObj = { createdAt: -1 }; // default
    if (req.query.sort) {
      switch (req.query.sort) {
        case '-likes':
        case 'likes':
          // Sort by like count using aggregation-compatible approach
          sortObj = { likeCount: -1, createdAt: -1 };
          break;
        case '-views':
          sortObj = { views: -1, createdAt: -1 };
          break;
        case '-comments':
          sortObj = { commentCount: -1, createdAt: -1 };
          break;
        case 'oldest':
          sortObj = { createdAt: 1 };
          break;
        default:
          sortObj = { createdAt: -1 };
      }
    }

    // For likes sort, we need aggregation to sort by array length
    let posts;
    let total;

    if (req.query.sort === '-likes' || req.query.sort === 'likes') {
      // Use aggregation for likes sorting
      const pipeline = [
        { $match: filter },
        { $addFields: { likeCount: { $size: '$likes' }, commentCount: { $size: '$comments' } } },
        { $sort: { likeCount: -1, createdAt: -1 } },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [{ $project: { username: 1, email: 1, profileImage: 1 } }],
          },
        },
        { $unwind: '$author' },
        { $skip: skip },
        { $limit: limit },
      ];
      const countPipeline = [
        { $match: filter },
        { $count: 'total' },
      ];
      const [postsResult, countResult] = await Promise.all([
        Post.aggregate(pipeline),
        Post.aggregate(countPipeline),
      ]);
      posts = postsResult;
      total = countResult[0]?.total || 0;
    } else {
      total = await Post.countDocuments(filter);
      posts = await Post.find(filter)
        .populate('author', 'username email profileImage')
        .sort(sortObj)
        .skip(skip)
        .limit(limit);
    }

    sendSuccess(res, 200, 'Posts retrieved successfully', {
      posts,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: posts.length,
        totalPosts: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single post by ID and increment views
 * @route   GET /api/posts/:id
 * @access  Public
 */
const getPostById = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id)
      .populate('author', 'username email profileImage bio')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profileImage',
        },
      });

    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    if (post.status === 'draft') {
      const reqUserId = req.user?.id || req.user?._id?.toString();
      const isAuthor = reqUserId && post.author._id.toString() === reqUserId;
      const isAdmin = req.user?.role === 'admin';
      
      if (!isAuthor && !isAdmin) {
        return sendError(res, 404, 'Post not found');
      }
    } else {
      // It's published, increment views
      post = await Post.findByIdAndUpdate(
        post._id,
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate('author', 'username email profileImage bio')
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'username profileImage',
          },
        });
    }

    sendSuccess(res, 200, 'Post retrieved successfully', { post });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single post by slug and increment views
 * @route   GET /api/posts/slug/:slug
 * @access  Public
 */
const getPostBySlug = async (req, res, next) => {
  try {
    const query = { slug: req.params.slug };
    
    let post = await Post.findOne(query)
      .populate('author', 'username email profileImage bio')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profileImage',
        },
      });

    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    if (post.status === 'draft') {
      const reqUserId = req.user?.id || req.user?._id?.toString();
      const isAuthor = reqUserId && post.author._id.toString() === reqUserId;
      const isAdmin = req.user?.role === 'admin';
      
      if (!isAuthor && !isAdmin) {
        return sendError(res, 404, 'Post not found');
      }
    } else {
      // It's published, increment views
      post = await Post.findByIdAndUpdate(
        post._id,
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate('author', 'username email profileImage bio')
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'username profileImage',
          },
        });
    }

    sendSuccess(res, 200, 'Post retrieved successfully', { post });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    // Check if user is post author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to update this post');
    }

    const { title, content, tags, coverImage, coverImageSettings, status } = req.body;

    // Update fields
    if (title) {
      post.title = title;
      // Update slug when title changes
      const baseSlug = (title || '')
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let slug = baseSlug || crypto.randomBytes(4).toString('hex');
      let existing = await Post.findOne({ slug, _id: { $ne: post._id } });
      let attempts = 0;
      while (existing && attempts < 10) {
        slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
        existing = await Post.findOne({ slug, _id: { $ne: post._id } });
        attempts++;
      }
      post.slug = slug;
    }
    if (content) post.content = content;
    if (tags) post.tags = tags;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (coverImageSettings !== undefined) post.coverImageSettings = coverImageSettings;
    if (status) post.status = status;

    await post.save();
    await post.populate('author', 'username email profileImage');

    sendSuccess(res, 200, 'Post updated successfully', { post });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete post (cascades comments)
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    // Check if user is post author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to delete this post');
    }

    // Delete all comments associated with this post (#8)
    await Comment.deleteMany({ post: post._id });

    // Remove post from bookmarks in all users
    const User = require('../models/User');
    await User.updateMany(
      { bookmarks: post._id },
      { $pull: { bookmarks: post._id } }
    );

    // Delete post
    await post.deleteOne();

    sendSuccess(res, 200, 'Post and associated comments deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Like/Unlike a post
 * @route   PUT /api/posts/:id/like
 * @access  Private
 */
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    const userId = req.user._id;

    // #11 — Fix: use .some() with .equals() for ObjectId comparison
    // .indexOf() uses === which fails for ObjectId objects
    const alreadyLiked = post.likes.some((id) => id.equals(userId));

    if (!alreadyLiked) {
      // Like the post
      post.likes.push(userId);
      await post.save();

      sendSuccess(res, 200, 'Post liked successfully', {
        liked: true,
        likeCount: post.likes.length,
      });
    } else {
      // Unlike the post — use MongoDB $pull for atomic removal
      await Post.findByIdAndUpdate(post._id, { $pull: { likes: userId } });

      sendSuccess(res, 200, 'Post unliked successfully', {
        liked: false,
        likeCount: post.likes.length - 1,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform statistics
 * @route   GET /api/posts/stats
 * @access  Public
 */
const getStats = async (req, res, next) => {
  try {
    const User = require('../models/User');

    const [postCount, userCount, commentCount, likesResult] = await Promise.all([
      Post.countDocuments({ status: 'published' }),
      User.countDocuments(),
      Comment.countDocuments(),
      Post.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, total: { $sum: { $size: '$likes' } } } },
      ]),
    ]);

    sendSuccess(res, 200, 'Stats retrieved successfully', {
      posts: postCount,
      writers: userCount,
      comments: commentCount,
      likes: likesResult[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  toggleLike,
  getStats,
};
