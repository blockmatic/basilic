# CodeRabbit Review and Fix

## Overview

Fetch CodeRabbit review comments for the current PR, analyze all issues, apply fixes automatically, and commit the changes. This command integrates CodeRabbit's AI code review directly into your workflow.

## Steps

1. **Identify the PR context**
   - Get the current branch name
   - Determine the associated GitHub PR (if exists)
   - If no PR exists, check if there are uncommitted changes to review

2. **Fetch CodeRabbit review**
   - Use CodeRabbit MCP to fetch review comments for the PR
   - If no PR exists, create a review context from current changes
   - Group comments by file and severity (critical, high, medium, low)

3. **Analyze and prioritize issues**
   - Review each CodeRabbit comment for context and reasoning
   - Categorize issues: bugs, security, performance, style, documentation
   - Prioritize critical and high-severity issues first
   - Note any issues that require clarification or cannot be auto-fixed

4. **Apply fixes**
   - Fix issues file by file, starting with highest priority
   - Follow project coding standards and rules (see `.cursor/rules/`)
   - Ensure fixes address the root cause, not just symptoms
   - Run linting after each significant change: `pnpm lint:fix`
   - Verify fixes don't introduce new issues

5. **Verify changes**
   - Run linting: `pnpm lint` (skip if only markdown files changed)
   - Check for compilation errors
   - Ensure tests still pass (if applicable)
   - Review the diff to confirm all issues are addressed

6. **Commit fixes**
   - Stage all fixed files
   - Create a commit with a descriptive message:
     - Format: `fix: address CodeRabbit review comments`
     - Include summary of fixes applied
     - Reference specific issues if helpful
   - Example: `fix: address CodeRabbit review - security fixes and code quality improvements`

## CodeRabbit Integration

### MCP Configuration

The CodeRabbit MCP server is configured in `.cursor/mcp.json`:

```json
{
  "coderabbit": {
    "command": "pnpm",
    "args": ["dlx", "coderabbitai-mcp@latest"],
    "env": {
      "GITHUB_PAT": "${GITHUB_TOKEN}"
    },
    "description": "Expose CodeRabbit PR review comments via MCP"
  }
}
```

**Important configuration details:**
- **Package**: `coderabbitai-mcp@latest` (not `@coderabbitai/mcp-server` - that package doesn't exist)
- **Environment variable**: Maps `GITHUB_TOKEN` to `GITHUB_PAT` (the package expects `GITHUB_PAT`)
- **Token scopes**: Requires `repo` scope for private repositories or `public_repo` for public repositories

### MCP Usage

- Use `fetch_mcp_resource` or MCP tools from `coderabbit` server to get review comments
- Parse review comments to extract:
  - File paths and line numbers
  - Issue type and severity
  - Suggested fixes or explanations
  - Related code context

### Troubleshooting MCP Connection

If CodeRabbit MCP fails to connect:

1. **Verify package name**: Ensure `.cursor/mcp.json` uses `coderabbitai-mcp@latest` (not `@coderabbitai/mcp-server`)
2. **Check environment variable**: Verify `GITHUB_TOKEN` is set globally: `echo $GITHUB_TOKEN`
3. **Test package manually**: Run `GITHUB_PAT="$GITHUB_TOKEN" pnpm dlx coderabbitai-mcp@latest --help` to verify it works
4. **Restart Cursor**: After fixing configuration, fully restart Cursor to reload MCP servers
5. **Check token scopes**: Ensure your GitHub token has the required scopes (`repo` or `public_repo`)

### Fix Strategy

- **Security issues**: Fix immediately, verify no vulnerabilities remain
- **Bugs**: Fix root cause, add tests if missing
- **Performance**: Optimize while maintaining readability
- **Style/Quality**: Apply fixes following project standards
- **Documentation**: Update docs/comments as needed

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

- If CodeRabbit MCP is unavailable, fall back to manual review process
- Some issues may require discussion - document these for follow-up
- Always respect project rules and conventions when applying fixes
- Skip linting/build/test for markdown-only changes

## Related Commands

- [Code Review](@.cursor/commands/code-review.md) - Manual code review process
- [Address GitHub PR Comments](@.cursor/commands/address-github-pr-comments.md) - Process PR feedback
- [Lint Fix](@.cursor/commands/lint-fix.md) - Fix linting issues
