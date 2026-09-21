'use client'

import { defineRegistry } from '@json-render/react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
import { Separator } from '@repo/ui/components/separator'
import { cn } from '@repo/ui/lib/utils'
import type { ReactNode } from 'react'
import { UserInfoComponent } from '@/components/assistant/user-info-catalog'
import { boardCatalog } from '@/lib/genui'
import { DataTable } from './data-table'

const stackGapClass = { sm: 'gap-2', md: 'gap-4', lg: 'gap-6' } as const

function Stack({
  props,
  children,
}: {
  props: { direction: 'horizontal' | 'vertical' | null; gap: 'sm' | 'md' | 'lg' | null }
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex',
        props.direction === 'horizontal' ? 'flex-row' : 'flex-col',
        props.gap ? stackGapClass[props.gap] : null,
      )}
    >
      {children}
    </div>
  )
}

function Heading({ props }: { props: { text: string; level: 1 | 2 | 3 | null } }) {
  const className = 'font-heading font-semibold'
  if (props.level === 1) return <h1 className={className}>{props.text}</h1>
  if (props.level === 3) return <h3 className={className}>{props.text}</h3>
  return <h2 className={className}>{props.text}</h2>
}

function Text({ props }: { props: { text: string; tone: 'default' | 'muted' | null } }) {
  return (
    <p className={cn(props.tone === 'muted' && 'text-muted-foreground text-sm')}>{props.text}</p>
  )
}

function QuerySummary({ props }: { props: { caption: string } }) {
  if (!props.caption) return null
  return <h2 className="font-heading text-base font-semibold md:text-lg">{props.caption}</h2>
}

function CoinIdentity({
  props,
}: {
  props: { name: string; symbol: string; imageUrl: string | null }
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {props.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- catalog leaf may render without next/image sizes
        <img src={props.imageUrl} alt="" width={24} height={24} className="size-6 rounded-full" />
      ) : null}
      <span className="truncate font-medium">{props.name}</span>
      <span className="text-muted-foreground text-sm uppercase">{props.symbol}</span>
    </div>
  )
}

function Price({ props }: { props: { value: number } }) {
  return (
    <span className="tabular-nums">
      {new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: props.value < 0.01 ? 6 : 2,
      }).format(props.value)}
    </span>
  )
}

function PercentageChange({ props }: { props: { value: number } }) {
  const sign = props.value >= 0 ? '+' : ''
  return (
    <span className={cn('tabular-nums', props.value >= 0 ? 'text-chart-2' : 'text-destructive')}>
      {sign}
      {props.value.toFixed(2)}%
    </span>
  )
}

export const { registry: boardRegistry } = defineRegistry(boardCatalog, {
  components: {
    Stack,
    Card: ({ props, children }) => (
      <Card>
        {props.title ? (
          <CardHeader>
            <CardTitle>{props.title}</CardTitle>
          </CardHeader>
        ) : null}
        <CardContent>{children}</CardContent>
      </Card>
    ),
    Heading,
    Text,
    Badge: ({ props }) => <Badge variant={props.variant ?? 'default'}>{props.text}</Badge>,
    Alert: ({ props }) => (
      <Alert variant={props.variant ?? 'default'}>
        <AlertTitle>{props.title}</AlertTitle>
        {props.description ? <AlertDescription>{props.description}</AlertDescription> : null}
      </Alert>
    ),
    Separator: () => <Separator />,
    Button: ({ props, emit }) => (
      <Button variant={props.variant ?? 'default'} onClick={() => emit('press')}>
        {props.label}
      </Button>
    ),
    Section: ({ props, children }) => (
      <section className="space-y-4">
        {props.title ? <h2 className="font-heading font-semibold">{props.title}</h2> : null}
        {children}
      </section>
    ),
    QuerySummary,
    DataTable,
    CoinIdentity,
    Price,
    PercentageChange,
    Insight: ({ props }) => <p className="text-muted-foreground text-sm">{props.text}</p>,
    UserInfo: UserInfoComponent,
  },
  actions: {
    reset_view: async () => {},
  },
})
