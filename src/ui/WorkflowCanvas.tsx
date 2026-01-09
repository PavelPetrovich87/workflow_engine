import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    useNodesState, 
    useEdgesState,
    Edge,
    Node,
    ConnectionLineType
} from 'reactflow';
import * as dagre from 'dagre';
import 'reactflow/dist/style.css';
import { Pipeline, WorkflowState } from '../core/def/workflow';
import { StatusNode } from './StatusNode';
import { NodeModal } from './NodeModal';

// Define custom node types
const nodeTypes = {
  custom: StatusNode,
};

type WorkflowCanvasProps = {
  pipeline: Pipeline;
  state: WorkflowState | null;
};

/**
 * 🕸️ WORKFLOW CANVAS
 * 
 * Maps our "Headless" Engine state to "Visual" React Flow state.
 */
export function WorkflowCanvas({ pipeline, state }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // 1. Auto Layout Helper (Dagre)
  const getLayoutedElements = useCallback((pipelineNodes: any[], pipelineEdges: any[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Set Direction (Top to Bottom)
    dagreGraph.setGraph({ rankdir: 'TB' });

    pipelineNodes.forEach((node) => {
      // We assume a fixed width/height for layout calculation
      dagreGraph.setNode(node.id, { width: 200, height: 80 });
    });

    pipelineEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return {
      nodes: pipelineNodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - 100, // Center anchor
            y: nodeWithPosition.y - 40,
          },
        };
      }),
      edges: pipelineEdges,
    };
  }, []);


  // 2. Sync Pipeline -> React Flow Nodes (Initial Load)
  useEffect(() => {
    if (!pipeline) return;

    const initialNodes: Node[] = pipeline.nodes.map(n => ({
        id: n.id,
        type: 'custom', // Use our StatusNode
        position: { x: 0, y: 0 }, // Will be set by dagre
        data: { 
            label: n.label, 
            type: n.type,
            status: 'IDLE' // Initial state
        }
    }));

    const initialEdges: Edge[] = pipeline.edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        type: ConnectionLineType.SmoothStep,
        style: { stroke: '#475569' }
    }));

    // Apply Layout
    const layouted = getLayoutedElements(initialNodes, initialEdges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);

  }, [pipeline, getLayoutedElements, setNodes, setEdges]);


  // 3. Sync Execution State -> React Flow Nodes (Live Updates)
  useEffect(() => {
    if (!state) return;

    setNodes(nds => nds.map(node => {
        const nodeState = state.nodeStates[node.id];
        if (!nodeState) return node;

        // Only update if changed to avoid unnecessary re-renders
        if (node.data.status === nodeState.status && 
            node.data.output === nodeState.output) {
            return node;
        }

        return {
            ...node,
            data: {
                ...node.data,
                status: nodeState.status,
                output: nodeState.output,
                error: nodeState.error
            }
        };
    }));

  }, [state, setNodes]);


  return (
    <div className="w-full h-[600px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        onNodeClick={onNodeClick}
      >
        <Background color="#334155" gap={16} />
        <Controls className="bg-slate-800 border-slate-700 text-white fill-white" />
      </ReactFlow>

      <NodeModal
        node={selectedNode}
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
