# Feature Specification: Base LLM Strategy

**Feature Branch**: `001-base-llm-strategy`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "Base LLM Strategy Class: Abstract class to standardize LLM interactions, API key management, and error handling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Efficiency (Priority: P1)

As a developer adding new AI features (like Chat, Summarization, or Extraction), I want to extend a `BaseLlmStrategy` class so that I don't have to re-implement authentication, error handling, or model selection logic every time.

**Why this priority**: Enabler for parallel development of multiple AI features as requested.

**Independent Test**: Create a generic "Mock LLM Node" that extends this base class and verify it inherits correct behavior (e.g. fails if API key is missing) without writing that logic in the mock itself.

**Acceptance Scenarios**:

1. **Given** a class extending `BaseLlmStrategy`, **When** `execute()` is called, **Then** it should automatically validate the API Key existence before proceeding.
2. **Given** a network failure during a simulated call in the child class, **When** the base class error handler is used, **Then** it standardizes the error format (e.g. `code`, `message`, `retryable`) for the workflow engine.
3. **Given** a unified configuration interface, **When** a specific model is requested (e.g., 'gpt-4'), **Then** the base class provides a standard way to access/validate this config.

---

### User Story 2 - Standardized Telemetry/Logging (Priority: P2)

As a system administrator, I want all AI node executions to log their token usage (simulated or real) and model parameters in a consistent format so that I can debug issues easily.

**Why this priority**: AI calls are non-deterministic and expensive; consistent logging is vital for debugging "weird" answers.

**Independent Test**: Execute the "Mock LLM Node" and check the return object or console logs for standardized fields.

**Acceptance Scenarios**:

1. **Given** any child strategy execution, **When** it completes, **Then** the output/logs must include metadata about the `model` used and `executionTime`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an abstract class `BaseLlmStrategy` implementing `NodeExecutionStrategy`.
- **FR-002**: The base class MUST expose a protected method `getApiKey()` that securely retrieves the key (e.g. `GEMINI_API_KEY`) or throws a standardized error.
- **FR-003**: The base class MUST define a standard configuration interface `LlmNodeConfig` (model, temperature, maxTokens).
- **FR-004**: The base class MUST provide a common `handleLlmError(error: any): LlmError` method to normalize vendor-specific errors.
- **FR-005**: The base class SHOULD allow for easy swapping of the underlying provider (e.g. via specific child implementation methods like `generateResponse(prompt)` which the base class orchestration calls).
    - *Refinement*: For MVP, maybe just helper methods. Let's stick to "Base class manages common config and error handling".
- **FR-006**: The system MUST support a `simulateNetworkDelay` or similar utility for testing purposes until real APIs are hooked up.

### Key Entities

- **BaseLlmStrategy**: Abstract class.
- **LlmConfig**: Interface for standard inputs.
- **LlmResponse**: Standardized output structure.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new "Hello World" LLM strategy can be implemented with < 20 lines of code by extending the base class.
- **SC-002**: Error handling for missing keys or timeouts is consistent across any node implementing this base.
