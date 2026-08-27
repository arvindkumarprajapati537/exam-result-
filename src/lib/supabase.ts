import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
export const SUPABASE_PROJECT_ID = 'congripxkyyqjsuoqvec';

const getEnvVar = (key: string): string | undefined => {
  try {
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch {}
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof window !== 'undefined' && (window as any).__ENV__ && (window as any).__ENV__[key]) {
    return (window as any).__ENV__[key];
  }
  return undefined;
};

export const SUPABASE_URL: string =
  ((import.meta as any)?.env?.VITE_SUPABASE_URL as string) ||
  'https://congripxkyyqjsuoqvec.supabase.co';

export const SUPABASE_ANON_KEY: string =
  ((import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_QGQr1Txr9t1Qc0is_mwJmA_EyM3bSNF';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Check connectivity to Supabase Auth and Database
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  projectId: string;
  postsCount?: number;
}> {
  try {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) {
      return { connected: false, message: sessionErr.message, projectId: SUPABASE_PROJECT_ID };
    }
    const { data: posts, error: postErr } = await supabase.from('posts').select('id').limit(100);
    return {
      connected: true,
      message: 'Connected to Supabase Authentication & Database successfully',
      projectId: SUPABASE_PROJECT_ID,
      postsCount: posts?.length || 0,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Supabase connection failed',
      projectId: SUPABASE_PROJECT_ID,
    };
  }
}
