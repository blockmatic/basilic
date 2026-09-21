import { defineEval } from 'eve/evals'
import { marketWatchTools, skipIfNoCommandModel } from './skip.js'

export default defineEval({
  description: 'Last week honesty does not call market or watch tools.',
  async test(t) {
    if (skipIfNoCommandModel(t)) return
    await t.send('last week')
    t.succeeded()
    for (const name of marketWatchTools) t.notCalledTool(name)
  },
})
