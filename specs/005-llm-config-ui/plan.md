# Implementation Plan: LLM Configuration UI

**Branch**: `005-llm-config-ui` | **Date**: 2026-01-09 | **Spec**: [specs/005-llm-config-ui/spec.md](specs/005-llm-config-ui/spec.md)
**Input**: Feature specification from `/specs/005-llm-config-ui/spec.md`

## Summary

This feature implements a global configuration UI to manage Gemini API credentials and model preferences. It introduces a `useLlmConfig` store for persistence (using Local Storage) and integrates this configuration into the existing `BaseLlmStrategy`, allowing AI nodes to execute without individual hardcoded keys.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: `lucide-react` (UI icons), `zod` (Validation)
**Storage**: Browser Local Storage (via `useLlmConfig` hook abstraction)
**Target Platform**: Browser (React)
**Project Type**: Single Page Application (Vite/React)
**Constraints**: 
- Must ensure API keys are not exposed in logs or plain text inputs (masked).
- Must maintain strict Core/UI separation (Core reads config, UI writes config).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Core/UI Separation**: PASSED. The UI component (`LlmConfigModal`) resides in `src/ui`. The configuration state is managed via a hook/interface that `src/core` strategies can access via a context injection or a standardized config provider pattern. *Correction*: `BaseLlmStrategy` currently accesses keys via node config. We need to inject the global config into the execution context so strict separation is maintained.
- **Strict Type Safety**: PASSED. All config objects will be defined with Zod schemas.
- **Immutable State**: PASSED. Configuration updates will follow the standard React state/hook patterns.
- **Visualization Standard**: N/A (Admin UI, not graph flow).

## Project Structure

### Documentation (this feature)

```text
specs/005-llm-config-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code

```text
src/
├── core/
│   ├── def/
│   │   └── llm.ts           # [MODIFY] Add GlobalConfig types
│   └── engine/
│       └── ai/
│           └── BaseLlmStrategy.ts # [MODIFY] Update to read from global context
├── ui/
│   ├── LlmConfigModal.tsx   # [NEW] Configuration Modal Component
│   └── App.tsx              # [MODIFY] Render Modal & Inject Context
└── hooks/
    └── useLlmConfig.ts      # [NEW] Persistence Logic
```

**Structure Decision**: We will add a new hook `useLlmConfig` to manage the persistence of the API key and model. This hook will return the current config, which will then be passed into the `WorkflowEngine` start/context methods so that strategies can access it during execution.

## Research (Phase 0)

### Decisions

- **Decision**: Use `localStorage` for persistence.
  - **Rationale**: Simple, effective for client-side API keys, no backend required.
  - **Alternatives**: Session storage (lost on close), IndexedDB (overkill).

- **Decision**: Inject Global Config via `input` or `context` to Strategies.
  - **Rationale**: Keeps Strategies pure and testable. The `WorkflowEngine.start()` inputs or the `context` object in `WorkflowState` is the correct place to pass "Environmental Constraints".
  - **Approach**: The `App` component will load the config. When calling `engine.start()`, it will spread the config into the `context`.

## Design & Contracts (Phase 1)

### Data Model (`data-model.md`)

**Entity**: `LlmGlobalConfig`
```typescript
interface LlmGlobalConfig {
  apiKey: string;      // The Gemini API Key
  model: string;       // Default: 'gemini-1.5-flash'
}
```

### Integration

**Context Injection**:
In `App.tsx`:
```typescript
const { config } = useLlmConfig();
...
engine.start({ 
  ...input, 
  context: { 
    ...existingContext, 
    items: { 
      ENV_GEMINI_API_KEY: config.apiKey, 
      ENV_GEMINI_MODEL: config.model 
    } 
  } 
});
```

**Strategy Update**:
In `BaseLlmStrategy.ts`:
```typescript
getApiKey(node, context): string {
    return node.config.apiKey || context.items?.ENV_GEMINI_API_KEY;
}
```
