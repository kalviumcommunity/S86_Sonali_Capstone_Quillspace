import { useNavigate } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { FaXTwitter, FaGithub, FaLinkedinIn, FaDiscord } from 'react-icons/fa6';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Blog', href: '#blog' },
      { label: 'Updates', href: '#updates' },
    ],
    Company: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: '#contact' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
    ],
    Social: [
      { label: 'Twitter', href: '#twitter', icon: FaXTwitter },
      { label: 'GitHub', href: '#github', icon: FaGithub },
      { label: 'LinkedIn', href: '#linkedin', icon: FaLinkedinIn },
      { label: 'Discord', href: '#discord', icon: FaDiscord },
    ],
  };

  return (
    <footer className="bg-surface border-t border-border text-text-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4 cursor-pointer hover:text-accent transition-colors" onClick={() => navigate('/')}>
              <Feather className="w-6 h-6 text-accent" />
              <span className="text-lg font-bold text-text">QuillSpace</span>
            </div>
            <p className="text-sm text-text-secondary/70">
              A modern platform for writers, thinkers, and creators.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-text mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.Product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-accent transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-text mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.Company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-accent transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-text mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.Legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-accent transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold text-text mb-4">Connect</h4>
            <div className="flex gap-3">
              {footerLinks.Social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/40 transition-colors duration-300"
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-secondary/70">
            © {currentYear} QuillSpace. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#privacy" className="text-sm hover:text-accent transition-colors">
              Privacy
            </a>
            <a href="#terms" className="text-sm hover:text-accent transition-colors">
              Terms
            </a>
            <a href="#contact" className="text-sm hover:text-accent transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
