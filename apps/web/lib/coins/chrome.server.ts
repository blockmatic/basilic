import { createLoader } from 'nuqs/server'
import { chromeParsers } from './chrome'

export const loadChrome = createLoader(chromeParsers)
