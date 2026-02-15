Execute plan or instructions, validate, commit, push, and create a PR. Use when implementing features, resolving feedback, or pre-push verification. Use global git user for commits—never cursor/system identity. Never use `--trailer` for Co-authored-by or similar.

1. **Branch**: If on `main`, run `git pull origin main`, then create a new branch (`git checkout -b <branch-name>`). Skip if already on a branch.
2. **Execute**: Implement the plan/instructions—follow @.cursor/rules, general guidelines, indexed docs, and relevant skills
3. **Validate**: Run `pnpm qa` and resolve any failures
4. **Commit**: Follow steps in @.cursor/commands/git-commit.md
5. **Push**: `git push`
6. **Pull Request**: If a PR does not already exist for your branch, open a new PR without a description. Skip if a PR already exists for this branch.
