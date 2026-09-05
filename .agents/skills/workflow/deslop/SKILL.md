---
name: deslop
description: Check diff against main and remove all AI generated code slop introduced in this branch. Use when the user types /deslop.
disable-model-invocation: true
---

## Purpose

Check diff against main and remove all AI generated code slop introduced in this branch.

## Steps

1. **Check diff**: Check diff against main to see what was introduced in this branch
2. **Identify slop**: Identify AI-generated slop (extra comments that a human wouldn't add or is inconsistent with the rest of the file, extra defensive checks or try/catch blocks that are abnormal for that area of the codebase especially if called by trusted/validated codepaths, casts to any to get around type issues, any other style that is inconsistent with the file)
3. **Remove slop**: Remove all identified AI-generated slop
4. **Report**: First report completion evidence from [completion.md](../references/completion.md) (relevant rows and a status reason). Then a 1–3 sentence summary of changes

## Completion

Lead with [completion evidence](../references/completion.md), then the short summary.
