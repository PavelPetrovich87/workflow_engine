# Tasks: Base LLM Strategy

**Phase 1: Setup & Types**

- [ ] T001 Create shared LLM types in src/core/def/llm.ts
  - Define `LlmConfigSchema` and `LlmResponse` interface as per data-model.md.
- [ ] T002 Update WorkflowState to support environmental context
  - Modify `src/core/def/workflow.ts` to Type `WorkflowState.context` properly or ensure `env` property is documented/typed if not dynamic.

**Phase 2: BaseLlmStrategy Implementation (User Story 1)**

- [ ] T003 Create AI directory src/core/engine/ai/
- [ ] T004 [US1] Create BaseLlmStrategy.ts structure
  - Implement abstract class inheriting `NodeExecutionStrategy`.
- [ ] T005 [US1] Implement getApiKey method
  - Implement waterfall logic: node config -> context.env -> process.env.
- [ ] T006 [US1] Implement helper methods
  - `getParam(node, key, defaultVal)` for config extraction.
  - `simulateDelay()` for testing.

**Phase 3: Error Handling & Logging (User Story 2)**

- [ ] T007 [US2] Define LlmError class
  - Create standard error wrapper in `src/core/def/llm.ts` or `BaseLlmStrategy.ts`.
- [ ] T008 [US2] Implement handleLlmError method in BaseLlmStrategy
  - Add method to normalize errors into `LlmError`.
- [ ] T009 [US2] Add telemetry logging hook
  - Ensure `execute` wrapper (if design allows) or helper logs token usage. Note: Since `execute` is abstract, we might need a `protected async executeWithLogging(...)` or just enforce it in the implementing classes via a base method `recordTelemetry()`. Let's stick to adding a `logUsage(response)` helper for now.

**Phase 4: Validation**

- [ ] T010 Create a Mock Implementation for verification
  - Create a temporary `MockLlmStrategies.ts` that extends BaseLlmStrategy to test key retrieval and error handling manually.
- [ ] T011 Verify API Key Waterfall
  - Test with no key (fail), env key (pass), context key (pass).

**Dependencies**

- T001 -> T003, T004
- T004 -> T005, T006
- T007 -> T008
