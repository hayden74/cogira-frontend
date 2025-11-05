<!--
SYNC IMPACT REPORT
==================
File updated: core.md
Version change: 1.0.0 → 1.1.0 (comprehensive Node.js backend coverage)
Modified principles:
- Technology Stack: Added all 23 technologies from screenshot (DynamoDB Toolbox, Axios, S3+Multer, Swagger, etc.)
- Coding Standards: Added Prettier, Helmet.js, express-rate-limit, AJV validation
- Configuration: Added dotenv + AWS SSM Parameter Store management
Added sections: Complete coverage of all screenshot technologies
Removed sections: None
Templates requiring updates:
✅ All constitution files updated with comprehensive Node.js stack
✅ Architecture: Added feature-based structure, RESTful API patterns
✅ Testing: Added Playwright E2E testing requirements
✅ Security: JWT + PassportJS + AWS security integration
✅ Observability: Winston + CloudWatch + X-Ray complete setup
Follow-up TODOs: None - All 23 technologies from screenshot now covered
Impact on other constitution files: All files updated with complete technology coverage
-->

# Constitution Core Standards

<!--
Section: core
Priority: critical
Applies to: all projects
Version: 1.1.0
Last Updated: 2025-10-27
Project: Cogira Backend
-->

## 1. Technology Stack Standards

| Component              | Requirement                           | Priority | Notes                     |
| ---------------------- | ------------------------------------- | -------- | ------------------------- |
| **Runtime**            | Node.js                               | MUST     | LTS version (18.x+)       |
| Runtime Security       | Regular security updates              | MUST     | Mandatory compliance      |
| Runtime Optimization   | Performance monitoring with clinic.js | SHOULD   | Performance best practice |
| Runtime Monitoring     | Node.js Inspector for debugging       | SHOULD   | Observability             |
| Runtime Enhancement    | Worker threads for CPU tasks          | COULD    | Optional feature          |
| **Language**           | TypeScript 5.x+                       | MUST     | Primary language          |
| Language Strictness    | Strict mode enabled in tsconfig       | MUST     | Type safety/strict mode   |
| Language Linting       | ESLint + TypeScript ESLint rules      | MUST     | Code quality              |
| Language Best Practice | Async/await patterns, proper typing   | SHOULD   | Recommended patterns      |
| Language Documentation | TSDoc comments for public APIs        | SHOULD   | Code documentation        |
| Language Optional      | Advanced TypeScript features          | COULD    | Advanced features         |
| **Compute Platform**   | AWS Lambda                            | MUST     | All deployments           |
| Compute Security       | IAM least privilege, VPC isolation    | MUST     | Security compliance       |
| Compute Config         | SAM template configuration            | MUST     | Standard configuration    |
| Compute Optimization   | Cold start optimization               | SHOULD   | Performance tuning        |
| Compute Monitoring     | CloudWatch metrics & alarms           | SHOULD   | Health checks             |
| **Database**           | DynamoDB + DAX                        | MUST     | NoSQL with caching        |
| Database ORM           | DynamoDB Toolbox for data modeling    | MUST     | Type-safe data operations |
| Database Backup        | Point-in-time recovery enabled        | MUST     | Data protection           |
| Database Security      | IAM-based access control              | MUST     | Access control            |
| Database Optimization  | Proper partition key design           | SHOULD   | Query performance         |
| Database Monitoring    | CloudWatch metrics monitoring         | SHOULD   | Health metrics            |
| Database Optional      | DynamoDB Streams for events           | COULD    | Advanced features         |
| **HTTP Client**        | Axios for external API calls          | MUST     | Standardized HTTP client  |
| **File Storage**       | AWS S3 + Multer middleware            | MUST     | File upload handling      |
| **API Documentation**  | Swagger/OpenAPI 3 specification       | MUST     | Interactive API docs      |
| **Configuration**      | dotenv + AWS SSM Parameter Store      | MUST     | Environment management    |

### Technology Prohibitions (WON'T without RFC)

- Alternative runtimes without formal RFC approval
- Non-LTS Node.js versions in production
- JavaScript without TypeScript type checking
- `any` type usage without explicit justification
- Alternative compute platforms (containers, EC2, etc.)
- Synchronous blocking operations in main thread
- Non-DynamoDB databases without RFC approval
- Alternative databases without RFC approval

---

## 2. Coding Standards

| Area                 | Standard                              | Enforcement | Validation          |
| -------------------- | ------------------------------------- | ----------- | ------------------- |
| **Language**         | TypeScript strict mode enabled        | MUST        | Automated linting   |
| **Type Safety**      | No `any` types without justification  | MUST        | Compile-time        |
| **Async Patterns**   | Promise-based async/await only        | MUST        | Code review         |
| **Modularity**       | ES6 modules, clear exports            | MUST        | Architecture review |
| **Error Handling**   | Structured error objects with codes   | MUST        | Automated linting   |
| **Logging**          | Winston + CloudWatch; structured JSON | MUST        | Automated scanning  |
| **Secrets**          | AWS SSM/Secrets Manager only          | MUST        | Secret scanning     |
| **Validation**       | AJV for JSON schema validation        | MUST        | Security review     |
| **DTOs/Models**      | DynamoDB Toolbox entities with types  | MUST        | Code review         |
| **Code Formatting**  | Prettier + ESLint for consistency     | MUST        | Pre-commit hooks    |
| **Rate Limiting**    | express-rate-limit middleware         | MUST        | DDoS protection     |
| **Security Headers** | Helmet.js for HTTP security headers   | MUST        | Automated scanning  |

### Error Handling Example

```typescript
try {
  const result = await operation();
  return result;
} catch (error) {
  logger.error('Operation failed', { correlationId, error });
  throw error;
}
```

### Core Requirements

- **Logging**: Structured format, correlation ID, no secrets, consistent field names
- **Secrets**: No plaintext in code/env/logs/errors
- **Validation**: Validate/sanitize all external inputs, type & boundary checking
- **DTOs**: Clear naming, type annotations, immutability preferred, validation methods

---

## 3. API Versioning Standards

| Versioning Aspect | Requirement                                | Priority | Notes                     |
| ----------------- | ------------------------------------------ | -------- | ------------------------- |
| **Strategy**      | URL path versioning (e.g., /api/v1/)       | MUST     | Clear semantic versioning |
| Version support   | Support previous version during transition | MUST     | Minimum 6 months          |
| Breaking changes  | Document all breaking changes              | MUST     | In CHANGELOG and docs     |
| Deprecation       | Deprecate endpoints before removal         | MUST     | Minimum 3 months notice   |
| Migration guides  | Provide guides for major versions          | SHOULD   | With code examples        |

---

## 4. Enforcement and Validation

| Standard Area      | Enforcement Level | Validation Method     | Automated | Frequency     |
| ------------------ | ----------------- | --------------------- | --------- | ------------- |
| Language Standards | Mandatory         | Linting + Compilation | Yes       | Every commit  |
| Type Safety        | Mandatory         | Compile-time          | Yes       | Every commit  |
| Error Handling     | Mandatory         | Linting + Review      | Partial   | Every commit  |
| Logging            | Mandatory         | Automated scanning    | Yes       | Every commit  |
| Secrets            | Mandatory         | Secret scanning       | Yes       | Every commit  |
| Input Validation   | Mandatory         | Security review       | Partial   | Per PR        |
| Versioning         | Mandatory         | Automated checks      | Yes       | Every release |
| Architecture       | Mandatory         | Architecture review   | No        | Per feature   |
