import { Pipeline, WorkflowState, Node } from '../def/workflow';
import { nodeRegistry } from './Registry';

/**
 * 🗓️ SCHEDULER
 * 
 * Responsibilities:
 * 1. Tracks dependencies (In-Degree).
 * 2. Manages the "Ready Queue" (Nodes that can run NOW).
 * 3. executing nodes in parallel (Promise.all-ish).
 * 4. Preventing UI Freezes (Tick-based loop).
 */
export class Scheduler {
  private pipeline: Pipeline;
  private state: WorkflowState;
  
  // Dynamic Dependency Tracker
  // NodeID -> Current In-Degree (Number of unmet prerequisites)
  private inDegree = new Map<string, number>();
  
  // Who is waiting for whom?
  // NodeID -> [Dependent Node IDs]
  private adjList = new Map<string, string[]>();

  // Execution State
  private runningNodes = new Set<string>();
  private completedNodes = new Set<string>();
  private failedNodes = new Set<string>();

  // Callback to notify Engine of updates
  private onStateChange: () => void;

  constructor(pipeline: Pipeline, state: WorkflowState, onStateChange: () => void) {
    this.pipeline = pipeline;
    this.state = state;
    this.onStateChange = onStateChange;
    this.initializeDependencies();
  }

  /**
   * 1. Build the Dependency Graph
   * Similar to TopoSort, but we keep this live to track progress.
   */
  private initializeDependencies() {
    // Init Maps
    this.pipeline.nodes.forEach(node => {
      this.inDegree.set(node.id, 0);
      this.adjList.set(node.id, []);
      
      // If we are resuming, check status
      const nodeState = this.state.nodeStates[node.id];
      if (nodeState?.status === 'COMPLETED') {
        this.completedNodes.add(node.id);
      }
    });

    // Populate Edges
    this.pipeline.edges.forEach(edge => {
      // Add dependency
      const current = this.adjList.get(edge.source) || [];
      current.push(edge.target);
      this.adjList.set(edge.source, current);

      // Increment In-Degree for target
      const count = this.inDegree.get(edge.target) || 0;
      this.inDegree.set(edge.target, count + 1);
    });

    // If resuming, we need to "Simulate" completion of already done nodes
    // to unlock their neighbors.
    this.completedNodes.forEach(nodeId => {
      this.unlockNeighbors(nodeId);
    });
  }

  private unlockNeighbors(nodeId: string) {
    const neighbors = this.adjList.get(nodeId) || [];
    neighbors.forEach(neighborId => {
      const current = this.inDegree.get(neighborId) || 0;
      // Decrement dependency count (clamp to 0)
      this.inDegree.set(neighborId, Math.max(0, current - 1));
    });
  }

  /**
   * 🚀 THE TICK LOOP
   * This is called repeatedly to make progress.
   */
  public async tick() {
    // 1. Check for Globl Stop
    if (this.state.status !== 'RUNNING') return;

    // 2. Find READY nodes
    // Rule: In-Degree === 0 AND Not Running AND Not Completed
    const readyNodes: Node[] = [];
    
    this.pipeline.nodes.forEach(node => {
      const degree = this.inDegree.get(node.id) || 0;
      const isRunning = this.runningNodes.has(node.id);
      const isDone = this.completedNodes.has(node.id);
      const isFailed = this.failedNodes.has(node.id); // Or check state directly

      if (degree === 0 && !isRunning && !isDone && !isFailed) {
        readyNodes.push(node);
      }
    });

    // 3. Start Execute (Parallel!)
    if (readyNodes.length > 0) {
      // console.debug(`[Scheduler] Starting ${readyNodes.length} nodes: ${readyNodes.map(n => n.id)}`);
      
      readyNodes.forEach(node => {
        this.executeNode(node);
      });
    }

    // 4. completion Check
    const totalNodes = this.pipeline.nodes.length;
    // Note: We might have failed nodes, need to decide policy.
    // simpler: If all nodes are (Completed OR Failed), we are done.
    const allFinished = this.pipeline.nodes.every(n => 
        this.completedNodes.has(n.id) || this.failedNodes.has(n.id)
    );

    if (allFinished) {
      if (this.failedNodes.size > 0) {
          this.state.status = 'FAILED';
      } else {
          this.state.status = 'COMPLETED';
      }
      this.onStateChange();
    }
  }

  /**
   * Execute a single Node (Async / Fire & Forget)
   */
  private async executeNode(node: Node) {
    // A. Mark Running
    this.runningNodes.add(node.id);
    this.updateNodeStatus(node.id, 'RUNNING');

    try {
      // B. Execute Strategy
      const strategy = nodeRegistry.getStrategy(node.type);
      const output = await strategy.execute(node, this.state.context, this.state.context);

      // C. Handle Success
      // Update Context
      if (output && typeof output === 'object') {
        Object.assign(this.state.context, output);
      }

      // Mark Complete
      this.completedNodes.add(node.id);
      this.runningNodes.delete(node.id);
      this.updateNodeStatus(node.id, 'COMPLETED', output);

      // Unlock Dependencies
      this.unlockNeighbors(node.id);

      // 🔄 Trigger next tick immediately
      this.onStateChange(); // Save state
      this.tick(); 

    } catch (error: any) {
      // D. Handle Failure
      console.error(`Node ${node.id} failed`, error);
      this.failedNodes.add(node.id);
      this.runningNodes.delete(node.id);
      this.updateNodeStatus(node.id, 'FAILED', undefined, error.message);
      
      // Stop workflow? or continue parallel branches?
      // For now, let's Fail Fast.
      this.state.status = 'FAILED'; 
      this.onStateChange();
    }
  }

  private updateNodeStatus(id: string, status: any, output?: any, error?: string) {
    const s = this.state.nodeStates[id] || {};
    s.status = status;
    if (output) s.output = output;
    if (error) s.error = error;
    
    if (status === 'RUNNING') s.startTime = Date.now();
    if (status === 'COMPLETED' || status === 'FAILED') s.endTime = Date.now();

    this.state.nodeStates[id] = s;
    this.onStateChange();
  }
}
