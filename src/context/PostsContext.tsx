import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Post, PortalStats, PostCategory } from '../types';
import { INITIAL_POSTS } from '../data/initialPosts';
import { supabase } from '../lib/supabase';
import {
  fetchPostsFromSupabase,
  insertPostToSupabase,
  updatePostInSupabase,
  deletePostFromSupabase,
} from '../lib/supabasePosts';

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
  searchPosts: (query: string, category?: string, includeDrafts?: boolean) => Post[];
}

const LOCAL_STORAGE_CACHE_KEY = 'examresult_supabase_posts_cache';

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with cached posts or INITIAL_POSTS for immediate render
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_POSTS;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PortalStats | null>(null);

  const calculateLocalStats = (postList: Post[]): PortalStats => {
    return {
      totalPosts: postList.length,
      publishedPosts: postList.filter(p => p.status === 'published').length,
      draftPosts: postList.filter(p => p.status === 'draft').length,
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

  const saveCache = (data: Post[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  /**
   * Primary fetch mechanism: Directly queries the Supabase database.
   */
  const fetchPosts = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);

    try {
      // 1. Primary: Direct real-time fetch from Supabase database
      const supaRes = await fetchPostsFromSupabase();
      if (!supaRes.error && Array.isArray(supaRes.posts) && supaRes.posts.length > 0) {
        setPosts(supaRes.posts);
        saveCache(supaRes.posts);
        setStats(calculateLocalStats(supaRes.posts));
        setError(null);
        setLoading(false);
        return;
      }

      // 2. Secondary: Fallback to server API if Supabase query returned error or empty
      const serverRes = await fetch(`/api/posts?includeDrafts=true&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      const contentType = serverRes.headers.get('content-type') || '';
      if (serverRes.ok && contentType.includes('application/json')) {
        const serverData = await serverRes.json();
        if (Array.isArray(serverData) && serverData.length > 0) {
          setPosts(serverData);
          saveCache(serverData);
          setStats(calculateLocalStats(serverData));
          setError(null);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn('[Posts Context Fetch Notice]:', err?.message);
    }

    // 3. Fallback to localStorage cache or INITIAL_POSTS if offline
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
          setStats(calculateLocalStats(parsed));
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    setPosts(INITIAL_POSTS);
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

  // Initial load, real-time subscription, and focus sync
  useEffect(() => {
    // 1. Initial live fetch
    fetchPosts();

    // 2. Real-time Supabase postgres_changes subscription
    let channel: any = null;
    try {
      channel = supabase
        .channel('posts-realtime-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
          fetchPosts(true);
        })
        .subscribe();
    } catch (err) {
      console.warn('[Supabase Real-time Subscription Notice]:', err);
    }

    // 3. Polling fallback every 4 seconds for cross-device consistency
    const pollInterval = setInterval(() => {
      fetchPosts(true);
    }, 4000);

    // 4. Instant re-fetch when tab becomes visible or focused
    const handleFocus = () => {
      if (document.visibilityState === 'visible' || !document.hidden) {
        fetchPosts(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(pollInterval);
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
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

  /**
   * Creates and publishes/saves a post directly to the Supabase database.
   * Only confirms success if Supabase confirms successful INSERT.
   */
  const createPost = async (postData: Partial<Post>): Promise<{ success: boolean; post?: Post; error?: string }> => {
    const result = await insertPostToSupabase(postData);

    if (!result.success || !result.post) {
      return {
        success: false,
        error: result.error || 'Failed to save post to Supabase database. Please try again.',
      };
    }

    // Update local state immediately with confirmed database record
    const confirmedPost = result.post;
    const updatedPosts = [confirmedPost, ...posts.filter(p => p.id !== confirmedPost.id && p.slug !== confirmedPost.slug)];
    setPosts(updatedPosts);
    saveCache(updatedPosts);
    setStats(calculateLocalStats(updatedPosts));

    // Also sync to backend server if available
    try {
      fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmedPost),
      }).catch(() => {});
    } catch {}

    // Trigger full background sync to ensure all devices see fresh data
    fetchPosts(true);

    return { success: true, post: confirmedPost };
  };

  /**
   * Updates an existing post record directly in the Supabase database.
   */
  const updatePost = async (id: string, postData: Partial<Post>): Promise<{ success: boolean; post?: Post; error?: string }> => {
    const result = await updatePostInSupabase(id, postData);

    if (!result.success || !result.post) {
      return {
        success: false,
        error: result.error || 'Failed to update post in Supabase database.',
      };
    }

    const updatedPost = result.post;
    const updatedPosts = posts.map(p => (p.id === id ? updatedPost : p));
    setPosts(updatedPosts);
    saveCache(updatedPosts);
    setStats(calculateLocalStats(updatedPosts));

    // Also sync to backend server if available
    try {
      fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost),
      }).catch(() => {});
    } catch {}

    fetchPosts(true);

    return { success: true, post: updatedPost };
  };

  /**
   * Deletes a post record permanently from the Supabase database.
   */
  const deletePost = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const result = await deletePostFromSupabase(id);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to delete post from Supabase database.',
      };
    }

    const updatedPosts = posts.filter(p => p.id !== id);
    setPosts(updatedPosts);
    saveCache(updatedPosts);
    setStats(calculateLocalStats(updatedPosts));

    // Also sync delete to backend server
    try {
      fetch(`/api/posts/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    fetchPosts(true);

    return { success: true };
  };

  const resetDemoData = async () => {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
    } catch {
      // ignore
    }
    fetchPosts();
  };

  const searchPosts = (query: string, category?: string, includeDrafts: boolean = false): Post[] => {
    const q = query.toLowerCase().trim();
    return posts.filter(p => {
      if (!includeDrafts && p.status !== 'published') return false;
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
