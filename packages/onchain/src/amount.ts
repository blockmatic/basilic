export function amountFromHex({
  balanceHex,
  decimals,
}: {
  balanceHex: string
  decimals: number | null
}): string {
  const scale = decimals ?? 18
  try {
    const raw = BigInt(balanceHex)
    if (scale < 0) return '0'
    const denom = 10n ** BigInt(scale)
    const whole = raw / denom
    const frac = raw % denom
    if (frac === 0n) return whole.toString()
    const fracStr = frac.toString().padStart(scale, '0').replace(/0+$/, '')
    return `${whole}.${fracStr}`
  } catch {
    return '0'
  }
}
