import { 
  LayoutDashboard, Bot, FileUp, Image as ImageIcon, 
  BookMarked, FileQuestion, Calendar, TrendingUp, 
  Settings, User, X, GraduationCap, PenTool 
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

type ViewType = 'home' | 'chat' | 'flashcards' | 'notes' | 'study-fetch' | 'image-solver' | 'past-questions' | 'planner' | 'progress' | 'settings' | 'profile' | 'essay-writer';

const NAV_ITEMS: { icon: any, label: string, view: ViewType }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'home' },
  { icon: Bot, label: 'AI Tutor', view: 'chat' },
  { icon: FileUp, label: 'Study Fetch', view: 'study-fetch' },
  { icon: ImageIcon, label: 'Image Solver', view: 'image-solver' },
  { icon: PenTool, label: 'Essay Writer', view: 'essay-writer' },
  { icon: BookMarked, label: 'Flashcards', view: 'flashcards' },
  { icon: FileQuestion, label: 'Past Questions', view: 'past-questions' },
  { icon: Calendar, label: 'Study Planner', view: 'planner' },
  { icon: TrendingUp, label: 'Progress', view: 'progress' },
];

const BOTTOM_ITEMS: { icon: any, label: string, view: ViewType }[] = [
  { icon: Settings, label: 'Settings', view: 'settings' },
  { icon: User, label: 'Profile', view: 'profile' },
];

export const Sidebar = ({ onClose }: { onClose: () => void }) => {
  const { activeView, setActiveView } = useWorkspace();

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    // On mobile, close sidebar after clicking
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div className="h-full w-full bg-[#0A0C14]/95 backdrop-blur-xl border-r border-divider flex flex-col">
      {/* Header */}
      <div className="h-[72px] flex items-center justify-between px-6 border-b border-divider shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#581c87]/30 border border-[#a855f7]/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-primary-text tracking-wide text-[16px]">Prime AI</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-secondary-text hover:text-primary-text transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <button 
            key={item.label}
            onClick={() => handleNavClick(item.view)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
              activeView === item.view 
                ? 'bg-card-hover text-primary-text shadow-sm' 
                : 'text-secondary-text hover:text-primary-text hover:bg-card-hover'
            }`}
          >
            <item.icon className={`w-4.5 h-4.5 ${activeView === item.view ? 'text-primary-text' : 'group-hover:text-primary-text'}`} strokeWidth={activeView === item.view ? 2.5 : 2} />
            <span className="font-medium text-[14px]">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Links */}
      <div className="p-4 border-t border-divider space-y-1.5 shrink-0">
        {BOTTOM_ITEMS.map((item) => (
          <button 
            key={item.label}
            onClick={() => handleNavClick(item.view)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
              activeView === item.view 
                ? 'bg-card-hover text-primary-text shadow-sm' 
                : 'text-secondary-text hover:text-primary-text hover:bg-card-hover'
            }`}
          >
            <item.icon className={`w-4.5 h-4.5 ${activeView === item.view ? 'text-primary-text' : 'group-hover:text-primary-text'}`} strokeWidth={activeView === item.view ? 2.5 : 2} />
            <span className="font-medium text-[14px]">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
