import { cn } from '@repo/ui/lib/utils'
import type { ReactNode } from 'react'

export function LandingSection({
  as: Tag = 'section',
  bordered = false,
  children,
  className,
  hero = false,
  id,
}: {
  as?: 'section' | 'footer'
  bordered?: boolean
  children: ReactNode
  className?: string
  hero?: boolean
  id?: string
}) {
  return (
    <Tag
      id={id}
      className={cn(
        hero ? 'px-4 pt-24 pb-16 md:px-6 md:pt-32 md:pb-24' : 'px-4 py-16 md:px-6 md:py-24',
        bordered && 'border-t border-border',
        className,
      )}
    >
      <div className="mx-auto max-w-5xl">{children}</div>
    </Tag>
  )
}
