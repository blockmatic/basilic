/**
 * Component Extension Template
 *
 * This template demonstrates how to extend shadcn/ui components
 * without modifying the originals, following best practices.
 */

import { Button, type ButtonProps } from '@repo/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
import { cn } from '@repo/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { forwardRef } from 'react'

// ============================================================================
// Example 1: Wrapper Component with CVA Variants
// ============================================================================

const iconButtonVariants = cva('inline-flex items-center justify-center gap-2', {
  variants: {
    iconPosition: {
      left: '',
      right: '',
    },
    iconSize: {
      sm: '[&_svg]:size-3',
      default: '[&_svg]:size-4',
      lg: '[&_svg]:size-5',
    },
  },
  defaultVariants: {
    iconPosition: 'left',
    iconSize: 'default',
  },
})

interface IconButtonProps extends ButtonProps, VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode
}

/**
 * IconButton - Extends Button with icon support
 *
 * @example
 * <IconButton icon={<Plus />}>Add Item</IconButton>
 * <IconButton icon={<Trash />} iconPosition="right" variant="destructive">
 *   Delete
 * </IconButton>
 */
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, iconPosition, iconSize, children, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(iconButtonVariants({ iconPosition, iconSize }), className)}
        {...props}
      >
        {iconPosition === 'left' && icon}
        {children}
        {iconPosition === 'right' && icon}
      </Button>
    )
  },
)
IconButton.displayName = 'IconButton'

// ============================================================================
// Example 2: Composed Component (Card + Button)
// ============================================================================

interface ActionCardProps extends React.ComponentProps<typeof Card> {
  title: string
  description?: string
  actionLabel: string
  onAction: () => void
  actionVariant?: ButtonProps['variant']
}

/**
 * ActionCard - Composed component using Card and Button
 *
 * @example
 * <ActionCard
 *   title="Upgrade Plan"
 *   description="Get access to premium features"
 *   actionLabel="Upgrade Now"
 *   onAction={() => console.log('Upgrade')}
 * />
 */
function ActionCard({
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'default',
  className,
  ...props
}: ActionCardProps) {
  return (
    <Card className={cn(className)} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {description && (
        <CardContent>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      )}
      <CardContent>
        <Button variant={actionVariant} onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Example 3: Polymorphic Component with Slot
// ============================================================================

interface LinkButtonProps extends ButtonProps {
  href?: string
  asChild?: boolean
}

/**
 * LinkButton - Button that can render as a link
 *
 * @example
 * <LinkButton href="/dashboard">Go to Dashboard</LinkButton>
 * <LinkButton asChild>
 *   <a href="/external">External Link</a>
 * </LinkButton>
 */
const LinkButton = forwardRef<HTMLButtonElement, LinkButtonProps>(
  ({ href, asChild, children, ...props }, ref) => {
    if (href && !asChild) {
      return (
        <Button asChild {...props}>
          <a href={href} ref={ref as React.Ref<HTMLAnchorElement>}>
            {children}
          </a>
        </Button>
      )
    }

    return (
      <Button ref={ref} asChild={asChild} {...props}>
        {children}
      </Button>
    )
  },
)
LinkButton.displayName = 'LinkButton'

// ============================================================================
// Example 4: Custom Variant Extension
// ============================================================================

const statusBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        active: 'bg-success/10 text-success border-success/20',
        inactive: 'bg-muted text-muted-foreground border-muted',
        pending: 'bg-warning/10 text-warning border-warning/20',
        error: 'bg-destructive/10 text-destructive border-destructive/20',
      },
    },
    defaultVariants: {
      status: 'active',
    },
  },
)

interface StatusBadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof statusBadgeVariants> {
  label?: string
}

/**
 * StatusBadge - Custom badge with status variants
 *
 * @example
 * <StatusBadge status="active" label="Active" />
 * <StatusBadge status="error" data-status="error" />
 */
const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, label, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        data-status={status}
        className={cn(statusBadgeVariants({ status }), className)}
        {...props}
      >
        {label || children}
      </span>
    )
  },
)
StatusBadge.displayName = 'StatusBadge'

// ============================================================================
// Exports
// ============================================================================

export { IconButton, ActionCard, LinkButton, StatusBadge, iconButtonVariants, statusBadgeVariants }
