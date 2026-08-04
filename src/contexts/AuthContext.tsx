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
  login: (email: string, password: string) => Promise<{ data?: any; error: Error | null }>;
  signup: (email: string, password: string, profileData: { fullName: string; university?: string }) => Promise<{ data?: any; error: Error | null }>;
  logout: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: any) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
  signInWithGoogle: () => Promise<{ data?: any; error: Error | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || typeof url !== 'string' || !key || typeof key !== 'string') return false;
    if (key.includes('placeholder') || key.includes('your-anon-key')) return false;
    try {
      const parsed = new URL(url.trim());
      return (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
             !url.includes('placeholder') &&
             !url.includes('your-project');
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (isConfigured()) {
      // Real Supabase Auth listener
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Supabase getSession error:", error);
        }
        if (session) {
          setSession(session as any);
          setUser(session.user as any);
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }).catch(err => {
        console.error("Failed to fetch Supabase session:", err);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session as any);
        setUser(session?.user as any || null);
        setLoading(false);
      });

      // Guard timer so loading state never hangs
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 3000);

      return () => {
        subscription?.unsubscribe();
        clearTimeout(timeout);
      };
    } else {
      // Local fallback mode: Load session ONLY if explicitly stored
      const storedSession = localStorage.getItem('prime_auth_session');
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          setSession(parsed);
          setUser(parsed.user);
        } catch (e) {
          console.error("Failed to parse stored session:", e);
          localStorage.removeItem('prime_auth_session');
          setSession(null);
          setUser(null);
        }
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (isConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (data?.session) {
        setSession(data.session as any);
        setUser(data.session.user as any);
      }
      return { data, error };
    } else {
      const localUser: User = { id: `local-user-${Date.now()}`, email, user_metadata: { full_name: email.split('@')[0] } };
      const localSession: Session = { access_token: `local-token-${Date.now()}`, user: localUser };
      setSession(localSession);
      setUser(localUser);
      localStorage.setItem('prime_auth_session', JSON.stringify(localSession));
      return { data: { user: localUser, session: localSession }, error: null };
    }
  };

  const signup = async (email: string, password: string, profileData: { fullName: string; university?: string }) => {
    if (isConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: profileData.fullName,
            university: profileData.university,
          },
        },
      });
      if (data?.session) {
        setSession(data.session as any);
        setUser(data.session.user as any);
      }
      return { data, error };
    } else {
      const localUser: User = { 
        id: `local-user-${Date.now()}`, 
        email, 
        user_metadata: { full_name: profileData.fullName, university: profileData.university } 
      };
      const localSession: Session = { access_token: `local-token-${Date.now()}`, user: localUser };
      setSession(localSession);
      setUser(localUser);
      localStorage.setItem('prime_auth_session', JSON.stringify(localSession));
      return { data: { user: localUser, session: localSession }, error: null };
    }
  };

  const logout = async () => {
    if (isConfigured()) {
      const { error } = await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      localStorage.removeItem('prime_auth_session');
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      return { data, error };
    } else {
      return login('google.student@university.edu', 'password');
    }
  };

  const resendVerificationEmail = async (email: string) => {
    if (isConfigured()) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      return { error };
    }
    return { error: null };
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
    resendVerificationEmail,
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


