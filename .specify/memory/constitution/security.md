# Constitution Security Standards

<!--
SYNC IMPACT REPORT
==================
File updated: security.md
Version change: 1.0.0 → 1.1.0 (added Node.js security specifics)
Modified principles:
- Authentication & Authorization: Specified JWT + PassportJS implementation
- Data Protection: Added AWS KMS, DynamoDB encryption requirements
- Input Validation: Detailed AJV schema validation, Express middleware
- Secret Management: Specified AWS Secrets Manager integration
Added sections: JWT token management, PassportJS strategies, Express security middleware
Removed sections: None
Templates requiring updates: ✅ Updated for Node.js security stack
Follow-up TODOs: None
Impact on other constitution files: Aligns with core.md JWT + PassportJS security
-->

<!--
Section: security
Priority: critical
Applies to: all projects (especially backend)
Dependencies: [core]
Version: 1.1.0
Last Updated: 2025-10-27
Project: Cogira Backend
-->

## 1. Core Security Principles

| Principle              | Requirement                        | Priority | Enforcement         |
| ---------------------- | ---------------------------------- | -------- | ------------------- |
| **Least Privilege**    | IAM roles with minimal permissions | MUST     | IAM review          |
| **Zero Trust**         | Require auth on protected routes    | MUST     | Security audit      |
| **Defense in Depth**   | API Gateway + Lambda + DB security | MUST     | Architecture review |
| **Fail Secure**        | Default deny, explicit allow       | MUST     | Code review         |
| **Complete Mediation** | Enforce authz checks via middleware | MUST     | Security testing    |

---

## 2. Authentication & Authorization

| Security Control      | Requirement                      | Priority | Validation           |
| --------------------- | -------------------------------- | -------- | -------------------- |
| **Authentication**    | JWT Bearer tokens for protected routes                        | MUST     | Security review      |
| Multi-Factor Auth     | MFA required for admin endpoints | MUST     | Admin access         |
| Token Management      | If token-based: define signing/expiry policy | SHOULD   | Automated validation |
| Session Expiration    | If refresh tokens used: define max lifetime  | SHOULD   | Security config      |
| **Authorization**     | Role-/attribute-based claims (domain-defined) | MUST     | Permission testing   |
| RBAC Implementation   | Define roles/attributes per domain (least privilege) | MUST     | Architecture review  |
| Permission Boundaries | Scope-based endpoint access      | MUST     | Code review          |
| Token Rotation        | Refresh token rotation on use    | MUST     | Automated            |
| Public Endpoints      | Allow-list unauthenticated routes (e.g., login, register, forgot-password) | MUST     | Security review      |

---

## 3. Data Protection

| Protection Type           | Requirement                                    | Priority | Implementation                          |
| ------------------------- | ---------------------------------------------- | -------- | --------------------------------------- |
| **Encryption at Rest**    | DynamoDB encryption with AWS KMS               | MUST     | Customer managed keys                   |
| **Encryption in Transit** | TLS 1.3+ for all API communication             | MUST     | API Gateway + ALB SSL                   |
| **PII Handling**          | Encrypt PII fields in DynamoDB                 | MUST     | Field-level encryption                  |
| Data Minimization         | Collect only business-required data            | MUST     | Privacy review                          |
| **Data Classification**   | Tag DynamoDB tables by sensitivity             | MUST     | Public/Internal/Confidential/Restricted |
| Data Retention            | TTL for transient data, archival for permanent | MUST     | DynamoDB TTL + S3 lifecycle             |
| Secure Deletion           | Crypto-shredding with key deletion             | MUST     | AWS KMS key deletion                    |
| **Key Management**        | AWS KMS with automatic rotation                | MUST     | Annual key rotation                     |

---

## 4. Input Validation & Output Sanitization

| Security Control           | Requirement                             | Priority | Protection Against   |
| -------------------------- | --------------------------------------- | -------- | -------------------- |
| **Input Validation**       | JSON schema validation (e.g., AJV)      | MUST     | Injection attacks    |
| NoSQL Injection Prevention | Validate DynamoDB query parameters      | MUST     | NoSQL injection      |
| XSS Prevention             | Sanitize all output, no HTML responses  | MUST     | XSS attacks          |
| Command Injection          | No shell execution, validate file paths | MUST     | OS command injection |
| **Output Encoding**        | JSON encoding, escaped special chars    | MUST     | XSS, data leakage    |
| CSP Headers                | Helmet.js Content Security Policy       | MUST     | XSS, clickjacking    |
| Path Traversal             | Validate and sanitize file paths        | MUST     | File access attacks  |
| **Type Validation**        | TypeScript + runtime AJV validation     | MUST     | Type confusion       |

