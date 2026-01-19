# Security Review

## Overview
Perform comprehensive security review of current code and provide specific remediation steps with code examples for each security issue identified.

## Steps
1. **Authentication & Authorization**: Verify proper authentication mechanisms, check authorization controls/permission systems, review session management/token handling, ensure secure password policies/storage
2. **Input Validation & Sanitization**: Identify SQL injection vulnerabilities, check for XSS/CSRF attack vectors, validate all user inputs/API parameters, review file upload/processing security
3. **Data Protection**: Ensure sensitive data encryption at rest/in transit, check for data exposure in logs/error messages, review API responses for information leakage, verify proper secrets management
4. **Infrastructure Security**: Review dependency security/known vulnerabilities, check HTTPS configuration/certificate validation, analyze CORS policies/security headers, review environment variable/configuration security

## Checklist
- [ ] Verified proper authentication mechanisms
- [ ] Checked authorization controls and permission systems
- [ ] Reviewed session management and token handling
- [ ] Ensured secure password policies and storage
- [ ] Identified SQL injection vulnerabilities
- [ ] Checked for XSS and CSRF attack vectors
- [ ] Validated all user inputs and API parameters
- [ ] Ensured sensitive data encryption at rest and in transit
- [ ] Checked for data exposure in logs and error messages
- [ ] Reviewed dependency security and known vulnerabilities
- [ ] Analyzed CORS policies and security headers
