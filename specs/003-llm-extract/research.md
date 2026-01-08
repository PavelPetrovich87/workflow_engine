# Research: Structured Extractor / Parser

**Feature**: `llm-extract`

## Decisions

### 1. JSON Schema Validation Library: `ajv`

**Decision**: Use `ajv` (Another JSON Schema Validator).

**Rationale**: 
- `ajv` is the industry standard for JSON Schema validation in JavaScript.
- It supports the latest JSON Schema specifications (Draft 7+).
- It is highly performant and widely used.
- It allows strictly validating the User's provided schema against the JSON Schema meta-schema, AND validating the LLM's output against the User's schema.

**Alternatives Considered**:
- **`zod`**: Already in the project. rejected because `zod` is designed for build-time TypeScript schema definition. While it can validate runtime objects, converting a dynamic JSON Schema object (provided by the user at runtime) into a Zod schema requires 3rd party wrappers or complex custom logic. `ajv` handles JSON Schema natively.
- **Manual Validation**: Implementing a JSON Schema validator from scratch is extremely complex and error-prone (refs, inheritance, pattern matching, etc.).

### 2. LLM Interaction: `BaseLlmStrategy`

**Decision**: Extend `BaseLlmStrategy`.

**Rationale**:
- Provides standardized config validation and error handling.
- Encapsulates API key retrieval logic.
- Maintains consistency with other nodes.
