# Module 03: Telehealth Session - Test Plan

**Module:** 03 - Telehealth Session
**Version:** 1.1.0-enhanced
**Test Plan Version:** 1.0
**Last Updated:** 2025-10-31
**Audience:** Complete beginners welcome!

---

## Welcome!

This test plan will guide you through testing the **Telehealth Session** module step-by-step.

**What this module does:** Creates secure, HIPAA-compliant video session links for virtual appointments. When a patient books an appointment (from Module 02), this module automatically generates a Zoom/Doxy.me session and sends the link to both the patient and provider.

**Why testing matters:** This is a PHI-sensitive module (handles patient names, emails, phone numbers). If it fails, patients can't attend their virtual appointments, and your clinic loses revenue and patient trust!

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
- [ ] Video platform account (Zoom for Healthcare, Doxy.me, or Amwell)
- [ ] Twilio account configured for SMS (HIPAA-eligible)
- [ ] SendGrid account configured for email
- [ ] HubSpot CRM (optional, for CRM integration testing)
- [ ] Google Sheets set up with "Telehealth_Sessions" tab
- [ ] Mock data ready (see `/00_Shared/MockIdentities.json`)

**You DON'T need:**
- ❌ Real patient data (use mock data only!)
- ❌ Production CRM or video platform
- ❌ Coding skills (we'll give you everything to copy/paste)

### Safety Reminders

⚠️ **NEVER use real patient data in testing!**

⚠️ **Test in a development environment** — not your live system!

⚠️ **Use mock data** from `MockIdentities.json` only

⚠️ **PHI Handling:** This module is PHI-sensitive. All test data should be completely fictional.

✅ **All test data is completely fictional and safe**

---

## Key Concepts Explained

Before we start testing, let's understand some important terms:

### What is a Telehealth Session?

**Simple explanation:** A video meeting between a patient and provider, like FaceTime or Zoom, but HIPAA-compliant for healthcare.

**Real-world analogy:** It's like scheduling a meeting room at your office. The module creates the "room" (video session), generates the room key (password), and emails the room number (join link) to everyone invited.

### What is PHI?

**PHI** stands for **Protected Health Information** — any patient data like names, emails, phone numbers, medical details.

**Why it matters:** Federal law (HIPAA) requires us to protect this data. If PHI is exposed in logs or notifications, your clinic could face fines.

### What is PHI Masking?

**Simple explanation:** Hiding parts of patient data so it's still useful but not fully identifiable.

**Example:**
- Full PHI: `jane.doe@example.com`
- Masked PHI: `j***e@example.com`

**Why we do it:** Logs and staff notifications use masked data to minimize PHI exposure.

### What is a Webhook?

**Webhook:** A special URL that receives data when something happens. Like a mailbox — people can drop letters in, you check it periodically to see what arrived.

**For Module 03:** The webhook accepts booking confirmation data from Module 02 and creates a video session.

---

## Test Environment Setup

### Step 1: Verify Workflow is Active

**What to do:**
1. Open your n8n instance in a web browser
2. Click on "Workflows" in the left sidebar
3. Find "Aigent_Module_03_Telehealth_Session_Enhanced"
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
1. Open the Module 03 workflow in n8n
2. Click on the first node (called "Webhook Trigger - Appointment Confirmed")
3. Look for "Webhook URLs" section
4. You'll see two URLs: "Production URL" and "Test URL"
5. Copy the **Production URL** (it looks like: `https://your-n8n.com/webhook/telehealth-session`)

**What you should see:**
```
Production URL: https://your-n8n.com/webhook/telehealth-session
Test URL: https://your-n8n.com/webhook-test/telehealth-session
```

**Save this URL** — you'll use it in every test!

---

### Step 3: Verify Video Platform Credentials

**What to do:**
1. In n8n, go to **Credentials** (left sidebar)
2. Find your video platform credential (e.g., "Zoom OAuth API" or "Doxy.me API")
3. Click "Test" to verify it's working

**What you should see:**
- ✅ Green checkmark: "Credential test successful"

**If it fails:**
- ❌ Red X: Check your API key or OAuth token
- See [Troubleshooting.md](Troubleshooting.md) → "Zoom API authentication failed"

---

### Step 4: Set Up Terminal/Command Prompt

**What you need:** A way to send HTTP requests. We'll use `cURL` (built into Mac/Linux/Windows).

**On Windows:**
1. Press `Win + R`
2. Type `cmd` and press Enter
3. You'll see a black window — this is your command prompt

**On Mac/Linux:**
1. Press `Cmd + Space` (Mac) or `Ctrl + Alt + T` (Linux)
2. Type `terminal` and press Enter

**Test cURL is installed:**
```bash
curl --version
```

**What you should see:**
```
curl 7.88.1 (or similar version number)
```

**If "command not found":** Install cURL from https://curl.se/download.html

---

## Test Suite Overview

### Total Tests: 18

| Category | Count | Time Estimate |
|----------|-------|---------------|
| Happy Path Tests | 3 | 15 minutes |
| Invalid Input Tests | 6 | 20 minutes |
| Integration Tests | 4 | 25 minutes |
| Performance Tests | 1 | 10 minutes |
| Security Tests | 2 | 15 minutes |
| Edge Case Tests | 2 | 15 minutes |
| **Total** | **18** | **~100 minutes** |

### Priority Breakdown

- **P0 (Critical):** 5 tests — Must pass before production
- **P1 (High):** 8 tests — Should pass, investigate failures
- **P2 (Medium):** 3 tests — Nice to have, can defer
- **P3 (Low):** 2 tests — Optional, future improvements

---

## Happy Path Tests

**Purpose:** Verify the module works correctly when everything is perfect.

**Think of it like:** Testing a car on a smooth road with no obstacles.

---

### HP-001: Create Valid Telehealth Session (Zoom)

**Priority:** P0-Critical

**Purpose:** Verify that a valid booking confirmation creates a Zoom session and sends notifications.

**What this tests:**
- Webhook accepts booking data
- Validation passes
- Zoom API creates meeting
- Patient receives SMS with join link
- Patient receives email with join link
- Provider receives email with host link
- CRM is updated with session info
- Google Sheets logs the session (with masked PHI)

---

#### Test Data

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_appt_001",
  "booking_id": "test_booking_001",
  "patient_name": "Sarah Mitchell",
  "patient_email": "sarah.test@example.com",
  "patient_phone": "+15550001234",
  "scheduled_time": "2025-11-10T14:00:00.000Z",
  "duration_minutes": 30,
  "timezone": "America/New_York",
  "service_type": "General Consultation",
  "provider_name": "Dr. Emily Chen",
  "provider_email": "dr.chen@yourclinic.com",
  "contact_id": "test_contact_001"
}
```

**Note:** This uses fictional data from `/00_Shared/MockIdentities.json` (Sarah Mitchell identity).

---

#### cURL Command

**Replace `YOUR-WEBHOOK-URL` with your actual webhook URL from Step 2!**

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "test_appt_001",
    "booking_id": "test_booking_001",
    "patient_name": "Sarah Mitchell",
    "patient_email": "sarah.test@example.com",
    "patient_phone": "+15550001234",
    "scheduled_time": "2025-11-10T14:00:00.000Z",
    "duration_minutes": 30,
    "timezone": "America/New_York",
    "service_type": "General Consultation",
    "provider_name": "Dr. Emily Chen",
    "provider_email": "dr.chen@yourclinic.com",
    "contact_id": "test_contact_001"
  }'
```

