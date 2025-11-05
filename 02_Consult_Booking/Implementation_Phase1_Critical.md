# Phase 1: Critical Security & Reliability Fixes

**Priority:** 🔴 CRITICAL - IMMEDIATE ATTENTION REQUIRED
**Estimated Time:** 8-12 hours
**Target Completion:** Week 1

---

## Overview

Phase 1 addresses the 3 most critical issues that pose immediate security risks, data loss potential, or prevent international deployment.

### Tasks in This Phase
1. **Task 1.1:** Add Webhook Authentication
2. **Task 1.2:** Fix Cache Fallback Persistence
3. **Task 1.3:** Implement International Phone Normalization

---

## Task 1.1: Add Webhook Authentication

### Objective
Protect the webhook endpoint with API key authentication to prevent unauthorized access, spam attacks, and resource exhaustion.

### Current State
- **File:** `Aigent_Module_02_Consult_Booking_v1.4.1_fixedlinks.json`
- **Node ID:** `webhook-trigger`
- **Lines:** ~12-26
- **Issue:** Webhook is publicly accessible without authentication

### Security Risk
- **Severity:** CRITICAL
- **Impact:** Malicious actors can spam fake bookings, exhaust resources, pollute CRM/calendar
- **CVSS Score:** 7.5 (High)

---

### Implementation Steps

#### Step 1: Read Current Webhook Node

```bash
# Use Serena MCP or read manually
# Locate the webhook-trigger node in the JSON
```

Current configuration:
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "consult-booking",
    "responseMode": "responseNode",
    "options": {
      "allowedOrigins": "={{$vars.ALLOWED_ORIGINS}}"
    }
  },
  "id": "webhook-trigger",
  "name": "Webhook: Booking Request",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1.1,
  "position": [400, 300],
  "notes": "ENTRY POINT: Accepts booking requests\nENTERPRISE: Enhanced security headers\nSECURITY: No wildcard default - ALLOWED_ORIGINS must be set\nv1.4.1: Fixed error linkages"
}
```

#### Step 2: Add Authentication

Modify the webhook node to include authentication:

```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "consult-booking",
    "responseMode": "responseNode",
    "authentication": "headerAuth",
    "options": {
      "allowedOrigins": "={{$vars.ALLOWED_ORIGINS}}"
    }
  },
  "id": "webhook-trigger",
  "name": "Webhook: Booking Request",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1.1,
  "position": [400, 300],
  "notes": "ENTRY POINT: Accepts booking requests\nSECURITY: API Key authentication required (X-API-Key header)\nENTERPRISE: Enhanced security headers\nv1.5.0: Added webhook authentication\nSECURITY: No wildcard default - ALLOWED_ORIGINS must be set"
}
```

**Key Changes:**
- Added `"authentication": "headerAuth"`
- Updated notes to mention v1.5.0 and authentication requirement

#### Step 3: Configure Header Auth Credential

In n8n UI, you'll need to create a Header Auth credential:
- **Credential Type:** Header Auth
- **Header Name:** `X-API-Key`
- **Header Value:** `={{$vars.BOOKING_WEBHOOK_API_KEY}}`

**In the JSON, reference this credential:**
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "consult-booking",
    "responseMode": "responseNode",
    "authentication": "headerAuth",
    "options": {
      "allowedOrigins": "={{$vars.ALLOWED_ORIGINS}}"
    }
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "{{CREDENTIAL_ID}}",
      "name": "Booking Webhook Auth"
    }
  },
  ...
}
```

**Note:** The exact credential ID will be assigned by n8n when you create the credential. You may need to import the workflow, create the credential, and then the workflow will automatically link it.

#### Step 4: Update Environment Variables

Add to your environment configuration:

```bash
# n8n environment variables
BOOKING_WEBHOOK_API_KEY=your-secure-random-api-key-here

# Generate secure key (32+ characters):
# Option 1: Using openssl
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Step 5: Update Documentation

Add to `Aigent_Module_02_README.md` in the "Configuration" section:

```markdown
### Webhook Security (v1.5.0)

All webhook requests must include authentication:

**Example with authentication:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key-here" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+1-555-123-4567",
    "service_type": "General Consultation"
  }'
