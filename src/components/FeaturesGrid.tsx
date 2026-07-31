import React from 'react';
import { motion } from 'framer-motion';
import { Mic, TrendingUp, ArrowRight, ShieldCheck, Target, Calendar, Files, ClipboardList } from 'lucide-react';

const mainFeatures = [
  {
    title: 'Study Fetch',
    description: 'Upload lecture notes, PDFs, PowerPoints and documents. Get instant AI summaries and explanations.',
    image: '/assets/study_fetch_graphic_1783259265751.png',
    gradient: 'from-blue-600/20 to-blue-900/20',
    border: 'border-blue-500/30',
    buttonBg: 'bg-blue-600/20 text-blue-100 border-blue-500/30 hover:bg-blue-600/40'
  },
  {
    title: 'AI Tutor',
    description: 'Get explanations, generate summaries, ask questions and understand any topic instantly.',
    image: '/assets/ai_tutor_graphic_1783259290886.png',
    gradient: 'from-purple-600/20 to-purple-900/20',
    border: 'border-purple-500/30',
    buttonBg: 'bg-purple-600/20 text-purple-100 border-purple-500/30 hover:bg-purple-600/40'
  },
  {
    title: 'Image Solver',
    description: 'Snap any homework or assignment image and get detailed step-by-step solutions.',
    image: '/assets/image_solver_graphic_1783259304798.png',
    gradient: 'from-orange-600/20 to-orange-900/20',
    border: 'border-orange-500/30',
    buttonBg: 'bg-orange-600/20 text-orange-100 border-orange-500/30 hover:bg-orange-600/40'
  }
];

const subFeatures = [
  { title: 'Flashcards', description: 'Create smart flashcards from any material.', icon: ShieldCheck, color: 'text-emerald-400' },
  { title: 'Voice Learning', description: 'Listen to explanations anytime, anywhere.', icon: Mic, color: 'text-purple-400' },
  { title: 'Past Questions', description: 'Access past questions and model answers.', icon: Files, color: 'text-blue-400' },
  { title: 'Weakness Detection', description: 'Find your weak topics and improve faster.', icon: Target, color: 'text-red-400' },
  { title: 'Exam Mode', description: 'Practice like real exams and boost your score.', icon: ClipboardList, color: 'text-cyan-400' },
  { title: 'Progress Tracking', description: 'Track your learning and see real growth.', icon: TrendingUp, color: 'text-blue-500' },
  { title: 'Study Planner', description: 'Plan your study and stay on track.', icon: Calendar, color: 'text-cyan-400' }
];

export const FeaturesGrid: React.FC = React.memo(() => {
  return (
    <section id="features" className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col items-center">
      
      <motion.h2 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="text-[#7C3AED] text-[12px] sm:text-[13px] font-bold tracking-[0.15em] uppercase mb-8 sm:mb-12 text-center"
      >
        EVERYTHING YOU NEED TO LEARN SMARTER
      </motion.h2>

      {/* Main 3 Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full mb-6 sm:mb-8">
        {mainFeatures.map((feat, idx) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
            className={`relative flex flex-col p-5 sm:p-6 lg:p-7 rounded-[18px] sm:rounded-[20px] bg-[#05050A] border ${feat.border} group overflow-hidden h-[240px] sm:h-[270px] lg:h-[290px] gpu-accelerated`}
          >
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />
            
            <div className={`absolute inset-0 bg-gradient-to-br ${feat.gradient} opacity-20 group-hover:opacity-35 transition-opacity duration-300 pointer-events-none`} />
            
            <div className="relative z-10 h-full flex flex-col items-start justify-start w-[65%] sm:w-[60%]">
              <h3 className="text-[17px] sm:text-[19px] lg:text-[21px] font-semibold text-primary-text mb-2 tracking-wide">{feat.title}</h3>
              <p className="text-[#9CA3AF] text-[12px] sm:text-[13px] leading-[1.5] mb-4 line-clamp-3 sm:line-clamp-none">{feat.description}</p>
              <button className={`mt-auto flex items-center gap-2 px-4 py-2.5 rounded-[10px] ${feat.buttonBg} transition-colors text-[12px] sm:text-[13px] font-medium group/btn border border-divider min-h-[44px]`}>
                Explore <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Graphic Illustration */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-[48%] sm:w-[52%] h-[110%] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 pointer-events-none">
              <img 
                src={feat.image} 
                alt={feat.title} 
                loading="lazy" 
                width="300"
                height="300"
                className="w-full h-full object-contain mix-blend-screen" 
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sub Features */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 sm:gap-4 w-full">
        {subFeatures.map((feat, idx) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: idx * 0.04, duration: 0.4 }}
            className="flex flex-col p-4 sm:p-5 rounded-[16px] bg-[#05050A] border border-divider hover:border-white/20 hover:bg-card-hover transition-all duration-200 group cursor-default h-[155px] sm:h-[165px]"
          >
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-gradient-to-b from-white/[0.08] to-transparent flex items-center justify-center mb-3 border border-divider transition-transform duration-200 group-hover:scale-105 ${feat.color}`}>
              <feat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="text-primary-text font-medium text-[13px] sm:text-[14px] mb-1">{feat.title}</h4>
            <p className="text-secondary-text text-[11px] sm:text-[12px] leading-relaxed">{feat.description}</p>
          </motion.div>
        ))}
      </div>

    </section>
  );
});

FeaturesGrid.displayName = 'FeaturesGrid';

