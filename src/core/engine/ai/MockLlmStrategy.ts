import { BaseLlmStrategy } from './BaseLlmStrategy';
import { Node } from '../Registry';
import { WorkflowState } from '../../def/workflow';

/**
 * 🃏 MockLlmStrategy
 * A strategy that extends BaseLlmStrategy to test the plumbing.
 * It simulates an API call and returns a reversal of the input prompt.
 */
export class MockLlmStrategy extends BaseLlmStrategy {
  
  async execute(node: Node, input: any, context: WorkflowState['context']): Promise<any> {
    try {
      // 1. Verify we can get the key (will throw if missing)
      const apiKey = this.getApiKey(node, context);
      
      // 2. Get Config
      const config = this.getConfig(node);
      
      // 3. Simulate network work
      await this.simulateDelay(500);

      // 4. Simulate usage logic based on "prompt" input
      const prompt = input.prompt || 'Hello World';

      if (prompt === 'FORCE_ERROR') {
         throw new Error('Simulated Provider Error 500');
      }

      return {
        content: `MOCK RESPONSE: ${prompt.split('').reverse().join('')}`,
        model: config.model,
        usage: {
          totalTokens: prompt.length,
          promptTokens: prompt.length,
          completionTokens: prompt.length,
        },
        _debugKeyUsed: apiKey.substring(0, 4) + '...' // Return partial key to verify source
      };

    } catch (err) {
      // 5. Use standard error handler
      throw this.handleLlmError(err);
    }
  }
}
