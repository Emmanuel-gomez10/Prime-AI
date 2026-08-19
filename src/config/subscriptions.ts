/**
 * PRIME AI - SUBSCRIPTION & FEATURE LIMIT CONFIGURATION
 * 
 * Server-authoritative source of truth for plan structures, 
 * feature limits, usage window duration, and feature normalization.
 */

export type SubscriptionPlan = 'free' | 'premium';

export interface FeatureLimitConfig {
  free: number;
  premium: number;
  label: string;
}

export const USAGE_WINDOW_HOURS = 24;
export const USAGE_WINDOW_MS = USAGE_WINDOW_HOURS * 60 * 60 * 1000;

// Rate limiting settings (server-side rapid request protection)
export const RATE_LIMIT_PER_MINUTE = 10; 

// Token & Input Size Protection Limits
export const MAX_INPUT_CHARACTERS = 20000; // ~5,000 tokens
export const MAX_OUTPUT_TOKENS = 2500;

/**
 * Per-feature limit configuration.
 * - AI TUTOR gets 30 uses per 24 hours on Free.
 * - EVERY OTHER AI FEATURE gets 3 uses per 24 hours on Free.
 */
export const FEATURE_LIMITS: Record<string, FeatureLimitConfig> = {
  ai_tutor: {
    free: 30,
    premium: 300,
    label: 'AI Tutor',
  },
  image_solver: {
    free: 3,
    premium: 50,
    label: 'Image & Assignment Solver',
  },
  study_fetch: {
    free: 3,
    premium: 50,
    label: 'Study Fetch Summarizer',
  },
  quiz_generator: {
    free: 3,
    premium: 50,
    label: 'Practice Quiz Generator',
  },
  flashcards: {
    free: 3,
    premium: 50,
    label: 'Flashcard Generator',
  },
  essay_writer: {
    free: 3,
    premium: 50,
    label: 'Academic Writing Assistant',
  },
  past_questions: {
    free: 3,
    premium: 50,
    label: 'Past Questions AI',
  },
  academic_helper: {
    free: 3,
    premium: 50,
    label: 'Academic Helper',
  },
  exam_mode: {
    free: 3,
    premium: 50,
    label: 'Exam Mode AI',
  },
};

export const DEFAULT_FREE_LIMIT = 3;
export const DEFAULT_PREMIUM_LIMIT = 50;

/**
 * Maps raw engine modes or UI feature names to normalized database feature identifiers.
 */
export function normalizeFeatureName(name: string): string {
  if (!name) return 'ai_tutor';
  const lower = name.toLowerCase().trim();

  const mapping: Record<string, string> = {
    tutor: 'ai_tutor',
    ai_tutor: 'ai_tutor',
    'ai tutor': 'ai_tutor',
    'image-solver': 'image_solver',
    image_solver: 'image_solver',
    'image solver': 'image_solver',
    'study-fetch': 'study_fetch',
    study_fetch: 'study_fetch',
    study_summarizer: 'study_fetch',
    'study fetch': 'study_fetch',
    quiz: 'quiz_generator',
    quiz_generator: 'quiz_generator',
    'quiz generator': 'quiz_generator',
    flashcards: 'flashcards',
    flashcard: 'flashcards',
    essay: 'essay_writer',
    essay_writer: 'essay_writer',
    'essay writer': 'essay_writer',
    past_questions: 'past_questions',
    'past questions': 'past_questions',
    academic_helper: 'academic_helper',
    'academic helper': 'academic_helper',
    exam_mode: 'exam_mode',
    'exam mode': 'exam_mode',
  };

  return mapping[lower] || lower.replace(/[\s-]+/g, '_');
}

/**
 * Returns the effective feature limit for a given plan and normalized feature identifier.
 */
export function getFeatureLimit(plan: SubscriptionPlan | string, featureName: string): number {
  const normPlan: SubscriptionPlan = (plan?.toLowerCase() === 'premium') ? 'premium' : 'free';
  const normFeature = normalizeFeatureName(featureName);

  const config = FEATURE_LIMITS[normFeature];
  if (config) {
    return config[normPlan];
  }

  return normPlan === 'premium' ? DEFAULT_PREMIUM_LIMIT : DEFAULT_FREE_LIMIT;
}

/**
 * Returns user-friendly feature label.
 */
export function getFeatureLabel(featureName: string): string {
  const normFeature = normalizeFeatureName(featureName);
  return FEATURE_LIMITS[normFeature]?.label || featureName;
}
