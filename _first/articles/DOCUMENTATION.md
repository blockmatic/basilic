---
title: Documentation First
status: draft
description: Keep the context future humans and agents need to decide well in durable project files, not in conversations that disappear.
---

# Documentation First

## Principle

Keep the context future humans and agents need to decide well in durable project files, not in conversations that disappear.

## The Case

I document decisions and context, not obvious code. If someone will need to rediscover it, explain it twice, or guess why we chose this, it belongs in a file.

Architecture, conventions, setup, constraints, domain knowledge, agent instructions — these are load-bearing. Documentation is not a deliverable for its own sake. It is how a project stays intelligible when the people and the chat sessions move on.

Undocumented decisions become folklore. New contributors reconstruct context from code and guess wrong. Agents do the same, faster. Docs that drifted from reality are worse than no docs: they are a confident lie. When implementation changes behavior and nobody updates the file, the next session starts from the old story.

Tom Preston-Werner's README Driven Development is the ancestor of the factory's own doors. Write the human intro before the implementation invents the story. This factory splits that instinct: `README.md` is the human door, `ABOUT.md` is the factory map. Neither replaces an ADR. Both exist so the next reader does not start from chat.

Michael Nygard's Architecture Decision Records were a reaction to the same loss. A short text file in the repo: context, decision, consequences. Not a wiki nobody owns. Martin Fowler later called Nygard's original essay better than almost everything written after it. The format is not the principle. The principle is that architecturally significant choices should not live only in the heads of the people who were in the room.

The agentic delta is simple. Agents have no memory except files, skills, and the current context window. Chat is not the system of record. If the project's conventions, architecture, and constraints are not in the repo, the agent will infer them from code — including the accidents. This factory is that rule applied to itself: the essays argue, the specs operate, ABOUT maps the plant. None of that works if the next session has to reconstruct it from a transcript.

Volume is not success. Drift is failure. A short ADR that is true beats a long guide that was true last quarter.

The customer-facing version of the same rule has a different audience: the explanations people need to use the product should not live only in support tickets. This station is still the project's memory. Help centers and API docs are related. They are not a substitute for the decision that must survive the next context window.

`llms.txt` belongs in that public-documentation layer. It is a selective, machine-readable orientation to website content so an agent can find useful pages without reconstructing the site from rendered HTML. It is not a permission file, a crawler-control file, or a substitute for `AGENTS.md`. The public docs own it. Repository agent instructions mention it only when maintaining or validating it is part of the work.

## Product Leverage

Documentation sounds like engineering hygiene. The product cost of skipping it is real.

A product team that cannot explain why a constraint exists will violate it. Regulated finance, data residency, a non-goal, a permission model: those are product facts. If they only live in Slack, the next feature will contradict them and ship. A forgotten constraint is a shipped bug with a planning costume. The engineer who was in the room is not a backup disk. Neither is the agent that was in the last session.

Onboarding speed is time to market. A new engineer or a new agent that can set up and orient from files starts contributing to the actual product instead of reconstructing it.

Documentation also preserves optionality. The reason you did not build a marketplace, the reason the API is private, the reason the agent cannot delete production data — those decisions are how you keep the ability to change the product on purpose. Forgotten decisions get re-litigated as if they were open, or reversed by accident.

## Engineering Leverage

Clear code still wins. Comments that restate the next line are noise.

What does not belong only in code is the choice you would otherwise debate again: why this boundary, why this constraint, why this is out of scope, how to run the thing, what an agent is allowed to assume.

ADRs, architecture notes, conventions, and agent instructions reduce coupling to individuals. They make parallel work possible because people are not blocked on asking. They make replaceable implementations possible because the intended boundary is written down.

They also make drift visible. A spec and an implementation can disagree in a diff. Folklore cannot.

Docs-as-code is the delivery mechanism, not the principle. Markdown in the repo diffs. A generated site is fine if the source of truth is still a file someone can correct in the same change as the behavior. A wiki nobody owns is how the next session inherits a lie.

## In an Agentic System

Chat is a terrible system of record for an actor that starts every session empty.

Agent instructions, skills, and ADRs are how you give an agent a project it can actually read. Updating those files when behavior changes is how you stop the next session from "correcting" the product back to an old README.

Delegation is easier when the agent can be told "read these files first" instead of receiving a recap of the company. Validation is easier when the agent is required to update the durable context in the same change.

Human approval still belongs on the decisions themselves. Documentation First is about recording them, not about letting the agent invent them.

## What "First" Does Not Mean

Documentation First is not commenting every function. It is not writing before thinking. A paragraph in an ADR is better than a page of speculation.

It does not replace Workflow First. Workflow is when context is created, handed off, and reviewed. Documentation is what you keep after the handoff so the next actor does not start from zero.

It is not a license to generate docs because a template has a section for them. If there is no future reader, do not write it.

It does not mean every site needs `llms.txt`. Add it when public documentation is substantial enough that selective machine-readable orientation helps, and generate it from canonical content where practical rather than creating another hand-maintained truth.

The smallest useful version: one README that can get someone running, one place for conventions, ADRs only for decisions that will still matter, agent instructions that match the repo. Delete or archive what is wrong. Wrong docs are harmful.

If the answer to "why did we do it this way?" is "it was in chat," the factory already lost. Write the decision. Then the next human, and the next agent, can disagree with a file instead of a ghost.

The factory's own files are the proof. ABOUT, AGENTS, and the specs only work if they stay true. That is Documentation First applied at home, not a metaphor.

## Spec

Apply this: [principles/DOCUMENTATION.md](../principles/DOCUMENTATION.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [Tom Preston-Werner, "Readme Driven Development"](https://tom.preston-werner.com/2010/08/23/readme-driven-development.html) — write the human intro before the implementation invents the story.
- [Michael Nygard, "Documenting Architecture Decisions" (2011)](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions) — the original ADR: short, in the repo, context / decision / consequences.
- [Martin Fowler, "Architecture Decision Record"](https://martinfowler.com/bliki/ArchitectureDecisionRecord.html) — why Nygard's form stuck, and what not to inflate it into.
- [Architecture Decision Records](https://gaboesquivel.com/blog/2024-07-adrs-in-software-teams) — using ADRs in actual teams.
- [The `llms.txt` proposal](https://llmstxt.org/) — selective, path-scoped orientation for agents using website documentation; complementary to human navigation and sitemaps.
