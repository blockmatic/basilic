import { defineEval } from "eve/evals";

import { marketsTools, skipIfNoLanguageModel } from "./skip.js";

export default defineEval({
  description:
    "Who am I returns the local-dev profile reply without markets tools.",
  async test(t) {
    if (skipIfNoLanguageModel(t)) {
      return;
    }
    const turn = await t.send("Who am I?");
    t.succeeded();
    turn.messageIncludes("No profile row is stored for this signed-in user.");
    t.notCalledTool("get_account_snapshot");
    for (const name of marketsTools) {
      t.notCalledTool(name);
    }
  },
});
