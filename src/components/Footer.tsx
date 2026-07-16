import { Layers, Disc as Discord, ArrowRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#070816] pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-12 lg:gap-8 mb-16">
          
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <a href="/" className="group relative flex items-center gap-2 focus-visible:outline-none mb-4">
              <div className="relative flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent p-[1px]">
                <div className="absolute inset-0 bg-[#0d1024] rounded-md m-[1px] flex items-center justify-center z-10">
                  <Layers className="w-4 h-4 text-transparent bg-clip-text" style={{ stroke: 'url(#logo-gradient-footer)' }} />
                </div>
                <svg width="0" height="0">
                  <linearGradient id="logo-gradient-footer" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop stopColor="#7C3AED" offset="0%" />
                    <stop stopColor="#41E5FF" offset="100%" />
                  </linearGradient>
                </svg>
              </div>
              <span className="text-lg font-bold text-primary-text tracking-tight">
                Prime AI
              </span>
            </a>
            <p className="text-secondary-text text-sm mb-6 max-w-[280px] leading-relaxed">
              AI-powered academic platform built for students, by students.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-card-hover hover:bg-card-hover text-secondary-text hover:text-primary-text transition-colors">
                <span className="text-xs font-bold">X</span>
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-card-hover hover:bg-card-hover text-secondary-text hover:text-primary-text transition-colors">
                <Discord className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex flex-col gap-4">
            <h4 className="text-primary-text font-semibold text-xs tracking-wider uppercase mb-2">Product</h4>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Study Fetch</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">AI Tutor</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Image Solver</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Exam Mode</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">All Features</a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-primary-text font-semibold text-xs tracking-wider uppercase mb-2">Features</h4>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">How It Works</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Flashcards</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Past Questions</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Voice Learning</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Study Planner</a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-primary-text font-semibold text-xs tracking-wider uppercase mb-2">Resources</h4>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Blog</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Study Guides</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Help Center</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Community</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Updates</a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-primary-text font-semibold text-xs tracking-wider uppercase mb-2">Company</h4>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">About Us</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Careers</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Press</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Contact Us</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Partner Program</a>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-primary-text font-semibold text-xs tracking-wider uppercase mb-2">Legal</h4>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Cookie Policy</a>
            <a href="#" className="text-secondary-text hover:text-primary-text text-sm transition-colors">Data Security</a>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-2">
             <h4 className="text-primary-text font-semibold text-xs tracking-wider uppercase mb-2">Newsletter</h4>
             <p className="text-secondary-text text-sm">Get study tips, updates and exclusive offers.</p>
             <div className="relative mt-1">
               <input 
                 type="email" 
                 placeholder="Enter your email" 
                 className="w-full bg-[#131627] border border-divider rounded-[10px] py-3 pl-4 pr-12 text-sm text-primary-text placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
               />
               <button className="absolute right-1 top-1 bottom-1 aspect-square bg-primary hover:bg-primary/90 text-primary-text rounded-[8px] flex items-center justify-center transition-colors">
                 <ArrowRight className="w-4 h-4" />
               </button>
             </div>
          </div>
          
        </div>
        
        {/* Copyright Row */}
        <div className="flex flex-col md:flex-row justify-start items-center border-t border-white/[0.08] pt-8">
            <p className="text-primary-text/30 text-xs">
              © 2024 Prime AI. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
};
