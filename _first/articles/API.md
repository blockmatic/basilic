---
title: API First
status: draft
description: Define the capability and its boundary before consumers couple to an accidental implementation — including agent tools.
---

# API First

## Principle

Define the capability and its boundary before consumers couple to an accidental implementation.

## The Case

A product is a set of capabilities someone can use. An interface is one way to reach them.

Those two facts get mixed up constantly. A team ships a screen. The handler behind it returns whatever was convenient that week. A mobile client copies the shape. A partner scripts against it. An agent wraps it as a tool. Nobody chose a boundary. The first consumer invented one, and everyone else inherited the accident.

That is the product-development problem API First is trying to prevent. Not "we forgot the OpenAPI file." The more expensive failure is this: a useful capability becomes trapped inside the first interface that happened to call it.

When the capability has an intentional boundary, the same work can be consumed by the web product, a mobile app, an internal system, a partner, a customer integration, an automation, an agent, or an interface that does not exist yet. The product can change how it is presented without rewriting what it does.

SOAP already argued a version of this as contract-first versus code-first: write the WSDL, then implement, or generate the WSDL from whatever the class happened to expose. Spec-first is the grandchild of that fight. API First is not the same question. Spec-first asks whether the OpenAPI file existed before the handler. API First asks whether anyone chose the capability and the boundary before consumers coupled to whatever the code returned. Generating a spec from code can be fine if someone reviews that spec as a product decision. Hand-writing YAML is not the principle. Accidental coupling is.

That is optionality. It is also a way to stay small. Guillermo Rauch has said that when he started angel investing, his thesis was that strong companies could begin as APIs. Scale AI was then scaleapi.com: an API in front of human labeling. Auth0 was identity behind a contract. Clearbit was business data behind a contract. In each case the interesting product move was not "we have REST." It was that a simple, stable interface could hide a large amount of real-world and business complexity, and that starting there helped founders focus instead of overbuilding a surface they did not yet understand.

Stripe is the same pattern applied to payments. The hard part of charging money is banks, compliance, retries, and failure. The product bet was to make that complexity look like a library: named operations, predictable objects, errors a program can handle. Checkout pages and dashboards came after the capability was something another system could call.

OpenAI is easy to misread here. The organization existed for years before it sold anything. Its first commercial product, announced in June 2020, was an API. That distinction matters. OpenAI did not "start API First" as a company origin story. It chose an API as the first way to turn a general-purpose model into something other people could build with.

The announcement is still a clean product argument. Most AI systems were built for one use case. The API offered a general-purpose text-in, text-out interface. Developers could integrate it into products they already had, or invent products that did not exist yet. The surface was deliberately simple and flexible. The underlying models would keep changing; the product surface did not have to. That is what a good API does for a product: it lets the implementation move while the capability remains callable.

Steve Yegge's retrospective account of Amazon's service-interface mandate illustrates the internal version: teams expose capabilities through interfaces instead of private back doors. Read it as an argument for callable boundaries, not as a complete explanation of AWS's history.

Google Cloud draws a similar line between APIs designed for one-off integration and APIs designed for consumption. An integration API solves this week's connection. A consumption API assumes another developer will use it later, in a combination you did not plan. The second kind is slower to sketch and much cheaper over the life of a product.

The same principle applies to a typed package interface, an event schema, a GraphQL schema, an RPC service, a CLI, an MCP tool, or an agent tool definition. The common idea is an intentional, composable boundary.

I learned this on public HTTP, then on everything else. At Bitcash the matching engine, Hasura GraphQL APIs, and realtime indexer had to agree on what moved and who was allowed to move it. ChainGraph was a GraphQL subscription toolkit for streaming chain data: the query surface was the product for other developers, not an afterthought of the indexer internals. If the contract is implied by whatever the handler returned last Tuesday, you do not have an API. You have a leak.

## Product Leverage

An API separates a useful capability from a particular interface.

```text
capability
    ↓
API / contract
    ↓
web · mobile · CLI · automation · agent · partner
```

That split changes what the product can do later.

It creates optionality. You can add a client without cloning business logic. You can support a partner without forking the product. You can expose the same operation to an agent that will never see the screen. You can redesign the UI without pretending the capability moved.

It speeds experimentation. A contract is a cheaper place to try a product idea than a fully built interface. Mocks and stubs let a team feel the shape of a flow before the implementation is real. More importantly, a stable capability lets you try new distribution — a CLI, a partner, an embed — without waiting to rebuild the core.

It reduces accidental product coupling. When the web app talks to the database through whatever helper was nearby, the next interface inherits that helper's accidents: field names, error strings, auth checks that only exist on one route. When the capability has a boundary, product rules live once.

It keeps product intent aligned with implementation. Product names the capability: charge a card, invite a member, retrieve case context. The API names how another system asks for that capability, what success and failure look like, and how the applicable authorization requirement is expressed. Security owns who is allowed to ask and what they may access. If you leave the boundary to the handler, the product is whatever shipped.

It does not require every API to become a public developer platform. Postman's 2022 survey reported that 58 percent of the APIs respondents worked with were internal. The principle is not "open a marketplace." Important capabilities need intentional boundaries, including the ones only your own apps call.

## Engineering Leverage

An explicit contract is a stable boundary around a changing implementation.

Frontend and backend can move in parallel against the same shape. That is the boring, repeatedly validated benefit in API-first engineering writing from Postman, Google Cloud, and everyone who has waited on a handler to exist before building a screen. The deeper version is not "two teams go faster." It is that neither side has to impersonate the other. The UI can be wrong about visual hierarchy and still be right about the operation. The service can change storage and still honor the same request.

