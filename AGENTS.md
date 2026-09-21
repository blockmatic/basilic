# Repository agent instructions

This repository has one shared agent contract: this file plus
`.agents/skills/` (committed tech/pattern skills and Basilic `/w-*`
playbooks). Cursor slash, glob `.mdc` attach, and `.cursor/mcp.json`
are adapters. Other harnesses load the same contract through this file and
open `SKILL.md` when there is no `/` menu. Do not create a second workflow
or a competing source of truth.

These instructions apply to the whole monorepo. A nested `AGENTS.md` adds or
overrides guidance for its subtree and must be read before changing files there.

## Start here

1. Always-on constraints are **this file**. Do not chase `.cursor/rules` for the
   global contract.
2. When editing files that match a glob in [File-scoped rules](#file-scoped-rules),
   read that `.cursor/rules` file (Cursor auto-attaches it).
3. Read `.agents/skills/<name>/SKILL.md` when the user invokes a skill or the
   task matches (after `pnpm setup` / `pnpm setup:skills`, which runs
   `skills add` for `blockmatic/basilic-skills --all` plus allowed extra
   catalogs, then restores `skills-lock.json`). Daily path: Basilic `/w-*` under
   `.agents/skills/w-<name>/` (`/w-plan`, `/w-grill`, `/w-wayfinder`,
   `/w-build`, `/w-ship`). If the harness has no `/` menu, open the
   `SKILL.md` file. Catalog:
   [`blockmatic/basilic-skills`](https://github.com/blockmatic/basilic-skills).
4. Read the matching technical documentation under
   [`apps/docu/content/docs/`](apps/docu/content/docs/) before changing an
   architecture, convention, command, or documented behavior.
5. Read the target app or package `README.md` and `package.json` before choosing
   setup, generation, validation, or test commands.

Search first and keep reads targeted. Inspect the implementation, configuration,
and tests instead of relying on memory or assuming that documentation is current.

## Always-on contract

### Behavior

- Docs: technical MDX in `apps/docu/content/docs/`.
  Visual language: `DESIGN.md`. **Read** the matching file. Do not `@`-attach
  docs from rules or skills. Daily path: Basilic `/w-*`
  (`/w-plan`, `/w-grill`, `/w-wayfinder`, `/w-build`, `/w-commit` …
  `/w-ship`). `/w-build` does not commit. Publish with `/w-ship`.
- After features/fixes: same change, update that MDX and nearest README if
  behavior, commands, or conventions changed; glob `.mdc` only if a Cursor-scoped
  constraint changed.
- When creating plans add a ## References section listing rules, skills, and
  MDX pages used.
- Summarize assumptions in 3–5 bullets.
- Respect read-only / review requests (do not edit unless the user also asked).
- Verify before destructive operations.
- Defer to the user for ambiguous, high-risk decisions.
- Never ask before modifying files (including dotfiles).
- Provide concise summaries when finishing.
- Search first (Grep/Glob), read later. Targeted reads over broad exploration.
- Maximize parallel calls (batch file reads/searches). Spawn 2–3 read-only
  explorers for independent angles (`/w-council`); git and publish stay
  single-writer.

### Workflow

- Plan first for non-trivial tasks (3+ steps, architectural decisions); re-plan
  if stuck. `/w-plan` explores via `/w-council` first. `/w-grill` stress-tests
  a plan. `/w-wayfinder` charts fog bigger than one session. Keep a focused
  task list for multi-step work.
- On user correction: acknowledge the mistake and adjust (avoid repeating it).
- Don't mark complete without proving it works (run tests, check logs, diff
  behavior).
- For non-trivial changes: pause for a simpler approach; avoid hacky fixes.
- Bug reports: fix autonomously—use logs, errors, failing tests; fix CI without
  being told.

### Code quality

- Simplicity first, minimal impact—change only what is necessary.
- Find the root cause; no temporary fixes.
- Collocate related functionality.
- ALWAYS follow linting rules: eslint, biome.
- Search for existing functionality before creating new.
- Always use existing packages in the codebase before writing custom code.
- Never use console; use `@repo/utils/logger/server` or `@repo/utils/logger/client`.
- Use `@repo/error` for error handling.
- Use `t3-oss` packages for environment variable validation.
- Prefer app `lib/env.ts` values with defaults over global constants; never use
  global constants (e.g. `constants.ts` or scattered `export const X = ...`).
  Put config values in `lib/env.ts` as env vars with defaults or exported
  constants collocated there.
- Use `lodash-es` (per-function imports).

### Naming

- No UPPER_SNAKE_CASE constants—use camelCase for all variables and const
  declarations.
- Uppercase allowed only for env var keys (e.g. `env.DATABASE_URL`,
  `process.env.NODE_ENV`).
- Prefer collocation: keep data in the same file as its consumer; avoid
  separate `*-titles.ts`, `*-constants.ts` files.
- Use `const titles = {}` in the same file, not `const PAGE_TITLES` in a
  separate file.

### File organization

- Group 2+ related implementation files in a kebab-case folder; `index.ts` is
  the public API (named re-exports in apps, not `export *` mega-barrels).
- Single-file modules stay files; colocate tests (`*.test.ts`, `*.spec.ts`)
  beside implementation.
- Drop the folder-name prefix inside the folder (`oauth-google.ts` →
  `oauth/google.ts`). Import the group from outside (`.../lib/oauth/index.js`);
  import siblings directly inside the folder.
- Never add a parent mega-barrel (`lib/index.ts`, `components/ui/index.ts`).
  Never `foo/foo.ts` plus a thin re-export index. Never `foo.ts` beside `foo/`
  (basename collision).
- Same runtime for all exports → folder with unifying `index.ts`. Mixed
  runtimes (server/client) → folder with named entry files and no unifying
  index.
- Exceptions: Fastify autoload `routes/` and `plugins/` (no `index.ts` there);
  shadcn `@repo/ui/components/*`; generated `packages/core/src/gen`; Drizzle
  `packages/db/src/schema/index.ts`; package subpath indexes that are the implementation
  (`packages/utils/src/data/index.ts`); named entries that would cycle
  (`catalogs/mapper.ts`).
- Decision tree:
  `apps/docu/content/docs/development/file-organization.mdx`.

### Git

- Use default global git user (`git config --global user.name`,
  `git config --global user.email`)—never cursor/system identity.
- Never `--no-verify` or `--trailer` (e.g. Co-authored-by).
- Fix lint, type-check, and test failures before committing.
- Conventional Commits: `<type>(<scope>): <short summary>` — type/scope
  lowercase, summary imperative, ≤60 chars, no period. Scope: app (`next`,
  `fastify`, `docu`), package (`ui`, `core`, `utils`), or omit.
- Branch/validate/commit/push/PR: read
  `.agents/skills/w-ship/SKILL.md`. Commit message:
  `.agents/skills/w-commit/SKILL.md`. Slash names `/w-ship`,
  `/w-push`, `/w-commit`, and `/w-pr` are Cursor extras.

### GitHub Actions

- Inspect PR checks, workflow runs, logs, artifacts, and reruns with **`gh`**
  (authenticated for the repo remote).
- Common commands: `gh pr checks`, `gh run list --branch "$(git branch --show-current)"`,
  `gh run view <id> --log-failed`, `gh run watch <id>`, `gh run download <id>`.
- Never use GitHub MCP for Actions — logs, artifacts, and reruns belong to the
  CLI.
- `/w-gha` follows this rule; do not add `gh run watch` to
  `/w-push` or `/w-ship`.

## File-scoped rules

Cursor attaches these by glob. Other harnesses should read the matching file
when those paths are in scope.

| When editing | Read |
| --- | --- |
| `**/*.{ts,tsx}` | `.cursor/rules/base/typescript.mdc` |
| `apps/docu/**/*.mdx` | `.cursor/rules/base/docs.mdc` |
| `**/README.md` | `.cursor/rules/base/readme.mdc` |
| `**/.env.*.example` | `.cursor/rules/base/env-files.mdc` |
| `apps/web/**/*.{tsx,css}` | `.cursor/rules/frontend/nextjs.mdc`, `design.mdc`, `mobile-first.mdc` |
| `**/*.{tsx,css}` | `.cursor/rules/frontend/react.mdc`, `react-hooks.mdc` |
| `apps/web/**/*`, `packages/ui/**/*`, `packages/react/**/*` | `.cursor/rules/frontend/stack.mdc` |
| `apps/web/**/*.{tsx,css}`, `packages/ui/**/*.{tsx,css}` | `.cursor/rules/frontend/shadcnui.mdc` |
| `apps/web/**/*`, `packages/core/**/*`, `packages/react/**/*` | `.cursor/rules/frontend/auth.mdc` |
| `apps/mobile/**/*` | `.cursor/rules/frontend/expo.mdc` |
| web/api Playwright paths | `.cursor/rules/frontend/e2e-playwright.mdc` |
| `apps/api/**/*` | `.cursor/rules/backend/fastify.mdc` |
| `.agents/skills/**/*` | `.cursor/rules/cursor/skills.mdc` |
| `.cursor/rules/**/*.mdc` | `.cursor/rules/cursor/rules.mdc` |
| web3 / viem / wagmi / solana / cosmos / ponder | `.cursor/rules/web3/*.mdc` matching the stack |

## Product and docs

Visual language is [`DESIGN.md`](DESIGN.md). Technical adopter documentation
lives in `apps/docu`. Read the matching MDX or ADR before changing an
architecture, convention, command, or documented behavior. Durable agents:
[ADR 014](apps/docu/content/docs/adrs/014-fastify-eve-vercel-runtime.mdx) and
[`architecture/eve.mdx`](apps/docu/content/docs/architecture/eve.mdx) (hello in
`apps/agents`). Do not create `PRODUCT.md` or `ROADMAP.md`.

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
- Passing `pnpm qa` is local/CI evidence, not product success.
- When creating a plan, include a `## References` section listing the rules,
  skills, and documentation used.

Finish with a concise, outcome-first summary: what changed, where it changed,
which checks passed, and any actionable blocker. Distinguish verified facts,
reasonable inferences, assumptions, and unresolved questions.

## Harness extras

These are loaders and UX, not a second contract.

- **Cursor:** glob auto-attach for `.cursor/rules`; slash skills (Basilic
  `/w-plan` `/w-grill` `/w-wayfinder` `/w-*`); MCP in `.cursor/mcp.json`.
- **Claude Code:** reads this file. Project skills are `.agents/skills/`
  (not committed `.claude/skills/`).
- **Antigravity:** workspace rules in `.agents/rules/`; skills in
  `.agents/skills/`.
- **Gemini CLI:** reads this file. Skills share `.agents/skills/`.

Full workflow details:
[`apps/docu/content/docs/development/ai-workflow.mdx`](apps/docu/content/docs/development/ai-workflow.mdx).
