import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminAuthPageProps {
  onNavigate: (route: string) => void;
}

export const AdminAuthPage: React.FC<AdminAuthPageProps> = ({ onNavigate }) => {
  const { adminLogin, login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, safely navigate in useEffect
  useEffect(() => {
    if (user && user.role === 'admin') {
      onNavigate('/admin/dashboard');
    }
  }, [user, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanInput = email.trim();
    const cleanPass = password.trim();

    // Attempt admin login
    const res = await adminLogin(cleanInput, cleanPass);
    setLoading(false);

    if (res.success) {
      onNavigate('/admin/dashboard');
    } else {
      // Fallback try standard login
      const fallbackRes = await login(cleanInput, cleanPass);
      if (fallbackRes.success) {
        onNavigate('/admin/dashboard');
      } else {
        setError(res.error || 'Invalid administrator credentials. Access restricted to authorized portal administrators only.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-slate-950 text-white rounded-2xl border-2 border-amber-500 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md font-black">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white font-serif">Admin Portal Control</h1>
          <p className="text-xs text-slate-400">
            Authorized administrator access for notice management & portal publishing
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/80 text-rose-300 text-xs p-3 rounded-lg border border-rose-800 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Admin Email / Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter authorized admin ID or email"
                autoComplete="username email"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-sm transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating Admin...' : 'Sign In to Admin Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-900">
          <button
            onClick={() => onNavigate('/')}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            ← Return to Candidate Public Portal
          </button>
        </div>
      </div>
    </div>
  );
};
