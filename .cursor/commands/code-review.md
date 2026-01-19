# Code Review

## Overview
Perform thorough code review verifying functionality, maintainability, and security. Focus on architecture, readability, performance, provide actionable suggestions.

## Steps
1. **Understand change**: Read PR description/issues for context, identify scope of files/features impacted, note assumptions/questions
2. **Validate functionality**: Confirm code delivers intended behavior, exercise edge cases/guard conditions, check error handling/logging
3. **Assess quality**: Ensure functions focused/names descriptive/code readable, watch for duplication/dead code/missing tests, verify documentation updated
4. **Review security/risk**: Look for injection points/insecure defaults/missing validation, confirm secrets not exposed, evaluate performance/scalability impacts

## Checklist

### Functionality
- [ ] Intended behavior works and matches requirements
- [ ] Edge cases handled gracefully
- [ ] Error handling appropriate and informative

### Code Quality
- [ ] Code structure clear and maintainable
- [ ] No unnecessary duplication or dead code
- [ ] Tests/documentation updated as needed

### Security & Safety
- [ ] No obvious security vulnerabilities introduced
- [ ] Inputs validated and outputs sanitized
- [ ] Sensitive data handled correctly

## Additional Notes
- Architecture/design decisions considered
- Performance bottlenecks/regressions assessed
- Coding standards/best practices followed
- Resource management/error handling/logging reviewed
- Suggested alternatives/additional test cases/documentation updates captured

Provide constructive feedback with concrete examples and actionable guidance.
