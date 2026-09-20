---
name: eve
description: Build durable backend AI agents with the eve framework. Use when creating, editing, or debugging an eve project — agent instructions, skills, tools, connections, channels, sandboxes, subagents, schedules, or evals.
---

# eve

eve is a filesystem-first framework for durable backend AI agents. An agent is
a directory on disk — instructions, skills, tools, connections, channels,
subagents, and schedules are all files — and eve compiles and runs it.

## Scope

- Applies to: eve filesystem agents, local `eve` CLI, Workflow/Sandbox adapters
- Does NOT cover: short request-handler tool loops (see [ai-sdk-core-v7](../ai-sdk-core-v7/SKILL.md)), public OpenAPI product HTTP

## Assumptions

- Bundled `node_modules/eve/docs/` matches the installed package; read it before writing eve code
- Product HTTP and durable agents can be sibling processes

## Principles

- An agent is files on disk; eve compiles and runs that directory
- Domain functions stay callable from HTTP tools and from eve tools

## Constraints

### MUST

- Read `node_modules/eve/docs/README.md` (or `npx eve init` docs) before scaffolding
- Keep durable sessions in the eve app, not by wrapping the product API host as eve

### AVOID

- Mounting `/eve/` or `/.well-known/workflow/` on the product OpenAPI HTTP host
- Replacing Fastify with Nitro as the product API
- Advertising MCP because eve is present

## Interactions

- Complements [ai-sdk-core-v7](../ai-sdk-core-v7/SKILL.md), [fastify-v5](../fastify-v5/SKILL.md)

## Source of truth

The complete documentation ships inside the `eve` package. Do not rely on this
skill for guidance — always read the bundled docs, which match the installed
version exactly:

```
node_modules/eve/docs/
```

Start with `node_modules/eve/docs/README.md`. It contains the full
index and recommended reading order. Before writing any eve code, read the
relevant guide there first.

If `eve` is not installed yet, install it (`npm install eve`) or scaffold a new
agent with `npx eve init <agent-name>`, then read the bundled docs.
