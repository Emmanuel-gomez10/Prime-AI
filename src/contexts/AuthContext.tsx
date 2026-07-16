import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

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

  useEffect(() => {
    // Check localStorage for an existing session on load
    const storedSession = localStorage.getItem('mock_session');
    if (storedSession) {
      const parsedSession: Session = JSON.parse(storedSession);
      setSession(parsedSession);
      setUser(parsedSession.user);
    } else {
      // AUTOLOGIN FOR LOCAL DEMONSTRATION
      const mockUser: User = { 
        id: 'mock-id-123', 
        email: 'student@example.com', 
        user_metadata: { full_name: 'Demo Student' } 
      };
      const mockSession: Session = { access_token: 'mock-token', user: mockUser };
      setSession(mockSession);
      setUser(mockUser);
      localStorage.setItem('mock_session', JSON.stringify(mockSession));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    // Mock login: always succeeds
    const mockUser: User = { id: 'mock-id-123', email };
    const mockSession: Session = { access_token: 'mock-token', user: mockUser };
    
    setSession(mockSession);
    setUser(mockUser);
    localStorage.setItem('mock_session', JSON.stringify(mockSession));
    
    return { error: null };
  };

  const signup = async (email: string, _password: string, profileData: { fullName: string; university?: string }) => {
    // Mock signup: always succeeds
    const mockUser: User = { 
      id: 'mock-id-123', 
      email, 
      user_metadata: { full_name: profileData.fullName, university: profileData.university } 
    };
    const mockSession: Session = { access_token: 'mock-token', user: mockUser };
    
    setSession(mockSession);
    setUser(mockUser);
    localStorage.setItem('mock_session', JSON.stringify(mockSession));

    return { error: null };
  };

  const logout = async () => {
    setSession(null);
    setUser(null);
    localStorage.removeItem('mock_session');
    return { error: null };
  };

  const resetPassword = async (_email: string) => {
    // Mock reset: does nothing successfully
    return { error: null };
  };

  const updatePassword = async (_password: string) => {
    // Mock update: does nothing successfully
    return { error: null };
  };

  const updateProfile = async (data: any) => {
    if (!user) return { error: new Error('Not authenticated') };
    // Merge data into current mock user
    const updatedUser = { ...user, user_metadata: { ...user?.user_metadata, ...data } };
    const updatedSession = { ...session!, user: updatedUser };
    
    setUser(updatedUser);
    setSession(updatedSession);
    localStorage.setItem('mock_session', JSON.stringify(updatedSession));
    
    return { error: null };
  };

  const refreshSession = async () => {
    // Re-read from local storage if needed
    const storedSession = localStorage.getItem('mock_session');
    if (storedSession) {
      const parsedSession: Session = JSON.parse(storedSession);
      setSession(parsedSession);
      setUser(parsedSession.user);
    } else {
      setSession(null);
      setUser(null);
    }
  };

  const signInWithGoogle = async () => {
    // Mock Google sign in
    return login('student@google.com', 'password');
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
    signInWithGoogle
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
