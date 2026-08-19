/**
 * Central AI Configuration
 * 
 * Single source of truth for all AI-related models, fallbacks, timeouts, and settings.
 * No hardcoded model names should exist anywhere else in the application.
 */

export interface AIModelConfig {
  primaryModel: string;
  fallbackModels: string[];
  maxOutputTokens: number;
  temperature: number;
}

const getEnvModel = (): string => {
  return import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o';
};

const getEnvFallbackModels = (): string[] => {
  const envFallbacks = import.meta.env.VITE_OPENAI_FALLBACK_MODELS;
  if (envFallbacks) {
    return envFallbacks.split(',').map((m: string) => m.trim()).filter(Boolean);
  }
  // Verified OpenAI models in order of speed, reliability, and capability
  return ['gpt-4o', 'gpt-4o-mini'];
};

export const AI_CONFIG: AIModelConfig = {
  primaryModel: getEnvModel(),
  fallbackModels: getEnvFallbackModels(),
  maxOutputTokens: 2500,
  temperature: 0.7,
};
