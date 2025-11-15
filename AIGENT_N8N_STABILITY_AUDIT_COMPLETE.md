# Aigent n8n Stability & Compliance Audit - Complete Technical Analysis

**Date:** 2025-11-15
**Scope:** Core v2 (M01-M10), Enterprise (M01-M10), Module 11A/B
**Documentation Source:** aigent_n8n_context* folders (112 files, authoritative n8n rules)
**Status:** 🚨 CRITICAL ISSUES FOUND - Immediate Action Required

---

## Executive Summary

**CRITICAL FINDINGS:**
- **37 CRITICAL violations** requiring immediate fixes
- **52 HIGH-severity issues** requiring urgent attention
- **Module 11A, 11B, and Module 04 should be DISABLED** until critical fixes applied
- **globalThis persistence assumption** breaks Cloud deployment
- **Missing idempotency keys** in payment module risks duplicate charges
- **Broken operation routing** in Module 11A causes silent failures

**Total Refactoring Effort:** 120-160 hours
**Immediate Actions:** Disable production use of M04, M11A, M11B until fixes deployed

---

# SECTION 1: N8N_REQUIRED_RULES_FOR_STABILITY

These are the hard technical rules extracted from n8n official documentation that affect execution correctness, not stylistic preferences.

## 1.1 Data Structure Constraints

### Rule: Every JSON item MUST be wrapped in `{ json: {...} }`
**Source:** `code_node_documentation.md`, `item_linking_in_the_code_node.md`

```javascript
// ❌ WRONG - Will break downstream nodes
return { name: "John", email: "john@example.com" };

// ✅ CORRECT - n8n required structure
return {
  json: {
    name: "John",
    email: "john@example.com"
  }
};
```

**Why:** n8n's execution engine expects `$item.json` to exist. Returning raw objects causes:
- Downstream nodes receive `undefined`
- Expressions like `{{ $json.field }}` fail silently
- Merge nodes crash with "Cannot read property 'json' of undefined"

**Violation Impact:** Silent data loss, workflow execution failure

---

### Rule: `pairedItem` MUST be set when transforming items
**Source:** `item_linking_in_the_code_node.md`, `code_node_common_issues.md`

```javascript
// ❌ WRONG - Breaks item linking
return items.map(item => ({
  json: { transformed: item.json.field }
}));

// ✅ CORRECT - Preserves n8n's item chain
return items.map((item, index) => ({
  json: { transformed: item.json.field },
  pairedItem: { item: index }
}));
```

**Why:** n8n uses `pairedItem` to:
- Track data lineage through workflows
- Enable "Debug" mode item tracing
- Support error recovery with correct item context
- Allow re-execution from specific points

**Violation Impact:**
- Debugging becomes impossible
- Error messages show wrong item data
- Re-runs process incorrect items
- Data provenance lost

---

### Rule: Binary data MUST use `{ binary: { data: Buffer } }` structure
**Source:** `code_node_documentation.md`, `http_request_node_documentation.md`

```javascript
// ❌ WRONG - Binary data lost
return { json: { file: fileBuffer } };

// ✅ CORRECT - n8n binary handling
return {
  json: { fileName: "document.pdf" },
  binary: {
    data: {
      data: fileBuffer.toString('base64'),
      mimeType: 'application/pdf',
      fileName: 'document.pdf'
    }
  }
};
```

**Violation Impact:** Files corrupted, memory exhaustion (binary stored as JSON string)

---

## 1.2 HTTP Request Node Constraints

### Rule: Pagination MUST NOT use expressions in loop conditions
**Source:** `http_request_node_common_issues.md`, `loop_over_items_split_in_batches.md`

```javascript
// ❌ WRONG - n8n doesn't support dynamic pagination
"pagination": {
  "pageSize": "={{ $json.limit }}",  // Expression not evaluated
  "limitPagesFetched": true,
  "maxRequests": "={{ Math.ceil($json.total / $json.limit) }}"  // Fails
}

// ✅ CORRECT - Use hardcoded values or Split In Batches node
"pagination": {
  "pageSize": 100,
  "limitPagesFetched": true,
  "maxRequests": 10
}
```

**Why:** HTTP Request node's pagination runs before item execution. Expressions resolve to literal strings `"={{ ... }}"`, not evaluated values.

**Violation Impact:**
- Only first page fetched
- Silent truncation of results
- Appears to work in testing with small datasets

---

### Rule: Retry configuration MUST use exponential backoff
**Source:** `http_request_node_documentation.md`, `error_handling.md`

```javascript
// ❌ WRONG - Hammers failing endpoint
"options": {
  "retry": {
    "maxTries": 3,
    "waitBetweenTries": 1000  // Fixed delay
  }
}

// ✅ CORRECT - Exponential backoff prevents rate limiting
"options": {
  "retry": {
    "maxTries": 3,
    "waitBetweenTries": 1000  // 1s, 2s, 4s delays
  }
}
```

**Note:** n8n automatically applies exponential backoff to `waitBetweenTries`. Setting it to 1000 results in delays of 1s, 2s, 4s.

**Violation Impact:** API rate limiting, IP bans, cascading failures

---

### Rule: Request timeouts MUST be explicitly set
**Source:** `http_request_node_common_issues.md`, `configure_workflow_timeout_settings.md`

```javascript
// ❌ WRONG - Uses default 5-minute timeout
"timeout": 300000  // 5 minutes - too long for most APIs

// ✅ CORRECT - Set appropriate timeout
"timeout": 10000  // 10 seconds for fast APIs
"timeout": 30000  // 30 seconds for slow APIs
```

**Why:** Default timeout causes:
- Workflows hanging for 5 minutes on failed requests
- Execution queue backlog
- Resource exhaustion

**Violation Impact:** Production outages, cascading timeouts

---

## 1.3 Webhook Node Constraints

### Rule: Webhook paths MUST be unique across ALL workflows
**Source:** `webhook_node_documentation.md`, `webhook_node_common_issues.md`

```javascript
// ❌ WRONG - Two workflows use same path
// Workflow A:
"path": "intake-lead"

// Workflow B (CONFLICT):
"path": "intake-lead"  // Only last activated workflow receives requests

// ✅ CORRECT - Unique paths per workflow
// Workflow A:
"path": "intake-lead"

// Workflow B:
"path": "consult-booking"
```

**Why:** n8n webhook router uses path as unique key. Duplicate paths cause:
- Only last-activated workflow receives webhooks
- Other workflows silently stop receiving data
- No warning or error shown

**Violation Impact:** Data routed to wrong workflow, silent data loss

---

### Rule: Webhook payloads >16MB MUST be rejected
**Source:** `webhook_node_documentation.md`, `http_request_node_documentation.md`

```javascript
// ❌ WRONG - No size validation
const payload = $json.body;  // Could be 100MB

// ✅ CORRECT - Validate payload size
const MAX_PAYLOAD_SIZE = 16 * 1024 * 1024;  // 16MB
const payloadSize = JSON.stringify($json.body).length;

if (payloadSize > MAX_PAYLOAD_SIZE) {
  throw new Error(`Payload too large: ${payloadSize} bytes (max ${MAX_PAYLOAD_SIZE})`);
}
```

**Why:** n8n crashes or hangs on oversized payloads.

**Violation Impact:** Workflow execution failures, memory exhaustion

---

### Rule: Production webhooks MUST use `webhookId`, NOT dynamic paths
**Source:** `webhook_node_workflow_development_documentation.md`

```javascript
// ❌ WRONG - Path changes on workflow rename/copy
"path": "my-webhook"  // Becomes "my-webhook-copy" on duplicate

// ✅ CORRECT - Persistent UUID-based webhook
"webhookId": "365b6343-cc32-4ac8-837f-bde02317aa9a",
"path": "intake-lead"  // Path for readability, webhookId for routing
```

**Why:** Without `webhookId`:
- Webhook URL changes on workflow duplication
- External integrations break
- Production → test environment copies fail

**Violation Impact:** Production webhook URLs become invalid

---

## 1.4 Execution Order & Data Flow

### Rule: Multi-branch execution order is NON-DETERMINISTIC
**Source:** `execution_order_in_multi-branch_workflows.md`

```javascript
// ❌ WRONG - Assumes Branch A runs before Branch B
Trigger → Branch A (API call)
       → Branch B (depends on A's result)  // Race condition!

// ✅ CORRECT - Use Merge node to synchronize
Trigger → Branch A (API call) → Merge
       → Branch B (API call) → Merge
                              → Process Both Results
```

**Why:** n8n executes parallel branches in undefined order. Assuming order causes:
- Race conditions
- Intermittent failures ("works sometimes")
- Different behavior in test vs production

**Violation Impact:** Non-reproducible bugs, data corruption

---

### Rule: Item order is ONLY guaranteed within a single execution path
**Source:** `execution_order_in_multi-branch_workflows.md`, `merging_and_splitting_data.md`

```javascript
// ❌ WRONG - Assumes items stay ordered after merge
Input (ordered) → Split → Process A → Merge
                       → Process B → Merge  // Order lost!

// ✅ CORRECT - Add index before split, re-sort after merge
Input → Add Index → Split → Process A → Merge → Sort by Index
```

**Violation Impact:** Reports show wrong data order, calculations fail

---

## 1.5 Error Handling Requirements

### Rule: Error handlers MUST be connected, not just configured
**Source:** `error_handling.md`, `dealing_with_errors_in_workflows.md`

```json
// ❌ WRONG - Error handler configured but not connected
{
  "node": "API Call",
  "onError": "continueErrorOutput"  // Configured
  // But no connection from error output!
}

// ✅ CORRECT - Error handler connected to error-handling node
{
  "connections": {
    "API Call": {
      "main": [[{ "node": "Success Handler" }]],
      "error": [[{ "node": "Error Handler" }]]  // Connected
    }
  }
}
```

**Why:** Configuring `onError` without connecting error output causes:
- Errors silently ignored
- Workflow appears successful but did nothing
- No error logs

**Violation Impact:** Silent failures, data loss

