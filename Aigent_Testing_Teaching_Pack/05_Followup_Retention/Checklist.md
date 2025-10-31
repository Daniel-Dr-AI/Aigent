# Module 05: Follow-Up & Retention - Testing Checklist

**Module:** 05 - Follow-Up & Retention
**Version:** 1.1.0-enhanced
**Checklist Version:** 1.0
**Last Updated:** 2025-10-31
**Tester:** ___________________
**Date:** ___________________

---

## How to Use This Checklist

This checklist helps you track your testing progress for Module 05.

**Instructions:**
1. Print this document or keep it open while testing
2. Check boxes as you complete each item
3. Fill in "Result" column (Pass/Fail)
4. Add notes for any failures or issues
5. Sign off at the end when all tests pass

**Status Options:**
- ☐ Not tested yet
- ✅ Tested and passed
- ❌ Tested and failed

---

## Pre-Testing Setup

Complete these before starting any tests:

- [ ] n8n workflow "Aigent Module 05: Followup & Retention Enhanced" is ACTIVE (green toggle)
- [ ] Webhook URL copied from n8n (Node 501)
- [ ] SendGrid API key configured in n8n credentials
- [ ] SendGrid "From" email address verified
- [ ] Twilio Account SID configured in n8n credentials
- [ ] Twilio Auth Token configured in n8n credentials
- [ ] Twilio phone number configured and active
- [ ] Environment variable `SURVEY_BASE_URL` is set
- [ ] Environment variable `REBOOKING_LINK` is set
- [ ] Environment variable `CLINIC_NAME` is set
- [ ] cURL installed and working (`curl --version` succeeds)
- [ ] Mock data ready (see `/00_Shared/MockIdentities.json` or `MockData/` folder)
- [ ] Testing performed in DEVELOPMENT environment (not production)

**Setup Complete?** [ ] Yes  [ ] No

---

## Happy Path Tests

### HP-001: Complete Sequence Start (Email + SMS)

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (patient_id, email, phone, name, visit_type) | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 200 response | ☐ | | |
| 4 | Verify `"success": true` in response | ☐ | | |
| 5 | Copy `trace_id` from response | ☐ | | trace_id: _____________ |
| 6 | Verify `touches_sent` includes "day0_email" and "day0_sms" | ☐ | | |
| 7 | Verify both touch_results show `"status": "sent"` | ☐ | | |
| 8 | Check SendGrid Activity - email delivered | ☐ | | |
| 9 | Check Twilio Logs - SMS delivered | ☐ | | |
| 10 | Check n8n execution - status "Success" | ☐ | | |
| 11 | Verify `execution_time_ms` < 3000 | ☐ | | Time: ________ ms |
| 12 | Verify survey_link has all parameters | ☐ | | |
| 13 | Verify rebooking_link has UTM parameters | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### HP-002: Email-Only Sequence (No Phone)

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (without patient_phone) | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 200 response | ☐ | | |
| 4 | Verify `"success": true` | ☐ | | |
| 5 | Verify `touches_sent` includes only "day0_email" | ☐ | | |
| 6 | Verify touch_results does NOT include day0_sms | ☐ | | |
| 7 | Check SendGrid Activity - email delivered | ☐ | | |
| 8 | Check Twilio Logs - no SMS sent | ☐ | | |
| 9 | Check n8n execution - status "Success" (not error) | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### HP-003: Minimal Required Fields

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (only patient_id, email, visit_type) | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 200 response | ☐ | | |
| 4 | Verify `"success": true` | ☐ | | |
| 5 | Check email greeting shows "Hi Valued Patient," (default) | ☐ | | |
| 6 | Check email signature shows "Your Provider" (default) | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### HP-004: Survey Link Generation

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data with special characters in email (e.g., test+special@example.com) | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify response includes `survey_link` field | ☐ | | |
| 4 | Verify survey_link starts with `SURVEY_BASE_URL` | ☐ | | |
| 5 | Verify email parameter is URL-encoded (+ becomes %2B, @ becomes %40) | ☐ | | |
| 6 | Verify survey_link includes patient_id parameter | ☐ | | |
| 7 | Verify survey_link includes trace_id parameter | ☐ | | |
| 8 | Test survey link in browser - loads correctly | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### HP-005: Rebooking Link with UTM Tracking

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Execute standard test | ☐ | | |
| 2 | Verify response includes `rebooking_link` field | ☐ | | |
| 3 | Verify link includes `utm_source=followup` | ☐ | | |
| 4 | Verify link includes `utm_medium=email` | ☐ | | |
| 5 | Verify link includes `utm_campaign=day14_rebook` | ☐ | | |
| 6 | Verify link includes `patient_id` parameter | ☐ | | |
| 7 | Verify link includes `trace_id` parameter | ☐ | | |
| 8 | Test rebooking link in browser - loads correctly | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

