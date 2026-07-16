import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Upload, X, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface Solution {
  id: string;
  imageUrl: string;
  date: string;
  problem: string;
  steps: { description: string; math?: string }[];
  answer: string;
}

export const ImageSolverView = () => {
  const [history, setHistory] = useState<Solution[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSolution, setActiveSolution] = useState<Solution | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('prime_solutions');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveHistory = (items: Solution[]) => {
    setHistory(items);
    localStorage.setItem('prime_solutions', JSON.stringify(items));
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
      processImage(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImage(e.target.files[0]);
    }
  };

  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCurrentImage(result);
      setIsAnalyzing(true);
      setActiveSolution(null);
      
      // Simulate AI Analysis
      setTimeout(() => {
        const mockSolution: Solution = {
          id: Date.now().toString(),
          imageUrl: result,
          date: new Date().toLocaleDateString(),
          problem: "\\int_{0}^{\\infty} x^2 e^{-x} dx",
          steps: [
            { description: "Identify the integral type. This is a Gamma function integral of the form:", math: "\\int_{0}^{\\infty} x^{n-1} e^{-x} dx = \\Gamma(n)" },
            { description: "Match the parameters with our problem. We have $x^2$, so $n-1 = 2$, which means $n = 3$." },
            { description: "Evaluate the Gamma function for integer $n$.", math: "\\Gamma(3) = (3-1)! = 2!" },
            { description: "Calculate the factorial.", math: "2! = 2 \\times 1 = 2" }
          ],
          answer: "2"
        };
        
        setIsAnalyzing(false);
        setActiveSolution(mockSolution);
        saveHistory([mockSolution, ...history]);
      }, 3000);
    };
    reader.readAsDataURL(file);
  };

  const resetView = () => {
    setCurrentImage(null);
    setActiveSolution(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col h-full overflow-hidden">
      <div className="mb-8 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary-text mb-2 tracking-tight">Image Solver</h2>
          <p className="text-secondary-text text-[15px]">Snap a photo of any math problem, chemistry equation, or physics question for instant step-by-step solutions.</p>
        </div>
        {(currentImage || activeSolution) && (
          <button 
            onClick={resetView}
            className="px-4 py-2 bg-card-hover hover:bg-white/15 text-primary-text rounded-lg font-medium transition-colors text-sm"
          >
            Solve Another
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        
        {!currentImage && !activeSolution ? (
          <>
            {/* Upload Area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center text-center transition-all ${
                isDragging ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_40px_rgba(250,204,21,0.2)]' : 'border-divider bg-card-hover hover:bg-card-hover'
              } mb-10 min-h-[300px]`}
            >
              <input 
                type="file" 
                className="hidden" 
                id="image-upload" 
                accept="image/*"
                onChange={handleFileSelect}
              />
              
              <div className="w-20 h-20 rounded-full bg-yellow-400/10 flex items-center justify-center mb-5">
                <ImageIcon className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">Upload or drop an image</h3>
              <p className="text-secondary-text text-[14px] mb-8">JPG, PNG, WebP up to 10MB</p>
              <label 
                htmlFor="image-upload"
                className="px-8 py-3 bg-white hover:bg-white/90 text-[#0A0D14] rounded-full font-semibold transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Choose Image
              </label>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-primary-text mb-4">Recent Solutions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setCurrentImage(item.imageUrl);
                        setActiveSolution(item);
                      }}
                      className="p-4 rounded-[20px] border border-divider bg-surface hover:border-divider transition-all flex gap-4 cursor-pointer group"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/50 shrink-0">
                        <img src={item.imageUrl} alt="Math problem" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1 min-w-0 py-1 flex flex-col">
                        <p className="text-secondary-text text-xs mb-2">{item.date}</p>
                        <div className="text-primary-text font-medium text-sm truncate mb-auto">
                          <InlineMath math={item.problem} />
                        </div>
                        <div className="flex items-center text-primary text-xs font-medium gap-1 mt-2">
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
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative mb-8">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary/50 relative">
                <img src={currentImage!} alt="Analyzing" className="w-full h-full object-cover" />
                <motion.div 
                  className="absolute inset-0 bg-primary/20 border-b-2 border-primary"
                  initial={{ top: "-100%" }}
                  animate={{ top: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </div>
            </div>
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-primary-text mb-2">Extracting Math...</h3>
            <p className="text-secondary-text">Our AI is analyzing your image and generating a step-by-step solution.</p>
          </div>
        ) : activeSolution && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Image Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-0">
                <h3 className="text-primary-text font-medium mb-3">Original Image</h3>
                <div className="rounded-2xl overflow-hidden border border-divider bg-black/50">
                  <img src={activeSolution.imageUrl} alt="Problem" className="w-full h-auto object-contain" />
                </div>
                
                <div className="mt-6 p-5 rounded-2xl bg-card-hover border border-divider">
                  <h4 className="text-secondary-text text-xs font-semibold uppercase tracking-wider mb-3">Recognized Problem</h4>
                  <div className="text-primary-text text-lg overflow-x-auto scrollbar-hide py-2">
                    <BlockMath math={activeSolution.problem} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Solution Steps */}
            <div className="lg:col-span-2">
              <div className="bg-surface border border-divider rounded-[24px] p-6 lg:p-8">
                <h3 className="text-xl font-bold text-primary-text mb-6 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  Step-by-Step Solution
                </h3>
                
                <div className="space-y-6">
                  {activeSolution.steps.map((step, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      key={idx} 
                      className="flex gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-card-hover border border-divider flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-secondary-text text-sm font-medium">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-primary-text leading-relaxed mb-3 text-[15px]">
                          {/* Basic markdown style replacer for inline math in description */}
                          {step.description.split(/(\$.*?\$)/g).map((part, i) => {
                            if (part.startsWith('$') && part.endsWith('$')) {
                              return <InlineMath key={i} math={part.slice(1, -1)} />;
                            }
                            return part;
                          })}
                        </p>
                        {step.math && (
                          <div className="p-4 rounded-xl bg-background border border-divider overflow-x-auto scrollbar-hide">
                            <BlockMath math={step.math} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: activeSolution.steps.length * 0.15 + 0.2 }}
                  className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <h4 className="text-emerald-400/80 text-xs font-semibold uppercase tracking-wider mb-2">Final Answer</h4>
                  <div className="text-emerald-400 text-2xl font-bold">
                    <BlockMath math={activeSolution.answer} />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
