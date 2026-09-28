import { useEffect, useRef } from 'react';
import Button from './Button';
import { Lock, Zap, Sparkles } from 'lucide-react';

const CTASection = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !bgRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (rect.top < viewportHeight && rect.bottom > 0) {
        // Calculate translation relative to its distance from viewport center
        const centerOffset = (rect.top + rect.height / 2) - viewportHeight / 2;
        bgRef.current.style.transform = `translate3d(0, ${centerOffset * 0.25}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger on mount
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="py-16 sm:py-20 md:py-24 relative overflow-hidden"
    >
      {/* Parallax Background Image */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div
          ref={bgRef}
          className="absolute -top-1/3 -bottom-1/3 left-0 right-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/hero-bg.png)',
            willChange: 'transform',
          }}
        />
        {/* Dark Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/65"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-accent/5 rounded-full filter blur-3xl -mr-36 z-10"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full filter blur-3xl -ml-36 z-10"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-4 sm:mb-6">
          Ready to Start Writing?
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-text-secondary mb-8 sm:mb-10 max-w-2xl mx-auto">
          Join thousands of creators who are already sharing their stories, ideas, and thoughts on QuillSpace.
          Your next masterpiece is just a click away.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="primary"
            size="lg"
            to={isLoggedIn ? '/home' : '/login'}
            className="w-full sm:w-auto"
          >
            Start Writing Now
          </Button>
          <Button
            variant="ghost"
            size="lg"
            to={isLoggedIn ? '/home' : '/login'}
            className="w-full sm:w-auto"
          >
            View Community Blogs
          </Button>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border/30">
          <p className="text-sm text-text-secondary/70 mb-4">No credit card required • Start free today</p>
          <div className="flex justify-center items-center gap-6 text-text-secondary text-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-accent" /> Privacy First
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-accent" /> Lightning Fast
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent" /> Always Free
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
