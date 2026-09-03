---
title: Pipelines First
status: draft
description: Treat automated validation and delivery as part of the development feedback loop — including the agent loop — not as a ritual after the real work.
---

# Pipelines First

## Principle

Treat automated validation and delivery as part of the development feedback loop — including the agent feedback loop — not as a ritual after the real work.

## The Case

A change is not done when it compiles on my machine. It is done when it passes the same checks everyone else relies on, and when it can reach the environment it needs to reach.

Pipelines are how a team scales trust. For agents, CI is the ground truth: implement, run checks, read failures, fix or escalate, run again. I do not recommend heavy infrastructure for a small project. I do recommend that the path from source to deployable is explicit and automated at the level the project actually needs.

Manual release steps get skipped. Agents merge changes that break CI because nobody wired the failure back into the loop. "Works locally" becomes a recurring incident. The agentic version is worse: the agent sandbox is green. That is not the project's pipeline.

Martin Fowler's continuous integration is the first ancestor: integrate often, on a shared mainline, with an automated build. Humble and Farley's deployment pipeline is the rest of the path. The commit stage is BUILD: compile, unit test, and produce the artifact once. Later stages promote that same artifact. They do not rebuild a different binary per environment. Twelve-factor says the same split as build / release / run. The factory promotes an artifact. It does not invent a new one at the door of staging.

Jez Humble's product sentence is still the right one: work so that the software is always in a releasable state. Small batches make it economic to get feedback from working software. I wrote about this years ago as keeping a codebase always deployable and tested. That still holds. What changed is who consumes the log.

The same staged-gate pattern shows up in marketing automation and RevOps: a lead is promoted through stages, with gates, with feedback when something stalls. The isomorphism is real. The artifact is not. A lead is not a binary. This station is software delivery. GTM fields stay in Product.

The path I want is boring on purpose:

change → format → lint → typecheck → test → build → preview → deploy → verify

Not every project needs every step on day one. A static site and a payments API do not get the same graph. Missing a typecheck on a TypeScript monorepo is not proportional. Adding canary orchestration to a weekend prototype is not proportional either.

## Product Leverage

Pipelines are usually sold as engineering hygiene. The product consequence is the ability to learn.

Small batches make experiments cheap. A/B tests only exist as a product practice if shipping is cheap enough to do on purpose. If a release is a ceremony, you will not experiment. You will batch guesses.

Time to market is waiting on a path that is not automated. Integration phases, hardening weeks, and "the person who knows how to deploy" are product delays wearing ops clothing.

Preview environments, when the product actually needs them, are how you review the product, not only the diff.

Always-releasable software also preserves optionality. You can change direction at the next commit instead of at the next release train.

## Engineering Leverage

A pipeline is a contract about what "integrated" means.

The same gates for every meaningful change. Local commands that match CI, so humans and agents are not debugging two realities. Failures that are readable, so the next action is obvious.

That is independent evolution of services and apps: you can change one thing if the pipeline tells you what broke.

Flaky or skipped jobs destroy the loop. Noise trains people and agents to ignore the gate. A slow pipeline that nobody waits for is a manual process with YAML.

Pipelines First does not define what good means. That is Quality First. Quality names the bar. Pipelines run it. A green build that never ran the checks you care about is automation of the wrong thing.

Build once, deploy many. If staging and production compile different trees, you are not promoting an artifact. You are hoping two builds coincide.

## In an Agentic System

Agents generate code faster than humans can babysit it. The pipeline is how you refuse to take their word for it.

They implement, CI runs, they read the log, they fix or they escalate. That only works if CI is actually wired, actually run, and actually trusted. Give an agent a repo without CI and it will optimize for "looks done." Give it a sandbox that is not the pipeline and it will optimize for the sandbox.

Readable failure output is agent context. A 4,000-line log with no failed test name is not. Unreadable logs break the loop.

Do not add pipeline complexity an agent cannot operate. The loop has to be closable.

## What "First" Does Not Mean

Pipelines First is not Kubernetes for a brochure site. It is not five workflow files because other repos have five.

It is not Workflow First. Pipelines produce signals. Workflow is how humans and agents respond and proceed.

It is not Quality First. Quality names the bar. Pipelines execute the checks.

It is not Operations First. Pipelines get a change into production. Operations is what you do after it is there. A green pipeline is not verified recovery.

It is not a marketing pipeline. Stages and gates are a shared shape. The artifact here is software.

The smallest useful version: the project's real lint, type, test, and build commands run on every meaningful change, locally and in CI. The commit stage produces the artifact that later stages deploy. Deploy is documented and repeatable.

## Spec

Apply this: [principles/PIPELINES.md](../principles/PIPELINES.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [Jez Humble and Dave Farley, *Continuous Delivery*](https://continuousdelivery.com/) — always releasable; the deployment pipeline; commit-stage build once, deploy many.
- [Martin Fowler, "Continuous Integration"](https://martinfowler.com/articles/continuousIntegration.html) — integrate often; automated build as the first gate.
- [The Twelve-Factor App, Build, release, run](https://12factor.net/build-release-run) — strict separation; the artifact is promoted, not rebuilt.
- [On Continuous Delivery](https://gaboesquivel.com/blog/2015-07-continuous-delivery) — the same loop before agents were the ones reading the log.
