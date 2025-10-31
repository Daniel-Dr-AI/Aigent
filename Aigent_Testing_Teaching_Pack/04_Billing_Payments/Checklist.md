# Module 04: Billing & Payments - Testing Checklist

**Module:** 04 - Billing & Payments
**Version:** 1.1.0-enhanced
**Use this checklist to:** Track your testing progress and ensure nothing is missed

---

## How to Use This Checklist

1. **Print or save a copy** for your testing session
2. **Check off each item** as you complete it
3. **Note any failures** in the "Result" column
4. **Calculate pass rate** at the end
5. **Use for bug reports** to show what you tested

**CRITICAL:** Before starting ANY test, verify you're in TEST mode (not LIVE mode)!

---

## Pre-Testing Setup

### Workflow Verification
- [ ] n8n workflow is active (green toggle ON)
- [ ] Webhook URL copied and ready
- [ ] Environment variables verified (see EnvMatrix.md)

### Payment Gateway Setup
- [ ] Stripe/Square account accessible
- [ ] **TEST MODE verified** (Stripe: "TEST MODE" badge visible)
- [ ] API key is TEST key (Stripe: starts with `sk_test_`)
- [ ] Test credit cards ready (4242 4242 4242 4242 for Stripe)
- [ ] Dashboard open in separate tab for verification

### Email Service Setup
- [ ] SendGrid API key configured
- [ ] Sender email verified in SendGrid
- [ ] SendGrid Activity feed accessible
- [ ] Test email inboxes accessible

### Data Storage Setup
- [ ] Google Sheet exists
- [ ] Correct tab name ("Payments" or as configured)
- [ ] Google Sheets credential connected in n8n
- [ ] Sheet has write permissions

### Testing Tools Ready
- [ ] Terminal/command prompt open
- [ ] Mock data ready (test email addresses prepared)
- [ ] Test log notebook/file created (optional but recommended)
- [ ] Browser tabs: n8n, Stripe/Square, SendGrid, Google Sheets

---

## Happy Path Tests (4 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-HP-001 | Create Invoice Link (Standard) | [ ] | ⬜ Pass ⬜ Fail | Invoice ID: _________ |
| TC-HP-002 | Charge Payment Immediately | [ ] | ⬜ Pass ⬜ Fail | Charge ID: _________ |
| TC-HP-003 | Multi-Currency Payment (CAD) | [ ] | ⬜ Pass ⬜ Fail | Currency: _________ |
| TC-HP-004 | Partial Payment Processing | [ ] | ⬜ Pass ⬜ Fail | Min amount: _________ |

**Happy Path Tests Passed:** ___ / 4
**Pass Rate:** ____%

**Verification for Each Happy Path Test:**
- [ ] HTTP 200 response received
- [ ] Invoice/charge created in Stripe/Square dashboard
- [ ] Email sent (verified in SendGrid activity)
- [ ] Google Sheets row added
- [ ] PHI masked in sheets (email shows a***n@example.com)
- [ ] Execution time reasonable (< 8 seconds)

---

## Invalid Input Tests (6 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-INV-001 | Missing Required Field (Email) | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-002 | Invalid Email Format | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-003 | Amount Below Minimum ($0.50) | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-004 | Amount Above Maximum ($999,999) | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-005 | Invalid Currency Code (XYZ) | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |
| TC-INV-006 | Missing Invoice Reference | [ ] | ⬜ Pass ⬜ Fail | Error message: _________ |

**Invalid Input Tests Passed:** ___ / 6
**Pass Rate:** ____%

**Verification for Each Invalid Input Test:**
- [ ] Request rejected with error status
- [ ] Error message is clear and helpful
- [ ] NO invoice created in payment gateway
- [ ] NO email sent
- [ ] NO row added to Google Sheets
- [ ] Validation fails quickly (< 1 second)

---

## Edge Case Tests (3 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-EDGE-001 | Disposable Email Blocked | [ ] | ⬜ Pass ⬜ Fail | Domain blocked: _________ |
| TC-EDGE-002 | Duplicate Invoice Reference | [ ] | ⬜ Pass ⬜ Fail | Idempotency working? _____ |
| TC-EDGE-003 | High-Value Transaction Flag | [ ] | ⬜ Pass ⬜ Fail | Review flag set? _____ |

**Edge Case Tests Passed:** ___ / 3
**Pass Rate:** ____%

**Verification for Edge Cases:**

