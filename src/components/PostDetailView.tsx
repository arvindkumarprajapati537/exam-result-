import React, { useState } from 'react';
import {
  Calendar,
  Building2,
  Bookmark,
  Share2,
  Printer,
  CheckCircle2,
  ExternalLink,
  Users,
  CreditCard,
  UserCheck,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Sparkles,
  Calculator,
  Copy,
  Check,
  Award,
  FileText,
  KeyRound,
  BookOpen,
  GraduationCap,
  Briefcase,
  Activity,
  Send,
  Youtube,
  Globe,
  Radio,
} from 'lucide-react';
import { Post, PhysicalEligibilityItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AgeCalculatorModal } from './AgeCalculatorModal';
import { AdSenseUnit } from './AdSenseUnit';

interface PostDetailViewProps {
  post: Post;
  onBack: () => void;
  onSelectPost: (slug: string) => void;
  allPosts: Post[];
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({
  post,
  onBack,
  onSelectPost,
  allPosts,
}) => {
  const { toggleFavorite, isFavorite } = useAuth();
  const { printPage } = useTheme();
  const saved = isFavorite(post.id);
  const [copied, setCopied] = useState(false);
  const [showAgeCalc, setShowAgeCalc] = useState(false);

  // Null safety fallbacks
  const postCategory = post.category || 'latest-jobs';
  const categoryLabel = (postCategory || 'General').replace(/-/g, ' ');
  const organizationName = post.organization || 'Government Examination Board';
  const postTitle = post.title || 'Official Examination Notice';
  const advtNumber = post.advtNo || 'Advt No. : 2026/Recruit-01';

  // Format dates safely
  const formattedPostDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Recent 2026';

  const formattedUpdateDate = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : formattedPostDate;

  // Social sharing handlers
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(
      `*${postTitle}*\n🏢 ${organizationName}\nCheck Dates, Vacancies, Eligibility & Important Links:\n${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`*${postTitle}*\n${window.location.href}`);
    window.open(`https://t.me/share/url?url=${window.location.href}&text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      '_blank'
    );
  };

  const handleShareTwitter = () => {
    window.open('https://x.com/Arvindk29646455', '_blank');
  };

  // Check if physical eligibility table is needed
  const isPoliceOrDefence =
    post.physicalEligibility && post.physicalEligibility.length > 0
      ? true
      : /police|constable|fireman|army|navy|airforce|defence|gd|daroga|sub-inspector|si|bsf|cisf|crpf|ssb|itbp/i.test(
          `${post.title} ${post.organization} ${post.shortDescription || ''}`
        );

  const defaultPhysicalDetails: PhysicalEligibilityItem[] = [
    {
      category: 'Height',
      male: 'Gen / OBC / SC: 168 CM (ST: 160 CM)',
      female: 'Gen / OBC / SC: 152 CM (ST: 147 CM)',
    },
    {
      category: 'Chest',
      male: '79 - 84 CM (Exp. 5 CM) [ST: 77-82 CM]',
      female: 'Not Applicable (Min Weight 40 KG)',
    },
    {
      category: 'Running Race',
      male: '4.8 KM in 25 Minutes',
      female: '2.4 KM in 14 Minutes',
    },
  ];

  const physicalDetailsToDisplay: PhysicalEligibilityItem[] =
    post.physicalEligibility && post.physicalEligibility.length > 0
      ? post.physicalEligibility
      : isPoliceOrDefence
      ? defaultPhysicalDetails
      : [];

  // Related posts
  const relatedPosts = allPosts
    .filter(
      p =>
        p.id !== post.id &&
        (p.category === postCategory || p.organization === post.organization)
    )
    .slice(0, 4);

