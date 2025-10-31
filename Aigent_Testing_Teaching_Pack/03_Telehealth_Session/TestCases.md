# Module 03: Telehealth Session - Test Cases

**Module:** 03 - Telehealth Session
**Version:** 1.1.0-enhanced
**Test Cases Version:** 1.0
**Last Updated:** 2025-10-31

---

## Test Case Summary

| Category | Total | P0-Critical | P1-High | P2-Medium | P3-Low |
|----------|-------|-------------|---------|-----------|--------|
| Happy Path | 3 | 1 | 1 | 1 | 0 |
| Invalid Input | 6 | 2 | 2 | 2 | 0 |
| Integration | 4 | 1 | 3 | 0 | 0 |
| Performance | 1 | 0 | 0 | 1 | 0 |
| Security | 2 | 1 | 1 | 0 | 0 |
| Edge Cases | 2 | 0 | 0 | 1 | 1 |
| **TOTAL** | **18** | **5** | **7** | **5** | **1** |

---

## Happy Path Test Cases

### TC-HP-001: Create Valid Telehealth Session (Zoom)

**Category:** Happy Path
**Priority:** P0-Critical
**Estimated Time:** 5 minutes

#### Description

Verify that a valid booking confirmation successfully creates a Zoom video session and delivers notifications to patient and provider.

#### Prerequisites

- Module 03 workflow active
- Zoom for Healthcare credential configured
- Twilio and SendGrid credentials configured
- Test phone number available (+15550001234)
- Test email addresses set up

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

#### Expected HTTP Response

**Status:** 200 OK

**Body:**
```json
{
  "success": true,
  "message": "Telehealth session created successfully",
  "data": {
    "session_id": "clinic-001_test_appt_001_<timestamp>",
    "platform_meeting_id": "<zoom_meeting_id>",
    "session_link": "https://zoom.us/j/<meeting_id>?pwd=<password>",
    "host_link": "https://zoom.us/s/<meeting_id>?zak=<host_token>",
    "session_password": "<password>",
    "scheduled_time": "2025-11-10T14:00:00.000Z",
    "expires_at": "2025-11-11T14:00:00.000Z",
    "patient_email": "sarah.test@example.com",
    "provider": "Zoom"
  },
  "metadata": {
    "execution_time_ms": <1500-2500>,
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

#### Expected Database/Storage Changes

**HubSpot CRM (if enabled):**
- Contact "test_contact_001" updated
- `telehealth_status` = "SCHEDULED"
- `telehealth_link` = session URL
- `telehealth_expires_at` = 1 day after appointment

**Google Sheets:**
- New row in "Telehealth_Sessions" tab
- PHI masked: `S*** M***`, `s***h@example.com`, `+1-555-***-4234`

**Zoom Platform:**
- New meeting created
- Topic: "General Consultation - Sarah Mitchell"
- Waiting room enabled
- Password required

#### Expected Notifications

**Patient SMS:**
```
Hi Sarah,

Your telehealth appointment is ready!

📅 Sunday, November 10
🕐 2:00 PM America/New_York
🎥 Provider: Dr. Emily Chen

🔗 Join here:
https://zoom.us/j/...

🔑 Password: <password>

⚠️ Join 5 min early to test your connection.

Questions? Call +1-555-123-4567
```

**Patient Email:**
- Subject: "Your Telehealth Appointment - Nov 10, 2025"
- Join button with session link
- Pre-appointment checklist
- HIPAA compliance notice

**Provider Email:**
- Subject: "Telehealth Ready - S*** M*** - Nov 10, 2:00 PM" (masked!)
- Body: Full patient info (unmasked)
- Host link with elevated permissions

#### Pass Criteria

- [x] HTTP response status = 200
- [x] Response `success` = true
- [x] `session_link` is valid Zoom URL
- [x] `session_password` present (if enabled)
- [x] `expires_at` = 1 day after `scheduled_time`
- [x] All metadata delivery flags = true
- [x] Patient receives SMS within 10 seconds
- [x] Patient receives email within 30 seconds
- [x] Provider receives email with masked subject
- [x] CRM updated (if enabled)
- [x] Google Sheets log entry created with masked PHI
- [x] Zoom meeting visible in dashboard
- [x] Execution time < 3000ms

#### Failure Scenarios to Check

- [ ] Session link expires before appointment time
- [ ] Password not included when required
- [ ] PHI exposed (unmasked) in Google Sheets
- [ ] Provider email subject has full patient name
- [ ] SMS or email not delivered (but workflow succeeds)

---

### TC-HP-002: Create Session with Doxy.me Platform

**Category:** Happy Path
**Priority:** P1-High
**Estimated Time:** 5 minutes

#### Description

Verify module works with Doxy.me as alternative video platform.

#### Prerequisites

- Set `TELEHEALTH_PROVIDER_NAME=Doxy.me`
- Doxy.me API credential configured

#### Test Data

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_doxy_001",
  "patient_name": "Michael Rodriguez",
  "patient_email": "michael.test@example.com",
  "patient_phone": "+15550005678",
  "scheduled_time": "2025-11-11T15:30:00.000Z",
  "duration_minutes": 45,
  "provider_name": "Dr. James Wilson"
}
```

