import { defineEval } from 'eve/evals'
import { skipIfNoCommandModel } from './skip.js'

export default defineEval({
  description: 'List watches uses list_watches.',
  async test(t) {
    if (skipIfNoCommandModel(t)) return
    await t.send("what's on my list?")
    t.succeeded()
    t.calledTool('list_watches')
  },
})
