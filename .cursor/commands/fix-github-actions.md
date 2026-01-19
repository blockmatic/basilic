# Fix GitHub Actions

## Overview
Retrieve GitHub Actions workflow logs for the current branch PR, analyze failures, and fix CI/CD errors. MUST use GitHub MCP tools to access Actions logs.

## Steps
1. **Get current branch**: Identify current branch name, verify it's pushed to remote, check if PR exists
2. **Retrieve Actions logs**: Use GitHub MCP tools to get workflow runs for current branch, fetch failed job logs, identify which workflows/jobs failed
3. **Analyze errors**: Parse logs for test failures, lint errors, build errors, missing dependencies, environment variables, configuration issues, timeout errors
4. **Fix issues**: Read affected files, apply fixes per project rules (TypeScript, ESLint, Biome), resolve test failures, fix build errors, add missing dependencies, update config files, address timeout issues

## Checklist
- [ ] Current branch identified and verified
- [ ] GitHub Actions logs retrieved from latest workflow runs
- [ ] Failed jobs and errors identified and categorized
- [ ] Root causes analyzed (tests, lint, build, deps, config, timeouts)
- [ ] Issues fixed per project rules and standards
- [ ] All CI/CD errors resolved
- [ ] Changes committed and ready for re-run
