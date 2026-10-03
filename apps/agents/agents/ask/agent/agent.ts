import { defineAgent, defineDynamic } from "eve";

import { scriptedAsk, selectModel } from "#lib/models/index.js";

export default defineAgent({
  build: {
    externalDependencies: ["@repo/db", "@electric-sql/pglite", "pg"],
  },
  defaultTools: false,
  description:
    "General-purpose conversation. No tools, no specialists, no Web view.",
  model: defineDynamic({
    events: {
      "step.started": () =>
        selectModel({ member: "ask", scripted: scriptedAsk }),
    },
  }),
});
