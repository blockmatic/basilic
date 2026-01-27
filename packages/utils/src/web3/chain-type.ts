import { z } from 'zod'

/**
 * Zod schema for validating chain type strings.
 *
 * Supports multiple blockchain types: EVM-compatible chains, Solana, Cosmos,
 * Bitcoin, Flow, Starknet, Algorand, Sui, Spark, and Tron.
 *
 * @example
 * ```ts
 * const result = chainTypeSchema.parse('evm') // ✅ Valid
 * const invalid = chainTypeSchema.parse('unknown') // ❌ Throws ZodError
 * ```
 */
export const chainTypeSchema = z.enum([
  'evm',
  'solana',
  'cosmos',
  'bitcoin',
  'flow',
  'starknet',
  'algorand',
  'sui',
  'spark',
  'tron',
])

/**
 * TypeScript type for chain types.
 *
 * Inferred from `chainTypeSchema`. Use this type for type annotations.
 *
 * @example
 * ```ts
 * const chainType: ChainType = 'evm'
 * ```
 */
export type ChainType = z.infer<typeof chainTypeSchema>
