---
name: b-roadmap
description: Analyze codebase and generate visual roadmap of potential features and improvements. Use when the user types /b-roadmap.
disable-model-invocation: true
---

## Purpose

Analyze codebase and generate visual roadmap of potential features and improvements. Track progress with todos.

## Steps

1. **Scan codebase**: Scan codebase architecture, patterns, conventions, look for opportunities (missing common patterns, performance optimization opportunities, developer experience improvements, user-facing feature enhancements, code quality/refactoring candidates)
2. **Identify opportunities**: Identify feature gaps and improvement opportunities
3. **Create timeline diagram**: Create phased overview showing features by effort level (Quick Wins, Medium Effort, Strategic)
4. **Create current vs proposed flowchart**: Show integration points (solid borders for existing features, dashed orange borders for proposed features)
5. **Ask user**: Ask "Would you like me to create a plan for any of these features?" (plans follow @.cursor/rules/base/general.mdc: References, assumptions, deferrals)
6. **Output**: Render directly in chat (don't write files) - brief assessment of current codebase state, prioritized feature list (5-8 items with rationale), timeline diagram, current vs proposed flowchart

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
