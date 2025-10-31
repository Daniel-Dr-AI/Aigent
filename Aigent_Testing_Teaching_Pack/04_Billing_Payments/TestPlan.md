# Module 04: Billing & Payments - Test Plan

**Module:** 04 - Billing & Payments
**Version:** 1.1.0-enhanced
**Test Plan Version:** 1.0
**Last Updated:** 2025-10-31
**Audience:** Complete beginners welcome!

---

## Welcome!

This test plan will guide you through testing the **Billing & Payments** module step-by-step.

**What this module does:** Processes patient payments, creates invoices, and manages billing through Stripe or Square payment gateways.

**Why testing matters:** This module handles real money! If it fails, you could lose revenue, double-charge patients, or create compliance issues. Thorough testing prevents costly mistakes.

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
10. [What to Do If Tests Fail](#what-to-do-if-tests-fail)

---

## Before You Begin

### Prerequisites

**You need:**
- [ ] n8n workflow installed and running (green "Active" toggle)
- [ ] Environment variables configured (see `/00_Shared/EnvMatrix.md`)
- [ ] Stripe or Square test account configured
- [ ] Test API keys (NEVER use production keys!)
- [ ] Google Sheets set up with "Payments" tab
- [ ] Email delivery configured (SendGrid or similar)
- [ ] Mock data ready (see `/00_Shared/MockIdentities.json`)

**You DON'T need:**
- ❌ Real patient data (use mock data only!)
- ❌ Production payment gateway (use TEST mode only!)
- ❌ Real credit cards (use test card numbers)
- ❌ Coding skills (we'll give you everything to copy/paste)

### Safety Reminders

⚠️ **CRITICAL: Use TEST mode only!**
- Stripe test keys start with `sk_test_` (NOT `sk_live_`)
- Square test keys come from "Sandbox" environment (NOT "Production")

⚠️ **NEVER use real patient data in testing!**

⚠️ **NEVER use real credit card numbers!**
- Use Stripe test cards: `4242 4242 4242 4242`
- Use Square test cards provided in their sandbox

⚠️ **Test in a development environment** — not your live system!

✅ **All test data is completely fictional and safe**

---

## Test Environment Setup

### Step 1: Verify Workflow is Active

**What to do:**
1. Open your n8n instance in a web browser
2. Click on "Workflows" in the left sidebar
3. Find "Aigent Module 04: Billing & Payments Enhanced (v1.1)"
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

**What to do:**
1. Open the Module 04 workflow in n8n
2. Click on the first node (called "Webhook: Billing Payment Request")
3. Look for "Webhook URLs" section
4. You'll see two URLs: "Production URL" and "Test URL"
5. Copy the **Production URL** (it looks like: `https://your-n8n.com/webhook/billing-payment`)

**What you should see:**
```
Production URL: https://your-n8n.com/webhook/billing-payment
Test URL: https://your-n8n.com/webhook-test/billing-payment
```

**Save this URL** — you'll use it in every test!

---

### Step 3: Verify Payment Gateway Test Mode

**For Stripe:**
1. Log into your Stripe Dashboard
2. Look at top-left corner — you should see "TEST MODE" badge
3. Go to Developers → API Keys
4. Verify your secret key starts with `sk_test_`

**For Square:**
1. Log into your Square Developer Dashboard
2. Select "Sandbox" from environment switcher (top-right)
3. Go to Credentials
4. Verify you're using Sandbox credentials (NOT Production)

**Critical:** NEVER test with production keys! You could charge real customers!

---

### Step 4: Prepare Test Credit Cards

**Stripe Test Cards:**

| Card Number | Brand | Behavior |
|-------------|-------|----------|
| 4242 4242 4242 4242 | Visa | Succeeds |
| 4000 0000 0000 0002 | Visa | Declined (generic) |
| 4000 0000 0000 9995 | Visa | Declined (insufficient funds) |
| 4000 0082 6000 0000 | Visa | Requires 3D Secure |

**Any future expiry date (e.g., 12/28), any CVC (e.g., 123)**

**Square Test Cards:**
- Square provides test cards in their Sandbox environment
- Visit: https://developer.squareup.com/docs/testing/test-values

**Save these numbers** — you'll use them for testing!

---

## Test Suite Overview

### Total Tests: 18 comprehensive tests

| Category | Count | Time Estimate |
|----------|-------|---------------|
| Happy Path | 4 | 20 minutes |
| Invalid Input | 6 | 30 minutes |
| Edge Cases | 3 | 15 minutes |
| Integration | 3 | 20 minutes |
| Performance | 1 | 10 minutes |
| Security | 1 | 10 minutes |
| **TOTAL** | **18** | **~105 minutes** |

### Difficulty Levels

- ⭐ **Beginner:** Anyone can do this
- ⭐⭐ **Intermediate:** Some technical knowledge helpful
- ⭐⭐⭐ **Advanced:** Requires understanding of payment systems

Most tests are ⭐ or ⭐⭐ difficulty!

---

## Happy Path Tests

These tests verify everything works when you provide correct data.

---

### HP-001: Create Invoice Link (Most Common Scenario)

**Difficulty:** ⭐ Beginner
**Time:** 5 minutes
**Priority:** P0 (Critical)

**Purpose:**
Test creating an invoice and sending the payment link to a patient via email. This is the most common billing workflow.

**What you're testing:**
- Payment validation works
- Invoice is created in Stripe/Square
- Email is sent with payment link
- Data is logged to Google Sheets

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

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "sarah.johnson.test@example.com",
    "patient_name": "Sarah Johnson",
    "patient_id": "PT-2025-001",
    "amount": "150.00",
    "currency": "USD",
    "service_description": "Initial consultation - 60 minutes",
    "invoice_reference": "INV-2025-001",
    "billing_mode": "invoice_link"
  }'
```

**Steps to Execute:**

1. **Open your terminal/command prompt**
   - Windows: Press Windows key + R, type `cmd`, press Enter
   - Mac: Press Command + Space, type `terminal`, press Enter
   - Linux: Press Ctrl + Alt + T

2. **Copy the cURL command above**
   - Replace `https://your-n8n.com/webhook/billing-payment` with your actual webhook URL

3. **Paste the command into your terminal and press Enter**

4. **Wait 3-8 seconds for the response**

**Expected Results:**

**HTTP Response (in terminal):**
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

**What you should see:**
- HTTP status code: 200 OK
- `status`: "success"
- `invoice_id`: Starts with `in_` (Stripe) or `inv-` (Square)
- `hosted_invoice_url`: A clickable link to the invoice
- `execution_time_ms`: Under 8000ms (8 seconds)

**In Stripe Dashboard:**
1. Go to Payments → Invoices
2. You should see a new invoice for $150.00
3. Customer email: sarah.johnson.test@example.com
4. Status: "Open" (awaiting payment)
5. Description: "Initial consultation - 60 minutes"

**In Email (SendGrid or your email service):**
1. Check test email inbox for sarah.johnson.test@example.com
2. You should receive an email within 2 minutes
3. Subject: "Invoice from [Your Clinic Name]" or similar
4. Body contains: Payment link button
5. Amount shown: $150.00

**In Google Sheets:**
1. Open your "Payments" Google Sheet
2. Check the last row
3. You should see:
   - Patient ID: PT-2025-001
   - Email (masked): s***h@example.com
   - Amount: 150.00
   - Currency: USD
   - Invoice Reference: INV-2025-001
   - Status: invoice_sent
   - Timestamp: Current date/time

**In n8n Execution Log:**
1. Go to n8n → Executions
2. Click the most recent execution
3. Should show green checkmarks on all nodes
4. Look for "API: Create Invoice" node — should show successful response

**Pass Criteria:**

- [ ] HTTP 200 response received
- [ ] Response contains `invoice_id` and `hosted_invoice_url`
- [ ] Invoice appears in Stripe/Square dashboard
- [ ] Email sent successfully (check inbox or SendGrid logs)
- [ ] Google Sheets row added with correct data
- [ ] n8n execution shows all green (no red errors)
- [ ] Execution time under 8 seconds

**Common Mistakes:**

❌ **Mistake:** Using production API keys instead of test keys
✅ **Fix:** Verify your keys start with `sk_test_` (Stripe) or are from Sandbox (Square)

❌ **Mistake:** Using a duplicate `invoice_reference`
✅ **Fix:** Change `INV-2025-001` to `INV-2025-002` or use unique ID

❌ **Mistake:** Missing decimal places in amount (e.g., `150` instead of `150.00`)
✅ **Fix:** Always use 2 decimal places: `"amount": "150.00"`

**Troubleshooting:**

**Problem:** Response says "customer_id is required"
**Solution:** Check that customer lookup is working. Verify Stripe/Square credentials.

**Problem:** Email not received
**Solution:**
1. Check SendGrid API key is correct
2. Verify sender email is verified in SendGrid
3. Check spam folder
4. Look at n8n execution log — did email node run?

**Problem:** "Invoice already exists" error
**Solution:** Change the `invoice_reference` to a unique value (e.g., `INV-2025-002`)

---

### HP-002: Charge Payment Immediately

**Difficulty:** ⭐⭐ Intermediate
**Time:** 7 minutes
**Priority:** P0 (Critical)

**Purpose:**
Test immediate payment processing. Patient has card on file, charge it now.

**What you're testing:**
- Immediate charge processing
- Payment confirmation
- Receipt email delivery
- Transaction logging

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

**Note:** `payment_method_id` would come from previous payment or card-on-file. For testing, Stripe accepts `pm_card_visa` as a test payment method.

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "michael.chen.test@example.com",
    "patient_name": "Michael Chen",
    "patient_id": "PT-2025-002",
    "amount": "225.50",
    "currency": "USD",
    "service_description": "Follow-up appointment + lab review",
    "invoice_reference": "INV-2025-003",
    "billing_mode": "charge_now",
    "payment_method_id": "pm_card_visa"
  }'
