export interface InitErrorReportingOptions {
  dsn?: string
  environment?: string
  release?: string
  beforeSend?: (...args: never[]) => unknown
}

/** No-op. Sentry stays installed but inactive this phase. */
export function initErrorReporting(_options: InitErrorReportingOptions): void {}
