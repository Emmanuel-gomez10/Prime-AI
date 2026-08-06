import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layers, Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Magnetic } from './Magnetic';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Features', href: '#features', hasDropdown: true },
  { label: 'Solutions', href: '#solutions', hasDropdown: true },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'About', href: '#about', hasDropdown: true },
];

export const Navbar: React.FC = React.memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ease-out border-b gpu-accelerated',
          isScrolled
            ? 'bg-[#0d1024]/90 backdrop-blur-[16px] border-white/[0.12] py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]'
            : 'bg-[#0d1024]/75 backdrop-blur-[12px] border-white/[0.08] py-4'
        )}
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Area */}
          <a
            href="/"
            className="group relative flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md min-h-[44px]"
            aria-label="Prime Home"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#41E5FF] p-[1px] overflow-hidden group-hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-shadow duration-300">
              <div className="absolute inset-0 bg-[#0d1024] rounded-lg m-[1px] flex items-center justify-center z-10">
                <Layers className="w-5 h-5 text-transparent bg-clip-text" style={{ stroke: 'url(#logo-gradient)' }} />
              </div>
              <svg width="0" height="0">
                <linearGradient id="logo-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop stopColor="#7C3AED" offset="0%" />
                  <stop stopColor="#41E5FF" offset="100%" />
                </linearGradient>
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-primary-text tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
              Prime
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative px-3.5 py-2 text-sm font-medium text-textSecondary hover:text-primary-text transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md inline-flex items-center gap-1 min-h-[44px]"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180" />}
                <span className="absolute left-1/2 bottom-1 w-0 h-[2px] bg-primary -translate-x-1/2 rounded-full transition-all duration-300 group-hover:w-[calc(100%-1.75rem)] shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {user ? (
              <Magnetic intensity={0.2}>
                <Link
                  to="/dashboard"
                  className="relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-primary-text transition-all duration-200 rounded-[12px] bg-[#5B3AED] hover:bg-[#6D4CFF] hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] min-h-[44px]"
                >
                  <span>Go to Dashboard</span>
                </Link>
              </Magnetic>
            ) : (
              <>
                <Magnetic intensity={0.15}>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-primary-text transition-all duration-200 rounded-button hover:bg-card-hover border border-transparent min-h-[44px] flex items-center"
                  >
                    Log In
                  </Link>
                </Magnetic>
                <Magnetic intensity={0.2}>
                  <Link
                    to="/signup"
                    className="relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-primary-text transition-all duration-200 rounded-[12px] bg-[#5B3AED] hover:bg-[#6D4CFF] hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] min-h-[44px]"
                  >
                    <span>Sign Up Free</span>
                  </Link>
                </Magnetic>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2.5 text-textSecondary hover:text-primary-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#070816]/95 backdrop-blur-2xl px-5 py-6 md:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary-text tracking-tight">Prime</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 text-textSecondary hover:text-primary-text transition-all rounded-full bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-5 mt-10 px-2">
              {NAV_LINKS.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl font-semibold text-textSecondary hover:text-primary-text transition-colors py-1 min-h-[44px] flex items-center"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <div className="mt-auto pt-8 flex flex-col gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3.5 text-center text-base font-medium text-primary-text rounded-[16px] bg-gradient-to-r from-[#7C3AED] to-[#5B8CFF] shadow-lg min-h-[48px] flex items-center justify-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 text-center text-base font-medium text-textSecondary hover:text-primary-text rounded-button border border-divider hover:bg-card-hover transition-colors min-h-[48px] flex items-center justify-center"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 text-center text-base font-medium text-primary-text rounded-[16px] bg-gradient-to-r from-[#7C3AED] to-[#5B8CFF] shadow-lg min-h-[48px] flex items-center justify-center"
                  >
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

Navbar.displayName = 'Navbar';

