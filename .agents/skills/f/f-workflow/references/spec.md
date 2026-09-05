# Workflow First

## Principle

Make the path from intent to validated change explicit enough that humans, agents, and automation can cooperate without reconstructing the process every time.

## Statement

I care less about which methodology name is on the wall and more about whether work can move from idea to shipped, validated change. Who decides what? Where does state live? When does a human approve? If the path is only in people's heads, agents cannot help and humans cannot scale.

## Outcome

Work flows through a recognizable path: idea → plan → implement → review → pipeline signals → approval → release → learning. Handoffs have inputs and outputs. Work state lives in issues, tasks, or PRs — not only in chat. Human approval is explicit for destructive, security-sensitive, or product-consequential changes.

## Artifacts

- Issues, tasks, and pull requests as work state
- Plans and review comments
- ADRs and project docs for consequential decisions
- CI results as automated validation signals
- Agent notes that affect future work, promoted to durable context
- Status updates (ephemeral coordination)

Routing:

- Consequential decision → project doc or ADR
- Temporary coordination → chat or comment
- Work state → issue, task, or PR
- Automated validation → CI result

## Minimum Useful Artifact

- intent, owner, and visible work-state location
- short plan and acceptance criteria for non-trivial work
- actors plus the input and output of each handoff
- required human gates and who can approve
- validation, release, and learning destinations

## Recipe

1. Inspect current work state: issues, PRs, branches, CI status, and any plan.
2. Understand the actor for this step: human, agent, CI, or production signal.
3. Identify gaps: missing plan, missing owner, approval that lives only in chat, state that cannot be found.
4. Propose before implementing on non-trivial work. Surface assumptions.
5. Implement in small, reviewable chunks. Keep state in the issue or PR.
6. Hand off to review with enough context for the next actor to continue.
7. Run validation through existing pipelines. Respond to failures — fix or escalate.
8. Obtain approval for consequential changes. Release. Capture learning in files when decisions changed.

## Validation

- Work state is visible without asking in chat.
- Handoffs include enough context for the next actor to continue.
- Consequential decisions are in files, not only in merged code.
- Failed validation routes to a clear owner and next action.

## Definition of Done

The change moved through an explicit path. State is updated. Durable context reflects what was decided. The next actor can continue without reconstruction.

## Agent Prompt

Apply Workflow First to this repository.

Read current work state — issues, PRs, plans — and project workflow documentation before acting. Identify actors, handoffs, approval boundaries, and where durable state lives. Do not rely on chat as the system of record.

Take notes in durable project files when discoveries affect future work. Propose before implementing on non-trivial work. Implement in reviewable chunks. Use existing CI and review paths.

Stop and ask a human for product scope, security-sensitive changes, and destructive operations. Update issues, PRs, and documentation as work progresses. Preserve intentional existing process decisions.

## Notes

**Workflow vs Pipelines:** Workflow is how actors respond. Pipelines are the automated format, test, build, and deploy mechanics.

**Workflow vs Documentation:** Workflow determines when context is created. Documentation preserves it.

**Navigation:** [Human essay](../articles/WORKFLOW.md) · [Factory map](../ABOUT.md)
