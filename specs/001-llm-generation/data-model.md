# Data Model: LLM Generation Node

## Entities

### LlmGenerationInput
**Description**: The runtime input required to execute the generation.
**Properties**:
- `prompt` (string, required): The text prompt for the LLM.

### LlmGenerationConfig (extends LlmConfig)
**Description**: Configuration properties set at design time (or overridden).
**Properties**:
- `model` (string, optional): The model identifier (e.g., 'gpt-4', 'gemini-pro'). Default: provider specific.
- `temperature` (number, optional): Creativity header (0.0 to 1.0). Default: 0.7.
- `systemInstruction` (string, optional): System-level prompt.

### LlmGenerationOutput
**Description**: The output produced by the node execution.
**Properties**:
- `result` (string): The generated text content.
