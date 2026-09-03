---
title: Quality First
status: draft
description: Name what good means — acceptance, tests, evals, performance — before anyone optimizes toward an undefined target.
---

# Quality First

## Principle

Name what good means — acceptance, tests, evals, performance — before anyone optimizes toward an undefined target.

## The Case

I do not ask anyone to "make it better" without saying what better means.

Quality is broader than tests. Tests are one way to prove behavior. For interfaces, visual and interaction validation matter. For probabilistic AI features, evals may be the right tool. For performance, budgets beat vibes. Name the bar before you optimize. Otherwise you ship something that passes review and still fails users.

Without quality definitions, teams debate taste as if it were fact. Agents iterate until something looks done. Regressions slip through because nothing asserted the old behavior. AI features ship without evals and degrade without a failing check.

Test First and TDD are the ancestors for deterministic code: write the assertion, then the behavior. Mike Cohn's test pyramid, which Martin Fowler later popularized, is a portfolio argument: many fast, narrow checks, fewer expensive broad ones. Shift-left is the same instinct — catch the failure while it is still a diff. It is not a religion, and it assumed you could assert equality.

The useful distinction now is between a test and an eval. A test asserts a property that must always hold and fails the build when it does not. An eval scores quality across a dataset and reports a distribution, gated on a threshold. Schema, auth, and tool calls are still tests. Generated language is an eval. Mixing those two is how you get either a flaky CI or a product with no protection. Hamel Husain's argument is the practical one: unsuccessful LLM products usually failed to build an evaluation system, not a prompt.

The agentic delta is that agents optimize whatever you measure, including "looks done." Write the criteria, then loop until they hold. If the plan is wrong, perfect execution only gets you to the wrong place faster.

I have used a simple bias for a long time: unit tests are useful; functional tests are how you know the system behaves. That still holds for deterministic code. For retrieval, generated language, and tool-using agents, the functional question is an eval: does the output still do the job across cases you care about? One sentence of intent is not that dataset.

## Product Leverage

Quality is how the product stays itself while it changes.

A named bar is how you keep customer experience from drifting. The happy path that worked last month should still work. Retrieval that lawyers depend on should not silently get worse after a prompt edit. That is product integrity, not coverage percentage.

It makes experiments honest at the behavior layer. Journeys become acceptance tests. Product First's post-launch metrics are a different question — they need events in the product. Without that split, "done" is either a feeling or a dashboard you waited on before shipping.

Time to market improves when regressions are cheap to catch. The alternative is a freeze, a hero QA pass, or a production surprise.

A named bar also makes the bet honest at release. Product still owns what happens after people use it. Quality owns whether this change is allowed to reach them. Mixing those two is how you freeze a good fix behind a dashboard that is still empty, or ship because CI was green.

Performance budgets are product decisions. Latency is part of checkout, voice, and search. If the budget is unstated, engineering will spend it.

## Engineering Leverage

Explicit criteria make automation possible. Pipelines can run a bar. They cannot invent one.

Behavior-focused tests protect contracts and critical paths without coupling to implementation trivia. That is independent evolution: you can change internals if the assertions still hold.

Failures should be actionable. Noise trains people and agents to ignore the gate. A deleted assertion without a written rationale is a decision made by a diff.

For AI features, keep deterministic checks at the base: schemas, tool permissions, retrieval tenancy, fallbacks. Put scored evals where the output is probabilistic. Do not put an expensive judge on every commit if that prices the gate out of existence.

The pyramid still helps you place the cheap checks. Unit and contract tests belong near the commit. Broad browser checks and evals are fewer, slower, and should assert the job, not the implementation trivia. Quality names that mix. Pipelines is what actually runs it.

## In an Agentic System

Agents optimize toward whatever you measure, and toward "looks done" if you measure nothing.

A named bar is how you delegate implementation without delegating the definition of good. The agent can loop on tests, browser checks, and evals. It cannot honestly loop on "make it better."

Validation is the point of contact. Existing project commands, not a parallel suite the agent invented. If criteria cannot be met without a product decision, that is an escalation, not a silent weakening of the test.

For in-product agents, evals are how the product knows the agent still does the job. That is Quality First applied to a probabilistic actor, not a new principle.

## What "First" Does Not Mean

Quality First is not Test First alone, and it is not 100% coverage on everything. A prototype does not need a cathedral of tests.

It does not replace Pipelines First. Quality defines what to validate. Pipelines run the validation. Mixing those two is how you get a green build that never checked the thing users will feel.

It does not replace Product First. Product names the outcome you will observe after people use the thing, and ships the events that make that observation possible. Quality names the bar that gates a release. Do not block a ship on thirty-day retention. Do not treat a green pipeline as market validation.

The smallest useful version: acceptance criteria for this change, plus the smallest mechanism that actually protects the claim. One test on a critical path beats a suite of assertions nobody trusts.

"Looks done" is not a bar. A screenshot of the happy path is not a bar. A green pipeline that never ran the eval is not a bar. Name the claim. Pick the instrument. Loop until it holds, or escalate that the claim was wrong.

For retrieval, that instrument is usually an eval over cases you care about, not a unit test of the wrapper. One sentence of product intent is the job. The eval is how you know the job still holds after a prompt edit.

## Spec

Apply this: [principles/QUALITY.md](../principles/QUALITY.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [Martin Fowler, "Test Pyramid"](https://martinfowler.com/bliki/TestPyramid.html) — a portfolio of checks, not a coverage cult.
- [Hamel Husain, "Your AI Product Needs Evals"](https://hamel.dev/blog/posts/evals/) — unsuccessful LLM products usually lack an evaluation system, not a prompt.
- [Engineering in the AI Era](https://gaboesquivel.com/blog/2026-02-engineering-ai-era) — declarative criteria and loops when generation is cheap.
