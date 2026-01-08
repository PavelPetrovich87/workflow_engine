# Feature Specification: Structured Extractor / Parser (llm-extract)

**Feature Branch**: `003-llm-extract`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: User description: "Using this @[BaseLlmStrategy]class We need to create this new LLM node strategy: 🔍 Structured Extractor / Parser (llm-extract) Crucial for reliable workflows. AI is messy; this makes it strict. * Input: text, schema (JSON schema). * Output: data (JSON object). * Use Case: Extracting dates, names, or specific fields from an email/document."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Structured Extraction (Priority: P1)

As a workflow builder, I want to extract fields from unstructured text using a defined JSON schema, so that I can reliably use the extracted data in downstream nodes.

**Why this priority**: Core functionality. Without this, the node serves no purpose.

**Independent Test**:
-   Run the node with a sample text (e.g., an email) and a simple JSON schema (e.g., `{"type": "object", "properties": {"date": {"type": "string"}, "sender": {"type": "string"}}}`).
-   Verify the output is a valid JSON object with `date` and `sender` fields populated correctly from the text.

**Acceptance Scenarios**:

1.  **Given** a text input containing a meeting invite and a schema for "date" and "time", **When** the node executes, **Then** it returns a JSON object with the correct date and time extracted.
2.  **Given** a text input and a schema with nested objects, **When** the node executes, **Then** it returns a nested JSON object matching the structure.

---

### User Story 2 - Strict Schema Validation (Priority: P1)

As a workflow builder, I want to ensure the output strictly adheres to my provided JSON schema, so that my workflow remains robust and predictable.

**Why this priority**: The user explicitly requested "strict" extraction for "reliable workflows".

**Independent Test**:
-   Provide a schema with specific types (e.g., `age` must be a number).
-   Provide text where ambiguity exists.
-   Verify the LLM output is forced/validated to match the type (e.g., `age` is `30`, not `"30"`).

**Acceptance Scenarios**:

1.  **Given** a schema requiring an integer field, **When** the LLM extracts the value, **Then** the output JSON contains an integer, not a string.
2.  **Given** a schema with required fields, **When** the text is missing information, **Then** the node either returns null for missing optional fields or handles the error as defined (e.g., throws error or returns partial data if allowed).

---

### User Story 3 - Robust Error Handling (Priority: P2)

As a workflow builder, I want clear feedback when extraction fails or the schema is invalid, so that I can debug my workflow configuration.

**Why this priority**: Essential for developer experience and debugging.

**Independent Test**:
-   Provide a malformed JSON schema.
-   Verify the node throws a clear configuration error.

**Acceptance Scenarios**:

1.  **Given** an invalid JSON schema input, **When** the node initializes/runs, **Then** it throws a specific error indicating schema validation failure.
2.  **Given** text that is completely irrelevant to the schema, **When** the node runs, **Then** it returns an empty object or a specific "not found" result, rather than hallucinating data.

### Edge Cases

-   **Invalid Schema**: If the user provides a schema that is not valid JSON Schema, the node must error immediately during configuration or execution start, providing a clear reference to the schema error.
-   **Text too long**: If the input text exceeds the LLM's token limit, the node should default to truncating or erroring based on global settings (default to error for reliability).
-   **Extraction Failure**: If the LLM cannot find the extraction targets (e.g., extracting "date" from "hello world"), the node must return `null` or a default value for those fields, rather than hallucinating a date.
-   **JSON Syntax Error from LLM**: If the LLM returns invalid JSON (rare but possible), the node must retry (if configured) or throw a parsing error.

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: System MUST integrate with the existing AI strategy framework (BaseLlmStrategy) to ensure consistent configuration and error handling.
-   **FR-002**: System MUST accept `text` (string) as input for the content to process.
-   **FR-003**: System MUST accept `schema` (JSON object) as input defining the desired output structure.
-   **FR-004**: System MUST validate the provided `schema` is a valid JSON Schema.
-   **FR-005**: System MUST use an LLM to parse the `text` and extract data matching the `schema`.
-   **FR-006**: System MUST return the extracted data as a JSON object.
-   **FR-007**: System MUST validate the LLM's output against the provided `schema` before returning.
-   **FR-008**: System MUST handle "missing data" scenarios (e.g., return null or throw error based on configuration/schema required fields).

### Key Entities *(include if feature involves data)*

-   **ExtractionConfig**: Configuration interface extending `LlmConfig` with specific settings for extraction (e.g., potentially retry logic, strict mode).
-   **SchemaDefinition**: The JSON Schema object provided by the user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: 100% of valid inputs (text + valid schema) result in output that validates against the schema (or a caught error).
-   **SC-002**: Node correctly identifies and rejects invalid schema inputs 100% of the time.
-   **SC-003**: Extraction precision (on a standard test set of 10 examples) is > 90%.
