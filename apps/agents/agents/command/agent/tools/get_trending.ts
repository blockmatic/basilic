import { getTrending } from "@repo/markets";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Get public trending coins. No user id.",
  execute: (input) => getTrending(input),
  inputSchema: z.object({ vs: z.string().optional() }),
});