```

**Configuration:**
1. Generate a secure API key (32+ characters)
2. Set environment variable: `BOOKING_WEBHOOK_API_KEY=your-key-here`
3. Create Header Auth credential in n8n with name "Booking Webhook Auth"
4. Distribute API key to authorized clients only
5. Rotate key every 90 days

**Security Best Practices:**
- Never commit API keys to git
- Use different keys for dev/staging/production
- Monitor failed authentication attempts
- Implement key rotation policy
- Use environment variable injection (not hardcoded)
```

---

### Testing

#### Test 1: Request Without API Key
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "5551234567",
    "service_type": "Test"
  }'
```

**Expected Response:**
- **Status Code:** 401 Unauthorized or 403 Forbidden
- **Body:** Authentication error message

#### Test 2: Request With Invalid API Key
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wrong-key" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "5551234567",
    "service_type": "Test"
  }'
```

**Expected Response:**
- **Status Code:** 401 Unauthorized or 403 Forbidden
- **Body:** Authentication error message

#### Test 3: Request With Valid API Key
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-actual-secret-key" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+15551234567",
    "service_type": "Test Consultation"
  }'
```

**Expected Response:**
- **Status Code:** 200 OK (if data valid) or 400 Bad Request (if validation fails)
- **Body:** Success response or validation error details

---

### Rollback Plan

If authentication causes issues:

1. **Remove authentication parameter:**
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "consult-booking",
    "responseMode": "responseNode",
    // Remove: "authentication": "headerAuth",
    "options": {
      "allowedOrigins": "={{$vars.ALLOWED_ORIGINS}}"
    }
  }
}
```

2. **Remove credentials block** (if present)
3. **Notify clients** authentication is temporarily disabled
4. **Investigate issue** and re-implement with fix

---

## Task 1.2: Fix Cache Fallback Persistence

### Objective
Replace ephemeral `$vars` with persistent `$workflow.staticData` to ensure rate limiting, idempotency, and duplicate detection survive n8n restarts.

### Current State
- **Affected Nodes:**
  - Process Rate Limit Response (CODE NODE 1/11)
  - Process Idempotency Response (CODE NODE 2/11)
  - Process Duplicate Check (CODE NODE 6/11)
  - Cache Idempotency Response (CODE NODE 9/11)
- **Lines:** ~74-83, ~126-134, ~388-396, ~700-707

### Reliability Risk
- **Severity:** CRITICAL
- **Impact:** Data loss on restart, broken idempotency guarantees, rate limit bypass
- **Consequence:** Duplicate bookings, spam attacks after restart

---

### Implementation Steps

#### Step 1: Update Process Rate Limit Response (CODE NODE 1/11)

**Location:** Find the node with `"id": "rate-limit-processor"` or `"name": "Process Rate Limit Response"`

**Find this code:**
```javascript
const rateLimits = $vars.rate_limits || {};
// ... processing logic ...
$vars.rate_limits = rateLimits;
```

**Replace with:**
```javascript
const rateLimits = $workflow.staticData.rate_limits || {};
// ... processing logic ...
$workflow.staticData.rate_limits = rateLimits;
```

**Full Updated Code for Node:**
```javascript
// ENTERPRISE: Rate limit with PERSISTENT fallback
const apiResponse = $input.first().json;
const clientIP = $('Webhook: Booking Request').first().json.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';

// Check if API call succeeded
if (apiResponse.allowed !== undefined) {
  if (!apiResponse.allowed) {
    throw new Error(JSON.stringify({
      error: 'RATE_LIMIT_EXCEEDED',
      retry_after: apiResponse.retry_after || 60,
      message: 'Too many requests'
    }));
  }
  return { ...$('Webhook: Booking Request').first().json, client_ip: clientIP, rate_check: 'api' };
}

// FALLBACK: Use PERSISTENT $workflow.staticData
console.warn('Rate limit API unavailable, using persistent fallback');
const rateLimits = $workflow.staticData.rate_limits || {};
const now = Date.now();
const windowMs = 60000;
const maxRequests = parseInt($vars.RATE_LIMIT_MAX) || 10;

// Clean old entries
Object.keys(rateLimits).forEach(ip => {
  if (now - (rateLimits[ip]?.windowStart || 0) > windowMs * 2) delete rateLimits[ip];
});

if (!rateLimits[clientIP]) {
  rateLimits[clientIP] = { count: 1, windowStart: now };
} else if (now - rateLimits[clientIP].windowStart < windowMs) {
  if (++rateLimits[clientIP].count > maxRequests) {
    $workflow.staticData.rate_limits = rateLimits;
    throw new Error(JSON.stringify({
      error: 'RATE_LIMIT_EXCEEDED',
      retry_after: Math.ceil((windowMs - (now - rateLimits[clientIP].windowStart)) / 1000)
    }));
  }
} else {
  rateLimits[clientIP] = { count: 1, windowStart: now };
}

$workflow.staticData.rate_limits = rateLimits;
return { ...$('Webhook: Booking Request').first().json, client_ip: clientIP, rate_check: 'fallback' };
```

