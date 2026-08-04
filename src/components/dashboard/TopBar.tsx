import { Menu, Search, Flame } from 'lucide-react';

export const TopBar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <div className="h-[72px] w-full bg-[#05050A]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8 z-30 shrink-0">
      
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="lg:hidden text-secondary-text hover:text-primary-text p-2">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden sm:flex items-center max-w-md w-full bg-surface border border-divider rounded-full px-4 py-2 hover:border-divider transition-colors focus-within:border-primary/40 focus-within:bg-background focus-within:shadow-[0_0_15px_rgba(168,85,247,0.1)]">
          <Search className="w-[18px] h-[18px] text-secondary-text mr-2.5" />
          <input 
            type="text" 
            placeholder="Search notes, files, or ask AI..." 
            className="bg-transparent border-none outline-none text-primary-text text-[14px] w-full placeholder:text-primary-text/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400">
          <Flame className="w-4 h-4" />
          <span className="text-[13px] font-bold">12 Days</span>
        </div>
      </div>
    </div>
  );
};
