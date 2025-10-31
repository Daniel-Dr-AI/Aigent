# Module 05: Follow-Up & Retention - Test Plan

**Module:** 05 - Follow-Up & Retention
**Version:** 1.1.0-enhanced
**Test Plan Version:** 1.0
**Last Updated:** 2025-10-31
**Audience:** Complete beginners welcome!

---

## Welcome!

This test plan will guide you through testing the **Follow-Up & Retention** module step-by-step.

**What this module does:** Automatically sends a 14-day sequence of follow-up messages (emails and texts) to patients after their visit to increase satisfaction, collect feedback, and encourage rebooking.

**Why testing matters:** This module maintains patient relationships after their visit. If it fails, patients don't receive thank-you messages, wellness check-ins, surveys, or rebooking reminders — resulting in lower satisfaction scores, missed feedback, and reduced repeat visits!

**No technical experience needed** — we'll explain everything as we go.

---

## Table of Contents

1. [Before You Begin](#before-you-begin)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Suite Overview](#test-suite-overview)
4. [Happy Path Tests](#happy-path-tests)
5. [Invalid Input Tests](#invalid-input-tests)
6. [Integration Tests](#integration-tests)
7. [Performance Tests](#performance-tests)
8. [Security Tests](#security-tests)
9. [Edge Case Tests](#edge-case-tests)
10. [Observability Checklist](#observability-checklist)
11. [Common Issues & Solutions](#common-issues--solutions)
12. [Success Criteria](#success-criteria)
13. [Next Steps](#next-steps)

---

## Before You Begin

### Prerequisites

**You need:**
- [ ] n8n workflow installed and running (green "Active" toggle)
- [ ] Environment variables configured (see `/00_Shared/EnvMatrix.md`)
- [ ] SendGrid account with API key configured (for emails)
- [ ] Twilio account with phone number configured (for SMS)
- [ ] Google Sheets set up (optional, for tracking)
- [ ] Mock data ready (see `/00_Shared/MockIdentities.json`)

**You DON'T need:**
- ❌ Real patient data (use mock data only!)
- ❌ To wait 14 days for testing (we'll show you shortcuts!)
- ❌ Coding skills (we'll give you everything to copy/paste)

### What is a "Follow-Up Sequence"?

Think of it like this: When you visit your doctor, wouldn't it be nice if they checked in on you a few days later to see how you're feeling? That's what this module does automatically.

**The 14-day journey:**
- **Day 0** (immediately): "Thank you for your visit!" (email + SMS)
- **Day 3** (72 hours later): "How are you feeling?" (email + SMS)
- **Day 7** (96 hours after Day 3): "Please share your feedback!" (email + SMS with survey link)
- **Day 14** (168 hours after Day 7): "Ready to book your next visit?" (email only with booking link)

### Safety Reminders

⚠️ **NEVER use real patient data in testing!**

⚠️ **Test in a development environment** — not your live system!

⚠️ **Use mock data** from `MockIdentities.json` only

✅ **All test data is completely fictional and safe**

---

## Test Environment Setup

### Step 1: Verify Workflow is Active

**What to do:**
1. Open your n8n instance in a web browser
2. Click on "Workflows" in the left sidebar
3. Find "Aigent Module 05: Followup & Retention Enhanced (v1.1)"
4. Look at the toggle switch at the top-right

**What you should see:**
- Toggle switch should be ON (colored, not gray)
- You should see "Active" next to the toggle

**If it's not active:**
1. Click the toggle to turn it on
2. If it fails to activate, check the error message
3. Common issue: Missing environment variables (see [Troubleshooting.md](Troubleshooting.md))

---

### Step 2: Get Your Webhook URL

**What to do:**
1. Open the Module 05 workflow in n8n
2. Click on the first node (called "Webhook: Trigger Follow-Up Sequence")
3. Look for "Webhook URLs" section
4. You'll see two URLs: "Production URL" and "Test URL"
5. Copy the **Production URL** (it looks like: `https://your-n8n.com/webhook/aigent-followup`)

**What you should see:**
```
Production URL: https://your-n8n.com/webhook/aigent-followup
Test URL: https://your-n8n.com/webhook-test/aigent-followup
```

**Save this URL** — you'll use it in every test!

---

### Step 3: Prepare Your Testing Tool

**What is cURL?**

cURL is a command-line tool that lets you send data to webhooks. Think of it like filling out a form and clicking "Submit" — but you're doing it from your computer's terminal instead of a website.

**How to open your terminal:**
- **Windows:** Press `Win + R`, type `cmd`, press Enter
- **Mac:** Press `Cmd + Space`, type `Terminal`, press Enter
- **Linux:** Press `Ctrl + Alt + T`

**Test if cURL is installed:**

```bash
curl --version
```

**What you should see:** Version information like `curl 7.68.0`

**If not installed:**
- Windows: Download from https://curl.se/windows/
- Mac: Already installed by default
- Linux: Run `sudo apt-get install curl`

---

## Test Suite Overview

### Total Tests: 18 Comprehensive Tests

| Category | Test Count | Time to Run | Priority |
|----------|-----------|-------------|----------|
| Happy Path | 5 tests | ~10 minutes | P0 - Critical |
| Invalid Input | 6 tests | ~8 minutes | P1 - High |
| Integration | 3 tests | ~5 minutes | P0 - Critical |
| Performance | 2 tests | ~3 minutes | P2 - Medium |
| Security | 1 test | ~2 minutes | P1 - High |
| Edge Cases | 4 tests | ~6 minutes | P2 - Medium |
| **TOTAL** | **21 tests** | **~34 minutes** | |

### Test Categories Explained

**Happy Path Tests:** Everything works perfectly (the ideal scenario)

**Invalid Input Tests:** What happens when someone sends bad data (missing fields, wrong formats, etc.)

**Integration Tests:** Does this module work correctly with SendGrid, Twilio, and other systems?

**Performance Tests:** Is it fast enough? (Should respond in under 2 seconds)

**Security Tests:** Is patient data protected? (No PHI in logs)

**Edge Cases:** Unusual but valid scenarios (international characters, long names, etc.)

---

## Happy Path Tests

These tests verify that the module works correctly when everything is set up properly.

---

### Test HP-001: Complete Sequence Start (Email + SMS)

**Purpose:** Verify that a valid patient triggers the follow-up sequence with both email and SMS delivery.

**What this test checks:**
- ✅ Validation passes for complete patient data
- ✅ Day-0 thank-you email is sent via SendGrid
- ✅ Day-0 thank-you SMS is sent via Twilio
- ✅ Survey link is generated with tracking parameters
- ✅ Rebooking link is generated with UTM parameters
- ✅ Response includes sequence status and delivery tracking

**Test Data:**

```json
{
  "patient_id": "12345",
  "patient_email": "jane.doe@example.com",
  "patient_phone": "+1-555-123-4567",
  "patient_name": "Jane Doe",
  "visit_type": "General Consultation",
  "visit_date": "2025-10-30T14:00:00Z",
  "provider_name": "Dr. Smith"
}
```

**cURL Command:**

Replace `YOUR-WEBHOOK-URL` with the URL you copied in Step 2.

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "12345",
    "patient_email": "jane.doe@example.com",
    "patient_phone": "+1-555-123-4567",
    "patient_name": "Jane Doe",
    "visit_type": "General Consultation",
    "visit_date": "2025-10-30T14:00:00Z",
    "provider_name": "Dr. Smith"
  }'
```

**Steps to Execute:**

1. Open your terminal/command prompt
2. Copy the cURL command above
3. Replace `YOUR-WEBHOOK-URL` with your actual webhook URL
4. Paste the command into your terminal and press Enter
5. Wait 2-5 seconds for the response

**Expected Results:**

**HTTP Response (what you'll see in terminal):**

```json
{
  "success": true,
  "trace_id": "FU-1730300400000",
  "patient_id": "12345",
  "sequence_status": "initiated",
  "touches_sent": ["day0_email", "day0_sms"],
  "touch_results": [
    {
      "touch": "day0_email",
      "status": "sent",
      "sent_at": "2025-10-30T14:00:00Z"
    },
    {
      "touch": "day0_sms",
      "status": "sent",
      "sent_at": "2025-10-30T14:00:05Z",
      "sms_sid": "SM123abc..."
    }
  ],
  "survey_link": "https://example.com/survey?email=jane.doe%40example.com&patient_id=12345&trace_id=FU-1730300400000",
  "rebooking_link": "https://example.com/book?patient_id=12345&utm_source=followup&utm_medium=email&utm_campaign=day14_rebook&trace_id=FU-1730300400000",
  "execution_time_ms": 1200,
  "performance_category": "normal"
}
```

**Email Delivery (check SendGrid):**
1. Log into your SendGrid account
2. Go to "Activity" section
3. Filter by recipient: `jane.doe@example.com`
4. You should see an email with subject: "Thank you for your visit - [Your Clinic Name]"
5. Status should be "Delivered" (green)

**SMS Delivery (check Twilio):**
1. Log into your Twilio account
2. Go to "Messaging" → "Logs"
3. Filter by "To" number: `+1-555-123-4567`
4. You should see an SMS with message starting: "Hi Jane Doe, thank you for your visit..."
5. Status should be "Delivered" (green)

**n8n Execution Log:**
1. Open n8n in your browser
2. Click "Executions" in the left sidebar
3. You should see a new execution with status "Success" (green checkmark)
4. Click on it to see the detailed flow

**Pass Criteria:**

- [ ] HTTP response has `"success": true`
- [ ] Response includes `trace_id` starting with "FU-"
- [ ] Response shows `"touches_sent": ["day0_email", "day0_sms"]`
- [ ] Both touch_results show `"status": "sent"`
- [ ] Email delivered to inbox (check SendGrid Activity)
- [ ] SMS delivered to phone (check Twilio Logs)
- [ ] n8n execution shows "Success" status
- [ ] `execution_time_ms` is less than 3000 (3 seconds)
- [ ] Survey link includes tracking parameters (`trace_id`, `patient_id`, `email`)
- [ ] Rebooking link includes UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`)

**Common Mistakes:**

❌ **Forgetting to replace YOUR-WEBHOOK-URL** → cURL will fail with "Could not resolve host"

❌ **Using a real phone number** → Only use test numbers! Real numbers will receive SMS.

❌ **Not checking SendGrid/Twilio** → HTTP response shows "sent" but actual delivery may fail. Always verify in platform logs.

**Troubleshooting:**

**Problem:** Response shows `"status": "failed"` for day0_email

**Solution:**
1. Check SendGrid API key is configured in n8n (see [Troubleshooting.md](Troubleshooting.md))
2. Verify SendGrid account is active (not suspended)
3. Check SendGrid Activity for bounce/spam report

**Problem:** Response shows `"status": "failed"` for day0_sms

**Solution:**
1. Check Twilio credentials in n8n
2. Verify Twilio phone number is active
3. Check Twilio balance (need credits for SMS)
4. Verify phone number format (should be E.164: +1234567890)

---

### Test HP-002: Email-Only Sequence (No Phone Number)

**Purpose:** Verify that the sequence works correctly when no phone number is provided (email-only patients).

**What this test checks:**
- ✅ Validation passes without phone number
- ✅ Day-0 email is sent
- ✅ SMS is skipped gracefully (not marked as "failed")
- ✅ Sequence continues despite missing phone

**Test Data:**

```json
{
  "patient_id": "12346",
  "patient_email": "john.smith@example.com",
  "patient_name": "John Smith",
  "visit_type": "Follow-up Appointment"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "12346",
    "patient_email": "john.smith@example.com",
    "patient_name": "John Smith",
    "visit_type": "Follow-up Appointment"
  }'
```

**Expected Results:**

**HTTP Response:**

```json
{
  "success": true,
  "trace_id": "FU-1730300500000",
  "patient_id": "12346",
  "sequence_status": "initiated",
  "touches_sent": ["day0_email"],
  "touch_results": [
    {
      "touch": "day0_email",
      "status": "sent",
      "sent_at": "2025-10-30T14:05:00Z"
    }
  ]
}
```

**Pass Criteria:**

- [ ] HTTP response has `"success": true`
- [ ] Response shows `"touches_sent": ["day0_email"]` (only email, no SMS)
- [ ] touch_results array does NOT include day0_sms entry
- [ ] Email delivered (check SendGrid)
- [ ] No SMS attempted (check Twilio — should have no record)
- [ ] n8n execution shows "Success" status (not error)

**Why this matters:** About 20% of patients don't provide phone numbers. The module should handle this gracefully without failing.

---

### Test HP-003: Minimal Required Fields

**Purpose:** Verify that the sequence works with only the minimum required fields (patient_id, patient_email, visit_type).

**What this test checks:**
- ✅ Default values are applied for missing optional fields
- ✅ patient_name defaults to "Valued Patient"
- ✅ provider_name defaults to "Your Provider"
- ✅ visit_date defaults to current date
- ✅ Email personalization uses defaults correctly

**Test Data:**

```json
{
  "patient_id": "minimal_001",
  "patient_email": "minimal@example.com",
  "visit_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "minimal_001",
    "patient_email": "minimal@example.com",
    "visit_type": "Consultation"
  }'
```

**Expected Results:**

**HTTP Response:**

```json
{
  "success": true,
  "patient_id": "minimal_001",
  "touches_sent": ["day0_email"]
}
```

**Email Content (check SendGrid Activity → view email):**
- Greeting should say: "Hi Valued Patient," (default name)
- Email should mention: "Consultation" (visit type)
- Signature should say: "Your Provider and the [Clinic Name] Team" (default provider)

**Pass Criteria:**

- [ ] HTTP response has `"success": true`
- [ ] Email delivered with default values
- [ ] Email greeting shows "Hi Valued Patient,"
- [ ] Email signature shows "Your Provider"
- [ ] No validation errors

---

### Test HP-004: Survey Link Generation

**Purpose:** Verify that survey links are generated correctly with tracking parameters.

**What this test checks:**
- ✅ Survey link includes patient_id parameter
- ✅ Survey link includes email parameter (URL-encoded)
- ✅ Survey link includes trace_id parameter
- ✅ All parameters are properly URL-encoded

**Test Data:**

```json
{
  "patient_id": "survey_test_001",
  "patient_email": "survey.test+special@example.com",
  "visit_type": "Test Visit"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "survey_test_001",
    "patient_email": "survey.test+special@example.com",
    "visit_type": "Test Visit"
  }'
```

**Expected Results:**

**Survey Link Format:**

```
https://example.com/survey?email=survey.test%2Bspecial%40example.com&patient_id=survey_test_001&trace_id=FU-1730300600000
```

**Pass Criteria:**

- [ ] Response includes `survey_link` field
- [ ] Survey link starts with configured `SURVEY_BASE_URL`
- [ ] Email parameter is URL-encoded (`+` becomes `%2B`, `@` becomes `%40`)
- [ ] Survey link includes `patient_id=survey_test_001`
- [ ] Survey link includes `trace_id=FU-...`

**How to verify URL encoding:**
- `+` character should be `%2B`
- `@` character should be `%40`
- `.` character remains `.` (not encoded)

---

### Test HP-005: Rebooking Link with UTM Tracking

**Purpose:** Verify that rebooking links include proper UTM tracking parameters for analytics.

**What this test checks:**
- ✅ Rebooking link includes patient_id
- ✅ Rebooking link includes utm_source=followup
- ✅ Rebooking link includes utm_medium=email
- ✅ Rebooking link includes utm_campaign=day14_rebook
- ✅ Rebooking link includes trace_id

**Test Data:**

```json
{
  "patient_id": "rebook_test_001",
  "patient_email": "rebook@example.com",
  "visit_type": "General Consultation"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "rebook_test_001",
    "patient_email": "rebook@example.com",
    "visit_type": "General Consultation"
  }'
```

**Expected Results:**

**Rebooking Link Format:**

```
https://example.com/book?patient_id=rebook_test_001&utm_source=followup&utm_medium=email&utm_campaign=day14_rebook&trace_id=FU-1730300700000
```

**Pass Criteria:**

- [ ] Response includes `rebooking_link` field
- [ ] Link includes `utm_source=followup`
- [ ] Link includes `utm_medium=email`
- [ ] Link includes `utm_campaign=day14_rebook`
- [ ] Link includes `patient_id=rebook_test_001`
- [ ] Link includes `trace_id=FU-...`

**Why this matters:** UTM parameters allow you to track which follow-up emails drive rebookings in Google Analytics or your booking system.

---

## Invalid Input Tests

These tests verify that the module correctly rejects invalid or incomplete data.

---

### Test INV-001: Missing Required Field (patient_email)

**Purpose:** Verify that the module rejects requests without a patient email.

**Test Data:**

```json
{
  "patient_id": "12347",
  "patient_name": "Test Patient",
  "visit_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "12347",
    "patient_name": "Test Patient",
    "visit_type": "Consultation"
  }'
```

**Expected Results:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      "patient_email: required and must be valid email format"
    ]
  }
}
```

**Pass Criteria:**

- [ ] HTTP status code is 400 (Bad Request)
- [ ] Response has `"success": false`
- [ ] Error code is "VALIDATION_FAILED"
- [ ] Error details mention patient_email is required
- [ ] No email sent (check SendGrid)
- [ ] No SMS sent (check Twilio)

---

### Test INV-002: Invalid Email Format

**Purpose:** Verify that the module rejects invalid email addresses.

**Test Data:**

```json
{
  "patient_id": "12348",
  "patient_email": "not-an-email",
  "visit_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "12348",
    "patient_email": "not-an-email",
    "visit_type": "Consultation"
  }'
```

**Expected Results:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      "patient_email: required and must be valid email format"
    ]
  }
}
```

**Pass Criteria:**

- [ ] HTTP status code is 400
- [ ] Validation error mentions invalid email format
- [ ] No communications sent

---

### Test INV-003: Email Too Long (>320 characters)

**Purpose:** Verify that the module rejects emails exceeding RFC 5321 maximum length.

**Test Data:**

```json
{
  "patient_id": "12349",
  "patient_email": "this-is-a-very-long-email-address-that-exceeds-the-maximum-allowed-length-of-320-characters-according-to-rfc-5321-specifications-for-email-addresses-and-should-be-rejected-by-the-validation-logic-to-prevent-issues-with-email-delivery-systems-that-cannot-handle-such-long-addresses-properly-test@example.com",
  "visit_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "12349",
    "patient_email": "this-is-a-very-long-email-address-that-exceeds-the-maximum-allowed-length-of-320-characters-according-to-rfc-5321-specifications-for-email-addresses-and-should-be-rejected-by-the-validation-logic-to-prevent-issues-with-email-delivery-systems-that-cannot-handle-such-long-addresses-properly-test@example.com",
    "visit_type": "Consultation"
  }'
```

**Expected Results:**

```json
{
  "success": false,
  "error": {
    "details": [
      "patient_email: maximum 320 characters (RFC 5321)"
    ]
  }
}
```

**Pass Criteria:**

- [ ] HTTP status code is 400
- [ ] Error mentions 320 character limit
- [ ] No communications sent

---

### Test INV-004: Missing Required Field (patient_id)

**Purpose:** Verify that the module rejects requests without a patient ID.

**Test Data:**

```json
{
  "patient_email": "test@example.com",
  "visit_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "test@example.com",
    "visit_type": "Consultation"
  }'
```

**Expected Results:**

```json
{
  "success": false,
  "error": {
    "details": [
      "patient_id: required for CRM linking"
    ]
  }
}
```

**Pass Criteria:**

- [ ] HTTP status code is 400
- [ ] Error mentions patient_id is required
- [ ] No communications sent

---

### Test INV-005: Missing Required Field (visit_type)

**Purpose:** Verify that the module rejects requests without a visit type.

**Test Data:**

```json
{
  "patient_id": "12350",
  "patient_email": "test@example.com"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "12350",
    "patient_email": "test@example.com"
  }'
```

**Expected Results:**

```json
{
  "success": false,
  "error": {
    "details": [
      "visit_type: required for message personalization"
    ]
  }
}
```

**Pass Criteria:**

- [ ] HTTP status code is 400
- [ ] Error mentions visit_type is required

---

### Test INV-006: Phone Number Too Short

**Purpose:** Verify that phone numbers with fewer than 7 digits are rejected.

**Test Data:**

```json
{
  "patient_id": "12351",
  "patient_email": "test@example.com",
  "patient_phone": "12345",
  "visit_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "12351",
    "patient_email": "test@example.com",
    "patient_phone": "12345",
    "visit_type": "Consultation"
  }'
```

**Expected Results:**

```json
{
  "success": false,
  "error": {
    "details": [
      "patient_phone: must be 7-20 digits"
    ]
  }
}
```

**Pass Criteria:**

- [ ] HTTP status code is 400
- [ ] Error mentions phone must be 7-20 digits

---

### Test INV-007: Future Visit Date

**Purpose:** Verify that visit dates in the future are rejected.

**Test Data:**

```json
{
  "patient_id": "12352",
  "patient_email": "test@example.com",
  "visit_type": "Consultation",
  "visit_date": "2026-12-31T00:00:00Z"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "12352",
    "patient_email": "test@example.com",
    "visit_type": "Consultation",
    "visit_date": "2026-12-31T00:00:00Z"
  }'
```

**Expected Results:**

```json
{
  "success": false,
  "error": {
    "details": [
      "visit_date: cannot be in the future"
    ]
  }
}
```

**Pass Criteria:**

- [ ] HTTP status code is 400
- [ ] Error mentions visit date cannot be in future

**Why this matters:** Follow-up sequences should only start after a visit has occurred, not before.

---

## Integration Tests

These tests verify that Module 05 integrates correctly with external services.

---

### Test INT-001: SendGrid Email Delivery

**Purpose:** Verify that emails are successfully delivered through SendGrid.

**Prerequisites:**
- SendGrid API key configured
- SendGrid account active (not suspended)
- "From" email verified in SendGrid

**Test Data:**

Use the same data as Test HP-001.

**Additional Verification Steps:**

1. **Check SendGrid Activity Feed:**
   - Log into SendGrid dashboard
   - Go to Activity → Email Activity
   - Filter by "To Email": the test email address
   - Click on the email to see details

2. **Verify Email Content:**
   - Check Subject line matches: "Thank you for your visit - [Clinic Name]"
   - Check email body includes patient name
   - Check email body includes visit type
   - Check email body includes provider name

3. **Check Delivery Status:**
   - Status should be "Delivered" (not "Processed" or "Deferred")
   - No bounce or spam report
   - Delivery time <10 seconds

**Pass Criteria:**

- [ ] Email appears in SendGrid Activity within 5 seconds
- [ ] Status is "Delivered"
- [ ] Email content is properly personalized
- [ ] No bounce or spam report
- [ ] Click tracking enabled (if configured)

---

### Test INT-002: Twilio SMS Delivery

**Purpose:** Verify that SMS messages are successfully delivered through Twilio.

**Prerequisites:**
- Twilio Account SID and Auth Token configured
- Twilio phone number active
- Twilio account has sufficient credits

**Test Data:**

Use the same data as Test HP-001.

**Additional Verification Steps:**

1. **Check Twilio Messaging Logs:**
   - Log into Twilio console
   - Go to Messaging → Logs
   - Filter by "To": the test phone number
   - Click on the message to see details

2. **Verify SMS Content:**
   - Message should start: "Hi [Patient Name], thank you for your visit..."
   - Message should mention clinic name
   - Message should be from your configured Twilio number

3. **Check Delivery Status:**
   - Status should be "Delivered" (green)
   - Delivery time <30 seconds
   - Price charged should be visible

**Pass Criteria:**

- [ ] SMS appears in Twilio Logs within 10 seconds
- [ ] Status is "Delivered"
- [ ] SMS content is properly personalized
- [ ] Message sent from correct Twilio number
- [ ] No error codes

---

### Test INT-003: Google Sheets Logging (if configured)

**Purpose:** Verify that follow-up sequence data is logged to Google Sheets.

**Prerequisites:**
- Google Sheets integration configured in workflow
- Spreadsheet has correct permissions

**Test Data:**

Use the same data as Test HP-001.

**Verification Steps:**

1. Open your Google Sheets tracking spreadsheet
2. Go to the "Follow-Up Sequences" tab
3. Look for a new row with the test patient data

**Expected Row Data:**

| trace_id | patient_id | patient_email | sequence_status | touches_sent | created_at |
|----------|-----------|---------------|-----------------|--------------|------------|
| FU-1730... | 12345 | jane.doe@... | initiated | day0_email, day0_sms | 2025-10-30... |

**Pass Criteria:**

- [ ] New row appears in spreadsheet within 10 seconds
- [ ] All columns populated correctly
- [ ] trace_id matches response
- [ ] touches_sent lists both email and SMS

---

## Performance Tests

These tests verify that the module performs within acceptable time limits.

---

### Test PERF-001: Execution Time (Day-0 Response)

**Purpose:** Verify that the module responds within 3 seconds for Day-0 sequence initialization.

**Test Data:**

Use the same data as Test HP-001.

**Measurement:**

```bash
time curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "perf_test_001",
    "patient_email": "perf@example.com",
    "visit_type": "Performance Test"
  }'
```

The `time` command will show how long the request took.

**Expected Results:**

```
real    0m1.200s
user    0m0.010s
sys     0m0.005s
```

**Pass Criteria:**

- [ ] Total execution time (`real`) < 3000ms (3 seconds)
- [ ] Response includes `execution_time_ms` field
- [ ] `execution_time_ms` < 2000ms (normal performance)
- [ ] `performance_category` is "fast" or "normal" (not "slow")

**Performance Categories:**
- **fast:** <1000ms (excellent)
- **normal:** 1000-3000ms (acceptable)
- **slow:** >3000ms (investigate)

**If slow (>3000ms):**
- Check SendGrid/Twilio API response times
- Check n8n server resources (CPU, memory)
- Review n8n execution log for delays

---

### Test PERF-002: Concurrent Sequences

**Purpose:** Verify that the module can handle multiple sequences starting simultaneously.

**What this test does:** Starts 5 follow-up sequences at the same time to simulate multiple patients finishing visits simultaneously.

**Test Script:**

Save this as `concurrent_test.sh`:

```bash
#!/bin/bash

# Start 5 sequences concurrently
for i in {1..5}; do
  curl -X POST YOUR-WEBHOOK-URL \
    -H "Content-Type: application/json" \
    -d "{
      \"patient_id\": \"concurrent_$i\",
      \"patient_email\": \"concurrent$i@example.com\",
      \"visit_type\": \"Concurrent Test\"
    }" &
done

# Wait for all to complete
wait

echo "All 5 sequences started!"
```

Run it:

```bash
chmod +x concurrent_test.sh
./concurrent_test.sh
```

**Expected Results:**

All 5 requests should complete successfully within 5 seconds total.

**Pass Criteria:**

- [ ] All 5 requests return `"success": true`
- [ ] Total time for all 5 < 5 seconds
- [ ] No execution failures in n8n
- [ ] All 5 emails sent (check SendGrid)

---

## Security Tests

These tests verify that the module protects patient data appropriately.

---

### Test SEC-001: PHI Masking Verification

**Purpose:** Verify that no Protected Health Information (PHI) appears in logs or error messages.

**What is PHI?**

PHI (Protected Health Information) includes:
- Patient names
- Email addresses
- Phone numbers
- Visit details

**Important:** Module 05 handles marketing data, NOT clinical PHI. However, we still follow privacy best practices by not logging patient contact information unnecessarily.

**Test Data:**

```json
{
  "patient_id": "sec_test_001",
  "patient_email": "security.test@example.com",
  "patient_phone": "+1-555-999-8888",
  "patient_name": "Security Test Patient",
  "visit_type": "Security Verification Visit"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "sec_test_001",
    "patient_email": "security.test@example.com",
    "patient_phone": "+1-555-999-8888",
    "patient_name": "Security Test Patient",
    "visit_type": "Security Verification Visit"
  }'
```

**Verification Steps:**

1. **Check n8n Execution Log:**
   - Open the execution in n8n
   - Review each node's output
   - Patient email should be visible (needed for sending)
   - Phone number should be normalized but visible

2. **Check Console Logs:**
   - Patient data should NOT appear in server console logs
   - Only trace_id and execution status should be logged

**Pass Criteria:**

- [ ] Execution log shows data correctly (expected for debugging)
- [ ] No patient data in server console logs
- [ ] Error messages (if any) don't expose patient names or contact info
- [ ] Trace_id used for correlation instead of patient identifiers

**Note:** Unlike Module 06 (Document Capture), Module 05 does not implement Level 3 PHI masking because it handles marketing communications, not clinical data. However, best practices still apply.

---

## Edge Case Tests

These tests verify unusual but valid scenarios.

---

### Test EDGE-001: International Characters in Name

**Purpose:** Verify that patient names with international characters (accents, umlauts, etc.) are handled correctly.

**Test Data:**

```json
{
  "patient_id": "edge_001",
  "patient_email": "international@example.com",
  "patient_name": "José García-Pérez",
  "visit_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "edge_001",
    "patient_email": "international@example.com",
    "patient_name": "José García-Pérez",
    "visit_type": "Consultation"
  }'
```

**Expected Results:**

Email should greet: "Hi José García-Pérez," (with accents intact)

**Pass Criteria:**

- [ ] HTTP response has `"success": true`
- [ ] Email delivered successfully
- [ ] Email greeting shows name with correct accents
- [ ] No character encoding errors

---

### Test EDGE-002: Very Long Visit Type

**Purpose:** Verify that long visit types (up to 200 characters) are handled correctly.

**Test Data:**

```json
{
  "patient_id": "edge_002",
  "patient_email": "longvisit@example.com",
  "visit_type": "Comprehensive Annual Physical Exam with Full Blood Panel, Cardiovascular Screening, Cancer Screening, Mental Health Assessment, Nutritional Counseling, and Preventive Care Planning"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "edge_002",
    "patient_email": "longvisit@example.com",
    "visit_type": "Comprehensive Annual Physical Exam with Full Blood Panel, Cardiovascular Screening, Cancer Screening, Mental Health Assessment, Nutritional Counseling, and Preventive Care Planning"
  }'
```

**Pass Criteria:**

- [ ] HTTP response has `"success": true`
- [ ] Email shows full visit type correctly
- [ ] Email formatting is not broken by long text

---

### Test EDGE-003: Phone Number with Various Formats

**Purpose:** Verify that phone numbers in different formats are normalized correctly.

**Test Cases:**

| Format | Input | Expected Normalized | Expected Display |
|--------|-------|---------------------|------------------|
| US Standard | (555) 123-4567 | 15551234567 | (555) 123-4567 |
| E.164 | +15551234567 | 15551234567 | +15551234567 |
| Digits Only | 5551234567 | 15551234567 | 5551234567 |
| International | +44 20 7946 0958 | 442079460958 | +44 20 7946 0958 |

**Test Data (US Standard):**

```json
{
  "patient_id": "edge_003",
  "patient_email": "phone@example.com",
  "patient_phone": "(555) 123-4567",
  "visit_type": "Test"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "edge_003",
    "patient_email": "phone@example.com",
    "patient_phone": "(555) 123-4567",
    "visit_type": "Test"
  }'
```

**Pass Criteria:**

- [ ] SMS sent successfully (check Twilio)
- [ ] Twilio shows "To" number as +15551234567 (E.164 format)
- [ ] Original format preserved in response

**Repeat for each format above.**

---

### Test EDGE-004: Empty String vs Null for Optional Fields

**Purpose:** Verify that empty strings are treated the same as null for optional fields.

**Test Data:**

```json
{
  "patient_id": "edge_004",
  "patient_email": "empty@example.com",
  "patient_name": "",
  "patient_phone": "",
  "provider_name": "",
  "visit_type": "Test"
}
```

**cURL Command:**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "edge_004",
    "patient_email": "empty@example.com",
    "patient_name": "",
    "patient_phone": "",
    "provider_name": "",
    "visit_type": "Test"
  }'
```

**Expected Results:**

- patient_name should default to "Valued Patient"
- provider_name should default to "Your Provider"
- SMS should be skipped (empty phone treated as null)

**Pass Criteria:**

- [ ] HTTP response has `"success": true`
- [ ] Email greeting shows "Hi Valued Patient,"
- [ ] Email signature shows "Your Provider"
- [ ] No SMS sent (phone is empty)

---

## Observability Checklist

After each test, verify results in these 4 places:

### 1. HTTP Response

**What to check:**
- [ ] HTTP status code (200 for success, 400 for validation errors)
- [ ] Response has `success` field
- [ ] Response includes `trace_id` (for tracking)
- [ ] Response includes `touches_sent` array
- [ ] Response includes `execution_time_ms`

**Where to look:** Your terminal window after running cURL

---

### 2. n8n Execution History

**What to check:**
- [ ] New execution appears within 2 seconds
- [ ] Execution status is "Success" (green checkmark) or "Error" (red X)
- [ ] All nodes executed in correct order
- [ ] No timeout errors
- [ ] Data flows correctly between nodes

**Where to look:**
1. Open n8n in browser
2. Click "Executions" in left sidebar
3. Click on the most recent execution
4. Review node outputs

---

### 3. SendGrid Activity

**What to check:**
- [ ] Email appears in Activity feed within 5 seconds
- [ ] Status is "Delivered" (not bounced or deferred)
- [ ] Recipient email is correct
- [ ] Subject line is correct
- [ ] Email content is personalized

**Where to look:**
1. Log into SendGrid dashboard
2. Go to "Activity" → "Email Activity"
3. Filter by recipient email
4. Click on email for details

---

### 4. Twilio Messaging Logs

**What to check:**
- [ ] SMS appears in logs within 10 seconds
- [ ] Status is "Delivered" (green)
- [ ] "To" number is correct (E.164 format)
- [ ] "From" number is your Twilio number
- [ ] Message content is correct
- [ ] Price charged is visible

**Where to look:**
1. Log into Twilio console
2. Go to "Messaging" → "Logs" → "Messages"
3. Filter by "To" number
4. Click on message for details

---

## Common Issues & Solutions

### Issue 1: "Webhook URL not found" (HTTP 404)

**Symptoms:**
```
curl: (22) The requested URL returned error: 404
```

**Solutions:**

1. **Verify workflow is active:**
   - Open n8n → Workflows
   - Find Module 05 workflow
   - Check toggle is ON (green)

2. **Copy webhook URL again:**
   - Click on first node in workflow
   - Copy "Production URL"
   - Replace in cURL command

3. **Check for typos:**
   - URL should end with `/aigent-followup`
   - No extra spaces or characters

---

### Issue 2: "SendGrid email not delivered"

**Symptoms:**
- HTTP response shows `"status": "sent"` for email
- But SendGrid Activity shows "Bounced" or "Dropped"

**Solutions:**

1. **Check "From" email is verified:**
   - SendGrid → Settings → Sender Authentication
   - Verify the sender email

2. **Check recipient email:**
   - Use a real email address you control for testing
   - Don't use obviously fake emails like `test@test.com`

3. **Check SendGrid bounce reason:**
   - SendGrid → Activity → Click on email
   - Read bounce/drop reason
   - Common: "Invalid recipient" or "Spam"

---

### Issue 3: "Twilio SMS failed"

**Symptoms:**
- HTTP response shows `"status": "failed"` for SMS
- Or Twilio shows "Undelivered"

**Solutions:**

1. **Check phone number format:**
   - Should be E.164: `+1234567890`
   - US numbers need country code: +1

2. **Check Twilio balance:**
   - Twilio Console → Account → Balance
   - Need $1+ for sending

3. **Check Twilio number status:**
   - Twilio → Phone Numbers → Active Numbers
   - Number should be active (not released)

4. **Use Twilio test credentials (for testing):**
   - Twilio provides test credentials that don't send real SMS
   - See Twilio docs: "Test Credentials"

---

### Issue 4: "Validation fails but I have all required fields"

**Symptoms:**
```json
{
  "error": {
    "details": ["patient_email: required and must be valid email format"]
  }
}
```

**Solutions:**

1. **Check JSON syntax:**
   - Missing comma between fields?
   - Quotes around all strings?
   - No trailing comma on last field?

2. **Validate JSON format:**
   - Copy your JSON
   - Paste into https://jsonlint.com/
   - Fix any errors

3. **Check email format:**
   - Must have `@` symbol
   - Must have domain (`.com`, `.org`, etc.)
   - No spaces

---

### Issue 5: "Execution time is very slow (>3 seconds)"

**Symptoms:**
- Response takes 5+ seconds
- `performance_category` is "slow"

**Solutions:**

1. **Check SendGrid API response time:**
   - SendGrid may be slow if high volume
   - Check SendGrid status: https://status.sendgrid.com/

2. **Check Twilio API response time:**
   - Twilio status: https://status.twilio.com/

3. **Check n8n server resources:**
   - n8n server may be overloaded
   - Check CPU/memory usage
   - Consider upgrading server

4. **Disable retry logic temporarily:**
   - Edit workflow nodes
   - Turn off "Retry On Fail"
   - Test execution time
   - (Don't forget to re-enable!)

---

## Success Criteria

Your testing is complete when ALL of the following are true:

### Test Coverage

- [ ] All 5 Happy Path tests pass
- [ ] At least 5 Invalid Input tests pass
- [ ] All 3 Integration tests pass
- [ ] At least 1 Performance test passes
- [ ] Security test passes
- [ ] At least 2 Edge Case tests pass

### Observability

- [ ] n8n executions show "Success" for happy path tests
- [ ] SendGrid Activity shows emails delivered
- [ ] Twilio Logs show SMS delivered
- [ ] Execution time <3 seconds for 95% of tests

### Documentation

- [ ] Test results documented in [Checklist.md](Checklist.md)
- [ ] Any failures documented with error details
- [ ] Performance metrics recorded

### Quality

- [ ] No real patient data used in testing
- [ ] All test data is from MockIdentities.json or clearly fictional
- [ ] No PHI exposed in logs or error messages

---

## Next Steps

### After Testing Module 05

1. **Test Wait Node Timing (Advanced):**
   - See build_notes.md for manual resume webhook testing
   - Verify Day-3/7/14 touches send on schedule
   - Requires waiting or manual triggering

2. **Review Analytics:**
   - Module 07 (Analytics Dashboard) will aggregate follow-up data
   - Test how engagement metrics are calculated

3. **Test Module 04 → Module 05 Integration:**
   - Run full patient journey: Billing (Module 04) → Follow-Up (Module 05)
   - Verify automatic triggering

### Continuous Improvement

- **Monitor delivery rates weekly:**
  - Email delivery rate should be >95%
  - SMS delivery rate should be >90%

- **A/B test messaging:**
  - Try different email subject lines
  - Test different CTAs
  - Optimize survey completion rate

- **Refine timing:**
  - Test 14-day vs 21-day sequence
  - Experiment with different wait intervals

---

## Appendix: Quick Reference

### Webhook URL Template

```
https://your-n8n.com/webhook/aigent-followup
```

### Basic cURL Template

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "REPLACE",
    "patient_email": "REPLACE@example.com",
    "visit_type": "REPLACE"
  }'
```

### Required Fields

1. patient_id
2. patient_email
3. visit_type

### Optional Fields

- patient_phone
- patient_name (defaults to "Valued Patient")
- visit_date (defaults to now)
- provider_name (defaults to "Your Provider")

### Response Fields

- success (true/false)
- trace_id (tracking ID)
- touches_sent (array of delivered communications)
- touch_results (detailed delivery status)
- survey_link (with tracking parameters)
- rebooking_link (with UTM parameters)
- execution_time_ms (performance metric)

---

**End of Test Plan**

**Questions or Issues?**
- See [Troubleshooting.md](Troubleshooting.md) for detailed problem-solving
- See [Observability.md](Observability.md) for monitoring guidance
- See [KeyPoints.md](KeyPoints.md) for quick concept reference
