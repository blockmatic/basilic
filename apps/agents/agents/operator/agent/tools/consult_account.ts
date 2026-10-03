import { defineWorkflowTool } from "eve/tools";
import { z } from "zod";

import { specialistResultSchema } from "#lib/specialist-result.js";

export default defineWorkflowTool({
  description:
    "Delegate to the private account specialist. Returns { status, summary, data } for the signed-in caller; status is required when the caller is anonymous. Pass a short brief, not the transcript.",
  inputSchema: z.object({
    task: z
      .string()
      .min(1)
      .max(500)
      .describe("What the specialist should read"),
  }),
  async execute({ task }, ctx) {
    "use workflow";
    return ctx.agent("account", {
      message: task,
      outputSchema: specialistResultSchema,
    });
  },
});
