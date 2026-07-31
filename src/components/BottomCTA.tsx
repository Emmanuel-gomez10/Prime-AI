import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const BottomCTA: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section id="pricing" className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mb-12 sm:mb-16">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="relative w-full rounded-[20px] sm:rounded-[24px] bg-[#0A0D1E] border border-divider p-6 sm:p-8 lg:p-12 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] gpu-accelerated"
      >
        {/* Abstract Background Orbs */}
        <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-primary/20 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-[120px] h-[120px] bg-secondary/20 blur-[60px] pointer-events-none" />

        {/* Text */}
        <div className="flex-1 text-center lg:text-left z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-text leading-tight">
            Join Thousands of Students<br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> Learning Smarter</span> with Prime AI
          </h2>
        </div>

        {/* Input & Button */}
        <div className="w-full lg:w-auto shrink-0 z-10 flex flex-col items-center lg:items-end">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[450px]">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full sm:w-auto flex-1 bg-card-hover border border-divider rounded-[14px] px-4 sm:px-5 py-3.5 sm:py-4 text-primary-text text-sm sm:text-base placeholder-white/40 focus:outline-none focus:border-primary/50 transition-colors min-h-[48px]"
            />
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-semibold text-primary-text transition-all duration-200 rounded-[14px] bg-[#5B3AED] hover:bg-[#6D4CFF] active:scale-95 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] shrink-0 min-h-[48px]"
            >
              <span className="relative flex items-center gap-2">{user ? 'Go to Dashboard' : 'Sign Up Free'} <ArrowRight className="w-4 h-4" /></span>
            </button>
          </div>
          <p className="text-secondary-text text-[11px] sm:text-xs mt-2.5 text-center sm:text-right w-full sm:pr-8 lg:pr-2">
            No credit card required.
          </p>
        </div>

      </motion.div>
    </section>
  );
});

BottomCTA.displayName = 'BottomCTA';