**Windows users:** Use this one-line version (remove backslashes):
```bash
curl -X POST YOUR-WEBHOOK-URL -H "Content-Type: application/json" -d "{\"appointment_confirmed\": true, \"appointment_id\": \"test_appt_001\", \"patient_name\": \"Sarah Mitchell\", \"patient_email\": \"sarah.test@example.com\", \"patient_phone\": \"+15550001234\", \"scheduled_time\": \"2025-11-10T14:00:00.000Z\", \"duration_minutes\": 30}"
```

---

#### Steps to Execute

1. **Open your terminal/command prompt**
2. **Copy the cURL command** (replace `YOUR-WEBHOOK-URL`)
3. **Paste it into your terminal** and press Enter
4. **Wait 3-5 seconds** for the response
5. **Check the response** in your terminal

---

#### Expected Results

**1. HTTP Response (200 OK):**

You should see something like this in your terminal:

```json
{
  "success": true,
  "message": "Telehealth session created successfully",
  "data": {
    "session_id": "clinic-001_test_appt_001_1730822400000",
    "appointment_id": "test_appt_001",
    "booking_id": "test_booking_001",
    "platform_meeting_id": "1234567890",
    "session_link": "https://zoom.us/j/1234567890?pwd=abc123",
    "host_link": "https://zoom.us/s/1234567890?zak=xyz789",
    "session_password": "secure123",
    "scheduled_time": "2025-11-10T14:00:00.000Z",
    "scheduled_time_formatted": "Sunday, November 10, 2025 at 2:00 PM",
    "duration_minutes": 30,
    "timezone": "America/New_York",
    "expires_at": "2025-11-11T14:00:00.000Z",
    "patient_email": "sarah.test@example.com",
    "patient_name": "Sarah Mitchell",
    "provider_name": "Dr. Emily Chen",
    "provider": "Zoom",
    "contact_id": "test_contact_001"
  },
  "metadata": {
    "workflow_version": "1.1.0-enhanced",
    "trace_id": "SESSION-1730822400000",
    "execution_time_ms": 1850,
    "performance_category": "fast",
    "crm_updated": true,
    "patient_sms_sent": true,
    "patient_email_sent": true,
    "provider_email_sent": true,
    "logged": true,
    "phi_level": "HIGH",
    "security_compliant": true
  }
}
```

