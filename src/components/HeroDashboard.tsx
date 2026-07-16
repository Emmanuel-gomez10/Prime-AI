import { useState, useEffect } from 'react';
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
  BookMarked,
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

// Reusable Particle component
const Particle = ({ color, delay, duration, style }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 0.8, 0],
      scale: [0.5, 1.5, 0.5],
      y: [0, -20, -40] 
    }}
    transition={{ 
      duration, 
      delay, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className={`absolute rounded-full blur-[1px] ${color}`}
    style={{ ...style }}
  />
);

export const HeroDashboard = () => {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Parallax setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const parallaxX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const parallaxY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);
  const parallaxXReverse = useTransform(smoothX, [-0.5, 0.5], [8, -8]);
  const parallaxYReverse = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Disable heavy parallax on mobile (<768px)
      if (window.innerWidth < 768) return;
      const { innerWidth, innerHeight } = window;
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Typing animation
  useEffect(() => {
    const text = SEARCH_PLACEHOLDERS[placeholderIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (displayedPlaceholder.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(text.substring(0, displayedPlaceholder.length - 1));
        }, 30); // Deleting speed
      } else {
        setIsDeleting(false);
        setPlaceholderIdx((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
      }
    } else {
      if (displayedPlaceholder.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(text.substring(0, displayedPlaceholder.length + 1));
        }, Math.random() * 50 + 50); // Human-like typing speed
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2500); // Wait before deleting
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedPlaceholder, isDeleting, placeholderIdx]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
      className="relative w-full max-w-[850px] xl:max-w-[950px] mx-auto lg:ml-auto flex items-center justify-center perspective-[1200px] py-10 lg:py-0"
    >
      
      {/* Background Neon Rings & Glows */}
      <motion.div 
        style={{ x: parallaxXReverse, y: parallaxYReverse }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none scale-50 sm:scale-75 lg:scale-100"
      >
        {/* Ring 1 - Deep Purple (Outer) */}
        <motion.div 
          animate={{ rotate: 360, opacity: [0.4, 0.7, 0.4] }}
          transition={{ rotate: { duration: 50, repeat: Infinity, ease: "linear" }, opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute w-[800px] h-[400px] border-[1px] border-[#8b5cf6]/30 rounded-[50%] shadow-[0_0_40px_rgba(139,92,246,0.15)]"
        />
        {/* Ring 2 - Blue (Inner) */}
        <motion.div 
          animate={{ rotate: -360, opacity: [0.3, 0.6, 0.3] }}
          transition={{ rotate: { duration: 35, repeat: Infinity, ease: "linear" }, opacity: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
          className="absolute w-[600px] h-[600px] border-[1px] border-[#3b82f6]/20 rounded-[50%] shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        />
        {/* Ring 3 - Faint Purple Cross */}
        <motion.div 
          animate={{ rotate: 180 }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
          className="absolute w-[900px] h-[250px] border-[1px] border-[#a855f7]/20 rounded-[50%] shadow-[0_0_15px_rgba(168,85,247,0.1)]"
        />
        
        {/* Soft blooms */}
        <div className="absolute w-[500px] h-[500px] bg-[#6d28d9]/10 blur-[150px] rounded-full" />
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-[#3b82f6]/10 blur-[120px] rounded-full" />

        {/* Particles */}
        <Particle color="bg-[#a855f7]" delay={0} duration={4} style={{ width: 4, height: 4, top: '15%', left: '25%' }} />
        <Particle color="bg-[#60a5fa]" delay={2} duration={5} style={{ width: 3, height: 3, top: '65%', left: '75%' }} />
        <Particle color="bg-white" delay={1} duration={6} style={{ width: 2, height: 2, top: '85%', left: '35%' }} />
        <Particle color="bg-[#c084fc]" delay={3} duration={4.5} style={{ width: 5, height: 5, top: '25%', left: '85%' }} />
        <Particle color="bg-[#93c5fd]" delay={0.5} duration={5.5} style={{ width: 3, height: 3, top: '75%', left: '15%' }} />
      </motion.div>

      {/* Main Dashboard Panel */}
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-full rounded-[24px] bg-[#0A0B10] border border-[#1e1f2e] shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] flex overflow-hidden"
      >
        {/* Top Header - Logo */}
        <div className="absolute top-0 left-0 w-full p-6 flex items-center gap-3 z-30 pointer-events-none">
          <div className="w-[72px] flex items-center justify-center shrink-0">
             <div className="flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-[#a855f7] fill-[#a855f7]" />
             </div>
          </div>
          <span className="text-primary-text text-[15px] font-medium tracking-wide">Prime AI</span>
        </div>

        {/* Main Layout Container */}
        <div className="flex w-full pt-[80px]">
          
          {/* Left Sidebar Icons */}
          <div className="hidden sm:flex w-[72px] flex-col items-center pb-8 space-y-4 shrink-0 z-20">
            <div className="flex flex-col space-y-3 justify-start">
              {SIDEBAR_ACTIONS.map((action, idx) => (
                <motion.button 
                  key={idx}
                  whileHover={{ scale: action.active ? 1 : 1.1 }}
                  className={`w-[42px] h-[42px] flex items-center justify-center rounded-2xl transition-all duration-300 group ${
                    action.active 
                      ? 'bg-[#212330] text-primary-text shadow-md' 
                      : 'text-secondary-text hover:text-primary-text hover:bg-card-hover'
                  }`}
                >
                  <action.icon className="w-[20px] h-[20px]" strokeWidth={action.active ? 2.5 : 2} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 px-8 lg:px-10 pb-10 flex flex-col justify-start relative z-20">
            
            {/* Greeting */}
            <div className="mb-8">
              <h3 className="text-[32px] font-semibold text-primary-text mb-2 flex items-center gap-3 tracking-tight">
                Hello Student <span className="animate-wave origin-bottom-right block">👋</span>
              </h3>
              <p className="text-[15px] text-secondary-text">How can I help you today?</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6 group cursor-text w-full max-w-full">
              <div className="relative flex items-center bg-[#0d0e15] border border-[#1e1f2e] rounded-[18px] p-2 pl-6 shadow-inner transition-all duration-300 focus-within:border-[#8b5cf6]/50 hover:border-[#2a2b36]">
                <div className="flex-1 flex items-center py-2">
                  <span className="text-secondary-text text-[15px] font-light tracking-wide">{displayedPlaceholder}</span>
                  <motion.div 
                     animate={{ opacity: [1, 0, 1] }}
                     transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                     className="w-[2px] h-5 bg-[#8b5cf6] ml-1"
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(139,92,246,0.6)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-[14px] bg-[#8b5cf6] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)] ml-3 transition-colors hover:bg-[#7c3aed]"
                >
                  <ArrowRight className="w-[20px] h-[20px] text-primary-text" />
                </motion.button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-10">
              {QUICK_ACTIONS.map((action) => (
                <motion.button
                  key={action.title}
                  whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.04)" }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] bg-transparent border border-[#1e1f2e] hover:border-white/20 transition-all duration-250 group"
                >
                  <action.icon className="w-[15px] h-[15px] text-secondary-text group-hover:text-primary-text transition-colors" />
                  <span className="text-[13px] font-medium text-primary-text group-hover:text-primary-text transition-colors tracking-wide">
                    {action.title}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Study Fetch */}
              <motion.div 
                whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)" }}
                className="bg-[#0b0d13] border border-[#1e1f2e] rounded-[20px] p-5 cursor-pointer flex flex-col transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-[12px] bg-[#064e3b] text-[#34d399] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <FileUp className="w-5 h-5" />
                </div>
                <h4 className="text-primary-text font-medium text-[15px] mb-2">Study Fetch</h4>
                <p className="text-secondary-text text-[13px] leading-relaxed">Upload lecture PDFs and get instant explanations.</p>
              </motion.div>

              {/* AI Tutor */}
              <motion.div 
                whileHover={{ y: -4, borderColor: "rgba(139,92,246,0.3)" }}
                className="bg-[#0c0a13] border border-[#1e1f2e] rounded-[20px] p-5 cursor-pointer flex flex-col transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-[12px] bg-[#4c1d95] text-[#c4b5fd] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                  <Bot className="w-5 h-5" />
                </div>
                <h4 className="text-primary-text font-medium text-[15px] mb-2">AI Tutor</h4>
                <p className="text-secondary-text text-[13px] leading-relaxed">Your personal academic assistant 24/7.</p>
              </motion.div>

              {/* Image Solver */}
              <motion.div 
                whileHover={{ y: -4, borderColor: "rgba(245,158,11,0.3)" }}
                className="bg-[#120e0a] border border-[#1e1f2e] rounded-[20px] p-5 cursor-pointer flex flex-col transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-[12px] bg-[#78350f] text-[#fcd34d] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h4 className="text-primary-text font-medium text-[15px] mb-2">Image Solver</h4>
                <p className="text-secondary-text text-[13px] leading-relaxed">Snap your assignment and get step-by-step solutions.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Accuracy Badge */}
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        animate={{ y: [-3, 3, -3], rotate: [1, -1, 1] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="absolute -top-10 -right-4 lg:-right-10 z-20 bg-[#06070a]/95 backdrop-blur-xl border border-[#047857]/40 rounded-[20px] p-5 px-8 shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.1)] scale-90 sm:scale-100 origin-top-right"
      >
        <div className="text-[#34d399] font-bold text-[32px] tracking-tight leading-none mb-1 text-center">95%</div>
        <div className="text-[#34d399] text-[13px] font-medium tracking-wide text-center">Accuracy</div>
      </motion.div>

      {/* Floating Upload Card (Bottom Left) */}
      <motion.div
        style={{ x: parallaxXReverse, y: parallaxYReverse }}
        animate={{ y: [4, -4, 4], rotate: [-2, -1, -2] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute -bottom-8 -left-6 lg:-left-12 z-20 w-[260px] bg-[#0A0B10]/95 backdrop-blur-xl border border-[#1e1f2e] rounded-[24px] p-4 shadow-[0_30px_60px_rgba(0,0,0,0.7)] transform -rotate-3 scale-[0.75] sm:scale-100 origin-bottom-left"
      >
        <div className="flex items-center gap-3 mb-3 p-3 bg-[#11131a] rounded-[16px] border border-divider cursor-pointer">
           <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400">
             <FileText className="w-5 h-5" />
           </div>
           <div>
             <div className="text-primary-text text-[14px] font-medium leading-tight mb-0.5">Lecture.pdf</div>
             <div className="text-secondary-text text-[12px]">2.4 MB • PDF</div>
           </div>
        </div>
        <div className="border border-dashed border-[#2a2b36] rounded-[16px] p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/[0.01]">
          <Clock className="w-4 h-4 text-primary-text/30" />
          <div className="text-secondary-text text-[12px] text-center leading-relaxed">Drop your files here<br/>or click to upload</div>
        </div>
      </motion.div>

      {/* Floating AI Card (Bottom Right) */}
      <motion.div
        style={{ x: parallaxX, y: parallaxYReverse }}
        animate={{ y: [-4, 4, -4], rotate: [4, 5, 4] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute -bottom-6 -right-4 lg:-right-8 z-20 w-[170px] h-[170px] bg-gradient-to-b from-[#181324] to-[#0A0B10] backdrop-blur-xl border border-[#8b5cf6]/30 rounded-[24px] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.7),0_0_30px_rgba(139,92,246,0.15)] flex flex-col items-center justify-center text-center transform rotate-6 scale-[0.8] sm:scale-100 origin-bottom-right"
      >
        <div className="w-14 h-14 rounded-full bg-[#8b5cf6] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)] mb-3">
          <span className="text-primary-text font-bold text-[18px]">AI</span>
        </div>
        <div className="text-primary-text text-[14px] font-medium leading-tight">
          <span className="text-secondary-text text-[12px] font-normal">Always here<br/>to help</span>
        </div>
      </motion.div>

    </motion.div>
  );
};

