import { defineAgent, defineDynamic } from 'eve'
import { selectCommandLanguageModel } from '#lib/evaluate/select-model.js'

export default defineAgent({
  build: {
    externalDependencies: ['@repo/db', '@electric-sql/pglite', 'pg'],
  },
  model: defineDynamic({
    events: {
      'step.started': (_event, ctx) => selectCommandLanguageModel({ messages: [...ctx.messages] }),
    },
  }),
})
