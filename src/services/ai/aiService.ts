import OpenAI from 'openai';
import { AI_CONFIG, getApiKey } from '../../config/ai';
import { aiLogger } from './logger';
import { categorizeAIError } from './errorCategorizer';
import { supabase } from '../../lib/supabaseClient';

export async function logAiUsageEvent(featureName: string, modelUsed: string, success: boolean = true) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    await supabase.from('ai_usage').insert({
      user_id: session.user.id,
      feature_name: featureName || 'AI Tutor',
      model_used: modelUsed || 'gpt-4o-mini',
      success,
    });
  } catch (err) {
    console.error('Failed to log AI usage event:', err);
  }
}

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
 * `new OpenAI(...)` is called.
 */
class AIService {
  private static instance: AIService;
  private client: OpenAI | null = null;
  private activeKey: string = '';

  private constructor() {
    this.syncKey();
  }

  private syncKey(): boolean {
    const key = getApiKey();
    if (key && key !== this.activeKey) {
      this.activeKey = key;
      this.client = new OpenAI({
        apiKey: key,
        dangerouslyAllowBrowser: true,
      });
      return true;
    }
    return Boolean(this.client);
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
      console.error('[AI Technical Service Error]: Missing API Key');
      throw new Error('Prime AI is temporarily unavailable. Please try again.');
    }

    if (!this.client || this.activeKey !== key) {
      this.activeKey = key;
      this.client = new OpenAI({
        apiKey: key,
        dangerouslyAllowBrowser: true,
      });
    }

    // Check user account status and feature flags / system maintenance controls before execution
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      // 1. Check user status (suspended)
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, is_admin, role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.status === "suspended") {
        throw new Error("Your student account is currently suspended. Please contact support.");
      }

      const isAdmin = Boolean(profile?.is_admin || profile?.role === "admin");

      // 2. Check System Settings (maintenance_mode, daily_request_limit)
      const { data: settingsData } = await supabase
        .from("system_settings")
        .select("key, value");

      const settingsMap: Record<string, any> = {};
      if (settingsData) {
        for (const s of settingsData) {
          settingsMap[s.key] = s.value;
        }
      }

      if (settingsMap.maintenance_mode === true && !isAdmin) {
        throw new Error("Prime AI is currently undergoing scheduled maintenance. Please check back shortly.");
      }

      // Sync active primary / fallback model from DB settings if set
      if (settingsMap.primary_model) {
        AI_CONFIG.primaryModel = settingsMap.primary_model;
      }
      if (settingsMap.fallback_model) {
        AI_CONFIG.fallbackModels = [settingsMap.fallback_model];
      }

      // 3. Feature Flags check
      if (settingsMap.feature_flags && Array.isArray(settingsMap.feature_flags)) {
        const flagKeyMap: Record<string, string> = {
          tutor: "ai_tutor",
          "study-fetch": "study_summarizer",
          flashcards: "flashcards",
          "image-solver": "image_solver",
          quiz: "quiz_generator",
          essay: "essay_writer",
        };
        const flagKey = flagKeyMap[request.featureName] || request.featureName;
        const targetFlag = settingsMap.feature_flags.find((f: any) => f.key === flagKey || f.name.toLowerCase() === request.featureName.toLowerCase());
        if (targetFlag && targetFlag.enabled === false) {
          throw new Error(`The ${targetFlag.name || request.featureName} feature is currently disabled by administrator policy.`);
        }
      }

      // 4. Daily AI Request Limit Check against real ai_usage table
      const dailyLimit = typeof settingsMap.daily_request_limit === "number" ? settingsMap.daily_request_limit : 50;
      if (!isAdmin && dailyLimit > 0) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from("ai_usage")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .gte("created_at", todayStart.toISOString());

        if ((count || 0) >= dailyLimit) {
          throw new Error(`You have reached your daily limit of ${dailyLimit} AI requests. Upgrade or try again tomorrow.`);
        }
      }
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

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

        // 1. System instruction
        if (request.systemInstruction) {
          messages.push({
            role: 'system',
            content: request.systemInstruction,
          });
        }

        // 2. Chat history
        if (request.history && request.history.length > 0) {
          for (const item of request.history) {
            messages.push({
              role: item.role === 'model' ? 'assistant' : 'user',
              content: item.content,
            });
          }
        }

        // 3. User message parts (text + attachments)
        const userContentParts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

        if (request.attachments && request.attachments.length > 0) {
          for (const att of request.attachments) {
            if (att.type === 'image' && att.base64) {
              userContentParts.push({
                type: 'image_url',
                image_url: {
                  url: att.base64,
                },
              });
            } else {
              userContentParts.push({
                type: 'text',
                text: `[ATTACHED DOCUMENT (${att.name})]:\n${att.content}\n--- END ATTACHMENT ---`,
              });
            }
          }
        }

        if (request.userPrompt) {
          userContentParts.push({
            type: 'text',
            text: request.userPrompt,
          });
        }

        if (userContentParts.length > 0) {
          messages.push({
            role: 'user',
            content: userContentParts,
          });
        }

        const rawStream = await this.client.chat.completions.create({
          model: modelName,
          messages,
          max_tokens: AI_CONFIG.maxOutputTokens,
          temperature: AI_CONFIG.temperature,
          stream: true,
        });

        const executionTimeMs = Date.now() - startTime;
        aiLogger.logSuccess({
          feature: request.featureName,
          requestedModel: AI_CONFIG.primaryModel,
          usedModel: modelName,
          timestamp: new Date().toISOString(),
          executionTimeMs,
        });

        return {
          stream: this.createAsyncGenerator(rawStream, request.featureName, modelName),
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

        logAiUsageEvent(request.featureName, modelName, false).catch(() => {});

        // If candidate failed and there is a next candidate in fallback chain, log & continue loop
        if (i < candidateModels.length - 1 && categorized.isRetryable) {
          const nextModel = candidateModels[i + 1];
          aiLogger.logFallback(request.featureName, modelName, nextModel, categorized.category);
          // 1-second pause to allow rate limits to recover before next candidate
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        // If non-retryable or end of chain, throw clean categorized user message
        throw new Error(categorized.userMessage);
      }
    }

    const finalCategorized = categorizeAIError(lastError);
    throw new Error(finalCategorized.userMessage);
  }

  private async *createAsyncGenerator(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    featureName: string,
    modelName: string
  ): AsyncGenerator<string, void, unknown> {
    try {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          yield text;
        }
      }
      // Stream completed successfully - record completed usage event
      logAiUsageEvent(featureName, modelName, true).catch(() => {});
    } catch (err) {
      // Stream failed mid-transmission - record failed usage event
      logAiUsageEvent(featureName, modelName, false).catch(() => {});
      throw err;
    }
  }
}

export const aiService = AIService.getInstance();
