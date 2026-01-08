import { Node, NodeExecutionStrategy, WorkflowState } from '../Registry';

/**
 * 📝 PromptTemplateStrategy
 * 
 * Substitutes variables into a template string using {{key}} syntax.
 * Input: { template: string, variables: Record<string, any> }
 * Output: { prompt: string }
 */
export class PromptTemplateStrategy implements NodeExecutionStrategy {
  async execute(node: Node, input: any, _context: WorkflowState['context']): Promise<{ prompt: string }> {
    // 1. Resolve template: Input overrides Node Data
    const template = (input?.template as string) || (node.data?.template as string) || '';
    
    // 2. Resolve variables: Safe assignment
    const variables = (input?.variables as Record<string, any>) || {};

    // 3. Regex Substitution
    // Matches {{ key }} with optional whitespace
    const result = template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, key) => {
      // If variable exists (including null/empty string), use it.
      // Otherwise, keep the original placeholder (match).
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        return String(variables[key]);
      }
      return match;
    });

    return { prompt: result };
  }
}
