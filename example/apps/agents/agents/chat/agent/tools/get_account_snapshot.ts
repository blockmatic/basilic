import { getAccountSnapshot } from "@repo/db";
import { defineTool } from "eve/tools";
import { z } from "zod";

import { userIdFromCtx } from "#lib/principal.js";

export default defineTool({
  description:
    "Read this caller's users row from Postgres (name, email, username, joinedAt). Call this before answering who they are, their profile, or their account. Empty input. No wallet balances.",
  execute: (_input, ctx) =>
    getAccountSnapshot({ userId: userIdFromCtx({ ctx }) }),
  inputSchema: z.object({}),
});
