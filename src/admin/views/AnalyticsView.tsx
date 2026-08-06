import React from "react";

export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Analytics & Intelligence</h1>
        <p className="text-gray-400 text-xs mt-1">Deep analytics on daily active users, feature retention, AI token consumption, and study hours.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Daily Active Users Growth</span>
            <span className="text-emerald-400 font-mono text-xs">+18.4%</span>
          </h3>
          <div className="h-48 flex items-end justify-between gap-2 pt-8 px-2 border-b border-white/10">
            {[45, 62, 55, 78, 88, 92, 110].map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2">
                <div 
                  style={{ height: `${h}%` }} 
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#7C3AED] to-[#41E5FF] shadow-[0_0_12px_rgba(124,58,237,0.3)] transition-all"
                />
                <span className="text-[10px] text-gray-400">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Most-Used AI Features</span>
            <span className="text-[#41E5FF] font-mono text-xs">89,410 Requests</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Flashcard Generator</span>
                <span className="font-semibold text-white">42%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[42%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>AI Tutor Conversations</span>
                <span className="font-semibold text-white">31%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[31%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Study Fetch & PDF Summarizer</span>
                <span className="font-semibold text-white">18%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[18%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

