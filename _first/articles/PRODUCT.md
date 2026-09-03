---
title: Product First
status: draft
description: Define what you are building, for whom, why it is worth building, and how you will know — before the last merge becomes the specification.
---

# Product First

## Principle

Define what you are building, for whom, why it is worth building, and how you will know — before implementation becomes the specification.

## The Case

Software projects fail in a quiet way: they keep moving. Features ship. Architecture hardens. Nobody can point to a file that says what the product is for, who it is for, what would count as working, and what is out of scope.

Then the codebase becomes the brief. The last merge is the spec. Two surfaces contradict each other because they were built from different unspoken products. You spend a week arguing about a screen when the real question was whether the capability belonged at all.

Implementation is good at revealing better options. It is a poor author of goals. Once a stack, a data model, and a set of screens exist, reversing the goal is a rewrite wearing a feature's clothes.

Lee Robinson describes product engineers as people who work backwards from the desired experience to the technologies that enable it. Frontend versus backend is not the interesting split. The interesting split is whether you are building toward a product outcome or toward a layer of the stack. Technology choices are means. If nobody uses the product, the library you picked did not matter.

Amazon's Working Backwards habit is the same idea at a heavier weight: start from the customer and the press-release version of the product, then let that force the work. You do not need to import the PR/FAQ ceremony. You do need the habit. Write the bet before the stack hardens.

Marty Cagan's distinction between discovery and delivery is useful as contrast, not as a methodology to import. Discovery is how you find out whether an idea is worth building. Delivery is how you build it well. Most teams over-invest in delivery. Product First is the engineering version of that warning: do not let delivery invent the goal.

AI makes the gap more expensive, not smaller. Robinson's later point is that generation is most useful from zero to something, and that the last stretch requires an opinion about what you are actually trying to build. Agents that can ship a feature in an afternoon can also ship the wrong feature with confidence. If product intent lives only in chat, the next session reconstructs it from whatever the UI happens to do. If you do not name non-goals, they invent scope. If you do not name success, they treat "it compiles" as done.

At Wink I was Lead Engineer for Costa Rica's first neobank. Choosing the AWS and React Native stack and recruiting the team were the same decision: what we were building determined who we needed and what the system had to survive. The product constraint came first. The implementation followed. The business goal — regulated access to accounts on a phone — was not something you could discover from a component library.

The current job on LegalAgent is narrower and just as load-bearing: a lawyer retrieves case context in the assistant without leaving the conversation. That sentence is intent. It is not a conversion rate. If we do not write it down, the next session will finish a different product.

## Product Leverage

You get alignment between intent and implementation. A change can be judged against a goal instead of against taste. Scope stops expanding by default because something was ruled out on purpose.

You get a way to change direction without pretending nothing was decided. When the product changes, you update the file. The alternative is a silent pivot encoded in a pull request that nobody will find six months later.

You avoid premature product decisions of the wrong kind. Writing the goal down is not freezing the solution. It is separating the job from the current approach. If the job is named, the implementation can change. If only the implementation exists, the job is whatever shipped.

You get experiments that can actually fail. "Make it better" is not a product outcome. A named metric with a window is a bet you can keep, iterate, or kill. Analytics is how that definition becomes visible. Naming activation without shipping the event is the same accident as naming a capability without a boundary: the next session will guess. The tracking plan ships with the feature.

Go-to-market belongs in the same artifact. Shipping is not distribution. A capability that only the people who built it can find is not a product outcome. For an internal tool that still means who gets access, how they hear about it, and what the first successful use looks like.

Time to market improves when you stop building adjacent ideas that were easy to code. Non-goals protect the calendar.

If the product is a business, market size and unit economics belong in the brief as constraints, not as a pitch-deck appendix. The field list lives in the spec. Do not invent TAM or LTV to make the file look finished.

## Engineering Leverage

Engineers cannot design a system against an implied product. They guess, then they encode the guess.

