# AI-Assisted Development Workflow

Guidelines for using AI (Cursor Composer) effectively in large, full-stack TypeScript codebases. AI acts as an **executor**, not an architect—you provide architecture, plans, constraints, and review.

## Core Principles

1. **Architecture First**: Define tech stack, API structure, build system, and documentation before features
2. **Product Planning**: Break roadmap into epics → features → granular tasks
3. **Vertical Slice First**: Build one complete end-to-end feature (backend + frontend + test + deployment) to validate the pipeline
4. **Atomic Tasks**: AI performs best with small, isolated tasks (one file or subsystem)
5. **Plan → Execute → Review**: Generate plan → review/edit → execute one task → review → repeat

## Development Order

1. Architecture & tech stack
2. Build system & tooling
3. CI/CD pipelines
4. Testing infrastructure
5. One complete vertical slice
6. Backend features
7. Frontend features
8. Integration and polish

## Atomic Task Guidelines

Each task should:

- Focus on one file or small subsystem
- Avoid cross-repo multi-file changes
- Have tight scope and clear boundaries
- Include acceptance criteria

**Never** ask AI to implement multiple features at once.

**Good examples:**

- "Convert load-env.ts to ESM syntax"
- "Create POST /wallets/{id}/transfer endpoint and tests"
- "Implement Zod schema for CreateWalletRequest"
- "Add end-to-end test for user signup"

## Plan → Execute → Review Loop

1. **Generate**: Use AI to propose a plan (epic, subsystem, or feature)
2. **Review**: Re-order, remove risky items, split into atomic tasks
3. **Execute**: Send AI one task at a time
4. **Review**: Approve, request changes, or revert
5. **Repeat**: Move to next task

This loop maintains stability while enabling AI-accelerated development.
