---
name: web-design-guidelines-v1
description: Review UI code against Vercel Web Interface Guidelines. Use when asked to review UI, check accessibility, audit design, review UX, or check a site against web interface best practices.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Web Interface Guidelines

Review files for compliance with Vercel Web Interface Guidelines. Upstream skill: `web-design-guidelines` in [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills).

## Scope

- Applies to: UI code review for accessibility, focus, forms, motion, typography, images, performance, URL state, theming, touch, and i18n
- Does NOT cover: visual identity or palette invention (see [frontend-design-v1](../frontend-design-v1/SKILL.md)); Quality-owned WCAG levels; adding animation libraries

## Assumptions

- Latest rules live at the source URL below and may change independently of this catalog copy
- The consuming repository may already use URL query state, semantic tokens, and CSS motion

## Principles

- Fetch fresh guidelines before each review
- Report findings in the terse `file:line` format from the fetched document
- Prefer semantic HTML and existing tokens over new ARIA or one-off CSS

## Constraints

### MUST

- Fetch the guidelines URL before reviewing
- Output using the format specified in the fetched guidelines
- Leave WCAG A/AA/AAA unnamed unless the repository Quality overlay already names a level

### SHOULD

- Sync shareable UI state with the URL using the project's existing query-state library (nuqs when present)
- Honor `prefers-reduced-motion` with transform/opacity-only motion already in the stack
- Ask which files to review when none are specified

### AVOID

- Inventing a WCAG conformance claim
- Adding a new animation library to satisfy motion rules
- Treating this checklist as visual screenshot verification (that is a rendered pass, not this skill)

## Interactions

- Visual direction: [frontend-design-v1](../frontend-design-v1/SKILL.md)
- Component APIs: [composition-patterns-v1](../composition-patterns-v1/SKILL.md)
- Motion stack: [emilkowal-animations-v1](../emilkowal-animations-v1/SKILL.md), [motion-v13](../motion-v13/SKILL.md)

## How it works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:

1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.
