import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { primeEngine } from '../lib/primeAiEngine';
import type { FileAttachment } from '../lib/primeAiEngine';
import { processFileClientSide } from '../lib/documentProcessor';
import { dbService } from '../services/db/databaseService';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachments?: FileAttachment[];
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export type ViewType = 
  | 'home' 
  | 'chat' 
  | 'flashcards' 
  | 'quiz'
  | 'notes' 
  | 'study-fetch' 
  | 'image-solver' 
  | 'past-questions' 
  | 'planner' 
  | 'progress' 
  | 'settings' 
  | 'profile' 
  | 'essay-writer';

interface WorkspaceContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  threads: ConversationThread[];
  activeThreadId: string | null;
  messages: Message[];
  isTyping: boolean;
  activeAttachments: FileAttachment[];
  isListening: boolean;
  // Actions
  sendMessage: (text: string, attachments?: FileAttachment[]) => Promise<void>;
  attachFile: (file: File) => Promise<void>;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  createNewThread: () => string;
  switchThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  deleteMessage: (messageId: string) => void;
  regenerateLastMessage: () => Promise<void>;
  toggleVoiceInput: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = 'prime_ai_threads_v2';
const ACTIVE_THREAD_KEY = 'prime_ai_active_thread_id';

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [activeAttachments, setActiveAttachments] = useState<FileAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize browser speech recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const sr = new SpeechRecognition();
        sr.continuous = false;
        sr.interimResults = false;
        sr.lang = 'en-US';

        sr.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            sendMessage(transcript);
          }
          setIsListening(false);
        };

        sr.onerror = () => setIsListening(false);
        sr.onend = () => setIsListening(false);

        setRecognition(sr);
      }
    }
  }, []);

  // Load threads from Supabase DB or LocalStorage
  useEffect(() => {
    const loadUserThreads = async () => {
      if (user?.id) {
        const dbThreads = await dbService.fetchUserThreads(user.id);
        if (dbThreads && dbThreads.length > 0) {
          setThreads(dbThreads);
          const savedActiveId = localStorage.getItem(ACTIVE_THREAD_KEY);
          if (savedActiveId && dbThreads.some((t) => t.id === savedActiveId)) {
            setActiveThreadId(savedActiveId);
          } else {
            setActiveThreadId(dbThreads[0].id);
          }
          return;
        }
      }

      // Local storage fallback
      const savedThreads = localStorage.getItem(STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_THREAD_KEY);

      if (savedThreads) {
        try {
          const parsed: ConversationThread[] = JSON.parse(savedThreads);
          setThreads(parsed);
          if (savedActiveId && parsed.some((t) => t.id === savedActiveId)) {
            setActiveThreadId(savedActiveId);
          } else if (parsed.length > 0) {
            setActiveThreadId(parsed[0].id);
          }
        } catch (e) {
          console.error("Failed to parse saved threads:", e);
        }
      }
    };

    loadUserThreads();
  }, [user]);

  // Sync threads state to local storage & DB
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [threads]);

  useEffect(() => {
    if (activeThreadId) {
      localStorage.setItem(ACTIVE_THREAD_KEY, activeThreadId);
    } else {
      localStorage.removeItem(ACTIVE_THREAD_KEY);
    }
  }, [activeThreadId]);

  // Active thread's messages
  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThread ? activeThread.messages : [];

  // Helper to create a new thread
  const createNewThread = useCallback(() => {
    const newId = Date.now().toString();
    const newThread: ConversationThread = {
      id: newId,
      title: 'New Study Session',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);

    if (user?.id) {
      dbService.createThread(user.id, 'New Study Session').then((res) => {
        if (res?.id) {
          setThreads((prev) => prev.map((t) => (t.id === newId ? { ...t, id: res.id } : t)));
          setActiveThreadId(res.id);
        }
      });
    }

    return newId;
  }, [user]);

  const switchThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setActiveView('chat');
  };

  const deleteThread = (threadId: string) => {
    if (user?.id) {
      dbService.deleteThread(threadId);
    }
    setThreads((prev) => {
      const filtered = prev.filter((t) => t.id !== threadId);
      if (activeThreadId === threadId) {
        setActiveThreadId(filtered.length > 0 ? filtered[0].id : null);
        if (filtered.length === 0) {
          setActiveView('home');
        }
      }
      return filtered;
    });
  };

  const deleteMessage = (messageId: string) => {
    if (!activeThreadId) return;
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== activeThreadId) return thread;
        return {
          ...thread,
          messages: thread.messages.filter((m) => m.id !== messageId),
          updatedAt: Date.now(),
        };
      })
    );
  };

  const attachFile = async (file: File) => {
    try {
      const processed = await processFileClientSide(file);
      setActiveAttachments((prev) => [...prev, processed]);
    } catch (err) {
      console.error("Failed to attach file client-side:", err);
    }
  };

  const removeAttachment = (index: number) => {
    setActiveAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAttachments = () => {
    setActiveAttachments([]);
  };

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  const sendMessage = async (text: string, attachmentsOverride?: FileAttachment[]) => {
    if (!text.trim() && (!attachmentsOverride || attachmentsOverride.length === 0) && activeAttachments.length === 0) return;

    let currentThreadId = activeThreadId;
    // Create new thread if none exists
    if (!currentThreadId || !threads.some(t => t.id === currentThreadId)) {
      currentThreadId = createNewThread();
    }

    const attachmentsToSend = attachmentsOverride || [...activeAttachments];
    clearAttachments();

    // Generate dynamic thread title from first query
    const firstTitle = text.slice(0, 30) || (attachmentsToSend[0] ? attachmentsToSend[0].name : 'Study Session');

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachmentsToSend,
    };

    // Update state with user message
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== currentThreadId) return t;
        const isDefaultTitle = t.title === 'New Study Session';
        return {
          ...t,
          title: isDefaultTitle ? firstTitle : t.title,
          updatedAt: Date.now(),
          messages: [...t.messages, newUserMsg],
        };
      })
    );

    setActiveView('chat');
    setIsTyping(true);

    try {
      // Gather active message history
      const currentMessages = threads.find((t) => t.id === currentThreadId)?.messages || [];
      const history = [...currentMessages, newUserMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call Centralized Prime AI Engine
      const { stream } = await primeEngine.generateStream({
        mode: 'tutor',
        userPrompt: text,
        attachments: attachmentsToSend,
        history: history.slice(0, -1), // previous turns
      });

      const modelMsgId = (Date.now() + 1).toString();
      const newModelMsg: Message = {
        id: modelMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
      };

      // Append empty model message placeholder
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== currentThreadId) return t;
          return {
            ...t,
            updatedAt: Date.now(),
            messages: [...t.messages, newModelMsg],
          };
        })
      );

      setIsTyping(false);

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== currentThreadId) return t;
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === modelMsgId ? { ...m, content: fullText } : m
              ),
            };
          })
        );
      }

      // Persist to Supabase if logged in
      if (user?.id && currentThreadId) {
        dbService.saveMessage(user.id, currentThreadId, 'user', text, attachmentsToSend);
        dbService.saveMessage(user.id, currentThreadId, 'model', fullText);
      }
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      const errorMsgId = (Date.now() + 1).toString();
      const errorMsg: Message = {
        id: errorMsgId,
        role: 'model',
        content: `I encountered an issue processing your request: ${error?.message || 'Unknown error'}. Please verify your network connection or API key.`,
        timestamp: Date.now(),
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== currentThreadId) return t;
          return {
            ...t,
            messages: [...t.messages, errorMsg],
          };
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  const regenerateLastMessage = async () => {
    if (!activeThreadId) return;
    const currentMessages = messages;
    if (currentMessages.length === 0) return;

    // Find last user message
    const lastUserMsgIdx = [...currentMessages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserMsgIdx === -1) return;

    const userMsgIndex = currentMessages.length - 1 - lastUserMsgIdx;
    const userMsg = currentMessages[userMsgIndex];

    // Delete messages after last user message
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThreadId) return t;
        return {
          ...t,
          messages: t.messages.slice(0, userMsgIndex + 1),
        };
      })
    );

    // Re-send user prompt
    await sendMessage(userMsg.content, userMsg.attachments);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeView,
        setActiveView,
        threads,
        activeThreadId,
        messages,
        isTyping,
        activeAttachments,
        isListening,
        sendMessage,
        attachFile,
        removeAttachment,
        clearAttachments,
        createNewThread,
        switchThread,
        deleteThread,
        deleteMessage,
        regenerateLastMessage,
        toggleVoiceInput,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

