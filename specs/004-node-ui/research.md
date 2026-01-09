
# Research Findings: Node UI

## Decision: React Flow Node Interaction

### Context
We need to capture clicks on nodes to show details.

### Decision
Use the standard `onNodeClick` prop provided by the `<ReactFlow />` component.

### Rationale
- Native to the library.
- Provides the `Node` object directly in the callback.
- No need to add event listeners to individual custom nodes.

### Alternatives Considered
- **Click handler inside `StatusNode`**: Possible, but requires passing callbacks down through node data or context. Less clean than the top-level handler.

## Decision: Modal Implementation

### Context
We need to display node details in an overlay.

### Decision
Implement a custom `NodeModal` component using absolute positioning over the `WorkflowCanvas`.

### Rationale
- Simple to implement with Tailwind (`absolute inset-0 z-50`).
- No need for a heavy modal library (Dialog/Radix) for this simple use case, keeping dependencies low as per Constitution.

### Alternatives Considered
- **Browser `alert`**: Terrible UX.
- **Portals**: robust but unnecessary for a single-app context where `App` or `WorkflowCanvas` handles the layout root.

## Decision: Node Type Visualization

### Context
User needs to see the node type.

### Decision
Add a small "Type" label to the existing `StatusNode`.

### Rationale
- Leverages existing component.
- Enhances information density without clutter.
