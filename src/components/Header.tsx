import React, { useState, useEffect } from 'react';
import {
  Search,
  Menu,
  X,
  User,
  ShieldCheck,
  Bookmark,
  Bell,
  Clock,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Lock,
  LogOut,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../data/categories';

interface HeaderProps {
  onOpenSearch: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onNavigate, currentRoute }) => {
  const { user, isAdmin, logout } = useAuth();
  const { textSize, increaseTextSize, decreaseTextSize, resetTextSize, language, toggleLanguage } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      {/* Top Utility Bar (Gov Portal Standard) */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date & Time in IST */}
          <div className="flex items-center space-x-3 text-slate-300 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentDate}</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentTime} IST</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Recruitment & Result Updates 2026
            </span>
          </div>

          {/* Right: Accessibility & Auth Quick Links */}
          <div className="flex items-center space-x-3 text-xs">
            {/* Text Zoom */}
            <div className="flex items-center bg-slate-800/80 rounded px-1.5 py-0.5 border border-slate-700 space-x-1">
              <span className="text-slate-400 mr-1 text-[10px] uppercase tracking-wider font-semibold">Font</span>
              <button
                onClick={decreaseTextSize}
                className="px-1 py-0.5 hover:text-white rounded hover:bg-slate-700 font-bold"
                title="Decrease Text Size"
              >
                A-
              </button>
              <button
                onClick={resetTextSize}
                className="px-1 py-0.5 hover:text-white rounded hover:bg-slate-700 font-bold text-amber-400"
                title="Default Text Size"
              >
                A
              </button>
              <button
                onClick={increaseTextSize}
                className="px-1 py-0.5 hover:text-white rounded hover:bg-slate-700 font-bold"
                title="Increase Text Size"
              >
                A+
              </button>
            </div>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="bg-indigo-950 text-indigo-300 hover:text-white px-2 py-0.5 rounded text-[11px] font-semibold border border-indigo-800 transition"
              title="Toggle Display Preference"
            >
              {language === 'en' ? 'हिन्दी / ENG' : 'ENG / हिन्दी'}
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNavClick('/admin/dashboard')}
                className="flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] bg-amber-600 text-white hover:bg-amber-500 transition cursor-pointer"
                title="Admin Control Center"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tricolor Accent Ribbon */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      {/* Main Brand & Actions Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & National Portal Title */}
          <div
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
            id="brand-logo-container"
          >
            {/* Custom Original Emblem/Shield Graphic */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 flex items-center justify-center text-white shadow-md border-2 border-amber-400 relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px] opacity-15" />
              <div className="text-center z-10">
                <span className="block text-[10px] font-black text-amber-300 tracking-widest leading-none">GOV</span>
                <span className="block text-lg sm:text-xl font-black tracking-tight leading-none text-white font-serif mt-0.5">ER</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-950 flex items-center font-serif">
                  <span>EXAM</span>
                  <span className="text-rose-600 ml-1.5 font-sans">RESULT</span>
                </h1>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">
                  Official Info Portal
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 tracking-tight mt-0.5 flex items-center flex-wrap gap-1">
                <span>Latest Jobs</span>
                <span className="text-slate-400">|</span>
                <span>Results</span>
                <span className="text-slate-400">|</span>
                <span>Admit Card</span>
                <span className="text-slate-400">|</span>
                <span>Answer Key</span>
                <span className="text-slate-400">|</span>
                <span>Admissions</span>
              </p>
            </div>
          </div>

          {/* Search Trigger and User Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Bar (Instant Modal Trigger) */}
            <button
              onClick={onOpenSearch}
              id="header-global-search-btn"
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-medium transition shadow-sm w-36 sm:w-64 justify-between"
              title="Search Exams, Jobs, Results, Admit Cards"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-500 truncate text-xs sm:text-sm">Search exams, jobs...</span>
              </div>
              <kbd className="hidden sm:inline-block bg-white text-slate-600 text-[11px] font-mono px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                /
              </kbd>
            </button>

            {/* User Profile Action if logged in */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-blue-50 text-blue-900 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 text-xs sm:text-sm font-semibold transition"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleNavClick('/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4 text-blue-600" />
                      <span>Saved Exams & Alerts</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleNavClick('/admin/dashboard')}
                        className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Admin Control Center</span>
                      </button>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 text-white border-t border-slate-800 px-4 py-4 space-y-2 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            <button
              onClick={() => handleNavClick('/')}
              className={`p-2.5 rounded-lg text-xs font-semibold text-center ${
                currentRoute === '/' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'
              }`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => handleNavClick('/latest-updates')}
              className={`p-2.5 rounded-lg text-xs font-semibold text-center ${
                currentRoute === '/latest-updates' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-200'
              }`}
            >
              ⚡ Latest Updates
            </button>
          </div>

          <div className="space-y-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleNavClick(`/${cat.slug}`)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  currentRoute === `/${cat.slug}` ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs text-slate-400">→</span>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-2">
            {isAdmin && (
              <button
                onClick={() => handleNavClick('/admin/dashboard')}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-bold text-center border border-amber-400 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Admin Control Center (Dashboard)</span>
              </button>
            )}

            {user && (
              <div className="space-y-1.5">
                <button
                  onClick={() => handleNavClick('/profile')}
                  className="w-full py-2 bg-slate-800 text-blue-300 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>My Saved Exams & Alerts</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-slate-800/80 hover:bg-rose-950 text-rose-300 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out ({user.name || user.email})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
