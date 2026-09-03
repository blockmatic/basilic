# Security First

## Principle

Identify what you are trusting, protecting, exposing, and allowing — proportionally to actual risk — before architecture makes security assumptions expensive to change.

## Statement

Security is not a phase at the end. It is a set of decisions about boundaries: who can access what, what data is sensitive, what inputs are untrusted, what an agent is allowed to touch. I scale rigor to risk — an internal tool and a regulated financial product do not get the same bar. I also do not pretend risk is zero.

## Outcome

Trust boundaries are documented. Auth rules are consistent and enforced at boundaries. Secrets are not committed and not logged. External inputs are validated. Agent permissions are scoped: read-only where possible, destructive actions gated, secrets minimized, human approval for high-risk operations.

## Artifacts

- Threat model or security constraints, scaled to project risk
- Auth rules and permission models
- Secret-handling rules and environment configuration docs
- Data classification notes
- Agent permission boundaries and approval requirements
- Security scanning and dependency audit configuration

Treat the agent as a service account: least privilege, and least agency. High-impact actions wait for a human.

## Minimum Useful Artifact

- protected assets and data classifications
- principals, trust boundaries, and Security-owned authorization policy
- untrusted inputs, secrets, and external dependencies
- allowed, denied, and human-gated actions for agents
- accepted risks, owner, and next review trigger

## Recipe

1. Inspect trust boundaries: public, authenticated, admin-only, internal-only.
2. Understand what is stored, transmitted, logged, and exposed to agents.
3. Identify gaps: auth drift, secrets in logs, untrusted input paths, overly broad agent tools.
4. Propose the smallest security improvement or documentation fix.
5. Define agent permissions the way you would define a role. Gate destructive work.
6. Implement with existing project security patterns. Do not invent a parallel auth system.
7. Validate with the project's scans and tests. Failures are fixed or explicitly accepted.
8. Update security artifacts when behavior or the trust model changes.

## Validation

- Auth rules enforced at boundaries, not ad hoc per handler.
- No secrets in code, logs, or agent-accessible files without justification.
- Destructive and high-risk operations require human approval.
- Security scans pass, or failures are accepted with rationale.

## Definition of Done

Trust boundaries and permissions are documented and implemented consistently. Agent access is scoped. Identified risks are addressed or explicitly accepted at the appropriate level.

## Agent Prompt

Apply Security First to this repository.

Read security documentation, auth rules, permission models, and the target project's own security instructions before changing trust boundaries. Inspect how authentication, authorization, secrets, and external inputs are handled. Do not assume docs match implementation.

Identify what data is sensitive and what actions are destructive. Scope your own permissions: prefer read-only inspection, avoid secrets, require human approval for destructive or security-consequential changes. Treat yourself as a service account, not a trusted colleague.

Propose the smallest useful security fix or documentation update. Use existing project security patterns and scanning. Update durable security artifacts when the trust model changes.

## Notes

**Security vs Operations:** Security defines trust, protection, and permissions. Operations defines runtime visibility and recovery.

**Security vs API:** API defines contracts at boundaries. Security defines who may invoke them and what they may access.

**Security vs Architecture:** Architecture maps trust boundaries and dependencies. Security defines the protection and authorization policy across them.

**Security vs Data:** Data maps classification, copies, retention, and deletion. Security owns access and protection policy.

**Navigation:** [Human essay](../articles/SECURITY.md) · [Factory map](../ABOUT.md)
