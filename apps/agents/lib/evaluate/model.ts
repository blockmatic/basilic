import { env } from "../env.js";
import { createProductGateway } from "../gateway.js";

export function getEvaluationModel() {
  const gateway = createProductGateway();
  if (!gateway) {
    return null;
  }
  return gateway.evaluationModel(env.JEV_MODEL);
}
