import { defineAgent, defineDynamic } from "eve";

import { scriptedAccount, selectModel } from "#lib/models/index.js";

export default defineAgent({
  build: {
    externalDependencies: ["@repo/db", "@electric-sql/pglite", "pg"],
  },
  defaultTools: false,
  description:
    "Private account specialist: reads the signed-in caller's account, or reports that sign-in is required.",
  model: defineDynamic({
    events: {
      "step.started": () =>
        selectModel({ member: "account", scripted: scriptedAccount }),
    },
  }),
  tool: false,
});
