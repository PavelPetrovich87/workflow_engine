# Quickstart: Extending BaseLlmStrategy

## 1. Import the Base Class

```typescript
import { BaseLlmStrategy } from '../ai/BaseLlmStrategy';
```

## 2. Implement your Strategy

```typescript
export class MyNewAiNode extends BaseLlmStrategy {
  async execute(node, input, context) {
      const apiKey = this.getApiKey(node, context);
      // Do AI stuff
      return { result: "Hello AI" };
  }
}
```

## 3. Register it

In `src/core/engine/Registry.ts`:

```typescript
this.register('my-new-ai-node', new MyNewAiNode());
```
