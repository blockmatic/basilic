import { defineEval } from 'eve/evals'
import { marketsTools, skipIfNoLanguageModel } from './skip.js'

export default defineEval({
  description: 'Who am I succeeds without markets tools.',
  async test(t) {
    if (skipIfNoLanguageModel(t)) return
    await t.send('Who am I?')
    t.succeeded()
    for (const name of marketsTools) t.notCalledTool(name)
  },
})
