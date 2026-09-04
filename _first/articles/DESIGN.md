---
title: Design First
status: draft
description: Decide how the product behaves and communicates through its interface before layout and components become accidental consequences of implementation.
---

# Design First

## Principle

Decide how the product behaves and communicates through its interface before layout and components become accidental consequences of implementation.

## The Case

Useful software is the floor. The product people remember is the one that feels clear, thoughtful, and enjoyable to use.

Design here is not decoration bolted on at the end. It is behavior, hierarchy, states, copy, and motion. Before a new pattern exists, the project already has tokens, primitives, components, and conventions — or it is about to invent a second product language by accident.

Without design intent, every screen invents its own patterns. Buttons almost match. Loading, empty, and error states ship as afterthoughts. Accessibility becomes a retrofit. Agents generate UI that works and does not belong to the same product.

Later never has the same leverage. Once components multiply, you are migrating a visual language instead of composing one. A design system — tokens, primitives, composition rules, content patterns — is how a team, including agents, stays inside one product.

That system has to be readable. Mobile-first, atomic design, and the last decade of design-system writing already argued for shared parts. The agentic delta is that a Figma file the agent cannot open is folklore. A bag of hex values with no rules is a theme, not a language: you cannot say "primary is only for the main CTA" in a color map.

`DESIGN.md` is one way to write that language down so an agent can follow it. OpenAPI is the sibling move for APIs. Neither file is the principle. Design-system-file-first asks whether we dropped a YAML file in the root. Design First asks whether the interface language — values, states, copy, motion, and what not to invent — was defined before implementation composed a second product. A file that only lists hex codes is a theme. The interesting part is the body: when primary is allowed, what empty looks like, what a screen must never mix.

Joshua Porter's point about empty states is still the right instinct: the first screen a person sees teaches them how the software works. A blank table is a product decision. Nielsen Norman's later guidance is the same: an empty panel that does not explain whether the system is loading, empty, or broken is missing communication. Microcopy is part of that communication. If engineers invent that text per screen, the product speaks in several voices.

Delight is not fluff. A press state that lands, a toast that arrives fast, a skeleton that holds layout, an empty state that tells you what to do next — those are how the interface talks. Keep them fast. Respect reduced motion.

On LegalAgent the assistant is voice and chat. The design job is how that conversation is expressed: hierarchy, turn-taking, empty, error, what the retrieval looks like when it fails. The admin path is a different journey. Do not collapse them into one layout problem.

Refero and similar galleries are research. They are not the system. Generated UI currently clusters around a few looks regardless of product. A readable system that is about this product is how you refuse the default collage.

## Product Leverage

Design First is a product-quality argument.

It is how the product feels like one product across screens, platforms, and releases. Consistency is not brand vanity. It is reduced cognitive load. People should not have to relearn confirm, cancel, and error every time they move.

It is how customer experience survives the unhappy path. Loading, empty, error, success, and disabled are most of real use. If you only design the populated happy view, you designed a screenshot.

Tokens and primitives are product optionality: a new density, a new theme, a new surface can reuse behavior. A pile of one-off layouts cannot.

Interaction quality is a distribution issue. An interface that is unclear does not get a second session. Contrast that fails WCAG is the same class of problem: people who cannot read the button cannot use the product. A green token lint is not an accessible interface.

## Engineering Leverage

A design system is an interface contract for UI, the way an API is a contract for capabilities.

Reuse beats invention: tokens, primitives, composition. New components are exceptions with a written reason. That is a smaller surface for agents to hallucinate against.

The implementation still has to hold the contract: component library, CSS variables, theme. Two palettes is the visual version of spec/implementation drift. Pick a source of truth and export the rest.

States defined up front are testable. You can validate loading and error in a browser instead of discovering them in production. Accessibility — focus, labels, contrast, keyboard, reduced motion — is cheaper as a constraint than as a retrofit.

Motion with a rule (fast feedback, not decoration; honor `prefers-reduced-motion`) keeps the implementation from becoming a second animation library per feature.

Independent evolution of screens only works if they compose from the same parts. Tooling details — lint, DTCG export, Stitch — live in the spec.

## In an Agentic System

Coding agents are fluent at generating UI and poor at belonging to an existing product.

Without a system to read, they will invent a third button, a new spacing scale, and a unique empty state. "Reuse these primitives" is a constraint an agent can follow. "Make it look nice" is not.

A file the agent is not told to read is as invisible as a Figma link. Point the project's agent instructions at the design contract.

Validation has to be in the browser, across states. A screenshot of the default view is not verification. Contrast lint is not verification. That bar has to be explicit.

Do not treat "AI will generate the UI" as a reason to skip the system. Generation without a system produces collage at scale. Generation against a contract with no don'ts produces a consistent collage.

Zhao's structure-and-meaning-first claim in the API essay is the sibling. Design First is how the human-visible expression of that structure stays considered.

## What "First" Does Not Mean

Design First is not visual polish only. It does not require a designer on every task. It does not mean blocking a ship until every pixel is perfect.

It does not mean DESIGN.md-first as a ceremony. You do not owe anyone a YAML schema before a prototype can have a button. If the project already has tokens in a theme or a component library, describe that system rather than inventing a second brand.

It does not mean a file instead of a library. Hex codes in markdown do not stop a one-off `div`.

It does not replace Journeys First. The flow defines what happens. Design defines how that behavior is expressed. You can map a complete path and still ship an accidental UI.

It is not Documentation First. The design contract is not the project's memory. Both can live in the root. They are not the same file.

The smallest useful version: list the states the feature needs, pick primitives from the system, write the interaction in a paragraph, check accessibility, look at it in a browser.

## Spec

Apply this: [principles/DESIGN.md](../principles/DESIGN.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [Joshua Porter, "Writing Microcopy"](https://bokardo.com/archives/writing-microcopy/) — small functional text that gets someone through a moment; empty, error, and confirm copy are product decisions.
- [Nielsen Norman Group, "Designing Empty States in Complex Applications"](https://www.nngroup.com/articles/empty-state-interface-design/) — loading versus empty versus error as communication, not illustration.
- [DESIGN.md Format](https://raw.githubusercontent.com/google-labs-code/design.md/refs/heads/main/docs/spec.md) ([google-labs-code/design.md](https://github.com/google-labs-code/design.md)) — YAML tokens plus markdown sections; `omitted`; unknown headings preserved. Currently `alpha`. The artifact format, not the principle.
- [W3C Design Tokens](https://www.designtokens.org/) — typed token groups and interchange.
