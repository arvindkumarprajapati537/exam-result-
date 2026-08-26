import React from 'react';
import {
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { BreakingTicker } from '../components/BreakingTicker';
import { FloatingHotLinks } from '../components/FloatingHotLinks';
import { FeaturedActionBlocks } from '../components/FeaturedActionBlocks';
import { ContentBoxesGrid } from '../components/ContentBoxesGrid';
import { IMPORTANT_GOV_LINKS } from '../data/importantLinks';

interface HomePageProps {
  onSelectPost: (slug: string) => void;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectPost,
  onNavigate,
  onOpenSearch,
}) => {
  return (
    <div className="space-y-6">
      {/* Breaking Updates Marquee Ticker */}
      <BreakingTicker
        onSelectPost={onSelectPost}
        onViewAllUpdates={() => onNavigate('/latest-updates')}
      />

      {/* Floating Trending / Hot Examination Links Board */}
      <FloatingHotLinks
        onSelectPost={onSelectPost}
        onNavigate={onNavigate}
      />

      {/* 8-Color Iconic Action Blocks Grid */}
      <FeaturedActionBlocks
        onSelectPost={onSelectPost}
      />

      {/* Home Page Content Boxes (Section 6: Latest Jobs, Results, Admit Cards, Answer Keys, Admissions, Syllabus) */}
      <ContentBoxesGrid
        onSelectPost={onSelectPost}
        onViewCategory={categorySlug => onNavigate(`/${categorySlug}`)}
      />

      {/* Government Recruiting Commissions & Testing Bodies Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-black font-serif text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Important Official Government Portals</span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct official website links of central and state recruiting commissions
              </p>
            </div>
            <button
              onClick={() => onNavigate('/important-links')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All 16 Portals</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {IMPORTANT_GOV_LINKS.slice(0, 8).map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800/80 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/60 hover:border-amber-400 transition group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase block mb-1">
                    {link.tag}
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                    {link.name}
                  </h4>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate text-[10px]">{link.category}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-300 shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Candidate Advice & Verification FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-6 space-y-4">
          <h3 className="text-base font-extrabold text-amber-950 font-serif flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-700" />
            <span>Essential Candidate Guidelines for 2026 Exams</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-amber-900 leading-relaxed">
            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 space-y-1">
              <p className="font-bold text-amber-950">1. Verify Official Notification</p>
              <p>Always download and read the detailed PDF notification from the official commission website before paying examination fees.</p>
            </div>
            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 space-y-1">
              <p className="font-bold text-amber-950">2. Keep Documents Ready</p>
              <p>Prepare scanned high-definition photograph, clear signature, Aadhaar card, and educational certificates in required dimensions.</p>
            </div>
            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 space-y-1">
              <p className="font-bold text-amber-950">3. Check Cut-off & Eligibility</p>
              <p>Check age relaxation rules and minimum qualifying marks for your respective category (UR, OBC, EWS, SC, ST).</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
