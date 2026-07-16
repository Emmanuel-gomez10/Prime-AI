import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, MoreVertical, CheckCircle2, Circle } from 'lucide-react';

interface StudyTask {
  id: string;
  title: string;
  subject: string;
  time: string;
  completed: boolean;
}

export const PlannerView = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem('prime_planner');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      const mockTasks: StudyTask[] = [
        { id: '1', title: 'Review Mitosis Notes', subject: 'Biology', time: '10:00 AM', completed: true },
        { id: '2', title: 'Complete Calculus Assignment', subject: 'Math', time: '2:00 PM', completed: false },
        { id: '3', title: 'Read World History Chapter 5', subject: 'History', time: '4:30 PM', completed: false },
        { id: '4', title: 'Flashcard Session: French Vocab', subject: 'Languages', time: '7:00 PM', completed: false }
      ];
      setTasks(mockTasks);
      localStorage.setItem('prime_planner', JSON.stringify(mockTasks));
    }
  }, []);

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(newTasks);
    localStorage.setItem('prime_planner', JSON.stringify(newTasks));
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIndex = currentDate.getDay();

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 h-full flex flex-col overflow-hidden">
      <div className="mb-8 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary-text mb-2 tracking-tight">Study Planner</h2>
          <p className="text-secondary-text text-[15px]">Organize your study sessions and stay on top of your assignments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-text rounded-lg font-medium transition-colors text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Weekly Calendar & Upcoming */}
        <div className="flex-1 space-y-8">
          
          {/* Weekly Strip */}
          <div className="p-6 rounded-[24px] bg-surface border border-divider shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary-text">This Week</h3>
              <span className="text-secondary-text text-sm font-medium">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => (
                <div 
                  key={day} 
                  className={`flex flex-col items-center p-3 rounded-2xl border ${
                    idx === todayIndex 
                      ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(168,85,247,0.15)] text-primary' 
                      : 'border-transparent text-secondary-text hover:bg-card-hover'
                  } transition-colors`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider mb-2">{day}</span>
                  <span className={`text-xl font-bold ${idx === todayIndex ? 'text-primary' : 'text-primary-text'}`}>
                    {currentDate.getDate() - todayIndex + idx}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommended Schedule */}
          <div className="p-6 rounded-[24px] bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-primary-text">AI Recommended Session</h3>
            </div>
            <p className="text-secondary-text text-sm leading-relaxed mb-4">
              Based on your upcoming exams and learning pace, we suggest a focused 45-minute session on <span className="font-bold text-primary-text">Calculus</span> today at 5:00 PM.
            </p>
            <button className="px-5 py-2 bg-card-hover hover:bg-white/15 text-primary-text rounded-lg font-medium transition-colors text-sm">
              Schedule It
            </button>
          </div>
        </div>

        {/* Right Column: Today's Tasks */}
        <div className="w-full lg:w-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xl font-bold text-primary-text">Today's Tasks</h3>
            <span className="px-2.5 py-1 bg-card-hover text-secondary-text text-xs font-medium rounded-full">
              {tasks.filter(t => t.completed).length}/{tasks.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map(task => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-[20px] border transition-all flex items-start gap-4 ${
                  task.completed 
                    ? 'bg-emerald-500/5 border-emerald-500/10' 
                    : 'bg-surface border-divider hover:border-divider shadow-md'
                }`}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`mt-1 flex items-center justify-center transition-colors shrink-0 ${
                    task.completed ? 'text-emerald-400' : 'text-primary-text/20 hover:text-secondary-text'
                  }`}
                >
                  {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold truncate mb-1 transition-colors ${
                    task.completed ? 'text-secondary-text line-through' : 'text-primary-text'
                  }`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      task.completed ? 'bg-card-hover text-primary-text/30' : 'bg-primary/20 text-primary'
                    }`}>
                      {task.subject}
                    </span>
                    <div className="flex items-center gap-1.5 text-secondary-text text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {task.time}
                    </div>
                  </div>
                </div>
                
                <button className="text-primary-text/20 hover:text-secondary-text transition-colors p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