```

**Steps to Execute:**

1. Open terminal
2. Copy the cURL command (replace webhook URL)
3. Paste and press Enter
4. Wait 4-10 seconds for payment processing

**Expected Results:**

**HTTP Response:**
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

**In Stripe Dashboard:**
1. Go to Payments → All Payments
2. You should see a successful charge for $225.50
3. Status: "Succeeded"
4. Customer: michael.chen.test@example.com
5. Description: "Follow-up appointment + lab review"

**In Email:**
1. Check inbox for michael.chen.test@example.com
2. Receipt email should arrive within 2 minutes
3. Subject: "Receipt for $225.50" or similar
4. Amount charged: $225.50
5. Receipt link included

**In Google Sheets:**
1. Check last row in "Payments" sheet
2. Should show:
   - Amount: 225.50
   - Status: paid
   - Charge ID: ch_1ABC...
   - Payment method: ending in 4242 (Visa test card)

**Pass Criteria:**

- [ ] HTTP 200 response received
- [ ] Response contains `charge_id` and `receipt_url`
- [ ] Payment shows "Succeeded" in Stripe dashboard
- [ ] Receipt email sent successfully
- [ ] Google Sheets updated with payment status
- [ ] No errors in n8n execution log
- [ ] Execution time under 10 seconds

**Common Mistakes:**

❌ **Using real credit card**
✅ **Use Stripe test cards only:** 4242 4242 4242 4242

❌ **billing_mode set to "invoice_link" instead of "charge_now"**
✅ **Verify:** `"billing_mode": "charge_now"`

**Troubleshooting:**

**Problem:** "Your card was declined"
**Solution:** You might be using a test card that simulates decline. Use 4242 4242 4242 4242 for success.

**Problem:** "No such payment method: pm_card_visa"
**Solution:** In production, you need a real payment method ID. For testing, this should work in test mode.

---

### HP-003: Multi-Currency Payment (CAD)

**Difficulty:** ⭐ Beginner
**Time:** 5 minutes
**Priority:** P1 (High)

**Purpose:**
Test that the system handles different currencies correctly.

**What you're testing:**
- Currency validation
- Amount formatting for different currencies
- Invoice creation in non-USD currency

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

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "emma.martin.test@example.com",
    "patient_name": "Emma Martin",
    "patient_id": "PT-2025-004",
    "amount": "200.00",
    "currency": "CAD",
    "service_description": "Telehealth consultation",
    "invoice_reference": "INV-2025-005",
    "billing_mode": "invoice_link"
  }'
```

