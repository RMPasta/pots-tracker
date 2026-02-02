import OpenAI from 'openai';
import { AI_CONFIG } from './config';
import { AIError, AIAPIError, AITimeoutError } from './errors';

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: AI_CONFIG.timeout,
    maxRetries: 2,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForOpenAI.openai = openai;
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. AI features will not work.');
}

export async function callAI(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'json_object' };
    timeout?: number;
  }
): Promise<{ content: string; usage?: OpenAI.Completions.CompletionUsage }> {
  try {
    const model = options?.model || AI_CONFIG.defaultModel;
    const timeout = options?.timeout ?? AI_CONFIG.timeout;

    const client =
      timeout !== AI_CONFIG.timeout
        ? new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            timeout,
            maxRetries: 2,
          })
        : openai;

    const requestParams: {
      model: string;
      messages: Array<{ role: 'user'; content: string }>;
      temperature: number;
      max_tokens?: number;
      response_format?: { type: 'json_object' };
    } = {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? AI_CONFIG.temperature,
      max_tokens: options?.maxTokens ?? AI_CONFIG.maxTokens,
      ...(options?.responseFormat && { response_format: options.responseFormat }),
    };

    const response = await client.chat.completions.create(requestParams);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AIError('No content in AI response', 'NO_CONTENT');
    }

    return {
      content,
      usage: response.usage ?? undefined,
    };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new AIAPIError('Rate limit exceeded', 429, error);
      }
      throw new AIAPIError(error.message || 'OpenAI API error', error.status, error);
    }
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new AITimeoutError('AI request timed out', error);
    }
    if (error instanceof AIError) {
      throw error;
    }
    throw new AIError(
      error instanceof Error ? error.message : 'Unknown AI error',
      'UNKNOWN_ERROR',
      error
    );
  }
}
