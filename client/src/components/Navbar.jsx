import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import { AuthContext } from '../context/AuthContext';
import { Feather, PenTool, User, LogOut, Settings, Bookmark, Search, Bell } from 'lucide-react';
import { getImageUrl } from '../utils/image';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useContext(AuthContext);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
  ];

  // Don't show landing nav links on dashboard pages
  const showNavLinks = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full bg-surface border-b border-border z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => navigate(isLoggedIn ? '/home' : '/')}
          >
            <Feather className="w-6 h-6 sm:w-8 sm:h-8 text-text" />
            <span className="text-xl sm:text-2xl font-bold text-text">QuillSpace</span>
          </div>

          {/* Desktop Navigation Links (landing only) */}
          {showNavLinks && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-text-secondary hover:text-accent transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Search Bar (dashboard only - Centered Search Pill) */}
          {isLoggedIn && !showNavLinks && (
            <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
              <div className="w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/60 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search"
                  defaultValue={new URLSearchParams(location.search).get('search') || ''}
                  className="w-full pl-11 pr-4 py-2 bg-card/90 border border-border/80 rounded-full text-sm text-text placeholder-text-secondary/60 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const query = e.target.value.trim();
                      navigate(query ? `/home?search=${encodeURIComponent(query)}` : '/home');
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isLoggedIn && !showNavLinks ? (
              <>
                {/* Write Button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/create')}
                  className="hidden sm:inline-flex items-center gap-2"
                >
                  <PenTool className="w-4 h-4" /> Write
                </Button>

                {/* Notifications Button */}
                <button
                  className="p-2 hover:bg-bg/40 text-text-secondary hover:text-text rounded-full transition-colors relative flex items-center justify-center"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-10 h-10 rounded-full bg-accent/30 border border-accent/40 flex items-center justify-center text-sm font-bold text-accent hover:bg-accent/40 transition-colors overflow-hidden"
                    title={user?.username}
                  >
                    {user?.profileImage ? (
                      <img
                        src={getImageUrl(user.profileImage)}
                        alt={user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      user?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-bg border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                      <div className="p-4 border-b border-border">
                        <p className="text-sm font-semibold text-text">{user?.username}</p>
                        <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { navigate(`/profile/${user?.username}`); setShowProfileMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-bg/50 transition-colors flex items-center gap-2"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </button>
                        <button
                          onClick={() => { navigate('/my-posts'); setShowProfileMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-bg/50 transition-colors flex items-center gap-2"
                        >
                          <PenTool className="w-4 h-4" /> My Posts
                        </button>
                        <button
                          onClick={() => { navigate('/bookmarks'); setShowProfileMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-bg/50 transition-colors flex items-center gap-2"
                        >
                          <Bookmark className="w-4 h-4" /> Bookmarks
                        </button>
                        <button
                          onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} // #13 — was /settings which didn't exist
                          className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-bg/50 transition-colors flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" /> Settings
                        </button>
                      </div>
                      <div className="border-t border-border py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              !showNavLinks || !isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-3">
                  <Button variant="ghost" size="sm" to="/login">
                    Sign In
                  </Button>
                  <Button variant="primary" size="sm" to="/signup">
                    Get Started
                  </Button>
                </div>
              ) : null
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-bg/30 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border animate-fade-in">
            {showNavLinks && navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-4 py-3 text-text-secondary hover:text-accent hover:bg-surface rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {isLoggedIn ? (
              <div className="px-4 py-2 space-y-2">
                <button onClick={() => { navigate('/create'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"><PenTool className="w-4 h-4" /> Write</button>
                <button onClick={() => { navigate(`/profile/${user?.username}`); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"><User className="w-4 h-4" /> Profile</button>
                <button onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"><Settings className="w-4 h-4" /> Settings</button>
                <button onClick={handleLogout} className="w-full text-left py-2 flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
              </div>
            ) : (
              <div className="px-4 py-3 flex gap-3">
                <Button variant="ghost" size="sm" to="/login" className="flex-1">Sign In</Button>
                <Button variant="primary" size="sm" to="/signup" className="flex-1">Get Started</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
