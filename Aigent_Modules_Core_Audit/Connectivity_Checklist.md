# Aigent Core Suite - Module Connectivity Checklist

**Version**: 1.0.0
**Date**: 2025-11-06
**Purpose**: Step-by-step verification guide for inter-module integration

---

## Pre-Integration Setup

### ✅ Step 1: Google Sheets Setup

**Create ONE master Google Sheet** with these tabs:

```
Sheet Name: Aigent_Core_Data
```

**Tabs** (exact names required):
- [ ] `Leads` - for Module 01
- [ ] `Bookings` - for Module 02
- [ ] `Sessions` - for Module 03
- [ ] `Payments` - for Module 04
- [ ] `Campaigns` - for Module 05
- [ ] `Documents` - for Module 06
- [ ] `Messages` - for Module 08
- [ ] `AuditLog` - for Module 09

**Column Headers**: See Data_Dictionary.md for each tab's required columns.

**Get Sheet ID**: From URL `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

---

### ✅ Step 2: n8n Variables

**Settings → Variables**, add:

```bash
# Required (All Modules)
GOOGLE_SHEET_ID="{your-sheet-id-here}"

# Security (All Modules)
ALLOWED_ORIGINS="https://yourdomain.com"

# Optional (Module-specific)
GOOGLE_SHEET_TAB="{default-per-module}"  # Usually auto-set
NOTIFICATION_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
CLINIC_NAME="Your Business Name"
CLINIC_PHONE="+1-555-123-4567"
CLINIC_TIMEZONE="America/New_York"
DEFAULT_APPOINTMENT_DURATION="30"
SCHEDULING_API_URL="https://api.cal.com/v1"  # or your scheduling system
VIDEO_PLATFORM_API_URL="https://api.zoom.us/v2"
VIDEO_PLATFORM_API_KEY="{your-zoom-jwt}"
N8N_BASE_URL="https://n8n.yourdomain.com"  # for M10
TWILIO_FROM_NUMBER="+15551234567"  # for M08 SMS
```

---

### ✅ Step 3: n8n Credentials

**Settings → Credentials**, add:

**Required**:
- [ ] Google Sheets OAuth2 (for M01-M09)
- [ ] Stripe API (for M04)

**Optional**:
- [ ] SendGrid API (for M01-M05, M08 emails)
- [ ] Twilio (for M08 SMS)
- [ ] Google Cloud Vision (for M06 OCR)

---

## Module-by-Module Integration

###  M01: Intake & Lead Capture

**Standalone Test** (no dependencies):

1. **Activate** Module 01 workflow
2. **Test Webhook**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "555-1234",
    "interest": "Testing",
    "referral_source": "API Test"
  }'
```

3. **Verify**:
   - [ ] Returns 200 + trace_id (e.g., `LEAD-1730851234567`)
   - [ ] Google Sheets `Leads` tab has new row
   - [ ] Slack/Teams notification received (if configured)
   - [ ] Email sent (if enabled)

**Integration Points**:
- [ ] M07 can read from `Leads` tab → Analytics includes lead count
- [ ] M09 can log M01 events → Audit trail complete
- [ ] M10 can call M01 → Orchestration works

---

### M02: Consult Booking

**Dependencies**: M01 (optional), Scheduling API (Cal.com/Calendly)

1. **Configure** `SCHEDULING_API_URL` (or use mock)
2. **Activate** Module 02 workflow
3. **Test Webhook**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "phone": "555-1234",
    "service_type": "Consultation",
    "preferred_date": "2025-11-20"
  }'
```

4. **Verify**:
   - [ ] Returns 200 + `booking_id` + `scheduled_time`
   - [ ] Google Sheets `Bookings` tab has new row
   - [ ] Slack notification received
   - [ ] Email confirmation sent (if enabled)
   - [ ] Cal.com/scheduling system has booking

**Integration Points**:
- [ ] M01 → M02: Can manually book after lead capture
- [ ] M02 → M03: `booking_id` can be passed to create session
- [ ] M07 reads `Bookings` tab → Analytics includes booking count
- [ ] M10 calls M02 after M01 → Patient journey flow works

**Test Integration**:
```bash
# M01 → M02 Manual Flow
# 1. Capture lead via M01 (get email)
# 2. Book appointment via M02 (use same email)
# 3. Verify both Sheets tabs populated
```

---

### M03: Telehealth Session

**Dependencies**: M02 (booking_id), Video API (Zoom/Meet)

1. **Configure** `VIDEO_PLATFORM_API_URL` + `VIDEO_PLATFORM_API_KEY`
2. **Activate** Module 03 workflow
3. **Get** `booking_id` from M02 test (e.g., `abc123xyz`)
4. **Test Webhook**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "abc123xyz",
    "patient_email": "test@example.com",
    "scheduled_time": "2025-11-20T14:00:00Z",
    "duration_minutes": 30
  }'
```

