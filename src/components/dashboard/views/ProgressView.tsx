import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, BookOpen, Award, Zap, Sparkles, RefreshCw, Lightbulb } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { primeEngine } from '../../../lib/primeAiEngine';

export const ProgressView = () => {
  const [stats, setStats] = useState({
    hoursStudied: 24.5,
    tasksCompleted: 42,
    accuracy: 88,
    streak: 5
  });

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('prime_stats');
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved stats:", e);
      }
    } else {
      localStorage.setItem('prime_stats', JSON.stringify(stats));
    }
  }, []);

  const generateAIInsights = async () => {
    setIsGeneratingInsight(true);
    try {
      const prompt = `Analyze this student's current learning metrics:
- Total Study Hours: ${stats.hoursStudied} hours
- Completed Tasks: ${stats.tasksCompleted}
- Quiz Accuracy Average: ${stats.accuracy}%
- Study Streak: ${stats.streak} Days
- Top Subjects: Biology (85% mastery), Calculus (60% mastery), History (45% mastery), French (30% mastery)

Provide:
1. Short 2-sentence performance summary.
2. 3 actionable, high-yield study productivity recommendations tailored to boost their weakest subject (French/History).`;

      const { stream } = await primeEngine.generateStream({
        mode: 'tutor',
        userPrompt: prompt,
      });

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setAiInsight(fullText);
      }
    } catch (err: any) {
      console.error("Failed to generate AI insights:", err);
      alert(`Failed to fetch AI insights: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-6 h-full flex flex-col overflow-y-auto scrollbar-hide">
      <div className="mb-6 shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-text mb-1 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" /> Learning Analytics & Progress
          </h2>
          <p className="text-secondary-text text-[14px]">Track your study metrics, subject mastery, and receive AI performance feedback.</p>
        </div>

        <button
          onClick={generateAIInsights}
          disabled={isGeneratingInsight}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
        >
          {isGeneratingInsight ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isGeneratingInsight ? 'Analyzing...' : 'Generate AI Insights'}</span>
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Hours Studied', value: `${stats.hoursStudied}h`, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Tasks Completed', value: stats.tasksCompleted, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Quiz Score Avg', value: `${stats.accuracy}%`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Day Streak', value: `${stats.streak} Days`, icon: Award, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.label}
            className="p-5 rounded-[24px] bg-surface border border-divider shadow-lg flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-secondary-text text-xs font-semibold uppercase tracking-wider mb-0.5">{stat.label}</p>
              <h3 className="text-2xl font-bold text-primary-text">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Performance Insights Card */}
      {aiInsight && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[24px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/30 shadow-xl mb-6"
        >
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Prime AI Productivity Analysis
          </h3>
          <div className="text-xs sm:text-sm text-primary-text leading-relaxed prose prose-invert max-w-none">
            <Markdown>{aiInsight}</Markdown>
          </div>
        </motion.div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
        
        {/* Weekly Study Hours Chart */}
        <div className="lg:col-span-2 p-6 rounded-[24px] bg-surface border border-divider shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-primary-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Weekly Study Hours
            </h3>
            <span className="text-xs text-secondary-text font-semibold">Past 7 Days</span>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 min-h-[180px] pt-6">
            {[
              { day: 'Mon', hours: 3.5, pct: 50 },
              { day: 'Tue', hours: 5.0, pct: 75 },
              { day: 'Wed', hours: 2.5, pct: 35 },
              { day: 'Thu', hours: 6.0, pct: 90 },
              { day: 'Fri', hours: 4.0, pct: 60 },
              { day: 'Sat', hours: 7.5, pct: 100 },
              { day: 'Sun', hours: 2.0, pct: 30 }
            ].map((item, idx) => (
              <div key={idx} className="w-full flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-secondary-text opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.hours}h
                </span>
                <div className="w-full max-w-[36px] h-40 flex items-end justify-center">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${item.pct}%` }}
                    transition={{ duration: 1, delay: idx * 0.08 }}
                    className={`w-full rounded-t-lg transition-all ${
                      idx === 5 ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : 'bg-card-hover group-hover:bg-primary/50'
                    }`}
                  />
                </div>
                <span className={`text-xs font-semibold ${idx === 5 ? 'text-emerald-400 font-bold' : 'text-secondary-text'}`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Mastery Progress Bars */}
        <div className="p-6 rounded-[24px] bg-surface border border-divider shadow-lg">
          <h3 className="text-base font-bold text-primary-text mb-6 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            Subject Mastery
          </h3>

          <div className="space-y-5">
            {[
              { subject: 'Biology', percent: 85, color: 'bg-emerald-400' },
              { subject: 'Calculus', percent: 60, color: 'bg-blue-400' },
              { subject: 'World History', percent: 45, color: 'bg-yellow-400' },
              { subject: 'French', percent: 30, color: 'bg-purple-400' },
            ].map((item, idx) => (
              <div key={item.subject}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-primary-text">{item.subject}</span>
                  <span className="text-secondary-text">{item.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-background border border-divider overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
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

