---
name: workflow
description: Basilic workflow dispatcher and catalog. Use when the user types /workflow or /<playbook>.
disable-model-invocation: true
---

# Basilic workflows

With no argument, list the shortcuts below and stop. Do not start a lifecycle or execute all playbooks.

For `/workflow <token>`, resolve a shortcut below or a full name from the index, read that child SKILL.md, and follow it. Preserve the remaining request as its task context. Unknown token: show the index and stop; never guess a publishing command.

Direct `/<name>` loads the same child. FIRST `/f-*` owns durable decisions and remains a separate catalog. Install with `pnpm dlx skills@latest add blockmatic/first` ([reviewed revision](https://github.com/blockmatic/first/tree/d67d26c59c5501c4f6b8518d8543c0721e98f10d)). Do not fork that tree here. Use the repository's FIRST load order when that boundary is relevant.

## Shortcuts

| Invocation | Playbook |
|---|---|
| `/workflow plan` | [plan-feature](plan-feature/SKILL.md) |
| `/workflow build` | [build](build/SKILL.md) |
| `/workflow review` | [code-review](code-review/SKILL.md) |
| `/workflow debug` | [debug-issue](debug-issue/SKILL.md) |
| `/workflow test` | [run-all-tests-and-fix](run-all-tests-and-fix/SKILL.md) |
| `/workflow commit` | [git-commit](git-commit/SKILL.md) |
| `/workflow push` | [git-push](git-push/SKILL.md) |
| `/workflow pr` | [git-create-pr](git-create-pr/SKILL.md) |
| `/workflow retro` | [retro](retro/SKILL.md) |
| `/workflow ui` | [use-frontend](use-frontend/SKILL.md) |

`build` ends at verified local changes. `commit`, `push`, `pr`, and `exec-push` request their named Git actions; none requests merging or deploying. Use `/git-push` to publish an already-committed branch; `/fix-push` after fixing a failed push; `/exec-push` only when the user asked for implement through a described PR.

## Full index

- [/add-documentation](add-documentation/SKILL.md)
- [/add-error-handling](add-error-handling/SKILL.md)
- [/audit-accessibility](audit-accessibility/SKILL.md)
- [/build](build/SKILL.md)
- [/clarify-task](clarify-task/SKILL.md)
- [/code-review](code-review/SKILL.md)
- [/coderabbit](coderabbit/SKILL.md)
- [/council](council/SKILL.md)
- [/debug-browser](debug-browser/SKILL.md)
- [/debug-issue](debug-issue/SKILL.md)
- [/deslop](deslop/SKILL.md)
- [/diagrams](diagrams/SKILL.md)
- [/docker-logs](docker-logs/SKILL.md)
- [/exec-push](exec-push/SKILL.md)
- [/fix-compile-errors](fix-compile-errors/SKILL.md)
- [/fix-git-issues](fix-git-issues/SKILL.md)
- [/fix-github-actions](fix-github-actions/SKILL.md)
- [/fix-push](fix-push/SKILL.md)
- [/fix-vercel-build](fix-vercel-build/SKILL.md)
- [/generate-api-docs](generate-api-docs/SKILL.md)
- [/generate-pr-description](generate-pr-description/SKILL.md)
- [/git-commit](git-commit/SKILL.md)
- [/git-create-pr](git-create-pr/SKILL.md)
- [/git-pr-comments](git-pr-comments/SKILL.md)
- [/git-push](git-push/SKILL.md)
- [/info-architecture](info-architecture/SKILL.md)
- [/light-review-existing-diffs](light-review-existing-diffs/SKILL.md)
- [/lint-fix](lint-fix/SKILL.md)
- [/lint-suite](lint-suite/SKILL.md)
- [/nextjs-form](nextjs-form/SKILL.md)
- [/onboard-new-developer](onboard-new-developer/SKILL.md)
- [/optimize-performance](optimize-performance/SKILL.md)
- [/overview](overview/SKILL.md)
- [/plan-architecture](plan-architecture/SKILL.md)
- [/plan-feature](plan-feature/SKILL.md)
- [/refactor-code](refactor-code/SKILL.md)
- [/release-review](release-review/SKILL.md)
- [/retro](retro/SKILL.md)
- [/review-plan](review-plan/SKILL.md)
- [/roadmap](roadmap/SKILL.md)
- [/run-all-tests-and-fix](run-all-tests-and-fix/SKILL.md)
- [/security-audit](security-audit/SKILL.md)
- [/security-review](security-review/SKILL.md)
- [/use-frontend](use-frontend/SKILL.md)
- [/use-shadcn](use-shadcn/SKILL.md)
- [/use-tdd](use-tdd/SKILL.md)
- [/use-v0](use-v0/SKILL.md)
- [/visualize](visualize/SKILL.md)
- [/write-api-test](write-api-test/SKILL.md)
- [/write-unit-tests](write-unit-tests/SKILL.md)
- [/yolo](yolo/SKILL.md)

## Authoring

For skill changes, read [the authoring pattern](references/authoring.md). For delivery evidence, read [completion evidence](references/completion.md). Both ship inside this installable tree.
