Retrieve Vercel build logs, analyze failures, and fix deployment issues. MUST use Vercel MCP tools. Follow architecture, strategies, and decisions in `@apps/docu/`. After implementation (for both new features and fixes), update docs, readme, and cursor rules if required to keep them aligned.

1. **Get build logs**: Use current branch (unless explicitly told otherwise), use Vercel MCP tools to retrieve build logs
2. **Analyze errors**: Parse logs for TypeScript/ESLint errors, missing dependencies, env vars, imports, config issues
3. **Fix issues**: Read affected files, apply fixes per project rules, resolve types/imports/lint errors, add missing deps, fix env/config, commit changes
