import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, Plus, Sparkles, X, Loader2, CheckCircle2, XCircle, RotateCcw, ArrowRight, Award, Trash2 } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { primeEngine } from '../../../lib/primeAiEngine';
import { processFileClientSide } from '../../../lib/documentProcessor';
import { useAuth } from '../../../contexts/AuthContext';
import { dbService } from '../../../services/db/databaseService';

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
  const [quizTitle, setQuizTitle] = useState('');
  const [topicOrNotes, setTopicOrNotes] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('prime_quizzes_v2');
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
          title: 'Computer Science: Data Structures',
          createdAt: Date.now(),
          questions: [
            {
              id: 'q1',
              question: 'Which data structure follows the Last-In, First-Out (LIFO) principle?',
              options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
              correctOptionIndex: 1,
              explanation: 'A Stack operates under LIFO where elements added last are removed first.'
            },
            {
              id: 'q2',
              question: 'What is the average time complexity of searching in a Hash Table?',
              options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
              correctOptionIndex: 0,
              explanation: 'Hash tables offer O(1) constant time complexity for average search lookups.'
            }
          ]
        }
      ];
      setQuizzes(defaultQuizzes);
      localStorage.setItem('prime_quizzes_v2', JSON.stringify(defaultQuizzes));
    }
  }, []);

  const saveQuizzes = (updated: Quiz[]) => {
    setQuizzes(updated);
    localStorage.setItem('prime_quizzes_v2', JSON.stringify(updated));
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

  const handleGenerateQuiz = async () => {
    if (!quizTitle.trim()) {
      alert("Please enter a quiz title.");
      return;
    }
    if (!topicOrNotes.trim() && !attachedFile) {
      alert("Please enter study notes or attach a document.");
      return;
    }

    setIsGenerating(true);
    try {
      let documentContent = '';
      if (attachedFile) {
        const processed = await processFileClientSide(attachedFile);
        documentContent = processed.content;
      }

      const prompt = `Generate EXACTLY ${questionCount} multiple-choice quiz questions for "${quizTitle}".
Topic/Notes: ${topicOrNotes}
${documentContent ? `Attached Document Content:\n${documentContent.slice(0, 4000)}` : ''}

Output ONLY a raw JSON array of objects with the following schema:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
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
      resetModal();
      startQuiz(newQuiz);
    } catch (err: any) {
      console.error("Quiz generation failed:", err);
      alert(`Failed to generate quiz: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetModal = () => {
    setQuizTitle('');
    setTopicOrNotes('');
    setAttachedFile(null);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-6 flex flex-col h-full overflow-hidden">
      {!activeQuiz ? (
        // Quiz Selection Dashboard
        <>
          <div className="mb-6 shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-text mb-1 tracking-tight flex items-center gap-2">
                <FileQuestion className="w-6 h-6 text-blue-400" /> AI Quiz Generator
              </h2>
              <p className="text-secondary-text text-[14px]">Generate multiple-choice practice quizzes with instant scores & explanations.</p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-primary hover:from-blue-500 hover:to-primary/90 text-primary-text rounded-xl font-semibold transition-all text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Create Quiz
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
            {quizzes.length === 0 ? (
              <div className="text-center py-16 border border-divider rounded-[24px] bg-white/[0.01]">
                <FileQuestion className="w-12 h-12 text-primary-text/10 mx-auto mb-3" />
                <p className="text-secondary-text font-medium text-sm">No quizzes created yet. Click "Create Quiz" above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {quizzes.map((quiz) => (
                  <div 
                    key={quiz.id}
                    onClick={() => startQuiz(quiz)}
                    className="p-5 rounded-[24px] border border-divider bg-surface hover:border-blue-500/40 hover:bg-card-hover transition-all cursor-pointer group shadow-lg flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                          <FileQuestion className="w-5 h-5" />
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
                      <h3 className="text-lg font-bold text-primary-text mb-1 line-clamp-1">{quiz.title}</h3>
                      <p className="text-secondary-text text-xs">{quiz.questions.length} questions</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-divider/50 text-xs font-semibold text-blue-400">
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
            <h3 className="text-primary-text font-bold text-base sm:text-lg truncate max-w-[200px] sm:max-w-xs">{activeQuiz.title}</h3>
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

      {/* Create Quiz Modal */}
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
                  <Sparkles className="w-5 h-5 text-blue-400" /> Create AI Quiz
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-secondary-text hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">Quiz Title</label>
                <input 
                  type="text" 
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Data Structures Midterm Quiz"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-divider outline-none text-primary-text text-sm focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">Study Topic or Notes</label>
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
                <span>{isGenerating ? 'Generating Quiz...' : 'Generate Practice Quiz'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
