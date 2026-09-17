# Changelog

All notable changes to this skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this skill adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-09

### Changed
- Skill folder and `name` are `vitest-v5` (was `vitest-v4`)
- Assumptions document Vitest 5+ (`vitest` ^5), top-level `vi.mock` / `vi.unmock` / `vi.hoisted`, default `clearMocks: true`, and removal of `test.sequential` / `describe.sequential`
- `mock-vi-mock-hoisting` and `mock-clear-between-tests` cover those v5 defaults

## [1.0.0] - 2026-01

### Added
- Initial release with 44 rules across 8 categories
- Async Patterns (7 rules) - CRITICAL priority
- Test Setup & Isolation (6 rules) - CRITICAL priority
- Mocking Patterns (7 rules) - HIGH priority
- Performance (6 rules) - HIGH priority
- Snapshot Testing (5 rules) - MEDIUM priority
- Environment (4 rules) - MEDIUM priority
- Assertions (5 rules) - LOW-MEDIUM priority
- Test Organization (4 rules) - LOW priority
