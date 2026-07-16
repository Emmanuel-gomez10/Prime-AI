import { motion } from 'framer-motion';
import { CheckCircle2, Rocket, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const MidCTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const benefits = [
    'Free forever',
    'Unlimited basic usage',
    'No credit card required',
    'AI-powered learning',
    'Instant setup'
  ];

  return (
    <section id="solutions" className="relative w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full rounded-[24px] bg-[#05050A] border border-divider p-8 lg:p-10 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
      >
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] pointer-events-none" />

        {/* Left: Character Image */}
        <div className="hidden lg:flex w-[220px] shrink-0 justify-center relative -ml-4">
          <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
          <img src="/assets/mid_cta_character_1783259241117.png" alt="Student with tablet" className="w-[240px] h-[240px] object-contain relative z-10 hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Center-Left: Text & Benefits */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
          <h2 className="text-[28px] md:text-[34px] font-bold text-primary-text mb-6 leading-tight">
            Ready to Transform<br />Your Academic Journey?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-full max-w-[420px]">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-primary-text text-[14px]">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center-Right: Rocket Image */}
        <div className="hidden lg:flex shrink-0 z-10 relative px-4">
          <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
            <img src="/assets/mid_cta_rocket_1783259253344.png" alt="Rocket launch" className="w-[200px] h-[200px] object-contain relative z-10 drop-shadow-[0_0_30px_rgba(124,58,237,0.4)] rotate-12" />
          </motion.div>
        </div>

        {/* Far Right: Button */}
        <div className="flex flex-col items-center lg:items-center shrink-0 z-10 relative lg:pr-6 mt-8 lg:mt-0">
          <button 
            onClick={() => navigate(user ? '/dashboard' : '/signup')}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-[15px] font-semibold text-primary-text transition-all duration-300 rounded-[12px] bg-gradient-to-r from-[#7C3AED] to-[#5B8CFF] hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(124,58,237,0.4)] overflow-hidden mb-4"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative flex items-center gap-2">{user ? 'Go to Dashboard' : 'Start Learning Free'} <ArrowRight className="w-4 h-4" /></span>
          </button>
          
          <p className="text-[#9CA3AF] text-[13px]">No credit card required.</p>
        </div>

      </motion.div>
    </section>
  );
};
