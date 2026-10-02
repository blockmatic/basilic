import { defineWorkflowTool } from "eve/tools";
import { z } from "zod";

import { specialistResultSchema } from "#lib/specialist-result.js";

export default defineWorkflowTool({
  description:
    "Delegate to the private system specialist. Returns { status, summary, data } for application health and database readiness. Pass a short brief, not the transcript.",
  inputSchema: z.object({
    task: z
      .string()
      .min(1)
      .max(500)
      .describe("What the specialist should read"),
  }),
  async execute({ task }, ctx) {
    "use workflow";
    return ctx.agent("system", {
      message: task,
      outputSchema: specialistResultSchema,
    });
  },
});