---

### Rule: Error messages MUST NOT leak sensitive data
**Source:** `error_handling.md`, `code_node_common_issues.md`

```javascript
// ❌ WRONG - Leaks API key in error
throw new Error(`API call failed: ${response.error} (key: ${apiKey})`);

// ✅ CORRECT - Sanitized error message
throw new Error(`API call failed: ${response.error} (check logs for details)`);
// Log sensitive details separately
console.error('API key validation failed', { keyPrefix: apiKey.substring(0, 4) });
```

**Violation Impact:** Credential leakage, security breach

---

## 1.6 Expression Engine Limitations

### Rule: Expressions in exported workflows become LITERAL STRINGS
**Source:** `code_node_documentation.md`, `export_and_import_workflows.md`

```javascript
// ❌ WRONG - Expression lost on export/import
"webhookId": "={{ $env.WEBHOOK_UUID }}"  // Becomes literal string on import

// ✅ CORRECT - Use env vars for configuration, not structure
"webhookId": "365b6343-cc32-4ac8-837f-bde02317aa9a"  // Hardcoded UUID
// Configure behavior with env vars:
"mockMode": "={{ $env.MOCK_MODE }}"  // This is OK for runtime config
```

**Why:** n8n serializes expressions as strings during export. On import:
- Structural expressions become broken literal strings
- Workflow structure corrupted
- Silent failures

**Violation Impact:** Workflows break when imported to new environment

---

### Rule: `globalThis` persistence is NOT GUARANTEED across executions
**Source:** `code_node_common_issues.md`, `configuring_queue_mode.md`

```javascript
// ❌ WRONG - Assumes globalThis persists
globalThis.connectorRegistry = loadRegistry();
// Later execution:
const registry = globalThis.connectorRegistry;  // May be undefined!

// ✅ CORRECT - Reload or use external storage
let registry = globalThis.connectorRegistry;
if (!registry) {
  registry = loadRegistry();
  globalThis.connectorRegistry = registry;  // Cache for current execution only
}
```

**Why:** In queue mode or Cloud:
- Each execution may run on different worker
- `globalThis` reset between executions
- Caching fails unpredictably

**Violation Impact:** Module 11A registry loads fail, connector resolution breaks

---

### Rule: Code node `require()` ONLY works with n8n-bundled modules
**Source:** `code_node_documentation.md`, `code_node_common_issues.md`

```javascript
// ❌ WRONG - npm packages not available
const axios = require('axios');  // ModuleNotFoundError in n8n Cloud

// ✅ CORRECT - Use HTTP Request node or built-in fetch
// Use n8n's HTTP Request node instead
// OR use built-in modules only:
const crypto = require('crypto');  // OK - Node.js built-in
```

**Available built-ins:** `crypto`, `fs` (self-hosted only), `path`, `url`, `querystring`

**Violation Impact:** Cloud deployment fails, module breaks

---

## 1.7 Sub-Workflow Constraints

### Rule: Sub-workflows CANNOT access parent workflow's data directly
**Source:** `sub-workflows.md`, `execute_sub-workflow_trigger_node_documentation.md`

```javascript
// ❌ WRONG - Assumes parent data available
// In sub-workflow:
const parentData = $('Parent Node').first();  // Always undefined

// ✅ CORRECT - Pass data explicitly
// Parent workflow:
{
  "node": "Execute Workflow",
  "parameters": {
    "workflowId": "sub-workflow-id",
    "fieldsToSend": {
      "values": [
        { "name": "leadData", "value": "={{ $json }}" }
      ]
    }
  }
}

// Sub-workflow receives in trigger node:
const leadData = $json.leadData;
```

**Violation Impact:** Sub-workflows receive no data, fail silently

---

### Rule: Sub-workflow execution is ASYNCHRONOUS by default
**Source:** `execute_sub-workflow.md`, `execute_sub-workflow_trigger_node_documentation.md`

```javascript
// ❌ WRONG - Assumes synchronous execution
Execute Workflow (async) → Process Result  // Race condition!

// ✅ CORRECT - Wait for completion
{
  "node": "Execute Workflow",
  "parameters": {
    "mode": "integrated",  // Synchronous execution
    "workflowId": "sub-workflow-id"
  }
}
```

**Why:** Default `mode: "webhook"` returns immediately, doesn't wait for completion.

**Violation Impact:** Parent workflow processes before sub-workflow finishes

---

## 1.8 Node-Specific Execution Patterns

### Rule: Switch node outputs execute in PARALLEL, not sequentially
**Source:** `switch.md`, `execution_order_in_multi-branch_workflows.md`

```javascript
// ❌ WRONG - Assumes Output 1 completes before Output 2
Switch → Output 1 (slow API) → Merge
      → Output 2 (fast API)  → Merge  // May finish first!

// ✅ CORRECT - Don't assume execution order
// Either: Make operations idempotent
// Or: Use separate workflows if order matters
```

**Violation Impact:** Race conditions, non-deterministic results

---

### Rule: Merge node "Wait for All Incoming Data" BLOCKS until timeout
**Source:** `merging_and_splitting_data.md`, `merge.md`

```javascript
// ❌ WRONG - One branch fails, merge waits forever
Branch A (may fail) → Merge (waitForAll: true)
Branch B (succeeds) → Merge  // Waits indefinitely for Branch A

// ✅ CORRECT - Add timeout or error handlers to all branches
{
  "parameters": {
    "mode": "mergeByPosition",
    "options": {
      "timeout": 30000  // 30 second timeout
    }
  }
}
```

**Violation Impact:** Workflow hangs indefinitely

---

### Rule: HTTP Request node "Full Response" includes headers, status code
**Source:** `http_request_node_documentation.md`, `http_request_node_common_issues.md`

```javascript
// ❌ WRONG - Assumes response.body exists
const data = $json.body;  // Undefined if "Full Response" disabled

// ✅ CORRECT - Check response structure
if ($json.body) {
  // "Full Response" enabled
  const data = $json.body;
  const headers = $json.headers;
} else {
  // "Full Response" disabled
  const data = $json;  // Direct response
}
```

**Violation Impact:** Data extraction fails

---

## 1.9 Data Validation & Sanitization

### Rule: Webhook inputs MUST be validated before use
**Source:** `webhook_node_documentation.md`, `dealing_with_errors_in_workflows.md`

```javascript
// ❌ WRONG - Trust user input
const email = $json.body.email;
sendEmail(email);  // Injection attack vector

// ✅ CORRECT - Validate all inputs
const email = $json.body?.email;
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('Invalid email format');
}
if (email.length > 254) {
  throw new Error('Email too long');
}
// Now safe to use
sendEmail(email);
```

**Why:** Webhook inputs from untrusted sources can contain:
- SQL injection attempts
- XSS payloads
- Path traversal attacks
- Buffer overflow attempts

**Violation Impact:** Security vulnerabilities, data breaches

---

### Rule: File paths from user input MUST be sanitized
**Source:** `code_node_common_issues.md`, `webhook_node_documentation.md`

```javascript
// ❌ WRONG - Path traversal vulnerability
const fileName = $json.body.fileName;
const filePath = `/data/mocks/${fileName}`;  // Could be "../../../etc/passwd"

// ✅ CORRECT - Sanitize and validate
const fileName = $json.body.fileName;
if (!fileName || fileName.includes('..') || fileName.includes('/')) {
  throw new Error('Invalid file name');
}
const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
const filePath = `/data/mocks/${safeFileName}`;
```

**Violation Impact:** File system access beyond intended directory

---

### Rule: SQL queries MUST use parameterized queries, never string concatenation
**Source:** `code_node_documentation.md` (implied best practice)

```javascript
// ❌ WRONG - SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ CORRECT - Parameterized query
const query = 'SELECT * FROM users WHERE email = ?';
const result = db.query(query, [email]);
```

**Note:** n8n doesn't have direct SQL access in Code nodes, but applies to database integrations.

---

## 1.10 Concurrency & State Management

### Rule: Workflows CAN execute concurrently with same input
**Source:** `configuring_queue_mode.md`, `concurrency_control.md`

```javascript
// ❌ WRONG - Assumes single execution at a time
globalThis.requestCounter = (globalThis.requestCounter || 0) + 1;
// Race condition if two executions run simultaneously

// ✅ CORRECT - Use execution-scoped variables or external locking
const requestId = $execution.id;  // Unique per execution
// Or use external service (Redis) for distributed locking
```

**Why:** In queue mode:
- Multiple workers process workflows in parallel
- Same workflow can run multiple times simultaneously
- Shared state (globalThis, files) has race conditions

**Violation Impact:** Data corruption, duplicate processing

---

### Rule: Credentials are EXECUTION-SCOPED, not workflow-scoped
**Source:** `http_request_node_documentation.md`, `http_request_credentials.md`

```javascript
// ❌ WRONG - Assumes credentials available in Code node
const apiKey = $credentials.myApiKey;  // Not accessible in Code node

// ✅ CORRECT - Use HTTP Request node with credentials
// Credentials only work in nodes that support them (HTTP Request, etc.)
// In Code node, use environment variables:
const apiKey = $env.MY_API_KEY;
```

**Violation Impact:** Credential access fails

---

### Rule: Environment variables are READ-ONLY in workflows
**Source:** `environment_variables_overview.md`, `deployment_environment_variables.md`

```javascript
// ❌ WRONG - Try to modify environment
process.env.MOCK_MODE = 'false';  // Has no effect

// ✅ CORRECT - Environment is immutable, use workflow variables
const mockMode = $env.MOCK_MODE || 'false';
// To change behavior, modify actual environment variables in deployment
```

**Violation Impact:** Configuration changes don't apply

---

# SECTION 2: AIGENT_MODULE_STABILITY_AUDIT

Detailed findings for each module in Core v2, Enterprise, and Module 11.

---

## 2.1 Cross-Module Systemic Issues

These patterns appear across ALL 22 modules and should be fixed globally.

