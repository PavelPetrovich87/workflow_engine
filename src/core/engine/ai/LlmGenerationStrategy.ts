import { Node } from '../../def/workflow';
import { BaseLlmStrategy } from './BaseLlmStrategy';
import { WorkflowState } from '../../def/workflow';
import { LlmGenerationConfig, LlmGenerationConfigSchema, LlmGenerationOutput } from '../../def/llm';

/**
 * 🧠 LlmGenerationStrategy
 * Implementation of the 'llm-generation' node.
 * Handles text generation using configured LLM models.
 */
export class LlmGenerationStrategy extends BaseLlmStrategy {
    
    async execute(node: Node, input: any, context: WorkflowState['context']): Promise<LlmGenerationOutput> {
        const config = this.getGenerationConfig(node);
        const apiKey = this.getApiKey(node, context);
        
        // Input validation
        const prompt = input?.prompt;
        if (!prompt || typeof prompt !== 'string') {
             throw new Error('Input must contain a "prompt" string');
        }

        console.log(`🧠 LLM Generating... Model=${config.model}, Temp=${config.temperature}`);

        // Mock mode check (for testing/demo without keys)
        if (apiKey === 'mock-key' || !apiKey) {
             console.warn('⚠️ No real API key, using Mock Response.');
             return { result: `[MOCK SCIFI] ${prompt} leads to a cyberpunk future.` };
        }

        try {
            // Call Gemini API (using REST for simplicity/no-deps)
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: config.temperature
                    }
                })
            });

            if (!response.ok) {
                const errBody = await response.text();
                throw new Error(`Gemini API Error ${response.status}: ${errBody}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) throw new Error('Malformed response from Gemini API');

            return { result: text };

        } catch (error) {
             throw this.handleLlmError(error);
        }
    }

    private getGenerationConfig(node: Node): LlmGenerationConfig {
        const baseConfig = this.getConfig(node);
        // Additional validation specific to generation if needed, though Schema handles most
        const result = LlmGenerationConfigSchema.safeParse(baseConfig);
        if (!result.success) {
            throw new Error(`Invalid Generation Config: ${result.error.message}`);
        }
        return result.data;
    }
}
