# Component Patterns & Composition

## Core Principles

### Composition Over Inheritance

Build complex components from smaller shadcn/ui primitives rather than creating monolithic components.

✅ **GOOD:**
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@repo/ui/components/card'
import { Button } from '@repo/ui/components/button'

function MetricCard({ title, value, action }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
      {action && (
        <CardFooter>
          <Button onClick={action}>View Details</Button>
        </CardFooter>
      )}
    </Card>
  )
}
```

❌ **BAD:**
```tsx
// Monolithic component that tries to do everything
function MetricCard({ title, value, action, footer, header, ... }) {
  // Complex logic mixing concerns
}
```

---

## Component Extension Patterns

### Wrapper Component Pattern

Extend base components without modifying originals. This preserves updateability and maintains separation of concerns.

```tsx
import { Button, type ButtonProps } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import type * as React from 'react'

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
  iconPosition?: 'left' | 'right'
}

function IconButton({ 
  icon, 
  iconPosition = 'left', 
  children, 
  className,
  ...props 
}: IconButtonProps) {
  return (
    <Button className={cn(className)} {...props}>
      {iconPosition === 'left' && icon}
      {children}
      {iconPosition === 'right' && icon}
    </Button>
  )
}

export { IconButton }
```

**Benefits:**
- Base component remains untouched
- Easy to update base component from shadcn
- Clear separation of concerns
- Type-safe prop extension

---

## CVA (class-variance-authority) Patterns

### Basic Variant System

Use CVA for type-safe variant systems that integrate with Tailwind.

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@repo/ui/lib/utils'
import type * as React from 'react'

const alertVariants = cva(
  // Base classes applied to all variants
  'relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface AlertProps 
  extends React.ComponentProps<'div'>, 
    VariantProps<typeof alertVariants> {}

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}
```

### Multiple Variant Dimensions

Combine multiple variant types for flexible component APIs.

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline: 'border bg-background hover:bg-accent',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3',
        lg: 'h-10 px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Usage: buttonVariants({ variant: 'destructive', size: 'lg' })
```

### Compound Variants

Use compound variants for complex conditional styling.

```tsx
const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: '',
        interactive: 'cursor-pointer transition-all hover:shadow-md',
      },
      size: {
        default: 'p-6',
        compact: 'p-4',
      },
    },
    compoundVariants: [
      {
        variant: 'interactive',
        size: 'default',
        class: 'hover:border-primary/50',
      },
      {
        variant: 'interactive',
        size: 'compact',
        class: 'hover:border-primary/30',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

---

## forwardRef Pattern

Always use `forwardRef` for components that need ref forwarding (especially form inputs).

```tsx
import { forwardRef } from 'react'
import { cn } from '@repo/ui/lib/utils'
import type * as React from 'react'

interface InputProps extends React.ComponentProps<'input'> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

**Why forwardRef is important:**
- Form libraries (React Hook Form) need refs for validation
- Parent components may need to focus/scroll to inputs
- Required for proper accessibility (focus management)

---

## Prop Spreading with Type Safety

Use `React.ComponentProps` to extend component props while maintaining type safety.

### Extending HTML Elements

```tsx
import type * as React from 'react'

interface CustomButtonProps extends React.ComponentProps<'button'> {
  loading?: boolean
}

function CustomButton({ loading, children, ...props }: CustomButtonProps) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? 'Loading...' : children}
    </button>
  )
}
```

### Extending shadcn Components

```tsx
import { Button, type ButtonProps } from '@repo/ui/components/button'
import type * as React from 'react'

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
}

function IconButton({ icon, children, ...props }: IconButtonProps) {
  return (
    <Button {...props}>
      {icon}
      {children}
    </Button>
  )
}
```

---

## Controlled vs Uncontrolled Patterns

### Controlled Components

Use when parent needs to control the value.

```tsx
interface ControlledInputProps {
  value: string
  onChange: (value: string) => void
}

