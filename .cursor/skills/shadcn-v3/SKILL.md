---
name: Tailwind v4 + shadcn/ui
description: |
  Set up Tailwind v4 with shadcn/ui using @theme inline pattern and CSS variable architecture. Includes component composition patterns, accessibility guidelines, and React Hook Form integration.
  
  Use when: initializing React projects with Tailwind v4, setting up shadcn/ui dark mode, composing/extending components, implementing forms, ensuring accessibility, or fixing colors not working, theme not applying, CSS variables broken, tw-animate-css errors, or migrating from v3.
---

# Skill: shadcn

## Scope

- Applies to: Tailwind v4 with shadcn/ui setup, CSS variable architecture, dark mode, theme configuration, component composition patterns, accessibility, form integration
- Does NOT cover: Tailwind v3, PostCSS configuration

## Assumptions

- Tailwind CSS v4+
- shadcn/ui latest
- Vite (use `@tailwindcss/vite` plugin)
- React 18+ or Next.js 14+
- TypeScript 5+

## Principles

- Use `@theme inline` to map CSS variables to Tailwind tokens
- Use `hsl()` wrapper for color values in `:root` and `.dark`
- Set `"tailwind.config": ""` in `components.json` (empty for v4)
- Delete `tailwind.config.ts` if it exists (v4 uses CSS-based config)
- Use `@tailwindcss/vite` plugin (not PostCSS)
- Use `cn()` utility for conditional classes
- Semantic colors automatically adapt to dark mode (no `dark:` variants needed)
- Use `@plugin` directive for plugins (not `@import` or `require()`)
- Compose complex components from smaller shadcn primitives
- Extend components via wrapper pattern (don't modify originals)
- Use CVA (class-variance-authority) for variant systems
- Always use `forwardRef` for form-compatible components
- Leverage Radix UI primitives for built-in accessibility

## Constraints

### MUST

- Wrap color values with `hsl()` in `:root` and `.dark`
- Use `@theme inline` to map all CSS variables
- Set `"tailwind.config": ""` in `components.json`
- Delete `tailwind.config.ts` if it exists
- Use `@tailwindcss/vite` plugin

### SHOULD

- Use semantic color tokens (`--background`, `--foreground`, etc.)
- Use `cn()` utility for conditional classes
- Use `@plugin` directive for plugins
- Compose components from smaller shadcn primitives
- Use wrapper pattern to extend components (don't modify originals)
- Use CVA for variant systems in custom components
- Use `forwardRef` for components that need ref forwarding
- Test accessibility with keyboard navigation and screen readers
- Use Radix UI primitives for complex interactions (dialogs, dropdowns, etc.)
- Provide ARIA labels for icon-only buttons and interactive elements

### AVOID

- Putting `:root` or `.dark` inside `@layer base`
- Using `.dark { @theme { } }` pattern (v4 doesn't support nested @theme)
- Double-wrapping colors (`hsl(var(--background))` in body)
- Using `tailwind.config.ts` for theme colors
- Using `@apply` directive (deprecated in v4)
- Using `dark:` variants for semantic colors
- Using `@import` or `require()` for plugins (use `@plugin`)
- Modifying base shadcn components directly (use wrapper pattern)
- Building custom dropdowns/dialogs from scratch (use Radix primitives)
- Relying on color alone for state indication
- Skipping accessibility testing

## Interactions

- Works with [nextjs](@cursor/skills/nextjs-v16/SKILL.md) for App Router setup
- Uses [typescript](@cursor/skills/typescript-v5/SKILL.md) for type safety

## Patterns

### CSS Variable Setup

```css
/* src/index.css */
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
}

.dark {
  --background: hsl(222.2 84% 4.9%);
  --foreground: hsl(210 40% 98%);
}
```

### Vite Configuration

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Components Config

```json
{
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  }
}
```

See [Templates](templates/) (including [Component Extension](templates/component-extension.tsx)) and [Architecture](references/architecture.md) for complete setup.

## References

- [Architecture](references/architecture.md) - Complete setup pattern
- [Dark Mode](references/dark-mode.md) - Dark mode implementation
- [Common Gotchas](references/common-gotchas.md) - Common issues and fixes
- [Migration Guide](references/migration-guide.md) - Migrating from v3
- [Component Patterns](references/component-patterns.md) - Composition, CVA, extension patterns
- [Accessibility](references/accessibility.md) - ARIA, keyboard navigation, screen readers
- [Form Patterns](references/form-patterns.md) - React Hook Form integration

## Resources

- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4)
- [Tailwind v4 Docs](https://tailwindcss.com/docs)
