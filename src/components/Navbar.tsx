import React from 'react';
import { CATEGORIES } from '../data/categories';
import { Home, Flame, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  return (
    <nav className="bg-blue-950 text-white shadow-md border-b-2 border-amber-500 hidden lg:block sticky top-[92px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto py-1">
            {/* Home Tab */}
            <button
              onClick={() => onNavigate('/')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-md text-xs uppercase font-bold tracking-wider transition ${
                currentRoute === '/'
                  ? 'bg-amber-500 text-slate-950 shadow-inner'
                  : 'text-slate-200 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            {/* Category Tabs */}
            {CATEGORIES.map(cat => {
              const isActive = currentRoute === `/${cat.slug}`;
              return (
                <button
                  key={cat.id}
                  onClick={() => onNavigate(`/${cat.slug}`)}
                  className={`px-3 py-2.5 text-xs uppercase font-bold tracking-wide transition relative rounded-t-md whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-blue-950 shadow-sm'
                      : 'text-slate-200 hover:bg-blue-900 hover:text-white'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.id === 'latest-jobs' && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-rose-500 text-white rounded font-bold animate-pulse">
                      HOT
                    </span>
                  )}
                  {cat.id === 'results' && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-emerald-500 text-white rounded font-bold">
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Notice Tag */}
          <div className="flex items-center text-xs font-semibold text-amber-300 gap-1.5 bg-blue-900/60 px-3 py-1 rounded-full border border-amber-400/30">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Government Job Alerts 2026</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
