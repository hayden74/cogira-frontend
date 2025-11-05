# Constitution Observability Standards

<!--
SYNC IMPACT REPORT
==================
File updated: observability.md
Version change: 1.0.0 → 1.1.0 (added Node.js observability specifics)
Modified principles:
- Logging Standards: Specified Winston logger configuration
- Log Implementation: Added CloudWatch integration requirements
- Metrics Standards: Detailed CloudWatch metrics for Lambda/DynamoDB
- Distributed Tracing: Added AWS X-Ray tracing configuration
Added sections: Winston transports, CloudWatch Logs/Metrics, X-Ray tracing
Removed sections: None
Templates requiring updates: ✅ Updated for Winston + CloudWatch observability stack
Follow-up TODOs: None
Impact on other constitution files: Aligns with core.md Winston + CloudWatch logging
-->

<!--
Section: observability
Priority: high
Applies to: backend, infrastructure
Dependencies: [core]
Version: 1.1.0
Last Updated: 2025-10-27
Project: Cogira Backend
-->

## 1. Logging Standards

### Mandatory Log Fields

| Field         | Type   | Format          | Required | Description                    |
| ------------- | ------ | --------------- | -------- | ------------------------------ |
| correlationId | string | UUID            | MUST     | Trace requests across services |
| timestamp     | string | ISO 8601        | MUST     | Log entry timestamp            |
| level         | enum   | INFO/WARN/ERROR | MUST     | Log severity level             |
| service       | string | Service name    | MUST     | Service generating the log     |
| message       | string | Descriptive     | MUST     | Human-readable description     |

### Optional Context Fields

| Field     | Type   | When Required          | Description                     |
| --------- | ------ | ---------------------- | ------------------------------- |
| operation | string | Available              | Function/method being executed  |
| userId    | string | User context exists    | User identifier                 |
| sessionId | string | Session context exists | Session identifier              |
| requestId | string | HTTP/API context       | Request identifier              |
| duration  | number | Operation complete     | Execution time (milliseconds)   |
| outcome   | enum   | Operation complete     | success/failure/timeout/partial |

### Error-Specific Fields

| Field        | Type   | Required When  | Environment   | Description            |
| ------------ | ------ | -------------- | ------------- | ---------------------- |
| errorCode    | string | level == ERROR | All           | Application error code |
| errorMessage | string | level == ERROR | All           | Error description      |
| errorType    | string | level == ERROR | All           | Error category         |
| stackTrace   | string | level == ERROR | Dev/Test only | Technical stack trace  |

### Logging Patterns

| Pattern         | When                | Example                                                | Priority |
| --------------- | ------------------- | ------------------------------------------------------ | -------- |
| Entry Logging   | Operation starts    | `LOG.INFO("Operation started", {correlationId})`       | MUST     |
| Success Logging | Operation completes | `LOG.INFO("Operation completed", {outcome, duration})` | SHOULD   |
| Error Logging   | Operation fails     | `LOG.ERROR("Operation failed", {errorCode})`           | MUST     |

### Logging Prohibitions (WON'T)

- Never log secrets (passwords, tokens, keys, API keys)
- Never log PII without justification
- Never use string concatenation for log messages
- Never skip correlation ID
- Never log sensitive cryptographic material

---

## 2. Log Implementation Standards

| Requirement            | Description                       | Priority | Validation            |
| ---------------------- | --------------------------------- | -------- | --------------------- |
| **Structured Format**  | Winston JSON formatter            | MUST     | Automated linting     |
| Correlation ID         | UUID v4 in all log entries        | MUST     | Automated scanning    |
| Consistent Fields      | camelCase field naming convention | MUST     | Schema validation     |
| **Environment Config** | Environment-based log levels      | MUST     | Deployment check      |
| Test Environment       | Winston console transport         | MUST     | Test validation       |
| Production Environment | CloudWatch Logs transport         | MUST     | AWS infrastructure    |
| Log Levels             | error/warn/info/debug levels      | MUST     | Winston configuration |
| **Log Sampling**       | Sample debug logs in production   | SHOULD   | CloudWatch costs      |

---

## 3. Metrics Standards

### Metric Categories

