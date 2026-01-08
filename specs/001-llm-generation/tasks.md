# Tasks: LLM Generation Node

**Branch**: `001-llm-generation` | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Dependencies

- Phase 1 (Setup) blocks Phase 2 (Foundational)
- Phase 2 (Foundational) blocks Phase 3 (US1) & Phase 4 (US2)
- Phase 3 & 4 can likely be parallelized

## Phase 1: Setup

- [x] T001 [P] Create feature directory structure in `specs/001-llm-generation` (Done)

## Phase 2: Foundational

**Goal**: Establish the core strategy class and ensure it builds.

- [x] T002 [P] Create `src/core/engine/ai/LlmGenerationStrategy.ts` with skeleton class extending `BaseLlmStrategy`.
- [x] T003 [P] Implement `getApiKey` override or ensure `BaseLlmStrategy` is sufficient (verified in research).
- [x] T004 Define `LlmGenerationConfig`, `LlmGenerationInput`, `LlmGenerationOutput` interfaces in `src/core/dep/llm.ts` (or within strategy file if local).
- [x] T005 Implement `getConfig` validation in `LlmGenerationStrategy.ts`.

## Phase 3: User Story 1 (Basic Text Generation)

**Goal**: Enable static prompt execution.

- [x] T006 [US1] Implement `execute` method in `src/core/engine/ai/LlmGenerationStrategy.ts` to handle simple prompt input.
- [x] T007 [US1] Implement API call logic (fetch/mock) within `execute` method.
- [x] T008 [US1] Register `llm-generation` in `src/core/engine/Registry.ts`.
- [x] T009 [US1] Create verification script `src/demo-llm.ts` with a static prompt workflow.
- [x] T010 [US1] Run `src/demo-llm.ts` and verify output.

## Phase 4: User Story 2 (Dynamic Prompting)

**Goal**: Enable dynamic variable injection in prompts.

- [ ] T011 [US2] Update `LlmGenerationInput` to support dynamic field mapping check (Engine handles this mostly, strategy just receives resolved input).
- [ ] T012 [US2] Verify dynamic input works by updating `src/demo-llm.ts` to chain two nodes.
- [ ] T013 [US2] Run `src/demo-llm.ts` with chained nodes and verify output.

## Phase 5: Polish & Cross-Cutting

- [x] T014 Review error handling for edge cases (empty prompt, API failure) in `LlmGenerationStrategy.ts`.
- [x] T015 Clean up `src/demo-llm.ts` or convert to a reusable test utility if needed.
- [x] T016 Final manual verification of all scenarios.

## Implementation Strategy
- Implement `LlmGenerationStrategy` iteratively.
- Use `src/demo-llm.ts` as the "living" test runner since no unit tests exist.
