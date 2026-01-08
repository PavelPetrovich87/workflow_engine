import { PersistenceAdapter } from '../store/Persistence';
import { Pipeline, WorkflowState } from '../def/workflow';
import { Scheduler } from './Scheduler';

/**
 * 🚂 THE WORKFLOW ENGINE
 * 
 * This is the conductor of our orchestra.
 * It manages:
 * 1. State (Running, Paused, Completed)
 * 2. Execution Delegation (via Scheduler)
 * 3. Persistence
 */
export class WorkflowEngine {
  private pipeline: Pipeline | null = null;
  private state: WorkflowState | null = null;
  private scheduler: Scheduler | null = null;
  private persistence: PersistenceAdapter | null = null;

  /**
   * Output listeners for UI updates.
   * Simple Observer pattern.
   */
  private listeners: ((state: WorkflowState) => void)[] = [];

  constructor(persistence?: PersistenceAdapter) {
    if (persistence) {
      this.persistence = persistence;
    }
  }

  public subscribe(listener: (state: WorkflowState) => void) {
    this.listeners.push(listener);
    // Emit current state immediately if available
    if (this.state) {
      listener(this.state);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitChange() {
    if (this.state) {
      // 1. Notify UI
      this.listeners.forEach(l => l(this.state!));
      
      // 2. Persist State (Fire & Forget)
      if (this.persistence) {
        this.persistence.save(this.state).catch(err => 
          console.warn('[Engine] Auto-save failed', err)
        );
      }
    }
  }

  /**
   * Load a pipeline definition into the engine.
   */
  public setPipeline(pipeline: Pipeline) {
    this.pipeline = pipeline;
  }

  /**
   * Start a new execution.
   */
  public async start(initialContext: Record<string, any> = {}) {
    if (!this.pipeline) throw new Error('No pipeline loaded');

    // 1. Initialize State
    this.state = {
      executionId: crypto.randomUUID(), // Native browser UUID
      pipelineId: this.pipeline.id,
      status: 'RUNNING',
      context: initialContext,
      nodeStates: {},
    };

    // Initialize all nodes to IDLE
    this.pipeline.nodes.forEach(node => {
      this.state!.nodeStates[node.id] = { status: 'IDLE' };
    });

    this.emitChange();

    // 2. Initialize Scheduler
    this.scheduler = new Scheduler(
      this.pipeline, 
      this.state, 
      () => this.emitChange()
    );

    // 3. Kick off the Tick Loop
    try {
      await this.scheduler.tick();
    } catch (error: any) {
      console.error('Workflow Failed:', error);
      if (this.state) {
        this.state.status = 'FAILED';
        this.emitChange();
      }
    }
  }

  /**
   * Resume from a saved state.
   */
  public async resume(savedState: WorkflowState) {
      if (!this.pipeline) throw new Error('No pipeline loaded');
      if (savedState.pipelineId !== this.pipeline.id) {
          throw new Error('State pipeline ID mismatch');
      }

      this.state = savedState;
      this.emitChange();

      // If it was running, we need to re-attach scheduler
      if (this.state.status === 'RUNNING') {
          this.scheduler = new Scheduler(
             this.pipeline,
             this.state,
             () => this.emitChange()
          );
          
          try {
              // Wait a bit to ensure UI handles resume before ticking? 
              // Or just go.
              await this.scheduler.tick();
          } catch (err) {
               console.error('Resume Failed:', err);
          }
      }
  }


  /**
   * Reset the engine state to initial values.
   */
  public async reset() {
    if (!this.pipeline) return;

    // 1. Stop current execution if running
    // The Scheduler holds a reference to the OLD state object.
    // By mutating it here, we signal the loop to stop.
    if (this.state && this.state.status === 'RUNNING') {
      this.state.status = 'IDLE';
    }

    // 2. Create Fresh State
    this.state = {
      executionId: crypto.randomUUID(),
      pipelineId: this.pipeline.id,
      status: 'IDLE',
      context: {},
      nodeStates: {},
    };

    // Initialize all nodes to IDLE
    this.pipeline.nodes.forEach(node => {
      this.state!.nodeStates[node.id] = { status: 'IDLE' };
    });

    this.emitChange();

    // Clear persistence
    if (this.persistence) {
      // We might want to clear the saved state entirely
      // For now, saving the IDLE state effectively resets it on reload too
      await this.persistence.save(this.state);
    }
  }
}