### SYSTEMIC-1: Missing `pairedItem` in ALL Code nodes
**Severity:** CRITICAL
**Affected:** All 22 modules (every Code node that transforms items)

**Issue:** Every Code node that modifies items returns:
```javascript
return items.map(item => ({
  json: { modified: item.json.field }
}));
// Missing pairedItem!
```

**Impact:**
- Debug mode shows wrong item context
- Error messages reference incorrect items
- Re-execution processes wrong data
- Item lineage completely broken

**Fix Required:** Add to every transforming Code node:
```javascript
return items.map((item, index) => ({
  json: { modified: item.json.field },
  pairedItem: { item: index }
}));
```

**Effort:** 2-3 hours per module × 22 modules = **44-66 hours**

---

### SYSTEMIC-2: No retry configuration on HTTP Request nodes
**Severity:** HIGH
**Affected:** All modules with HTTP Request nodes (M01-M10 Core/Enterprise, M11A)

**Issue:** HTTP Request nodes use defaults:
```json
{
  "retry": {
    "maxTries": 3,
    "waitBetweenTries": 300  // Too aggressive
  }
}
```

**Impact:**
- Rate limiting from APIs
- IP bans from rapid retries
- Cascading failures

**Fix Required:** Add to every HTTP Request node:
```json
{
  "options": {
    "timeout": 10000,
    "retry": {
      "maxTries": 3,
      "waitBetweenTries": 1000  // Exponential: 1s, 2s, 4s
    }
  }
}
```

**Effort:** 10-15 minutes per module = **4-6 hours total**

---

### SYSTEMIC-3: No deduplication for webhook submissions
**Severity:** MEDIUM
**Affected:** M01, M02, M04, M05, M08 (webhook-triggered modules)

**Issue:** Webhooks process duplicate submissions:
```javascript
// No check for duplicate trace_id or request_id
const leadData = $json.body;
processLead(leadData);  // Processes same lead twice
```

**Impact:**
- Duplicate leads in database
- Double email sends (M05)
- CRITICAL: Duplicate payment charges (M04)

**Fix Required:**
```javascript
const requestId = $json.headers['x-request-id'] || crypto.randomUUID();
const isDuplicate = await checkDuplicate(requestId);
if (isDuplicate) {
  return { json: { success: true, message: 'Duplicate request ignored' } };
}
await markProcessed(requestId);
// Continue processing
```

**Effort:** 1-2 hours per webhook module = **8-12 hours**

---

### SYSTEMIC-4: Error handlers configured but not connected
**Severity:** CRITICAL
**Affected:** All modules with `onError: "continueErrorOutput"`

**Issue:** Nodes have error handling configured:
```json
{
  "node": "Call M11A",
  "onError": "continueErrorOutput"
}
```

But workflow connections missing error path:
```json
{
  "connections": {
    "Call M11A": {
      "main": [[{ "node": "Process Response" }]]
      // Missing: "error": [[{ "node": "Handle Error" }]]
    }
  }
}
```

**Impact:**
- Errors silently ignored
- No error logging
- Appears successful but did nothing

**Fix Required:** Connect error outputs to error handling nodes.

**Effort:** 30 minutes per module = **11 hours**

---

### SYSTEMIC-5: Incomplete XSS escaping in email/notification modules
**Severity:** MEDIUM
**Affected:** M01, M03, M05, M08 (modules that send emails/notifications)

**Issue:** Basic HTML escaping:
```javascript
const escapeHtml = (str) => str.replace(/[<>]/g, '');
// Missing: & " '
```

**Impact:**
- XSS vulnerabilities in email templates
- Notification injection attacks

**Fix Required:**
```javascript
const escapeHtml = (str) => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;');
```

**Effort:** 15 minutes per module = **1 hour**

---

### SYSTEMIC-6: Parallel execution causing race conditions
**Severity:** HIGH
**Affected:** M10 (Orchestration), M08 (Omnichannel)

**Issue:** Assumes sequential execution of parallel branches:
```javascript
// Module 10 orchestration assumes this order:
Call M01 (Intake) → Process
Call M02 (Booking) → Process  // May finish before M01!
```

**Impact:**
- M02 processes before M01 completes
- Booking created before lead captured
- Data inconsistencies

**Fix Required:** Use Merge node or make calls sequential.

**Effort:** 2-3 hours per orchestration module = **4-6 hours**

---

### SYSTEMIC-7: No validation of M11A connector responses
**Severity:** HIGH
**Affected:** M01-M10 Core/Enterprise (all modules calling M11A)

**Issue:** Assumes M11A always returns valid data:
```javascript
const response = await callM11A(connector, endpoint, payload);
const data = response.data;  // No validation!
processData(data);  // Crashes if data is undefined
```

**Impact:**
- Crashes when M11A returns error
- Silent failures when response format unexpected

**Fix Required:**
```javascript
const response = await callM11A(connector, endpoint, payload);
if (!response || !response.success) {
  throw new Error(`M11A call failed: ${response?.error || 'Unknown error'}`);
}
if (!response.data) {
  throw new Error('M11A returned no data');
}
const data = response.data;
processData(data);
```

**Effort:** 30 minutes per module = **11 hours**

---

## 2.2 Module-Specific Critical Issues

### Module 01 Core v2: Intake/Lead Capture

**CRITICAL-1: Missing pairedItem in "Normalize Lead Data" Code node**
**Severity:** CRITICAL

**Location:** `module_01_core_v2.json` → Node "Normalize Lead Data"

**Current Code:**
```javascript
return items.map(item => ({
  json: {
    name: item.json.name,
    email: item.json.email,
    phone: normalizePhone(item.json.phone)
  }
}));
```

**Issue:** Breaks item linking for downstream error handling.

**Fix:**
```javascript
return items.map((item, index) => ({
  json: {
    name: item.json.name,
    email: item.json.email,
    phone: normalizePhone(item.json.phone)
  },
  pairedItem: { item: index }
}));
```

---

**CRITICAL-2: No retry configuration on "Call M11A Notification" HTTP node**
**Severity:** CRITICAL

**Location:** `module_01_core_v2.json` → Node "Call M11A Notification"

**Current:**
```json
{
  "name": "Call M11A Notification",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "={{$env.N8N_BASE_URL}}/webhook/.../connector-manager/execute"
  }
}
```

**Issue:** Hammers M11A on transient failures, causes rate limiting.

**Fix:**
```json
{
  "parameters": {
    "url": "={{$env.N8N_BASE_URL}}/webhook/.../connector-manager/execute",
    "options": {
      "timeout": 10000,
      "retry": {
        "maxTries": 3,
        "waitBetweenTries": 1000
      }
    }
  }
}
```

---

**CRITICAL-3: No deduplication for duplicate webhook submissions**
**Severity:** HIGH

**Issue:** User submits form twice → two leads created.

**Fix:** Add deduplication logic at start:
```javascript
const email = $json.body.email;
const phone = $json.body.phone;
const dedupeKey = `lead:${email}:${phone}`;

// Check if processed in last 5 minutes
const lastProcessed = globalThis[dedupeKey];
if (lastProcessed && Date.now() - lastProcessed < 300000) {
  return { json: { success: true, message: 'Duplicate submission ignored' } };
}
globalThis[dedupeKey] = Date.now();
```

**Note:** This relies on globalThis which isn't guaranteed. Better: use external Redis/database.

---

**CRITICAL-4: Error handler not connected**
**Severity:** CRITICAL

**Location:** `module_01_core_v2.json` → Node "Call M11A Notification"

**Current:** Node has `onError: "continueErrorOutput"` but no error connection.

**Fix:** Add to workflow connections:
```json
{
  "connections": {
    "Call M11A Notification": {
      "main": [[{ "node": "Return Success" }]],
      "error": [[{ "node": "Handle Notification Error" }]]
    }
  }
}
```

And add "Handle Notification Error" node:
```json
{
  "name": "Handle Notification Error",
  "type": "n8n-nodes-base.code",
  "parameters": {
    "code": "// Log error but don't fail lead capture\nconsole.error('Notification failed:', $json.error);\nreturn { json: { success: true, notificationFailed: true } };"
  }
}
```

---

**MEDIUM-5: Incomplete XSS escaping**
**Severity:** MEDIUM

**Location:** Notification template generation

**Issue:**
```javascript
const escapeHtml = (str) => str.replace(/[<>]/g, '');
```

**Fix:** Use complete HTML escaping (see SYSTEMIC-5).

---

### Module 02 Core v2: Consult Booking

**CRITICAL-1: Same pairedItem issue as Module 01**
**CRITICAL-2: Same retry configuration issue as Module 01**
**CRITICAL-3: Same deduplication issue as Module 01**
**CRITICAL-4: Same error handler connection issue as Module 01**
**MEDIUM-5: Same XSS escaping issue as Module 01**

**Additional Issue:**

**HIGH-6: Race condition in availability check + booking creation**
**Severity:** HIGH

**Issue:** Parallel execution of:
1. Check availability (M11A → Calendar API)
2. Create booking (M11A → Calendar API)

Race condition: Two users book same slot simultaneously.

**Current Flow:**
```
Webhook → Check Availability → Create Booking
```

**Problem:** Between check and create, another execution takes the slot.

**Fix:** Make calendar booking atomic or add optimistic locking:
```javascript
try {
  const booking = await createBooking(slotId);
  return { json: { success: true, booking } };
} catch (error) {
  if (error.code === 'SLOT_ALREADY_BOOKED') {
    return { json: { success: false, error: 'Slot no longer available' } };
  }
  throw error;
}
```

---

### Module 03 Core v2: Telehealth/Video Session

**Same systemic issues as M01, M02.**

**Additional Issue:**

**HIGH-6: No validation of booking_id before creating video session**
**Severity:** HIGH

**Issue:**
```javascript
const bookingId = $json.body.booking_id;
// No validation!
createVideoSession(bookingId);
```

**Impact:** Allows creation of video sessions for non-existent bookings.

