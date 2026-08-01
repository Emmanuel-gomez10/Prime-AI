/**
 * Central AI Configuration
 * 
 * Single source of truth for all AI-related models, fallbacks, timeouts, and API settings.
 * No hardcoded model names should exist anywhere else in the application.
 */

export interface AIModelConfig {
  primaryModel: string;
  fallbackModels: string[];
  maxOutputTokens: number;
  temperature: number;
}

const getEnvModel = (): string => {
  return import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
};

const getEnvFallbackModels = (): string[] => {
  const envFallbacks = import.meta.env.VITE_GEMINI_FALLBACK_MODELS;
  if (envFallbacks) {
    return envFallbacks.split(',').map((m: string) => m.trim()).filter(Boolean);
  }
  // Standard recommended fallback candidates in order of speed and stability
  return ['gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'];
};

export const AI_CONFIG: AIModelConfig = {
  primaryModel: getEnvModel(),
  fallbackModels: getEnvFallbackModels(),
  maxOutputTokens: 2500,
  temperature: 0.7,
};

export const getApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};
