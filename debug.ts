import { WorkflowEngine } from './src/core/engine/WorkflowEngine';
import { Pipeline } from './src/core/def/workflow';
import { LocalStoragePersistence } from './src/core/store/Persistence';

// MOCK LOCAL STORAGE for Node environment
const mockStorage: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => {},
  length: 0,
  key: () => null
};

// 1. Define a sample pipeline
const samplePipeline: Pipeline = {
  id: 'pipeline-persistence-test',
  name: 'Persistence Demo',
  nodes: [
    { id: '1', type: 'log', label: 'Start', data: { message: 'Step 1' } },
    { id: '2', type: 'wait', label: 'Wait', data: { durationMs: 500 } },
    { id: '3', type: 'log', label: 'End', data: { message: 'Step 2' } }
  ],
  edges: [
    { id: 'e1', source: '1', target: '2' },
    { id: 'e2', source: '2', target: '3' }
  ]
};

async function main() {
  console.log('--- TEST 1: INITIAL RUN ---');
  const persistence = new LocalStoragePersistence();
  const engine = new WorkflowEngine(persistence);
  
  engine.setPipeline(samplePipeline);
  
  // Start and let it run partially...
  engine.start();
  
  // Wait enough for it to reach step 2 but not finish
  await new Promise(r => setTimeout(r, 200)); 
  
  console.log('--- SIMULATING PAGE RELOAD ---');
  // At this point, Node 1 is done, Node 2 is waiting. State should be saved.
  // We throw away the 'engine' instance and make a new one.

  const engine2 = new WorkflowEngine(persistence);
  engine2.setPipeline(samplePipeline);
  
  engine2.subscribe(s => {
      console.log(`[RESUMED ENGINE] Status: ${s.status}`);
      Object.entries(s.nodeStates).forEach(([id, state]) => {
          if (state.status !== 'IDLE') console.log(`   Node ${id}: ${state.status}`);
      });
  });

  const savedState = await persistence.load(samplePipeline.id);
  if (savedState) {
      console.log('✅ Found saved state! Resuming...');
      await engine2.resume(savedState);
      
      // Wait for completion
      await new Promise(r => setTimeout(r, 1000));
  } else {
      console.error('❌ NO SAVED STATE FOUND!');
  }
}

main();
