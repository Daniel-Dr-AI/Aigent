# Module 01: Intake & Lead Capture - Improvement Plan

**Module**: Aigent_Module_01_Core_Intake_LeadCapture
**Current Version**: core-1.0.0
**Target Version**: core-1.1.0 (hardened)
**Total Effort**: 8 hours
**Priority**: 🔴 HIGH (Security issues must be fixed before production)

---

## Changes Overview

| Change # | Description | Type | Effort | Priority |
|----------|-------------|------|--------|----------|
| 1 | Fix CORS wildcard | Security | 15min | 🔴 CRITICAL |
| 2 | Add length validation | Security | 45min | 🔴 CRITICAL |
| 3 | Improve email validation | Validation | 30min | 🔴 HIGH |
| 4 | Add HTML escaping | Security | 30min | 🟡 HIGH |
| 5 | Add error connections | Reliability | 1.5h | 🟡 MEDIUM |
| 6 | Improve trace_id uniqueness | Reliability | 15min | 🟡 MEDIUM |
| 7 | Field-specific error messages | UX | 1h | 🟢 LOW |
| 8 | Replace Code nodes with Set nodes | Maintainability | 2h | 🟢 LOW |
| 9 | Add rate limiting node | Security | 1h | 🟢 LOW |
| 10 | Document all variables | Documentation | 30min | 🟢 LOW |

---

## Change #1: Fix CORS Wildcard 🔴 CRITICAL

### Current State
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "intake-lead",
    "responseMode": "responseNode",
    "options": {
      "allowedOrigins": "*",  // ❌ VULNERABLE
      "rawBody": false
    }
  }
}
```

### Target State
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "intake-lead",
    "responseMode": "responseNode",
    "options": {
      "allowedOrigins": "={{$vars.ALLOWED_ORIGINS || 'https://yourdomain.com'}}",  // ✅ SECURE
      "rawBody": false
    }
  }
}
```

### Implementation Steps
1. Add variable `ALLOWED_ORIGINS` to n8n Settings → Variables
2. Set value to your domain: `https://yourdomain.com`
3. Update webhook node (line 10)
4. Test with curl from allowed and disallowed origins
5. Verify 403 Forbidden from wrong origin

### Testing
```bash
# Should succeed
curl -X POST https://n8n.yourdomain.com/webhook/intake-lead \
  -H "Origin: https://yourdomain.com" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"555-1234"}'

# Should fail (403)
curl -X POST https://n8n.yourdomain.com/webhook/intake-lead \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"555-1234"}'
```

---

## Change #2: Add Length Validation 🔴 CRITICAL

### Current State
No length checks - accepts 100KB+ payloads.

### Target State
Add 3 new conditions to `validation-check` node:

```json
{
  "conditions": [
    // Existing 3 conditions...
    {
      "id": "name-length",
      "leftValue": "={{ $json.body.name.length }}",
      "rightValue": "100",
      "operator": {"type": "number", "operation": "lessThanOrEqual"}
    },
    {
      "id": "email-length",
      "leftValue": "={{ $json.body.email.length }}",
      "rightValue": "255",
      "operator": {"type": "number", "operation": "lessThanOrEqual"}
    },
    {
      "id": "phone-length",
      "leftValue": "={{ $json.body.phone.length }}",
      "rightValue": "20",
      "operator": {"type": "number", "operation": "lessThanOrEqual"}
    }
  ],
  "combinator": "and"
}
```

### Implementation Steps
1. Open `validation-check` node
2. Add 3 new conditions (above)
3. Keep combinator as "and"
4. Update `format-error` node to mention length limits
5. Test with long strings

### Testing
```bash
# Should fail (name too long)
curl -X POST https://n8n.yourdomain.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$(python3 -c 'print("A"*101)')\",\"email\":\"test@test.com\",\"phone\":\"555-1234\"}"
```

