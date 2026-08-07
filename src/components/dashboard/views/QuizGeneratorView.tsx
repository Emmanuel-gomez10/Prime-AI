import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, Plus, Sparkles, X, Loader2, CheckCircle2, XCircle, RotateCcw, ArrowRight, Award, Trash2, School, Layers, BookOpen } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { primeEngine } from '../../../lib/primeAiEngine';
import { processFileClientSide } from '../../../lib/documentProcessor';
import { useAuth } from '../../../contexts/AuthContext';
import { dbService } from '../../../services/db/databaseService';
import { UNIZIK_FACULTIES, UNIVERSITIES_LIST } from '../../../data/unizikData';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  university?: string;
  faculty?: string;
  department?: string;
  questions: QuizQuestion[];
  createdAt: number;
}

interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  percentage: number;
  userAnswers: Record<number, number>; // questionIndex -> selectedOptionIndex
}

export const QuizGeneratorView = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState('UNIZIK (Nnamdi Azikiwe University)');
  const [selectedFaculty, setSelectedFaculty] = useState('Faculty of Physical Sciences');
  const [selectedDepartment, setSelectedDepartment] = useState('Computer Science');
  const [quizTitle, setQuizTitle] = useState('UNIZIK CSC201: Data Structures & Algorithms');
  const [topicOrNotes, setTopicOrNotes] = useState('Arrays, Stacks, Queues, Binary Search Trees, Hashing, Graph Traversals (BFS/DFS), Time and Space Complexity Analysis.');
  const [questionCount, setQuestionCount] = useState(5);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Department metadata helpers
  const currentFacultyObj = UNIZIK_FACULTIES.find(f => f.name === selectedFaculty);
  const availableDepartments = currentFacultyObj ? currentFacultyObj.departments : [];
  const currentDeptObj = availableDepartments.find(d => d.name === selectedDepartment);

  useEffect(() => {
    const saved = localStorage.getItem('prime_quizzes_v3');
    if (saved) {
      try {
        setQuizzes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved quizzes:", e);
      }
    } else {
      const defaultQuizzes: Quiz[] = [
        {
          id: '1',
          title: 'UNIZIK CSC201: Data Structures & Algorithms',
          university: 'UNIZIK (Nnamdi Azikiwe University)',
          faculty: 'Faculty of Physical Sciences',
          department: 'Computer Science',
          createdAt: Date.now(),
          questions: [
            {
              id: 'q1',
              question: 'Which data structure follows the Last-In, First-Out (LIFO) principle in UNIZIK CSC201 stack implementations?',
              options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
              correctOptionIndex: 1,
              explanation: 'A Stack operates under LIFO where elements added last are popped first.'
            },
            {
              id: 'q2',
              question: 'What is the average time complexity of searching in a Hash Table with good hash distribution?',
              options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
              correctOptionIndex: 0,
              explanation: 'Hash tables offer O(1) constant time complexity for average search lookups.'
            }
          ]
        },
        {
          id: '2',
          title: 'UNIZIK EEE201: Circuit Theory I',
          university: 'UNIZIK (Nnamdi Azikiwe University)',
          faculty: 'Faculty of Engineering',
          department: 'Electrical & Electronic Engineering',
          createdAt: Date.now() - 3600000,
          questions: [
            {
              id: 'q1_eee',
              question: "According to Kirchhoff's Voltage Law (KVL), what is the algebraic sum of all voltages around a closed circuit loop?",
              options: ['Equal to current', 'Zero (0)', 'Infinity', 'Equal to source resistance'],
              correctOptionIndex: 1,
              explanation: 'KVL states that the algebraic sum of electrical potential differences (voltages) around any closed loop is zero.'
            }
          ]
        }
      ];
      setQuizzes(defaultQuizzes);
      localStorage.setItem('prime_quizzes_v3', JSON.stringify(defaultQuizzes));
    }
  }, []);

  const saveQuizzes = (updated: Quiz[]) => {
    setQuizzes(updated);
    localStorage.setItem('prime_quizzes_v3', JSON.stringify(updated));
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setQuizResult(null);
  };

  const deleteQuiz = (quizId: string) => {
    const updated = quizzes.filter(q => q.id !== quizId);
    saveQuizzes(updated);
    if (activeQuiz?.id === quizId) {
      setActiveQuiz(null);
    }
  };

  const selectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const submitQuiz = () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const total = activeQuiz.questions.length;
    const percentage = Math.round((correctCount / total) * 100);

    const result: QuizResult = {
      quizId: activeQuiz.id,
      score: correctCount,
      total,
      percentage,
      userAnswers: selectedAnswers,
    };

    if (user?.id) {
      dbService.saveQuizResult(user.id, {
        quiz_title: activeQuiz.title,
        score: correctCount,
        total_questions: total,
        details: { percentage, userAnswers: selectedAnswers },
      });
    }

    setQuizResult(result);
    setIsSubmitted(true);
  };

  const retakeQuiz = () => {
    if (!activeQuiz) return;
    startQuiz(activeQuiz);
  };

  const handleFacultySelectInModal = (facName: string) => {
    setSelectedFaculty(facName);
    const facObj = UNIZIK_FACULTIES.find(f => f.name === facName);
    if (facObj && facObj.departments.length > 0) {
      const firstDept = facObj.departments[0];
      setSelectedDepartment(firstDept.name);
      autoFillPrompt(facName, firstDept.name, firstDept.sampleCourses);
    }
  };

  const handleDeptSelectInModal = (deptName: string) => {
    setSelectedDepartment(deptName);
    if (currentFacultyObj) {
      const deptObj = currentFacultyObj.departments.find(d => d.name === deptName);
      if (deptObj) {
        autoFillPrompt(selectedFaculty, deptName, deptObj.sampleCourses);
      }
    }
  };

  const autoFillPrompt = (facName: string, deptName: string, sampleCourses: Array<{ code: string; title: string; year: string }>) => {
    const course = sampleCourses[0] || { code: 'GST101', title: 'General Studies' };
    setQuizTitle(`${selectedUniversity.split(' ')[0]} ${course.code}: ${course.title}`);
    setTopicOrNotes(`Core curriculum questions for ${deptName} (${facName}). Focus on foundational principles, definition of terms, formulas, and typical exam questions for ${course.code}.`);
  };

  const handleGenerateQuiz = async () => {
    if (!quizTitle.trim()) {
      alert("Please enter a quiz title.");
      return;
    }

    setIsGenerating(true);
    try {
      let documentContent = '';
      if (attachedFile) {
        const processed = await processFileClientSide(attachedFile);
        documentContent = processed.content;
      }

      const prompt = `Generate EXACTLY ${questionCount} multiple-choice quiz questions for university "${selectedUniversity}", Faculty "${selectedFaculty}", Department "${selectedDepartment}".
Quiz Title: "${quizTitle}"
Topic/Notes/Curriculum: ${topicOrNotes}
${documentContent ? `Attached Document Content:\n${documentContent.slice(0, 4000)}` : ''}

Output ONLY a raw JSON array of objects with the following schema:
[
  {
    "question": "Question text",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctOptionIndex": 0,
    "explanation": "Detailed explanation of why this option is correct."
  }
]`;

      const { stream } = await primeEngine.generateStream({
        mode: 'quiz',
        userPrompt: prompt,
      });

      let responseText = '';
      for await (const chunk of stream) {
        responseText += chunk;
      }

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      let parsedQuestions: Array<{
        question: string;
        options: string[];
        correctOptionIndex: number;
        explanation: string;
      }> = [];

      if (jsonMatch) {
        parsedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse Quiz JSON structure from AI Engine");
      }

      const newQuiz: Quiz = {
        id: Date.now().toString(),
        title: quizTitle,
        university: selectedUniversity,
        faculty: selectedFaculty,
        department: selectedDepartment,
        createdAt: Date.now(),
        questions: parsedQuestions.map((q, i) => ({
          id: `${Date.now()}-${i}`,
          question: q.question,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation,
        })),
      };

      const updated = [newQuiz, ...quizzes];
      saveQuizzes(updated);
      setIsCreateModalOpen(false);
      startQuiz(newQuiz);
    } catch (err: any) {
      console.error("Quiz generation failed:", err);
      alert(`Failed to generate quiz: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-6 flex flex-col h-full overflow-hidden">
      {!activeQuiz ? (
        // Quiz Selection Dashboard
        <>
          <div className="mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-text mb-1 tracking-tight flex items-center gap-2">
                <FileQuestion className="w-6 h-6 text-blue-400" /> AI Quiz Generator
              </h2>
              <p className="text-secondary-text text-[14px]">Generate practice quizzes by university, faculty & department with instant scores & explanations.</p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-primary hover:from-blue-500 hover:to-primary/90 text-primary-text rounded-xl font-semibold transition-all text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Create Department Quiz
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
            {quizzes.length === 0 ? (
              <div className="text-center py-16 border border-divider rounded-[24px] bg-white/[0.01]">
                <FileQuestion className="w-12 h-12 text-primary-text/10 mx-auto mb-3" />
                <p className="text-secondary-text font-medium text-sm">No quizzes created yet. Click "Create Department Quiz" above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {quizzes.map((quiz) => (
                  <div 
                    key={quiz.id}
                    onClick={() => startQuiz(quiz)}
                    className="p-5 rounded-[24px] border border-divider bg-surface hover:border-blue-500/40 hover:bg-card-hover transition-all cursor-pointer group shadow-lg flex flex-col justify-between min-h-[180px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                          <FileQuestion className="w-4.5 h-4.5" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuiz(quiz.id);
                          }}
                          className="text-secondary-text hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {quiz.university && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-bold border border-amber-400/20">
                            {quiz.university.split(' ')[0]}
                          </span>
                        )}
                        {quiz.department && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                            {quiz.department}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-primary-text mb-1 line-clamp-2 leading-snug">{quiz.title}</h3>
                      <p className="text-secondary-text text-xs">{quiz.questions.length} Questions</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-divider/50 text-xs font-semibold text-blue-400">
                      <span>Take Quiz</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        // Active Quiz & Results View
        <div className="flex-1 flex flex-col h-full max-w-3xl mx-auto w-full relative pb-12 overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between mb-6 shrink-0 border-b border-divider pb-4">
            <button 
              onClick={() => setActiveQuiz(null)}
              className="text-secondary-text hover:text-primary-text flex items-center gap-1.5 transition-colors font-medium text-xs sm:text-sm bg-surface px-3 py-1.5 rounded-xl border border-divider"
            >
              ← Quiz List
            </button>
            <div className="text-center truncate max-w-[200px] sm:max-w-xs">
              <h3 className="text-primary-text font-bold text-sm sm:text-base truncate">{activeQuiz.title}</h3>
              {activeQuiz.department && <p className="text-[10px] text-blue-400 truncate">{activeQuiz.university} • {activeQuiz.department}</p>}
            </div>
            <span className="text-blue-400 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              {activeQuiz.questions.length} Qs
            </span>
          </div>

          {!isSubmitted ? (
            // Quiz Taking Screen
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={q.id} className="p-6 rounded-[24px] bg-surface border border-divider shadow-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <h4 className="text-base sm:text-lg font-semibold text-primary-text leading-snug">{q.question}</h4>
                  </div>

                  <div className="space-y-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => selectOption(qIdx, optIdx)}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/15 text-primary-text shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                              : 'border-divider bg-background text-secondary-text hover:border-blue-500/30 hover:text-primary-text'
                          }`}
                        >
                          <span>{opt}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-blue-400 bg-blue-500' : 'border-divider'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={submitQuiz}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-primary hover:from-blue-500 hover:to-primary/90 text-white font-bold text-sm shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all hover:scale-105 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Submit & Grade Quiz
                </button>
              </div>
            </div>
          ) : (
            // Quiz Results & Score Summary
            <div className="space-y-6">
              {/* Score Header Card */}
              <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-950/60 via-surface to-surface border-2 border-blue-500/30 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
                
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <Award className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold text-primary-text mb-1">Quiz Completed!</h3>
                <p className="text-secondary-text text-sm mb-6">Here is your performance breakdown</p>

                <div className="inline-flex items-baseline gap-2 mb-6 px-6 py-3 rounded-2xl bg-background border border-divider">
                  <span className="text-4xl sm:text-5xl font-extrabold text-blue-400 tracking-tight">{quizResult?.percentage}%</span>
                  <span className="text-secondary-text text-sm font-semibold">({quizResult?.score} / {quizResult?.total} correct)</span>
                </div>

                <div>
                  <button
                    onClick={retakeQuiz}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all inline-flex items-center gap-1.5 shadow-lg"
                  >
                    <RotateCcw className="w-4 h-4" /> Retake Quiz
                  </button>
                </div>
              </div>

              {/* Explanations List */}
              <h4 className="text-base font-bold text-primary-text pt-4">Detailed Question Explanations</h4>
              <div className="space-y-4">
                {activeQuiz.questions.map((q, qIdx) => {
                  const userAns = selectedAnswers[qIdx];
                  const isCorrect = userAns === q.correctOptionIndex;

                  return (
                    <div key={q.id} className={`p-6 rounded-[24px] border bg-surface space-y-3 ${
                      isCorrect ? 'border-emerald-500/40' : 'border-red-500/40'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="text-base font-semibold text-primary-text leading-snug">
                          {qIdx + 1}. {q.question}
                        </h5>
                        {isCorrect ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs flex items-center gap-1 shrink-0">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs sm:text-sm">
                        <p className="text-secondary-text">
                          Your Answer: <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {userAns !== undefined ? q.options[userAns] : 'Not Answered'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-secondary-text">
                            Correct Answer: <span className="text-emerald-400 font-bold">{q.options[q.correctOptionIndex]}</span>
                          </p>
                        )}
                      </div>

                      <div className="p-3.5 rounded-xl bg-background border border-divider text-xs text-primary-text leading-relaxed">
                        <strong className="text-blue-400 block mb-0.5">Explanation:</strong>
                        <Markdown>{q.explanation}</Markdown>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Department Quiz Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg bg-surface border border-divider rounded-3xl overflow-hidden p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide space-y-4">
              <div className="flex items-center justify-between border-b border-divider pb-4">
                <h3 className="text-lg font-bold text-primary-text flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" /> Create Department Quiz
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-secondary-text hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* University Selector */}
              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-amber-400" /> Target University
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none focus:border-blue-500 font-medium"
                >
                  {UNIVERSITIES_LIST.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              {/* Faculty Selector */}
              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Faculty
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => handleFacultySelectInModal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none focus:border-blue-500 font-medium"
                >
                  {UNIZIK_FACULTIES.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                </select>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDeptSelectInModal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-divider text-xs text-primary-text outline-none focus:border-blue-500 font-medium"
                >
                  {availableDepartments.map(d => <option key={d.name} value={d.name}>{d.name} ({d.code})</option>)}
                </select>
              </div>

              {/* Sample Recommended Courses Quick Pills */}
              {currentDeptObj && currentDeptObj.sampleCourses.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-secondary-text block mb-1.5">Recommended Department Courses:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentDeptObj.sampleCourses.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setQuizTitle(`${selectedUniversity.split(' ')[0]} ${c.code}: ${c.title}`);
                          setTopicOrNotes(`Practice exam questions for ${selectedDepartment} course ${c.code} (${c.title}). Focus on high-yield exam concepts, formulas, definitions, and theory.`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[11px] font-semibold transition-all"
                      >
                        + {c.code}: {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">Quiz Title</label>
                <input 
                  type="text" 
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. UNIZIK CSC201 Midterm Quiz"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-divider outline-none text-primary-text text-sm focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">Study Topic or Course Notes</label>
                <textarea 
                  value={topicOrNotes}
                  onChange={(e) => setTopicOrNotes(e.target.value)}
                  placeholder="Enter topic or paste notes..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-divider outline-none text-primary-text text-sm focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">Attach Document (Optional PDF/DOCX)</label>
                <input 
                  type="file" 
                  onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.docx,.txt"
                  className="w-full text-xs text-secondary-text file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">Number of Questions ({questionCount})</label>
                <input 
                  type="range" 
                  min={3} 
                  max={15} 
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-primary hover:from-blue-500 hover:to-primary/90 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>{isGenerating ? 'Generating Quiz...' : '✨ Generate Department Quiz'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
