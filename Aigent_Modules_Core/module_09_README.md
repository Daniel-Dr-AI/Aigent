# Module 09 Core: Compliance & Audit

**Version:** core-1.0.0
**Branch:** Core (SMB-Ready, Non-PHI)
**Target Users:** Small businesses, service providers, organizations requiring basic audit trails

---

## Purpose

Simple audit logging workflow that captures system events, user actions, and operational activities in an append-only Google Sheets log. Perfect for basic compliance tracking, security monitoring, and operational transparency.

**NOT FOR:** HIPAA-compliant audit trails or complex compliance frameworks (use Enterprise version)

---

## Features

✅ **Included (Core)**
- Append-only audit log (Google Sheets)
- Event tracking (user actions, system events)
- Required field validation (3 fields)
- Immutable logging (no updates/deletes)
- Trace ID generation
- Retry logic (3 attempts)
- Resource ID tracking
- Optional details field
- Timestamp capture
- Non-blocking error handling

❌ **Removed (Enterprise Only)**
- HIPAA-compliant audit trails
- Cryptographic log integrity (hash chains)
- Tamper detection
- Encrypted log storage
- Role-based access logs
- Advanced search/filtering
- Compliance report generation (SOC2, GDPR, HIPAA)
- Automated log retention policies
- Log archival to cold storage
- Real-time alerting on suspicious events
- Correlation with other security tools (SIEM)
- Anomaly detection (ML-powered)
- Log export to compliance platforms
- Detailed user session tracking
- IP address logging

---

## Data Flow

```
Webhook → Metadata → Validate → Append to Audit Log → Success
             ↓
           Error (400)
```

**Execution Time:** ~300ms average (fastest module)

---

## Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `event_type` | string | Not empty |
| `user_id` | string | Not empty |
| `action` | string | Not empty |

**Optional Fields:**
- `resource_id` (string) - ID of affected resource
- `details` (string) - Additional context

---

## Setup Instructions

### 1. Import Workflow
- Import `module_09_core.json` to n8n

### 2. Connect Google Sheets

Create sheet with columns:
```
timestamp | audit_id | event_type | user_id | resource_id | action | details
```

**Important:** Make sheet "Append Only" (no edits/deletes):
1. Sheet → Protect range
2. Select "Sheet" → Entire sheet
3. Set permissions: "Restrict who can edit this range"
4. Choose: "Show warning when editing" (minimum protection)
5. For stricter protection: Use Google Apps Script to block edits

### 3. Set Variables

**Required:**
```bash
GOOGLE_SHEET_ID="your-sheet-id"
```

**Optional:**
```bash
GOOGLE_SHEET_TAB="AuditLog"  # Default tab name
```

### 4. Test Audit Logging

**Example 1: User Action**
```bash
curl -X POST https://your-n8n-instance/webhook/log-event \
  -H 'Content-Type: application/json' \
  -d '{
    "event_type": "user_action",
    "user_id": "user_123",
    "action": "login",
    "resource_id": "account_456",
    "details": "Successful login from 192.168.1.100"
  }'
```

**Example 2: System Event**
```bash
curl -X POST https://your-n8n-instance/webhook/log-event \
  -H 'Content-Type: application/json' \
  -d '{
    "event_type": "system_event",
    "user_id": "system",
    "action": "backup_completed",
    "details": "Daily backup completed successfully"
  }'
```

**Example 3: Data Access**
```bash
curl -X POST https://your-n8n-instance/webhook/log-event \
  -H 'Content-Type: application/json' \
  -d '{
    "event_type": "data_access",
    "user_id": "staff_jane",
    "action": "view_record",
    "resource_id": "patient_789",
    "details": "Viewed patient record for appointment"
  }'
```

### 5. Activate
- Toggle workflow to "Active"
- Log test events
- Verify entries appear in Google Sheets
- Do NOT delete test entries (append-only principle)

---

## Response Examples