**TC-EDGE-001 (Disposable Email):**
- [ ] Request blocked by fraud detection
- [ ] Error mentions "disposable email domain"
- [ ] Risk score ≥ 50 (CRITICAL)
- [ ] No invoice created

**TC-EDGE-002 (Duplicate Invoice):**
- [ ] First request succeeds (invoice created)
- [ ] Second request returns duplicate message
- [ ] Only ONE invoice in payment gateway (not two)
- [ ] Patient NOT charged twice

**TC-EDGE-003 (High-Value):**
- [ ] Invoice created successfully
- [ ] Response includes review_required: true
- [ ] Risk level: MEDIUM
- [ ] Invoice appears with review flag (if applicable)

---

## Integration Tests (3 Tests)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-INT-001 | Stripe Gateway End-to-End | [ ] | ⬜ Pass ⬜ Fail | Customer ID: _________ |
| TC-INT-002 | Email Delivery (SendGrid) | [ ] | ⬜ Pass ⬜ Fail | Delivery time: _____s |
| TC-INT-003 | Google Sheets Logging | [ ] | ⬜ Pass ⬜ Fail | Row number: _________ |

**Integration Tests Passed:** ___ / 3
**Pass Rate:** ____%

**Verification for Integration Tests:**

**TC-INT-001 (Stripe/Square):**
- [ ] Customer created or found in dashboard
- [ ] Invoice created with correct amount
- [ ] Invoice status: Open (or appropriate status)
- [ ] Description matches service_description
- [ ] Payment link accessible and functional
- [ ] All API calls succeeded (check n8n log)

**TC-INT-002 (Email):**
- [ ] Email shows "Delivered" in SendGrid within 2 minutes
- [ ] Email received in test inbox
- [ ] Subject line appropriate
- [ ] Payment link present and clickable
- [ ] Amount displayed correctly
- [ ] No broken images or formatting issues

**TC-INT-003 (Google Sheets):**
- [ ] Row added within 5 seconds
- [ ] All columns populated (no blanks)
- [ ] Email is MASKED (s***h@example.com)
- [ ] Amount has 2 decimal places
- [ ] Timestamp accurate
- [ ] Trace ID follows format: PAY-[timestamp]

---

## Performance Test (1 Test)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-PERF-001 | Response Time Under Load | [ ] | ⬜ Pass ⬜ Fail | Avg time: _____ms |

**Target:** < 8000ms average, < 12000ms maximum

**Execution times recorded (5 concurrent requests):**
1. _____ms
2. _____ms
3. _____ms
4. _____ms
5. _____ms

**Average:** _____ms
**Min:** _____ms
**Max:** _____ms

**Pass Criteria:**
- [ ] All 5 requests returned HTTP 200
- [ ] Average response time ≤ 8000ms
- [ ] Maximum response time ≤ 12000ms
- [ ] All 5 invoices created successfully
- [ ] No timeout errors
- [ ] n8n remained stable (no crashes)

---

## Security Test (1 Test)

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-SEC-001 | PCI-DSS Compliance - PHI Masking | [ ] | ⬜ Pass ⬜ Fail | Masking verified: _____ |

**CRITICAL:** If this test fails, STOP all testing and report immediately!

**PHI Masking Verification Checklist:**

**n8n Execution Log:**
- [ ] Email masked (s***y@example.com)
- [ ] Name masked (S*** T***)
- [ ] NO credit card numbers visible anywhere
- [ ] NO full customer names in any logs

**Google Sheets:**
- [ ] Email masked (s***y@example.com)
- [ ] Name masked (if logged)
- [ ] NO credit card data
- [ ] NO unmasked PHI

**Stripe/Square Dashboard:**
- [ ] FULL email visible (correct - they need real data)
- [ ] FULL name visible (correct - they need real data)
- [ ] Payment methods tokenized (pm_abc123, not actual card)

**Email Sent to Patient:**
- [ ] FULL email used (correct - they need to receive it)
- [ ] FULL name in email body (correct - personalization)
- [ ] Payment link functional

**Pass Criteria:**
- [ ] PHI masked in ALL logs and sheets
- [ ] PHI NOT masked where needed (Stripe, email delivery)
- [ ] Credit card data NEVER appears in n8n
- [ ] Stripe/Square handles all payment methods (PCI-compliant)

---

## Observability Checks

After running all tests, verify observability is working:

**HTTP Responses:**
- [ ] All success responses include `status: "success"`
- [ ] All success responses include `invoice_id` or `charge_id`
- [ ] All success responses include `trace_id`
- [ ] All success responses include `execution_time_ms`
- [ ] All error responses include specific `errors` array

