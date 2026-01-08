import { Node } from '../src/core/def/workflow';
import { PromptTemplateStrategy } from '../src/core/engine/ai/PromptTemplateStrategy';

interface TestCase {
  name: string;
  template: string;
  variables: Record<string, any>;
  expectedSnippet: string;
}

async function run() {
  console.log('🧪 Verifying Prompt Template Node...');
  
  // Placeholder until strategy is implemented
  const strategy = new PromptTemplateStrategy();
  const mockNode: Node = { id: 'test-node', type: 'prompt-template', data: {} };

  const tests: TestCase[] = [
    // US1
    {
       name: 'Basic Substitution',
       template: 'Hello {{name}}',
       variables: { name: 'World' },
       expectedSnippet: 'Hello World'
    },
    {
       name: 'Missing Variable',
       template: 'Hello {{missing}}',
       variables: {},
       expectedSnippet: 'Hello {{missing}}'
    },
    {
       name: 'Whitespace Handling',
       template: 'Val: {{  spaced  }}',
       variables: { spaced: 'Trimmed' },
       expectedSnippet: 'Val: Trimmed'
    }
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      // Logic assumes strategy handles input.template override
      const result = await strategy.execute(mockNode, { template: t.template, variables: t.variables }, {});
      const actual = result.prompt;
      
      if (actual.includes(t.expectedSnippet)) {
        console.log(`✅ ${t.name} passed`);
        passed++;
      } else {
        console.error(`❌ ${t.name} failed. Expected '${t.expectedSnippet}', got '${actual}'`);
      }
    } catch (e) {
      console.error(`❌ ${t.name} crashed`, e);
    }
  }

  console.log(`\nResult: ${passed}/${tests.length} passed.`);
}

run().catch(console.error);
