---
name: optimize-performance
description: Measure bottlenecks with repository tools, then recommend or apply evidenced optimizations. Use when the user types /optimize-performance.
disable-model-invocation: true
---

## Purpose and inputs

Find performance issues with a measured baseline. Quality budgets live in `/f-quality`. Do not invent SLOs or impact percentages. Report-only unless the user asked to implement.

## Steps

1. Read Quality overlay budgets if present. Capture a baseline with the repo profiler, traces, tests, or `gh` job timing — not estimates.
2. Locate the owning hot path (query, render, allocation) with that evidence.
3. Recommend the smallest change. Implement only when authorized. Re-measure after a change.
4. If a new budget is required, defer to `/f-quality`.

## Verification

- [ ] Recommendations cite a baseline measurement or an explicit "not measured" label.
- [ ] No fabricated timings or percentages.
- [ ] No unsolicited commit.

## Handoff

Report baseline, suspected cause, and proposed change. Say when measurement is still missing.
