import { defineAgent, defineDynamic } from "eve";

import { scriptedOperator, selectModel } from "#lib/models/index.js";

export default defineAgent({
  build: {
    externalDependencies: ["@repo/db", "@electric-sql/pglite", "pg"],
  },
  defaultTools: false,
  description:
    "Orchestrates application requests. Delegates to private specialists, then commits the Web view.",
  model: defineDynamic({
    events: {
      "step.started": () =>
        selectModel({ member: "operator", scripted: scriptedOperator }),
    },
  }),
});
