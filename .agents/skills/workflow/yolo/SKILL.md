---
name: yolo
description: Execute complete quality assurance pass across all apps in monorepo. Use when the user types /yolo.
disable-model-invocation: true
---

Execute complete quality assurance pass across all apps in monorepo. Performs comprehensive checks including linting, building, testing, runtime verification, AI-assisted code review, and external review remediation when available. Work autonomously using best judgment, strictly following repository rules, Cursor rules, and established best practices. NEVER ask permission to edit, delete, or create files - proceed directly with all file operations.

1. **Run Quality Checks**: Execute linting (`pnpm lint`) for all apps/packages, run builds (`pnpm build`) to verify compilation, execute test suites (`pnpm test`), verify dev runtime works correctly, fix any issues found
2. **AI-Assisted Code Review**: Perform full AI-based static review, analyze for correctness bugs/type safety issues/runtime edge cases/performance pitfalls/architectural inconsistencies, cross-check findings against Cursor rules/indexed documentation/existing code patterns, fix all high-confidence issues
3. **External Review Consumption (Conditional)**: If available, fetch existing external review feedback (CodeRabbit PR comments via MCP, CI annotations), categorize issues by severity (critical/correctness/security/performance/style), apply fixes complying with Cursor rules/repository conventions, document conflicts between external feedback and local rules
4. **Autonomous Execution**: Work independently without asking permission, use best judgment based on repository standards, leverage available resources (Cursor skills, indexed documentation, web search, MCP servers), Cursor rules override all other guidance
5. **File Management**: NEVER ask permission - edit/create/delete files directly, dotfiles included - modify `.env`, `.gitignore`, `.cursor/*`, configuration files without asking, delete freely - remove files/directories/features as needed, create freely - add new files/configurations/documentation as required, follow project naming/structure conventions, update documentation when making meaningful/architectural changes
6. **Iteration and Verification**: Iterate as many times as needed until all checks pass, re-run quality checks after fixes to verify resolution, ensure no regressions introduced
7. **Summary and Reporting**: Provide comprehensive summary, document issues found/fixes applied/issues deferred and reasons, note follow-up recommendations

