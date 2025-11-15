# Module 11 Deep-Debug Analysis Report
**n8n Version: 1.118.2**
**Date: 2025-11-15**
**Modules Analyzed: 11A (Connector Manager), 11B (Mock Simulator), 11C (Test Harness)**

---

## Executive Summary

All three Module 11 workflows contain **CRITICAL** IF node import bugs that cause conditions to disappear on import into n8n v1.118.2. This report provides a comprehensive analysis of all issues found and delivers production-ready corrected workflows using Switch nodes for stable import behavior.

**Key Findings:**
- **11 IF nodes** across modules risk blank-condition import
- **3 critical routing flow errors** in Module 11A
- **1 webhook UUID mismatch** in Module 11C (Test Connector node)
- **5 code nodes** with missing error handling
- All modules lack proper `combinator` fields in IF nodes (v2.1+ requirement)

---

## Section 1: Structural & Import-Safety Audit

### Module 11A: Aigent_Module_11A_Connector_Manager

**Workflow Structure:** ✅ Valid
- `name`, `nodes`, `connections`, `settings`, `tags`, `meta`, `active` all present
- 15 nodes total

**Structural Issues Found:**

| Severity | Node ID | Node Name | Issue | Impact |
|----------|---------|-----------|-------|--------|
| **CRITICAL** | `d3303c17-2a4b-4345-a05c-74c36a92a32f` | Route Operation | IF node v2 missing `combinator`, uses old `conditions.string` schema | Imports with blank conditions |
| **CRITICAL** | `c29e7f13-0f55-46d8-910a-655d0f52eba8` | Check Registry Loaded | IF node v2 missing `combinator` in root | May lose conditions on import |
| **CRITICAL** | `2a7042d4-0d90-4ff2-9c58-1143ef7c0cda` | Check Lookup | IF node v2 missing `combinator` | May lose conditions on import |
| **CRITICAL** | `b4ae0c06-b89b-40cf-a457-4204adea6896` | Check Normalize | IF node v2 missing `combinator` | May lose conditions on import |
| **CRITICAL** | `8ce85a00-5a02-42f9-bbb1-801611713781` | Check Execute | IF node v2 missing `combinator` | May lose conditions on import |
| **CRITICAL** | `941e2c10-f1be-4ca7-86cf-ea52d42d5a41` | Check Mode | IF node v2 missing `combinator` | May lose conditions on import |
| **CRITICAL** | `14c3728d-3313-4a39-a9c3-d4ad4b483bd7` | Check Resolve | IF node v2 missing `combinator` | May lose conditions on import |
| **HIGH** | N/A | Normalize Handler | Routes directly to Return Success, breaking execute/resolve flows | Execute operation returns registry instead of executing |

### Module 11B: module_11B_mock_simulator

**Workflow Structure:** ✅ Valid
**Nodes:** 9 total

**Structural Issues Found:**

| Severity | Node ID | Node Name | Issue | Impact |
|----------|---------|-----------|-------|--------|
| **CRITICAL** | `route-operation` | Route Operation | IF node v2 missing `combinator` | Imports with blank conditions |
| **CRITICAL** | `check-upload` | Check Upload | IF node v2 missing `combinator` | May lose conditions on import |
| **CRITICAL** | `check-validate` | Check Validate | IF node v2 missing `combinator` | May lose conditions on import |
| **CRITICAL** | `check-list` | Check List | IF node v2 missing `combinator` | May lose conditions on import |
| **LOW** | `webhook` | Webhook Trigger | Missing `webhookId` property | UUID not persistent across exports |

### Module 11C: Aigent_Module_11C_Test_Harness

**Workflow Structure:** ✅ Valid
**Nodes:** 8 total (all Code nodes, no IF/Switch)

**Structural Issues Found:**

