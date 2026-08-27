import React from 'react';
import { Youtube, Send, Instagram } from 'lucide-react';
import { usePosts } from '../context/PostsContext';

interface FloatingHotLinksProps {
  onSelectPost: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export const FloatingHotLinks: React.FC<FloatingHotLinksProps> = ({
  onSelectPost,
  onNavigate,
}) => {
  const { posts } = usePosts();

  // Get active published posts
  const publishedPosts = posts.filter(p => p.status === 'published');
  
  // Row 1 items (e.g. 5-6 items moving left to right / right to left)
  const row1Posts = publishedPosts.slice(0, 8);
  // Row 2 items
  const row2Posts = publishedPosts.slice(8, 16).length > 0 
    ? publishedPosts.slice(8, 16) 
    : publishedPosts.slice(0, 8).reverse();

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 sm:p-6 text-center space-y-2.5 sm:space-y-3 overflow-hidden">
        {/* Main Bold Portal Branding Title */}
        <h1 className="text-base sm:text-2xl md:text-3xl font-extrabold text-[#0000cc] tracking-tight font-serif break-words leading-snug">
          EXAM RESULT 2026 – ExamResult.in – Sarkari Job, Admit Card & Result Portal
        </h1>

        {/* Apps & Social Community Utility Row */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-xs sm:text-sm font-bold text-[#0000cc] pt-0.5">
          <a
            href="https://www.youtube.com/@Arvindofficial345"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-600 hover:underline transition flex items-center gap-1 min-h-[32px]"
          >
            <Youtube className="w-3.5 h-3.5 text-red-600 fill-current inline shrink-0" />
            <span>Youtube</span>
          </a>
          <span className="text-red-600 font-bold select-none">||</span>

          <a
            href="https://whatsapp.com/channel/0029VbDExHh8fewu2xmVj03M"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-600 hover:underline transition flex items-center min-h-[32px]"
          >
            WhatsApp Alerts
          </a>
          <span className="text-red-600 font-bold select-none">||</span>

          <a
            href="https://t.me/examresult0156"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-600 hover:underline transition flex items-center gap-1 min-h-[32px]"
          >
            <Send className="w-3.5 h-3.5 text-blue-500 inline shrink-0" />
            <span>Telegram</span>
          </a>
          <span className="text-red-600 font-bold select-none">||</span>

          <a
            href="https://x.com/Arvindk29646455"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-600 hover:underline transition flex items-center gap-1 min-h-[32px]"
          >
            <span>𝕏 Twitter</span>
          </a>
        </div>

        {/* Animated Moving / Floating Examination Link Tickers */}
        <div className="pt-2 sm:pt-3 space-y-2 border-t border-slate-100 overflow-hidden max-w-full">
          {/* Row 1: Smoothly Moving Left (Right to Left) */}
          <div className="relative w-full max-w-full overflow-hidden whitespace-nowrap py-1 bg-slate-50/60 rounded-lg border border-slate-100">
            <div className="animate-marquee-left flex items-center text-xs sm:text-[13.5px] font-bold text-[#0000cc]">
              {[...row1Posts, ...row1Posts].map((post, idx) => (
                <div key={`r1-${post.id}-${idx}`} className="flex items-center shrink-0">
                  <button
                    onClick={() => onSelectPost(post.slug)}
                    className="hover:text-red-600 hover:underline transition px-2.5 sm:px-3 cursor-pointer py-1"
                    title={post.title}
                  >
                    {post.title}
                  </button>
                  <span className="text-slate-400 font-medium select-none">||</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Smoothly Moving Right (Left to Right) */}
          <div className="relative w-full max-w-full overflow-hidden whitespace-nowrap py-1 bg-slate-50/60 rounded-lg border border-slate-100">
            <div className="animate-marquee-right flex items-center text-xs sm:text-[13.5px] font-bold text-[#0000cc]">
              {[...row2Posts, ...row2Posts].map((post, idx) => (
                <div key={`r2-${post.id}-${idx}`} className="flex items-center shrink-0">
                  <button
                    onClick={() => onSelectPost(post.slug)}
                    className="hover:text-red-600 hover:underline transition px-2.5 sm:px-3 cursor-pointer py-1"
                    title={post.title}
                  >
                    {post.title}
                  </button>
                  <span className="text-slate-400 font-medium select-none">||</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
