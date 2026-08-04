import { 
  HelpCircle, Image as ImageIcon, Plus, Mic, ArrowRight, Search, FileText, 
  Upload, BookOpen, PenTool, Lightbulb, Copy, RefreshCw, Trash2, Check, File, MicOff, Paperclip, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';
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
import { QuizGeneratorView } from './views/QuizGeneratorView';
import { PastQuestionsView } from './views/PastQuestionsView';
import { ProfileView } from './views/ProfileView';

const PILL_BUTTONS = [
  { icon: BookOpen, label: 'Explain Concept', prompt: 'Explain Quantum Physics in simple terms' },
  { icon: FileText, label: 'Summarize Notes', prompt: 'Summarize my lecture notes with key bullet points' },
  { icon: Search, label: 'Research Paper', prompt: 'How do I structure an academic literature review?' },
  { icon: PenTool, label: 'Solve Problem', prompt: 'Step-by-step calculus integration example' },
  { icon: Lightbulb, label: 'Study Flashcards', prompt: 'Create 5 flashcards for organic chemistry' },
];

const FEATURE_CARDS = [
  { icon: HelpCircle, title: 'AI Tutor', desc: 'Interactive chat & step-by-step answers', color: 'text-blue-400', bg: 'bg-blue-500/10', view: 'chat' },
  { icon: Upload, title: 'Study Fetch', desc: 'Upload documents & PDFs for AI summary', color: 'text-emerald-400', bg: 'bg-emerald-500/10', view: 'study-fetch' },
  { icon: ImageIcon, title: 'Image Solver', desc: 'Snap or upload photo to solve homework', color: 'text-yellow-400', bg: 'bg-yellow-500/10', view: 'image-solver' },
  { icon: PenTool, title: 'Essay Writer', desc: 'Draft, edit & outline essays', color: 'text-purple-400', bg: 'bg-purple-500/10', view: 'essay-writer' },
];

export const MainWorkspace = () => {
  const { user } = useAuth();
  const username = user?.email?.split('@')[0] || 'Student';
  
  const { 
    activeView, 
    setActiveView, 
    messages, 
    isTyping, 
    sendMessage, 
    deleteMessage,
    regenerateLastMessage,
    createNewThread
  } = useWorkspace();
  
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeView]);

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      
      {/* Dynamic Content Area */}
      <div className={`flex-1 w-full overflow-y-auto scroll-smooth flex flex-col ${
        activeView === 'home' 
          ? 'max-w-4xl mx-auto px-4 lg:px-8 py-8 lg:py-12 items-center justify-center scrollbar-hide' 
          : activeView === 'chat' 
            ? 'px-4 sm:px-8 lg:px-12 pt-6 pb-36 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent' 
            : 'max-w-4xl mx-auto px-4 lg:px-8 pt-6 pb-24 scrollbar-hide'
      }`}>
        
        {activeView === 'home' ? (
          <>
            {/* Welcome State */}
            <div className="text-center mb-8 flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-text mb-3 tracking-tight">Goodday {username} 👋</h2>
              <p className="text-secondary-text text-[15px] sm:text-[16px] font-medium tracking-wide">Ask Prime AI anything, upload a document, or select a suggested prompt.</p>
            </div>

            <div className="w-full mb-8">
              <InputBar 
                inputText={inputText} 
                setInputText={setInputText} 
                handleKeyDown={handleKeyDown} 
                handleSend={handleSend} 
                isTyping={isTyping} 
              />
            </div>

            {/* Suggested Prompt Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 w-full">
              {PILL_BUTTONS.map((btn, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    createNewThread();
                    sendMessage(btn.prompt);
                  }}
                  whileHover={{ y: -1, backgroundColor: "rgba(255,255,255,0.08)" }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-primary/40 transition-all shadow-sm group"
                >
                  <btn.icon className="w-3.5 h-3.5 text-secondary-text group-hover:text-primary transition-colors" />
                  <span className="text-primary-text text-[13px] font-medium">{btn.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {FEATURE_CARDS.map((card, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setActiveView(card.view as any)}
                  whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.04)" }}
                  className="flex flex-col text-left p-5 rounded-[20px] bg-background border border-white/[0.08] hover:border-primary/30 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-xl min-h-[140px]"
                >
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-inner`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <h4 className="text-primary-text font-semibold text-[15px] mb-1">{card.title}</h4>
                  <p className="text-secondary-text text-[12px] leading-relaxed font-medium">{card.desc}</p>
                </motion.button>
              ))}
            </div>
          </>
        ) : activeView === 'chat' ? (
          <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto min-h-full">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-primary-text mb-2">Prime AI Tutor Workspace</h3>
                <p className="text-secondary-text text-sm max-w-md mb-6">Ask any academic question, upload lecture materials, or request step-by-step problem solutions.</p>
              </div>
            ) : (
              <div className="space-y-6 w-full pb-6">
                {messages.map((msg, idx) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Attachments preview */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-white/[0.08] text-xs text-primary-text">
                            <Paperclip className="w-3.5 h-3.5 text-primary" />
                            <span className="font-medium truncate max-w-[180px]">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`group relative rounded-2xl px-6 py-4 text-[15px] leading-relaxed w-full sm:max-w-[85%] lg:max-w-[88%] shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-text rounded-br-none ml-auto'
                        : 'bg-surface/80 border border-white/[0.08] text-primary-text rounded-bl-none backdrop-blur-md'
                    }`}>
                      {msg.role === 'model' ? (
                        <div className="prose prose-invert max-w-none text-primary-text text-[15px] leading-relaxed">
                          <Markdown>{msg.content || '...'}</Markdown>
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      )}

                      {/* Action Bar */}
                      <div className={`mt-2.5 flex items-center gap-3 pt-2 border-t border-white/[0.08] text-xs text-secondary-text ${
                        msg.role === 'user' ? 'justify-end text-primary-text/70' : 'justify-between'
                      }`}>
                        <span className="text-[11px]">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="hover:text-primary-text p-1 rounded transition-colors"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          
                          {msg.role === 'model' && idx === messages.length - 1 && (
                            <button
                              onClick={regenerateLastMessage}
                              className="hover:text-primary-text p-1 rounded transition-colors"
                              title="Regenerate response"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="hover:text-red-400 p-1 rounded transition-colors"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="flex gap-4 mb-6 justify-start">
                <div className="py-2 px-4 rounded-xl bg-surface border border-white/[0.08] text-secondary-text flex items-center gap-2 h-10">
                  <span className="text-xs font-medium">Prime AI is thinking</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4 shrink-0" />
          </div>
        ) : activeView === 'study-fetch' ? (
          <StudyFetchView />
        ) : activeView === 'image-solver' ? (
          <ImageSolverView />
        ) : activeView === 'flashcards' ? (
          <FlashcardsView />
        ) : activeView === 'quiz' ? (
          <QuizGeneratorView />
        ) : activeView === 'past-questions' ? (
          <PastQuestionsView />
        ) : activeView === 'notes' ? (
          <NotesView />
        ) : activeView === 'planner' ? (
          <PlannerView />
        ) : activeView === 'progress' ? (
          <ProgressView />
        ) : activeView === 'settings' ? (
          <SettingsView />
        ) : activeView === 'profile' ? (
          <ProfileView />
        ) : activeView === 'essay-writer' ? (
          <EssayWriterView />
        ) : (
          <PlaceholderView 
            title={(activeView as string).split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} 
            description={`The ${(activeView as string).replace('-', ' ')} feature is currently under construction. Check back soon!`}
          />
        )}
      </div>
      
      {/* Fixed Input Bar for Chat View */}
      {activeView === 'chat' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/95 to-transparent pt-8 pb-6 px-4 z-30">
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

const InputBar = ({ inputText, setInputText, handleKeyDown, handleSend, isTyping }: InputBarProps) => {
  const { activeAttachments, attachFile, removeAttachment, isListening, toggleVoiceInput } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      attachFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full relative z-20">
      {/* Attachments preview tray */}
      <AnimatePresence>
        {activeAttachments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-surface/90 border border-divider backdrop-blur-md"
          >
            {activeAttachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card-hover border border-divider text-xs text-primary-text">
                <File className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium truncate max-w-[150px]">{att.name}</span>
                <button onClick={() => removeAttachment(idx)} className="text-secondary-text hover:text-red-400 p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative bg-surface/95 backdrop-blur-2xl border border-divider rounded-[28px] p-2 sm:p-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.4)] focus-within:border-primary/50 transition-all flex flex-col sm:flex-row sm:items-end gap-2">
        <div className="flex items-end gap-1.5 sm:gap-2 w-full">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.docx,.txt,image/*"
          />

          {/* Attachment Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-card-hover transition-colors shrink-0"
            title="Attach file or image"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Input Field */}
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or attach a file..."
            className="flex-1 max-h-[180px] min-h-[40px] sm:min-h-[44px] bg-transparent border-none outline-none text-primary-text text-[14px] sm:text-[15px] resize-none py-2.5 sm:py-3 placeholder:text-primary-text/30 scrollbar-hide font-medium"
            rows={1}
          />

          {/* Voice & Send Buttons */}
          <div className="flex items-center gap-1.5 pb-0.5 sm:pb-1 pr-0.5 sm:pr-1 shrink-0">
            <button 
              onClick={toggleVoiceInput}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'text-secondary-text hover:text-primary-text hover:bg-card-hover'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleSend}
              disabled={isTyping}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-text hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 disabled:opacity-50 min-h-[40px] min-w-[40px]"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2.5">
        <p className="text-[11px] text-primary-text/30 font-medium tracking-wide">Prime AI can make mistakes. Verify important information.</p>
      </div>
    </div>
  );
};


