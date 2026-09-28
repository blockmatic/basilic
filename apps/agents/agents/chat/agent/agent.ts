import { defineAgent, defineDynamic } from 'eve'
import { selectChatLanguageModel } from '#lib/chat-select-model.js'

export default defineAgent({
  defaultTools: false,
  build: {
    externalDependencies: ['@repo/db', '@electric-sql/pglite', 'pg'],
  },
  model: defineDynamic({
    events: {
      'step.started': (_event, ctx) =>
        selectChatLanguageModel({ messages: [...ctx.messages], ctx }),
    },
  }),
})