  // Category Icon & Accent Colors
  const getCategoryBadge = () => {
    switch (postCategory) {
      case 'results':
        return {
          icon: <Award className="w-4 h-4 text-rose-600" />,
          bg: 'bg-rose-50 border-rose-300 text-rose-800',
          solidBg: 'bg-rose-700',
        };
      case 'admit-card':
        return {
          icon: <FileText className="w-4 h-4 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-300 text-blue-800',
          solidBg: 'bg-blue-700',
        };
      case 'answer-key':
        return {
          icon: <KeyRound className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          solidBg: 'bg-amber-600',
        };
      case 'syllabus':
        return {
          icon: <BookOpen className="w-4 h-4 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-300 text-purple-800',
          solidBg: 'bg-purple-700',
        };
      case 'admissions':
        return {
          icon: <GraduationCap className="w-4 h-4 text-teal-600" />,
          bg: 'bg-teal-50 border-teal-300 text-teal-800',
          solidBg: 'bg-teal-700',
        };
      default:
        return {
          icon: <Briefcase className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
          solidBg: 'bg-emerald-700',
        };
    }
  };

  const catMeta = getCategoryBadge();

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3 sm:space-y-4 pb-16 sm:pb-4">
      {/* 1. Breadcrumbs & Top Navigation Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-900 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer min-h-[36px]"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to All Notices</span>
        </button>

        {/* Quick Utility Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => toggleFavorite(post.id)}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer min-h-[36px] ${
              saved
                ? 'bg-amber-50 text-amber-700 border-amber-300 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition cursor-pointer min-h-[36px]"
            title="Copy Page URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">{copied ? 'Copied' : 'Copy Link'}</span>
            <span className="xs:hidden">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={printPage}
            className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition shadow-2xs cursor-pointer min-h-[36px]"
            title="Print Page / Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Form</span>
          </button>
        </div>
      </div>

      {/* 2. Top Large Advertisement Space (Responsive Banner Placeholder) */}
      <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-3 sm:p-4 text-center">
        <div className="flex flex-col items-center justify-center space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            — Advertisement Space / Google AdSense Responsive Unit —
          </span>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            (Standard 728x90 Leaderboard / 320x100 Mobile Ad Zone for Live Portal Monetization)
          </p>
        </div>
      </div>

      {/* 3. Main Detail Document Container (Classic Indian Portal Table Theme) */}
      <article className="bg-white rounded-xl border-2 border-slate-300 shadow-xs overflow-hidden p-3.5 sm:p-7 space-y-4 sm:space-y-5">
        
