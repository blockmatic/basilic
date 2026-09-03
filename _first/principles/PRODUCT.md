# Product First

## Principle

Define what you are building, for whom, why it is worth building, and how you will know — before implementation becomes the specification.

## Statement

I do not let the codebase become the product brief. Before I change meaningful behavior, I want a file that names the problem, who has it, why it is worth building, what we are not building, how it reaches people, and how we will know. Implementation can reveal a better option. It should not invent the goal.

## Outcome

The project has an inspectable answer to what, why, and how we will know. Non-goals, GTM, success metrics, and the tracking plan are written or explicitly unresolved. Named metrics have events, or are marked unmeasured. When the product is a business, market size and unit economics are stated as measured or as hypotheses.

## Artifacts

- `PRODUCT.md`, product brief, or lightweight PRD
- Business goals and user goals, distinguished
- Non-goals, requirements, and constraints
- Go-to-market notes: audience, channel, first successful use
- Success metrics: definition, target, timeframe
- Tracking plan: events, properties, identity, funnels tied to those metrics
- Validation board: hypothesis, metric, evidence, keep / iterate / kill
- Assumptions and open questions
- Issue or task links for unresolved product decisions

When the product is a business, also:

- Market size: TAM, SAM, SOM — with method and what is still a guess
- Money model: pricing, LTV, CAC, payback, contribution margin; or an explicit non-revenue goal
- Runway / burn / time to breakeven when the product is the company
- AARRR as a prompt for acquisition through revenue, not a mandatory scorecard

Do not invent TAM, LTV, or a fog of events to complete a template. An internal tool may have none of the finance fields. Then say so.

## Minimum Useful Artifact

- problem, users, and business or organizational goal
- requirements, constraints, and explicit non-goals
- audience, channel, and first successful use
- one to three metrics with definition, target, and timeframe
- events that make each metric observable, or `unmeasured`
- assumptions, open questions, and named decision owners

## Recipe

1. Inspect existing product docs, issues, README, the running product, and claimed metrics.
2. Understand what is shipped versus what is claimed, including GTM and measurement.
3. Identify gaps: missing users, missing goal, success that cannot fail, named metrics with no events, hypotheses with no status.
4. Propose the smallest useful update to the product artifact.
5. Make decisions explicit, or name them as unresolved. Do not hide them in code.
6. Implement the behavior and the events in the same change when the change can move a metric.
7. After use, compare the metric to the target and record keep / iterate / kill.
8. Update the artifact if behavior, assumptions, GTM, analytics, or the bet changed.

## Validation

- A new contributor can answer what we are building, who it is for, why it is worth it, and how we will know from files alone.
- Success metrics can fail. They are not CI going green.
- Named metrics have events in the product, or are explicitly marked unmeasured.
- Go-to-market is named at the level the product needs.
- No silent product decisions in code without a corresponding note or open question.

## Definition of Done

Product intent is documented or explicitly deferred with named owners. Implementation aligns with stated goals and non-goals, or the docs were updated. Success that was claimed is either instrumented or marked unmeasured.

## Agent Prompt

Apply Product First to this repository.

Read existing product documentation, issues, implementation, success metrics, tracking plan, and analytics before proposing features. Do not assume documentation is correct. Compare it to what the code and UI actually do, and to what is actually measured.

Preserve intentional existing product choices. Do not silently decide scope, priorities, business goals, market size, pricing, unit economics, success metrics, event names, or go-to-market. If TAM or LTV is missing and the product is not a business, say so rather than filling the blank.

Separate release-gating acceptance criteria from post-launch success metrics. If a metric is named but not instrumented, that is a product gap — implement the event or mark it unmeasured. Do not file it as operations work.

Propose the smallest useful update to product artifacts, including the tracking plan and validation board when hypotheses exist. When you change behavior that can move a metric, ship the analytics in the same work. If the bet changes, update durable project files.

## Notes

**Product vs Journeys:** Product names what, why, and how we will know. Journeys name how someone finishes.

**Product vs Quality:** Product names the outcome after use. Quality names the bar that gates a release.

**Product vs Operations:** Product owns events, funnels, activation. Operations owns logs, traces, error rates, alerts, recovery.

**Product vs Data:** Product names events and outcomes to measure. Data owns canonical domain meaning, authority, lifecycle, and evolution.

**Navigation:** [Human essay](../articles/PRODUCT.md) · [Factory map](../ABOUT.md)
