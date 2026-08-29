import React, { useEffect } from 'react';
import { BellRing, Calendar, Building2, ArrowRight, Sparkles } from 'lucide-react';
import { Post } from '../types';
import { usePosts } from '../context/PostsContext';
import { updatePageSEO } from '../lib/seo';

interface LatestUpdatesPageProps {
  onSelectPost: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export const LatestUpdatesPage: React.FC<LatestUpdatesPageProps> = ({
  onSelectPost,
  onNavigate,
}) => {
  const { posts } = usePosts();

  useEffect(() => {
    updatePageSEO(
      'Latest Exam Updates 2026 – EXAM RESULT',
      'Real-time stream of latest exam notices, admit cards, answer keys, and results published in 2026.'
    );
  }, []);

  // All published posts sorted chronologically
  const sortedPosts = [...posts]
    .filter(p => p.status === 'published')
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
    );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-rose-600 to-red-700 text-white rounded-2xl p-4 sm:p-8 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-amber-200 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
          <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
          <span>Real-time Candidate Feed</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black font-serif">
          Latest Exam Updates 2026
        </h1>
        <p className="text-xs sm:text-sm text-orange-100 max-w-2xl">
          Live stream of new application forms, exam date notices, answer keys, results, and syllabus updates released in 2026.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3 sm:space-y-4">
        {sortedPosts.map((post, idx) => (
          <article
            key={post.id}
            onClick={() => onSelectPost(post.slug)}
            className="bg-white rounded-xl border border-slate-200 hover:border-orange-500 p-3.5 sm:p-5 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
          >
            <div className="space-y-1 sm:space-y-1.5 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-200">
                  {(post.category || 'Notice').replace(/-/g, ' ')}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{post.organization}</span>
                </span>
                {idx < 3 && (
                  <span className="bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded animate-pulse">
                    FLASH
                  </span>
                )}
              </div>

              <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-orange-700 transition leading-snug">
                {post.title}
              </h2>

              <p className="text-xs text-slate-600 line-clamp-2 sm:line-clamp-1">{post.shortDescription}</p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-xs">
              <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {post.importantDates?.lastDate
                    ? `Last Date: ${post.importantDates.lastDate}`
                    : `Published: ${new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-IN')}`}
                </span>
              </span>

              <button className="bg-slate-900 group-hover:bg-orange-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-2xs min-h-[36px]">
                <span>View Notice</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
