import { getFeatureLabel } from '../../config/subscriptions';

/**
 * Error Categorizer for AI API Errors
 * Logs technical API details to console and provides clean, user-friendly UI messages.
 */

export type AIErrorCategory =
  | 'MODEL_NOT_FOUND'
  | 'MODEL_DEPRECATED'
  | 'INVALID_API_KEY'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_TIMEOUT'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ERROR';

export interface CategorizedAIError {
  category: AIErrorCategory;
  userMessage: string;
  isRetryable: boolean;
  rawMessage: string;
}

export const categorizeAIError = (error: any, featureName?: string): CategorizedAIError => {
  const message = error?.message || String(error) || '';
  const status = error?.status || error?.statusCode;

  // Always log full technical error details for debugging
  console.error('[AI Technical Service Error]:', { status, error, message });

  // 1. Model Not Found / 404 / Deprecated
  if (status === 404 || message.includes('404') || message.includes('model_not_found') || message.includes('does not exist')) {
    return {
      category: 'MODEL_NOT_FOUND',
      userMessage: 'Prime AI is temporarily unavailable. Please try again.',
      isRetryable: true,
      rawMessage: message,
    };
  }

  if (message.toLowerCase().includes('deprecated')) {
    return {
      category: 'MODEL_DEPRECATED',
      userMessage: 'Prime AI is temporarily unavailable. Please try again.',
      isRetryable: true,
      rawMessage: message,
    };
  }

  // 2. Invalid API Key / Auth
  if (status === 401 || status === 403 || message.includes('invalid_api_key') || message.includes('Incorrect API key')) {
    return {
      category: 'INVALID_API_KEY',
      userMessage: 'Prime AI is temporarily unavailable. Please try again.',
      isRetryable: false,
      rawMessage: message,
    };
  }

  // 3. Rate Limit / 429 / Quota Reached
  if (status === 429 || message.includes('429') || message.includes('rate_limit_exceeded') || message.includes('insufficient_quota') || message.toLowerCase().includes('limit exceeded') || message.toLowerCase().includes('usage limit')) {
    const normFeature = (featureName || '').toLowerCase().trim();
    const isTutor = normFeature === 'ai_tutor' || normFeature === 'tutor' || normFeature === 'ai tutor';
    const dynamicLabel = featureName && !isTutor ? getFeatureLabel(featureName) : 'Feature';

    const userMessage = isTutor
      ? "You've reached your AI Tutor limit for the current 24-hour usage window. Please try again when your limit resets, or subscribe to Premium for more access."
      : `You've reached your ${dynamicLabel} limit for the current 24-hour usage window. Please try again when your limit resets, or subscribe to Premium for more access.`;

    return {
      category: 'RATE_LIMIT_EXCEEDED',
      userMessage,
      isRetryable: false,
      rawMessage: message,
    };
  }

  // 4. Network / Timeout
  if (message.includes('fetch failed') || message.includes('network error') || message.includes('timeout')) {
    return {
      category: 'NETWORK_TIMEOUT',
      userMessage: 'Unable to complete your request right now.',
      isRetryable: true,
      rawMessage: message,
    };
  }

  // 5. Invalid Request / 400
  if (status === 400 || message.includes('invalid_request_error')) {
    return {
      category: 'INVALID_REQUEST',
      userMessage: 'Something went wrong. Please try again.',
      isRetryable: false,
      rawMessage: message,
    };
  }

  return {
    category: 'UNKNOWN_ERROR',
    userMessage: 'Something went wrong. Please try again.',
    isRetryable: true,
    rawMessage: message,
  };
};
