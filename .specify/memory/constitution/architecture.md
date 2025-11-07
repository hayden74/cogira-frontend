# Constitution Architecture Standards

<!--
SYNC IMPACT REPORT
==================
File updated: architecture.md
Version change: 1.0.0 → 1.1.0 (added Node.js backend specifics)
Modified principles:
- Architectural Principles: Added Express.js layered architecture pattern
- Service Architecture: Specified Express middleware, controller patterns
- Database Design: Updated for DynamoDB partition/sort key strategies
- API Design: Added Express.js security, validation middleware requirements
Added sections: Express.js middleware standards, DynamoDB design patterns
Removed sections: None
Templates requiring updates: ✅ Updated for Node.js backend architecture
Follow-up TODOs: None
Impact on other constitution files: Aligns with core.md Node.js stack
-->

<!--
Section: architecture
Priority: high
Applies to: all projects
Dependencies: [core]
Version: 1.1.0
Last Updated: 2025-10-27
Project: Cogira Backend
-->

## 1. Architectural Principles

| Principle               | Description                                | Priority | Implementation                    |
| ----------------------- | ------------------------------------------ | -------- | --------------------------------- |
| **Design Pattern**      | Layered Architecture for Lambda            | MUST     | Handler → Router → Service → Repository |
| Service Responsibility  | Single responsibility per service class    | MUST     | One concern per service           |
| State Management        | Stateless Lambda functions                 | MUST     | No persistent state               |
| Component Separation    | Clear layer boundaries with interfaces     | MUST     | Dependency injection              |
| Data Access Pattern     | Repository pattern with DynamoDB Toolbox   | MUST     | Type-safe data access             |
| Performance Constraints | Sub-200ms API response times               | SHOULD   | P95 latency monitoring            |
| **Project Structure**   | Feature-based directory organization       | MUST     | Group by business domain          |
| **API Design**          | RESTful API design principles              | MUST     | Resource-based URLs               |

---

## 2. Project Structure Standards

| Structure Type          | Organization                             | Priority | Notes                                     |
| ----------------------- | ---------------------------------------- | -------- | ----------------------------------------- |
| **Directory Layout**    | Feature-based structure                  | MUST     | Group by business domain                  |
| **Source Organization** | `src/features/{feature}/`                | MUST     | Controllers, services, models per feature |
| **Shared Components**   | `src/shared/` for common utilities       | MUST     | Cross-cutting concerns                    |
| **Configuration**       | `src/config/` for app configuration      | MUST     | Environment-specific                      |
| **Types Definition**    | `src/types/` for shared interfaces       | MUST     | TypeScript definitions                    |
| **Middleware**          | `src/lib/middy/` for Middy middleware   | MUST     | Reusable middleware                       |

### Directory Structure Example

```
src/
├── features/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   └── auth.types.ts
│   └── users/
│       ├── user.controller.ts
│       ├── user.service.ts
│       ├── user.repository.ts
│       └── user.types.ts
├── shared/
│   ├── utils/
│   ├── validators/
│   └── constants/
├── lib/middy/
├── config/
└── types/
```

---

## 3. Service Architecture

| Component        | Responsibility                        | Pattern               | Notes                                  |
| ---------------- | ------------------------------------- | --------------------- | -------------------------------------- |
| **Handlers**     | Lambda event processing, HTTP routing | Internal router       | Thin controllers, delegate to services |
| **Services**     | Business logic, orchestration         | Service classes       | Pure functions, dependency injection   |
| **Repositories** | DynamoDB operations, data mapping     | Repository pattern    | Abstract AWS SDK calls                 |
| **Models/DTOs**  | Type definitions, data validation     | TypeScript interfaces | Immutable, validated structures        |
| **Validators**   | Input/output schema validation        | AJV + JSON Schema     | Runtime type checking                  |
| **Middleware**   | Auth, logging, error handling         | Express middleware    | Composable, reusable                   |

### Service Flow Pattern

| Step | Layer      | Action                            | Validation         |
| ---- | ---------- | --------------------------------- | ------------------ |
| 1    | Handler    | Parse request, validate structure | Schema validation  |
| 2    | Service    | Execute business logic            | Business rules     |
| 3    | Repository | Persist/retrieve data             | Data integrity     |
| 4    | Handler    | Format response, handle errors    | Response structure |

### CRUD Operations Standard

| HTTP Method | Route Pattern          | Service Method    | Expected Behavior               |
| ----------- | ---------------------- | ----------------- | ------------------------------- |
| POST        | `/api/v1/resource`     | createResource()  | 201 Created with resource ID    |
| GET         | `/api/v1/resource/:id` | getResourceById() | 200 OK or 404 Not Found         |
| GET         | `/api/v1/resource`     | listResources()   | 200 OK with paginated results   |
| PATCH       | `/api/v1/resource/:id` | updateResource()  | 200 OK or 404 Not Found         |
| DELETE      | `/api/v1/resource/:id` | deleteResource()  | 204 No Content or 404 Not Found |

