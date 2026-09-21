import { defineEval } from 'eve/evals'
import { skipIfNoCommandModel } from './skip.js'

export default defineEval({
  description: 'Follow-up stays on the same session and still uses tools.',
  async test(t) {
    if (skipIfNoCommandModel(t)) return
    const first = await t.send('show bitcoin')
    t.succeeded()
    await first.session.send('compare it to ethereum')
    t.succeeded()
    t.calledTool('get_markets')
  },
})