**Update node notes:**
```
"notes": "CODE NODE 1/11: Rate limit processor with PERSISTENT fallback\nENTERPRISE: Graceful degradation\nAPI SUCCESS: Uses external cache response\nAPI FAILURE: Falls back to $workflow.staticData (survives restarts)\nLOGS: Warning when fallback is used\nv1.5.0: Persistent cache fallback"
```

#### Step 2: Update Process Idempotency Response (CODE NODE 2/11)

**Location:** Find the node with `"id": "idempotency-processor"` or `"name": "Process Idempotency Response"`

**Find and replace:**
```javascript
// OLD:
const cache = $vars.idempotency_cache || {};
$vars.idempotency_cache = cache;

// NEW:
const cache = $workflow.staticData.idempotency_cache || {};
$workflow.staticData.idempotency_cache = cache;
```

**Full Updated Code:**
```javascript
// ENTERPRISE: Idempotency with PERSISTENT fallback
const apiResponse = $input.first().json;
const headers = $('Webhook: Booking Request').first().json.headers || {};
const idempotencyKey = headers['idempotency-key'] || headers['Idempotency-Key'];

if (!idempotencyKey) {
  return { ...$('Process Rate Limit Response').first().json, idempotency_key: null, is_cached: false };
}

// Check if API call succeeded
if (apiResponse.duplicate !== undefined) {
  if (apiResponse.duplicate && apiResponse.cached_response) {
    throw new Error(JSON.stringify({ is_duplicate: true, cached_response: apiResponse.cached_response }));
  }
  return { ...$('Process Rate Limit Response').first().json, idempotency_key: idempotencyKey, is_cached: false, cache_check: 'api' };
}

// FALLBACK: Use PERSISTENT $workflow.staticData
console.warn('Idempotency API unavailable, using persistent fallback');
const cache = $workflow.staticData.idempotency_cache || {};
const now = Date.now();

// Clean old entries (24 hour TTL)
Object.keys(cache).forEach(key => {
  if (now - cache[key].timestamp > 86400000) delete cache[key];
});

if (cache[idempotencyKey]) {
  throw new Error(JSON.stringify({ is_duplicate: true, cached_response: cache[idempotencyKey].response }));
}

$workflow.staticData.idempotency_cache = cache;
return { ...$('Process Rate Limit Response').first().json, idempotency_key: idempotencyKey, is_cached: false, cache_check: 'fallback' };
```

**Update node notes:**
```
"notes": "CODE NODE 2/11: Idempotency processor with PERSISTENT fallback\nENTERPRISE: Graceful degradation\nAPI SUCCESS: Uses external cache response\nAPI FAILURE: Falls back to $workflow.staticData (survives restarts)\nLOGS: Warning when fallback is used\nv1.5.0: Persistent cache fallback"
```

#### Step 3: Update Process Duplicate Check (CODE NODE 6/11)

**Location:** Find the node with `"id": "duplicate-processor"` or `"name": "Process Duplicate Check"`

**Find and replace:**
```javascript
// OLD:
const duplicates = $vars.recent_bookings || {};
$vars.recent_bookings = duplicates;

// NEW:
const duplicates = $workflow.staticData.recent_bookings || {};
$workflow.staticData.recent_bookings = duplicates;
```

