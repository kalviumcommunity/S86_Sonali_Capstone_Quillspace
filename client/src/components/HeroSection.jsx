import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { AuthContext } from '../context/AuthContext'; // #42 — use AuthContext not localStorage
import api from '../services/api';
import { Sparkles } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext); // #42
  const bgRef = useRef(null);
  const [stats, setStats] = useState({ posts: 0, writers: 0, comments: 0 }); // #16
  const [heroImgError, setHeroImgError] = useState(false); // #15 — track image load failure

  // Fetch real platform stats (#16)
  useEffect(() => {
    api.get('/posts/stats')
      .then((res) => {
        if (res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch(() => {
        // Silently fail — stats display is non-critical
      });
  }, []);

  // High performance scroll parallax
  useEffect(() => {
    const handleScroll = () => {
      if (!bgRef.current) return;
      const scrolled = window.scrollY;
      bgRef.current.style.transform = `translate3d(0, ${scrolled * 0.4}px, 0)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/home');
    } else {
      navigate('/signup');
    }
  };

  const formatCount = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
    return n > 0 ? `${n}+` : '0';
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-32 sm:pt-40">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div
          ref={bgRef}
          className="absolute -top-1/4 -bottom-1/4 left-0 right-0"
          style={{
            willChange: 'transform',
            // #15 — CSS gradient fallback if hero-bg.png is missing
            background: heroImgError
              ? 'radial-gradient(ellipse at 20% 50%, #1a1f3a 0%, #0B1120 50%, #0f172a 100%)'
              : undefined,
            backgroundImage: !heroImgError ? 'url(/hero-bg.png)' : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Hidden img to detect load failure (#15) */}
          {!heroImgError && (
            <img
              src="/hero-bg.png"
              alt=""
              style={{ display: 'none' }}
              onError={() => setHeroImgError(true)}
            />
          )}
        </div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-bg/90" />
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-semibold mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>The Modern Writers Platform</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text mb-4 sm:mb-6 leading-tight">
          Welcome to <span className="text-accent">QuillSpace</span>
        </h1>

        {/* Subheading */}
        <h2 className="text-xl sm:text-2xl md:text-3xl text-text-secondary mb-6 font-light">
          Your Thoughts. Your Voice. Your Space.
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-text-secondary/90 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
          A modern platform for writers, thinkers, and creators to share ideas, connect with readers, and grow together.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleGetStarted}
            className="w-full sm:w-auto"
          >
            {isLoggedIn ? 'Go to Dashboard →' : 'Get Started Free →'}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            to="/home"
            className="w-full sm:w-auto"
          >
            Explore Blogs
          </Button>
        </div>

        {/* Social Proof — Real Stats (#16) */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border/30">
          <p className="text-sm text-text-secondary/70 mb-3">
            {stats.posts > 0 ? 'Join our growing community of writers' : 'Be the first to write on QuillSpace'}
          </p>
          <div className="flex justify-center items-center gap-4 sm:gap-8 flex-wrap">
            <div className="text-center">
              <p className="text-accent font-bold text-lg sm:text-xl">{formatCount(stats.posts)}</p>
              <p className="text-text-secondary/70 text-xs">Posts Published</p>
            </div>
            <div className="w-px h-8 bg-border/50 hidden sm:block" />
            <div className="text-center">
              <p className="text-accent font-bold text-lg sm:text-xl">{formatCount(stats.writers)}</p>
              <p className="text-text-secondary/70 text-xs">Writers</p>
            </div>
            <div className="w-px h-8 bg-border/50 hidden sm:block" />
            <div className="text-center">
              <p className="text-accent font-bold text-lg sm:text-xl">{formatCount(stats.comments)}</p>
              <p className="text-text-secondary/70 text-xs">Comments</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-2">
          <svg className="w-5 h-5 text-accent animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="text-text-secondary/60 text-xs">Scroll to explore</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
