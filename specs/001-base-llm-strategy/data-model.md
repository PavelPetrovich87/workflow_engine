# Data Model: Base LLM Strategy

## Schemas (Zod)

Defined in `src/core/def/llm.ts`:

```typescript
import { z } from 'zod';

export const LlmConfigSchema = z.object({
  model: z.string().default('gemini-flash'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().optional(),
  apiKey: z.string().optional(), // Can be overridden per node
});

export type LlmConfig = z.infer<typeof LlmConfigSchema>;

export interface LlmResponse {
  content: string;
  usage?: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
  };
  model: string;
}
```

## Class Interface

Defined in `src/core/engine/ai/BaseLlmStrategy.ts`:

```typescript
import { NodeExecutionStrategy, Node } from '../Registry';
import { WorkflowState } from '../../def/workflow';
import { LlmConfig, LlmResponse } from '../../def/llm';

export abstract class BaseLlmStrategy implements NodeExecutionStrategy {
  
  abstract execute(node: Node, input: any, context: WorkflowState['context']): Promise<any>;

  protected getApiKey(node: Node, context: WorkflowState['context']): string {
    // 1. Node config override
    if (node.config?.apiKey) return node.config.apiKey;
    // 2. Context env
    if (context.env?.GEMINI_API_KEY) return context.env.GEMINI_API_KEY;
    // 3. Process env
    const envKey = import.meta.env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (envKey) return envKey;

    throw new Error("Missing GEMINI_API_KEY");
  }

  protected getParam(node: Node, key: string, defaultVal: any): any {
    // Helper to extract config with defaults
  }
  
  protected async simulateDelay() {
      // Helper for dev
  }
}
```
