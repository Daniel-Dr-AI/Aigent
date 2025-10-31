# Module 03: Telehealth Session - Testing Checklist

**Module:** 03 - Telehealth Session
**Version:** 1.1.0-enhanced
**Use this checklist to:** Track your testing progress and ensure nothing is missed
**PHI Level:** HIGH - Handle with extra care

---

## How to Use This Checklist

1. **Print or save a copy** for your testing session
2. **Check off each item** as you complete it
3. **Note any failures** in the "Result" column
4. **Calculate pass rate** at the end
5. **Use for bug reports** to show what you tested

**CRITICAL:** Verify PHI masking BEFORE running other tests!

---

## Pre-Testing Setup

- [ ] Module 03 workflow is active (green toggle ON)
- [ ] Module 02 successfully calls Module 03 (integration verified)
- [ ] Webhook URL correct and accessible
- [ ] Environment variables verified (see EnvMatrix.md)
- [ ] Zoom/Doxy OAuth credential connected in n8n
- [ ] Twilio account funded, "From" number verified
- [ ] SendGrid API key valid and tested
- [ ] HubSpot credential connected
- [ ] Google Sheet exists with correct tab name
- [ ] Google Sheets credential connected in n8n
- [ ] Mock data ready (MockIdentities.json opened)
- [ ] Provider consoles open (Twilio, SendGrid, HubSpot)
- [ ] Test log notebook/file created (optional but recommended)

---

## CRITICAL: PHI Masking Verification (MUST PASS FIRST!)

**Test this before any other testing. If this fails, STOP immediately.**

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-SEC-001 | PHI Masking in Google Sheets | [ ] | ⬜ Pass ⬜ Fail | Email masked: ______ Phone masked: ______ Name masked: ______ |
| TC-SEC-002 | Provider Email Subject Masked | [ ] | ⬜ Pass ⬜ Fail | Subject shows J*** D***: ______ |
| TC-SEC-003 | Patient SMS/Email NOT Masked | [ ] | ⬜ Pass ⬜ Fail | Patient receives full info: ______ |

**Security Tests Passed:** ___ / 3
**Pass Rate:** ____%

**IF ANY SECURITY TEST FAILS, STOP TESTING IMMEDIATELY:**
1. Report as critical security incident
2. Delete any exposed PHI
3. Fix Node 305 (PHI Masking for Logs)
4. Do NOT continue until masking verified working

---

## Happy Path Tests (5 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-HP-001 | Create Session with Complete Data | [ ] | ⬜ Pass ⬜ Fail | Session ID: _________ |
| TC-HP-002 | Create Session with Minimal Data | [ ] | ⬜ Pass ⬜ Fail | Session ID: _________ |
| TC-HP-003 | Session Link Works for Patient | [ ] | ⬜ Pass ⬜ Fail | Waiting room shown: ______ |
| TC-HP-004 | Host Link Works for Provider | [ ] | ⬜ Pass ⬜ Fail | Host controls available: ______ |
| TC-HP-005 | Session Expiration Calculated | [ ] | ⬜ Pass ⬜ Fail | Expires: _________ (scheduled + 1 day) |

**Happy Path Tests Passed:** ___ / 5
**Pass Rate:** ____%

---

## Invalid Input Tests (6 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-INV-001 | Missing Patient Email | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-002 | Invalid Email Format | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-003 | Missing Patient Phone | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-004 | Invalid scheduled_time Format | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-005 | Duration Out of Range | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-006 | Missing Patient Name | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |

**Invalid Input Tests Passed:** ___ / 6
**Pass Rate:** ____%

---

## Integration Tests (6 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-INT-001 | Zoom/Doxy Session Created | [ ] | ⬜ Pass ⬜ Fail | Platform meeting ID: _________ |
| TC-INT-002 | SMS Delivered to Patient | [ ] | ⬜ Pass ⬜ Fail | Twilio SID: _________ Status: _________ |
| TC-INT-003 | Patient Email Delivered | [ ] | ⬜ Pass ⬜ Fail | SendGrid message ID: _________ |
| TC-INT-004 | Provider Email Delivered | [ ] | ⬜ Pass ⬜ Fail | SendGrid message ID: _________ |
| TC-INT-005 | HubSpot CRM Updated | [ ] | ⬜ Pass ⬜ Fail | telehealth_status: _________ |
| TC-INT-006 | Google Sheets Logged | [ ] | ⬜ Pass ⬜ Fail | Row appears with masked PHI: ______ |

