---
name: write-api-test
description: Create comprehensive tests for API endpoints validating behavior through external interactions. Use when the user types /write-api-test.
disable-model-invocation: true
---

Create comprehensive tests for API endpoints validating behavior through external interactions. Tests use real services with sandbox/staging endpoints and dedicated test accounts following strict safety protocols.

1. **Test Structure**: Follow project conventions for test file naming, set up proper test lifecycle, use appropriate utilities to simulate requests, test through public interfaces only
2. **Test Coverage**: All operations (create, read, update, delete), error handling/validation scenarios, response validation against contracts, authentication/authorization, input validation
3. **Test Pattern**: Simulate requests through testing utilities, test external behavior not internal code, validate response codes/structure matches contracts, test success/failure scenarios
4. **Response Validation**: Parse/validate responses, use appropriate assertion methods, validate against defined contracts, test structure not implementation
5. **Safety Protocols**: Sandbox/staging endpoints configured (production forbidden), dedicated least-privilege test accounts used, credentials stored securely (no hardcoded secrets), rate limiting implemented and respected, resource cleanup implemented, hybrid testing strategy applied

