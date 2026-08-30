# deepsec

This directory holds the [deepsec](https://www.npmjs.com/package/deepsec)
config for the parent repo. Checked into git so teammates inherit
project context (auth shape, threat model, custom matchers); generated
scan output is gitignored.

Currently configured project: `basilic` (target: `..`).

## Setup

`npx deepsec init` created this workspace and normally completes its
install, exact Vercel project link, Sandbox/model probes, threat model,
coverage-guided scans, custom matchers, and first AI processing run.

If setup was interrupted, run `pnpm deepsec setup` here or re-run the
original init command. Checkpoints in `data/basilic/setup/setup-state.json`
skip completed work. The linked Vercel project is always in Sandbox scope.

Use `--model-auth direct --ai-provider <provider>
--ai-api-key-env <ENV_NAME>` to use a user-owned model credential; secret
values remain in the environment or `.env.local`. Use `--model-auth local`
to rely on a machine-wide `claude`/`codex` login instead — no API key or
env vars needed.

From the monorepo root: `pnpm security:deepsec:scan`, `pnpm security:deepsec:process:diff` (GPT-5.6 Sol / Codex), `pnpm security:deepsec:process:diff:grok` (Cursor Grok 4.6 / Pi), `pnpm security:deepsec:process`, `pnpm security:deepsec:report`. CI uses Sol GPT on same-repo PRs from OWNER, MEMBER, or COLLABORATOR (`.github/workflows/deepsec.yml`). Not in pre-commit or `security.yml`.

pnpm 11 rejects lockfile entries younger than 24 hours (`minimumReleaseAge`). Security patches published inside that window go in `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` (currently `qs@6.16.0` for CVE-2026-82417 / CVE-2026-82562). Install scripts must be listed under `allowBuilds` (`true` to run, `false` to skip).

## Daily commands

```bash
pnpm deepsec scan
pnpm deepsec process     --concurrency 5
pnpm deepsec revalidate  --concurrency 5                  # cuts FP rate
pnpm deepsec export      --format md-dir --out ./findings
```

`--project-id` is auto-resolved while there's only one project in
`deepsec.config.ts`. Once you've added a second project, pass
`--project-id basilic` (or whichever id you want) explicitly.

`scan` is free (regex only). `process` is the AI stage (Codex /
`gpt-5.6-sol` by default). Run state goes to `data/basilic/`.

## Adding another project

To scan another codebase from this same `.deepsec/`:

```bash
pnpm deepsec init-project ../some-other-package   # path relative to .deepsec/
```

Appends an entry to `deepsec.config.ts` and writes
`data/<id>/{INFO.md,SETUP.md,project.json}`. Open the new SETUP.md
in your agent to fill in INFO.md.

## Layout

```text
deepsec.config.ts        Project list (one entry per scanned repo)
data/basilic/
  INFO.md                Repo context — checked into git, hand-curated
  SETUP.md               Agent setup prompt — checked in, deletable
  project.json           Generated (gitignored)
  files/                 One JSON per scanned source file (gitignored)
  runs/                  Run metadata (gitignored)
  reports/               Generated markdown reports (gitignored)
AGENTS.md                Pointer for coding agents
.env.local               Tokens (gitignored)
```

## Docs

After `pnpm install`:

- Skill: `node_modules/deepsec/SKILL.md`
- Full docs: `node_modules/deepsec/dist/docs/{getting-started,configuration,models,writing-matchers,plugins,architecture,data-layout,vercel-setup,faq}.md`

Or browse on
[GitHub](https://github.com/vercel/deepsec/tree/main/docs).