**Integration Tests Passed:** ___ / 6
**Pass Rate:** ____%

---

## Graceful Degradation Tests (5 Tests)

**Test that session succeeds even when non-critical operations fail:**

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-GRACE-001 | Session Succeeds with CRM Down | [ ] | ⬜ Pass ⬜ Fail | Session created: ______ crm_updated: false |
| TC-GRACE-002 | Session Succeeds with SMS Failure | [ ] | ⬜ Pass ⬜ Fail | Session created: ______ sms_sent: false |
| TC-GRACE-003 | Session Succeeds with Email Failure | [ ] | ⬜ Pass ⬜ Fail | Session created: ______ email_sent: false |
| TC-GRACE-004 | Session Succeeds with Logging Failure | [ ] | ⬜ Pass ⬜ Fail | Session created: ______ logged: false |
| TC-GRACE-005 | Metadata Shows Delivery Status | [ ] | ⬜ Pass ⬜ Fail | All flags accurate: ______ |

**Graceful Degradation Tests Passed:** ___ / 5
**Pass Rate:** ____%

---

## Performance Test (1 Test)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-PERF-001 | Execution Time Benchmark | [ ] | ⬜ Pass ⬜ Fail | Avg time: _____ms |

**Target:** < 2200ms average

**Execution times recorded:**
1. _____ms
2. _____ms
3. _____ms
4. _____ms
5. _____ms
6. _____ms
7. _____ms
8. _____ms
9. _____ms
10. _____ms

**Average:** _____ms
**Min:** _____ms
**Max:** _____ms

**Node-level breakdown (from slowest test):**
- Node 307 (Create Telehealth Session): _____ms
- Node 309 (Update CRM): _____ms
- Node 310 (Send Patient SMS): _____ms
- Node 311 (Send Patient Email): _____ms
- Node 312 (Send Provider Email): _____ms
- Node 313 (Log Session): _____ms

**Performance category:**
- [ ] Fast (<2000ms)
- [ ] Normal (2000-3000ms)
- [ ] Slow (3000-5000ms)
- [ ] Very Slow (>5000ms) — needs investigation

---

## Edge Case Tests (4 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-EDGE-001 | International Phone Number | [ ] | ⬜ Pass ⬜ Fail | Country code preserved: ______ |
| TC-EDGE-002 | Special Characters in Name | [ ] | ⬜ Pass ⬜ Fail | Chars preserved: ______ |
| TC-EDGE-003 | Email with Plus Addressing | [ ] | ⬜ Pass ⬜ Fail | + symbol preserved: ______ |
| TC-EDGE-004 | Very Long Session Duration | [ ] | ⬜ Pass ⬜ Fail | 240 min accepted: ______ |

**Edge Case Tests Passed:** ___ / 4
**Pass Rate:** ____%

---

## Security Tests (Beyond PHI Masking)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-SEC-004 | Waiting Room Enabled | [ ] | ⬜ Pass ⬜ Fail | Can't join without host: ______ |
| TC-SEC-005 | Password Required | [ ] | ⬜ Pass ⬜ Fail | Prompts for password: ______ |
| TC-SEC-006 | Enhanced Encryption ON | [ ] | ⬜ Pass ⬜ Fail | In platform settings: ______ |
| TC-SEC-007 | Join Before Host Disabled | [ ] | ⬜ Pass ⬜ Fail | Can't join early: ______ |

**Security Tests Passed:** ___ / 4 (+ 3 from PHI masking = 7 total)
**Pass Rate:** ____%

---

## Observability Checks

After running all tests, verify observability is working:

**HTTP Responses:**
- [ ] All success responses include `success: true`
- [ ] All success responses include `session_id`
- [ ] All success responses include `session_link` and `host_link`
- [ ] All success responses include `metadata.execution_time_ms`
- [ ] All success responses include delivery status flags
- [ ] All error responses include specific `details` array

**n8n Execution Logs:**
- [ ] All test executions visible in list
- [ ] Green checkmarks for successful tests
- [ ] Red X for validation errors (expected for invalid input tests)
- [ ] Orange for graceful degradation tests (expected)
- [ ] Execution times match HTTP responses
- [ ] No unexpected errors in logs

**SMS Delivery (Twilio):**
- [ ] All valid sessions triggered SMS
- [ ] Twilio console shows status = "delivered" or "sent"
- [ ] Patient phone number correct in Twilio logs
- [ ] Message includes session link and password
- [ ] No delivery errors for valid phone numbers

