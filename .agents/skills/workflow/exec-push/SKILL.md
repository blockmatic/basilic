---
name: exec-push
description: Execute plan or instructions, validate, commit, push, and create a PR. Use when the user types /exec-push.
disable-model-invocation: true
---

Execute plan or instructions, validate, commit, push, and create a PR. Use when implementing features, resolving feedback, or pre-push verification. Use global git user for commits—never cursor/system identity. Never use `--trailer` for Co-authored-by or similar.

1. **Branch**: If on `main`, run `git pull origin main`, then create a new branch (`git checkout -b <branch-name>`). Skip if already on a branch.
2. **Execute**: Implement the plan/instructions—follow `.cursor/rules`, `apps/docu/content/docs/` topic MDX, and relevant skills
3. **Docs**: If behavior, commands, or conventions changed, update matching MDX and nearest README in the same change
4. **Validate**: Run `pnpm qa` and resolve any failures
5. **Commit**: Follow steps in @.agents/skills/workflow/git-commit/SKILL.md
6. **Push**: `git push`
7. **Pull Request**: If a PR does not already exist for your branch, open a new PR without a description. Skip if a PR already exists for this branch.
