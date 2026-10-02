/** Structured result every operator specialist returns through `final_output`. */
export const specialistResultSchema = {
  additionalProperties: false,
  properties: {
    data: { type: "object" },
    status: { enum: ["ok", "required", "error"], type: "string" },
    summary: { type: "string" },
  },
  required: ["status", "summary"],
  type: "object",
} as const;