**What to look for:**
- ✅ `"success": true`
- ✅ `session_link` is a valid Zoom URL
- ✅ `session_password` is present (if passwords enabled)
- ✅ `metadata.execution_time_ms` is less than 3000ms
- ✅ All delivery flags are `true` (crm_updated, patient_sms_sent, etc.)

---

**2. n8n Execution Log:**

1. Go to n8n web interface
2. Click "Executions" in left sidebar
3. You should see a new execution with green "Success" status
4. Click on it to see details
5. All nodes should have green checkmarks

**What you should see:**
- ✅ Green "Success" label at the top
- ✅ All nodes have green checkmarks (no red X's)
- ✅ Execution time is displayed (should be <3 seconds)

---

**3. Patient SMS (Twilio):**

Check your test phone number (or Twilio logs):

```
Hi Sarah,

Your telehealth appointment is ready!

📅 Sunday, November 10
🕐 2:00 PM America/New_York
🎥 Provider: Dr. Emily Chen

🔗 Join here:
https://zoom.us/j/1234567890?pwd=abc123

🔑 Password: secure123

⚠️ Join 5 min early to test your connection.

Questions? Call +1-555-123-4567

- Your Clinic Name Team
```

**What to look for:**
- ✅ SMS delivered to test phone (+15550001234)
- ✅ Join link is clickable
- ✅ Password is displayed (if required)
- ✅ Date/time are correct with timezone

---

**4. Patient Email (SendGrid):**

Check your test email inbox (sarah.test@example.com):

**Subject:** `Your Telehealth Appointment - Nov 10, 2025`

**Body should include:**
- ✅ Header with clinic name/logo
- ✅ Appointment details (date, time, provider)
- ✅ Large "Join Telehealth Appointment" button
- ✅ Password display (if required)
- ✅ Pre-appointment checklist (test audio/video, etc.)
- ✅ HIPAA compliance notice at bottom

---

**5. Provider Email (SendGrid):**

Check provider test inbox (dr.chen@yourclinic.com):

**Subject:** `Telehealth Ready - S*** M*** - Nov 10, 2:00 PM`

**Note:** Subject uses **masked patient name** for inbox privacy!

**Body should include:**
- ✅ Full patient name: "Sarah Mitchell" (unmasked in body)
- ✅ Patient contact: email and phone
- ✅ "Start Session (Host Link)" button
- ✅ Session credentials (meeting ID, password)

---

**6. CRM Update (HubSpot):**

If CRM integration is enabled:

1. Log into HubSpot
2. Search for contact: "Sarah Mitchell" or contact_id "test_contact_001"
3. Check custom fields

**What you should see:**
- ✅ `telehealth_status` = "SCHEDULED"
- ✅ `telehealth_link` = Zoom join URL
- ✅ `telehealth_session_id` = session ID from response
- ✅ `telehealth_platform` = "Zoom"
- ✅ `telehealth_expires_at` = 1 day after appointment time

---

**7. Google Sheets Log:**

1. Open your Google Sheets audit log
2. Go to "Telehealth_Sessions" tab
3. Check the last row

**What you should see (masked PHI):**
```
timestamp: 2025-10-31T...
session_id: clinic-001_test_appt_001_...
appointment_id: test_appt_001
platform_meeting_id: 1234567890
patient_name_masked: S*** M***
patient_email_masked: s***h@example.com
patient_phone_masked: +1-555-***-4234
provider_name: Dr. Emily Chen
scheduled_time: 2025-11-10T14:00:00.000Z
duration: 30
timezone: America/New_York
platform: Zoom
status: SCHEDULED
expires_at: 2025-11-11T14:00:00.000Z
```

**Important:** PHI should be MASKED in Google Sheets (not full patient data)!

---

#### Pass Criteria

Check all that apply:

- [ ] HTTP response returns 200 status code
- [ ] Response includes `"success": true`
- [ ] `session_link` is a valid URL
- [ ] `session_password` is present (if enabled)
- [ ] n8n execution shows green "Success"
- [ ] Patient receives SMS with join link
- [ ] Patient receives email with join link
- [ ] Provider receives email with host link (subject has masked patient name)
- [ ] CRM updated with session details (if enabled)
- [ ] Google Sheets log entry created with masked PHI
- [ ] Execution time < 3000ms

**If ALL boxes are checked:** ✅ **TEST PASSED**

**If ANY box is unchecked:** ❌ **TEST FAILED** — see [Common Issues & Solutions](#common-issues--solutions)

---

#### Common Mistakes

**Mistake #1:** Using production webhook URL in test environment
- **Fix:** Make sure you're using the test environment webhook

**Mistake #2:** Forgetting to replace `YOUR-WEBHOOK-URL`
- **Fix:** Copy your actual webhook URL from n8n and paste it in the cURL command

**Mistake #3:** Using past date for `scheduled_time`
- **Fix:** Always use a future date (at least 1 day from now)

**Mistake #4:** Checking for unmasked PHI in Google Sheets
- **Fix:** Google Sheets should have MASKED patient data (S*** M***), not full names

---

#### Troubleshooting

**Problem:** "Connection refused" or "Could not resolve host"
- **Likely cause:** Incorrect webhook URL
- **Solution:** Double-check webhook URL in n8n, make sure workflow is active

**Problem:** 400 error "Validation failed"
- **Likely cause:** Missing required fields
- **Solution:** Check that all required fields are in the JSON (appointment_id, patient_email, patient_name, scheduled_time)

**Problem:** 500 error "Zoom API authentication failed"
- **Likely cause:** Invalid Zoom credentials
- **Solution:** See [Troubleshooting.md](Troubleshooting.md) → "Zoom API authentication failed"

**Problem:** Workflow succeeds but patient doesn't receive SMS
- **Likely cause:** Invalid phone format or Twilio issue
- **Solution:** Verify phone is in E.164 format (+15551234567), check Twilio logs

---

### HP-002: Create Session with Doxy.me Platform

**Priority:** P1-High

**Purpose:** Verify the module works with Doxy.me video platform (alternative to Zoom).

**Prerequisites:**
- Set `TELEHEALTH_PROVIDER_NAME=Doxy.me` in environment variables
- Doxy.me API credential configured

#### Test Data

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_doxy_001",
  "patient_name": "Michael Rodriguez",
  "patient_email": "michael.test@example.com",
  "scheduled_time": "2025-11-11T15:30:00.000Z",
  "duration_minutes": 45,
  "provider_name": "Dr. James Wilson"
}
```

#### cURL Command

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "test_doxy_001",
    "patient_name": "Michael Rodriguez",
    "patient_email": "michael.test@example.com",
    "scheduled_time": "2025-11-11T15:30:00.000Z",
    "duration_minutes": 45,
    "provider_name": "Dr. James Wilson"
  }'
```

#### Expected Results

**HTTP Response:**
```json
{
  "success": true,
  "data": {
    "session_link": "https://doxy.me/clinic-001-session-456",
    "host_link": "https://doxy.me/clinic-001-session-456?provider=true",
    "session_password": "1234",
    "provider": "Doxy.me"
  }
}
```

**Pass Criteria:**
- [ ] Response includes Doxy.me URLs (not Zoom)
- [ ] `session_link` does NOT have `?provider=true` parameter
- [ ] `host_link` DOES have `?provider=true` parameter
- [ ] Patient email includes Doxy.me link

---

### HP-003: Session with Optional Fields

**Priority:** P2-Medium

**Purpose:** Verify session creation works with minimal required fields (optional fields use defaults).

#### Test Data (Minimal)

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_minimal_001",
  "patient_name": "Emma Thompson",
  "patient_email": "emma.test@example.com",
  "scheduled_time": "2025-11-12T10:00:00.000Z"
}
```

**Note:** No `duration_minutes`, `timezone`, `provider_name`, etc.

#### Expected Results

**Response should include defaults:**
- `duration_minutes`: 30 (from `DEFAULT_SESSION_DURATION` env var)
- `timezone`: "America/New_York" (from `CLINIC_TIMEZONE` env var)
- `provider_name`: "Provider" (from `DEFAULT_PROVIDER_NAME` env var)

**Pass Criteria:**
- [ ] Session created successfully
- [ ] Duration = 30 minutes (default)
- [ ] Timezone = clinic default
- [ ] Provider name = default provider

---

## Invalid Input Tests

**Purpose:** Verify the module rejects bad data gracefully.

**Think of it like:** Testing how a car handles potholes and obstacles.

---

### INV-001: Missing Required Field (appointment_id)

**Priority:** P0-Critical

**Purpose:** Verify validation rejects requests missing `appointment_id`.

#### Test Data

```json
{
  "appointment_confirmed": true,
  "patient_name": "Test Patient",
  "patient_email": "test@example.com",
  "scheduled_time": "2025-11-10T14:00:00.000Z"
}
```

**Note:** `appointment_id` is missing!

#### cURL Command

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "patient_name": "Test Patient",
    "patient_email": "test@example.com",
    "scheduled_time": "2025-11-10T14:00:00.000Z"
  }'
```