The boundary is what makes implementations replaceable. You can move from one framework, language, or datastore to another if consumers depend on the contract rather than the internals. Generated clients and types turn that contract into something compilers and agents can check. Contract tests catch drift while it is still a diff.

Versioning, idempotency, consistent errors, and auth at the boundary are how a product survives retries, partial failure, and more than one consumer. Those are engineering concerns with product consequences. An error dialect per endpoint is not a style issue. It is a product that cannot be automated reliably.

Composability follows. Small, intentional operations combine. Accidental god-handlers do not. Integration gets cheaper because the second consumer is not reverse-engineering the first.

None of this requires a particular protocol. HTTP and OpenAPI are common because they are inspectable. A typed module in a monorepo is still an API. An event is an API with a clock. An MCP tool is an API with a name, a schema, permissions, and a failure mode. Treat them with the same seriousness.

## In an Agentic System

Agents can operate interfaces, but structured contracts reduce ambiguity and coupling to presentation.

At Vercel Ship 2026, Ivan Zhao argued for designing structure and meaning before the interface because agents consume semantics and APIs. That is a useful design bias, not a literal claim that agents cannot see screens. Humans still need clear interfaces. A good tool for developers often serves agents well because both benefit from explicit capabilities.

Rauch's later point is the same shift from the other side. Agents read Markdown, run CLIs, call MCP tools, and make API calls. Software becomes more invisible: computers talking to computers to get someone an answer. If you are starting now, he argues, focus on the API — and do it for the agents.

Agent tools are APIs. A tool is a named capability with explicit inputs, outputs, permissions, and failure behavior. The [Model Context Protocol](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) makes that literal: `name`, `description`, `inputSchema`, optional `outputSchema`, annotations. If you invent those shapes on the fly in a prompt, you have the same accident as an undocumented HTTP handler, except now a model is guessing.

An intentional API therefore does two jobs at once. It is an architectural boundary between implementations. It is also a product surface for non-human consumers: scripts, partners, eval harnesses, coding agents, and in-product agents.

That does not make the UI irrelevant. The strongest products expose the same underlying capabilities through multiple interfaces. The API is the shared trunk. Web, mobile, CLI, automation, agents, and partners are branches. If you only build the branch you can see, the next consumer has nothing to attach to.

For coding agents working on the codebase, a contract is context they do not have to infer. They can inspect the spec, compare it to handlers and clients, and notice drift. They can generate types instead of inventing shapes. They can propose a contract change before coupling a second implementation. That only works if the boundary exists as an artifact, not as folklore in a handler.

## What "First" Does Not Mean

API First does not mean every product needs a public HTTP API.

It does not mean finishing OpenAPI before a prototype can run. A private, unstable contract can live in code until a second consumer appears. The moment that consumer exists — another app, a test suite that freezes the shape, an agent tool, a partner — the accident starts. Write the boundary down then, or a little before.

It does not mean designing for every future client. Optionality is not a permission to speculative-generality your way into abstraction soup. The smallest useful version is: name the capability, inputs, outputs, errors, applicable authorization requirement, and denial behavior. Security defines who may call; the API references and enforces that decision. The artifact can be a schema, typed function, or short spec. It does not have to be a platform program.

It does not block internal refactors while the contract is still private. Change the implementation freely. Change the contract on purpose.

It is not Product First. Product names the capability and why it exists. The API names how systems ask for it.

It is not Documentation First. The contract is the artifact consumers and machines depend on. Documentation explains why it looks that way and how to use it. Both can live in the repo. They are not the same file.

It is not Security First. Security owns who may invoke a capability and what they may access. API owns how that policy is represented and enforced at the contract boundary.

It is not spec-first as a religion. Generating OpenAPI from code can be fine if the generated contract is reviewed as a product decision. Hand-writing YAML is not the principle. Accidental coupling is.

## Spec

Apply this: [principles/API.md](../principles/API.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [Guillermo Rauch, "On APIs"](https://www.linkedin.com/pulse/apis-guillermo-rauch-aeupf) — companies that begin as APIs, complexity hidden behind a small surface, and why agents make that surface more important.
- [OpenAI, "OpenAI API" (11 June 2020)](https://openai.com/index/openai-api/) — first commercial product as a general-purpose API; integrate into existing products or invent new ones; models change behind a simple interface.
- [Vercel, "Vercel Ship 2026 recap"](https://vercel.com/blog/vercel-ship-2026-recap) — Ivan Zhao on designing API first and UI last because agents consume semantics, not screens. Read it as a split between human and machine interfaces, not as an argument that UI is finished.
- [Postman, "What is API-first?"](https://www.postman.com/api-first/) — API-first as product and organizational strategy, distinct from design-first / spec-first; private APIs as most of the work.
- [Google Cloud, "API design tips"](https://cloud.google.com/blog/products/api-management/google-cloud-api-design-tips) — APIs designed for consumption versus one-off integration.
- [Steve Yegge, platform rant (2011)](https://gist.github.com/chitchcock/1281611) — reconstruction of Amazon's ~2002 service-interface mandate; design as if the interface could be external.
- [Model Context Protocol, Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) — agent tools as named capabilities with schemas. The same principle, different transport.
- [Best Practices for Designing RESTful APIs](https://gaboesquivel.com/blog/2015-10-best-practices-for-designing-web-apis) — earlier notes on HTTP contracts; narrower than this principle, still useful when the boundary is REST.
