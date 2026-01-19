# Accessibility Guidelines

## Core Principles

shadcn/ui components are built on Radix UI primitives, which provide built-in accessibility features. However, proper implementation requires understanding and leveraging these features correctly.

---

## Radix UI Primitives

### Built-in Accessibility

Radix UI primitives include:
- **ARIA attributes**: Automatically added based on component state
- **Keyboard navigation**: Arrow keys, Enter, Escape, Tab
- **Focus management**: Focus trapping, focus restoration
- **Screen reader support**: Proper roles and labels

### Example: Dialog Component

```tsx
import { Dialog, DialogContent, DialogTrigger } from '@repo/ui/components/dialog'

function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        {/* Radix automatically handles:
           - Focus trapping
           - ESC to close
           - ARIA attributes
           - Focus restoration */}
        <p>Dialog content</p>
      </DialogContent>
    </Dialog>
  )
}
```

**What Radix handles automatically:**
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` (from DialogTitle)
- Focus trap when open
- ESC key to close
- Focus restoration on close

---

## ARIA Labels

### When to Add ARIA Labels

Add `aria-label` when:
- Icon-only buttons (no visible text)
- Decorative elements that need context
- Complex interactive elements

```tsx
// ✅ Good - icon button with label
<Button aria-label="Close dialog">
  <X className="size-4" />
</Button>

// ✅ Good - descriptive label
<Button aria-label="Delete user account">
  <Trash2 className="size-4" />
</Button>

// ❌ Bad - no label for icon-only button
<Button>
  <X className="size-4" />
</Button>
```

### aria-labelledby vs aria-label

Use `aria-labelledby` when visible text exists:

```tsx
// ✅ Good - uses visible label
<div>
  <h2 id="dialog-title">Delete Account</h2>
  <DialogContent aria-labelledby="dialog-title">
    ...
  </DialogContent>
</div>

// ✅ Good - uses aria-label when no visible text
<DialogContent aria-label="Delete account confirmation">
  ...
</DialogContent>
```

### aria-describedby

Use for additional context or descriptions:

```tsx
<div>
  <Input aria-describedby="email-help" />
  <p id="email-help" className="text-sm text-muted-foreground">
    We'll never share your email
  </p>
</div>
```

---

## Keyboard Navigation

### Standard Patterns

Radix components follow standard keyboard patterns:

| Component | Keys | Behavior |
|-----------|------|----------|
| Dialog | `ESC` | Closes dialog |
| Dialog | `Tab` | Focus trap (stays within dialog) |
| Dropdown Menu | `ArrowDown/Up` | Navigate options |
| Dropdown Menu | `Enter` | Select option |
| Dropdown Menu | `ESC` | Close menu |
| Select | `ArrowDown/Up` | Navigate options |
| Select | `Enter/Space` | Select option |
| Tabs | `ArrowLeft/Right` | Navigate tabs |

### Custom Keyboard Handlers

When adding custom keyboard handlers, preserve existing behavior:

```tsx
function CustomButton({ onAction, ...props }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onAction()
    }
    // Don't prevent default for other keys - let browser handle them
  }

  return (
    <Button onKeyDown={handleKeyDown} {...props} />
  )
}
```

---

## Focus Management

### Focus Trapping

Radix components automatically trap focus (Dialog, Popover, etc.). Don't manually trap focus unless building custom components.

```tsx
// ✅ Good - Radix handles focus trap
<Dialog>
  <DialogContent>
    {/* Focus stays within dialog */}
  </DialogContent>
</Dialog>

// ❌ Bad - manual focus trap conflicts with Radix
<Dialog>
  <DialogContent>
    <div onKeyDown={(e) => { /* manual trap */ }}>
      {/* Conflicts with Radix's built-in trap */}
    </div>
  </DialogContent>
</Dialog>
```

### Focus Indicators

Ensure focus indicators are visible:

```tsx
// ✅ Good - visible focus ring
<Button className="focus-visible:ring-2 focus-visible:ring-ring" />

// ❌ Bad - no focus indicator
<Button className="focus:outline-none" />
```

**Tailwind v4 pattern:**
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### Focus Restoration

Radix automatically restores focus to the trigger element when closing. Don't manually manage focus restoration.

```tsx
// ✅ Good - Radix handles restoration
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  {/* Focus returns to trigger on close */}
</Dialog>
```

---

## Screen Reader Support

### Semantic HTML

Use semantic HTML elements:

```tsx
// ✅ Good - semantic
<button onClick={handleClick}>Submit</button>
<nav><ul><li>...</li></ul></nav>
<main><article>...</article></main>

// ❌ Bad - div with onClick
<div onClick={handleClick} role="button">Submit</div>
```

### Roles and Landmarks

Use ARIA landmarks for page structure:

```tsx
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

