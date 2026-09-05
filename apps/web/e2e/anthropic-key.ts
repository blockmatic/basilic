/** Same placeholder rules as `apps/api/test/utils/ai-remote.ts` `hasRealAnthropicKey`. */
export function hasRealAnthropicKey(): boolean {
  const key = process.env.ANTHROPIC_API_KEY?.trim() ?? ''
  return Boolean(key) && key !== 'sk-ant-xxx' && !key.startsWith('sk-ant-dummy')
}