function ControlledInput({ value, onChange }: ControlledInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
```

### Uncontrolled Components

Use when component manages its own state (default).

```tsx
import { forwardRef } from 'react'
import type * as React from 'react'

const Input = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ ...props }, ref) => {
    return <input ref={ref} {...props} />
  }
)
```

### Hybrid Pattern (Recommended)

Support both controlled and uncontrolled modes.

```tsx
import { forwardRef, useState } from 'react'
import type * as React from 'react'

interface InputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ value: controlledValue, defaultValue, onChange, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '')
    const isControlled = controlledValue !== undefined
    const value = isControlled ? controlledValue : uncontrolledValue

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (!isControlled) {
        setUncontrolledValue(newValue)
      }
      onChange?.(newValue)
    }

    return <input ref={ref} value={value} onChange={handleChange} {...props} />
  }
)
```

---

## Data Attributes for State Styling

Use data attributes (`data-[state=open]`) for styling based on component state. This keeps styling declarative and avoids JavaScript conditionals.

### Radix UI Pattern

Radix primitives automatically add data attributes:

```tsx
// Radix Dialog automatically adds data-[state=open] when open
<Dialog>
  <DialogContent className="data-[state=open]:animate-in data-[state=closed]:animate-out" />
</Dialog>
```

### Custom Data Attributes

Add custom data attributes for component-specific states:

```tsx
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending'
}

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      data-status={status}
      className={cn(
        'rounded-full px-2 py-1 text-xs',
        'data-[status=active]:bg-success/10 data-[status=active]:text-success',
        'data-[status=inactive]:bg-muted data-[status=inactive]:text-muted-foreground',
        'data-[status=pending]:bg-warning/10 data-[status=pending]:text-warning'
      )}
    >
      {status}
    </span>
  )
}
```

**Benefits:**
- Declarative styling (no JS conditionals)
- Works with CSS selectors
- Better performance (no runtime checks)
- Easier to debug in DevTools

---

## Slot Pattern (Radix UI)

Use Radix UI's `Slot` component for polymorphic components that can render as different elements.

```tsx
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@repo/ui/lib/utils'
import type * as React from 'react'

interface ButtonProps extends React.ComponentProps<'button'> {
  asChild?: boolean
}

function Button({ asChild = false, className, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  
  return (
    <Comp
      className={cn('inline-flex items-center justify-center rounded-md', className)}
      {...props}
    />
  )
}

// Usage:
// <Button>Normal button</Button>
// <Button asChild><a href="/">Link button</a></Button>
```

**Use cases:**
- Buttons that can be links
- Cards that can be clickable
- Components that need to render as different HTML elements

---

## Component Composition Examples

### Card with Actions

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@repo/ui/components/card'
import { Button } from '@repo/ui/components/button'

interface ActionCardProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

function ActionCard({ title, description, actionLabel, onAction }: ActionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={onAction}>{actionLabel}</Button>
      </CardFooter>
    </Card>
  )
}
```

### Form Field Composition

```tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@repo/ui/components/form'
import { Input } from '@repo/ui/components/input'

function EmailField({ control, name }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

---

## Best Practices

### 1. Always Export Variants

Export variants so they can be reused or extended:

```tsx
export { Button, buttonVariants } // ✅ Good
export { Button } // ❌ Bad - variants not accessible
```

### 2. Use data-slot Attributes

Add `data-slot` attributes for easier styling and debugging:

```tsx
<button data-slot="button" className={...}>Click</button>
```

### 3. Keep Components Focused

Each component should have a single responsibility:

```tsx
// ✅ Good - focused component
function MetricCard({ value, label }) { ... }

// ❌ Bad - too many responsibilities
function DashboardCard({ metrics, charts, actions, filters, ... }) { ... }
```

### 4. Prefer Composition Over Props

Use composition to build complex UIs:

```tsx
// ✅ Good - composable
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>

// ❌ Bad - prop-driven
<Card header={...} content={...} />
```

### 5. Type Safety First

Always use TypeScript for prop types and variant props:

```tsx
// ✅ Good - type-safe
interface Props extends VariantProps<typeof variants> { ... }

// ❌ Bad - no types
function Component(props) { ... }
```

---

## Related Documentation

- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [class-variance-authority](https://cva.style/docs)
