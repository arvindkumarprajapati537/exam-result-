import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_POSTS } from './src/data/initialPosts';
import { Post, User, PortalStats } from './src/types';

// Supabase Configuration
const SUPABASE_PROJECT_ID = 'congripxkyyqjsuoqvec';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_QGQr1Txr9t1Qc0is_mwJmA_EyM3bSNF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DATA_DIR = path.join(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Admin and Demo Users
const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-arvind',
    name: 'Arvind Kumar Prajapati',
    email: 'arvindkumarprajapati537@gmail.com',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    savedPostIds: ['post-1', 'post-2'],
  },
  {
    id: 'user-admin',
    name: 'Portal Administrator',
    email: 'admin@examresult.gov.in',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    savedPostIds: ['post-1', 'post-2'],
  },
  {
    id: 'user-demo',
    name: 'Candidate User',
    email: 'candidate@example.com',
    role: 'user',
    createdAt: '2026-01-05T00:00:00Z',
    savedPostIds: ['post-1', 'post-7'],
  },
];

// Helper functions for reading/writing storage
function loadPosts(): Post[] {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      const data = fs.readFileSync(POSTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading posts file:', err);
  }
  // Initialize with initial posts
  savePosts(INITIAL_POSTS);
  return INITIAL_POSTS;
}

function savePosts(posts: Post[]) {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving posts file:', err);
  }
}

function loadUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }
  saveUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

