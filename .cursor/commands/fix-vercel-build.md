# Fix Vercel Build

## Overview
Retrieve Vercel build logs, analyze failures, and fix deployment issues. MUST use Vercel MCP tools.

## Steps
1. **Get build logs**: Use current branch (unless explicitly told otherwise), use Vercel MCP tools to retrieve build logs
2. **Analyze errors**: Parse logs for TypeScript/ESLint errors, missing dependencies, env vars, imports, config issues
3. **Fix issues**: Read affected files, apply fixes per project rules, resolve types/imports/lint errors, add missing deps, fix env/config

## Checklist
- [ ] Identified branch
- [ ] Build logs retrieved from latest deployment
- [ ] Errors identified and categorized
- [ ] Issues fixed per project rules
- [ ] All compilation/lint errors resolved