5. **Verify**:
   - [ ] Returns 200 + `session_id` + `meeting_url`
   - [ ] Google Sheets `Sessions` tab has new row
   - [ ] Zoom/Meet meeting created
   - [ ] Email with meeting link sent (if enabled)
   - [ ] `booking_id` links back to M02 record

**Integration Points**:
- [ ] M02 → M03: `booking_id` passed correctly
- [ ] M03 → M04: `session_id` can be used for billing
- [ ] M07 reads `Sessions` tab → Analytics includes session count
- [ ] M10 calls M03 after M02 → Full patient journey

**Test Integration**:
```bash
# M02 → M03 Flow
# 1. Create booking via M02 (get booking_id)
# 2. Create session via M03 (pass booking_id)
# 3. Verify Sessions sheet has booking_id reference
# 4. Check Zoom for meeting creation
```

---

### M04: Billing & Payments

**Dependencies**: Stripe API, optional link to M03

1. **Configure** Stripe credential
2. **Activate** Module 04 workflow
3. **Test Webhook**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "customer_email": "test@example.com",
    "description": "Consultation Fee",
    "currency": "usd"
  }'
```

4. **Verify**:
   - [ ] Returns 200 + `charge_id` + `receipt_url` (if succeeded)
   - [ ] OR returns 402 + failure details (if declined)
   - [ ] Google Sheets `Payments` tab has new row
   - [ ] Stripe dashboard shows charge
   - [ ] Receipt email sent (if enabled)

**Integration Points**:
- [ ] M03 → M04: Can pass `session_id` or `booking_id` in description
- [ ] M07 reads `Payments` tab → Revenue metrics calculated
- [ ] M04 standalone: Can be used for any payment (not just sessions)

**Test Integration**:
```bash
# M03 → M04 Manual Flow
# 1. Create session via M03 (get session_id)
# 2. Charge via M04 with session_id in description
# 3. Verify Payments sheet references session_id
```

---

### M05: Follow-up & Retention

**Dependencies**: SendGrid API

1. **Configure** SendGrid credential + `SENDGRID_FROM_EMAIL`
2. **Activate** Module 05 workflow
3. **Test Webhook**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/send-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["test1@example.com", "test2@example.com"],
    "subject": "Special Offer!",
    "message": "Hello {name}, we have a special offer for you!"
  }'
```

4. **Verify**:
   - [ ] Returns 200 + `campaign_id` + `recipients_count`
   - [ ] Google Sheets `Campaigns` tab has 2 rows (one per recipient)
   - [ ] SendGrid shows 2 emails sent
   - [ ] Recipients receive emails

**Integration Points**:
- [ ] Can pull recipient list from `Leads` or `Bookings` tab (manual query)
- [ ] M07 could trigger campaigns based on analytics
- [ ] M05 standalone: Independent email blast tool

**Test Batch Loop**:
```bash
# Test with 5+ recipients to verify split-in-batches works
curl -X POST https://n8n.yourdomain.com/webhook/send-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["u1@test.com","u2@test.com","u3@test.com","u4@test.com","u5@test.com"],
    "subject": "Test",
    "message": "Testing batch"
  }'

# Verify Campaigns sheet has 5 rows
```

---

### M06: Document Capture & OCR

**Dependencies**: Google Cloud Vision API

1. **Configure** Google Cloud Vision credential
2. **Activate** Module 06 workflow
3. **Upload** test document to public URL (or use test URL)
4. **Test Webhook**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/document-upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_url": "https://example.com/sample-receipt.jpg"
  }'
```

5. **Verify**:
   - [ ] Returns 200 + `document_id` + `ocr_text` + `extracted` fields
   - [ ] Google Sheets `Documents` tab has new row
   - [ ] OCR text extracted correctly
   - [ ] Name/date/amount parsed (if present in doc)

**Integration Points**:
- [ ] M06 standalone: Independent OCR utility
- [ ] Could be used to process documents related to M01 leads or M02 bookings
- [ ] No automatic linking (manual reference by document_id)

---

### M07: Analytics & Dashboard

**Dependencies**: Reads from `Leads`, `Bookings`, `Payments` tabs

1. **Ensure** M01, M02, M04 have created some data
2. **Activate** Module 07 workflow
3. **Test Webhook**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "period_start": "2025-11-01",
    "period_end": "2025-11-30"
  }'
```

