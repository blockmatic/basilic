import { defineEval } from 'eve/evals'
import { skipIfNoCommandModel } from './skip.js'

export default defineEval({
  description: 'Watch bitcoin uses watch_asset without a model userId.',
  async test(t) {
    if (skipIfNoCommandModel(t)) return
    await t.send('watch bitcoin')
    t.succeeded()
    t.calledTool('watch_asset')
  },
})
