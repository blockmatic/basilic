import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Account asks from a caller without a user principal delegate to account, which reports required; the parent still commits the account view.",
  async test(t) {
    const turn = await t.send("who am I");
    t.succeeded();
    t.calledTool("consult_account", { count: 1 });
    t.calledSubagent("account", { status: "completed" });
    t.calledTool("set_view", { input: { surface: "account" } });
    t.notCalledTool("consult_system");
    t.check(turn.message, includes("Sign in"));
  },
});
