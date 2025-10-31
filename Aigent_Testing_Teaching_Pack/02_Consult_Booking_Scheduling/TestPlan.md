# Module 02: Consult Booking & Scheduling - Test Plan

**Module:** 02 - Consult Booking & Scheduling
**Version:** 1.1.0-enhanced
**Test Plan Version:** 1.0
**Last Updated:** 2025-10-31
**Audience:** Complete beginners welcome!

---

## Welcome!

This test plan will guide you through testing the **Consult Booking & Scheduling** module step-by-step.

**What this module does:** Automates appointment booking by checking calendar availability, preventing double-bookings, handling timezone conversions, and sending confirmation emails and SMS messages with calendar attachments (.ics files).

**Why testing matters:** This module is the bridge between patient interest and actual appointments. If it fails, patients can't book appointments, leading to lost revenue and poor patient experience!

**No technical experience needed** — we'll explain everything as we go.

---

## Table of Contents

1. [Before You Begin](#before-you-begin)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Suite Overview](#test-suite-overview)
4. [Happy Path Tests](#happy-path-tests)
5. [Invalid Input Tests](#invalid-input-tests)
6. [Edge Case Tests](#edge-case-tests)
7. [Integration Tests](#integration-tests)
8. [Performance Tests](#performance-tests)
9. [Security Tests](#security-tests)
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
- [ ] Scheduling system set up (Google Calendar OR Cal.com)
- [ ] Email service configured (SendGrid with API key)
- [ ] SMS service configured (Twilio with account credentials)
- [ ] Google Sheets with "Appointments" tab
- [ ] Mock data ready (see `/00_Shared/MockIdentities.json`)

**You DON'T need:**
- ❌ Real patient data (use mock data only!)
- ❌ Production calendar (test calendar is fine)
- ❌ Coding skills (we'll give you everything to copy/paste)

### Safety Reminders

⚠️ **NEVER use real patient data in testing!**

⚠️ **Test in a development environment** — not your live system!

⚠️ **Use a test calendar** — not your real provider calendar!

⚠️ **Use mock phone numbers** — SMS will be sent to these numbers!

✅ **All test data is completely fictional and safe**

---

## Test Environment Setup

### Step 1: Verify Workflow is Active

**What to do:**
1. Open your n8n instance in a web browser
2. Click on "Workflows" in the left sidebar
3. Find "Aigent_Module_02_Consult_Booking_Enhanced"
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

**What is a webhook?** A webhook is a special URL that receives data when someone wants to book an appointment. Think of it like a mailbox — booking requests are "letters" that get delivered to this address.

**What to do:**
1. Open the Module 02 workflow in n8n
2. Click on the first node (called "Webhook Trigger - Booking Request")
3. Look for "Webhook URLs" section
4. You'll see two URLs: "Production URL" and "Test URL"
5. Copy the **Production URL** (it looks like: `https://your-n8n.com/webhook/consult-booking`)

**What you should see:**
```
Production URL: https://your-n8n.com/webhook/consult-booking
Test URL: https://your-n8n.com/webhook-test/consult-booking
```

**Save this URL** — you'll need it for all tests!

**Common mistake:** Don't use the Test URL for these tests. Use the Production URL even in your test environment (it just means "the real webhook endpoint").

---

### Step 3: Verify Environment Variables

**What are environment variables?** These are settings that tell the workflow how to connect to external services like your calendar, email, and SMS provider.

**What to check:**

Open your n8n settings and verify these variables are set:

**Critical Variables (Required):**
- `SCHEDULING_API_BASE_URL` - Your calendar API URL (Google Calendar or Cal.com)
- `SCHEDULING_EVENT_TYPE_ID` - Which type of appointment to create
- `SCHEDULING_CREDENTIAL_ID` - Authentication for calendar access
- `SENDGRID_API_KEY` - Your SendGrid API key for emails
- `TWILIO_ACCOUNT_SID` - Your Twilio account ID for SMS
- `TWILIO_AUTH_TOKEN` - Your Twilio password
- `TWILIO_PHONE_FROM` - The phone number that sends SMS (format: +15551234567)
- `CLINIC_TIMEZONE` - Your clinic's timezone (e.g., "America/New_York")

**Optional Variables:**
- `CLINIC_EMAIL` - Your clinic's email address (for replies)
- `CLINIC_PHONE` - Your clinic's phone number (for display)
- `ENABLE_DUPLICATE_CHECK` - Set to "true" to prevent duplicate bookings

**Where to find these:**
See `/00_Shared/EnvMatrix.md` for complete details on all variables.

**Common mistake:** Forgetting quotes around values with special characters. Always use quotes!

---

### Step 4: Verify Calendar Integration

**What to do:**

**If using Google Calendar:**
1. Check that you have a Google Calendar API credential configured in n8n
2. Verify the calendar ID is correct
3. Test that you can see the calendar in Google Calendar web interface

**If using Cal.com:**
1. Check that you have a Cal.com API key configured
2. Verify your event type ID is correct
3. Log into Cal.com and verify you can see your availability

**Quick test:**
Try manually creating an appointment in your calendar system to verify it's working.

---

### Step 5: Set Up Test Tools

**What is cURL?** cURL is a command-line tool that lets you send web requests. It's like filling out a form on a website, but using typed commands instead of clicking buttons.

**Install cURL (if needed):**

**Windows:**
- Already installed on Windows 10/11
- Open "Command Prompt" or "PowerShell"
- Type `curl --version` to verify

**Mac:**
- Already installed
- Open "Terminal" app
- Type `curl --version` to verify

**Linux:**
- Usually installed, or run: `sudo apt install curl`

**Alternative:** You can use Postman or Insomnia instead of cURL if you prefer a graphical interface.

---

## Test Suite Overview

### Test Categories

| Category | Test Count | Priority | Time Estimate | Purpose |
|----------|------------|----------|---------------|---------|
| **Happy Path** | 5 | P0-Critical | 15 min | Verify core functionality works |
| **Invalid Input** | 7 | P1-High | 20 min | Ensure proper error handling |
| **Edge Cases** | 4 | P2-Medium | 15 min | Test unusual but valid scenarios |
| **Integration** | 4 | P1-High | 25 min | Verify external service connections |
| **Performance** | 2 | P2-Medium | 10 min | Check speed and efficiency |
| **Security** | 2 | P1-High | 10 min | Verify data protection |
| **TOTAL** | 24 | — | ~95 min | Complete module validation |

### Test Execution Order

**We recommend this order:**
1. **Happy Path Tests** (TC-HP-001 to TC-HP-005) — Verify basic functionality first
2. **Invalid Input Tests** (TC-INV-001 to TC-INV-007) — Ensure error handling works
3. **Integration Tests** (TC-INT-001 to TC-INT-004) — Test external connections
4. **Edge Case Tests** (TC-EDGE-001 to TC-EDGE-004) — Handle unusual scenarios
5. **Performance Tests** (TC-PERF-001 to TC-PERF-002) — Check speed
6. **Security Tests** (TC-SEC-001 to TC-SEC-002) — Verify data protection

**Time commitment:** Plan for approximately 90-120 minutes to run all tests thoroughly.

---

## Happy Path Tests

These tests verify that the module works correctly when everything goes right.

### TC-HP-001: Book Valid Appointment with Preferred Date/Time

**Purpose:** Verify the complete booking flow with a patient who knows when they want to meet.

**Test Data:**

```json
{
  "contact_id": "MOCK-001",
  "email": "sarah.johnson@example.com",
  "name": "Sarah Johnson",
  "phone": "+1-555-0101",
  "service_type": "Initial Consultation",
  "preferred_date": "2025-11-15",
  "preferred_time": "14:30",
  "timezone": "America/New_York",
  "notes": "First-time patient, referred by Dr. Smith"
}
```

**cURL Command:**

Replace `YOUR-WEBHOOK-URL` with your actual webhook URL from Step 2.

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "MOCK-001",
    "email": "sarah.johnson@example.com",
    "name": "Sarah Johnson",
    "phone": "+1-555-0101",
    "service_type": "Initial Consultation",
    "preferred_date": "2025-11-15",
    "preferred_time": "14:30",
    "timezone": "America/New_York",
    "notes": "First-time patient, referred by Dr. Smith"
  }'
```

**Steps to Execute:**

1. Open your terminal/command prompt
2. Copy the cURL command above
3. Replace `YOUR-WEBHOOK-URL` with your actual webhook URL
4. **IMPORTANT:** Change the `preferred_date` to a future date (at least tomorrow)
5. Paste the command into your terminal and press Enter
6. Wait 3-8 seconds for the response

**Expected Results:**

**HTTP Response (200 OK):**
```json
{
  "success": true,
  "booking_id": "BOOK-123456789",
  "appointment_time": "2025-11-15T14:30:00-05:00",
  "timezone": "America/New_York",
  "confirmation_sent": {
    "email": true,
    "sms": true
  },
  "calendar_event_id": "evt_abc123xyz",
  "trace_id": "BOOK-1730419200000"
}
```

**What should happen:**
1. **Terminal:** You see a JSON response with `"success": true`
2. **Email:** Sarah's email address receives a confirmation email with .ics calendar attachment
3. **SMS:** Sarah's phone receives an SMS confirmation with appointment details
4. **Calendar:** The appointment appears in your Google Calendar or Cal.com
5. **Google Sheets:** A new row appears in the "Appointments" tab
6. **n8n:** The workflow execution shows green checkmarks

**Pass Criteria:**
- [ ] HTTP response code is 200
- [ ] Response contains `"success": true`
- [ ] Response includes a `booking_id`
- [ ] Response includes `appointment_time` matching preferred time
- [ ] Email confirmation was sent (`"email": true`)
- [ ] SMS confirmation was sent (`"sms": true`)
- [ ] Calendar event created (check your calendar manually)
- [ ] Google Sheets row added (check sheet manually)
- [ ] Response time < 8 seconds

**Common Mistakes:**
- ❌ Using a past date — the workflow rejects past dates
- ❌ Wrong timezone format — use IANA format like "America/New_York"
- ❌ Phone without country code — include +1 for US numbers
- ❌ Booking when calendar is full — check availability first

**Troubleshooting:**
- **Error 400:** Check your date format (must be YYYY-MM-DD)
- **Error 409:** No availability at that time, try a different time
- **No email received:** Check spam folder, verify SENDGRID_API_KEY
- **No SMS received:** Verify TWILIO credentials and phone format
- **No calendar event:** Check SCHEDULING_API_BASE_URL connection

---

### TC-HP-002: Book Appointment Without Specifying Date/Time

**Purpose:** Verify smart slot recommendation when patient has no preference.

**Test Data:**

```json
{
  "contact_id": "MOCK-002",
  "email": "michael.chen@example.com",
  "name": "Michael Chen",
  "phone": "+1-555-0102",
  "service_type": "Follow-up Visit",
  "timezone": "America/Los_Angeles"
}
```

**What makes this test different:** No `preferred_date` or `preferred_time` field. The system will recommend the best available slot based on historical no-show patterns.

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "MOCK-002",
    "email": "michael.chen@example.com",
    "name": "Michael Chen",
    "phone": "+1-555-0102",
    "service_type": "Follow-up Visit",
    "timezone": "America/Los_Angeles"
  }'
```

**Steps to Execute:**

1. Copy the cURL command
2. Replace `YOUR-WEBHOOK-URL` with your actual webhook URL
3. Run the command
4. Wait for response (may take 5-10 seconds due to availability check)

**Expected Results:**

**HTTP Response (200 OK):**
```json
{
  "success": true,
  "booking_id": "BOOK-123456790",
  "appointment_time": "2025-11-16T14:00:00-08:00",
  "timezone": "America/Los_Angeles",
  "selection_method": "smart_recommendation",
  "recommendation_score": 0.92,
  "alternatives": [
    {"time": "2025-11-16T15:00:00-08:00", "duration": 30},
    {"time": "2025-11-17T10:00:00-08:00", "duration": 30}
  ],
  "confirmation_sent": {
    "email": true,
    "sms": true
  }
}
```

**Pass Criteria:**
- [ ] Response contains `"success": true`
- [ ] `selection_method` is `"smart_recommendation"` (not patient preference)
- [ ] `recommendation_score` is present (between 0 and 1)
- [ ] `alternatives` array contains 2-3 alternative times
- [ ] Email and SMS confirmations sent
- [ ] Recommended time is during business hours (8 AM - 5 PM)

**Why this matters:** Smart recommendation reduces no-shows by suggesting times when patients are statistically more likely to attend (typically mid-morning or mid-afternoon, avoiding lunch hours).

**Common Mistakes:**
- ❌ Expecting instant response — availability checks take 3-5 seconds
- ❌ Not understanding the recommendation — it's based on no-show patterns, not just "first available"

**Troubleshooting:**
- **Error 409:** Calendar completely full for next 7 days
- **Slow response:** Scheduling API may be slow, wait up to 15 seconds

---

### TC-HP-003: Book Appointment with Different Timezone

**Purpose:** Verify timezone conversion works correctly to prevent "wrong time" no-shows.

**Test Data:**

```json
{
  "contact_id": "MOCK-003",
  "email": "emma.rodriguez@example.com",
  "name": "Emma Rodriguez",
  "phone": "+1-555-0103",
  "service_type": "Telehealth Consultation",
  "preferred_date": "2025-11-16",
  "preferred_time": "10:00",
  "timezone": "America/Denver"
}
```

**Scenario:** Patient is in Denver (Mountain Time) but your clinic is in New York (Eastern Time). The appointment should be stored correctly in both timezones.

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "MOCK-003",
    "email": "emma.rodriguez@example.com",
    "name": "Emma Rodriguez",
    "phone": "+1-555-0103",
    "service_type": "Telehealth Consultation",
    "preferred_date": "2025-11-16",
    "preferred_time": "10:00",
    "timezone": "America/Denver"
  }'
```

**Steps to Execute:**

1. Run the cURL command (update date to future date)
2. Note the timezone in the request: `America/Denver` (Mountain Time)
3. Check your calendar after booking
4. Verify the time is correctly converted

**Expected Results:**

**HTTP Response:**
```json
{
  "success": true,
  "appointment_time": "2025-11-16T10:00:00-07:00",
  "timezone": "America/Denver",
  "clinic_timezone": "America/New_York",
  "clinic_local_time": "2025-11-16T12:00:00-05:00"
}
```

**Important timezone math:**
- **Patient sees:** 10:00 AM Mountain Time (Denver)
- **Clinic sees:** 12:00 PM Eastern Time (New York)
- **Difference:** 2 hours (Mountain is 2 hours behind Eastern)

**Pass Criteria:**
- [ ] Response shows correct patient timezone
- [ ] Calendar event shows correct time in YOUR timezone
- [ ] Email confirmation shows time in PATIENT's timezone
- [ ] SMS confirmation shows time in PATIENT's timezone
- [ ] .ics calendar attachment works correctly when opened

**Common Mistakes:**
- ❌ Confusing patient time vs. clinic time
- ❌ Forgetting daylight saving time differences
- ❌ Using wrong timezone format (use IANA, not abbreviations like "MST")

**Troubleshooting:**
- **Wrong time in calendar:** Check CLINIC_TIMEZONE environment variable
- **Wrong time in email:** Verify timezone is passed correctly to email template

---

### TC-HP-004: Book Appointment for Existing Contact

**Purpose:** Verify booking works for returning patients with existing contact_id.

**Test Data:**

```json
{
  "contact_id": "CRM-12345",
  "email": "david.kim@example.com",
  "name": "David Kim",
  "phone": "+1-555-0104",
  "service_type": "Annual Physical",
  "preferred_date": "2025-11-18",
  "preferred_time": "09:00",
  "timezone": "America/Chicago",
  "referral_source": "patient_portal"
}
```

**Scenario:** David is an existing patient in your CRM. This booking should update his record, not create a duplicate.

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "CRM-12345",
    "email": "david.kim@example.com",
    "name": "David Kim",
    "phone": "+1-555-0104",
    "service_type": "Annual Physical",
    "preferred_date": "2025-11-18",
    "preferred_time": "09:00",
    "timezone": "America/Chicago",
    "referral_source": "patient_portal"
  }'
```

**Expected Results:**

**HTTP Response:**
```json
{
  "success": true,
  "booking_id": "BOOK-123456791",
  "contact_id": "CRM-12345",
  "patient_type": "existing",
  "crm_updated": true
}
```

**Pass Criteria:**
- [ ] Response includes the same `contact_id` from request
- [ ] `patient_type` is "existing" (not "new")
- [ ] CRM record updated (not duplicated) — check your CRM
- [ ] All standard confirmations sent

**Common Mistakes:**
- ❌ Creating duplicate CRM records — the workflow should detect existing contact_id

**Troubleshooting:**
- **Duplicate created:** Check CRM integration node configuration

---

### TC-HP-005: Successful Booking with All Optional Fields

**Purpose:** Verify all optional fields are captured and stored correctly.

**Test Data:**

```json
{
  "contact_id": "MOCK-005",
  "email": "lisa.patel@example.com",
  "name": "Lisa Patel",
  "phone": "+1-555-0105",
  "service_type": "Specialist Referral",
  "preferred_date": "2025-11-20",
  "preferred_time": "15:30",
  "timezone": "America/New_York",
  "notes": "Patient has mobility issues, needs ground floor exam room",
  "referral_source": "google_ads",
  "insurance_provider": "Blue Cross Blue Shield",
  "reason_for_visit": "Chronic back pain evaluation"
}
```

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "MOCK-005",
    "email": "lisa.patel@example.com",
    "name": "Lisa Patel",
    "phone": "+1-555-0105",
    "service_type": "Specialist Referral",
    "preferred_date": "2025-11-20",
    "preferred_time": "15:30",
    "timezone": "America/New_York",
    "notes": "Patient has mobility issues, needs ground floor exam room",
    "referral_source": "google_ads",
    "insurance_provider": "Blue Cross Blue Shield",
    "reason_for_visit": "Chronic back pain evaluation"
  }'
```

**Pass Criteria:**
- [ ] All optional fields appear in Google Sheets
- [ ] Notes field preserved exactly (no truncation)
- [ ] Staff receives note about accessibility need
- [ ] Referral source tracked for analytics

---

## Invalid Input Tests

These tests verify proper error handling when data is incorrect.

### TC-INV-001: Missing Required Field (Email)

**Purpose:** Verify validation catches missing required fields.

**Test Data:**

```json
{
  "name": "Test Patient",
  "phone": "+1-555-0199",
  "service_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "phone": "+1-555-0199",
    "service_type": "Consultation"
  }'
```

**Expected Results:**

**HTTP Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "error_code": "VALIDATION_FAILED",
  "details": [
    "email: required and must be valid format"
  ],
  "timestamp": "2025-10-31T14:30:00Z",
  "trace_id": "BOOK-1730419200000",
  "support_email": "support@yourclinic.com"
}
```

**Pass Criteria:**
- [ ] HTTP status code is 400 (Bad Request)
- [ ] Response contains `"success": false`
- [ ] Error message mentions "email"
- [ ] `error_code` is "VALIDATION_FAILED"
- [ ] `details` array lists specific field error
- [ ] No appointment created in calendar
- [ ] No confirmation emails sent
- [ ] Response includes `trace_id` for support

**Why this matters:** Good error messages help frontend developers and users understand what went wrong.

---

### TC-INV-002: Invalid Email Format

**Purpose:** Verify email validation catches malformed addresses.

**Test Data:**

```json
{
  "email": "not-an-email",
  "name": "Test Patient",
  "phone": "+1-555-0199",
  "service_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "name": "Test Patient",
    "phone": "+1-555-0199",
    "service_type": "Consultation"
  }'
```

**Expected Results:**

**HTTP Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "error_code": "VALIDATION_FAILED",
  "details": [
    "email: required and must be valid format"
  ]
}
```

**Pass Criteria:**
- [ ] Returns 400 error
- [ ] Error mentions email format
- [ ] No appointment created

**Additional invalid emails to test:**
- `test@` (no domain)
- `@example.com` (no username)
- `test @example.com` (space in email)
- `test@.com` (missing domain name)

---

### TC-INV-003: Name Too Short

**Purpose:** Verify minimum length validation for name field.

**Test Data:**

```json
{
  "email": "test@example.com",
  "name": "A",
  "phone": "+1-555-0199",
  "service_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "A",
    "phone": "+1-555-0199",
    "service_type": "Consultation"
  }'
```

**Expected Results:**

**HTTP Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "name: required, minimum 2 characters"
  ]
}
```

**Pass Criteria:**
- [ ] Returns 400 error
- [ ] Error mentions "minimum 2 characters"
- [ ] Single character names rejected

---

### TC-INV-004: Phone Number Too Short

**Purpose:** Verify phone number validation.

**Test Data:**

```json
{
  "email": "test@example.com",
  "name": "Test Patient",
  "phone": "123",
  "service_type": "Consultation"
}
```

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Patient",
    "phone": "123",
    "service_type": "Consultation"
  }'
```

**Expected Results:**

**HTTP Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "phone: minimum 7 digits"
  ]
}
```

**Pass Criteria:**
- [ ] Returns 400 error
- [ ] Error mentions "minimum 7 digits"

---

### TC-INV-005: Past Date Rejection

**Purpose:** Verify system rejects appointments in the past.

**Test Data:**

```json
{
  "email": "test@example.com",
  "name": "Test Patient",
  "phone": "+1-555-0199",
  "service_type": "Consultation",
  "preferred_date": "2020-01-01",
  "preferred_time": "10:00"
}
```

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Patient",
    "phone": "+1-555-0199",
    "service_type": "Consultation",
    "preferred_date": "2020-01-01",
    "preferred_time": "10:00"
  }'
```

**Expected Results:**

**HTTP Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "preferred_date: cannot be in the past"
  ]
}
```

**Pass Criteria:**
- [ ] Returns 400 error
- [ ] Error specifically mentions "past"
- [ ] Today's date is allowed
- [ ] Future dates are allowed

---

### TC-INV-006: Invalid Date Format

**Purpose:** Verify date format validation.

**Test Data:**

```json
{
  "email": "test@example.com",
  "name": "Test Patient",
  "phone": "+1-555-0199",
  "service_type": "Consultation",
  "preferred_date": "11/15/2025",
  "preferred_time": "10:00"
}
```

**Note:** US format (MM/DD/YYYY) is NOT valid. System requires ISO 8601 format (YYYY-MM-DD).

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Patient",
    "phone": "+1-555-0199",
    "service_type": "Consultation",
    "preferred_date": "11/15/2025",
    "preferred_time": "10:00"
  }'
```

**Expected Results:**

**HTTP Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "preferred_date: must be valid ISO 8601 format (YYYY-MM-DD)"
  ]
}
```

**Pass Criteria:**
- [ ] Returns 400 error
- [ ] Error mentions "ISO 8601" or "YYYY-MM-DD"
- [ ] Invalid formats rejected: MM/DD/YYYY, DD-MM-YYYY, etc.

---

### TC-INV-007: Invalid Time Format

**Purpose:** Verify time format validation.

**Test Data:**

```json
{
  "email": "test@example.com",
  "name": "Test Patient",
  "phone": "+1-555-0199",
  "service_type": "Consultation",
  "preferred_date": "2025-11-15",
  "preferred_time": "2:30 PM"
}
```

**Note:** 12-hour format is NOT valid. System requires 24-hour format (HH:MM).

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Patient",
    "phone": "+1-555-0199",
    "service_type": "Consultation",
    "preferred_date": "2025-11-15",
    "preferred_time": "2:30 PM"
  }'
