import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowRight,
  Search,
  CheckSquare,
  Bookmark,
  Aperture,
  GraduationCap,
  SquareTerminal,
  FileText,
  Target,
  FileUp,
  Image as ImageIcon,
  Bot,
  Clock,
  Link,
  ClipboardList
} from 'lucide-react';

const QUICK_ACTIONS = [
  { icon: Link, title: 'Study' },
  { icon: FileText, title: 'Summarize' },
  { icon: Search, title: 'Research' },
  { icon: Target, title: 'Solve' },
  { icon: ClipboardList, title: 'Flashcards' },
  { icon: FileText, title: 'Notes' },
];

const SIDEBAR_ACTIONS = [
  { icon: Search, active: true },
  { icon: SquareTerminal },
  { icon: CheckSquare },
  { icon: Bookmark },
  { icon: Aperture },
];

const SEARCH_PLACEHOLDERS = [
  "Ask anything...",
  "Summarize my notes",
  "Solve this assignment",
  "Generate flashcards",
  "Explain Calculus",
  "Research this topic"
];

export const HeroDashboard: React.FC = React.memo(() => {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Parallax setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const parallaxX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const parallaxY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);
  const parallaxXReverse = useTransform(smoothX, [-0.5, 0.5], [6, -6]);
  const parallaxYReverse = useTransform(smoothY, [-0.5, 0.5], [6, -6]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        mouseX.set(e.clientX / innerWidth - 0.5);
        mouseY.set(e.clientY / innerHeight - 0.5);
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY]);

  // Typing animation
  useEffect(() => {
    const text = SEARCH_PLACEHOLDERS[placeholderIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (displayedPlaceholder.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(text.substring(0, displayedPlaceholder.length - 1));
        }, 35);
      } else {
        setIsDeleting(false);
        setPlaceholderIdx((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
      }
    } else {
      if (displayedPlaceholder.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(text.substring(0, displayedPlaceholder.length + 1));
        }, 60);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2500);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedPlaceholder, isDeleting, placeholderIdx]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-[850px] xl:max-w-[950px] mx-auto lg:ml-auto flex items-center justify-center py-6 sm:py-10 lg:py-0 gpu-accelerated"
    >
      
      {/* Background Neon Rings & Glows */}
      {!isMobile && (
        <motion.div 
          style={{ x: parallaxXReverse, y: parallaxYReverse }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none scale-75 lg:scale-100 gpu-accelerated"
        >
          {/* Ring 1 - Deep Purple */}
          <div className="absolute w-[700px] h-[350px] border-[1px] border-[#8b5cf6]/20 rounded-[50%] shadow-[0_0_30px_rgba(139,92,246,0.1)]" />
          {/* Ring 2 - Blue */}
          <div className="absolute w-[520px] h-[520px] border-[1px] border-[#3b82f6]/15 rounded-[50%] shadow-[0_0_20px_rgba(59,130,246,0.1)]" />
          
          {/* Soft blooms */}
          <div className="absolute w-[400px] h-[400px] bg-[#6d28d9]/10 blur-[100px] rounded-full" />
        </motion.div>
      )}

      {/* Main Dashboard Panel */}
      <motion.div
        style={{ x: isMobile ? 0 : parallaxX, y: isMobile ? 0 : parallaxY }}
        animate={isMobile ? {} : { y: [-4, 4, -4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-full rounded-[20px] sm:rounded-[24px] bg-[#0A0B10] border border-[#1e1f2e] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] flex overflow-hidden gpu-accelerated"
      >
        {/* Top Header - Logo */}
        <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex items-center gap-3 z-30 pointer-events-none">
          <div className="w-10 sm:w-[72px] flex items-center justify-center shrink-0">
             <div className="flex items-center justify-center">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-[#a855f7] fill-[#a855f7]" />
             </div>
          </div>
          <span className="text-primary-text text-[14px] sm:text-[15px] font-medium tracking-wide">Prime AI</span>
        </div>

        {/* Main Layout Container */}
        <div className="flex w-full pt-[64px] sm:pt-[80px]">
          
          {/* Left Sidebar Icons */}
          <div className="hidden sm:flex w-[60px] sm:w-[72px] flex-col items-center pb-8 space-y-4 shrink-0 z-20">
            <div className="flex flex-col space-y-3 justify-start">
              {SIDEBAR_ACTIONS.map((action, idx) => (
                <div 
                  key={idx}
                  className={`w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] flex items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer ${
                    action.active 
                      ? 'bg-[#212330] text-primary-text shadow-md' 
                      : 'text-secondary-text hover:text-primary-text hover:bg-card-hover'
                  }`}
                >
                  <action.icon className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" strokeWidth={action.active ? 2.5 : 2} />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 px-4 sm:px-8 lg:px-10 pb-6 sm:pb-10 flex flex-col justify-start relative z-20">
            
            {/* Greeting */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-[24px] sm:text-[32px] font-semibold text-primary-text mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3 tracking-tight">
                Hello Student <span>👋</span>
              </h3>
              <p className="text-[13px] sm:text-[15px] text-secondary-text">How can I help you today?</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-5 sm:mb-6 group cursor-text w-full max-w-full">
              <div className="relative flex items-center bg-[#0d0e15] border border-[#1e1f2e] rounded-[16px] sm:rounded-[18px] p-1.5 sm:p-2 pl-4 sm:pl-6 shadow-inner transition-all duration-300 focus-within:border-[#8b5cf6]/50 hover:border-[#2a2b36]">
                <div className="flex-1 flex items-center py-1.5 sm:py-2 overflow-hidden">
                  <span className="text-secondary-text text-[13px] sm:text-[15px] font-light tracking-wide truncate">{displayedPlaceholder}</span>
                  <span className="w-[2px] h-4 sm:h-5 bg-[#8b5cf6] ml-1 shrink-0 animate-pulse" />
                </div>
                <button 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] sm:rounded-[14px] bg-[#8b5cf6] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)] ml-2 sm:ml-3 transition-colors hover:bg-[#7c3aed] shrink-0 min-h-[44px] min-w-[44px]"
                  aria-label="Submit search"
                >
                  <ArrowRight className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-primary-text" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-10">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.title}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[12px] sm:rounded-[14px] bg-transparent border border-[#1e1f2e] hover:border-white/20 transition-all duration-200 group min-h-[40px]"
                >
                  <action.icon className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px] text-secondary-text group-hover:text-primary-text transition-colors" />
                  <span className="text-[12px] sm:text-[13px] font-medium text-primary-text tracking-wide">
                    {action.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
              {/* Study Fetch */}
              <div className="bg-[#0b0d13] border border-[#1e1f2e] rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 cursor-pointer flex flex-col transition-all duration-200 hover:border-emerald-500/30">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-[10px] sm:rounded-[12px] bg-[#064e3b] text-[#34d399] flex items-center justify-center mb-3 sm:mb-4">
                  <FileUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-primary-text font-medium text-[14px] sm:text-[15px] mb-1 sm:mb-2">Study Fetch</h4>
                <p className="text-secondary-text text-[12px] sm:text-[13px] leading-relaxed">Upload lecture PDFs and get instant explanations.</p>
              </div>

              {/* AI Tutor */}
              <div className="bg-[#0c0a13] border border-[#1e1f2e] rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 cursor-pointer flex flex-col transition-all duration-200 hover:border-purple-500/30">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-[10px] sm:rounded-[12px] bg-[#4c1d95] text-[#c4b5fd] flex items-center justify-center mb-3 sm:mb-4">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-primary-text font-medium text-[14px] sm:text-[15px] mb-1 sm:mb-2">AI Tutor</h4>
                <p className="text-secondary-text text-[12px] sm:text-[13px] leading-relaxed">Your personal academic assistant 24/7.</p>
              </div>

              {/* Image Solver */}
              <div className="bg-[#120e0a] border border-[#1e1f2e] rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 cursor-pointer flex flex-col transition-all duration-200 hover:border-amber-500/30">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-[10px] sm:rounded-[12px] bg-[#78350f] text-[#fcd34d] flex items-center justify-center mb-3 sm:mb-4">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-primary-text font-medium text-[14px] sm:text-[15px] mb-1 sm:mb-2">Image Solver</h4>
                <p className="text-secondary-text text-[12px] sm:text-[13px] leading-relaxed">Snap your assignment and get step-by-step solutions.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Badges - Only rendered on min md screens to avoid clutter and mobile reflows */}
      {!isMobile && (
        <>
          {/* Floating Accuracy Badge */}
          <div className="absolute -top-8 -right-4 lg:-right-8 z-20 bg-[#06070a]/95 border border-[#047857]/40 rounded-[18px] p-4 px-6 shadow-xl origin-top-right scale-90 lg:scale-100 gpu-accelerated">
            <div className="text-[#34d399] font-bold text-[28px] lg:text-[32px] tracking-tight leading-none mb-1 text-center">95%</div>
            <div className="text-[#34d399] text-[12px] lg:text-[13px] font-medium tracking-wide text-center">Accuracy</div>
          </div>

          {/* Floating Upload Card (Bottom Left) */}
          <div className="absolute -bottom-6 -left-4 lg:-left-8 z-20 w-[240px] lg:w-[260px] bg-[#0A0B10]/95 border border-[#1e1f2e] rounded-[20px] p-3.5 shadow-2xl transform -rotate-2 scale-90 lg:scale-100 origin-bottom-left gpu-accelerated">
            <div className="flex items-center gap-3 mb-2.5 p-2.5 bg-[#11131a] rounded-[14px] border border-divider">
               <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400">
                 <FileText className="w-4 h-4" />
               </div>
               <div>
                 <div className="text-primary-text text-[13px] font-medium leading-tight mb-0.5">Lecture.pdf</div>
                 <div className="text-secondary-text text-[11px]">2.4 MB • PDF</div>
               </div>
            </div>
            <div className="border border-dashed border-[#2a2b36] rounded-[14px] p-3 flex flex-col items-center justify-center gap-1.5 bg-white/[0.01]">
              <Clock className="w-3.5 h-3.5 text-primary-text/30" />
              <div className="text-secondary-text text-[11px] text-center">Drop your files here</div>
            </div>
          </div>

          {/* Floating AI Card (Bottom Right) */}
          <div className="absolute -bottom-4 -right-2 lg:-right-6 z-20 w-[150px] lg:w-[160px] h-[150px] lg:h-[160px] bg-gradient-to-b from-[#181324] to-[#0A0B10] border border-[#8b5cf6]/30 rounded-[20px] p-4 shadow-2xl flex flex-col items-center justify-center text-center transform rotate-4 scale-90 lg:scale-100 origin-bottom-right gpu-accelerated">
            <div className="w-12 h-12 rounded-full bg-[#8b5cf6] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] mb-2.5">
              <span className="text-primary-text font-bold text-[16px]">AI</span>
            </div>
            <div className="text-primary-text text-[13px] font-medium leading-tight">
              <span className="text-secondary-text text-[11px] font-normal">Always here<br/>to help</span>
            </div>
          </div>
        </>
      )}

    </motion.div>
  );
});

HeroDashboard.displayName = 'HeroDashboard';


