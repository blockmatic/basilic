---
name: fix-github-actions
description: Retrieve GitHub Actions workflow logs for the current branch PR, analyze failures, and fix CI/CD errors. Use when the user types /fix-github-actions.
disable-model-invocation: true
---

Retrieve GitHub Actions workflow logs for the current branch PR, analyze failures, and fix CI/CD errors. MUST use GitHub MCP tools to access Actions logs.

1. **Get current branch**: Identify current branch name, verify it's pushed to remote, check if PR exists
2. **Retrieve Actions logs**: Use GitHub MCP tools to get workflow runs for current branch, fetch failed job logs, identify which workflows/jobs failed
3. **Analyze errors**: Parse logs for test failures, lint errors, build errors, missing dependencies, environment variables, configuration issues, timeout errors
4. **Fix issues**: Read affected files, apply fixes per project rules (TypeScript, ESLint, Biome), resolve test failures, fix build errors, add missing dependencies, update config files, address timeout issues, commit changes

