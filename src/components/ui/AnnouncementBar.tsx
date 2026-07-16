import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const dismissed = localStorage.getItem('announcement-dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('announcement-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0, overflow: 'hidden' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-50 w-full"
        >
          {/* Subtle Glow behind the bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 blur-xl pointer-events-none" />
          
          <div className={cn(
            'relative w-full border-b border-white/[0.08]',
            'bg-[#0d1024]/75 backdrop-blur-[20px]',
            'min-h-[40px] md:min-h-[48px] py-2 md:py-0 px-6 lg:px-8 flex items-center justify-center'
          )}>
            <div className="w-full max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              
              {/* Left Side: Icon & Text */}
              <div className="flex items-center justify-center sm:justify-start flex-1 gap-2 text-sm font-medium text-textSecondary text-center sm:text-left">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <p>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-pulse mr-1">
                    Prime AI
                  </span>
                  <span className="text-primary-text">is helping students learn smarter.</span>
                </p>
              </div>

              {/* Right Side: CTA & Close */}
              <div className="flex items-center justify-center gap-4 shrink-0">
                <a
                  href="#get-started"
                  className="group relative inline-flex items-center text-xs font-semibold text-primary-text transition-all bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)] hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                >
                  Get Started 
                  <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                </a>

                <button
                  onClick={handleDismiss}
                  aria-label="Dismiss announcement"
                  className="p-1 rounded-full text-textSecondary hover:text-primary-text hover:bg-card-hover transition-all hover:rotate-90 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
