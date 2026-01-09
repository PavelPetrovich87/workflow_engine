import { Node } from '../../def/workflow';
import { BaseLlmStrategy } from './BaseLlmStrategy';
import { WorkflowState } from '../../def/workflow';
import { LlmGenerationConfig, LlmGenerationConfigSchema, LlmGenerationOutput } from '../../def/llm';
import { GoogleGenAI } from '@google/genai';

/**
 * 🧠 LlmGenerationStrategy
 * Implementation of the 'llm-generation' node.
 * Handles text generation using configured LLM models.
 */
export class LlmGenerationStrategy extends BaseLlmStrategy {
    
    async execute(node: Node, input: any, context: WorkflowState['context']): Promise<LlmGenerationOutput> {
        const config = this.getGenerationConfig(node, context);
        const apiKey = this.getApiKey(node, context);
        console.log('apiKey', apiKey);

        // Input validation
        const prompt = input?.prompt;
        if (!prompt || typeof prompt !== 'string') {
             throw new Error('Input must contain a "prompt" string');
        }

        console.log(`🧠 LLM Generating... Model=${config.model}, Temp=${config.temperature}`);

        // Mock mode check (for testing/demo without keys)
        if (apiKey === 'mock-key' || !apiKey) {
             console.warn('⚠️ No real API key, using Mock Response.');
            return { result: `[MOCK AI GENERATION] Based on your prompt "${prompt.slice(0, 30)}...", here is a simulated response about the future of AI and workflow automation.` };
        }

        try {
            const ai = new GoogleGenAI({ apiKey });

            const response = await ai.models.generateContent({
                model: config.model,
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    temperature: config.temperature
                }
            });

            const text = response.text();
            
            if (!text) throw new Error('Empty response from Gemini');

            return { result: text };

        } catch (error) {
             throw this.handleLlmError(error);
        }
    }

    private getGenerationConfig(node: Node, context?: WorkflowState['context']): LlmGenerationConfig {
        const baseConfig = this.getConfig(node, context);
        // Additional validation specific to generation if needed, though Schema handles most
        const result = LlmGenerationConfigSchema.safeParse(baseConfig);
        if (!result.success) {
            throw new Error(`Invalid Generation Config: ${result.error.message}`);
        }
        return result.data;
    }
}