#### Expected HTTP Response

**Status:** 200 OK

**Key fields:**
```json
{
  "data": {
    "session_link": "https://doxy.me/<room_name>",
    "host_link": "https://doxy.me/<room_name>?provider=true",
    "session_password": "<pin>",
    "provider": "Doxy.me"
  }
}
```

#### Pass Criteria

- [x] Session link is Doxy.me URL (not Zoom)
- [x] Patient link does NOT have `?provider=true` parameter
- [x] Host link DOES have `?provider=true` parameter
- [x] Session password is 4-digit PIN
- [x] Notifications sent successfully

---

### TC-HP-003: Minimal Required Fields (Defaults Applied)

**Category:** Happy Path
**Priority:** P2-Medium
**Estimated Time:** 3 minutes

#### Description

Verify session creation with only required fields. Optional fields should use environment variable defaults.

#### Test Data

```json
{
  "appointment_confirmed": true,
  "appointment_id": "test_minimal_001",
  "patient_name": "Emma Thompson",
  "patient_email": "emma.test@example.com",
  "scheduled_time": "2025-11-12T10:00:00.000Z"
}
```

**Note:** Missing: `duration_minutes`, `timezone`, `provider_name`, `patient_phone`

#### Expected HTTP Response

**Status:** 200 OK

**Data should include defaults:**
```json
{
  "data": {
    "duration_minutes": 30,
    "timezone": "America/New_York",
    "provider_name": "Provider",
    "patient_phone": ""
  }
}
```

#### Pass Criteria

- [x] Session created successfully
- [x] Duration = 30 (from `DEFAULT_SESSION_DURATION`)
- [x] Timezone = clinic default
- [x] Provider name = default
- [x] Email sent (phone missing so no SMS)

---

## Invalid Input Test Cases

### TC-INV-001: Missing appointment_id

**Category:** Invalid Input
**Priority:** P0-Critical
**Estimated Time:** 2 minutes

#### Description

Verify validation rejects request without `appointment_id`.

#### Test Data

```json
{
  "appointment_confirmed": true,
  "patient_name": "Test Patient",
  "patient_email": "test@example.com",
  "scheduled_time": "2025-11-10T14:00:00.000Z"
}
```

#### Expected HTTP Response

**Status:** 400 Bad Request

```json
{
  "success": false,
  "error": "Validation failed",
  "error_code": "VALIDATION_FAILED",
  "details": [
    "appointment_id: required"
  ],
  "timestamp": "<ISO8601>",
  "trace_id": "SESSION-<timestamp>"
}
```

#### Pass Criteria

- [x] HTTP status = 400 (not 200 or 500)
- [x] `success` = false
- [x] `error_code` = "VALIDATION_FAILED"
- [x] `details` includes "appointment_id: required"
- [x] No session created in Zoom/Doxy
- [x] No notifications sent
- [x] **No PHI in error message**

---

### TC-INV-002: Invalid Email Format

**Category:** Invalid Input
**Priority:** P0-Critical
**Estimated Time:** 2 minutes

#### Description

Verify validation rejects invalid email addresses.

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

#### Expected HTTP Response

**Status:** 400 Bad Request

```json
{
  "success": false,
  "details": [
    "patient_email: required and must be valid format"
  ]
}
```

