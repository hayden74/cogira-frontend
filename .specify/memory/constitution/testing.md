# Constitution Testing Standards

<!--
SYNC IMPACT REPORT
==================
File updated: testing.md
Version change: 1.0.0 → 1.1.0 (added Node.js testing specifics)
Modified principles:
- Test Coverage: Specified Jest coverage thresholds for Node.js
- Test Organization: Added Jest + Supertest file patterns
- Test Type Requirements: Detailed unit, integration testing for Express APIs
- Security Testing: Added JWT, PassportJS security test requirements
Added sections: Jest configuration, Supertest API testing patterns
Removed sections: None
Templates requiring updates: ✅ Updated for Jest + Supertest testing stack
Follow-up TODOs: None
Impact on other constitution files: Aligns with core.md Node.js testing tools
-->

<!--
Section: testing
Priority: critical
Applies to: all projects
Dependencies: [core]
Version: 1.1.0
Last Updated: 2025-10-27
Project: Cogira Backend
-->

## 1. Test Coverage Standards

| Coverage Type | Requirement                    | Threshold              | Enforcement        |
| ------------- | ------------------------------ | ---------------------- | ------------------ |
| **Overall**   | Jest/Vitest coverage reports   | 85% minimum            | Automated CI check |
| Statement     | Statement coverage             | 85% minimum            | CI blocking        |
| Branch        | Branch coverage                | 80% minimum            | CI blocking        |
| Function      | Function coverage              | 90% minimum            | CI blocking        |
| Exclusions    | Config files, type definitions | Explicit justification | Code review        |

---

## 2. Test Organization Standards

| Test Type             | Location             | Suffix                 | Colocated | Priority |
| --------------------- | -------------------- | ---------------------- | --------- | -------- |
| **Unit Tests**        | Next to source files | `.test.ts`             | Yes       | MUST     |
| **Contract Tests**    | Next to source files | `.contract.test.ts`    | Yes       | MUST     |
| **Integration Tests** | `tests/integration/` | `.integration.test.ts` | No        | MUST     |
| **Security Tests**    | Next to source files | `.security.test.ts`    | Yes       | MUST     |
| **API Tests**         | `tests/api/`         | `.api.test.ts`         | No        | SHOULD   |
| **End-to-End Tests**  | `tests/e2e/`         | `.e2e.test.ts`         | No        | SHOULD   |
| **Performance Tests** | `tests/performance/` | `.perf.test.ts`        | No        | COULD    |

### File Organization Examples

| Source File                       | Test File                                    | Location Rule            |
| --------------------------------- | -------------------------------------------- | ------------------------ |
| `src/services/user.ts`            | `src/services/user.test.ts`                  | Colocated unit test      |
| `src/handlers/lambda.ts`          | `src/handlers/lambda.contract.test.ts`       | Colocated contract test  |
| `src/handlers/auth.ts`            | `tests/integration/auth.integration.test.ts` | Lambda/API Gateway integration |
| `src/lib/middy/auth.ts`           | `src/lib/middy/auth.security.test.ts`        | Colocated security test  |
| `tests/e2e/user-flow.e2e.test.ts` | N/A                                          | Playwright end-to-end    |

---

## 3. Test Type Requirements

### Unit Tests

| Requirement           | Description                                     | Priority | Validation     |
| --------------------- | ----------------------------------------------- | -------- | -------------- |
| Colocation            | Must be next to source file                     | MUST     | File structure |
| Naming Convention     | `describe` blocks for functions, `it` for cases | MUST     | Framework standards |
| Mocking Allowed       | Framework mocks for external dependencies       | MUST     | Code review    |
| External Dependencies | Mock DynamoDB, external APIs                    | MUST     | Test review    |
| Fast Execution        | <100ms per test, <5s per suite                  | SHOULD   | Framework timeout |

### Integration Tests

| Requirement     | Description                           | Priority | Validation     |
| --------------- | ------------------------------------- | -------- | -------------- |
| Location        | Dedicated `tests/integration/` dir    | MUST     | File structure |
| Real Services   | Invoke Lambda handler or SAM/API Gateway | MUST     | Code review    |
| Setup/Teardown  | beforeAll/afterAll for DB setup        | MUST     | Test review    |
| Logging         | Capture and verify log outputs        | MUST     | Code review    |
| Error Scenarios | Test 4xx/5xx HTTP responses           | MUST     | Test coverage  |

### Contract Tests

