
# Specification: Node UI and Interaction

## 1. Overview
Implement an interactive UI for workflow nodes. When a user clicks on a node in the workflow graph, a modal should appear. The node UI itself should display the node type and be connected via clickable edges.

## 2. User Stories
- As a user, I want to see the type of each node in the graph so I can understand the workflow structure.
- As a user, I want to click on a node to open a detailed view (modal) for that node.
- As a user, I want to see a modal overlay when I click a node.

## 3. Functional Requirements
### 3.1 Node Component
- **Visuals**:
    - Display Node Label.
    - Display Node Type (e.g., "log", "wait", "javascript").
    - Use `StatusNode` as the base or create a similar consistent design.
- **Interaction**:
    - Clickable. On click, trigger an event to open the modal.

### 3.2 Modal Component
- **Visuals**:
    - Overlay on top of the UI.
    - "Empty" content for now (placeholder).
    - Close button or click-outside to close.
- **State**:
    - Track `selectedNodeId` in `WorkflowCanvas` or `App`.

### 3.3 Graph Edges
- Edges should be rendered (already present in `WorkflowCanvas`).

## 4. Technical Design
- **State Management**:
    - Add `selectedNode` state to `WorkflowCanvas` (or lift to `App` if needed, but `WorkflowCanvas` seems appropriate for UI-specific state).
- **React Flow**:
    - Use `onNodeClick` prop in `<ReactFlow>` component.
- **Components**:
    - `NodeModal`: A new component for the modal.
    - Reuse or update `StatusNode` to Ensure it looks clickable (cursor pointer).

## 5. Verification
- Manual verification:
    - Click a node -> Modal opens.
    - Modal shows "Node Details" or empty content.
    - Close modal -> Modal disappears.
