# Evaluation models (AI SDK v7)

Grep the installed `ai` package for `experimental_evaluate` before copying names. Needs `ai` ≥ 7.0.105.

Jev and other System One models are evaluation models, not chat models. They answer named questions over a `state` payload and return typed answers plus probabilities.

Confirm the installed signature in `node_modules/ai/docs/` (or https://ai-sdk.dev/docs/ai-sdk-core/evaluation.md). Typical shape:

```ts
import { experimental_evaluate } from 'ai'

const result = await experimental_evaluate({
  model: evaluationModel,
  state,
  questions,
})
```

Gateway host: `createGateway({ apiKey })` then `gateway.evaluationModel('typesafe-ai/jev')`, or the string `'typesafe-ai/jev'` when that is what the installed docs show. Do not send evaluation traffic to OpenAI-compatible chat URLs.

On missing model, throw, or low confidence: skip the fast path and run the existing `ToolLoopAgent` / `streamText` handler.

See [typesafe-ai](../typesafe-ai/SKILL.md).
