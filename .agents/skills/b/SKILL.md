---
name: b
description: Basilic workflow dispatcher and catalog. Use when the user types /b or /b-<playbook>.
disable-model-invocation: true
---

# Basilic workflows

With no argument, list the shortcuts below and stop. Do not start a lifecycle or execute all playbooks.

For `/b <token>`, resolve a shortcut below or a full name from the index (with or without `b-`), read that child SKILL.md, and follow it. Preserve the remaining request as its task context. Unknown token: show the index and stop; never guess a publishing command.

Direct `/b-<name>` loads the same child. Names in an old conversation such as `/plan-feature` can be translated to `/b-plan-feature`; they are not separate installed aliases. FIRST `/f-*` owns durable decisions and remains a separate catalog. Install with `pnpm dlx skills@latest add blockmatic/first` ([reviewed revision](https://github.com/blockmatic/first/tree/d67d26c59c5501c4f6b8518d8543c0721e98f10d)). Do not fork that tree here. Use the repository's FIRST load order when that boundary is relevant.

## Shortcuts

| Invocation | Playbook |
|---|---|
| `/b plan` | [b-plan-feature](b-plan-feature/SKILL.md) |
| `/b build` | [b-build](b-build/SKILL.md) |
| `/b review` | [b-code-review](b-code-review/SKILL.md) |
| `/b debug` | [b-debug-issue](b-debug-issue/SKILL.md) |
| `/b test` | [b-run-all-tests-and-fix](b-run-all-tests-and-fix/SKILL.md) |
| `/b commit` | [b-git-commit](b-git-commit/SKILL.md) |
| `/b push` | [b-git-push](b-git-push/SKILL.md) |
| `/b pr` | [b-git-create-pr](b-git-create-pr/SKILL.md) |
| `/b retro` | [b-retro](b-retro/SKILL.md) |

`build` ends at verified local changes. `commit`, `push`, `pr`, and `exec-push` request their named Git actions; none requests merging or deploying.

## Full index

- [/b-add-documentation](b-add-documentation/SKILL.md)
- [/b-add-error-handling](b-add-error-handling/SKILL.md)
- [/b-audit-accessibility](b-audit-accessibility/SKILL.md)
- [/b-build](b-build/SKILL.md)
- [/b-clarify-task](b-clarify-task/SKILL.md)
- [/b-code-review](b-code-review/SKILL.md)
- [/b-coderabbit](b-coderabbit/SKILL.md)
- [/b-council](b-council/SKILL.md)
- [/b-debug-browser](b-debug-browser/SKILL.md)
- [/b-debug-issue](b-debug-issue/SKILL.md)
- [/b-deslop](b-deslop/SKILL.md)
- [/b-diagrams](b-diagrams/SKILL.md)
- [/b-docker-logs](b-docker-logs/SKILL.md)
- [/b-exec-push](b-exec-push/SKILL.md)
- [/b-fix-compile-errors](b-fix-compile-errors/SKILL.md)
- [/b-fix-git-issues](b-fix-git-issues/SKILL.md)
- [/b-fix-github-actions](b-fix-github-actions/SKILL.md)
- [/b-fix-push](b-fix-push/SKILL.md)
- [/b-fix-vercel-build](b-fix-vercel-build/SKILL.md)
- [/b-generate-api-docs](b-generate-api-docs/SKILL.md)
- [/b-generate-pr-description](b-generate-pr-description/SKILL.md)
- [/b-git-commit](b-git-commit/SKILL.md)
- [/b-git-create-pr](b-git-create-pr/SKILL.md)
- [/b-git-pr-comments](b-git-pr-comments/SKILL.md)
- [/b-git-push](b-git-push/SKILL.md)
- [/b-info-architecture](b-info-architecture/SKILL.md)
- [/b-light-review-existing-diffs](b-light-review-existing-diffs/SKILL.md)
- [/b-lint-fix](b-lint-fix/SKILL.md)
- [/b-lint-suite](b-lint-suite/SKILL.md)
- [/b-nextjs-form](b-nextjs-form/SKILL.md)
- [/b-onboard-new-developer](b-onboard-new-developer/SKILL.md)
- [/b-optimize-performance](b-optimize-performance/SKILL.md)
- [/b-overview](b-overview/SKILL.md)
- [/b-plan-architecture](b-plan-architecture/SKILL.md)
- [/b-plan-feature](b-plan-feature/SKILL.md)
- [/b-refactor-code](b-refactor-code/SKILL.md)
- [/b-release-review](b-release-review/SKILL.md)
- [/b-retro](b-retro/SKILL.md)
- [/b-review-plan](b-review-plan/SKILL.md)
- [/b-roadmap](b-roadmap/SKILL.md)
- [/b-run-all-tests-and-fix](b-run-all-tests-and-fix/SKILL.md)
- [/b-security-audit](b-security-audit/SKILL.md)
- [/b-security-review](b-security-review/SKILL.md)
- [/b-use-shadcn](b-use-shadcn/SKILL.md)
- [/b-use-tdd](b-use-tdd/SKILL.md)
- [/b-use-v0](b-use-v0/SKILL.md)
- [/b-visualize](b-visualize/SKILL.md)
- [/b-write-api-test](b-write-api-test/SKILL.md)
- [/b-write-unit-tests](b-write-unit-tests/SKILL.md)
- [/b-yolo](b-yolo/SKILL.md)

## Authoring

For skill changes, read [the authoring pattern](references/authoring.md). For delivery evidence, read [completion evidence](references/completion.md). Both ship inside this installable tree.
