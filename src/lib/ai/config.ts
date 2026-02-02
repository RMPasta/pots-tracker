export const AI_CONFIG = {
  defaultModel: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  fallbackModel: 'gpt-3.5-turbo',
  maxTokens: 500,
  temperature: 0.7,
  timeout: 30000,
} as const;
