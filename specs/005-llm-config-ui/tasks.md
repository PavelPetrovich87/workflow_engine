# Tasks: LLM Configuration UI

**Feature**: `005-llm-config-ui`

# Phase 1: Setup

- [x] T001 [P] Create `LlmConfigModal` component structure in `src/ui/LlmConfigModal.tsx`
- [x] T002 [P] Create `useLlmConfig` hook in `src/hooks/useLlmConfig.ts` with local storage logic
- [x] T003 [P] Add global context definition in `src/core/def/llm.ts`

# Phase 2: Foundational

- [x] T004 [P] Implement `useLlmConfig` persistence logic (load/save/masking)
- [x] T005 [P] Implement `LlmConfigModal` UI state and validation (Zod)

# Phase 3: User Story 1 - Configure AI Model (P1)

- [x] T006 [US1] Integrate `LlmConfigModal` into `App.tsx` (header button)
- [x] T007 [US1] Wire up Save action in Modal to `useLlmConfig`
- [x] T008 [US1] Verify input masking for API Key and default model selection

# Phase 4: User Story 2 - Seamless AI Execution (P2)

- [x] T009 [US2] Update `BaseLlmStrategy.ts` to read API Key/Model from `context.items`
- [x] T010 [US2] Update `App.tsx` to inject config into `engine.start({ context... })`
- [x] T011 [US2] Verify `demo-llm.ts` (or manual test) picks up global key when node config is empty

# Phase 5: Polish

- [x] T012 Add toast notifications for "Config Saved"
- [x] T013 Ensure proper error usage if no key is found in either global or node config
