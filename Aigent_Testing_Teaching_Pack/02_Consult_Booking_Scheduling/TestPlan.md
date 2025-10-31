# Module 02: Consult Booking & Scheduling - Test Plan

**Module:** 02 - Consult Booking & Scheduling
**Version:** 1.1.0-enhanced
**Test Plan Version:** 1.0
**Last Updated:** 2025-10-31
**Audience:** Complete beginners welcome!

---

## Welcome!

This test plan guides you through testing the **Consult Booking & Scheduling** module step-by-step.

**What this module does:** Books patient appointments, syncs with Google Calendar or Cal.com, and sends confirmation emails/SMS.

**Why testing matters:** Double-bookings, missed confirmations, or timezone errors frustrate patients and waste staff time!

**No technical experience needed** — we explain everything clearly.

---

## What This Module Does

**Core functionality:**
1. Accepts booking requests (from Module 01 or direct booking forms)
2. Validates appointment data (date, time, provider availability)
3. Checks calendar for conflicts (prevents double-booking)
4. Creates calendar event (Google Calendar or Cal.com)
5. Sends confirmation email and SMS to patient
6. Notifies staff via Slack/Teams
7. Logs to Google Sheets for tracking

**Real-world scenario:**
- Patient fills out booking form on your website
- Module 02 checks if the requested time is available
- If available → creates appointment, sends confirmations
- If unavailable → suggests alternative times

---

## Before You Begin

### Prerequisites

- [ ] Module 02 workflow active in n8n
- [ ] Webhook URL copied
- [ ] Google Calendar or Cal.com configured
- [ ] SendGrid API key for emails (see EnvMatrix.md)
- [ ] Twilio credentials for SMS (optional but recommended)
- [ ] Google Sheets for appointment log
- [ ] Mock data ready (MockIdentities.json)

### Key Environment Variables

```
GOOGLE_CALENDAR_ID=your-calendar@gmail.com
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=appointments@yourdomain.com
TWILIO_ACCOUNT_SID=ACxxx (optional)
TWILIO_AUTH_TOKEN=xxx (optional)
TWILIO_FROM_NUMBER=+15551234567 (optional)
CLINIC_TIMEZONE=America/New_York
```

See `/00_Shared/EnvMatrix.md` for detailed setup instructions.

---

## Test Suite Overview

**Total tests:** 15

| Category | Tests | Purpose |
|----------|-------|---------|
| Happy Path | 3 | Basic functionality works |
| Invalid Inputs | 5 | Error handling |
| Calendar Integration | 3 | Google Calendar / Cal.com sync |
| Notifications | 2 | Email/SMS confirmations |
| Edge Cases | 2 | Timezone, double-booking prevention |

**Time estimate:** 60-75 minutes

---

## Happy Path Tests

### Test 2.1: Book Appointment (Complete Data)

**Purpose:** Verify end-to-end booking flow

**Test Data:**
```json
{
  "email": "alice.anderson.test@example.com",
  "name": "Alice Anderson",
  "phone": "+15551234001",
  "service_type": "consultation",
  "preferred_date": "2025-11-15",
  "preferred_time": "14:00",
  "timezone": "America/New_York",
  "provider_id": "TEST-PROV-001",
  "notes": "First visit - general checkup"
}
```

**cURL Command:**
```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.anderson.test@example.com",
    "name": "Alice Anderson",
    "phone": "+15551234001",
    "service_type": "consultation",
    "preferred_date": "2025-11-15",
    "preferred_time": "14:00",
    "timezone": "America/New_York",
    "provider_id": "TEST-PROV-001",
    "notes": "First visit - general checkup"
  }'
```

**Expected Results:**

**1. HTTP Response:**
```json
{
  "status": "success",
  "message": "Appointment booked successfully",
  "appointment_id": "APT-20251115-001",
  "calendar_event_id": "abc123xyz",
  "confirmation_email_sent": true,
  "confirmation_sms_sent": true
}
```

**2. Google Calendar:**
- New event appears for 2025-11-15 at 2:00 PM
- Event title: "Consultation - Alice Anderson"
- Event duration: 30 or 60 minutes (based on service type)
- Attendee: alice.anderson.test@example.com

**3. Confirmation Email (within 2 minutes):**
- Subject: "Appointment Confirmed - [Your Clinic Name]"
- Contains: Date, time, provider name, location/video link
- Includes .ics calendar file attachment

**4. Confirmation SMS (within 1 minute, if Twilio configured):**
```
Your appointment is confirmed for Nov 15 at 2:00 PM with Dr. Smith.
Reply CANCEL to cancel. [Your Clinic]
```

**5. Google Sheets:**
- New row with all booking details
- Status: "confirmed"
- Timestamp: current date/time

**Pass Criteria:**
- ✅ All 5 outputs verified
- ✅ Calendar event created successfully
- ✅ Confirmations sent
- ✅ No errors in n8n logs

---

### Test 2.2: Book Appointment (Minimal Data)

**Purpose:** Verify booking works with only required fields

