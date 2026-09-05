# Workflow First

## Principle

Make the path from intent to a validated, deployable change explicit enough that humans, agents, and automation can cooperate without reconstructing the process every time.

## Statement

I care less about which methodology name is on the wall and more about whether work can move from idea to shipped, validated change. Who decides what? Where does state live? When does a human approve? A change is not done when it compiles on my machine. It is done when it passes the same checks everyone else relies on, and when it can reach the environment it needs to reach. If the path is only in people's heads, agents cannot help and humans cannot scale.

## Outcome

Work flows through a recognizable path: idea → plan → implement → review → pipeline signals → approval → release → learning. Handoffs have inputs and outputs. Work state lives in issues, tasks, or PRs — not only in chat. Human approval is explicit for destructive, security-sensitive, or product-consequential changes. Changes flow through an automated path: format → lint → typecheck → test → build → preview (if applicable) → deploy → verify. The commit stage builds the artifact once. Later stages promote that artifact; they do not rebuild a different one per environment. Agents can interpret CI failure output and act.

## Artifacts

- Issues, tasks, and pull requests as work state
- Plans and review comments
- ADRs and project docs for consequential decisions
- CI workflow definitions and deployment configuration
- Preview environment setup when the project has it
- The commit-stage artifact (the thing that gets promoted)
- Agent notes that affect future work, promoted to durable context
- Status updates (ephemeral coordination)

Routing:

- Consequential decision → project doc or ADR
- Temporary coordination → chat or comment
- Work state → issue, task, or PR
- Automated validation → CI result

Keep infrastructure proportional. A static site does not need an orchestration platform.

## Minimum Useful Artifact

- intent, owner, and visible work-state location
- short plan and acceptance criteria for non-trivial work
- actors plus the input and output of each handoff
- required human gates and who can approve
- triggers and ordered validation stages
- exact local commands that mirror automated checks
- commit-stage artifact identity and promotion path without rebuilding
- readable failure ownership, release, and learning destinations

## Recipe

1. Inspect current work state: issues, PRs, branches, CI status, any plan, and the path from change to deployable artifact.
2. Understand the actor for this step: human, agent, CI, or production signal. Find where the binary or bundle is built.
3. Identify gaps: missing plan, missing owner, approval that lives only in chat, missing checks, rebuild-per-environment, unreadable logs.
4. Propose before implementing on non-trivial work. Surface assumptions. Prefer the smallest pipeline improvement — one check, one workflow, one script.
5. Implement in small, reviewable chunks. Keep state in the issue or PR. Build once; promote that artifact.
6. Hand off to review with enough context for the next actor to continue. Verify locally with the same commands CI uses when possible.
7. Run validation through existing checks. Read CI output. Fix failures or escalate. Unreadable logs are a workflow bug.
8. Obtain approval for consequential changes. Release. Capture learning in files when decisions changed. Document deploy steps if they are not already durable.

## Validation

- Work state is visible without asking in chat.
- Handoffs include enough context for the next actor to continue.
- Consequential decisions are in files, not only in merged code.
- Failed validation routes to a clear owner and next action.
- CI passes on the change branch.
- Local validation commands match CI behavior.
- The commit-stage artifact is what later stages deploy.
- A green agent sandbox is not a substitute for the project's checks.

## Definition of Done

The change moved through an explicit path and is deployable through the project's defined path. State is updated. Durable context reflects what was decided. The next actor can continue without reconstruction.

## Agent Prompt

Apply Workflow First to this repository.

Read current work state — issues, PRs, plans — plus CI workflows, build configuration, and deployment documentation before acting. Identify actors, handoffs, approval boundaries, and where durable state lives. Do not rely on chat as the system of record.

Take notes in durable project files when discoveries affect future work. Propose before implementing on non-trivial work. Implement in reviewable chunks. Use existing CI and review paths. Mirror CI locally when possible.

When implementation completes, ensure CI would pass. Read failure logs and fix or escalate. Do not treat a green local sandbox as the pipeline. Do not rebuild a different artifact per environment if the project already builds once.

Stop and ask a human for product scope, security-sensitive changes, and destructive operations. Distinguish pipeline failures from quality criteria failures — fix the code or the gate, not both at once without intent. Update issues, PRs, and documentation as work progresses. Preserve intentional existing process decisions.

## Notes

**Workflow vs Quality:** Quality names the bar. Workflow runs it.

**Workflow vs Operations:** Workflow gets changes into production. Operations runs what arrived. A green pipeline is not verified recovery.

**Workflow vs Documentation:** Workflow determines when context is created. Documentation preserves it.

**Workflow vs Architecture:** Architecture defines deployment units and topology. Workflow builds and promotes those units.

**Navigation:** [Human essay](../articles/WORKFLOW.md) · [Factory map](../ABOUT.md)
