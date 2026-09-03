---
title: Workflow First
status: draft
description: Make the path from intent to validated change explicit enough that humans, agents, and automation can cooperate without reconstructing it every time.
---

# Workflow First

## Principle

Make the path from intent to validated change explicit enough that humans, agents, and automation can cooperate without reconstructing the process every time.

## The Case

I care less about which methodology name is on the wall and more about whether work can move from idea to a shipped, validated change without starting from zero.

Who decides what? Where does state live? When does a human approve? When does an agent hand off to CI, or CI back to an agent? Communication is not meetings. It is the transfer of useful context between actors. Durable when it affects future work. Ephemeral when it is coordination. If the workflow is only in people's heads, agents cannot help and humans cannot scale.

Implicit workflows do not survive contact with more than one person, or with an agent. Prior context lived in chat, so the next session repeats the analysis. Reviews happen without the plan. CI fails and nobody owns the next action. Production feedback never lands in an issue.

Kanban and Scrum can be tools inside a workflow. They are not the workflow. Ryan Singer's Shape Up is a useful contrast: work is shaped before it is bet on, and betting is a real decision, not a backlog that pretends everything is equally intended. The transferable idea is not six-week cycles. It is that unshaped work should not enter the building phase just because someone started typing.

The work loop lives here, and only here:

idea → plan → implement → review → pipeline signals → approval → release → learning

What matters is that each step has an actor, an input, an output, and a place for state. A consequential architectural choice goes in an ADR or a project doc — Documentation keeps it. Automated validation is a CI result — Pipelines produce it. Work state lives in an issue, a task, or a pull request. Temporary coordination stays in a comment or chat.

The agentic delta is a delegation protocol. Generation is cheap only if the path is explicit. Give success criteria and a loop. Human approval is a boundary, not a vibe: product scope, security-sensitive changes, destructive operations wait. Everything else can move if the files are in order.

Those gates are factory control. The other stations point at them. They do not reprint them. If the path is "the agent just does it," you do not have a workflow. You have a hope that the next session will be careful.

## Product Leverage

A product that cannot change on purpose is a product stuck in its last heroic effort.

Workflow First is how you keep the ability to change direction. Small, reviewable changes with a visible state beat a month of private work that lands as a surprise. Learning from production only happens if the signal can become work, and work can become a release.

Time to market is mostly waiting: waiting for context, waiting for review, waiting for someone who "knows how we do this." An explicit path removes that wait without adding status theater.

A plan in a file is cheaper than a recap in chat. A PR that points at the issue is cheaper than a branch with no owner. Those are product-speed moves wearing process clothes.

It also reduces product coupling to particular people. If only one person knows how a release happens, the product's roadmap is that person's calendar. Issues, PRs, and plans are how the product continues when that person is not in the room — including when the next actor is an agent.

A support ticket that never becomes an issue, a production error that never becomes a fix, an agent that implements without a plan: those are product failures with process costumes.

The work loop is the conveyor. Stations dump work onto it. Pipelines are the automated stretch. Documentation is what remains after a handoff. If you keep a third loop in your head, you will reconstruct the process every time — which is the failure this station exists to prevent.

## Engineering Leverage

Explicit handoffs are an interface between actors, the same way an API is an interface between systems.

Inputs and outputs at each step make parallel work possible. Review has a plan to read. CI has a branch to check. The next agent has files instead of a recap.

State in issues and PRs is observable. Chat is not. That is testability for the process itself: you can see what is in flight, what is blocked, and what is waiting on a human.

Approval boundaries are clearer failure modes. A destructive change that requires a human is a named gate, not a hope that someone was watching.

This is not more tools. It is fewer implicit ones. One place for work state. One path for validation. One rule for what gets written down.

## In an Agentic System

Agents cannot follow a process that lives in one person's head.

They need to know where work state lives, what "done" means, when to stop and ask, and where to put findings that will matter later. Inspect, propose, implement in reviewable chunks, validate through existing CI, escalate consequential decisions.

Human gates are factory control: product scope, security, destructive ops. Without that, an agent either asks about everything or about nothing.

It also routes system signals back into work. CI failure → fix or escalate. Production signal → issue → change → pipeline → verify. An agent can participate in that loop only if the loop exists.

Agent-to-agent handoff is the same rule as human-to-human: enough context in durable form that the next actor does not need the transcript.

## What "First" Does Not Mean

Workflow First is not more meetings or status theater. It is not a required issue tracker or a required PR template.

It is not Pipelines First. Pipelines produce signals. Workflow is how humans and agents respond and proceed.

It is not Documentation First. Workflow decides when context is created and handed off. Documentation keeps it. Chat is not the system of record — that sentence is owned there.

The smallest useful version: work state in an issue or PR, a short plan for non-trivial work, CI as the validation step, a named human gate for destructive or product-consequential changes. You do not need Shape Up, Scrum, or a workflow engine.

## Spec

Apply this: [principles/WORKFLOW.md](../principles/WORKFLOW.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [Ryan Singer, *Shape Up*](https://basecamp.com/shapeup/) — shaping before building; betting as a real decision. Use as contrast, not as a required method.
- [Engineering in the AI Era](https://gaboesquivel.com/blog/2026-02-engineering-ai-era) — constraints and review while generation gets cheaper; the loop has to be explicit.
