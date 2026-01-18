# Build Next.js Form with Server Actions

Build production-ready Next.js 15 forms with Server Actions, progressive enhancement, comprehensive validation, and accessibility.

## Overview

Create or update Next.js forms using Server Actions with proper validation, error handling, progressive enhancement, and accessibility following Next.js 15 and React 19 patterns.

## Steps

1. **Create shared Zod schema**
   - Define Zod schema for form validation
   - Use schema for both client-side (UX) and server-side (security) validation
   - Colocate schema with form component or in feature-specific schema file
   - Infer TypeScript types from schema using `z.infer<typeof schema>`

2. **Implement Server Action**
   - Create Server Action with `"use server"` directive (inline or module-level)
   - Extract and validate FormData using shared Zod schema
   - Return proper result objects with success/error states (never throw directly)
   - Use `revalidatePath` or `revalidateTag` for cache invalidation after mutations
   - Support redirect after successful submission when needed
   - Ensure Server Action works with progressive enhancement (no-JS fallback)

3. **Build form component**
   - Use `useActionState` (React 19) for form state management and error display
   - Use `useFormStatus` for pending submit status (both hooks are valid and complementary)
   - Handle initial state and state updates from Server Actions
   - Display validation errors with field-level and form-level feedback
   - Implement proper form reset after successful submission
   - Use `useOptimistic` for immediate feedback where beneficial, with rollback on failure

4. **Add progressive enhancement**
   - Ensure forms work without JavaScript enabled
   - Use `next/form` for enhanced form behavior (prefetching, client-side navigation)
   - Implement proper loading states with pending indicators
   - Create fallback experiences for JavaScript failures
   - Handle form submission with and without client-side hydration

5. **Implement accessibility**
   - Add proper ARIA labels, descriptions, and error associations
   - Support full keyboard navigation throughout forms
   - Provide clear focus indicators and manage focus appropriately
   - Use semantic HTML form elements (`<form>`, `<input>`, `<label>`, etc.)
   - Ensure screen readers can navigate and understand form structure and errors
   - Announce loading states with ARIA live regions during form submission
   - Follow WCAG 2.1 AA guidelines

6. **Error handling**
   - Provide clear, actionable error messages for validation failures
   - Handle server errors gracefully with user-friendly messages
   - Use proper try/catch blocks in Server Actions
   - Support field-level error display with proper ARIA attributes
   - Create consistent error message patterns across all forms

7. **Apply coding standards**
   - Follow TypeScript rules: use interfaces, type inference, RORO pattern
   - Use shadcn/ui Form components for consistent styling
   - Apply mobile-first responsive design
   - Follow linting rules (Biome + ESLint)

8. **Verify and test**
   - Run `pnpm lint:fix` to ensure code quality
   - Test form submission with JavaScript enabled and disabled
   - Verify keyboard navigation and screen reader compatibility
   - Test error handling and validation messages
   - Verify cache invalidation works correctly

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

## Related Rules

- @.cursor/rules/frontend/nextjs.mdc - Next.js patterns and Server Actions
- @.cursor/rules/frontend/react.mdc - React component patterns and accessibility
- @.cursor/rules/base/typescript.mdc - TypeScript standards and Zod patterns
- @.cursor/rules/base/security.mdc - Security best practices (server-side validation)
- @.cursor/rules/base/linting.mdc - Linting requirements
