import { defineEval } from 'eve/evals'
import { skipIfNoCommandModel } from './skip.js'

export default defineEval({
  description: 'Top markets uses get_markets, not watch.',
  async test(t) {
    if (skipIfNoCommandModel(t)) return
    await t.send('top 10 coins today')
    t.succeeded()
    t.calledTool('get_markets')
    t.notCalledTool('watch_asset')
  },
})
