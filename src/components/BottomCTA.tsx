import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const BottomCTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <section id="pricing" className="relative w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-16 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full rounded-[24px] bg-[#0A0D1E] border border-divider p-8 lg:p-12 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Abstract Background Orbs */}
        <div className="absolute top-0 left-0 w-[250px] h-[250px] bg-primary/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-[150px] h-[150px] bg-secondary/20 blur-[80px] pointer-events-none" />
        
        {/* Floating purple circles for visual flair */}
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 left-8 w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-md"
        />
        <motion.div 
          animate={{ y: [0, 15, 0], x: [0, 10, 0] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-[20%] w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/10 blur-xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-[35%] w-8 h-8 rounded-full bg-primary/50 blur-sm"
        />

        {/* Left: Text */}
        <div className="flex-1 text-center lg:text-left z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-text leading-tight">
            Join Thousands of Students<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Learning Smarter</span> with Prime AI
          </h2>
        </div>

        {/* Right: Input & Button */}
        <div className="w-full lg:w-auto shrink-0 z-10 flex flex-col items-center lg:items-end">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[450px]">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full sm:w-auto flex-1 bg-card-hover border border-divider rounded-[14px] px-5 py-4 text-primary-text placeholder-white/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-primary-text transition-all duration-300 rounded-[14px] bg-[#5B3AED] hover:bg-[#6D4CFF] hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] shrink-0"
            >
              <span className="relative flex items-center gap-2">{user ? 'Go to Dashboard' : 'Sign Up Free'} <ArrowRight className="w-4 h-4" /></span>
            </button>
          </div>
          <p className="text-secondary-text text-xs mt-3 text-center sm:text-right w-full sm:pr-8 lg:pr-2">
            No credit card required.
          </p>
        </div>

      </motion.div>
    </section>
  );
};
