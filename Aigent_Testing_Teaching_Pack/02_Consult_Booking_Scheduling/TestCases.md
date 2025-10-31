# Module 02: Consult Booking & Scheduling - Test Cases

**Module:** 02 - Consult Booking & Scheduling
**Version:** 1.1.0-enhanced
**Test Cases Version:** 1.0
**Last Updated:** 2025-10-31
**Total Test Cases:** 24

---

## Overview

This document provides a structured reference for all test cases in Module 02. Each test case includes complete details for execution, expected results, and validation criteria.

**Purpose:** Use this as a quick reference when executing tests or tracking results.

**Related Documents:**
- [TestPlan.md](TestPlan.md) - Step-by-step testing instructions
- [Checklist.md](Checklist.md) - Progress tracking template
- [Troubleshooting.md](Troubleshooting.md) - Solutions for common issues

---

## Test Case Summary

| Category | Test Count | Priority Breakdown | Total Priority Points |
|----------|------------|-------------------|----------------------|
| Happy Path | 5 | P0: 5 | 25 |
| Invalid Input | 7 | P1: 7 | 21 |
| Edge Cases | 4 | P2: 4 | 8 |
| Integration | 4 | P1: 4 | 12 |
| Performance | 2 | P2: 2 | 4 |
| Security | 2 | P1: 2 | 6 |
| **TOTAL** | **24** |  | **76** |

**Priority Definitions:**
- **P0-Critical:** Core functionality, must pass for module to be viable
- **P1-High:** Important features, should pass for production readiness
- **P2-Medium:** Edge cases and optimizations, nice to have
- **P3-Low:** Future enhancements, not currently tested

---

## Table of Contents

