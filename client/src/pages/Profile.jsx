import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CoverImage from '../components/CoverImage';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  User,
  MapPin,
  Edit3,
  Globe,
  FileText,
  PenTool,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  ChevronDown,
  Share2,
} from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { getImageUrl } from '../utils/image';

/**
 * Single Post Card styled specifically for the Profile page:
 * - 16:9 Cover image at top
 * - Category / Tag pill badge
 * - Post title & excerpt preview
 * - Interactive footer with live Views, Likes (working toggle), Comments count, and Bookmark (working toggle)
 */
const ProfilePostCard = ({ post, currentUser, token, onEdit, isOwnProfile }) => {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(
    post.isBookmarked || currentUser?.bookmarks?.includes?.(post._id) || false
  );
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const initialLiked = currentUser && post.likes
    ? post.likes.some(
        (id) =>
          id === currentUser._id ||
          id?._id === currentUser._id ||
          id?.toString() === currentUser._id?.toString()
      )
    : false;
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const postLink = post.slug ? `/post/${post.slug}` : `/post/${post._id}`;

  const cleanExcerpt = post.content
    ? post.content
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/[#*`_~>[\]]/g, '')
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 110)
    : '';

  const formatCount = (count) => {
    if (!count) return 0;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count;
  };

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      navigate('/login');
      return;
    }
    if (likeLoading) return;
    setLikeLoading(true);

    try {
      const res = await api.put(`/posts/${post._id}/like`);
      const { liked: nowLiked, likeCount: newCount } = res.data.data;
      setLiked(nowLiked);
      setLikeCount(newCount !== undefined ? newCount : liked ? likeCount - 1 : likeCount + 1);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      navigate('/login');
      return;
    }
    if (bookmarkLoading) return;
    setBookmarkLoading(true);

    try {
      if (bookmarked) {
        await api.delete(`/bookmarks/${post._id}`);
        setBookmarked(false);
      } else {
        await api.post(`/bookmarks/${post._id}`);
        setBookmarked(true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const primaryTag = post.tags && post.tags.length > 0 ? post.tags[0].replace(/^#+/, '') : null;

  return (
    <article className="bg-card border border-white/5 rounded-2xl overflow-hidden hover:bg-card-hover hover:-translate-y-1 transition-all duration-200 group flex flex-col h-full shadow-lg shadow-black/20">
      {/* 1. Cover Image */}
      <Link to={postLink} className="block relative aspect-video w-full overflow-hidden bg-surface">
        {post.coverImage ? (
          <CoverImage
            src={post.coverImage}
            settings={post.coverImageSettings}
            alt={post.title}
            className="w-full h-full rounded-none border-b border-border/40"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface to-card flex items-center justify-center border-b border-border/40">
            <span className="text-text-secondary/40 text-xs font-mono tracking-wider uppercase">
              QuillSpace
            </span>
          </div>
        )}

        {isOwnProfile && onEdit && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(post._id);
            }}
            className="absolute top-3 right-3 z-20 flex items-center gap-1 text-xs px-2.5 py-1 bg-black/60 hover:bg-accent text-white rounded-lg backdrop-blur-md transition-colors"
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
        )}
      </Link>

      {/* 2. Body: Tag, Title, Excerpt */}
      <div className="p-5 flex-1 flex flex-col">
        {primaryTag && (
          <div className="mb-2">
            <span className="px-2.5 py-0.5 text-xs font-medium bg-accent/15 text-accent-hover rounded-full">
              {primaryTag}
            </span>
          </div>
        )}

        <Link to={postLink} className="block">
          <h3 className="text-base sm:text-lg font-bold text-text group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-xs sm:text-sm text-text-secondary/80 line-clamp-2 leading-relaxed mb-4 flex-1">
          {cleanExcerpt}...
        </p>

        {/* 3. Footer: Views, Likes, Comments & Bookmark */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-auto text-xs text-text-secondary/70">
          <div className="flex items-center gap-4">
            {/* Views */}
            <span className="flex items-center gap-1.5" title="Views">
              <Eye className="w-4 h-4 text-text-secondary/60" />
              <span>{formatCount(post.views)}</span>
            </span>

            {/* Likes */}
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={likeLoading}
              className={`flex items-center gap-1.5 transition-colors ${
                liked ? 'text-red-400' : 'hover:text-red-400'
              }`}
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current text-red-400' : ''}`} />
              <span>{formatCount(likeCount)}</span>
            </button>

            {/* Comments */}
            <span className="flex items-center gap-1.5" title="Comments">
              <MessageSquare className="w-4 h-4 text-text-secondary/60" />
              <span>{post.comments?.length || 0}</span>
            </span>
          </div>

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={bookmarkLoading}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked ? 'text-accent' : 'text-text-secondary/60 hover:text-accent'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark post'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current text-accent' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
};

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useContext(AuthContext);

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('published');
  const [sortBy, setSortBy] = useState('latest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const userRes = await api.get(`/users/profile/${username}`);
      const u = userRes.data.data.user;
      setProfileUser(u);
      setFollowersCount(u.followersCount || u.followers?.length || 0);

      // Check if current user is following this profile
      if (currentUser && !isOwnProfile) {
        const isAlreadyFollowing = u.followers?.some(
          (id) => id?.toString() === currentUser._id?.toString() || id === currentUser._id
        );
        setIsFollowing(!!isAlreadyFollowing);
      }

      // Fetch posts by this user
      const postsParams = { author: u._id, limit: 50 };
      if (isOwnProfile) {
        postsParams.includeDrafts = 'true';
      }

      const postsRes = await api.get('/posts', { params: postsParams });
      setPosts(postsRes.data.data.posts || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.put(`/users/${profileUser._id}/unfollow`);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
      } else {
        await api.put(`/users/${profileUser._id}/follow`);
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    } catch (err) {
      console.error('Follow action failed:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditPost = (postId) => {
    navigate(`/edit/${postId}`);
  };

  const handleShareProfile = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileUser.username}'s Profile on QuillSpace`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      } catch (err) {
        console.error('Failed to copy profile link', err);
      }
    }
  };

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = isOwnProfile ? posts.filter((p) => p.status === 'draft') : [];

  const tabs = [
    { id: 'published', label: 'Published', count: publishedPosts.length },
    ...(isOwnProfile ? [{ id: 'drafts', label: 'Drafts', count: draftPosts.length }] : []),
  ];

  const currentTabPosts = activeTab === 'drafts' ? draftPosts : publishedPosts;

  // Real-time sorting
  const sortedPosts = [...currentTabPosts].sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'likes') {
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    }
    if (sortBy === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    // default 'latest'
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const sortLabels = {
    latest: 'Latest',
    oldest: 'Oldest',
    likes: 'Most Liked',
    views: 'Most Viewed',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
          <User className="w-16 h-16 text-text-secondary" />
          <h2 className="text-2xl font-bold">User Not Found</h2>
          <p className="text-text-secondary text-sm">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />

      {/* Main Profile Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* 1. Panoramic Landscape Banner matching image */}
        <div className="w-full h-44 sm:h-56 md:h-64 rounded-2xl overflow-hidden relative shadow-xl bg-surface border border-border/40">
          <img
            src={profileUser.bannerImage || '/default-profile-banner.jpg'}
            alt="Profile cover banner"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to rich purple sunset gradient if image fails
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* 2. Profile Details & Stats Section */}
        <div className="relative px-2 sm:px-4 pt-0 pb-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            {/* Avatar & Info */}
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#020617] bg-[#1e1b4b] flex items-center justify-center text-accent shadow-2xl relative -mt-12 sm:-mt-14 z-10 overflow-hidden flex-shrink-0">
                {profileUser.profileImage ? (
                  <img
                    src={getImageUrl(profileUser.profileImage)}
                    alt={profileUser.username}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-accent" />
                )}
              </div>

              <div className="pt-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-text leading-tight">
                  {profileUser.username}
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary/70">
                  @{profileUser.username}
                </p>

                <p className="text-sm text-text-secondary mt-2.5 max-w-xl leading-relaxed">
                  {profileUser.bio ||
                    'Full-stack developer sharing ideas about technology, productivity and building useful products.'}
                </p>

                {profileUser.location && (
                  <p className="flex items-center text-text-secondary/70 text-xs mt-2">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-accent" /> {profileUser.location}
                  </p>
                )}

                {/* Social links */}
                {profileUser.socialLinks && Object.values(profileUser.socialLinks).some(Boolean) && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {profileUser.socialLinks.github && (
                      <a
                        href={profileUser.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary hover:text-accent transition-colors text-xs flex items-center gap-1"
                      >
                        <FaGithub className="w-3.5 h-3.5" /> GitHub
                      </a>
                    )}
                    {profileUser.socialLinks.twitter && (
                      <a
                        href={profileUser.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary hover:text-accent transition-colors text-xs flex items-center gap-1"
                      >
                        <FaTwitter className="w-3.5 h-3.5" /> Twitter/X
                      </a>
                    )}
                    {profileUser.socialLinks.linkedin && (
                      <a
                        href={profileUser.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary hover:text-accent transition-colors text-xs flex items-center gap-1"
                      >
                        <FaLinkedin className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                    {profileUser.socialLinks.website && (
                      <a
                        href={profileUser.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary hover:text-accent transition-colors text-xs flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5" /> Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Action: Edit Profile or Follow Button */}
            <div className="pt-2 sm:pt-3 self-end sm:self-auto flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 px-4 py-2 border border-border hover:border-accent/60 bg-surface/60 hover:bg-surface rounded-xl text-sm font-medium transition-colors text-text whitespace-nowrap shadow-sm"
                >
                  <Edit3 className="w-4 h-4 text-accent" /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-sm ${
                    isFollowing
                      ? 'bg-accent/20 text-accent border border-accent/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-400/40'
                      : 'bg-accent text-white hover:bg-accent-hover'
                  }`}
                >
                  {followLoading ? '...' : isFollowing ? 'Following ✓' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {/* Centered Stats Row matching screenshot (Posts, Followers, Following) */}
          <div className="flex items-center justify-center gap-12 sm:gap-16 my-6 pt-5 border-t border-border/30">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-text">{publishedPosts.length}</p>
              <p className="text-xs text-text-secondary/70 mt-0.5">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-text">{followersCount}</p>
              <p className="text-xs text-text-secondary/70 mt-0.5">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-text">
                {profileUser.followingCount || profileUser.following?.length || 0}
              </p>
              <p className="text-xs text-text-secondary/70 mt-0.5">Following</p>
            </div>
          </div>
        </div>

        {/* 3. Tabs & Sort Bar */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-8">
          {/* Tabs: Published & Drafts */}
          <div className="flex items-center gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`group flex items-center justify-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 outline-none select-none cursor-pointer ${
                    isActive
                      ? 'bg-accent/20 text-accent border border-accent/40 shadow-sm'
                      : 'text-text-secondary hover:text-text hover:bg-card-hover border border-transparent'
                  }`}
                >
                  <span className="leading-none">{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold leading-none transition-colors ${
                      isActive
                        ? 'bg-accent/30 text-accent border border-accent/40'
                        : 'bg-surface border border-border/60 text-text-secondary group-hover:text-text group-hover:border-border'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-surface/80 border border-border/80 hover:border-accent/40 hover:bg-card-hover rounded-xl text-xs sm:text-sm text-text-secondary hover:text-text transition-all outline-none"
            >
              <span>{sortLabels[sortBy] || 'Latest'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSortDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-surface border border-border rounded-xl shadow-2xl py-1 z-50 animate-fade-in text-xs">
                  {Object.entries(sortLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSortBy(key);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 transition-colors ${
                        sortBy === key
                          ? 'text-accent font-semibold bg-accent/10'
                          : 'text-text-secondary hover:text-text hover:bg-bg/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4. Three-Column Posts Grid */}
        {sortedPosts.length === 0 ? (
          <div className="text-center py-20 bg-surface/40 rounded-2xl border border-border/60 p-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-text-secondary/40" />
            <h3 className="text-lg font-bold text-text mb-2">
              {activeTab === 'drafts' ? 'No draft posts' : 'No posts published yet'}
            </h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
              {isOwnProfile
                ? activeTab === 'drafts'
                  ? 'Your saved drafts will appear here.'
                  : "You haven't published any stories yet. Start writing your post!"
                : `${profileUser.username} hasn't published any posts yet.`}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/create')}
                className="flex items-center mx-auto px-6 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors text-sm"
              >
                <PenTool className="w-4 h-4 mr-2" /> Write your post
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map((post) => (
              <ProfilePostCard
                key={post._id}
                post={post}
                currentUser={currentUser}
                token={token}
                onEdit={isOwnProfile ? handleEditPost : null}
                isOwnProfile={isOwnProfile}
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. Floating Share Profile Action Button (matching bottom-right icon in screenshot) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={handleShareProfile}
          title={shareCopied ? 'Copied link!' : 'Share profile'}
          className="w-12 h-12 rounded-full bg-surface border border-border/80 shadow-2xl flex items-center justify-center text-text hover:text-accent hover:border-accent/50 hover:scale-105 transition-all duration-200 group"
        >
          <Share2 className="w-5 h-5 text-text-secondary group-hover:text-accent" />
        </button>
        {shareCopied && (
          <div className="absolute bottom-14 right-0 px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
            Profile link copied!
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
