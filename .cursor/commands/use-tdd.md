# Test-Driven Development

## Overview
Guide for implementing features using TDD workflow when explicitly requested. TDD follows red-green-refactor cycle: write failing tests first, implement minimal code to pass, then refactor while keeping tests green.

## Steps
1. **Write Failing Test (Red Phase)**: Write test describing desired behavior, test should fail initially, focus on behavior not implementation, follow project testing conventions (see @.cursor/rules/base/testing.mdc), use real APIs - no mocks for core functionality
2. **Implement Minimal Code (Green Phase)**: Write simplest code that makes test pass, don't worry about code quality yet, verify test passes, avoid over-engineering
3. **Refactor (Refactor Phase)**: Improve code quality while keeping tests green, extract common patterns/improve naming/reduce duplication, ensure all tests still pass, follow project coding standards/linting rules
4. **Repeat Cycle**: Continue red-green-refactor for each feature increment, build up functionality incrementally, each cycle should be small and focused

## TDD Best Practices
**Do**: Write tests describing behavior not implementation, keep tests simple/focused, use real APIs following project testing philosophy, make small incremental changes, refactor frequently, run tests frequently

**Don't**: Write tests for implementation details, skip refactor phase, write all tests upfront, mock core functionality, write tests too complex or testing multiple things

## Checklist
- [ ] Written failing test describing desired behavior
- [ ] Test uses real APIs (no mocks for core functionality)
- [ ] Test follows project testing conventions
- [ ] Implemented minimal code to make test pass
- [ ] Verified test passes
- [ ] Refactored code while keeping tests green
- [ ] All tests still pass after refactoring
- [ ] Code follows project standards and linting rules
- [ ] Repeated cycle for each feature increment
- [ ] Tests focus on behavior, not implementation details
