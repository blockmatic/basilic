# Agents

This directory is a portable product factory in markdown. Load it before inventing a parallel method.

Do not load `maintainers/` on a product task. That folder is for people evolving FIRST.

## Load order

1. This file.
2. [ABOUT.md](ABOUT.md) — map, loops, stations, boundaries, human gates.
3. [FIRST.md](FIRST.md) — which stations this repository instantiates, and the path to each artifact.
4. The target repository's own instructions and skills. They override generic FIRST guidance.
5. Installed `/f-<station>` (`.agents/skills/f/f-<name>/`) for the primary station. Load a sibling skill only for boundaries the change actually crosses. Essays in `articles/` stay optional for humans.
6. The instance path listed in FIRST.md for that station.

Do not treat `articles/` as required input. Essays argue. Specs operate. If a human asked for the argument, read the matching article after the spec, not instead of it.

## Rules

Inspect before generating. Preserve intentional existing decisions. Distinguish facts, reasonable inferences, assumptions, and unresolved questions.

Propose the smallest useful change. Implement against the spec. Validate with the project's existing checks. Update durable project files when behavior or a decision changes.

Stop and ask a human for:

- product scope, priorities, success metrics, and go-to-market
- security-sensitive changes, secrets, and trust-boundary edits
- destructive operations (delete production data, force-push, drop a database, revoke access)

Do not silently invent the goal. If the product bet is missing, say so.

## Prompt

Apply the matching `/f-*` skill to this repository.

Name the primary station for the decision. Load another station only when the change crosses a boundary it owns; do not duplicate one station's policy in another station's artifact.

Read ABOUT.md, FIRST.md, and the matching `/f-*` skill before changing code or docs. Compare the spec to what the implementation actually does. Do not assume documentation is correct.

Preserve intentional existing decisions. Do not widen scope into a public platform, a new methodology, or a second analytics stack unless the product already is that.

When you change behavior that the spec names, update the durable artifacts in the same work.
