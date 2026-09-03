---
title: Data First
status: draft
description: Define canonical domain concepts, ownership, lifecycle, and change rules before stores, schemas, and events proliferate competing truths.
---

# Data First

## Principle

Define canonical domain concepts, ownership, lifecycle, and change rules before stores, schemas, and events proliferate competing truths.

## The Case

Features leave data behind. That state usually outlives the screen, route, service, and team that created it.

A customer exists in the application database, billing provider, CRM, analytics warehouse, and support tool. Each copy has a different identifier and a slightly different meaning of “active.” A field is renamed in one store and repurposed in another. Deletion removes the account but not the export. Nobody intended five truths. Each consumer made the locally convenient choice.

Data First names the decisions that keep representations from becoming competing realities: what a concept means, how it is identified, which source is authoritative, who owns it, which invariants must hold, how copies are derived, how the schema evolves, and when the data is retained or deleted.

This is not “choose a database first.” Storage technology is an architectural and implementation choice. The product needs a stable concept before it needs a table. A domain model can be a short glossary and a few relationships. The goal is shared meaning, not a diagramming ceremony.

Eric Evans's domain-driven design calls this a ubiquitous language: use the model in conversation and code so that translation does not quietly change the product. The useful part here is narrower than adopting all of DDD. Name the core concepts and their boundaries. Do not let `customer`, `account`, `member`, and `user` become synonyms by accident.

Integrity belongs as close to the data as practical. Types, unique keys, foreign keys, and check constraints prevent invalid states regardless of which caller writes them. Application validation still matters, especially for rules that cross context or time. The point is to choose where the invariant lives instead of hoping every writer remembers it.

Schema change is product change when durable meaning moves. Adding a nullable field may be easy. Splitting one identity into two, changing money units, or deleting historical records is not. Migrations need compatibility, backfill, rollback or recovery, and an explicit statement of what the old data becomes.

Agents amplify both sides. They can trace schemas and write migrations quickly. They can also create a new table, event, cache, or vector store without noticing that the concept already has an owner. A durable data map keeps speed from multiplying sources of truth.

## Product Leverage

Consistent data keeps the product from contradicting itself. If billing says a subscription is active while the application says it is canceled, the user experiences the weaker model, not the better schema.

Identity is product behavior. Merging accounts, inviting a member, exporting a case, or deleting a workspace all depend on what the system believes is the same entity. An unstable identity rule becomes duplicate notifications, missing history, or access granted to the wrong record.

Lifecycle is also part of trust. Retention can support recovery, audit, and learning. It can also preserve data the product no longer has a reason to hold. Product states the need; Security sets protection and policy; Data makes the lifecycle and implementation visible.

Analytics depends on the same foundation without owning it. Product names the event and metric. Data makes clear what entity the event refers to, which identifier is stable, and how derived tables relate to the source. A funnel built on ambiguous identity is a precise chart of an unclear product.

## Engineering Leverage

A canonical model reduces translation code. Services and interfaces can have representations suited to their consumers, but those representations map to one understood domain rather than inventing meaning independently.

Ownership makes incidents and changes routable. When a dataset has an authoritative source and owner, a stale copy has somewhere to reconcile. Without ownership, every correction is a negotiation between equal-looking tables.

Constraints turn assumptions into executable rules. A uniqueness requirement written only in a prompt can be violated by the next import. A constraint, test, or migration check can fail loudly.

Lineage makes derived data explainable. The warehouse, search index, cache, and embedding store may all be legitimate copies. Each needs a path back to authority, a refresh or invalidation rule, and a deletion story. “Eventually consistent” is not a lifecycle plan unless someone can say eventually by what mechanism.

Evolution deserves the same care as creation. Expand-and-contract migrations, versioned events, dual reads, and backfills are tools. The principle is that old and new representations coexist deliberately for a bounded period instead of becoming permanent parallel truths.

## In an Agentic System

Agents need canonical nouns. If two schemas use `case_id` differently, an agent will choose from proximity, naming, or examples. That is inference where the project needed a decision.

A coding agent should trace writes and reads before creating state. It should inspect migrations, events, analytics models, caches, and external sources—not only the primary ORM model. It should identify the owner and lifecycle before introducing another copy.

In-product agents create new data concerns: conversation history, retrieved context, tool results, embeddings, evaluations, and traces. Some are product state, some are quality datasets, and some are operational telemetry. Naming the owner prevents a debug log from quietly becoming a permanent customer record.

The agent may propose a model or migration. A human still decides consequential retention, deletion, residency, or product-meaning changes. Data First makes those gates visible before a generated migration runs.

## What "First" Does Not Mean

Data First does not mean buying a warehouse, adopting data mesh, or designing an enterprise ontology for a small application.

It does not mean every representation must be identical. API payloads, relational schemas, search documents, and analytics tables serve different jobs. They need explicit mappings and authority, not one physical format.

It is not Product First. Product owns outcomes, metrics, and event taxonomy. Data owns the meaning, authority, and lifecycle of the records.

It is not API First. API owns the external contract and compatibility promise. Data owns the canonical domain concepts behind it.

It is not Security First. Security owns access and protection policy. Data records classification, retention, deletion, and where copies exist so that policy can be enforced.

The smallest useful version is one domain concept with a definition, stable identity, authoritative source, owner, invariants, readers and writers, and deletion rule.

## Spec

Apply this: [principles/DATA.md](../principles/DATA.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [Eric Evans, *Domain-Driven Design Reference*](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) — putting a shared domain model and language to work.
- [Martin Kleppmann, *Designing Data-Intensive Applications*](https://martin.kleppmann.com/) — durable reasoning about data models, storage, replication, consistency, and evolution.
- [PostgreSQL, "Constraints"](https://www.postgresql.org/docs/current/ddl-constraints.html) — executable integrity through not-null, unique, primary-key, foreign-key, check, and exclusion constraints.
- [Martin Fowler, "Data Mesh Principles and Logical Architecture"](https://martinfowler.com/articles/data-mesh-principles.html) — domain-oriented ownership and data as a product at organizational scale; useful when the scale justifies it, not a default architecture.