## Invalid Input Tests

### INV-001: Missing patient_email

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (omit patient_email field) | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 400 response | ☐ | | |
| 4 | Verify `"success": false` | ☐ | | |
| 5 | Verify error code is "VALIDATION_FAILED" | ☐ | | |
| 6 | Verify error details mention "patient_email: required" | ☐ | | |
| 7 | Verify no email sent (check SendGrid) | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### INV-002: Invalid Email Format

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (patient_email = "not-an-email") | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 400 response | ☐ | | |
| 4 | Verify validation error mentions invalid email format | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### INV-003: Email Too Long (>320 characters)

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (patient_email >320 chars) | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 400 response | ☐ | | |
| 4 | Verify error mentions "maximum 320 characters" | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### INV-004: Missing patient_id

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (omit patient_id) | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 400 response | ☐ | | |
| 4 | Verify error mentions "patient_id: required" | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### INV-005: Missing visit_type

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (omit visit_type) | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 400 response | ☐ | | |
| 4 | Verify error mentions "visit_type: required" | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### INV-006: Phone Number Too Short

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (patient_phone = "12345") | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 400 response | ☐ | | |
| 4 | Verify error mentions "must be 7-20 digits" | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### INV-007: Future Visit Date

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (visit_date = "2026-12-31T00:00:00Z") | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 400 response | ☐ | | |
| 4 | Verify error mentions "cannot be in the future" | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

## Integration Tests

### INT-001: SendGrid Email Delivery

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Execute standard test | ☐ | | |
| 2 | Log into SendGrid dashboard | ☐ | | |
| 3 | Go to Activity → Email Activity | ☐ | | |
| 4 | Find email by recipient address | ☐ | | |
| 5 | Verify status is "Delivered" (within 30 seconds) | ☐ | | |
| 6 | Verify subject line is correct | ☐ | | |
| 7 | Click email to view content | ☐ | | |
| 8 | Verify email body includes patient name | ☐ | | |
| 9 | Verify email body includes visit type | ☐ | | |
| 10 | Verify email body includes provider name | ☐ | | |
| 11 | Verify no bounce or spam report | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### INT-002: Twilio SMS Delivery

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Execute standard test (with phone number) | ☐ | | |
| 2 | Log into Twilio console | ☐ | | |
| 3 | Go to Messaging → Logs → Messages | ☐ | | |
| 4 | Find SMS by recipient phone number | ☐ | | |
| 5 | Verify status is "Delivered" (within 60 seconds) | ☐ | | |
| 6 | Verify "To" number is in E.164 format (+15551234567) | ☐ | | |
| 7 | Verify "From" number is your Twilio number | ☐ | | |
| 8 | Verify message content is personalized | ☐ | | |
| 9 | Verify no error codes | ☐ | | |
| 10 | Verify price charged (confirms sending) | ☐ | | Price: $________ |

**Overall Result:** ☐ Pass  ☐ Fail

---

