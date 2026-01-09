import { useWorkflow } from './core/store/useWorkflow';
import { WorkflowCanvas } from './ui/WorkflowCanvas';
import { Pipeline } from './core/def/workflow';

// Sample Pipeline for Demo
const demoPipeline: Pipeline = {
  id: 'demo-ui-pipeline',
  name: 'UI Demo Workflow',
  nodes: [
    { id: '1', type: 'log', label: 'Trigger', data: { message: 'Workflow Started' } },
    { id: '2', type: 'wait', label: 'Wait 2s', data: { durationMs: 2000 } },
    { id: '3', type: 'javascript', label: 'Calc Random', data: { code: 'return { rand: Math.random() }' } },
    { id: '4', type: 'wait', label: 'Wait 1s', data: { durationMs: 1000 } },
    { id: '5', type: 'log', label: 'Finish', data: { message: 'Done!' } },
  ],
  edges: [
    { id: 'e1', source: '1', target: '2' },
    { id: 'e2', source: '1', target: '3' },
    { id: 'e3', source: '2', target: '4' },
    { id: 'e4', source: '3', target: '4' },
    { id: 'e5', source: '4', target: '5' },
  ]
};

function App() {
  const { state, start, reset } = useWorkflow(demoPipeline);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Workflow Engine
          </h1>
          <p className="text-slate-400 mt-1">
            Status: <span className={`font-mono font-bold ${state?.status === 'RUNNING' ? 'text-blue-400' :
              state?.status === 'COMPLETED' ? 'text-emerald-400' :
                state?.status === 'FAILED' ? 'text-red-400' : 'text-slate-500'
              }`}>{state?.status || 'OFFLINE'}</span>
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => start()}
            disabled={state?.status === 'RUNNING'}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors shadow-lg shadow-blue-500/20"
          >
            {state?.status === 'RUNNING' ? 'Running...' : 'Start Workflow'}
          </button>

          <button
            onClick={reset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700"
          >
            Reset State
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <WorkflowCanvas pipeline={demoPipeline} state={state} />
      </main>
    </div>
  );
}

export default App;
