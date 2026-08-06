import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || "https://knvilxppzhugfhbltukp.supabase.co";
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_O5lUeI22TPUrbefwyTwsTQ_oFrVF3CF";

const getValidUrl = (url?: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') return 'https://knvilxppzhugfhbltukp.supabase.co';
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch (e) {
    // Invalid URL string
  }
  return 'https://knvilxppzhugfhbltukp.supabase.co';
};

const getValidKey = (key?: string): string => {
  if (!key || typeof key !== 'string' || key.trim() === '') return 'sb_publishable_O5lUeI22TPUrbefwyTwsTQ_oFrVF3CF';
  return key.trim();
};

const supabaseUrl = getValidUrl(rawUrl);
const supabaseAnonKey = getValidKey(rawKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);




 
