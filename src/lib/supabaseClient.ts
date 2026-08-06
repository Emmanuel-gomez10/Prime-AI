import { createClient } from '@supabase/supabase-js';

const getValidUrl = (url?: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    throw new Error('VITE_SUPABASE_URL environment variable is missing or empty.');
  }
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch (e) {
    // Invalid URL string
  }
  throw new Error(`VITE_SUPABASE_URL contains invalid URL string: "${url}"`);
};

const getValidKey = (key?: string): string => {
  if (!key || typeof key !== 'string' || key.trim() === '') {
    throw new Error('VITE_SUPABASE_ANON_KEY environment variable is missing or empty.');
  }
  return key.trim();
};

const supabaseUrl = getValidUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = getValidKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


 
