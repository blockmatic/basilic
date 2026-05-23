# `audit` verb · what fired and why

## Input

A 148-line `index.html` with inline CSS — a generic AI-shaped landing page for a fictional product called "Nexus." Hits at least 14 anti-patterns from `references/anti-patterns.md`.

## What `audit` does (and what it doesn't)

- **Reads the file.** No edits. No new files. The verb is read-only.
- **Scores against `anti-patterns.md` + the slop test gates** in `SKILL.md`.
- **Returns one Markdown report** with: tell name · file path + line range · severity · one-line fix.
- **Groups by severity** (critical / major / minor) and ends with a count.

## What loaded

- `references/anti-patterns.md` (the full named-tell library)
- `references/structure.md` (for the structural-fingerprint check, gate 9)
- `references/microinteractions.md` (for the timing/easing canon, gates 11–18)
- `SKILL.md` § The slop test (gates 1–38)

## Why this matters as a verb test

`audit` is the verb that **doesn't change anything**. It's the safety verb — the one a user runs before they ask for `refine` or `redesign`. The output gives the user enough information to decide which way to take the page.

In this case the audit returns "do not run `refine` — the structural fingerprint is the problem; run `redesign` instead." That is the ideal output: a verb that helps the user pick *another* verb.

## Durable artifact

`audit-report.md` — the kind of output Hallmark produces in a real session. It can be saved to a PR, pasted into a Linear ticket, or used as the brief for the follow-up `redesign` run.
