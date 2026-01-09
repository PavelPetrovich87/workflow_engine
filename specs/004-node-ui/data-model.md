
# Data Model: Node UI

## UI State Entities

### NodeModalProps
Interface for the `NodeModal` component.

```typescript
interface NodeModalProps {
  node: Node | null; // The selected node from the core definition
  isOpen: boolean;   // Visibility state
  onClose: () => void; // Handler to close the modal
}
```

### Canvas State
Extending `WorkflowCanvas` local state.

```typescript
// Inside WorkflowCanvas component
const [selectedNode, setSelectedNode] = useState<Node | null>(null);
```

## Visual Entities

### StatusNode Visuals
Updates to the `StatusNode` presentation.

- **Interaction**: `cursor: pointer`
- **Label**: Shows `node.label`
- **Type**: Shows `node.type` (e.g., "HTTP", "JS") as a pill/badge.
