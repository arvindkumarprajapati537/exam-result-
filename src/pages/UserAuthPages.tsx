import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  Bookmark,
  Calendar,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Bell,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';

interface UserLoginPageProps {
  onNavigate: (route: string) => void;
}

export const UserLoginPage: React.FC<UserLoginPageProps> = ({ onNavigate }) => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      if (email.toLowerCase().trim() === 'arvindkumarprajapati537@gmail.com' || email.toLowerCase().includes('admin')) {
        onNavigate('/admin/dashboard');
      } else {
        onNavigate('/profile');
      }
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleDemoLogin = async () => {
    setEmail('candidate@example.com');
    setPassword('candidate123');
    setLoading(true);
    await login('candidate@example.com', 'candidate123');
    setLoading(false);
    onNavigate('/profile');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-8 shadow-md space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-serif">Candidate Login</h1>
          <p className="text-xs text-slate-500">
            Access your saved exams, application deadlines & custom alerts
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded-lg border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Email Address / Candidate ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="candidate@example.com / Admin Email"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-sm transition shadow-xs disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <p className="text-xs text-slate-600 font-medium text-center">
            Quick One-Click Test Access:
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-1.5 bg-white hover:bg-slate-100 text-blue-900 border border-blue-200 text-xs font-bold rounded-lg transition"
          >
            Auto-fill & Login as Demo Candidate
          </button>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500 space-y-2 border-t border-slate-100">
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('/register')}
              className="text-blue-700 font-bold hover:underline"
            >
              Create Account
            </button>
          </p>
          <p>
            Admin Officer?{' '}
            <button
              onClick={() => onNavigate('/admin/login')}
              className="text-amber-700 font-bold hover:underline"
            >
              Admin Portal
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

interface UserRegisterPageProps {
  onNavigate: (route: string) => void;
}

export const UserRegisterPage: React.FC<UserRegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);
    if (res.success) {
      onNavigate('/profile');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-8 shadow-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 font-serif">Create Candidate Account</h1>
          <p className="text-xs text-slate-500">
            Bookmark notifications, track deadlines & personalize exams
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded-lg border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Create Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-sm transition shadow-xs disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register as Candidate'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="text-blue-700 font-bold hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};

interface UserProfilePageProps {
  onSelectPost: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onSelectPost, onNavigate }) => {
  const { user, logout, toggleFavorite } = useAuth();
  const { posts } = usePosts();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-serif">Sign In Required</h2>
        <p className="text-xs text-slate-500">
          Please sign in to your candidate account to view and manage your saved bookmarks and alerts.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-5 py-2.5 bg-blue-900 text-white font-bold rounded-lg text-xs shadow-xs"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const savedPostIds = user.savedPostIds || [];
  const savedPosts = posts.filter(p => savedPostIds.includes(p.id));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white flex items-center justify-center text-2xl font-black font-serif shadow-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-serif">
                {user.name}
              </h1>
              <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Member since: {new Date(user.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'admin' && (
            <button
              onClick={() => onNavigate('/admin/dashboard')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg shadow-sm transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Saved Bookmarks & Deadlines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <span>My Saved Examinations & Active Alerts ({savedPosts.length})</span>
          </h2>
          <span className="text-xs text-slate-500">Click any card to view details</span>
        </div>

        {savedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No saved exams yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the bookmark button on any examination post to save it here for fast access and deadline tracking.
            </p>
            <button
              onClick={() => onNavigate('/latest-jobs')}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-blue-800"
            >
              Browse Latest Jobs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPosts.map(post => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post.slug)}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-4 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                      {(post.category || 'Notice').replace(/-/g, ' ')}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(post.id);
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{post.organization}</span>
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">
                    Last Date: {post.importantDates.lastDate || 'Notified'}
                  </span>
                  <span className="text-blue-700 font-bold flex items-center gap-0.5">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