### Error Message Update
```javascript
// format-error node
return {
  success: false,
  error: 'Validation failed: name (max 100), email (max 255), phone (max 20), all required',
  timestamp: new Date().toISOString()
};
```

---

## Change #3: Improve Email Validation 🔴 HIGH

### Current State
```json
{
  "leftValue": "={{ $json.body.email }}",
  "rightValue": "@",
  "operator": {"type": "string", "operation": "contains"}
}
```
Accepts: `@`, `test@`, `@test`, etc.

### Target State
```json
{
  "leftValue": "={{ $json.body.email }}",
  "rightValue": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
  "operator": {"type": "string", "operation": "regex"}
}
```

### Implementation Steps
1. Open `validation-check` node
2. Find email condition (id: "email-check")
3. Change operator to "regex"
4. Update rightValue to regex pattern
5. Test with valid and invalid emails

### Testing
```bash
# Valid
test@example.com          ✅
user+tag@domain.co.uk     ✅
name.surname@company.org  ✅

# Invalid
@                         ❌
test@                     ❌
@example.com              ❌
test @example.com         ❌ (space)
test..test@example.com    ⚠️ (double dot, but regex allows)
```

---

## Change #4: Add HTML Escaping 🟡 HIGH

### Current State
```json
{
  "value": "=🆕 New Lead\n👤 Name: {{ $json.name }}\n📧 Email: {{ $json.email }}\n..."
}
```
Directly injects user input (XSS risk in Slack/Teams).

### Target State Option 1: Use n8n expressions
```json
{
  "value": "=🆕 New Lead\n👤 Name: {{ $json.name.replace(/[<>\"']/g, '') }}\n📧 Email: {{ $json.email }}\n..."
}
```

### Target State Option 2: Add sanitization Code node
Insert new node between `normalize-data` and `send-notification`:

```javascript
// Node: "sanitize-for-display"
const escapeHtml = (str) => {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

return {
  ...$ input.item.json,
  name_safe: escapeHtml($input.item.json.name),
  notes_safe: escapeHtml($input.item.json.notes)
};
```

Then use `{{ $json.name_safe }}` in notification.

### Recommendation
**Option 1** (simpler, no new node).

---

## Change #5: Add Error Connections 🟡 MEDIUM

### Current State
No error connections on any node. Unhandled exceptions crash workflow silently.

### Target State
1. Add global error handler node:
```json
{
  "id": "global-error-handler",
  "name": "Global Error Handler",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [1200, 500],
  "parameters": {
    "jsCode": "const error = $input.item.json.error || {};\nreturn {\n  success: false,\n  error: 'Internal server error',\n  error_message: error.message || 'Unknown error',\n  trace_id: $('Add Basic Metadata').first().json.trace_id || 'UNKNOWN',\n  timestamp: new Date().toISOString()\n};"
  }
}
```

2. Add error response node:
```json
{
  "id": "return-error-500",
  "name": "Return Server Error",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1.1,
  "position": [1400, 500],
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ $json }}",
    "options": {"responseCode": 500}
  }
}
```

3. Connect ALL nodes' error output to `global-error-handler`:
```json
"connections": {
  "Add Basic Metadata": {
    "main": [[{"node": "Basic Validation", "type": "main", "index": 0}]],
    "error": [[{"node": "Global Error Handler", "type": "main", "index": 0}]]  // ✅ NEW
  },
  // ... repeat for all nodes
}
```

### Implementation Steps
1. Add 2 new nodes (error handler + response)
2. For each existing node, add error connection
3. Test by injecting error (e.g., invalid JSON in normalize-data)

### Testing
Modify `normalize-data` to throw error:
```javascript
throw new Error("Simulated error for testing");
```

Expect 500 response with trace_id.

---

## Change #6: Improve trace_id Uniqueness 🟡 MEDIUM

### Current State
```javascript
trace_id: `LEAD-${Date.now()}`
```
Risk: Collision if 2+ requests in same millisecond.

