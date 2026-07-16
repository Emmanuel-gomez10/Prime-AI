import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Download, Copy, Share2, Sparkles, RefreshCw, Type, AlignLeft } from 'lucide-react';

export const EssayWriterView = () => {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState('Medium');
  const [tone, setTone] = useState('Academic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [essayContent, setEssayContent] = useState('');

  const handleGenerate = () => {
    if (!topic) return;
    setIsGenerating(true);
    
    // Mocking an AI generation delay
    setTimeout(() => {
      setEssayContent(`Title: ${topic}\n\nIntroduction:\nThe exploration of ${topic} reveals a complex intersection of historical context and modern interpretation. As we delve into this subject, it becomes evident that its impact resonates across various domains, challenging our preconceived notions and offering new paradigms for understanding.\n\nBody Paragraph 1:\nInitially, the primary consideration when examining ${topic} is its foundational elements. These elements serve as the bedrock for more intricate theories that have evolved over time. By analyzing the core components, we can better appreciate the nuances that characterize the broader discourse.\n\nBody Paragraph 2:\nFurthermore, the evolution of ${topic} has been marked by significant milestones that have redefined its trajectory. Key figures and pivotal moments have continuously shaped its development, illustrating a dynamic process of growth and adaptation. This historical progression is crucial for contextualizing its current state.\n\nConclusion:\nIn conclusion, ${topic} is not merely an abstract concept but a living, evolving entity with profound implications. As we continue to study and interact with it, we uncover deeper layers of meaning that enrich our collective knowledge. Future research will undoubtedly continue to illuminate its complexities, ensuring its relevance for generations to come.`);
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 h-full flex flex-col md:flex-row gap-6 overflow-hidden">
      
      {/* Sidebar: Configuration */}
      <div className="w-full md:w-[340px] shrink-0 flex flex-col h-full bg-surface rounded-[24px] border border-divider overflow-y-auto scrollbar-hide">
        <div className="p-6 border-b border-divider">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <PenTool className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-primary-text tracking-tight">Essay Writer</h2>
          </div>
          <p className="text-sm text-secondary-text font-medium">Draft and perfect your essays with AI.</p>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary-text flex items-center gap-2">
              <Type className="w-4 h-4 text-secondary-text" />
              Topic or Prompt
            </label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The impact of artificial intelligence on modern education..."
              className="w-full bg-card-hover border border-divider rounded-xl p-3 text-sm text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none min-h-[100px]"
            />
          </div>

          {/* Length Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-primary-text flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-secondary-text" />
              Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Short', 'Medium', 'Long'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`py-2 px-1 text-[13px] font-medium rounded-lg transition-all ${
                    length === l 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'bg-card-hover text-secondary-text border border-transparent hover:text-primary-text'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-primary-text">Tone & Style</label>
            <div className="grid grid-cols-2 gap-2">
              {['Academic', 'Persuasive', 'Narrative', 'Analytical'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`py-2 px-2 text-[13px] font-medium rounded-lg transition-all ${
                    tone === t 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'bg-card-hover text-secondary-text border border-transparent hover:text-primary-text'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-divider shrink-0">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className="w-full py-3.5 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-purple-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Draft
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content: Editor Viewer */}
      <div className="flex-1 flex flex-col h-full bg-surface rounded-[24px] border border-divider overflow-hidden relative">
        <div className="shrink-0 p-4 border-b border-divider flex items-center justify-between bg-surface/95 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-secondary-text hover:text-primary-text hover:bg-card-hover transition-colors">
              Format
            </button>
            <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-secondary-text hover:text-primary-text hover:bg-card-hover transition-colors">
              Tools
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-lg bg-card-hover hover:bg-card-hover text-secondary-text hover:text-primary-text transition-colors"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-lg bg-card-hover hover:bg-card-hover text-secondary-text hover:text-primary-text transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-lg bg-card-hover hover:bg-card-hover text-secondary-text hover:text-primary-text transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-10">
          <div className="max-w-3xl mx-auto h-full">
            {essayContent || isGenerating ? (
              <textarea
                value={essayContent}
                onChange={(e) => setEssayContent(e.target.value)}
                placeholder={isGenerating ? "AI is crafting your essay..." : "Start typing..."}
                className="w-full h-full bg-transparent resize-none border-none outline-none text-primary-text text-[15px] leading-relaxed placeholder:text-primary-text/20 font-medium"
                readOnly={isGenerating}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <div className="w-16 h-16 rounded-2xl bg-card-hover flex items-center justify-center mb-4">
                  <PenTool className="w-8 h-8 text-primary-text/40" />
                </div>
                <h3 className="text-xl font-bold text-primary-text mb-2">Editor Ready</h3>
                <p className="text-secondary-text max-w-sm text-sm">
                  Provide a topic on the left to generate an AI draft, or start writing your essay from scratch here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
