---
description: Create or update the feature specification from a natural language feature description.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

The text the user typed after `/speckit.specify` in the triggering message **is** the feature description. Assume you always have it available in this conversation even if `{{args}}` appears literally below. Do not ask the user to repeat it unless they provided an empty command.

Given that feature description, do this:

1. **Generate a concise short name** (2-4 words) for the branch:
   - Analyze the feature description and extract the most meaningful keywords
   - Create a 2-4 word short name that captures the essence of the feature
   - Use action-noun format (e.g., "add-user-auth", "fix-payment-bug")
   - Preserve technical terms and acronyms (OAuth2, API, JWT, etc.)
   - Examples: "user-auth", "oauth2-api-integration", "fix-payment-timeout"

2. **Check for existing branches before creating new one**:
   a. Fetch all remote branches to ensure we have the latest information:
      ```bash
      git fetch --all --prune
      ```
   b. Find the highest feature number across all sources for the short-name:
      - Remote branches: `git ls-remote --heads origin | grep -E 'refs/heads/[0-9]+-<short-name>$'`
      - Local branches: `git branch | grep -E '^[* ]*[0-9]+-<short-name>$'`
      - Specs directories: Check for directories matching `specs/[0-9]+-<short-name>`

   c. Determine the next available number:
      - Extract all numbers from all three sources, find the highest number N, use N+1.

   d. Run `.specify/scripts/bash/create-new-feature.sh --json "{{args}}"` with the calculated number and short-name:
      - Pass `--number N+1` and `--short-name "your-short-name"` along with the feature description
      - Example: `.specify/scripts/bash/create-new-feature.sh --json "{{args}}" --number 5 --short-name "user-auth" "Add user authentication"`

   **IMPORTANT**:
   - Check all three sources (remote, local, specs)
   - Only match branches/directories with the exact short-name pattern
   - If no existing branches found, start with number 1
   - Run this script once per feature
   - The JSON output contains BRANCH_NAME and SPEC_FILE paths
   - For single quotes in args use escape syntax: 'I'\\''m Groot'

3. Load `.specify/templates/spec-template.md` to understand required sections.

4. Follow this execution flow:
    1. Parse user description from Input. If empty: ERROR "No feature description provided"
    2. Extract key concepts: actors, actions, data, constraints
    3. For unclear aspects:
       - Make informed guesses based on context and industry standards
       - Only mark with [NEEDS CLARIFICATION: specific question] if: choice significantly impacts scope/UX/security OR multiple reasonable interpretations exist OR no reasonable default exists.
       - **LIMIT: Max 3 [NEEDS CLARIFICATION] markers** (Scope > Security > UX > Technical)
    4. Fill User Scenarios & Testing. If no clear user flow: ERROR "Cannot determine user scenarios"
    5. Generate Functional Requirements (testable). Use reasonable defaults for unspecified details (document assumptions)
    6. Define Success Criteria: measurable, technology-agnostic outcomes. Verifiable without implementation details.
    7. Identify Key Entities (if data involved)
    8. Return: SUCCESS (spec ready for planning)

5. Write the specification to SPEC_FILE using the template structure, replacing placeholders with concrete details.

6. **Specification Quality Validation**: Validate it against quality criteria:

   a. **Create Spec Quality Checklist**: Generate a checklist file at `FEATURE_DIR/checklists/requirements.md`:

      ```markdown
      # Specification Quality Checklist: [FEATURE NAME]
      
      **Purpose**: Validate specification completeness and quality
      **Created**: [DATE]
      **Feature**: [Link to spec.md]
      
      ## Content Quality
      - [ ] No implementation details (languages, frameworks, APIs)
      - [ ] Focused on user value and business needs
      - [ ] Written for non-technical stakeholders
      - [ ] All mandatory sections completed
      
      ## Requirement Completeness
      - [ ] No [NEEDS CLARIFICATION] markers remain
      - [ ] Requirements are testable and unambiguous
      - [ ] Success criteria are measurable and technology-agnostic
      - [ ] All acceptance scenarios are defined
      - [ ] Edge cases are identified
      - [ ] Scope clearly bounded; Dependencies/assumptions identified
      
      ## Feature Readiness
      - [ ] All functional requirements have clear acceptance criteria
      - [ ] User scenarios cover primary flows
      - [ ] Feature meets measurable outcomes defined in Success Criteria
      - [ ] No implementation details leak into specification
      
      ## Notes
      - Items marked incomplete require spec updates before `/speckit.clarify` or `/speckit.plan`
      ```

   b. **Run Validation Check**: Review the spec against each checklist item. Document issues.

   c. **Handle Validation Results**:
      - **If all items pass**: Mark checklist complete and proceed to step 7.
      - **If items fail (excluding [NEEDS CLARIFICATION])**:
        1. List failing items and specific issues.
        2. Update the spec to address each issue.
        3. Re-run validation until all pass (max 3 iterations).
        4. If still failing, document issues in checklist notes and warn user.

      - **If [NEEDS CLARIFICATION] markers remain**:
        1. Extract all markers.
        2. **LIMIT**: If > 3 markers, keep only the 3 most critical.
        3. For each clarification (max 3), present options:

           ```markdown
           ## Question [N]: [Topic]
           **Context**: [Quote relevant spec section]
           **What we need to know**: [Specific question]
           
           **Suggested Answers**:
           | Option | Answer | Implications |
           |--------|--------|--------------|
           | A      | [Answer 1] | [Implications] |
           | B      | [Answer 2] | [Implications] |
           | Custom | Your answer | [How to provide custom input] |
           
           **Your choice**: _[Wait for user response]_
           ```

        4. **CRITICAL**: Ensure markdown tables are properly formatted.
        5. Number questions sequentially (Q1, Q2, Q3).
        6. Present all questions before waiting.
        7. Wait for choices (e.g., "Q1: A, Q2: Custom").
        8. Update spec with answers and re-run validation.

   d. **Update Checklist**: Update the checklist file with current status.

7. Report completion with branch name, spec file path, checklist results, and readiness.

**NOTE:** The script creates and checks out the new branch and initializes the spec file.

## Quick Guidelines

- Focus on **WHAT** users need and **WHY**.
- Avoid HOW to implement (no tech stack, APIs).
- Written for business stakeholders.
- DO NOT create any checklists embedded in the spec.
- **Mandatory sections**: Must be completed for every feature.
- **Optional sections**: Include only when relevant. Remove if N/A.

### For AI Generation
When creating this spec:
1. **Make informed guesses**: Use context, industry standards.
2. **Document assumptions**: Record reasonable defaults.
3. **Limit clarifications**: Max 3 [NEEDS CLARIFICATION] markers (Scope > Security > UX > Technical).
4. **Think like a tester**: Vague requirements fail "testable and unambiguous".
5. **Common clarifications**: Feature scope, User types, Security/compliance.

**Reasonable defaults**: Data retention (Standard), Performance (Standard), Error handling (User-friendly), Auth (Standard), Integration (RESTful).

### Success Criteria Guidelines
Success criteria must be:
1. **Measurable**: Specific metrics.
2. **Technology-agnostic**: No frameworks/tools.
3. **User-focused**: Outcomes from user/business perspective.
4. **Verifiable**: Testable without implementation details.

**Good examples**:
- "Users can complete checkout in under 3 minutes"
- "System supports 10,000 concurrent users"
- "95% of searches return results in under 1 second"
- "Task completion rate improves by 40%"

**Bad examples**:
- "API response time is under 200ms"
- "Database can handle 1000 TPS"
- "React components render efficiently"
- "Redis cache hit rate above 80%"