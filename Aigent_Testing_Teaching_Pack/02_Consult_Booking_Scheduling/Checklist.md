# Module 02: Consult Booking & Scheduling - Testing Checklist

**Module:** 02 - Consult Booking & Scheduling
**Version:** 1.1.0-enhanced
**Use this checklist to:** Track your testing progress and ensure nothing is missed

---

## How to Use This Checklist

1. **Print or save a copy** for your testing session
2. **Check off each item** as you complete it
3. **Record results** in the "Result" column (Pass/Fail)
4. **Note booking IDs** for traceability
5. **Calculate pass rate** for each category
6. **Use for bug reports** to show what you tested

---

## Pre-Testing Setup

- [ ] n8n workflow is active (green toggle ON)
- [ ] Webhook URL copied and ready
- [ ] Environment variables verified (see EnvMatrix.md)
- [ ] Google Calendar or Cal.com configured and accessible
- [ ] Test calendar created (NOT production calendar!)
- [ ] SendGrid API key set and sender email verified
- [ ] Twilio configured (optional but recommended)
- [ ] CLINIC_TIMEZONE environment variable set correctly
- [ ] Google Sheets with "Appointments" tab exists
- [ ] Google Sheets credential connected in n8n
- [ ] Mock data ready (MockIdentities.json or MockData/ folder)
- [ ] Terminal/command prompt ready
- [ ] Test log notebook/file created (recommended)

---

## Happy Path Tests (5 Tests)

| Test ID | Test Name | Status | Result | Booking ID | Notes |
|---------|-----------|--------|--------|------------|-------|
| TC-HP-001 | Book Valid Appointment (Preferred Date/Time) | [ ] | ⬜ Pass ⬜ Fail | _____________ | Calendar event created? _____ |
| TC-HP-002 | Book Appointment Without Date/Time (Smart Recommendation) | [ ] | ⬜ Pass ⬜ Fail | _____________ | Recommended time reasonable? _____ |
| TC-HP-003 | Book Appointment with Different Timezone | [ ] | ⬜ Pass ⬜ Fail | _____________ | Timezone converted correctly? _____ |
| TC-HP-004 | Book for Existing Contact | [ ] | ⬜ Pass ⬜ Fail | _____________ | CRM updated not duplicated? _____ |
| TC-HP-005 | Book with All Optional Fields | [ ] | ⬜ Pass ⬜ Fail | _____________ | All fields preserved? _____ |

**Happy Path Tests Passed:** ___ / 5
**Pass Rate:** ____%

---

## Invalid Input Tests (7 Tests)

| Test ID | Test Name | Status | Result | Error Code | Notes |
|---------|-----------|--------|--------|------------|-------|
| TC-INV-001 | Missing Required Field (Email) | [ ] | ⬜ Pass ⬜ Fail | __________ | Error message clear? _____ |
| TC-INV-002 | Invalid Email Format | [ ] | ⬜ Pass ⬜ Fail | __________ | Error message clear? _____ |
| TC-INV-003 | Name Too Short | [ ] | ⬜ Pass ⬜ Fail | __________ | Min length enforced? _____ |
| TC-INV-004 | Phone Number Too Short | [ ] | ⬜ Pass ⬜ Fail | __________ | Min digits enforced? _____ |
| TC-INV-005 | Past Date Rejection | [ ] | ⬜ Pass ⬜ Fail | __________ | Past dates blocked? _____ |
| TC-INV-006 | Invalid Date Format | [ ] | ⬜ Pass ⬜ Fail | __________ | ISO 8601 required? _____ |
| TC-INV-007 | Invalid Time Format | [ ] | ⬜ Pass ⬜ Fail | __________ | HH:MM required? _____ |

**Invalid Input Tests Passed:** ___ / 7
**Pass Rate:** ____%

---