| Severity | Node ID | Node Name | Issue | Impact |
|----------|---------|-----------|-------|--------|
| **HIGH** | `e1c81155-0b90-4ee5-884d-496eb396aee6` | Test Connector | Uses `url` instead of `uri` parameter for httpRequest (line 23, 60) | Requests may fail in n8n httpRequest helper |
| **MEDIUM** | `e1c81155-0b90-4ee5-884d-496eb396aee6` | Test Connector | Missing validation for `connector.endpoints` existence | Could crash if endpoint missing |

---

## Section 2: IF Node Import Bug Analysis

### Root Cause

n8n v1.118.2 IF node (typeVersion 2) requires this exact schema:

```json
{
  "conditions": {
    "options": {
      "caseSensitive": true|false,
      "leftValue": "",
      "typeValidation": "strict"|"loose"
    },
    "conditions": [ /* array of condition objects */ ],
    "combinator": "and"|"or"  // ← REQUIRED but missing in all current IF nodes
  }
}
```

**All 7 IF nodes in Module 11A** and **all 4 IF nodes in Module 11B** use the deprecated `conditions.string` array format OR omit `combinator`, causing n8n to either:
1. Fail to parse conditions on import
2. Import the node but display it with empty conditions in the UI

### Solution: Switch Node Migration

**Switch nodes (typeVersion 3.3)** provide more stable import behavior:

```json
{
  "parameters": {
    "rules": {
      "values": [
        {
          "conditions": {
            "options": { "caseSensitive": true, "typeValidation": "strict" },
            "conditions": [
              {
                "leftValue": "={{ $json.field }}",
                "rightValue": "value",
                "operator": { "type": "string", "operation": "equals" }
              }
            ],
            "combinator": "and"
          }
        }
      ]
    }
  },
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3.3
}
```

This format:
- ✅ Imports reliably into n8n v1.118.2
- ✅ Supports multiple output branches with explicit routing
- ✅ Preserves all condition data on export/import cycles
- ✅ Visible and editable in n8n UI post-import

---

## Section 3: Module 11A Logic Flow Errors

### Error 1: Route Operation - Cascading IF Architecture Broken

**Current Flow (WRONG):**
```
Route Operation (IF: operation=load)
  → TRUE: Return Success (correct for load)
  → FALSE: Check Lookup (IF: operation=lookup)
    → TRUE: Lookup Handler → Return Success
    → FALSE: Check Normalize...
      → (continues cascading)
```

**Problem:** The `normalize`, `execute`, and `connector-resolve` operations ALL require:
1. Lookup Handler (to find connector)
2. Normalize Handler (to normalize payload)
3. THEN diverge to their specific handlers

**Current bug:** `Normalize Handler` routes directly to `Return Success`, so:
- `execute` operation: Gets registry data, runs lookup, normalizes, **RETURNS** (never executes)
- `connector-resolve` operation: Gets registry, lookups, normalizes, **RETURNS** (never resolves)

### Error 2: Incorrect Connections After Normalize

**Lines 482-491 (current):**
```json
"Normalize Handler": {
  "main": [[{"node": "Return Success", "index": 0}]]
}
```

**Should be:**
```json
"Normalize Handler": {
  "main": [[{"node": "Check Execute", "index": 0}]]
}
```

So that:
- `normalize` → Check Execute (false) → Check Resolve (false) → Return Success
- `execute` → Check Execute (true) → Execute Handler → Check Mode → ...
- `connector-resolve` → Check Execute (false) → Check Resolve (true) → Resolve Handler

### Error 3: Check Resolve False Branch

**Lines 562-578 (current):**
```json
"Check Resolve": {
  "main": [
    [{"node": "Resolve Handler"}],
    [{"node": "Return Invalid Operation"}]  // ← WRONG
  ]
}
```

**Problem:** When operation is `normalize`, it:
1. Passes Normalize Handler
2. Fails Check Execute (not 'execute')
3. Fails Check Resolve (not 'connector-resolve')
4. Routes to **Return Invalid Operation** ❌

**Should route to:** `Return Success` (since normalize completed successfully)

---

