# Research: LLM Generation Node

**Feature**: LLM Generation Node (`001-llm-generation`)
**Date**: 2026-01-08

## Decisions

### 1. Base Class Usage
- **Decision**: Extend `BaseLlmStrategy`.
- **Rationale**: `BaseLlmStrategy` already handles API key hierarchy (Node Config > Context > Env) and error normalization. This ensures consistency with future AI nodes.
- **Alternatives considered**: Implementing `NodeExecutionStrategy` directly. Rejected to avoid code duplication.

### 2. Output Format
- **Decision**: Result object `{ result: string }`.
- **Rationale**: Future-proofing. If we want to return token usage or metadata later, we can add fields without breaking the schema.
- **Alternatives considered**: Returning raw string. Rejected because it limits extensibility.

### 3. Verification Method
- **Decision**: Manual script `src/demo-llm.ts`.
- **Rationale**: No unit test runner (Jest/Vitest) is currently set up or visible in the `src` scan. A standalone script using `ts-node` or `tsx` is the most reliable current method.
- **Alternatives considered**: Adding Jest. Rejected to avoid scope creep (setting up testing infra is a separate task).

## Knowledge Gaps Resolved
- API Key handling is standardized in `BaseLlmStrategy`.
- Configuration schema is defined in `src/def/llm.ts` (inferred from imports in BaseLlmStrategy).
