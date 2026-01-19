## YOLO – Comprehensive Quality Assurance

## Overview

Execute a complete quality assurance pass across all apps in the monorepo. This command performs comprehensive checks including linting, building, testing, runtime verification, AI-assisted code review, and external review remediation when available. Work autonomously using best judgment, strictly following repository rules, Cursor rules, and established best practices.

## CRITICAL: No Permission Required

**THE MAIN POINT**: Agents executing this command MUST work autonomously and NEVER ask for permission to:

* **Edit ANY files** - including dotfiles (`.env`, `.gitignore`, `.cursor/*`, etc.), configuration files, source code, documentation, or any other files
* **Delete files** - remove files, directories, or entire features as needed
* **Create files** - add new files, directories, configurations, or documentation

**Proceed directly with all file operations without asking.** This is a "YOLO" command - act decisively and autonomously. The agent has full authority to modify the codebase to achieve quality assurance goals.

## Steps

### 1. Run Quality Checks Across All Apps

* Execute linting (`pnpm lint`) for all apps and packages
* Run builds (`pnpm build`) for all apps to verify compilation
* Execute test suites (`pnpm test`) for all apps
* Verify dev runtime works correctly for each app
* Fix any issues found during these checks

### 2. AI-Assisted Code Review (Cursor Native)

* Perform a full AI-based static review of the codebase
* Analyze for:

  * correctness bugs
  * type safety issues
  * runtime edge cases
  * performance pitfalls
  * architectural inconsistencies
* Cross-check findings against:

  * Cursor rules
  * indexed documentation
  * existing code patterns
* Fix all high-confidence issues

### 3. External Review Consumption (Conditional)

* If available, fetch existing external review feedback, such as:

  * CodeRabbit pull request comments via MCP
  * CI annotations or review notes provided in context
* Categorize issues by severity:

  * critical
  * correctness
  * security
  * performance
  * style
* Apply fixes that:

  * comply with all Cursor rules
  * respect repository conventions
  * avoid breaking public APIs unless required
* Document any conflicts between external feedback and local rules

Important constraints:

* Do not claim to execute or re-run external review tools
* External tools are consumed read-only through MCP or provided context

### 4. Autonomous Execution

* Work independently without asking for permission
* Use best judgment based on repository standards
* Leverage available resources:

  * Cursor skills (`.cursor/skills/`)
  * Indexed documentation
  * Web search when needed
  * MCP servers for context consumption
* Cursor rules override all other guidance

### 5. File Management

* **NEVER ask permission** - edit, create, or delete files directly
* **Dotfiles included** - modify `.env`, `.gitignore`, `.cursor/*`, configuration files, or any dotfiles without asking
* **Delete freely** - remove files, directories, or features as needed for quality improvements
* **Create freely** - add new files, configurations, or documentation as required
* Follow project naming and structure conventions
* Update documentation when making meaningful or architectural changes

### 6. Iteration and Verification

* Iterate as many times as needed until all checks pass
* Re-run quality checks after fixes to verify resolution
* Ensure no regressions are introduced

### 7. Summary and Reporting

* Provide a comprehensive summary at the end
* Document:

  * issues found
  * fixes applied
  * issues deferred and reasons
* Note any follow-up recommendations

## YOLO Checklist

* Linting passes for all apps and packages (`pnpm lint`)
* All builds succeed (`pnpm build`)
* All tests pass (`pnpm test`)
* Dev runtime verified for each app
* Cursor AI code review completed
* External review feedback consumed when available
* All fixes verified with re-run checks
* No regressions introduced
* Documentation updated if needed
* All repository and Cursor rules followed
* Comprehensive summary provided

## Related Rules

* Linting Rules (`.cursor/rules/base/linting.mdc`)
* General Agent Rules (`.cursor/rules/base/general.mdc`)
* Testing Rules (`.cursor/rules/base/testing.mdc`)
* TypeScript Rules (`.cursor/rules/base/typescript.mdc`)