4. **Verify**:
   - [ ] Returns 200 + `metrics` object
   - [ ] `metrics.total_leads` matches `Leads` tab count
   - [ ] `metrics.total_bookings` matches `Bookings` tab count
   - [ ] `metrics.total_revenue` matches sum of `Payments` tab
   - [ ] `metrics.conversion_rate` calculated correctly
   - [ ] Slack notification with summary (if configured)

**Integration Points**:
- [ ] M01 → M07: Reads leads
- [ ] M02 → M07: Reads bookings
- [ ] M04 → M07: Reads payments
- [ ] M07 is final aggregation point for all data

**Test Full Journey Analytics**:
```bash
# 1. Create 10 leads via M01
# 2. Create 3 bookings via M02
# 3. Create 3 payments via M04
# 4. Generate report via M07
# Expected: 10 leads, 3 bookings, 30% conversion, sum of payments
```

---

### M08: Messaging Omnichannel

**Dependencies**: SendGrid (email), Twilio (SMS)

1. **Configure** SendGrid + Twilio credentials
2. **Activate** Module 08 workflow
3. **Test Email**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "test@example.com",
    "channel": "email",
    "message": "This is a test email"
  }'
```

4. **Test SMS**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "+15551234567",
    "channel": "sms",
    "message": "This is a test SMS"
  }'
```

5. **Verify**:
   - [ ] Email: Returns 200, email received
   - [ ] SMS: Returns 200, SMS received
   - [ ] Google Sheets `Messages` tab has 2 rows
   - [ ] Channel routing works (email vs sms)

**Integration Points**:
- [ ] M08 standalone: Send messages anytime
- [ ] Could be triggered by M01-M04 for notifications
- [ ] M03 could use M08 instead of built-in email

---

### M09: Compliance & Audit

**Dependencies**: None (writes to `AuditLog` tab)

1. **Activate** Module 09 workflow
2. **Test Webhook**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/log-event \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "LEAD_CREATED",
    "user_id": "system",
    "action": "CREATE",
    "resource_id": "LEAD-1730851234567",
    "details": "Created via webhook"
  }'
```

3. **Verify**:
   - [ ] Returns 200 + `audit_id`
   - [ ] Google Sheets `AuditLog` tab has new row
   - [ ] All fields populated correctly

**Integration Points**:
- [ ] ALL modules → M09: Should log significant events
- [ ] M09 is passive: doesn't trigger other modules
- [ ] Use for: compliance, debugging, analytics

**Test Integration**:
```bash
# Manually log events from M01, M02, M03, M04 executions
# Verify AuditLog has comprehensive trail
```

---

### M10: System Orchestration

**Dependencies**: M01, M02, M03 must be active; `N8N_BASE_URL` set

1. **Configure** `N8N_BASE_URL=https://n8n.yourdomain.com`
2. **Ensure** M01, M02, M03 are **activated**
3. **Activate** Module 10 workflow
4. **Test Patient Journey**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_type": "patient-journey",
    "patient_name": "Test Patient",
    "patient_email": "patient@example.com",
    "patient_phone": "555-9999"
  }'
```

5. **Verify**:
   - [ ] Returns 200 + `orchestration_id` + `modules_executed: ["M01","M02","M03"]`
   - [ ] `total_duration_ms` is reasonable (~2000ms)
   - [ ] `Leads` tab has new row (from M01)
   - [ ] `Bookings` tab has new row (from M02)
   - [ ] `Sessions` tab has new row (from M03)
   - [ ] All 3 records linked by email

**Integration Test - Full Journey**:
```bash
# Single API call creates:
# 1. Lead (M01)
# 2. Booking (M02)
# 3. Session (M03)

# Verify:
# - Leads tab: patient@example.com, status=NEW
# - Bookings tab: patient@example.com, status=SCHEDULED
# - Sessions tab: patient@example.com, status=SCHEDULED

# Expected trace_ids:
# M01: LEAD-{timestamp}
# M02: BOOK-{timestamp}
# M03: SESSION-{timestamp}
# M10: ORCH-{timestamp}
```

**Error Handling Test**:
```bash
# Test with invalid data (no phone)
curl -X POST https://n8n.yourdomain.com/webhook/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_type": "patient-journey",
    "patient_name": "Test",
    "patient_email": "test@test.com"
  }'