| Category                | Examples                               | Collection | Priority |
| ----------------------- | -------------------------------------- | ---------- | -------- |
| **Business Metrics**    | API calls, user actions, feature usage | Real-time  | MUST     |
| User Activity           | Authentication events, API usage       | Real-time  | MUST     |
| Revenue Metrics         | Transaction counts, success rates      | Real-time  | SHOULD   |
| **System Metrics**      | Lambda duration, invocation count      | Real-time  | MUST     |
| Request Latency         | API Gateway + Lambda response times    | Continuous | MUST     |
| Error Rates             | Lambda errors, 4xx/5xx responses       | Continuous | MUST     |
| Throughput              | Requests per second per endpoint       | Continuous | MUST     |
| **Performance Metrics** | DynamoDB read/write units, throttles   | Continuous | MUST     |
| Database Latency        | DynamoDB query/scan response times     | Continuous | MUST     |
| External API Latency    | Third-party API response times         | Continuous | SHOULD   |
| Resource Usage          | Lambda memory, concurrent executions   | Continuous | MUST     |

### Metric Requirements

| Requirement           | Description                             | Priority | Notes                        |
| --------------------- | --------------------------------------- | -------- | ---------------------------- |
| **Consistent Naming** | dot.notation for CloudWatch metrics     | MUST     | cogira.api.endpoint.duration |
| **Appropriate Tags**  | Environment, Function, Stage dimensions | MUST     | CloudWatch custom dimensions |
| **Thresholds**        | Define alerts for SLAs (<200ms p95)     | MUST     | CloudWatch alarms            |
| Cardinality Control   | Limit custom dimensions to <10          | MUST     | CloudWatch cost optimization |
| **Unit Consistency**  | Milliseconds, Count, Percent units      | MUST     | CloudWatch standard units    |

---

## 4. Distributed Tracing Standards

| Requirement           | Description                            | Priority | Implementation          |
| --------------------- | -------------------------------------- | -------- | ----------------------- |
| **Trace Propagation** | AWS X-Ray trace headers propagation    | MUST     | X-Ray SDK middleware    |
| **Span Creation**     | Create subsegments for service calls   | MUST     | DynamoDB, external APIs |
| Span Attributes       | Add custom annotations and metadata    | MUST     | User ID, operation type |
| **Sampling Strategy** | X-Ray sampling rules configuration     | MUST     | Rate-based sampling     |
| Sampling Rate         | 1% base rate, 5% if error occurred     | MUST     | Cost vs coverage        |
| **Error Tracking**    | Mark segments as error with exceptions | MUST     | X-Ray error tracking    |
| Trace Completeness    | Monitor trace completeness in X-Ray    | SHOULD   | Service map validation  |

### Tracing Best Practices

| Practice             | Requirement                      | Priority |
| -------------------- | -------------------------------- | -------- |
| Semantic Conventions | Follow OpenTelemetry standards   | SHOULD   |
| Context Enrichment   | Add relevant business context    | SHOULD   |
| Performance Impact   | Minimize tracing overhead        | MUST     |
| Trace Analysis       | Regular review of trace patterns | SHOULD   |

---

## 5. Alerting Standards

| Alert Type          | Condition                    | Severity | Response Time |
| ------------------- | ---------------------------- | -------- | ------------- |
| **Error Rate**      | >1% error rate over 5min     | Critical | Immediate     |
| **Latency**         | P95 >200ms for 3 datapoints  | High     | 15 minutes    |
| **Availability**    | <99.9% success rate          | Critical | Immediate     |
| **Resource Usage**  | Lambda concurrent >80% limit | Medium   | 30 minutes    |
| **Security Events** | Auth failures >10/min        | Critical | Immediate     |
| **Custom Business** | DynamoDB throttles >0        | High     | 15 minutes    |

### Alert Requirements

| Requirement       | Description                   | Priority |
| ----------------- | ----------------------------- | -------- |
| Actionable Alerts | Include context for response  | MUST     |
| Alert Routing     | Route to appropriate teams    | MUST     |
| Escalation Policy | Define escalation paths       | MUST     |
| Alert Suppression | Prevent alert fatigue         | SHOULD   |
| Runbook Links     | Link to resolution procedures | SHOULD   |
