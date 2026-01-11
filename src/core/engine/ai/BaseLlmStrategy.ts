import { Node, NodeExecutionStrategy } from '../Registry';
import { WorkflowState } from '../../def/workflow';
import { LlmConfig, LlmConfigSchema, LlmError } from '../../def/llm';

/**
 * 🧱 BaseLlmStrategy
 * Abstract base class for all LLM-powered nodes.
 * Handles common concerns:
 * 1. Configuration Validation
 * 2. API Key Waterfall retrieval
 * 3. Error Normalization
 */
export abstract class BaseLlmStrategy implements NodeExecutionStrategy {
  
  /**
   * The core execution method implemented by child classes.
   */
  abstract execute(node: Node, input: any, context: WorkflowState['context']): Promise<any>;

  /**
   * 🔑 getApiKey
   * Securely retrieves the API Key from available sources in order of precedence:
   * 1. Node Config (e.g. user pasted key directly in node settings)
   * 2. Runtime Context (e.g. passed from UI or Secrets Manager)
   * 3. System Environment (e.g. .env file or server variable)
   */
  protected getApiKey(node: Node, context: WorkflowState['context']): string {
    console.log('[BaseLlmStrategy] Full Context Dump:', JSON.stringify(context, null, 2));
    // 1. Node config override
    const configKey = node.config?.apiKey;
    if (typeof configKey === 'string' && configKey.length > 0) {
      return configKey;
    }

    // 2. Context env (Runtime injection from UI Global Config)
    // We check `context.items` for standard keys defined in `llm.ts`
    // We also support the legacy `context.env` for backward compatibility
    // 2. Context env (Runtime injection from UI Global Config)
    // We check `context.items` for standard keys defined in `llm.ts`
    // We also support the legacy `context.env` for backward compatibility

    // Check provider-specific keys first if provider is known from config
    const provider = node.config?.apiProvider;
    if (provider === 'openrouter') {
      if (context.items?.ENV_OPENROUTER_API_KEY) return String(context.items.ENV_OPENROUTER_API_KEY);
      // Fallback for dev/process env
      // @ts-ignore
      const viteEnvOr = typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_API_KEY;
      if (viteEnvOr) return viteEnvOr;
    }

    if (context.items?.ENV_GEMINI_API_KEY) {
      return String(context.items.ENV_GEMINI_API_KEY);
    }

    if (context.env?.GEMINI_API_KEY) {
      return context.env.GEMINI_API_KEY;
    }

    // 3. Process env (Build/Server time)
    // Note: On client-side Vite, we check import.meta.env
    // We use a safe check effectively.
    // @ts-ignore
    const viteEnv = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY;
    if (viteEnv) return viteEnv;

    if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }

    // 4. Mock Default for Dev (Opt-in)
    // If we have a special 'mock-key' set specifically in config or code, we might allow it,
    // but the strict check should throw if nothing valid is found.
    // For now, consistent with specs, we throw.

    throw new LlmError(
      'Missing API Key: GEMINI_API_KEY not found in Node Config, Global Settings (Context), or Environment Variables.',
      'AUTH_ERROR',
      false
    );
  }

  /**
   * ⚙️ getConfig
   * Parses and validates the node's configuration against the standard schema.
   */
  protected getConfig(node: Node, context?: WorkflowState['context']): LlmConfig {
    const rawConfig = node.config || {};

    // Apply Global Model Override if present and not overridden by node
    const globalModel = context?.items?.ENV_GEMINI_MODEL || context?.env?.GEMINI_MODEL;
    if (globalModel && !rawConfig.model) {
      rawConfig.model = globalModel;
    }

    // Merge with defaults from schema
    const result = LlmConfigSchema.safeParse(rawConfig);
    
    if (!result.success) {
      throw new Error(`Invalid LLM Configuration: ${result.error.message}`);
    }
    
    return result.data;
  }

  /**
   * 🛡️ handleLlmError
   * Normalizes vendor-specific errors into LlmError.
   */
  protected handleLlmError(error: any): LlmError {
    if (error instanceof LlmError) return error;

    // Simple heuristic for common errors
    const msg = error.message || String(error);
    
    if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('API key')) {
      return new LlmError(msg, 'AUTH_ERROR', false, error);
    }

    if (msg.includes('429') || msg.includes('Rate limit')) {
      return new LlmError(msg, 'RATE_LIMIT', true, error);
    }
    
    return new LlmError(msg, 'PROVIDER_ERROR', true, error);
  }

  /**
   * ⏳ simulateDelay
   * Helper for testing or rate-limiting.
   */
  protected async simulateDelay(ms: number = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