### INT-003: Google Sheets Logging (if configured)

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Execute standard test | ☐ | | |
| 2 | Open Google Sheets tracking spreadsheet | ☐ | | |
| 3 | Go to "Follow-Up Sequences" tab | ☐ | | |
| 4 | Verify new row appears (within 15 seconds) | ☐ | | |
| 5 | Verify trace_id matches HTTP response | ☐ | | |
| 6 | Verify patient_id is correct | ☐ | | |
| 7 | Verify patient_email is correct | ☐ | | |
| 8 | Verify touches_sent column populated | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail  ☐ N/A (not configured)

---

## Performance Tests

### PERF-001: Execution Time (Day-0 Response)

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Execute test with `time curl ...` command | ☐ | | |
| 2 | Record total execution time | ☐ | | Time: ________ seconds |
| 3 | Verify total time < 3 seconds | ☐ | | |
| 4 | Verify response `execution_time_ms` < 3000 | ☐ | | Time: ________ ms |
| 5 | Verify `performance_category` is "fast" or "normal" | ☐ | | Category: ____________ |

**Overall Result:** ☐ Pass  ☐ Fail

---

### PERF-002: Concurrent Sequences

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare 5 test payloads (different patient_ids) | ☐ | | |
| 2 | Execute all 5 concurrently (see TestPlan.md for script) | ☐ | | |
| 3 | Verify all 5 return `"success": true` | ☐ | | |
| 4 | Verify total time for all 5 < 5 seconds | ☐ | | Total time: ________ s |
| 5 | Check n8n - all 5 executions successful | ☐ | | |
| 6 | Check SendGrid - all 5 emails sent | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

## Security Tests

### SEC-001: PHI Masking Verification

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Execute test with patient data | ☐ | | |
| 2 | Check n8n execution log - patient data visible (expected) | ☐ | | |
| 3 | Check server console logs - no patient data logged | ☐ | | |
| 4 | Trigger validation error - check error message | ☐ | | |
| 5 | Verify error doesn't expose patient name or contact info | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

## Edge Case Tests

### EDGE-001: International Characters in Name

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (patient_name = "José García-Pérez") | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 200 response | ☐ | | |
| 4 | Check email greeting - shows name with correct accents | ☐ | | |
| 5 | Verify no character encoding errors | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### EDGE-002: Very Long Visit Type

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (visit_type 150+ characters) | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 200 response | ☐ | | |
| 4 | Check email shows full visit type | ☐ | | |
| 5 | Verify email formatting not broken | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### EDGE-003: Phone Number Various Formats

Test each format separately:

| Format | Input | Status | Normalized Output | Result | Notes |
|--------|-------|--------|-------------------|--------|-------|
| US Standard | (555) 123-4567 | ☐ | Expected: 15551234567 | | |
| E.164 | +15551234567 | ☐ | Expected: 15551234567 | | |
| Digits Only | 5551234567 | ☐ | Expected: 15551234567 | | |
| International | +44 20 7946 0958 | ☐ | Expected: 442079460958 | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

### EDGE-004: Empty String vs Null for Optional Fields

| Step | Task | Status | Result | Notes |
|------|------|--------|--------|-------|
| 1 | Prepare test data (patient_name = "", phone = "", provider = "") | ☐ | | |
| 2 | Execute cURL command | ☐ | | |
| 3 | Verify HTTP 200 response | ☐ | | |
| 4 | Check email greeting shows "Hi Valued Patient," | ☐ | | |
| 5 | Check email signature shows "Your Provider" | ☐ | | |
| 6 | Verify no SMS sent (empty phone treated as null) | ☐ | | |

**Overall Result:** ☐ Pass  ☐ Fail

---

## Observability Checks

After each test, verify results in these 4 places:

