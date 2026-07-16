import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, BookOpen, Award, Zap } from 'lucide-react';

export const ProgressView = () => {
  const [stats, setStats] = useState({
    hoursStudied: 0,
    tasksCompleted: 0,
    accuracy: 0,
    streak: 0
  });

  useEffect(() => {
    // Load or generate mock stats
    const saved = localStorage.getItem('prime_stats');
    if (saved) {
      setStats(JSON.parse(saved));
    } else {
      const mockStats = {
        hoursStudied: 24.5,
        tasksCompleted: 42,
        accuracy: 88,
        streak: 5
      };
      setStats(mockStats);
      localStorage.setItem('prime_stats', JSON.stringify(mockStats));
    }
  }, []);

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 h-full flex flex-col overflow-y-auto scrollbar-hide">
      <div className="mb-8 shrink-0">
        <h2 className="text-3xl font-bold text-primary-text mb-2 tracking-tight">Your Progress</h2>
        <p className="text-secondary-text text-[15px]">Track your study metrics and AI-assisted learning outcomes.</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Hours Studied', value: `${stats.hoursStudied}h`, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Tasks Completed', value: stats.tasksCompleted, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'AI Accuracy Avg', value: `${stats.accuracy}%`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Day Streak', value: stats.streak, icon: Award, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.label}
            className="p-6 rounded-[24px] bg-surface border border-divider shadow-lg flex items-center gap-5"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-secondary-text text-sm font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-primary-text">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-[24px] bg-surface border border-divider shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-primary-text flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Study Activity
            </h3>
            <select className="bg-card-hover border border-divider text-primary-text text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>

          {/* CSS Grid Mock Chart */}
          <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px] mt-auto">
            {[40, 70, 45, 90, 60, 100, 30].map((height, idx) => (
              <div key={idx} className="w-full flex flex-col items-center gap-3 group">
                {/* Bar */}
                <div className="w-full max-w-[40px] h-48 flex items-end justify-center">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                    className={`w-full rounded-t-lg transition-all ${
                      idx === 5 ? 'bg-primary' : 'bg-card-hover group-hover:bg-white/20'
                    }`}
                  />
                </div>
                {/* Day Label */}
                <span className={`text-xs font-medium ${idx === 5 ? 'text-primary' : 'text-secondary-text'}`}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Subjects */}
        <div className="p-6 md:p-8 rounded-[24px] bg-surface border border-divider shadow-lg">
          <h3 className="text-xl font-bold text-primary-text mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Top Subjects
          </h3>

          <div className="space-y-6">
            {[
              { subject: 'Biology', percent: 85, color: 'bg-emerald-400' },
              { subject: 'Calculus', percent: 60, color: 'bg-blue-400' },
              { subject: 'World History', percent: 45, color: 'bg-yellow-400' },
              { subject: 'French', percent: 30, color: 'bg-purple-400' },
            ].map((item, idx) => (
              <div key={item.subject}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-primary-text">{item.subject}</span>
                  <span className="text-secondary-text font-medium">{item.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-card-hover overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                    className={`h-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
