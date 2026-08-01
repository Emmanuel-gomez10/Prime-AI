import { useState, useEffect } from 'react';
import { Upload, FileText, File as FileIcon, X, Loader2, Sparkles, Bookmark, HelpCircle, ArrowRight } from 'lucide-react';
import { processFileClientSide } from '../../../lib/documentProcessor';
import { primeEngine } from '../../../lib/primeAiEngine';
import { useWorkspace } from '../../../contexts/WorkspaceContext';


interface SavedStudyMaterial {
  id: string;
  name: string;
  size: string;
  date: string;
  summary: string;
  questions: string[];
  extractedText: string;
}

export const StudyFetchView = () => {
  const { sendMessage, createNewThread } = useWorkspace();
  const [documents, setDocuments] = useState<SavedStudyMaterial[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<SavedStudyMaterial | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('prime_study_materials_v2');
    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved study materials:", e);
      }
    }
  }, []);

  const saveMaterials = (mats: SavedStudyMaterial[]) => {
    setDocuments(mats);
    localStorage.setItem('prime_study_materials_v2', JSON.stringify(mats));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleDocumentUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDocumentUpload(e.target.files[0]);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    setCurrentFile(file);
    setIsProcessing(true);

    try {
      // Step 1: Extract text directly client-side
      const processed = await processFileClientSide(file);
      
      // Step 2: Request AI summary & 2 follow-up study questions from Prime AI Engine
      const prompt = `Analyze the attached document content carefully:
1. Provide a comprehensive, high-yield executive study summary formatted in clean markdown bullets.
2. At the very end, under a header titled "### Key Study Questions", generate EXACTLY TWO (2) thought-provoking study questions based directly on this document content to test retention.`;

      const { stream } = await primeEngine.generateStream({
        mode: 'study-fetch',
        userPrompt: prompt,
        attachments: [
          {
            name: processed.name,
            type: processed.type,
            content: processed.content,
            base64: processed.base64,
          },
        ],
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
      }

      // Extract response text & two questions
      const questionHeaderIndex = fullResponse.indexOf('### Key Study Questions');
      let summaryText = fullResponse;
      let questionsList: string[] = [
        `What are the core concepts presented in ${file.name}?`,
        `How do the main topics in ${file.name} apply to exam questions?`
      ];

      if (questionHeaderIndex !== -1) {
        summaryText = fullResponse.substring(0, questionHeaderIndex).trim();
        const questionsPart = fullResponse.substring(questionHeaderIndex);
        const matches = questionsPart.match(/(?:\d+\.|\-|\*)\s*(.+)/g);
        if (matches && matches.length >= 2) {
          questionsList = matches.slice(0, 2).map((q) => q.replace(/^(?:\d+\.|\-|\*)\s*/, '').trim());
        }
      }

      const newMaterial: SavedStudyMaterial = {
        id: Date.now().toString(),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        date: new Date().toLocaleDateString(),
        summary: summaryText,
        questions: questionsList,
        extractedText: processed.content.slice(0, 5000), // store preview
      };

      const updated = [newMaterial, ...documents];
      saveMaterials(updated);
      setSelectedMaterial(newMaterial);
    } catch (err: any) {
      console.error("Study fetch processing failed:", err);
      alert(`Failed to analyze document: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setCurrentFile(null);
    }
  };

  const deleteMaterial = (id: string) => {
    saveMaterials(documents.filter(d => d.id !== id));
    if (selectedMaterial?.id === id) {
      setSelectedMaterial(null);
    }
  };

  const startTutorSessionForQuestion = (material: SavedStudyMaterial, question: string) => {
    createNewThread();
    sendMessage(`I am studying ${material.name}. Can you explain this study question step-by-step: "${question}"?`);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-6 flex flex-col h-full overflow-hidden">
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-text mb-1 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" /> Study Fetch
          </h2>
          <p className="text-secondary-text text-[14px]">Upload PDFs, lecture slides, or DOCX files for instant AI summaries & 2 key study questions.</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-[24px] p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all ${
          isDragging ? 'border-primary bg-primary/10 shadow-[0_0_40px_rgba(168,85,247,0.2)]' : 'border-divider bg-card-hover hover:border-primary/40'
        } mb-8 shrink-0 min-h-[200px]`}
      >
        <input 
          type="file" 
          className="hidden" 
          id="study-file-upload" 
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
          onChange={handleFileSelect}
        />
        
        {isProcessing ? (
          <div className="w-full max-w-md flex flex-col items-center py-4">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
            <h3 className="text-primary-text font-semibold text-lg mb-1">Analyzing Document with Prime AI...</h3>
            <p className="text-secondary-text text-xs mb-3">{currentFile?.name}</p>
            <p className="text-emerald-400/80 text-xs font-medium animate-pulse">Extracting text, compiling summary & generating 2 study questions...</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-primary-text mb-1">Drag & drop your study material here</h3>
            <p className="text-secondary-text text-[13px] mb-5">Supports PDF, DOCX, TXT up to 50MB</p>
            <label 
              htmlFor="study-file-upload"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105"
            >
              Browse Files
            </label>
          </>
        )}
      </div>

      {/* Content Area: Saved Materials & Active Viewer */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-primary-text flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-400" /> Saved Study Materials
          </h3>
          <span className="px-3 py-0.5 bg-card-hover rounded-full text-secondary-text text-xs font-medium">{documents.length} materials</span>
        </div>
        
        {documents.length === 0 ? (
          <div className="text-center py-12 border border-divider rounded-[20px] bg-white/[0.01]">
            <FileIcon className="w-10 h-10 text-primary-text/10 mx-auto mb-3" />
            <p className="text-secondary-text font-medium text-sm">No saved study materials yet. Upload a document above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List Column */}
            <div className="lg:col-span-1 space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedMaterial(doc)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedMaterial?.id === doc.id
                      ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg'
                      : 'border-divider bg-surface hover:border-divider'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <h4 className="text-primary-text font-medium text-sm truncate">{doc.name}</h4>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMaterial(doc.id);
                      }}
                      className="text-secondary-text hover:text-red-400 p-1 transition-colors"
                      title="Delete material"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-secondary-text mt-2">
                    <span>{doc.size}</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-2">
              {selectedMaterial ? (
                <div className="p-6 rounded-[20px] bg-surface border border-divider shadow-xl flex flex-col space-y-6">
                  <div className="flex items-center justify-between border-b border-divider pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-primary-text">{selectedMaterial.name}</h3>
                      <p className="text-xs text-secondary-text mt-0.5">Processed on {selectedMaterial.date} • {selectedMaterial.size}</p>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Executive Summary
                    </h4>
                    <div className="p-4 rounded-xl bg-background border border-divider text-sm text-primary-text leading-relaxed whitespace-pre-wrap">
                      {selectedMaterial.summary}
                    </div>
                  </div>

                  {/* 2 Study Questions */}
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" /> Recommended Study Questions
                    </h4>
                    <div className="space-y-2.5">
                      {selectedMaterial.questions.map((q, i) => (
                        <div 
                          key={i}
                          className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3 group hover:bg-primary/10 transition-colors"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                            <p className="text-xs sm:text-sm text-primary-text font-medium">{q}</p>
                          </div>
                          <button
                            onClick={() => startTutorSessionForQuestion(selectedMaterial, q)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-text text-xs font-medium hover:bg-primary/90 transition-all flex items-center gap-1 shrink-0 shadow-sm"
                          >
                            Ask AI <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-[20px] bg-surface/50 border border-divider text-center py-16 text-secondary-text text-sm">
                  Select a study material from the left list to view its summary & study questions.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

