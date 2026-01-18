# Build UI Component

Build shadcn/ui components following monorepo structure and coding standards.

## Overview

Create or update shadcn/ui components using MCP servers for component discovery, ensuring proper installation in the `@repo/ui` package structure and adherence to monorepo patterns.

## Steps

1. **Use MCP servers for component discovery**
   - Use `shadcnui-official` for single components, variants, and canonical patterns
   - Use `shadcnui-jpisnice-react` for full blocks, demos, and page templates
   - Only call MCP when unsure about implementation or encountering errors

2. **Install in `@repo/ui` package structure**
   - Install components in `packages/ui/src/components/`
   - Ensure `components.json` points to `@repo/ui/lib/utils` and `@repo/ui/components`
   - Follow existing component organization patterns

3. **Follow monorepo import patterns**
   - Import from `@repo/ui/components/*`, never directly from packages/ui
   - Use `@repo/ui/lib/utils` for utilities like `cn`
   - Import Radix primitives from `@repo/ui/radix`, never directly from `@radix-ui/react-*`

4. **Apply coding standards**
   - Follow TypeScript rules: use interfaces, type inference, RORO pattern
   - Use class-variance-authority (cva) for variants
   - Apply mobile-first responsive design
   - Follow linting rules (Biome + ESLint)

5. **Verify and test**
   - Run `pnpm lint:fix` to ensure code quality
   - Verify imports work correctly in consuming apps
   - Test component functionality and responsiveness

## Checklist

- [ ] Component installed in `packages/ui/src/components/`
- [ ] Imports use `@repo/ui/components/*` pattern
- [ ] Radix primitives imported from `@repo/ui/radix`
- [ ] TypeScript types properly defined (interfaces, inference)
- [ ] Variants use `cva` pattern
- [ ] Mobile-first responsive design applied
- [ ] Code passes `pnpm lint`
- [ ] Component tested in consuming app

## Related Rules

- @.cursor/rules/frontend/shadcnui.mdc - Component patterns and MCP server usage
- @.cursor/rules/base/typescript.mdc - TypeScript standards
- @.cursor/rules/frontend/mobile-first.mdc - Responsive design guidelines
- @.cursor/rules/base/linting.mdc - Linting requirements
