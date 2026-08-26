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
    <div className="bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 text-white py-2 px-4 shadow-sm border-b border-red-800">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Ticker Badge */}
        <div
          onClick={onViewAllUpdates}
          className="flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer hover:bg-amber-300 transition shadow-xs"
        >
          <BellRing className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
          <span>Latest Updates</span>
        </div>

        {/* Scrolling / Clickable Updates Ribbon */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="animate-marquee-left flex items-center space-x-6 whitespace-nowrap py-0.5">
            {[...recentUpdates, ...recentUpdates].map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => onSelectPost(item.slug)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white hover:text-amber-200 transition text-left cursor-pointer group shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 group-hover:scale-125 transition-transform" />
                <span className="font-bold text-amber-200">[{item.organization.split('(')[0].trim()}]:</span>
                <span className="underline-offset-2 group-hover:underline">{item.title}</span>
                <span className="text-[10px] bg-red-950/80 px-1.5 py-0.5 rounded text-amber-300 font-bold ml-1 border border-red-800">
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
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-200 hover:text-white bg-black/20 hover:bg-black/40 px-2.5 py-1 rounded transition shrink-0"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
