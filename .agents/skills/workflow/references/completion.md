# Completion evidence

Use the rows relevant to the requested deliverable. Mark passed, failed, not run, or not applicable with a short reason; do not turn an unchecked box into a claim. Repository-specific gates remain authoritative.

| Deliverable | Evidence to include |
|---|---|
| Plan | Observable acceptance conditions, ordered dependencies, known risks, and references to inspected sources |
| Review or diagnosis | Inspected scope, concrete findings or reproduction evidence, and unresolved uncertainty; no edits unless requested |
| Implementation | Changed behavior, affected checks against the final change, original scenario where relevant, and documentation updates |
| Commit or push | Intended diff, required checks/hooks, commit or remote result, and preserved unrelated work |
| Pull request | Correct branch/base, standalone description, observed verification, and PR link |

## Common failure checks

- [ ] A successful type check is not being presented as runtime proof.
- [ ] Checks were not disabled, weakened, or reported as passing after an environmental failure.
- [ ] Fixes address the evidenced cause; retries and fallback values do not hide broken assumptions.
- [ ] Only requested external actions were taken; finishing implementation does not imply publishing permission.

For changed behavior, follow the repository's existing documentation and FIRST destinations. This file records evidence; it does not define another product success metric, quality policy, or backlog.