**Test Data:**
```json
{
  "email": "bob.builder.test@example.com",
  "name": "Bob Builder",
  "phone": "+15551234002",
  "service_type": "follow_up"
}
```

**Expected Results:**
- Appointment booked for next available slot
- Default timezone used (from CLINIC_TIMEZONE env var)
- Default provider assigned if not specified
- All confirmations sent

---

### Test 2.3: Book with Different Service Types

**Purpose:** Verify different service types (consultation, follow_up, urgent_care) are handled correctly

**Test Data:** Run separately for each service type:

```json
{"email": "test1@example.com", "name": "Test 1", "phone": "+15551111", "service_type": "consultation"}
{"email": "test2@example.com", "name": "Test 2", "phone": "+15552222", "service_type": "follow_up"}
{"email": "test3@example.com", "name": "Test 3", "phone": "+15553333", "service_type": "urgent_care"}
```

**Expected Results:**
- Different durations based on service type
- Consultation: 30-60 minutes
- Follow-up: 15-30 minutes
- Urgent care: 15-20 minutes

---

## Invalid Input Tests

### Test 2.4: Missing Required Fields

**Purpose:** Verify validation catches missing fields

**Test Cases:**

**2.4a: Missing email**
```json
{"name": "No Email", "phone": "+15556661001", "service_type": "consultation"}
```
Expected error: `"email: required and must be valid format"`

**2.4b: Missing name**
```json
{"email": "no.name@example.com", "phone": "+15556661002", "service_type": "consultation"}
```
Expected error: `"name: required, minimum 2 characters"`

**2.4c: Missing phone**
```json
{"email": "no.phone@example.com", "name": "No Phone", "service_type": "consultation"}
```
Expected error: `"phone: required"`

**2.4d: Missing service_type**
```json
{"email": "test@example.com", "name": "Test User", "phone": "+15556661003"}
```
Expected error: `"service_type: required"`

---

### Test 2.5: Invalid Date Formats

**Purpose:** Verify date validation

**Test Cases:**

**2.5a: Past date**
```json
{
  "email": "test@example.com",
  "name": "Test User",
  "phone": "+15551234567",
  "service_type": "consultation",
  "preferred_date": "2020-01-01"
}
```
Expected error: `"preferred_date: cannot be in the past"`

**2.5b: Invalid date format**
```json
{
  "preferred_date": "11/15/2025"
}
```
Expected error: `"preferred_date: must be valid ISO 8601 format (YYYY-MM-DD)"`

---

### Test 2.6: Invalid Time Format

**Purpose:** Verify time validation

**Test Cases:**

**2.6a: Invalid time format**
```json
{
  "email": "test@example.com",
  "name": "Test User",
  "phone": "+15551234567",
  "service_type": "consultation",
  "preferred_time": "2:00 PM"
}
```
Expected error: `"preferred_time: must be valid HH:MM format (e.g., 14:30)"`

**2.6b: Time outside business hours**
```json
{
  "preferred_time": "23:00"
}
```
Expected: Either error or automatic rescheduling to business hours

---

## Calendar Integration Tests

### Test 2.7: Google Calendar Event Creation

**Purpose:** Verify calendar integration works

**Steps:**
1. Book appointment using Test 2.1 data
2. Open Google Calendar in browser
3. Navigate to the appointment date
4. Verify event exists

**Verification:**
- ✅ Event appears on correct date/time
- ✅ Event title matches patient name + service type
- ✅ Duration is correct
- ✅ Patient email added as attendee
- ✅ Event description includes appointment ID

---

### Test 2.8: Double-Booking Prevention

**Purpose:** Verify system prevents booking same time twice

**Steps:**
1. Book appointment for 2025-11-15 at 2:00 PM (Test 2.1)
2. Try to book ANOTHER appointment at same time:

```json
{
  "email": "carol.chen.test@example.com",
  "name": "Carol Chen",
  "phone": "+15551234003",
  "service_type": "consultation",
  "preferred_date": "2025-11-15",
  "preferred_time": "14:00",
  "provider_id": "TEST-PROV-001"
}
```

**Expected Results:**
```json
{
  "status": "error",
  "message": "Time slot unavailable",
  "available_times": ["13:00", "15:00", "16:00"],
  "conflict_details": {
    "existing_appointment_id": "APT-20251115-001",
    "existing_patient": "A.A."
  }
}
```

**Pass Criteria:**
- ✅ Second booking is rejected
- ✅ Clear error message
- ✅ Alternative times suggested
- ✅ Existing appointment details masked (privacy)

---

### Test 2.9: Calendar Sync Verification

**Purpose:** Verify changes in calendar reflect in system

**Steps:**
1. Book appointment via webhook
2. Manually edit event in Google Calendar (change time)
3. Check if system reflects the change (or prevents it)

**Expected:** System should either:
- Update Google Sheets to match calendar, OR
- Prevent manual calendar edits, OR
- Flag discrepancy for staff review

---

## Notification Tests

### Test 2.10: Email Confirmation Delivery

