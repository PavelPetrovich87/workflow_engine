/**
 * 🌊 WORKFLOW ENGINE | CORE DEFINITIONS
 * 
 * This file defines the "Grammar" of our workflow engine. 
 * We use Directed Acyclic Graphs (DAGs) to model and execute tasks.
 * 
 * 🏗️ SYSTEM ARCHITECTURE:
 * 1. DEFINITIONS (This File): The Zod-based blueprints for data.
 * 2. ENGINE: The logic that walks the graph and executes nodes.
 * 3. STORE: The persistence layer that saves state for "resume" capability.
 */

import { z } from 'zod';

/**
 * 💎 DataValue
 * The primitive building blocks of workflow data.
 * Think of this as a JSON-compatible primitive.
 */
export const DataValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.any()),
  z.record(z.any()),
]);

export type DataValue = z.infer<typeof DataValueSchema>;

/**
 * 📦 NodeSchema
 * A individual unit of work.
 * 
 * Visual Representation:
 * [ Node: label ]
 * ( data ) -> ( output )
 */
export const NodeSchema = z.object({
  id: z.string().describe('Unique identifier for the node'),
  type: z.string().describe('The strategy to use (e.g., HTTP, JS, AGENT)'),
  label: z.string().describe('Human readable name'),
  data: z.record(DataValueSchema).optional().describe('Input constants for the node'),
  config: z.record(z.any()).optional().describe('Operational settings (e.g., retries, timeout)'),
});

export type Node = z.infer<typeof NodeSchema>;

/**
 * 🔗 EdgeSchema
 * Defines the flow and dependency between two nodes.
 * 
 * Visual Representation:
 * ( Source Node ) --- [ Condition ] ---> ( Target Node )
 */
export const EdgeSchema = z.object({
  id: z.string().describe('Unique identifier for the edge'),
  source: z.string().describe('ID of the starting node'),
  target: z.string().describe('ID of the destination node'),
  label: z.string().optional().describe('Human readable description of the transition'),
  condition: z.string().optional().describe('Simple JS expression evaluated to decide if flow proceeds'),
});

export type Edge = z.infer<typeof EdgeSchema>;

/**
 * 🗺️ PipelineSchema
 * The Map of our workflow. A collection of nodes and connections.
 * 
 * Visual Representation (DAG):
 *    A ----> B ----> D
 *      \--> C --/
 */
export const PipelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  nodes: z.array(NodeSchema).describe('The "Vertices" of our graph'),
  edges: z.array(EdgeSchema).describe('The "Directed Edges" of our graph'),
  version: z.string().default('1.0.0'),
});

export type Pipeline = z.infer<typeof PipelineSchema>;

/**
 * 🚥 NodeStatus
 * The lifecycle of a single node execution.
 * 
 * Flow: IDLE -> PENDING -> RUNNING -> COMPLETED | FAILED
 */
export const NodeStatusSchema = z.enum([
  'IDLE',       // Not yet reached
  'PENDING',    // Dependencies met, waiting for scheduler
  'RUNNING',    // Execution in progress
  'COMPLETED',  // Finished successfully
  'FAILED',     // Error during execution
  'SKIPPED',    // Condition evaluated to false
  'WAITING',    // Paused for human/external input
]);

export type NodeStatus = z.infer<typeof NodeStatusSchema>;

/**
 * 🧠 WorkflowState
 * The "Save Game" state of a running execution. 
 * Allows for "Resume after reload" capability.
 */
export const WorkflowStateSchema = z.object({
  executionId: z.string().describe('Unique ID for this specific run instance'),
  pipelineId: z.string().describe('Reference to the pipeline being executed'),
  status: z.enum(['IDLE', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED']),
  nodeStates: z.record(z.object({
    status: NodeStatusSchema,
    startTime: z.number().optional(),
    endTime: z.number().optional(),
    error: z.string().optional(),
    output: DataValueSchema.optional().describe('The result data produced by the node'),
  })).describe('Tracks the state of every individual node'),
  context: z.record(DataValueSchema).describe('Shared global memory for the workflow (Variables)'),
});

export type WorkflowState = z.infer<typeof WorkflowStateSchema>;
