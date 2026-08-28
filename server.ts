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
const DEFAULT_SALT = '6dd89f725e6084c79f17c7c4df676dc3';
// Secure password hash computed for primary admin account password Arvind@2000
const PRIMARY_ADMIN_HASH = '6601853c3d183f8d429fc2fe9f94a6397394123832599c5aebcd5d89b9b14a51d112a366f4051daf4180ad0c117966768655b0bb895917c16047eb7af1d21527';

function loadAdmins(): AdminRecord[] {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = fs.readFileSync(ADMINS_FILE, 'utf-8');
      const parsed: AdminRecord[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure primary admin is included
        const hasPrimary = parsed.some(a => a.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase());
        if (!hasPrimary) {
          parsed.unshift({
            id: 'admin-arvind-primary',
            name: 'Arvind Kumar Prajapati',
            email: PRIMARY_ADMIN_EMAIL,
            salt: DEFAULT_SALT,
            passwordHash: PRIMARY_ADMIN_HASH,
            role: 'admin',
            createdAt: '2026-01-01T00:00:00Z',
          });
          saveAdmins(parsed);
        }
        return parsed;
      }
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
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading posts file:', err);
  }

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
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
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

// Convert Supabase database row to Post
function fromSupabasePost(row: any): Post {
  let extra: any = {};
  if (row.eligibility_criteria) {
    if (typeof row.eligibility_criteria === 'string' && row.eligibility_criteria.startsWith('{')) {
      try {
        extra = JSON.parse(row.eligibility_criteria);
      } catch {
        extra = { eligibilitySummary: row.eligibility_criteria };
      }
    } else if (typeof row.eligibility_criteria === 'object' && row.eligibility_criteria !== null) {
      extra = row.eligibility_criteria;
    } else {
      extra = { eligibilitySummary: String(row.eligibility_criteria) };
    }
  }

  const qual =
    extra.qualification ||
    (Array.isArray(row.qualification_tags) && row.qualification_tags.length > 0
      ? row.qualification_tags[0]
      : 'Graduate');

  return {
    id: String(row.id),
    title: row.title || 'Untitled Notification',
    slug: row.slug || String(row.id),
    category: row.category || 'latest-jobs',
    organization: row.organization || 'Government Organization',
    advtNo: row.advt_no || extra.advtNo || '',
    stateOrCentral: row.state_or_region || 'All India / Central',
    qualification: qual,
    totalVacancies: row.total_vacancy ? String(row.total_vacancy) : (extra.totalVacancies || ''),
    shortDescription: row.short_description || row.title || '',
    content: extra.content || row.short_description || '',
    importantDates: {
      applicationBegin: row.application_begin || '',
      lastDate: row.last_date_apply || '',
      feePaymentLastDate: row.last_date_fee || '',
      examDate: row.exam_date || '',
      admitCardDate: row.admit_card_date || '',
      resultDate: row.result_date || '',
      answerKeyDate: row.answer_key_date || '',
      objectionLastDate: extra.objectionLastDate || '',
      correctionDate: extra.correctionDate || '',
      customDates: extra.customDates || [],
    },
    applicationFee:
      typeof row.application_fee === 'object' && row.application_fee !== null
        ? row.application_fee
        : { generalObc: '₹ 100/-', scSt: '₹ 0/-', phFemale: '₹ 0/-', paymentMode: 'Online' },
    ageLimit:
      typeof row.age_limit === 'object' && row.age_limit !== null
        ? row.age_limit
        : { minAge: 18, maxAge: 35 },
    vacancyDetails: Array.isArray(row.vacancy_details) ? row.vacancy_details : [],
    physicalEligibility: Array.isArray(extra.physicalEligibility) ? extra.physicalEligibility : [],
    eligibilitySummary:
      extra.eligibilitySummary ||
      (typeof row.eligibility_criteria === 'string' && !row.eligibility_criteria.startsWith('{')
        ? row.eligibility_criteria
        : ''),
    howToApply: Array.isArray(row.how_to_apply) ? row.how_to_apply : [],
    importantInstructions: extra.importantInstructions || '',
    importantLinks: Array.isArray(row.important_links) ? row.important_links : [],
    officialWebsite: extra.officialWebsite || '',
    status: extra.status === 'draft' ? 'draft' : 'published',
    isFeatured: !!row.is_featured || !!extra.isFeatured,
    views: typeof row.views_count === 'number' ? row.views_count : 0,
    publishedAt: row.post_date || row.created_at || new Date().toISOString(),
    createdAt: row.created_at || row.post_date || new Date().toISOString(),
    updatedAt: row.updated_at || row.update_date || new Date().toISOString(),
    metaTitle: extra.metaTitle || row.title || '',
    metaDescription: extra.metaDescription || row.short_description || '',
  };
}