## Edge Case Tests (4 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-EDGE-001 | International Phone Number | [ ] | ⬜ Pass ⬜ Fail | Country code handled? _____ |
| TC-EDGE-002 | Name with Special Characters | [ ] | ⬜ Pass ⬜ Fail | Characters preserved? _____ |
| TC-EDGE-003 | Maximum Length Fields | [ ] | ⬜ Pass ⬜ Fail | Length limits enforced? _____ |
| TC-EDGE-004 | Same-Day Booking | [ ] | ⬜ Pass ⬜ Fail | Today's date allowed? _____ |

**Edge Case Tests Passed:** ___ / 4
**Pass Rate:** ____%

---

## Integration Tests (4 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-INT-001 | Google Calendar Integration | [ ] | ⬜ Pass ⬜ Fail | Event visible in calendar? _____ |
| TC-INT-002 | Email Delivery with .ics Attachment | [ ] | ⬜ Pass ⬜ Fail | .ics opens correctly? _____ |
| TC-INT-003 | SMS Delivery via Twilio | [ ] ⬜ Skip | ⬜ Pass ⬜ Fail | SMS received? _____ |
| TC-INT-004 | Google Sheets Logging | [ ] | ⬜ Pass ⬜ Fail | Row added correctly? _____ |

**Integration Tests Passed:** ___ / 4 (or 3 if SMS skipped)
**Pass Rate:** ____%

---

## Performance Tests (2 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-PERF-001 | Standard Booking Speed | [ ] | ⬜ Pass ⬜ Fail | Response time: _____ms |
| TC-PERF-002 | Concurrent Booking Load | [ ] | ⬜ Pass ⬜ Fail | All succeeded? _____ |

**Target for TC-PERF-001:** < 8000ms (8 seconds)

**Execution times recorded (TC-PERF-001):**
1. _____ms
2. _____ms
3. _____ms
4. _____ms
5. _____ms

**Average:** _____ms
**Min:** _____ms
**Max:** _____ms

**Performance Tests Passed:** ___ / 2
**Pass Rate:** ____%

---

## Security Tests (2 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-SEC-001 | Phone Number Masking in Logs | [ ] | ⬜ Pass ⬜ Fail | Phone masked in n8n logs? _____ |
| TC-SEC-002 | Duplicate Booking Prevention | [ ] | ⬜ Pass ⬜ Fail | Duplicate rejected? _____ |

**IMPORTANT:** If TC-SEC-001 fails (unmasked PHI in logs), report as critical security issue!

**Security Tests Passed:** ___ / 2
**Pass Rate:** ____%

---

## Observability Checks

After running all tests, verify observability is working across all sources:

### HTTP Responses

- [ ] All success responses include `"success": true`
- [ ] All success responses include `booking_id`
- [ ] All success responses include `appointment_time` with timezone offset
- [ ] All success responses include `confirmation_sent` object
- [ ] All success responses include `calendar_event_id`
- [ ] All error responses include specific `details` array
- [ ] All responses include `trace_id` for debugging

### Email Confirmations

- [ ] Emails received within 30 seconds for all successful bookings
- [ ] Subject line includes date and time
- [ ] Email body shows all appointment details
- [ ] Time displayed in PATIENT's timezone (not clinic's)
- [ ] .ics file attached to all emails
- [ ] .ics file is 1-5 KB in size
- [ ] .ics file opens in calendar apps (tested: _____________)
- [ ] Event time in .ics is correct when opened

### SMS Confirmations (if enabled)

- [ ] SMS received within 60 seconds for all successful bookings
- [ ] SMS includes date, time, timezone abbreviation
- [ ] SMS includes booking ID
- [ ] SMS includes contact/cancel instructions
- [ ] SMS is readable (no garbled text)
- [ ] SMS is under 160 characters (1 message)

### Calendar Events

- [ ] Events appear in calendar within 10 seconds
- [ ] Event titles include patient name + service type
- [ ] Event times match booking requests
- [ ] Events show in CLINIC's timezone
- [ ] Event durations are correct (30 min default)
- [ ] Event details include booking ID and notes
- [ ] No overlapping events (double-booking prevented)

### Google Sheets

