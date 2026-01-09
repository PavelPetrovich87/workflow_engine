# Feature Specification: LLM Configuration UI

**Feature Branch**: `005-llm-config-ui`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "Now we need to a UI where we put an api key and model (default will be gemini 1.5 flash) then we will save these values into local storage. Then we will use these values in our created LLM nodes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure AI Model (Priority: P1)

As a user of the workflow engine, I want to provide my Gemini API key and select a model so that I can execute AI-powered nodes correctly.

**Why this priority**: Without a central configuration, every AI node would require manual hardcoding of keys, which is insecure and inefficient. This is the foundation for real LLM integration.

**Independent Test**: Can be tested by entering an API key and model name into the UI, refreshing the page, and verifying the values persist in the form.

**Acceptance Scenarios**:

1. **Given** I am on the main dashboard, **When** I open the LLM Configuration settings, **Then** I should see inputs for "API Key" and "Default Model".
2. **Given** no previous configuration exists, **When** I view the settings, **Then** the model should default to "gemini-1.5-flash".
3. **Given** I have entered a valid API key, **When** I click "Save", **Then** the system should display a confirmation message and store the values securely (local storage).

---

### User Story 2 - Seamless AI Execution (Priority: P2)

As a user running a workflow, I want my AI nodes to automatically use my saved credentials so that I don't have to configure each node individually.

**Why this priority**: This ensures the configuration is actually functional and improves the developer experience by providing a global fallback.

**Independent Test**: Can be tested by running any pipeline with an `llm-generation` or `llm-extract` node and verifying (via logs) that it uses the key from local storage instead of a hardcoded "mock-key".

**Acceptance Scenarios**:

1. **Given** I have saved an API key in the global settings, **When** I execute an AI node that does not have a local key override, **Then** the node should use the global key.
2. **Given** I have saved a default model in settings, **When** I execute an AI node without a specific model config, **Then** it should use the global default model.

---

### Edge Cases

- **Empty Configuration**: What happens when a user tries to run an AI workflow without saving an API key? (System should show a clear error or warning on the node execution state).
- **Multiple Keys**: If a node *does* have a specific key provided in its configuration, it must override the global key.
- **Sensitive Data**: How is the API key displayed? (Input field should mask the key for security).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a UI component (e.g., a modal or sidebar) for LLM Configuration.
- **FR-002**: System MUST allow users to input a Gemini API Key.
- **FR-003**: System MUST allow users to select/input a default Model name.
- **FR-004**: System MUST persist these settings in Local Storage.
- **FR-005**: System MUST use the saved API Key as the default for all nodes extending `BaseLlmStrategy`.
- **FR-006**: Default model MUST be "gemini-1.5-flash" if not otherwise specified.
- **FR-007**: System MUST support node-level overrides for both API Key and Model.

### Key Entities

- **LLMConfig**: Represents the global settings object (`apiKey`, `defaultModel`).
- **WorkflowContext**: The existing shared memory which must now dynamically resolve environment variables from the stored config.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can save their LLM configuration in less than 30 seconds.
- **SC-002**: Configuration survives page reloads 100% of the time.
- **SC-003**: AI nodes successfully execute using the global key without manual node-level configuration.
- **SC-004**: API Key input is masked by default (type="password").