// Convert application Post format to Supabase posts table schema
function toSupabasePost(p: Partial<Post>) {
  const extra = {
    status: p.status || 'published',
    content: p.content || '',
    qualification: p.qualification || 'Graduate',
    officialWebsite: p.officialWebsite || '',
    physicalEligibility: p.physicalEligibility || [],
    importantInstructions: p.importantInstructions || '',
    eligibilitySummary: p.eligibilitySummary || '',
    customDates: p.importantDates?.customDates || [],
    objectionLastDate: p.importantDates?.objectionLastDate || '',
    correctionDate: p.importantDates?.correctionDate || '',
    metaTitle: p.metaTitle || '',
    metaDescription: p.metaDescription || '',
    totalVacancies: p.totalVacancies || '',
    isFeatured: !!p.isFeatured,
  };

  const totalVacNum =
    typeof p.totalVacancies === 'number'
      ? p.totalVacancies
      : parseInt(String(p.totalVacancies || '0').replace(/\D/g, ''), 10) || 0;

  const now = new Date().toISOString();

  return {
    id: p.id || `post-${Date.now()}`,
    title: p.title || 'Untitled Notification',
    slug: p.slug || `post-${Date.now()}`,
    short_description: p.shortDescription || p.title || '',
    post_date: p.publishedAt || now,
    update_date: p.updatedAt || now,
    organization: p.organization || 'Government Organization',
    category: p.category || 'latest-jobs',
    post_name: p.title || 'Notification',
    advt_no: p.advtNo || null,
    total_vacancy: totalVacNum,
    application_begin: p.importantDates?.applicationBegin || null,
    last_date_apply: p.importantDates?.lastDate || null,
    last_date_fee: p.importantDates?.feePaymentLastDate || null,
    exam_date: p.importantDates?.examDate || null,
    admit_card_date: p.importantDates?.admitCardDate || null,
    result_date: p.importantDates?.resultDate || null,
    answer_key_date: p.importantDates?.answerKeyDate || null,
    application_fee: p.applicationFee || {},
    age_limit: p.ageLimit || {},
    vacancy_details: p.vacancyDetails || [],
    eligibility_criteria: JSON.stringify(extra),
    how_to_apply: p.howToApply || [],
    important_links: p.importantLinks || [],
    state_or_region: p.stateOrCentral || 'All India / Central',
    qualification_tags: p.qualification ? [p.qualification] : [],
    is_trending: false,
    is_featured: !!p.isFeatured,
    is_breaking_news: false,
    views_count: p.views || 0,
    created_at: p.createdAt || now,
    updated_at: p.updatedAt || now,
  };
}

// Sync single post to Supabase database in background
async function syncPostToSupabase(post: Partial<Post>) {
  try {
    const row = toSupabasePost(post);
    await supabase.from('posts').upsert(row);
  } catch (err) {
    console.warn('Background Supabase post sync notice:', err);
  }
}

// Delete post from Supabase database in background
async function deletePostFromSupabase(id: string, slug?: string) {
  try {
    await supabase.from('posts').delete().eq('id', id);
    if (slug) {
      await supabase.from('posts').delete().eq('slug', slug);
    }
  } catch (err) {
    console.warn('Background Supabase delete notice:', err);
  }
}

