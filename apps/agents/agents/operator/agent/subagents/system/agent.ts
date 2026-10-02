import { defineAgent, defineDynamic } from "eve";

import { scriptedSystem, selectModel } from "#lib/models/index.js";

export default defineAgent({
  build: {
    externalDependencies: ["@repo/db", "@electric-sql/pglite", "pg"],
  },
  defaultTools: false,
  description:
    "Private system specialist: reads application health and database readiness.",
  model: defineDynamic({
    events: {
      "step.started": () =>
        selectModel({ member: "system", scripted: scriptedSystem }),
    },
  }),
  tool: false,
});
