import { supabase } from '../../lib/supabaseClient';

export interface DbThread {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  thread_id: string;
  user_id: string;
  role: 'user' | 'model';
  content: string;
  attachments?: any;
  created_at: string;
}

export interface DbStudyMaterial {
  id: string;
  user_id: string;
  name: string;
  size: string;
  summary: string;
  questions?: any;
  extracted_text?: string;
  created_at: string;
}

export interface DbNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface DbFlashcard {
  id: string;
  user_id: string;
  deck_title: string;
  front: string;
  back: string;
  ease_factor?: number;
  interval?: number;
  repetitions?: number;
  next_review?: string;
  created_at: string;
}

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // --- THREADS & MESSAGES ---
  public async fetchUserThreads(userId: string) {
    try {
      const { data: threads, error: threadErr } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (threadErr || !threads) return null;

      const fullThreads = await Promise.all(
        threads.map(async (t) => {
          const { data: msgs } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('thread_id', t.id)
            .order('created_at', { ascending: true });

          return {
            id: t.id,
            title: t.title,
            createdAt: new Date(t.created_at).getTime(),
            updatedAt: new Date(t.updated_at).getTime(),
            messages: (msgs || []).map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'model',
              content: m.content,
              timestamp: new Date(m.created_at).getTime(),
              attachments: m.attachments || [],
            })),
          };
        })
      );

      return fullThreads;
    } catch (e) {
      console.error('DatabaseService fetchUserThreads error:', e);
      return null;
    }
  }

  public async createThread(userId: string, title: string) {
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .insert({ user_id: userId, title })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService createThread error:', e);
      return null;
    }
  }

  public async updateThreadTitle(threadId: string, title: string) {
    try {
      await supabase.from('chat_threads').update({ title, updated_at: new Date().toISOString() }).eq('id', threadId);
    } catch (e) {
      console.error('DatabaseService updateThreadTitle error:', e);
    }
  }

  public async saveMessage(userId: string, threadId: string, role: 'user' | 'model', content: string, attachments?: any) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          thread_id: threadId,
          user_id: userId,
          role,
          content,
          attachments: attachments || [],
        })
        .select()
        .single();

      // Update thread timestamp
      await supabase.from('chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId);

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService saveMessage error:', e);
      return null;
    }
  }

  public async deleteThread(threadId: string) {
    try {
      await supabase.from('chat_threads').delete().eq('id', threadId);
    } catch (e) {
      console.error('DatabaseService deleteThread error:', e);
    }
  }

  // --- STUDY MATERIALS ---
  public async fetchStudyMaterials(userId: string) {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService fetchStudyMaterials error:', e);
      return null;
    }
  }

  public async saveStudyMaterial(userId: string, material: { name: string; size: string; summary: string; questions: any; extractedText?: string }) {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .insert({
          user_id: userId,
          name: material.name,
          size: material.size,
          summary: material.summary,
          questions: material.questions,
          extracted_text: material.extractedText || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService saveStudyMaterial error:', e);
      return null;
    }
  }

  public async deleteStudyMaterial(id: string) {
    try {
      await supabase.from('study_materials').delete().eq('id', id);
    } catch (e) {
      console.error('DatabaseService deleteStudyMaterial error:', e);
    }
  }

  // --- NOTES ---
  public async fetchNotes(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService fetchNotes error:', e);
      return null;
    }
  }

  public async saveNote(userId: string, note: { title: string; content: string; tags?: string[] }) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          title: note.title,
          content: note.content,
          tags: note.tags || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService saveNote error:', e);
      return null;
    }
  }

  // --- FLASHCARDS ---
  public async fetchFlashcards(userId: string) {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService fetchFlashcards error:', e);
      return null;
    }
  }

  public async saveFlashcard(userId: string, card: { deck_title: string; front: string; back: string }) {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          user_id: userId,
          deck_title: card.deck_title,
          front: card.front,
          back: card.back,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService saveFlashcard error:', e);
      return null;
    }
  }

  // --- QUIZ RESULTS ---
  public async fetchQuizResults(userId: string) {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService fetchQuizResults error:', e);
      return null;
    }
  }

  public async saveQuizResult(userId: string, quizResult: { quiz_title: string; score: number; total_questions: number; details?: any }) {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userId,
          quiz_title: quizResult.quiz_title,
          score: quizResult.score,
          total_questions: quizResult.total_questions,
          details: quizResult.details || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService saveQuizResult error:', e);
      return null;
    }
  }

  public async createSupportTicket(ticket: { user_id: string; student_name: string; email: string; subject: string; category: string; priority: string; message: string }) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: ticket.user_id,
          student_name: ticket.student_name,
          email: ticket.email,
          subject: ticket.subject,
          category: ticket.category,
          priority: ticket.priority,
          status: 'Open',
          message: ticket.message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService createSupportTicket error:', e);
      return null;
    }
  }

  public async fetchStudentTickets(userId: string) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('DatabaseService fetchStudentTickets error:', e);
      return [];
    }
  }

  public async deleteNote(id: string) {
    try {
      await supabase.from('notes').delete().eq('id', id);
    } catch (e) {
      console.error('DatabaseService deleteNote error:', e);
    }
  }

  public async deleteFlashcard(id: string) {
    try {
      await supabase.from('flashcards').delete().eq('id', id);
    } catch (e) {
      console.error('DatabaseService deleteFlashcard error:', e);
    }
  }
}

export const dbService = DatabaseService.getInstance();


