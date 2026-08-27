import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  ArrowLeft,
  Calendar,
  Building2,
  FileText,
  Save,
  X,
  ExternalLink,
  Sparkles,
  Layers,
  TrendingUp,
  Briefcase,
  Link as LinkIcon,
  Globe,
  Trash,
  Database,
  ArrowUp,
  ArrowDown,
  LogOut,
  AlertTriangle,
  Award,
  KeyRound,
  BookOpen,
  GraduationCap,
  Activity,
  Check,
  Clock,
  Filter,
} from 'lucide-react';
import {
  Post,
  PostCategory,
  ImportantLink,
  VacancyItem,
  PhysicalEligibilityItem,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { CATEGORIES, QUALIFICATIONS, STATES_AND_REGIONS } from '../data/categories';

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void;
  onSelectPost: (slug: string) => void;
  initialTab?: 'dashboard' | 'posts' | 'new-post';
  editId?: string | null;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  onSelectPost,
  initialTab = 'dashboard',
  editId = null,
}) => {
  const { user, logout } = useAuth();
  const { posts, stats, createPost, updatePost, deletePost, fetchPosts } = usePosts();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'new-post'>(() => {
    if (editId) return 'new-post';
    return initialTab;
  });

  const [editingPostId, setEditingPostId] = useState<string | null>(editId);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [successNotice, setSuccessNotice] = useState<{ title: string; message: string; postSlug?: string; postId?: string } | null>(null);

  // Delete Confirmation Modal State
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Blank Form Template
  const getBlankFormData = (category: PostCategory = 'latest-jobs'): Partial<Post> => ({
    title: '',
    slug: '',
    category,
    organization: '',
    advtNo: 'Advt No. 01/2026',
    qualification: 'Graduate',
    stateOrCentral: 'All India / Central',
    totalVacancies: '',
    shortDescription: '',
    content: '',
    status: 'published',
    isFeatured: false,
    importantDates: {
      applicationBegin: 'Available Now',
      lastDate: '',
      feePaymentLastDate: '',
      correctionDate: '',
      examDate: '',
      admitCardDate: '',
      resultDate: '',
      answerKeyDate: '',
      objectionLastDate: '',
      customDates: [],
    },
    applicationFee: {
      enabled: category === 'latest-jobs' || category === 'admissions',
      generalObc: '₹ 100/-',
      scSt: '₹ 0/-',
      phFemale: '₹ 0/-',
      paymentMode: 'Online Net Banking / Debit Card / Credit Card / UPI',
      notes: '',
    },
    ageLimit: {
      enabled: category === 'latest-jobs' || category === 'admissions',
      minAge: 18,
      maxAge: 30,
      asOfDate: '01/07/2026',
      relaxationDetails: 'Age Relaxation Extra as per Official Recruitment Rules.',
    },
    vacancyDetails: category === 'latest-jobs' ? [
      {
        id: '1',
        postName: 'Officer / Executive',
        totalPosts: '100',
        ur: '40',
        obc: '27',
        ews: '10',
        sc: '15',
        st: '8',
        eligibility: "Bachelor's Degree in any stream from recognized University in India.",
      },
    ] : [],
    physicalEligibility: [],
    eligibilitySummary: '',
    howToApply: [
      'Candidate can apply online through official portal before the last date.',
      'Read the official notification carefully before filling the application form.',
      'Check and collect all documents: Eligibility ID proof, Address details, and Basic information.',
      'Scan and upload Photograph, Signature, ID Proof, and Educational Marksheets.',
      'Pay required application fee as per your candidate category.',
      'Take a final printout of submitted application form for future reference.',
    ],
    importantInstructions: 'Interested Candidates Can Read the Full Official Notification Before Apply Online.',
    importantLinks: [
      { id: 'link-1', label: 'Apply Online (Registration & Login)', url: 'https://gov.in', type: 'apply', badge: 'Active', enabled: true },
      { id: 'link-2', label: 'Download Detailed Official Notification', url: 'https://gov.in', type: 'notification', badge: 'PDF', enabled: true },
      { id: 'link-3', label: 'Official Portal Website', url: 'https://gov.in', type: 'official', enabled: true },
    ],
    metaTitle: '',
    metaDescription: '',
  });

  const [formData, setFormData] = useState<Partial<Post>>(() => getBlankFormData());

  // Load editing post data if editId is provided
  useEffect(() => {
    if (editId) {
      const found = posts.find(p => p.id === editId || p.slug === editId);
      if (found) {
        setEditingPostId(found.id);
        setFormData(found);
        setActiveTab('new-post');
      }
    }
  }, [editId, posts]);

  // Sync tab with initialTab when prop changes
  useEffect(() => {
    if (initialTab && initialTab !== activeTab && !editingPostId) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Guard admin access: if unauthenticated or unauthorized role, show Access Denied
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto text-rose-600 shadow-sm border border-rose-200">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 font-serif tracking-tight">Access Denied</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            You are not authorized to access this page.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/admin/login')}
          className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-sm transition shadow-md cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    );
  }

  const handleSlugify = (text: string) => {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: prev.slug || handleSlugify(val),
      metaTitle: `${val} 2026 - Apply Online, Dates & Eligibility | EXAM RESULT`,
      metaDescription: `Apply for ${val}. Check official dates, vacancies, eligibility rules, and official links.`,
    }));
  };

  const handleCategoryChange = (cat: PostCategory) => {
    setFormData(prev => {
      // Dynamic presets depending on category
      let updatedLinks = prev.importantLinks || [];
      if (cat === 'results') {
        updatedLinks = [
          { id: 'link-1', label: 'Download Exam Result / Scorecard', url: 'https://gov.in', type: 'result', badge: 'Active', enabled: true },
          { id: 'link-2', label: 'Download Cutoff Marks / Merit List', url: 'https://gov.in', type: 'result', badge: 'PDF', enabled: true },
          { id: 'link-3', label: 'Official Examination Website', url: 'https://gov.in', type: 'official', enabled: true },
        ];
      } else if (cat === 'admit-card') {
        updatedLinks = [
          { id: 'link-1', label: 'Download Admit Card / Hall Ticket', url: 'https://gov.in', type: 'admit_card', badge: 'Active', enabled: true },
          { id: 'link-2', label: 'Check Exam City Intimation Slip', url: 'https://gov.in', type: 'schedule', badge: 'Server I', enabled: true },
          { id: 'link-3', label: 'Official Portal Website', url: 'https://gov.in', type: 'official', enabled: true },
        ];
      } else if (cat === 'answer-key') {
        updatedLinks = [
          { id: 'link-1', label: 'Download Answer Key & Question Paper', url: 'https://gov.in', type: 'answer_key', badge: 'Active', enabled: true },
          { id: 'link-2', label: 'Submit Online Objections (Key Challenge)', url: 'https://gov.in', type: 'other', badge: 'Active', enabled: true },
          { id: 'link-3', label: 'Official Website', url: 'https://gov.in', type: 'official', enabled: true },
        ];
      } else if (cat === 'syllabus') {
        updatedLinks = [
          { id: 'link-1', label: 'Download Full Syllabus & Pattern PDF', url: 'https://gov.in', type: 'syllabus', badge: 'PDF', enabled: true },
          { id: 'link-2', label: 'Download Previous Year Question Papers', url: 'https://gov.in', type: 'syllabus', enabled: true },
          { id: 'link-3', label: 'Official Website', url: 'https://gov.in', type: 'official', enabled: true },
        ];
      }

      return {
        ...prev,
        category: cat,
        importantLinks: updatedLinks,
        applicationFee: {
          ...prev.applicationFee,
          enabled: cat === 'latest-jobs' || cat === 'admissions',
        },
        ageLimit: {
          ...prev.ageLimit,
          enabled: cat === 'latest-jobs' || cat === 'admissions',
        },
      };
    });
  };

  const handleStartNewPost = () => {
    setEditingPostId(null);
    setFormData(getBlankFormData('latest-jobs'));
    setActiveTab('new-post');
    onNavigate('/admin/posts/new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditClick = (post: Post) => {
    setEditingPostId(post.id);
    setFormData(post);
    setActiveTab('new-post');
    onNavigate(`/admin/posts/edit/${post.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    await deletePost(postToDelete.id);
    setIsDeleting(false);
    setPostToDelete(null);
    setSuccessNotice({
      title: 'Post Deleted Permanently',
      message: `"${postToDelete.title}" has been deleted and removed from all public pages.`,
    });
  };

  const handleToggleStatus = async (post: Post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await updatePost(post.id, { status: newStatus });
    setSuccessNotice({
      title: newStatus === 'published' ? 'Post Published' : 'Post Moved to Drafts',
      message: `"${post.title}" is now ${newStatus}.`,
      postSlug: newStatus === 'published' ? post.slug : undefined,
    });
  };

  const handleSavePost = async (targetStatus: 'draft' | 'published') => {
    if (!formData.title?.trim() || !formData.organization?.trim()) {
      alert('Please provide at least Post Title and Organization/Department.');
      return;
    }

    const payloadSlug = formData.slug?.trim() || handleSlugify(formData.title);

    const payload: Partial<Post> = {
      ...formData,
      title: formData.title.trim(),
      organization: formData.organization.trim(),
      slug: payloadSlug,
      status: targetStatus,
      publishedAt: formData.publishedAt || new Date().toISOString(),
    };

    let result;
    if (editingPostId) {
      result = await updatePost(editingPostId, payload);
    } else {
      result = await createPost(payload);
    }

    if (result.success) {
      setSuccessNotice({
        title: targetStatus === 'published' ? 'Post Published Successfully!' : 'Post Saved as Draft!',
        message: targetStatus === 'published'
          ? `"${payload.title}" is now LIVE on the public website and searchable.`
          : `"${payload.title}" is saved as draft and hidden from public visitors.`,
        postSlug: payloadSlug,
        postId: result.post?.id || editingPostId || undefined,
      });
      setActiveTab('posts');
      onNavigate('/admin/posts');
    } else {
      alert(result.error || 'Failed to save notice');
    }
  };

  // Helper functions for Dynamic Vacancy Details
  const handleAddVacancyRow = () => {
    setFormData(prev => ({
      ...prev,
      vacancyDetails: [
        ...(prev.vacancyDetails || []),
        {
          id: `vac-${Date.now()}`,
          postName: '',
          totalPosts: '',
          ur: '',
          obc: '',
          ews: '',
          sc: '',
          st: '',
          eligibility: '',
        },
      ],
    }));
  };

  const handleRemoveVacancyRow = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      vacancyDetails: (prev.vacancyDetails || []).filter((_, i) => i !== idx),
    }));
  };

  const handleVacancyFieldChange = (idx: number, field: keyof VacancyItem, val: string | number) => {
    setFormData(prev => {
      const updated = [...(prev.vacancyDetails || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, vacancyDetails: updated };
    });
  };

  // Helper functions for Dynamic Physical Eligibility
  const handleAddPhysicalRow = () => {
    setFormData(prev => ({
      ...prev,
      physicalEligibility: [
        ...(prev.physicalEligibility || []),
        {
          id: `pe-${Date.now()}`,
          category: 'Height',
          male: '',
          female: '',
        },
      ],
    }));
  };

  const handleRemovePhysicalRow = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      physicalEligibility: (prev.physicalEligibility || []).filter((_, i) => i !== idx),
    }));
  };

  const handlePhysicalFieldChange = (idx: number, field: keyof PhysicalEligibilityItem, val: string) => {
    setFormData(prev => {
      const updated = [...(prev.physicalEligibility || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, physicalEligibility: updated };
    });
  };

  // Helper functions for How to Apply Steps
  const handleAddApplyStep = () => {
    setFormData(prev => ({
      ...prev,
      howToApply: [...(prev.howToApply || []), ''],
    }));
  };

  const handleRemoveApplyStep = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      howToApply: (prev.howToApply || []).filter((_, i) => i !== idx),
    }));
  };

  const handleApplyStepChange = (idx: number, val: string) => {
    setFormData(prev => {
      const updated = [...(prev.howToApply || [])];
      updated[idx] = val;
      return { ...prev, howToApply: updated };
    });
  };

  const handleMoveApplyStep = (idx: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const list = [...(prev.howToApply || [])];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, howToApply: list };
    });
  };

  // Helper functions for Important Links Manager
  const handleAddLinkRow = () => {
    setFormData(prev => ({
      ...prev,
      importantLinks: [
        ...(prev.importantLinks || []),
        {
          id: `link-${Date.now()}`,
          label: '',
          url: '',
          type: 'other',
          badge: '',
          enabled: true,
        },
      ],
    }));
  };

  const handleRemoveLinkRow = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      importantLinks: (prev.importantLinks || []).filter((_, i) => i !== idx),
    }));
  };

  const handleLinkFieldChange = (idx: number, field: keyof ImportantLink, val: any) => {
    setFormData(prev => {
      const updated = [...(prev.importantLinks || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, importantLinks: updated };
    });
  };

  const handleMoveLink = (idx: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const list = [...(prev.importantLinks || [])];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, importantLinks: list };
    });
  };

  // Helper functions for Dynamic Custom Dates
  const handleAddCustomDate = () => {
    setFormData(prev => ({
      ...prev,
      importantDates: {
        ...prev.importantDates,
        customDates: [
          ...(prev.importantDates?.customDates || []),
          { id: `cd-${Date.now()}`, label: 'Special Date', value: '' },
        ],
      },
    }));
  };

  const handleRemoveCustomDate = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      importantDates: {
        ...prev.importantDates,
        customDates: (prev.importantDates?.customDates || []).filter((_, i) => i !== idx),
      },
    }));
  };

  const handleCustomDateFieldChange = (idx: number, field: 'label' | 'value', val: string) => {
    setFormData(prev => {
      const updated = [...(prev.importantDates?.customDates || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return {
        ...prev,
        importantDates: {
          ...prev.importantDates,
          customDates: updated,
        },
      };
    });
  };

  // Filter posts for the management list
  const filteredPosts = posts.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.organization.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.qualification?.toLowerCase().includes(q)
    );
  });

  // Recent posts for Dashboard tab
  const recentPosts = posts.slice(0, 8);

  const getCategoryBadgeClass = (category: PostCategory) => {
    switch (category) {
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
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Top Admin Master Navigation Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md border-2 border-amber-500/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
              CMS Admin Control
            </span>
            <span className="text-xs text-slate-400">
              Logged in as <strong className="text-white">{user.name}</strong> ({user.email})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-white tracking-tight">
            EXAM RESULT Content Management System
          </h1>
        </div>

        {/* Global Tab Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              onNavigate('/admin/dashboard');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('posts');
              onNavigate('/admin/posts');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'posts'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage All Posts ({posts.length})</span>
          </button>

          <button
            onClick={handleStartNewPost}
            className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
              activeTab === 'new-post' && !editingPostId
                ? 'bg-emerald-500 text-white font-black'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD NEW UPDATE</span>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
            title="Open Public Portal"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Website</span>
          </button>

          <button
            onClick={() => {
              logout();
              onNavigate('/admin/login');
            }}
            className="p-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Sign Out Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-950 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm text-emerald-900">{successNotice.title}</h4>
              <p className="text-xs text-emerald-800">{successNotice.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {successNotice.postSlug && (
              <button
                onClick={() => onSelectPost(successNotice.postSlug!)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <span>View Public Post</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: DASHBOARD OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Statistics Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Posts</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.totalPosts || posts.length}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">All Notices</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Published (Live)</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {stats?.publishedPosts ?? posts.filter(p => p.status === 'published').length}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Public Live</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Drafts (Hidden)</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-amber-700">
                  {stats?.draftPosts ?? posts.filter(p => p.status === 'draft').length}
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Unpublished</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Latest Jobs</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-blue-900">
                  {posts.filter(p => p.category === 'latest-jobs').length}
                </span>
                <Briefcase className="w-5 h-5 text-blue-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">Results</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-rose-900">
                  {posts.filter(p => p.category === 'results').length}
                </span>
                <Award className="w-5 h-5 text-rose-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">Admit Cards</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-sky-900">
                  {posts.filter(p => p.category === 'admit-card').length}
                </span>
                <FileText className="w-5 h-5 text-sky-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Answer Keys</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-amber-900">
                  {posts.filter(p => p.category === 'answer-key').length}
                </span>
                <KeyRound className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Total Syllabus Posts</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-purple-900">
                  {posts.filter(p => p.category === 'syllabus').length}
                </span>
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">Total Admission Posts</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-teal-900">
                  {posts.filter(p => p.category === 'admissions').length}
                </span>
                <GraduationCap className="w-5 h-5 text-teal-400" />
              </div>
            </div>
          </div>

          {/* Quick Actions Ribbon */}
          <div className="bg-amber-500/10 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-sm font-black text-slate-900">Quick Administrator Actions</h3>
                <p className="text-xs text-slate-600">Instantly publish government notices, results, or exam admit cards</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleStartNewPost}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ ADD NEW UPDATE</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('posts');
                  onNavigate('/admin/posts');
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Manage Posts</span>
              </button>
              <button
                onClick={() => onNavigate('/')}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>View Public Website</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  onNavigate('/admin/login');
                }}
                className="bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-bold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Recent Posts Table on Dashboard */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-serif">Recent Examination Posts</h3>
                <p className="text-xs text-slate-500">Latest updates added or modified in the system</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('posts');
                  onNavigate('/admin/posts');
                }}
                className="text-xs font-bold text-blue-800 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>View Full Posts Table →</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm text-left">
                <thead className="bg-slate-100 text-slate-800 uppercase font-serif text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Post Title & Department</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Publish Date</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentPosts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{post.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{post.organization}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border capitalize ${getCategoryBadgeClass(post.category)}`}>
                          {post.category.replace(/-/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          <span className="capitalize">{post.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(post)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition cursor-pointer"
                            title="Edit Post"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(post)}
                            className={`px-2 py-1 text-[10px] font-extrabold rounded transition cursor-pointer ${
                              post.status === 'published'
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title={post.status === 'published' ? 'Unpublish to Draft' : 'Publish to Live Site'}
                          >
                            {post.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          {post.status === 'published' && (
                            <button
                              onClick={() => onSelectPost(post.slug)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                              title="View Public Post"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setPostToDelete(post)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: MANAGE ALL POSTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {/* Header Controls & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-serif">All Examination Notices & Updates</h2>
                <p className="text-xs text-slate-500">
                  Showing {filteredPosts.length} of {posts.length} posts
                </p>
              </div>
              <button
                onClick={handleStartNewPost}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ ADD NEW UPDATE</span>
              </button>
            </div>

            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Search by title, organization, or slug..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">All Categories ({posts.length})</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({posts.filter(p => p.category === cat.id).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">All Statuses (Published & Drafts)</option>
                  <option value="published">Only Published ({posts.filter(p => p.status === 'published').length})</option>
                  <option value="draft">Only Drafts ({posts.filter(p => p.status === 'draft').length})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Posts Management Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm text-left">
                <thead className="bg-slate-100 text-slate-800 uppercase font-serif text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Post Title & Department</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Views</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                      <tr key={post.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 max-w-md">
                          <div className="font-bold text-slate-900 leading-snug">{post.title}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{post.organization}</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-[11px] text-slate-400">/post/{post.slug}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border capitalize ${getCategoryBadgeClass(post.category)}`}>
                            {post.category.replace(/-/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              post.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                            <span className="capitalize">{post.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-xs font-mono text-slate-600">
                          {post.views || 0}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN') : 'Recent'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(post)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition cursor-pointer"
                              title="Edit Post"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(post)}
                              className={`px-2.5 py-1 text-[11px] font-extrabold rounded transition cursor-pointer ${
                                post.status === 'published'
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                              }`}
                              title={post.status === 'published' ? 'Change to Draft' : 'Publish to Live'}
                            >
                              {post.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            {post.status === 'published' && (
                              <button
                                onClick={() => onSelectPost(post.slug)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                title="View Public Post"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setPostToDelete(post)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <div className="max-w-xs mx-auto space-y-2">
                          <p className="font-bold text-slate-700">No examination posts found matching your filters.</p>
                          <p className="text-xs text-slate-400">Try clearing the search query or category filter.</p>
                          <button
                            onClick={() => {
                              setSearchFilter('');
                              setCategoryFilter('all');
                              setStatusFilter('all');
                            }}
                            className="text-xs text-blue-700 font-bold underline cursor-pointer"
                          >
                            Reset all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ADD / EDIT POST FORM TAB */}
      {/* ========================================================================= */}
      {activeTab === 'new-post' && (
        <div className="space-y-6">
          {/* Top Form Header Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('posts');
                  onNavigate('/admin/posts');
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                title="Back to Posts"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900 font-serif">
                  {editingPostId ? `Edit Examination Post: ${formData.title || ''}` : 'Add New Government Examination / Job Post'}
                </h2>
                <p className="text-xs text-slate-500">
                  Fill in the details below. Required fields are marked with an asterisk (*).
                </p>
              </div>
            </div>

            {/* Quick Publish / Draft Buttons on Header */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSavePost('draft')}
                className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE AS DRAFT</span>
              </button>
              <button
                type="button"
                onClick={() => handleSavePost('published')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>PUBLISH NOW</span>
              </button>
            </div>
          </div>

          <form onSubmit={e => { e.preventDefault(); handleSavePost('published'); }} className="space-y-6">
            {/* Section 1: Basic Post Information */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 font-serif border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>1. Basic Post Information & Category</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Post Category (Adapts form behavior) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Post Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => handleCategoryChange(e.target.value as PostCategory)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="latest-jobs">Latest Jobs (Recruitment)</option>
                    <option value="results">Results (Exam Result / Scorecard)</option>
                    <option value="admit-card">Admit Card (Hall Ticket / Exam Slip)</option>
                    <option value="answer-key">Answer Key (Key & Objections)</option>
                    <option value="syllabus">Syllabus (Pattern & PDF)</option>
                    <option value="admissions">Admissions (Admission Notice)</option>
                    <option value="latest-updates">Important Updates</option>
                  </select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Publish Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-sm bg-slate-50 focus:bg-white"
                  >
                    <option value="published">Published (Visible Publicly on Website)</option>
                    <option value="draft">Draft (Hidden from Public)</option>
                  </select>
                </div>

                {/* Post Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Post Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="e.g. UP Police Constable Recruitment 2026 Online Form"
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Organization / Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Organization / Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organization || ''}
                    onChange={e => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                    placeholder="e.g. Uttar Pradesh Police Recruitment & Promotion Board (UPPRPB)"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Advertisement / Notice Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Advt / Notification No.
                  </label>
                  <input
                    type="text"
                    value={formData.advtNo || ''}
                    onChange={e => setFormData(prev => ({ ...prev, advtNo: e.target.value }))}
                    placeholder="e.g. Advt No. : 01/2026 or CEN 02/2026"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                {/* State / Central Jurisdiction */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    State / Central Jurisdiction
                  </label>
                  <select
                    value={formData.stateOrCentral}
                    onChange={e => setFormData(prev => ({ ...prev, stateOrCentral: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    {STATES_AND_REGIONS.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Minimum Qualification */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Minimum Qualification
                  </label>
                  <select
                    value={formData.qualification}
                    onChange={e => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    {QUALIFICATIONS.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                {/* Total Vacancies */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Vacancies / Seats (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.totalVacancies || ''}
                    onChange={e => setFormData(prev => ({ ...prev, totalVacancies: e.target.value }))}
                    placeholder="e.g. 60,244 Posts"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm font-bold text-emerald-800"
                  />
                </div>

                {/* URL Slug */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    URL Slug (Unique Page Link) *
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-2.5 border border-r-0 border-slate-300 rounded-l-lg font-mono">
                      /post/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.slug || ''}
                      onChange={e => setFormData(prev => ({ ...prev, slug: handleSlugify(e.target.value) }))}
                      placeholder="up-police-constable-2026"
                      className="w-full p-2.5 rounded-r-lg border border-slate-300 text-xs font-mono font-bold text-blue-900"
                    />
                  </div>
                </div>

                {/* Short Information Summary */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Short Information (Summary Notice) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.shortDescription || ''}
                    onChange={e => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Brief description of the recruitment, eligibility, dates, and instructions for candidates..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Important Dates Section */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-black text-slate-900 font-serif flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>2. Important Dates Schedule</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddCustomDate}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded transition cursor-pointer"
                >
                  + Add Custom Date Field
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Application Begin</label>
                  <input
                    type="text"
                    value={formData.importantDates?.applicationBegin || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      importantDates: { ...prev.importantDates, applicationBegin: e.target.value },
                    }))}
                    placeholder="e.g. 01/03/2026"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-red-700 mb-1">Last Date for Apply Online</label>
                  <input
                    type="text"
                    value={formData.importantDates?.lastDate || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      importantDates: { ...prev.importantDates, lastDate: e.target.value },
                    }))}
                    placeholder="e.g. 31/03/2026"
                    className="w-full p-2 rounded border border-red-300 font-bold text-red-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fee Payment Last Date</label>
                  <input
                    type="text"
                    value={formData.importantDates?.feePaymentLastDate || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      importantDates: { ...prev.importantDates, feePaymentLastDate: e.target.value },
                    }))}
                    placeholder="e.g. 02/04/2026"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correction Window Date</label>
                  <input
                    type="text"
                    value={formData.importantDates?.correctionDate || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      importantDates: { ...prev.importantDates, correctionDate: e.target.value },
                    }))}
                    placeholder="e.g. 05-07 April 2026"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-blue-900 mb-1">Exam Date</label>
                  <input
                    type="text"
                    value={formData.importantDates?.examDate || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      importantDates: { ...prev.importantDates, examDate: e.target.value },
                    }))}
                    placeholder="e.g. 15/05/2026 or As per Schedule"
                    className="w-full p-2 rounded border border-blue-300 font-bold text-blue-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admit Card Available Date</label>
                  <input
                    type="text"
                    value={formData.importantDates?.admitCardDate || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      importantDates: { ...prev.importantDates, admitCardDate: e.target.value },
                    }))}
                    placeholder="e.g. Before Exam / May 2026"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-800 mb-1">Result Release Date</label>
                  <input
                    type="text"
                    value={formData.importantDates?.resultDate || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      importantDates: { ...prev.importantDates, resultDate: e.target.value },
                    }))}
                    placeholder="e.g. Notified Soon / Available"
                    className="w-full p-2 rounded border border-emerald-300 font-bold text-emerald-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-800 mb-1">Answer Key Date</label>
                  <input
                    type="text"
                    value={formData.importantDates?.answerKeyDate || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      importantDates: { ...prev.importantDates, answerKeyDate: e.target.value },
                    }))}
                    placeholder="e.g. 20/05/2026"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Objection Last Date</label>
                  <input
                    type="text"
                    value={formData.importantDates?.objectionLastDate || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      importantDates: { ...prev.importantDates, objectionLastDate: e.target.value },
                    }))}
                    placeholder="e.g. 25/05/2026"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
              </div>

              {/* Dynamic Custom Dates List */}
              {formData.importantDates?.customDates && formData.importantDates.customDates.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600 block">Custom Dynamic Date Rows:</span>
                  {formData.importantDates.customDates.map((cd, idx) => (
                    <div key={cd.id || idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cd.label}
                        onChange={e => handleCustomDateFieldChange(idx, 'label', e.target.value)}
                        placeholder="Date Label (e.g. Physical Test Date)"
                        className="w-1/2 p-2 text-xs rounded border border-slate-300"
                      />
                      <input
                        type="text"
                        value={cd.value}
                        onChange={e => handleCustomDateFieldChange(idx, 'value', e.target.value)}
                        placeholder="Value (e.g. 10/06/2026)"
                        className="w-1/2 p-2 text-xs rounded border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomDate(idx)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Remove Date Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Application Fee & Age Limit (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Application Fee */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-black text-slate-900 font-serif">3. Application Fee (Optional)</h3>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.applicationFee?.enabled !== false}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        applicationFee: { ...prev.applicationFee, enabled: e.target.checked },
                      }))}
                      className="rounded text-emerald-600"
                    />
                    <span>Enable Section</span>
                  </label>
                </div>

                {formData.applicationFee?.enabled !== false && (
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">General / OBC / EWS Fee</label>
                      <input
                        type="text"
                        value={formData.applicationFee?.generalObc || ''}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          applicationFee: { ...prev.applicationFee, generalObc: e.target.value },
                        }))}
                        placeholder="e.g. ₹ 500/-"
                        className="w-full p-2 rounded border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">SC / ST Fee</label>
                      <input
                        type="text"
                        value={formData.applicationFee?.scSt || ''}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          applicationFee: { ...prev.applicationFee, scSt: e.target.value },
                        }))}
                        placeholder="e.g. ₹ 0/- or ₹ 250/-"
                        className="w-full p-2 rounded border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">All Category Female / PH</label>
                      <input
                        type="text"
                        value={formData.applicationFee?.phFemale || ''}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          applicationFee: { ...prev.applicationFee, phFemale: e.target.value },
                        }))}
                        placeholder="e.g. ₹ 0/- (Exempted)"
                        className="w-full p-2 rounded border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                      <input
                        type="text"
                        value={formData.applicationFee?.paymentMode || ''}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          applicationFee: { ...prev.applicationFee, paymentMode: e.target.value },
                        }))}
                        placeholder="e.g. Debit Card / Credit Card / Net Banking / UPI"
                        className="w-full p-2 rounded border border-slate-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Age Limit */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-black text-slate-900 font-serif">4. Age Limit Rules (Optional)</h3>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ageLimit?.enabled !== false}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        ageLimit: { ...prev.ageLimit, enabled: e.target.checked },
                      }))}
                      className="rounded text-emerald-600"
                    />
                    <span>Enable Section</span>
                  </label>
                </div>

                {formData.ageLimit?.enabled !== false && (
                  <div className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Minimum Age</label>
                        <input
                          type="text"
                          value={formData.ageLimit?.minAge || ''}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            ageLimit: { ...prev.ageLimit, minAge: e.target.value },
                          }))}
                          placeholder="e.g. 18"
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Maximum Age</label>
                        <input
                          type="text"
                          value={formData.ageLimit?.maxAge || ''}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            ageLimit: { ...prev.ageLimit, maxAge: e.target.value },
                          }))}
                          placeholder="e.g. 28 or Post Wise"
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Age Limit As On Date</label>
                      <input
                        type="text"
                        value={formData.ageLimit?.asOfDate || ''}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          ageLimit: { ...prev.ageLimit, asOfDate: e.target.value },
                        }))}
                        placeholder="e.g. 01/07/2026"
                        className="w-full p-2 rounded border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Age Relaxation Details</label>
                      <input
                        type="text"
                        value={formData.ageLimit?.relaxationDetails || ''}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          ageLimit: { ...prev.ageLimit, relaxationDetails: e.target.value },
                        }))}
                        placeholder="e.g. Age Relaxation Extra as per Official Recruitment Rules."
                        className="w-full p-2 rounded border border-slate-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Vacancy Details Table */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-serif">5. Vacancy Details Table</h3>
                  <p className="text-xs text-slate-500">Post names, category breakdown, and eligibility</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVacancyRow}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  + Add Post / Vacancy Row
                </button>
              </div>

              {formData.vacancyDetails && formData.vacancyDetails.length > 0 ? (
                <div className="space-y-3">
                  {formData.vacancyDetails.map((vac, idx) => (
                    <div key={vac.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-800 uppercase">Post #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVacancyRow(idx)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                        >
                          Delete Row
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Post Name</label>
                          <input
                            type="text"
                            value={vac.postName}
                            onChange={e => handleVacancyFieldChange(idx, 'postName', e.target.value)}
                            placeholder="e.g. Constable Civil Police"
                            className="w-full p-2 rounded border border-slate-300 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Total Posts</label>
                          <input
                            type="text"
                            value={vac.totalPosts}
                            onChange={e => handleVacancyFieldChange(idx, 'totalPosts', e.target.value)}
                            placeholder="e.g. 500"
                            className="w-full p-2 rounded border border-slate-300 font-bold text-emerald-800"
                          />
                        </div>
                      </div>

                      {/* Category Breakdown */}
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-500">UR</label>
                          <input
                            type="text"
                            value={vac.ur || ''}
                            onChange={e => handleVacancyFieldChange(idx, 'ur', e.target.value)}
                            className="w-full p-1.5 rounded border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500">OBC</label>
                          <input
                            type="text"
                            value={vac.obc || ''}
                            onChange={e => handleVacancyFieldChange(idx, 'obc', e.target.value)}
                            className="w-full p-1.5 rounded border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500">EWS</label>
                          <input
                            type="text"
                            value={vac.ews || ''}
                            onChange={e => handleVacancyFieldChange(idx, 'ews', e.target.value)}
                            className="w-full p-1.5 rounded border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500">SC</label>
                          <input
                            type="text"
                            value={vac.sc || ''}
                            onChange={e => handleVacancyFieldChange(idx, 'sc', e.target.value)}
                            className="w-full p-1.5 rounded border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500">ST</label>
                          <input
                            type="text"
                            value={vac.st || ''}
                            onChange={e => handleVacancyFieldChange(idx, 'st', e.target.value)}
                            className="w-full p-1.5 rounded border border-slate-300"
                          />
                        </div>
                      </div>

                      {/* Eligibility for this post */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                        <input
                          type="text"
                          value={vac.eligibility}
                          onChange={e => handleVacancyFieldChange(idx, 'eligibility', e.target.value)}
                          placeholder="e.g. 10+2 Intermediate Exam in Any Recognized Board in India."
                          className="w-full p-2 rounded border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                  No vacancy rows added. Click "+ Add Post / Vacancy Row" if applicable.
                </div>
              )}
            </div>

            {/* Section 5: Physical Eligibility Standards (Optional) */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-serif flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-600" />
                    <span>6. Physical Standards (PST / PET) - Optional</span>
                  </h3>
                  <p className="text-xs text-slate-500">For Police / Defence / Constable recruitment posts</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPhysicalRow}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  + Add Physical Standard
                </button>
              </div>

              {formData.physicalEligibility && formData.physicalEligibility.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {formData.physicalEligibility.map((pe, idx) => (
                    <div key={pe.id || idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600">Category / Parameter</label>
                        <input
                          type="text"
                          value={pe.category}
                          onChange={e => handlePhysicalFieldChange(idx, 'category', e.target.value)}
                          placeholder="e.g. Height / Running"
                          className="w-full p-1.5 rounded border border-slate-300 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600">Male Candidate</label>
                        <input
                          type="text"
                          value={pe.male}
                          onChange={e => handlePhysicalFieldChange(idx, 'male', e.target.value)}
                          placeholder="e.g. 168 CM (ST: 160 CM)"
                          className="w-full p-1.5 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600">Female Candidate</label>
                        <input
                          type="text"
                          value={pe.female}
                          onChange={e => handlePhysicalFieldChange(idx, 'female', e.target.value)}
                          placeholder="e.g. 152 CM (ST: 147 CM)"
                          className="w-full p-1.5 rounded border border-slate-300"
                        />
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleRemovePhysicalRow(idx)}
                          className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No physical eligibility rows configured.</p>
              )}
            </div>

            {/* Section 6: How to Apply (Step-by-Step) */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-black text-slate-900 font-serif">7. How to Apply Instructions (Numbered Steps)</h3>
                <button
                  type="button"
                  onClick={handleAddApplyStep}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-1 rounded transition cursor-pointer"
                >
                  + Add Instruction Step
                </button>
              </div>

              {formData.howToApply && formData.howToApply.length > 0 && (
                <div className="space-y-2">
                  {formData.howToApply.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-xs font-bold text-slate-500 text-right">{idx + 1}.</span>
                      <input
                        type="text"
                        value={step}
                        onChange={e => handleApplyStepChange(idx, e.target.value)}
                        placeholder="Step instruction..."
                        className="flex-1 p-2 text-xs rounded border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleMoveApplyStep(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveApplyStep(idx, 'down')}
                        disabled={idx === (formData.howToApply?.length || 0) - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveApplyStep(idx)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Delete Step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Important Instructions Highlight Note */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-red-700 mb-1">
                  Important Instructions Highlight Note
                </label>
                <input
                  type="text"
                  value={formData.importantInstructions || ''}
                  onChange={e => setFormData(prev => ({ ...prev, importantInstructions: e.target.value }))}
                  placeholder="e.g. Interested Candidates Can Read the Full Official Notification Before Apply Online."
                  className="w-full p-2.5 rounded-lg border border-red-200 bg-red-50/50 text-xs font-bold text-red-950"
                />
              </div>
            </div>

            {/* Section 7: Useful Important Links Manager */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-serif flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-blue-600" />
                    <span>8. Useful Important Links Manager *</span>
                  </h3>
                  <p className="text-xs text-slate-500">Add active URLs for online apply, notification PDF, and results</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLinkRow}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-lg transition self-start sm:self-auto cursor-pointer"
                >
                  + Add New Link Row
                </button>
              </div>

              {formData.importantLinks && formData.importantLinks.length > 0 ? (
                <div className="space-y-3">
                  {formData.importantLinks.map((lnk, idx) => (
                    <div
                      key={lnk.id || idx}
                      className={`p-3 rounded-xl border transition ${
                        lnk.enabled !== false ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Link Title / Label</label>
                          <input
                            type="text"
                            required
                            value={lnk.label}
                            onChange={e => handleLinkFieldChange(idx, 'label', e.target.value)}
                            placeholder="e.g. Apply Online"
                            className="w-full p-2 rounded border border-slate-300 font-bold"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Target URL *</label>
                          <input
                            type="url"
                            required
                            value={lnk.url}
                            onChange={e => handleLinkFieldChange(idx, 'url', e.target.value)}
                            placeholder="https://..."
                            className="w-full p-2 rounded border border-slate-300 font-mono text-[11px] text-blue-900"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Badge Text</label>
                          <input
                            type="text"
                            value={lnk.badge || ''}
                            onChange={e => handleLinkFieldChange(idx, 'badge', e.target.value)}
                            placeholder="e.g. Active / PDF"
                            className="w-full p-2 rounded border border-slate-300 text-xs uppercase"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-end gap-1.5 pt-4 sm:pt-0">
                          <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mr-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lnk.enabled !== false}
                              onChange={e => handleLinkFieldChange(idx, 'enabled', e.target.checked)}
                              className="rounded text-emerald-600"
                            />
                            <span>Active</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleMoveLink(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLink(idx, 'down')}
                            disabled={idx === (formData.importantLinks?.length || 0) - 1}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveLinkRow(idx)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-rose-600 font-bold">At least one important link is required.</p>
              )}
            </div>

            {/* Bottom Form Submission Toolbar */}
            <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-xl z-20">
              <div className="text-xs text-slate-300 text-center sm:text-left">
                <span>Ready to save? You can save as a private draft or publish instantly to live website.</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('posts');
                    onNavigate('/admin/posts');
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel / Back
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePost('draft')}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE AS DRAFT</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePost('published')}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg transition shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>PUBLISH NOW</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 font-serif">Are you sure you want to delete this post?</h3>
              <p className="text-xs text-slate-500">
                This action is permanent. The post will be removed from all public categories, homepage, and search results.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800 block line-clamp-2">{postToDelete.title}</span>
              <span className="text-slate-500 block">{postToDelete.organization}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black transition shadow-sm cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