**Full Updated Code:**
```javascript
// CODE NODE 6/11: Duplicate check with PERSISTENT fallback
const apiResponse = $input.first().json;
const slotData = $('Select Best Slot').first().json;
const patientData = $('Set Validated Data').first().json;

// Check if API call succeeded
if (apiResponse.duplicate !== undefined) {
  if (apiResponse.duplicate) {
    throw new Error(JSON.stringify({ error: 'DUPLICATE_BOOKING', message: 'Same booking within 5 minutes' }));
  }
  return { ...slotData, duplicate_check: 'api' };
}

// FALLBACK: Use PERSISTENT $workflow.staticData
console.warn('Duplicate API unavailable, using persistent fallback');
const duplicates = $workflow.staticData.recent_bookings || {};
const key = `${patientData.phone_normalized}:${patientData.email}:${slotData.slot_time}`;
const now = Date.now();

// Clean old entries (5 minute window)
Object.keys(duplicates).forEach(k => {
  if (now - duplicates[k] > 300000) delete duplicates[k];
});

if (duplicates[key]) {
  throw new Error(JSON.stringify({ error: 'DUPLICATE_BOOKING', message: 'Same booking within 5 minutes' }));
}

duplicates[key] = now;
$workflow.staticData.recent_bookings = duplicates;
return { ...slotData, duplicate_check: 'fallback' };
```

**Update node notes:**
```
"notes": "CODE NODE 6/11: Duplicate processor with PERSISTENT fallback (ENTERPRISE)\nAPI SUCCESS: Uses external cache response\nAPI FAILURE: Falls back to $workflow.staticData (survives restarts)\nWINDOW: 5 minutes\nLOGS: Warning when fallback is used\nv1.5.0: Persistent cache fallback"
```

#### Step 4: Update Cache Idempotency Response (CODE NODE 9/11)

**Location:** Find the node with `"id": "cache-response"` or `"name": "Cache Idempotency Response"`

**Find and replace:**
```javascript
// OLD:
const cache = $vars.idempotency_cache || {};
$vars.idempotency_cache = cache;

// NEW:
const cache = $workflow.staticData.idempotency_cache || {};
$workflow.staticData.idempotency_cache = cache;
```

**Full Updated Code:**
```javascript
// CODE NODE 9/11: Cache idempotency response (PERSISTENT)
const idempotencyKey = $('Process Idempotency Response').first().json.idempotency_key;
const responseData = $('Build Success Response').first().json;

if (idempotencyKey) {
  const cache = $workflow.staticData.idempotency_cache || {};
  cache[idempotencyKey] = {
    response: {
      success: true,
      booking_id: responseData.booking_id,
      trace_id: responseData.trace_id
    },
    timestamp: Date.now()
  };
  $workflow.staticData.idempotency_cache = cache;
}

return responseData;
```

**Update node notes:**
```
"notes": "CODE NODE 9/11: Cache response (ENTERPRISE)\nENHANCED: Uses PERSISTENT $workflow.staticData (survives restarts)\nSTORES: In $workflow.staticData.idempotency_cache\nPURPOSE: Future duplicate requests return cached response\nv1.5.0: Persistent cache storage"
```

---

### Testing

#### Test 1: Rate Limiting Persistence
```bash
# Step 1: Send 10 requests to hit rate limit
for i in {1..10}; do
  curl -X POST https://your-n8n.com/webhook/consult-booking \
    -H "Content-Type: application/json" \
    -H "X-API-Key: your-key" \
    -d '{"name":"Test","email":"test@example.com","phone":"5551234567","service_type":"Test"}'
  sleep 1
done

# Step 2: Verify 10th request is rate limited
# Expected: 429 Too Many Requests

# Step 3: Restart n8n workflow
# (Deactivate and reactivate workflow)

# Step 4: Immediately send another request
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{"name":"Test","email":"test@example.com","phone":"5551234567","service_type":"Test"}'

# Expected: 429 Too Many Requests (rate limit persisted!)
```

#### Test 2: Idempotency Persistence
```bash
# Step 1: Send request with idempotency key
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -H "Idempotency-Key: test-key-12345" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+15551234567",
    "service_type": "Test"
  }'

# Step 2: Restart n8n workflow

# Step 3: Send same request with same idempotency key
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -H "Idempotency-Key: test-key-12345" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+15551234567",
    "service_type": "Test"
  }'

# Expected: 409 Conflict with cached response (idempotency persisted!)
```

#### Test 3: Duplicate Detection Persistence
```bash
# Step 1: Book appointment
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "name": "Test User",
    "email": "duplicate@example.com",
    "phone": "+15551234567",
    "service_type": "Test",
    "preferred_date": "2025-11-10",
    "preferred_time": "14:00"
  }'

# Step 2: Restart n8n workflow (within 5 minutes)

# Step 3: Try to book same appointment again
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "name": "Test User",
    "email": "duplicate@example.com",
    "phone": "+15551234567",
    "service_type": "Test",
    "preferred_date": "2025-11-10",
    "preferred_time": "14:00"
  }'

# Expected: 409 Conflict - duplicate booking detected (persisted!)
```

