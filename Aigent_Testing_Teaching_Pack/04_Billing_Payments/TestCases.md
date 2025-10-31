# Module 04: Billing & Payments - Test Cases

**Module:** 04 - Billing & Payments
**Version:** 1.1.0-enhanced
**Test Cases Version:** 1.0
**Last Updated:** 2025-10-31

---

## Purpose of This Document

This document lists **all individual test cases** for Module 04 in a structured, easy-to-reference format.

**Use this document to:**
- Quickly find a specific test
- Check expected inputs and outputs
- Track which tests you've completed
- Reference test data for bug reports

**Companion document:** See [TestPlan.md](TestPlan.md) for step-by-step instructions on HOW to run each test.

---

## Test Case Format

Each test case includes:
- **TC-ID:** Unique test case identifier
- **Name:** Short description
- **Category:** Happy Path, Invalid Input, Edge Case, Integration, Performance, Security
- **Priority:** P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Input:** Test data to send
- **Expected Output:** What should happen
- **Pass Criteria:** How to know the test passed

---

## Test Case Summary

| Category | Total | P0 | P1 | P2 | P3 |
|----------|-------|----|----|----|----|
| Happy Path | 4 | 3 | 1 | 0 | 0 |
| Invalid Input | 6 | 5 | 1 | 0 | 0 |
| Edge Case | 3 | 1 | 2 | 0 | 0 |
| Integration | 3 | 2 | 1 | 0 | 0 |
| Performance | 1 | 0 | 0 | 1 | 0 |
| Security | 1 | 1 | 0 | 0 | 0 |
| **TOTAL** | **18** | **12** | **5** | **1** | **0** |

---

## Happy Path Test Cases

---

### TC-HP-001: Create Invoice Link (Standard Workflow)

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 5 minutes

**Description:**
Submit a valid billing request to create an invoice and send payment link via email.

**Prerequisites:**
- Workflow is active
- Payment gateway (Stripe/Square) configured in TEST mode
- Email delivery configured (SendGrid)
- Google Sheets configured

**Test Data:**
```json
{
  "patient_email": "sarah.johnson.test@example.com",
  "patient_name": "Sarah Johnson",
  "patient_id": "PT-2025-001",
  "amount": "150.00",
  "currency": "USD",
  "service_description": "Initial consultation - 60 minutes",
  "invoice_reference": "INV-2025-001",
  "billing_mode": "invoice_link"
}
```

**Expected HTTP Response:**
```json
{
  "status": "success",
  "message": "Invoice created and sent successfully",
  "invoice_id": "in_1ABC...",
  "hosted_invoice_url": "https://invoice.stripe.com/...",
  "trace_id": "PAY-1234567890123",
  "execution_time_ms": 3000-6000
}
```

