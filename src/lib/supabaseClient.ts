import { createClient } from '@supabase/supabase-js';

const getValidUrl = (url?: string): string => {
  if (!url || typeof url !== 'string') return 'https://placeholder.supabase.co';
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch (e) {
    // Invalid URL string
  }
  return 'https://placeholder.supabase.co';
};

const getValidKey = (key?: string): string => {
  if (!key || typeof key !== 'string' || key.trim() === '') return 'placeholder-anon-key';
  return key.trim();
};

const supabaseUrl = getValidUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = getValidKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

 
