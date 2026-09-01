---
name: nextjs-form
description: Build production-ready Next.js 16 forms with Server Actions, progressive enhancement, comprehensive validation, and accessibility. Use when the user types /nextjs-form.
disable-model-invocation: true
---

Build production-ready Next.js 16 forms with Server Actions, progressive enhancement, comprehensive validation, and accessibility.

**Override:** If the app already mutates through an API client (Fastify + TanStack Query), do not introduce Server Actions, `useFormStatus`, or `useOptimistic` for those flows.

1. **Create shared Zod schema**: Define Zod schema for form validation, use schema for both client-side (UX) and server-side (security) validation, colocate schema with form component or in feature-specific schema file, infer TypeScript types from schema using `z.infer<typeof schema>`
2. **Implement Server Action**: Create Server Action with `"use server"` directive, extract/validate FormData using shared Zod schema, return proper result objects with success/error states (never throw directly), use `revalidatePath`/`revalidateTag` for cache invalidation, support redirect after successful submission, ensure Server Action works with progressive enhancement
3. **Build form component**: Use `useActionState` (React 19) for form state management/error display, use `useFormStatus` for pending submit status, handle initial state/state updates from Server Actions, display validation errors with field-level/form-level feedback, implement proper form reset after successful submission, use `useOptimistic` for immediate feedback where beneficial
4. **Add progressive enhancement**: Ensure forms work without JavaScript enabled, use `next/form` for enhanced form behavior, implement proper loading states with pending indicators, create fallback experiences for JavaScript failures
5. **Implement accessibility**: Add proper ARIA labels/descriptions/error associations, support full keyboard navigation, provide clear focus indicators/manage focus appropriately, use semantic HTML form elements, ensure screen readers can navigate/understand form structure/errors, announce loading states with ARIA live regions, follow WCAG 2.1 AA guidelines
6. **Error handling**: Provide clear actionable error messages for validation failures, handle server errors gracefully, use proper try/catch blocks in Server Actions, support field-level error display with proper ARIA attributes, create consistent error message patterns
7. **Apply coding standards**: Follow TypeScript rules (interfaces, type inference, RORO pattern), use shadcn/ui Form components, apply mobile-first responsive design, follow linting rules (Biome + ESLint)
8. **Verify and test**: Run `pnpm lint:fix`, test form submission with JavaScript enabled/disabled, verify keyboard navigation/screen reader compatibility, test error handling/validation messages, verify cache invalidation works correctly