### Target State
```javascript
trace_id: `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
// Example: LEAD-1730851234567-x4k2p9
```

### Implementation Steps
1. Open `add-metadata` code node
2. Update trace_id line
3. Test multiple concurrent requests

### Testing
```bash
# Send 10 concurrent requests
for i in {1..10}; do
  curl -X POST https://n8n.yourdomain.com/webhook/intake-lead \
    -H "Content-Type: application/json" \
    -d '{"name":"Test'$i'","email":"test'$i'@test.com","phone":"555-'$i'234"}' &
done
wait

# Check Google Sheet for unique trace_ids (all should be different)
```

---

## Change #7: Field-Specific Error Messages 🟢 LOW

### Current State
```javascript
error: 'Please provide name, email, and phone number'
```

### Target State
```javascript
// format-error node
const body = $input.item.json.body || {};
const missing = [];

if (!body.name || body.name.trim() === '') missing.push('name');
if (!body.email || !body.email.includes('@')) missing.push('email (valid format)');
if (!body.phone || body.phone.trim() === '') missing.push('phone');
if (body.name && body.name.length > 100) missing.push('name (max 100 chars)');
if (body.email && body.email.length > 255) missing.push('email (max 255 chars)');
if (body.phone && body.phone.length > 20) missing.push('phone (max 20 chars)');

return {
  success: false,
  error: missing.length > 0 ? `Validation failed: ${missing.join(', ')}` : 'Validation failed',
  fields: missing,
  timestamp: new Date().toISOString()
};
```

### Implementation Steps
1. Update `format-error` code node with above logic
2. Test with various invalid inputs

---

## Change #8: Replace Code Nodes with Set Nodes 🟢 LOW

### Current: `add-metadata` (Code node)
```javascript
const body = $input.item.json.body || {};
const timestamp = Date.now();
return {
  body: body,
  trace_id: `LEAD-${timestamp}-${Math.random().toString(36).substr(2, 6)}`,
  timestamp: new Date().toISOString(),
  workflow_version: 'core-1.1.0',
  module: 'intake_lead_capture'
};
```

### Proposed: Replace with Set node
**Type**: n8n-nodes-base.set

**Parameters**:
```json
{
  "mode": "manual",
  "duplicateItem": false,
  "values": [
    {"name": "body", "value": "={{ $json.body || {} }}"},
    {"name": "trace_id", "value": "=LEAD-{{ $now.toMillis() }}-{{ $runIndex }}{{ $itemIndex }}"},
    {"name": "timestamp", "value": "={{ $now.toISO() }}"},
    {"name": "workflow_version", "value": "core-1.1.0"},
    {"name": "module", "value": "intake_lead_capture"}
  ]
}
```

**Benefit**: No code to maintain, easier debugging in n8n UI.

**Tradeoff**: Less flexible than code (e.g., no random suffix in trace_id).

**Recommendation**: Keep as code node OR use Set node with simpler trace_id.

---

## Change #9: Add Rate Limiting Node 🟢 LOW

### Implementation
Insert **Rate Limit** node between Webhook and Add Metadata:

```json
{
  "id": "rate-limit",
  "name": "Rate Limit",
  "type": "n8n-nodes-base.rateLimit",
  "typeVersion": 1,
  "position": [300, 300],
  "parameters": {
    "maxCalls": "60",
    "intervalInSeconds": "60",
    "mode": "perMinute"
  }
}
```

Update connection:
```json
"Webhook Trigger": {
  "main": [[{"node": "Rate Limit", "type": "main", "index": 0}]]
},
"Rate Limit": {
  "main": [[{"node": "Add Basic Metadata", "type": "main", "index": 0}]]
}
```

**Result**: Max 60 requests/min. 61st request returns 429 Too Many Requests.

---

## Change #10: Document All Variables 🟢 LOW

### Create `.env.example` in repo root:

```bash
# Aigent Module 01: Intake & Lead Capture
# Core Version 1.1.0

