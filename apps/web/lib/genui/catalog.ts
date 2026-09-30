import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

export const commandCatalog = defineCatalog(schema, {
  actions: {},
  components: {
    StatusCard: {
      description: "Application status bound to the status tool result",
      props: z.object({
        database: z.boolean(),
        name: z.string(),
        ok: z.boolean(),
      }),
    },
    UserInfo: {
      description: "Signed-in account card",
      props: z.object({
        email: z.string().nullable(),
        image: z.string().nullable(),
        name: z.string().nullable(),
      }),
    },
  },
});
