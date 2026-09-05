---
name: council
description: Based on the given area of interest, dig around the codebase to gather information, spawn multiple task agents for deeper exploration with variance, then use the collected information to accomplish. Use when the user types /council.
disable-model-invocation: true
---

Based on the given area of interest, dig around the codebase to gather information, spawn multiple task agents for deeper exploration with variance, then use the collected information to accomplish what the user wants.

1. **Gather information**: Dig around the codebase in terms of given area of interest, gather general information such as keywords and architecture overview
2. **Spawn task agents**: Spawn off n=10 (unless specified otherwise) task agents to dig deeper into the codebase, some should be out of the box for variance
3. **Use information**: Once the task agents are done, use the information to do what the user wants (if user is in plan mode, create the plan per @.cursor/rules/base/general.mdc: References, assumptions, deferrals)
4. **Persist**: If the user asked for a plan, keep it in the Cursor plan. If the finding changes product facts, patch the Product instance in `_first/FIRST.md` (Basilic: `_first/basilic/PRODUCT.md`). If it changes quality or workflow facts, patch the matching MDX or FIRST overlay. Not `__dev/` as Fact. Issues for later work go to GitHub Issues.