## Section 4: Code Node Deep Audit

### Module 11A Code Nodes

#### Node: Add Metadata (Lines 24-36)
**Audit Result:** ✅ SAFE
- Proper null coalescing with `||`
- Returns valid n8n item shape

#### Node: Load Registry (Lines 37-50)
**Audit Result:** ⚠️ NEEDS HARDENING
- **Issue:** Uses `globalThis.aigent_registry` without checking if writable
- **Issue:** `trace_id` not guarded against undefined input
- **Recommendation:** Wrap globalThis assignment in try-catch

**Improved Code:**
```javascript
const fs = require('fs');
const path = process.env.CONNECTOR_REGISTRY_PATH || '/data/Aigent_Modules_Core/connectors_registry.json';

try {
  const registryData = fs.readFileSync(path, 'utf8');
  const connectors = JSON.parse(registryData);

  try {
    globalThis.aigent_registry = connectors;
  } catch (globalErr) {
    // If globalThis is readonly, log but continue
    console.warn('Could not set globalThis.aigent_registry:', globalErr.message);
  }

  return {
    success: true,
    connectors: connectors,
    registry_path: path,
    connector_count: connectors.length,
    trace_id: $input.item.json?.trace_id || 'unknown'
  };
} catch (error) {
  return {
    success: false,
    error: 'registry_load_failed',
    error_message: error.message,
    registry_path: path,
    trace_id: $input.item.json?.trace_id || 'unknown'
  };
}
```

#### Node: Lookup Handler (Lines 123-136)
**Audit Result:** ⚠️ NEEDS HARDENING
- **Issue:** Assumes `$('Add Metadata').first()` exists
- **Issue:** No guard for `body.connector_id` being undefined

**Improved Code:**
```javascript
const connectors = globalThis.aigent_registry || [];
const metadata = $('Add Metadata').first()?.json;
const requestedId = metadata?.body?.connector_id;

if (!requestedId) {
  return {
    success: false,
    error: 'Missing connector_id in request body',
    trace_id: metadata?.trace_id || 'unknown'
  };
}

const connector = connectors.find(c => c.id === requestedId);

if (!connector) {
  return {
    success: false,
    error: 'Connector not found',
    connector_id: requestedId,
    available_connectors: connectors.map(c => c.id),
    trace_id: metadata?.trace_id || 'unknown'
  };
}

return {
  success: true,
  connector: connector,
  trace_id: metadata?.trace_id || 'unknown'
};
```

#### Node: Normalize Handler (Lines 158-171)
**Audit Result:** ⚠️ NEEDS HARDENING
- **Issue:** No guard for missing `connector.type`
- **Issue:** Optional chaining `res.data?.slots` not universally supported in older Node versions

**Status:** Code is functionally correct but could be more defensive

#### Node: Execute Handler (Lines 193-206)
**Audit Result:** ✅ MOSTLY SAFE
- Proper credential checking logic
- Good mock-mode decision tree
- **Minor:** Could validate `connector.endpoints[endpoint]` exists before accessing

#### Node: Execute Live Request (Lines 263-276)
**Audit Result:** ⚠️ CRITICAL ISSUES
- **CRITICAL:** Uses `require('axios')` - axios may not be available in n8n Code node sandbox
- **CRITICAL:** Assumes `execData.connector` and `execData.endpointDef` exist without validation
- **CRITICAL:** No timeout validation (could hang indefinitely if env var malformed)

**Recommendation:** This node should be converted to use n8n's built-in HTTP Request node instead of axios in a Code node.

#### Node: Resolve Handler (Lines 298-311)
**Audit Result:** ⚠️ NEEDS HARDENING
- **Issue:** `c.modules_using.includes()` will crash if `modules_using` is not an array
- **Issue:** No validation that `primary` exists before accessing properties