**Expected Results:**

**HTTP Response:**
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

**In Stripe Dashboard:**
1. Invoice shows amount as **CAD $200.00** (NOT USD)
2. Currency symbol: $ or CAD depending on display settings
3. All amounts in Canadian dollars

**Pass Criteria:**

- [ ] HTTP 200 response received
- [ ] Invoice currency is CAD
- [ ] Amount displays correctly as $200.00 CAD
- [ ] Email shows CAD currency
- [ ] Google Sheets logs currency as CAD

**Troubleshooting:**

**Problem:** "Unsupported currency: CAD"
**Solution:** Check that your Stripe account supports CAD. You may need to enable it in Settings → Payment methods.

---

### HP-004: Partial Payment Processing

**Difficulty:** ⭐⭐ Intermediate
**Time:** 6 minutes
**Priority:** P2 (Medium)

**Purpose:**
Test handling of partial payments when patient pays portion of invoice.

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

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Expected Results:**

**HTTP Response:**
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

**In Stripe Dashboard:**
1. Invoice created for $500.00
2. Partial payment settings enabled
3. Minimum payment: $100.00

**Pass Criteria:**

- [ ] HTTP 200 response received
- [ ] Invoice allows partial payments
- [ ] Minimum payment amount set correctly
- [ ] Patient can pay any amount ≥ $100.00