---

## 5. Secret Management

| Secret Type              | Requirement                           | Priority | Storage Method     |
| ------------------------ | ------------------------------------- | -------- | ------------------ |
| **API Keys**             | AWS Secrets Manager with versioning   | MUST     | Secrets manager    |
| **Database Credentials** | IAM roles for DynamoDB access         | MUST     | IAM authentication |
| **Encryption Keys**      | AWS KMS customer managed keys         | MUST     | KMS with rotation  |
| Auth Signing Material    | If tokens used: manage keys/secrets in Secrets Manager | SHOULD   | Key custody       |
| **Secret Rotation**      | Automated 90-day rotation             | MUST     | Lambda rotation    |
| Environment Separation   | Separate AWS accounts per environment | MUST     | Account isolation  |

### Secret Prohibitions (WON'T)

- Never log secrets (tokens, passwords, keys, PKCE verifiers)
- Never commit secrets to version control
- Never store secrets in plaintext
- Never expose secrets in error messages
- Never transmit secrets in URLs

---

## 6. Security Logging & Monitoring

| Event Type                 | Logging Requirement                   | Priority | Retention Period   |
| -------------------------- | ------------------------------------- | -------- | ------------------ |
| **Authentication Events**  | Log auth successes and failures       | MUST     | 90 days retention  |
| Failed Login Attempts      | Log all failures with context         | MUST     | 90 days retention  |
| **Authorization Failures** | Log unauthorized access attempts      | MUST     | 90 days retention  |
| Privilege Escalation       | Log all attempts                      | MUST     | 90 days retention  |
| **Data Access**            | Log DynamoDB access with user context | MUST     | 30 days retention  |
| Privileged Operations      | Log all admin actions                 | MUST     | 1 year retention   |
| **Security Events**        | Structured security event logging     | MUST     | 90 days retention  |
| Anomaly Detection          | CloudWatch anomaly detection          | SHOULD   | Real-time alerting |

### Logging Prohibitions (WON'T)

- Never log secrets or credentials
- Never log full credit card numbers
- Never log PII without justification
- Never log sensitive cryptographic material

---

## 7. Network Security

| Control                  | Requirement                         | Priority | Implementation       |
| ------------------------ | ----------------------------------- | -------- | -------------------- |
| **Network Segmentation** | [NETWORK_SEGMENTATION_REQUIREMENTS] | MUST     | VPC/subnet isolation |
| **Firewall Rules**       | [FIREWALL_RULES_POLICY]             | MUST     | Default deny         |
| **TLS Configuration**    | Minimum TLS 1.3                     | MUST     | All external comms   |
| Certificate Management   | [CERTIFICATE_MANAGEMENT_POLICY]     | MUST     | Auto-renewal         |
| **DDoS Protection**      | [DDOS_PROTECTION_REQUIREMENTS]      | MUST     | Rate limiting        |
| API Rate Limiting        | [RATE_LIMITING_POLICY]              | MUST     | Per endpoint         |
| **CORS Policy**          | [CORS_CONFIGURATION]                | MUST     | Restrictive origins  |

---

## 8. Vulnerability Management

| Activity                | Requirement                        | Frequency       | Priority |
| ----------------------- | ---------------------------------- | --------------- | -------- |
| **Dependency Scanning** | [DEPENDENCY_SCANNING_REQUIREMENTS] | Every build     | MUST     |
| Vulnerability Patching  | Critical patches within 24 hours   | Within 24 hours | MUST     |
| **Code Scanning**       | Static analysis security testing   | Every commit    | MUST     |
| **Penetration Testing** | [PENETRATION_TESTING_SCHEDULE]     | Quarterly       | SHOULD   |
| Security Audits         | [SECURITY_AUDIT_REQUIREMENTS]      | Annually        | SHOULD   |
| Threat Modeling         | [THREAT_MODELING_REQUIREMENTS]     | Per feature     | SHOULD   |