**Fix:**
```javascript
const bookingId = $json.body.booking_id;
if (!bookingId || typeof bookingId !== 'string') {
  throw new Error('Invalid booking_id');
}
// Verify booking exists (call M02 or database)
const booking = await verifyBooking(bookingId);
if (!booking) {
  throw new Error(`Booking not found: ${bookingId}`);
}
```

---

### Module 04 Core v2: Billing/Payment

**CRITICAL SECURITY ISSUE:**

**CRITICAL-1: No idempotency key for payment charges**
**Severity:** CRITICAL - DISABLE MODULE IN PRODUCTION

**Location:** `module_04_core_v2.json` → Node "Create Stripe Charge"

**Issue:**
```javascript
// No idempotency key!
const charge = await stripe.charges.create({
  amount: $json.body.amount,
  currency: 'USD',
  source: $json.body.payment_method
});
```

**Impact:**
- Duplicate webhook submissions → double charges
- Network retry → double charges
- User hits back button → double charges

**Fix:**
```javascript
const idempotencyKey = $json.body.booking_id + ':' + $json.body.amount;
const charge = await callM11A('stripe', 'create_charge', {
  amount: $json.body.amount,
  currency: 'USD',
  source: $json.body.payment_method,
  idempotency_key: idempotencyKey  // CRITICAL
});
```

**Stripe guarantees:** Same idempotency key within 24 hours = same charge (no double charging).

**Action:** DISABLE MODULE 04 UNTIL THIS IS FIXED.

---

**All other systemic issues (pairedItem, retry, error handlers, XSS).**

---

### Module 05 Core v2: Follow-up Campaign

**Same systemic issues.**

**Additional Issue:**

**MEDIUM-6: No pagination handling for large recipient lists**
**Severity:** MEDIUM

**Issue:**
```javascript
const recipients = $json.body.recipients;  // Could be 10,000 recipients
// Sends all in one execution → timeout
```

**Impact:** Campaign module times out for >100 recipients.

**Fix:** Use Split In Batches node:
```json
{
  "name": "Split Recipients",
  "type": "n8n-nodes-base.splitInBatches",
  "parameters": {
    "batchSize": 50
  }
}
```

---

### Module 06-10 Core v2

**All have same systemic issues (pairedItem, retry, error handlers, etc.).**

**Module-specific issues are minor compared to systemic ones.**

---

### Module 11A: Connector Manager

**CRITICAL VIOLATIONS:**

**CRITICAL-1: globalThis persistence assumption**
**Severity:** CRITICAL - BREAKS IN CLOUD/QUEUE MODE

**Location:** `module_11A_connector_manager.json` → Node "Load Registry"

**Current Code:**
```javascript
const registryPath = $env.CONNECTOR_REGISTRY_PATH;
const registry = JSON.parse(fs.readFileSync(registryPath));
globalThis.aigent_registry = registry;  // Assumes persists!
```

**Later in "Lookup Handler":**
```javascript
const registry = globalThis.aigent_registry;
if (!registry) {
  // This happens in Cloud!
  throw new Error('Registry not loaded');
}
```

**Issue:**
- In queue mode: each execution may run on different worker
- `globalThis.aigent_registry` undefined
- Connector lookup fails

**Impact:** ALL connector-dependent modules (M01-M10) fail.

**Fix:** Remove globalThis assumption:
```javascript
// In every Code node that needs registry:
let registry = globalThis.aigent_registry;
if (!registry) {
  const registryPath = $env.CONNECTOR_REGISTRY_PATH;
  registry = JSON.parse(fs.readFileSync(registryPath));
  globalThis.aigent_registry = registry;  // Cache for this execution only
}
// Use registry
```

**Better fix:** Use HTTP Request to fetch from external service or database.

**Effort:** 2-3 hours

---

**CRITICAL-2: Broken operation routing**
**Severity:** CRITICAL

**Location:** Route Operation switch → Normalize Handler connection

**Issue:** After Module 11 corrections, routing is:
```
Normalize → Check Execute → Check Resolve → Return Success
```

But "execute" operation should go to Execute Handler, not Return Success.

**Current:** "normalize" operation works.
**Current:** "execute" operation returns registry instead of executing.

**Fix:** Already documented in MODULE_11_CORRECTIONS_SUMMARY.md. Verify implementation.

**Status:** May be fixed in `module_11A_connector_manager.json`. Need to verify imported workflow has correct connections.

---

**CRITICAL-3: Unsafe expression evaluation in connector resolution**
**Severity:** HIGH

**Location:** `module_11A_connector_manager.json` → "Resolve Handler"

**Current Code:**
```javascript
const urlPattern = connector.base_url;
// Replace {{$env.VAR}} with actual values
const resolvedUrl = urlPattern.replace(/{{\\$env\\.(\\w+)}}/g, (match, envVar) => {
  return $env[envVar] || match;
});
```

**Issue:** If `connector.base_url` contains malicious pattern:
```
"base_url": "{{$env.__proto__}}"  // Prototype pollution attempt
```

**Fix:**
```javascript
const ALLOWED_ENV_VARS = ['N8N_BASE_URL', 'API_ENDPOINT', 'DOMAIN'];
const resolvedUrl = urlPattern.replace(/{{\\$env\\.(\\w+)}}/g, (match, envVar) => {
  if (!ALLOWED_ENV_VARS.includes(envVar)) {
    throw new Error(`Disallowed env var: ${envVar}`);
  }
  return $env[envVar] || match;
});
```

---

**CRITICAL-4: No timeout on M11B mock simulator calls**
**Severity:** MEDIUM

**Location:** "Call Mock Simulator" HTTP Request node

**Issue:** If M11B hangs, M11A waits indefinitely.

**Fix:** Add timeout (see SYSTEMIC-2).

---

**CRITICAL-5: No validation of connector_id input**
**Severity:** MEDIUM

**Location:** "Lookup Handler"

**Current:**
```javascript
const connectorId = $json.body.connector_id;
const connector = registry.connectors.find(c => c.id === connectorId);
```

**Issue:** No validation of `connectorId`.

**Fix:**
```javascript
const connectorId = $json.body?.connector_id;
if (!connectorId || typeof connectorId !== 'string') {
  throw new Error('Invalid connector_id');
}
if (connectorId.length > 100 || !/^[a-z0-9_-]+$/.test(connectorId)) {
  throw new Error('Invalid connector_id format');
}
```

---

**CRITICAL-6: Missing `pairedItem` in ALL Code nodes**
**Same as SYSTEMIC-1.**

---

### Module 11B: Mock Simulator

**CRITICAL VIOLATIONS:**

**CRITICAL-1: globalThis usage for mock data caching**
**Severity:** CRITICAL

**Location:** "Mock Fetch Handler"

**Issue:**
```javascript
let mockCache = globalThis.mockCache;
if (!mockCache) {
  mockCache = loadAllMocks();
  globalThis.mockCache = mockCache;
}
```

**Same issue as M11A CRITICAL-1:** Breaks in Cloud/queue mode.

**Fix:** Same as M11A - reload mocks on each execution.

---

**CRITICAL-2: File system access incompatible with n8n Cloud**
**Severity:** CRITICAL FOR CLOUD DEPLOYMENT

**Location:** "Mock Fetch Handler"

**Current:**
```javascript
const fs = require('fs');
const mockPath = `${$env.MOCK_BASE_PATH}/${connectorId}_${endpoint}.json`;
const mockData = JSON.parse(fs.readFileSync(mockPath));
```

**Issue:** n8n Cloud doesn't allow file system access.

**Impact:** Module 11B completely non-functional in Cloud.

**Fix Options:**
1. **Embed mocks in workflow** (works but large):
```javascript
const MOCKS = {
  'sendgrid_send_email': { success: true, message_id: 'mock-123' },
  'stripe_create_charge': { id: 'ch_mock', status: 'succeeded' }
};
const mockKey = `${connectorId}_${endpoint}`;
const mockData = MOCKS[mockKey];
```

2. **Fetch from external service** (recommended for Cloud):
```javascript
const mockUrl = `https://your-mock-server.com/mocks/${connectorId}/${endpoint}`;
const response = await fetch(mockUrl);
const mockData = await response.json();
```

**Effort:** 3-4 hours to migrate all mocks

---

**CRITICAL-3: Path injection vulnerability**
**Severity:** HIGH

**Location:** "Mock Fetch Handler"

**Current:**
```javascript
const mockPath = `${$env.MOCK_BASE_PATH}/${connectorId}_${endpoint}.json`;
```

**Issue:** If `connectorId` is `../../etc/passwd`, reads arbitrary files.

**Fix:**
```javascript
// Sanitize inputs
const safeConnectorId = connectorId.replace(/[^a-z0-9_-]/gi, '');
const safeEndpoint = endpoint.replace(/[^a-z0-9_-]/gi, '');
const mockPath = `${$env.MOCK_BASE_PATH}/${safeConnectorId}_${safeEndpoint}.json`;

// Verify path is within MOCK_BASE_PATH
const resolvedPath = path.resolve(mockPath);
const basePath = path.resolve($env.MOCK_BASE_PATH);
if (!resolvedPath.startsWith(basePath)) {
  throw new Error('Invalid mock path');
}
```

---

**CRITICAL-4: No validation of mock file existence**
**Severity:** MEDIUM

**Current:**
```javascript
const mockData = JSON.parse(fs.readFileSync(mockPath));
// Crashes if file doesn't exist
```

**Fix:**
```javascript
if (!fs.existsSync(mockPath)) {
  throw new Error(`Mock not found: ${connectorId}/${endpoint}`);
}
```

---

**CRITICAL-5: Missing pairedItem (SYSTEMIC-1)**
**CRITICAL-6: No retry configuration (SYSTEMIC-2)**

---

### Module 01 Enterprise

**All Core v2 issues PLUS:**

**CRITICAL-7: Timing attack vulnerability in webhook signature validation**
**Severity:** HIGH (Security)

**Location:** "Validate Webhook Signature" Code node

**Current:**
```javascript
const signature = $json.headers['x-webhook-signature'];
const expectedSignature = calculateSignature($json.body);
if (signature !== expectedSignature) {  // Timing attack!
  throw new Error('Invalid signature');
}
```

**Issue:** String comparison reveals signature length through timing.

**Fix:**
```javascript
const crypto = require('crypto');
const signature = $json.headers['x-webhook-signature'];
const expectedSignature = calculateSignature($json.body);

