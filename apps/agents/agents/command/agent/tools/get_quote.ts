import { getQuote } from "@repo/markets";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Get a public quote. No user id.",
  execute: (input) => getQuote(input),
  inputSchema: z.object({
    assetId: z.string().min(1),
    vs: z.string().optional(),
  }),
});
