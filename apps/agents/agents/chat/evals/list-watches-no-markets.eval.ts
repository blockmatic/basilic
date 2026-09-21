import { defineEval } from 'eve/evals'
import { marketsTools, skipIfNoLanguageModel } from './skip.js'

export default defineEval({
  description: 'List watches uses list_watches and never markets tools.',
  async test(t) {
    if (skipIfNoLanguageModel(t)) return
    await t.send("what's on my list?")
    t.succeeded()
    t.calledTool('list_watches')
    for (const name of marketsTools) t.notCalledTool(name)
  },
})
