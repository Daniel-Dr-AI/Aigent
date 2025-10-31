# Module 01: Intake & Lead Capture - Testing Checklist

**Module:** 01 - Intake & Lead Capture
**Version:** 1.1.0-enhanced
**Use this checklist to:** Track your testing progress and ensure nothing is missed

---

## How to Use This Checklist

1. **Print or save a copy** for your testing session
2. **Check off each item** as you complete it
3. **Note any failures** in the "Result" column
4. **Calculate pass rate** at the end
5. **Use for bug reports** to show what you tested

---

## Pre-Testing Setup

- [ ] n8n workflow is active (green toggle ON)
- [ ] Webhook URL copied and ready
- [ ] Environment variables verified (see EnvMatrix.md)
- [ ] Google Sheet exists with correct tab name
- [ ] Google Sheets credential connected in n8n
- [ ] Slack/Teams webhook URL tested
- [ ] Mock data ready (MockIdentities.json opened)
- [ ] Terminal/command prompt ready
- [ ] Test log notebook/file created (optional but recommended)

---

## Happy Path Tests (3 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-HP-001 | Submit Valid Lead (Complete Data) | [ ] | ⬜ Pass ⬜ Fail | Lead ID: _________ |
| TC-HP-002 | Submit Valid Lead (Minimal Data) | [ ] | ⬜ Pass ⬜ Fail | Lead ID: _________ |
| TC-HP-003a | Phone Normalization (Spaces) | [ ] | ⬜ Pass ⬜ Fail | Normalized: _________ |
| TC-HP-003b | Phone Normalization (Dashes) | [ ] | ⬜ Pass ⬜ Fail | Normalized: _________ |
| TC-HP-003c | Phone Normalization (Parentheses) | [ ] | ⬜ Pass ⬜ Fail | Normalized: _________ |
| TC-HP-003d | Phone Normalization (Dots) | [ ] | ⬜ Pass ⬜ Fail | Normalized: _________ |
| TC-HP-003e | Phone Normalization (Already E.164) | [ ] | ⬜ Pass ⬜ Fail | Normalized: _________ |

**Happy Path Tests Passed:** ___ / 7
**Pass Rate:** ____%

---

## Invalid Input Tests (5 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-INV-001 | Missing Email | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-002a | Invalid Email (No @ symbol) | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-002b | Invalid Email (Missing domain) | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-002c | Invalid Email (Not an email) | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-003 | Missing Phone | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-004 | Phone Too Short | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-005 | Missing Name | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |

**Invalid Input Tests Passed:** ___ / 7
**Pass Rate:** ____%

---

## Edge Case Tests (4 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-EDGE-001 | Very Long Name | [ ] | ⬜ Pass ⬜ Fail | Full name preserved? _________ |
| TC-EDGE-002 | Special Characters in Name | [ ] | ⬜ Pass ⬜ Fail | Chars preserved? _________ |
| TC-EDGE-003 | Email with Plus Addressing | [ ] | ⬜ Pass ⬜ Fail | + symbol preserved? _________ |
| TC-EDGE-004 | International Phone Number | [ ] | ⬜ Pass ⬜ Fail | Country code preserved? _________ |

**Edge Case Tests Passed:** ___ / 4
**Pass Rate:** ____%

---

## Integration Tests (3 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-INT-001 | Google Sheets Data Persistence | [ ] | ⬜ Pass ⬜ Fail | Row count matches? _________ |
| TC-INT-002 | Slack/Teams Notification Delivery | [ ] | ⬜ Pass ⬜ Fail | Notifications received? ___/3 |
| TC-INT-003 | HubSpot CRM Sync (Optional) | [ ] ⬜ Skip | ⬜ Pass ⬜ Fail | Contact created? _________ |

**Integration Tests Passed:** ___ / 3 (or 2 if HubSpot skipped)
**Pass Rate:** ____%

---

## Performance Test (1 Test)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-PERF-001 | Execution Time Benchmark | [ ] | ⬜ Pass ⬜ Fail | Avg time: _____ms |

**Target:** < 5000ms average

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

---

## Security Test (1 Test)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-SEC-001 | PHI Masking in Notifications | [ ] | ⬜ Pass ⬜ Fail | Email masked? ______ Phone masked? ______ |