---

## 4. Database Design Standards

| Guideline             | Requirement                                         | Priority    | When Required              |
| --------------------- | --------------------------------------------------- | ----------- | -------------------------- |
| **Primary Keys**      | UUID v4 or composite keys                           | MUST        | All DynamoDB tables        |
| Partition Key Design  | High-cardinality, evenly distributed                | MUST        | Avoid hot partitions       |
| Sort Key Design       | Access pattern based (timestamp, type)              | SHOULD      | Enable range queries       |
| **Secondary Indexes** | Max 2 GSIs per table, justify each                  | CONDITIONAL | Alternative query patterns |
| Index Justification   | Document query pattern and RCU/WCU cost             | MUST        | Before creating GSI/index  |
| **TTL Configuration** | Use for sessions, cache, temporary data             | MUST        | Transient data             |
| TTL Documentation     | Document data lifecycle and retention               | MUST        | When TTL is used           |
| **Capacity Mode**     | On-demand for variable, provisioned for predictable | MUST        | All tables                 |
| On-Demand Mode        | Use for <40% utilization patterns                   | SHOULD      | Variable load patterns     |
| Provisioned Mode      | Use for >40% consistent utilization                 | SHOULD      | Consistent load patterns   |

### Database Prohibitions (WON'T)

- Create indexes without justification
- Use TTL without documenting data lifecycle
- Over-provision capacity
- Create hot partitions
- Skip capacity mode justification

---

## 5. API Design Standards

| Standard Area           | Requirement                              | Priority | Validation              |
| ----------------------- | ---------------------------------------- | -------- | ----------------------- |
| **Security Headers**    | Security headers on all responses        | MUST     | Automated scanning      |
| **CORS Policy**         | Restricted origins, credentials handling | MUST     | Security review         |
| **Rate Limiting**       | API Gateway/WAF throttling               | MUST     | Load testing            |
| **Request Size Limits** | 10MB max payload, configurable           | MUST     | API Gateway + middleware|
| **Error Responses**     | Standardized JSON error format           | MUST     | API testing             |
| Error Localization      | Accept-Language header support           | SHOULD   | i18n middleware         |
| **Authentication**      | Required on protected routes (mechanism-agnostic) | MUST     | Security audit          |
| Token Validation        | Validate credentials per chosen mechanism| MUST     | Auth middleware         |
| **Authorization**       | Role/attribute-based access control      | MUST     | Policy enforcement      |
| **Input Validation**    | JSON schema validation (e.g., AJV)       | MUST     | Schema validation       |
| Output Sanitization     | JSON sanitization, no HTML output        | MUST     | Output middleware       |
| **Content-Type Check**  | Validate application/json requests       | MUST     | Content-type middleware |
| **API Versioning**      | URL path versioning (/api/v1/)           | MUST     | Router configuration    |
| **Throttling**          | API Gateway throttling (+ optional app layer) | MUST     | DDoS protection         |
| Geographic Controls     | CloudFront geo-restrictions              | SHOULD   | AWS configuration       |

---

## 6. Security Architecture

| Security Layer            | Requirement                          | Priority | Implementation        |
| ------------------------- | ------------------------------------ | -------- | --------------------- |
| **Defense in Depth**      | [DEFENSE_IN_DEPTH_STRATEGY]          | MUST     | Multiple layers       |
| **Zero Trust**            | [ZERO_TRUST_PRINCIPLES]              | MUST     | Verify everything     |
| Network Segmentation      | [NETWORK_SEGMENTATION_REQUIREMENTS]  | MUST     | Isolated environments |
| **Identity Verification** | [IDENTITY_VERIFICATION_REQUIREMENTS] | MUST     | Every access          |
| **Security Monitoring**   | [SECURITY_MONITORING_REQUIREMENTS]   | MUST     | Real-time detection   |
| Threat Detection          | [THREAT_DETECTION_MECHANISM]         | MUST     | Automated alerts      |
| **Audit Logging**         | [AUDIT_LOGGING_REQUIREMENTS]         | MUST     | Immutable logs        |
| Security Metrics          | [SECURITY_METRICS_COLLECTION]        | SHOULD   | Dashboard monitoring  |
| **Encryption**            | [ENCRYPTION_STANDARDS]               | MUST     | At rest & in transit  |
| Key Management            | [KEY_MANAGEMENT_REQUIREMENTS]        | MUST     | Secure key rotation   |
