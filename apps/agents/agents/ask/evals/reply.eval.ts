import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Chat answers in text with no tools, no specialists, and no Web view.",
  async test(t) {
    const turn = await t.send("hello there");
    t.succeeded();
    t.usedNoTools();
    t.notEvent("subagent.called");
    t.check(turn.message, includes("hello there"));
  },
});
