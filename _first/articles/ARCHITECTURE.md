---
title: Architecture First
status: draft
description: Decide system boundaries, dependency direction, and deployment shape before local implementation choices harden into structural constraints.
---

# Architecture First

## Principle

Decide system boundaries, dependency direction, and deployment shape before local implementation choices harden into structural constraints.

## The Case

Every codebase acquires an architecture. The choice is whether its consequential structure is deliberate or merely the residue of whichever feature arrived first.

A route imports a database client because it is convenient. A second application imports the route's private helper. A background job reaches into the same tables. Soon the dependency graph is the product architecture, but nobody chose it and nobody can explain which direction it is supposed to point. Local decisions became structural constraints one merge at a time.

Architecture First is not a demand for a complete design before code. It is a demand to name the decisions that become expensive to reverse: responsibilities, process boundaries, shared state, external dependencies, deployment units, and the quality attributes that shape them. Those decisions deserve more scrutiny than a replaceable framework detail.

The useful architectural map is smaller than most architecture decks. A system context shows people and external systems. A container view shows applications and data stores. A deployment view shows what actually runs where. The [C4 model](https://c4model.com/) is useful because it separates these levels and recommends using only the views that add value. The model is not the principle. The principle is that a future contributor should not need to infer the system boundary from imports and cloud consoles.

Decision records solve a related problem. A diagram shows what exists; an ADR records why a consequential choice was made, which alternatives mattered, and what consequences were accepted. The record is valuable when a new constraint appears and the team needs to know whether to preserve or supersede the old choice.

Agents make accidental architecture cheaper to produce. They can add a service, abstraction, queue, or shared package quickly. Without a structural model, they optimize the local task and distribute its consequences across the repository. A written boundary gives them something stronger than proximity to follow.

## Product Leverage

Architecture preserves product options. A capability placed behind a clear boundary can gain another interface. A tightly coupled workflow cannot change channel without moving half the system.

It also exposes product cost. A request for instant consistency across regions, offline operation, or regulated isolation is not a neutral requirement. It shapes stores, deployment, failure modes, and team ownership. Making the structural consequence visible lets the product decide whether the value justifies it.

Time to market benefits from proportional architecture. The point is not to create more parts. It is to avoid creating the wrong irreversible part. A modular monolith with a clear dependency direction is often more useful than services whose boundaries were copied from an organization chart.

Architecture is also where build-versus-buy becomes concrete. A managed service trades implementation work for dependency, cost, and exit constraints. A homegrown subsystem makes the reverse trade. Recording the choice prevents a vendor or framework from becoming an unexplained product constraint.

## Engineering Leverage

Clear boundaries make change local. If dependencies point toward stable domain capabilities rather than outward toward delivery details, replacing a UI, datastore, or vendor does not require rewriting every caller.

Architecture also makes review possible. “This adds a dependency from the domain to the web framework” is a reviewable statement. “This feels too coupled” is not. Dependency rules can sometimes be enforced with package boundaries, import checks, or build configuration. The diagram and ADR explain the intent; code and checks protect it.

Deployment shape belongs here because process boundaries change failure. An in-process call and a network call can expose the same API while having different latency, availability, retry, and observability needs. Pipelines deliver the units. Operations runs them. Architecture decides that the units exist and explains the trade.

The architecture model must follow reality. A pristine diagram that omits the queue, shared database, or manual batch job is worse than a rough diagram that shows the actual plant.

## In an Agentic System

Agents are strong local optimizers. Architecture is the durable context that keeps local optimization from becoming global disorder.

An agent should inspect repository structure, deployment configuration, data stores, and runtime entry points before proposing a new component. It should preserve intentional boundaries and ask what existing part owns the responsibility. It should not infer that every capability needs a service or that every repeated line needs a shared framework.

For in-product agents, architecture names the agent as a runtime component: where it executes, which tools it can call, what state it reads, and what happens when it retries or fails. API owns each tool contract. Security owns permission policy. Operations owns visibility and recovery. Architecture makes their relationship legible.

The smallest architecture artifact gives the agent a map: the system, its users, external systems, deployable units, stores, and labeled dependencies. That is enough to challenge a change that points the wrong way.

## What "First" Does Not Mean

Architecture First is not Big Design Up Front. It does not mean predicting every future requirement or drawing every class.

It is not a license for speculative layers, services, event buses, or platforms. If one process and one database meet the product's constraints, that can be the deliberate architecture.

It is not API First. Architecture decides which parts communicate and where responsibility lives. API defines the contract across a boundary.

It is not Data First. Architecture places stores and data flows. Data defines the canonical meaning, authority, lifecycle, and evolution of the state they carry.

It is not Documentation First. Architecture owns structural decisions. Documentation ensures the context remains durable and discoverable.

The smallest useful version is one accurate context or container diagram plus a short decision record for the choice that would be painful to reverse.

## Spec

Apply this: [principles/ARCHITECTURE.md](../principles/ARCHITECTURE.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [The C4 model](https://c4model.com/) — hierarchical, notation-independent views of software systems, containers, components, and deployment.
- [C4 system context diagram](https://c4model.com/diagrams/system-context) — the smallest recommended view of people, the system, and external dependencies.
- [Martin Fowler, "Architecture Decision Record"](https://martinfowler.com/bliki/ArchitectureDecisionRecord.html) — short records of context, decision, rationale, and consequences.
- [Martin Fowler, "Who Needs an Architect?"](https://martinfowler.com/ieeeSoftware/whoNeedsArchitect.pdf) — architecture as the important, hard-to-change decisions a team needs to understand.
