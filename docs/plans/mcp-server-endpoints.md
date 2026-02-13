# Plan: MCP Server Endpoints for API Discovery & Agentic Integration

Enable external agentic systems (Cursor, Claude Desktop, custom agents) to discover and call the Basilic API via standard Model Context Protocol (MCP) endpoints.

## Assumptions

- Fastify app already serves OpenAPI at `/reference/openapi.json`; routes are source of truth
- MCP clients connect via HTTP+SSE transport (standard for remote servers)
- Auth: pass-through Bearer token from MCP client to API; optional API-key auth for agent-only access
- Vercel MCP URLs (`mcp.vercel.com/...`) are deployment-specific; we add explicit MCP routes so any deployment (Vercel, Cloud Run, ECS) exposes MCP

## References

- [MCP Specification 2024-11-05](https://modelcontextprotocol.io/specification/2024-11-05)
- [MCP Transports](https://modelcontextprotocol.io/specification/2024-11-05/basic/transports) — HTTP+SSE
- [MCP Tools](https://modelcontextprotocol.io/specification/2024-11-05/server/tools)
- [MCP Resources](https://modelcontextprotocol.io/specification/2024-11-05/server/resources)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- @.cursor/rules/backend/fastify.mdc
- @apps/docu/content/docs/adrs/009-api-architecture.mdx

---

## 1. MCP Endpoints to Add

| Endpoint            | Method | Purpose                                           |
|---------------------|--------|---------------------------------------------------|
| `/mcp/sse`          | GET    | SSE connection; server sends `endpoint` event      |
| `/mcp/messages`     | POST   | Client sends JSON-RPC messages; receives response |

MCP HTTP+SSE flow:
1. Client GETs `/mcp/sse` → receives `endpoint` event with `/mcp/messages` URL
2. Client POSTs JSON-RPC to `/mcp/messages` (initialize, tools/list, tools/call, etc.)
3. Server responds with JSON-RPC result or streams via SSE

---

## 2. MCP Capabilities to Expose

| Primitive | Capability   | Use Case                                              |
|-----------|--------------|-------------------------------------------------------|
| **Tools** | `tools`      | Call API operations as model-invokable tools         |
| **Resources** | `resources` | Expose OpenAPI spec for agent context                |

**Tools**: Each OpenAPI operation → one MCP tool. Naming: `{operationId}` or `{method}_{path}`. Example: `auth_magiclink_request`, `health_check`.

**Resources**:
- `api://basilic/openapi.json` — full OpenAPI spec (agent reads for docs)
- Optional: `api://basilic/operations` — human-readable operation list

---

## 3. Implementation Strategy

### Option A: @modelcontextprotocol/server + raw Node adapter (Recommended)

- Use `@modelcontextprotocol/server` for JSON-RPC handling
- Use `@modelcontextprotocol/node` for Streamable HTTP (or implement minimal SSE+POST adapter)
- Fastify raw route: `fastify.raw()` or inject into Node `req`/`res` for MCP transport
- Map OpenAPI spec → MCP tools at startup; `tools/call` dispatches to `fastify.inject()` internally

**Pros**: Official SDK, maintained, spec-compliant  
**Cons**: May need custom Fastify↔Node adapter if `@modelcontextprotocol/node` assumes Express-like API

### Option B: Community fastify-mcp plugin

- Evaluate `fastify-mcp` or `fastify-mcp-server` from npm
- Register tools/resources via plugin API

**Pros**: Fast integration  
**Cons**: Community-maintained, may lag SDK; verify HTTP+SSE support

### Option C: Minimal custom implementation

- Implement only: `initialize`, `notifications/initialized`, `tools/list`, `tools/call`, `resources/list`, `resources/read`
- Parse OpenAPI at startup; generate tool list; on `tools/call` → `fastify.inject()` to actual route

**Pros**: No new deps, full control  
**Cons**: More code, must track spec changes

**Recommendation**: Start with **Option A**; fall back to **Option C** if SDK integration is cumbersome.

---

## 4. OpenAPI → MCP Tools Mapping

```ts
// Pseudocode
for (const [path, pathItem] of Object.entries(openapi.paths)) {
  for (const method of ['get','post','put','patch','delete']) {
    const op = pathItem[method]
    if (!op) continue
    tools.push({
      name: op.operationId || `${method}_${path.replace(/\//g, '_')}`,
      description: op.summary || op.description || `${method.toUpperCase()} ${path}`,
      inputSchema: openApiParamsToJsonSchema(op.parameters, op.requestBody),
    })
  }
}
```

On `tools/call`:
1. Look up operation by name
2. Resolve path/method from OpenAPI
3. Build request (path params, query, body) from `arguments`
4. `fastify.inject({ method, url, payload, headers })`
5. Return `{ content: [{ type: 'text', text: JSON.stringify(response) }], isError: false }`

**Filtering**: Exclude auth/session routes from tools by default (or tag); expose via env `MCP_TOOLS_INCLUDE` / `MCP_TOOLS_EXCLUDE` if needed.

---

## 5. Security

| Concern         | Mitigation                                                                 |
|----------------|----------------------------------------------------------------------------|
| Origin header  | Validate `Origin` on SSE and POST (per MCP spec) to prevent DNS rebinding  |
| Auth           | Forward `Authorization: Bearer` from MCP request to `fastify.inject()`     |
| Rate limiting  | Apply existing Fastify rate-limit to `/mcp/*`                               |
| CORS           | Allow MCP client origins (configurable)                                    |

---

## 6. Discovery for External Agents

**Well-known URL**: Serve `/.well-known/mcp` (or `/mcp`) with a JSON descriptor:

```json
{
  "name": "basilic-api",
  "version": "1.0.0",
  "url": "https://api.basilic.example.com/mcp/sse",
  "description": "Basilic REST API - auth, health, AI chat, etc."
}
```

Agents configured with this URL can connect via MCP HTTP+SSE. Cursor `.cursor/mcp.json` example:

```json
{
  "mcpServers": {
    "basilic-api": {
      "url": "https://api.basilic.example.com/mcp/sse",
      "description": "Basilic REST API tools and resources"
    }
  }
}
```

---

## 7. File Structure

```
apps/fastify/src/
├── routes/
│   └── mcp/
│       ├── mcp.ts          # Plugin: registers /mcp/sse, /mcp/messages
│       ├── tools.ts        # OpenAPI → tools mapping, tools/call handler
│       ├── resources.ts    # resources/list, resources/read (OpenAPI spec)
│       └── transport.ts    # SSE + POST JSON-RPC transport
├── lib/
│   └── mcp/
│       ├── openapi-to-tools.ts
│       └── schema.ts       # MCP JSON-RPC types (minimal)
```

---

## 8. Testing

- **Unit**: `openapi-to-tools` mapping, `tools/call` → inject flow
- **Integration**: Vitest + fastify.inject — simulate MCP client: GET /mcp/sse, POST initialize, POST tools/list, POST tools/call
- **E2E**: Playwright or curl against real server

---

## 9. Rollout

1. Add MCP plugin behind feature flag `MCP_ENABLED=true` (default false for initial deploy)
2. Deploy; verify with MCP inspector or Cursor
3. Document in API docs and cursor-setup
4. Enable by default once stable

---

## 10. Checklist

- [ ] Add `@modelcontextprotocol/server` (and optionally `@modelcontextprotocol/node`) to `apps/fastify`
- [ ] Implement OpenAPI → MCP tools mapper
- [ ] Implement SSE + POST transport (or use SDK)
- [ ] Register `/mcp/sse` and `/mcp/messages` routes
- [ ] Expose OpenAPI spec as MCP resource
- [ ] Add Origin validation, auth passthrough, rate limit
- [ ] Add `/.well-known/mcp` discovery endpoint
- [ ] Write integration tests
- [ ] Document in API architecture and cursor-setup docs
