---
name: security-practices
description: Master secure development, OWASP top 10, testing, and compliance. Use when building secure systems, conducting security reviews, or implementing best practices.
sasmp_version: "1.3.0"
bonded_agent: 06-security-qa-practices
bond_type: PRIMARY_BOND
---

# Security, QA & Best Practices Skill

## Quick Start - Secure Authentication

```javascript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Hash password
const password = 'user_password';
const hash = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hash);

// Issue JWT
const token = jwt.sign(
  { userId: 1, email: 'user@example.com' },
  process.env.JWT_SECRET,
  { expiresIn: '24h', algorithm: 'HS256' }
);

// Verify JWT
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

## Core Technologies

### Security Tools
- Burp Suite
- OWASP ZAP
- Snort/Suricata
- Nmap

### Testing Frameworks
- Selenium / Cypress
- Jest / pytest
- JMeter / Gatling
- Postman / Insomnia

### Code Quality
- SonarQube
- ESLint / Prettier
- Pylint / Black

## Best Practices

1. **OWASP Top 10** - Know and prevent vulnerabilities
2. **Secure Coding** - Input validation, parameterized queries
3. **Testing** - Unit, integration, and E2E tests
4. **Code Review** - Peer review process
5. **Monitoring** - Continuous security monitoring
6. **Compliance** - GDPR, HIPAA, PCI-DSS
7. **Incident Response** - Clear procedures
8. **Documentation** - Security policies

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Burp Suite Documentation](https://portswigger.net/burp)
- [SonarQube Documentation](https://docs.sonarqube.org/)
