---
name: workflow
description: Basilic slash playbooks (plan, git, review, debug). Nested under this folder. Use when the user types /workflow or a playbook name such as /exec-push or /git-commit.
disable-model-invocation: true
---

Playbooks are sibling folders (`<name>/SKILL.md`). Cursor loads them as `/<name>`. Claude Code: read `./<name>/SKILL.md` for the named playbook.