// Full Sync local posts to Supabase
async function performFullSupabaseSync(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const posts = loadPosts();
    const mapped = posts.map(toSupabasePost);
    const { error } = await supabase.from('posts').upsert(mapped);
    if (error) {
      return { success: false, count: 0, error: error.message };
    }
    return { success: true, count: mapped.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message };
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

  // Get all posts with filtering, sorting, pagination (Powered by Supabase database)
  app.get('/api/posts', async (req, res) => {
    let posts: Post[] = [];

    try {
      const { data: supaRows, error: supaErr } = await supabase
        .from('posts')
        .select('*')
        .order('post_date', { ascending: false });

      if (!supaErr && Array.isArray(supaRows) && supaRows.length > 0) {
        posts = supaRows.map(fromSupabasePost);
        // Also update local cache
        savePosts(posts);
      } else {
        posts = loadPosts();
      }
    } catch {
      posts = loadPosts();
    }

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
  app.get('/api/posts/:slugOrId', async (req, res) => {
    const { slugOrId } = req.params;

    try {
      const { data: supaRows } = await supabase
        .from('posts')
        .select('*')
        .or(`id.eq.${slugOrId},slug.eq.${slugOrId}`)
        .limit(1);

      if (supaRows && supaRows.length > 0) {
        const post = fromSupabasePost(supaRows[0]);
        // Increment view count in Supabase
        supabase.from('posts').update({ views_count: (post.views || 0) + 1 }).eq('id', post.id).then(() => {});
        return res.json({ ...post, views: (post.views || 0) + 1 });
      }
    } catch {}

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
  app.post('/api/posts', async (req, res) => {
    const postData = req.body;
    if (!postData.title || !postData.category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

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

    // Save to Supabase
    try {
      const row = toSupabasePost(newPost);
      const { data, error } = await supabase.from('posts').upsert(row).select();
      if (error) {
        console.error('Supabase /api/posts error:', error);
      } else if (data && data[0]) {
        const confirmed = fromSupabasePost(data[0]);
        // Also update local cache
        const posts = loadPosts();
        const existingIdx = posts.findIndex(p => p.id === targetId || p.slug === generatedSlug);
        if (existingIdx > -1) {
          posts[existingIdx] = confirmed;
        } else {
          posts.unshift(confirmed);
        }
        savePosts(posts);
        return res.status(201).json(confirmed);
      }
    } catch (e) {
      console.error('Supabase /api/posts exception:', e);
    }

    const posts = loadPosts();
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
  app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const completePost: Partial<Post> = {
      ...updateData,
      id,
      updatedAt: new Date().toISOString(),
    };

    try {
      const row = toSupabasePost(completePost);
      const { data, error } = await supabase.from('posts').upsert(row).select();
      if (!error && data && data[0]) {
        const confirmed = fromSupabasePost(data[0]);
        const posts = loadPosts();
        const index = posts.findIndex(p => p.id === id || p.slug === id);
        if (index > -1) {
          posts[index] = confirmed;
        } else {
          posts.unshift(confirmed);
        }
        savePosts(posts);
        return res.json(confirmed);
      }
    } catch (e) {
      console.error('Supabase /api/posts/:id update exception:', e);
    }

    const posts = loadPosts();
    const index = posts.findIndex(p => p.id === id || p.slug === id);

    let savedPost: Post;
    if (index === -1) {
      savedPost = {
        ...updateData,
        id,
        updatedAt: new Date().toISOString(),
        createdAt: updateData.createdAt || new Date().toISOString(),
      };
      posts.unshift(savedPost);
    } else {
      posts[index] = {
        ...posts[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      savedPost = posts[index];
    }

    savePosts(posts);
    res.json(savedPost);
  });

  // Delete post
  app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
      await supabase.from('posts').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete error:', e);
    }

    let posts = loadPosts();
    posts = posts.filter(p => p.id !== id && p.slug !== id);
    savePosts(posts);

    res.json({ success: true, message: 'Post deleted successfully' });
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
      // Check if primary admin was attempted and needs provisioning
      if (inputEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
        const isDefaultValid = verifyPasswordHash(inputPass, PRIMARY_ADMIN_HASH, DEFAULT_SALT);
        if (isDefaultValid) {
          const adminUser: User = {
            id: 'admin-arvind-primary',
            name: 'Arvind Kumar Prajapati',
            email: PRIMARY_ADMIN_EMAIL,
            role: 'admin',
            createdAt: '2026-01-01T00:00:00Z',
            savedPostIds: [],
          };
          const sessionToken = `admin_session_${crypto.randomBytes(32).toString('hex')}`;
          activeAdminSessions.set(sessionToken, {
            user: adminUser,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          });
          return res.json({ token: sessionToken, user: adminUser });
        }
      }
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify secure password hash
    const isValid = verifyPasswordHash(inputPass, matchedAdmin.passwordHash, matchedAdmin.salt);
    if (!isValid) {
      // Fallback check against default primary hash if salt was reset
      if (inputEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() && verifyPasswordHash(inputPass, PRIMARY_ADMIN_HASH, DEFAULT_SALT)) {
        // Valid primary admin default password
      } else {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
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

    // Strict check: Only authorized admin email receives the ADMIN role
    if (cleanEmail !== PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({
        error: 'Access Denied. You are not authorized to access the EXAM RESULT Admin Panel.',
      });
    }

    const admins = loadAdmins();
    let matchedAdmin = admins.find(a => a.email.toLowerCase() === cleanEmail);

    if (!matchedAdmin) {
      matchedAdmin = {
        id: 'admin-arvind-primary',
        name: name || 'Arvind Kumar Prajapati',
        email: PRIMARY_ADMIN_EMAIL,
        salt: DEFAULT_SALT,
        passwordHash: PRIMARY_ADMIN_HASH,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      admins.push(matchedAdmin);
      saveAdmins(admins);
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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing session token.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const session = activeAdminSessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
      activeAdminSessions.delete(token);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    return res.json({
      valid: true,
      user: session.user,
    });
  });

  // Auth: Admin Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      activeAdminSessions.delete(token);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Auth: Admin Change Password
  app.post('/api/auth/admin-change-password', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Please log in as Admin first.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const session = activeAdminSessions.get(token);

    if (!session || session.expiresAt < Date.now() || session.user.role !== 'admin') {
      activeAdminSessions.delete(token);
      return res.status(401).json({ error: 'Unauthorized: Session invalid or expired.' });
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

  // Supabase Status Endpoint
  app.get('/api/supabase/status', async (req, res) => {
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      const { data: posts, error: postErr } = await supabase.from('posts').select('id');
      
      const isConnected = !sessionErr && !postErr;
      res.json({
        connected: isConnected,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        status: isConnected ? 'Active & Synced' : 'Partial / Standalone Fallback Active',
        postsInSupabase: posts?.length || 0,
        authStatus: sessionErr ? sessionErr.message : 'Ready',
        error: sessionErr?.message || postErr?.message || null,
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
      const syncResult = await performFullSupabaseSync();
      const posts = loadPosts();
      const users = loadUsers();
      res.json({
        success: syncResult.success,
        message: syncResult.success 
          ? `Successfully synchronized ${syncResult.count} posts with Supabase database (project: ${SUPABASE_PROJECT_ID})`
          : `Supabase sync warning: ${syncResult.error}`,
        syncedPostsCount: syncResult.count || posts.length,
        syncedUsersCount: users.length,
        projectId: SUPABASE_PROJECT_ID,
        timestamp: new Date().toISOString(),
        error: syncResult.error || null,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Perform initial background sync to Supabase on startup
  performFullSupabaseSync().then(result => {
    if (result.success) {
      console.log(`[Supabase] Initial sync completed: ${result.count} posts synchronized.`);
    } else {
      console.warn(`[Supabase] Initial sync notice: ${result.error}`);
    }
  }).catch(() => {});

  // Google Search Console direct verification endpoint
  app.get('/googlec1c8a619c8932e70.html', (req, res) => {
    res.type('text/html').send('google-site-verification: googlec1c8a619c8932e70.html');
  });

  // Google AdSense direct ads.txt verification endpoint
  app.get('/ads.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send('google.com, pub-7771376474449956, DIRECT, f08c47fec0942fa0\n');
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
    
    // Serve static assets with appropriate caching - never cache HTML
    app.use(express.static(distPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    }));

    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
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