**Stripe/Square Dashboard:**
- [ ] All valid invoices/charges appear
- [ ] No invalid requests created invoices
- [ ] Amounts match test data
- [ ] Customer records accurate
- [ ] Timestamps correct

**SendGrid Activity:**
- [ ] All expected emails show "Delivered" status
- [ ] Delivery times reasonable (< 2 minutes)
- [ ] No unexpected bounces or failures
- [ ] Email content rendered correctly

**Google Sheets:**
- [ ] All valid payments logged
- [ ] No invalid requests logged
- [ ] PHI consistently masked
- [ ] No duplicate rows (unless testing idempotency)
- [ ] All columns populated correctly

**n8n Execution Logs:**
- [ ] All test executions visible in list
- [ ] Green checkmarks for successful tests
- [ ] Red X for intentionally failed tests (validation errors)
- [ ] Execution times match HTTP responses
- [ ] No unexpected errors in logs
- [ ] PHI masked in all log outputs

---

## Final Summary

**Test Date:** ___________________
**Tester Name:** ___________________
**Environment:** [ ] Development [ ] Staging [ ] Production
**Payment Gateway:** [ ] Stripe [ ] Square
**Gateway Mode:** [ ] TEST [ ] LIVE (should be TEST!)
**Workflow Version:** ___________________
**n8n Version:** ___________________

### Overall Results

| Category | Total Tests | Passed | Failed | Skipped | Pass Rate |
|----------|------------|--------|--------|---------|-----------|
| Happy Path | 4 | ___ | ___ | ___ | ___% |
| Invalid Input | 6 | ___ | ___ | ___ | ___% |
| Edge Cases | 3 | ___ | ___ | ___ | ___% |
| Integration | 3 | ___ | ___ | ___ | ___% |
| Performance | 1 | ___ | ___ | ___ | ___% |
| Security | 1 | ___ | ___ | ___ | ___% |
| **TOTAL** | **18** | ___ | ___ | ___ | ___% |

### Pass/Fail Criteria

- **✅ PASS:** ≥90% pass rate, all critical tests passed
- **⚠️ CONDITIONAL PASS:** 85-89% pass rate, no critical failures
- **❌ FAIL:** <85% pass rate OR any critical test failed

**Critical tests (MUST pass):**
- TC-HP-001 (Basic invoice creation)
- TC-HP-002 (Immediate charge processing)
- TC-INV-001 (Validation works)
- TC-EDGE-002 (Idempotency prevents duplicates)
- TC-INT-001 (Payment gateway integration)
- TC-SEC-001 (PHI masking and PCI compliance)

### Overall Status

**Module 04 testing status:** [ ] PASS [ ] CONDITIONAL PASS [ ] FAIL

**Reason (if CONDITIONAL or FAIL):**
___________________________________________________________________
___________________________________________________________________

---

## Issues Found

**List any bugs or issues discovered during testing:**

1. **Issue:** _______________________________________________________________
   **Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low
   **Test ID:** ___________
   **Status:** [ ] Open [ ] Fixed [ ] Deferred

2. **Issue:** _______________________________________________________________
   **Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low
   **Test ID:** ___________
   **Status:** [ ] Open [ ] Fixed [ ] Deferred

3. **Issue:** _______________________________________________________________
   **Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low
   **Test ID:** ___________
   **Status:** [ ] Open [ ] Fixed [ ] Deferred

4. **Issue:** _______________________________________________________________
   **Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low
   **Test ID:** ___________
   **Status:** [ ] Open [ ] Fixed [ ] Deferred

5. **Issue:** _______________________________________________________________
   **Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low
   **Test ID:** ___________
   **Status:** [ ] Open [ ] Fixed [ ] Deferred

**For each issue, create a bug report using `/00_Shared/BugReport_Template.md`**

---

## Performance Notes

**Average execution time:** _____ms

**Slowest node:** _____________________ (____ms)

**Performance category:**
- [ ] Fast (<4000ms) — Excellent
- [ ] Normal (4000-8000ms) — Acceptable
- [ ] Slow (8000-12000ms) — Needs monitoring
- [ ] Very Slow (>12000ms) — Needs investigation

**Performance bottlenecks identified:**
___________________________________________________________________
___________________________________________________________________

**Performance recommendations:**
___________________________________________________________________
___________________________________________________________________

---

## Security Notes

