# Write API Tests

## Overview

Create comprehensive tests for API endpoints that validate behavior through external interactions rather than internal implementation. Tests use real services with sandbox/staging endpoints and dedicated test accounts following strict safety protocols.

## Testing Philosophy

**CRITICAL**: All tests using real APIs MUST follow mandatory safety constraints:

- **Sandbox/Staging Only**: Use sandbox or staging endpoints exclusively. Production credentials and endpoints are FORBIDDEN.
- **Dedicated Test Accounts**: Mandate dedicated least-privilege test accounts with minimal permissions required for testing.
- **Secure Secret Storage**: Store credentials in secure vaults or environment variables only. Hardcoded secrets are FORBIDDEN.
- **Rate Limiting**: Implement rate limiting and respect API quotas to prevent test suite failures.
- **Resource Cleanup**: Reset state and delete test data between runs to ensure test isolation and prevent resource leaks.
- **Hybrid Testing Strategy**: Use mocks in CI/dev environments for fast feedback; use sandbox/staging endpoints for pre-merge verification and integration testing.

Additional requirements:
- Test endpoints through their public interface, not internal code
- Validate responses against defined contracts
- Focus on external behavior, never internal implementation

## Steps

1. **Test Structure**
   - Follow project conventions for test file naming
   - Set up proper test lifecycle management
   - Use appropriate utilities to simulate requests
   - Test through public interfaces only

2. **Test Coverage**
   - All operations (create, read, update, delete)
   - Error handling and validation scenarios
   - Response validation against contracts
   - Authentication and authorization
   - Input validation

3. **Test Pattern**
   - Simulate requests through testing utilities
   - Test external behavior, not internal code
   - Validate response codes
   - Validate response structure matches contracts
   - Test both success and failure scenarios

4. **Response Validation**
   - Parse and validate responses
   - Use appropriate assertion methods
   - Validate against defined contracts
   - Test structure, not implementation

## Checklist

- [ ] Created test file with appropriate naming
- [ ] Set up proper test lifecycle
- [ ] Used appropriate testing utilities for requests
- [ ] Tested all core operations
- [ ] Tested error handling and validation
- [ ] Validated response codes
- [ ] Validated response structure matches contracts
- [ ] Tested authentication/authorization
- [ ] Tested input validation
- [ ] Sandbox/staging endpoints configured (production endpoints forbidden)
- [ ] Dedicated least-privilege test accounts used
- [ ] Credentials stored securely (vaults or environment variables; no hardcoded secrets)
- [ ] Rate limiting implemented and respected
- [ ] Resource cleanup implemented (test data deleted, state reset between runs)
- [ ] Hybrid testing strategy applied (mocks in CI/dev; sandbox/staging for pre-merge verification)
- [ ] Tests focus on external behavior only

## What NOT to Do

- ❌ Don't test internal implementation
- ❌ Don't mock core functionality
- ❌ Don't test implementation details
- ❌ Don't import and test internal functions directly
- ❌ Don't use console logging
