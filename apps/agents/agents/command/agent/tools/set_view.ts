import { defineTool } from 'eve/tools'
import { setViewInputSchema } from '#lib/evaluate/view-config.js'

export default defineTool({
  description:
    'Commit the closed ViewConfig for this command. Always call this before ending the turn. Never emit CSS or a json-render Spec.',
  inputSchema: setViewInputSchema,
  execute: input => input,
})