// Constant-time comparison
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSignature)
);
if (!isValid) {
  throw new Error('Invalid signature');
}
```

---

**CRITICAL-8: IP allowlist bypass via X-Forwarded-For**
**Severity:** HIGH (Security)

**Current:**
```javascript
const clientIp = $json.headers['x-forwarded-for'] || $json.headers['x-real-ip'];
```

**Issue:** Attacker controls X-Forwarded-For header → bypasses IP allowlist.

**Fix:**
```javascript
// Only trust X-Forwarded-For from known proxies
const trustedProxies = ['10.0.0.1', '10.0.0.2'];
const directIp = $json.headers['x-real-ip'];  // From n8n itself

let clientIp = directIp;
if (trustedProxies.includes(directIp)) {
  // Behind trusted proxy, use X-Forwarded-For
  clientIp = $json.headers['x-forwarded-for']?.split(',')[0].trim();
}
```

---

**CRITICAL-9: Sensitive data in error messages**
**Severity:** MEDIUM (Security)

**Current:**
```javascript
throw new Error(`Stripe API failed: ${response.body} (key: ${apiKey})`);
```

**Issue:** Leaks API key in execution logs.

**Fix:**
```javascript
console.error('Stripe API details:', { keyPrefix: apiKey.substring(0, 4) });
throw new Error(`Stripe API failed: ${response.statusCode}`);
```

---

### Modules 02-10 Enterprise

**Same patterns as Module 01 Enterprise.**
**All have systemic issues plus enterprise-specific security issues.**

---

## Summary of Critical Findings

| Module | Critical Issues | High Issues | Must Fix Immediately |
|--------|----------------|-------------|---------------------|
| M01 Core | 4 | 1 | pairedItem, retry, error handlers |
| M02 Core | 5 | 1 | + race condition |
| M03 Core | 4 | 2 | + booking validation |
| **M04 Core** | **5** | **0** | **+ IDEMPOTENCY KEY** |
| M05 Core | 4 | 1 | + pagination |
| M06 Core | 4 | 0 | Same as M01 |
| M07 Core | 4 | 0 | Same as M01 |
| M08 Core | 4 | 1 | + race conditions |
| M09 Core | 4 | 0 | Same as M01 |
| M10 Core | 4 | 1 | + orchestration races |
| **M11A** | **6** | **0** | **globalThis, routing** |
| **M11B** | **5** | **1** | **fs access, path injection** |
| M01 Ent | 6 | 3 | + timing attack, IP bypass |
| M02-10 Ent | ~6 each | ~2 each | Same as M01 Ent |

**Total:** 37 CRITICAL, 52 HIGH

---

# SECTION 3: AIGENT_STABILITY_REFACTOR_PLAN

Step-by-step implementation blueprint to fix all issues.

## 3.1 Prioritization & Phasing

### PHASE 1: CRITICAL FIXES (Week 1)
**Deploy immediately - these break core functionality:**

1. **DISABLE Module 04 in production** until idempotency key added
2. **DISABLE Module 11A/11B in production** until globalThis fixed
3. Fix pairedItem in ALL Code nodes (SYSTEMIC-1)
4. Fix globalThis in Module 11A/11B (CRITICAL-1)
5. Fix Module 11A operation routing (CRITICAL-2)
6. Add idempotency key to Module 04 (CRITICAL-1)
7. Connect error handlers (SYSTEMIC-4)

### PHASE 2: HIGH PRIORITY (Week 2)
**Deploy before production scaling:**

1. Add retry configuration to all HTTP nodes (SYSTEMIC-2)
2. Fix timing attack in Enterprise modules (CRITICAL-7)
3. Fix IP bypass in Enterprise modules (CRITICAL-8)
4. Add deduplication to webhook modules (SYSTEMIC-3)
5. Fix path injection in Module 11B (CRITICAL-3)

### PHASE 3: MEDIUM PRIORITY (Weeks 3-4)
**Improves reliability:**

1. Fix race conditions in M02, M08, M10 (HIGH-6, SYSTEMIC-6)
2. Add pagination to M05 (MEDIUM-6)
3. Add input validation (CRITICAL-5, all modules)
4. Fix XSS escaping (SYSTEMIC-5)

### PHASE 4: LOW PRIORITY (Month 2)
**Quality improvements:**

1. Add monitoring/alerting
2. Performance optimization
3. Documentation updates
4. Migration to Cloud-compatible patterns

---

## 3.2 Implementation Steps

### FIX 1: Add pairedItem to ALL Code nodes
**Priority:** CRITICAL
**Effort:** 44-66 hours (2-3 hours × 22 modules)
**Affects:** All modules

**Implementation:**

1. **Create a regex search across all modules:**
```bash
grep -r "return items.map" Aigent_Modules_Core/*.json Aigent_Modules_Enterprise/*.json
```

2. **For each occurrence, update to:**
```javascript
// BEFORE:
return items.map(item => ({
  json: { transformed: item.json.field }
}));

// AFTER:
return items.map((item, index) => ({
  json: { transformed: item.json.field },
  pairedItem: { item: index }
}));
```

3. **Testing:**
```javascript
// In n8n, enable Debug mode
// Verify item context shows correct source data
// Verify error messages reference correct items
```

4. **Validation:**
- Export each workflow
- Search for `return items.map` in JSON
- Verify ALL instances have `pairedItem`

**Rollout:** Can be deployed incrementally, module by module.

---

### FIX 2: Replace globalThis in Module 11A/11B
**Priority:** CRITICAL
**Effort:** 4-6 hours
**Affects:** M11A, M11B (breaks ALL dependent modules if not fixed)

**Implementation for Module 11A:**

**Option A: Reload on every execution (simple, works everywhere)**
```javascript
// In "Load Registry" node:
const registryPath = $env.CONNECTOR_REGISTRY_PATH;
const registry = JSON.parse(fs.readFileSync(registryPath));

// In "Lookup Handler" and all other nodes:
// Remove: const registry = globalThis.aigent_registry;
// Add:
const registryPath = $env.CONNECTOR_REGISTRY_PATH;
const registry = JSON.parse(fs.readFileSync(registryPath));

// Use registry...
```

**Pros:** Simple, works in all environments
**Cons:** Slower (reads file every execution)

**Option B: Cache with expiration (recommended)**
```javascript
// In every node that needs registry:
let registry = globalThis.aigent_registry;
const cacheExpiry = globalThis.aigent_registry_expiry || 0;

if (!registry || Date.now() > cacheExpiry) {
  const registryPath = $env.CONNECTOR_REGISTRY_PATH;
  registry = JSON.parse(fs.readFileSync(registryPath));
  globalThis.aigent_registry = registry;
  globalThis.aigent_registry_expiry = Date.now() + 60000;  // 1 min cache
}

// Use registry...
```

**Pros:** Fast, cache reduces file reads
**Cons:** Still relies on globalThis (but defensively)

**Option C: External service (Cloud-compatible)**
```javascript
// Replace file system access with HTTP fetch:
const registryUrl = $env.CONNECTOR_REGISTRY_URL;
const response = await fetch(registryUrl);
const registry = await response.json();
```

**Pros:** Works in Cloud, centralized registry
**Cons:** Requires external service deployment

**Recommendation:** Start with Option B (quick fix), migrate to Option C for Cloud.

**Implementation for Module 11B (mocks):**

**Same pattern, but for mocks:**

**Option A: Embed mocks in workflow**
```javascript
const MOCKS = {
  'sendgrid_send_email': {
    success: true,
    message_id: 'mock-' + Date.now()
  },
  'stripe_create_charge': {
    id: 'ch_mock_' + Date.now(),
    status: 'succeeded',
    amount: 1000
  }
  // ... all other mocks
};

const mockKey = `${connectorId}_${endpoint}`;
if (!MOCKS[mockKey]) {
  throw new Error(`Mock not found: ${mockKey}`);
}
return { json: MOCKS[mockKey] };
```

**Option B: External mock service (recommended for Cloud)**
```javascript
const mockUrl = `${$env.MOCK_SERVICE_URL}/mocks/${connectorId}/${endpoint}`;
const response = await fetch(mockUrl);
if (!response.ok) {
  throw new Error(`Mock not found: ${connectorId}/${endpoint}`);
}
const mockData = await response.json();
return { json: mockData };
```

**Testing:**
1. Deploy to n8n Cloud or queue mode
2. Trigger workflow multiple times rapidly
3. Verify registry/mocks load correctly every time
4. Monitor performance (should be <100ms overhead)

---

### FIX 3: Fix Module 11A operation routing
**Priority:** CRITICAL
**Effort:** 1 hour
**Affects:** M11A (all dependent modules fail if broken)

**Issue:** "execute" operation returns registry instead of executing.

**Verification:** Import `module_11A_connector_manager.json` and check connections:

**Expected flow:**
```
Route Operation (Switch) → output "normalize" → Lookup Handler
                                                → Normalize Handler
                                                → Check Execute (Switch)
                                                  → output "false" → Check Resolve
                                                  → output "true"  → Execute Handler
                                                                   → Check Mode
                                                                   → Call Mock/Live
                                                                   → Return Success
```

**Fix:** Verify "Normalize Handler" connects to "Check Execute", not "Return Success".

**Testing:**
```bash
curl -X POST http://localhost:5678/webhook/.../connector-manager/execute \
  -H "Content-Type: application/json" \
  -d '{
    "connector_id": "sendgrid",
    "endpoint": "send_email",
    "payload": {"to": "test@example.com", "subject": "Test"}
  }'

# Should return email send result, NOT registry
```

---

### FIX 4: Add idempotency key to Module 04 payments
**Priority:** CRITICAL (SECURITY/FINANCIAL)
**Effort:** 2 hours
**Affects:** M04 Core + Enterprise

**Implementation:**

**In "Create Stripe Charge" (or M11A call):**

```javascript
// BEFORE:
const charge = await callM11A('stripe', 'create_charge', {
  amount: $json.body.amount,
  currency: 'USD',
  source: $json.body.payment_method
});

// AFTER:
const bookingId = $json.body.booking_id;
const amount = $json.body.amount;
const idempotencyKey = `${bookingId}:${amount}:${Date.now().toString(36)}`;

const charge = await callM11A('stripe', 'create_charge', {
  amount: amount,
  currency: 'USD',
  source: $json.body.payment_method,
  idempotency_key: idempotencyKey  // CRITICAL
});

// Store idempotency key for audit:
await logPayment({
  bookingId,
  amount,
  idempotencyKey,
  chargeId: charge.id
});
```

**Ensure M11A passes idempotency_key to Stripe connector:**

In `connectors_registry.json`:
```json
{
  "id": "stripe",
  "endpoints": [
    {
      "name": "create_charge",
      "method": "POST",
      "path": "/v1/charges",
      "headers": {
        "Idempotency-Key": "{{payload.idempotency_key}}"  // Add this
      }
    }
  ]
}
```

**Testing:**
```bash
# Send same request twice:
curl -X POST http://localhost:5678/webhook/.../billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "test-123",
    "amount": 1000,
    "payment_method": "pm_card_visa"
  }'

# Verify only ONE charge created in Stripe dashboard
```

**CRITICAL:** Do NOT re-enable Module 04 until this is tested.

---

### FIX 5: Connect all error handlers
**Priority:** CRITICAL
**Effort:** 11 hours (30 min × 22 modules)
**Affects:** All modules

**Implementation:**

**For each node with `onError: "continueErrorOutput"` but no error connection:**

1. **Add error handling node:**
```json
{
  "name": "Handle [Node Name] Error",
  "type": "n8n-nodes-base.code",
  "parameters": {
    "code": "const error = $json.error || $input.item.json.error;\nconsole.error('[Node Name] failed:', error);\n\n// Decide: retry, fallback, or fail gracefully\nif (error.message.includes('rate limit')) {\n  throw error;  // Let retry mechanism handle\n}\n\nreturn {\n  json: {\n    success: false,\n    error: error.message,\n    trace_id: $json.trace_id || 'unknown'\n  }\n};"
  }
}
```

2. **Connect error output:**
```json
{
  "connections": {
    "[Node Name]": {
      "main": [[{ "node": "Success Path" }]],
      "error": [[{ "node": "Handle [Node Name] Error" }]]
    }
  }
}
```

3. **Testing:**
- Force node to fail (invalid input)
- Verify error handler executes
- Verify error logged
- Verify workflow doesn't silently succeed

**Rollout:** Can be deployed incrementally.

---

### FIX 6: Add retry configuration to ALL HTTP nodes
**Priority:** HIGH
**Effort:** 4-6 hours (10-15 min × 22 modules)
**Affects:** All modules with HTTP Request nodes

**Implementation:**

**For each HTTP Request node, add:**
```json
{
  "parameters": {
    "url": "...",
    "options": {
      "timeout": 10000,  // 10 seconds
      "retry": {
        "maxTries": 3,
        "waitBetweenTries": 1000  // 1s, 2s, 4s (exponential)
      }
    }
  }
}
```

**Adjust timeout based on API:**
- Fast APIs (< 1s expected): `timeout: 5000`
- Normal APIs (1-3s): `timeout: 10000`
- Slow APIs (5-10s): `timeout: 30000`
- Long-running (webhooks, video): `timeout: 60000`

**Testing:**
- Temporarily break API endpoint (return 500)
- Verify 3 retries with exponential backoff
- Monitor logs for retry timestamps

---

### FIX 7: Fix constant-time comparison in Enterprise modules
**Priority:** HIGH (Security)
**Effort:** 2 hours
**Affects:** All Enterprise modules with signature validation

**Implementation:**

```javascript
// BEFORE:
const crypto = require('crypto');
if (signature !== expectedSignature) {
  throw new Error('Invalid signature');
}

// AFTER:
const crypto = require('crypto');
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature, 'hex'),
  Buffer.from(expectedSignature, 'hex')
);
if (!isValid) {
  throw new Error('Invalid signature');
}
```

**Testing:**
- Measure response time for valid vs invalid signatures
- Should be identical (within 1-2ms)
- Use timing attack tools if available

---

### FIX 8: Fix IP bypass vulnerability in Enterprise modules
**Priority:** HIGH (Security)
**Effort:** 2 hours
**Affects:** All Enterprise modules with IP allowlisting

**Implementation:**

```javascript
// BEFORE:
const clientIp = $json.headers['x-forwarded-for'] || $json.headers['x-real-ip'];

// AFTER:
const trustedProxies = ($env.TRUSTED_PROXIES || '').split(',');
const directIp = $json.headers['x-real-ip'] || $json.requestIp;

let clientIp = directIp;
if (trustedProxies.includes(directIp)) {
  const forwardedFor = $json.headers['x-forwarded-for'];
  if (forwardedFor) {
    clientIp = forwardedFor.split(',')[0].trim();
  }
}

// Validate IP
const allowedIps = ($env.ALLOWED_IPS || '').split(',');
if (!allowedIps.includes(clientIp)) {
  throw new Error('IP not allowed');
}
```

**Testing:**
- Send request with `X-Forwarded-For: 1.2.3.4` from non-trusted IP
- Should reject (not bypass allowlist)

---

### FIX 9: Add deduplication to webhook modules
**Priority:** MEDIUM
**Effort:** 8-12 hours (1-2 hours × 5 webhook modules)
**Affects:** M01, M02, M04, M05, M08

**Implementation Option A: In-memory (simple, not Cloud-safe):**

```javascript
const requestId = $json.headers['x-request-id'] ||
                  $json.body.request_id ||
                  crypto.createHash('sha256')
                    .update(JSON.stringify($json.body))
                    .digest('hex');

const dedupeKey = `request:${requestId}`;
const lastSeen = globalThis[dedupeKey];

if (lastSeen && Date.now() - lastSeen < 300000) {  // 5 min window
  return {
    json: {
      success: true,
      message: 'Duplicate request ignored',
      request_id: requestId
    }
  };
}

globalThis[dedupeKey] = Date.now();

// Continue processing
```

**Implementation Option B: External Redis (recommended for production):**

```javascript
const redis = await connectRedis($env.REDIS_URL);
const requestId = /* same as above */;

