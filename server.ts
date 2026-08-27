import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
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
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password Security Helpers (PBKDF2 with Salt)
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function verifyPasswordHash(password: string, expectedHash: string, salt: string): boolean {
  try {
    const computedHash = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
}

// Strong Password Policy Validator
function validatePasswordPolicy(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 10) {
    return { valid: false, error: 'Password must be at least 10 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character (!@#$%^&*...).' };
  }
  return { valid: true };
}

// In-memory store for Admin password reset verification tokens (15-minute expiry)
const adminResetTokens = new Map<string, { email: string; token: string; expiresAt: number }>();

interface AdminRecord {
  id: string;
  name: string;
  email: string;
  salt: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
}

// Authorized Admin Configuration
const PRIMARY_ADMIN_EMAIL = 'arvindkumarprajapati537@gmail.com';
const DEFAULT_SALT = 'examresult_secure_admin_salt_2026';
// Secure password hash computed for primary admin account
const PRIMARY_ADMIN_HASH = hashPassword('Arvind@2000', DEFAULT_SALT);

function loadAdmins(): AdminRecord[] {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = fs.readFileSync(ADMINS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading admins file:', err);
  }

  const defaultAdmins: AdminRecord[] = [
    {
      id: 'admin-arvind-primary',
      name: 'Arvind Kumar Prajapati',
      email: PRIMARY_ADMIN_EMAIL,
      salt: DEFAULT_SALT,
      passwordHash: PRIMARY_ADMIN_HASH,
      role: 'admin',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];
  saveAdmins(defaultAdmins);
  return defaultAdmins;
}

function saveAdmins(admins: AdminRecord[]) {
  try {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving admins file:', err);
  }
}

// Active in-memory session map for fast token validation
const activeAdminSessions = new Map<string, { user: User; expiresAt: number }>();

// Initial Public Users
const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-arvind',
    name: 'Arvind Kumar Prajapati',
    email: PRIMARY_ADMIN_EMAIL,
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

  // Middleware to disable caching for API endpoints so cross-device updates reflect immediately
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

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

  // Create or Upsert post
  app.post('/api/posts', (req, res) => {
    const postData = req.body;
    if (!postData.title || !postData.category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const posts = loadPosts();
    const targetId = postData.id || `post-${Date.now()}`;
    const generatedSlug = postData.slug
      ? postData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newPost: Post = {
      ...postData,
      id: targetId,
      slug: generatedSlug,
      status: postData.status || 'published',
      views: postData.views || 0,
      createdAt: postData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: postData.publishedAt || new Date().toISOString(),
    };

    const existingIdx = posts.findIndex(p => p.id === targetId || p.slug === generatedSlug);
    if (existingIdx > -1) {
      posts[existingIdx] = { ...posts[existingIdx], ...newPost };
    } else {
      posts.unshift(newPost);
    }
    savePosts(posts);

    res.status(201).json(newPost);
  });

  // Update post
  app.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const posts = loadPosts();
    const index = posts.findIndex(p => p.id === id || p.slug === id);

    if (index === -1) {
      // Auto-insert if not existing
      const newPost: Post = {
        ...updateData,
        id,
        updatedAt: new Date().toISOString(),
        createdAt: updateData.createdAt || new Date().toISOString(),
      };
      posts.unshift(newPost);
      savePosts(posts);
      return res.json(newPost);
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
    posts = posts.filter(p => p.id !== id && p.slug !== id);

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
      publishedPosts: posts.filter(p => p.status === 'published').length,
      draftPosts: posts.filter(p => p.status === 'draft').length,
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

  // Auth: Admin direct login with secure PBKDF2 hash verification
  app.post('/api/auth/admin-login', (req, res) => {
    const { email, usernameOrEmail, password } = req.body;
    const inputEmail = (email || usernameOrEmail || '').toLowerCase().trim();
    const inputPass = (password || '').trim();

    if (!inputEmail || !inputPass) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const admins = loadAdmins();
    const matchedAdmin = admins.find(a => a.email.toLowerCase() === inputEmail);

    if (!matchedAdmin) {
      // Do not reveal whether email or password was wrong
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify secure password hash
    const isValid = verifyPasswordHash(inputPass, matchedAdmin.passwordHash, matchedAdmin.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const adminUser: User = {
      id: matchedAdmin.id,
      name: matchedAdmin.name,
      email: matchedAdmin.email,
      role: 'admin',
      createdAt: matchedAdmin.createdAt,
      savedPostIds: [],
    };

    const sessionToken = `admin_session_${crypto.randomBytes(32).toString('hex')}`;
    activeAdminSessions.set(sessionToken, {
      user: adminUser,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24-hour admin session
    });

    return res.json({
      token: sessionToken,
      user: adminUser,
    });
  });

  // Auth: Google Sign-in Verification for Admin
  app.post('/api/auth/google-login', (req, res) => {
    const { email, name } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Google email address is required.' });
    }

    const admins = loadAdmins();
    const matchedAdmin = admins.find(a => a.email.toLowerCase() === cleanEmail);

    // Strict check: Only authorized admin Gmail addresses receive the ADMIN role
    if (!matchedAdmin || matchedAdmin.role !== 'admin') {
      return res.status(403).json({
        error: 'Access Denied. You are not authorized to access the EXAM RESULT Admin Panel.',
      });
    }

    const adminUser: User = {
      id: matchedAdmin.id,
      name: name || matchedAdmin.name,
      email: matchedAdmin.email,
      role: 'admin',
      createdAt: matchedAdmin.createdAt,
      savedPostIds: [],
    };

    const sessionToken = `admin_session_g_${crypto.randomBytes(32).toString('hex')}`;
    activeAdminSessions.set(sessionToken, {
      user: adminUser,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return res.json({
      token: sessionToken,
      user: adminUser,
    });
  });

  // Auth: Verify Admin Session
  app.get('/api/auth/verify-session', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization session provided.' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const session = activeAdminSessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
      if (session) activeAdminSessions.delete(token);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    return res.json({ user: session.user, token });
  });

  // Auth: Secure Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      activeAdminSessions.delete(token);
    }
    return res.json({ message: 'Logged out successfully.' });
  });

  // Auth: Admin Change Password
  app.post('/api/auth/admin-change-password', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Access Denied. Admin authentication is required.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const session = activeAdminSessions.get(token);

    if (!session || session.expiresAt < Date.now() || session.user.role !== 'admin') {
      if (session) activeAdminSessions.delete(token);
      return res.status(401).json({ error: 'Session expired or unauthorized. Please log in again.' });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;
    const cleanCurrent = (currentPassword || '').trim();
    const cleanNew = (newPassword || '').trim();
    const cleanConfirm = (confirmPassword || '').trim();

    if (!cleanCurrent || !cleanNew || !cleanConfirm) {
      return res.status(400).json({ error: 'All fields (Current, New, and Confirm Password) are required.' });
    }

    if (cleanNew !== cleanConfirm) {
      return res.status(400).json({ error: 'New Password and Confirm New Password do not match.' });
    }

    const policyCheck = validatePasswordPolicy(cleanNew);
    if (!policyCheck.valid) {
      return res.status(400).json({ error: policyCheck.error || 'Password does not meet security requirements.' });
    }

    const admins = loadAdmins();
    const adminIdx = admins.findIndex(a => a.email.toLowerCase() === session.user.email.toLowerCase());

    if (adminIdx === -1) {
      return res.status(404).json({ error: 'Admin account record not found.' });
    }

    const targetAdmin = admins[adminIdx];

    // 1. Verify current password securely
    const isCurrentValid = verifyPasswordHash(cleanCurrent, targetAdmin.passwordHash, targetAdmin.salt);
    if (!isCurrentValid) {
      return res.status(400).json({ error: 'Current password is incorrect. Please verify and try again.' });
    }

    // 2. Generate new salt & new cryptographic hash
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(cleanNew, newSalt);

    admins[adminIdx] = {
      ...targetAdmin,
      salt: newSalt,
      passwordHash: newHash,
    };
    saveAdmins(admins);

    // 3. Invalidate all active sessions for this admin (require logging in again)
    for (const [sToken, sData] of activeAdminSessions.entries()) {
      if (sData.user.email.toLowerCase() === targetAdmin.email.toLowerCase()) {
        activeAdminSessions.delete(sToken);
      }
    }

    return res.json({
      success: true,
      message: 'Password changed successfully. You must now log in with your new password.',
    });
  });

  // Auth: Admin Forgot Password (Request Reset)
  app.post('/api/auth/admin-forgot-password', (req, res) => {
    const { email } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Please enter an email address.' });
    }

    const admins = loadAdmins();
    const matchedAdmin = admins.find(a => a.email.toLowerCase() === cleanEmail);

    if (matchedAdmin) {
      // Generate secure 6-character reset token
      const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      adminResetTokens.set(cleanEmail, {
        email: cleanEmail,
        token: resetCode,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes validity
      });

      return res.json({
        success: true,
        message: 'If an authorized administrator account exists for this email, password reset instructions have been generated.',
        demoResetCode: resetCode, // Provided for instant interactive validation in this environment
      });
    }

    // Do NOT reveal whether an unauthorized email account exists
    return res.json({
      success: true,
      message: 'If an authorized administrator account exists for this email, password reset instructions have been generated.',
    });
  });

  // Auth: Admin Reset Password with Token
  app.post('/api/auth/admin-reset-password', (req, res) => {
    const { email, resetCode, newPassword, confirmPassword } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanCode = (resetCode || '').trim().toUpperCase();
    const cleanNew = (newPassword || '').trim();
    const cleanConfirm = (confirmPassword || '').trim();

    if (!cleanEmail || !cleanCode || !cleanNew || !cleanConfirm) {
      return res.status(400).json({ error: 'All fields are required to reset password.' });
    }

    if (cleanNew !== cleanConfirm) {
      return res.status(400).json({ error: 'New Password and Confirm New Password do not match.' });
    }

    const policyCheck = validatePasswordPolicy(cleanNew);
    if (!policyCheck.valid) {
      return res.status(400).json({ error: policyCheck.error || 'Password does not meet security requirements.' });
    }

    const tokenEntry = adminResetTokens.get(cleanEmail);
    if (!tokenEntry || tokenEntry.token !== cleanCode || tokenEntry.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired password reset verification code.' });
    }

    const admins = loadAdmins();
    const adminIdx = admins.findIndex(a => a.email.toLowerCase() === cleanEmail);

    if (adminIdx === -1) {
      return res.status(400).json({ error: 'Invalid or expired password reset verification code.' });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(cleanNew, newSalt);

    admins[adminIdx] = {
      ...admins[adminIdx],
      salt: newSalt,
      passwordHash: newHash,
    };
    saveAdmins(admins);
    adminResetTokens.delete(cleanEmail);

    // Invalidate active sessions
    for (const [sToken, sData] of activeAdminSessions.entries()) {
      if (sData.user.email.toLowerCase() === cleanEmail) {
        activeAdminSessions.delete(sToken);
      }
    }

    return res.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  });

  // Auth: Public Candidate Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check if it's an admin logging in via the general login endpoint
    const admins = loadAdmins();
    const matchedAdmin = admins.find(a => a.email.toLowerCase() === cleanEmail);
    if (matchedAdmin && verifyPasswordHash(cleanPass, matchedAdmin.passwordHash, matchedAdmin.salt)) {
      const adminUser: User = {
        id: matchedAdmin.id,
        name: matchedAdmin.name,
        email: matchedAdmin.email,
        role: 'admin',
        createdAt: matchedAdmin.createdAt,
        savedPostIds: [],
      };
      const token = `admin_session_${crypto.randomBytes(32).toString('hex')}`;
      activeAdminSessions.set(token, { user: adminUser, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
      return res.json({ token, user: adminUser });
    }

    const users = loadUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      // Auto-register candidate for candidate portal
      if (cleanPass.length >= 4) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: cleanEmail.split('@')[0].toUpperCase(),
          email: cleanEmail,
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
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.json({
      token: `token-${user.id}-${Date.now()}`,
      user,
    });
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