---

## Invalid Input Tests

These tests verify the system rejects bad data gracefully.

---

### INV-001: Missing Required Field (Email)

**Difficulty:** ⭐ Beginner
**Time:** 3 minutes
**Priority:** P0 (Critical)

**Purpose:**
Verify that the system rejects requests missing the email address.

**What you're testing:**
- Validation catches missing email
- Clear error message returned
- No invoice created
- No email sent

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
**Note:** `patient_email` is intentionally missing!

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "Test Patient",
    "patient_id": "PT-2025-100",
    "amount": "100.00",
    "service_description": "Test service",
    "invoice_reference": "INV-TEST-001"
  }'
```

**Expected Results:**

**HTTP Response:**
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

**What you should see:**
- HTTP status code: 400 Bad Request (or 200 with error status)
- `status`: "error"
- Clear error message about missing email
- No invoice created in Stripe/Square
- No execution beyond validation node in n8n

**Pass Criteria:**

- [ ] Request is rejected with error message
- [ ] Error message clearly states email is required
- [ ] No invoice created in payment gateway
- [ ] No email sent
- [ ] n8n execution stops at validation node (does not proceed)
- [ ] Response time under 1 second (fast validation)

**Common Mistakes:**

❌ **Expecting HTTP 200** when validation fails
✅ **Should receive:** Error status in JSON response

**Troubleshooting:**

**Problem:** Request succeeds when it should fail
**Solution:** Check validation node in workflow — validation logic may not be working

---

### INV-002: Invalid Email Format

**Difficulty:** ⭐ Beginner
**Time:** 3 minutes
**Priority:** P0 (Critical)

**Purpose:**
Test that invalid email addresses are rejected.

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

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "not-an-email",
    "patient_name": "Test Patient",
    "patient_id": "PT-2025-101",
    "amount": "100.00",
    "service_description": "Test service",
    "invoice_reference": "INV-TEST-002"
  }'
```

**Expected Results:**

**HTTP Response:**
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
- [ ] No email sent

---

### INV-003: Amount Below Minimum

**Difficulty:** ⭐ Beginner
**Time:** 3 minutes
**Priority:** P0 (Critical)

**Purpose:**
Test that amounts below minimum threshold are rejected (fraud protection).

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
**Note:** Amount is $0.50, below the minimum of $1.00

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "test@example.com",
    "patient_name": "Test Patient",
    "patient_id": "PT-2025-102",
    "amount": "0.50",
    "currency": "USD",
    "service_description": "Test service",
    "invoice_reference": "INV-TEST-003"
  }'
