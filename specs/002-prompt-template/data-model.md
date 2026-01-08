# Data Model: Prompt Template Node

## Node Configuration / Input

The `PromptTemplateStrategy` operates primarily on dynamic inputs passed at runtime, but can also accept static configuration.

### Input Object

```typescript
interface PromptTemplateInput {
  /**
   * The template string containing variables in {{key}} format.
   * Example: "Hello {{name}}"
   */
  template: string;

  /**
   * Key-value pairs for substitution.
   * Example: { name: "Alice" }
   */
  variables: Record<string, any>;
}
```

### precedence
- If `input.template` is provided, it is used.
- If `node.data.template` is provided and `input.template` is missing, `node.data.template` is used.

## Output Object

```typescript
interface PromptTemplateOutput {
  /**
   * The resulting string after substitution.
   * Example: "Hello Alice"
   */
  prompt: string;
}
```
