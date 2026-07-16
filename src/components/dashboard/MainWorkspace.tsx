import { HelpCircle, Image as ImageIcon, Plus, Mic, ArrowRight, Search, FileText, Upload, BookOpen, PenTool, Lightbulb, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { PlaceholderView } from './views/PlaceholderView';
import { StudyFetchView } from './views/StudyFetchView';
import { ImageSolverView } from './views/ImageSolverView';
import { FlashcardsView } from './views/FlashcardsView';
import { NotesView } from './views/NotesView';
import { PlannerView } from './views/PlannerView';
import { ProgressView } from './views/ProgressView';
import { SettingsView } from './views/SettingsView';
import { EssayWriterView } from './views/EssayWriterView';

const PILL_BUTTONS = [
  { icon: BookOpen, label: 'Study' },
  { icon: FileText, label: 'Summarize' },
  { icon: Search, label: 'Research' },
  { icon: PenTool, label: 'Solve' },
  { icon: Lightbulb, label: 'Flashcards' },
  { icon: BookOpen, label: 'Notes' },
];

const FEATURE_CARDS = [
  { icon: Upload, title: 'Upload', desc: 'Upload documents & PDFs', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: HelpCircle, title: 'AI Tutor', desc: 'Step-by-step guidance', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: ImageIcon, title: 'Image Solver', desc: 'Snap photo to solve', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: PenTool, title: 'Essay Writer', desc: 'Draft and edit essays', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export const MainWorkspace = () => {
  const { user } = useAuth();
  const username = user?.email?.split('@')[0] || 'Student';
  
  const { activeView, messages, isTyping, sendMessage } = useWorkspace();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeView]);


  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      
      {/* Dynamic Content Area */}
      <div className={`flex-1 w-full mx-auto px-4 lg:px-8 overflow-y-auto scrollbar-hide flex flex-col ${activeView === 'home' ? 'max-w-4xl items-center justify-center py-8 lg:py-12' : 'max-w-5xl pt-8 pb-40'}`}>
        
        {activeView === 'home' ? (
          <>
            {/* Welcome State */}
            <div className="text-center mb-8 flex flex-col items-center">
              <h2 className="text-4xl font-bold text-primary-text mb-3 tracking-tight">Goodday {username}👋</h2>
              <p className="text-secondary-text text-[16px] font-medium tracking-wide">Upload a document, snap a photo, or just start typing.</p>
            </div>

            <div className="w-full mb-10">
              <InputBar 
                inputText={inputText} 
                setInputText={setInputText} 
                handleKeyDown={handleKeyDown} 
                handleSend={handleSend} 
                isTyping={isTyping} 
              />
            </div>

        {/* Pill Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 w-full">
          {PILL_BUTTONS.map((btn, idx) => (
            <motion.button
              key={idx}
              whileHover={{ y: -1, backgroundColor: "rgba(255,255,255,0.08)" }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-divider hover:border-divider transition-all shadow-sm"
            >
              <btn.icon className="w-4 h-4 text-secondary-text" />
              <span className="text-primary-text text-[14px] font-medium">{btn.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {FEATURE_CARDS.map((card, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                if (card.title === 'Essay Writer') setActiveView('essay-writer');
              }}
              whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.04)" }}
              className="flex flex-col text-left p-5 rounded-[20px] bg-background border border-divider hover:border-divider transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-xl"
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-inner`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <h4 className="text-primary-text font-semibold text-[15px] mb-1.5">{card.title}</h4>
              <p className="text-secondary-text text-[13px] leading-relaxed font-medium">{card.desc}</p>
            </motion.button>
          ))}
        </div>

          </>
        ) : activeView === 'chat' ? (
          <div className="flex-1 flex flex-col w-full h-full">
            {/* Chat Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${
                  msg.role === 'user' 
                    ? 'px-5 py-3.5 max-w-2xl rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap bg-primary text-primary-text rounded-br-sm' 
                    : 'py-2 max-w-3xl text-[15px] leading-relaxed whitespace-pre-wrap text-primary-text'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4 mb-6 justify-start">
                  <div className="py-2 text-secondary-text flex items-center gap-1.5 h-12">
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : activeView === 'study-fetch' ? (
          <StudyFetchView />
        ) : activeView === 'image-solver' ? (
          <ImageSolverView />
        ) : activeView === 'flashcards' ? (
          <FlashcardsView />
        ) : activeView === 'notes' ? (
          <NotesView />
        ) : activeView === 'planner' ? (
          <PlannerView />
        ) : activeView === 'progress' ? (
          <ProgressView />
        ) : activeView === 'settings' ? (
          <SettingsView />
        ) : activeView === 'essay-writer' ? (
          <EssayWriterView />
        ) : (
          <PlaceholderView 
            title={activeView.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} 
            description={`The ${activeView.replace('-', ' ')} feature is currently under construction. Check back soon!`}
          />
        )}
      </div>
      
      {/* Fixed Input Bar for Chat View */}
      {activeView === 'chat' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/90 to-transparent pt-10 pb-6 px-4">
          <div className="max-w-4xl mx-auto">
            <InputBar 
              inputText={inputText} 
              setInputText={setInputText} 
              handleKeyDown={handleKeyDown} 
              handleSend={handleSend} 
              isTyping={isTyping} 
            />
          </div>
        </div>
      )}
      
    </div>
  );
};

interface InputBarProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleSend: () => void;
  isTyping: boolean;
}

const InputBar = ({ inputText, setInputText, handleKeyDown, handleSend, isTyping }: InputBarProps) => (
  <div className="w-full relative z-20">
    {/* Ambient background glow for input */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50px] bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

    <div className="relative bg-surface/90 backdrop-blur-2xl border border-divider rounded-[28px] p-2 sm:p-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.4)] focus-within:border-primary/40 focus-within:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all flex flex-col sm:flex-row sm:items-end gap-2">
      <div className="flex items-end gap-1 sm:gap-2 w-full">
        
        {/* Attachment Button */}
        <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-card-hover transition-colors shrink-0">
          <Plus className="w-5 h-5" />
        </button>

        {/* Input Field */}
        <textarea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything or upload a file..."
          className="flex-1 max-h-[200px] min-h-[40px] sm:min-h-[44px] bg-transparent border-none outline-none text-primary-text text-[14px] sm:text-[15px] resize-none py-2.5 sm:py-3 placeholder:text-primary-text/30 scrollbar-hide font-medium"
          rows={1}
        />

        {/* Right Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 pb-0.5 sm:pb-1 pr-0.5 sm:pr-1 shrink-0">
          <button className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-secondary-text hover:text-primary-text hover:bg-card-hover transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSend}
            disabled={isTyping}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-text hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:scale-105 disabled:opacity-50"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    
    <div className="text-center mt-4">
      <p className="text-[12px] text-primary-text/30 font-medium tracking-wide">Prime AI can make mistakes. Consider verifying important information.</p>
    </div>
  </div>
);

// Simple bot icon since we used one in the welcome state
const BotIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 8V4H8"/>
    <rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2"/>
    <path d="M20 14h2"/>
    <path d="M15 13v2"/>
    <path d="M9 13v2"/>
  </svg>
);