```

**Expected Results:**

**HTTP Response:**
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
- [ ] Error states minimum amount requirement
- [ ] No invoice created

**Note:** The minimum amount is configurable via environment variable `MIN_PAYMENT_AMOUNT`. Default is $1.00.

---

### INV-004: Amount Above Maximum (Fraud Protection)

**Difficulty:** ⭐ Beginner
**Time:** 3 minutes
**Priority:** P1 (High)

**Purpose:**
Test that suspiciously high amounts are flagged or rejected.

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
**Note:** Amount is $999,999 — likely fraudulent

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "test@example.com",
    "patient_name": "Test Patient",
    "patient_id": "PT-2025-103",
    "amount": "999999.00",
    "currency": "USD",
    "service_description": "Test service",
    "invoice_reference": "INV-TEST-004"
  }'
```

**Expected Results:**

**HTTP Response:**
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
- [ ] Error states maximum amount exceeded
- [ ] No invoice created

**Note:** Maximum amount is configurable via `MAX_PAYMENT_AMOUNT`. Default is $100,000.

---

### INV-005: Invalid Currency Code

**Difficulty:** ⭐ Beginner
**Time:** 3 minutes
**Priority:** P1 (High)

**Purpose:**
Test that only supported currencies are accepted.

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
**Note:** XYZ is not a valid ISO 4217 currency code

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "test@example.com",
    "patient_name": "Test Patient",
    "patient_id": "PT-2025-104",
    "amount": "100.00",
    "currency": "XYZ",
    "service_description": "Test service",
    "invoice_reference": "INV-TEST-005"
  }'
```

**Expected Results:**

**HTTP Response:**
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

---

### INV-006: Missing Invoice Reference (Idempotency Key)

**Difficulty:** ⭐ Beginner
**Time:** 3 minutes
**Priority:** P0 (Critical)

**Purpose:**
Test that invoice reference (idempotency key) is required to prevent duplicates.

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

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "test@example.com",
    "patient_name": "Test Patient",
    "patient_id": "PT-2025-105",
    "amount": "100.00",
    "service_description": "Test service"
  }'
```

**Expected Results:**

**HTTP Response:**
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
- [ ] Error explains invoice_reference is required
- [ ] No invoice created

---

## Edge Case Tests

These tests handle unusual but valid scenarios.

---

### EDGE-001: Disposable Email Domain Detection

**Difficulty:** ⭐⭐ Intermediate
**Time:** 4 minutes
**Priority:** P1 (High)

**Purpose:**
Test fraud detection blocks disposable/temporary email addresses.

**What you're testing:**
- Fraud detection system
- Disposable email domain blocking
- Clear rejection message

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
**Note:** tempmail.com is a disposable email service

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "test@tempmail.com",
    "patient_name": "Test Patient",
    "patient_id": "PT-2025-200",
    "amount": "150.00",
    "service_description": "Test service",
    "invoice_reference": "INV-TEST-200"
  }'
```

**Expected Results:**

**HTTP Response:**
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
- [ ] Error mentions disposable email domain
- [ ] Risk score ≥ 50
- [ ] No invoice created

**Note:** Disposable email domains include: tempmail.com, guerrillamail.com, 10minutemail.com, mailinator.com

---

### EDGE-002: Duplicate Invoice Reference (Idempotency Test)

**Difficulty:** ⭐⭐ Intermediate
**Time:** 5 minutes
**Priority:** P0 (Critical)

**Purpose:**
Test that duplicate invoice references are detected and prevent double-charging.

**Steps:**

1. **First, send a valid request:**

```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "test@example.com",
    "patient_name": "Test Patient",
    "patient_id": "PT-2025-201",
    "amount": "100.00",
    "service_description": "Test service",
    "invoice_reference": "INV-DUPLICATE-TEST"
  }'
```

**Expected:** Success response, invoice created

2. **Immediately send the SAME request again:**

```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "test@example.com",
    "patient_name": "Test Patient",
    "patient_id": "PT-2025-201",
    "amount": "100.00",
    "service_description": "Test service",
    "invoice_reference": "INV-DUPLICATE-TEST"
  }'
