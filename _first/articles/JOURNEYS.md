---
title: Journeys First
status: draft
description: Map how someone finishes a job — including errors, permissions, and state — before implementation invents the path from the first screen.
---

# Journeys First

## Principle

Map how someone finishes a job — including errors, permissions, and state — before implementation invents the path from whichever screen shipped first.

## The Case

The product is not a collection of screens. It is someone trying to finish a job.

Happy paths are easy to ship. Products fail in the gaps: the session that cannot be recovered, the error with no next step, the permission that exists on one route and vanishes on the API that route calls. Those missing states do not stay missing. They show up in support, in production, and in the next feature that assumes a complete model.

The implementation did not just skip an edge case. It decided, by omission, what the product does when things go wrong.

Jeff Patton's user story mapping exists because flat backlogs hide that picture. A list of features does not tell you whether a person can get through the job. Mapping left to right as a narrative, then slicing a walking skeleton, is how you notice the hole before you build muscle on one step. This principle is not "adopt story mapping." It is the same insistence: see the whole job before the routes harden.

Jobs-to-be-done makes the same point from the customer's side. People hire a product to make progress in a circumstance. If you design screens instead of the job, you optimize the wrong thing. Journeys First is how that job becomes an engineering input: actor, entry, states, failure, permission, completion.

Marketing "customer journey" maps are a cousin with a different job. Those charts are acquisition and GTM. They live with Product when they matter. This station is how someone finishes a job in the product, including the operator who never appears in a funnel.

For LegalAgent I built the Expo assistant — voice, chat, retrieval for case context — and the TanStack Start admin that lets the team control documents, prompts, and retrieval categories. Those are not two UIs. They are two paths through the same product: a lawyer finishing a job in the assistant, and an operator keeping the sources and instructions correct. If you only design the chat, you miss who is allowed to change what the model sees. If you only design the admin, you miss where the assistant fails and how someone recovers. The flow has to include both actors, both entry points, and the permission gate between them.

Agents implement the flow they can see and invent the rest. If the rest is not written down, the invention becomes the product. In-product agents are actors in the same map. An unnamed actor gets invented tools.

How that plot looks on screen is Design. Do not retell the state model as a layout problem, and do not let a polished empty state stand in for a missing recovery path. A journey shows where a permission gate occurs and what the actor experiences; Security defines who is allowed through it.

## Product Leverage

A mapped journey is how you stop shipping a pile of screens that do not add up to a finished job.

It improves customer experience in the places people actually abandon you: errors, permissions, resume, cancel. Empty and failure states are not design polish. They are whether the product still works when reality shows up.

It reduces coupling between surfaces. The same job on web and mobile should not have different permission rules because two routes were built months apart. The journey is the shared plot. How the interface expresses that plot is Design.

It makes experiments cheaper. A walking skeleton — Patton's thinnest slice that still crosses the whole job — is a product you can learn from. A vertical slice of one gorgeous step is a demo.

"Lawyers" and "operators" are not personas on a slide. They are actors with different entries, different permissions, and different completion criteria. Mixing them in one undifferentiated flow is how you ship an admin control into a customer path, or leave a customer stuck with no recovery.

Time to market improves when you stop discovering the real flow in QA. You still ship a thin path. You ship it on purpose, with named holes.

A walking skeleton that includes one error and one permission gate teaches more than a polished happy path. The missing states are the product. Write them before the routes pretend they do not exist.

## Engineering Leverage

A journey gives engineering a state model before the code invents one.

Entry points, permissions, and error recovery are implementation work. If they are not named, they land inconsistently: a check in the UI, a different check in the API, none in the job the agent runs. The failure mode is not "missing a test." It is two implementations of the same product rule.

Acceptance criteria can be traced to completion of the job, not to whichever route was convenient. That makes Quality attach to something real. It also makes API First less likely to encode an incomplete flow as a resource that cannot represent failure.

Independent evolution of surfaces gets easier when the states are shared. Web, mobile, and an agent can all implement "invite a member" if the states are known. They cannot if each surface has a private idea of what "invited" means.

## In an Agentic System

Agents are now actors in the journey, not only authors of the code.

A coding agent implementing a feature will follow the happy path in the ticket. Alternates, errors, and permissions are the parts it will improvise unless they are explicit. A journey artifact is a map: who acts, what happens, what fails, who is allowed, how the job ends.

In-product agents need the same things a human path needs — entry, permission, failure, completion — plus a structured way to call the steps. If the human journey is incomplete, the agent journey will be a guess with tools attached.

Delegation gets easier when the job is named. "Implement recovery for failed document upload" is a bounded task. "Make upload better" is an invitation to invent product behavior.

Human approval belongs on permission changes and on new actors. Adding an agent that can change retrieval sources is a journey change, not a UI tweak.

## What "First" Does Not Mean

This is not wireframing. It is not a design system. It does not require BPMN, a service blueprint, or a state machine document for every feature.

It does not replace Product First. You still need to know what and why before you map how someone finishes.

It is not Design First. Describe what happens and why. How the interface expresses that — tokens, components, motion, copy — is a different decision. A complete flow can still look accidental. A beautiful screen can still trap someone in a state the flow never named.

It is not Security First. Journeys place permission gates in the flow. Security owns the authorization policy behind them.

It is not a GTM journey map. Acquisition sequencing belongs with Product.

The smallest useful version is a short narrative for one critical job: actor, start, main path, two or three failures, who is allowed, what "done" means. Write more only where the product has already been burned by a missing state.

## Spec

Apply this: [principles/JOURNEYS.md](../principles/JOURNEYS.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [Jeff Patton, *User Story Mapping*](https://jpattonassociates.com/story-mapping/) — the whole job as a narrative; walking skeleton before muscle. Method, not a requirement.
- [Clayton Christensen et al., "Know Your Customers' 'Jobs to Be Done'"](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done) — the job is the unit of analysis; screens are hired to finish it.
- [Evolution of AI UX](https://gaboesquivel.com/blog/2026-01-evolution-ai-ux) — voice, chat, and admin as paths through one product, not as separate apps.
