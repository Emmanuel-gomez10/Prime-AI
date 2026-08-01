import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Loader2, CheckCircle2, ChevronRight, Camera, X, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import Markdown from 'markdown-to-jsx';

import { primeEngine } from '../../../lib/primeAiEngine';
import { useWorkspace } from '../../../contexts/WorkspaceContext';

interface Solution {
  id: string;
  imageUrl: string;
  date: string;
  problemSummary: string;
  fullMarkdownSolution: string;
  finalAnswer: string;
}

export const ImageSolverView = () => {
  const { sendMessage, createNewThread } = useWorkspace();
  const [history, setHistory] = useState<Solution[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSolution, setActiveSolution] = useState<Solution | null>(null);
  
  // Camera Modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('prime_image_solutions_v2');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved image solutions:", e);
      }
    }
  }, []);

  const saveHistory = (items: Solution[]) => {
    setHistory(items);
    localStorage.setItem('prime_image_solutions_v2', JSON.stringify(items));
  };

  // Camera Management
  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      alert("Unable to access camera. Please check browser permissions.");
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      closeCamera();
      processImageBase64(dataUrl, 'captured_photo.jpg');
    }
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
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      processImageBase64(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const processImageBase64 = async (base64Data: string, filename: string) => {
    setCurrentImage(base64Data);
    setIsAnalyzing(true);
    setActiveSolution(null);

    try {
      const prompt = `Inspect this homework problem / image carefully:
1. State the recognized question or problem statement clearly under "### Problem Statement".
2. Provide a clear, step-by-step logical, mathematical, or scientific explanation under "### Step-by-Step Solution".
3. At the VERY END, under a dedicated header titled "### Final Answer", state ONLY the precise final answer clearly.`;

      const { stream } = await primeEngine.generateStream({
        mode: 'image-solver',
        userPrompt: prompt,
        attachments: [
          {
            name: filename,
            type: 'image',
            content: `[Image Problem: ${filename}]`,
            base64: base64Data,
          },
        ],
      });

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
      }

      // Extract final answer section
      let finalAns = 'Answer derived in solution above';
      const finalAnsIndex = fullText.indexOf('### Final Answer');
      if (finalAnsIndex !== -1) {
        finalAns = fullText.substring(finalAnsIndex + '### Final Answer'.length).trim();
      }

      // Extract problem summary
      let probSummary = filename;
      const probIndex = fullText.indexOf('### Problem Statement');
      if (probIndex !== -1) {
        const stepIndex = fullText.indexOf('### Step-by-Step Solution');
        if (stepIndex !== -1) {
          probSummary = fullText.substring(probIndex + '### Problem Statement'.length, stepIndex).trim();
        }
      }

      const solutionObj: Solution = {
        id: Date.now().toString(),
        imageUrl: base64Data,
        date: new Date().toLocaleDateString(),
        problemSummary: probSummary.slice(0, 120),
        fullMarkdownSolution: fullText,
        finalAnswer: finalAns,
      };

      const updated = [solutionObj, ...history];
      saveHistory(updated);
      setActiveSolution(solutionObj);
    } catch (err: any) {
      console.error("Image solver processing failed:", err);
      alert(`Failed to solve image problem: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteSolution = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveHistory(updated);
    if (activeSolution?.id === id) {
      setActiveSolution(null);
      setCurrentImage(null);
    }
  };

  const askTutorFollowup = (solution: Solution) => {
    createNewThread();
    sendMessage(`I used the Image Solver for this problem: "${solution.problemSummary}". Can you explain it further to me?`);
  };

  const resetView = () => {
    setCurrentImage(null);
    setActiveSolution(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-6 flex flex-col h-full overflow-hidden">
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-text mb-1 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" /> Image & Assignment Solver
          </h2>
          <p className="text-secondary-text text-[14px]">Snap or upload homework problems, equations, or diagrams for step-by-step solutions.</p>
        </div>
        {(currentImage || activeSolution) && (
          <button 
            onClick={resetView}
            className="px-4 py-2 bg-card-hover hover:bg-white/15 text-primary-text rounded-xl font-medium transition-colors text-xs sm:text-sm border border-divider flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Solve Another
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        {!currentImage && !activeSolution ? (
          <>
            {/* Upload & Camera Buttons */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-[24px] p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all ${
                isDragging ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_40px_rgba(250,204,21,0.2)]' : 'border-divider bg-card-hover hover:border-yellow-400/40'
              } mb-8 min-h-[260px]`}
            >
              <input 
                type="file" 
                className="hidden" 
                id="solver-image-upload" 
                accept="image/*"
                onChange={handleFileInputChange}
              />
              
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-4 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.15)]">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-primary-text mb-1">Snap a photo or upload an image</h3>
              <p className="text-secondary-text text-[13px] mb-6">Supports JPG, PNG, WebP math or text problems</p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                  onClick={openCamera}
                  className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 rounded-full text-sm font-semibold transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:scale-105 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Open Camera
                </button>
                <label 
                  htmlFor="solver-image-upload"
                  className="px-6 py-2.5 bg-surface hover:bg-card-hover border border-divider text-primary-text rounded-full text-sm font-semibold transition-all cursor-pointer hover:scale-105"
                >
                  Browse Files
                </label>
              </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-primary-text mb-3">Recent Solved Problems</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setCurrentImage(item.imageUrl);
                        setActiveSolution(item);
                      }}
                      className="p-4 rounded-[20px] border border-divider bg-surface hover:border-yellow-400/30 transition-all flex gap-4 cursor-pointer group"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-divider">
                        <img src={item.imageUrl} alt="Math problem" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <p className="text-secondary-text text-[11px]">{item.date}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSolution(item.id);
                            }}
                            className="text-secondary-text hover:text-red-400 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-primary-text font-medium text-xs line-clamp-2">{item.problemSummary}</p>
                        <div className="flex items-center text-yellow-400 text-xs font-medium gap-1">
                          View Solution <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-yellow-400/60 relative shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                <img src={currentImage!} alt="Analyzing" className="w-full h-full object-cover" />
                <motion.div 
                  className="absolute inset-0 bg-yellow-400/20 border-b-2 border-yellow-400"
                  initial={{ top: "-100%" }}
                  animate={{ top: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </div>
            </div>
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mb-3" />
            <h3 className="text-xl font-semibold text-primary-text mb-1">Solving Problem with Prime AI...</h3>
            <p className="text-secondary-text text-xs">Inspecting image details, formulas, and generating step-by-step reasoning...</p>
          </div>
        ) : activeSolution && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Image Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-0 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-divider bg-black/60 shadow-lg">
                  <img src={activeSolution.imageUrl} alt="Problem" className="w-full h-auto object-contain max-h-[350px]" />
                </div>
                
                <button
                  onClick={() => askTutorFollowup(activeSolution)}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary/10 border border-primary/30 text-primary-text font-medium text-xs hover:bg-primary/20 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-primary" /> Ask AI Tutor About This Solution
                </button>
              </div>
            </div>

            {/* Right Column: Solution Steps & Highlighted Final Answer */}
            <div className="lg:col-span-2">
              <div className="bg-surface border border-divider rounded-[24px] p-6 sm:p-8 shadow-xl flex flex-col space-y-6">
                <div className="flex items-center justify-between border-b border-divider pb-4">
                  <h3 className="text-lg font-bold text-primary-text flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Verified AI Solution
                  </h3>
                  <span className="text-xs text-secondary-text font-medium">{activeSolution.date}</span>
                </div>

                {/* Markdown Solution */}
                <div className="prose prose-invert max-w-none text-primary-text text-sm leading-relaxed">
                  <Markdown>{activeSolution.fullMarkdownSolution}</Markdown>
                </div>

                {/* Dedicated Highlighted Final Answer Box */}
                <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 shadow-lg">
                  <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Final Answer Box
                  </h4>
                  <div className="text-emerald-300 font-semibold text-lg sm:text-xl leading-snug">
                    <Markdown>{activeSolution.finalAnswer}</Markdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Camera Capture Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg bg-surface border border-divider rounded-3xl overflow-hidden flex flex-col items-center">
              <div className="w-full p-4 flex items-center justify-between border-b border-divider">
                <h3 className="text-sm font-semibold text-primary-text flex items-center gap-2">
                  <Camera className="w-4 h-4 text-yellow-400" /> Snap Homework Problem
                </h3>
                <button onClick={closeCamera} className="text-secondary-text hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full aspect-[4/3] bg-black relative flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>

              <div className="p-4 w-full flex items-center justify-center gap-4">
                <button 
                  onClick={capturePhoto}
                  className="px-8 py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(250,204,21,0.4)] transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" /> Capture & Solve
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