#### Expected Results

**HTTP Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "Validation failed",
  "error_code": "VALIDATION_FAILED",
  "details": [
    "appointment_id: required"
  ],
  "timestamp": "2025-10-31T...",
  "trace_id": "SESSION-...",
  "support_email": "support@yourclinic.com"
}
```

**Pass Criteria:**
- [ ] HTTP status code is 400 (not 200 or 500)
- [ ] Response includes `"success": false`
- [ ] `error_code` = "VALIDATION_FAILED"
- [ ] `details` array includes "appointment_id: required"
- [ ] **No PHI in error message** (no patient name/email mentioned)

**Common Mistake:** Expecting 200 status — validation errors should return 400!

---

### INV-002: Invalid Email Format

**Priority:** P0-Critical

**Purpose:** Verify validation rejects invalid email addresses.

#### Test Data

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_invalid_email",
  "patient_name": "Test Patient",
  "patient_email": "not-an-email",
  "scheduled_time": "2025-11-10T14:00:00.000Z"
}
```

#### Expected Results

**HTTP Response (400):**
```json
{
  "success": false,
  "details": [
    "patient_email: required and must be valid format"
  ]
}
```

**Pass Criteria:**
- [ ] HTTP status 400
- [ ] Error mentions invalid email format
- [ ] No session created
- [ ] No notifications sent

