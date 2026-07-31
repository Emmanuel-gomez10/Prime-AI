import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Star, ArrowRight } from 'lucide-react';
import { Magnetic } from './ui/Magnetic';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Staggered entrance animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};


export const HeroLeft: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-[580px] mx-auto lg:mx-0 gpu-accelerated"
    >
      {/* Hero Badge */}
      <motion.div variants={itemVariants} className="mb-4 sm:mb-6 lg:mb-8">
        <div className="group relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-card-hover border border-divider backdrop-blur-md shadow-[0_0_15px_rgba(124,58,237,0.15)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(124,58,237,0.3)] hover:-translate-y-[2px] cursor-default min-h-[44px]">
          <Sparkles className="w-4 h-4 text-primary transition-all duration-300 group-hover:scale-110" />
          <span className="text-[11px] sm:text-[12px] font-bold text-[#bba5f5] tracking-widest uppercase">
            #1 AI Platform for Students
          </span>
        </div>
      </motion.div>

      {/* Main Heading */}
      <motion.h1
        variants={itemVariants}
        className="text-[32px] min-[375px]:text-[38px] sm:text-[52px] lg:text-[60px] xl:text-[70px] font-extrabold leading-[1.08] tracking-tight text-primary-text mb-4 sm:mb-6"
      >
        Your AI Companion <br className="hidden min-[400px]:inline" />
        for Smarter <br className="hidden min-[400px]:inline" />
        <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#6366F1]">
          Academic Success.
        </span>
      </motion.h1>

      {/* Supporting Paragraph */}
      <motion.p
        variants={itemVariants}
        className="text-[14px] sm:text-[16px] lg:text-[18px] text-[#AAB4D0] leading-[1.6] max-w-[540px] mb-6 sm:mb-8 lg:mb-10 font-medium px-2 sm:px-0"
      >
        Prime AI helps students summarize lecture notes, solve assignments, prepare for exams, organize study materials and understand difficult concepts using powerful AI.
      </motion.p>

      {/* Feature Chips */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap justify-center lg:justify-start gap-2.5 sm:gap-3 mb-8 sm:mb-10 lg:mb-12"
      >
        {[
          { text: 'AI Study Assistant', icon: <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" /> },
          { text: 'Instant Answers', icon: <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" /> },
          { text: 'PDF Analysis', icon: <span className="text-[14px]">📄</span> },
          { text: 'Built for Students', icon: <span className="text-[14px]">🎓</span> }
        ].map((feature, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-md bg-card-hover border border-divider backdrop-blur-sm transition-all duration-300 hover:bg-card-hover hover:-translate-y-[2px] min-h-[44px]"
          >
            {feature.icon}
            <span className="text-[12px] sm:text-[13px] font-medium text-primary-text">{feature.text}</span>
          </div>
        ))}
      </motion.div>

      {/* Call-to-Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4 mb-8 sm:mb-12 w-full sm:w-auto px-2 sm:px-0"
      >
        <Magnetic intensity={0.2}>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate(user ? '/dashboard' : '/signup')}
            className="group relative flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-[20px] text-primary-text font-semibold text-base sm:text-lg transition-all duration-300 hover:shadow-[0_12px_40px_rgba(124,58,237,0.6)] hover:from-[#8B5CF6] hover:to-[#6366F1] min-h-[52px]"
          >
            {/* Pulse Glow */}
            <span className="absolute inset-0 w-full h-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-[20px]" />
            <span className="relative z-10 flex items-center gap-2">
              {user ? 'Go to Dashboard' : "Sign Up — It's Free"} <ArrowRight className="w-5 h-5" />
            </span>
          </motion.button>
        </Magnetic>

        <Magnetic intensity={0.15}>
          <motion.button 
            whileHover={{ backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.3)", boxShadow: "0 0 20px rgba(255,255,255,0.15)" }}
            className="group flex items-center justify-center w-full sm:w-auto px-6 py-3.5 bg-transparent border-none rounded-[20px] text-primary-text font-medium text-base sm:text-lg transition-all duration-300 min-h-[52px]"
          >
            <div className="group-hover:rotate-[15deg] transition-transform duration-300 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20 bg-card-hover mr-3">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white/80 transition-colors duration-300 group-hover:fill-white" />
            </div>
            Watch Demo
          </motion.button>
        </Magnetic>
      </motion.div>

      {/* Social Proof */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6"
      >
        <div className="flex -space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#070816] overflow-hidden bg-surface relative z-10 hover:z-20 transition-all duration-200"
            >
              <img
                src={`https://i.pravatar.cc/100?img=${i * 10 + 5}`}
                alt="Student avatar"
                loading="lazy"
                width="40"
                height="40"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex text-[#FFB800]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-[13px] sm:text-[14px] text-secondary-text font-medium">
            Trusted by thousands of<br className="hidden sm:inline" /> students worldwide.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
});

HeroLeft.displayName = 'HeroLeft';