---

### Verification

After implementation, verify persistence:

```javascript
// In n8n, check workflow static data:
// Go to workflow settings → Advanced → Static Data
// Should see:
{
  "rate_limits": { /* IP addresses and counts */ },
  "idempotency_cache": { /* idempotency keys */ },
  "recent_bookings": { /* booking hashes */ }
}

// This data persists across workflow restarts
```

---

## Task 1.3: Implement International Phone Normalization

### Objective
Replace US-centric phone normalization with international support for multiple country codes.

### Current State
- **Node:** `Extract Phone Digits` (line ~165-173)
- **Node:** `Set Validated Data` (line ~175-244)
- **Issue:** Hardcoded `+1` prefix for 10-digit numbers breaks international phones

### Internationalization Risk
- **Severity:** HIGH (blocking international deployments)
- **Impact:** Non-US patients get incorrect SMS, cross-module matching fails
- **Affected Countries:** All non-US markets

---

### Implementation Steps

#### Step 1: Update Enhanced Field Validation

**Location:** Find CODE NODE 3/11 with validation logic

**Add country code validation after phone validation:**

```javascript
// Phone validation (international-ready)
const phone = body.phone;
const phoneDigits = phone ? phone.replace(/\D/g, '') : '';
const countryCode = body.country_code || $vars.DEFAULT_COUNTRY_CODE || 'US';

if (!phone) {
  errors.push('phone: required');
} else if (phoneDigits.length < 7) {
  errors.push('phone: minimum 7 digits');
} else if (phoneDigits.length > 20) {
  errors.push('phone: maximum 20 digits');
}

// Validate country code if provided
const supportedCountries = ['US', 'CA', 'GB', 'AU', 'NZ', 'IE', 'IN', 'SG', 'MY', 'PH', 'ZA'];
if (body.country_code && !supportedCountries.includes(body.country_code)) {
  errors.push('country_code: unsupported country code. Supported: ' + supportedCountries.join(', '));
}
```

#### Step 2: Replace "Extract Phone Digits" with "Normalize Phone International"

**Delete the old node:**
```json
// OLD NODE TO REMOVE:
{
  "id": "normalize-phone-1",
  "name": "Extract Phone Digits",
  "type": "n8n-nodes-base.stringOperations",
  ...
}
```