#### Pass Criteria

- [x] HTTP status = 400
- [x] Error mentions invalid email format
- [x] No session created
- [x] No notifications sent

---

### TC-INV-003: Invalid Date Format (Non-ISO 8601)

**Category:** Invalid Input
**Priority:** P1-High
**Estimated Time:** 2 minutes

#### Description

Verify validation rejects dates not in ISO 8601 format.

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

#### Expected HTTP Response

**Status:** 400

```json
{
  "details": [
    "scheduled_time: must be valid ISO 8601 format"
  ]
}
```

#### Pass Criteria

- [x] HTTP status = 400
- [x] Error mentions ISO 8601 format
- [x] No session created

---

### TC-INV-004: Duration Out of Range (Too Long)

**Category:** Invalid Input
**Priority:** P2-Medium
**Estimated Time:** 2 minutes

#### Description

Verify validation rejects sessions longer than 240 minutes (prevents abuse).

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

#### Expected HTTP Response

**Status:** 400

```json
{
  "details": [
    "duration_minutes: must be between 5 and 240"
  ]
}
```

#### Pass Criteria

- [x] HTTP status = 400
- [x] Error mentions duration limits (5-240)

---

### TC-INV-005: Name Too Short

**Category:** Invalid Input
**Priority:** P2-Medium
**Estimated Time:** 2 minutes

#### Description

Verify validation rejects names with less than 2 characters.

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

#### Expected HTTP Response

**Status:** 400

```json
{
  "details": [
    "patient_name: required, minimum 2 characters"
  ]
}
```

---

### TC-INV-006: Appointment Not Confirmed

**Category:** Invalid Input
**Priority:** P1-High
**Estimated Time:** 2 minutes

#### Description

Verify module only creates sessions for confirmed appointments (`appointment_confirmed = true`).

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

#### Expected HTTP Response

**Status:** 400

```json
{
  "details": [
    "appointment_confirmed: must be true to create session"
  ]
}
```

#### Pass Criteria

- [x] HTTP status = 400
- [x] Error requires confirmation
- [x] No session created

---

## Integration Test Cases

### TC-INT-001: Zoom API Integration

**Category:** Integration
**Priority:** P0-Critical
**Estimated Time:** 7 minutes

#### Description

Verify Zoom meeting is actually created on Zoom platform (not just in database).

#### Test Steps

1. Execute TC-HP-001 (create valid session)
2. Copy `platform_meeting_id` from response
3. Log into Zoom web dashboard (zoom.us)
4. Navigate to "Meetings" section
5. Search for meeting ID

#### Expected Results

**Zoom Dashboard should show:**
- Meeting exists with matching ID
- Topic: "General Consultation - Sarah Mitchell"
- Scheduled time: Nov 10, 2025, 2:00 PM
- Duration: 30 minutes
- Status: Scheduled (not Started or Ended)
- Waiting room: Enabled
- Password: Required
- Join before host: Disabled
- Encryption: Enhanced

#### Pass Criteria

- [x] Meeting found in Zoom dashboard
- [x] Meeting ID matches response
- [x] Topic includes patient name and service type
- [x] Scheduled time is correct
- [x] Security settings match (waiting room, password, encryption)

---

### TC-INT-002: CRM Update (HubSpot)

**Category:** Integration
**Priority:** P1-High
**Estimated Time:** 5 minutes

#### Description

Verify HubSpot contact is updated with session details.

#### Prerequisites

- HubSpot credential configured
- Contact "test_contact_001" exists in HubSpot
- Custom fields created:
  - `telehealth_status`
  - `telehealth_link`
  - `telehealth_session_id`
  - `telehealth_platform`
  - `telehealth_expires_at`

#### Test Steps

1. Execute TC-HP-001
2. Log into HubSpot
3. Search for contact ID "test_contact_001"
4. View contact properties

#### Expected Results

**Contact properties:**
- `telehealth_status` = "SCHEDULED"
- `telehealth_link` = Zoom join URL
- `telehealth_session_id` = session ID from response
- `telehealth_platform` = "Zoom"
- `telehealth_expires_at` = 2025-11-11T14:00:00.000Z

#### Pass Criteria

- [x] All custom fields updated correctly
- [x] Link is clickable
- [x] Expiration date = 1 day after appointment