| Requirement            | Description                       | Priority | Validation          |
| ---------------------- | --------------------------------- | -------- | ------------------- |
| API Contracts          | OpenAPI 3 schema validation       | MUST     | API review          |
| Schema Validation      | Validate request/response schemas | MUST     | Automated           |
| Backward Compatibility | Test API version compatibility    | MUST     | CI check            |
| Consumer-Driven        | Contract testing with Swagger     | SHOULD   | Architecture review |

### End-to-End Tests

| Requirement     | Description                           | Priority | Validation     |
| --------------- | ------------------------------------- | -------- | -------------- |
| Browser Testing | Playwright for web interface testing  | SHOULD   | E2E pipeline   |
| User Workflows  | Test complete user journeys           | SHOULD   | Business logic |
| Cross-Browser   | Test major browsers (Chrome, Firefox) | SHOULD   | Compatibility  |
| API Workflows   | Test end-to-end API flows             | SHOULD   | Integration    |

---

## 4. Security Testing Standards

| Test Category        | Requirement                      | Priority | Examples                              |
| -------------------- | -------------------------------- | -------- | ------------------------------------- |
| **Authentication**   | [AUTH_TEST_REQUIREMENTS]         | MUST     | Invalid tokens, bypass attempts       |
| Token Validation     | Test all token scenarios         | MUST     | Expired, malformed, missing           |
| Session Management   | [SESSION_TEST_REQUIREMENTS]      | MUST     | Timeout, hijacking                    |
| **Authorization**    | [AUTHZ_TEST_REQUIREMENTS]        | MUST     | Role boundaries, escalation           |
| Permission Checks    | Test all permission combinations | MUST     | Access control validation             |
| **Input Validation** | [INPUT_VALIDATION_TEST_REQ]      | MUST     | SQL injection, XSS, command injection |
| Sanitization         | Test output encoding             | MUST     | XSS prevention                        |
| **Cryptography**     | [CRYPTO_TEST_REQUIREMENTS]       | MUST     | Encryption, key management            |
| Key Rotation         | Test key lifecycle               | SHOULD   | Rotation procedures                   |

### Penetration Testing

| Test Type          | Requirement                       | Frequency     | Priority |
| ------------------ | --------------------------------- | ------------- | -------- |
| Automated Scans    | [AUTOMATED_PENTEST_REQ]           | Every deploy  | MUST     |
| Manual Testing     | [MANUAL_PENTEST_REQUIREMENTS]     | Quarterly     | SHOULD   |
| Vulnerability Scan | [VULNERABILITY_SCAN_REQUIREMENTS] | Weekly        | MUST     |
| Security Baseline  | [SECURITY_BASELINE_VALIDATION]    | Every release | MUST     |

---

## 5. Mocking Standards

| Context               | Mocking Policy                    | Priority | Rationale               |
| --------------------- | --------------------------------- | -------- | ----------------------- |
| **Unit Tests**        | Mock all external dependencies    | MUST     | Isolate unit under test |
| External Services     | Always mock                       | MUST     | Fast, deterministic     |
| Database Calls        | Always mock DynamoDB calls        | MUST     | No real DB connections  |
| **Integration Tests** | Mock external APIs only           | MUST     | Test real interactions  |
| Critical Services     | Do not mock DynamoDB              | MUST     | Validate integration    |
| Third-party APIs      | Use test endpoints when available | SHOULD   | Use test environments   |

### Mocking Best Practices

| Practice             | Requirement                                     | Priority |
| -------------------- | ----------------------------------------------- | -------- |
| Consistent Framework | Jest mocking (`jest.fn()`, `jest.mock()`)       | MUST     |
| Realistic Behavior   | Mock responses match DynamoDB/API schemas       | MUST     |
| Verify Interactions  | Assert mock calls with `toHaveBeenCalledWith()` | SHOULD   |
| Clear Mock Setup     | Document mock data factories                    | SHOULD   |

---

## 6. Test Execution Requirements

| Requirement        | Description                         | Priority | Enforcement      |
| ------------------ | ----------------------------------- | -------- | ---------------- |
| Pre-commit Tests   | Run unit tests before commit        | MUST     | Git hooks        |
| CI Pipeline Tests  | Run all tests on PR                 | MUST     | CI configuration |
| Coverage Threshold | Block merge if below threshold      | MUST     | CI gates         |
| Test Isolation     | Tests must not depend on each other | MUST     | Test framework   |
| Parallel Execution | [PARALLEL_TEST_POLICY]              | SHOULD   | Performance      |
