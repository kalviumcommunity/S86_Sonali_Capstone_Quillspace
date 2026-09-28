import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Bookmark, FileText, PenTool, Feather } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenu = [
    { icon: <Home className="w-6 h-6 mx-auto" />, label: 'Home', path: '/home' },
    { icon: <Bookmark className="w-6 h-6 mx-auto" />, label: 'Bookmarks', path: '/bookmarks' },
    { icon: <FileText className="w-6 h-6 mx-auto" />, label: 'Drafts', path: '/drafts' },
    { icon: <PenTool className="w-6 h-6 mx-auto" />, label: 'My Posts', path: '/my-posts' },
  ];

  const categories = [
    'Technology',
    'Productivity',
    'Career',
    'Design',
    'AI',
    'Entrepreneurship',
    'Education',
    'Lifestyle',
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 w-60 h-screen bg-surface border-r border-border overflow-y-auto pt-20 z-40">
      <div className="p-4 space-y-6">
        {/* Main Menu */}
        <nav className="space-y-1">
          {mainMenu.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-accent/10 text-accent font-semibold border-l-2 border-accent'
                  : 'text-text-secondary hover:text-text hover:bg-bg/30 border-l-2 border-transparent'
              }`}
            >
              <span className="text-lg w-5 text-center">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-border/40 my-2" />

        {/* Categories */}
        <div>
          <div className="flex items-center gap-2 px-4 mb-3 border-l-2 border-accent">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-accent">
              Categories
            </h3>
          </div>
          <div className="space-y-0.5">
            {categories.map((cat) => {
              const catPath = `/category/${cat.toLowerCase()}`;
              const isCatActive = location.pathname === catPath;
              return (
                <button
                  key={cat}
                  onClick={() => navigate(catPath)}
                  className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    isCatActive
                      ? 'text-accent bg-accent/10 font-semibold'
                      : 'text-text-secondary hover:text-text hover:bg-bg/20'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Write Card */}
        <div className="bg-bg/50 border border-border rounded-xl p-4 text-center mt-6">
          <Feather className="w-8 h-8 mx-auto mb-2 text-accent" />
          <h4 className="font-bold text-text mb-2 text-sm">Share Your Story</h4>
          <p className="text-xs text-text-secondary/70 mb-4">
            Write and publish your ideas with the world.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="w-full bg-accent text-white font-semibold py-2 rounded-lg hover:bg-accent-hover transition-colors duration-200 text-sm"
          >
            Create Blog
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