| Check | Location | What to Verify | Status |
|-------|----------|----------------|--------|
| 1. HTTP Response | Terminal | success=true, trace_id, touches_sent, execution_time_ms | ☐ |
| 2. n8n Execution | n8n UI → Executions | Status = Success, all nodes executed | ☐ |
| 3. SendGrid Activity | SendGrid Dashboard | Email status = Delivered | ☐ |
| 4. Twilio Logs | Twilio Console | SMS status = Delivered | ☐ |

---

## Final Summary

### Overall Results

| Category | Total Tests | Passed | Failed | Skipped | Pass Rate |
|----------|------------|--------|--------|---------|-----------|
| Happy Path | 5 | _____ | _____ | _____ | _____% |
| Invalid Input | 7 | _____ | _____ | _____ | _____% |
| Integration | 3 | _____ | _____ | _____ | _____% |
| Performance | 2 | _____ | _____ | _____ | _____% |
| Security | 1 | _____ | _____ | _____ | _____% |
| Edge Cases | 4 | _____ | _____ | _____ | _____% |
| **TOTAL** | **22** | _____ | _____ | _____ | _____% |

### Pass/Fail Criteria

**Pass Requirements:**
- All Happy Path tests must pass (5/5)
- At least 5 Invalid Input tests pass (5/7)
- All Integration tests pass (3/3)
- At least 1 Performance test passes (1/2)
- Security test passes (1/1)
- At least 2 Edge Case tests pass (2/4)

**Overall Status:** ☐ PASS (meets all criteria)  ☐ FAIL (needs rework)

---

## Issues Found

Document any failures or issues discovered during testing:

**Issue 1:**
- Test ID: __________
- Description: _________________________________________________________________
- Severity: ☐ Critical  ☐ High  ☐ Medium  ☐ Low
- Resolution: _________________________________________________________________

**Issue 2:**
- Test ID: __________
- Description: _________________________________________________________________
- Severity: ☐ Critical  ☐ High  ☐ Medium  ☐ Low
- Resolution: _________________________________________________________________

**Issue 3:**
- Test ID: __________
- Description: _________________________________________________________________
- Severity: ☐ Critical  ☐ High  ☐ Medium  ☐ Low
- Resolution: _________________________________________________________________

---

## Performance Notes

**Average Execution Time:** ________ ms

**Email Delivery Rate:** ________ % (delivered / sent)

**SMS Delivery Rate:** ________ % (delivered / sent)

**Notes:**
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________

---

## Security Notes

**PHI Masking:** ☐ Verified - No patient data in inappropriate logs  ☐ Issue found

**Notes:**
___________________________________________________________________________
___________________________________________________________________________

---

## Next Steps

After completing all tests:

- [ ] Review all failures and document resolutions
- [ ] Verify all critical (P0) tests pass
- [ ] Calculate overall pass rate (should be ≥90%)
- [ ] Document any configuration changes made
- [ ] Update TestPlan.md or Troubleshooting.md with new learnings
- [ ] If all tests pass, proceed to multi-day sequence testing (optional)
- [ ] Sign off below

---

## Sign-Off

**I certify that I have completed the testing checklist above and the results are accurate.**

**Tester Name:** ___________________________________

**Tester Signature:** ___________________________________

**Date:** ___________________________________

**Overall Assessment:** ☐ Ready for Production  ☐ Needs Additional Work

**Approval (Manager/Lead):**

**Name:** ___________________________________

**Signature:** ___________________________________

**Date:** ___________________________________

---

## Appendix: Quick Test Data Reference

### Minimal Valid Request

```json
{
  "patient_id": "test_001",
  "patient_email": "test@example.com",
  "visit_type": "Test Visit"
}
```

### Complete Valid Request

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

### cURL Template

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "REPLACE",
    "patient_email": "REPLACE@example.com",
    "visit_type": "REPLACE"
  }'
```

---

**End of Checklist**

For detailed test procedures, see [TestPlan.md](TestPlan.md).

For test case specifications, see [TestCases.md](TestCases.md).
