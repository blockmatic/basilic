import { createLoader } from 'nuqs/server'
import { boardViewParsers } from './surface'

export const loadBoardView = createLoader(boardViewParsers)
