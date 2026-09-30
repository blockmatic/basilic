import { logger } from "@repo/utils/logger/server";
import { experimental_evaluate } from "ai";
import type { Experimental_EvaluationModel, JSONValue } from "ai";

import { env } from "../env.js";
import { cannedSearchPatch } from "./canned.js";
import { getEvaluationModel } from "./model.js";

export const boardTurnQuestions = {
  cannedIntent: {
    criteria: {
      losers: "Biggest losers / dumpers / 24h down",
      majors: "Only majors / BTC ETH SOL basket",
      movers:
        "What moved / top gainers / 24h winners. Not a signed-in users personal gains.",
      other: "Anything else, including novel filters",
      reset: "Clear filters / show everything / default board",
      volume: "Sort by volume",
      watchlist: "What is on my list / favorites",
      whoami:
        "Who am I / account / profile / my gains / portfolio / positions / holdings",
    },
    instructions:
      "Map typed paraphrases of board sort and filter prompts. Use other for novel filters, symbols, or follow-ups.",
    type: "choice",
  },
  isPrediction: {
    instructions:
      "True if the user asks to predict price, pumps, or whether to buy or sell.",
    type: "boolean",
  },
  outOfSnapshot: {
    instructions:
      "True if the ask needs a field this 24h CoinGecko snapshot cannot answer (ATH, this hour, last week percent, on-chain, news).",
    type: "boolean",
  },
  surface: {
    criteria: {
      account: "Signed-in profile and watches",
      chart: "Price candles or series",
      coin: "Single-asset detail",
      comparison: "Compare a few coins",
      dashboard:
        "Ephemeral market overview widgets (global metrics, trending, watchlist)",
      news: "Headlines",
      other: "Unclear",
      screener: "Filterable market list",
      table: "Default coin table / screener rows",
    },
    instructions:
      "Which closed GenUI surface would help. Unimplemented kinds still paint a table later.",
    type: "choice",
  },
  turnType: {
    criteria: {
      account: "Account, watchlist, portfolio, positions, or personal gains",
      advise: "Investment advice or should-I-buy",
      board: "Change the market board",
      refuse: "Out of product / cannot answer honestly",
    },
    instructions: "How the product should treat this turn.",
    type: "choice",
  },
} as const;

const skipStatuses = new Set([401, 403, 429, 529]);

function statusCodeOf(err: unknown) {
  if (typeof err !== "object" || err === null || !("statusCode" in err)) {
    return;
  }
  return typeof err.statusCode === "number" ? err.statusCode : undefined;
}

function isTimeout(err: unknown) {
  if (!(err instanceof Error)) {
    return false;
  }
  return err.name === "AbortError" || err.name === "TimeoutError";
}

function isPlanLimited(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return /Zero Data Retention|Free tier users do not have access/i.test(
    message
  );
}

function isUpstreamSkip(err: unknown) {
  const status = statusCodeOf(err);
  if (status != null && skipStatuses.has(status)) {
    return true;
  }
  return isTimeout(err) || isPlanLimited(err);
}

export async function evaluateBoardTurn({
  prompt,
  boardQuery,
  model = getEvaluationModel(),
}: {
  prompt: string;
  boardQuery?: JSONValue;
  model?: Experimental_EvaluationModel | null;
}) {
  if (!model) {
    return { skip: "missing-model" as const };
  }

  try {
    const result = await experimental_evaluate({
      abortSignal: AbortSignal.timeout(env.AI_EVALUATE_TIMEOUT_MS),
      maxRetries: 0,
      model,
      providerOptions: {
        gateway: { only: ["typesafe-ai"], zeroDataRetention: true },
      },
      questions: boardTurnQuestions,
      state: { boardQuery: boardQuery ?? null, prompt },
    });
    const intent = result.answers.cannedIntent.choice;
    logger.info(
      {
        cannedIntent: intent,
        generationId: result.response.id,
        isPrediction: result.answers.isPrediction.probability,
        outOfSnapshot: result.answers.outOfSnapshot.probability,
        provider: "gateway",
        surface: result.answers.surface.choice,
        turnType: result.answers.turnType.choice,
      },
      "evaluateBoardTurn"
    );
    return {
      answers: result.answers,
      cannedPatch: cannedSearchPatch({ intent }),
    };
  } catch (error) {
    if (!isUpstreamSkip(error)) throw error;
    logger.warn(
      { provider: "gateway", error },
      "evaluateBoardTurn skipped upstream"
    );
    return { skip: "upstream" as const };
  }
}
