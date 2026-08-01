import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, Search, Sparkles, ChevronRight, X, Loader2 } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { primeEngine } from '../../../lib/primeAiEngine';
import { useWorkspace } from '../../../contexts/WorkspaceContext';

interface PastQuestionItem {
  id: string;
  university: string;
  courseCode: string;
  courseTitle: string;
  year: string;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  aiExplanation?: string;
}

const UNIVERSITIES = ['All Universities', 'UNIZIK', 'UNILAG', 'OAU', 'UI', 'ABU', 'UNN'];
const YEARS = ['All Years', '2023', '2022', '2021', '2020', '2019', '2018'];

export const PastQuestionsView = () => {
  const { sendMessage, createNewThread } = useWorkspace();
  const [questions, setQuestions] = useState<PastQuestionItem[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState('All Universities');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Solution Drawer / Modal state
  const [activeQuestion, setActiveQuestion] = useState<PastQuestionItem | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [aiSolution, setAiSolution] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('prime_past_questions_v2');
    if (saved) {
      try {
        setQuestions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved past questions:", e);
      }
    } else {
      const defaultQuestions: PastQuestionItem[] = [
        {
          id: 'pq-1',
          university: 'UNIZIK',
          courseCode: 'GST101',
          courseTitle: 'Use of English & Communication',
          year: '2022',
          questionText: 'Which of the following sentence structures represents a complex sentence?',
          options: [
            'A) The student studied hard and passed the exam.',
            'B) Although it was raining, the student walked to class.',
            'C) The lecturer entered the hall.',
            'D) Read your books every day.'
          ],
          correctAnswer: 'B) Although it was raining, the student walked to class.',
          aiExplanation: 'A complex sentence consists of one independent clause ("the student walked to class") and at least one dependent clause ("Although it was raining").'
        },
        {
          id: 'pq-2',
          university: 'UNIZIK',
          courseCode: 'MAT111',
          courseTitle: 'Algebra & Trigonometry',
          year: '2023',
          questionText: 'Find the derivative of f(x) = 3x^3 - 5x^2 + 7x - 12 with respect to x.',
          options: [
            'A) 9x^2 - 10x + 7',
            'B) 3x^2 - 5x + 7',
            'C) 9x^2 - 5x + 7',
            'D) 6x^2 - 10x + 7'
          ],
          correctAnswer: 'A) 9x^2 - 10x + 7',
          aiExplanation: 'Using the power rule d/dx[x^n] = n*x^(n-1): d/dx(3x^3) = 9x^2, d/dx(-5x^2) = -10x, d/dx(7x) = 7, d/dx(-12) = 0.'
        },
        {
          id: 'pq-3',
          university: 'UNILAG',
          courseCode: 'PHY101',
          courseTitle: 'General Physics I',
          year: '2021',
          questionText: 'A body of mass 5kg accelerates from rest to 20m/s in 4 seconds. Calculate the net force acting on the body.',
          options: ['A) 15 N', 'B) 25 N', 'C) 100 N', 'D) 20 N'],
          correctAnswer: 'B) 25 N',
          aiExplanation: 'Acceleration a = (v - u)/t = (20 - 0)/4 = 5 m/s^2. Net force F = m*a = 5kg * 5m/s^2 = 25 Newton.'
        }
      ];
      setQuestions(defaultQuestions);
      localStorage.setItem('prime_past_questions_v2', JSON.stringify(defaultQuestions));
    }
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesUni = selectedUniversity === 'All Universities' || q.university === selectedUniversity;
    const matchesYear = selectedYear === 'All Years' || q.year === selectedYear;
    const matchesSearch = searchQuery === '' || 
      q.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUni && matchesYear && matchesSearch;
  });

  const requestAISolution = async (q: PastQuestionItem) => {
    setActiveQuestion(q);
    setAiSolution(q.aiExplanation || null);
    setIsSolving(true);

    try {
      const prompt = `Solve this university past question step-by-step for ${q.university} (${q.courseCode} - ${q.year}):
Question: "${q.questionText}"
${q.options ? `Options:\n${q.options.join('\n')}` : ''}

Provide:
1. Recognized correct answer clearly highlighted.
2. Step-by-step mathematical or conceptual explanation.
3. Key formulas or rules applied.`;

      const { stream } = await primeEngine.generateStream({
        mode: 'tutor',
        userPrompt: prompt,
      });

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setAiSolution(fullText);
      }
    } catch (err: any) {
      console.error("Failed to generate solution:", err);
      alert(`Failed to solve past question: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSolving(false);
    }
  };

  const askTutorFollowup = (q: PastQuestionItem) => {
    createNewThread();
    sendMessage(`I am reviewing this ${q.university} past question for ${q.courseCode} (${q.year}): "${q.questionText}". Can you explain it further to me?`);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-6 flex flex-col h-full overflow-hidden">
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-text mb-1 tracking-tight flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-amber-400" /> Past Questions Library
          </h2>
          <p className="text-secondary-text text-[14px]">Filter exam questions by university, course code & year. Request instant AI step-by-step solutions.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-[24px] bg-surface border border-divider shadow-lg mb-6 shrink-0 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course code (e.g. GST101), title or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-divider text-sm text-primary-text outline-none focus:border-amber-400/50"
            />
          </div>

          {/* University Dropdown */}
          <select 
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-background border border-divider text-xs sm:text-sm text-primary-text outline-none focus:border-amber-400/50 font-medium"
          >
            {UNIVERSITIES.map(u => <option key={u} value={u} className="bg-surface text-primary-text">{u}</option>)}
          </select>

          {/* Year Dropdown */}
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-background border border-divider text-xs sm:text-sm text-primary-text outline-none focus:border-amber-400/50 font-medium"
          >
            {YEARS.map(y => <option key={y} value={y} className="bg-surface text-primary-text">{y}</option>)}
          </select>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 border border-divider rounded-[24px] bg-white/[0.01]">
            <FileQuestion className="w-12 h-12 text-primary-text/10 mx-auto mb-3" />
            <p className="text-secondary-text font-medium text-sm">No past questions matched your filter criteria.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[24px] bg-surface border border-divider hover:border-amber-400/30 transition-all shadow-md flex flex-col space-y-4"
            >
              {/* Card Meta Badges */}
              <div className="flex items-center justify-between border-b border-divider/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 font-bold text-xs">
                    {q.university}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface border border-divider text-primary-text font-semibold text-xs">
                    {q.courseCode}
                  </span>
                  <span className="text-xs text-secondary-text font-medium hidden sm:inline">• {q.courseTitle}</span>
                </div>
                <span className="text-xs text-secondary-text font-semibold px-2.5 py-0.5 rounded-md bg-background border border-divider">
                  {q.year}
                </span>
              </div>

              {/* Question Body */}
              <p className="text-base font-semibold text-primary-text leading-relaxed">{q.questionText}</p>

              {/* Options list if available */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, i) => (
                    <div key={i} className="p-3 rounded-xl bg-background border border-divider text-xs text-secondary-text font-medium">
                      {opt}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => requestAISolution(q)}
                  className="px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-xs hover:bg-amber-400/20 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Request AI Solution
                </button>
                <button
                  onClick={() => askTutorFollowup(q)}
                  className="text-xs text-secondary-text hover:text-primary-text flex items-center gap-1 transition-colors font-medium"
                >
                  Discuss with AI Tutor <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Solution Drawer / Modal */}
      <AnimatePresence>
        {activeQuestion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-2xl bg-surface border border-divider rounded-3xl overflow-hidden p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide space-y-4">
              <div className="flex items-center justify-between border-b border-divider pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 font-bold text-xs border border-amber-400/20">
                    {activeQuestion.university} {activeQuestion.courseCode} ({activeQuestion.year})
                  </span>
                </div>
                <button onClick={() => setActiveQuestion(null)} className="text-secondary-text hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-1">Question</h4>
                <p className="text-sm font-semibold text-primary-text leading-relaxed bg-background p-4 rounded-xl border border-divider">
                  {activeQuestion.questionText}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Step-by-Step Prime AI Solution
                </h4>
                
                {isSolving && !aiSolution ? (
                  <div className="p-8 rounded-xl bg-background border border-divider flex items-center justify-center gap-3 text-secondary-text text-xs">
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Prime AI is deriving step-by-step solution...</span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-background border border-divider text-xs sm:text-sm text-primary-text leading-relaxed prose prose-invert max-w-none">
                    <Markdown>{aiSolution || 'No solution derived yet.'}</Markdown>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => askTutorFollowup(activeQuestion)}
                  className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all shadow-lg flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Open Full Discussion in AI Tutor
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