```

**Expected Results (Second Request):**

**HTTP Response:**
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
- [ ] Only ONE invoice exists in Stripe/Square (not two)
- [ ] Patient is NOT charged twice
- [ ] Clear message explaining duplicate detected

**Important:** This prevents accidental double-charging if patient clicks "Pay" button twice!

---

### EDGE-003: High-Value Transaction (Manual Review Flag)

**Difficulty:** ⭐⭐ Intermediate
**Time:** 4 minutes
**Priority:** P2 (Medium)

**Purpose:**
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
**Note:** $7,500 is above the high-value threshold (default: $5,000)

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "test@example.com",
    "patient_name": "Test Patient",
    "patient_id": "PT-2025-202",
    "amount": "7500.00",
    "currency": "USD",
    "service_description": "Comprehensive treatment package",
    "invoice_reference": "INV-HIGH-VALUE-001"
  }'
```

**Expected Results:**

**HTTP Response:**
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

- [ ] Invoice is created successfully
- [ ] Response includes `review_required: true`
- [ ] Risk score indicates review needed
- [ ] Invoice appears in dashboard with review flag

**Note:** High-value threshold is configurable via `HIGH_VALUE_THRESHOLD` (default: $5,000)

---

## Integration Tests

These tests verify connections to external services.

---

### INT-001: Stripe Gateway Integration

**Difficulty:** ⭐⭐ Intermediate
**Time:** 6 minutes
**Priority:** P0 (Critical)

**Purpose:**
End-to-end test of Stripe integration.

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

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "stripe.test@example.com",
    "patient_name": "Stripe Test User",
    "patient_id": "PT-STRIPE-001",
    "amount": "299.00",
    "currency": "USD",
    "service_description": "Stripe integration test",
    "invoice_reference": "INV-STRIPE-TEST-001",
    "billing_mode": "invoice_link",
    "payment_gateway": "stripe"
  }'
```

**Expected Results:**

1. **Customer created or found in Stripe**
2. **Invoice created with line item**
3. **Invoice finalized**
4. **Email sent with payment link**

**Verification Steps:**

**In Stripe Dashboard:**
1. Go to Customers → find "Stripe Test User"
2. Go to Invoices → find invoice for $299.00
3. Status should be "Open"
4. Click invoice → verify description is correct

**Pass Criteria:**

- [ ] Customer exists in Stripe
- [ ] Invoice created with correct amount
- [ ] Invoice status: Open
- [ ] Payment link works (click it to see hosted invoice page)
- [ ] All Stripe API calls succeed
- [ ] No errors in n8n execution log

---

### INT-002: Email Delivery (SendGrid)

**Difficulty:** ⭐⭐ Intermediate
**Time:** 5 minutes
**Priority:** P0 (Critical)

**Purpose:**
Test email delivery for invoices and receipts.

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

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "email.test@example.com",
    "patient_name": "Email Test User",
    "patient_id": "PT-EMAIL-001",
    "amount": "125.00",
    "service_description": "Email delivery test",
    "invoice_reference": "INV-EMAIL-TEST-001",
    "billing_mode": "invoice_link"
  }'
```

**Verification:**

1. **Check SendGrid Activity:**
   - Go to SendGrid Dashboard → Activity
   - Look for email to email.test@example.com
   - Status should be "Delivered" within 2 minutes

2. **Check Inbox:**
   - Open email.test@example.com inbox
   - Find invoice email
   - Verify subject, amount, payment link

**Pass Criteria:**

- [ ] Email shows "Delivered" in SendGrid
- [ ] Email received in inbox within 2 minutes
- [ ] Subject line mentions invoice or payment
- [ ] Email body contains payment link
- [ ] Amount displayed correctly ($125.00)
- [ ] No broken images or formatting issues

---

### INT-003: Google Sheets Logging

**Difficulty:** ⭐ Beginner
**Time:** 4 minutes
**Priority:** P1 (High)

**Purpose:**
Test that all payments are logged to Google Sheets.

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

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "sheets.test@example.com",
    "patient_name": "Sheets Test User",
    "patient_id": "PT-SHEETS-001",
    "amount": "175.00",
    "service_description": "Sheets logging test",
    "invoice_reference": "INV-SHEETS-TEST-001"
  }'
