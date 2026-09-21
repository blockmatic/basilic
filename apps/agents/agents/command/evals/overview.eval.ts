import { defineEval } from 'eve/evals'
import { skipIfNoCommandModel } from './skip.js'

export default defineEval({
  description: 'Market overview uses set_view dashboard.',
  async test(t) {
    if (skipIfNoCommandModel(t)) return
    await t.send('market overview')
    t.succeeded()
    t.calledTool('set_view')
  },
})
