export type CoreClientOptions = {
  baseUrl: string
  getAuthToken?: () => string | null | Promise<string | null>
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>
}
