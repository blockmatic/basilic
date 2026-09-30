import { getAccountSnapshot } from "@repo/db";
import { defineTool } from "eve/tools";
import { z } from "zod";

import { userIdFromAuth } from "#lib/account-scope.js";

export default defineTool({
  description:
    "Read the signed-in user id, email, name, and image. Returns required when the caller is anonymous.",
  execute: async (_input, ctx) => {
    const userId = userIdFromAuth({ ctx });
    if (!userId) return { required: true };
    const { account } = await getAccountSnapshot({ userId });
    if (!account) return { required: true };
    return {
      email: account.email,
      id: userId,
      image: account.image,
      name: account.name,
    };
  },
  inputSchema: z.object({}),
});