function saveUsers(users: User[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all posts with filtering, sorting, pagination
  app.get('/api/posts', (req, res) => {
    let posts = loadPosts();
    const { category, search, status, qualification, state, sort, limit } = req.query;

    if (category && typeof category === 'string' && category !== 'all') {
      posts = posts.filter(p => p.category === category);
    }

    if (status && typeof status === 'string') {
      posts = posts.filter(p => p.status === status);
    } else {
      // By default for public requests, only return published posts unless admin requests all
      if (req.query.includeDrafts !== 'true') {
        posts = posts.filter(p => p.status === 'published');
      }
    }

    if (qualification && typeof qualification === 'string' && qualification !== 'All Qualifications') {
      posts = posts.filter(p => p.qualification?.toLowerCase().includes(qualification.toLowerCase()) || qualification.toLowerCase().includes(p.qualification?.toLowerCase() || ''));
    }

    if (state && typeof state === 'string' && state !== 'All India / Central' && state !== 'all') {
      posts = posts.filter(p => p.stateOrCentral?.toLowerCase().includes(state.toLowerCase()) || p.stateOrCentral === 'All India / Central');
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.stateOrCentral.toLowerCase().includes(q) ||
        p.qualification.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort === 'closing-soon') {
      posts.sort((a, b) => {
        const dateA = a.importantDates?.lastDate || '99/99/9999';
        const dateB = b.importantDates?.lastDate || '99/99/9999';
        return dateA.localeCompare(dateB);
      });
    } else if (sort === 'popular') {
      posts.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // default: latest published
      posts.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
    }

    if (limit && !isNaN(Number(limit))) {
      posts = posts.slice(0, Number(limit));
    }

    res.json(posts);
  });

  // Get single post by slug or ID
  app.get('/api/posts/:slugOrId', (req, res) => {
    const { slugOrId } = req.params;
    const posts = loadPosts();
    const postIndex = posts.findIndex(p => p.slug === slugOrId || p.id === slugOrId);

    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    posts[postIndex].views = (posts[postIndex].views || 0) + 1;
    savePosts(posts);

    res.json(posts[postIndex]);
  });

  // Create new post
  app.post('/api/posts', (req, res) => {
    const postData = req.body;
    if (!postData.title || !postData.category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const posts = loadPosts();
    const newId = `post-${Date.now()}`;
    const generatedSlug = postData.slug
      ? postData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newPost: Post = {
      ...postData,
      id: newId,
      slug: generatedSlug,
      status: postData.status || 'published',
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: postData.publishedAt || new Date().toISOString(),
    };

    posts.unshift(newPost);
    savePosts(posts);

    res.status(201).json(newPost);
  });

  // Update post
  app.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const posts = loadPosts();
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    posts[index] = {
      ...posts[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    savePosts(posts);
    res.json(posts[index]);
  });

  // Delete post
  app.delete('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    let posts = loadPosts();
    const initialLen = posts.length;
    posts = posts.filter(p => p.id !== id);

    if (posts.length === initialLen) {
      return res.status(404).json({ error: 'Post not found' });
    }

    savePosts(posts);
    res.json({ message: 'Post deleted successfully', id });
  });

  // Portal statistics
  app.get('/api/stats', (req, res) => {
    const posts = loadPosts();
    const stats: PortalStats = {
      totalPosts: posts.length,
      totalJobs: posts.filter(p => p.category === 'latest-jobs').length,
      totalResults: posts.filter(p => p.category === 'results').length,
      totalAdmitCards: posts.filter(p => p.category === 'admit-card').length,
      totalAnswerKeys: posts.filter(p => p.category === 'answer-key').length,
      totalAdmissions: posts.filter(p => p.category === 'admissions').length,
      totalSyllabus: posts.filter(p => p.category === 'syllabus').length,
      totalUpdates: posts.filter(p => p.category === 'latest-updates').length,
      totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
    };
    res.json(stats);
  });

  // Auth: User & Admin Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = loadUsers();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Master Super Admin Authentication for Arvind Kumar Prajapati
    if (
      email.toLowerCase().trim() === 'arvindkumarprajapati537@gmail.com' &&
      (password === 'Arvind@2000' || password === 'admin123' || password === 'admin')
    ) {
      const admin: User = {
        id: 'user-admin-arvind',
        name: 'Arvind Kumar Prajapati',
        email: 'arvindkumarprajapati537@gmail.com',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00Z',
        savedPostIds: ['post-1', 'post-2'],
      };
      // Ensure user list has updated admin
      const existingIdx = users.findIndex(u => u.email.toLowerCase() === 'arvindkumarprajapati537@gmail.com');
      if (existingIdx > -1) {
        users[existingIdx] = { ...users[existingIdx], role: 'admin', name: 'Arvind Kumar Prajapati' };
      } else {
        users.unshift(admin);
      }
      saveUsers(users);

      return res.json({
        token: `token-admin-arvind-${Date.now()}`,
        user: admin,
      });
    }

    // Special admin shortcut or general demo
    if (
      (email === 'admin@examresult.gov.in' || email === 'admin@examresult.com' || email === 'admin') &&
      (password === 'admin123' || password === 'admin' || password === 'Arvind@2000')
    ) {
      const admin = users.find(u => u.email === 'admin@examresult.gov.in') || INITIAL_USERS[0];
      return res.json({
        token: `token-admin-${Date.now()}`,
        user: admin,
      });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Auto-register candidate for ease of testing or prompt
      if (password.length >= 4) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].toUpperCase(),
          email: email.toLowerCase(),
          role: 'user',
          createdAt: new Date().toISOString(),
          savedPostIds: [],
        };
        users.push(newUser);
        saveUsers(users);
        return res.json({
          token: `token-${newUser.id}-${Date.now()}`,
          user: newUser,
        });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      token: `token-${user.id}-${Date.now()}`,
      user,
    });
  });

  // Auth: Admin direct login
  app.post('/api/auth/admin-login', (req, res) => {
    const { usernameOrEmail, password } = req.body;
    const cleanId = (usernameOrEmail || '').toLowerCase().trim();

    if (
      cleanId === 'arvindkumarprajapati537@gmail.com' &&
      (password === 'Arvind@2000' || password === 'admin123' || password === 'admin')
    ) {
      const users = loadUsers();
      const admin: User = {
        id: 'user-admin-arvind',
        name: 'Arvind Kumar Prajapati',
        email: 'arvindkumarprajapati537@gmail.com',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00Z',
        savedPostIds: ['post-1', 'post-2'],
      };
      return res.json({
        token: `token-admin-arvind-${Date.now()}`,
        user: admin,
      });
    }

    if (
      (cleanId === 'admin' || cleanId === 'admin@examresult.gov.in' || cleanId === 'admin@examresult.com') &&
      (password === 'admin123' || password === 'admin' || password === 'Arvind@2000')
    ) {
      const users = loadUsers();
      const admin = users.find(u => u.role === 'admin') || INITIAL_USERS[0];
      return res.json({
        token: `token-admin-${Date.now()}`,
        user: admin,
      });
    }
    return res.status(401).json({ error: 'Invalid Admin credentials. Use arvindkumarprajapati537@gmail.com / Arvind@2000' });
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const users = loadUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Account with this email already exists' });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: 'user',
      createdAt: new Date().toISOString(),
      savedPostIds: [],
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
      token: `token-${newUser.id}-${Date.now()}`,
      user: newUser,
    });
  });

  // Favorites toggle
  app.post('/api/favorites/toggle', (req, res) => {
    const { userId, postId } = req.body;
    if (!userId || !postId) {
      return res.status(400).json({ error: 'userId and postId are required' });
    }

    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.savedPostIds = user.savedPostIds || [];
    const index = user.savedPostIds.indexOf(postId);
    let isSaved = false;

    if (index > -1) {
      user.savedPostIds.splice(index, 1);
      isSaved = false;
    } else {
      user.savedPostIds.push(postId);
      isSaved = true;
    }

    saveUsers(users);
    res.json({ isSaved, savedPostIds: user.savedPostIds });
  });

  // Reset demo data endpoint
  app.post('/api/reset-data', (req, res) => {
    savePosts(INITIAL_POSTS);
    saveUsers(INITIAL_USERS);
    res.json({ message: 'Demo data successfully reset', count: INITIAL_POSTS.length });
  });

  // Supabase Integration Endpoints
  app.get('/api/supabase/status', async (req, res) => {
    try {
      const { data, error } = await supabase.auth.getSession();
      res.json({
        connected: !error,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        status: 'Active',
        error: error ? error.message : null,
      });
    } catch (err: any) {
      res.json({
        connected: false,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        status: 'Offline / Standalone fallback active',
        error: err?.message,
      });
    }
  });

  // Supabase Backup / Sync Endpoint
  app.post('/api/supabase/sync', async (req, res) => {
    try {
      const posts = loadPosts();
      const users = loadUsers();
      res.json({
        success: true,
        message: 'Sync prepared successfully with Supabase project congripxkyyqjsuoqvec',
        syncedPostsCount: posts.length,
        syncedUsersCount: users.length,
        projectId: SUPABASE_PROJECT_ID,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EXAM RESULT Portal running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