        {/* Top Post Info Section */}
        <div className="space-y-2.5 sm:space-y-3 pb-3 border-b-2 border-slate-200">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-0.5 rounded-full border ${catMeta.bg}`}
            >
              {catMeta.icon}
              <span>{categoryLabel}</span>
            </span>

            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold px-2 py-0.5 rounded">
              {post.stateOrCentral || 'All India'}
            </span>

            {post.totalVacancies && (
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2 py-0.5 rounded">
                Vacancies: {post.totalVacancies}
              </span>
            )}
          </div>

          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#0000cc] font-serif leading-tight break-words">
            {postTitle}
          </h1>

          {/* Post Date & Update Date Row */}
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-slate-600 font-medium pt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span><strong>Post Date:</strong> {formattedPostDate}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1 text-red-600 font-semibold">
              <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span><strong>Update Date:</strong> {formattedUpdateDate}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-none">{organizationName}</span>
            </span>
          </div>

          {/* Short Information Summary Box */}
          <div className="p-3 sm:p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-slate-800 text-xs sm:text-sm leading-relaxed">
            <p className="font-bold text-amber-950 mb-1">
              <span className="text-red-600 mr-1">Short Information :</span>
              {organizationName} has issued official recruitment / examination notification for{' '}
              <strong>{postTitle}</strong>.
            </p>
            <p className="text-slate-700">
              {post.shortDescription ||
                'Candidates who are interested and meet all eligibility criteria can check the exam dates, fee rules, age limit, and application process below before applying online.'}
            </p>
            {post.content && (
              <p className="mt-2 text-slate-700 border-t border-amber-200/80 pt-2 font-normal">
                {post.content}
              </p>
            )}
          </div>
        </div>

        {/* 4. Social Share Buttons Ribbon */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Share Notice :</span>
          </span>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <button
              onClick={handleShareWhatsapp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer min-h-[30px]"
            >
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleShareTelegram}
              className="bg-sky-500 hover:bg-sky-600 text-white px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer min-h-[30px]"
            >
              <Send className="w-3 h-3" />
              <span>Telegram</span>
            </button>
            <button
              onClick={handleShareFacebook}
              className="bg-blue-700 hover:bg-blue-800 text-white px-2.5 py-1 rounded transition cursor-pointer min-h-[30px] hidden xs:inline-block"
            >
              Facebook
            </button>
            <button
              onClick={handleShareTwitter}
              className="bg-slate-900 hover:bg-black text-white px-2.5 py-1 rounded transition cursor-pointer min-h-[30px]"
            >
              𝕏 Post
            </button>
          </div>
        </div>

        {/* 5. Main Post Information Box (Centered Bordered Portal Header Box) */}
        <div className="border-2 border-red-700 bg-white rounded-lg p-3 sm:p-5 text-center space-y-1.5 sm:space-y-2">
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-red-700 font-serif uppercase tracking-tight break-words">
            {organizationName}
          </h2>
          <h3 className="text-sm sm:text-lg font-extrabold text-[#0000cc] font-serif break-words">
            {postTitle}
          </h3>
          <p className="text-xs sm:text-sm font-bold text-slate-800 break-words">
            {advtNumber} | Short Details of Notification
          </p>
          <div className="inline-block bg-red-700 text-white text-xs sm:text-sm font-extrabold tracking-wider px-3.5 py-1 rounded">
            WWW.EXAMRESULT.COM
          </div>
        </div>

        {/* 6. Important Dates & Application Fee Responsive Layout */}
        <div className={`grid grid-cols-1 ${post.applicationFee?.enabled !== false && (post.applicationFee?.generalObc || post.applicationFee?.scSt) ? 'md:grid-cols-2' : ''} gap-3 sm:gap-4`}>
          {/* Important Dates Column */}
          <div className="rounded-lg border-2 border-emerald-600 overflow-hidden bg-white">
            <div className="bg-emerald-700 text-white px-3.5 py-2 font-black text-sm uppercase tracking-wide font-serif flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-200" />
                Important Dates
              </span>
              <span className="text-[11px] font-sans font-normal text-emerald-100">Schedule</span>
            </div>
            <div className="p-3 sm:p-3.5 space-y-2 text-xs sm:text-sm">
              {post.importantDates?.applicationBegin && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                  <span className="text-slate-700 font-medium">Application Begin :</span>
                  <span className="font-bold text-slate-900 text-right">
                    {post.importantDates.applicationBegin}
                  </span>
                </div>
              )}

              {post.importantDates?.lastDate && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-red-50/60 px-1.5 rounded gap-2">
                  <span className="text-red-900 font-bold">Last Date for Apply :</span>
                  <span className="font-extrabold text-red-700 text-right">
                    {post.importantDates.lastDate}
                  </span>
                </div>
              )}

              {post.importantDates?.feePaymentLastDate && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                  <span className="text-slate-700 font-medium">Last Date for Fee :</span>
                  <span className="font-bold text-slate-900 text-right">
                    {post.importantDates.feePaymentLastDate}
                  </span>
                </div>
              )}

              {post.importantDates?.correctionDate && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                  <span className="text-slate-700 font-medium">Correction Window :</span>
                  <span className="font-bold text-slate-900 text-right">
                    {post.importantDates.correctionDate}
                  </span>
                </div>
              )}

              {post.importantDates?.examDate && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                  <span className="text-slate-700 font-medium">Exam Date :</span>
                  <span className="font-bold text-blue-900 text-right">
                    {post.importantDates.examDate}
                  </span>
                </div>
              )}

              {post.importantDates?.admitCardDate && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                  <span className="text-slate-700 font-medium">Admit Card Date :</span>
                  <span className="font-bold text-slate-900 text-right">
                    {post.importantDates.admitCardDate}
                  </span>
                </div>
              )}

              {post.importantDates?.answerKeyDate && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                  <span className="text-slate-700 font-medium">Answer Key Date :</span>
                  <span className="font-bold text-amber-700 text-right">
                    {post.importantDates.answerKeyDate}
                  </span>
                </div>
              )}

              {post.importantDates?.objectionLastDate && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                  <span className="text-slate-700 font-medium">Objection Last Date :</span>
                  <span className="font-bold text-red-700 text-right">
                    {post.importantDates.objectionLastDate}
                  </span>
                </div>
              )}

              {post.importantDates?.resultDate && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                  <span className="text-slate-700 font-medium">Result Available :</span>
                  <span className="font-bold text-emerald-800 text-right">
                    {post.importantDates.resultDate}
                  </span>
                </div>
              )}

              {post.importantDates?.customDates && post.importantDates.customDates.map(cd => (
                <div key={cd.id} className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                  <span className="text-slate-700 font-medium">{cd.label} :</span>
                  <span className="font-bold text-slate-900 text-right">{cd.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Application Fee Column (Optional) */}
          {post.applicationFee?.enabled !== false && (post.applicationFee?.generalObc || post.applicationFee?.scSt || post.applicationFee?.paymentMode) && (
            <div className="rounded-lg border-2 border-emerald-600 overflow-hidden bg-white">
              <div className="bg-emerald-700 text-white px-3.5 py-2 font-black text-sm uppercase tracking-wide font-serif flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-200" />
                  Application Fee
                </span>
                <span className="text-[11px] font-sans font-normal text-emerald-100">
                  Fee Details
                </span>
              </div>
              <div className="p-3 sm:p-3.5 space-y-2 text-xs sm:text-sm">
                {post.applicationFee?.generalObc && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                    <span className="text-slate-700 font-medium">General / OBC / EWS :</span>
                    <span className="font-bold text-slate-900 text-right">
                      {post.applicationFee.generalObc}
                    </span>
                  </div>
                )}

                {post.applicationFee?.scSt && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                    <span className="text-slate-700 font-medium">SC / ST :</span>
                    <span className="font-bold text-slate-900 text-right">
                      {post.applicationFee.scSt}
                    </span>
                  </div>
                )}

                {post.applicationFee?.phFemale && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 gap-2">
                    <span className="text-slate-700 font-medium">Female / PH :</span>
                    <span className="font-bold text-slate-900 text-right">{post.applicationFee.phFemale}</span>
                  </div>
                )}

                {post.applicationFee?.paymentMode && (
                  <div className="py-1 border-b border-slate-100">
                    <span className="text-slate-700 font-semibold block text-xs mb-0.5">
                      Payment Mode :
                    </span>
                    <span className="font-medium text-slate-800 text-xs">
                      {post.applicationFee.paymentMode}
                    </span>
                  </div>
                )}

                {post.applicationFee?.notes && (
                  <p className="text-[11px] text-slate-500 italic pt-1">{post.applicationFee.notes}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 7. Age Limit Details Section (Optional) */}
        {post.ageLimit?.enabled !== false && (post.ageLimit?.minAge || post.ageLimit?.maxAge || post.ageLimit?.asOfDate) && (
          <div className="rounded-lg border-2 border-emerald-600 bg-emerald-50/20 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2 mb-3">
              <h3 className="text-xs sm:text-base font-black text-emerald-950 font-serif flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {organizationName} : Age Limit as on {post.ageLimit?.asOfDate || '01/07/2026'}
                </span>
              </h3>

              <button
                onClick={() => setShowAgeCalc(true)}
                className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1 rounded transition self-start sm:self-auto cursor-pointer min-h-[32px]"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Age Calculator</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm">
              <div className="bg-white p-2.5 rounded border border-emerald-200">
                <span className="text-slate-500 block text-xs">Minimum Age :</span>
                <span className="font-bold text-slate-900 text-sm">
                  {post.ageLimit?.minAge ? `${post.ageLimit.minAge} Years.` : '18 Years (as per rules)'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded border border-emerald-200">
                <span className="text-slate-500 block text-xs">Maximum Age :</span>
                <span className="font-bold text-slate-900 text-sm">
                  {post.ageLimit?.maxAge ? `${post.ageLimit.maxAge} Years.` : 'As per Post Rules'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded border border-emerald-200 sm:col-span-3 lg:col-span-1">
                <span className="text-slate-500 block text-xs">Age Relaxation :</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {post.ageLimit?.relaxationDetails ||
                    'Age Relaxation Extra as per Official Recruitment Rules.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 8. Vacancy Details Section (Bordered Portal Table with Responsive Horizontal Scroll) */}
        {post.vacancyDetails && post.vacancyDetails.length > 0 && (
          <div className="space-y-2">
            <div className="bg-emerald-700 text-white px-3.5 py-2 rounded-t-lg font-black text-xs sm:text-sm uppercase tracking-wide font-serif flex items-center justify-between">
              <span className="flex items-center gap-1.5 truncate">
                <Users className="w-4 h-4 text-emerald-200 shrink-0" />
                <span className="truncate">Vacancy & Eligibility Details</span>
              </span>
              {post.totalVacancies && (
                <span className="text-xs font-bold bg-white text-emerald-900 px-2 py-0.5 rounded shrink-0 ml-2">
                  Total : {post.totalVacancies}
                </span>
              )}
            </div>

            <div className="overflow-x-auto scrollbar-thin rounded-b-lg border-2 border-emerald-600 bg-white">
              <table className="min-w-[500px] w-full divide-y-2 divide-slate-200 text-xs sm:text-sm text-left">
                <thead className="bg-slate-100 text-slate-900 font-serif uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200">Post Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                      Total Post
                    </th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Category Breakdown</th>
                    <th className="py-2.5 px-3">Eligibility Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {post.vacancyDetails.map((vac, idx) => (
                    <tr key={vac.id || idx} className="hover:bg-blue-50/40 transition">
                      <td className="py-2.5 px-3 font-bold text-[#0000cc] border-r border-slate-200 align-top">
                        {vac.postName}
                      </td>
                      <td className="py-2.5 px-3 font-black text-red-600 text-center border-r border-slate-200 align-top whitespace-nowrap">
                        {vac.totalPosts}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-700 border-r border-slate-200 align-top">
                        {vac.ur !== undefined ? (
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-mono">
                            <span>UR : {vac.ur}</span>
                            <span>OBC : {vac.obc}</span>
                            <span>EWS : {vac.ews}</span>
                            <span>SC : {vac.sc}</span>
                            <span>ST : {vac.st}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Category-wise reserved</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-800 leading-relaxed align-top min-w-[200px]">
                        {vac.eligibility}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 italic text-right sm:hidden">👉 Scroll table horizontally to view full columns</p>
          </div>
        )}

        {/* 9. Physical Eligibility Details Section (Conditional - Police / Defence / Constable / Security) */}
        {physicalDetailsToDisplay.length > 0 && (
          <div className="space-y-2">
            <div className="bg-red-700 text-white px-3.5 py-2 rounded-t-lg font-black text-xs sm:text-sm uppercase tracking-wide font-serif flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Physical Eligibility Standards</span>
              </span>
              <span className="text-[11px] font-sans font-normal text-amber-200">
                PST / PET
              </span>
            </div>

            <div className="overflow-x-auto scrollbar-thin rounded-b-lg border-2 border-red-700 bg-white">
              <table className="min-w-[480px] w-full divide-y-2 divide-slate-200 text-xs sm:text-sm text-left">
                <thead className="bg-slate-100 text-slate-900 font-serif uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200">Category / Parameter</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Male Candidate</th>
                    <th className="py-2.5 px-3">Female Candidate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {physicalDetailsToDisplay.map((item, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/40 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                        {item.category}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-200">
                        {item.male}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {item.female}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 italic text-right sm:hidden">👉 Scroll table horizontally to view all standards</p>
          </div>
        )}

        {/* 10. Educational Eligibility Summary */}
        {post.eligibilitySummary && (
          <div className="p-3 sm:p-3.5 rounded-lg bg-blue-50/80 border border-blue-200 text-xs sm:text-sm space-y-1">
            <span className="font-bold text-blue-950 block">Eligibility Summary :</span>
            <p className="text-slate-800 leading-relaxed">{post.eligibilitySummary}</p>
          </div>
        )}

        {/* 11. How to Apply Section (Numbered List) */}
        {post.howToApply && post.howToApply.length > 0 && (
          <div className="rounded-lg border-2 border-blue-700 bg-blue-50/20 p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
            <h3 className="text-xs sm:text-base font-black text-blue-950 font-serif flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
              <span>How to Fill {postTitle} Online Form 2026</span>
            </h3>
            <ol className="space-y-2 text-xs sm:text-sm text-slate-800 list-decimal list-inside leading-relaxed">
              {post.howToApply.map((step, idx) => (
                <li key={idx} className="pl-1">
                  <span className="font-medium text-slate-900">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 12. Important Instructions Banner */}
        <div className="bg-red-50 border-2 border-red-500 p-3 sm:p-3.5 rounded-lg text-center text-xs sm:text-sm text-red-950 font-bold leading-relaxed space-y-1">
          <p className="text-red-700 uppercase tracking-wide">
            ★ {post.importantInstructions || `Interested Candidates Can Read the Full ${postTitle} Notification Before Apply Online`} ★
          </p>
        </div>

        {/* 13. Mobile Updates Promotion Section */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse shrink-0" />
              <span>Get Free EXAM RESULT Updates on Your Phone</span>
            </h4>
            <p className="text-xs text-slate-300">
              Join official WhatsApp, Telegram & YouTube channels for fastest admit card and result alerts.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://whatsapp.com/channel/0029VbDExHh8fewu2xmVj03M"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded transition min-h-[36px] flex items-center"
            >
              WhatsApp
            </a>
            <a
              href="https://t.me/examresult0156"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-3 py-1.5 rounded transition min-h-[36px] flex items-center"
            >
              Telegram
            </a>
            <a
              href="https://www.youtube.com/@Arvindofficial345"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded transition min-h-[36px] flex items-center"
            >
              YouTube
            </a>
          </div>
        </div>

        {/* Responsive In-Content AdSense Unit */}
        <AdSenseUnit slot="post_detail_middle" className="my-3" />

        {/* 14. Useful Important Links Table (High Visibility Portal Links) */}
        <div className="space-y-2 pt-2">
          <div className="bg-red-700 text-white px-3.5 py-2.5 rounded-t-lg font-black text-sm sm:text-base uppercase tracking-wide font-serif text-center">
            Useful Important Links
          </div>

          <div className="overflow-x-auto scrollbar-thin rounded-b-lg border-2 border-red-700 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
              <tbody className="divide-y divide-slate-200">
                {post.importantLinks && post.importantLinks.filter(l => l.enabled !== false && l.url && l.url.trim() !== '#' && l.url.trim() !== '').length > 0 ? (
                  post.importantLinks
                    .filter(l => l.enabled !== false && l.url && l.url.trim() !== '#' && l.url.trim() !== '')
                    .map((lnk, idx) => (
                    <tr key={lnk.id || idx} className="hover:bg-red-50/30 transition">
                      <td className="py-2.5 px-3 sm:px-3.5 font-extrabold text-slate-900 border-r border-slate-200">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-red-600 font-black">•</span>
                          <span>{lnk.label}</span>
                          {lnk.badge && (
                            <span className="bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded ml-1 animate-pulse">
                              {lnk.badge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-3.5 text-center whitespace-nowrap w-[130px] sm:w-[150px]">
                        <a
                          href={lnk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 bg-[#0000cc] hover:bg-red-600 text-white font-extrabold text-xs px-3 sm:px-4 py-1.5 rounded shadow-xs transition min-h-[34px]"
                        >
                          <span>Click Here</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 border-r border-slate-200">
                      Official Portal Website
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <a
                        href={post.officialWebsite || 'https://gov.in'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-[#0000cc] text-white font-bold text-xs px-4 py-1.5 rounded min-h-[34px]"
                      >
                        <span>Click Here</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                )}

                {/* Additional Official Website Row */}
                {post.officialWebsite && (
                  <tr className="hover:bg-slate-50 transition bg-slate-50/50">
                    <td className="py-2.5 px-3 sm:px-3.5 font-extrabold text-slate-900 border-r border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Official Website</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-3.5 text-center whitespace-nowrap">
                      <a
                        href={post.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-black text-white font-bold text-xs px-3 sm:px-4 py-1.5 rounded transition min-h-[34px]"
                      >
                        <span>Click Here</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 15. Disclaimer Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs text-amber-900 leading-relaxed">
          <p className="font-bold flex items-center gap-1 mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Candidate Advisory :
          </p>
          <p>
            <strong>EXAM RESULT</strong> is a free educational information service portal. While every effort is made to maintain accurate information, candidates are advised to verify details with the official advertisement on <strong>{organizationName}</strong> before making any online payment or submitting applications.
          </p>
        </div>
      </article>

      {/* Sticky Mobile Action Bar for candidates */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-300 p-2.5 shadow-xl flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 min-h-[40px] shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {post.importantLinks && post.importantLinks.find(l => l.enabled !== false && l.url && l.url !== '#') ? (
          <a
            href={post.importantLinks.find(l => l.enabled !== false && l.url && l.url !== '#')?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 shadow-sm min-h-[40px]"
          >
            <span>{post.importantLinks.find(l => l.enabled !== false && l.url && l.url !== '#')?.label || 'Open Important Link'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : post.officialWebsite ? (
          <a
            href={post.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#0000cc] hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 shadow-sm min-h-[40px]"
          >
            <span>Visit Official Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}

        <button
          onClick={handleShareWhatsapp}
          className="p-2 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center min-h-[40px] min-w-[40px] shrink-0"
          title="Share on WhatsApp"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* 16. Related Posts / Recommended Updates Grid */}
      {relatedPosts.length > 0 && (
        <section className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 sm:space-y-3">
          <h3 className="text-xs sm:text-base font-black text-slate-900 font-serif flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>More Examinations & Results You May Be Interested In</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {relatedPosts.map(rel => (
              <div
                key={rel.id}
                onClick={() => onSelectPost(rel.slug)}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded">
                    {rel.organization?.split('(')[0] || 'Govt'}
                  </span>
                  <h4 className="font-bold text-xs sm:text-[13px] text-[#0000cc] group-hover:text-red-600 group-hover:underline transition mt-1 line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-red-600 font-semibold truncate max-w-[180px]">
                    {rel.importantDates?.lastDate
                      ? `Last Date: ${rel.importantDates.lastDate}`
                      : rel.importantDates?.examDate
                      ? `Exam: ${rel.importantDates.examDate}`
                      : 'Active'}
                  </span>
                  <span className="font-bold text-blue-800 shrink-0 ml-1">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Age Calculator Modal */}
      {showAgeCalc && (
        <AgeCalculatorModal
          asOfDate={post.ageLimit?.asOfDate || '01/07/2026'}
          minAge={post.ageLimit?.minAge}
          maxAge={post.ageLimit?.maxAge}
          onClose={() => setShowAgeCalc(false)}
        />
      )}
    </div>
  );
};