**PHI masking status:**
- [ ] Email masking works correctly in all logs
- [ ] Name masking works correctly in all logs
- [ ] NO credit card data found anywhere in n8n
- [ ] Full data only in PCI-compliant systems (Stripe/Square)

**PCI-DSS compliance status:**
- [ ] No credit card numbers stored in n8n
- [ ] No credit card numbers in execution logs
- [ ] Payment methods tokenized (pm_abc123 format)
- [ ] All payment data handled by Stripe/Square only

**Security issues found:**
___________________________________________________________________
___________________________________________________________________

**Security recommendations:**
___________________________________________________________________
___________________________________________________________________

**CRITICAL:** If any security test failed, this module is NOT production-ready!

---

## Next Steps

**After completing this checklist:**

### If PASS (≥90% pass rate, all critical tests passed)
- [ ] Review and address any non-critical failures
- [ ] Update documentation with any findings
- [ ] Schedule production deployment planning
- [ ] Share results with team
- [ ] Move to Module 05 testing (if applicable)

### If CONDITIONAL PASS (85-89% pass rate)
- [ ] Review all failures with team lead
- [ ] Create bug reports for all failures
- [ ] Fix critical issues
- [ ] Re-run failed tests
- [ ] Document workarounds for non-critical issues
- [ ] Schedule retest date: __________

### If FAIL (<85% pass rate OR critical test failed)
- [ ] STOP all deployment plans
- [ ] Create detailed bug reports for all failures
- [ ] Prioritize critical fixes
- [ ] Investigate root causes
- [ ] Fix issues in development
- [ ] Schedule full retest date: __________
- [ ] Do NOT proceed to production

**Additional actions:**
- [ ] Review KeyPoints.md for important reminders
- [ ] Review Troubleshooting.md for any unresolved issues
- [ ] Update test results in tracking system
- [ ] Share learnings with team (what worked, what didn't)

---

## Sign-Off

**Tested by:** _____________________
**Signature:** _____________________
**Date:** _____________________

**Reviewed by:** _____________________
**Signature:** _____________________
**Date:** _____________________

**Technical Lead Approval:** _____________________
**Signature:** _____________________
**Date:** _____________________

**Approved for production:** [ ] Yes [ ] No [ ] Conditional

**Conditions (if applicable):**
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

**Production deployment date:** ___________________

---

## Appendix: Quick Test Data Reference

### Valid Test Amounts
- **Minimum:** $1.00 (MIN_PAYMENT_AMOUNT)
- **Typical consultation:** $150.00
- **With cents:** $225.50
- **Higher service:** $500.00
- **High-value (triggers review):** $7,500.00
- **Maximum allowed:** $100,000.00

### Invalid Test Amounts
- **Below minimum:** $0.50 (should be rejected)
- **Above maximum:** $999,999.00 (should be rejected)

### Valid Currencies
- **USD** - US Dollar (default)
- **CAD** - Canadian Dollar
- **EUR** - Euro
- **GBP** - British Pound
- **AUD** - Australian Dollar

### Invalid Currencies
- **XYZ** - Not ISO 4217 standard
- **ABC** - Not supported

### Stripe Test Cards

| Card Number | Expiry | CVC | Behavior |
|-------------|--------|-----|----------|
| 4242 4242 4242 4242 | 12/28 | 123 | Success |
| 4000 0000 0000 0002 | 12/28 | 123 | Declined (generic) |
| 4000 0000 0000 9995 | 12/28 | 123 | Declined (insufficient funds) |

**Note:** Use ANY future expiry date (12/28, 01/30, etc.) and ANY 3-digit CVC

### Square Test Cards
See: https://developer.squareup.com/docs/testing/test-values

### Disposable Email Domains (Should be Blocked)
- tempmail.com
- guerrillamail.com
- 10minutemail.com
- mailinator.com
- trash-mail.com
- throwaway.email

### Valid Test Emails
- sarah.johnson.test@example.com
- michael.chen.test@example.com
- emma.martin.test@example.com
- test@example.com (generic)

### Test Invoice References (Use Unique for Each Test)
- INV-2025-001
- INV-2025-002
- INV-2025-003
- INV-TEST-001
- INV-DUPLICATE-TEST (for idempotency testing)

### Webhook URL
**Your webhook URL:** ___________________________________

**How to get it:**
1. Open n8n workflow
2. Click "Webhook: Billing Payment Request" node
3. Copy "Production URL"

---

**Print this checklist and keep it handy during your testing session!**
