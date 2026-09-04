# Workflow First

## Principle

Make the path from intent to validated change explicit enough that humans, agents, and automation can cooperate without reconstructing the process every time.

## Statement

I care less about which methodology name is on the wall and more about whether work can move from idea to shipped, validated change. Who decides what? Where does state live? When does a human approve? If the path is only in people's heads, agents cannot help and humans cannot scale.

## Outcome

Work flows through a recognizable path: idea → plan → implement → review → pipeline signals → approval → release → learning. Handoffs have inputs and outputs. Work state lives in issues, tasks, or PRs — not only in chat. Human approval is explicit for destructive, security-sensitive, or product-consequential changes.

## Artifacts

- **Fact:** Path: plan (`/plan-feature`) → review → implement (`/exec-push`) → `/git-commit` → PR → CI + CodeRabbit → `/retro`
- **Fact:** Index: [ai-workflow.mdx](../../apps/docu/content/docs/development/ai-workflow.mdx)
- **Fact:** Playbooks: `.agents/skills/workflow/` — `plan-feature`, `exec-push`, `git-commit`, `code-review`, `deslop`, `retro`, `git-create-pr`
- **Fact:** Work state: GitHub issues and pull requests
- **Fact:** Consequential decisions: ADRs and `apps/docu`
- **Fact:** Git: default global user; Conventional Commits; never `--no-verify`; never Co-authored-by trailers ([git.mdc](../../.cursor/rules/base/git.mdc))
- **Fact:** Human gates: product scope, secrets/trust boundaries, destructive ops ([`../AGENTS.md`](../AGENTS.md))
- **Fact:** Models (docs): Grok 4.6 plan/implement; Sol long-horizon; Composer 2.5 mechanical. In-app chat is a product model, not this workflow.

## Minimum Useful Artifact

- intent, owner, visible state: issue or PR
- plan and acceptance criteria: `/plan-feature` for non-trivial work
- actors: human, agent, CI, CodeRabbit
- gates: product, security, destructive — ask a human
- validation: CI; learning: `/retro` and durable files when decisions changed

## Recipe

1. Inspect issues, PRs, branch, CI, and any plan.
2. Understand the actor for this step.
3. Identify missing plan, missing owner, approval only in chat.
4. Propose before implementing on non-trivial work. Surface assumptions.
5. Implement in small, reviewable chunks. Keep state in the issue or PR.
6. Hand off to review with enough context (`/code-review`).
7. Run validation through existing pipelines. Fix or escalate.
8. Obtain approval for consequential changes. Release. Capture learning in files.

## Validation

- Work state is visible without asking in chat.
- Handoffs include enough context for the next actor.
- Consequential decisions are in `apps/docu` or ADRs, not only merged code.
- Failed validation routes to a clear owner and next action.

## Definition of Done

The change moved through an explicit path. State is updated. Durable context reflects what was decided. The next actor can continue without reconstruction.

## Agent Prompt

Apply Workflow First to Basilic.

Read current issues/PRs, ai-workflow MDX, and `.agents/skills/workflow/` before acting. Do not rely on chat as the system of record.

Propose before implementing on non-trivial work. Implement in reviewable chunks. Use `/exec-push` and `/git-commit`. Never `--no-verify`. Use the default global git user.

Stop and ask a human for product scope, security-sensitive changes, and destructive operations. Update issues, PRs, and documentation as work progresses. Preserve intentional existing process.

## Notes

**Workflow vs Pipelines:** Workflow is how actors respond. Pipelines are the automated format, test, build, and deploy mechanics.

**Workflow vs Documentation:** Workflow determines when context is created. Documentation preserves it.

**Navigation:** [Generic spec](../principles/WORKFLOW.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/WORKFLOW.md) · [Factory map](../ABOUT.md) · [AI workflow](../../apps/docu/content/docs/development/ai-workflow.mdx)
