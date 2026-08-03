import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    university?: string;
  };
}

export interface Session {
  access_token: string;
  user: User;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (email: string, password: string, profileData: { fullName: string; university?: string }) => Promise<{ error: Error | null }>;
  logout: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: any) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder') && !url.includes('your-project'));
  };

  useEffect(() => {
    if (isConfigured()) {
      // Real Supabase Auth listener
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSession(session as any);
          setUser(session.user as any);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session as any);
        setUser(session?.user as any || null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local development fallback session
      const storedSession = localStorage.getItem('prime_auth_session');
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          setSession(parsed);
          setUser(parsed.user);
        } catch (e) {
          console.error("Failed to parse stored session:", e);
        }
      } else {
        const mockUser: User = { 
          id: 'local-student-001', 
          email: 'student@university.edu', 
          user_metadata: { full_name: 'Demo Student', university: 'UNIZIK' } 
        };
        const mockSession: Session = { access_token: 'local-demo-token', user: mockUser };
        setSession(mockSession);
        setUser(mockUser);
        localStorage.setItem('prime_auth_session', JSON.stringify(mockSession));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (isConfigured()) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } else {
      const localUser: User = { id: 'local-student-001', email, user_metadata: { full_name: email.split('@')[0] } };
      const localSession: Session = { access_token: 'local-token', user: localUser };
      setSession(localSession);
      setUser(localUser);
      localStorage.setItem('prime_auth_session', JSON.stringify(localSession));
      return { error: null };
    }
  };

  const signup = async (email: string, password: string, profileData: { fullName: string; university?: string }) => {
    if (isConfigured()) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profileData.fullName,
            university: profileData.university,
          },
        },
      });
      return { error };
    } else {
      const localUser: User = { 
        id: 'local-student-001', 
        email, 
        user_metadata: { full_name: profileData.fullName, university: profileData.university } 
      };
      const localSession: Session = { access_token: 'local-token', user: localUser };
      setSession(localSession);
      setUser(localUser);
      localStorage.setItem('prime_auth_session', JSON.stringify(localSession));
      return { error: null };
    }
  };

  const logout = async () => {
    if (isConfigured()) {
      const { error } = await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      return { error };
    } else {
      setSession(null);
      setUser(null);
      localStorage.removeItem('prime_auth_session');
      return { error: null };
    }
  };

  const resetPassword = async (email: string) => {
    if (isConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    }
    return { error: null };
  };

  const updatePassword = async (password: string) => {
    if (isConfigured()) {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    }
    return { error: null };
  };

  const updateProfile = async (data: any) => {
    if (isConfigured()) {
      const { error } = await supabase.auth.updateUser({ data });
      return { error };
    } else if (user) {
      const updatedUser = { ...user, user_metadata: { ...user.user_metadata, ...data } };
      const updatedSession = { ...session!, user: updatedUser };
      setUser(updatedUser);
      setSession(updatedSession);
      localStorage.setItem('prime_auth_session', JSON.stringify(updatedSession));
      return { error: null };
    }
    return { error: new Error('Not authenticated') };
  };

  const refreshSession = async () => {
    if (isConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session as any);
        setUser(session.user as any);
      }
    }
  };

  const signInWithGoogle = async () => {
    if (isConfigured()) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      return { error };
    } else {
      return login('google.student@university.edu', 'password');
    }
  };

  const value = {
    session,
    user,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