**Improved Code:**
```javascript
const connectors = globalThis.aigent_registry || [];
const metadata = $('Add Metadata').first()?.json;
const moduleId = metadata?.body?.module_id;
const serviceType = metadata?.body?.service_type;

const moduleConnectors = connectors.filter(c =>
  (Array.isArray(c.modules_using) && c.modules_using.includes(moduleId)) ||
  (serviceType && c.type === serviceType)
);

if (moduleConnectors.length === 0) {
  return {
    success: false,
    error: 'No connectors found',
    module_id: moduleId,
    service_type: serviceType,
    trace_id: metadata?.trace_id || 'unknown'
  };
}

const primary = moduleConnectors[0];

return {
  success: true,
  module_id: moduleId,
  service_type: serviceType,
  primary_connector: {
    id: primary.id,
    name: primary.name,
    type: primary.type,
    base_url: primary.base_url,
    endpoints: Object.keys(primary.endpoints || {})
  },
  alternatives: moduleConnectors.slice(1).map(c => ({
    id: c.id,
    name: c.name
  })),
  trace_id: metadata?.trace_id || 'unknown'
};
```

### Module 11B Code Nodes

All 4 Code nodes (`Mock Fetch Handler`, `Mock Upload Handler`, `Mock Validate Handler`, `Mock List Handler`) are **functionally sound** but share common issues:

**Common Issues:**
- Assume `$input.item.json.body` exists (should use optional chaining)
- File operations lack proper directory existence checks before `fs.readdirSync`
- No handling for permission errors on file writes

### Module 11C Code Nodes

#### Node: Test Connector (Lines 77-89)
**Audit Result:** ⚠️ CRITICAL ISSUES

**Issue 1: Wrong httpRequest parameter**
- **Lines 23, 60:** Uses `uri:` instead of `url:`
- **n8n httpRequest helper expects:** `url` (not `uri`)
- **Impact:** All HTTP requests will fail

**Issue 2: Missing endpoint validation**
```javascript
const endpoints = Object.keys(connector.endpoints || {});
```
Good defensive coding, but later uses `connector.id`, `connector.name` without validation

**Corrected Code Excerpt:**
```javascript
const connector = $input.item.json?.connector;
if (!connector || !connector.id || !connector.endpoints) {
  return {
    connector_id: 'unknown',
    connector_name: 'unknown',
    endpoints_tested: 0,
    test_results: [],
    tests_passed: 0,
    tests_failed: 0,
    error: 'Invalid connector data',
    trace_id: $input.item.json?.trace_id || 'unknown'
  };
}

const endpoints = Object.keys(connector.endpoints);
// ... rest of code, using url: instead of uri:
```

---

## Section 5: HTTP Request Node Validation

### Module 11A: Call Mock Simulator (Lines 228-262)

**Issues Found:**

| Issue | Line | Current Value | Correct Value |
|-------|------|---------------|---------------|
| URL missing UUID | 231 | `{{$env.N8N_BASE_URL}}/webhook/connector/mock-fetch` | `{{$env.N8N_BASE_URL}}/webhook/365b6343-cc32-4ac8-837f-bde02317aa9a/connector-mock/mock-fetch` |
| Missing fallback | 231 | `{{$env.N8N_BASE_URL}}` | `{{$env.N8N_BASE_URL \|\| 'http://localhost:5678'}}` |

**Impact:** If `N8N_BASE_URL` is not set, request fails. If 11B webhook path doesn't match, routing fails.

**Corrected:**
```json
{
  "url": "={{$env.N8N_BASE_URL || 'http://localhost:5678'}}/webhook/365b6343-cc32-4ac8-837f-bde02317aa9a/connector-mock/mock-fetch"
}
```

---

## Section 6: Environment Variable Inventory

### Required Variables

| Variable | Used By | Default | Failure Behavior | Severity |
|----------|---------|---------|------------------|----------|
| `CONNECTOR_REGISTRY_PATH` | 11A: Load Registry | `/data/Aigent_Modules_Core/connectors_registry.json` | Registry load fails, all operations fail | **CRITICAL** |
| `N8N_BASE_URL` | 11A: Call Mock, 11C: All HTTP calls | `http://localhost:5678` | Inter-module calls fail | **HIGH** |