---

### INV-003: Invalid Date Format

**Priority:** P1-High

**Purpose:** Verify validation rejects non-ISO 8601 dates.

#### Test Data

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_bad_date",
  "patient_name": "Test Patient",
  "patient_email": "test@example.com",
  "scheduled_time": "11/10/2025 2:00 PM"
}
```

**Note:** Date should be ISO 8601 format (`2025-11-10T14:00:00.000Z`), not human-readable.

#### Expected Results

**HTTP Response (400):**
```json
{
  "details": [
    "scheduled_time: must be valid ISO 8601 format"
  ]
}
```

---

### INV-004: Duration Out of Range (Too Long)

**Priority:** P2-Medium

**Purpose:** Verify validation rejects sessions longer than 240 minutes (prevents abuse).

#### Test Data

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_long_duration",
  "patient_name": "Test Patient",
  "patient_email": "test@example.com",
  "scheduled_time": "2025-11-10T14:00:00.000Z",
  "duration_minutes": 500
}
```

#### Expected Results

**HTTP Response (400):**
```json
{
  "details": [
    "duration_minutes: must be between 5 and 240"
  ]
}
```

---

### INV-005: Name Too Short

**Priority:** P2-Medium

**Purpose:** Verify validation rejects names with less than 2 characters.

#### Test Data

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_short_name",
  "patient_name": "A",
  "patient_email": "test@example.com",
  "scheduled_time": "2025-11-10T14:00:00.000Z"
}
```

#### Expected Results

**HTTP Response (400):**
```json
{
  "details": [
    "patient_name: required, minimum 2 characters"
  ]
}
```

---

### INV-006: Appointment Not Confirmed

**Priority:** P1-High

**Purpose:** Verify module only creates sessions for confirmed appointments.

#### Test Data

```json
{
  "appointment_confirmed": false,
  "appointment_id": "test_not_confirmed",
  "patient_name": "Test Patient",
  "patient_email": "test@example.com",
  "scheduled_time": "2025-11-10T14:00:00.000Z"
}
```

#### Expected Results

**HTTP Response (400):**
```json
{
  "details": [
    "appointment_confirmed: must be true to create session"
  ]
}
```

---

## Integration Tests

**Purpose:** Verify module integrates correctly with external systems.

---

### INT-001: Zoom API Integration

**Priority:** P0-Critical

**Purpose:** Verify Zoom meeting is actually created on Zoom platform.

#### Test Steps

1. Run HP-001 test (create valid session)
2. Copy `platform_meeting_id` from response
3. Log into Zoom web dashboard (zoom.us)
4. Go to "Meetings" section
5. Search for meeting ID

#### Expected Results

**Zoom Dashboard should show:**
- [ ] Meeting exists with matching ID
- [ ] Topic: "General Consultation - Sarah Mitchell"
- [ ] Scheduled time: Nov 10, 2025, 2:00 PM
- [ ] Duration: 30 minutes
- [ ] Waiting room: Enabled
- [ ] Password: Required
- [ ] Encryption: Enhanced

---

### INT-002: CRM Update (HubSpot)

**Priority:** P1-High

**Purpose:** Verify HubSpot contact is updated with session details.

#### Prerequisites

- HubSpot credential configured
- Contact with ID "test_contact_001" exists
- Custom fields created

#### Test Steps

1. Run HP-001 test
2. Log into HubSpot
3. Find contact "Sarah Mitchell"
4. Check custom fields

#### Expected Results

- [ ] `telehealth_status` = "SCHEDULED"
- [ ] `telehealth_link` contains Zoom URL
- [ ] `telehealth_session_id` matches response
- [ ] `telehealth_expires_at` = 1 day after appointment

---

### INT-003: SMS Delivery (Twilio)

**Priority:** P1-High

**Purpose:** Verify SMS is actually delivered via Twilio.

#### Test Steps

1. Run HP-001 test
2. Log into Twilio console
3. Go to Monitor → Logs → Messaging
4. Search for phone number +15550001234

#### Expected Results

- [ ] Message status: "delivered"
- [ ] Message body includes join link
- [ ] Delivery timestamp within 10 seconds of test

---

### INT-004: Email Delivery (SendGrid)

**Priority:** P1-High

**Purpose:** Verify emails are delivered via SendGrid.

#### Test Steps

1. Run HP-001 test
2. Log into SendGrid dashboard
3. Go to Activity Feed
4. Search for recipient "sarah.test@example.com"

#### Expected Results

- [ ] 1 email to patient (sarah.test@example.com)
- [ ] 1 email to provider (dr.chen@yourclinic.com)
- [ ] Both show status: "Delivered"
- [ ] Open rate tracked (if enabled)

---

## Performance Tests

### PERF-001: Execution Time Under Load

**Priority:** P2-Medium

**Purpose:** Verify module completes within target time (<2200ms average).

#### Test Steps

1. Run HP-001 test 10 times
2. Record `execution_time_ms` from each response
3. Calculate average

#### Expected Results

- [ ] Average execution time < 2200ms
- [ ] All executions < 5000ms (max acceptable)
- [ ] No timeouts

**If average > 2200ms:** See [Troubleshooting.md](Troubleshooting.md) → "Execution time too slow"

---

## Security Tests

### SEC-001: PHI Masking in Logs

**Priority:** P0-Critical

**Purpose:** Verify patient PHI is masked in audit logs (HIPAA compliance).

#### Test Steps

1. Run HP-001 test
2. Check Google Sheets "Telehealth_Sessions" tab
3. Look at patient data columns

#### Expected Results

**Google Sheets should show MASKED data:**
- [ ] `patient_name_masked` = "S*** M***" (not "Sarah Mitchell")
- [ ] `patient_email_masked` = "s***h@example.com" (not full email)
- [ ] `patient_phone_masked` = "+1-555-***-4234" (last 4 digits only)

**FAIL if:** Full patient names, emails, or phone numbers appear in Google Sheets!

---

### SEC-002: Provider Email Subject Privacy

**Priority:** P1-High

**Purpose:** Verify provider email subject uses masked patient name (inbox privacy).

#### Test Steps

1. Run HP-001 test
2. Check provider email inbox
3. Look at email subject line

#### Expected Results

**Subject should be:**
```
Telehealth Ready - S*** M*** - Nov 10, 2:00 PM
```

**NOT:**
```
Telehealth Ready - Sarah Mitchell - Nov 10, 2:00 PM
```

**Why this matters:** Email preview in Outlook/Gmail shows subject line. Masking prevents PHI exposure if screen is visible to others.

---

## Edge Case Tests

### EDGE-001: International Patient (Non-US Phone)

**Priority:** P2-Medium

**Purpose:** Verify module handles international phone numbers.

#### Test Data

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_intl_001",
  "patient_name": "Yuki Tanaka",
  "patient_email": "yuki.test@example.com",
  "patient_phone": "+81-90-1234-5678",
  "scheduled_time": "2025-11-10T14:00:00.000Z"
}
```

