# create-basilic

Scaffold an independent Basilic API, web, and mobile monorepo. The documentation app and this generator are not copied into the result.

```bash
npx create-basilic@latest my-app
npx create-basilic@latest my-app --yes
npx create-basilic@1.2.3 my-app
```

Requires **Node.js 24.x** and, after generation, **pnpm 11.24.0**.

`--yes` accepts safe defaults and never overwrites. The destination must be empty. Paths with spaces are supported.

The published tarball includes a sanitized, lockfile-valid template. The CLI does not need Git, GitHub, or Basilic workspace packages at runtime.

## After generate

```bash
cd my-app
pnpm setup
pnpm --filter @repo/api db:start
pnpm reset
pnpm dev
```

Local starter docs: `docs/basilic/`. Hosted: [Product Ready](https://basilic-docs.vercel.app/docs/testing/product-ready).

Generated projects retain the `/b` workflow catalog and its packaged checklists; documentation pointers are rewritten to the local snapshot.

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