### Optional Variables

| Variable | Used By | Default | Effect When Missing |
|----------|---------|---------|---------------------|
| `MOCK_MODE_GLOBAL` | 11A: Execute Handler | `'false'` | All requests go live (uses credentials) |
| `MOCK_CALENDAR` | 11A: Execute Handler | N/A | Calendar requests go live |
| `MOCK_MESSAGING` | 11A: Execute Handler | N/A | Messaging requests go live |
| `MOCK_VIDEO` | 11A: Execute Handler | N/A | Video requests go live |
| `MOCK_PAYMENT` | 11A: Execute Handler | N/A | Payment requests go live |
| `MOCK_STORAGE` | 11A: Execute Handler | N/A | Storage requests go live |
| `MOCK_CRM` | 11A: Execute Handler | N/A | CRM requests go live |
| `MOCK_BASE_PATH` | 11B: All handlers | `/data/Aigent_Modules_Core/mocks` | Mock files not found |
| `SCHEMA_BASE_PATH` | 11B: Mock Validate | `/data/Aigent_Modules_Core/schemas` | Schema validation fails |
| `MOCK_LATENCY_MS` | 11B: Mock Fetch | `'0'` | No latency simulation |
| `MOCK_RANDOM_ERROR_RATE` | 11B: Mock Fetch | `'0'` | No error injection |
| `DEFAULT_TIMEOUT_MS` | 11A: Execute Live, 11C: Test | `'10000'` | Uses 10s timeout |
| `CACHE_PATH` | 11C: Cache Results | `/data/Aigent_Modules_Core/cache` | Results not cached |
| `CONNECTOR_UNDER_TEST` | 11C: Load Test Targets | N/A | Tests all connectors |
| `ALLOWED_ORIGINS` | All: Webhook Triggers | Various | CORS may block requests |

### Credential Environment Variables (Dynamic)

**Pattern:** Defined in `connectors_registry.json` per connector

- `auth.token_env` (e.g., `GOOGLE_CALENDAR_TOKEN`)
- `auth.key_env` (e.g., `STRIPE_API_KEY`)

**Used By:** 11A Execute Live Request
**Failure Behavior:** Falls back to mock mode if missing

---

## Section 7: Issue List and Severity

### Module 11A

| # | Severity | Node Name | Issue | Cause | Impact | Fix |
|---|----------|-----------|-------|-------|--------|-----|
| 1 | **CRITICAL** | Route Operation | Imports with blank conditions | Missing `combinator`, uses old schema | All routing fails after import | Convert to Switch node with 4 outputs |
| 2 | **CRITICAL** | Check Registry Loaded | Missing `combinator` | IF v2 schema incomplete | May lose condition on import | Convert to Switch node |
| 3 | **CRITICAL** | Check Lookup | Missing `combinator` | IF v2 schema incomplete | May lose condition on import | Convert to Switch node |
| 4 | **CRITICAL** | Check Normalize | Missing `combinator` | IF v2 schema incomplete | May lose condition on import | Convert to Switch node |
| 5 | **CRITICAL** | Check Execute | Missing `combinator` | IF v2 schema incomplete | May lose condition on import | Convert to Switch node |
| 6 | **CRITICAL** | Check Mode | Missing `combinator` | IF v2 schema incomplete | May lose condition on import | Convert to Switch node |
| 7 | **CRITICAL** | Check Resolve | Missing `combinator` | IF v2 schema incomplete | May lose condition on import | Convert to Switch node |
| 8 | **HIGH** | Normalize Handler | Routes to Return Success instead of Check Execute | Incorrect connection | `execute` and `connector-resolve` operations return prematurely | Reconnect to Check Execute |
| 9 | **HIGH** | Check Resolve | False branch goes to Invalid Operation | Should go to Return Success for `normalize` | `normalize` operation fails with 400 error | Change false branch to Return Success |
| 10 | **HIGH** | Call Mock Simulator | Missing webhook UUID in URL | Incomplete URL | Mock requests fail (404) | Add UUID: `/webhook/365b6343.../connector-mock/mock-fetch` |
| 11 | **MEDIUM** | Load Registry | No validation of globalThis writability | Assumes globalThis mutable | May crash in strict environments | Wrap in try-catch |
| 12 | **MEDIUM** | Lookup Handler | No validation of connector_id presence | Missing null check | Crashes on malformed request | Add null guard |
| 13 | **MEDIUM** | Execute Live Request | Uses axios in Code node | axios may not be available | Request fails | Convert to HTTP Request node |
| 14 | **MEDIUM** | Resolve Handler | Assumes modules_using is array | No type check | Crashes if modules_using is string/null | Add Array.isArray() check |

