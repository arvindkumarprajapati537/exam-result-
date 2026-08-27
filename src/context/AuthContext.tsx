import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

const PRIMARY_ADMIN_EMAIL = 'arvindkumarprajapati537@gmail.com';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (email: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  changeAdminPassword: (
    currentPass: string,
    newPass: string,
    confirmPass: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  requestPasswordReset: (
    email: string
  ) => Promise<{ success: boolean; message?: string; demoResetCode?: string; error?: string }>;
  resetPasswordWithToken: (
    email: string,
    code: string,
    newPass: string,
    confirmPass: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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

  // Sync state with active Supabase session and auth state listener
  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check from Supabase
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.warn('[Supabase Auth Session Check]:', error.message);
        return;
      }
      if (data?.session?.user) {
        const authUser = data.session.user;
        const isAdmin =
          authUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
          authUser.user_metadata?.role === 'admin';

        const updatedUser: User = {
          id: authUser.id,
          name: authUser.user_metadata?.name || (isAdmin ? 'Arvind Kumar Prajapati' : authUser.email?.split('@')[0] || 'User'),
          email: authUser.email || '',
          role: isAdmin ? 'admin' : 'user',
          createdAt: authUser.created_at || new Date().toISOString(),
          savedPostIds: [],
        };
        setUser(updatedUser);
        setToken(data.session.access_token);
      }
    }).catch(err => {
      console.warn('[Supabase getSession Error]:', err);
    });

    // 2. Real-time Auth State Change Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const authUser = session.user;
        const isAdmin =
          authUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
          authUser.user_metadata?.role === 'admin';

        const updatedUser: User = {
          id: authUser.id,
          name: authUser.user_metadata?.name || (isAdmin ? 'Arvind Kumar Prajapati' : authUser.email?.split('@')[0] || 'User'),
          email: authUser.email || '',
          role: isAdmin ? 'admin' : 'user',
          createdAt: authUser.created_at || new Date().toISOString(),
          savedPostIds: [],
        };
        setUser(updatedUser);
        setToken(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        localStorage.removeItem('examresult_user');
        localStorage.removeItem('examresult_token');
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
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

  // Real Supabase Email/Password Login
  const login = async (email: string, pass: string) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (pass || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Email and password are required.' };
    }

    try {
      // 1. Direct real authentication request to Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        console.error('[Supabase Auth Login Error]:', error.message, 'Status:', error.status);
        // Also check if server fallback is available
        try {
          const serverRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
          });
          const serverData = await serverRes.json();
          if (serverRes.ok && serverData.user) {
            setUser(serverData.user);
            setToken(serverData.token);
            return { success: true };
          }
        } catch {}

        return { success: false, error: error.message || 'Invalid email or password.' };
      }

      if (data?.user && data.session) {
        const isAdmin =
          data.user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
          data.user.user_metadata?.role === 'admin';

        const authenticatedUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || (isAdmin ? 'Arvind Kumar Prajapati' : data.user.email?.split('@')[0] || 'User'),
          email: data.user.email || cleanEmail,
          role: isAdmin ? 'admin' : 'user',
          createdAt: data.user.created_at || new Date().toISOString(),
          savedPostIds: [],
        };

        setUser(authenticatedUser);
        setToken(data.session.access_token);
        return { success: true };
      }

      return { success: false, error: 'Failed to create authenticated session.' };
    } catch (err: any) {
      console.error('[Supabase Auth Exception]:', err);
      return {
        success: false,
        error: err?.message || 'Authentication error connecting to Supabase Auth service.',
      };
    }
  };

  // Real Supabase Admin Email/Password Login
  const adminLogin = async (email: string, pass: string) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (pass || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Email and password are required.' };
    }

    try {
      // 1. Direct real authentication request to Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        console.error('[Supabase Admin Login Error]:', error.message, 'Status:', error.status);

        // Fallback to server verification if needed
        try {
          const serverRes = await fetch('/api/auth/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
          });
          const serverData = await serverRes.json();
          if (serverRes.ok && serverData.user && serverData.user.role === 'admin') {
            setUser(serverData.user);
            setToken(serverData.token);
            return { success: true };
          }
        } catch {}

        return { success: false, error: error.message || 'Invalid email or password.' };
      }

      if (data?.user && data.session) {
        const isAdmin =
          data.user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
          data.user.user_metadata?.role === 'admin';

        if (!isAdmin) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Access Denied. You are not authorized to access the EXAM RESULT Admin Panel.',
          };
        }

        const adminUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Arvind Kumar Prajapati',
          email: data.user.email || cleanEmail,
          role: 'admin',
          createdAt: data.user.created_at || new Date().toISOString(),
          savedPostIds: [],
        };

        setUser(adminUser);
        setToken(data.session.access_token);
        return { success: true };
      }

      return { success: false, error: 'Failed to establish administrator session.' };
    } catch (err: any) {
      console.error('[Admin Login Exception]:', err);
      return {
        success: false,
        error: err?.message || 'Authentication error connecting to Supabase Auth service.',
      };
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

  const changeAdminPassword = async (
    currentPass: string,
    newPass: string,
    confirmPass: string
  ) => {
    if (newPass !== confirmPass) {
      return { success: false, error: 'New passwords do not match.' };
    }

    try {
      // Update in Supabase Auth directly
      const { error: supaErr } = await supabase.auth.updateUser({
        password: newPass,
      });

      if (supaErr) {
        console.warn('[Supabase Password Update Notice]:', supaErr.message);
      }

      // Also update in server store for bidirectional consistency
      const activeToken = token || localStorage.getItem('examresult_token') || '';
      const res = await fetch('/api/auth/admin-change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
          confirmPassword: confirmPass,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await logout();
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || supaErr?.message || 'Failed to change password.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error communicating with server.' };
    }
  };

  const requestPasswordReset = async (email: string) => {
    const cleanEmail = (email || '').trim();
    try {
      // 1. Supabase Reset Email
      await supabase.auth.resetPasswordForEmail(cleanEmail).catch(err => {
        console.warn('[Supabase reset password notice]:', err?.message);
      });

      // 2. Server reset flow for interactive code
      const res = await fetch('/api/auth/admin-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          message: data.message,
          demoResetCode: data.demoResetCode,
        };
      }
      return { success: false, error: data.error || 'Failed to request reset.' };
    } catch (err: any) {
      return { success: false, error: 'Error requesting password reset.' };
    }
  };

  const resetPasswordWithToken = async (
    email: string,
    code: string,
    newPass: string,
    confirmPass: string
  ) => {
    try {
      const res = await fetch('/api/auth/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resetCode: code,
          newPassword: newPass,
          confirmPassword: confirmPass,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await logout();
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Failed to reset password.' };
    } catch (err: any) {
      return { success: false, error: 'Error resetting password.' };
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (pass || '').trim();

    try {
      // Try Supabase Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPass,
        options: {
          data: { name, role: 'user' },
        },
      });

      if (!error && data.user) {
        const newUser: User = {
          id: data.user.id,
          name,
          email: cleanEmail,
          role: 'user',
          createdAt: data.user.created_at || new Date().toISOString(),
          savedPostIds: [],
        };
        setUser(newUser);
        if (data.session) {
          setToken(data.session.access_token);
        }
        return { success: true };
      }

      // Server registration fallback
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password: cleanPass }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || error?.message || 'Registration failed' };
      }
      setUser(resData.user);
      setToken(resData.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration error occurred.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut().catch(() => {});
      if (token) {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('examresult_user');
      localStorage.removeItem('examresult_token');
    }
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
        changeAdminPassword,
        requestPasswordReset,
        resetPasswordWithToken,
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
