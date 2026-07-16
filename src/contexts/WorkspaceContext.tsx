import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

type ViewType = 'home' | 'chat' | 'flashcards' | 'notes' | 'study-fetch' | 'image-solver' | 'past-questions' | 'planner' | 'progress' | 'settings' | 'profile' | 'essay-writer';

interface WorkspaceContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  messages: Message[];
  isTyping: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load chat history from local storage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('prime_chat_history');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
      // If we have history, show chat instead of home by default
      setActiveView('chat');
    }
  }, []);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('prime_chat_history', JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('prime_chat_history');
    setActiveView('home');
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Switch to chat view if not already
    setActiveView('chat');

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      // Get the Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); // Publicly supported standard model

      // Convert our message history to Gemini's format
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Start a chat session with history
      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        },
      });

      // Send the new message with streaming
      const result = await chat.sendMessageStream(text);

      const msgId = (Date.now() + 1).toString();
      const newModelMsg: Message = {
        id: msgId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newModelMsg]);
      setIsTyping(false); // Stop typing indicator when stream starts

      let fullResponse = '';
      for await (const chunk of result.stream) {
        fullResponse += chunk.text();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === msgId ? { ...msg, content: fullResponse } : msg
          )
        );
      }
    } catch (error: any) {
      console.error("Failed to generate AI response:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `I encountered an error: ${error?.message || 'Unknown error'}. Key prefix: ${import.meta.env.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY.substring(0, 4) : 'MISSING'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <WorkspaceContext.Provider value={{
      activeView,
      setActiveView,
      messages,
      isTyping,
      sendMessage,
      clearHistory
    }}>
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
