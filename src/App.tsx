import { useWorkflow } from './core/store/useWorkflow';
import { WorkflowCanvas } from './ui/WorkflowCanvas';
import { Pipeline } from './core/def/workflow';
import { useLlmConfig } from './hooks/useLlmConfig';
import { LlmConfigModal } from './ui/LlmConfigModal';
import { useState } from 'react';
import { Cpu, Settings } from 'lucide-react';
import { ENV_GEMINI_API_KEY, ENV_GEMINI_MODEL } from './core/def/llm';

// Sample Pipeline for Demo: AI Workflow Chain
const demoPipeline: Pipeline = {
  id: 'ai-demo-pipeline',
  name: 'AI Agent Workflow',
  nodes: [
    {
      id: '1',
      type: 'javascript',
      label: 'Setup Topic',
      data: { code: 'return { topic: "Sustainable Energy Solutions", variables: { topic: "Sustainable Energy Solutions" } }' }
    },
    {
      id: '2',
      type: 'prompt-template',
      label: 'Draft Prompt',
      data: { template: 'Write a technical summary about {{topic}} for a senior engineer.' }
    },
    {
      id: '3',
      type: 'llm-generation',
      label: 'Generate Text',
      config: { temperature: 0.7 }
    },
    {
      id: '4',
      type: 'llm-extract',
      label: 'Extract Metadata',
      config: {
        schema: {
          type: 'object',
          properties: {
            keywords: { type: 'array', items: { type: 'string' } },
            sentiment: { type: 'string' },
            relevance_score: { type: 'number' }
          },
          required: ['keywords', 'sentiment']
        }
      }
    },
    { id: '5', type: 'log', label: 'Finish', data: { message: 'AI Analysis Complete' } },
  ],
  edges: [
    { id: 'e1', source: '1', target: '2' },
    { id: 'e2', source: '2', target: '3' },
    { id: 'e3', source: '3', target: '4' },
    { id: 'e4', source: '4', target: '5' },
  ]
};

function App() {
  const { state, start, reset } = useWorkflow(demoPipeline);
  const { config } = useLlmConfig();
  const [isLlmModalOpen, setIsLlmModalOpen] = useState(false);

  const handleStart = () => {
    console.log('[App] Starting Workflow with Global Config:', config);
    start({
      items: {
        [ENV_GEMINI_API_KEY]: config.apiKey,
        [ENV_GEMINI_MODEL]: config.model
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <LlmConfigModal isOpen={isLlmModalOpen} onClose={() => setIsLlmModalOpen(false)} />

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
            onClick={() => setIsLlmModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700 flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            AI Config
          </button>

          <button
            onClick={handleStart}
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