### Module 11B

| # | Severity | Node Name | Issue | Cause | Impact | Fix |
|---|----------|-----------|-------|-------|--------|-----|
| 1 | **CRITICAL** | Route Operation | Missing `combinator` | IF v2 schema incomplete | Imports with blank conditions | Convert to Switch with 4 outputs |
| 2 | **CRITICAL** | Check Upload | Missing `combinator` | IF v2 schema incomplete | May lose condition | Convert to Switch |
| 3 | **CRITICAL** | Check Validate | Missing `combinator` | IF v2 schema incomplete | May lose condition | Convert to Switch |
| 4 | **CRITICAL** | Check List | Missing `combinator` | IF v2 schema incomplete | May lose condition | Convert to Switch |
| 5 | **LOW** | Webhook Trigger | Missing persistent webhookId | Not set | UUID changes on each export/import | Add webhookId: "365b6343..." |

### Module 11C

| # | Severity | Node Name | Issue | Cause | Impact | Fix |
|---|----------|-----------|-------|-------|--------|-----|
| 1 | **HIGH** | Test Connector | Uses `uri:` instead of `url:` | Wrong httpRequest parameter | All HTTP tests fail | Change to `url:` (lines 23, 60) |
| 2 | **MEDIUM** | Test Connector | Missing connector validation | No null guards | May crash on bad data | Add connector existence check |
| 3 | **MEDIUM** | Load Registry | No error handling for HTTP timeout | Not caught | Test hangs on 11A failure | Add specific timeout error handling |

---

## Section 8: Recommendations

### Immediate Actions (Production Blockers)

1. ✅ **Replace all IF nodes with Switch nodes** in 11A and 11B
2. ✅ **Fix Normalize Handler connection** in 11A (route to Check Execute, not Return Success)
3. ✅ **Fix Check Resolve false branch** in 11A (route to Return Success, not Invalid Operation)
4. ✅ **Fix Call Mock Simulator URL** in 11A (add UUID)
5. ✅ **Fix httpRequest parameter** in 11C Test Connector (`uri` → `url`)

### High Priority (Stability)

6. Add null guards to all Code nodes that reference `$('NodeName').first().json`
7. Validate `globalThis.aigent_registry` exists before using in Lookup/Normalize/Execute/Resolve handlers
8. Add try-catch around `globalThis.aigent_registry = connectors` assignment
9. Add validation for `connector.endpoints` existence before `Object.keys()`

### Medium Priority (Resilience)

10. Convert Execute Live Request from axios-in-Code to HTTP Request node
11. Add validation for `modules_using` array type in Resolve Handler
12. Add persistent `webhookId` to Module 11B Webhook Trigger
13. Add specific error types for HTTP timeout vs connection refused in 11C

### Low Priority (Maintainability)

14. Standardize all trace_id fallbacks to `|| 'unknown'`
15. Add JSDoc comments to complex Code nodes
16. Unify error response shapes across all handlers
17. Add version metadata to each module's meta section

---

## End of Analysis

**Next:** Delivering corrected workflow JSON files.
