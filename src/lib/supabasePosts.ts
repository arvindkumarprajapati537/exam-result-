import { supabase } from './supabase';
import {
  Post,
  PostCategory,
  PostStatus,
  ImportantDates,
  ApplicationFee,
  AgeLimit,
  VacancyItem,
  PhysicalEligibilityItem,
  ImportantLink,
} from '../types';

/**
 * Converts a database row from Supabase 'posts' table into the TypeScript 'Post' model.
 */
export function fromSupabasePost(row: any): Post {
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

  const importantDates: ImportantDates = {
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
  };

  const applicationFee: ApplicationFee =
    typeof row.application_fee === 'object' && row.application_fee !== null
      ? row.application_fee
      : {
          generalObc: '₹ 100/-',
          scSt: '₹ 0/-',
          phFemale: '₹ 0/-',
          paymentMode: 'Online Net Banking / Debit Card / Credit Card / UPI',
          enabled: row.category === 'latest-jobs' || row.category === 'admissions',
        };

  const ageLimit: AgeLimit =
    typeof row.age_limit === 'object' && row.age_limit !== null
      ? row.age_limit
      : {
          minAge: 18,
          maxAge: 35,
          enabled: row.category === 'latest-jobs' || row.category === 'admissions',
        };

  const vacancyDetails: VacancyItem[] = Array.isArray(row.vacancy_details) ? row.vacancy_details : [];
  const importantLinks: ImportantLink[] = Array.isArray(row.important_links) ? row.important_links : [];
  const howToApply: string[] = Array.isArray(row.how_to_apply) ? row.how_to_apply : [];
  const physicalEligibility: PhysicalEligibilityItem[] = Array.isArray(extra.physicalEligibility)
    ? extra.physicalEligibility
    : [];

  return {
    id: String(row.id),
    title: row.title || 'Untitled Notification',
    slug: row.slug || String(row.id),
    category: (row.category || 'latest-jobs') as PostCategory,
    organization: row.organization || 'Government Organization',
    advtNo: row.advt_no || extra.advtNo || '',
    stateOrCentral: row.state_or_region || 'All India / Central',
    qualification: qual,
    totalVacancies: row.total_vacancy ? String(row.total_vacancy) : (extra.totalVacancies || ''),
    shortDescription: row.short_description || row.title || '',
    content: extra.content || row.short_description || '',
    importantDates,
    applicationFee,
    ageLimit,
    vacancyDetails,
    physicalEligibility,
    eligibilitySummary: extra.eligibilitySummary || (typeof row.eligibility_criteria === 'string' && !row.eligibility_criteria.startsWith('{') ? row.eligibility_criteria : ''),
    howToApply,
    importantInstructions: extra.importantInstructions || '',
    importantLinks,
    officialWebsite: extra.officialWebsite || '',
    status: (extra.status === 'draft' ? 'draft' : 'published') as PostStatus,
    isFeatured: !!row.is_featured || !!extra.isFeatured,
    views: typeof row.views_count === 'number' ? row.views_count : 0,
    publishedAt: row.post_date || row.created_at || new Date().toISOString(),
    createdAt: row.created_at || row.post_date || new Date().toISOString(),
    updatedAt: row.updated_at || row.update_date || new Date().toISOString(),
    metaTitle: extra.metaTitle || row.title || '',
    metaDescription: extra.metaDescription || row.short_description || '',
  };
}

/**
 * Converts a TypeScript 'Post' object into the Supabase 'posts' database row structure.
 */
