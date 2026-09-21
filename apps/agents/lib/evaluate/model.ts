import { createGateway } from 'ai'
import { env } from '../env.js'

export function getEvaluationModel() {
  const token = env.AI_GATEWAY_API_KEY ?? env.VERCEL_OIDC_TOKEN
  if (!token) return null
  return createGateway({ apiKey: token }).evaluationModel(env.JEV_MODEL)
}
