# Data Model: Structured Extractor

## Configuration Interface

```typescript
import { LlmConfig } from '../../def/llm';

export interface ExtractionConfig extends LlmConfig {
  /**
   * The JSON Schema object to validate against.
   * MUST be a valid JSON Schema (Draft 7+).
   */
  schema: Record<string, any>;

  /**
   * If true, the node will throw an error if the LLM output 
   * does not strictly match the schema.
   * @default true
   */
  strict?: boolean; // Implied by usage, but good to have explicit control
}
```

## Class Design

### `LlmExtractStrategy`

**Extends**: `BaseLlmStrategy`

**Methods**:

-   `execute(node: Node, input: any, context: WorkflowState['context']): Promise<any>`
    1.  **Validate Input**: Ensure `input.text` is a string and `input.schema` (or config schema) is valid.
    2.  **Prepare Prompt**: Construct a prompt including the text and the schema structure, instructing the LLM to output valid JSON.
    3.  **Call LLM**: Use `this.getApiKey` and fetch from provider (mimicked/real).
    4.  **Parse & Validate**: Use `ajv` to validate the returned JSON against the schema.
    5.  **Return**: The structured data object.
