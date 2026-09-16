# Workflow authoring pattern

One outcome per slash playbook. Keep discovery descriptions to capability and invocation; detailed steps belong in the body. The frontmatter name equals its folder, is unprefixed, and retains `disable-model-invocation: true`.

Use these sections when they change execution decisions:

1. **Purpose and inputs**: when to use it, required context, and whether it plans, inspects, edits, or publishes.
2. **Steps**: inspect, act within scope, and verify; keep task-specific mechanics here.
3. **Verification**: short, observable exit conditions. Link shared completion evidence instead of copying a global policy.
4. **Handoff**: the artifact or evidence returned, uncertainty, and next action. Include a stopping condition for investigative loops.

Small existing specialty playbooks may use Purpose, Steps, and Completion. Add detailed checklists when improving their behavior, not merely to fill headings. Supporting files belong inside `workflow/references/` so installing `workflow` carries them. Other catalogs are optional context, never install-time dependencies.

Avoid fixed interview quotas, mandatory plans for trivial edits, fabricated performance estimates, auto-commits from implementation, and silent expansion from review into fixes. Do not encode arbitrary line-count, timing, coverage, or security thresholds as repository policy.

Validate packaging with `pnpm validate` in the catalog. Exercise realistic prompts: empty/unknown dispatch, review-only, implementation-only, failed verification, and a dirty working tree before commit. Structural validation proves packaging, not agent behavior.

Structure and evidence-oriented checklist ideas were informed by [Addy Osmani's agent-skills](https://github.com/addyosmani/agent-skills/tree/84ee50673804b95c287d1e4eb4f1c1dad7c5188a), especially its skill anatomy, planning, debugging, and review guidance. These are Basilic-specific instructions, not a wholesale installation. See the catalog adoption analysis for tradeoffs.
