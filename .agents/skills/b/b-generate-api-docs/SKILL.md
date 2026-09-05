---
name: b-generate-api-docs
description: Create comprehensive API documentation for current endpoints formatted as OpenAPI/Swagger specification or following project's documentation standards. Use when the user types /b-generate-api-docs.
disable-model-invocation: true
---

## Purpose

Create comprehensive API documentation for current endpoints formatted as OpenAPI/Swagger specification or following project's documentation standards.

## Steps

1. **API Overview**: Service description/purpose, base URL/versioning information, authentication/authorization requirements, rate limiting/usage policies
2. **Endpoint Documentation**: HTTP method/URL path, request parameters (path/query/body), request/response schemas with data types, example requests/responses, possible error codes/messages
3. **Data Models**: Define all data models/schemas, include field descriptions/constraints, show relationships between models, provide example payloads
4. **Usage Examples**: Common use case scenarios, SDK/client library examples, CURL command examples, error handling examples

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
