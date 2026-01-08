# Implementation Plan: Base LLM Strategy

**Branch**: `001-base-llm-strategy` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-base-llm-strategy/spec.md`

## Summary

Implement an abstract `BaseLlmStrategy` class to standardize interactions with Large Language Models. This base class will handle API key retrieval, error normalization, and provide a unified configuration interface, enabling parallel development of specific AI nodes (Generation, Router, Extract).

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: `zod` (for validation), standard `fetch` (for API calls)
**Storage**: N/A (Stateless execution)
**Testing**: Monitor console logs / Manual testing initially.
**Target Platform**: Browser & Node.js (Universal/Isomorphic).
**Project Type**: Web application (React/Vite) + Headless Core
**Performance Goals**: N/A (Network bound)
**Constraints**: Must be stateless and secure (API keys via env/context).
**Scale/Scope**: Fundamental building block for all future AI nodes.

## Constitution Check

*GATE: Must pass before Phase 0 research.*

- **Core/UI Separation**: PASSED. This logic resides entirely in `src/core/engine`, having no dependency on UI.
- **Strict Type Safety**: PASSED. Will use TypeScript interfaces and Zod schemas for strict typing of Inputs/Outputs.
- **Immutable State**: PASSED. Strategy execution does not mutate global state directly; it returns values.
- **Dependency Discipline**: PASSED. Using standard `fetch` and existing `zod` dependency.

## Project Structure

### Documentation (this feature)

```text
specs/001-base-llm-strategy/
├── plan.md              # This file
├── research.md          # Implementation decisions
├── data-model.md        # Class interfaces and types
└── tasks.md             # Actionable tasks
```

### Source Code

```text
src/core/engine/
├── ai/
│   └── BaseLlmStrategy.ts  # [NEW] The abstract base class
└── def/
    └── llm.ts              # [NEW] Shared types for LLM configuration
```

## Complexity Tracking

None. Standard OO pattern.
