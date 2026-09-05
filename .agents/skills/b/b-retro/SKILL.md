---
name: b-retro
description: After finishing work, answer "anything you would do better in retrospect ?" Use when the user types /b-retro.
disable-model-invocation: true
---

## Purpose and inputs

Answer this question about the work just completed (this session, the last plan, or the diff in context):

anything you would do better in retrospect ?

Reply in chat only—never create files unless the user asks to apply a change. This is not a delivery-evidence report.

## Steps

1. **Scope**: The work that just shipped or the plan just executed—not a career retrospective, not a generic process lecture
2. **Be specific**: Name files, APIs, grep patterns, leftover folders, APIs you taught vs what the app still calls. Skip items that were the right call
3. **Actionable**: Each item implies a different next action (rewrite, delete, document, don't migrate). If you would not change it, omit it
4. **Honest**: Include mistakes (broken snippets, substring grep, hunting dirs that were already gone)
5. **Short**: A few bullets. Do not offer to implement unless asked

## Verification

- [ ] Reply is chat-only unless the user asked to apply a change.
- [ ] Items are scoped to this work, not a generic process lecture.
- [ ] No delivery-evidence claim and no unsolicited follow-up work.

## Handoff

Chat bullets only. Do not claim checks passed. Do not start follow-up work unless asked.
