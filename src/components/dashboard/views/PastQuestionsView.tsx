import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, Search, Sparkles, ChevronRight, X, Loader2, BookOpen, School, Layers, Clock } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { primeEngine } from '../../../lib/primeAiEngine';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { UNIZIK_FACULTIES, UNIVERSITIES_LIST } from '../../../data/unizikData';
import { adminService } from '../../../services/admin/adminService';
import { useFeatureUsage } from '../../../hooks/useFeatureUsage';

export interface PastQuestionItem {
  id: string;
  university: string;
  faculty?: string;
  department?: string;
  courseCode: string;
  courseTitle: string;
  year: string;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  aiExplanation?: string;
}

const YEARS = ['All Years', '2023', '2022', '2021', '2020', '2019', '2018'];

export const PastQuestionsView = () => {
  const { sendMessage, createNewThread } = useWorkspace();
  const usage = useFeatureUsage('past_questions');
  const [questions, setQuestions] = useState<PastQuestionItem[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState('UNIZIK (Nnamdi Azikiwe University)');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [searchQuery, setSearchQuery] = useState('');
  const [limitError, setLimitError] = useState<string | null>(null);

  // AI Auto-Generation State
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  // Solution Drawer / Modal state
  const [activeQuestion, setActiveQuestion] = useState<PastQuestionItem | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [aiSolution, setAiSolution] = useState<string | null>(null);

  // Available departments based on selected faculty
  const availableFaculties = UNIZIK_FACULTIES;
  const currentFacultyObj = availableFaculties.find(f => f.name === selectedFaculty);
  const availableDepartments = currentFacultyObj ? currentFacultyObj.departments : [];

  useEffect(() => {
    const loadPastQuestions = async () => {
      const dbResources = await adminService.getStudyResources();
      const pastQuestionResources = dbResources.filter(
        (r) => r.category === 'Past Question'
      );

      if (pastQuestionResources.length > 0) {
        const formatted: PastQuestionItem[] = pastQuestionResources.map((r) => ({
          id: r.id,
          university: r.university || 'UNIZIK (Nnamdi Azikiwe University)',
          faculty: 'Faculty of General Studies',
          department: 'General Studies',
          courseCode: r.title.split(' ')[0] || 'GST101',
          courseTitle: r.title,
          year: '2024',
          questionText: `Study Material / Past Question Paper: ${r.title}. Downloaded ${r.downloads} times.`,
          options: [
            'Option A: High-Yield Practice Question',
            'Option B: Core Concept Explanation',
            'Option C: Past Exam Format',
            'Option D: Solution Guide'
          ],
          correctAnswer: 'Option A: High-Yield Practice Question',
          aiExplanation: `Official past question material provided by ${r.university}.`
        }));
        setQuestions(formatted);
      } else {
        setQuestions([]);
      }
    };

    loadPastQuestions();
  }, []);

  const handleFacultyChange = (fac: string) => {
    setSelectedFaculty(fac);
    setSelectedDepartment('All Departments');
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesUni = selectedUniversity === 'All Universities' || q.university.includes(selectedUniversity.split(' ')[0]);
    const matchesFaculty = selectedFaculty === 'All Faculties' || q.faculty === selectedFaculty;
    const matchesDepartment = selectedDepartment === 'All Departments' || q.department === selectedDepartment;
    const matchesYear = selectedYear === 'All Years' || q.year === selectedYear;
    const matchesSearch = searchQuery === '' || 
      q.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUni && matchesFaculty && matchesDepartment && matchesYear && matchesSearch;
  });

  const handleAIGenerateDepartmentQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const targetUni = selectedUniversity;
      const targetFac = selectedFaculty === 'All Faculties' ? 'Faculty of Physical Sciences' : selectedFaculty;
      const targetDept = selectedDepartment === 'All Departments' ? 'Computer Science' : selectedDepartment;

      const prompt = `Generate 3 authentic exam past questions for university "${targetUni}", Faculty of "${targetFac}", Department of "${targetDept}".
For each question, provide:
- Course Code (e.g. CSC201 or MAT111)
- Course Title
- Academic Year (e.g. 2023 or 2022)
- Question Text
- 4 multiple choice options (A, B, C, D)
- Correct Option string
- AI Explanation

Return ONLY a valid JSON array of objects with schema:
[
  {
    "courseCode": "CSC201",
    "courseTitle": "Data Structures",
    "year": "2023",
    "questionText": "Question text here",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A) Option 1",
    "aiExplanation": "Step-by-step explanation"
  }
]`;

      const { stream } = await primeEngine.generateStream({
        mode: 'tutor',
        userPrompt: prompt,
      });

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
      }

      const jsonMatch = fullText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const newItems: PastQuestionItem[] = parsed.map((item: any, idx: number) => ({
          id: `pq-ai-${Date.now()}-${idx}`,
          university: targetUni,
          faculty: targetFac,
          department: targetDept,
          courseCode: item.courseCode || 'GST101',
          courseTitle: item.courseTitle || 'General Course',
          year: item.year || '2023',
          questionText: item.questionText,
          options: item.options,
          correctAnswer: item.correctAnswer,
          aiExplanation: item.aiExplanation,
        }));

        const updated = [...newItems, ...questions];
        setQuestions(updated);
      } else {
        throw new Error("Could not parse generated past questions JSON");
      }
    } catch (err: any) {
      console.error("AI past question generation error:", err);
      alert(`Failed to generate past questions: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const requestAISolution = async (q: PastQuestionItem) => {
    if (usage.isExhausted) {
      setLimitError(`Daily limit reached (${usage.limit}/${usage.limit} uses). Resets in ${usage.resetInFormatted || '24 hours'}.`);
      return;
    }

    setLimitError(null);
    setActiveQuestion(q);
    setAiSolution(q.aiExplanation || null);
    setIsSolving(true);

    try {
      const prompt = `Solve this university past question step-by-step for ${q.university} (${q.faculty ? `Faculty: ${q.faculty}, ` : ''}${q.department ? `Dept: ${q.department}, ` : ''}${q.courseCode} - ${q.year}):
Question: "${q.questionText}"
${q.options ? `Options:\n${q.options.join('\n')}` : ''}

Provide:
1. Recognized correct answer clearly highlighted.
2. Step-by-step mathematical or conceptual explanation.
3. Key formulas or rules applied.`;

      const { stream } = await primeEngine.generateStream({
        mode: 'past_questions',
        userPrompt: prompt,
      });

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setAiSolution(fullText);
      }
      usage.refetch();
    } catch (err: any) {
      console.error("Failed to generate solution:", err);
      setLimitError(err?.message || 'Failed to solve past question.');
      usage.refetch();
    } finally {
      setIsSolving(false);
    }
  };

  const askTutorFollowup = (q: PastQuestionItem) => {
    createNewThread();
    sendMessage(`I am reviewing this ${q.university} (${q.department || ''}) past question for ${q.courseCode} (${q.year}): "${q.questionText}". Can you explain it further to me?`);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-6 flex flex-col h-full overflow-hidden">
      <div className="mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight flex items-center gap-2">
              <FileQuestion className="w-6 h-6 text-amber-400" /> Past Questions Library
            </h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              usage.remaining === 0 
                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                : usage.remaining === 1 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {usage.remaining} / {usage.limit} uses remaining (24h)
            </span>
          </div>
          <p className="text-secondary-text text-[14px] mt-1">Filter exam questions by university, faculty, department & year. Generate instant AI past questions.</p>
        </div>

        <button
          onClick={() => {
            if (usage.isExhausted) {
              setLimitError(`Daily limit reached (${usage.limit}/${usage.limit} uses). Resets in ${usage.resetInFormatted || '24 hours'}.`);
              return;
            }
            setLimitError(null);
            handleAIGenerateDepartmentQuestions();
          }}
          disabled={isGeneratingQuestions}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl transition-all text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          {isGeneratingQuestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isGeneratingQuestions ? 'Generating Questions...' : '✨ AI Generate Department Past Questions'}</span>
        </button>
      </div>

      {limitError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-center gap-3">
          <Clock className="w-5 h-5 text-red-400 shrink-0" />
          <span>{limitError}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-5 rounded-[24px] bg-surface border border-divider shadow-lg mb-6 shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course code (e.g. CSC201, MAT111), title or question keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-divider text-sm text-primary-text outline-none focus:border-amber-400/50"
            />
          </div>

          {/* University Dropdown */}
          <select 
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-background border border-divider text-xs sm:text-sm text-primary-text outline-none focus:border-amber-400/50 font-medium"
          >
            {UNIVERSITIES_LIST.map(u => <option key={u} value={u} className="bg-surface text-primary-text">{u}</option>)}
          </select>
        </div>

        {/* Faculty & Department Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-divider/60">
          <div>
            <label className="block text-[11px] font-bold text-secondary-text uppercase tracking-wider mb-1 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-amber-400" /> Faculty
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => handleFacultyChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none focus:border-amber-400/50 font-medium"
            >
              <option value="All Faculties">All Faculties</option>
              {availableFaculties.map(f => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-secondary-text uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              disabled={selectedFaculty === 'All Faculties'}
              className="w-full px-3 py-2 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none focus:border-amber-400/50 font-medium disabled:opacity-50"
            >
              <option value="All Departments">All Departments</option>
              {availableDepartments.map(d => (
                <option key={d.name} value={d.name}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-secondary-text uppercase tracking-wider mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Exam Year
            </label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none focus:border-amber-400/50 font-medium"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 border border-divider rounded-[24px] bg-white/[0.01] space-y-3">
            <FileQuestion className="w-12 h-12 text-primary-text/10 mx-auto" />
            <p className="text-secondary-text font-medium text-sm">No past questions found for this faculty/department filter.</p>
            <button
              onClick={handleAIGenerateDepartmentQuestions}
              className="px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold hover:bg-amber-400/20 transition-all inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Click to AI Generate Questions for {selectedDepartment !== 'All Departments' ? selectedDepartment : 'selected Department'}
            </button>
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
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-divider/60 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 font-bold text-xs">
                    {q.university}
                  </span>
                  {q.faculty && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold">
                      {q.faculty}
                    </span>
                  )}
                  {q.department && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold">
                      {q.department}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-surface border border-divider text-primary-text font-semibold text-xs">
                    {q.courseCode}
                  </span>
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 font-bold text-xs border border-amber-400/20">
                    {activeQuestion.university} • {activeQuestion.department || activeQuestion.faculty || ''} {activeQuestion.courseCode} ({activeQuestion.year})
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
