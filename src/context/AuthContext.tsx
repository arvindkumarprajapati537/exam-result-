import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (email: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleFavorite: (postId: string) => Promise<boolean>;
  isFavorite: (postId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('examresult_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('examresult_token');
  });

  // Verify active session with backend on mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/verify-session', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) {
            // Token is invalid/expired
            if (user?.role === 'admin') {
              setUser(null);
              setToken(null);
              localStorage.removeItem('examresult_user');
              localStorage.removeItem('examresult_token');
            }
          }
        })
        .catch(() => {
          // Ignore network errors on session check
        });
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('examresult_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('examresult_user');
    }
    if (token) {
      localStorage.setItem('examresult_token', token);
    } else {
      localStorage.removeItem('examresult_token');
    }
  }, [user, token]);

  const login = async (email: string, pass: string) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (pass || '').trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setToken(data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid email or password.' };
    } catch (err: any) {
      return { success: false, error: 'Network connection error. Please try again.' };
    }
  };

  const adminLogin = async (email: string, pass: string) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (pass || '').trim();

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });
      const data = await res.json();
      if (res.ok && data.user && data.user.role === 'admin') {
        setUser(data.user);
        setToken(data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid email or password.' };
    } catch (err: any) {
      return { success: false, error: 'Network error communicating with authentication service.' };
    }
  };

  const googleLogin = async (email: string, name?: string) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: name || 'Arvind Kumar Prajapati' }),
      });
      const data = await res.json();
      if (res.ok && data.user && data.user.role === 'admin') {
        setUser(data.user);
        setToken(data.token);
        return { success: true };
      }
      return {
        success: false,
        error: data.error || 'Access Denied. You are not authorized to access the EXAM RESULT Admin Panel.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Access Denied. You are not authorized to access the EXAM RESULT Admin Panel.',
      };
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err: any) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
        savedPostIds: [],
      };
      setUser(newUser);
      setToken(`token-${newUser.id}`);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const toggleFavorite = async (postId: string) => {
    if (!user) {
      // Local fallback for guest
      const localSaved = JSON.parse(localStorage.getItem('guest_saved_posts') || '[]');
      const idx = localSaved.indexOf(postId);
      let updated: string[];
      let isSaved = false;
      if (idx > -1) {
        updated = localSaved.filter((id: string) => id !== postId);
        isSaved = false;
      } else {
        updated = [...localSaved, postId];
        isSaved = true;
      }
      localStorage.setItem('guest_saved_posts', JSON.stringify(updated));
      return isSaved;
    }

    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, postId }),
      });
      const data = await res.json();
      if (res.ok && data.savedPostIds) {
        setUser({ ...user, savedPostIds: data.savedPostIds });
        return data.isSaved;
      }
    } catch (err) {
      console.warn('API error toggling favorite, using local state:', err);
    }

    const currentSaved = user.savedPostIds || [];
    const idx = currentSaved.indexOf(postId);
    const updated = idx > -1 ? currentSaved.filter(id => id !== postId) : [...currentSaved, postId];
    setUser({ ...user, savedPostIds: updated });
    return idx === -1;
  };

  const isFavorite = (postId: string): boolean => {
    if (user?.savedPostIds) {
      return user.savedPostIds.includes(postId);
    }
    const localSaved = JSON.parse(localStorage.getItem('guest_saved_posts') || '[]');
    return localSaved.includes(postId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        adminLogin,
        googleLogin,
        register,
        logout,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
