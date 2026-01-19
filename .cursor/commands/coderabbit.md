# CodeRabbit Review and Fix

## Overview
Fetch CodeRabbit review comments for current PR, analyze all issues, apply fixes automatically, and commit changes. Integrates CodeRabbit's AI code review directly into workflow.

## Steps
1. **Identify PR context**: Get current branch name, determine associated GitHub PR (if exists), if no PR exists check for uncommitted changes to review
2. **Fetch CodeRabbit review**: Use CodeRabbit MCP to fetch review comments for PR, if no PR exists create review context from current changes, group comments by file/severity (critical/high/medium/low)
3. **Analyze and prioritize**: Review each CodeRabbit comment for context/reasoning, categorize issues (bugs/security/performance/style/documentation), prioritize critical/high-severity issues first, note issues requiring clarification or cannot be auto-fixed
4. **Apply fixes**: Fix issues file by file starting with highest priority, follow project coding standards/rules (see `.cursor/rules/`), ensure fixes address root cause not symptoms, run linting after each significant change: `pnpm lint:fix`, verify fixes don't introduce new issues
5. **Verify changes**: Run linting: `pnpm lint` (skip if only markdown files changed), check for compilation errors, ensure tests still pass (if applicable), review diff to confirm all issues addressed
6. **Commit fixes**: Stage all fixed files, create commit with descriptive message: `fix: address CodeRabbit review comments`, include summary of fixes applied, reference specific issues if helpful

## CodeRabbit Integration
**MCP Usage**: Use `fetch_mcp_resource` or MCP tools from `coderabbit` server to get review comments, parse review comments to extract file paths/line numbers, issue type/severity, suggested fixes/explanations, related code context

**Fix Strategy**: **Security issues** - Fix immediately verify no vulnerabilities remain, **Bugs** - Fix root cause add tests if missing, **Performance** - Optimize while maintaining readability, **Style/Quality** - Apply fixes following project standards, **Documentation** - Update docs/comments as needed

## Checklist
- [ ] Current branch/PR identified
- [ ] CodeRabbit review comments fetched via MCP
- [ ] All issues analyzed and categorized
- [ ] Critical and high-severity issues fixed first
- [ ] Code follows project standards and rules
- [ ] Linting passes: `pnpm lint` (skip if only markdown files changed)
- [ ] No compilation errors introduced
- [ ] Tests pass (if applicable)
- [ ] All fixes committed with descriptive message
- [ ] Commit message references CodeRabbit review

## Notes
- If CodeRabbit MCP unavailable, fall back to manual review process
- Some issues may require discussion - document for follow-up
- Always respect project rules/conventions when applying fixes
- Skip linting/build/test for markdown-only changes

## Related
- @.cursor/commands/code-review.md - Manual code review process
- @.cursor/commands/address-github-pr-comments.md - Process PR feedback
- @.cursor/commands/lint-fix.md - Fix linting issues
