import { searchAssets } from "@repo/markets";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Search public assets by text. No user id.",
  execute: (input) => searchAssets(input),
  inputSchema: z.object({ text: z.string().min(1) }),
});
