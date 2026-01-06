import { WorkflowEngine } from './src/core/engine/WorkflowEngine';
import { Pipeline } from './src/core/def/workflow';

// Parallel Pipeline:
//       /-> Node 2 (Wait 1s) -\
// Node 1                       -> Node 4 (End)
//       \-> Node 3 (Wait 1s) -/
const parallelPipeline: Pipeline = {
  id: 'parallel-test',
  name: 'Parallel Demo',
  nodes: [
    { id: '1', type: 'log', label: 'Start', data: { message: 'Split!' } },
    { id: '2', type: 'wait', label: 'Wait A', data: { durationMs: 1000 } },
    { id: '3', type: 'wait', label: 'Wait B', data: { durationMs: 1000 } },
    { id: '4', type: 'log', label: 'End', data: { message: 'Join!' } },
  ],
  edges: [
    { id: 'e1', source: '1', target: '2' },
    { id: 'e2', source: '1', target: '3' },
    { id: 'e3', source: '2', target: '4' },
    { id: 'e4', source: '3', target: '4' }
  ]
};

async function main() {
  console.log('--- TEST PARALLEL EXECUTION ---');
  const engine = new WorkflowEngine();
  
  engine.subscribe(s => {
    if (s.status === 'RUNNING') {
        const running = Object.entries(s.nodeStates).filter(([, st]) => st.status === 'RUNNING').map(([id]) => id);
        if (running.length > 1) {
            console.log(`⚡ PARALLEL DETECTED: Nodes [${running.join(', ')}] are running together.`);
        }
    }
  });

  engine.setPipeline(parallelPipeline);
  
  const startTime = Date.now();
  await engine.start();
  const duration = Date.now() - startTime;
  
  console.log(`\n⏱️ Total Duration: ${duration}ms`);
  
  if (duration < 1500) {
      console.log('✅ SUCCESS: Execution was parallel (took ~1s)');
  } else {
      console.error('❌ FAILURE: Execution was sequential (took ~2s)');
  }
}

main();
