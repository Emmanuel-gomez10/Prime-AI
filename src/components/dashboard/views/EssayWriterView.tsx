import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Download, Copy, Sparkles, RefreshCw, Type, AlignLeft, Check, Wand2, X, ArrowRight } from 'lucide-react';
import { primeEngine } from '../../../lib/primeAiEngine';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useFeatureUsage } from '../../../hooks/useFeatureUsage';
import { toast } from 'sonner';

const ESSAY_TYPES = ['Argumentative', 'Expository', 'Analytical', 'Persuasive', 'Research Paper'];
const ESSAY_TONES = ['Academic', 'Formal', 'Informative', 'Persuasive', 'Critical'];
const WORD_COUNTS = [
  { label: 'Short (~300 words)', value: 300 },
  { label: 'Medium (~600 words)', value: 600 },
  { label: 'Long (~1000 words)', value: 1000 },
];

export const EssayWriterView = () => {
  const { sendMessage, createNewThread } = useWorkspace();
  const usage = useFeatureUsage('essay_writer');
  const [topic, setTopic] = useState('');
  const [essayType, setEssayType] = useState('Argumentative');
  const [tone, setTone] = useState('Academic');
  const [wordCount, setWordCount] = useState(600);
  const [isGenerating, setIsGenerating] = useState(false);
  const [essayContent, setEssayContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Refine Toolbar State
  const [selectedText, setSelectedText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstruction] = useState('');
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);

  const handleGenerateEssay = async () => {
    if (!topic.trim()) {
      alert("Please enter an essay topic or prompt.");
      return;
    }

    setIsGenerating(true);
    setEssayContent('');

    try {
      const prompt = `Write a comprehensive ${essayType} essay on the following topic: "${topic}".
Essay Requirements:
- Tone: ${tone}
- Target Length: approximately ${wordCount} words
- Include a compelling title, clear introduction with thesis statement, well-structured body paragraphs with evidence, and a concluding synthesis.
- Use clean Markdown formatting for section headers.`;

      const { stream } = await primeEngine.generateStream({
        mode: 'essay',
        userPrompt: prompt,
      });

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setEssayContent(fullText);
      }
      usage.refetch();
    } catch (err: any) {
      console.error("Essay generation failed:", err);
      toast.error(err?.message || 'Failed to draft essay.');
      usage.refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineWithAI = async (actionType: 'grammar' | 'expand' | 'concise' | 'custom') => {
    const textToRefine = selectedText.trim() || essayContent.trim();
    if (!textToRefine) {
      alert("Please enter or select essay text to refine.");
      return;
    }

    setIsRefining(true);
    let promptInstruction = '';

    if (actionType === 'grammar') {
      promptInstruction = 'Fix all grammar, punctuation, vocabulary, and awkward phrasing while maintaining academic tone.';
    } else if (actionType === 'expand') {
      promptInstruction = 'Expand this section with deeper academic analysis, transition words, and evidence.';
    } else if (actionType === 'concise') {
      promptInstruction = 'Make this text more concise, direct, and impactful by removing wordiness.';
    } else {
      promptInstruction = refineInstruction || 'Refine and improve this academic text.';
    }

    try {
      const prompt = `Task: ${promptInstruction}\n\nOriginal Text:\n"${textToRefine}"\n\nOutput ONLY the refined replacement text directly:`;

      const { stream } = await primeEngine.generateStream({
        mode: 'essay',
        userPrompt: prompt,
      });

      let refinedResult = '';
      for await (const chunk of stream) {
        refinedResult += chunk;
      }

      if (selectedText && essayContent.includes(selectedText)) {
        setEssayContent(essayContent.replace(selectedText, refinedResult.trim()));
      } else {
        setEssayContent(refinedResult.trim());
      }
      setIsRefineModalOpen(false);
      setSelectedText('');
    } catch (err: any) {
      console.error("Refining failed:", err);
      alert(`Failed to refine text: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsRefining(false);
    }
  };

  const copyEssay = () => {
    navigator.clipboard.writeText(essayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadEssay = () => {
    const blob = new Blob([essayContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.slice(0, 20) || 'essay'}_draft.md`;
    a.click();
  };

  const discussWithTutor = () => {
    createNewThread();
    sendMessage(`Here is an essay draft I am working on regarding "${topic}":\n\n${essayContent.slice(0, 1500)}\n\nCan you review this draft and offer critical feedback?`);
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-6 h-full flex flex-col md:flex-row gap-6 overflow-hidden">
      
      {/* Configuration Sidebar */}
      <div className="w-full md:w-[340px] shrink-0 flex flex-col h-full bg-surface rounded-[24px] border border-divider overflow-y-auto scrollbar-hide shadow-lg">
        <div className="p-5 border-b border-divider space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <PenTool className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-primary-text tracking-tight">Essay Writer</h2>
            </div>
          </div>
          <p className="text-xs text-secondary-text font-medium">Draft academic papers, essays & refine prose with AI.</p>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Topic Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-secondary-text uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Topic or Prompt
            </label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The economic & ethical impact of artificial intelligence in higher education..."
              className="w-full bg-background border border-divider rounded-xl p-3 text-xs sm:text-sm text-primary-text placeholder:text-primary-text/30 outline-none focus:border-purple-500/50 transition-all resize-none min-h-[90px]"
            />
          </div>

          {/* Essay Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Essay Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ESSAY_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setEssayType(t)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                    essayType === t 
                      ? 'bg-purple-600 text-white shadow-sm font-semibold' 
                      : 'bg-background text-secondary-text border border-divider hover:text-primary-text'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Tone & Style</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ESSAY_TONES.map((tn) => (
                <button
                  key={tn}
                  onClick={() => setTone(tn)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                    tone === tn 
                      ? 'bg-purple-600 text-white shadow-sm font-semibold' 
                      : 'bg-background text-secondary-text border border-divider hover:text-primary-text'
                  }`}
                >
                  {tn}
                </button>
              ))}
            </div>
          </div>

          {/* Word Count Target */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary-text uppercase tracking-wider flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Target Length
            </label>
            <div className="space-y-1">
              {WORD_COUNTS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setWordCount(w.value)}
                  className={`w-full text-left py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-between ${
                    wordCount === w.value 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-semibold' 
                      : 'bg-background text-secondary-text border border-divider hover:text-primary-text'
                  }`}
                >
                  <span>{w.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-divider shrink-0">
          <button 
            onClick={handleGenerateEssay}
            disabled={isGenerating || !topic}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-primary hover:from-purple-500 hover:to-primary/90 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Drafting Essay...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Essay Draft
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Refine Workspace */}
      <div className="flex-1 flex flex-col h-full bg-surface rounded-[24px] border border-divider overflow-hidden relative shadow-xl">
        {/* Editor Toolbar */}
        <div className="shrink-0 p-3.5 border-b border-divider flex flex-wrap items-center justify-between gap-2 bg-surface/95 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRefineModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" /> Refine Selection with AI
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={discussWithTutor}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 border border-primary/20 text-primary-text hover:bg-primary/20 transition-all flex items-center gap-1.5"
              title="Critique in AI Tutor"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Critique Draft
            </button>
            <button 
              onClick={copyEssay}
              className="p-2 rounded-lg bg-background border border-divider text-secondary-text hover:text-primary-text transition-colors"
              title="Copy Essay"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button 
              onClick={downloadEssay}
              className="p-2 rounded-lg bg-background border border-divider text-secondary-text hover:text-primary-text transition-colors"
              title="Download Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Textarea / Markdown Preview */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-8">
          {essayContent || isGenerating ? (
            <textarea
              value={essayContent}
              onChange={(e) => setEssayContent(e.target.value)}
              onSelect={(e: any) => {
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                if (start !== end) {
                  setSelectedText(essayContent.substring(start, end));
                }
              }}
              placeholder={isGenerating ? "Prime AI is drafting your essay..." : "Start typing or editing your essay..."}
              className="w-full h-full bg-transparent resize-none border-none outline-none text-primary-text text-[15px] leading-relaxed placeholder:text-primary-text/20 font-medium scrollbar-hide"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70 py-16">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                <PenTool className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-primary-text mb-1">Academic Editor Ready</h3>
              <p className="text-secondary-text max-w-sm text-xs leading-relaxed mb-4">
                Enter an essay prompt on the left to generate a complete draft, or write directly in the editor.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Refinement Modal */}
      <AnimatePresence>
        {isRefineModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-surface border border-divider rounded-3xl p-6 flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-divider pb-3">
                <h3 className="text-base font-bold text-primary-text flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-400" /> Refine Text with AI
                </h3>
                <button onClick={() => setIsRefineModalOpen(false)} className="text-secondary-text hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedText && (
                <div className="p-3 rounded-xl bg-background border border-divider text-xs text-secondary-text italic max-h-24 overflow-y-auto">
                  "{selectedText.slice(0, 150)}..."
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleRefineWithAI('grammar')}
                  disabled={isRefining}
                  className="py-2.5 px-4 rounded-xl bg-background border border-divider hover:border-purple-500/50 text-primary-text font-medium text-xs text-left transition-all flex items-center justify-between"
                >
                  <span>✨ Fix Grammar & Polish Vocabulary</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
                <button
                  onClick={() => handleRefineWithAI('expand')}
                  disabled={isRefining}
                  className="py-2.5 px-4 rounded-xl bg-background border border-divider hover:border-purple-500/50 text-primary-text font-medium text-xs text-left transition-all flex items-center justify-between"
                >
                  <span>📝 Expand with Deeper Academic Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
                <button
                  onClick={() => handleRefineWithAI('concise')}
                  disabled={isRefining}
                  className="py-2.5 px-4 rounded-xl bg-background border border-divider hover:border-purple-500/50 text-primary-text font-medium text-xs text-left transition-all flex items-center justify-between"
                >
                  <span>⚡ Make Concise & Direct</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
              </div>

              {isRefining && (
                <div className="py-2 flex items-center justify-center gap-2 text-purple-400 text-xs font-semibold animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Refinement in progress...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