**Expected Payment Gateway Changes:**
- New customer created (if doesn't exist) for sarah.johnson.test@example.com
- Invoice created with ID starting with `in_` (Stripe) or `inv-` (Square)
- Invoice status: "Open" or "Unpaid"
- Invoice amount: $150.00 USD
- Description: "Initial consultation - 60 minutes"

**Expected Email:**
- Sent to: sarah.johnson.test@example.com
- Subject: Contains "Invoice" or "Payment"
- Body: Payment link button/URL
- Amount: $150.00

**Expected Google Sheets Entry:**
- Patient ID: PT-2025-001
- Email (masked): s***h@example.com
- Amount: 150.00
- Currency: USD
- Invoice Reference: INV-2025-001
- Status: invoice_sent or invoice_created
- Trace ID: PAY-[timestamp]
- Timestamp: Current date/time

**Pass Criteria:**
- [ ] HTTP 200 response received
- [ ] Response contains invoice_id and hosted_invoice_url
- [ ] Invoice appears in payment gateway dashboard
- [ ] Email sent successfully (verified in email service logs)
- [ ] Google Sheets row added with correct data
- [ ] Email address masked in sheets (PHI protection)
- [ ] n8n execution shows all green checkmarks
- [ ] Execution time under 8 seconds

**Failure Scenarios to Test:**
- None (this is happy path)

---

### TC-HP-002: Charge Payment Immediately

**Priority:** P0 (Critical)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 7 minutes

**Description:**
Process immediate payment charge when billing_mode is "charge_now".

**Prerequisites:**
- Same as TC-HP-001
- Payment method on file (or test payment method)

**Test Data:**
```json
{
  "patient_email": "michael.chen.test@example.com",
  "patient_name": "Michael Chen",
  "patient_id": "PT-2025-002",
  "amount": "225.50",
  "currency": "USD",
  "service_description": "Follow-up appointment + lab review",
  "invoice_reference": "INV-2025-003",
  "billing_mode": "charge_now",
  "payment_method_id": "pm_card_visa"
}
```

**Expected HTTP Response:**
```json
{
  "status": "success",
  "message": "Payment charged successfully",
  "charge_id": "ch_1ABC...",
  "amount_charged": "225.50",
  "currency": "USD",
  "receipt_url": "https://pay.stripe.com/receipts/...",
  "trace_id": "PAY-1234567890124",
  "execution_time_ms": 4000-8000
}
```

**Expected Payment Gateway Changes:**
- Payment charged: $225.50
- Payment status: "Succeeded" or "Paid"
- Receipt generated
- Customer charged immediately

**Expected Email:**
- Receipt email sent
- Amount: $225.50
- Receipt link included

**Expected Google Sheets Entry:**
- Status: paid
- Charge ID: ch_1ABC...
- Amount: 225.50
- Payment method: ending in 4242 (test card)

**Pass Criteria:**
- [ ] HTTP 200 response
- [ ] Payment status "Succeeded" in gateway
- [ ] Receipt email delivered
- [ ] Google Sheets shows "paid" status
- [ ] Charge ID recorded
- [ ] Execution time under 10 seconds

---

### TC-HP-003: Multi-Currency Payment (CAD)

**Priority:** P1 (High)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 5 minutes

**Description:**
Test processing payment in non-USD currency (Canadian dollars).

**Prerequisites:**
- Payment gateway supports CAD (check Stripe/Square settings)

**Test Data:**
```json
{
  "patient_email": "emma.martin.test@example.com",
  "patient_name": "Emma Martin",
  "patient_id": "PT-2025-004",
  "amount": "200.00",
  "currency": "CAD",
  "service_description": "Telehealth consultation",
  "invoice_reference": "INV-2025-005",
  "billing_mode": "invoice_link"
}
```

**Expected HTTP Response:**
```json
{
  "status": "success",
  "message": "Invoice created and sent successfully",
  "invoice_id": "in_1ABC...",
  "currency": "CAD",
  "amount": "200.00",
  "trace_id": "PAY-1234567890125"
}
```

**Expected Payment Gateway Changes:**
- Invoice amount: CAD $200.00 (NOT USD)
- Currency clearly marked as CAD

**Expected Email:**
- Amount shown in CAD
- Currency symbol or code visible

**Expected Google Sheets Entry:**
- Currency: CAD
- Amount: 200.00

**Pass Criteria:**
- [ ] Currency is CAD (not USD)
- [ ] Amount displays as $200.00 CAD
- [ ] Email shows CAD currency
- [ ] Google Sheets logs currency correctly
- [ ] No conversion to USD

---

### TC-HP-004: Partial Payment Allowed

**Priority:** P2 (Medium)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 6 minutes

**Description:**
Test invoice that allows partial payments with minimum amount.

**Test Data:**
```json
{
  "patient_email": "david.wilson.test@example.com",
  "patient_name": "David Wilson",
  "patient_id": "PT-2025-006",
  "amount": "500.00",
  "currency": "USD",
  "service_description": "Specialist consultation + diagnostics",
  "invoice_reference": "INV-2025-007",
  "billing_mode": "invoice_link",
  "allow_partial_payment": true,
  "minimum_amount": "100.00"
}
```

**Expected HTTP Response:**
```json
{
  "status": "success",
  "message": "Invoice created (partial payment allowed)",
  "invoice_id": "in_1ABC...",
  "total_amount": "500.00",
  "minimum_payment": "100.00",
  "partial_payment_enabled": true
}
```

**Expected Payment Gateway Changes:**
- Invoice total: $500.00
- Partial payment enabled
- Minimum payment: $100.00

**Pass Criteria:**
- [ ] Invoice allows partial payments
- [ ] Minimum payment set to $100.00
- [ ] Patient can pay between $100-$500

---

## Invalid Input Test Cases

---

### TC-INV-001: Missing Required Field - Email

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 3 minutes

**Description:**
Verify system rejects requests missing patient_email field.

**Test Data:**
```json
{
  "patient_name": "Test Patient",
  "patient_id": "PT-2025-100",
  "amount": "100.00",
  "service_description": "Test service",
  "invoice_reference": "INV-TEST-001"
}
```
**Note:** `patient_email` is missing

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "patient_email: required and must be valid email format"
  ],
  "validated_at": "2025-10-31T12:34:56.789Z"
}
```

**Expected Payment Gateway Changes:**
- No customer created
- No invoice created

**Expected Email:**
- No email sent

**Expected Google Sheets Entry:**
- No row added

**Pass Criteria:**
- [ ] Request rejected with error message
- [ ] Error clearly states email is required
- [ ] HTTP status indicates error (400 or error in JSON)
- [ ] No invoice created
- [ ] Workflow stops at validation node
- [ ] Response time under 1 second

**Failure Scenarios:**
- If invoice is created, validation is NOT working (critical bug!)

---

### TC-INV-002: Invalid Email Format

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 3 minutes

**Description:**
Test rejection of invalid email format.

**Test Data:**
```json
{
  "patient_email": "not-an-email",
  "patient_name": "Test Patient",
  "patient_id": "PT-2025-101",
  "amount": "100.00",
  "service_description": "Test service",
  "invoice_reference": "INV-TEST-002"
}
```

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "patient_email: required and must be valid email format"
  ]
}
```