**Email Delivery (SendGrid):**
- [ ] All valid sessions triggered patient email
- [ ] All valid sessions triggered provider email
- [ ] SendGrid activity shows status = "delivered"
- [ ] Patient email includes big "Join" button
- [ ] Provider email subject uses MASKED name (J*** D***)
- [ ] Provider email body shows FULL patient details

**CRM Updates (HubSpot):**
- [ ] All valid sessions updated HubSpot (or logged failure if graceful degradation test)
- [ ] Contact records show telehealth_status = "SCHEDULED"
- [ ] telehealth_link field populated with correct URL
- [ ] telehealth_expires_at = scheduled_time + 1 day
- [ ] No "undefined" in any fields

**Google Sheets Audit Log:**
- [ ] All valid sessions appear as rows
- [ ] Patient name MASKED (J*** D***)
- [ ] Patient email MASKED (j***e@example.com)
- [ ] Patient phone MASKED (+1-555-***-4567)
- [ ] Session link present and clickable
- [ ] Expires_at calculated correctly
- [ ] Delivery status flags accurate

---

## Final Summary

**Test Date:** ___________________
**Tester Name:** ___________________
**Environment:** [ ] Development [ ] Staging [ ] Production
**Workflow Version:** ___________________

### Overall Results

| Category | Total Tests | Passed | Failed | Skipped | Pass Rate |
|----------|------------|--------|--------|---------|-----------|
| PHI Masking (Critical) | 3 | ___ | ___ | ___ | ___% |
| Happy Path | 5 | ___ | ___ | ___ | ___% |
| Invalid Input | 6 | ___ | ___ | ___ | ___% |
| Integration | 6 | ___ | ___ | ___ | ___% |
| Graceful Degradation | 5 | ___ | ___ | ___ | ___% |
| Performance | 1 | ___ | ___ | ___ | ___% |
| Edge Cases | 4 | ___ | ___ | ___ | ___% |
| Security | 7 | ___ | ___ | ___ | ___% |
| **TOTAL** | **37** | ___ | ___ | ___ | ___% |

### Pass/Fail Criteria

- **✅ PASS:** ≥95% pass rate, all critical tests passed, PHI masking 100%
- **⚠️ CONDITIONAL PASS:** 90-94% pass rate, no critical failures
- **❌ FAIL:** <90% pass rate OR any critical test failed OR PHI masking failed

**Critical tests (MUST pass):**
- TC-SEC-001 (PHI masking in Google Sheets)
- TC-SEC-002 (Provider email subject masked)
- TC-HP-001 (basic session creation)
- TC-INT-001 (platform session created)

### Overall Status

**Module 03 testing status:** [ ] PASS [ ] CONDITIONAL PASS [ ] FAIL

---

## Issues Found

**List any bugs or issues discovered during testing:**

1. ___________________________________________________________________
2. ___________________________________________________________________
3. ___________________________________________________________________
4. ___________________________________________________________________
5. ___________________________________________________________________

**For each issue, create a bug report using `/00_Shared/BugReport_Template.md`**

---

## Performance Notes

**Average execution time:** _____ms

**Performance breakdown:**
- Validation and preparation: _____ms (Nodes 301-306)
- Session creation: _____ms (Node 307)
- Parallel operations: _____ms (Nodes 309-313)
- Response formatting: _____ms (Nodes 314-316)

**Slowest node:** _____________________ (____ms)

**Performance category:**
- [ ] Fast (<2000ms)
- [ ] Normal (2000-3000ms)
- [ ] Slow (3000-5000ms)
- [ ] Very Slow (>5000ms) — needs investigation

**Performance recommendations:**
___________________________________________________________________
___________________________________________________________________

**Bottlenecks identified:**
___________________________________________________________________
___________________________________________________________________

---

## Security Notes

**PHI masking status:**
- [ ] Email masking works correctly in all logs
- [ ] Phone masking works correctly in all logs
- [ ] Name masking works correctly in all logs
- [ ] Provider email subjects use masked names
- [ ] Patient communications use FULL PHI (correct)

**Session security settings:**
- [ ] Waiting room enabled by default
- [ ] Password required by default
- [ ] Enhanced encryption enabled
- [ ] Join before host disabled
- [ ] Auto-admit disabled

**Security violations found:** ___ (should be 0!)

**Security recommendations:**
___________________________________________________________________
___________________________________________________________________

