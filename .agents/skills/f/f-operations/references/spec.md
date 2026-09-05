# Operations First

## Principle

Decide how you will see, support, and recover the running system before production becomes a black box.

## Statement

Shipping is not the end of engineering work. It is when the system meets reality. I want to know what it is doing, what failed, for whom, and how to fix it — without archaeology. A product nobody can operate is a product that will fail quietly.

## Outcome

Production behavior is observable at the level the project needs. Logs are structured and useful. A healthy HTTP status is not AI quality: log prompt, response, tool, and token signals at project scale. Metrics and alerts cover critical failure modes. Runbooks exist for known recovery paths. Product analytics are not the same dashboard as engineering health. User-feedback hooks are ops instrumentation, not Product funnels. A green pipeline after a fix is not verified recovery.

## Artifacts

- Observability configuration (logging, metrics, tracing)
- Dashboards and alert rules for system health
- Runbooks and recovery procedures
- Operational documentation (deploy behavior, known failure modes)
- Incident notes promoted to durable docs when patterns repeat
- Identity, logs, and retries for production agents when the product has them

Keep this proportional. A brochure site does not need a tracing mesh.

## Minimum Useful Artifact

- critical runtime path and the failure that would strand a user
- structured signal and join key used to diagnose it
- alert condition, owner, and escalation path
- tested recovery steps
- running-system evidence that recovery succeeded

## Recipe

1. Inspect how the system reports health: logs, metrics, traces, user-facing errors.
2. Understand critical failure modes: what breaks, how it surfaces, who notices first.
3. Identify gaps: a 500 with no request id, a queue that dies silently, a deploy that cannot be verified.
4. Propose the smallest useful signal — one log field, one metric, one alert.
5. Write or update a runbook for recovery paths that have burned time.
6. Implement. Do not invent product events here — that is Product First.
7. When production reveals a bug, route through workflow: issue → fix → pipeline → verify recovery in the running system.
8. Update operational docs when behavior, deploy process, or failure modes change.

## Validation

- A developer can diagnose a common failure from logs or metrics without guessing.
- Alerts fire on real problems, not noise.
- Recovery steps are documented and were tested or exercised.
- Post-fix deploy was verified in production or staging. CI green is not that verification.

## Definition of Done

Runtime behavior is observable enough to support and debug. Recovery paths are known. Production feedback can enter the development workflow and close the loop.

## Agent Prompt

Apply Operations First to this repository.

Read operational documentation, logging configuration, metrics, alerts, and runbooks before changing runtime behavior. Inspect how the system reports errors and health. Identify blind spots in observability.

Propose the smallest useful logging, metric, or alert improvement. When diagnosing production issues, use structured signals — not guesswork. Route fixes through the project's workflow. Verify recovery after deploy in the running system.

Product analytics — events, funnels, activation — belong with Product First. Do not file a missing success event as an ops ticket. Do not add observability complexity beyond project scale. Production agents need identity, logs, retries, and a trace of what they did.

## Notes

**Operations vs Workflow:** Workflow moves changes into production. Operations understands and runs the system after deployment.

**Operations vs Security:** Security defines trust and protection. Operations defines visibility and recovery.

**Operations vs Product:** Product owns whether the bet is working and already owns success events. Operations owns whether the system is healthy. Same warehouse is fine. Same dashboard is not. Do not put funnels on the ops dashboard.

**Operations vs Architecture:** Architecture names deployment units and topology. Operations observes, supports, and recovers them.

**Operations vs Data:** Data owns product-state meaning and lineage. Operations owns telemetry about runtime health.

**Operations vs Quality:** Quality already owns scored evals. Operations logs the runtime signals that make a 200 with a useless answer visible.

**Navigation:** [Human essay](../articles/OPERATIONS.md) · [Factory map](../ABOUT.md)