**CRITICAL:** If this test fails, STOP testing and report immediately!

---

## Observability Checks

After running all tests, verify observability is working:

**HTTP Responses:**
- [ ] All success responses include `status: "success"`
- [ ] All success responses include `lead_id`
- [ ] All success responses include `execution_time_ms`
- [ ] All error responses include specific `errors` array

**Google Sheets:**
- [ ] All valid leads appear as rows
- [ ] No invalid leads appear
- [ ] Phone numbers normalized to E.164
- [ ] Lead scores calculated (0-100)
- [ ] Timestamps accurate

**Slack/Teams Notifications:**
- [ ] All valid leads trigger notifications
- [ ] Email addresses masked (a***n@example.com)
- [ ] Phone numbers masked (***-***-4001)
- [ ] Notifications arrive within 5 seconds

**n8n Execution Logs:**
- [ ] All test executions visible in list
- [ ] Green checkmarks for successful tests
- [ ] Red X for intentionally failed tests (invalid input)
- [ ] Execution times match HTTP responses
- [ ] No unexpected errors in logs

---

## Final Summary

**Test Date:** ___________________
**Tester Name:** ___________________
**Environment:** [ ] Development [ ] Staging [ ] Production
**Workflow Version:** ___________________

### Overall Results

| Category | Total Tests | Passed | Failed | Skipped | Pass Rate |
|----------|------------|--------|--------|---------|-----------|
| Happy Path | 7 | ___ | ___ | ___ | ___% |
| Invalid Input | 7 | ___ | ___ | ___ | ___% |
| Edge Cases | 4 | ___ | ___ | ___ | ___% |
| Integration | 3 | ___ | ___ | ___ | ___% |
| Performance | 1 | ___ | ___ | ___ | ___% |
| Security | 1 | ___ | ___ | ___ | ___% |
| **TOTAL** | **23** | ___ | ___ | ___ | ___% |

### Pass/Fail Criteria

- **✅ PASS:** ≥95% pass rate, all critical tests passed
- **⚠️ CONDITIONAL PASS:** 90-94% pass rate, no critical failures
- **❌ FAIL:** <90% pass rate OR any critical test failed

**Critical tests:**
- TC-HP-001 (basic functionality)
- TC-INT-001 (data persistence)
- TC-SEC-001 (PHI masking)

### Overall Status

**Module 01 testing status:** [ ] PASS [ ] CONDITIONAL PASS [ ] FAIL

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

**Slowest node:** _____________________ (____ms)

**Performance category:**
- [ ] Fast (<2000ms)
- [ ] Normal (2000-5000ms)
- [ ] Slow (5000-10000ms)
- [ ] Very Slow (>10000ms) — needs investigation

**Performance recommendations:**
___________________________________________________________________
___________________________________________________________________

---

## Security Notes

**PHI masking status:**
- [ ] Email masking works correctly
- [ ] Phone masking works correctly
- [ ] IP masking works correctly (if enabled)

**Security recommendations:**
___________________________________________________________________
___________________________________________________________________

---

## Next Steps

**After completing this checklist:**

- [ ] Review all failed tests
- [ ] Create bug reports for any issues
- [ ] Calculate final pass rate
- [ ] Update test results in tracking system
- [ ] Review KeyPoints.md for important reminders
- [ ] Share results with team
- [ ] Schedule retest for any failures (date: __________)
- [ ] Move to Module 02 testing (if pass rate ≥95%)

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

---

## Appendix: Quick Test Data Reference

**Valid Test Data:**
- Alice Anderson: `alice.anderson.test@example.com`, `+15551234001`
- Bob Builder: `bob.builder.test@example.com`, `+15551234002`

**Invalid Test Data:**
- Missing email: (no email field)
- Bad email: `not-an-email`
- Short phone: `123`

**Edge Case Data:**
- Long name: Maximiliana-Alexandrina-Christophina-Josephina...
- Special chars: François O'Reilly-Müller
- Plus email: `test.user+tag123@example.com`
- International: `+81312345678`

**Webhook URL:** ___________________________________

---

**Print this checklist and keep it handy during your testing session!** 📋✅
