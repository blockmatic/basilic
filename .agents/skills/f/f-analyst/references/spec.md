# Data First

## Principle

Define canonical domain concepts, ownership, lifecycle, and change rules before stores, schemas, and events proliferate competing truths.

## Statement

I treat data as durable product state with meaning, ownership, and a lifecycle—not as columns left behind by features. Before several stores or consumers encode the same concept differently, I want to know what the concept means, which system is authoritative, how identity works, how it changes, how long it lives, and how it is removed.

## Outcome

Core domain concepts have shared names and definitions. Each important dataset has an owner and authoritative source. Identity, constraints, retention, deletion, lineage, and schema evolution are explicit at the level the product needs. Session and long-term conversational memory are backing-service state with an owner, retention, and deletion — not process memory and not eval datasets. Migrations preserve or deliberately transform meaning. Copies do not silently become competing sources of truth.

## Artifacts

- Domain glossary or lightweight conceptual model
- Source-of-truth and ownership map for important datasets
- Logical schemas and integrity constraints
- Identity and deduplication rules
- Retention, deletion, residency, and archival rules
- Migration and schema-evolution plans
- Lineage notes for derived or replicated data
- Data quality rules tied to domain invariants

Use executable schemas and constraints as sources of truth when they can express the rule. Markdown explains meaning, ownership, and decisions the schema cannot.

## Minimum Useful Artifact

For one domain concept, record:

- name and plain-language definition
- stable identity and key invariants
- authoritative owner and source
- writers, readers, and derived copies
- retention/deletion rule
- current schema version or migration risk

## Recipe

1. Inspect schemas, migrations, models, events, analytics tables, caches, and external data sources.
2. Understand the core domain concepts and where each is created, changed, copied, and deleted.
3. Identify gaps: competing definitions, unclear ownership, weak identity, unenforced invariants, stale copies, or unsafe migrations.
4. Propose the smallest useful clarification—one concept, owner, constraint, lineage path, or migration rule.
5. Define canonical meaning and authority before choosing a new store or representation.
6. Implement constraints and migrations with rollback, compatibility, and backfill needs made explicit.
7. Validate existing data, read/write paths, derived copies, and deletion behavior.
8. Update durable data artifacts when meaning, ownership, lifecycle, or schema changes.

## Validation

- A contributor can identify the authoritative source and owner for each critical dataset.
- Core concepts have one canonical meaning even when several representations exist.
- Domain invariants are enforced in the strongest practical layer.
- Schema changes include compatibility, migration, and rollback or recovery reasoning.
- Retention and deletion behavior match Security and product requirements.

## Definition of Done

The affected domain concepts, ownership, invariants, lifecycle, and evolution rules are explicit. Implementations and migrations preserve them, or deliberate transformations and unresolved risks are documented.

## Agent Prompt

Apply Data First to this repository.

Read domain documentation, schemas, migrations, models, events, analytics definitions, retention rules, and the implementation that reads and writes them. Trace important data from creation through copies and deletion. Do not assume the database schema expresses the whole domain model.

Identify competing truths, unclear ownership, unstable identity, missing constraints, unsafe evolution, and stale derived data. Preserve intentional existing models. Do not introduce a data platform, warehouse, event bus, or new source of truth unless the product already needs one.

Propose the smallest useful data decision. Implement constraints and migrations using existing project patterns. Validate real read/write paths and existing data where safe. Update durable artifacts when meaning, ownership, lifecycle, or schema changes.

## Notes

**Data vs Product:** Product owns event taxonomy and the outcomes to measure. Data owns the meaning, authority, and lifecycle of the resulting records.

**Data vs Architecture:** Architecture places stores and requires a stateless process. Data defines what the state means and which source is authoritative, including conversational memory in a backing store.

**Data vs Journeys:** Journeys owns resume and turn-taking in the job. Data owns the memory store.

**Data vs API:** Data owns the canonical domain model. API owns the external representation and compatibility contract.

**Data vs Security:** Data records classification, retention, and deletion requirements. Security owns access policy and protection.

**Data vs Quality:** Data owns domain invariants and dataset integrity. Quality owns release gates and eval datasets.

**Data vs Operations:** Data owns product state and lineage. Operations owns telemetry about system health.

**Navigation:** [Human essay](../articles/DATA.md) · [Factory map](../ABOUT.md)
