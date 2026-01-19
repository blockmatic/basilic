# Build UI Component

Build shadcn/ui components following monorepo structure and coding standards.

## Overview
Create or update shadcn/ui components using MCP servers for component discovery, ensuring proper installation in `@repo/ui` package structure and adherence to monorepo patterns.

## Steps
1. **Use MCP servers**: Use `shadcnui-official` for single components/variants/canonical patterns, use `shadcnui-jpisnice-react` for full blocks/demos/page templates, only call MCP when unsure about implementation or encountering errors
2. **Install in `@repo/ui`**: Install components in `packages/ui/src/components/`, ensure `components.json` points to `@repo/ui/lib/utils` and `@repo/ui/components`, follow existing component organization patterns
3. **Follow monorepo import patterns**: Import from `@repo/ui/components/*` never directly from packages/ui, use `@repo/ui/lib/utils` for utilities like `cn`, import Radix primitives from `@repo/ui/radix` never directly from `@radix-ui/react-*`
4. **Apply coding standards**: Follow TypeScript rules (interfaces, type inference, RORO pattern), use class-variance-authority (cva) for variants, apply mobile-first responsive design, follow linting rules (Biome + ESLint)
5. **Verify and test**: Run `pnpm lint:fix` to ensure code quality, verify imports work correctly in consuming apps, test component functionality and responsiveness

## Checklist
- [ ] Component installed in `packages/ui/src/components/`
- [ ] Imports use `@repo/ui/components/*` pattern
- [ ] Radix primitives imported from `@repo/ui/radix`
- [ ] TypeScript types properly defined (interfaces, inference)
- [ ] Variants use `cva` pattern
- [ ] Mobile-first responsive design applied
- [ ] Code follows ESLint and Biome rules (formatting, style, correctness)
- [ ] Component tested in consuming app
