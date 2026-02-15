---
title: Git Commit
description: Create short, focused commit message and commit staged changes
category: git
---

Create short, focused commit message and commit staged changes. Never use `--no-verify`. Never use `--trailer` for Co-authored-by or similar. Fix all automated review errors and warnings before committing. Use the default global git user (`git config --global user.name`, `git config --global user.email`) for all commits—never cursor/system identity.

1. **Review changes**: Check diff `git diff --cached` (staged) or `git diff` (unstaged), understand what changed and why
2. **Fix errors and warnings**: Resolve all lint, type-check, and test failures
3. **Stage changes (if not already staged)**: `git add -A`
4. **Create short commit message**: Follow [Conventional Commits](https://www.conventionalcommits.org/). Format: `<type>(<scope>): <short summary>` or `<issue-key>: <type>(<scope>): <short summary>`. Type and scope lowercase (e.g. `feat(fastify):`). Short summary lowercase, imperative mood (use "fix", "add", "update" not "fixed", "added", "updated"), <= 60 chars, no period. Scope by app (`next`, `fastify`, `docu`), package (`ui`, `core`, `utils`), or omit if general.
