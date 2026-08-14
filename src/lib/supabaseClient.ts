import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://knvilxppzhugfhbltukp.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_O5lUeI22TPUrbefwyTwsTQ_oFrVF3CF";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.trim())
  ? import.meta.env.VITE_SUPABASE_URL.trim()
  : DEFAULT_SUPABASE_URL;

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.trim())
  ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim()
  : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);