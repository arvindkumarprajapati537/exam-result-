import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Post, PortalStats, PostCategory } from '../types';
import { INITIAL_POSTS } from '../data/initialPosts';
import { supabase } from '../lib/supabase';

interface PostsContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  stats: PortalStats | null;
  fetchPosts: () => Promise<void>;
  fetchStats: () => Promise<void>;
  getPostBySlug: (slug: string) => Post | undefined;
  getPostsByCategory: (category: PostCategory) => Post[];
  getFeaturedPosts: () => Post[];
  createPost: (postData: Partial<Post>) => Promise<{ success: boolean; post?: Post; error?: string }>;
  updatePost: (id: string, postData: Partial<Post>) => Promise<{ success: boolean; post?: Post; error?: string }>;
  deletePost: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetDemoData: () => Promise<void>;
  searchPosts: (query: string, category?: string) => Post[];
}

const LOCAL_STORAGE_POSTS_KEY = 'examresult_all_posts_v2';

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading posts from localStorage:', e);
    }
    return INITIAL_POSTS;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PortalStats | null>(null);

  const calculateLocalStats = (postList: Post[]): PortalStats => {
    return {
      totalPosts: postList.length,
      totalJobs: postList.filter(p => p.category === 'latest-jobs').length,
      totalResults: postList.filter(p => p.category === 'results').length,
      totalAdmitCards: postList.filter(p => p.category === 'admit-card').length,
      totalAnswerKeys: postList.filter(p => p.category === 'answer-key').length,
      totalAdmissions: postList.filter(p => p.category === 'admissions').length,
      totalSyllabus: postList.filter(p => p.category === 'syllabus').length,
      totalUpdates: postList.filter(p => p.category === 'latest-updates').length,
      totalViews: postList.reduce((sum, p) => sum + (p.views || 850), 0),
    };
  };

  // Sync to localStorage on any posts change
  const saveToStorage = (updatedPosts: Post[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(updatedPosts));
    } catch (e) {
      console.warn('Error saving posts to localStorage:', e);
    }
  };

  const fetchPosts = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      // 1. Try fetching from Backend API with cache busting
      const res = await fetch(`/api/posts?includeDrafts=true&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);
          saveToStorage(data);
          setStats(calculateLocalStats(data));
          setError(null);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn('Backend API unavailable, checking local storage & Supabase fallback');
    }

    // 2. Check local storage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
          setStats(calculateLocalStats(parsed));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // 3. Fallback to INITIAL_POSTS
    setPosts(INITIAL_POSTS);
    saveToStorage(INITIAL_POSTS);
    setStats(calculateLocalStats(INITIAL_POSTS));
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/stats?_t=${Date.now()}`, { cache: 'no-store' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setStats(data);
        return;
      }
    } catch {
      // ignore
    }
    setStats(calculateLocalStats(posts));
  }, [posts]);

  // Initial fetch and real-time cross-device sync
  useEffect(() => {
    fetchPosts();

    // 1. Periodic background polling so any change on mobile/desktop instantly reflects everywhere
    const intervalId = setInterval(() => {
      fetchPosts(true);
    }, 5000);

    // 2. Re-fetch immediately when user focuses the tab or switches back to browser
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible' || !document.hidden) {
        fetchPosts(true);
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    window.addEventListener('online', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocusOrVisible);
      window.removeEventListener('online', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
  }, [fetchPosts]);

  const getPostBySlug = (slug: string): Post | undefined => {
    return posts.find(p => p.slug === slug || p.id === slug);
  };

  const getPostsByCategory = (category: PostCategory): Post[] => {
    return posts.filter(p => p.category === category && p.status === 'published');
  };

  const getFeaturedPosts = (): Post[] => {
    return posts.filter(p => p.isFeatured && p.status === 'published');
  };

  const createPost = async (postData: Partial<Post>): Promise<{ success: boolean; post?: Post; error?: string }> => {
    const generatedSlug = String(postData.slug || postData.title || 'notice')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newPost: Post = {
      id: postData.id || `post-${Date.now()}`,
      title: postData.title || 'Untitled Notification',
      slug: generatedSlug,
      category: postData.category || 'latest-jobs',
      organization: postData.organization || 'Government Organization',
      stateOrCentral: postData.stateOrCentral || 'All India / Central',
      qualification: postData.qualification || 'Graduate',
      totalVacancies: postData.totalVacancies || '',
      shortDescription: postData.shortDescription || '',
      content: postData.content || '',
      importantDates: postData.importantDates || { applicationBegin: '', lastDate: '' },
      applicationFee: postData.applicationFee || { generalObc: '', scSt: '', paymentMode: '' },
      ageLimit: postData.ageLimit || {},
      vacancyDetails: postData.vacancyDetails || [],
      howToApply: postData.howToApply || [],
      importantLinks: postData.importantLinks || [],
      officialWebsite: postData.officialWebsite || '',
      status: postData.status || 'published',
      isFeatured: postData.isFeatured || false,
      views: 0,
      publishedAt: postData.publishedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately update React State & localStorage
    const updatedPosts = [newPost, ...posts.filter(p => p.id !== newPost.id && p.slug !== newPost.slug)];
    setPosts(updatedPosts);
    saveToStorage(updatedPosts);
    setStats(calculateLocalStats(updatedPosts));

    // 2. Sync to Backend Server API
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
    } catch (e) {
      console.warn('Notice saved locally; backend API sync deferred:', e);
    }

    // 3. Sync to Supabase Database (if configured)
    try {
      if (supabase) {
        await supabase.from('posts').upsert({
          id: newPost.id,
          title: newPost.title,
          slug: newPost.slug,
          short_description: newPost.shortDescription,
          post_date: newPost.publishedAt,
          organization: newPost.organization,
          category: newPost.category,
          state_or_region: newPost.stateOrCentral,
          total_vacancy: parseInt(String(newPost.totalVacancies || '0'), 10) || 0,
          application_fee: newPost.applicationFee,
          age_limit: newPost.ageLimit,
          vacancy_details: newPost.vacancyDetails,
          how_to_apply: newPost.howToApply,
          important_links: newPost.importantLinks,
          is_featured: newPost.isFeatured,
          views_count: newPost.views,
        });
      }
    } catch (sbErr) {
      console.warn('Supabase cloud backup status:', sbErr);
    }

    return { success: true, post: newPost };
  };

  const updatePost = async (id: string, postData: Partial<Post>): Promise<{ success: boolean; post?: Post; error?: string }> => {
    let updatedPost: Post | undefined;

    const updatedPosts = posts.map(p => {
      if (p.id === id) {
        updatedPost = {
          ...p,
          ...postData,
          updatedAt: new Date().toISOString(),
        };
        return updatedPost;
      }
      return p;
    });

    if (!updatedPost) {
      return { success: false, error: 'Notice not found in current portal memory.' };
    }

    // 1. Immediately update React State & localStorage
    setPosts(updatedPosts);
    saveToStorage(updatedPosts);
    setStats(calculateLocalStats(updatedPosts));

    // 2. Sync to Backend Server API
    try {
      await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost),
      });
    } catch (e) {
      console.warn('Notice updated locally; backend sync deferred:', e);
    }

    // 3. Sync to Supabase Database
    try {
      if (supabase && updatedPost) {
        await supabase.from('posts').upsert({
          id: updatedPost.id,
          title: updatedPost.title,
          slug: updatedPost.slug,
          short_description: updatedPost.shortDescription,
          organization: updatedPost.organization,
          category: updatedPost.category,
          state_or_region: updatedPost.stateOrCentral,
          total_vacancy: parseInt(String(updatedPost.totalVacancies || '0'), 10) || 0,
          application_fee: updatedPost.applicationFee,
          age_limit: updatedPost.ageLimit,
          vacancy_details: updatedPost.vacancyDetails,
          how_to_apply: updatedPost.howToApply,
          important_links: updatedPost.importantLinks,
          is_featured: updatedPost.isFeatured,
          views_count: updatedPost.views,
        });
      }
    } catch (sbErr) {
      console.warn('Supabase cloud update status:', sbErr);
    }

    return { success: true, post: updatedPost };
  };

  const deletePost = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const updatedPosts = posts.filter(p => p.id !== id);

    // 1. Immediately update React State & localStorage
    setPosts(updatedPosts);
    saveToStorage(updatedPosts);
    setStats(calculateLocalStats(updatedPosts));

    // 2. Sync to Backend API
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Notice deleted locally; backend sync deferred');
    }

    // 3. Sync delete to Supabase
    try {
      if (supabase) {
        await supabase.from('posts').delete().eq('id', id);
      }
    } catch (sbErr) {
      console.warn('Supabase cloud delete status:', sbErr);
    }

    return { success: true };
  };

  const resetDemoData = async () => {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
    } catch {
      // ignore
    }
    setPosts(INITIAL_POSTS);
    saveToStorage(INITIAL_POSTS);
    setStats(calculateLocalStats(INITIAL_POSTS));
  };

  const searchPosts = (query: string, category?: string): Post[] => {
    const q = query.toLowerCase().trim();
    return posts.filter(p => {
      if (category && category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.qualification?.toLowerCase().includes(q) ||
        p.stateOrCentral?.toLowerCase().includes(q)
      );
    });
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        stats,
        fetchPosts,
        fetchStats,
        getPostBySlug,
        getPostsByCategory,
        getFeaturedPosts,
        createPost,
        updatePost,
        deletePost,
        resetDemoData,
        searchPosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};

