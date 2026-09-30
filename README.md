# Basilic

Two independent pnpm workspaces live in this Git repository. Do not run `pnpm install` at the Git root. There is no application workspace there.

| Workspace | What it is | Local web |
| --- | --- | --- |
| [`base/`](base/) | Domain-agnostic starter and the source of `create-basilic` | https://basilic.localhost |
| [`example/`](example/) | Coin Tracker, the reference app | https://tracker.localhost |

Docs: https://basilic-docs.vercel.app

```bash
cd base
pnpm setup
pnpm dev
```

```bash
cd example
pnpm setup
pnpm dev
```

`pnpm dev` does not start Expo. In `base/`, start the mobile app with `pnpm --filter @repo/mobile start`.