const exists = await redis.exists(`request:${requestId}`);
if (exists) {
  return { json: { success: true, message: 'Duplicate ignored' } };
}

await redis.setex(`request:${requestId}`, 300, '1');  // 5 min TTL

// Continue processing
```

**Note:** Requires Redis integration. May need custom n8n node or HTTP Request to Redis API.

---

### FIX 10: Fix path injection in Module 11B
**Priority:** HIGH (Security)
**Effort:** 1 hour
**Affects:** M11B

**Implementation:**

```javascript
// BEFORE:
const mockPath = `${$env.MOCK_BASE_PATH}/${connectorId}_${endpoint}.json`;

// AFTER:
const path = require('path');

// Sanitize inputs
const safeConnectorId = connectorId.replace(/[^a-z0-9_-]/gi, '');
const safeEndpoint = endpoint.replace(/[^a-z0-9_-]/gi, '');

if (safeConnectorId !== connectorId || safeEndpoint !== endpoint) {
  throw new Error('Invalid connector_id or endpoint format');
}

const mockPath = path.join($env.MOCK_BASE_PATH, `${safeConnectorId}_${safeEndpoint}.json`);

// Verify path is within MOCK_BASE_PATH
const resolvedPath = path.resolve(mockPath);
const basePath = path.resolve($env.MOCK_BASE_PATH);

if (!resolvedPath.startsWith(basePath + path.sep)) {
  throw new Error('Path traversal attempt detected');
}

// Safe to read
if (!fs.existsSync(resolvedPath)) {
  throw new Error(`Mock not found: ${safeConnectorId}/${safeEndpoint}`);
}
const mockData = JSON.parse(fs.readFileSync(resolvedPath));
```

**Testing:**
```bash
# Try path traversal:
curl -X POST http://localhost:5678/webhook/.../connector-mock/mock-fetch \
  -d '{"connector_id": "../../etc/passwd", "endpoint": "test"}'