- [ ] New rows appear within 15 seconds
- [ ] All required fields populated
- [ ] Phone numbers normalized to E.164 format
- [ ] Timezones stored as IANA format (America/New_York)
- [ ] Booking IDs match HTTP responses
- [ ] Calendar Event IDs match calendar system
- [ ] Confirmation statuses recorded ("sent" or "failed")
- [ ] Timestamps accurate

### n8n Execution Logs

- [ ] All successful executions show green status
- [ ] All nodes show green checkmarks for successes
- [ ] Execution times are reasonable (< 10 seconds)
- [ ] No unexpected error messages in logs
- [ ] Failed tests show correct error nodes (red)
- [ ] Data flows correctly through all nodes

---

## Timezone Verification

**CRITICAL TEST:** Verify timezone conversions are correct

| Patient Timezone | Patient Time | Clinic Timezone | Expected Clinic Time | Actual Clinic Time | Pass? |
|------------------|--------------|-----------------|----------------------|--------------------|-------|
| America/Los_Angeles | 10:00 AM | America/New_York | 1:00 PM | _________ | ⬜ Pass ⬜ Fail |
| America/Chicago | 2:30 PM | America/New_York | 3:30 PM | _________ | ⬜ Pass ⬜ Fail |
| America/Denver | 9:00 AM | America/New_York | 11:00 AM | _________ | ⬜ Pass ⬜ Fail |
| Europe/London | 5:00 PM | America/New_York | 12:00 PM | _________ | ⬜ Pass ⬜ Fail |

**Tool used for verification:** worldtimebuddy.com

**All timezone conversions correct?** ⬜ Yes ⬜ No

---

## Double-Booking Prevention Test

**Test scenario:**
1. Book appointment at 2:00 PM on November 15 → Status: _________
2. Book another at 2:00 PM on November 15 → Status: _________
3. Expected: First succeeds, second is rejected

**Result:** ⬜ Pass (first succeeded, second rejected) ⬜ Fail (both succeeded)

**If failed, calendar shows:** ___ event(s) at 2:00 PM (should be 1)

---

## .ics Attachment Testing

**Test the .ics attachment in multiple calendar apps:**

| Calendar App | .ics Opens? | Event Details Correct? | Time Correct in Local TZ? | Pass? |
|--------------|-------------|------------------------|---------------------------|-------|
| Google Calendar | ⬜ Yes ⬜ No | ⬜ Yes ⬜ No | ⬜ Yes ⬜ No | ⬜ Pass ⬜ Fail |
| Outlook | ⬜ Yes ⬜ No | ⬜ Yes ⬜ No | ⬜ Yes ⬜ No | ⬜ Pass ⬜ Fail |
| Apple Calendar | ⬜ Yes ⬜ No | ⬜ Yes ⬜ No | ⬜ Yes ⬜ No | ⬜ Pass ⬜ Fail |

**All calendar apps tested successfully?** ⬜ Yes ⬜ No

---

## Overall Test Results Summary

**Total Tests:** 24
**Tests Run:** _____
**Tests Passed:** _____
**Tests Failed:** _____
**Tests Skipped:** _____

**Overall Pass Rate:** _____%

**Pass Criteria:**
- **Production Ready:** ≥ 95% pass rate (critical tests must all pass)
- **Needs Work:** 80-94% pass rate
- **Not Ready:** < 80% pass rate

**Module 02 Status:** ⬜ Production Ready ⬜ Needs Work ⬜ Not Ready

---

## Critical Issues Found

**List any critical failures (P0-Critical tests that failed):**

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________
4. _________________________________________________________________
5. _________________________________________________________________

**Critical failures MUST be fixed before production deployment!**

---

## Performance Metrics

**Overall Performance Summary:**

- **Average booking time:** _____ms
- **Fastest booking:** _____ms (Test ID: ______)
- **Slowest booking:** _____ms (Test ID: ______)
- **Calendar API avg time:** _____ms
- **Email send avg time:** _____ms
- **SMS send avg time:** _____ms

