---
name: use-frontend
description: Build or reshape UI with purpose, existing tokens, accessible interactions, and bounded rendered verification. Use when the user types /use-frontend.
disable-model-invocation: true
---

## Purpose and inputs

Build or reshape a user-facing surface. Planning a feature without UI work stays on `/plan-feature`. Installing a primitive stays on `/use-shadcn`. Do not write PRODUCT.md or DESIGN.md. Do not install animation libraries or design-detector hooks.

Load `frontend-design-v1` for visual direction, `composition-patterns-v1` for reusable APIs, and `web-design-guidelines-v1` for the UI code checklist. Product jobs belong to `/f-journeys` when the change is durable.

## Steps

1. **Purpose and audience.** Name the job, the person, and the surface mode: Operate (app/task), Persuade (marketing), or Read (docs). Durable jobs stay in the Journeys overlay; do not generate DESIGN.md.
2. **Visual references.** Use the brief, existing screens, or a stated aesthetic. If the repo has tokens and shared components, inspect those first. Tokens win over a greenfield palette (`frontend-design-v1` product-ui addendum).
3. **Reuse before invent.** Prefer shared primitives. Compose at the second call site. Do not extract a compound API for a one-off route. Do not lift server data into a client provider.
4. **Responsive and interaction.** Mobile-first layout, visible focus, keyboard path, `prefers-reduced-motion`. Do not add a new motion library.
5. **Harden states.** Loading, empty, error, success, and long/overflow content. Skip a full i18n/RTL program unless the repo already localizes.
6. **Implement** the smallest slice that completes the job.
7. **Rendered verification (bounded).** Inspect desktop and mobile together. Exercise primary interactions and keyboard navigation. Critique screenshots. Fix evidenced issues in one batch. Confirm with at most one more pass, then stop. If browser tools are missing, say so and use the closest substitute. A type check is not visual QA.
8. **Optional checklists.** `/audit-accessibility` for the Quality overlay (do not invent a WCAG level). `@web-design-guidelines-v1` for code-level interface rules. Playwright E2E only when an existing spec covers the path—it does not replace the screenshot loop.

## Verification

- [ ] Purpose, audience, and surface mode were stated.
- [ ] Existing tokens and primitives were inspected before new visual tokens.
- [ ] Loading, empty, error, and success (as applicable) exist.
- [ ] Desktop and mobile were inspected; keyboard was exercised; screenshot critique named evidenced issues.
- [ ] Visual inspection and automated tests are reported separately.
- [ ] At most two rendered passes (batch fix + confirm).

## Handoff

Return what changed, which viewports and states were inspected, remaining unverified behavior, and whether Quality a11y or the interface checklist still need a pass. Read [completion evidence](../references/completion.md).
