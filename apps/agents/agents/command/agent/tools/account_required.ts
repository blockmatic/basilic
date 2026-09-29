import { defineTool } from 'eve/tools'
import { z } from 'zod'

export default defineTool({
  description: 'Signal that this turn needs a signed-in user. Do not use for public market data.',
  inputSchema: z.object({}),
  execute: () => ({ required: true }),
})
