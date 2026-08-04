import { 
  LayoutDashboard, Bot, FileUp, Image as ImageIcon, 
  BookMarked, FileQuestion, Calendar, TrendingUp, 
  Settings, User, X, GraduationCap, PenTool, Plus, MessageSquare, Trash2 
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

type ViewType = 'home' | 'chat' | 'flashcards' | 'quiz' | 'notes' | 'study-fetch' | 'image-solver' | 'past-questions' | 'planner' | 'progress' | 'settings' | 'profile' | 'essay-writer';

const NAV_ITEMS: { icon: any, label: string, view: ViewType }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'home' },
  { icon: Bot, label: 'AI Tutor', view: 'chat' },
  { icon: FileUp, label: 'Study Fetch', view: 'study-fetch' },
  { icon: ImageIcon, label: 'Image Solver', view: 'image-solver' },
  { icon: PenTool, label: 'Essay Writer', view: 'essay-writer' },
  { icon: BookMarked, label: 'Flashcards', view: 'flashcards' },
  { icon: FileQuestion, label: 'Quiz Generator', view: 'quiz' },
  { icon: FileQuestion, label: 'Past Questions', view: 'past-questions' },
  { icon: Calendar, label: 'Study Planner', view: 'planner' },
  { icon: TrendingUp, label: 'Progress', view: 'progress' },
];

const BOTTOM_ITEMS: { icon: any, label: string, view: ViewType }[] = [
  { icon: Settings, label: 'Settings', view: 'settings' },
  { icon: User, label: 'Profile', view: 'profile' },
];

export const Sidebar = ({ onClose }: { onClose: () => void }) => {
  const { 
    activeView, 
    setActiveView, 
    threads, 
    activeThreadId, 
    createNewThread, 
    switchThread, 
    deleteThread 
  } = useWorkspace();

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleNewChat = () => {
    createNewThread();
    setActiveView('chat');
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div className="h-full w-full bg-[#0A0C14]/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col">
      {/* Header */}
      <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
          <div className="w-8 h-8 rounded-lg bg-[#581c87]/30 border border-[#a855f7]/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-primary-text tracking-wide text-[16px]">Prime AI</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-secondary-text hover:text-primary-text transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-divider">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 text-primary-text font-medium text-sm hover:from-primary/30 hover:to-purple-600/30 transition-all shadow-sm group"
        >
          <Plus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span>New Chat Session</span>
        </button>
      </div>

      {/* Nav Links & Threads */}
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6 scrollbar-hide">
        <div className="space-y-1">
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

        {/* Conversation Threads */}
        {threads.length > 0 && (
          <div>
            <h4 className="px-4 text-[11px] font-bold text-secondary-text uppercase tracking-wider mb-2">Recent Threads</h4>
            <div className="space-y-1">
              {threads.slice(0, 10).map((thread) => (
                <div 
                  key={thread.id}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    activeThreadId === thread.id && activeView === 'chat'
                      ? 'bg-primary/10 text-primary border border-primary/20 font-medium'
                      : 'text-secondary-text hover:text-primary-text hover:bg-card-hover'
                  }`}
                  onClick={() => {
                    switchThread(thread.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                >
                  <div className="flex items-center gap-2 truncate pr-6">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate text-[13px]">{thread.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(thread.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-secondary-text hover:text-red-400 p-1 transition-opacity"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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

