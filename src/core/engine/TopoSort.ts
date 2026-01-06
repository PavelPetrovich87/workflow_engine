import { Node, Edge, Pipeline } from '../def/workflow';

/**
 * 🎓 PROFEESOR NOTES: TOPOLOGICAL SORTING
 * 
 * What is it?
 * Imagine you have a recipe. You can't put the cake in the oven before you mix the batter.
 * Topological Sort is simply "Ordering tasks so that every prerequisite comes BEFORE the task itself."
 * 
 * 🛑 The "Cycle" Problem:
 * If Task A requires Task B, and Task B requires Task A... you have a loop (Cycle).
 * You can never finish! Our sorter MUST detect this and throw an error.
 * 
 * 🧠 THE ALGORITHM: KAHN'S ALGORITHM
 * We will use a classic approach that mimics how you would solve this on paper.
 * 
 * Visual Step-by-Step:
 * 1. Calculate "In-Degree" for every node.
 *    (In-Degree = "How many arrows conduct pointing AT me?")
 *    
 *    [A] --> [B]
 *     ^       |
 *     |       v
 *    [D] <--- [C]
 * 
 *    In-Degrees: A=0, B=1 (from A), C=1 (from B), D=1 (from C)
 * 
 * 2. Find the "Starters" (Nodes with 0 In-Degree).
 *    In our case, only [A] has 0 prerequisites. It goes into a Queue.
 *    Queue: [A]
 * 
 * 3. Process the Queue:
 *    - Pop [A]. Add to our "Sorted List".
 *    - "Delete" A's outgoing arrows. 
 *      (We simulate this by decrementing the conversion of its neighbors).
 *      B's In-Degree was 1, now becomes 0.
 *      
 *    - Hey! B now has 0 prerequisites. Add B to Queue.
 *    Queue: [B]
 * 
 * 4. Repeat until Queue is empty.
 *    Sorted: [A, B, C, D]
 * 
 * 5. Cycle Check:
 *    If our Sorted List length < Total Nodes, it means some nodes were "stuck" in a loop
 *    and never reached 0 In-Degree. A cycle exists!
 */

export class TopologicalSorter {
  
  /**
   * Main entry point to sort a pipeline.
   * @param pipeline The pipeline definition containing nodes and edges
   * @returns An array of Node IDs in the correct execution order
   * @throws Error if a cycle is detected
   */
  public sort(pipeline: Pipeline): string[] {
    const { nodes, edges } = pipeline;
    
    // 1. Initialize In-Degree Map
    // Maps NodeID -> Number of incoming edges
    const inDegree = new Map<string, number>();
    
    // Initialize adjacency list (Who does this node point TO?)
    // Maps NodeID -> Array of neighbor NodeIDs
    const adjList = new Map<string, string[]>();

    // Initialize everyone with 0
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    });

    // 2. Build the Graph
    // Walk through edges to populate inDegree and adjList
    edges.forEach(edge => {
      // Source points TO Target
      const neighbors = adjList.get(edge.source) || [];
      neighbors.push(edge.target);
      adjList.set(edge.source, neighbors);

      // Target receives FROM Source (Increment In-Degree)
      const currentInDegree = inDegree.get(edge.target) || 0;
      inDegree.set(edge.target, currentInDegree + 1);
    });

    // 3. Find Initial "Starters" (Nodes with 0 dependencies)
    // acts as our "Queue"
    const queue: string[] = [];
    
    inDegree.forEach((count, nodeId) => {
      if (count === 0) {
        queue.push(nodeId);
      }
    });

    // 4. Process the Queue (Kahn's Algorithm)
    const sortedOrder: string[] = [];

    while (queue.length > 0) {
      // Take the first node from the queue
      const currentId = queue.shift()!; // ! is safe because length > 0
      
      // Add to our final result result
      sortedOrder.push(currentId);

      // "Visit" neighbors
      const neighbors = adjList.get(currentId) || [];
      neighbors.forEach(neighborId => {
        // "Remove" the edge from current -> neighbor
        // We simulate this by lowering neighbor's in-degree
        const newInDegree = (inDegree.get(neighborId) || 0) - 1;
        inDegree.set(neighborId, newInDegree);

        // If neighbor is now free of dependencies, add to queue!
        if (newInDegree === 0) {
          queue.push(neighborId);
        }
      });
    }

    // 5. Check for Cycles
    // If we couldn't resolve all nodes, there must be a cycle (deadlock)
    if (sortedOrder.length !== nodes.length) {
      this.detectAndThrowCycleError(nodes, sortedOrder);
    }

    return sortedOrder;
  }

  /**
   * Helper to throw a descriptive error when a cycle exists.
   * This is purely for better UX/Debugging.
   */
  private detectAndThrowCycleError(nodes: Node[], sortedNodes: string[]) {
    const processedSet = new Set(sortedNodes);
    
    // Which nodes were NOT processed?
    const stuckNodes = nodes
      .filter(n => !processedSet.has(n.id))
      .map(n => n.id);

    throw new Error(
      `Circular Dependency Detected! 🔄\n` +
      `The pipeline contains a cycle involving some of these nodes: [${stuckNodes.join(', ')}].\n` +
      `The engine cannot determine which one to run first.`
    );
  }
}