export function toSupabasePost(post: Partial<Post>): any {
  const extra = {
    status: post.status || 'published',
    content: post.content || '',
    qualification: post.qualification || 'Graduate',
    officialWebsite: post.officialWebsite || '',
    physicalEligibility: post.physicalEligibility || [],
    importantInstructions: post.importantInstructions || '',
    eligibilitySummary: post.eligibilitySummary || '',
    customDates: post.importantDates?.customDates || [],
    objectionLastDate: post.importantDates?.objectionLastDate || '',
    correctionDate: post.importantDates?.correctionDate || '',
    metaTitle: post.metaTitle || '',
    metaDescription: post.metaDescription || '',
    totalVacancies: post.totalVacancies || '',
    isFeatured: !!post.isFeatured,
  };

  const totalVacNum = typeof post.totalVacancies === 'number'
    ? post.totalVacancies
    : parseInt(String(post.totalVacancies || '0').replace(/\D/g, ''), 10) || 0;

  const now = new Date().toISOString();

  return {
    id: post.id || `post-${Date.now()}`,
    title: post.title || 'Untitled Notification',
    slug: post.slug || `post-${Date.now()}`,
    short_description: post.shortDescription || post.title || '',
    post_date: post.publishedAt || now,
    update_date: post.updatedAt || now,
    organization: post.organization || 'Government Organization',
    category: post.category || 'latest-jobs',
    post_name: post.title || 'Notification',
    advt_no: post.advtNo || null,
    total_vacancy: totalVacNum,
    application_begin: post.importantDates?.applicationBegin || null,
    last_date_apply: post.importantDates?.lastDate || null,
    last_date_fee: post.importantDates?.feePaymentLastDate || null,
    exam_date: post.importantDates?.examDate || null,
    admit_card_date: post.importantDates?.admitCardDate || null,
    result_date: post.importantDates?.resultDate || null,
    answer_key_date: post.importantDates?.answerKeyDate || null,
    application_fee: post.applicationFee || {},
    age_limit: post.ageLimit || {},
    vacancy_details: post.vacancyDetails || [],
    eligibility_criteria: JSON.stringify(extra),
    how_to_apply: post.howToApply || [],
    important_links: post.importantLinks || [],
    state_or_region: post.stateOrCentral || 'All India / Central',
    qualification_tags: post.qualification ? [post.qualification] : [],
    is_trending: false,
    is_featured: !!post.isFeatured,
    is_breaking_news: false,
    views_count: post.views || 0,
    created_at: post.createdAt || now,
    updated_at: post.updatedAt || now,
  };
}

/**
 * Fetches all published (and optionally draft) posts from Supabase database.
 */
export async function fetchPostsFromSupabase(): Promise<{ posts: Post[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('post_date', { ascending: false });

    if (error) {
      console.warn('[Supabase Database Query Error]:', error.message);
      return { posts: [], error: error.message };
    }

    if (!data || !Array.isArray(data)) {
      return { posts: [] };
    }

    const converted = data.map(fromSupabasePost);
    return { posts: converted };
  } catch (err: any) {
    console.error('[Supabase Fetch Exception]:', err);
    return { posts: [], error: err?.message || 'Database connection error' };
  }
}

/**
 * Inserts a new post record into the Supabase database.
 */
export async function insertPostToSupabase(postData: Partial<Post>): Promise<{ success: boolean; post?: Post; error?: string }> {
  try {
    const targetId = postData.id || `post-${Date.now()}`;
    const generatedSlug = String(postData.slug || postData.title || targetId)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const completePost: Partial<Post> = {
      ...postData,
      id: targetId,
      slug: generatedSlug,
      status: postData.status || 'published',
      publishedAt: postData.publishedAt || new Date().toISOString(),
      createdAt: postData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const row = toSupabasePost(completePost);

    const { data, error } = await supabase
      .from('posts')
      .insert(row)
      .select();

    if (error) {
      console.error('[Supabase Insert Error]:', error);
      return { success: false, error: `Supabase database error: ${error.message} (${error.code || ''})` };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Database did not return the inserted record confirmation.' };
    }

    const insertedPost = fromSupabasePost(data[0]);
    return { success: true, post: insertedPost };
  } catch (err: any) {
    console.error('[Supabase Insert Exception]:', err);
    return { success: false, error: err?.message || 'Exception during database insert' };
  }
}

/**
 * Updates an existing post record in the Supabase database.
 */
export async function updatePostInSupabase(id: string, postData: Partial<Post>): Promise<{ success: boolean; post?: Post; error?: string }> {
  try {
    const completePost: Partial<Post> = {
      ...postData,
      id,
      updatedAt: new Date().toISOString(),
    };

    const row = toSupabasePost(completePost);

    const { data, error } = await supabase
      .from('posts')
      .update(row)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Supabase Update Error]:', error);
      return { success: false, error: `Supabase database update error: ${error.message}` };
    }

    if (!data || data.length === 0) {
      // If eq('id', id) didn't find matching row, try upsert
      const { data: upsertData, error: upsertErr } = await supabase
        .from('posts')
        .upsert(row)
        .select();

      if (upsertErr || !upsertData || upsertData.length === 0) {
        return { success: false, error: upsertErr?.message || 'Post record not found in database.' };
      }
      return { success: true, post: fromSupabasePost(upsertData[0]) };
    }

    const updatedPost = fromSupabasePost(data[0]);
    return { success: true, post: updatedPost };
  } catch (err: any) {
    console.error('[Supabase Update Exception]:', err);
    return { success: false, error: err?.message || 'Exception during database update' };
  }
}

/**
 * Deletes a post record from the Supabase database.
 */
export async function deletePostFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase Delete Error]:', error);
      return { success: false, error: `Supabase database delete error: ${error.message}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase Delete Exception]:', err);
    return { success: false, error: err?.message || 'Exception during database delete' };
  }
}
