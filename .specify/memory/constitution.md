<!--
Sync Impact Report:
- Version change: New -> 1.0.0
- List of modified principles: Established initial principles (Core/UI Separation, Type Safety, Immutable State)
- Added sections: Core Principles, Architectural Constraints, Development Standards, Governance
- Templates requiring updates:
  - .specify/templates/plan-template.md (Compatible, references constitution generically)
  - .specify/templates/spec-template.md (Compatible)
  - .specify/templates/tasks-template.md (Compatible)
- Follow-up TODOs: None
-->
# Workflow Engine Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### I. Core/UI Separation
<!-- Example: I. Library-First -->
The core engine logic (located in `src/core`) MUST remain strictly decoupled from the UI layer (`src/ui`). The core is responsible for state management, graph traversal, and execution logic. The UI is a view layer that renders the state and dispatches actions. This ensures the engine can potentially run in a headless environment or be easily ported.

### II. Strict Type Safety
<!-- Example: II. CLI Interface -->
All code MUST be written in strict TypeScript. The use of `any` is prohibited unless technically unavoidable and explicitly justified in code comments. Interfaces and Types must define clear contracts for Nodes, Edges, and critical system components. This guarantees reliability and developer confidence.

### III. Immutable State & Unidirectional Flow
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
State changes MUST follow a unidirectional data flow pattern (Action -> Reducer/Store -> State -> View). Direct mutation of state objects outside of designated actions is strictly forbidden. This ensures state predictability and simplifies debugging (time-travel debugging, logging).

### IV. Visualization Standard
<!-- Example: IV. Framework Selection -->
All flow-based UI visualizations MUST use `React Flow` (`@xyflow/react`).
- **Standard Features**: Implementations MUST utilize standard `Background`, `Controls`, and `MiniMap` components to ensure a consistent user experience.
- **Basic Usage**: Prefer standard nodes, edges, and handles over custom implementations unless specific business logic requires it.
- **Documentation**: Refer to [React Flow Documentation](https://reactflow.dev) for usage patterns.

## Architectural Constraints
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

- **Headless Capability**: The `src/core` module should not depend on browser-specific APIs (unless polyfilled or abstracted) to allow for potential server-side execution of workflows.
- **Dependency discipline**: Dependencies in `src/core` should be kept to a minimum to maintain a lightweight engine.

## Development Standards
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

- **Linting**: All code must pass the project's ESLint configuration with zero warnings before merging.
- **Testing**: While not fully established yet, new non-trivial core logic SHOULD include unit tests.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This Constitution is the supreme law of the project's architecture.
- **Amendments**: Changes to Core Principles require a MAJOR version bump of the constitution.
- **Compliance**: All Pull Requests must be reviewed against these principles. Code violating "Strict Type Safety" or "Core/UI Separation" without strong justification will be rejected.

**Version**: 1.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
