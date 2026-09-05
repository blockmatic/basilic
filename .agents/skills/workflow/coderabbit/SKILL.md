---
name: coderabbit
description: Fetch CodeRabbit review comments, apply authorized fixes, and stop at local verification. Use when the user types /coderabbit.
disable-model-invocation: true
---

## Purpose and inputs

Fetch CodeRabbit comments for the current PR or uncommitted diff. Apply high-confidence fixes. Do not commit; use [git-commit](../git-commit/SKILL.md) only when the user asked to publish.

## Steps

1. Identify the branch and PR with `gh`. If there is no PR, review the current task diff.
2. Fetch CodeRabbit comments via the available CodeRabbit MCP. Group by file and severity.
3. Fix root causes starting with critical/high. Follow repository rules. Run the repo lint/type/test commands that match the change.
4. Leave style-only or unclear items as a list. Do not invent security or quality bars.

## Verification

- [ ] Fixes address named comments with file evidence.
- [ ] Affected checks were run.
- [ ] No commit was created unless the user asked for `/git-commit`.

## Handoff

Summarize applied fixes, skipped items, and remaining comments. Point at `/git-commit` if the user wants to publish.
