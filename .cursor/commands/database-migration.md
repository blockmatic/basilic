# Database Migration

## Overview

Help create and manage database migrations, generating complete migration files following the project's database framework conventions.

## Steps

1. **Migration Analysis**
    - Review current database schema changes needed
    - Identify data transformation requirements
    - Check for potential data loss or corruption risks
    - Analyze performance impact of schema changes
2. **Migration Script Generation**
    - Create up and down migration scripts
    - Include proper indexing and constraint management
    - Add data migration logic where needed
    - Implement rollback procedures
3. **Best Practices**
    - Ensure migrations are atomic and reversible
    - Add proper error handling and validation
    - Include progress monitoring for large datasets
    - Consider zero-downtime deployment strategies
4. **Testing Strategy**
    - Create test data scenarios
    - Verify migration on staging environment
    - Plan rollback procedures and testing
    - Document deployment steps and timing

## Database Migration Checklist

- [ ] Reviewed schema changes and data transformation requirements
- [ ] Checked for potential data loss or corruption risks
- [ ] Created up and down migration scripts
- [ ] Included proper indexing and constraint management
- [ ] Ensured migrations are atomic and reversible
- [ ] Added error handling and validation
- [ ] Created test data scenarios
- [ ] Verified migration on staging environment
- [ ] Documented deployment steps and timing
