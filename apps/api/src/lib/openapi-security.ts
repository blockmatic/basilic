export const openapiSecurity = {
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http' as const,
        scheme: 'bearer',
      },
      apiKeyAuth: {
        type: 'apiKey' as const,
        in: 'header' as const,
        name: 'X-API-Key',
      },
    },
  },
  security: [{ bearerAuth: [] }, { apiKeyAuth: [] }] as Record<string, string[]>[],
}
