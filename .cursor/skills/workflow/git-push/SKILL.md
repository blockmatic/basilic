---
name: git-push
description: Push current branch to origin and sync with remote updates, including all changes such as untracked files, after removing any debug instrumentations. Use when the user types /git-push.
disable-model-invocation: true
---

Push current branch to origin and sync with remote updates, including all changes such as untracked files, after removing any debug instrumentations. Never use `--no-verify`. Never use `--trailer` for Co-authored-by or similar. Fix all automated review errors and warnings before committing. Use the default global git user (`git config --global user.name`, `git config --global user.email`) for all commits—never cursor/system identity.

1. **Check changes**: Check diff `git diff --cached` (staged) or `git diff` (unstaged), understand what will be pushed
2. **Remove debug code**: Remove all debug instrumentations added before pushing
3. **Fix errors and warnings**: Resolve all lint, type-check, and test failures
4. **Stage and commit**: Stage changes with `git add -A`, create short commit per [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <short summary>`, type and scope lowercase, summary imperative mood ≤60 chars, no period. Scope by app (`next`, `fastify`, `docu`), package (`ui`, `core`, `utils`), or omit if general.
5. **Push**: `git push`

