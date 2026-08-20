import { AI_CONFIG } from '../../config/ai';
import { aiLogger } from './logger';
import { categorizeAIError } from './errorCategorizer';
import { supabase } from '../../lib/supabaseClient';
import { 
  normalizeFeatureName, 
  MAX_INPUT_CHARACTERS
} from '../../config/subscriptions';

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

const APPROVED_MODELS = new Set(['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']);

/**
 * Centralized AI Gateway Client
 * 
 * SECURITY HARDENING (Phase B):
 * - Authoritative usage check & atomic reservation occurs 100% server-side inside the Supabase Edge Function.
 * - Browser pre-authorization calls have been removed from the client request path.
 * - Browser client simply passes session JWT to the Edge Function streaming endpoint.
 */
class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Invokes the Supabase Edge Function `openai-gateway` and returns a text stream.
   */
  public async generateStream(request: AIServiceRequest): Promise<AIServiceResponseStream> {
    // ----------------------------------------------------
    // STEP 1: AUTHENTICATION CHECK
    // ----------------------------------------------------
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id || !session?.access_token) {
      throw new Error("Authentication required to access Prime AI features. Please sign in.");
    }

    // ----------------------------------------------------
    // STEP 2: CLIENT INPUT SIZE PRE-VALIDATION
    // ----------------------------------------------------
    let totalInputLength = (request.userPrompt || '').length + (request.systemInstruction || '').length;
    if (request.attachments && request.attachments.length > 0) {
      for (const att of request.attachments) {
        totalInputLength += (att.content || '').length + (att.base64 ? att.base64.length : 0);
      }
    }

    if (totalInputLength > MAX_INPUT_CHARACTERS) {
      throw new Error(`Request size exceeds maximum limit (${MAX_INPUT_CHARACTERS} characters). Please shorten your input.`);
    }

    // ----------------------------------------------------
    // STEP 3: MODEL SELECTION & FEATURE NORMALIZATION
    // ----------------------------------------------------
    const normFeature = normalizeFeatureName(request.featureName);
    let targetModel = AI_CONFIG.primaryModel;
    if (!APPROVED_MODELS.has(targetModel)) {
      targetModel = 'gpt-4o-mini';
    }

    // ----------------------------------------------------
    // STEP 4: INVOKE SUPABASE EDGE FUNCTION (OPENAI GATEWAY)
    // ----------------------------------------------------
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://knvilxppzhugfhbltukp.supabase.co";
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_O5lUeI22TPUrbefwyTwsTQ_oFrVF3CF";
    const functionUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/openai-gateway`;

    aiLogger.logRequest(normFeature, targetModel);
    const startTime = Date.now();

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          featureName: normFeature,
          systemInstruction: request.systemInstruction,
          userPrompt: request.userPrompt,
          attachments: request.attachments,
          history: request.history,
          requestedModel: targetModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'AI Gateway request failed.' }));
        const errObj: any = new Error(errorData.error || `HTTP ${response.status}: AI service unavailable.`);
        errObj.status = response.status;
        throw errObj;
      }

      if (!response.body) {
        throw new Error("No response stream received from AI Gateway.");
      }

      const executionTimeMs = Date.now() - startTime;
      aiLogger.logSuccess({
        feature: normFeature,
        requestedModel: AI_CONFIG.primaryModel,
        usedModel: targetModel,
        timestamp: new Date().toISOString(),
        executionTimeMs,
      });

      return {
        stream: this.createEdgeStreamGenerator(response.body.getReader()),
        usedModel: targetModel,
      };

    } catch (err: any) {
      const categorized = categorizeAIError(err, request.featureName);
      aiLogger.logError({
        feature: normFeature,
        requestedModel: targetModel,
        timestamp: new Date().toISOString(),
        errorType: categorized.category,
        errorMessage: categorized.rawMessage,
      });

      throw new Error(categorized.userMessage);
    }
  }

  /**
   * Converts a ReadableStreamReader from the Edge Function into an AsyncGenerator of text chunks.
   */
  private async *createEdgeStreamGenerator(
    reader: ReadableStreamDefaultReader<Uint8Array>
  ): AsyncGenerator<string, void, unknown> {
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue; // ignore comments / heartbeats

          if (trimmed === "data: [DONE]") {
            break;
          }

          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(dataStr);
              const textChunk = parsed.choices?.[0]?.delta?.content;
              if (textChunk) {
                yield textChunk;
              }
            } catch {
              // Raw text chunk fallback
              if (dataStr && !dataStr.startsWith("{")) {
                yield dataStr;
              }
            }
          }
        }
      }
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // Ignore lock release errors
      }
    }
  }
}

export const aiService = AIService.getInstance();
