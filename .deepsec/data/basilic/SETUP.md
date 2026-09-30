# Agent setup for `basilic`

INFO.md is filled. Do not re-run the placeholder pass.

## Next (local, not this PR)

```bash
pnpm security:deepsec:scan
pnpm security:deepsec:process
```

`--project-id` is auto-resolved while there is only one project.

`scan` is regex-only (no AI). `process` needs `AI_GATEWAY_API_KEY`. Default agent is Grok 4.6 (`pi`). Alternate: `--agent codex --model gpt-5.6-sol`.

Custom matchers: wait for a revalidated true positive. See `node_modules/deepsec/dist/docs/writing-matchers.md`.