**Performance Status:**
- ⬜ Excellent (< 5 seconds avg)
- ⬜ Good (5-8 seconds avg)
- ⬜ Acceptable (8-10 seconds avg)
- ⬜ Needs Improvement (> 10 seconds avg)

---

## Integration Status

**External services tested:**

| Service | Status | Notes |
|---------|--------|-------|
| Google Calendar / Cal.com | ⬜ Working ⬜ Issues | ___________________________ |
| SendGrid (Email) | ⬜ Working ⬜ Issues | ___________________________ |
| Twilio (SMS) | ⬜ Working ⬜ Issues ⬜ Not Tested | ___________________________ |
| Google Sheets | ⬜ Working ⬜ Issues | ___________________________ |
| n8n Workflow | ⬜ Working ⬜ Issues | ___________________________ |

**All critical integrations working?** ⬜ Yes ⬜ No

---

## Data Quality Checks

- [ ] All booking IDs unique (no duplicates)
- [ ] All booking IDs follow format: BOOK-[timestamp]
- [ ] All phone numbers normalized to E.164
- [ ] All timezones stored as IANA format
- [ ] All timestamps accurate (within 5 seconds)
- [ ] All calendar event IDs present
- [ ] All confirmation statuses recorded
- [ ] No data truncation or corruption

**Data quality acceptable?** ⬜ Yes ⬜ No

---

## Environment Validation

**Verify all critical environment variables are set:**

- [ ] SCHEDULING_API_BASE_URL
- [ ] SCHEDULING_EVENT_TYPE_ID
- [ ] SCHEDULING_CREDENTIAL_ID
- [ ] SENDGRID_API_KEY
- [ ] CLINIC_TIMEZONE
- [ ] CLINIC_EMAIL
- [ ] TWILIO_ACCOUNT_SID (if using SMS)
- [ ] TWILIO_AUTH_TOKEN (if using SMS)
- [ ] TWILIO_PHONE_FROM (if using SMS)

**All required variables set?** ⬜ Yes ⬜ No

---

## Test Data Used

**Record which mock identities were used:**

- [ ] MOCK-001: Sarah Johnson
- [ ] MOCK-002: Michael Chen
- [ ] MOCK-003: Emma Rodriguez
- [ ] MOCK-004: David Kim
- [ ] MOCK-005: Lisa Patel
- [ ] Other: _____________________
- [ ] Other: _____________________

**Test calendar used:** _____________________

**Test date range:** __________ to __________

---

## Recommendations

**Based on test results, recommendations for next steps:**

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________
4. _________________________________________________________________
5. _________________________________________________________________

---

## Sign-Off

**Testing completed by:** ___________________

**Date:** ___________________

**Total time spent:** ___________________

**Reviewer:** ___________________

**Review date:** ___________________

**Approved for production?** ⬜ Yes ⬜ No ⬜ Conditional

**Conditions (if conditional approval):**

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

---

## Appendix: Quick Test Data Reference

**Valid booking template:**
```json
{
  "email": "patient@example.com",
  "name": "Patient Name",
  "phone": "+1-555-0100",
  "service_type": "Initial Consultation",
  "preferred_date": "2025-11-15",
  "preferred_time": "14:30",
  "timezone": "America/New_York"
}
```

**Service types tested:**
- [ ] Initial Consultation
- [ ] Follow-up Visit
- [ ] Annual Physical
- [ ] Specialist Referral
- [ ] Telehealth Consultation
- [ ] Urgent Care

**Timezones tested:**
- [ ] America/New_York (Eastern)
- [ ] America/Chicago (Central)
- [ ] America/Denver (Mountain)
- [ ] America/Los_Angeles (Pacific)
- [ ] Europe/London (GMT)
- [ ] Other: _____________________

---

**End of Checklist**

**Remember:** Clean up test appointments from calendar after testing! 🗑️

**Next steps:**
- Review [TestPlan.md](TestPlan.md) for detailed instructions
- Consult [Troubleshooting.md](Troubleshooting.md) for issues
- Check [Observability.md](Observability.md) for verification steps
