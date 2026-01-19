# Build Next.js Form with Server Actions

Build production-ready Next.js 15 forms with Server Actions, progressive enhancement, comprehensive validation, and accessibility.

## Overview
Create or update Next.js forms using Server Actions with proper validation, error handling, progressive enhancement, and accessibility following Next.js 15 and React 19 patterns.

## Steps
1. **Create shared Zod schema**: Define Zod schema for form validation, use schema for both client-side (UX) and server-side (security) validation, colocate schema with form component or in feature-specific schema file, infer TypeScript types from schema using `z.infer<typeof schema>`
2. **Implement Server Action**: Create Server Action with `"use server"` directive, extract/validate FormData using shared Zod schema, return proper result objects with success/error states (never throw directly), use `revalidatePath`/`revalidateTag` for cache invalidation, support redirect after successful submission, ensure Server Action works with progressive enhancement
3. **Build form component**: Use `useActionState` (React 19) for form state management/error display, use `useFormStatus` for pending submit status, handle initial state/state updates from Server Actions, display validation errors with field-level/form-level feedback, implement proper form reset after successful submission, use `useOptimistic` for immediate feedback where beneficial
4. **Add progressive enhancement**: Ensure forms work without JavaScript enabled, use `next/form` for enhanced form behavior, implement proper loading states with pending indicators, create fallback experiences for JavaScript failures
5. **Implement accessibility**: Add proper ARIA labels/descriptions/error associations, support full keyboard navigation, provide clear focus indicators/manage focus appropriately, use semantic HTML form elements, ensure screen readers can navigate/understand form structure/errors, announce loading states with ARIA live regions, follow WCAG 2.1 AA guidelines
6. **Error handling**: Provide clear actionable error messages for validation failures, handle server errors gracefully, use proper try/catch blocks in Server Actions, support field-level error display with proper ARIA attributes, create consistent error message patterns
7. **Apply coding standards**: Follow TypeScript rules (interfaces, type inference, RORO pattern), use shadcn/ui Form components, apply mobile-first responsive design, follow linting rules (Biome + ESLint)
8. **Verify and test**: Run `pnpm lint:fix`, test form submission with JavaScript enabled/disabled, verify keyboard navigation/screen reader compatibility, test error handling/validation messages, verify cache invalidation works correctly

## Checklist
- [ ] Shared Zod schema created for client and server validation
- [ ] Server Action implemented with `"use server"` directive
- [ ] Server Action validates FormData with Zod schema
- [ ] Server Action returns proper result objects (success/error)
- [ ] Cache invalidation implemented (`revalidatePath`/`revalidateTag`)
- [ ] Form uses `useActionState` for state management
- [ ] Form works without JavaScript (progressive enhancement)
- [ ] Loading states implemented with pending indicators
- [ ] ARIA labels and descriptions added
- [ ] Keyboard navigation fully supported
- [ ] Field-level and form-level error display implemented
- [ ] Error messages are clear and actionable
- [ ] Code passes `pnpm lint`
- [ ] Form tested with and without JavaScript
- [ ] Accessibility verified (keyboard, screen reader)

## Related
- @.cursor/rules/frontend/nextjs.mdc - Next.js patterns and Server Actions
- @.cursor/rules/frontend/react.mdc - React component patterns and accessibility
- @.cursor/rules/base/typescript.mdc - TypeScript standards and Zod patterns
- @.cursor/rules/base/security.mdc - Security best practices (server-side validation)
- @.cursor/rules/base/linting.mdc - Linting requirements