# ===================================
# REQUIRED VARIABLES
# ===================================

# Google Sheets - Primary data storage
GOOGLE_SHEET_ID=your-google-sheet-id-here

# CORS Security - Allowed webhook origins (comma-separated)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ===================================
# OPTIONAL VARIABLES
# ===================================

# Google Sheets Tab Name (default: Leads)
GOOGLE_SHEET_TAB=Leads

# Slack/Teams Notification Webhook (default: httpbin for testing)
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# SendGrid - Auto-reply emails (if enabled)
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# ===================================
# VALIDATION LIMITS (hardcoded, for reference)
# ===================================
# MAX_NAME_LENGTH=100
# MAX_EMAIL_LENGTH=255
# MAX_PHONE_LENGTH=20
```

---

## Testing Checklist

### Pre-Deployment Testing
- [ ] **Valid Lead**: All fields, returns 200
- [ ] **Missing Fields**: Returns 400 with field-specific errors
- [ ] **Long Strings**: Name 101 chars returns 400
- [ ] **Invalid Email**: `test@` returns 400
- [ ] **XSS Attempt**: `<script>alert('xss')</script>` sanitized in notification
- [ ] **CORS**: Wrong origin returns 403
- [ ] **Rate Limit**: 61st request/min returns 429
- [ ] **Google Sheets**: Data logged correctly
- [ ] **Slack Notification**: Formatted correctly
- [ ] **Error Handling**: Simulated error returns 500 with trace_id
- [ ] **Unique trace_id**: 10 concurrent requests = 10 unique IDs

### Performance Testing
- [ ] **Latency**: <500ms avg under normal load
- [ ] **Throughput**: 100 req/min sustained
- [ ] **Concurrent**: 10 simultaneous requests succeed

### Integration Testing
- [ ] **M02**: Lead ID can be used to create booking
- [ ] **M07**: Leads show up in analytics
- [ ] **M09**: Audit log captures lead creation events

---

## Rollout Plan

### Phase 1: Critical Fixes (Day 1)
- ✅ Change #1: Fix CORS wildcard
- ✅ Change #2: Add length validation
- ✅ Change #3: Improve email validation
- **Deploy to staging**, run test suite

### Phase 2: Security Hardening (Day 2)
- ✅ Change #4: HTML escaping
- ✅ Change #5: Error connections
- ✅ Change #6: trace_id uniqueness
- **Deploy to staging**, security audit

### Phase 3: UX & Observability (Week 1)
- ✅ Change #7: Field-specific errors
- ✅ Change #9: Rate limiting
- ✅ Change #10: Documentation
- **Deploy to staging**, user acceptance testing

### Phase 4: Code Quality (Month 1)
- ✅ Change #8: Replace Code nodes (optional)
- **Deploy to staging**, code review

### Phase 5: Production (After all phases pass)
- **Backup current workflow** (Export JSON)
- **Deploy v1.1.0 to production**
- **Monitor for 48 hours**
- **Rollback if issues**

---

## Success Metrics

### Pre-Improvement (v1.0.0)
- 🔴 Security Score: 3/10 (CORS wildcard, no rate limit)
- 🟡 Reliability: 7/10 (no error handling)
- 🟢 Performance: 9/10 (fast, parallel execution)

### Post-Improvement (v1.1.0)
- ✅ Security Score: 8/10 (CORS fixed, rate limit, validation)
- ✅ Reliability: 9/10 (error connections, better validation)
- ✅ Performance: 9/10 (same, rate limit adds minimal overhead)

### Key Results
- ✅ Zero security vulnerabilities (CORS, XSS, DoS)
- ✅ 100% error coverage (all nodes have error paths)
- ✅ <1% invalid leads (better validation)
- ✅ <500ms avg latency (maintained)

---

**Plan Complete**: Ready for implementation.
**Estimated Total Time**: 8 hours
**Priority**: 🔴 HIGH - Fix before production use
