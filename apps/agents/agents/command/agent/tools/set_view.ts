import { viewConfigSchema } from "@repo/utils/view-config";
import { defineTool } from "eve/tools";

export default defineTool({
  description:
    "Commit the command URL state. surface is status or account. q is the command string.",
  execute: (input) => input,
  inputSchema: viewConfigSchema,
});
