import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, File as FileIcon, X, Loader2, Play } from 'lucide-react';

interface DocumentInfo {
  id: string;
  name: string;
  size: string;
  date: string;
  status: 'processed' | 'processing' | 'failed';
}

export const StudyFetchView = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<DocumentInfo | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('prime_documents');
    if (saved) {
      setDocuments(JSON.parse(saved));
    }
  }, []);

  const saveDocs = (docs: DocumentInfo[]) => {
    setDocuments(docs);
    localStorage.setItem('prime_documents', JSON.stringify(docs));
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
      simulateUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload(e.target.files[0]);
    }
  };

  const simulateUpload = (file: File) => {
    const newDoc: DocumentInfo = {
      id: Date.now().toString(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      date: new Date().toLocaleDateString(),
      status: 'processing'
    };

    setUploadingDoc(newDoc);
    setProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 20;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          const processedDoc = { ...newDoc, status: 'processed' as const };
          saveDocs([processedDoc, ...documents]);
          setUploadingDoc(null);
        }, 600);
      } else {
        setProgress(currentProgress);
      }
    }, 400);
  };

  const deleteDoc = (id: string) => {
    saveDocs(documents.filter(d => d.id !== id));
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col h-full overflow-hidden">
      <div className="mb-8 shrink-0">
        <h2 className="text-3xl font-bold text-primary-text mb-2 tracking-tight">Study Fetch</h2>
        <p className="text-secondary-text text-[15px]">Upload your PDFs, lecture slides, or reading materials to automatically generate notes and flashcards.</p>
      </div>

      {/* Upload Area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center text-center transition-all ${
          isDragging ? 'border-primary bg-primary/10 shadow-[0_0_40px_rgba(168,85,247,0.2)]' : 'border-divider bg-card-hover hover:bg-card-hover'
        } mb-10 shrink-0 min-h-[260px]`}
      >
        <input 
          type="file" 
          className="hidden" 
          id="file-upload" 
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
          onChange={handleFileSelect}
        />
        
        {uploadingDoc ? (
          <div className="w-full max-w-md flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-primary-text font-semibold text-lg mb-2">Analyzing Document...</h3>
            <p className="text-secondary-text text-sm mb-6">{uploadingDoc.name}</p>
            <div className="w-full h-2.5 bg-card-hover rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-[#3b82f6]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear', duration: 0.2 }}
              />
            </div>
            <p className="text-secondary-text text-xs mt-3 font-medium">{Math.min(100, Math.round(progress))}% processed</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-primary-text mb-2">Drag & drop your files here</h3>
            <p className="text-secondary-text text-[14px] mb-8">Supports PDF, DOCX, PPT, TXT up to 50MB</p>
            <label 
              htmlFor="file-upload"
              className="px-8 py-3 bg-white hover:bg-white/90 text-[#0A0D14] rounded-full font-semibold transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Browse Files
            </label>
          </>
        )}
      </div>

      {/* Document Library */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary-text">Your Documents</h3>
          <span className="px-3 py-1 bg-card-hover rounded-full text-secondary-text text-xs font-medium">{documents.length} files</span>
        </div>
        
        {documents.length === 0 ? (
          <div className="text-center py-16 border border-divider rounded-[24px] bg-white/[0.01]">
            <FileIcon className="w-12 h-12 text-primary-text/10 mx-auto mb-4" />
            <p className="text-secondary-text font-medium">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={doc.id} 
                className="p-5 rounded-[20px] border border-divider bg-surface hover:border-divider transition-all group shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => deleteDoc(doc.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-card-hover text-secondary-text hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-primary-text font-medium truncate mb-1.5" title={doc.name}>{doc.name}</h4>
                <div className="flex items-center gap-3 text-xs text-secondary-text mb-5 font-medium">
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{doc.date}</span>
                </div>
                
                <div className="flex items-center gap-2 w-full">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-card-hover hover:bg-card-hover rounded-lg text-primary-text text-sm font-medium transition-colors">
                    <Play className="w-3.5 h-3.5" />
                    Study
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
