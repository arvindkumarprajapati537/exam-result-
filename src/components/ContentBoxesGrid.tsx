import React from 'react';
import {
  Briefcase,
  Award,
  FileText,
  KeyRound,
  BookOpen,
  GraduationCap,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Post, PostCategory } from '../types';
import { usePosts } from '../context/PostsContext';

interface ContentBoxesGridProps {
  onSelectPost: (slug: string) => void;
  onViewCategory: (categorySlug: string) => void;
}

interface BoxConfig {
  category: PostCategory;
  title: string;
  slug: string;
  headerBg: string;
  headerText: string;
  badgeBg: string;
  borderColor: string;
  icon: React.ReactNode;
}

const BOX_CONFIGS: BoxConfig[] = [
  {
    category: 'results',
    title: 'Results',
    slug: 'results',
    headerBg: 'bg-rose-700',
    headerText: 'text-white',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    borderColor: 'border-rose-600',
    icon: <Award className="w-5 h-5 text-rose-200" />,
  },
  {
    category: 'admit-card',
    title: 'Admit Card',
    slug: 'admit-card',
    headerBg: 'bg-blue-700',
    headerText: 'text-white',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    borderColor: 'border-blue-600',
    icon: <FileText className="w-5 h-5 text-blue-200" />,
  },
  {
    category: 'latest-jobs',
    title: 'Latest Jobs',
    slug: 'latest-jobs',
    headerBg: 'bg-emerald-700',
    headerText: 'text-white',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderColor: 'border-emerald-600',
    icon: <Briefcase className="w-5 h-5 text-emerald-200" />,
  },
  {
    category: 'answer-key',
    title: 'Answer Key',
    slug: 'answer-key',
    headerBg: 'bg-amber-600',
    headerText: 'text-white',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    borderColor: 'border-amber-500',
    icon: <KeyRound className="w-5 h-5 text-amber-200" />,
  },
  {
    category: 'syllabus',
    title: 'Syllabus',
    slug: 'syllabus',
    headerBg: 'bg-purple-700',
    headerText: 'text-white',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    borderColor: 'border-purple-600',
    icon: <BookOpen className="w-5 h-5 text-purple-200" />,
  },
  {
    category: 'admissions',
    title: 'Admissions',
    slug: 'admissions',
    headerBg: 'bg-teal-700',
    headerText: 'text-white',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    borderColor: 'border-teal-600',
    icon: <GraduationCap className="w-5 h-5 text-teal-200" />,
  },
];

export const ContentBoxesGrid: React.FC<ContentBoxesGridProps> = ({ onSelectPost, onViewCategory }) => {
  const { posts } = usePosts();

  const getPostsForCategory = (cat: PostCategory): Post[] => {
    return posts.filter(p => p.category === cat && p.status === 'published').slice(0, 12);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* 3-Column / 6-Box Portal Bulletin Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BOX_CONFIGS.map(box => {
          const categoryPosts = getPostsForCategory(box.category);

          return (
            <div
              key={box.category}
              className={`bg-white rounded-xl border-2 ${box.borderColor} shadow-sm overflow-hidden flex flex-col justify-between`}
            >
              {/* Box Header */}
              <div className={`${box.headerBg} ${box.headerText} px-4 py-3 flex items-center justify-between shadow-xs`}>
                <div className="flex items-center gap-2">
                  {box.icon}
                  <h3 className="font-extrabold text-base tracking-wide uppercase font-serif">
                    {box.title}
                  </h3>
                </div>
                <button
                  onClick={() => onViewCategory(box.slug)}
                  className="text-xs font-bold bg-black/20 hover:bg-black/40 text-white px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 flex-1 min-h-[380px] overflow-y-auto">
                {categoryPosts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No active notices right now.
                  </div>
                ) : (
                  categoryPosts.map((item, idx) => {
                    return (
                      <article
                        key={item.id}
                        onClick={() => onSelectPost(item.slug)}
                        className="py-2.5 px-3 hover:bg-blue-50/60 transition cursor-pointer group flex flex-col justify-center"
                      >
                        <div>
                          <h4 className="text-[13.5px] sm:text-[14px] font-bold text-[#0000cc] group-hover:text-red-600 group-hover:underline transition leading-snug">
                            <span className="text-red-600 mr-1.5 font-bold text-sm">
                              •
                            </span>
                            {item.title}
                            {idx === 0 && (
                              <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase px-1 py-0.2 rounded tracking-wider animate-pulse ml-1 align-middle">
                                NEW
                              </span>
                            )}
                          </h4>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              {/* Box Footer Button */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => onViewCategory(box.slug)}
                  className="w-full py-1.5 text-xs font-bold text-slate-700 hover:text-blue-900 hover:bg-slate-200/70 rounded transition"
                >
                  Explore All {box.title} ({posts.filter(p => p.category === box.category).length}) →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
