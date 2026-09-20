import { defineCatalog } from '@json-render/core'
import { schema } from '@json-render/react/schema'
import { z } from 'zod'

const stackDirection = z.enum(['horizontal', 'vertical']).nullable()
const stackGap = z.enum(['sm', 'md', 'lg']).nullable()
const headingLevel = z.union([z.literal(1), z.literal(2), z.literal(3)]).nullable()
const textTone = z.enum(['default', 'muted']).nullable()
const badgeVariant = z.enum(['default', 'secondary', 'destructive', 'outline']).nullable()
const alertVariant = z.enum(['default', 'destructive']).nullable()
const buttonVariant = z.enum(['default', 'secondary', 'destructive', 'outline', 'ghost']).nullable()

export const boardCatalog = defineCatalog(schema, {
  components: {
    Stack: {
      props: z.object({ direction: stackDirection, gap: stackGap }),
      slots: ['default'],
      description: 'Flex row or column that groups board sections',
    },
    Card: {
      props: z.object({ title: z.string().nullable() }),
      slots: ['default'],
      description: 'Surface card with an optional title',
    },
    Heading: {
      props: z.object({ text: z.string(), level: headingLevel }),
      description: 'Page or section heading',
    },
    Text: {
      props: z.object({ text: z.string(), tone: textTone }),
      description: 'Body copy, optionally muted',
    },
    Badge: {
      props: z.object({ text: z.string(), variant: badgeVariant }),
      description: 'Status or label chip',
    },
    Alert: {
      props: z.object({
        variant: alertVariant,
        title: z.string(),
        description: z.string().nullable(),
      }),
      description: 'Inline notice for honesty fallbacks and errors',
    },
    Separator: {
      props: z.object({}),
      description: 'Horizontal rule between board sections',
    },
    Button: {
      props: z.object({ label: z.string(), variant: buttonVariant }),
      description: 'Pressable control that emits press for catalog actions',
    },
    Section: {
      props: z.object({ title: z.string().nullable() }),
      slots: ['default'],
      description: 'Titled region wrapping table or account content',
    },
    QuerySummary: {
      props: z.object({ caption: z.string() }),
      description: 'Read-only caption of the current SearchQuery',
    },
    DataTable: {
      props: z.object({
        columns: z.array(z.string()),
        emptyLabel: z.string().nullable(),
      }),
      slots: ['default'],
      description: 'Coin rows bound to $state.coins via repeat',
    },
    CoinIdentity: {
      props: z.object({
        name: z.string(),
        symbol: z.string(),
        imageUrl: z.string().nullable(),
      }),
      description: 'Coin name, symbol, and optional image',
    },
    Price: {
      props: z.object({ value: z.number() }),
      description: 'USD price in tabular numerals',
    },
    PercentageChange: {
      props: z.object({ value: z.number() }),
      description: 'Signed 24h percent change',
    },
    Insight: {
      props: z.object({ text: z.string() }),
      description: 'Honesty or helper line under the caption',
    },
    UserInfo: {
      props: z.object({
        name: z.string().nullable(),
        email: z.string().nullable(),
        image: z.string().nullable(),
        username: z.string().nullable(),
        joinedAt: z.string().nullable(),
      }),
      description: 'Account card with avatar and profile fields',
    },
  },
  actions: {
    reset_view: {
      params: z.object({}),
      description: 'Clear SearchQuery to the default ranked table',
    },
  },
})
