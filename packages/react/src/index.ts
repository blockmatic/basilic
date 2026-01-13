import { appContract } from '@basilic/contracts'
import { type CoreClientOptions, createClient } from '@basilic/core'
import { initQueryClient } from '@ts-rest/react-query'

export function createReactApi(opts: CoreClientOptions): {
  client: ReturnType<typeof createClient>
  tsr: unknown
} {
  const client = createClient(opts)

  // initQueryClient needs baseUrl and an api function
  // Wrap the client to match the ApiFetcher signature expected by initQueryClient
  const tsr = initQueryClient(appContract, {
    baseUrl: opts.baseUrl,
    api: async args => {
      // Cast to work around complex proxy types
      const clientAny = client as unknown as Record<
        string,
        (input: unknown) => Promise<{ status: number; body: unknown; headers: Headers }>
      >
      const routeKey = args.route as unknown as string
      const routeHandler = clientAny[routeKey]
      if (!routeHandler) {
        throw new Error(`Route ${routeKey} not found`)
      }
      return await routeHandler(args)
    },
  })

  return { client, tsr }
}