**Create new Code Node:**
```json
{
  "parameters": {
    "jsCode": "// International phone normalization\nconst body = $input.first().json.body || {};\nconst phone = body.phone || '';\nconst countryCode = body.country_code || $vars.DEFAULT_COUNTRY_CODE || 'US';\n\n// Extract digits only\nconst digits = phone.replace(/\\D/g, '');\n\n// Country-specific normalization\nlet normalized;\nlet display = phone;\nlet countryPrefix;\n\nswitch(countryCode) {\n  case 'US':\n  case 'CA':\n    // North America: +1 prefix\n    countryPrefix = '1';\n    if (digits.startsWith('1') && digits.length === 11) {\n      normalized = '+' + digits;\n    } else if (digits.length === 10) {\n      normalized = '+1' + digits;\n    } else {\n      normalized = '+1' + digits.replace(/^1/, '');\n    }\n    // Format display as +1 (555) 123-4567\n    if (digits.length >= 10) {\n      const cleanDigits = digits.replace(/^1/, '').slice(-10);\n      display = `+1 (${cleanDigits.slice(0,3)}) ${cleanDigits.slice(3,6)}-${cleanDigits.slice(6)}`;\n    }\n    break;\n  \n  case 'GB':\n    // UK: +44 prefix\n    countryPrefix = '44';\n    if (digits.startsWith('44')) {\n      normalized = '+' + digits;\n    } else {\n      normalized = '+44' + digits.replace(/^0/, '');\n    }\n    display = phone;\n    break;\n  \n  case 'AU':\n    // Australia: +61 prefix\n    countryPrefix = '61';\n    if (digits.startsWith('61')) {\n      normalized = '+' + digits;\n    } else {\n      normalized = '+61' + digits.replace(/^0/, '');\n    }\n    display = phone;\n    break;\n  \n  case 'NZ':\n    // New Zealand: +64 prefix\n    countryPrefix = '64';\n    if (digits.startsWith('64')) {\n      normalized = '+' + digits;\n    } else {\n      normalized = '+64' + digits.replace(/^0/, '');\n    }\n    display = phone;\n    break;\n  \n  case 'IN':\n    // India: +91 prefix\n    countryPrefix = '91';\n    if (digits.startsWith('91')) {\n      normalized = '+' + digits;\n    } else {\n      normalized = '+91' + digits.replace(/^0/, '');\n    }\n    display = phone;\n    break;\n  \n  case 'SG':\n  case 'MY':\n    // Singapore: +65, Malaysia: +60\n    const prefix = countryCode === 'SG' ? '65' : '60';\n    countryPrefix = prefix;\n    if (digits.startsWith(prefix)) {\n      normalized = '+' + digits;\n    } else {\n      normalized = '+' + prefix + digits.replace(/^0/, '');\n    }\n    display = phone;\n    break;\n  \n  case 'PH':\n    // Philippines: +63\n    countryPrefix = '63';\n    if (digits.startsWith('63')) {\n      normalized = '+' + digits;\n    } else {\n      normalized = '+63' + digits.replace(/^0/, '');\n    }\n    display = phone;\n    break;\n  \n  case 'ZA':\n    // South Africa: +27\n    countryPrefix = '27';\n    if (digits.startsWith('27')) {\n      normalized = '+' + digits;\n    } else {\n      normalized = '+27' + digits.replace(/^0/, '');\n    }\n    display = phone;\n    break;\n  \n  case 'IE':\n    // Ireland: +353\n    countryPrefix = '353';\n    if (digits.startsWith('353')) {\n      normalized = '+' + digits;\n    } else {\n      normalized = '+353' + digits.replace(/^0/, '');\n    }\n    display = phone;\n    break;\n  \n  default:\n    // Generic: try to keep + if present, otherwise add it\n    countryPrefix = 'unknown';\n    normalized = phone.startsWith('+') ? '+' + digits : '+' + digits;\n    display = phone;\n}\n\nreturn {\n  ...$input.first().json,\n  phone_normalized: normalized,\n  phone_display: display,\n  phone_country: countryCode,\n  phone_country_prefix: countryPrefix\n};"
  },
  "id": "normalize-phone-international",
  "name": "Normalize Phone International",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [1800, 300],
  "notes": "CODE NODE 4a/11: International phone normalization\nSUPPORTS: US, CA, GB, AU, NZ, IE, IN, SG, MY, PH, ZA\nOUTPUT: phone_normalized (E.164-like), phone_display, phone_country\nFORMAT: Handles local formats and adds correct country prefix\nv1.5.0: Replaces US-only normalization"
}
```

#### Step 3: Update Set Validated Data Node

**Location:** Find the `Set Validated Data` node

**Modify the phone fields:**

```json
{
  "name": "phone_normalized",
  "value": "={{ $json.phone_normalized }}"
},
{
  "name": "phone_display",
  "value": "={{ $json.phone_display }}"
},
{
  "name": "phone_country",
  "value": "={{ $json.phone_country || $vars.DEFAULT_COUNTRY_CODE || 'US' }}"
},
{
  "name": "phone_country_prefix",
  "value": "={{ $json.phone_country_prefix }}"
}
```

#### Step 4: Update Connections

**Modify connections JSON:**

```json
"Sanitize User Input": {
  "main": [
    [
      {
        "node": "Normalize Phone International",
        "type": "main",
        "index": 0
      }
    ]
  ]
},
"Normalize Phone International": {
  "main": [
    [
      {
        "node": "Set Validated Data",
        "type": "main",
        "index": 0
      }
    ]
  ]
}
```

#### Step 5: Update Environment Variables

```bash
# Default country code for phone normalization
DEFAULT_COUNTRY_CODE=US

# Or for other regions:
# DEFAULT_COUNTRY_CODE=GB  # UK
# DEFAULT_COUNTRY_CODE=AU  # Australia
# DEFAULT_COUNTRY_CODE=IN  # India
```

#### Step 6: Update Input Schema Documentation

**Add to README.md Input Schema section:**

