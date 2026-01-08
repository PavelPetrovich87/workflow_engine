
import { z } from 'zod';

/**
 * 🤖 LlmConfig
 * Standard configuration expected by all LLM-based nodes.
 * This can be mixed into the `node.config` or provided via `node.data` overrides.
 */
export const LlmConfigSchema = z.object({
  model: z.string().default('gemini-flash').describe('The Model ID to use (e.g., gpt-4, gemini-pro)'),
  temperature: z.number().min(0).max(1).default(0.7).describe('Creativity control (0.0 = deterministic, 1.0 = creative)'),
  maxTokens: z.number().optional().describe('Hard limit on output tokens'),
  apiKey: z.string().optional().describe('Override API key for this specific node'), // Can be overridden per node
});

export type LlmConfig = z.infer<typeof LlmConfigSchema>;

// --- GENERATION NODE TYPES ---

export interface LlmGenerationConfig extends LlmConfig {
  model?: string;
  temperature?: number;
  systemInstruction?: string;
}

export interface LlmGenerationInput {
  prompt: string;
}

export interface LlmGenerationOutput {
  result: string;
}

export const LlmGenerationConfigSchema = LlmConfigSchema.extend({
  model: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  systemInstruction: z.string().optional(),
});

/**
 * 📦 LlmResponse
 * Standardized output format for any LLM Generation node.
 */
export interface LlmResponse {
  content: string;
  usage?: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
  };
  model: string;
}

/**
 * 🚨 LlmError
 * Standardized error class for AI failures.
 */
export class LlmError extends Error {
  public code: string;
  public retryable: boolean;
  public providerError?: any;

  constructor(message: string, code: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_ERROR' | 'TIMEOUT', retryable: boolean, providerError?: any) {
    super(message);
    this.name = 'LlmError';
    this.code = code;
    this.retryable = retryable;
    this.providerError = providerError;
  }
}