1. [Happy Path Tests](#happy-path-tests) (TC-HP-001 to TC-HP-005)
2. [Invalid Input Tests](#invalid-input-tests) (TC-INV-001 to TC-INV-007)
3. [Edge Case Tests](#edge-case-tests) (TC-EDGE-001 to TC-EDGE-004)
4. [Integration Tests](#integration-tests) (TC-INT-001 to TC-INT-004)
5. [Performance Tests](#performance-tests) (TC-PERF-001 to TC-PERF-002)
6. [Security Tests](#security-tests) (TC-SEC-001 to TC-SEC-002)
7. [Test Execution Tracker](#test-execution-tracker)
8. [Test Results Summary Template](#test-results-summary-template)

---

## Happy Path Tests

### TC-HP-001: Book Valid Appointment with Preferred Date/Time

**Test ID:** TC-HP-001
**Category:** Happy Path
**Priority:** P0-Critical
**Estimated Time:** 3 minutes

**Description:**
Verify the complete booking flow when a patient specifies their preferred date and time. This is the most common booking scenario.

**Prerequisites:**
- n8n workflow active
- Calendar system accessible (Google Calendar or Cal.com)
- SendGrid configured for email
- Twilio configured for SMS
- Google Sheets accessible

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

**Expected HTTP Response (200 OK):**
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

**Expected Database/Storage Changes:**
- New row in Google Sheets "Appointments" tab
- Phone number normalized to digits only
- Timestamp recorded
- All fields from request captured

**Expected Notifications:**
- Email confirmation sent to sarah.johnson@example.com within 30 seconds
- Email includes .ics calendar attachment
- SMS confirmation sent to +1-555-0101 within 60 seconds
- Calendar event created in Google Calendar/Cal.com

**Pass Criteria:**
- [ ] HTTP status code is 200
- [ ] Response contains `"success": true`
- [ ] `booking_id` is present and unique
- [ ] `appointment_time` matches preferred time
- [ ] Email confirmation sent (`"email": true`)
- [ ] SMS confirmation sent (`"sms": true`)
- [ ] Calendar event created (verify manually)
- [ ] Google Sheets row added (verify manually)
- [ ] Response time < 8 seconds
- [ ] n8n execution shows all green nodes

**Failure Scenarios to Check:**
- Calendar API timeout ’ Should return 500 error with retry message
- SendGrid failure ’ Email flag should be false, but booking still succeeds
- Twilio failure ’ SMS flag should be false, but booking still succeeds
- Google Sheets failure ’ Should log error but booking still succeeds

---

### TC-HP-002: Book Appointment Without Specifying Date/Time

**Test ID:** TC-HP-002
**Category:** Happy Path
**Priority:** P0-Critical
**Estimated Time:** 3 minutes

**Description:**
Verify smart slot recommendation when patient doesn't specify a preferred time. System should analyze historical no-show patterns and recommend optimal time.

**Prerequisites:**
- Same as TC-HP-001
- Availability check API must be working

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

**Expected HTTP Response (200 OK):**
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
- [ ] `selection_method` is `"smart_recommendation"` (not "patient_preference")
- [ ] `recommendation_score` is present (0-1 range)
- [ ] `alternatives` array contains 2-3 options
- [ ] Recommended time is during business hours (8 AM - 5 PM)
- [ ] Email and SMS confirmations sent
- [ ] Response time < 10 seconds (availability check adds time)

**Failure Scenarios:**
- No availability in next 7 days ’ Returns 409 error with retry date
- Scheduling API down ’ Returns 503 error with retry instructions

---

### TC-HP-003: Book Appointment with Different Timezone

**Test ID:** TC-HP-003
**Category:** Happy Path
**Priority:** P0-Critical
**Estimated Time:** 3 minutes

**Description:**
Verify timezone conversion works correctly to prevent patient confusion and no-shows.

**Prerequisites:**
- Same as TC-HP-001
- CLINIC_TIMEZONE environment variable set

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

**Expected HTTP Response:**
```json
{
  "success": true,
  "appointment_time": "2025-11-16T10:00:00-07:00",
  "timezone": "America/Denver",
  "clinic_timezone": "America/New_York",
  "clinic_local_time": "2025-11-16T12:00:00-05:00"
}
```

**Pass Criteria:**
- [ ] Response shows correct patient timezone
- [ ] Calendar event created in clinic's timezone
- [ ] Email shows time in patient's timezone
- [ ] SMS shows time in patient's timezone
- [ ] .ics attachment has correct timezone data
- [ ] Timezone conversion math is correct

**Timezone Math Validation:**
- Patient in Denver (Mountain Time, UTC-7)
- Clinic in New York (Eastern Time, UTC-5)
- Difference: 2 hours (New York is ahead)
- 10:00 AM Denver = 12:00 PM New York

**Failure Scenarios:**
- Invalid timezone string ’ Returns 400 error
- Timezone not recognized ’ Uses clinic default

---

### TC-HP-004: Book Appointment for Existing Contact

**Test ID:** TC-HP-004
**Category:** Happy Path
**Priority:** P1-High
**Estimated Time:** 3 minutes

**Description:**
Verify booking for returning patients updates CRM record instead of creating duplicate.

**Prerequisites:**
- Contact "CRM-12345" exists in CRM (or will be created)
- CRM integration active

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

**Expected HTTP Response:**
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
- [ ] Response includes same `contact_id` from request
- [ ] `patient_type` is "existing"
- [ ] CRM record updated (not duplicated)
- [ ] All standard confirmations sent
- [ ] No duplicate patient record created

**Failure Scenarios:**
- CRM API down ’ Should still book appointment, queue CRM update
- Contact not found ’ May create new contact or flag for review

---

### TC-HP-005: Book Appointment with All Optional Fields

**Test ID:** TC-HP-005
**Category:** Happy Path
**Priority:** P1-High
**Estimated Time:** 3 minutes

**Description:**
Verify all optional fields are captured, stored, and displayed correctly.

**Prerequisites:**
- Same as TC-HP-001

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

**Pass Criteria:**
- [ ] All optional fields appear in Google Sheets
- [ ] Notes field preserved exactly (no truncation)
- [ ] Staff notification includes accessibility note
- [ ] Referral source tracked correctly
- [ ] Insurance info stored
- [ ] Reason for visit captured

---

## Invalid Input Tests

### TC-INV-001: Missing Required Field (Email)

**Test ID:** TC-INV-001
**Category:** Invalid Input
**Priority:** P1-High
**Estimated Time:** 1 minute

**Description:**
Verify validation catches missing email field.

**Test Data:**
```json
{
  "name": "Test Patient",
  "phone": "+1-555-0199",
  "service_type": "Consultation"
}
```

**Expected HTTP Response (400 Bad Request):**
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
- [ ] HTTP status code is 400
- [ ] Response contains `"success": false`
- [ ] Error message mentions "email"
- [ ] `error_code` is "VALIDATION_FAILED"
- [ ] `details` array lists specific error
- [ ] No appointment created
- [ ] No confirmations sent
- [ ] Response includes `trace_id` for support

---

### TC-INV-002: Invalid Email Format

**Test ID:** TC-INV-002
**Category:** Invalid Input
**Priority:** P1-High
**Estimated Time:** 1 minute

**Description:**
Verify email validation catches malformed addresses.

**Test Data:**
```json
{
  "email": "not-an-email",
  "name": "Test Patient",
  "phone": "+1-555-0199",
  "service_type": "Consultation"
}
```

**Expected HTTP Response (400):**
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

**Additional Invalid Emails to Test:**
- `test@` (no domain)
- `@example.com` (no username)
- `test @example.com` (space in email)
- `test@.com` (missing domain name)

---

### TC-INV-003: Name Too Short

**Test ID:** TC-INV-003
**Category:** Invalid Input
**Priority:** P1-High
**Estimated Time:** 1 minute

**Description:**
Verify minimum length validation for name field.

**Test Data:**
```json
{
  "email": "test@example.com",
  "name": "A",
  "phone": "+1-555-0199",
  "service_type": "Consultation"
}
```

**Expected HTTP Response (400):**
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

**Test ID:** TC-INV-004
**Category:** Invalid Input
**Priority:** P1-High
**Estimated Time:** 1 minute

**Description:**
Verify phone number validation.

**Test Data:**
```json
{
  "email": "test@example.com",
  "name": "Test Patient",
  "phone": "123",
  "service_type": "Consultation"
}
```

**Expected HTTP Response (400):**
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

**Test ID:** TC-INV-005
**Category:** Invalid Input
**Priority:** P1-High
**Estimated Time:** 1 minute

**Description:**
Verify system rejects appointments in the past.

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

**Expected HTTP Response (400):**
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
- [ ] Error mentions "past"
- [ ] Today's date is allowed
- [ ] Future dates are allowed

---

### TC-INV-006: Invalid Date Format

**Test ID:** TC-INV-006
**Category:** Invalid Input
**Priority:** P1-High
**Estimated Time:** 1 minute

**Description:**
Verify date format validation (requires ISO 8601).

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

**Expected HTTP Response (400):**
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
- [ ] US format (MM/DD/YYYY) rejected
- [ ] European format (DD-MM-YYYY) rejected

---

### TC-INV-007: Invalid Time Format

**Test ID:** TC-INV-007
**Category:** Invalid Input
**Priority:** P1-High
**Estimated Time:** 1 minute

**Description:**
Verify time format validation (requires 24-hour HH:MM).

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

**Expected HTTP Response (400):**
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

### TC-EDGE-001: International Phone Number

**Test ID:** TC-EDGE-001
**Category:** Edge Case
**Priority:** P2-Medium
**Estimated Time:** 3 minutes

**Description:**
Verify non-US phone numbers work correctly.

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

**Pass Criteria:**
- [ ] Booking succeeds
- [ ] Phone normalized correctly
- [ ] SMS skipped if Twilio doesn't support country
- [ ] Email confirmation sent successfully
- [ ] Timezone conversion works (Paris is UTC+1)

**Expected Behavior:**
- French phone number normalized
- SMS may fail gracefully (if Twilio doesn't support France)
- Email always sent
- Timezone: Paris is 6 hours ahead of US Eastern

---

### TC-EDGE-002: Name with Special Characters

**Test ID:** TC-EDGE-002
**Category:** Edge Case
**Priority:** P2-Medium
**Estimated Time:** 2 minutes

**Description:**
Verify names with accents, apostrophes, and hyphens work.

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
- [ ] No encoding issues in SMS

---

### TC-EDGE-003: Maximum Length Fields

**Test ID:** TC-EDGE-003
**Category:** Edge Case
**Priority:** P2-Medium
**Estimated Time:** 2 minutes

**Description:**
Verify maximum length limits are enforced.

**Test Data:**
```json
{
  "email": "test@example.com",
  "name": "ThisIsAReallyLongNameThatExceedsTheMaximumAllowedLengthOf100CharactersAndShouldBeRejectedByTheValidator",
  "phone": "+1-555-0197",
  "service_type": "Consultation"
}
```

**Expected HTTP Response (400):**
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
- [ ] Returns 400 for name > 100 characters
- [ ] Returns 400 for email > 320 characters
- [ ] Returns 400 for phone > 20 digits

---

### TC-EDGE-004: Same-Day Booking

**Test ID:** TC-EDGE-004
**Category:** Edge Case
**Priority:** P2-Medium
**Estimated Time:** 2 minutes

**Description:**
Verify appointments can be booked for today.

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

**Note:** Use TODAY'S date and a future time.

**Pass Criteria:**
- [ ] Booking succeeds if time is in future
- [ ] Booking fails with 400 if time is in past
- [ ] Email/SMS sent immediately
- [ ] Marked as "same-day" in system

---

## Integration Tests

### TC-INT-001: Google Calendar Integration

**Test ID:** TC-INT-001
**Category:** Integration
**Priority:** P1-High
**Estimated Time:** 5 minutes

**Description:**
Verify calendar events are created correctly in Google Calendar or Cal.com.

**Prerequisites:**
- Calendar API credentials configured
- Calendar accessible

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Run TC-HP-001 test
2. Open Google Calendar in browser
3. Navigate to appointment date
4. Verify event exists

**Pass Criteria:**
- [ ] Event appears within 10 seconds
- [ ] Event title includes patient name + service type
- [ ] Event time matches booking time
- [ ] Event duration correct (30 min default)
- [ ] Patient email added as attendee
- [ ] Event description includes appointment details
- [ ] Event has correct timezone

**Failure Scenarios:**
- API timeout ’ Should retry 3 times
- Permission denied ’ Should log error and notify admin
- Calendar full ’ Should return 409 error

---

### TC-INT-002: Email Delivery with .ics Attachment

**Test ID:** TC-INT-002
**Category:** Integration
**Priority:** P1-High
**Estimated Time:** 5 minutes

**Description:**
Verify SendGrid sends emails with .ics calendar attachments.

**Prerequisites:**
- SendGrid API key configured
- Sender email verified in SendGrid

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Run TC-HP-001 test
2. Check email inbox
3. Open confirmation email
4. Download .ics attachment
5. Open in calendar app

**Pass Criteria:**
- [ ] Email received within 30 seconds
- [ ] Email contains appointment details
- [ ] Email includes .ics attachment
- [ ] .ics file opens in Outlook/Apple Calendar/Google
- [ ] .ics has correct appointment time and timezone
- [ ] Email properly formatted (HTML, not plain text)
- [ ] From address is clinic email

**Failure Scenarios:**
- SendGrid API down ’ Should queue for retry
- Email bounced ’ Should log and notify admin
- .ics generation failed ’ Should still send email without attachment

---

### TC-INT-003: SMS Delivery via Twilio

**Test ID:** TC-INT-003
**Category:** Integration
**Priority:** P1-High
**Estimated Time:** 3 minutes

**Description:**
Verify Twilio sends SMS confirmations.

**Prerequisites:**
- Twilio credentials configured
- Twilio account has credits
- Use YOUR test phone number

**Test Data:** Modify TC-HP-001 to use your phone

**Steps:**
1. Update phone number to yours
2. Run test
3. Check your phone for SMS

**Pass Criteria:**
- [ ] SMS received within 60 seconds
- [ ] SMS includes appointment date and time
- [ ] SMS includes clinic name
- [ ] SMS includes cancellation instructions (if configured)
- [ ] Phone number appears in Twilio logs
- [ ] SMS delivery status is "delivered"

**Failure Scenarios:**
- Twilio API down ’ Should log failure but booking succeeds
- Insufficient credits ’ Should log error
- Invalid phone number ’ Should skip SMS gracefully

---

### TC-INT-004: Google Sheets Logging

**Test ID:** TC-INT-004
**Category:** Integration
**Priority:** P1-High
**Estimated Time:** 3 minutes

**Description:**
Verify all bookings are logged to Google Sheets.

**Prerequisites:**
- Google Sheets configured
- Sheet has "Appointments" tab

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Run TC-HP-001 test
2. Open Google Sheet
3. Navigate to "Appointments" tab
4. Look for new row

**Pass Criteria:**
- [ ] New row appears within 15 seconds
- [ ] Row contains all booking data
- [ ] Timestamp is correct
- [ ] Phone normalized (digits only in one column)
- [ ] Timezone recorded
- [ ] Booking ID matches response
- [ ] All optional fields captured

**Failure Scenarios:**
- Sheets API down ’ Should queue for retry
- Permission denied ’ Should log error and notify admin

---

## Performance Tests

### TC-PERF-001: Standard Booking Speed

**Test ID:** TC-PERF-001
**Category:** Performance
**Priority:** P2-Medium
**Estimated Time:** 5 minutes

**Description:**
Verify booking completes within acceptable time.

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Note current time
2. Run TC-HP-001 test
3. Note response time
4. Check n8n execution log

**Pass Criteria:**
- [ ] Response received in < 8 seconds (P95 target)
- [ ] Average response time < 5 seconds
- [ ] n8n execution shows "fast" or "normal" category

**Performance Categories:**
- **Fast:** < 3000ms
- **Normal:** 3000-5000ms
- **Slow:** 5000-8000ms
- **Very Slow:** > 8000ms

**If Slow:**
- Check scheduling API response time
- Check email/SMS API times
- Look for timeout warnings

---

### TC-PERF-002: Concurrent Booking Load

**Test ID:** TC-PERF-002
**Category:** Performance
**Priority:** P2-Medium
**Estimated Time:** 5 minutes

**Description:**
Verify system handles multiple simultaneous bookings.

**Test Data:** Use 3 different mock identities

**Steps:**
1. Open 3 terminal windows
2. Prepare 3 different booking requests
3. Run all 3 simultaneously (within 1 second)
4. Verify all succeed

**Pass Criteria:**
- [ ] All 3 bookings succeed
- [ ] No duplicate bookings
- [ ] All confirmations sent
- [ ] No 429 rate limit errors
- [ ] Each booking has unique booking_id
- [ ] No calendar conflicts created

---

## Security Tests

### TC-SEC-001: Phone Number Masking in Logs

**Test ID:** TC-SEC-001
**Category:** Security
**Priority:** P1-High
**Estimated Time:** 3 minutes

**Description:**
Verify sensitive data is masked in execution logs (HIPAA compliance).

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Run TC-HP-001 test
2. Open n8n workflow execution
3. Click through each node
4. Look for phone numbers

**Pass Criteria:**
- [ ] Full phone NOT visible in logs (masked as +1-555-****101)
- [ ] Email addresses may be visible (not PHI alone)
- [ ] Names may be visible (not PHI alone)
- [ ] Normalized phone stored internally but masked in outputs
- [ ] No SSN, insurance ID, or medical info in logs

**Why This Matters:**
HIPAA requires masking PII in logs to prevent unauthorized access to patient information.

---

### TC-SEC-002: Duplicate Booking Prevention

**Test ID:** TC-SEC-002
**Category:** Security
**Priority:** P1-High
**Estimated Time:** 3 minutes

**Description:**
Verify duplicate check prevents accidental double-booking.

**Prerequisites:**
- Set `ENABLE_DUPLICATE_CHECK=true` in environment

**Test Data:** Use TC-HP-001 data

**Steps:**
1. Run TC-HP-001 test  should succeed
2. Wait 2 seconds
3. Run TC-HP-001 again with EXACT same data

**Pass Criteria:**
- [ ] First booking succeeds
- [ ] Second booking (within 5 min) prevented or flagged
- [ ] No duplicate calendar events
- [ ] No duplicate SMS/emails sent
- [ ] Clear error message on duplicate attempt

**Note:** This feature may be in pass-through mode. Check build notes.

---

## Test Execution Tracker

Use this table to track your testing progress:

| Test ID | Category | Priority | Status | Result | Date | Notes |
|---------|----------|----------|--------|--------|------|-------|
| TC-HP-001 | Happy Path | P0 |  Not Run |  |  |  |
| TC-HP-002 | Happy Path | P0 |  Not Run |  |  |  |
| TC-HP-003 | Happy Path | P0 |  Not Run |  |  |  |
| TC-HP-004 | Happy Path | P1 |  Not Run |  |  |  |
| TC-HP-005 | Happy Path | P1 |  Not Run |  |  |  |
| TC-INV-001 | Invalid Input | P1 |  Not Run |  |  |  |
| TC-INV-002 | Invalid Input | P1 |  Not Run |  |  |  |
| TC-INV-003 | Invalid Input | P1 |  Not Run |  |  |  |
| TC-INV-004 | Invalid Input | P1 |  Not Run |  |  |  |
| TC-INV-005 | Invalid Input | P1 |  Not Run |  |  |  |
| TC-INV-006 | Invalid Input | P1 |  Not Run |  |  |  |
| TC-INV-007 | Invalid Input | P1 |  Not Run |  |  |  |
| TC-EDGE-001 | Edge Case | P2 |  Not Run |  |  |  |
| TC-EDGE-002 | Edge Case | P2 |  Not Run |  |  |  |
| TC-EDGE-003 | Edge Case | P2 |  Not Run |  |  |  |
| TC-EDGE-004 | Edge Case | P2 |  Not Run |  |  |  |
| TC-INT-001 | Integration | P1 |  Not Run |  |  |  |
| TC-INT-002 | Integration | P1 |  Not Run |  |  |  |
| TC-INT-003 | Integration | P1 |  Not Run |  |  |  |
| TC-INT-004 | Integration | P1 |  Not Run |  |  |  |
| TC-PERF-001 | Performance | P2 |  Not Run |  |  |  |
| TC-PERF-002 | Performance | P2 |  Not Run |  |  |  |
| TC-SEC-001 | Security | P1 |  Not Run |  |  |  |
| TC-SEC-002 | Security | P1 |  Not Run |  |  |  |

**Status Options:**  Not Run | = In Progress |  Pass | L Fail |   Blocked

---

## Test Results Summary Template

**Testing Session:** ___________
**Tester:** ___________
**Date:** ___________
**Environment:** Development / Staging / Production

### Overall Results

| Category | Total Tests | Passed | Failed | Blocked | Pass Rate |
|----------|-------------|--------|--------|---------|-----------|
| Happy Path | 5 | ___ | ___ | ___ | ___% |
| Invalid Input | 7 | ___ | ___ | ___ | ___% |
| Edge Cases | 4 | ___ | ___ | ___ | ___% |
| Integration | 4 | ___ | ___ | ___ | ___% |
| Performance | 2 | ___ | ___ | ___ | ___% |
| Security | 2 | ___ | ___ | ___ | ___% |
| **TOTAL** | **24** | **___** | **___** | **___** | **___%** |

### Critical Issues Found

1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Performance Metrics

- Average response time: _______ ms
- P95 response time: _______ ms
- Slowest test: _______ (Test ID: _______)
- Fastest test: _______ (Test ID: _______)

### Integration Status

- [ ] Calendar integration working
- [ ] Email delivery working
- [ ] SMS delivery working
- [ ] Google Sheets logging working

### Recommendations

1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Sign-Off

**Tester Signature:** ___________ **Date:** ___________

**Reviewer Signature:** ___________ **Date:** ___________

---

## Quick Reference: Test Data

### Valid Test Data Templates

**Minimal Booking:**
```json
{
  "email": "patient@example.com",
  "name": "Patient Name",
  "phone": "+1-555-0100",
  "service_type": "Consultation"
}
```

**Complete Booking:**
```json
{
  "contact_id": "MOCK-XXX",
  "email": "patient@example.com",
  "name": "Patient Name",
  "phone": "+1-555-0100",
  "service_type": "Consultation",
  "preferred_date": "2025-11-15",
  "preferred_time": "14:30",
  "timezone": "America/New_York",
  "notes": "Optional notes",
  "referral_source": "website"
}
```

### Common Service Types

- "Initial Consultation"
- "Follow-up Visit"
- "Annual Physical"
- "Specialist Referral"
- "Telehealth Consultation"
- "Urgent Care"

### Common Timezones

- America/New_York (Eastern)
- America/Chicago (Central)
- America/Denver (Mountain)
- America/Los_Angeles (Pacific)
- Europe/London (GMT)
- Europe/Paris (CET)
- Asia/Tokyo (JST)

---

**End of Test Cases Document**

**Related Documents:**
- [TestPlan.md](TestPlan.md) - Detailed testing instructions
- [Troubleshooting.md](Troubleshooting.md) - Problem solutions
- [Checklist.md](Checklist.md) - Progress tracking
- [Observability.md](Observability.md) - Where to verify results