---

## Delivery Status Summary

**Based on metadata from successful tests:**

| Notification Type | Sent | Failed | Success Rate |
|-------------------|------|--------|--------------|
| SMS (Twilio) | ___ | ___ | ___% |
| Patient Email (SendGrid) | ___ | ___ | ___% |
| Provider Email (SendGrid) | ___ | ___ | ___% |
| CRM Update (HubSpot) | ___ | ___ | ___% |
| Sheets Logging | ___ | ___ | ___% |

**Target:** >95% for each channel

**Delivery issues identified:**
___________________________________________________________________
___________________________________________________________________

---

## Platform-Specific Notes

**Video Platform:** [ ] Zoom [ ] Doxy.me [ ] Amwell

**Platform-specific observations:**
___________________________________________________________________
___________________________________________________________________

**Platform API issues:**
___________________________________________________________________
___________________________________________________________________

**Platform-specific recommendations:**
___________________________________________________________________
___________________________________________________________________

---

## Next Steps

**After completing this checklist:**

- [ ] Review all failed tests
- [ ] Create bug reports for any issues (use `/00_Shared/BugReport_Template.md`)
- [ ] Calculate final pass rate
- [ ] Update test results in tracking system
- [ ] Review KeyPoints.md for important reminders
- [ ] Share results with team
- [ ] Schedule retest for any failures (date: __________)
- [ ] If pass rate ≥95%, move to Module 04 testing
- [ ] Document any workflow improvements needed
- [ ] Update environment variables if needed

**If security tests failed:**
- [ ] STOP all testing immediately
- [ ] Report security incident to team lead
- [ ] Document what PHI was exposed and where
- [ ] Delete exposed PHI from all systems
- [ ] Fix PHI masking logic (Node 305)
- [ ] Re-run security tests only
- [ ] Do NOT proceed until 100% pass rate on security

---

## Sign-Off

**Tested by:** _____________________
**Signature:** _____________________
**Date:** _____________________

**Reviewed by:** _____________________
**Signature:** _____________________
**Date:** _____________________

**Approved for production:** [ ] Yes [ ] No [ ] Conditional

**Conditions (if applicable):**
___________________________________________________________________
___________________________________________________________________

**Production deployment date:** _____________________

**Production monitoring configured:** [ ] Yes [ ] No

**Alerts configured for:**
- [ ] Session creation failures
- [ ] PHI masking failures
- [ ] API errors (Zoom/Doxy)
- [ ] Delivery failures (SMS/Email)
- [ ] Performance degradation (>5000ms)

---

## Appendix: Quick Test Data Reference

**Valid Test Data:**
- Alice Anderson: `alice.anderson.test@example.com`, `+15551234001`
- Bob Builder: `bob.builder.test@example.com`, `+15551234002`
- Charlie Chen: `charlie.chen.test@example.com`, `+8613800138000`

**Scheduled Times (ISO 8601):**
- Valid: `2025-11-05T14:00:00.000Z`
- Valid with timezone: `2025-11-05T14:00:00-05:00`
- Invalid: `2025-11-05 14:00:00` (missing T)

**Invalid Test Data:**
- Missing email: (no email field in JSON)
- Bad email: `not-an-email` or `test@` or `@example.com`
- Invalid time: `2025-13-01T14:00:00.000Z` (month 13)
- Duration too short: `2` (< 5)
- Duration too long: `300` (> 240)

**Edge Case Data:**
- International phone: `+8613800138000` (China)
- Plus email: `test.user+tag123@example.com`
- Special chars: `François O'Reilly-Müller`
- Long duration: `240` (4 hours)

**Module 03 Webhook URL:** ___________________________________

**Zoom/Doxy Test Account:** ___________________________________

**Twilio Test Number:** ___________________________________

---

## Post-Production Monitoring Checklist

**After deploying to production, monitor these for 7 days:**

- [ ] Daily success rate (target: >99%)
- [ ] Average execution time (target: <2200ms)
- [ ] SMS delivery rate (target: >95%)
- [ ] Email delivery rate (target: >95%)
- [ ] CRM sync rate (target: >90%)
- [ ] PHI masking accuracy (target: 100%)
- [ ] No security incidents
- [ ] No patient complaints about missing links
- [ ] No provider complaints about access issues

**Production issues log:**
___________________________________________________________________
___________________________________________________________________

---

**Print this checklist and keep it handy during your testing session!** 📋✅
