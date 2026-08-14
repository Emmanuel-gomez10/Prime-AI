import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://knvilxppzhugfhbltukp.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_O5lUeI22TPUrbefwyTwsTQ_oFrVF3CF";

export function sanitizeUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let trimmed = rawUrl.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    if ((parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.hostname.includes(".")) {
      return parsed.origin;
    }
  } catch {
    // Ignore invalid URL format
  }
  return "";
}

const rawEnvUrl = import.meta.env.VITE_SUPABASE_URL;
const rawEnvKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const sanitizedEnvUrl = sanitizeUrl(rawEnvUrl);
const sanitizedDefaultUrl = sanitizeUrl(DEFAULT_SUPABASE_URL);

const finalUrl = sanitizedEnvUrl || sanitizedDefaultUrl || "https://placeholder.supabase.co";

const finalKey = (rawEnvKey && typeof rawEnvKey === "string" && rawEnvKey.trim() !== "")
  ? rawEnvKey.trim().replace(/^["']|["']$/g, "")
  : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(
  finalUrl,
  finalKey
);