# Should fail at M01, return error with partial success info
```

---

## Cross-Module Integration Tests

### Test 1: Full Patient Journey (M01 → M02 → M03 → M04)

**Manual Flow**:
1. Create lead via M01 → Get `trace_id` = `LEAD-123`
2. Create booking via M02 with same email → Get `booking_id` = `abc123`
3. Create session via M03 with `booking_id` → Get `session_id` = `SESSION-456`
4. Charge via M04 with `session_id` in description → Get `charge_id` = `ch_xyz`

**Verify**:
- [ ] All 4 Google Sheets tabs populated
- [ ] Email appears in all 4 records
- [ ] trace_ids/IDs present in all records
- [ ] Can trace full journey: Leads → Bookings → Sessions → Payments

**Use M10**:
- [ ] Single call to M10 creates Lead + Booking + Session
- [ ] Manual call to M04 for payment
- [ ] Analytics (M07) shows complete journey

---

### Test 2: Analytics Aggregation (M07 reads M01, M02, M04)

**Setup**:
1. Create 10 leads via M01
2. Create 3 bookings via M02 (same 3 emails from leads)
3. Create 2 payments via M04 ($100 each)

**Run M07**:
```bash
curl -X POST https://n8n.yourdomain.com/webhook/generate-report
```

**Expected**:
- [ ] `total_leads` = 10
- [ ] `total_bookings` = 3
- [ ] `total_revenue` = 200
- [ ] `conversion_rate` = 30%
- [ ] `avg_transaction` = $66.67

---

### Test 3: Notification Flow (M01/M02/M03 → Slack)

**Setup**:
1. Configure `NOTIFICATION_WEBHOOK_URL` to Slack
2. Activate M01, M02, M03

**Test**:
1. Create lead via M01 → Slack: "🆕 New Lead"
2. Create booking via M02 → Slack: "📅 New Appointment"
3. Create session via M03 → Slack: "🎥 Telehealth Session Created"

**Verify**:
- [ ] All 3 Slack messages received
- [ ] Messages formatted correctly
- [ ] Include relevant IDs and details

---

## Connectivity Issue Troubleshooting

### Issue: M02 always returns 409 (No Availability)

**Cause**: `SCHEDULING_API_URL` defaults to httpbin mock

**Fix**:
1. Set `SCHEDULING_API_URL` to real Cal.com API
2. OR create mock API that returns:
```json
{
  "slots": [
    {"time": "2025-11-20T14:00:00Z", "duration": 30, "id": "slot1"}
  ]
}
```

---

### Issue: M03 creates meeting but returns mock URL

**Cause**: `VIDEO_PLATFORM_API_KEY` is mock key

**Fix**:
1. Get real Zoom JWT or API key
2. Set `VIDEO_PLATFORM_API_KEY` and `VIDEO_PLATFORM_API_URL`
3. Test M03 again

---

### Issue: M10 orchestration fails at M02

**Cause**: M01 succeeds, but M02 API call fails

**Debug**:
1. Check M10 execution log
2. Look for HTTP error from M02 call
3. Test M02 standalone
4. Verify `N8N_BASE_URL` is correct

**Fix**:
- Add `continueOnFail: true` to M10 HTTP Request nodes
- Return partial success: `{modules_succeeded: ["M01"], modules_failed: ["M02"]}`

---

### Issue: M07 shows 0 leads/bookings

**Cause**: Google Sheets date filtering or tab names wrong

**Fix**:
1. Verify tab names exactly match: `Leads`, `Bookings`, `Payments`
2. Check date range in M07 request includes test data
3. Try default (last 30 days) if custom range doesn't work

---

## Final Integration Checklist

Before going live:

- [ ] All 10 modules activated in n8n
- [ ] Google Sheets has all 8 tabs with correct column headers
- [ ] `GOOGLE_SHEET_ID` variable set
- [ ] `ALLOWED_ORIGINS` set to your domain (NOT `*`)
- [ ] All required credentials connected (Google, Stripe, SendGrid, etc.)
- [ ] Test data created in all modules
- [ ] M10 orchestration tested end-to-end
- [ ] M07 analytics aggregates data correctly
- [ ] Slack/Teams notifications working (if configured)
- [ ] Email confirmations sending (if enabled)
- [ ] Error handling tested (invalid inputs, API failures)
- [ ] Rate limiting tested (61st request returns 429)
- [ ] CORS tested (wrong origin returns 403)

---

**Connectivity Checklist Complete**
**Total Integration Tests**: 20+
**Critical Paths Validated**: M01→M02→M03, M07 aggregation, M10 orchestration
