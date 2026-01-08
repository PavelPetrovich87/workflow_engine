# Research: Prompt Template Node

**Feature**: Prompt Template Node (`002-prompt-template`)
**Status**: Phase 0 Complete

## Technical Decisions

### Template Engine Strategy
**Decision**: Use Native TypeScript Regular Expressions.
**Rationale**:
- **Core Principle: Dependency Discipline**. The constitution explicitly states dependencies should be minimized.
- **Simplicity**: The requirement is simple variable substitution (`{{key}}`). Full logic (loops, conditionals) is not required by the current spec.
- **Performance**: Native regex is faster than overhead of parsing a template grammar for simple substitution.

**Alternatives Considered**:
- **Handlebars/Mustache**: rejected due to extra dependency weight for a simple requirement.
- **ES6 Template Literals**: rejected because `template` comes from runtime string input, not code, so we can't use built-in backticks without `eval` (security risk).

### Implementation Details
- Regex Pattern: `/\{\{\s*([^}]+?)\s*\}\}/g`
  - Handles `{{key}}`, `{{ key }}`, `{{  key  }}`.
- Missing Keys:
  - Spec Requirement: Leave placeholder intact.
  - Regex replace callback logic will check if key exists in `variables`. If not, return full match.

## Unknowns Resolved
- **Testing Approach**: No test runner found in `package.json`. Will use a standalone verification script (`scripts/verify-prompt-template.ts`) run via `npx tsx` (or `node` + `tsc`).
