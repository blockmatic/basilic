---
name: b-coderabbit
description: Fetch CodeRabbit review comments for current PR, analyze all issues, apply fixes automatically, and commit changes. Use when the user types /b-coderabbit.
disable-model-invocation: true
---

## Purpose

Fetch CodeRabbit review comments for current PR, analyze all issues, apply fixes automatically, and commit changes. Integrates CodeRabbit's AI code review directly into workflow.

## Steps

1. **Identify PR context**: Get current branch name, determine associated GitHub PR (if exists), if no PR exists check for uncommitted changes to review
2. **Fetch CodeRabbit review**: Use CodeRabbit MCP to fetch review comments for PR, if no PR exists create review context from current changes, group comments by file/severity (critical/high/medium/low)
3. **Analyze and prioritize**: Review each CodeRabbit comment for context/reasoning, categorize issues (bugs/security/performance/style/documentation), prioritize critical/high-severity issues first, note issues requiring clarification or cannot be auto-fixed
4. **Apply fixes**: Fix issues file by file starting with highest priority, follow project coding standards/rules (see `.cursor/rules/`), ensure fixes address root cause not symptoms, run linting after each significant change: `pnpm lint:fix`, verify fixes don't introduce new issues
5. **Verify changes**: Run linting: `pnpm lint` (skip if only markdown files changed), check for compilation errors, ensure tests still pass (if applicable), review diff to confirm all issues addressed
6. **Commit fixes**: Stage all fixed files, create commit with descriptive message: `fix: address CodeRabbit review comments`, include summary of fixes applied, reference specific issues if helpful

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
