# @repo/cli

TypeScript CLI for the Basilic Fastify API via `@repo/core`. API key auth only; auth endpoints excluded. For developers, scripts, and agents in a shell. Docs: [CLI](https://basilic-docs.vercel.app/docs/development/cli).

## Usage

```bash
pnpm --filter @repo/cli build
node packages/cli/dist/cli.js --help
```

Stdout is always JSON. There is no `--json` flag.

## Auth

Requires an API key. Prefer env in non-interactive environments.

1. `API_KEY` or `BASILIC_API_KEY`
2. Config file (`~/.config/basilic/config.json` or `$XDG_CONFIG_HOME/basilic/config.json`)
3. Interactive prompt (saves to config)

```bash
export API_KEY=bask_xxx_yyy
basilic config set-api-key bask_xxx_yyy
```

## Commands

Commands mirror core API nesting (excluding auth): `health-check`, `account apikeys create`, `account apikeys list`, `ai generate`, `list-agents`. Use `--help` on any command.

## Local testing

1. Start API: `pnpm dev`
2. Create an API key via the web app or `POST /account/apikeys/` with a JWT
3. Run:

   ```bash
   API_KEY=bask_xxx node packages/cli/dist/cli.js health-check
   API_KEY=bask_xxx node packages/cli/dist/cli.js account apikeys list
   ```

Basilic does not ship an API MCP server.
