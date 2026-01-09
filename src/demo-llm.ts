
import { WorkflowEngine } from './core/engine/WorkflowEngine';
import { Pipeline } from './core/def/workflow';
import { ENV_GEMINI_API_KEY, ENV_GEMINI_MODEL } from './core/def/llm';

async function runLlmDemo() {
  console.log('🧠 Starting LLM Generation Node Demo...');

  // Pipeline with LLM Node
  const llmPipeline: Pipeline = {
    id: 'llm-demo-001',
    name: 'LLM Demo Workflow',
    description: 'Test the llm-generation node',
    version: '1.0.0',
    nodes: [
      {
        id: 'injector',
        type: 'javascript',
        label: 'Inject Topic',
        data: {
          code: `return { topic: 'The Rust programming language' };`
        }
      },

      {
          id: 'mapper',
          type: 'javascript',
          label: 'Map Topic to Prompt',
          data: {
              code: `return { prompt: 'Write a sci-fi haiku about ' + (context.topic || 'nothing') };`
          }
      },
      {
        id: 'poet',
        type: 'llm-generation',
        label: 'Write Haiku',
        config: {
          apiKey: 'mock-key',
            model: 'gemini-flash',
            temperature: 0.9
        }
      },
      {
        id: 'extractor',
        type: 'llm-extract',
        label: 'Extract Keywords',
        config: {
          apiKey: 'mock-key',
          schema: {
            type: 'object',
            properties: {
              keywords: { type: 'array', items: { type: 'string' } },
              is_poetic: { type: 'boolean' }
            },
            required: ['keywords']
          }
        }
      },
      {
        id: 'end',
        type: 'log',
        label: 'Result',
        data: { message: 'Finished!' }
      }
    ],
    edges: [
      { id: 'e1', source: 'injector', target: 'mapper' },
      { id: 'e2', source: 'mapper', target: 'poet' },
      { id: 'e3', source: 'poet', target: 'extractor' },
      { id: 'e4', source: 'extractor', target: 'end' }
    ]
  };

  const engine = new WorkflowEngine();
  engine.setPipeline(llmPipeline);




  // 4. Start and Wait
  try {
    const completionPromise = new Promise<void>((resolve, reject) => {
        const checkState = (state: any) => {
            if (state.status === 'COMPLETED') resolve();
            if (state.status === 'FAILED') reject(new Error('Workflow Failed'));
        };
        
        // Subscribe for updates (emits initial state immediately)
        const unsub = engine.subscribe((state) => {
             console.log(`\n📋 State [${state.status}]`);
             Object.entries(state.nodeStates).forEach(([id, s]) => {
                if (s.status === 'COMPLETED') {
                    console.log(`Node ${id} Output:`, JSON.stringify(s.output));
                } else if (s.status === 'FAILED') {
                    console.error(`Node ${id} Error:`, s.error);
                }
             });
             checkState(state);
        });
    });

    await engine.start({});
    console.log('✅ Workflow started, waiting for completion...');
    await completionPromise;
    console.log('✅ Workflow Finished Successfully');
  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

runLlmDemo().catch(console.error);
