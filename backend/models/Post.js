const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    coverImage: {
      type: String,
      default: '',
    },
    coverImageSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ zoom: 1, x: 50, y: 50, fit: 'contain' }),
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    // Real view tracking (#17)
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ likes: 1 }); // for sorting by likes

// Virtual for like count
PostSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

// Ensure virtuals are included in JSON
PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', PostSchema);