**Purpose:** Verify confirmation emails are sent correctly

**Steps:**
1. Book appointment using Test 2.1
2. Check email inbox for alice.anderson.test@example.com

**Expected Email Contents:**
- **Subject:** Contains "Appointment Confirmed"
- **Body includes:**
  - Patient name
  - Appointment date and time
  - Provider name
  - Service type
  - Location or video link
  - Cancellation/rescheduling link
  - Contact information
- **Attachment:** .ics calendar file

**Verification:**
- ✅ Email arrives within 2 minutes
- ✅ All required information present
- ✅ .ics file attaches correctly
- ✅ .ics file imports to calendar apps

---

### Test 2.11: SMS Confirmation Delivery

**Purpose:** Verify SMS confirmations work (if Twilio configured)

**Note:** Skip if Twilio not configured

**Steps:**
1. Book appointment using Test 2.1
2. Check for SMS to +15551234001

**Expected SMS:**
```
Your appointment is confirmed for Nov 15 at 2:00 PM with Dr. Smith.
Reply CANCEL to cancel. [Clinic Name]
```

**Verification:**
- ✅ SMS arrives within 1 minute
- ✅ Date/time accurate
- ✅ Provider name correct
- ✅ Reply-to-cancel instruction included

---

## Edge Case Tests

### Test 2.12: Timezone Handling

**Purpose:** Verify timezone conversions work correctly

**Test Data:**
```json
{
  "email": "timezone.test@example.com",
  "name": "Timezone Test",
  "phone": "+15551234567",
  "service_type": "consultation",
  "preferred_date": "2025-11-15",
  "preferred_time": "14:00",
  "timezone": "America/Los_Angeles"
}
```

**Clinic timezone:** America/New_York (3 hours ahead)

**Expected Results:**
- Calendar event created at correct time in clinic timezone
- Email shows time in patient's timezone: "2:00 PM Pacific Time"
- Google Calendar event shows correct local time
- No timezone confusion errors

**Verification:**
- ✅ Calculate expected time difference
- ✅ Calendar event time is correct in clinic timezone
- ✅ Confirmation shows time in patient timezone
- ✅ SMS mentions timezone if applicable

---

### Test 2.13: Same-Day Booking

**Purpose:** Verify same-day appointments work

**Test Data:**
```json
{
  "email": "sameday@example.com",
  "name": "Same Day Test",
  "phone": "+15551234567",
  "service_type": "urgent_care",
  "preferred_date": "2025-10-31",
  "preferred_time": "16:00"
}
```

(Use today's date and a time 2+ hours in the future)

**Expected Results:**
- Appointment accepted if time is available
- Urgent confirmation (emails/SMS sent immediately)
- Staff notified of same-day booking

---

## Observability Checklist

After each test, verify:

**HTTP Response:**
- [ ] Status field present (success/error)
- [ ] Appointment ID generated
- [ ] Calendar event ID returned

**Google Calendar:**
- [ ] Event created on correct date/time
- [ ] Duration correct
- [ ] Attendee email matches patient

**Email:**
- [ ] Delivered within 2 minutes
- [ ] All required info present
- [ ] .ics attachment works

**SMS (if configured):**
- [ ] Delivered within 1 minute
- [ ] Date/time accurate

**Google Sheets:**
- [ ] Row created with booking details
- [ ] Status marked as "confirmed"
- [ ] Timestamp accurate

**n8n Logs:**
- [ ] All nodes green checkmarks
- [ ] No errors
- [ ] Execution time < 10 seconds

---

## Common Issues & Solutions

**Issue:** "Calendar event not created"
- Check Google Calendar credential in n8n
- Verify GOOGLE_CALENDAR_ID is correct
- Test credential using n8n's test button

**Issue:** "Email not received"
- Check SendGrid API key
- Verify SENDGRID_FROM_EMAIL is verified in SendGrid
- Check spam folder
- Verify email delivery in SendGrid dashboard

**Issue:** "Time slot shows as unavailable but calendar is empty"
- Check timezone configuration
- Verify calendar is not shared/locked
- Check for recurring events that might conflict

**Issue:** "Double-booking not prevented"
- Verify availability check node is enabled
- Check calendar refresh/cache settings
- Ensure provider_id matches calendar

---

## Success Criteria

Module 02 testing is successful when:

- ✅ All happy path tests pass (3/3)
- ✅ All validation tests reject appropriately (5/5)
- ✅ Calendar integration works (3/3)
- ✅ Confirmations deliver (2/2)
- ✅ Edge cases handled (2/2)
- ✅ **Overall pass rate: ≥95%**

---

## Next Steps

After completing Module 02 testing:

1. Review `/02_Consult_Booking_Scheduling/KeyPoints.md`
2. Check `/02_Consult_Booking_Scheduling/Troubleshooting.md` for any issues
3. Move to Module 03 (Telehealth Session) testing
4. Practice booking appointments for different scenarios

---

**Great job testing appointment booking! You're ensuring patients get confirmed and staff stay organized!** 📅✅