**Note:** Phone is Japan format (+81)

#### Expected Results

- [ ] Session created successfully
- [ ] SMS sent to +81-90-1234-5678
- [ ] Phone masked correctly in logs (+81-90-***-5678)

---

### EDGE-002: Special Characters in Name

**Priority:** P3-Low

**Purpose:** Verify module handles names with accents, hyphens, apostrophes.

#### Test Data

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_special_chars",
  "patient_name": "María José O'Brien-González",
  "patient_email": "maria.test@example.com",
  "scheduled_time": "2025-11-10T14:00:00.000Z"
}
```

#### Expected Results

- [ ] Session created successfully
- [ ] Name appears correctly in email (with accents preserved)
- [ ] No encoding errors

---

## Observability Checklist

After each test, verify these 6 places:

- [ ] **1. HTTP Response:** Status code and JSON body
- [ ] **2. n8n Execution Log:** Green success status
- [ ] **3. Patient SMS:** Delivered with join link
- [ ] **4. Patient Email:** Delivered with join button
- [ ] **5. Provider Email:** Delivered with host link
- [ ] **6. Google Sheets:** Log entry with masked PHI
- [ ] **7. CRM (optional):** Contact updated with session details

**If ANY of these fail:** Module is not working correctly!

---

## Common Issues & Solutions

### Issue: "Zoom API authentication failed"

**Symptoms:** HTTP 500 error, message mentions Zoom authentication

**Solutions:**
1. Re-authorize Zoom OAuth credential in n8n
2. Verify Zoom account has API access enabled
3. Check `TELEHEALTH_CREDENTIAL_ID` environment variable

See [Troubleshooting.md](Troubleshooting.md) for detailed steps.

---

### Issue: Patient doesn't receive SMS

**Symptoms:** Workflow succeeds, but no SMS delivered

**Solutions:**
1. Check phone is in E.164 format (+15551234567)
2. Verify Twilio logs for delivery status
3. Ensure Twilio account has sufficient credits
4. Check for carrier filtering (spam)

---

### Issue: Session link doesn't work

**Symptoms:** Patient clicks link, gets "Invalid meeting ID"

**Solutions:**
1. Check meeting was created in Zoom dashboard
2. Verify scheduled time (can't join until 10 min before)
3. Test password (if required)
4. Try browser compatibility (Chrome/Firefox recommended)

---

## Success Criteria

**Module 03 is ready for production when:**

- [ ] All P0 tests pass (5 critical tests)
- [ ] At least 80% of P1 tests pass (6 out of 8)
- [ ] PHI masking works correctly (SEC-001 passes)
- [ ] Average execution time < 2200ms
- [ ] Video platform integration verified (INT-001)
- [ ] Notifications delivered (SMS + email)
- [ ] No PHI exposed in logs or error messages

---

## Next Steps

**After completing this test plan:**

1. **Document results:** Use [Checklist.md](Checklist.md) to track pass/fail
2. **Review failures:** Check [Troubleshooting.md](Troubleshooting.md) for solutions
3. **Test Module 04:** Billing & Payments (depends on Module 03 output)
4. **Production deployment:** If all P0 tests pass

**Questions?** See `/00_Shared/README.md` or contact support.

---

**You've completed the Module 03 Test Plan! 🎉**

Remember: Testing is critical for patient safety and HIPAA compliance. Never skip security tests!
