import { getAccountSnapshot } from "@repo/db";
import type { AccountSnapshot } from "@repo/db";

import {
  isAccountAsk,
  isAccountScopedAsk,
  userIdFromAuth,
} from "./account-scope.js";
import {
  accountRequiredLanguageModel,
  finishLanguageModel,
  textLanguageModel,
} from "./evaluate/canned-model.js";
import {
  hasAccountRequiredCall,
  lastUserPrompt,
} from "./evaluate/select-model.js";
import { getProvider } from "./provider.js";

export { isAccountAsk, isAccountScopedAsk } from "./account-scope.js";

export function formatAccountReply({
  account,
}: {
  account: AccountSnapshot | null;
}) {
  if (!account) {
    return "No profile row is stored for this signed-in user.";
  }
  const lines = [
    account.name ? `Name: ${account.name}` : "",
    account.username ? `Username: ${account.username}` : "",
    account.email ? `Email: ${account.email}` : "",
    account.joinedAt ? `Joined: ${account.joinedAt}` : "",
  ].filter(Boolean);
  if (lines.length === 0) {
    return "Your profile is signed in but name, username, and email are empty.";
  }
  return lines.join("\n");
}

export async function selectChatLanguageModel({
  messages,
  ctx,
}: {
  messages: { role?: string; content?: unknown }[];
  ctx: {
    session?: {
      auth?: {
        current?: { principalId?: string; principalType?: string } | null;
      };
    };
  };
}) {
  const prompt = lastUserPrompt({ messages });
  if (hasAccountRequiredCall({ messages })) {
    return { model: finishLanguageModel(), modelContextWindowTokens: 8_192 };
  }
  const userId = userIdFromAuth({ ctx });
  if (!userId && isAccountScopedAsk({ prompt })) {
    return {
      model: accountRequiredLanguageModel(),
      modelContextWindowTokens: 8_192,
    };
  }
  if (isAccountAsk({ prompt })) {
    if (!userId) {
      return {
        model: accountRequiredLanguageModel(),
        modelContextWindowTokens: 8_192,
      };
    }
    const { account } = await getAccountSnapshot({ userId });
    return {
      model: textLanguageModel({ text: formatAccountReply({ account }) }),
      modelContextWindowTokens: 8192,
    };
  }
  const model = getProvider();
  if (!model) {
    throw new Error("chat language model is not configured");
  }
  return { model, modelContextWindowTokens: 200_000 };
}