**Pass Criteria:**
- [ ] Request rejected
- [ ] Error mentions invalid email format
- [ ] No invoice created

---

### TC-INV-003: Amount Below Minimum

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 3 minutes

**Description:**
Test rejection of amounts below minimum threshold ($1.00).

**Test Data:**
```json
{
  "patient_email": "test@example.com",
  "patient_name": "Test Patient",
  "patient_id": "PT-2025-102",
  "amount": "0.50",
  "currency": "USD",
  "service_description": "Test service",
  "invoice_reference": "INV-TEST-003"
}
```

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "amount: minimum charge is $1"
  ]
}
```

**Pass Criteria:**
- [ ] Request rejected
- [ ] Error states minimum amount
- [ ] No invoice created

**Note:** Minimum configurable via `MIN_PAYMENT_AMOUNT` environment variable (default: $1.00)

---

### TC-INV-004: Amount Above Maximum (Fraud Protection)

**Priority:** P1 (High)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 3 minutes

**Description:**
Test rejection of suspiciously high amounts (fraud protection).

**Test Data:**
```json
{
  "patient_email": "test@example.com",
  "patient_name": "Test Patient",
  "patient_id": "PT-2025-103",
  "amount": "999999.00",
  "currency": "USD",
  "service_description": "Test service",
  "invoice_reference": "INV-TEST-004"
}
```

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "amount: maximum charge is $100000 (fraud protection)"
  ]
}
```

**Pass Criteria:**
- [ ] Request rejected
- [ ] Error states maximum exceeded
- [ ] No invoice created

**Note:** Maximum configurable via `MAX_PAYMENT_AMOUNT` (default: $100,000)

---

### TC-INV-005: Invalid Currency Code

**Priority:** P1 (High)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 3 minutes

**Description:**
Test rejection of unsupported currency codes.

**Test Data:**
```json
{
  "patient_email": "test@example.com",
  "patient_name": "Test Patient",
  "patient_id": "PT-2025-104",
  "amount": "100.00",
  "currency": "XYZ",
  "service_description": "Test service",
  "invoice_reference": "INV-TEST-005"
}
```
**Note:** XYZ is not valid ISO 4217

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "currency: must be one of USD, CAD, EUR, GBP, AUD"
  ]
}
```

**Pass Criteria:**
- [ ] Request rejected
- [ ] Error lists valid currencies
- [ ] No invoice created

**Valid Currencies:** USD, CAD, EUR, GBP, AUD (configurable)

---

### TC-INV-006: Missing Invoice Reference

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 3 minutes

**Description:**
Test that invoice_reference (idempotency key) is required.

**Test Data:**
```json
{
  "patient_email": "test@example.com",
  "patient_name": "Test Patient",
  "patient_id": "PT-2025-105",
  "amount": "100.00",
  "service_description": "Test service"
}
```
**Note:** `invoice_reference` is missing

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "invoice_reference: required for duplicate prevention"
  ]
}
```

**Pass Criteria:**
- [ ] Request rejected
- [ ] Error explains invoice_reference required
- [ ] No invoice created

**Why This Matters:** invoice_reference prevents duplicate charges if request is retried.

---

## Edge Case Test Cases

---

### TC-EDGE-001: Disposable Email Domain Blocked

**Priority:** P1 (High)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 4 minutes

**Description:**
Test fraud detection blocks disposable/temporary email addresses.