```

**Expected Results:**

**HTTP Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "preferred_time: must be valid HH:MM format (e.g., 14:30)"
  ]
}
```

**Pass Criteria:**
- [ ] Returns 400 error
- [ ] Error mentions "HH:MM" format
- [ ] 12-hour formats rejected (2:30 PM, 2:30pm)
- [ ] 24-hour formats accepted (14:30, 09:00)

---

## Edge Case Tests

These test unusual but valid scenarios.

### TC-EDGE-001: International Phone Number

**Purpose:** Verify non-US phone numbers work correctly.

**Test Data:**

```json
{
  "email": "pierre.dubois@example.com",
  "name": "Pierre Dubois",
  "phone": "+33-1-42-86-82-00",
  "service_type": "Telehealth Consultation",
  "timezone": "Europe/Paris"
}
```

**cURL Command:**

```bash
curl -X POST "YOUR-WEBHOOK-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pierre.dubois@example.com",
    "name": "Pierre Dubois",
    "phone": "+33-1-42-86-82-00",
    "service_type": "Telehealth Consultation",
    "timezone": "Europe/Paris"
  }'
```

**Pass Criteria:**
- [ ] Booking succeeds
- [ ] Phone normalized correctly
- [ ] SMS skipped if Twilio doesn't support country code
- [ ] Email confirmation sent successfully
- [ ] Timezone conversion works (Paris is 6 hours ahead of US Eastern)

