# Tasks: Prompt Template Node (prompt-template)

**Feature**: 002-prompt-template
**Total Tasks**: 8

## Phase 1: Setup
*Goal: Initialize project structure for the new feature.*

- [ ] T001 Initialize `scripts/verify-prompt-template.ts` with empty runner structure for verification.
- [ ] T002 Register `prompt-template` key in `src/core/engine/Registry.ts` (pointing to a placeholder or future class).

## Phase 2: Foundational
*Goal: Create the core class structure.*

- [ ] T003 Create `src/core/engine/ai/PromptTemplateStrategy.ts` with `NodeExecutionStrategy` interface stub.

## Phase 3: User Story 1 - Dynamic Prompt Construction (P1)
*Goal: Enable basic variable substitution.*
*Independent Test: Script runs with `{{name}}` -> `Alice`.*

- [ ] T004 [US1] Implement Regex substitution logic in `src/core/engine/ai/PromptTemplateStrategy.ts`.
- [ ] T005 [US1] Update `scripts/verify-prompt-template.ts` with Test Case 1 (Basic Substitution).
- [ ] T006 [US1] Verify execution returns correct prompt.

## Phase 4: User Story 2 - Partial Data Handling (P2)
*Goal: Handle edge cases (missing vars, whitespace).*
*Independent Test: Script runs with missing var and preserves placeholder.*

- [ ] T007 [US2] Refine Regex logic in `PromptTemplateStrategy` to handle whitespace/missing keys correctly (ensure no crash).
- [ ] T008 [US2] Update `scripts/verify-prompt-template.ts` with Test Case 2 (Missing) and 3 (Whitespace).

## Final Phase: Polish & Cross-Cutting
*Goal: Final verification.*

- [ ] T009 Run full `scripts/verify-prompt-template.ts` and ensure all assertions pass.

## Dependencies

- Phase 1 & 2 must complete before Phase 3.
- Phase 3 must complete before Phase 4 (logic refinement).

## Implementation Strategy
- Implement the Strategy class iteratively, adding test cases to the verification script as we go.
- No heavy UI work required.
