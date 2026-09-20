import { type inferParserType, parseAsString, parseAsStringLiteral } from 'nuqs/server'

const sidebarValues = ['open', 'close'] as const
const railValues = ['commands', 'chat'] as const

const chromeOptions = {
  clearOnDefault: true,
  history: 'replace',
  shallow: true,
} as const

export const chromeParsers = {
  sidebar: parseAsStringLiteral(sidebarValues).withDefault('open').withOptions(chromeOptions),
  rail: parseAsStringLiteral(railValues).withDefault('commands').withOptions(chromeOptions),
  q: parseAsString.withOptions(chromeOptions),
}

export type ChromeState = inferParserType<typeof chromeParsers>
export type RailState = (typeof railValues)[number]
export type SidebarState = (typeof sidebarValues)[number]

export function parseRailValue({ value }: { value: unknown }): { rail: RailState } | null {
  if (value !== 'commands' && value !== 'chat') return null
  return { rail: value }
}
