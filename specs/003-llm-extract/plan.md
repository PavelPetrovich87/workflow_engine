# Implementation Plan: Structured Extractor / Parser (llm-extract)

**Branch**: `003-llm-extract` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/003-llm-extract/spec.md`

## Summary

Implement a new `LlmExtractStrategy` node that strictly parses unstructured text into structured JSON using a user-defined JSON Schema. The implementation will leverage `ajv` for robust schema validation and extend the minimal `BaseLlmStrategy` for LLM interaction.

## Technical Context

**Language/Version**: TypeScript 5.2+
**Primary Dependencies**: `ajv` (New) for JSON Schema validation. Existing `BaseLlmStrategy` for LLM plumbing.
**Storage**: N/A (Stateless node execution)
**Testing**: Manual verification script (due to lack of established test framework).
**Target Platform**: Browser/Client-side (Vite) & Node.js (Core compatibility).
**Project Type**: React Web App + Headless Core.
**Performance Goals**: N/A (bound by LLM latency).
**Constraints**: Must run in browser (Ajv is 100% JS, compatible).
**Scale/Scope**: Single new class + Registry registration.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Core/UI Separation**: PASSED. Strategy lives in `src/core/engine/ai`. No UI deps.
- **Strict Type Safety**: PASSED. Will use `ajv` types and strict TypeScript.
- **Immutable State**: PASSED. Node execution is functional.

## Project Structure

### Documentation (this feature)

```text
specs/003-llm-extract/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code

```text
src/
├── core/
│   ├── engine/
│   │   ├── Registry.ts       # [MODIFY] Register new strategy
│   │   └── ai/
│   │       └── LlmExtractStrategy.ts # [NEW] The strategy implementation
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Add `ajv` dependency | Strict JSON Schema validation required by spec | Hand-rolled validation is error-prone and incomplete. `zod` doesn't validate standard JSON Schema easily. |
