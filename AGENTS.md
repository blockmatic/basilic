# Repository agent instructions

This repository has one shared, **Cursor-first** AI development workflow. Other
agents use the same checked-in rules, skills, and documentation; do not create a
second workflow or a competing source of truth.

These instructions apply to the whole monorepo. A nested `AGENTS.md` adds or
overrides guidance for its subtree and must be read before changing files there.

## Start here

1. Read every `.cursor/rules/**/*.mdc` file with `alwaysApply: true`.
2. Read each additional rule whose `globs` match the files in scope. Repository
   rules are constraints and override optional skill guidance.
3. Read the relevant `.agents/skills/**/SKILL.md` when the user invokes a skill
   or the task clearly matches one. Workflow and technology skills come from
   [`blockmatic/basilic-skills`](https://github.com/blockmatic/basilic-skills).
4. Read the matching technical documentation under
   [`apps/docu/content/docs/`](apps/docu/content/docs/) before changing an
   architecture, convention, command, or documented behavior.
5. Read the target app or package `README.md` and `package.json` before choosing
   setup, generation, validation, or test commands.

Search first and keep reads targeted. Inspect the implementation, configuration,
and tests instead of relying on memory or assuming that documentation is current.

## FIRST decisions

Use FIRST when a task invokes `/f-*` or requires a durable product, journey,
architecture, data, API, documentation, workflow, quality, security, or
operations decision. Interface expression is Journeys. Automated delivery is
Workflow.

Load FIRST in this order:

1. [`_first/AGENTS.md`](_first/AGENTS.md)
2. [`_first/ABOUT.md`](_first/ABOUT.md)
3. [`_first/FIRST.md`](_first/FIRST.md)
4. The primary `/f-<station>` skill
5. The station artifact listed in `_first/FIRST.md`

FIRST station skills live under `.agents/skills/f/f-<name>/` and come from
[`blockmatic/first`](https://github.com/blockmatic/first).

Choose one primary station. Load another only when the work crosses a boundary it
owns. Do not load `_first/maintainers/` for product work. Durable Basilic product
intent, feature status, non-goals, and roadmap live in
[`_first/basilic/PRODUCT.md`](_first/basilic/PRODUCT.md); technical adopter
documentation lives in `apps/docu`.

## Working contract

- The user's request defines the outcome and scope. For implementation requests,
  continue through the smallest complete change and appropriate verification;
  do not stop after proposing a plan. For review or diagnosis requests, remain
  read-only unless the user also asks for changes.
- Inspect before editing, preserve intentional decisions, reuse existing code and
  workspace packages, and solve the root cause with the smallest useful diff.
- Make routine, reversible assumptions when needed and state the assumptions that
  materially affect the result. Ask before deciding product scope, priorities,
  success metrics, go-to-market, trust-boundary or secret-handling changes, and
  destructive or difficult-to-reverse operations.
- Preserve unrelated and uncommitted user changes. Never discard work to obtain a
  clean tree.
- Use `pnpm` and existing Turbo or workspace scripts. Do not substitute another
  package manager or invent commands that are not present in package scripts.
- Never edit generated OpenAPI output, generated API clients, or generated
  migration SQL directly. Change the owning source and run the documented
  generator or migration workflow.
- Keep secrets out of output and committed files. Use the repository's example
  environment-file conventions and obvious placeholders.
- Do not commit, push, create or merge a pull request, deploy, publish, or mutate
  external systems unless the user requests that action. Never bypass hooks or
  force-push.

"Do not run a parallel process" means do not invent a parallel development
methodology, rule tree, product brief, roadmap, or documentation hierarchy.
Batching independent reads and checks is encouraged when it improves turnaround
without creating conflicting edits or duplicate work.

## Validation and durable context

- Prove changes with the narrowest relevant checks first. Run affected tests,
  type checks, linting, generation checks, or broader `pnpm qa` in proportion to
  the change and the applicable workflow skill.
- Do not claim completion when required checks failed or were not run. Report the
  exact remaining failure or unverified behavior.
- When behavior, architecture, commands, or conventions change, update the
  matching MDX page and nearest README in the same work.
- Update `_first/basilic/PRODUCT.md` only when product goals, feature status,
  non-goals, metrics, or roadmap horizons change. Passing `pnpm qa` is Workflow
  evidence, not product success.
- When creating a plan, include a `## References` section listing the rules,
  skills, and documentation used.

Finish with a concise, outcome-first summary: what changed, where it changed,
which checks passed, and any actionable blocker. Distinguish verified facts,
reasonable inferences, assumptions, and unresolved questions.

Full workflow details:
[`apps/docu/content/docs/development/ai-workflow.mdx`](apps/docu/content/docs/development/ai-workflow.mdx).
