---
name: retro
description: After finishing work, answer "anything you would do better in retrospect ?" Use when the user types /retro.
disable-model-invocation: true
---

Answer this question about the work just completed (this session, the last plan, or the diff in context):

anything you would do better in retrospect ?

Reply in chat only—never create files unless the user asks to apply a change.

1. **Scope**: The work that just shipped or the plan just executed—not a career retrospective, not a generic process lecture
2. **Be specific**: Name files, APIs, grep patterns, leftover folders, APIs you taught vs what the app still calls. Skip items that were the right call
3. **Actionable**: Each item implies a different next action (rewrite, delete, document, don't migrate). If you would not change it, omit it
4. **Honest**: Include mistakes (broken snippets, substring grep, hunting dirs that were already gone)
5. **Short**: A few bullets. No preamble. Do not offer to implement unless asked
