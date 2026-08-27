import React, { useState } from 'react';
import { Search, Filter, Sparkles, Building2, Calendar, ArrowRight } from 'lucide-react';
import { Post } from '../types';
import { PostCard } from '../components/PostCard';
import { CATEGORIES } from '../data/categories';

interface SearchResultsPageProps {
  initialQuery?: string;
  initialCategory?: string;
  posts: Post[];
  onSelectPost: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  initialQuery = '',
  initialCategory = 'all',
  posts,
  onSelectPost,
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCat, setSelectedCat] = useState(initialCategory);

  const results = posts.filter(p => {
    if (p.status !== 'published') return false;
    if (selectedCat !== 'all' && p.category !== selectedCat) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      p.title.toLowerCase().includes(q) ||
      p.organization.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.qualification?.toLowerCase().includes(q) ||
      p.stateOrCentral?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Global Examination & Recruitment Search</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-serif">
          Search Results {query ? `for "${query}"` : ''}
        </h1>

        {/* Global Input inside Search Page */}
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type any exam name, UP Police, SSC, Result, Railway, CTET, Admit Card..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-sm font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-full font-bold transition whitespace-nowrap ${
              selectedCat === 'all'
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Categories ({posts.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = posts.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-full font-bold transition whitespace-nowrap ${
                  selectedCat === cat.id
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Found {results.length} active examinations & notices</span>
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedCat('all');
              }}
              className="text-rose-600 hover:underline"
            >
              Clear Search Query
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <h3 className="text-lg font-bold text-slate-800 font-serif">No matches found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find any results matching your query. Try searching for common acronyms like SSC, UP Police, UPSC, RRB, NEET, or JEE.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map(post => (
              <PostCard key={post.id} post={post} onSelect={onSelectPost} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
