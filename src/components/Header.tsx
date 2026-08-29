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
      <div className="bg-slate-900 text-slate-200 text-xs py-1 px-3 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Date & Time in IST */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-slate-300 font-medium text-[11px] sm:text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
              <span>{currentDate}</span>
            </span>
            <span className="text-slate-600 hidden xs:inline">|</span>
            <span className="hidden xs:flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400 shrink-0" />
              <span>{currentTime} IST</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Updates 2026
            </span>
          </div>

          {/* Right: Accessibility & Auth Quick Links */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 text-[11px] sm:text-xs ml-auto">
            {/* Text Zoom */}
            <div className="flex items-center bg-slate-800/80 rounded px-1.5 py-0.5 border border-slate-700 space-x-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold hidden sm:inline">Font</span>
              <button
                onClick={decreaseTextSize}
                className="px-1 py-0.5 hover:text-white rounded hover:bg-slate-700 font-bold min-w-[20px] text-center"
                title="Decrease Text Size"
              >
                A-
              </button>
              <button
                onClick={resetTextSize}
                className="px-1 py-0.5 hover:text-white rounded hover:bg-slate-700 font-bold text-amber-400 min-w-[18px] text-center"
                title="Default Text Size"
              >
                A
              </button>
              <button
                onClick={increaseTextSize}
                className="px-1 py-0.5 hover:text-white rounded hover:bg-slate-700 font-bold min-w-[20px] text-center"
                title="Increase Text Size"
              >
                A+
              </button>
            </div>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="bg-indigo-950 text-indigo-300 hover:text-white px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold border border-indigo-800 transition whitespace-nowrap"
              title="Toggle Display Preference"
            >
              {language === 'en' ? 'हिन्दी' : 'ENG'}
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNavClick('/admin/dashboard')}
                className="flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[10px] sm:text-[11px] bg-amber-600 text-white hover:bg-amber-500 transition cursor-pointer whitespace-nowrap"
                title="Admin Control Center"
              >
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & National Portal Title */}
          <div
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group select-none min-w-0"
            id="brand-logo-container"
          >
            {/* Custom Original Emblem/Shield Graphic */}
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 flex items-center justify-center text-white shadow-md border-2 border-amber-400 relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px] opacity-15" />
              <div className="text-center z-10">
                <span className="block text-[8px] sm:text-[10px] font-black text-amber-300 tracking-widest leading-none">GOV</span>
                <span className="block text-base sm:text-xl font-black tracking-tight leading-none text-white font-serif mt-0.5">ER</span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <div className="text-xl sm:text-3xl font-extrabold tracking-tight text-blue-950 flex items-center font-serif leading-none">
                  <span>EXAM</span>
                  <span className="text-rose-600 ml-1 font-sans">RESULT</span>
                </div>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider hidden md:inline-block">
                  Official Info Portal
                </span>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 tracking-tight mt-0.5 truncate hidden xs:block">
                <span>Latest Jobs</span>
                <span className="text-slate-400 mx-1">|</span>
                <span>Results</span>
                <span className="text-slate-400 mx-1">|</span>
                <span>Admit Card</span>
                <span className="text-slate-400 mx-1 hidden sm:inline">|</span>
                <span className="hidden sm:inline">Answer Key</span>
              </p>
            </div>
          </div>

          {/* Search Trigger and User Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Global Search Bar (Instant Modal Trigger) */}
            <button
              onClick={onOpenSearch}
              id="header-global-search-btn"
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-2.5 sm:px-3.5 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium transition shadow-xs w-9 xs:w-32 sm:w-60 justify-center xs:justify-between min-h-[40px] cursor-pointer"
              title="Search Exams, Jobs, Results, Admit Cards"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Search className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="text-slate-500 truncate text-xs sm:text-sm hidden xs:inline">Search exams...</span>
              </div>
              <kbd className="hidden sm:inline-block bg-white text-slate-500 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                /
              </kbd>
            </button>

            {/* User Profile Action if logged in */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-900 hover:bg-blue-100 px-2 sm:px-3 py-2 rounded-lg border border-blue-200 text-xs sm:text-sm font-semibold transition min-h-[40px] cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[90px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600 hidden sm:inline" />
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
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-blue-600" />
                      <span>Saved Exams & Alerts</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleNavClick('/admin/dashboard')}
                        className="w-full text-left px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2 font-medium cursor-pointer"
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
                      className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
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
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 text-white border-t border-slate-800 px-4 py-4 space-y-3 shadow-2xl max-h-[80vh] overflow-y-auto">
          {/* Quick Primary Actions */}
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            <button
              onClick={() => handleNavClick('/')}
              className={`p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px] ${
                currentRoute === '/' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>🏠 Home Portal</span>
            </button>
            <button
              onClick={() => handleNavClick('/latest-updates')}
              className={`p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px] ${
                currentRoute === '/latest-updates' ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>⚡ Live Updates</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider px-1 block mb-1">
              Examination Sections
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleNavClick(`/${cat.slug}`)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between transition cursor-pointer min-h-[44px] ${
                    currentRoute === `/${cat.slug}`
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-200 bg-slate-900/80 hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-slate-400">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Important Utility Links */}
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider px-1 block">
              Direct Useful Links
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => handleNavClick('/important-links')}
                className="p-2.5 bg-indigo-950/80 text-indigo-200 rounded-lg text-left font-semibold hover:bg-indigo-900/90 transition min-h-[44px] flex items-center cursor-pointer"
              >
                Gov Portals Directory
              </button>
              <button
                onClick={() => handleNavClick('/about')}
                className="p-2.5 bg-slate-900 text-slate-300 rounded-lg text-left font-semibold hover:bg-slate-800 transition min-h-[44px] flex items-center cursor-pointer"
              >
                About Portal
              </button>
              <button
                onClick={() => handleNavClick('/contact')}
                className="p-2.5 bg-slate-900 text-slate-300 rounded-lg text-left font-semibold hover:bg-slate-800 transition min-h-[44px] flex items-center cursor-pointer"
              >
                Contact & Helpdesk
              </button>
              <button
                onClick={() => handleNavClick('/disclaimer')}
                className="p-2.5 bg-slate-900 text-slate-300 rounded-lg text-left font-semibold hover:bg-slate-800 transition min-h-[44px] flex items-center cursor-pointer"
              >
                Disclaimer & Terms
              </button>
            </div>
          </div>

          {/* Auth & Admin Controls in Drawer */}
          <div className="border-t border-slate-800 pt-3 space-y-2">
            {isAdmin ? (
              <button
                onClick={() => handleNavClick('/admin/dashboard')}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold text-center border border-amber-400 flex items-center justify-center gap-2 shadow-sm cursor-pointer min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Admin Control Center (Dashboard)</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('/admin/login')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold text-center border border-slate-700 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Portal Login</span>
              </button>
            )}

            {user ? (
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => handleNavClick('/profile')}
                  className="w-full py-2.5 bg-slate-900 text-blue-300 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>My Saved Examinations & Alerts</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out ({user.name || user.email})</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('/login')}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Candidate Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
