# YOLO – Comprehensive Quality Assurance

## Overview
Execute complete quality assurance pass across all apps in monorepo. Performs comprehensive checks including linting, building, testing, runtime verification, AI-assisted code review, and external review remediation when available. Work autonomously using best judgment, strictly following repository rules, Cursor rules, and established best practices.

## CRITICAL: No Permission Required
**THE MAIN POINT**: Agents executing this command MUST work autonomously and NEVER ask for permission to:
- **Edit ANY files** - including dotfiles (`.env`, `.gitignore`, `.cursor/*`, etc.), configuration files, source code, documentation, or any other files
- **Delete files** - remove files, directories, or entire features as needed
- **Create files** - add new files, directories, configurations, or documentation

**Proceed directly with all file operations without asking.** This is a "YOLO" command - act decisively and autonomously. Agent has full authority to modify codebase to achieve quality assurance goals.

## Steps
1. **Run Quality Checks**: Execute linting (`pnpm lint`) for all apps/packages, run builds (`pnpm build`) to verify compilation, execute test suites (`pnpm test`), verify dev runtime works correctly, fix any issues found
2. **AI-Assisted Code Review**: Perform full AI-based static review, analyze for correctness bugs/type safety issues/runtime edge cases/performance pitfalls/architectural inconsistencies, cross-check findings against Cursor rules/indexed documentation/existing code patterns, fix all high-confidence issues
3. **External Review Consumption (Conditional)**: If available, fetch existing external review feedback (CodeRabbit PR comments via MCP, CI annotations), categorize issues by severity (critical/correctness/security/performance/style), apply fixes complying with Cursor rules/repository conventions, document conflicts between external feedback and local rules
4. **Autonomous Execution**: Work independently without asking permission, use best judgment based on repository standards, leverage available resources (Cursor skills, indexed documentation, web search, MCP servers), Cursor rules override all other guidance
5. **File Management**: **NEVER ask permission** - edit/create/delete files directly, **Dotfiles included** - modify `.env`, `.gitignore`, `.cursor/*`, configuration files without asking, **Delete freely** - remove files/directories/features as needed, **Create freely** - add new files/configurations/documentation as required, follow project naming/structure conventions, update documentation when making meaningful/architectural changes
6. **Iteration and Verification**: Iterate as many times as needed until all checks pass, re-run quality checks after fixes to verify resolution, ensure no regressions introduced
7. **Summary and Reporting**: Provide comprehensive summary, document issues found/fixes applied/issues deferred and reasons, note follow-up recommendations

## Checklist
- [ ] Linting passes for all apps and packages (`pnpm lint`)
- [ ] All builds succeed (`pnpm build`)
- [ ] All tests pass (`pnpm test`)
- [ ] Dev runtime verified for each app
- [ ] Cursor AI code review completed
- [ ] External review feedback consumed when available
- [ ] All fixes verified with re-run checks
- [ ] No regressions introduced
- [ ] Documentation updated if needed
- [ ] All repository and Cursor rules followed
- [ ] Comprehensive summary provided
