
# Implementation Plan: Node UI and Interaction

**Branch**: `002-nodes-UI` | **Date**: 2026-01-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/004-node-ui/spec.md`

## Summary

Implement interactive UI for workflow nodes using React Flow. This includes displaying node types within the node visual and opening a modal with node details when a node is clicked. The implementation will ensure strict separation between Core execution logic and UI presentation.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 18, React Flow 11, Tailwind CSS
**Storage**: N/A (UI State only)
**Testing**: Manual Verification (Dev Server)
**Target Platform**: Web (Vite)
**Project Type**: Single Page Application
**Performance Goals**: Instant modal open (< 16ms), smooth 60fps graph interaction.
**Constraints**: Must not modify `src/core` logic. Node interaction is purely visual/inspectional for this phase.
**Scale/Scope**: ~3 files modified/created.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

-   [x] **Core/UI Separation**: UI logic (Modal, Click handlers) stays in `src/ui`. `src/core` is untouched.
-   [x] **Strict Type Safety**: All new components (`NodeModal`) will have typed props. Event handlers will use React Flow types.
-   [x] **Immutable State**: UI state (`selectedNode`) will be managed via React hooks (`useState`).
-   [x] **Visualization Standard**: Uses `React Flow`'s `onNodeClick` and Custom Nodes.

## Project Structure

### Documentation (this feature)

```text
specs/004-node-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
src/
└── ui/
    ├── WorkflowCanvas.tsx  # Modify: Add onNodeClick, render Modal
    ├── NodeModal.tsx       # New: Modal component
    └── StatusNode.tsx      # Modify: Visual updates (cursor-pointer, type label)
```

**Structure Decision**: Standard UI Component addition.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A        | N/A                                 |
