# Quality First

## Principle

Name what good means — acceptance, tests, evals, performance — before anyone optimizes toward an undefined target.

## Statement

I do not ask anyone to "make it better" without saying what better means. Tests prove deterministic behavior. Evals cover probabilistic output. Performance budgets beat vibes. Name the bar before you optimize, or you ship something that looks done and still fails users.

## Outcome

Acceptance criteria exist for features that matter. Tests protect critical paths. AI features with probabilistic output have evals where appropriate. Performance-sensitive areas have budgets. Humans and agents know what done means beyond "it compiles."

## Artifacts

- Acceptance criteria tied to journeys and product goals
- Unit, integration, and end-to-end tests
- AI evals and golden datasets where relevant
- Performance budgets and regression checks
- Visual or interaction validation notes
- Quality gates in review or CI configuration

Choose the mechanism that matches the output. Deterministic code gets tests. Model behavior gets evals. Do not substitute one for the other.

## Minimum Useful Artifact

- user-visible claim or risk being protected
- testable acceptance criterion or scored eval behavior
- instrument, dataset, threshold, and budget where relevant
- command or demonstration that performs validation
- owner and decision path when the bar fails

## Recipe

1. Inspect what quality artifacts exist and what CI already enforces.
2. Understand what "good" means for this change: behavior, visual correctness, eval score, or budget.
3. Identify gaps: missing acceptance criteria, unprotected critical paths, AI features with no eval, no performance threshold.
4. Propose the smallest useful quality artifact before or alongside implementation.
5. Write criteria that assert behavior, not implementation detail.
6. Implement. Run the project's existing validation — do not invent a parallel suite.
7. Fix failures or escalate when criteria cannot be met without a product decision.
8. Update quality artifacts when behavior or criteria change.

## Validation

- Acceptance criteria are testable or demonstrable.
- Critical paths have automated protection where the project supports it.
- Failures produce actionable signal, not noise.
- AI evals cover the behaviors users actually depend on.
- CI going green is Pipelines. Meeting the bar is Quality.

## Definition of Done

This station’s stated quality criteria are met and verified by the project's existing validation. Regressions are caught or explicitly accepted with documented rationale. CI going green is Pipelines. This is not Product success after use.

## Agent Prompt

Apply Quality First to this repository.

Read acceptance criteria, existing tests, evals, and quality gates before implementing. Define what "good" means for this change — behavior, performance, visual correctness, or eval scores. Do not optimize toward an undefined target.

Write or update tests and criteria before or alongside implementation. Use the project's existing validation commands. For probabilistic features, add or run evals; do not treat a unit test of the wrapper as the eval.

Preserve intentional existing test patterns. Propose the smallest useful quality artifact. Fix validation failures or escalate. Update durable quality docs when criteria change.

## Notes

**Quality vs Pipelines:** Quality defines what should be validated. Pipelines run the validation.

**Quality vs Product:** Product defines success after use and ships the analytics. Quality defines the bar that gates a release.

**Quality vs Data:** Data owns domain invariants and dataset integrity. Quality owns release gates and eval datasets.

**Navigation:** [Human essay](../articles/QUALITY.md) · [Factory map](../ABOUT.md)