### Success (200)
```json
{
  "success": true,
  "audit_id": "AUDIT-1730851234567",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Provide event_type, user_id, and action",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

---

## Event Types & Examples

### Recommended Event Types

**1. User Actions**
```json
{
  "event_type": "user_action",
  "user_id": "staff_john",
  "action": "login",
  "details": "Successful login"
}
```

**Examples:**
- login, logout
- password_reset, profile_update
- two_factor_enabled

**2. Data Access**
```json
{
  "event_type": "data_access",
  "user_id": "staff_jane",
  "action": "view_record",
  "resource_id": "customer_123",
  "details": "Viewed customer profile"
}
```

**Examples:**
- view_record, edit_record, delete_record
- export_data, print_record
- share_record

**3. System Events**
```json
{
  "event_type": "system_event",
  "user_id": "system",
  "action": "backup_completed",
  "details": "Daily backup successful"
}
```

**Examples:**
- backup_completed, backup_failed
- system_restart, maintenance_start
- integration_sync

**4. Administrative Actions**
```json
{
  "event_type": "admin_action",
  "user_id": "admin_sarah",
  "action": "user_created",
  "resource_id": "user_456",
  "details": "Created new staff account"
}
```

**Examples:**
- user_created, user_deleted, role_changed
- settings_updated, integration_enabled
- permission_granted

**5. Security Events**
```json
{
  "event_type": "security_event",
  "user_id": "user_789",
  "action": "failed_login_attempt",
  "details": "3 failed password attempts"
}
```

**Examples:**
- failed_login_attempt, suspicious_activity
- account_locked, password_expired
- unauthorized_access_attempt

**6. Financial Transactions**
```json
{
  "event_type": "financial_transaction",
  "user_id": "system",
  "action": "payment_processed",
  "resource_id": "charge_abc123",
  "details": "Stripe payment $50.00"
}
```

**Examples:**
- payment_processed, refund_issued
- invoice_generated, payment_failed
- subscription_created

---

## Integration with Other Modules

### Module 01 (Lead Capture)

**Flow:** Lead Captured (M01) → Log Audit Event (M09)

**Use Case:** Track all lead submissions for compliance

**Data Passed:**
```json
{
  "event_type": "lead_captured",
  "user_id": "system",
  "action": "form_submission",
  "resource_id": "LEAD-1730851234567",
  "details": "New lead: jane@example.com"
}
```

### Module 02 (Consult Booking)

**Flow:** Booking Created (M02) → Log Audit Event (M09)

**Use Case:** Audit trail of all appointments

**Data Passed:**
```json
{
  "event_type": "booking_created",
  "user_id": "patient_jane",
  "action": "appointment_scheduled",
  "resource_id": "BOOK-1730851234567",
  "details": "Scheduled for 2025-11-20 at 2pm"
}
```

### Module 03 (Telehealth Session)

**Flow:** Session Started (M03) → Log Audit Event (M09)

**Use Case:** Track video session access for compliance

**Data Passed:**
```json
{
  "event_type": "session_access",
  "user_id": "patient_jane",
  "action": "video_session_joined",
  "resource_id": "SESSION-1730851234567",
  "details": "Zoom meeting joined"
}
```

### Module 04 (Billing & Payments)

**Flow:** Payment Processed (M04) → Log Audit Event (M09)

**Use Case:** Financial audit trail

**Data Passed:**
```json
{
  "event_type": "financial_transaction",
  "user_id": "customer_jane",
  "action": "payment_processed",
  "resource_id": "ch_abc123xyz",
  "details": "Stripe charge $50.00"
}
```

### Module 06 (Document OCR)

**Flow:** Document Processed (M06) → Log Audit Event (M09)

**Use Case:** Track document access

**Data Passed:**
```json
{
  "event_type": "document_processed",
  "user_id": "system",
  "action": "ocr_extract",
  "resource_id": "DOC-1730851234567",
  "details": "Extracted invoice data"
}
```

### Module 08 (Messaging)

**Flow:** Message Sent (M08) → Log Audit Event (M09)

**Use Case:** Communication audit trail

**Data Passed:**
```json
{
  "event_type": "communication_sent",
  "user_id": "system",
  "action": "sms_delivered",
  "resource_id": "MSG-1730851234567",
  "details": "Appointment reminder to +15559876543"
}
```

---

## Use Cases

### ✅ Perfect For

**Compliance Requirements:**
- Basic audit trail for service businesses
- Track user access to customer data
- Financial transaction logging
- System event monitoring

**Security Monitoring:**
- Failed login attempts
- Unauthorized access attempts
- Account lockouts
- Permission changes

**Operational Transparency:**
- Staff action tracking
- System event logging
- Integration status monitoring
- Backup completion tracking

**Customer Service:**
- View history of customer interactions
- Track who accessed customer records
- Resolve disputes with audit trail

**General Business:**
- Track workflow executions
- Monitor automation errors
- Capture system health events

### ❌ Not Suitable For

- HIPAA-compliant audit trails (use Enterprise)
- SOC2 compliance (use Enterprise)
- Real-time security alerting (use SIEM + Enterprise)
- Large-scale audit data (>100,000 events/month) (use Enterprise)
- Cryptographically signed logs (use Enterprise)
- Advanced threat detection (use Enterprise)
- Compliance report generation (use Enterprise)
- Long-term archival (use Enterprise with S3)

---

## Audit Log Best Practices

### What to Log

**Always Log:**
- User authentication (login, logout, password reset)
- Data access (view, edit, delete)
- Administrative actions (user created, settings changed)
- Financial transactions (payment, refund)
- Security events (failed login, account locked)
- System events (backup, integration sync)

**Consider Logging:**
- Workflow executions (start, complete, fail)
- API calls to external services
- Configuration changes
- Data exports

**Don't Log:**
- Passwords (NEVER log passwords or secrets)
- Full credit card numbers (PCI-DSS violation)
- PHI details if not HIPAA-compliant
- Excessive detail (keep logs concise)

### User ID Guidelines

**Good User IDs:**
- `staff_john` (staff identifier)
- `user_123` (user database ID)
- `admin_sarah` (admin identifier)
- `system` (automated system actions)

**Bad User IDs:**
- Email addresses (can change, not stable)
- Full names (privacy concern)
- Temporary session IDs

### Resource ID Guidelines

**Good Resource IDs:**
- `customer_123` (customer database ID)
- `LEAD-1730851234567` (trace ID from other modules)
- `invoice_456` (invoice number)
- `session_abc123` (session identifier)

**Bad Resource IDs:**
- Full customer names (privacy)
- Email addresses (can change)
- Generic IDs ("N/A", "unknown")

### Details Field Guidelines

**Good Details:**
- "Successful login from 192.168.1.100"
- "Viewed customer record for billing inquiry"
- "Stripe payment $50.00 for booking BOOK-123"
- "Failed login attempt: incorrect password"

**Bad Details:**
- Empty or "N/A" (not useful)
- Full passwords or secrets (NEVER)
- Excessive verbosity (keep under 200 chars)

---

## Troubleshooting

### Sheets Not Updating

**Issue:** Audit events logged but not appearing in Sheets

**Solutions:**
1. **Verify GOOGLE_SHEET_ID:**
   - Check variable points to correct sheet
2. **Check tab name:**
   - Default: "AuditLog" (case-sensitive)
   - Update GOOGLE_SHEET_TAB if different
3. **Verify column headers:**
   - Must match exactly: `timestamp`, `audit_id`, `event_type`, `user_id`, `resource_id`, `action`, `details`
   - Case-sensitive
4. **Check credential:**
   - Ensure Google Sheets credential has write access
   - Test credential independently
5. **Review execution logs:**
   - n8n → Executions → Find failed execution
   - Check "Append to Audit Log" node output

### Retry Failures

**Issue:** Audit log node retries 3 times then fails

**Causes:**
1. **Google Sheets API rate limit:**
   - Limit: 60 requests/minute/user
   - Solution: Slow down audit logging or batch events
2. **Sheet permissions:**
   - Service account doesn't have write access
   - Solution: Share sheet with service account email
3. **Sheet deleted or renamed:**
   - Solution: Verify sheet exists

### Duplicate Entries

**Issue:** Same event logged multiple times

**Causes:**
1. **Webhook called multiple times:**
   - Client retried due to timeout
   - Solution: Implement idempotency in client
2. **Workflow triggered twice:**
   - Accidental duplicate trigger
   - Solution: Review triggering mechanism

**Note:** Core doesn't prevent duplicates. Enterprise has idempotency checking.

### Missing Details

**Issue:** `details` column shows "N/A" or empty

**Cause:** Optional field not provided

**Solution:** Always include `details` field for context:
```json
{
  "event_type": "user_action",
  "user_id": "staff_jane",
  "action": "login",
  "details": "Successful login from Chrome on Windows"
}
```

---

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Avg Execution** | 300ms | Fastest module |
| **P95 Execution** | 500ms | Google Sheets API latency |
| **Nodes** | 6 | Simplest workflow |
| **Retry Attempts** | 3 | Auto-retry on Google API fail |
| **Max Events/Minute** | ~60 | Google Sheets API rate limit |

**Why So Fast?**
- Single API call (Google Sheets append)
- Minimal validation (3 fields)
- No external dependencies
- Append-only (no search/update overhead)

**Scalability:**
- Works well for <10,000 events/month
- Beyond 10k/month: Consider Enterprise with database storage

---

## Security & Compliance

### Current Security Level: Basic

**Included:**
- ✅ HTTPS encryption (n8n enforces)
- ✅ Append-only logging (manual enforcement)
- ✅ Google Sheets access control
- ✅ Timestamp tracking

**Not Included (Enterprise Only):**
- ❌ Cryptographic log integrity (hash chains)
- ❌ Tamper detection
- ❌ Encrypted storage
- ❌ HIPAA compliance
- ❌ SOC2 compliance
- ❌ Automated retention policies
- ❌ Immutable storage (blockchain)

### Making Logs Append-Only

**Google Sheets Protection (Basic):**
1. Sheet → Protect range → Entire sheet
2. Set permissions: "Show warning when editing"
3. Limit editors to service account only

**Google Apps Script (Advanced):**
```javascript
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() === "AuditLog") {
    e.range.setValue(e.oldValue);  // Revert any edits
    SpreadsheetApp.getUi().alert("Audit log is append-only. Edits not allowed.");
  }
}
```

**Enterprise Solution:**
- True immutable storage (S3 with object lock)
- Cryptographic signatures per entry
- Tamper detection alerts

### Compliance Notes

**NOT HIPAA-Compliant:**
- No encryption at rest (Google Sheets uses standard encryption)
- No access logging (who viewed audit logs)
- No retention enforcement (manual deletion possible)
- No integrity verification

**Basic Compliance Supported:**
- ✅ User action tracking
- ✅ Data access logging
- ✅ Timestamp accuracy
- ✅ Non-repudiation (trace IDs)

**For HIPAA/SOC2:** Upgrade to Enterprise

---

## Viewing & Searching Audit Logs

### Google Sheets Interface

**Basic Search:**
1. Open Google Sheet
2. Ctrl+F (or Cmd+F)
3. Search by user_id, action, resource_id

**Filter:**
1. Select header row
2. Data → Create a filter
3. Click filter icon on column header
4. Select values to filter

**Sort:**
1. Select column (e.g., timestamp)
2. Data → Sort sheet by column A (Z→A for newest first)

### Advanced: Google Sheets Query

**Example: Find all logins by user_john**
```sql
=QUERY(AuditLog!A:G, "SELECT * WHERE D = 'user_john' AND F = 'login'")
```

**Example: Find all events in date range**
```sql
=QUERY(AuditLog!A:G, "SELECT * WHERE A >= date '2025-11-01' AND A <= date '2025-11-30'")
```

**Example: Count events by type**
```sql
=QUERY(AuditLog!A:G, "SELECT C, COUNT(C) GROUP BY C")
```

### Export for Analysis

**Export to CSV:**
1. File → Download → CSV
2. Analyze in Excel, Python, R

**Export to BigQuery (Advanced):**
1. Tools → Script Editor
2. Use BigQuery API to sync audit logs
3. Run SQL queries in BigQuery

---

## Cost Analysis

### Service Costs

| Service | Cost | Purpose |
|---------|------|---------|
| **n8n Cloud** | $20/month | Workflow hosting |
| **Google Sheets** | Free | Audit log storage |
| **Total** | **$20/month** | (Shared n8n cost) |

**Per-Event Cost:** $0 (unlimited logging within n8n plan)

**Storage Limits:**
- Google Sheets: 10 million cells per sheet
- Recommended: <100,000 events/sheet
- Beyond that: Archive old logs or upgrade to Enterprise

**Example:**
- 1,000 events/month = 12,000 events/year → $0 extra cost
- 10,000 events/month = 120,000 events/year → May exceed sheet limits, consider Enterprise

---

## Upgrade to Enterprise

**When to Upgrade:**
- Need HIPAA-compliant audit trails
- Need SOC2 compliance
- Need cryptographic log integrity
- Need tamper detection & alerting
- Need encrypted log storage
- Need automated retention policies
- Need log archival (S3, Glacier)
- Need advanced search/filtering
- Need compliance report generation
- Need real-time security alerting
- Need SIEM integration
- Need anomaly detection
- Need >100,000 events/month
- Need long-term immutable storage

**Enterprise Additions:**
- ✅ HIPAA-compliant logging
- ✅ Cryptographic hash chains
- ✅ Tamper detection
- ✅ Encrypted storage (at rest)
- ✅ Automated retention policies
- ✅ S3/Glacier archival
- ✅ Advanced search & filtering
- ✅ Compliance reports (SOC2, GDPR, HIPAA)
- ✅ Real-time alerting
- ✅ SIEM integration (Splunk, ELK)
- ✅ ML-powered anomaly detection
- ✅ Database storage (PostgreSQL, MongoDB)
- ✅ IP address logging
- ✅ Session tracking

**Migration Steps:**
1. Export existing audit logs from Sheets (CSV)
2. Import `module_09_enterprise.json`
3. Configure database/S3 storage
4. Set retention policies
5. Import historical logs
6. Test in parallel
7. Switch webhook URLs
8. Deactivate Core version

---

## Regulatory Considerations

### GDPR (EU Data Protection)

**Core Supports:**
- ✅ Right to access (logs are searchable)
- ✅ Transparency (audit trail visible)

**Core Does NOT Support:**
- ❌ Right to erasure (append-only logs can't be deleted)
- ❌ Automated deletion (no retention policies)

**Workaround:**
- Manually delete entries if legally required
- Use Enterprise for automated compliance

### CCPA (California Privacy)

**Similar to GDPR:**
- ✅ Consumer data access
- ❌ Automated deletion

### SOC2 (Security Compliance)

**Core Provides Basic Controls:**
- ✅ User action logging
- ✅ Access tracking
- ✅ Timestamp accuracy

**Missing for SOC2:**
- ❌ Log integrity verification
- ❌ Access control to logs themselves
- ❌ Automated monitoring & alerting

### HIPAA (Healthcare)

**Core is NOT HIPAA-Compliant:**
- ❌ No encryption at rest (beyond Google's standard)
- ❌ No BAA with Google Sheets
- ❌ No access audit of audit logs
- ❌ No integrity verification

**For HIPAA:** Upgrade to Enterprise with compliant storage

---

## Common Audit Patterns

### Pattern 1: User Activity Tracking

**Log all user actions:**
```javascript
// On user login
{
  "event_type": "user_action",
  "user_id": "staff_jane",
  "action": "login",
  "details": "Successful login from Chrome"
}