### Live Regions

Use `aria-live` for dynamic content updates:

```tsx
// ✅ Good - announces updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// For assertive (interrupting) announcements
<div aria-live="assertive" aria-atomic="true">
  {errorMessage}
</div>
```

**Values:**
- `polite`: Waits for current announcement to finish
- `assertive`: Interrupts current announcement
- `atomic="true"`: Reads entire region, not just changed parts

---

## Form Accessibility

### Label Association

Always associate labels with inputs:

```tsx
// ✅ Good - explicit association
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Good - implicit association (FormLabel handles this)
<FormItem>
  <FormLabel>Email</FormLabel>
  <FormControl>
    <Input id="email" />
  </FormControl>
</FormItem>
```

### Error Messages

Associate error messages with inputs:

```tsx
// ✅ Good - FormMessage handles association
<FormItem>
  <FormLabel>Email</FormLabel>
  <FormControl>
    <Input aria-invalid={!!error} />
  </FormControl>
  <FormMessage /> {/* Automatically associated via FormItem */}
</FormItem>
```

### Required Fields

Indicate required fields:

```tsx
// ✅ Good - visual and programmatic
<FormLabel>
  Email <span aria-label="required">*</span>
</FormLabel>
<Input required aria-required="true" />
```

---

## Color and Contrast

### WCAG Contrast Ratios

Ensure sufficient contrast:
- **Normal text**: 4.5:1 minimum
- **Large text** (18pt+): 3:1 minimum
- **UI components**: 3:1 minimum

### Don't Rely on Color Alone

Use multiple indicators:

```tsx
// ✅ Good - color + icon + text
<div className="text-destructive">
  <AlertCircle className="size-4" />
  <span>Error: Invalid email</span>
</div>

// ❌ Bad - color only
<div className="text-red-500">Error</div>
```

### Focus Indicators

Ensure focus indicators have sufficient contrast:

```tsx
// ✅ Good - high contrast focus ring
className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

// Ring color should contrast with background
```

---

## Testing Accessibility

### Manual Testing

1. **Keyboard navigation**: Tab through all interactive elements
2. **Screen reader**: Test with NVDA (Windows) or VoiceOver (Mac)
3. **Focus indicators**: Verify all focusable elements show focus
4. **Color contrast**: Use browser DevTools or Lighthouse

### Automated Testing

Use accessibility testing tools:

```bash
# axe DevTools browser extension
# Lighthouse accessibility audit
# WAVE browser extension
```

### Common Issues to Check

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Error messages are associated with inputs
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] ARIA labels are present for icon-only buttons
- [ ] Dialog focus trap works correctly
- [ ] ESC key closes modals/dialogs
- [ ] Screen reader announces dynamic content

---

## Common Patterns

### Accessible Button Variants

```tsx
// Icon button with label
<Button aria-label="Close dialog" variant="ghost" size="icon">
  <X className="size-4" />
</Button>

// Loading state
<Button disabled aria-busy={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>

// Destructive action with confirmation
<Button 
  variant="destructive"
  aria-label="Delete item"
  onClick={handleDelete}
>
  Delete
</Button>
```

### Accessible Form Fields

```tsx
<FormField
  control={control}
  name="email"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>
        Email <span aria-label="required">*</span>
      </FormLabel>
      <FormControl>
        <Input
          type="email"
          aria-invalid={fieldState.invalid}
          aria-describedby={fieldState.error ? 'email-error' : 'email-help'}
          {...field}
        />
      </FormControl>
      {fieldState.error && (
        <FormMessage id="email-error" />
      )}
      {!fieldState.error && (
        <FormDescription id="email-help">
          We'll never share your email
        </FormDescription>
      )}
    </FormItem>
  )}
/>
```

### Accessible Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Account</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Accessibility features:**
- `DialogTitle` provides `aria-labelledby`
- `DialogDescription` provides `aria-describedby`
- Focus trap automatically applied
- ESC key closes dialog
- Focus returns to trigger on close

---

## Best Practices

### 1. Use Radix Primitives

Always use Radix UI primitives for complex interactions. Don't build custom dropdowns, dialogs, or modals from scratch.

### 2. Test with Screen Readers

Regularly test with actual screen readers (NVDA, VoiceOver, JAWS).

### 3. Keyboard-First Design

Design for keyboard navigation first, then enhance with mouse interactions.

### 4. Provide Alternatives

Don't rely on hover states, color alone, or mouse interactions for critical functionality.

### 5. Progressive Enhancement

Build accessible base, then enhance with animations and interactions.

---

## Related Documentation

- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [shadcn/ui Accessibility](https://ui.shadcn.com/docs)