```

**Verification:**

1. Open your "Payments" Google Sheet
2. Look at the last row (should have been added within 5 seconds)
3. Verify all columns populated correctly

**Expected Columns:**

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

- [ ] Row added to Google Sheets
- [ ] All columns populated
- [ ] Email is masked (PHI protection)
- [ ] Amount formatted correctly (2 decimal places)
- [ ] Timestamp is accurate
- [ ] No errors in n8n Sheets node

---

## Performance Tests

---

### PERF-001: Response Time Under Load

**Difficulty:** ⭐⭐⭐ Advanced
**Time:** 10 minutes
**Priority:** P2 (Medium)

**Purpose:**
Test that the system responds quickly even with multiple concurrent requests.

**Tools needed:**
- `curl` command
- Ability to run multiple terminal windows

**Test Steps:**

1. **Open 5 terminal windows**

2. **In each window, prepare this command (with different invoice_reference):**

**Terminal 1:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{"patient_email":"perf1@example.com","patient_name":"Perf Test 1","patient_id":"PT-PERF-001","amount":"100.00","service_description":"Performance test 1","invoice_reference":"INV-PERF-001"}' \
  -w "\nTime: %{time_total}s\n"
```

**Terminal 2:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{"patient_email":"perf2@example.com","patient_name":"Perf Test 2","patient_id":"PT-PERF-002","amount":"100.00","service_description":"Performance test 2","invoice_reference":"INV-PERF-002"}' \
  -w "\nTime: %{time_total}s\n"
```

**Terminal 3-5:** Change invoice_reference to INV-PERF-003, 004, 005

3. **Execute all 5 commands at the same time** (press Enter in each window quickly)

4. **Record the response times**

**Expected Results:**

- All 5 requests succeed
- Average response time: 4-8 seconds
- No request takes longer than 12 seconds
- No errors or timeouts
- All 5 invoices appear in Stripe dashboard

**Pass Criteria:**

- [ ] All requests return HTTP 200
- [ ] Average response time ≤ 8 seconds
- [ ] Maximum response time ≤ 12 seconds
- [ ] All invoices created successfully
- [ ] No timeout errors
- [ ] n8n doesn't crash or slow down

**Note:** If performance is poor, check:
- n8n server resources (CPU, memory)
- Payment gateway API rate limits
- Network latency

---

## Security Tests

---

### SEC-001: PCI-DSS Compliance - Credit Card Masking

**Difficulty:** ⭐⭐ Intermediate
**Time:** 8 minutes
**Priority:** P0 (Critical)

**Purpose:**
Verify that credit card data is NEVER logged or stored in plain text.

**What you're testing:**
- PHI masking in logs
- PCI-DSS compliance
- No credit card storage

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

**cURL Command:**
```bash
curl -X POST https://your-n8n.com/webhook/billing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "security.test@example.com",
    "patient_name": "Security Test User",
    "patient_id": "PT-SEC-001",
    "amount": "150.00",
    "service_description": "Security compliance test",
    "invoice_reference": "INV-SEC-001",
    "billing_mode": "invoice_link"
  }'
