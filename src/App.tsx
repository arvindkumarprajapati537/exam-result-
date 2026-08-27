import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { CategoryListingPage } from './pages/CategoryListingPage';
import { PostDetailView } from './components/PostDetailView';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ImportantLinksPage } from './pages/ImportantLinksPage';
import { LatestUpdatesPage } from './pages/LatestUpdatesPage';
import { UserLoginPage, UserRegisterPage, UserProfilePage } from './pages/UserAuthPages';
import { AdminAuthPage } from './pages/AdminAuthPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminChangePasswordPage } from './pages/AdminChangePasswordPage';
import { AdminForgotPasswordPage } from './pages/AdminForgotPasswordPage';
import { AboutPage, ContactPage, PrivacyPolicyPage, DisclaimerPage } from './pages/StaticPages';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PostsProvider, usePosts } from './context/PostsContext';
import { PostCategory } from './types';

const AppContent: React.FC = () => {
  const { posts, getPostBySlug } = usePosts();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<{ query: string; category: string }>({
    query: '',
    category: 'all',
  });

  // Handle browser popstate (back / forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path === currentPath) return;
    try {
      window.history.pushState({}, '', path);
    } catch {
      // ignore
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPost = (slug: string) => {
    navigate(`/post/${slug}`);
  };

  const handleOpenSearchModal = () => {
    setSearchModalOpen(true);
  };

  const handleSearchModalSubmit = (query: string, category: string) => {
    setSearchParams({ query, category });
    navigate(`/search?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(category)}`);
  };

  // Route Dispatcher
  const renderCurrentView = () => {
    const safePath = currentPath || '/';

    // 1. Post Detail Page: /post/:slug
    if (safePath.startsWith('/post/')) {
      const slug = safePath.replace('/post/', '').split('?')[0] || '';
      const post = getPostBySlug(slug);

      if (!post) {
        return (
          <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600 font-bold text-2xl">
              404
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
              Examination Notice Not Found
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The requested recruitment notice or result page (<strong>{slug}</strong>) is unavailable, has been archived, or moved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Go to Homepage
              </button>
              <button
                onClick={() => navigate('/latest-jobs')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Latest Jobs
              </button>
              <button
                onClick={() => navigate('/results')}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Results
              </button>
            </div>
          </div>
        );
      }

      return (
        <PostDetailView
          post={post}
          onBack={() => navigate('/')}
          onSelectPost={handleSelectPost}
          allPosts={posts}
        />
      );
    }

    // 2. Category Pages: /latest-jobs, /results, /admit-card, /answer-key, /syllabus, /admissions
    const validCategories: PostCategory[] = [
      'latest-jobs',
      'results',
      'admit-card',
      'answer-key',
      'syllabus',
      'admissions',
    ];
    const cleanPath = (safePath.replace('/', '').split('?')[0] || '') as PostCategory;
    if (validCategories.includes(cleanPath)) {
      return (
        <CategoryListingPage
          category={cleanPath}
          posts={posts}
          onSelectPost={handleSelectPost}
          onNavigate={navigate}
        />
      );
    }

    // 3. Search Results: /search
    if (safePath.startsWith('/search')) {
      return (
        <SearchResultsPage
          initialQuery={searchParams.query}
          initialCategory={searchParams.category}
          posts={posts}
          onSelectPost={handleSelectPost}
          onNavigate={navigate}
        />
      );
    }

    // 4. Latest Updates Stream
    if (safePath === '/latest-updates') {
      return <LatestUpdatesPage onSelectPost={handleSelectPost} onNavigate={navigate} />;
    }

    // 5. Important Links Directory
    if (safePath === '/important-links') {
      return <ImportantLinksPage />;
    }

    // 6. User Auth & Profile
    if (safePath === '/login') {
      return <UserLoginPage onNavigate={navigate} />;
    }
    if (safePath === '/register') {
      return <UserRegisterPage onNavigate={navigate} />;
    }
    if (safePath === '/profile') {
      return <UserProfilePage onSelectPost={handleSelectPost} onNavigate={navigate} />;
    }

    // 7. Admin Panel Routes
    if (safePath === '/admin/login' || safePath === '/admin') {
      return <AdminAuthPage onNavigate={navigate} />;
    }
    if (safePath === '/admin/forgot-password') {
      return <AdminForgotPasswordPage onNavigate={navigate} />;
    }
    if (safePath === '/admin/change-password') {
      return <AdminChangePasswordPage onNavigate={navigate} />;
    }
    if (safePath === '/admin/dashboard') {
      return <AdminDashboardPage onNavigate={navigate} onSelectPost={handleSelectPost} initialTab="dashboard" />;
    }
    if (safePath === '/admin/posts') {
      return <AdminDashboardPage onNavigate={navigate} onSelectPost={handleSelectPost} initialTab="posts" />;
    }
    if (safePath === '/admin/posts/new') {
      return <AdminDashboardPage onNavigate={navigate} onSelectPost={handleSelectPost} initialTab="new-post" />;
    }
    if (safePath.startsWith('/admin/posts/edit/')) {
      const editId = safePath.replace('/admin/posts/edit/', '').split('?')[0];
      return <AdminDashboardPage onNavigate={navigate} onSelectPost={handleSelectPost} initialTab="new-post" editId={editId} />;
    }

    // 8. Static Information Pages
    if (safePath === '/about') {
      return <AboutPage />;
    }
    if (safePath === '/contact') {
      return <ContactPage />;
    }
    if (safePath === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }
    if (safePath === '/disclaimer') {
      return <DisclaimerPage />;
    }

    // Default: Home Page
    return (
      <HomePage
        onSelectPost={handleSelectPost}
        onNavigate={navigate}
        onOpenSearch={handleOpenSearchModal}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Primary Header */}
      <Header
        onNavigate={navigate}
        onOpenSearch={handleOpenSearchModal}
        currentRoute={currentPath}
      />

      {/* Desktop Main Category Navbar */}
      <Navbar currentRoute={currentPath} onNavigate={navigate} />

      {/* Main Page Area */}
      <main className="flex-1 pb-8">{renderCurrentView()}</main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Global Interactive Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectPost={handleSelectPost}
        onViewAllResults={handleSearchModalSubmit}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PostsProvider>
          <AppContent />
        </PostsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
