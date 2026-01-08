import { useState, useEffect, useRef } from 'react';
import { WorkflowEngine } from '../engine/WorkflowEngine';
import { Pipeline, WorkflowState } from '../def/workflow';
import { LocalStoragePersistence } from './Persistence';

/**
 * 🎣 useWorkflow Hook
 * 
 * This is the bridge between React and our "Headless" Engine.
 * 
 * It handles:
 * 1. Instantiating the Engine (Singleton-ish per component)
 * 2. Wiring up Persistence
 * 3. Subscribing to State Changes (to trigger re-renders)
 */
export function useWorkflow(pipeline: Pipeline) {
  // 1. Ref to hold the engine instance (stable across renders)
  const engineRef = useRef<WorkflowEngine | null>(null);
  
  // 2. State to force re-renders when engine emits changes
  const [state, setState] = useState<WorkflowState | null>(null);

  // 3. Initialize Engine ONLY ONCE
  if (!engineRef.current) {
    const persistence = new LocalStoragePersistence();
    engineRef.current = new WorkflowEngine(persistence);
    engineRef.current.setPipeline(pipeline);
  }

  const engine = engineRef.current;

  // 4. Subscribe to changes
  useEffect(() => {
    // Unsubscribe function returned by engine
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
    });
    
    // Check if we have saved state to resume
    const loadSavedState = async () => {
        const persistence = new LocalStoragePersistence();
        const saved = await persistence.load(pipeline.id);
        if (saved && saved.pipelineId === pipeline.id) {
            console.log('[useWorkflow] Resuming saved state:', saved);
            await engine.resume(saved);
        }
    };
    
    loadSavedState();

    return () => {
      unsubscribe();
    };
  }, [engine, pipeline.id]);

  // 5. Expose Actions
  const start = async (input: any) => {
    await engine.start(input);
  };

  return {
    state,
    start,
    reset: () => engine.reset(),
    engine 
  };
}