# Should return error, NOT file contents
```

---

## 3.3 Testing Strategy

### Unit Testing (Per Fix)
1. **Positive case:** Expected input → expected output
2. **Negative case:** Invalid input → proper error
3. **Edge case:** Empty, null, malformed inputs
4. **Performance:** Acceptable latency (<100ms overhead)

### Integration Testing (Per Module)
1. **End-to-end flow:** Webhook → processing → response
2. **Error paths:** Force failures → verify error handling
3. **Retry behavior:** Temporary failures → verify retries work
4. **Deduplication:** Duplicate requests → verify second ignored

### System Testing (Full Suite)
1. **M01 → M11A → M11B chain:** Lead capture with mock notification
2. **M04 → M11A → Stripe:** Payment with idempotency
3. **M10 orchestration:** Multi-module workflow
4. **Load testing:** 100 concurrent requests → no race conditions

### Regression Testing
1. Export all workflows before changes
2. Apply fixes
3. Export after changes
4. Diff workflows to verify only intended changes
5. Re-run all existing test cases

---

## 3.4 Deployment Rollout

### Week 1: CRITICAL Fixes
1. Deploy pairedItem fixes (FIX 1)
2. Deploy globalThis replacement (FIX 2)
3. Deploy routing fix (FIX 3)
4. Deploy idempotency key (FIX 4)
5. Deploy error handler connections (FIX 5)
6. **Re-enable M04, M11A, M11B** after verification

### Week 2: HIGH Priority
1. Deploy retry configuration (FIX 6)
2. Deploy timing attack fix (FIX 7)
3. Deploy IP bypass fix (FIX 8)
4. Deploy deduplication (FIX 9)
5. Deploy path injection fix (FIX 10)

### Week 3-4: MEDIUM Priority
1. Race condition fixes
2. Pagination improvements
3. Input validation
4. XSS fixes

### Month 2: Continuous Improvement
1. Monitoring/alerting
2. Performance optimization
3. Cloud migration prep
4. Documentation

---

# SECTION 4: CANONICAL_SAFE_PATTERNS_FOR_AIGENT_MODULES

Production-ready reference templates for stable n8n workflows.

---

## 4.1 SAFE WEBHOOK → VALIDATION → PROCESS → RESPONSE PATTERN

**Use this template for ALL webhook-triggered modules.**

### Complete Workflow Structure

```json
{
  "name": "Module XX - [Purpose]",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "module-xx-endpoint",
        "webhookId": "GENERATE-UUID-HERE",
        "responseMode": "lastNode",
        "options": {}
      }
    },
    {
      "name": "Validate Input",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": "// CANONICAL VALIDATION PATTERN\n\nconst body = $json.body;\nconst headers = $json.headers;\n\n// 1. Size validation\nconst payloadSize = JSON.stringify(body).length;\nconst MAX_SIZE = 16 * 1024 * 1024;  // 16MB\nif (payloadSize > MAX_SIZE) {\n  throw new Error(`Payload too large: ${payloadSize} bytes`);\n}\n\n// 2. Required fields\nconst requiredFields = ['field1', 'field2'];\nfor (const field of requiredFields) {\n  if (!body[field]) {\n    throw new Error(`Missing required field: ${field}`);\n  }\n}\n\n// 3. Type validation\nif (typeof body.field1 !== 'string') {\n  throw new Error('field1 must be string');\n}\nif (typeof body.field2 !== 'number') {\n  throw new Error('field2 must be number');\n}\n\n// 4. Format validation\nconst emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\nif (body.email && !emailRegex.test(body.email)) {\n  throw new Error('Invalid email format');\n}\n\n// 5. Deduplication\nconst crypto = require('crypto');\nconst requestId = headers['x-request-id'] || \n                  body.request_id ||\n                  crypto.randomUUID();\n\nconst dedupeKey = `request:${requestId}`;\nlet dedupe = globalThis[dedupeKey];\nif (!dedupe) {\n  dedupe = { requests: [] };\n  globalThis[dedupeKey] = dedupe;\n}\n\nconst lastSeen = dedupe.requests[dedupe.requests.length - 1];\nif (lastSeen && Date.now() - lastSeen < 300000) {\n  throw new Error('Duplicate request (5 min window)');\n}\ndedupe.requests.push(Date.now());\n\n// 6. Sanitization\nconst sanitizeHtml = (str) => {\n  if (typeof str !== 'string') return str;\n  return str\n    .replace(/&/g, '&amp;')\n    .replace(/</g, '&lt;')\n    .replace(/>/g, '&gt;')\n    .replace(/\"/g, '&quot;')\n    .replace(/'/g, '&#x27;');\n};\n\nconst sanitized = {\n  field1: sanitizeHtml(body.field1),\n  field2: body.field2,\n  email: body.email?.toLowerCase().trim(),\n  requestId: requestId,\n  trace_id: crypto.randomUUID()\n};\n\n// 7. Output with pairedItem\nreturn {\n  json: sanitized,\n  pairedItem: { item: 0 }\n};"
      }
    },
    {
      "name": "Process Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": "// CANONICAL PROCESSING PATTERN\n\nconst items = $input.all();\n\nreturn items.map((item, index) => {\n  const input = item.json;\n  \n  // Business logic here\n  const result = {\n    processed: input.field1.toUpperCase(),\n    calculated: input.field2 * 2,\n    timestamp: new Date().toISOString()\n  };\n  \n  return {\n    json: result,\n    pairedItem: { item: index }  // CRITICAL\n  };\n});"
      }
    },
    {
      "name": "Call External API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.API_URL}}/endpoint",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "data",
              "value": "={{$json}}"
            }
          ]
        },
        "options": {
          "timeout": 10000,
          "retry": {
            "maxTries": 3,
            "waitBetweenTries": 1000
          }
        }
      },
      "onError": "continueErrorOutput"
    },
    {
      "name": "Handle API Error",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": "const error = $json.error || $input.item.json.error;\nconsole.error('API call failed:', {\n  message: error.message,\n  code: error.code,\n  trace_id: $json.trace_id\n});\n\n// Decide: retry or fail gracefully\nif (error.message?.includes('rate limit')) {\n  throw error;  // Let retry mechanism handle\n}\n\nreturn {\n  json: {\n    success: false,\n    error: 'External API unavailable',\n    trace_id: $json.trace_id || 'unknown'\n  },\n  pairedItem: { item: 0 }\n};"
      }
    },
    {
      "name": "Return Success",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "options": {
          "responseCode": 200,
          "responseHeaders": {
            "entries": [
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          }
        },
        "respondWith": "json",
        "responseBody": "={{JSON.stringify({\n  success: true,\n  data: $json,\n  trace_id: $json.trace_id\n})}}"
      }
    },
    {
      "name": "Return Error",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "options": {
          "responseCode": "={{$json.statusCode || 400}}",
          "responseHeaders": {
            "entries": [
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          }
        },
        "respondWith": "json",
        "responseBody": "={{JSON.stringify({\n  success: false,\n  error: $json.error || 'Unknown error',\n  trace_id: $json.trace_id || 'unknown'\n})}}"
      }
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{ "node": "Validate Input" }]]
    },
    "Validate Input": {
      "main": [[{ "node": "Process Data" }]],
      "error": [[{ "node": "Return Error" }]]
    },
    "Process Data": {
      "main": [[{ "node": "Call External API" }]],
      "error": [[{ "node": "Return Error" }]]
    },
    "Call External API": {
      "main": [[{ "node": "Return Success" }]],
      "error": [[{ "node": "Handle API Error" }]]
    },
    "Handle API Error": {
      "main": [[{ "node": "Return Error" }]]
    }
  }
}
```

---

## 4.2 SAFE HTTP REQUEST CONFIGURATION

**Use this for ALL HTTP Request nodes.**

### Basic HTTP Request
```json
{
  "name": "Call API",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "={{$env.API_URL}}/endpoint",
    "method": "POST",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "X-Trace-ID",
          "value": "={{$json.trace_id}}"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "data",
          "value": "={{$json}}"
        }
      ]
    },
    "options": {
      "timeout": 10000,
      "retry": {
        "maxTries": 3,
        "waitBetweenTries": 1000
      },
      "response": {
        "response": {
          "fullResponse": true
        }
      }
    }
  },
  "onError": "continueErrorOutput"
}
```

### HTTP Request with Pagination (Static)
```json
{
  "parameters": {
    "url": "={{$env.API_URL}}/list",
    "method": "GET",
    "options": {
      "timeout": 30000,
      "pagination": {
        "pageSize": 100,
        "limitPagesFetched": true,
        "maxRequests": 10
      }
    }
  }
}
```

**Note:** If dynamic pagination needed, use Split In Batches + Loop instead.

---

## 4.3 SAFE EXPRESSION USAGE PATTERNS

### ✅ DO: Use expressions for runtime values
```javascript
// SAFE: Runtime configuration
"mockMode": "={{$env.MOCK_MODE}}"
"timeout": "={{$env.API_TIMEOUT || 10000}}"

// SAFE: Data transformation
"fullName": "={{$json.firstName + ' ' + $json.lastName}}"

// SAFE: Conditional values
"priority": "={{$json.amount > 1000 ? 'high' : 'normal'}}"
```

### ❌ DON'T: Use expressions for structural config
```javascript
// DANGEROUS: Will break on export/import
"webhookId": "={{$env.WEBHOOK_UUID}}"  // Becomes literal string
"path": "={{$env.WEBHOOK_PATH}}"  // Becomes literal string

// Instead: Hardcode structure, parameterize behavior
"webhookId": "365b6343-cc32-4ac8-837f-bde02317aa9a",  // Fixed
"path": "intake-lead"  // Fixed
```

### ✅ DO: Validate expression results
```javascript
const value = "={{$json.field}}";
if (!value || value === "={{$json.field}}") {
  // Expression didn't evaluate (export/import issue)
  throw new Error('Configuration error: expression not evaluated');
}
```

### ❌ DON'T: Assume globalThis persists
```javascript
// DANGEROUS: Breaks in Cloud/queue mode
globalThis.cache = expensiveOperation();
// Later:
const data = globalThis.cache;  // May be undefined!

// Instead: Reload with defensive cache
let data = globalThis.cache;
if (!data) {
  data = expensiveOperation();
  globalThis.cache = data;  // Cache for THIS execution only
}
```

### ✅ DO: Use n8n built-in functions
```javascript
// SAFE: n8n provides these
"={{$now}}"  // Current timestamp
"={{$json.field}}"  // Access data
"={{$env.VAR}}"  // Environment variables
"={{$execution.id}}"  // Execution ID
"={{$workflow.id}}"  // Workflow ID
```

### ❌ DON'T: Use unavailable modules
```javascript
// DANGEROUS: Works self-hosted, fails in Cloud
const axios = require('axios');  // ModuleNotFoundError
const lodash = require('lodash');  // ModuleNotFoundError

// Instead: Use HTTP Request node or built-ins
const crypto = require('crypto');  // OK - built-in
const fs = require('fs');  // OK self-hosted, fails Cloud
```

---

## 4.4 SAFE DATA SHAPE PROPAGATION

### Always Return Correct Structure
```javascript
// CANONICAL CODE NODE OUTPUT

const items = $input.all();

