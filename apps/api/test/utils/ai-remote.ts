import { isInsufficientCreditsResponse } from '../../src/lib/ai/upstream-error.js'

/** Skip only upstream provider credit errors — other 402 responses still fail the suite. */
export const skipIfInsufficientCredits = (
  res: { statusCode: number; body: string },
  name: string,
): boolean => {
  if (!isInsufficientCreditsResponse(res)) return false
  process.stderr.write(`[AI test] ${name}: 402 insufficient credits - passing without validation\n`)
  return true
}

type ResponseLike = {
  statusCode: number
  body: string
  headers?: Record<string, string | string[] | number | undefined>
}

const isConnectionClassFailure = (res: ResponseLike): boolean =>
  res.statusCode === 503 ||
  res.statusCode === 504 ||
  /ECONNREFUSED|fetch failed|ENOTFOUND|ETIMEDOUT|ECONNRESET/i.test(res.body)

export const isProviderUnavailable = (res: ResponseLike): boolean =>
  res.statusCode === 502 || isConnectionClassFailure(res)

const isPlaceholderAnthropicKey = (): boolean => {
  const key = process.env.ANTHROPIC_API_KEY
  return !key || key === 'sk-ant-xxx'
}

export const skipIfProviderUnavailable = (res: ResponseLike, name: string): boolean => {
  if (!isPlaceholderAnthropicKey() && isProviderUnavailable(res)) return false
  if (isProviderUnavailable(res)) {
    process.stderr.write(
      `[AI test] ${name}: AI provider unreachable (${res.statusCode}) - passing without validation\n`,
    )
    return true
  }
  return false
}
