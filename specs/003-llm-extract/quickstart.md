# Quickstart: Structured Extractor Node

## Usage

1.  **Add Node**: Select "Structured Extractor" (or `llm-extract` type) in the workflow editor.
2.  **Configure**:
    -   **Model**: Select an underlying LLM model (e.g., Gemini Pro).
    -   **API Key**: Ensure `GEMINI_API_KEY` is set in environment or node config.
3.  **Inputs**:
    -   `text`: The unstructured text to process (e.g., output from an HTTP node or User Input).
    -   `schema`: A valid JSON Schema object.
        -   Example: validation for a Person
        ```json
        {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "age": { "type": "integer" }
          },
          "required": ["name"]
        }
        ```
4.  **Output**:
    -   The node returns a JSON object strictly matching your schema.
    -   Example output:
        ```json
        {
          "name": "Alice",
          "age": 30
        }
        ```

## Error Handling

-   **Invalid Schema**: If your schema input is invalid, the node errors immediately.
-   **Validation Failed**: If the LLM output doesn't match the schema, the node throws a validation error (check node logs for details).
-   **No Match**: If the LLM cannot find data, it may return null or empty fields depending on your schema's "required" fields.
