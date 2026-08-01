import { aiService, type AIServiceAttachment } from '../services/ai/aiService';


export type EngineMode = 
  | 'tutor' 
  | 'study-fetch' 
  | 'image-solver' 
  | 'flashcards' 
  | 'quiz' 
  | 'essay' 
  | 'general';

export interface FileAttachment extends AIServiceAttachment {}

export interface EngineRequest {
  mode: EngineMode;
  userPrompt: string;
  attachments?: FileAttachment[];
  history?: Array<{ role: 'user' | 'model'; content: string }>;
  systemInstructionOverride?: string;
}

export interface EngineResponseStream {
  stream: AsyncGenerator<string, void, unknown>;
  usedModel?: string;
}

// Feature System Prompts
const SYSTEM_PROMPTS: Record<EngineMode, string> = {
  tutor: `You are Prime AI Tutor, an empathetic, highly intelligent academic mentor built for university and high school students.
- Explain concepts clearly using step-by-step reasoning, intuitive analogies, and Markdown formatting.
- Format code snippets using clean markdown block syntax (\`\`\`language ... \`\`\`).
- If math equations or formulas are present, use standard inline ($...$) or block ($$...$$) LaTeX formatting.
- Ask quick check-for-understanding questions at the end of longer responses when appropriate.`,

  'study-fetch': `You are Prime AI Study Fetch Engine. Your specialty is analyzing lecture notes, PDFs, slide decks, and academic documents.
- Provide clear executive summaries, key takeaways, key definitions, and study questions.
- Refer explicitly to sections or pages from the provided document content when answering.
- Highlight important formulas, dates, or terms in bold.`,

  'image-solver': `You are Prime AI Image & Assignment Solver.
- Inspect homework images, diagrams, math problems, physics and chemistry questions or text-based question screenshots carefully.
- Provide a clear, step-by-step mathematical or conceptual breakdown showing how to solve the problem.
- Highlight the final answer clearly in a dedicated box or bold header.`,

  flashcards: `You are Prime AI Flashcard Generator.
- Generate structured flashcards from the user's input or documents.
- Output high-yield question-answer pairs ideal for spaced repetition and active recall.`,

  quiz: `You are Prime AI Quiz Generator.
- Create multiple-choice, true/false, or short-answer practice questions with detailed explanations for correct options.`,

  essay: `You are Prime AI Academic Writing Assistant.
- Help outline, draft, critique, and refine academic essays, lab reports, and research papers with proper academic tone.`,

  general: `You are Prime AI, an all-in-one AI study companion for students.`
};

export class PrimeAIEngine {
  private static instance: PrimeAIEngine;

  private constructor() {}

  public static getInstance(): PrimeAIEngine {
    if (!PrimeAIEngine.instance) {
      PrimeAIEngine.instance = new PrimeAIEngine();
    }
    return PrimeAIEngine.instance;
  }

  /**
   * Delegates AI generation directly to the centralized AIService.
   */
  public async generateStream(request: EngineRequest): Promise<EngineResponseStream> {
    const systemPrompt = request.systemInstructionOverride || SYSTEM_PROMPTS[request.mode] || SYSTEM_PROMPTS.general;
    
    return await aiService.generateStream({
      featureName: request.mode,
      systemInstruction: systemPrompt,
      userPrompt: request.userPrompt,
      attachments: request.attachments,
      history: request.history,
    });
  }
}

export const primeEngine = PrimeAIEngine.getInstance();

