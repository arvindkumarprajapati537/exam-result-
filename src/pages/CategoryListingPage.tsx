import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Calendar,
  Building2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Post, PostCategory } from '../types';
import { PostCard } from '../components/PostCard';
import { CATEGORIES, QUALIFICATIONS, STATES_AND_REGIONS } from '../data/categories';
import { AdSenseUnit } from '../components/AdSenseUnit';

interface CategoryListingPageProps {
  category: PostCategory;
  posts: Post[];
  onSelectPost: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export const CategoryListingPage: React.FC<CategoryListingPageProps> = ({
  category,
  posts,
  onSelectPost,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQualification, setSelectedQualification] = useState('All Qualifications');
  const [selectedState, setSelectedState] = useState('All India / Central');
  const [sortBy, setSortBy] = useState<'latest' | 'closing-soon' | 'popular'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const postsPerPage = 8;

  const currentCategoryInfo = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  // Filter & Sort
  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => p.category === category && p.status === 'published');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.organization.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    if (selectedQualification !== 'All Qualifications') {
      result = result.filter(
        p =>
          p.qualification?.toLowerCase().includes(selectedQualification.toLowerCase()) ||
          selectedQualification.toLowerCase().includes(p.qualification?.toLowerCase() || '')
      );
    }

    if (selectedState !== 'All India / Central') {
      result = result.filter(
        p =>
          p.stateOrCentral?.toLowerCase().includes(selectedState.toLowerCase()) ||
          p.stateOrCentral === 'All India / Central'
      );
    }

    // Sort
    if (sortBy === 'closing-soon') {
      result.sort((a, b) => {
        const dA = a.importantDates?.lastDate || '99/99/9999';
        const dB = b.importantDates?.lastDate || '99/99/9999';
        return dA.localeCompare(dB);
      });
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      result.sort(
        (a, b) =>
          new Date(b.publishedAt || b.createdAt).getTime() -
          new Date(a.publishedAt || a.createdAt).getTime()
      );
    }

    return result;
  }, [posts, category, searchQuery, selectedQualification, selectedState, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Category Header Hero */}
      <div
        className={`p-4 sm:p-8 rounded-2xl border-2 ${currentCategoryInfo.borderColor} bg-white shadow-xs space-y-2 relative overflow-hidden`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span
                className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 sm:px-3 py-0.5 rounded-full ${currentCategoryInfo.badgeBg}`}
              >
                Category Hub
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">
                Updated Daily • Official Direct Notices
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-950 font-serif">
              {currentCategoryInfo.name} 2026
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 sm:mt-1">
              {currentCategoryInfo.tagline}
            </p>
          </div>

          <div className="bg-slate-100 p-2.5 sm:p-3.5 rounded-xl border border-slate-200 text-center shrink-0 min-w-[90px]">
            <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block">Total Available</span>
            <span className="text-xl sm:text-2xl font-black text-blue-950">{filteredPosts.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by keyword / org..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium min-h-[40px]"
            />
          </div>

          {/* Qualification Filter */}
          <div>
            <select
              value={selectedQualification}
              onChange={e => {
                setSelectedQualification(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium text-slate-700 bg-white min-h-[40px]"
            >
              {QUALIFICATIONS.map(q => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={e => {
                setSelectedState(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium text-slate-700 bg-white min-h-[40px]"
            >
              {STATES_AND_REGIONS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By & View Toggle */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium text-slate-700 bg-white min-h-[40px]"
            >
              <option value="latest">Sort: Latest First</option>
              <option value="closing-soon">Sort: Deadline (Closing Soon)</option>
              <option value="popular">Sort: Most Viewed</option>
            </select>

            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shrink-0 min-h-[40px]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-400'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-400'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Tag Pills */}
        {(searchQuery ||
          selectedQualification !== 'All Qualifications' ||
          selectedState !== 'All India / Central') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="font-semibold">Active filters:</span>
            {searchQuery && (
              <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 truncate max-w-[150px]">
                "{searchQuery}"
              </span>
            )}
            {selectedQualification !== 'All Qualifications' && (
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[150px]">
                {selectedQualification}
              </span>
            )}
            {selectedState !== 'All India / Central' && (
              <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 truncate max-w-[150px]">
                {selectedState}
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedQualification('All Qualifications');
                setSelectedState('All India / Central');
              }}
              className="text-rose-600 hover:underline font-bold ml-auto cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Responsive AdSense Category Banner */}
      <AdSenseUnit slot="category_listing_top" />

      {/* Posts Cards Section */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 font-serif">No Examination Notices Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria, clearing qualification filters, or checking back soon for newly published government advertisements.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedQualification('All Qualifications');
              setSelectedState('All India / Central');
            }}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-blue-800 transition min-h-[40px]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
              : 'space-y-3 sm:space-y-4'
          }
        >
          {currentPosts.map(post => (
            <PostCard key={post.id} post={post} onSelect={onSelectPost} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col xs:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs font-medium text-slate-600">
          <div>
            Showing {(currentPage - 1) * postsPerPage + 1} to{' '}
            {Math.min(currentPage * postsPerPage, filteredPosts.length)} of {filteredPosts.length}{' '}
            Notices
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 min-h-[36px]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 rounded-lg font-bold text-xs ${
                  currentPage === num
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 min-h-[36px]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
