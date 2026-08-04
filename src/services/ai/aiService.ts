import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG, getApiKey } from '../../config/ai';
import { aiLogger } from './logger';
import { categorizeAIError } from './errorCategorizer';

export interface AIServiceAttachment {
  name: string;
  type: 'pdf' | 'docx' | 'image' | 'text';
  content: string;
  base64?: string;
}

export interface AIServiceRequest {
  featureName: string;
  systemInstruction: string;
  userPrompt: string;
  attachments?: AIServiceAttachment[];
  history?: Array<{ role: 'user' | 'model'; content: string }>;
}

export interface AIServiceResponseStream {
  stream: AsyncGenerator<string, void, unknown>;
  usedModel: string;
}

/**
 * Centralized AI Service
 * 
 * CRITICAL RULE: This is the ONLY place in the entire codebase where
 * `new GoogleGenerativeAI(...)` is called.
 */
class AIService {
  private static instance: AIService;
  private sdk: GoogleGenerativeAI | null = null;
  private activeKey: string = '';

  private constructor() {
    this.syncKey();
  }

  private syncKey(): boolean {
    const key = getApiKey();
    if (key && key !== this.activeKey) {
      this.activeKey = key;
      this.sdk = new GoogleGenerativeAI(key);
      return true;
    }
    return Boolean(this.sdk);
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Executes AI streaming with automatic model fallback candidates.
   */
  public async generateStream(request: AIServiceRequest): Promise<AIServiceResponseStream> {
    const key = getApiKey();
    if (!key) {
      throw new Error(
        'Google Generative AI API key is missing. Please add VITE_GEMINI_API_KEY in your Vercel Environment Variables or enter your API key in Settings.'
      );
    }

    if (!this.sdk || this.activeKey !== key) {
      this.activeKey = key;
      this.sdk = new GoogleGenerativeAI(key);
    }

    // Candidate fallback chain: Primary model first, followed by configured fallback candidates
    const candidateModels = Array.from(
      new Set([AI_CONFIG.primaryModel, ...AI_CONFIG.fallbackModels])
    );

    let lastError: any = null;

    for (let i = 0; i < candidateModels.length; i++) {
      const modelName = candidateModels[i];
      aiLogger.logRequest(request.featureName, modelName);

      try {
        const startTime = Date.now();
        const model = this.sdk.getGenerativeModel({
          model: modelName,
          systemInstruction: request.systemInstruction,
        });

        // Format history
        const formattedHistory = (request.history || []).map((h) => ({
          role: h.role,
          parts: [{ text: h.content }],
        }));

        // Format user message parts (text + attachments)
        const currentParts: any[] = [];

        if (request.attachments && request.attachments.length > 0) {
          for (const att of request.attachments) {
            if (att.type === 'image' && att.base64) {
              const match = att.base64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
              if (match) {
                currentParts.push({
                  inlineData: {
                    mimeType: match[1],
                    data: match[2],
                  },
                });
              }
            } else {
              currentParts.push({
                text: `[ATTACHED DOCUMENT (${att.name})]:\n${att.content}\n--- END ATTACHMENT ---`,
              });
            }
          }
        }

        if (request.userPrompt) {
          currentParts.push({ text: request.userPrompt });
        }

        let rawStream: any;

        if (formattedHistory.length === 0) {
          const result = await model.generateContentStream(currentParts);
          rawStream = result.stream;
        } else {
          const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
              maxOutputTokens: AI_CONFIG.maxOutputTokens,
              temperature: AI_CONFIG.temperature,
            },
          });
          const result = await chat.sendMessageStream(currentParts);
          rawStream = result.stream;
        }

        const executionTimeMs = Date.now() - startTime;
        aiLogger.logSuccess({
          feature: request.featureName,
          requestedModel: AI_CONFIG.primaryModel,
          usedModel: modelName,
          timestamp: new Date().toISOString(),
          executionTimeMs,
        });

        return {
          stream: this.createAsyncGenerator(rawStream),
          usedModel: modelName,
        };

      } catch (err: any) {
        lastError = err;
        const categorized = categorizeAIError(err);

        aiLogger.logError({
          feature: request.featureName,
          requestedModel: modelName,
          timestamp: new Date().toISOString(),
          errorType: categorized.category,
          errorMessage: categorized.rawMessage,
        });

        // If candidate failed and there is a next candidate in fallback chain, log & continue loop
        if (i < candidateModels.length - 1 && categorized.isRetryable) {
          const nextModel = candidateModels[i + 1];
          aiLogger.logFallback(request.featureName, modelName, nextModel, categorized.category);
          continue;
        }

        // If non-retryable or end of chain, throw clean categorized user message
        throw new Error(categorized.userMessage);
      }
    }

    const finalCategorized = categorizeAIError(lastError);
    throw new Error(finalCategorized.userMessage);
  }

  private async *createAsyncGenerator(stream: any): AsyncGenerator<string, void, unknown> {
    for await (const chunk of stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }
}

export const aiService = AIService.getInstance();
