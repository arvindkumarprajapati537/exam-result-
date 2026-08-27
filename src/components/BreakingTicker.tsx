import React from 'react';
import { BellRing, ChevronRight, Sparkles } from 'lucide-react';
import { usePosts } from '../context/PostsContext';

interface BreakingTickerProps {
  onSelectPost: (slug: string) => void;
  onViewAllUpdates: () => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ onSelectPost, onViewAllUpdates }) => {
  const { posts } = usePosts();
  const recentUpdates = posts.slice(0, 8);

  return (
    <div className="bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 text-white py-1.5 px-2.5 sm:px-4 shadow-sm border-b border-red-800">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
        {/* Ticker Badge */}
        <div
          onClick={onViewAllUpdates}
          className="flex items-center gap-1 bg-amber-400 text-slate-950 px-2 sm:px-3 py-1 rounded font-black text-[10px] sm:text-xs uppercase tracking-wider shrink-0 cursor-pointer hover:bg-amber-300 transition shadow-xs select-none"
        >
          <BellRing className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950 animate-bounce" />
          <span className="hidden xs:inline">Latest Updates</span>
          <span className="xs:hidden">Updates</span>
        </div>

        {/* Scrolling / Clickable Updates Ribbon */}
        <div className="flex-1 overflow-hidden relative flex items-center min-w-0">
          <div className="animate-marquee-left flex items-center space-x-4 sm:space-x-6 whitespace-nowrap py-0.5">
            {[...recentUpdates, ...recentUpdates].map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => onSelectPost(item.slug)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white hover:text-amber-200 transition text-left cursor-pointer group shrink-0 py-0.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 group-hover:scale-125 transition-transform" />
                <span className="font-bold text-amber-200">[{item.organization.split('(')[0].trim()}]:</span>
                <span className="underline-offset-2 group-hover:underline">{item.title}</span>
                <span className="text-[10px] bg-red-950/80 px-1.5 py-0.2 rounded text-amber-300 font-bold ml-1 border border-red-800">
                  {item.category === 'results'
                    ? 'RESULT OUT'
                    : item.category === 'admit-card'
                    ? 'ADMIT CARD'
                    : 'APPLY NOW'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <button
          onClick={onViewAllUpdates}
          className="hidden md:flex items-center gap-1 text-xs font-bold text-amber-200 hover:text-white bg-black/20 hover:bg-black/40 px-2.5 py-1 rounded transition shrink-0 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
