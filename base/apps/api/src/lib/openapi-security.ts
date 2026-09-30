export const openapiSecurity = {
  components: {
    securitySchemes: {
      apiKeyAuth: {
        in: "header" as const,
        name: "X-API-Key",
        type: "apiKey" as const,
      },
      bearerAuth: {
        scheme: "bearer",
        type: "http" as const,
      },
    },
  },
  security: [{ bearerAuth: [] }, { apiKeyAuth: [] }] as Record<
    string,
    string[]
  >[],
};
