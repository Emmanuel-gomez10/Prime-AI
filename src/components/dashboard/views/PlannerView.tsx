import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle2, Circle, Sparkles, X, Loader2, Trash2, Flame } from 'lucide-react';
import { primeEngine } from '../../../lib/primeAiEngine';


interface ExamCountdown {
  id: string;
  course: string;
  examDate: string; // YYYY-MM-DD
  daysLeft: number;
}

interface StudyTask {
  id: string;
  title: string;
  subject: string;
  time: string;
  completed: boolean;
}

export const PlannerView = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [exams, setExams] = useState<ExamCountdown[]>([]);
  const [currentDate] = useState(new Date());

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // New Item Inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('10:00 AM');

  const [newExamCourse, setNewExamCourse] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  // AI Schedule Generator Inputs
  const [aiCourses, setAiCourses] = useState('');
  const [aiExamDates, setAiExamDates] = useState('');
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('prime_planner_tasks_v2');
    const savedExams = localStorage.getItem('prime_planner_exams_v2');

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse saved planner tasks:", e);
      }
    } else {
      const defaultTasks: StudyTask[] = [
        { id: '1', title: 'Review Mitosis & Cell Division', subject: 'Biology', time: '10:00 AM', completed: true },
        { id: '2', title: 'Calculus Integration Practice', subject: 'Math', time: '02:00 PM', completed: false },
        { id: '3', title: 'French Vocabulary Active Recall', subject: 'Languages', time: '05:00 PM', completed: false }
      ];
      setTasks(defaultTasks);
      localStorage.setItem('prime_planner_tasks_v2', JSON.stringify(defaultTasks));
    }

    if (savedExams) {
      try {
        setExams(JSON.parse(savedExams));
      } catch (e) {
        console.error("Failed to parse saved exams:", e);
      }
    } else {
      const defaultExams: ExamCountdown[] = [
        { id: 'e1', course: 'BIO 101 Midterm', examDate: '2026-08-10', daysLeft: 9 },
        { id: 'e2', course: 'MAT 111 Final Exam', examDate: '2026-08-15', daysLeft: 14 }
      ];
      setExams(defaultExams);
      localStorage.setItem('prime_planner_exams_v2', JSON.stringify(defaultExams));
    }
  }, []);

  const saveTasks = (updated: StudyTask[]) => {
    setTasks(updated);
    localStorage.setItem('prime_planner_tasks_v2', JSON.stringify(updated));
  };

  const saveExams = (updated: ExamCountdown[]) => {
    setExams(updated);
    localStorage.setItem('prime_planner_exams_v2', JSON.stringify(updated));
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const deleteExam = (id: string) => {
    saveExams(exams.filter(e => e.id !== id));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskSubject.trim()) {
      alert("Please fill in task title and subject.");
      return;
    }
    const t: StudyTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      subject: newTaskSubject,
      time: newTaskTime,
      completed: false,
    };
    saveTasks([t, ...tasks]);
    setNewTaskTitle('');
    setNewTaskSubject('');
    setIsTaskModalOpen(false);
  };

  const handleAddExam = () => {
    if (!newExamCourse.trim() || !newExamDate) {
      alert("Please fill in course name and exam date.");
      return;
    }
    const examTime = new Date(newExamDate).getTime();
    const nowTime = new Date().getTime();
    const daysLeft = Math.max(0, Math.ceil((examTime - nowTime) / (1000 * 60 * 60 * 24)));

    const ex: ExamCountdown = {
      id: Date.now().toString(),
      course: newExamCourse,
      examDate: newExamDate,
      daysLeft,
    };

    saveExams([ex, ...exams]);
    setNewExamCourse('');
    setNewExamDate('');
    setIsExamModalOpen(false);
  };

  // Generate AI Schedule
  const handleAIGenerateSchedule = async () => {
    if (!aiCourses.trim()) {
      alert("Please enter your current courses.");
      return;
    }

    setIsGeneratingSchedule(true);
    try {
      const prompt = `Generate a high-yield study schedule for a student taking these courses: "${aiCourses}".
${aiExamDates ? `Upcoming Exam Deadlines:\n${aiExamDates}` : ''}

Output ONLY a raw JSON array of 5 task objects matching this schema:
[
  {
    "title": "Task title",
    "subject": "Course Name",
    "time": "09:00 AM"
  }
]`;

      const { stream } = await primeEngine.generateStream({
        mode: 'general',
        userPrompt: prompt,
      });

      let responseText = '';
      for await (const chunk of stream) {
        responseText += chunk;
      }

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedTasks: Array<{ title: string; subject: string; time: string }> = JSON.parse(jsonMatch[0]);
        const formatted: StudyTask[] = parsedTasks.map((pt, i) => ({
          id: `${Date.now()}-${i}`,
          title: pt.title,
          subject: pt.subject,
          time: pt.time || '10:00 AM',
          completed: false,
        }));

        saveTasks([...formatted, ...tasks]);
        setIsAIModalOpen(false);
        setAiCourses('');
        setAiExamDates('');
      } else {
        throw new Error("Invalid AI JSON structure");
      }
    } catch (err: any) {
      console.error("AI schedule generation failed:", err);
      alert(`Failed to generate schedule: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIndex = currentDate.getDay();

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-6 h-full flex flex-col overflow-hidden">
      <div className="mb-6 shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-text mb-1 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" /> Study Planner & Countdown
          </h2>
          <p className="text-secondary-text text-[14px]">Schedule study blocks, track exam countdowns, and generate AI schedules.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" /> AI Auto-Schedule
          </button>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-divider hover:border-primary/40 text-primary-text font-semibold text-xs sm:text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Weekly Calendar & Exam Countdowns */}
        <div className="flex-1 space-y-6">
          
          {/* Weekly Calendar Strip */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-surface border border-divider shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-primary-text">This Week</h3>
              <span className="text-secondary-text text-xs font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => (
                <div 
                  key={day} 
                  className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border ${
                    idx === todayIndex 
                      ? 'bg-primary/15 border-primary shadow-[0_0_20px_rgba(168,85,247,0.2)] text-primary' 
                      : 'border-divider text-secondary-text hover:bg-card-hover'
                  } transition-colors`}
                >
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">{day}</span>
                  <span className={`text-base sm:text-xl font-bold ${idx === todayIndex ? 'text-primary' : 'text-primary-text'}`}>
                    {currentDate.getDate() - todayIndex + idx}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Countdown Banners */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-surface border border-divider shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-primary-text flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> Exam Countdowns
              </h3>
              <button 
                onClick={() => setIsExamModalOpen(true)}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                + Add Exam
              </button>
            </div>

            {exams.length === 0 ? (
              <p className="text-xs text-secondary-text italic py-2">No exam countdowns set yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exams.map((ex) => (
                  <div key={ex.id} className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex items-center justify-between relative group">
                    <div>
                      <h4 className="text-xs font-bold text-primary-text">{ex.course}</h4>
                      <p className="text-[11px] text-secondary-text mt-0.5">Date: {ex.examDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-amber-400 block leading-none">{ex.daysLeft}</span>
                        <span className="text-[10px] text-amber-400/80 font-bold uppercase">days left</span>
                      </div>
                      <button 
                        onClick={() => deleteExam(ex.id)}
                        className="text-secondary-text hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scheduled Tasks */}
        <div className="w-full lg:w-[380px] flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-base font-bold text-primary-text">Scheduled Study Tasks</h3>
            <span className="px-2.5 py-0.5 bg-card-hover border border-divider text-secondary-text text-xs font-semibold rounded-full">
              {tasks.filter(t => t.completed).length}/{tasks.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="p-8 text-center border border-divider rounded-2xl bg-surface/50 text-secondary-text text-xs">
                No tasks scheduled for today.
              </div>
            ) : (
              tasks.map((task) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-[20px] border transition-all flex items-center justify-between gap-3 ${
                    task.completed 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-surface border-divider hover:border-primary/30 shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`transition-colors shrink-0 ${
                        task.completed ? 'text-emerald-400' : 'text-secondary-text hover:text-primary-text'
                      }`}
                    >
                      {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>

                    <div className="min-w-0">
                      <h4 className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                        task.completed ? 'text-secondary-text line-through' : 'text-primary-text'
                      }`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                          {task.subject}
                        </span>
                        <span className="text-[11px] text-secondary-text flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-secondary-text hover:text-red-400 p-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-surface border border-divider rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-divider pb-3">
                <h3 className="text-sm font-bold text-primary-text">Add Study Task</h3>
                <button onClick={() => setIsTaskModalOpen(false)}><X className="w-4 h-4 text-secondary-text" /></button>
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary-text uppercase">Task Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Solve Calculus Chapter 3 Problems"
                  className="w-full mt-1 p-2.5 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary-text uppercase">Subject / Course</label>
                <input 
                  type="text" 
                  value={newTaskSubject} 
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full mt-1 p-2.5 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary-text uppercase">Time</label>
                <input 
                  type="text" 
                  value={newTaskTime} 
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  placeholder="e.g. 03:00 PM"
                  className="w-full mt-1 p-2.5 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none" 
                />
              </div>

              <button 
                onClick={handleAddTask}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md"
              >
                Save Task
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Exam Modal */}
      <AnimatePresence>
        {isExamModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-surface border border-divider rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-divider pb-3">
                <h3 className="text-sm font-bold text-primary-text">Add Exam Countdown</h3>
                <button onClick={() => setIsExamModalOpen(false)}><X className="w-4 h-4 text-secondary-text" /></button>
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary-text uppercase">Exam / Course Title</label>
                <input 
                  type="text" 
                  value={newExamCourse} 
                  onChange={(e) => setNewExamCourse(e.target.value)}
                  placeholder="e.g. GST101 Final Exam"
                  className="w-full mt-1 p-2.5 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary-text uppercase">Exam Date</label>
                <input 
                  type="date" 
                  value={newExamDate} 
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none" 
                />
              </div>

              <button 
                onClick={handleAddExam}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
              >
                Save Countdown
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Auto-Schedule Generator Modal */}
      <AnimatePresence>
        {isAIModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-surface border border-divider rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-divider pb-3">
                <h3 className="text-sm font-bold text-primary-text flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Auto-Schedule Generator
                </h3>
                <button onClick={() => setIsAIModalOpen(false)}><X className="w-4 h-4 text-secondary-text" /></button>
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary-text uppercase">Your Current Courses</label>
                <textarea 
                  value={aiCourses} 
                  onChange={(e) => setAiCourses(e.target.value)}
                  placeholder="e.g. Organic Chemistry, Calculus I, Physics 101"
                  rows={2}
                  className="w-full mt-1 p-2.5 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none resize-none" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary-text uppercase">Exam Dates (Optional)</label>
                <input 
                  type="text" 
                  value={aiExamDates} 
                  onChange={(e) => setAiExamDates(e.target.value)}
                  placeholder="e.g. Math Exam on Aug 15th"
                  className="w-full mt-1 p-2.5 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none" 
                />
              </div>

              <button 
                onClick={handleAIGenerateSchedule}
                disabled={isGeneratingSchedule}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGeneratingSchedule ? 'Generating Schedule...' : 'Generate Optimized Schedule'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

