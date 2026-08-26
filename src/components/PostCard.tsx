import React from 'react';
import {
  Calendar,
  Building2,
  GraduationCap,
  Users,
  MapPin,
  Bookmark,
  ArrowRight,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
  post: Post;
  onSelect: (slug: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onSelect }) => {
  const { toggleFavorite, isFavorite } = useAuth();
  const saved = isFavorite(post.id);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'latest-jobs':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'results':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'admit-card':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'answer-key':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'syllabus':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'admissions':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'latest-jobs':
        return 'Latest Job';
      case 'results':
        return 'Result';
      case 'admit-card':
        return 'Admit Card';
      case 'answer-key':
        return 'Answer Key';
      case 'syllabus':
        return 'Syllabus';
      case 'admissions':
        return 'Admission';
      case 'latest-updates':
        return 'Update';
      default:
        return category;
    }
  };

  return (
    <article className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                post.category
              )}`}
            >
              {getCategoryLabel(post.category)}
            </span>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {post.stateOrCentral}
            </span>
          </div>

          <button
            onClick={e => {
              e.stopPropagation();
              toggleFavorite(post.id);
            }}
            className={`p-1.5 rounded-lg border transition ${
              saved
                ? 'bg-amber-50 text-amber-600 border-amber-300'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
            title={saved ? 'Remove from Saved' : 'Save for later'}
            aria-label="Save post"
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(post.slug)}
          className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition cursor-pointer leading-snug mb-2"
        >
          {post.title}
        </h3>

        {/* Organization */}
        <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mb-2.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{post.organization}</span>
        </p>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3.5">
          {post.shortDescription}
        </p>

        {/* Highlight Metadata Pills */}
        <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1 text-slate-600">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate font-medium">{post.qualification || 'Any Degree'}</span>
          </div>
          {post.totalVacancies && (
            <div className="flex items-center gap-1 text-slate-600">
              <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate font-bold text-emerald-700">{post.totalVacancies}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Dates & CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {post.importantDates?.lastDate
              ? `Last: ${post.importantDates.lastDate}`
              : `Date: ${post.importantDates?.applicationBegin || 'Active'}`}
          </span>
        </div>

        <button
          onClick={() => onSelect(post.slug)}
          className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow-2xs group-hover:scale-102"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
