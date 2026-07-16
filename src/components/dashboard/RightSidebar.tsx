import { X, FileText, Clock, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';

const RECENT_FILES = [
  { name: 'Advanced Calculus CH4.pdf', time: '2 hours ago', type: 'PDF' },
  { name: 'History 101 Notes.docx', time: 'Yesterday', type: 'DOC' },
  { name: 'Assignment 3 Solved.png', time: '2 days ago', type: 'IMG' },
];

const UPCOMING_TASKS = [
  { title: 'Biology Midterm', due: 'Tomorrow', urgent: true },
  { title: 'Physics Lab Report', due: 'In 3 days', urgent: false },
];

export const RightSidebar = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="h-full w-full bg-background/95 backdrop-blur-xl border-l border-divider flex flex-col">
      {/* Header */}
      <div className="h-[72px] flex items-center justify-between px-6 border-b border-divider shrink-0">
        <span className="font-medium text-primary-text text-[15px]">Context & Stats</span>
        <button onClick={onClose} className="xl:hidden text-secondary-text hover:text-primary-text transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        
        {/* Progress Stats */}
        <section>
          <h3 className="text-[12px] font-bold text-secondary-text uppercase tracking-wider mb-4">Current Session</h3>
          <div className="bg-surface rounded-2xl border border-divider p-4 relative overflow-hidden group hover:border-divider transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-primary-text tracking-tight">2h 15m</span>
              <span className="text-emerald-400 text-[12px] font-medium flex items-center gap-1 pb-1">
                <TrendingUpIcon className="w-3 h-3" /> +15%
              </span>
            </div>
            <p className="text-secondary-text text-[13px]">Focused study time today</p>
          </div>
        </section>

        {/* AI Suggestions */}
        <section>
          <h3 className="text-[12px] font-bold text-secondary-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Suggestions
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors">
              <p className="text-[13px] text-primary-text leading-snug">Review <span className="text-primary font-medium">Calculus CH4</span> before tomorrow's class.</p>
            </button>
            <button className="w-full text-left p-3 rounded-xl bg-card-hover hover:bg-card-hover border border-divider transition-colors">
              <p className="text-[13px] text-primary-text leading-snug">Take a 5-minute break. You've been studying for 45 minutes.</p>
            </button>
          </div>
        </section>

        {/* Recent Files */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-bold text-secondary-text uppercase tracking-wider">Recent Files</h3>
            <button className="text-[11px] text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {RECENT_FILES.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-card-hover flex items-center justify-center text-secondary-text group-hover:bg-card-hover group-hover:text-primary-text transition-colors">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-medium text-primary-text truncate">{file.name}</h4>
                  <p className="text-[11px] text-secondary-text">{file.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Tasks */}
        <section>
          <h3 className="text-[12px] font-bold text-secondary-text uppercase tracking-wider mb-4">Upcoming</h3>
          <div className="space-y-2">
            {UPCOMING_TASKS.map((task, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-card-hover border border-divider hover:border-divider transition-colors cursor-pointer">
                <div className={`w-2 h-2 rounded-full ${task.urgent ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                <div className="flex-1">
                  <h4 className="text-[13px] font-medium text-primary-text">{task.title}</h4>
                  <div className="flex items-center gap-1 text-secondary-text mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span className="text-[11px]">{task.due}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-primary-text/20" />
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);