```markdown
| `country_code` | String | No | ISO 3166-1 alpha-2 | Patient's country code (defaults to DEFAULT_COUNTRY_CODE) |

**Supported Countries:**
- `US` - United States (+1)
- `CA` - Canada (+1)
- `GB` - United Kingdom (+44)
- `AU` - Australia (+61)
- `NZ` - New Zealand (+64)
- `IE` - Ireland (+353)
- `IN` - India (+91)
- `SG` - Singapore (+65)
- `MY` - Malaysia (+60)
- `PH` - Philippines (+63)
- `ZA` - South Africa (+27)

**Example Request with Country Code:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "020 7946 0958",
  "country_code": "GB",
  "service_type": "General Consultation"
}
```
```

---

### Testing

#### Test 1: US Format
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "name": "US Test",
    "email": "us@example.com",
    "phone": "555-123-4567",
    "country_code": "US",
    "service_type": "Test"
  }'

# Expected phone_normalized: "+15551234567"
# Expected phone_display: "+1 (555) 123-4567"
```

#### Test 2: UK Format
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "name": "UK Test",
    "email": "uk@example.com",
    "phone": "020 7946 0958",
    "country_code": "GB",
    "service_type": "Test"
  }'

# Expected phone_normalized: "+442079460958"
# Expected phone_display: "020 7946 0958"
```

#### Test 3: Australian Format
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "name": "AU Test",
    "email": "au@example.com",
    "phone": "0412 345 678",
    "country_code": "AU",
    "service_type": "Test"
  }'

# Expected phone_normalized: "+61412345678"
# Expected phone_display: "0412 345 678"
```

#### Test 4: Indian Format
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "name": "IN Test",
    "email": "in@example.com",
    "phone": "98765 43210",
    "country_code": "IN",
    "service_type": "Test"
  }'

# Expected phone_normalized: "+919876543210"
# Expected phone_display: "98765 43210"
```

#### Test 5: Default Country (No country_code provided)
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "name": "Default Test",
    "email": "default@example.com",
    "phone": "5551234567",
    "service_type": "Test"
  }'

# Expected: Uses DEFAULT_COUNTRY_CODE from environment
# If DEFAULT_COUNTRY_CODE=US: phone_normalized = "+15551234567"
```

---

## Phase 1 Completion Checklist

### Implementation
- [ ] Task 1.1: Webhook authentication added
- [ ] Task 1.2: Cache persistence fixed (all 4 nodes)
- [ ] Task 1.3: International phone normalization implemented

### Testing
- [ ] Webhook auth test: Request without key fails (401/403)
- [ ] Webhook auth test: Request with valid key succeeds
- [ ] Cache persistence test: Rate limit survives restart
- [ ] Cache persistence test: Idempotency survives restart
- [ ] Phone test: US format normalized correctly
- [ ] Phone test: UK format normalized correctly
- [ ] Phone test: AU format normalized correctly
- [ ] Phone test: IN format normalized correctly

### Documentation
- [ ] README.md updated with webhook authentication section
- [ ] README.md updated with international phone support
- [ ] README.md updated with new environment variables
- [ ] Input schema updated with country_code field
- [ ] Migration notes written for breaking changes

### Git Operations
- [ ] Created backup of v1.4.1
- [ ] Committed Task 1.1 changes
- [ ] Committed Task 1.2 changes
- [ ] Committed Task 1.3 changes
- [ ] Pushed to branch

### Version Updates
- [ ] Workflow metadata version updated to 1.5.0
- [ ] All modified node notes include "v1.5.0"
- [ ] JSON file renamed to v1.5.0

---

## Next Steps

Once Phase 1 is complete and all tests pass:

1. **Review all changes** - do a final check
2. **Run full regression test** - ensure no broken functionality
3. **Update status** - mark Phase 1 complete
4. **Proceed to Phase 2** - open `Implementation_Phase2_High.md`

---

## Rollback Instructions

If critical issues arise:

```bash
# Restore backup
cp Aigent_Module_02_Consult_Booking_v1.4.1_backup_YYYYMMDD.json \
   Aigent_Module_02_Consult_Booking_v1.4.1_fixedlinks.json

# Reimport to n8n
# Test to confirm rollback successful

# Document what went wrong
# Plan fix before retrying
```

---

**Phase 1 Status:** Ready for implementation
**Estimated Time:** 8-12 hours
**Priority:** CRITICAL
**Start Date:** _____________
**Completion Date:** _____________
