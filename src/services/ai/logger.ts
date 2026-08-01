/**
 * Structured AI Logger
 * Provides clean production logs and detailed diagnostic development logs.
 */

export interface AILogEntry {
  feature: string;
  requestedModel: string;
  usedModel?: string;
  timestamp: string;
  errorType?: string;
  errorMessage?: string;
  executionTimeMs?: number;
}

class AILogger {
  private isDev = import.meta.env.DEV;

  public logRequest(feature: string, model: string): void {
    if (this.isDev) {
      console.log(`[Prime AI Log] [${new Date().toISOString()}] Feature: "${feature}" | Requested Model: ${model}`);
    }
  }

  public logFallback(feature: string, failedModel: string, fallbackModel: string, reason: string): void {
    console.warn(`[Prime AI Fallback] [${new Date().toISOString()}] Feature: "${feature}" | Model ${failedModel} failed (${reason}). Switching to ${fallbackModel}...`);
  }

  public logSuccess(entry: AILogEntry): void {
    if (this.isDev) {
      console.log(`[Prime AI Success] [${entry.timestamp}] Feature: "${entry.feature}" | Model: ${entry.usedModel} | Time: ${entry.executionTimeMs}ms`);
    }
  }

  public logError(entry: AILogEntry): void {
    console.error(`[Prime AI Error] [${entry.timestamp}] Feature: "${entry.feature}" | Model: ${entry.requestedModel} | ErrorType: ${entry.errorType} | ${entry.errorMessage}`);
  }
}

export const aiLogger = new AILogger();
