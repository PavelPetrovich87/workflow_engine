import { nodeRegistry } from './src/core/engine/Registry';

async function verify() {
  console.log('🔍 Verifying llm-extract...');
  
  const strategy = nodeRegistry.getStrategy('llm-extract');
  if (!strategy) {
    throw new Error('❌ Strategy not found in registry');
  }
  console.log('✅ Strategy found');

  // Test Case 1: Valid Input
  console.log('\n🧪 Test Case 1: Valid Input');
  const validSchema = {
    type: "object",
    properties: {
      name: { type: "string" },
      date: { type: "string" }
    },
    required: ["name"]
  };

  const validNode = {
    id: 'test-1',
    type: 'llm-extract',
    position: { x: 0, y: 0 },
    data: {},
    config: { apiKey: 'test-key' }
  };

  const validInput = {
    text: "My name is Alice and today is 2024-01-01.",
    schema: validSchema
  };
  
  const context = { env: { GEMINI_API_KEY: 'test' } }; // Mock context

  try {
    const result = await strategy.execute(validNode, validInput, context);
    console.log('Result:', result);
    // Since we mock the result in the strategy for now (as per implementation), we expect valid JSON
    if (result.name === "Extracted Name") {
      console.log('✅ Valid input handled correctly (Mock Result)');
    } else {
      console.error('❌ Unexpected result');
    }
  } catch (err) {
    console.error('❌ Failed Valid Input:', err);
  }

  // Test Case 2: Invalid Schema (Input)
  console.log('\n🧪 Test Case 2: Invalid Schema Config');
  try {
    await strategy.execute(validNode, { text: "foo", schema: { type: "INVALID_TYPE" } }, context);
    console.error('❌ Should have thrown error for invalid schema');
  } catch (err: any) {
    if (err.message.includes('Invalid JSON Schema')) {
      console.log('✅ Caught Invalid Schema error:', err.message);
    } else {
      console.error('❌ Caught unexpected error:', err);
    }
  }

  // Test Case 3: Missing Text
  console.log('\n🧪 Test Case 3: Missing Text');
  try {
    await strategy.execute(validNode, { schema: validSchema }, context);
    console.error('❌ Should have thrown error for missing text');
  } catch (err: any) {
    if (err.message.includes('Missing "text"')) {
      console.log('✅ Caught Missing Text error:', err.message);
    } else {
      console.error('❌ Caught unexpected error:', err);
    }
  }
}

verify().catch(console.error);
