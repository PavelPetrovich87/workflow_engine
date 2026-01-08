
import { WorkflowEngine } from './core/engine/WorkflowEngine';
import { Pipeline } from './core/def/workflow';

async function runDemo() {
  console.log('🚀 Starting Demo Pipeline...');

  // 1. Define Pipeline
  const demoPipeline: Pipeline = {
    id: 'demo-pipeline-001',
    name: 'Demo Pipeline',
    description: 'A test pipeline to verify engine functionality',
    version: '1.0.0',
    nodes: [
      {
        id: 'start',
        type: 'log',
        label: 'Start Node',
        data: { message: 'Workflow Started!' }
      },
      {
        id: 'fetch-data',
        type: 'http',
        label: 'Fetch User Data',
        data: { 
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          method: 'GET'
        }
      },
      {
        id: 'process-data',
        type: 'javascript',
        label: 'Process Data',
        data: {
          // Input from http node will be logged here
          code: `
            console.log("Processing input:", JSON.stringify(input));
            // Simulated HTTP returns a plain string, so we just use it directly
            return { result: input.body.toUpperCase() }; 
          `
        }
      },
      {
        id: 'wait-step',
        type: 'wait',
        label: 'Simulate Delay',
        data: { durationMs: 1500 }
      },
      {
        id: 'end',
        type: 'log',
        label: 'End Node',
        data: { message: 'Workflow Completed!' }
      }
    ],
    edges: [
      // start -> fetch-data
      { id: 'e1', source: 'start', target: 'fetch-data' },
      
      // fetch-data -> process-data
      { id: 'e2', source: 'fetch-data', target: 'process-data' },
      
      // process-data -> wait-step
      { id: 'e3', source: 'process-data', target: 'wait-step' },
      
      // wait-step -> end
      { id: 'e4', source: 'wait-step', target: 'end' }
    ]
  };

  // 2. Initialize Engine
  const engine = new WorkflowEngine();
  engine.setPipeline(demoPipeline);

  // 3. Subscribe to changes
  engine.subscribe((state) => {
    console.log(`\n📋 State Update [${state.status}]`);
    console.table(
      Object.entries(state.nodeStates).map(([id, s]) => ({
        id,
        status: s.status,
        output: s.output ? JSON.stringify(s.output).slice(0, 50) + '...' : '-'
      }))
    );
  });

  // 4. Start
  try {
    await engine.start({});
    console.log('✅ Start called successfully');
  } catch (error) {
    console.error('❌ Failed to start:', error);
  }
}

runDemo().catch(console.error);
