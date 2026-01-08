# Tasks: Structured Extractor (llm-extract)

## Phase 1: Dependencies & Setup
- [ ] Install `ajv` dependency <!-- id: 10 -->
    - Run `npm install ajv`
    - Verify `package.json`

## Phase 2: Implementation
- [ ] Implement `LlmExtractStrategy` <!-- id: 20 -->
    - Create `src/core/engine/ai/LlmExtractStrategy.ts`
    - Implement `getConfig`, `getApiKey` (inheritance)
    - Implement `execute` with `ajv` validation
- [ ] Register Strategy <!-- id: 30 -->
    - Update `src/core/engine/Registry.ts` to include `llm-extract`

## Phase 3: Verification
- [ ] Create verification script <!-- id: 40 -->
    - Create `scripts/verify-llm-extract.ts` (or similar)
    - Test valid extraction
    - Test invalid schema error
    - Test invalid output error
- [ ] Run verification <!-- id: 50 -->
- [ ] Update walkthrough <!-- id: 60 -->
