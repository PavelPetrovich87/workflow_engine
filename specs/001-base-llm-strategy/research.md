# Research & Decisions: Base LLM Strategy

**Status**: Complete
**Date**: 2026-01-08

## Decisions

### 1. API Key Injection Strategy
**Decision**: Use a waterfall approach: `WorkflowState.context.env` > `process.env`.
**Rationale**:
- `process.env` works for local dev/build time.
- `context.env` allows users to securely inject keys at runtime (e.g. from a UI input or backend secrets manager) without rebuilding.
**Alternatives**:
- *Hardcoded*: Insecure.
- *Node Data*: Unsafe to persist API keys in the graph definition file (export/import risk).

### 2. Error Handling Standardization
**Decision**: Define a `LlmError` class with `code`, `retryable` flag, and `providerError` details.
**Rationale**:
- Workflow engine needs to know if it should auto-retry (e.g. Rate Limit = retry, Auth Error = fail).
- Different providers (OpenAI, Gemini) have different error shapes. Normalizing them in the Base strategy simplifies the downstream nodes.

### 3. Folder Structure
**Decision**: Create `src/core/engine/ai/` namespace.
**Rationale**:
- `src/core/engine` is getting crowded.
- We anticipate multiple AI files (`BaseLlmStrategy`, `PromptTemplate`, `LlmRouter`). Grouping them keeps the codebase clean.

## Unknowns Resolved
- *Handling Config*: We will enforce that all LLM nodes must accept a `config` object matching `LlmNodeConfig` schema.
