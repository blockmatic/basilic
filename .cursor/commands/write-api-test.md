# Write API Tests

## Overview
Create comprehensive tests for API endpoints validating behavior through external interactions. Tests use real services with sandbox/staging endpoints and dedicated test accounts following strict safety protocols.

## Testing Philosophy
**CRITICAL**: All tests using real APIs MUST follow mandatory safety constraints:
- **Sandbox/Staging Only**: Use sandbox/staging endpoints exclusively. Production credentials/endpoints FORBIDDEN
- **Dedicated Test Accounts**: Mandate dedicated least-privilege test accounts with minimal permissions
- **Secure Secret Storage**: Store credentials in secure vaults/env vars only. Hardcoded secrets FORBIDDEN
- **Rate Limiting**: Implement rate limiting and respect API quotas
- **Resource Cleanup**: Reset state and delete test data between runs for test isolation
- **Hybrid Testing Strategy**: Use mocks in CI/dev for fast feedback; use sandbox/staging for pre-merge verification

Additional requirements: Test endpoints through public interface, validate responses against contracts, focus on external behavior not internal implementation

## Steps
1. **Test Structure**: Follow project conventions for test file naming, set up proper test lifecycle, use appropriate utilities to simulate requests, test through public interfaces only
2. **Test Coverage**: All operations (create, read, update, delete), error handling/validation scenarios, response validation against contracts, authentication/authorization, input validation
3. **Test Pattern**: Simulate requests through testing utilities, test external behavior not internal code, validate response codes/structure matches contracts, test success/failure scenarios
4. **Response Validation**: Parse/validate responses, use appropriate assertion methods, validate against defined contracts, test structure not implementation

## Checklist
- [ ] Created test file with appropriate naming
- [ ] Set up proper test lifecycle
- [ ] Used appropriate testing utilities for requests
- [ ] Tested all core operations
- [ ] Tested error handling and validation
- [ ] Validated response codes and structure matches contracts
- [ ] Tested authentication/authorization and input validation
- [ ] Sandbox/staging endpoints configured (production forbidden)
- [ ] Dedicated least-privilege test accounts used
- [ ] Credentials stored securely (no hardcoded secrets)
- [ ] Rate limiting implemented and respected
- [ ] Resource cleanup implemented
- [ ] Hybrid testing strategy applied
- [ ] Tests focus on external behavior only

## What NOT to Do
- ❌ Don't test internal implementation
- ❌ Don't mock core functionality
- ❌ Don't test implementation details
- ❌ Don't import and test internal functions directly
- ❌ Don't use console logging
