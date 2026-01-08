# Feature Specification: Prompt Template Node (prompt-template)

**Feature Branch**: `002-prompt-template`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "Create this new LLM node strategy: Prompt Template Node (prompt-template). Essential for automation. Input: template (e.g., 'Hello {{name}}'), variables (object). Output: prompt (string). Use Case: Preparing dynamic prompts for the LLM node."

## User Scenarios & Testing

### User Story 1 - Dynamic Prompt Construction (Priority: P1)

A user wants to create a reusable workflow that generates emails for different customers. They need to inject the customer name and topic into a standard email prompt before sending it to the LLM.

**Why this priority**: Core functionality required for automation.

**Independent Test**:
- Create a `PromptTemplateNode` with template "Hello {{name}}, welcome to {{service}}."
- Provide variables `{ name: "Alice", service: "WorkflowEngine" }`.
- Execute node.
- Output should be "Hello Alice, welcome to WorkflowEngine."

**Acceptance Scenarios**:
1. **Given** a template string with valid handlebars syntax and matching variables, **When** the node executes, **Then** all placeholders are replaced with variable values.
2. **Given** a template with no placeholders, **When** executed, **Then** the output matches the input template exactly.
3. **Given** variables with extra keys not in template, **When** executed, **Then** the output is generated correctly ignoring extra keys.

### User Story 2 - Partial Data Handling (Priority: P2)

A user runs a workflow where some data might be missing. They need to know if the prompt was fully constructed or if placeholders remain.

**Why this priority**: Debugging and robustness.

**Independent Test**:
- Template: "Hi {{name}}"
- Variables: `{}` (empty)
- Output should retain `{{name}}` (or predefined behavior).

**Acceptance Scenarios**:
1. **Given** a template with a placeholder `{{missing}}` that is not in the variables object, **When** executed, **Then** the placeholder `{{missing}}` remains in the output text unreplaced (to indicate missing data).

## Requirements

### Functional Requirements

- **FR-001**: System MUST implement a new Node Execution Strategy registered as `prompt-template`.
- **FR-002**: The node MUST accept an input property `template` (string).
- **FR-003**: The node MUST accept an input property `variables` (object/Record<string, any>).
- **FR-004**: The node MUST return an object containing `prompt` (string).
- **FR-005**: The strategy MUST replace all occurrences of `{{key}}` in `template` with the corresponding value from `variables`.
- **FR-006**: The strategy MUST handle string conversion for variable values (e.g., numbers to strings).
- **FR-007**: The strategy MUST NOT throw an error for missing variables; it should leave the placeholder intact.

### Key Entities

- **PromptTemplateStrategy**: The class implementing the logic.
- **Node Config/Data**: `template` will likely be in `node.data` or `input`. Spec assumes `input` overrides `node.data`, or standard input flow. (Assuming `input` for now based on standard node behavior, but `node.data` might store the static template if not provided in input. Let's support `input.template` taking precedence over `node.data.template`).

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of defined placeholders are replaced when corresponding variables are provided.
- **SC-002**: Node execution time is under 10ms for typical templates (< 10KB).
- **SC-003**: Integration into Registry allows the Engine to execute this node type without modification to the Engine core.