A written goal, a written non-goal, and a written metric change the architecture conversation. You stop arguing about frameworks and start arguing about constraints: regulated money movement, retrieval quality, a latency number that is part of the product. Those constraints decide the stack more honestly than a trend.

They also decide what not to abstract. If the product is one actor and one job, you do not need a platform. Product First is how that distinction stays visible.

Product-engineering metrics are not engineering-productivity metrics. Cycle time and CI greenness tell you whether the team can change the product. They do not tell you whether the product worked.

Testability has nothing to attach to without success criteria. Quality First names the bar that gates a release. Product First names the outcome you will observe after people actually use it, and ships the analytics that make that observation possible. Mixing those two produces a launch blocked on thirty-day retention, or a launch that treated passing tests as market validation.

The event taxonomy is a product contract. A 500 rate is whether the system is broken. A drop in completed sign-in is whether the product is working. Page on the first. Put the second on the validation board.

## In an Agentic System

Coding agents fill gaps. That is their strength and the failure mode.

If the gap is "what is this product," the agent will answer from the file tree, the README, and the running UI. Those are facts about what exists. They are not always facts about what should exist. Without a product artifact, the agent treats shipped behavior as intent. That is how a merge becomes the specification.

A short brief gives agents context they should not infer: users, business goals, non-goals, GTM, success metrics, the tracking plan, and which hypotheses are still unproven. You can say "implement this change" without also saying "decide whether we are a marketplace now."

Generation gets you a prototype. Finishing requires an opinion. The opinion has to live in a file, or every session will finish a different product.

An agent can notice that the UI, the brief, and the numbers disagree. A human still decides which one is wrong. Scope, priority, success metrics, event names, GTM, and pricing are consequential. Agents should propose updates to the artifact, not silently decide them.

## What "First" Does Not Mean

Product First is not a product-management methodology. It does not require a 40-page PRD, a pirate-metrics dashboard, or a weekly validation board meeting.

It does not mean writing a novel before you are allowed to learn. The smallest useful version is a page: problem, users, business goal, non-goals, how it reaches people, one to three metrics with a window, the events that will show them, open questions. If money is the point, add the model you currently believe, marked measured or unproven.

It does not mean Mixpanel on day one. The smallest useful analytics is the few events that would change what you build next.

It does not mean gating a ship on post-launch metrics you cannot observe yet. Acceptance criteria belong with Quality. Success metrics are observations after use.

It does not mean the spec never changes. It means when the spec changes, you update the file.

It is not Journeys First. Product says what, why, and how we will know. How someone finishes the job is a different document.

It is not API First. Desired capabilities are product. How systems communicate at a boundary is a contract.

It is not Operations First. Product owns whether the bet is working. Operations owns whether the system is healthy. A named metric with no event is unfinished product work, not an ops ticket.

## Spec

Apply this: [principles/PRODUCT.md](../principles/PRODUCT.md). The optional finance and tracking fields live there. Return to the [factory map](../ABOUT.md).

## Further Reading

- [Lee Robinson, "Product Engineers"](https://leerob.com/product-engineers) — work backwards from the desired experience; visually complete is not done.
- [Andrew Zigler, "The Rise of Product Engineers in the AI-Driven Era"](https://linearb.io/blog/the-rise-of-product-engineers-in-the-ai-driven-era) — Robinson on code last, and why generation still needs an opinion.
- [The Skillset of a Product Engineer](https://gaboesquivel.com/blog/2025-03-the-product-engineer) — outcomes over implementation; analytics as part of the job.
- [Marty Cagan, "Discovery vs. Delivery"](https://www.svpg.com/discovery-vs-delivery/) — do not let production-quality delivery substitute for knowing what is worth building.
- [Working Backwards, PR/FAQ](https://workingbackwards.com/concepts/working-backwards-pr-faq-process/) — a heavier form of the same habit for major bets. Optional. Not the default artifact.