---

### TC-INT-003: SMS Delivery (Twilio)

**Category:** Integration
**Priority:** P1-High
**Estimated Time:** 5 minutes

#### Description

Verify SMS is delivered via Twilio.

#### Test Steps

1. Execute TC-HP-001
2. Log into Twilio console (twilio.com)
3. Navigate to Monitor → Logs → Messaging
4. Search for phone number "+15550001234"
5. View message details

#### Expected Results

**Twilio logs should show:**
- Message SID exists
- Status: "delivered"
- To: +15550001234
- Body includes: join link, password, appointment time
- Delivery timestamp within 10 seconds of test execution

#### Pass Criteria

- [x] Message status = "delivered"
- [x] Message body includes join link
- [x] Delivery time < 10 seconds

---

### TC-INT-004: Email Delivery (SendGrid)

**Category:** Integration
**Priority:** P1-High
**Estimated Time:** 5 minutes

#### Description

Verify emails are delivered via SendGrid to patient and provider.

#### Test Steps

1. Execute TC-HP-001
2. Log into SendGrid dashboard
3. Navigate to Activity Feed
4. Search for "sarah.test@example.com" and "dr.chen@yourclinic.com"

#### Expected Results

**SendGrid activity feed:**
- 1 email to sarah.test@example.com
  - Subject: "Your Telehealth Appointment - Nov 10, 2025"
  - Status: Delivered
- 1 email to dr.chen@yourclinic.com
  - Subject: "Telehealth Ready - S*** M*** - Nov 10, 2:00 PM"
  - Status: Delivered

#### Pass Criteria

- [x] Both emails delivered
- [x] Provider email subject has masked patient name
- [x] Delivery time < 30 seconds

---

## Performance Test Cases

### TC-PERF-001: Execution Time Under Target

**Category:** Performance
**Priority:** P2-Medium
**Estimated Time:** 15 minutes

#### Description

Verify module completes within target execution time (<2200ms average).

#### Test Steps

1. Execute TC-HP-001 ten times
2. Record `execution_time_ms` from each response
3. Calculate average, min, max

#### Expected Results

- Average execution time < 2200ms
- Maximum execution time < 5000ms
- No timeouts (all 10 succeed)

#### Pass Criteria

- [x] Average < 2200ms
- [x] All executions < 5000ms
- [x] Zero failures

---

## Security Test Cases

### TC-SEC-001: PHI Masking in Logs

**Category:** Security
**Priority:** P0-Critical
**Estimated Time:** 5 minutes

#### Description

Verify patient PHI is masked in Google Sheets audit log (HIPAA compliance).

#### Test Steps

1. Execute TC-HP-001
2. Open Google Sheets "Telehealth_Sessions" tab
3. Find row for "test_appt_001"
4. Examine patient data columns

#### Expected Results

**Google Sheets row should show MASKED data:**
- `patient_name_masked` = "S*** M***"
- `patient_email_masked` = "s***h@example.com"
- `patient_phone_masked` = "+1-555-***-4234"

**Should NOT show:**
- Full patient name "Sarah Mitchell"
- Full email "sarah.test@example.com"
- Full phone "+15550001234"

#### Pass Criteria

- [x] Patient name is masked (first letter + ***)
- [x] Email is masked (first/last char of local part)
- [x] Phone is masked (last 4 digits only)
- [x] No full PHI in any column

**FAIL if:** Any full PHI appears in Google Sheets!

---

### TC-SEC-002: Provider Email Subject Privacy

**Category:** Security
**Priority:** P1-High
**Estimated Time:** 3 minutes

#### Description

Verify provider email subject uses masked patient name (inbox privacy).

#### Test Steps

1. Execute TC-HP-001
2. Check provider email inbox (dr.chen@yourclinic.com)
3. View email subject line without opening email

#### Expected Results

**Subject line:**
```
Telehealth Ready - S*** M*** - Nov 10, 2:00 PM
```

**NOT:**
```
Telehealth Ready - Sarah Mitchell - Nov 10, 2:00 PM
```

#### Pass Criteria

- [x] Subject has masked patient name
- [x] Email body (when opened) has full patient info

**Why this matters:** Email preview in Outlook/Gmail shows subject. Masking prevents PHI exposure if provider's screen is visible.

