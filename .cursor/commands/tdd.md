# Test-Driven Development

## Overview

Guide for implementing features using Test-Driven Development (TDD) workflow when explicitly requested. TDD follows the red-green-refactor cycle: write failing tests first, implement minimal code to pass, then refactor while keeping tests green.

## Steps

1. **Write Failing Test (Red Phase)**
   - Write a test that describes the desired behavior
   - Test should fail initially (no implementation exists yet)
   - Focus on behavior, not implementation details
   - Follow project testing conventions (see [Base Testing Rules](@.cursor/rules/base/testing.mdc))
   - Use real APIs - no mocks for core functionality

2. **Implement Minimal Code (Green Phase)**
   - Write the simplest code that makes the test pass
   - Don't worry about code quality yet - just make it work
   - Verify the test passes
   - Avoid over-engineering at this stage

3. **Refactor (Refactor Phase)**
   - Improve code quality while keeping tests green
   - Extract common patterns, improve naming, reduce duplication
   - Ensure all tests still pass after refactoring
   - Follow project coding standards and linting rules

4. **Repeat Cycle**
   - Continue red-green-refactor for each feature increment
   - Build up functionality incrementally
   - Each cycle should be small and focused

## TDD Best Practices

### Do

- Write tests that describe behavior, not implementation
- Keep tests simple and focused on one concern
- Use real APIs following project testing philosophy
- Make small, incremental changes
- Refactor frequently to maintain code quality
- Run tests frequently to get fast feedback

### Don't

- Don't write tests for implementation details
- Don't skip the refactor phase
- Don't write all tests upfront - write one at a time
- Don't mock core functionality (follow testing rules)
- Don't write tests that are too complex or test multiple things

## TDD Checklist

- [ ] Written failing test that describes desired behavior
- [ ] Test uses real APIs (no mocks for core functionality)
- [ ] Test follows project testing conventions
- [ ] Implemented minimal code to make test pass
- [ ] Verified test passes
- [ ] Refactored code while keeping tests green
- [ ] All tests still pass after refactoring
- [ ] Code follows project standards and linting rules
- [ ] Repeated cycle for each feature increment
- [ ] Tests focus on behavior, not implementation details

## Related Rules

- [Base Testing Rules](@.cursor/rules/base/testing.mdc) - Testing philosophy and patterns
- [Backend Testing Rules](@.cursor/rules/backend/testing.mdc) - Fastify-specific testing patterns
- [Frontend Testing Rules](@.cursor/rules/frontend/testing.mdc) - React/Next.js-specific testing patterns
