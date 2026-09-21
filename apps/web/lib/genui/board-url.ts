import { createSerializer, type inferParserType } from 'nuqs/server'
import { chromeParsers } from '@/lib/coins/chrome'
import { boardViewParsers } from './surface'

export const boardUrlParsers = {
  ...boardViewParsers,
  ...chromeParsers,
}

export type BoardUrlState = inferParserType<typeof boardUrlParsers>

export const serializeBoardUrl = createSerializer(boardUrlParsers)
