import { probeDatabase } from "@repo/db";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description:
    "Read application status: process name, ok, and database readiness.",
  execute: async () => {
    const database = await probeDatabase();
    return { database, name: "Basilic", ok: database };
  },
  inputSchema: z.object({}),
});