---

### TC-EDGE-002: Name with Special Characters

**Purpose:** Verify names with accents, apostrophes, and hyphens work.

**Test Data:**

```json
{
  "email": "maria.garcia-lopez@example.com",
  "name": "María García-López O'Brien",
  "phone": "+1-555-0198",
  "service_type": "Consultation"
}
```

**Pass Criteria:**
- [ ] Name stored exactly as entered
- [ ] No character corruption (María stays María)
- [ ] Email sent correctly
- [ ] Calendar event displays name correctly

---

### TC-EDGE-003: Maximum Length Fields

**Purpose:** Verify maximum length limits are enforced.

**Test Data:**

```json
{
  "email": "test@example.com",
  "name": "ThisIsAReallyLongNameThatExceedsTheMaximumAllowedLengthOf100CharactersAndShouldBeRejectedByTheValidator",
  "phone": "+1-555-0197",
  "service_type": "Consultation"
}
```

**Expected Results:**

**HTTP Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "name: maximum 100 characters"
  ]
}
```

**Pass Criteria:**
- [ ] Returns 400 error for name > 100 characters
- [ ] Returns 400 error for email > 320 characters
- [ ] Returns 400 error for phone > 20 digits

---

### TC-EDGE-004: Same-Day Booking

**Purpose:** Verify appointments can be booked for today (if slots available).

**Test Data:**

```json
{
  "email": "urgent@example.com",
  "name": "Urgent Patient",
  "phone": "+1-555-0196",
  "service_type": "Urgent Care",
  "preferred_date": "2025-10-31",
  "preferred_time": "16:00"
}
```

**Important:** Set `preferred_date` to TODAY'S date and `preferred_time` to a time in the future.

**Pass Criteria:**
- [ ] Booking succeeds if time is in future
- [ ] Booking fails with 400 if time is in past
- [ ] Email/SMS sent immediately

---

## Integration Tests

These tests verify connections to external services.

### TC-INT-001: Google Calendar Integration

**Purpose:** Verify calendar events are created correctly.

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Run TC-HP-001 test
2. Open your Google Calendar in web browser
3. Navigate to the appointment date
4. Look for the calendar event

**Pass Criteria:**
- [ ] Event appears in Google Calendar within 10 seconds
- [ ] Event title includes patient name and service type
- [ ] Event time matches booking time
- [ ] Event duration is correct (default 30 minutes)
- [ ] Event includes patient email
- [ ] Event includes appointment details

**Troubleshooting:**
- **Event not appearing:** Check SCHEDULING_API_BASE_URL
- **Wrong calendar:** Check calendar ID in configuration
- **Permission denied:** Re-authenticate Google Calendar credentials

---

### TC-INT-002: Email Delivery with .ics Attachment

**Purpose:** Verify SendGrid sends emails with calendar attachments.

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Run TC-HP-001 test
2. Check the email inbox for sarah.johnson@example.com
3. Open the confirmation email
4. Download the .ics attachment
5. Double-click to open in your calendar app

**Pass Criteria:**
- [ ] Email received within 30 seconds
- [ ] Email contains appointment details (date, time, service)
- [ ] Email includes .ics calendar attachment
- [ ] .ics file opens in Outlook/Apple Calendar/Google Calendar
- [ ] .ics file has correct appointment time
- [ ] Email is properly formatted (not plain text)

**Common Issues:**
- **Email in spam:** Check SendGrid domain authentication
- **No .ics attachment:** Verify email template includes attachment
- **.ics wrong time:** Check timezone in .ics file generation

---

### TC-INT-003: SMS Delivery via Twilio

**Purpose:** Verify Twilio sends SMS confirmations.

**Test Data:** Use TC-HP-001 data (but use YOUR test phone number)

**Steps:**
1. Modify TC-HP-001 to use your real phone number
2. Run the test
3. Check your phone for SMS

**Pass Criteria:**
- [ ] SMS received within 60 seconds
- [ ] SMS includes appointment date and time
- [ ] SMS includes clinic name
- [ ] SMS includes "Reply CANCEL to cancel" (if configured)
- [ ] Phone number appears in Twilio logs

**Common Issues:**
- **No SMS received:** Check Twilio account balance
- **Wrong sender number:** Verify TWILIO_PHONE_FROM is correct
- **SMS to landline:** Twilio can't send SMS to landlines

---

### TC-INT-004: Google Sheets Logging

**Purpose:** Verify all bookings are logged to Google Sheets.

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Run TC-HP-001 test
2. Open your Google Sheet
3. Navigate to "Appointments" tab
4. Look for the new row

**Pass Criteria:**
- [ ] New row appears within 15 seconds
- [ ] Row contains all booking data
- [ ] Timestamp is correct
- [ ] Phone number is normalized (digits only)
- [ ] Timezone is recorded
- [ ] Booking ID matches response

---

## Performance Tests

### TC-PERF-001: Standard Booking Speed

**Purpose:** Verify booking completes within acceptable time.

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Note current time
2. Run TC-HP-001 test
3. Note response time
4. Check n8n execution log for total execution time

**Pass Criteria:**
- [ ] Response received in < 8 seconds (P95 target)
- [ ] Average response time < 5 seconds (with no delays)
- [ ] n8n execution shows "fast" or "normal" performance category

**Performance Categories (from workflow):**
- **Fast:** < 3000ms
- **Normal:** 3000-5000ms
- **Slow:** 5000-8000ms
- **Very Slow:** > 8000ms

**If slow:**
- Check scheduling API response time
- Check email/SMS API response times
- Look for timeout warnings in logs

---

### TC-PERF-002: Concurrent Booking Load

**Purpose:** Verify system handles multiple simultaneous bookings.

**Test Data:** Use 3 different mock identities

**Steps:**
1. Open 3 terminal windows
2. Prepare 3 different booking requests
3. Run all 3 at the same time (within 1 second)
4. Verify all 3 succeed

**Pass Criteria:**
- [ ] All 3 bookings succeed
- [ ] No duplicate bookings created
- [ ] All confirmations sent
- [ ] No 429 rate limit errors
- [ ] Each booking has unique booking_id

---

## Security Tests

### TC-SEC-001: Phone Number Masking in Logs

**Purpose:** Verify sensitive data is masked in execution logs.

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Run TC-HP-001 test
2. Open n8n workflow execution
3. Click through each node
4. Look for phone numbers in node outputs

**Pass Criteria:**
- [ ] Full phone numbers NOT visible in logs (masked as +1-555-****101)
- [ ] Email addresses may be visible (not PHI)
- [ ] Names may be visible (not PHI by themselves)
- [ ] Normalized phone stored internally but masked in outputs

**Why this matters:** HIPAA requires masking personally identifiable information (PII) in logs.

---

### TC-SEC-002: Duplicate Booking Prevention

**Purpose:** Verify duplicate check prevents accidental double-booking.

**Prerequisites:** Set `ENABLE_DUPLICATE_CHECK=true` in environment variables

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Run TC-HP-001 test — should succeed
2. Wait 2 seconds
3. Run TC-HP-001 test again with EXACT same data — should be prevented (if within 5 minute window)

**Pass Criteria:**
- [ ] First booking succeeds
- [ ] Second booking (within 5 min) is prevented or flagged
- [ ] No duplicate calendar events created
- [ ] No duplicate SMS/emails sent

**Note:** This feature may be in pass-through mode (always allows). Check build notes.

---

## Observability Checklist

After each test, verify results in these locations:

### 1. HTTP Response
- [ ] Check status code (200 for success, 400 for validation, 409 for availability)
- [ ] Verify response body contains expected fields
- [ ] Note trace_id for troubleshooting

### 2. n8n Execution Log
- [ ] Open workflow executions page
- [ ] Find the execution (sorted by time)
- [ ] Verify all nodes show green checkmarks
- [ ] Check execution time (should be < 8 seconds)
- [ ] Review any error nodes

### 3. Calendar System
- [ ] Open Google Calendar or Cal.com
- [ ] Verify event created
- [ ] Check event details are correct
- [ ] Verify event time matches booking

### 4. Email Inbox
- [ ] Check spam folder if not in inbox
- [ ] Verify email formatting
- [ ] Test .ics attachment
- [ ] Check for any rendering issues

### 5. SMS (Your Phone)
- [ ] Verify SMS received
- [ ] Check formatting
- [ ] Verify all details present

### 6. Google Sheets
- [ ] Open Appointments tab
- [ ] Verify new row added
- [ ] Check all columns populated
- [ ] Verify timestamp is correct

---

## Common Issues & Solutions

### Issue: "Error 400 - Validation Failed"

**Possible Causes:**
1. Missing required field (email, name, phone, service_type)
2. Invalid email format
3. Name too short (< 2 characters)
4. Phone too short (< 7 digits)
5. Past date in preferred_date
6. Invalid date format (not YYYY-MM-DD)
7. Invalid time format (not HH:MM)

**Solution:**
Check the `details` array in the error response for specific field errors.

---

### Issue: "Error 409 - No Available Appointments"

**Possible Causes:**
1. Calendar completely booked for requested timeframe
2. Requesting time outside business hours
3. Scheduling API down or unreachable
4. Wrong event type ID

**Solution:**
1. Check calendar availability manually
2. Try different date/time
3. Check SCHEDULING_API_BASE_URL is reachable
4. Verify SCHEDULING_EVENT_TYPE_ID is correct

---

### Issue: "Booking succeeds but no email received"

**Possible Causes:**
1. Invalid SENDGRID_API_KEY
2. Email in spam folder
3. Incorrect sender email address
4. SendGrid account suspended
5. Email address blacklisted

**Solution:**
1. Check SendGrid dashboard for delivery logs
2. Verify API key is correct and active
3. Check spam folder
4. Test SendGrid credentials independently
5. Check SendGrid account status

---

### Issue: "Booking succeeds but no SMS received"

**Possible Causes:**
1. Invalid Twilio credentials
2. Twilio account out of credits
3. Phone number format incorrect
4. Phone number is landline (can't receive SMS)
5. Country code not supported by Twilio

**Solution:**
1. Check Twilio dashboard for logs
2. Verify account balance
3. Ensure phone starts with + and country code
4. Test with known working mobile number
5. Check Twilio's supported countries list

---

### Issue: "Calendar event created but wrong time"

**Possible Causes:**
1. Timezone mismatch
2. CLINIC_TIMEZONE not set
3. Daylight saving time issue
4. Calendar configured for wrong timezone

**Solution:**
1. Verify CLINIC_TIMEZONE environment variable
2. Check patient timezone in request
3. Manually verify timezone math
4. Check calendar settings

---

### Issue: "Slow response (> 10 seconds)"

**Possible Causes:**
1. Scheduling API slow
2. Email/SMS APIs timing out
3. Network issues
4. Calendar API rate limited

**Solution:**
1. Check n8n execution log for node timing
2. Increase timeout values if needed
3. Verify external API status
4. Check for retry loops

---

### Issue: "Duplicate appointments created"

**Possible Causes:**
1. ENABLE_DUPLICATE_CHECK not set to true
2. Duplicate check node not working
3. Same request submitted multiple times quickly
4. Calendar sync issues

**Solution:**
1. Enable duplicate checking in environment
2. Wait 5+ minutes between test bookings
3. Manually remove duplicates from calendar
4. Check duplicate detection logic

---

## Success Criteria

Your Module 02 is working correctly if:

### Critical (Must Pass)
- [ ] All Happy Path tests pass (TC-HP-001 through TC-HP-005)
- [ ] All Invalid Input tests return proper 400 errors
- [ ] Calendar integration works (events created)
- [ ] Email confirmations delivered with .ics attachments
- [ ] SMS confirmations delivered
- [ ] Google Sheets logging works
- [ ] Response time < 8 seconds (P95)

### Important (Should Pass)
- [ ] Timezone conversions accurate
- [ ] Smart slot recommendation working
- [ ] Phone number normalization applied
- [ ] All edge cases handled gracefully
- [ ] Error messages are helpful and specific
- [ ] No duplicate bookings created

### Nice to Have
- [ ] Performance under concurrent load
- [ ] International phone numbers work
- [ ] Special characters in names handled
- [ ] Same-day booking works

---

## Next Steps

### After Testing

1. **Document Results:**
   - Fill out [Checklist.md](Checklist.md)
   - Note any failures or unexpected behavior
   - Record performance metrics

2. **Fix Any Issues:**
   - Review [Troubleshooting.md](Troubleshooting.md)
   - Check environment variables
   - Verify external service credentials

3. **Review Observability:**
   - Read [Observability.md](Observability.md)
   - Understand where to look for results
   - Set up monitoring if needed

4. **Learn Key Concepts:**
   - Read [KeyPoints.md](KeyPoints.md)
   - Understand booking workflow
   - Review integration architecture

5. **Test Integration with Other Modules:**
   - Module 01 → Module 02 (lead to booking flow)
   - Module 02 → Module 03 (booking to telehealth session)
   - Module 02 → Module 05 (booking to follow-up sequence)

---

## Appendix: Quick Reference

### Required Environment Variables

```bash
SCHEDULING_API_BASE_URL=https://api.cal.com/v1
SCHEDULING_EVENT_TYPE_ID=123456
SCHEDULING_CREDENTIAL_ID=google_calendar_001
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_FROM=+15551234567
CLINIC_TIMEZONE=America/New_York
CLINIC_EMAIL=admin@yourclinic.com
CLINIC_PHONE=+1-555-555-5555
```

### Test Data Template

```json
{
  "contact_id": "MOCK-XXX",
  "email": "patient@example.com",
  "name": "Patient Name",
  "phone": "+1-555-0100",
  "service_type": "Consultation Type",
  "preferred_date": "2025-11-15",
  "preferred_time": "14:30",
  "timezone": "America/New_York",
  "notes": "Optional notes",
  "referral_source": "Optional source"
}
```

### Timezone Reference

| Timezone | Example City | UTC Offset (Standard) |
|----------|--------------|----------------------|
| America/New_York | New York | UTC-5 (EST) |
| America/Chicago | Chicago | UTC-6 (CST) |
| America/Denver | Denver | UTC-7 (MST) |
| America/Los_Angeles | Los Angeles | UTC-8 (PST) |
| Europe/London | London | UTC+0 (GMT) |
| Europe/Paris | Paris | UTC+1 (CET) |
| Asia/Tokyo | Tokyo | UTC+9 (JST) |

**Note:** Offsets change during daylight saving time.

---

**End of Test Plan**

**Questions?** See [Troubleshooting.md](Troubleshooting.md) or contact your system administrator.

**Next Document:** [TestCases.md](TestCases.md) for structured test case reference.