```

**Verification Steps:**

1. **Check n8n Execution Log:**
   - Go to n8n → Executions
   - Click on the execution
   - Look at "Prepare Billing Data" node output
   - Verify email is masked: `s***y@example.com`
   - Verify name is masked: `S*** T***`

2. **Check Google Sheets:**
   - Open "Payments" sheet
   - Find the row for INV-SEC-001
   - Verify email is masked: `s***y@example.com`
   - NO credit card numbers visible

3. **Check Compliance Audit Log (if Module 09 is active):**
   - Open audit log
   - Search for trace_id from response
   - Verify all PHI is masked

**Pass Criteria:**

- [ ] Email is masked in n8n logs
- [ ] Name is masked in n8n logs
- [ ] Email is masked in Google Sheets
- [ ] NO credit card numbers visible anywhere
- [ ] NO full customer names in logs (only masked)
- [ ] Stripe/Square handles all payment methods (never stored in n8n)

**Security Checklist:**

- [ ] Credit card data NEVER touches n8n (handled by Stripe/Square only)
- [ ] Email addresses masked in all logs
- [ ] Patient names masked in notifications
- [ ] Full data only visible in Stripe/Square (PCI-compliant platforms)
- [ ] Audit trail shows masked data

**Critical:** If you find ANY unmasked PHI in logs or sheets, this is a CRITICAL security failure!

---

## What to Do If Tests Fail

### General Troubleshooting Steps

1. **Check n8n Execution Log:**
   - Go to n8n → Executions
   - Click the failed execution
   - Look for red "Error" nodes
   - Read the error message

2. **Check Environment Variables:**
   - Verify all required variables are set
   - See `/00_Shared/EnvMatrix.md` for complete list
   - Common missing variables:
     - `STRIPE_API_KEY` or `SQUARE_API_KEY`
     - `SENDGRID_API_KEY`
     - `GOOGLE_SHEETS_ID`

3. **Check Payment Gateway Status:**
   - Stripe: https://status.stripe.com
   - Square: https://status.squareup.com
   - If down, tests will fail

4. **Check API Keys:**
   - Verify keys are TEST keys (not production)
   - Stripe: Keys start with `sk_test_`
   - Square: Keys from "Sandbox" environment

5. **Read Detailed Troubleshooting:**
   - See [Troubleshooting.md](Troubleshooting.md) for specific error solutions

### Common Error Messages

**"No such customer"**
- Cause: Customer lookup failed
- Fix: Verify payment gateway credentials

**"Invalid API key"**
- Cause: Wrong or expired API key
- Fix: Update API key in n8n credentials

**"Amount must be at least $1.00"**
- Cause: Amount too low
- Fix: Use amount ≥ $1.00 with 2 decimal places

**"Email sending failed"**
- Cause: SendGrid API key or configuration issue
- Fix: Check SendGrid dashboard, verify sender email

**"Invoice already exists"**
- Cause: Duplicate invoice_reference
- Fix: Use a unique invoice_reference for each test

---

## Observability Checklist

After each test, verify:

**1. HTTP Response**
- [ ] Status code is correct (200 for success, 400/500 for errors)
- [ ] Response JSON is well-formed
- [ ] Contains expected fields (invoice_id, trace_id, etc.)

**2. Payment Gateway (Stripe/Square)**
- [ ] Invoice appears in dashboard
- [ ] Amount is correct
- [ ] Customer details are correct
- [ ] Status matches expectation (Open, Paid, etc.)

**3. Email Delivery**
- [ ] Email sent within 2 minutes
- [ ] Subject and body are correct
- [ ] Payment link works
- [ ] No broken images

**4. Google Sheets**
- [ ] Row added with all data
- [ ] PHI is masked
- [ ] Timestamp is accurate
- [ ] No missing columns

**5. n8n Execution Log**
- [ ] All nodes show green checkmarks (for successful tests)
- [ ] Error nodes show red X (for error tests)
- [ ] Execution time is reasonable (< 10 seconds for most tests)
- [ ] PHI is masked in logs

---

## Success Criteria

Your Module 04 testing is complete when:

- [ ] All 18 tests executed
- [ ] At least 16/18 tests pass (90%+)
- [ ] All P0 (Critical) tests pass
- [ ] At least 80% of P1 (High) tests pass
- [ ] Security test (SEC-001) passes
- [ ] No unmasked PHI found in logs or sheets
- [ ] Payment gateway integration works end-to-end
- [ ] Email delivery is functional
- [ ] Google Sheets logging is accurate

---

## Next Steps

After completing these tests:

1. **Document Results:**
   - Use [Checklist.md](Checklist.md) to track your progress
   - Note any failures or issues

2. **Review Failures:**
   - See [Troubleshooting.md](Troubleshooting.md) for solutions
   - Re-test after fixes

3. **Test Advanced Features:**
   - Refunds (if implemented)
   - Subscriptions (if implemented)
   - Multi-gateway switching

4. **Production Readiness:**
   - Switch to production API keys
   - Test with small real amounts
   - Monitor for 24 hours before full launch

---

## Additional Resources

- **Module 04 Key Points:** [KeyPoints.md](KeyPoints.md) - Quick reference
- **Test Cases Reference:** [TestCases.md](TestCases.md) - All test cases in table format
- **Observability Guide:** [Observability.md](Observability.md) - Where to look for results
- **Troubleshooting:** [Troubleshooting.md](Troubleshooting.md) - Problem solving
- **Mock Data:** `/MockData/` folder - Sample test data

---

**You're ready to test! Start with HP-001 and work through each test systematically. Good luck!**
