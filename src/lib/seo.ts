/**
 * SEO & Document Title Configuration Helper for EXAM RESULT
 * Ensures all page titles are concise, unique, and keyword-optimized,
 * adhering to search engine and Bing Webmaster Tools character limits.
 */

import { PostCategory } from '../types';

export function getCategoryTitle(category: PostCategory): string {
  switch (category) {
    case 'latest-jobs':
      return 'Latest Jobs 2026 – EXAM RESULT';
    case 'results':
      return 'Latest Exam Results 2026 – EXAM RESULT';
    case 'admit-card':
      return 'Latest Admit Cards 2026 – EXAM RESULT';
    case 'answer-key':
      return 'Latest Answer Keys 2026 – EXAM RESULT';
    case 'syllabus':
      return 'Latest Exam Syllabus 2026 – EXAM RESULT';
    case 'admissions':
      return 'Latest Admissions 2026 – EXAM RESULT';
    default:
      return 'Latest Examination Updates 2026 – EXAM RESULT';
  }
}

export function getCategoryH1(category: PostCategory): string {
  switch (category) {
    case 'latest-jobs':
      return 'Latest Jobs 2026';
    case 'results':
      return 'Latest Exam Results 2026';
    case 'admit-card':
      return 'Latest Admit Cards 2026';
    case 'answer-key':
      return 'Latest Answer Keys 2026';
    case 'syllabus':
      return 'Latest Exam Syllabus 2026';
    case 'admissions':
      return 'Latest Admissions 2026';
    default:
      return 'Latest Exam Updates 2026';
  }
}

/**
 * Shorten long post titles for <title> tag to prevent "TITLE TOO LONG" warnings (keep under ~60-65 chars)
 */
export function getPostPageTitle(postTitle: string): string {
  if (!postTitle) return 'Examination Notice – EXAM RESULT';
  
  const suffix = ' – EXAM RESULT';
  const maxTitleLen = 50; // leave room for suffix
  
  let trimmed = postTitle.trim();
  if (trimmed.length > maxTitleLen) {
    // Truncate at last whole word
    const cut = trimmed.substring(0, maxTitleLen);
    const lastSpace = cut.lastIndexOf(' ');
    trimmed = (lastSpace > 25 ? cut.substring(0, lastSpace) : cut).trim() + '...';
  }
  
  return `${trimmed}${suffix}`;
}

export function updatePageSEO(title: string, description?: string) {
  if (typeof document === 'undefined') return;

  // 1. Update <title>
  document.title = title;

  // 2. Update meta description
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);
  }

  // 3. Update og:title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', title);
}
