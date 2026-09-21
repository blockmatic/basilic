import '#lib/host.js'
import { defineAgent, defineDynamic } from 'eve'
import { getProvider } from '#lib/provider.js'

export default defineAgent({
  model: defineDynamic({
    events: {
      'step.started': () => {
        const model = getProvider()
        if (!model) throw new Error('chat language model is not configured')
        return { model, modelContextWindowTokens: 200_000 }
      },
    },
  }),
})
