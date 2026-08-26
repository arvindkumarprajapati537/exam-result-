import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Post, PortalStats, PostCategory } from '../types';
import { INITIAL_POSTS } from '../data/initialPosts';

interface PostsContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  stats: PortalStats | null;
  fetchPosts: () => Promise<void>;
  fetchStats: () => Promise<void>;
  getPostBySlug: (slug: string) => Promise<Post | undefined>;
  getPostsByCategory: (category: PostCategory) => Post[];
  getFeaturedPosts: () => Post[];
  createPost: (postData: Partial<Post>) => Promise<{ success: boolean; post?: Post; error?: string }>;
  updatePost: (id: string, postData: Partial<Post>) => Promise<{ success: boolean; post?: Post; error?: string }>;
  deletePost: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetDemoData: () => Promise<void>;
  searchPosts: (query: string, category?: string) => Post[];
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [loading, setLoading] = useState<boolean>(true);
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
      totalViews: postList.reduce((sum, p) => sum + (p.views || 0), 0),
    };
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?includeDrafts=true');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);
          setStats(calculateLocalStats(data));
          setError(null);
          return;
        }
      }
      // Fallback
      setPosts(INITIAL_POSTS);
      setStats(calculateLocalStats(INITIAL_POSTS));
    } catch (err: any) {
      console.warn('Backend unavailable, using initial data:', err);
      setPosts(INITIAL_POSTS);
      setStats(calculateLocalStats(INITIAL_POSTS));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        return;
      }
    } catch {
      // ignore
    }
    setStats(calculateLocalStats(posts));
  }, [posts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const getPostBySlug = async (slug: string): Promise<Post | undefined> => {
    try {
      const res = await fetch(`/api/posts/${slug}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // fallback
    }
    return posts.find(p => p.slug === slug || p.id === slug);
  };

  const getPostsByCategory = (category: PostCategory): Post[] => {
    return posts.filter(p => p.category === category && p.status === 'published');
  };

  const getFeaturedPosts = (): Post[] => {
    return posts.filter(p => p.isFeatured && p.status === 'published');
  };

  const createPost = async (postData: Partial<Post>) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(prev => [data, ...prev]);
        setStats(calculateLocalStats([data, ...posts]));
        return { success: true, post: data };
      }
      return { success: false, error: data.error || 'Failed to create post' };
    } catch (err: any) {
      // local fallback
      const generatedSlug = String(postData?.slug || postData?.title || 'post')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newPost: Post = {
        id: `post-${Date.now()}`,
        title: postData.title || 'Untitled Post',
        slug: generatedSlug,
        category: postData.category || 'latest-jobs',
        organization: postData.organization || 'Government of India',
        stateOrCentral: postData.stateOrCentral || 'Central Government',
        qualification: postData.qualification || 'Graduate',
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
        views: 0,
        publishedAt: postData.publishedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPosts(prev => [newPost, ...prev]);
      setStats(calculateLocalStats([newPost, ...posts]));
      return { success: true, post: newPost };
    }
  };

  const updatePost = async (id: string, postData: Partial<Post>) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(prev => prev.map(p => (p.id === id ? data : p)));
        return { success: true, post: data };
      }
      return { success: false, error: data.error || 'Failed to update post' };
    } catch (err: any) {
      setPosts(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                ...postData,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      return { success: true };
    }
  };

  const deletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
        setStats(calculateLocalStats(posts.filter(p => p.id !== id)));
        return { success: true };
      }
    } catch {
      // local fallback
    }
    setPosts(prev => prev.filter(p => p.id !== id));
    setStats(calculateLocalStats(posts.filter(p => p.id !== id)));
    return { success: true };
  };

  const resetDemoData = async () => {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
    } catch {
      // ignore
    }
    setPosts(INITIAL_POSTS);
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
