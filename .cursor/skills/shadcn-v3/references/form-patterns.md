# Form Patterns with React Hook Form

## Overview

shadcn/ui Form components are designed to work seamlessly with React Hook Form. This guide covers integration patterns, validation, and best practices.

---

## Basic Setup

### Form Provider

Wrap your form with the `Form` component (which is `FormProvider` from React Hook Form):

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { Form } from '@repo/ui/components/form'
import { Button } from '@repo/ui/components/button'

function MyForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

---

## Form Fields

### Basic Field Pattern

Use `FormField` with `render` prop to connect React Hook Form with shadcn components:

```tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@repo/ui/components/form'
import { Input } from '@repo/ui/components/input'
import { useForm } from 'react-hook-form'

function EmailField({ control }) {
  return (
    <FormField
      control={control}
      name="email"
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

**Key points:**
- `control` comes from `useForm()`
- `name` matches the field name in form values
- `field` from render prop contains `value`, `onChange`, `onBlur`, `ref`
- Spread `{...field}` onto the input component
- `FormMessage` automatically displays validation errors

---

## Input Components

### Text Input

```tsx
<FormField
  control={control}
  name="username"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Username</FormLabel>
      <FormControl>
        <Input placeholder="Enter username" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Password Input

```tsx
<FormField
  control={control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Password</FormLabel>
      <FormControl>
        <Input type="password" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Textarea

```tsx
import { Textarea } from '@repo/ui/components/textarea'

<FormField
  control={control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea placeholder="Enter description" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Select Components

### Basic Select

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'

<FormField
  control={control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="guest">Guest</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Important:** Select uses `onValueChange` instead of `onChange`, and `defaultValue`/`value` instead of just `value`.

---

## Checkbox and Radio

### Checkbox

```tsx
import { Checkbox } from '@repo/ui/components/checkbox'

<FormField
  control={control}
  name="terms"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>Accept terms and conditions</FormLabel>
        <FormDescription>
          You agree to our Terms of Service and Privacy Policy.
        </FormDescription>
      </div>
    </FormItem>
  )}
/>
```

### Radio Group

```tsx
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group'

<FormField
  control={control}
  name="notification"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Notification Preference</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={field.onChange}
          defaultValue={field.value}
          className="flex flex-col space-y-1"
        >
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="all" />
            </FormControl>
            <FormLabel>All notifications</FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="mentions" />
            </FormControl>
            <FormLabel>Mentions only</FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Validation with Zod

### Schema Definition

Define Zod schema for type-safe validation:

```tsx
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof formSchema>
```

### Form Setup with Validation

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

### Field-Level Validation

```tsx
<FormField
  control={control}
  name="email"
  rules={{
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address',
    },
  }}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Note:** Prefer Zod schemas over inline rules for better type safety and reusability.

---

## Error Handling

### Displaying Errors

`FormMessage` automatically displays errors from React Hook Form:

```tsx
<FormField
  control={control}
  name="email"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input 
          {...field} 
          aria-invalid={fieldState.invalid}
        />
      </FormControl>
      <FormMessage /> {/* Displays error.message */}
    </FormItem>
  )}
/>
```

### Custom Error Display

Access `fieldState` for custom error handling:

```tsx
<FormField
  control={control}
  name="email"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      {fieldState.error && (
        <p className="text-sm text-destructive">
          {fieldState.error.message}
        </p>
      )}
      {fieldState.isDirty && !fieldState.error && (
        <p className="text-sm text-success">Looks good!</p>
      )}
    </FormItem>
  )}
/>
```

### Form-Level Errors

Display form-level errors (e.g., from API):

```tsx
function MyForm() {
  const form = useForm({
    // ...
  })

  const onSubmit = async (data) => {
    try {
      await submitForm(data)
    } catch (error) {
      form.setError('root', {
        message: error.message,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

---

## Controlled vs Uncontrolled

### Uncontrolled (Default)

React Hook Form manages state internally:

```tsx
const form = useForm({
  defaultValues: {
    email: '',
  },
})

// Form manages value internally
<FormField
  control={control}
  name="email"
  render={({ field }) => (
    <Input {...field} /> // field.value, field.onChange handled internally
  )}
/>
```

### Controlled

For external state control:

```tsx
const [externalValue, setExternalValue] = useState('')

<FormField
  control={control}
  name="email"
  render={({ field }) => (
    <Input
      {...field}
      value={externalValue}
      onChange={(e) => {
        setExternalValue(e.target.value)
        field.onChange(e)
      }}
    />
  )}
/>
```

**Note:** Prefer uncontrolled mode unless you need external state control.

---

## Form State

### Accessing Form State

Use `form.formState` to access form state:

```tsx
const { isDirty, isValid, isSubmitting, errors } = form.formState

// Disable submit until form is valid
<Button type="submit" disabled={!isValid || isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

### Field State

Access individual field state:

```tsx
<FormField
  control={control}
  name="email"
  render={({ field, fieldState }) => {
    const { error, isDirty, isTouched, invalid } = fieldState
    
    return (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        {isDirty && !error && (
          <FormDescription>Field has been modified</FormDescription>
        )}
        <FormMessage />
      </FormItem>
    )
  }}
/>
```

---

## Complex Patterns

### Dynamic Fields

Add/remove fields dynamically:

```tsx
import { useFieldArray } from 'react-hook-form'

function DynamicForm() {
  const form = useForm({
    defaultValues: {
      items: [{ name: '', value: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={form.control}
              name={`items.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => append({ name: '', value: '' })}
        >
          Add Item
        </Button>
      </form>
    </Form>
  )
}
```

### Conditional Fields

Show/hide fields based on other field values:

```tsx
function ConditionalForm() {
  const form = useForm({
    defaultValues: {
      hasAccount: false,
      email: '',
    },
  })

  const hasAccount = form.watch('hasAccount')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="hasAccount"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>I have an account</FormLabel>
            </FormItem>
          )}
        />
        {hasAccount && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  )
}
```

---

## Best Practices

### 1. Use Zod for Validation

Prefer Zod schemas over inline validation rules for type safety and reusability.

### 2. Type Your Form Values

Always type form values for better TypeScript support:

```tsx
type FormValues = z.infer<typeof formSchema>
const form = useForm<FormValues>({ ... })
```

### 3. Provide Default Values

Always provide `defaultValues` to avoid uncontrolled/controlled warnings:

```tsx
const form = useForm({
  defaultValues: {
    email: '',
    // ...
  },
})
```

### 4. Use FormDescription

Provide helpful hints with `FormDescription`:

```tsx
<FormItem>
  <FormLabel>Password</FormLabel>
  <FormControl>
    <Input type="password" {...field} />
  </FormControl>
  <FormDescription>
    Must be at least 8 characters
  </FormDescription>
  <FormMessage />
</FormItem>
```

### 5. Handle Loading States

Disable form during submission:

```tsx
<Button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

---

## Related Documentation

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [shadcn/ui Form](https://ui.shadcn.com/docs/components/form)
- [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