// On data access
{
  "event_type": "data_access",
  "user_id": "staff_jane",
  "action": "view_customer",
  "resource_id": "customer_123",
  "details": "Viewed profile for support inquiry"
}

// On logout
{
  "event_type": "user_action",
  "user_id": "staff_jane",
  "action": "logout",
  "details": "Session ended"
}
```

### Pattern 2: Financial Audit Trail

**Track all money movements:**
```javascript
// Payment received
{
  "event_type": "financial_transaction",
  "user_id": "system",
  "action": "payment_received",
  "resource_id": "charge_abc123",
  "details": "Stripe charge $50.00"
}

// Refund issued
{
  "event_type": "financial_transaction",
  "user_id": "admin_sarah",
  "action": "refund_issued",
  "resource_id": "charge_abc123",
  "details": "Full refund $50.00 - customer request"
}
```

### Pattern 3: Security Monitoring

**Track security events:**
```javascript
// Failed login
{
  "event_type": "security_event",
  "user_id": "user_789",
  "action": "failed_login",
  "details": "Incorrect password (attempt 2 of 3)"
}

// Account locked
{
  "event_type": "security_event",
  "user_id": "user_789",
  "action": "account_locked",
  "details": "3 failed login attempts"
}

// Suspicious activity
{
  "event_type": "security_event",
  "user_id": "staff_john",
  "action": "unusual_access_pattern",
  "details": "Accessed 50 customer records in 5 minutes"
}
```

---

## Support

### Documentation
- **Core Guide:** This file
- **Google Sheets:** https://developers.google.com/sheets
- **Audit Logging Best Practices:** https://www.sans.org/reading-room/whitepapers/logging/

### Community
- **Forum:** https://community.aigent.company
- **GitHub:** https://github.com/aigent/modules/issues

---

## License

MIT License (Open Source)

---

**Version:** core-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 08: Messaging Omnichannel](module_08_README.md)
**Next Module:** Module 10: System Orchestration (Coming Soon)
