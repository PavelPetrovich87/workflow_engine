import { Node, WorkflowState } from '../def/workflow';
import { MockLlmStrategy } from './ai/MockLlmStrategy';
import { LlmGenerationStrategy } from './ai/LlmGenerationStrategy';
import { LlmExtractStrategy } from './ai/LlmExtractStrategy';
import { PromptTemplateStrategy } from './ai/PromptTemplateStrategy';

/**
 * 🕵️‍♂️ PROFESSOR NOTES: THE STRATEGY PATTERN
 * 
 * Problem:
 * We have many different types of nodes: "HTTP Request", "Wait", "Run JS".
 * We don't want a giant `if/else` or `switch` statement in our Engine loop like:
 * if (node.type === 'http') { ... } else if (node.type === 'wait') { ... }
 * 
 * Solution:
 * We define a common interface `NodeExecutionStrategy`.
 * The Engine just says: "Hey Registry, give me the strategy for 'http'. Now, strategy.execute()!"
 * The Engine doesn't need to know HOW 'http' works. It just tells it to work.
 */

export interface NodeExecutionStrategy {
  execute(node: Node, input: any, context: WorkflowState['context']): Promise<any>;
}

// --- STRATEGY IMPLEMENTATIONS ---

/**
 * 1. Log Strategy
 * Simple debugging tool. Prints to console.
 */
class LogStrategy implements NodeExecutionStrategy {
  async execute(node: Node, input: any): Promise<any> {
    console.log(`[NODE ${node.id}]:`, input);
    // Don't return 'input' here if it's the full context, as it creates a circular def
    return { logged: true, timestamp: Date.now() }; 
  }
}

/**
 * 2. HTTP Strategy
 * Simulates a network request.
 * Config: { url: string, method: string }
 */
class HttpStrategy implements NodeExecutionStrategy {
  async execute(node: Node, _input: any): Promise<any> {
    const url = node.data?.url as string;
    const method = (node.data?.method as string) || 'GET';
    
    if (!url) throw new Error('HTTP Node requires a URL in data');

    // In a real app, use fetch(). simulating here for simplicity/no-deps
    console.log(`🌐 HTTP ${method} ${url}...`);
    
    // Simulate latency
    await new Promise(r => setTimeout(r, 500));
    
    return { status: 200, body: `Response from ${url}` };
  }
}

/**
 * 3. Wait Strategy
 * Non-blocking delay. Useful for polling or pacing.
 * Config: { durationMs: number }
 */
class WaitStrategy implements NodeExecutionStrategy {
  async execute(node: Node, _input: any): Promise<any> {
    const durationCount = Number(node.data?.durationMs) || 1000;
    
    console.log(`⏱️ Waiting for ${durationCount}ms...`);
    await new Promise(resolve => setTimeout(resolve, durationCount));
    
    return { waitedMs: durationCount };
  }
}

/**
 * 4. JavaScript Strategy (Simplified)
 * Executes a function body passed in data.
 * Config: { code: string }
 * ⚠️ SECURITY WARNING: In prod, use a sandbox like 'vm2' or 'quickjs-emscripten'.
 */
class JavaScriptStrategy implements NodeExecutionStrategy {
  async execute(node: Node, input: any, context: Record<string, any>): Promise<any> {
    const code = node.data?.code as string;
    if (!code) return null;

    // We accept 'input' and 'context' as available variables
    // eslint-disable-next-line no-new-func
    const func = new Function('input', 'context', `return (async () => { ${code} })()`);
    return await func(input, context);
  }
}

/**
 * 5. JSON Parse Strategy
 * Pure transformation.
 */
class JsonParseStrategy implements NodeExecutionStrategy {
  async execute(_node: Node, input: any): Promise<any> {
    if (typeof input === 'string') {
      return JSON.parse(input);
    }
    return input; // Pass through if already object
  }
}

// --- THE REGISTRY (SINGLETON) ---

class Registry {
  private strategies = new Map<string, NodeExecutionStrategy>();

  constructor() {
    // Register defaults
    this.register('log', new LogStrategy());
    this.register('http', new HttpStrategy());
    this.register('wait', new WaitStrategy());
    this.register('javascript', new JavaScriptStrategy());
    this.register('json-parse', new JsonParseStrategy());
    this.register('mock-llm', new MockLlmStrategy());
    this.register('llm-generation', new LlmGenerationStrategy());
    this.register('llm-extract', new LlmExtractStrategy());
    this.register('prompt-template', new PromptTemplateStrategy());
  }

  register(type: string, strategy: NodeExecutionStrategy) {
    this.strategies.set(type, strategy);
  }

  getStrategy(type: string): NodeExecutionStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`No strategy found for node type: '${type}'`);
    }
    return strategy;
  }
}

// Export a single instance
export const nodeRegistry = new Registry();

export type { Node, WorkflowState };