---

## Edge Case Test Cases

### TC-EDGE-001: International Patient (Non-US Phone)

**Category:** Edge Cases
**Priority:** P2-Medium
**Estimated Time:** 4 minutes

#### Description

Verify module handles international phone numbers correctly.

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

- Session created successfully
- SMS sent to +81-90-1234-5678 (if Twilio supports Japan)
- Phone masked in logs: "+81-90-***-5678"

#### Pass Criteria

- [x] Session created
- [x] International phone accepted
- [x] Phone masking preserves country code

---

### TC-EDGE-002: Special Characters in Name

**Category:** Edge Cases
**Priority:** P3-Low
**Estimated Time:** 3 minutes

#### Description

Verify module handles names with accents, hyphens, apostrophes.

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

- Session created successfully
- Name appears correctly in email (accents preserved)
- No encoding errors (¿, Ã, etc.)
- Name masked correctly: "M*** J*** O***-G***"

#### Pass Criteria

- [x] Accents preserved in notifications
- [x] Hyphens and apostrophes handled
- [x] No encoding errors

---

## Test Execution Tracker

Use this section to track test execution results:

| Test ID | Name | Status | Result | Date | Notes |
|---------|------|--------|--------|------|-------|
| TC-HP-001 | Create Zoom Session | [ ] | [ ] Pass [ ] Fail | | |
| TC-HP-002 | Doxy.me Session | [ ] | [ ] Pass [ ] Fail | | |
| TC-HP-003 | Minimal Fields | [ ] | [ ] Pass [ ] Fail | | |
| TC-INV-001 | Missing ID | [ ] | [ ] Pass [ ] Fail | | |
| TC-INV-002 | Invalid Email | [ ] | [ ] Pass [ ] Fail | | |
| TC-INV-003 | Invalid Date | [ ] | [ ] Pass [ ] Fail | | |
| TC-INV-004 | Duration Range | [ ] | [ ] Pass [ ] Fail | | |
| TC-INV-005 | Name Length | [ ] | [ ] Pass [ ] Fail | | |
| TC-INV-006 | Not Confirmed | [ ] | [ ] Pass [ ] Fail | | |
| TC-INT-001 | Zoom API | [ ] | [ ] Pass [ ] Fail | | |
| TC-INT-002 | HubSpot CRM | [ ] | [ ] Pass [ ] Fail | | |
| TC-INT-003 | Twilio SMS | [ ] | [ ] Pass [ ] Fail | | |
| TC-INT-004 | SendGrid Email | [ ] | [ ] Pass [ ] Fail | | |
| TC-PERF-001 | Execution Time | [ ] | [ ] Pass [ ] Fail | | |
| TC-SEC-001 | PHI Masking | [ ] | [ ] Pass [ ] Fail | | |
| TC-SEC-002 | Email Privacy | [ ] | [ ] Pass [ ] Fail | | |
| TC-EDGE-001 | International | [ ] | [ ] Pass [ ] Fail | | |
| TC-EDGE-002 | Special Chars | [ ] | [ ] Pass [ ] Fail | | |

---

## Test Results Summary Template

**Test Session Date:** ____________
**Tester Name:** ____________
**Environment:** [ ] Development [ ] Staging [ ] Production

**Results:**
- Total Tests Executed: ____ / 18
- Passed: ____
- Failed: ____
- Blocked: ____
- Pass Rate: ____%

**Critical Issues Found:**
1.
2.
3.

**Recommendations:**
- [ ] Ready for production
- [ ] Needs fixes before production
- [ ] Requires additional testing

---

## Quick Reference: Test Data

**Valid Test Patient:**
```json
{
  "patient_name": "Sarah Mitchell",
  "patient_email": "sarah.test@example.com",
  "patient_phone": "+15550001234"
}
```

**Valid Appointment:**
```json
{
  "appointment_id": "test_appt_001",
  "scheduled_time": "2025-11-10T14:00:00.000Z",
  "duration_minutes": 30
}
```

**Valid Provider:**
```json
{
  "provider_name": "Dr. Emily Chen",
  "provider_email": "dr.chen@yourclinic.com"
}
```

---

**All test cases documented! Use [Checklist.md](Checklist.md) to track progress.**
