---
name: fix-github-actions
description: Retrieve GitHub Actions workflow logs for the current branch PR, analyze failures, and fix CI/CD errors. Use when the user types /fix-github-actions.
disable-model-invocation: true
---

Retrieve GitHub Actions workflow logs for the current branch PR, analyze failures, and fix CI/CD errors. Use **`gh`**, never GitHub MCP for Actions.

1. **Get current branch**: `git branch --show-current`; confirm pushed (`git status -sb`); `gh pr view` or `gh pr list --head "$(git branch --show-current)"`
2. **Retrieve Actions logs**: `gh pr checks`; `gh run list --branch "$(git branch --show-current)" --limit 10`; failed run → `gh run view <id> --log-failed`; artifacts → `gh run download <id>`
3. **Analyze errors**: Parse logs for test failures, lint errors, build errors, missing dependencies, environment variables, configuration issues, timeout errors
4. **Fix issues**: Read affected files, apply fixes per project rules (TypeScript, ESLint, Biome), resolve test failures, fix build errors, add missing dependencies, update config files, address timeout issues, commit changes
5. **Verify**: Push if needed; `gh pr checks` or `gh run watch <id>` for the relevant workflow — do not block every push with watch (validation only)
