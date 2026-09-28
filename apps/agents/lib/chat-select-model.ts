import { type AccountSnapshot, getAccountSnapshot } from '@repo/db'
import { textLanguageModel } from './evaluate/canned-model.js'
import { lastUserPrompt } from './evaluate/select-model.js'
import { getProvider } from './provider.js'

export function isAccountAsk({ prompt }: { prompt: string }) {
  const text = prompt
    .trim()
    .toLowerCase()
    .replace(/[?!.,]+$/g, '')
    .trim()
  if (!text) return false
  return (
    /^who\s+am\s+i$/.test(text) ||
    text === 'whoami' ||
    /^who\s+i\s+am$/.test(text) ||
    /^(?:what(?:'s| is)\s+)?my\s+(?:name|email|username|profile|account)$/.test(text) ||
    /^signed in as$/.test(text)
  )
}

export function formatAccountReply({ account }: { account: AccountSnapshot | null }) {
  if (!account) return 'No profile row is stored for this signed-in user.'
  const lines = [
    account.name ? `Name: ${account.name}` : '',
    account.username ? `Username: ${account.username}` : '',
    account.email ? `Email: ${account.email}` : '',
    account.joinedAt ? `Joined: ${account.joinedAt}` : '',
  ].filter(Boolean)
  if (lines.length === 0)
    return 'Your profile is signed in but name, username, and email are empty.'
  return lines.join('\n')
}

export async function selectChatLanguageModel({
  messages,
  ctx,
}: {
  messages: { role?: string; content?: unknown }[]
  ctx: { session?: { auth?: { current?: { principalId?: string } | null } } }
}) {
  const prompt = lastUserPrompt({ messages })
  if (isAccountAsk({ prompt })) {
    const userId = ctx.session?.auth?.current?.principalId
    if (!userId)
      return {
        model: textLanguageModel({ text: 'Sign in to see your profile.' }),
        modelContextWindowTokens: 8_192,
      }
    const { account } = await getAccountSnapshot({ userId })
    return {
      model: textLanguageModel({ text: formatAccountReply({ account }) }),
      modelContextWindowTokens: 8_192,
    }
  }
  const model = getProvider()
  if (!model) throw new Error('chat language model is not configured')
  return { model, modelContextWindowTokens: 200_000 }
}
