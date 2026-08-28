import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://congripxkyyqjsuoqvec.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QGQr1Txr9t1Qc0is_mwJmA_EyM3bSNF';
const BASE_DOMAIN = 'https://exam-result-1.vercel.app';

const staticRoutes = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: 'latest-jobs', changefreq: 'daily', priority: '0.9' },
  { path: 'results', changefreq: 'daily', priority: '0.9' },
  { path: 'admit-card', changefreq: 'daily', priority: '0.9' },
  { path: 'answer-key', changefreq: 'daily', priority: '0.8' },
  { path: 'syllabus', changefreq: 'weekly', priority: '0.8' },
  { path: 'admissions', changefreq: 'daily', priority: '0.8' },
  { path: 'latest-updates', changefreq: 'always', priority: '0.8' },
  { path: 'important-links', changefreq: 'weekly', priority: '0.7' },
  { path: 'about', changefreq: 'monthly', priority: '0.5' },
  { path: 'contact', changefreq: 'monthly', priority: '0.5' },
  { path: 'privacy-policy', changefreq: 'monthly', priority: '0.4' },
  { path: 'disclaimer', changefreq: 'monthly', priority: '0.4' },
];

function formatDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export async function generateSitemapXML() {
  const today = new Date().toISOString().split('T')[0];
  let urls = [];

  // Add static routes
  staticRoutes.forEach(r => {
    urls.push(`  <url>
    <loc>${BASE_DOMAIN}/${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`);
  });

  // Fetch all published posts from Supabase
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, slug, category, created_at, updated_at, post_date, eligibility_criteria')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(posts)) {
      const addedSlugs = new Set();
      posts.forEach(p => {
        if (!p.slug) return;
        
        // Exclude drafts/private posts if flagged in eligibility_criteria
        let isPublished = true;
        try {
          if (p.eligibility_criteria) {
            const parsed = typeof p.eligibility_criteria === 'string' ? JSON.parse(p.eligibility_criteria) : p.eligibility_criteria;
            if (parsed && (parsed.status === 'draft' || parsed.isPublished === false)) {
              isPublished = false;
            }
          }
        } catch {}

        if (isPublished && !addedSlugs.has(p.slug)) {
          addedSlugs.add(p.slug);
          const lastMod = formatDate(p.updated_at || p.post_date || p.created_at);
          urls.push(`  <url>
    <loc>${BASE_DOMAIN}/post/${encodeURIComponent(p.slug)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
        }
      });
      console.log(`[Sitemap] Generated with ${posts.length} published posts from Supabase.`);
    } else {
      console.warn('[Sitemap] Supabase fetch error or empty, using fallback:', error);
    }
  } catch (err) {
    console.error('[Sitemap] Error fetching from Supabase:', err);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

async function run() {
  const xml = await generateSitemapXML();
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  console.log('[Sitemap] Written to public/sitemap.xml successfully.');

  const distDir = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
    console.log('[Sitemap] Written to dist/sitemap.xml successfully.');
  }
}

if (process.argv[1] && process.argv[1].endsWith('generate-sitemap.js')) {
  run();
}
