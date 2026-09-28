import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Flame, Bookmark, Search, PenTool } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = useParams();
  const { user, token } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Determine current page type
  const isMyPostsPage = location.pathname === '/my-posts';
  const isDraftsPage = location.pathname === '/drafts';
  const isTrendingPage = location.pathname === '/trending';
  const isBookmarksPage = location.pathname === '/bookmarks';
  const isExplore = location.pathname === '/explore';
  const isCategoryPage = location.pathname.startsWith('/category/');

  // Extract search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  // Reset page on route change
  useEffect(() => {
    setPage(1);
  }, [location.pathname, searchQuery]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch posts based on current page
  useEffect(() => {
    if (token) fetchPosts();
  }, [page, location.pathname, token, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');

      let params = { page, limit: 12 };

      if (isBookmarksPage) {
        // Fetch real bookmarks from the bookmarks endpoint
        const res = await api.get('/bookmarks');
        setPosts(res.data.data.bookmarks || []);
        setTotalPages(1);
        setLoading(false);
        return;
      } else if (isMyPostsPage && user) {
        params.author = user._id;
        // Only published posts for My Posts — drafts belong to the Drafts page
      } else if (isDraftsPage && user) {
        params.author = user._id;
        params.includeDrafts = 'true';
      } else if (isTrendingPage) {
        params.sort = '-likes';
      } else if (isCategoryPage && category) {
        params.tag = category;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get('/posts', { params });
      let fetchedPosts = response.data.data.posts || [];

      // Filter: only published posts on My Posts, only drafts on Drafts page
      if (isMyPostsPage) {
        fetchedPosts = fetchedPosts.filter((p) => p.status === 'published');
      } else if (isDraftsPage) {
        fetchedPosts = fetchedPosts.filter((p) => p.status === 'draft');
      }

      setPosts(fetchedPosts);
      setTotalPages(response.data.data.pagination?.total || 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (postId) => {
    navigate(`/edit/${postId}`);
  };

  const getPageTitle = () => {
    if (searchQuery) {
      return {
        title: (
          <span className="flex items-center">
            <Search className="w-7 h-7 mr-3 text-accent" /> Search: "{searchQuery}"
          </span>
        ),
        subtitle: `Showing results matching "${searchQuery}" across titles, tags, and authors.`,
      };
    }
    if (isMyPostsPage) {
      return {
        title: 'My Posts',
        subtitle: 'All your published articles and stories.',
      };
    }
    if (isDraftsPage) {
      return {
        title: 'Drafts',
        subtitle: 'Your unpublished work in progress.',
      };
    }
    if (isTrendingPage) {
      return {
        title: (
          <span className="flex items-center">
            <Flame className="w-7 h-7 mr-3 text-accent" /> Trending Stories
          </span>
        ),
        subtitle: 'The most popular and engaging blogs on QuillSpace right now.',
      };
    }
    if (isBookmarksPage) {
      return {
        title: (
          <span className="flex items-center">
            <Bookmark className="w-7 h-7 mr-3 text-accent" /> Bookmarks
          </span>
        ),
        subtitle: 'Articles and stories you saved for later reading.',
      };
    }
    if (isExplore) {
      return {
        title: (
          <span className="flex items-center">
            <Search className="w-7 h-7 mr-3 text-accent" /> Explore
          </span>
        ),
        subtitle: 'Discover great content from writers across the community.',
      };
    }
    if (isCategoryPage) {
      const formattedCategory = category
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : 'Category';
      return {
        title: formattedCategory,
        subtitle: `Explore thoughtful stories and perspectives in ${formattedCategory}.`,
      };
    }

    // Default Home Feed Title & Subtitle (exact match to specification)
    return {
      title: 'Discover Ideas',
      subtitle: 'Read. Learn. Share. Grow.',
    };
  };

  const pageInfo = getPageTitle();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="flex pt-20">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area — spans full available width without leaving empty right margin */}
        <main className="flex-1 ml-60 px-4 sm:px-6 lg:px-8 py-8 w-full min-w-0">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
              {pageInfo.title}
            </h1>
            <p className="text-text-secondary text-sm sm:text-base mt-1.5 font-normal">
              {pageInfo.subtitle}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* No Posts State */}
          {!loading && posts.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20 glass rounded-2xl p-8 border border-border/60 text-center">
              <svg
                className="w-16 h-16 text-text-secondary/40 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-bold text-text mb-2">
                {isBookmarksPage
                  ? 'No bookmarks yet'
                  : isDraftsPage
                  ? 'No draft posts'
                  : isMyPostsPage
                  ? 'Nothing posted yet'
                  : 'No posts found'}
              </h3>
              <p className="text-text-secondary text-sm max-w-md mb-6">
                {isBookmarksPage
                  ? 'Save posts you want to read later by clicking the bookmark icon on any post card.'
                  : isMyPostsPage
                  ? "You haven't created any posts yet. Start writing your first story!"
                  : isDraftsPage
                  ? "You don't have any draft posts."
                  : searchQuery
                  ? `No blogs found for "${searchQuery}". Try searching with different keywords.`
                  : 'Be the first to share your thoughts. Create your first blog and inspire others.'}
              </p>
              {!isBookmarksPage && (
                <button
                  onClick={() => navigate('/create')}
                  className="flex items-center px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors text-sm"
                >
                  <PenTool className="w-4 h-4 mr-2" /> Write your first blog
                </button>
              )}
            </div>
          )}

          {/* Three-Column Blog Grid (Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column) */}
          {!loading && posts.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onEdit={isMyPostsPage || isDraftsPage ? handleEditPost : null}
                    isOwnPost={isMyPostsPage || isDraftsPage}
                    onBookmarkToggle={isBookmarksPage ? () => fetchPosts() : null}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/40">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-card border border-border rounded-xl text-text hover:bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    ← Previous
                  </button>
                  <div className="text-text-secondary text-sm">
                    Page <span className="font-bold text-text">{page}</span> of{' '}
                    <span className="font-bold text-text">{totalPages}</span>
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-card border border-border rounded-xl text-text hover:bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
