---
name: b-use-tdd
description: Guide for implementing features using TDD workflow when explicitly requested. Use when the user types /b-use-tdd.
disable-model-invocation: true
---

## Purpose

Guide for implementing features using TDD workflow when explicitly requested. TDD follows red-green-refactor cycle: write failing tests first, implement minimal code to pass, then refactor while keeping tests green.

## Steps

1. **Write Failing Test (Red Phase)**: Write test describing desired behavior, test should fail initially, focus on behavior not implementation, follow project testing conventions (see @.cursor/rules/base/testing.mdc), use real APIs - no mocks for core functionality
2. **Implement Minimal Code (Green Phase)**: Write simplest code that makes test pass, don't worry about code quality yet, verify test passes, avoid over-engineering
3. **Refactor (Refactor Phase)**: Improve code quality while keeping tests green, extract common patterns/improve naming/reduce duplication, ensure all tests still pass, follow project coding standards/linting rules
4. **Repeat Cycle**: Continue red-green-refactor for each feature increment, build up functionality incrementally, each cycle should be small and focused

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
