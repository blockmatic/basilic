import '#lib/host.js'
import { defineAgent, defineDynamic } from 'eve'
import { selectCommandLanguageModel } from '#lib/evaluate/select-model.js'

export default defineAgent({
  model: defineDynamic({
    events: {
      'step.started': (_event, ctx) => selectCommandLanguageModel({ messages: [...ctx.messages] }),
    },
  }),
})
