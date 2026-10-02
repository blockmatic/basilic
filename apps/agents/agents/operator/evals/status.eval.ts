import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

import { operatorBriefs } from "#lib/models/index.js";

const ask = "show application status";

export default defineEval({
  description:
    "Status asks delegate to the private system specialist with a brief, then the parent commits the status view.",
  async test(t) {
    const turn = await t.send(ask);
    t.succeeded();
    t.calledTool("consult_system", {
      count: 1,
      input: (input) =>
        (input as { task?: string }).task === operatorBriefs.system,
    });
    t.calledTool("consult_system", {
      input: (input) => (input as { task?: string }).task !== ask,
    });
    t.calledSubagent("system", { status: "completed" });
    t.calledTool("set_view", {
      input: { q: ask, surface: "status", version: 1 },
    });
    t.notCalledTool("consult_account");
    t.toolOrder(["consult_system", "set_view"]);
    t.check(turn.message, includes(/database (ready|unavailable)/));
  },
});
