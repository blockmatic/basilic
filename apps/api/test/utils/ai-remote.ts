/** Skip 402 always — quota is an infrastructure concern, not a route bug. */
export const skipIfInsufficientCredits = (
  res: { statusCode: number; body: string },
  name: string,
): boolean => {
  if (res.statusCode === 402) {
    process.stderr.write(
      `[AI test] ${name}: 402 insufficient credits - passing without validation\n`,
    )
    return true
  }
  return false
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
