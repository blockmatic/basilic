---
title: React 19 API Changes
impact: MEDIUM
impactDescription: cleaner component definitions and context usage
tags: react19, refs, context, hooks
---

## React 19 API Changes

> **⚠️ React 19+ only.** Skip this if you're on React 18 or earlier.

In React 19, `ref` is a regular prop. New components can take `ref` without `forwardRef`. Existing `forwardRef` code remains supported; treat `forwardRef` as legacy for new components.

`useContext()` remains supported for unconditional reads. `use()` is an option when a context read must be conditional (`use()` may run after an `if`; `useContext()` may not).

**Incorrect (new React 19 component wrapped in forwardRef):**

```tsx
const ComposerInput = forwardRef<TextInput, Props>((props, ref) => {
  return <TextInput ref={ref} {...props} />
})
```

**Correct (ref as a regular prop):**

```tsx
function ComposerInput({ ref, ...props }: Props & { ref?: React.Ref<TextInput> }) {
  return <TextInput ref={ref} {...props} />
}
```

**Supported (unconditional context read):**

```tsx
const value = useContext(MyContext)
```

**Optional (conditional context read):**

```tsx
if (needsComposer) {
  const value = use(MyContext)
}
```
