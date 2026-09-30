# create-basilic

Project starter: scaffold an independent Basilic API, web, and mobile monorepo. The documentation app, this generator, and `apps/agents` are not copied into the result.

The package is **not published on npm `latest` yet** (`0.0.0` in this tree). Until it is, assemble and run this CLI from the Basilic repository, then work in the generated directory. See [Getting Started](https://basilic-docs.vercel.app/docs/development).

```bash
npx create-basilic@latest my-app
npx create-basilic@latest my-app --yes
npx create-basilic@1.2.3 my-app
```

Requires **Node.js 24.x** and, after generation, **pnpm 12.5.1**.

`--yes` accepts safe defaults and never overwrites. The destination must be empty. Paths with spaces are supported.

The published tarball includes a sanitized, lockfile-valid template. The CLI does not need Git, GitHub, or Basilic workspace packages at runtime.

## After generate

```bash
cd my-app
pnpm setup
pnpm db:start
pnpm dev
```

Local starter docs: `docs/basilic/`. Hosted: [Product Ready](https://basilic-docs.vercel.app/docs/testing/product-ready).

Generated projects ship `skills-lock.json` and `scripts/setup-skills.mjs`; `pnpm setup` runs `pnpm setup:skills` to install into `.agents/skills/`. Documentation pointers are rewritten to the local snapshot. The agent contract (`AGENTS.md`, `.agents/rules/always.md`) ships with the tree.

The API CLI remains `packages/cli` (`basilic` binary). This package is only the project generator.

## Maintainers

From the Basilic repo:

```bash
pnpm --filter create-basilic test
CREATE_BASILIC_ALLOW_DIRTY=1 pnpm --filter create-basilic assemble
CREATE_BASILIC_LOCKFILE=1 pnpm --filter create-basilic assemble
CREATE_BASILIC_TEMPLATE_DIR=/tmp/basilic-template pnpm --filter create-basilic assemble
pnpm --filter create-basilic build
```

Assemble writes `tools/create-basilic/template/` by default (gitignored). Do not run `pnpm install` there — the parent workspace would claim it. CI assembles into `$RUNNER_TEMP` via `CREATE_BASILIC_TEMPLATE_DIR`.

Do not run `scripts/prepare-publish.mjs` for this package. Pack with `npm pack` from `tools/create-basilic` so the parent `.gitignore` `dist`/`bin` rules do not drop the payload (this package has `.npmignore`).

Generator copy tests run on Ubuntu, macOS, and Windows. Full-stack Product Ready remains Unix-oriented.
