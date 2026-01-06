import { WorkflowState } from '../def/workflow';

/**
 * 💾 PERSISTENCE ADAPTER
 * 
 * The Engine shouldn't care *where* data is saved (LocalStorage, UnIndexedDB, Cloud).
 * It just needs a contract to save/load.
 * 
 * Pattern: Adapter Pattern
 */
export interface PersistenceAdapter {
  save(state: WorkflowState): Promise<void>;
  load(pipelineId: string): Promise<WorkflowState | null>;
  clear(pipelineId: string): Promise<void>;
}

/**
 * 🏠 LocalStorage Implementation
 * Simple, browser-native persistence.
 */
export class LocalStoragePersistence implements PersistenceAdapter {
  private prefix = 'wf_state_';

  async save(state: WorkflowState): Promise<void> {
    const key = this.getKey(state.pipelineId);
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(key, serialized);
      // console.debug(`[Persistence] Saved state for ${state.pipelineId}`);
    } catch (err) {
      console.error('[Persistence] Failed to save state', err);
    }
  }

  async load(pipelineId: string): Promise<WorkflowState | null> {
    const key = this.getKey(pipelineId);
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) return null;
      
      return JSON.parse(serialized) as WorkflowState;
    } catch (err) {
      console.error('[Persistence] Failed to load state', err);
      return null;
    }
  }

  async clear(pipelineId: string): Promise<void> {
     const key = this.getKey(pipelineId);
     localStorage.removeItem(key);
  }

  private getKey(id: string) {
    return `${this.prefix}${id}`;
  }
}