**Test Data:**
```json
{
  "patient_email": "test@tempmail.com",
  "patient_name": "Test Patient",
  "patient_id": "PT-2025-200",
  "amount": "150.00",
  "service_description": "Test service",
  "invoice_reference": "INV-TEST-200"
}
```
**Note:** tempmail.com is disposable email service

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Fraud check failed",
  "reason": "Disposable email domain detected",
  "risk_score": 50,
  "risk_level": "CRITICAL"
}
```

**Pass Criteria:**
- [ ] Request blocked by fraud detection
- [ ] Error mentions disposable email
- [ ] Risk score ≥ 50
- [ ] Risk level: CRITICAL
- [ ] No invoice created

**Blocked Domains:**
- tempmail.com
- guerrillamail.com
- 10minutemail.com
- mailinator.com
- trash-mail.com
- throwaway.email

---

### TC-EDGE-002: Duplicate Invoice Reference (Idempotency)

**Priority:** P0 (Critical)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 5 minutes

**Description:**
Test that duplicate invoice references are detected and prevent double-charging.

**Test Steps:**

**Step 1 - First Request (should succeed):**
```json
{
  "patient_email": "test@example.com",
  "patient_name": "Test Patient",
  "patient_id": "PT-2025-201",
  "amount": "100.00",
  "service_description": "Test service",
  "invoice_reference": "INV-DUPLICATE-TEST"
}
```

**Expected:** Success, invoice created

**Step 2 - Duplicate Request (should be detected):**
Same JSON as Step 1 (sent immediately after)

**Expected HTTP Response (Step 2):**
```json
{
  "status": "duplicate",
  "message": "Invoice already exists",
  "existing_invoice_id": "in_1ABC...",
  "invoice_reference": "INV-DUPLICATE-TEST",
  "note": "No duplicate charge created"
}
```

**Pass Criteria:**
- [ ] First request succeeds
- [ ] Second request returns duplicate warning
- [ ] Only ONE invoice exists in payment gateway
- [ ] Patient NOT charged twice
- [ ] Idempotency window: 24 hours (configurable)

**Critical:** This prevents accidental double-charging!

---

### TC-EDGE-003: High-Value Transaction Review Flag

**Priority:** P2 (Medium)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 4 minutes

**Description:**
Test that high-value transactions are flagged for manual review.

**Test Data:**
```json
{
  "patient_email": "test@example.com",
  "patient_name": "Test Patient",
  "patient_id": "PT-2025-202",
  "amount": "7500.00",
  "currency": "USD",
  "service_description": "Comprehensive treatment package",
  "invoice_reference": "INV-HIGH-VALUE-001"
}
```
**Note:** $7,500 exceeds high-value threshold ($5,000 default)

**Expected HTTP Response:**
```json
{
  "status": "success",
  "message": "Invoice created (flagged for review)",
  "invoice_id": "in_1ABC...",
  "amount": "7500.00",
  "review_required": true,
  "reason": "High-value transaction",
  "risk_score": 15,
  "risk_level": "MEDIUM"
}
```

**Pass Criteria:**
- [ ] Invoice created successfully
- [ ] Response includes review_required: true
- [ ] Risk score indicates medium risk
- [ ] Invoice flagged in dashboard (if applicable)
- [ ] Notification sent to admin (if configured)

**Note:** High-value threshold configurable via `HIGH_VALUE_THRESHOLD` (default: $5,000)

---

## Integration Test Cases

---

### TC-INT-001: Stripe Gateway End-to-End

**Priority:** P0 (Critical)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 6 minutes

**Description:**
Complete end-to-end test of Stripe integration.

**Prerequisites:**
- Stripe TEST mode active
- API key starts with `sk_test_`

**Test Data:**
```json
{
  "patient_email": "stripe.test@example.com",
  "patient_name": "Stripe Test User",
  "patient_id": "PT-STRIPE-001",
  "amount": "299.00",
  "currency": "USD",
  "service_description": "Stripe integration test",
  "invoice_reference": "INV-STRIPE-TEST-001",
  "billing_mode": "invoice_link",
  "payment_gateway": "stripe"
}
```

**Expected Results:**

**Stripe Dashboard Checks:**
1. Customer created/found: "Stripe Test User"
2. Invoice created: $299.00
3. Invoice status: "Open"
4. Description matches: "Stripe integration test"
5. Payment link functional

**n8n Execution Checks:**
1. Customer lookup succeeds
2. Invoice creation succeeds
3. Line item added (Stripe-specific)
4. Invoice finalized
5. All nodes green

**Pass Criteria:**
- [ ] Customer exists in Stripe
- [ ] Invoice created with correct amount
- [ ] Invoice status: Open
- [ ] Payment link accessible
- [ ] All Stripe API calls succeed
- [ ] No errors in execution log
- [ ] Execution time under 10 seconds

---

### TC-INT-002: Email Delivery (SendGrid)

**Priority:** P0 (Critical)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 5 minutes

**Description:**
Test email delivery for invoice notifications.

**Test Data:**
```json
{
  "patient_email": "email.test@example.com",
  "patient_name": "Email Test User",
  "patient_id": "PT-EMAIL-001",
  "amount": "125.00",
  "service_description": "Email delivery test",
  "invoice_reference": "INV-EMAIL-TEST-001",
  "billing_mode": "invoice_link"
}
```

**Verification Steps:**

**SendGrid Dashboard:**
1. Go to Activity feed
2. Find email to email.test@example.com
3. Status: "Delivered" (within 2 minutes)
4. Opens/clicks tracked

**Email Inbox:**
1. Check email.test@example.com
2. Email received within 2 minutes
3. Subject mentions invoice/payment
4. Body contains payment link
5. Amount: $125.00
6. No broken images

**Pass Criteria:**
- [ ] Email status "Delivered" in SendGrid
- [ ] Email received in inbox
- [ ] Subject line appropriate
- [ ] Payment link present and functional
- [ ] Amount displayed correctly
- [ ] No formatting issues
- [ ] Delivery within 2 minutes

---

### TC-INT-003: Google Sheets Logging

**Priority:** P1 (High)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 4 minutes

**Description:**
Test payment data logging to Google Sheets.

**Test Data:**
```json
{
  "patient_email": "sheets.test@example.com",
  "patient_name": "Sheets Test User",
  "patient_id": "PT-SHEETS-001",
  "amount": "175.00",
  "service_description": "Sheets logging test",
  "invoice_reference": "INV-SHEETS-TEST-001"
}
```

**Expected Google Sheets Entry:**

| Column | Expected Value |
|--------|----------------|
| Timestamp | Current date/time |
| Patient ID | PT-SHEETS-001 |
| Patient Email (Masked) | s***s@example.com |
| Amount | 175.00 |
| Currency | USD |
| Invoice Reference | INV-SHEETS-TEST-001 |
| Status | invoice_created or invoice_sent |
| Trace ID | PAY-[timestamp] |

**Pass Criteria:**
- [ ] Row added to sheet within 5 seconds
- [ ] All columns populated
- [ ] Email masked (PHI protection)
- [ ] Amount has 2 decimal places
- [ ] Timestamp accurate
- [ ] Trace ID format correct
- [ ] No errors in Sheets node

---

## Performance Test Cases

---

### TC-PERF-001: Response Time Under Load

**Priority:** P2 (Medium)
**Difficulty:** ⭐⭐⭐ Advanced
**Estimated Time:** 10 minutes

**Description:**
Test system performance with concurrent requests.

**Test Method:**
Execute 5 concurrent payment requests simultaneously.

**Test Data (5 variations):**
Use INV-PERF-001 through INV-PERF-005 with different emails.

**Expected Results:**
- All 5 requests succeed
- Average response time: 4-8 seconds
- Maximum response time: ≤ 12 seconds
- No timeouts
- All invoices created

**Pass Criteria:**
- [ ] All 5 requests return HTTP 200
- [ ] Average response time ≤ 8 seconds
- [ ] Max response time ≤ 12 seconds
- [ ] All 5 invoices in payment gateway
- [ ] No timeout errors
- [ ] n8n remains stable

**Performance Targets:**

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Average Response Time | < 6s | 6-8s | > 8s |
| Max Response Time | < 10s | 10-12s | > 12s |
| Success Rate | 100% | 100% | < 100% |
| Concurrent Capacity | 5+ | 3-5 | < 3 |

---

## Security Test Cases

---

### TC-SEC-001: PCI-DSS Compliance - PHI Masking

**Priority:** P0 (Critical)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 8 minutes

**Description:**
Verify credit card data NEVER logged and PHI properly masked.

**Test Data:**
```json
{
  "patient_email": "security.test@example.com",
  "patient_name": "Security Test User",
  "patient_id": "PT-SEC-001",
  "amount": "150.00",
  "service_description": "Security compliance test",
  "invoice_reference": "INV-SEC-001",
  "billing_mode": "invoice_link"
}
```

**Verification Checklist:**

**n8n Execution Log:**
- [ ] Email masked: s***y@example.com
- [ ] Name masked: S*** T***
- [ ] NO credit card numbers visible
- [ ] NO full customer names in logs

**Google Sheets:**
- [ ] Email masked: s***y@example.com
- [ ] NO credit card data
- [ ] NO unmasked PHI

**Compliance Audit Log (Module 09 if active):**
- [ ] All PHI masked
- [ ] Trace ID logged
- [ ] No sensitive data exposed

**Pass Criteria:**
- [ ] Email masked everywhere
- [ ] Name masked in logs
- [ ] NO credit card numbers anywhere
- [ ] Stripe/Square handles all payment methods (never in n8n)
- [ ] Full PHI only in PCI-compliant systems

**Critical Security Rules:**
1. Credit card data NEVER touches n8n (Stripe/Square only)
2. Email addresses always masked in logs
3. Patient names masked in notifications
4. Full data only in PCI-compliant platforms

**Failure = CRITICAL SECURITY BUG!**

---

## Test Execution Tracker

Use this table to track your test progress:

| TC-ID | Test Name | Status | Result | Notes |
|-------|-----------|--------|--------|-------|
| TC-HP-001 | Create Invoice Link | ☐ Not Run | | |
| TC-HP-002 | Charge Immediately | ☐ Not Run | | |
| TC-HP-003 | Multi-Currency (CAD) | ☐ Not Run | | |
| TC-HP-004 | Partial Payment | ☐ Not Run | | |
| TC-INV-001 | Missing Email | ☐ Not Run | | |
| TC-INV-002 | Invalid Email | ☐ Not Run | | |
| TC-INV-003 | Amount Below Min | ☐ Not Run | | |
| TC-INV-004 | Amount Above Max | ☐ Not Run | | |
| TC-INV-005 | Invalid Currency | ☐ Not Run | | |
| TC-INV-006 | Missing Invoice Ref | ☐ Not Run | | |
| TC-EDGE-001 | Disposable Email | ☐ Not Run | | |
| TC-EDGE-002 | Duplicate Invoice | ☐ Not Run | | |
| TC-EDGE-003 | High-Value Flag | ☐ Not Run | | |
| TC-INT-001 | Stripe Integration | ☐ Not Run | | |
| TC-INT-002 | Email Delivery | ☐ Not Run | | |
| TC-INT-003 | Google Sheets Log | ☐ Not Run | | |
| TC-PERF-001 | Response Under Load | ☐ Not Run | | |
| TC-SEC-001 | PHI Masking | ☐ Not Run | | |

**Status Values:** Not Run | In Progress | Pass | Fail | Blocked

---

## Test Results Summary Template

After completing all tests, fill out this summary:

**Test Execution Date:** ___________
**Tester Name:** ___________
**Environment:** Development / Staging / Production
**Payment Gateway:** Stripe / Square
**n8n Version:** ___________

### Results by Category

| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Happy Path | 4 | | | % |
| Invalid Input | 6 | | | % |
| Edge Case | 3 | | | % |
| Integration | 3 | | | % |
| Performance | 1 | | | % |
| Security | 1 | | | % |
| **TOTAL** | **18** | | | **%** |

### Overall Assessment

**Overall Status:** Pass / Conditional Pass / Fail

**Critical Issues Found:** (list P0 failures)

**Recommendations:**

**Sign-Off:**

---

## Quick Reference: Test Data

### Valid Test Amounts
- $1.00 - Minimum allowed
- $150.00 - Typical consultation
- $225.50 - With cents
- $500.00 - Higher service
- $100,000.00 - Maximum allowed

### Invalid Test Amounts
- $0.50 - Below minimum
- $999,999.00 - Above maximum

### Valid Currencies
- USD (US Dollar)
- CAD (Canadian Dollar)
- EUR (Euro)
- GBP (British Pound)
- AUD (Australian Dollar)

### Invalid Currencies
- XYZ (Not ISO 4217)
- ABC (Not supported)

### Stripe Test Cards

| Card Number | Behavior |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

**Expiry:** Any future date (12/28)
**CVC:** Any 3 digits (123)

### Disposable Email Domains (Blocked)
- tempmail.com
- guerrillamail.com
- 10minutemail.com
- mailinator.com
- trash-mail.com

---

**For detailed instructions on HOW to run these tests, see [TestPlan.md](TestPlan.md)**
