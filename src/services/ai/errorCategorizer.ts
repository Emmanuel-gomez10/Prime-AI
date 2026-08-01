/**
 * Error Categorizer for Gemini API Errors
 * Transforms technical API stack traces into user-friendly UI error notifications.
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

export const categorizeAIError = (error: any): CategorizedAIError => {
  const message = error?.message || String(error) || '';
  const status = error?.status || error?.statusCode;

  // 1. Model Not Found / 404 / Deprecated
  if (status === 404 || message.includes('404') || message.includes('not found') || message.includes('is not supported for model')) {
    return {
      category: 'MODEL_NOT_FOUND',
      userMessage: 'Prime AI is temporarily switching to a fallback model. Please wait...',
      isRetryable: true,
      rawMessage: message,
    };
  }

  if (message.toLowerCase().includes('deprecated')) {
    return {
      category: 'MODEL_DEPRECATED',
      userMessage: 'Updating AI model architecture. Retrying request...',
      isRetryable: true,
      rawMessage: message,
    };
  }

  // 2. Invalid API Key / 401 / 403
  if (status === 401 || status === 403 || message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
    return {
      category: 'INVALID_API_KEY',
      userMessage: 'Invalid or missing API key. Please verify your VITE_GEMINI_API_KEY environment variable.',
      isRetryable: false,
      rawMessage: message,
    };
  }

  // 3. Rate Limit / 429
  if (status === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
    return {
      category: 'RATE_LIMIT_EXCEEDED',
      userMessage: 'High traffic detected. Switching to backup AI pipeline...',
      isRetryable: true,
      rawMessage: message,
    };
  }

  // 4. Network / Timeout
  if (message.includes('fetch failed') || message.includes('network error') || message.includes('timeout')) {
    return {
      category: 'NETWORK_TIMEOUT',
      userMessage: 'Unable to reach the AI service. Retrying connection...',
      isRetryable: true,
      rawMessage: message,
    };
  }

  // 5. Invalid Request / 400
  if (status === 400 || message.includes('INVALID_ARGUMENT')) {
    return {
      category: 'INVALID_REQUEST',
      userMessage: 'The AI request contained invalid parameters. Please check your attachments or prompt format.',
      isRetryable: false,
      rawMessage: message,
    };
  }

  return {
    category: 'UNKNOWN_ERROR',
    userMessage: 'An unexpected AI processing error occurred. Retrying shortly...',
    isRetryable: true,
    rawMessage: message,
  };
};
