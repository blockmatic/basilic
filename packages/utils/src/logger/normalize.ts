import { sanitizeLogData } from './redact.js'

export type ErrField = {
  type: string
  message: string
  stack?: string
}

export type NormalizedLogArgs = {
  obj?: Record<string, unknown>
  msg?: string
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function includeErrStack(): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  return (process.env.LOG_LEVEL ?? '').toLowerCase() === 'debug'
}

export function toErrField(error: Error): ErrField {
  const field: ErrField = { type: error.name, message: error.message }
  if (includeErrStack() && error.stack) field.stack = error.stack
  return field
}

function errMessage(obj: Record<string, unknown> | undefined): string | undefined {
  const err = obj?.err
  if (typeof err === 'object' && err !== null && 'message' in err)
    return String((err as { message: unknown }).message)
  return undefined
}

export function normalizeLogArgs(data?: unknown, msg?: string): NormalizedLogArgs {
  if (typeof data === 'string' && msg === undefined) return { msg: data }
  if (data === undefined) return { msg }

  if (data instanceof Error) {
    const obj = { err: toErrField(data) }
    return { obj, msg: msg ?? obj.err.message }
  }

  if (!isPlainObject(data)) {
    const obj = { data }
    return { obj, msg }
  }

  const copy: Record<string, unknown> = { ...data }
  if (copy.err instanceof Error) copy.err = toErrField(copy.err)
  const obj = sanitizeLogData(copy)
  return { obj, msg: msg ?? errMessage(obj) }
}
