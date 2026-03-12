# React 19

React 19 is included in Expo SDK 53 and later. This release simplifies several common patterns. The following are optional improvements; existing patterns remain supported.

## Context Changes

### useContext → use (optional)

`useContext` remains supported. The `use` hook is an alternative that can also read promises:

```tsx
// Before (React 18)
import { useContext } from "react";
const value = useContext(MyContext);

// After (React 19)
import { use } from "react";
const value = use(MyContext);
```

- The `use` hook can also read promises, enabling Suspense-based data fetching.
- `use` can be called conditionally, which simplifies components that consume multiple contexts.

### Context.Provider → Context (optional)

`Context.Provider` continues to work. The new shorthand is a modernization option:

```tsx
// Before (React 18)
<ThemeContext.Provider value={theme}>
  {children}
</ThemeContext.Provider>

// After (React 19)
<ThemeContext value={theme}>
  {children}
</ThemeContext>
```

## ref as a Prop

### Optional: Modernizing away forwardRef

`forwardRef` remains supported in React 19 (but is deprecated). You can pass `ref` as a regular prop instead:

```tsx
// Before (React 18)
import { forwardRef } from "react";

const Input = forwardRef<TextInput, Props>((props, ref) => {
  return <TextInput ref={ref} {...props} />;
});

// After (React 19)
function Input({ ref, ...props }: Props & { ref?: React.Ref<TextInput> }) {
  return <TextInput ref={ref} {...props} />;
}
```

### Optional migration steps

1. Remove `forwardRef` wrapper
2. Add `ref` to the props destructuring
3. Update the type to include `ref?: React.Ref<T>`

## Other React 19 Features

- **Actions** — Functions that handle async transitions
- **useOptimistic** — Optimistic UI updates
- **useFormStatus** — Form submission state (web)
- **Document Metadata** — Native `<title>` and `<meta>` support (web)

## Cleanup Checklist

When upgrading to SDK 55 (all optional):

- [ ] Optional: Replace `useContext` with `use`
- [ ] Optional: Replace `Context.Provider` with `Context` shorthand
- [ ] Optional: Remove `forwardRef` wrappers, use `ref` prop instead
