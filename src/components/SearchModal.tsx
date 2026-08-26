import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, Building2, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { usePosts } from '../context/PostsContext';
import { CATEGORIES } from '../data/categories';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (slug: string) => void;
  onViewAllResults: (query: string, category: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPost,
  onViewAllResults,
}) => {
  const { posts } = usePosts();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPosts = posts
    .filter(p => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase().trim();
      return (
        p.title.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.qualification?.toLowerCase().includes(q) ||
        p.stateOrCentral?.toLowerCase().includes(q)
      );
    })
    .slice(0, 8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onViewAllResults(query.trim(), selectedCategory);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* Search Header Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-900 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search exam name, UP Police, SSC CGL, RRB, NEET, Result, Admit Card..."
            className="w-full text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            ESC
          </button>
        </form>

        {/* Category Filter Chips */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] mr-1">Filter:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-blue-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.slice(0, 6).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100">
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-sm font-medium">No examinations or notices found matching "{query}"</p>
              <p className="text-xs text-slate-500">Try searching for keywords like SSC, Police, Army, Result, Railway, NEET.</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div
                key={post.id}
                onClick={() => {
                  onSelectPost(post.slug);
                  onClose();
                }}
                className="p-3 hover:bg-blue-50/60 rounded-xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      {(post.category || 'Notice').replace(/-/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium truncate">
                      {post.organization}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Last Date: {post.importantDates?.lastDate || 'Notified'}</span>
                    <span>•</span>
                    <span>{post.qualification}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-700 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Found {filteredPosts.length} matches</span>
          {query.trim() && (
            <button
              onClick={handleSubmit}
              className="text-blue-900 font-bold hover:underline"
            >
              See full dedicated results page →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