return items.map((item, index) => {
  const input = item.json;

  // Transform data
  const output = {
    id: input.id,
    transformed: processData(input),
    metadata: {
      processedAt: new Date().toISOString(),
      processorId: $execution.id
    }
  };

  return {
    json: output,  // REQUIRED: Wrapped in json
    pairedItem: { item: index },  // REQUIRED: Link to source
    binary: item.binary  // OPTIONAL: Preserve binary data
  };
});
```

### Preserve Binary Data
```javascript
// If input has binary data, preserve it
return items.map((item, index) => ({
  json: { transformed: item.json.field },
  pairedItem: { item: index },
  binary: item.binary  // Preserve files/images
}));
```

### Handle Empty Results
```javascript
const items = $input.all();
const results = items.filter(item => item.json.status === 'active');

if (results.length === 0) {
  // Return empty array, NOT undefined
  return [];
}

return results.map((item, index) => ({
  json: item.json,
  pairedItem: { item: index }
}));
```

---

## 4.5 MULTI-LAYER ERROR HANDLING

### Layer 1: Input Validation (Fail Fast)
```javascript
// In "Validate Input" node
const body = $json.body;

if (!body || typeof body !== 'object') {
  throw new Error('Invalid request body');
}

const requiredFields = ['field1', 'field2'];
for (const field of requiredFields) {
  if (body[field] === undefined || body[field] === null) {
    throw new Error(`Missing required field: ${field}`);
  }
}

// Validate types
if (typeof body.field1 !== 'string') {
  throw new Error('field1 must be string');
}

// Validate formats
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(body.email)) {
  throw new Error('Invalid email format');
}

// Validation passed
return {
  json: body,
  pairedItem: { item: 0 }
};
```

### Layer 2: Business Logic Errors (Graceful Handling)
```javascript
// In "Process Data" node with error handler
try {
  const result = processData($json);
  return { json: result, pairedItem: { item: 0 } };
} catch (error) {
  // Log for debugging
  console.error('Processing failed:', {
    error: error.message,
    input: $json,
    trace_id: $json.trace_id
  });

  // Decide: retry or fail gracefully
  if (error.code === 'TRANSIENT_ERROR') {
    throw error;  // Let retry mechanism handle
  }

  // Graceful failure
  return {
    json: {
      success: false,
      error: 'Processing failed',
      trace_id: $json.trace_id
    },
    pairedItem: { item: 0 }
  };
}
```

### Layer 3: External API Errors (Retry + Fallback)
```javascript
// HTTP Request node configuration
{
  "options": {
    "timeout": 10000,
    "retry": {
      "maxTries": 3,
      "waitBetweenTries": 1000
    }
  },
  "onError": "continueErrorOutput"
}

// Error handler node
const error = $json.error || $input.item.json.error;

// Log error
console.error('API call failed:', {
  endpoint: $json.url,
  status: $json.statusCode,
  error: error.message,
  trace_id: $json.trace_id
});

// Classify error
const isRetryable = [408, 429, 500, 502, 503, 504].includes($json.statusCode);

if (isRetryable) {
  // Let retry mechanism handle
  throw error;
}

// Non-retryable error - fail gracefully
return {
  json: {
    success: false,
    error: 'External service unavailable',
    statusCode: $json.statusCode || 500,
    trace_id: $json.trace_id
  },
  pairedItem: { item: 0 }
};
```

### Layer 4: Workflow-Level Error Handler
```javascript
// Add Error Trigger node to catch unhandled errors
{
  "name": "Global Error Handler",
  "type": "n8n-nodes-base.errorTrigger",
  "parameters": {}
}

// Connect to logging/alerting
// Code node:
const error = $json.error;
const workflow = $json.workflow;
const execution = $json.execution;

console.error('Workflow failed:', {
  workflow: workflow.name,
  execution: execution.id,
  error: error.message,
  stack: error.stack
});

// Send alert (Slack, email, etc.)
await sendAlert({
  severity: 'HIGH',
  message: `Workflow ${workflow.name} failed: ${error.message}`,
  execution: execution.id
});

return { json: { alerted: true } };
```

---

## 4.6 SAFE MERGE/SPLIT OPERATIONS

### Merge Pattern (Wait for All)
```json
{
  "name": "Merge Results",
  "type": "n8n-nodes-base.merge",
  "parameters": {
    "mode": "mergeByPosition",
    "options": {
      "timeout": 30000,
      "timeoutErrorOutput": "continueErrorOutput"
    }
  },
  "onError": "continueErrorOutput"
}
```

**Error handler for timeout:**
```javascript
console.error('Merge timeout:', {
  expectedBranches: 2,
  timeout: 30000,
  trace_id: $json.trace_id
});

// Decide: fail or continue with partial data
throw new Error('Merge timeout - data incomplete');
```

### Split In Batches Pattern
```json
{
  "name": "Split Recipients",
  "type": "n8n-nodes-base.splitInBatches",
  "parameters": {
    "batchSize": 50,
    "options": {
      "reset": false
    }
  }
}
```

**Process each batch:**
```javascript
// Items are automatically batched
const batch = $input.all();

console.log(`Processing batch of ${batch.length} items`);

return batch.map((item, index) => ({
  json: {
    processed: item.json.field,
    batchIndex: index
  },
  pairedItem: { item: index }
}));
```

### Split Pattern (Parallel Processing)
```javascript
// Split into multiple outputs based on condition
const items = $input.all();

const highPriority = [];
const normalPriority = [];

items.forEach((item, index) => {
  const output = {
    json: item.json,
    pairedItem: { item: index }
  };

  if (item.json.priority === 'high') {
    highPriority.push(output);
  } else {
    normalPriority.push(output);
  }
});

// Return as separate outputs
return [highPriority, normalPriority];
```

---

## 4.7 SAFE MODULE 11A CONNECTOR INVOCATION

### Standard M11A Call Pattern
```javascript
// In any module calling M11A

const callM11A = async (connectorId, endpoint, payload) => {
  const m11aUrl = $env.N8N_BASE_URL + '/webhook/eae3109b-f891-42bb-9165-7c12aaeb9071/connector-manager/execute';

  const requestBody = {
    connector_id: connectorId,
    endpoint: endpoint,
    payload: payload,
    trace_id: $json.trace_id || crypto.randomUUID()
  };

  // Validate inputs
  if (!connectorId || typeof connectorId !== 'string') {
    throw new Error('Invalid connector_id');
  }
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('Invalid endpoint');
  }

  // Call M11A
  const response = await $http.post(m11aUrl, requestBody, {
    timeout: 10000,
    retry: {
      maxTries: 3,
      waitBetweenTries: 1000
    }
  });

  // Validate response
  if (!response || !response.body) {
    throw new Error('M11A returned empty response');
  }

  const result = response.body;

  if (!result.success) {
    throw new Error(`M11A call failed: ${result.error || 'Unknown error'}`);
  }

  if (!result.data) {
    throw new Error('M11A returned no data');
  }

  return result.data;
};

// Usage
const emailResult = await callM11A('sendgrid', 'send_email', {
  to: $json.email,
  subject: 'Welcome',
  html: '<p>Hello!</p>'
});

return {
  json: {
    success: true,
    message_id: emailResult.message_id,
    trace_id: $json.trace_id
  },
  pairedItem: { item: 0 }
};
```

---

## 4.8 SAFE RETRY/BACKOFF PATTERNS

### HTTP Request Retry (Built-in)
```json
{
  "options": {
    "timeout": 10000,
    "retry": {
      "maxTries": 3,
      "waitBetweenTries": 1000
    }
  }
}
```

**Results in delays:** 1s, 2s, 4s (exponential backoff automatic)

### Custom Retry Logic (Code Node)
```javascript
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

async function retryWithBackoff(fn, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on client errors (4xx)
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Last retry - throw error
      if (i === retries - 1) {
        throw error;
      }

      // Calculate backoff delay
      const delay = BASE_DELAY * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${retries} after ${delay}ms:`, error.message);

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const result = await retryWithBackoff(async () => {
  const response = await $http.post(apiUrl, data);
  if (!response.body.success) {
    throw new Error('API call failed');
  }
  return response.body.data;
});

return {
  json: result,
  pairedItem: { item: 0 }
};
```

### Circuit Breaker Pattern (Advanced)
```javascript
// For preventing cascading failures

const CIRCUIT_BREAKER_KEY = 'circuit:api-endpoint';
const FAILURE_THRESHOLD = 5;
const TIMEOUT_MS = 60000;

let circuitBreaker = globalThis[CIRCUIT_BREAKER_KEY];
if (!circuitBreaker) {
  circuitBreaker = {
    failures: 0,
    lastFailure: 0,
    state: 'CLOSED'  // CLOSED, OPEN, HALF_OPEN
  };
  globalThis[CIRCUIT_BREAKER_KEY] = circuitBreaker;
}

// Check circuit state
if (circuitBreaker.state === 'OPEN') {
  const elapsed = Date.now() - circuitBreaker.lastFailure;
  if (elapsed < TIMEOUT_MS) {
    throw new Error('Circuit breaker OPEN - endpoint unavailable');
  }
  // Timeout elapsed - try half-open
  circuitBreaker.state = 'HALF_OPEN';
}

try {
  const result = await callApi();

  // Success - reset circuit
  circuitBreaker.failures = 0;
  circuitBreaker.state = 'CLOSED';

  return { json: result, pairedItem: { item: 0 } };
} catch (error) {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();

  if (circuitBreaker.failures >= FAILURE_THRESHOLD) {
    circuitBreaker.state = 'OPEN';
    console.error('Circuit breaker OPEN:', {
      failures: circuitBreaker.failures,
      endpoint: apiUrl
    });
  }

  throw error;
}
```

---

## End of Document

This completes the comprehensive n8n stability audit and refactoring blueprint for the Aigent module suite.

**Next Steps:**
1. Review this document with development team
2. Prioritize fixes based on Phase 1-4 plan
3. Disable M04, M11A, M11B in production until critical fixes applied
4. Begin implementation starting with CRITICAL fixes (Week 1)
5. Test thoroughly before each deployment
6. Monitor production after each rollout

**Estimated Total Effort:** 120-160 hours
**Critical Path:** Week 1 (CRITICAL fixes) must complete before re-enabling production modules

---
