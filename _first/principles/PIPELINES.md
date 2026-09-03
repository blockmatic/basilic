# Pipelines First

## Principle

Treat automated validation and delivery as part of the development feedback loop — including the agent feedback loop — not as a ritual after the real work.

## Statement

A change is not done when it compiles on my machine. It is done when it passes the same checks everyone else relies on, and when it can reach the environment it needs to reach. For agents, CI is ground truth: implement, run checks, read failures, fix or escalate, run again. I keep the path from source to deployable explicit at the level the project actually needs.

## Outcome

Changes flow through an automated path: format → lint → typecheck → test → build → preview (if applicable) → deploy → verify. The commit stage builds the artifact once. Later stages promote that artifact; they do not rebuild a different one per environment. Agents can interpret CI failure output and act.

## Artifacts

- CI workflow definitions
- Deployment workflows and build configuration
- Preview environment setup when the project has it
- Release checks and deployment documentation
- Local scripts that mirror CI where useful
- The commit-stage artifact (the thing that gets promoted)

Keep infrastructure proportional. A static site does not need an orchestration platform.

## Minimum Useful Artifact

- triggers and ordered validation stages
- exact local commands that mirror automated checks
- commit-stage artifact identity and storage
- promotion path across environments without rebuilding
- readable failure ownership and post-deploy verification step

## Recipe

1. Inspect the current pipeline: what runs, when, on what triggers.
2. Understand the path from change to deployable artifact. Find where the binary or bundle is built.
3. Identify gaps: missing checks, manual steps that should be automated, rebuild-per-environment, unreadable logs, flaky jobs.
4. Propose the smallest pipeline improvement — one check, one workflow, one script.
5. Implement. Keep proportional to project size. Build once; promote that artifact.
6. Verify locally with the same commands CI uses when possible.
7. Read CI output. Fix failures or escalate infrastructure limits. Unreadable logs are a pipeline bug.
8. Document deploy and release steps if they are not already durable.

## Validation

- CI passes on the change branch.
- Local validation commands match CI behavior.
- The commit-stage artifact is what later stages deploy.
- A green agent sandbox is not a substitute for the project's pipeline.
- Deploy path is documented and was exercised or dry-run where safe.

## Definition of Done

The change is validated by automated pipelines and is deployable through the project's defined path. Pipeline config is updated if new checks were added.

## Agent Prompt

Apply Pipelines First to this repository.

Read CI workflows, build configuration, and deployment documentation before changing delivery mechanics. Inspect what validation runs on each change. Use the project's existing lint, test, and build commands — mirror CI locally when possible.

When implementation completes, ensure CI would pass. Read failure logs and fix or escalate. Do not treat a green local sandbox as the pipeline. Do not add pipeline complexity beyond what the project needs. Do not rebuild a different artifact per environment if the project already builds once.

Distinguish pipeline failures from quality criteria failures — fix the code or the gate, not both at once without intent. Update deployment docs when delivery behavior changes.

## Notes

**Pipelines vs Workflow:** Pipelines automate validation and delivery. Workflow defines how humans and agents respond to those signals.

**Pipelines vs Architecture:** Architecture defines deployment units and topology. Pipelines build and promote those units.

**Pipelines vs Quality:** Quality names the bar. Pipelines run it.

**Pipelines vs Operations:** Pipelines get changes into production. Operations runs what arrived.

**Navigation:** [Human essay](../articles/PIPELINES.md) · [Factory map](../ABOUT.md)
