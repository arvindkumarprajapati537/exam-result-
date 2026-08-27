import React from 'react';
import {
  Briefcase,
  Award,
  FileText,
  KeyRound,
  BookOpen,
  GraduationCap,
  BellRing,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { usePosts } from '../context/PostsContext';

interface QuickCategoryGridProps {
  onNavigate: (route: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  KeyRound: <KeyRound className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  BellRing: <BellRing className="w-5 h-5" />,
  ExternalLink: <ExternalLink className="w-5 h-5" />,
};

export const QuickCategoryGrid: React.FC<QuickCategoryGridProps> = ({ onNavigate }) => {
  const { posts } = usePosts();

  const getCount = (catId: string) => {
    return posts.filter(p => p.category === catId && p.status === 'published').length;
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
      <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
        <h2 className="text-base sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 font-serif">
          <span className="w-2 sm:w-2.5 h-5 sm:h-6 bg-blue-900 rounded-sm" />
          <span>Major Information Sections</span>
        </h2>
        <span className="text-[11px] sm:text-xs text-slate-500 font-medium hidden xs:inline">Click any category for full lists & filters</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-4">
        {CATEGORIES.map(cat => {
          const count = getCount(cat.id);
          return (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/${cat.slug}`)}
              className={`group cursor-pointer rounded-xl border-2 p-2.5 sm:p-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 bg-white ${cat.borderColor} hover:bg-slate-50/80 flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                <div
                  className={`p-2 sm:p-2.5 rounded-lg text-white shadow-xs ${
                    cat.id === 'latest-jobs'
                      ? 'bg-emerald-600'
                      : cat.id === 'results'
                      ? 'bg-rose-600'
                      : cat.id === 'admit-card'
                      ? 'bg-blue-600'
                      : cat.id === 'answer-key'
                      ? 'bg-amber-600'
                      : cat.id === 'syllabus'
                      ? 'bg-purple-600'
                      : cat.id === 'admissions'
                      ? 'bg-teal-600'
                      : cat.id === 'latest-updates'
                      ? 'bg-orange-600'
                      : 'bg-indigo-600'
                  }`}
                >
                  {iconMap[cat.icon] || <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {count} {count === 1 ? 'Notice' : 'Notices'}
                </span>
              </div>

              <div className="mt-2.5 sm:mt-3">
                <h3 className={`font-black text-xs sm:text-base ${cat.color} group-hover:underline flex items-center justify-between`}>
                  <span className="truncate">{cat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-transform shrink-0" />
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mt-0.5 hidden xs:block">{cat.tagline}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
