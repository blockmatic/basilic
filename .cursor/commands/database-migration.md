# Database Migration

## Overview
Help create and manage database migrations, generating complete migration files following project's database framework conventions.

## Steps
1. **Migration Analysis**: Review current database schema changes needed, identify data transformation requirements, check for potential data loss/corruption risks, analyze performance impact of schema changes
2. **Migration Script Generation**: Create up and down migration scripts, include proper indexing/constraint management, add data migration logic where needed, implement rollback procedures
3. **Best Practices**: Ensure migrations are atomic/reversible, add proper error handling/validation, include progress monitoring for large datasets, consider zero-downtime deployment strategies
4. **Testing Strategy**: Create test data scenarios, verify migration on staging environment, plan rollback procedures/testing, document deployment steps/timing

## Checklist
- [ ] Reviewed schema changes and data transformation requirements
- [ ] Checked for potential data loss or corruption risks
- [ ] Created up and down migration scripts
- [ ] Included proper indexing and constraint management
- [ ] Ensured migrations are atomic and reversible
- [ ] Added error handling and validation
- [ ] Created test data scenarios
- [ ] Verified migration on staging environment
- [ ] Documented deployment steps and timing
