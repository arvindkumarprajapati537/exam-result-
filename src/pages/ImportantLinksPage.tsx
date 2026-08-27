import React, { useState } from 'react';
import { ExternalLink, ShieldCheck, Search, Building2, MapPin } from 'lucide-react';
import { IMPORTANT_GOV_LINKS, GovPortalLink } from '../data/importantLinks';

export const ImportantLinksPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const tags = ['All', 'Central Govt', 'All India', 'Banking', 'Defense', 'Railways', 'Uttar Pradesh', 'Bihar', 'Rajasthan', 'Delhi (NCT)'];

  const filteredLinks = IMPORTANT_GOV_LINKS.filter(l => {
    if (selectedTag !== 'All' && l.tag !== selectedTag && l.category !== selectedTag) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.tag.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Banner */}
      <div className="bg-indigo-950 text-white rounded-2xl p-4 sm:p-8 shadow-sm border-2 border-indigo-400/50 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Official Commission & Testing Authority Directory</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black font-serif">Important Useful Government Links</h1>
        <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl">
          Direct verified links to central government recruitment boards, public service commissions, state testing agencies, and university entrance portals.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search portal name or commission..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 font-medium min-h-[40px]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin w-full sm:w-auto text-xs pb-1 sm:pb-0">
            {tags.slice(0, 6).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap min-h-[32px] cursor-pointer ${
                  selectedTag === t
                    ? 'bg-indigo-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredLinks.map(portal => (
          <div
            key={portal.name}
            className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200">
                  {portal.tag}
                </span>
                <span className="text-xs text-slate-400 font-medium">{portal.category}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition font-serif leading-snug">
                {portal.name}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">{portal.description}</p>
            </div>

            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px] sm:max-w-[180px]">
                {(portal.url || '').replace('https://', '').replace('www.', '')}
              </span>

              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-2xs min-h-[36px]"
              >
                <span>Visit Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
