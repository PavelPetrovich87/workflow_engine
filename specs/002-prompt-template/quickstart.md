# Quickstart: Using Prompt Template Node

## Prerequisite
Ensure you are on branch `002-prompt-template` or a version where `prompt-template` strategy is registered.

## 1. Create a Workflow Node
In your workflow definition, add a node with type `prompt-template`.

```typescript
const node = {
  id: "node-1",
  type: "prompt-template", // Matches Registry key
  data: {
    // Optional: Static template default
    template: "Hello {{name}}"
  }
};
```

## 2. Execute Node
Pass the variables in the input object.

```typescript
const result = await engine.executeNode(node, {
  template: "Welcome, {{name}}!", // Overrides static data
  variables: {
    name: "User"
  }
});
// result: { prompt: "Welcome, User!" }
```

## 3. Handle Missing Variables
If a variable is missing, the placeholder remains.

```typescript
// input: { template: "Hi {{name}}", variables: {} }
// output: { prompt: "Hi {{name}}" }
```
