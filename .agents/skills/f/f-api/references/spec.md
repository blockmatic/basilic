# API First

## Principle

Define the capability and its boundary before consumers couple to an accidental implementation.

## Statement

I treat the capability and its boundary as a design decision, not an implementation leftover. Before a second consumer depends on a shape, I want to know what goes in, what comes out, what fails, which Security-owned authorization requirement applies, and how denial appears. That contract might be HTTP, a typed module, an event, a CLI, or an agent tool. Export the capability as a self-contained boundary — a bound port or equivalent — rather than as a leak of the process that happens to implement it. The format matters less than making the boundary explicit on purpose.

## Outcome

Meaningful boundaries have explicit inputs, outputs, errors, and references to applicable authorization requirements. Implementations enforce those requirements and conform, or the contract is updated deliberately. Agent tools have the same explicitness as HTTP routes. A second consumer can be written without reading the handler.

## Artifacts

- OpenAPI, GraphQL, protobuf, or equivalent schema
- Typed contracts in code (TypeBox, Zod, and similar)
- Error models plus Security-owned authorization requirements represented and enforced at the boundary
- Event definitions and integration specs
- Agent tool and MCP schemas
- Module or package interfaces that other packages actually import
- Generated clients or types, when the toolchain supports them
- Contract tests that fail when spec and implementation disagree

Do not force Markdown where a schema is the source of truth.

## Minimum Useful Artifact

- capability or operation name and purpose
- inputs, outputs, and stable identifiers
- error and denial behavior
- reference to the Security-owned authorization requirement
- idempotency and versioning decision when relevant
- one contract check that detects implementation drift

## Recipe

1. Inspect existing routes, schemas, clients, events, and tool definitions.
2. Understand which capabilities the product actually offers, and which consumers already depend on them.
3. Identify gaps: undocumented boundaries, spec/implementation drift, inconsistent errors or authorization enforcement, tools with no schema.
4. Propose the smallest useful contract change. Keep intentional existing decisions.
5. Make inputs, outputs, errors, applicable authorization requirements, and denial behavior explicit. Add idempotency and versioning only where they already matter.
6. Implement against the contract. Do not let the handler invent a parallel shape.
7. Validate with schema checks, contract tests, and the project's existing API tests.
8. Update the durable contract and generated artifacts when behavior changes.

## Validation

- A second consumer can be written against the contract without reading the handler.
- Request and response shapes match the documented contract, or the discrepancy is named.
- Errors follow one model, not a dialect per endpoint.
- Security-owned authorization policy is referenced and enforced at the boundary, not redefined or scattered as comments in handlers.
- Agent tools have name, inputs, outputs, and failure behavior.
- Breaking changes are visible before merge.

## Definition of Done

Contracts are documented and implementations conform, or discrepancies are named. Breaking changes are identified before merge.

## Agent Prompt

Apply API First to this repository.

Read existing API documentation, schema files, typed contracts, error models, Security-owned authorization rules, agent tool definitions, and the implementation that claims to follow them. Inspect handlers, clients, and tests. Do not assume the spec is correct.

Identify the capabilities the product actually offers and the boundaries those capabilities cross: HTTP, events, modules, CLIs, or agent tools. Separate what is explicit in a contract from what is implied by code.

Find drift and missing decisions: inputs, outputs, errors, authorization references and enforcement, idempotency, versioning. Preserve intentional existing API decisions. Do not define a new authorization policy here or widen scope into a public platform unless the product already is one.

Propose the smallest useful boundary: one operation, one event, or one tool made explicit. Implement against the contract. Validate with the project's existing schema and API checks. When behavior or a contract decision changes, update the durable API artifacts in the same work.

## Notes

**API vs Product:** Product names the capability and why it exists. API names how systems ask for it.

**API vs Architecture:** Architecture decides which parts communicate. API defines the contract across that boundary.

**API vs Data:** Data owns canonical domain meaning. API owns the consumer-facing representation and compatibility promise.

**API vs Security:** Security owns who may invoke a capability and what they may access. API owns how that requirement, credentials, and denial behavior appear and are enforced at the contract boundary.

**API vs Documentation:** The schema is the contract. Documentation explains why it looks that way.

**Navigation:** [Human essay](../articles/API.md) · [Factory map](../ABOUT.md)
