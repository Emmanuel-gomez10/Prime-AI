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

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ease-out border-b',
          isScrolled
            ? 'bg-[#0d1024]/85 backdrop-blur-[24px] border-white/[0.12] py-3 md:py-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]'
            : 'bg-[#0d1024]/65 backdrop-blur-[18px] border-white/[0.08] py-4 md:py-5'
        )}
      >
        <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Area */}
          <a
            href="/"
            className="group relative flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            aria-label="Prime AI Home"
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
            <span className="text-xl font-bold text-primary-text tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
              Prime AI
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative px-4 py-2 text-sm font-medium text-textSecondary hover:text-primary-text transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md inline-flex items-center gap-1 hover:-translate-y-[1px]"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180" />}
                <span className="absolute left-1/2 bottom-1 w-0 h-[2px] bg-primary -translate-x-1/2 rounded-full transition-all duration-300 group-hover:w-[calc(100%-2rem)] shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Magnetic intensity={0.2}>
                <Link
                  to="/dashboard"
                  className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-primary-text transition-all duration-300 rounded-[12px] bg-[#5B3AED] hover:bg-[#6D4CFF] hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative">Go to Dashboard</span>
                </Link>
              </Magnetic>
            ) : (
              <>
                <Magnetic intensity={0.15}>
                  <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-medium text-textSecondary hover:text-primary-text transition-all duration-300 rounded-button hover:bg-card-hover hover:border-divider border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Log In
                  </Link>
                </Magnetic>
                <Magnetic intensity={0.2}>
                  <Link
                    to="/signup"
                    className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-primary-text transition-all duration-300 rounded-[12px] bg-[#5B3AED] hover:bg-[#6D4CFF] hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span className="relative">Sign Up Free</span>
                  </Link>
                </Magnetic>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-textSecondary hover:text-primary-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#070816]/95 backdrop-blur-2xl px-5 py-6 md:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary-text tracking-tight">Prime AI</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-textSecondary hover:text-primary-text transition-all hover:rotate-90 rounded-full bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 mt-12 px-2">
              {NAV_LINKS.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-semibold text-textSecondary hover:text-primary-text transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mt-auto pt-8 flex flex-col gap-4"
            >
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-center text-lg font-medium text-primary-text rounded-[20px] bg-gradient-to-r from-[#7C3AED] to-[#5B8CFF] shadow-[0_4px_20px_rgba(124,58,237,0.4)]"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-4 text-center text-lg font-medium text-textSecondary hover:text-primary-text rounded-button border border-divider hover:bg-card-hover transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-4 text-center text-lg font-medium text-primary-text rounded-[20px] bg-gradient-to-r from-[#7C3AED] to-[#5B8CFF] shadow-[0_4px_20px_rgba(124,58,237,0.4)]"
                  >
                    Sign Up Free
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
