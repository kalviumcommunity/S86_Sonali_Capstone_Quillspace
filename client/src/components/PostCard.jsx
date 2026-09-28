import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CoverImage from './CoverImage';
import { getRelativeTime } from '../utils/date';
import { getImageUrl } from '../utils/image';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Edit3, Eye, Bookmark } from 'lucide-react';

const PostCard = ({ post, onEdit, isOwnPost = false, onBookmarkToggle }) => {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [bookmarked, setBookmarked] = useState(
    post.isBookmarked || user?.bookmarks?.includes?.(post._id) || false
  );
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const postLink = post.slug ? `/post/${post.slug}` : `/post/${post._id}`;

  // Clean Markdown formatting from excerpt text
  const cleanExcerpt = post.content
    ? post.content
        .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // unwrap links
        .replace(/[#*`_~>[\]]/g, '') // remove markdown symbols
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 140)
    : '';

  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k views`;
    return `${views} views`;
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
        if (onBookmarkToggle) onBookmarkToggle(post._id, false);
      } else {
        await api.post(`/bookmarks/${post._id}`);
        setBookmarked(true);
        if (onBookmarkToggle) onBookmarkToggle(post._id, true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <article className="bg-card border border-white/5 rounded-2xl p-5 hover:bg-card-hover hover:-translate-y-[2px] transition-all duration-200 group relative flex flex-col h-full overflow-hidden shadow-lg shadow-black/20">
      {/* 1. TOP HEADER: Author Avatar, Name & Actions (Top of Card in Wireframe) */}
      <div className="flex items-center justify-between mb-4">
        {/* Author info & Relative date */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0 overflow-hidden border border-border/50">
            {post.author?.profileImage ? (
              <img
                src={getImageUrl(post.author.profileImage)}
                alt={post.author.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              post.author?.username?.charAt(0).toUpperCase() || 'A'
            )}
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-text block leading-tight truncate">
              {post.author?.username || 'Anonymous'}
            </span>
            <span className="text-xs text-text-secondary/70">
              {getRelativeTime(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Right side of Header: Views & Bookmark & Edit */}
        <div className="flex items-center gap-2 text-xs text-text-secondary/70 flex-shrink-0">
          <span className="flex items-center gap-1 font-medium">
            <Eye className="w-3.5 h-3.5 text-text-secondary/60" />
            {formatViews(post.views)}
          </span>

          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={bookmarkLoading}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark post'}
            className={`p-1.5 rounded-lg border transition-all ${
              bookmarked
                ? 'bg-accent/20 border-accent/40 text-accent'
                : 'border-transparent text-text-secondary/60 hover:text-accent hover:bg-bg/40'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current text-accent' : ''}`} />
          </button>

          {isOwnPost && onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(post._id);
              }}
              className="flex items-center text-xs px-2.5 py-1 bg-accent/20 text-accent hover:bg-accent/30 rounded-lg backdrop-blur-sm transition-colors ml-1"
            >
              <Edit3 className="w-3 h-3 mr-1" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* 2. MIDDLE: Cover Image (Wireframe Image Box) */}
      <Link to={postLink} className="block mb-4 overflow-hidden rounded-xl">
        {post.coverImage ? (
          <CoverImage
            src={post.coverImage}
            settings={post.coverImageSettings}
            alt={post.title}
            className="w-full aspect-video rounded-xl border border-border/40"
          />
        ) : (
          <div className="w-full aspect-video rounded-xl bg-surface/80 border border-border/40 flex items-center justify-center relative overflow-hidden group-hover:border-accent/30 transition-colors">
            <div className="text-text-secondary/30 text-xs font-mono tracking-wider uppercase">QuillSpace</div>
          </div>
        )}
      </Link>

      {/* 3. BOTTOM: Title, Excerpt & Tags */}
      <Link to={postLink} className="flex flex-col flex-1">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {post.tags.slice(0, 3).map((tag) => {
              const cleanTag = tag.replace(/^#+/, '');
              return (
                <span
                  key={cleanTag}
                  className="px-2.5 py-0.5 text-xs font-medium bg-accent/10 border border-accent/20 text-[#A5B4FC] rounded-full"
                >
                  {cleanTag}
                </span>
              );
            })}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-text mb-2 group-hover:text-accent transition-colors duration-200 line-clamp-2 leading-snug">
          {post.title}
        </h3>

        {/* Content Preview / Excerpt */}
        <p className="text-sm text-text-secondary/80 line-clamp-2 leading-relaxed">
          {cleanExcerpt}...
        </p>
      </Link>
    </article>
  );
};

export default PostCard;
