# Module 04: Billing & Payments - Observability Guide

**Module:** 04 - Billing & Payments
**Version:** 1.1.0-enhanced
**Last Updated:** 2025-10-31

---

## What is Observability?

**Observability** is the ability to understand what's happening inside your system by looking at its outputs.

**Think of it like this:**
You're a detective investigating whether a payment was processed correctly. You have multiple "witnesses" (data sources) to interview:
- The HTTP response (what the system told you)
- The payment gateway dashboard (Stripe/Square - where money moves)
- The email inbox (did the customer get notified?)
- The Google Sheets log (was it recorded?)
- The n8n execution log (what happened step-by-step?)

Each "witness" gives you a piece of the puzzle. **Good observability means checking ALL of them!**

---

## Why Observability Matters

### Real-World Scenarios

**Scenario 1: "The customer says they didn't receive their invoice"**
- ❌ **Without observability:** You have no idea what happened
- ✅ **With observability:**
  1. Check n8n execution log → invoice created ✓
  2. Check Stripe dashboard → invoice sent ✓
  3. Check SendGrid activity → email bounced (invalid address)
  4. **Root cause found:** Customer typo in email address

**Scenario 2: "Did we charge this patient twice?"**
- ❌ **Without observability:** Panic, manual checking, angry customer
- ✅ **With observability:**
  1. Check Google Sheets → only 1 row for invoice_reference
  2. Check Stripe → only 1 charge
  3. Check n8n log → idempotency check worked
  4. **Confident answer:** No duplicate charge

**Scenario 3: "Why are payments failing?"**
- ❌ **Without observability:** Total mystery
- ✅ **With observability:**
  1. Check n8n execution → error at "API: Create Invoice" node
  2. Read error message → "Invalid API key"
  3. Check credentials → API key expired
  4. **Fix:** Update API key, problem solved

**Observability turns mysteries into facts!**

---

## The Observability Stack for Module 04

When you run a billing test, you should check **FIVE places** to verify success:

1. **HTTP Response** - Immediate feedback (did the request succeed?)
2. **Payment Gateway Dashboard** - Source of truth (Stripe/Square - where money lives)
3. **Email Service** - Communication verification (did customer get notified?)
4. **Google Sheets** - Audit trail (is it logged for reporting?)
5. **n8n Execution Log** - Technical deep dive (what happened internally?)

**Rule of thumb:** If you only check ONE source, you're only 20% confident. Check all FIVE for 100% confidence!

---

## 1. HTTP Response (Immediate Feedback)

### What It Is
The JSON response you get immediately after sending your cURL request.

### Where to Find It
Right in your terminal window after running the cURL command.

### What to Look For

#### **Successful Invoice Creation:**
```json
{
  "status": "success",
  "message": "Invoice created and sent successfully",
  "invoice_id": "in_1ABC123...",
  "hosted_invoice_url": "https://invoice.stripe.com/i/acct_...",
  "trace_id": "PAY-1730390000000",
  "execution_time_ms": 4523
}
```

**Good signs:**
- ✅ `"status": "success"`
- ✅ `invoice_id` present (starts with `in_` for Stripe, `inv-` for Square)
- ✅ `hosted_invoice_url` provided (customer payment link)
- ✅ `trace_id` present (for tracking)
- ✅ `execution_time_ms` under 10,000 (10 seconds)

**Warning signs:**
- ⚠️ `execution_time_ms` over 10,000ms → performance issue
- ⚠️ `review_required: true` → high-value transaction flagged

#### **Failed Validation:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "patient_email: required and must be valid email format",
    "amount: minimum charge is $1"
  ],
  "validated_at": "2025-10-31T12:34:56.789Z"
}
```

**What this means:**
- Request was rejected before reaching payment gateway
- Check your input data
- Fix errors and retry

#### **Fraud Check Failed:**
```json
{
  "status": "error",
  "message": "Fraud check failed",
  "reason": "Disposable email domain detected",
  "risk_score": 50,
  "risk_level": "CRITICAL"
}
```

**What this means:**
- Fraud detection blocked the request
- Common causes: disposable email, suspicious amount, velocity abuse
- **This is working as designed!**

#### **System Error:**
```json
{
  "status": "error",
  "message": "Payment gateway API error",
  "error_details": "Invalid API key provided",
  "trace_id": "PAY-1730390000001"
}
```

**What this means:**
- Something broke internally
- Use `trace_id` to find the execution in n8n
- Check configuration (API keys, credentials)

### How to Interpret Results

| Status | HTTP Code | Meaning | Action |
|--------|-----------|---------|--------|
| success | 200 | Request processed successfully | Verify in other sources |
| error (validation) | 200/400 | Bad input data | Fix input and retry |
| error (fraud) | 200/403 | Fraud detected | Review risk score, may be intentional |
| error (system) | 500 | Internal failure | Check n8n logs, fix configuration |
| timeout | - | No response after 30s | Check n8n is running, check network |

---

## 2. Payment Gateway Dashboard (Source of Truth)

### What It Is
The Stripe or Square admin dashboard where all financial transactions are recorded.

### Where to Find It

**For Stripe:**
1. Go to: https://dashboard.stripe.com
2. **CRITICAL:** Verify you're in "TEST MODE" (toggle at top-left)
3. Navigate to:
   - **Customers:** Payments → Customers
   - **Invoices:** Payments → Invoices
   - **Payments:** Payments → All Payments

**For Square:**
1. Go to: https://developer.squareup.com
2. **CRITICAL:** Select "Sandbox" environment (dropdown top-right)
3. Navigate to:
   - **Customers:** Dashboard → Customers
   - **Invoices:** Dashboard → Invoices
   - **Payments:** Dashboard → Transactions

### What to Look For

#### **Customer Record**

**Stripe Customer:**
```
Name: Sarah Johnson
Email: sarah.johnson.test@example.com
Customer ID: cus_ABC123...
Created: Just now (within last minute)
Metadata:
  - patient_id: PT-2025-001
  - source: aigent_module_04
```

**Good signs:**
- ✅ Customer name matches your test data
- ✅ Email matches (exactly)
- ✅ Metadata includes `patient_id` for CRM linking
- ✅ Created timestamp is recent (within last 2 minutes)

**Warning signs:**
- ⚠️ Multiple customers with same email → duplicate creation issue
- ⚠️ Missing metadata → data enrichment not working

#### **Invoice Record**

**Stripe Invoice:**
```
Invoice Number: INV-2025-001 (from metadata)
Amount: $150.00 USD
Status: Open
Customer: Sarah Johnson (sarah.johnson.test@example.com)
Description: Initial consultation - 60 minutes
Created: Just now
Due: Upon receipt

Line Items:
  - Initial consultation - 60 minutes: $150.00

Payment Link: https://invoice.stripe.com/i/acct_...
```

**Good signs:**
- ✅ Amount matches exactly (including currency)
- ✅ Status is "Open" (for invoice_link mode) or "Paid" (for charge_now mode)
- ✅ Description matches service_description
- ✅ Invoice reference stored in metadata
- ✅ Payment link is accessible (click it to test)

**Warning signs:**
- ⚠️ Status "Draft" → invoice not finalized (workflow bug)
- ⚠️ Wrong amount → currency conversion issue or data error
- ⚠️ Missing line items → line item addition failed

#### **Payment Record (for charge_now mode)**

**Stripe Payment:**
```
Amount: $225.50 USD
Status: Succeeded
Customer: Michael Chen
Payment Method: Visa ending in 4242
Created: Just now
Receipt: https://pay.stripe.com/receipts/...
Description: Follow-up appointment + lab review
```

**Good signs:**
- ✅ Status "Succeeded" (payment completed)
- ✅ Amount matches exactly
- ✅ Receipt URL available
- ✅ Payment method shown (test card 4242)
- ✅ Customer charged successfully

**Warning signs:**
- ⚠️ Status "Failed" → payment declined (check card or error message)
- ⚠️ Status "Pending" → still processing (wait 30 seconds, refresh)
- ⚠️ Wrong amount → serious data error

### How to Interpret Results

**Invoice Statuses (Stripe):**

| Status | Meaning | What It Means |
|--------|---------|---------------|
| Draft | Not sent yet | Invoice created but not finalized (BUG if this happens) |
| Open | Awaiting payment | Customer can pay (GOOD for invoice_link mode) |
| Paid | Payment received | Customer paid successfully (GOOD) |
| Void | Cancelled | Invoice was cancelled |
| Uncollectible | Write-off | Invoice marked as uncollectible |

**Payment Statuses (Stripe):**

| Status | Meaning | What to Do |
|--------|---------|------------|
| Succeeded | Charged successfully | SUCCESS - nothing to do |
| Pending | Processing | Wait 30 seconds, refresh |
| Failed | Declined | Check error message, may be test card behavior |
| Refunded | Money returned | Refund processed |

---

## 3. Email Service (Communication Verification)

### What It Is
The email delivery service (SendGrid, Mailgun, etc.) that sends invoice and receipt emails to patients.

### Where to Find It

**For SendGrid:**
1. Go to: https://app.sendgrid.com
2. Navigate to: Activity
3. Filter by:
   - Email address (e.g., sarah.johnson.test@example.com)
   - Time range (last hour)
   - Status (Delivered, Bounced, etc.)

**For Mailgun:**
1. Go to: https://app.mailgun.com
2. Navigate to: Sending → Logs
3. Search for recipient email

### What to Look For

#### **Email Activity Record**

**SendGrid Activity:**
```
To: sarah.johnson.test@example.com
Subject: Invoice for Initial consultation - 60 minutes
Status: Delivered
Opens: 1
Clicks: 0
Sent: 2025-10-31 12:34:56 UTC
Event Details:
  - Processed: 12:34:56
  - Delivered: 12:35:02 (6 seconds later)
```

**Good signs:**
- ✅ Status "Delivered" (email reached inbox)
- ✅ Delivery time under 2 minutes
- ✅ Subject mentions invoice or payment
- ✅ No bounce or error

**Warning signs:**
- ⚠️ Status "Bounced" → invalid email address
- ⚠️ Status "Dropped" → spam filter or invalid sender
- ⚠️ Status "Deferred" → temporary delivery issue (will retry)
- ⚠️ Delivery time > 5 minutes → slow email service

#### **Email Content (Check Inbox)**

1. Open the test email inbox
2. Find the invoice email
3. Verify:

**Email Structure:**
```
From: Your Clinic Name <billing@yourclinic.com>
To: sarah.johnson.test@example.com
Subject: Invoice #INV-2025-001 - Initial consultation

Body:
  - Amount: $150.00
  - Description: Initial consultation - 60 minutes
  - [View and Pay Invoice] button/link
  - Footer with clinic contact info
```

**Good signs:**
- ✅ Amount displayed correctly ($150.00 USD)
- ✅ Payment link button is present
- ✅ Clicking link opens hosted invoice page
- ✅ No broken images or formatting
- ✅ Professional appearance

**Warning signs:**
- ⚠️ Link broken or leads to 404 → invoice URL issue
- ⚠️ Missing amount or wrong amount → template error
- ⚠️ Broken images → email template issue
- ⚠️ Ends up in spam folder → sender reputation issue

### Email Statuses Explained

| Status | Icon | Meaning | Action Required |
|--------|------|---------|-----------------|
| Delivered | ✅ | Email reached inbox | None - SUCCESS |
| Processed | ⏳ | Email sent, awaiting delivery | Wait 1-2 minutes |
| Bounced (Hard) | ❌ | Invalid email address | Check email typo |
| Bounced (Soft) | ⚠️ | Temporary issue (inbox full) | Retry later |
| Dropped | 🚫 | Spam filter or blacklist | Check sender reputation |
| Deferred | ⏸️ | Delayed, will retry | Wait, should deliver eventually |
| Opened | 👁️ | Recipient opened email | Engagement metric |
| Clicked | 🖱️ | Recipient clicked link | High engagement |

---

## 4. Google Sheets (Audit Trail)

### What It Is
The Google Sheets spreadsheet that logs all billing transactions for reporting and auditing.

### Where to Find It

1. Open Google Sheets
2. Find your "Payments" sheet (configured in environment variables)
3. Look at the last row (most recent entry)

### What to Look For

#### **Sheets Row Structure**

**Expected Columns:**

| Column | Example Value | Notes |
|--------|---------------|-------|
| Timestamp | 2025-10-31 12:34:56 | When invoice was created |
| Trace ID | PAY-1730390096000 | Unique identifier for tracking |
| Patient ID | PT-2025-001 | Links to CRM/EHR |
| Patient Email (Masked) | s***h@example.com | PHI protection |
| Patient Name (Masked) | S*** J*** | PHI protection |
| Amount | 150.00 | Payment amount (numeric) |
| Currency | USD | ISO currency code |
| Service Description | Initial consultation - 60 minutes | What was billed |
| Invoice Reference | INV-2025-001 | Idempotency key |
| Invoice ID | in_1ABC123... | Stripe/Square invoice ID |
| Billing Mode | invoice_link | invoice_link or charge_now |
| Payment Status | invoice_sent | Current status |
| Gateway | stripe | Payment gateway used |
| Charge ID | (empty or ch_1ABC...) | Populated if charge_now mode |
| Risk Score | 0 | Fraud risk score |
| Risk Level | LOW | Risk categorization |
| Execution Time (ms) | 4523 | Performance metric |

**Good signs:**
- ✅ Row appears within 5 seconds of sending request
- ✅ All columns populated (no blanks except Charge ID for invoice_link)
- ✅ Email is masked: `s***h@example.com` (PHI protection!)
- ✅ Name is masked: `S*** J***` (PHI protection!)
- ✅ Amount has 2 decimal places
- ✅ Trace ID matches HTTP response
- ✅ Timestamp is accurate (within 1 minute of now)

**Warning signs:**
- ⚠️ Email NOT masked → SECURITY BUG (PHI exposed!)
- ⚠️ Name NOT masked → SECURITY BUG (PHI exposed!)
- ⚠️ Missing row → Sheets integration broken
- ⚠️ Row appears but some columns empty → data mapping issue
- ⚠️ Wrong amount → serious data corruption
- ⚠️ Execution time > 10,000ms → performance problem

### PHI Masking Verification (CRITICAL!)

**What should be masked:**

| Field | Original | Masked | Status |
|-------|----------|--------|--------|
| Email | sarah.johnson.test@example.com | s***h@example.com | ✅ MUST be masked |
| Name | Sarah Johnson | S*** J*** | ✅ MUST be masked |
| Patient ID | PT-2025-001 | PT-2025-001 | ⚠️ Not PHI, can be visible |
| Amount | 150.00 | 150.00 | ⚠️ Not PHI, can be visible |

**If you see UNMASKED email or name in Google Sheets, this is a CRITICAL SECURITY FAILURE!**

---

## 5. n8n Execution Log (Technical Deep Dive)

### What It Is
The detailed step-by-step record of what happened inside the n8n workflow.

### Where to Find It

1. Open n8n in your browser
2. Click "Executions" in the left sidebar
3. Click on the most recent execution (top of the list)
4. You'll see a flowchart view of all nodes that ran

### What to Look For

#### **Execution Overview**

**Successful Execution:**
```
Status: Success (green checkmark)
Started: 2025-10-31 12:34:56
Duration: 4.5 seconds
Nodes Executed: 15/15
Mode: Production
```

**Good signs:**
- ✅ Status "Success" with green checkmark
- ✅ All nodes have green checkmarks (no red X)
- ✅ Duration under 10 seconds
- ✅ All expected nodes executed

**Warning signs:**
- ⚠️ Red X on any node → error occurred, click to see details
- ⚠️ Duration > 15 seconds → performance issue
- ⚠️ Some nodes skipped → conditional logic path (may be normal)

#### **Node-by-Node Verification**

Click on each node to see its input/output. Here's what to check:

**1. Webhook: Billing Payment Request**
```json
Input received:
{
  "body": {
    "patient_email": "sarah.johnson.test@example.com",
    "patient_name": "Sarah Johnson",
    "amount": "150.00",
    ...
  }
}
```
✅ **Verify:** All your test data is captured correctly

**2. Enhanced Validation**
```json
Output:
{
  "validation_passed": true,
  "validated_data": {
    "patient_email": "sarah.johnson.test@example.com",
    "amount": "150.00",
    "currency": "USD",
    ...
  }
}
```
✅ **Verify:** `validation_passed: true`
✅ **Verify:** Amount normalized to 2 decimals
❌ **If failed:** Check `errors` array for validation failures

**3. Fraud Detection & Velocity Checks**
```json
Output:
{
  "fraud_check_passed": true,
  "risk_score": 0,
  "risk_level": "LOW",
  "fraud_checks": [
    "INFO: No suspicious patterns detected"
  ]
}
```
✅ **Verify:** `fraud_check_passed: true`
✅ **Verify:** `risk_level: LOW` (for normal transactions)
⚠️ **If HIGH or CRITICAL:** Check `fraud_checks` array for reasons

**4. Idempotency Check**
```json
Output:
{
  "idempotency_check_passed": true,
  "duplicate_detected": false,
  "invoice_reference": "INV-2025-001"
}
```
✅ **Verify:** `duplicate_detected: false` (for new invoices)
⚠️ **If true:** Duplicate request detected (intentional protection)

**5. Prepare Billing Data**
```json
Output:
{
  "billing_data": {
    "trace_id": "PAY-1730390096000",
    "customer": {
      "email": "sarah.johnson.test@example.com",
      "name": "Sarah Johnson"
    },
    "invoice": {
      "amount": "150.00",
      "currency": "USD"
    }
  },
  "masked_data": {
    "customer_email_masked": "s***h@example.com",
    "customer_name_masked": "S*** J***"
  }
}
```
✅ **Verify:** `masked_data` shows properly masked PHI
✅ **Verify:** `trace_id` is generated
❌ **CRITICAL:** If `masked_data` doesn't mask properly → security bug!

**6. API: Lookup Customer**
```json
Response from Stripe:
{
  "data": [
    {
      "id": "cus_ABC123...",
      "email": "sarah.johnson.test@example.com",
      "name": "Sarah Johnson"
    }
  ]
}
```
✅ **If customer exists:** `data` array has 1 customer
✅ **If new customer:** `data` array is empty (will create new)

**7. API: Create Customer** (if needed)
```json
Response from Stripe:
{
  "id": "cus_ABC123...",
  "email": "sarah.johnson.test@example.com",
  "name": "Sarah Johnson",
  "metadata": {
    "patient_id": "PT-2025-001"
  }
}
```
✅ **Verify:** Customer `id` returned
✅ **Verify:** Metadata includes `patient_id`

**8. API: Create Invoice**
```json
Response from Stripe:
{
  "id": "in_1ABC123...",
  "amount_due": 15000,
  "currency": "usd",
  "status": "draft",
  "customer": "cus_ABC123..."
}
```
✅ **Verify:** Invoice `id` returned (starts with `in_`)
✅ **Verify:** `amount_due` is in cents (15000 = $150.00)
⚠️ **Note:** Status "draft" is normal (will be finalized next)

**9. API: Finalize Invoice**
```json
Response from Stripe:
{
  "id": "in_1ABC123...",
  "status": "open",
  "hosted_invoice_url": "https://invoice.stripe.com/i/acct_..."
}
```
✅ **Verify:** Status changed to "open"
✅ **Verify:** `hosted_invoice_url` is present

**10. Send Email** (if configured)
```json
Response from SendGrid:
{
  "statusCode": 202,
  "message": "Accepted"
}
```
✅ **Verify:** `statusCode: 202` (email accepted for delivery)

**11. Log to Google Sheets**
```json
Response from Google Sheets:
{
  "updatedRange": "Payments!A100:P100",
  "updatedRows": 1
}
```
✅ **Verify:** `updatedRows: 1` (row added successfully)

#### **Error Diagnosis**

If you see a red X on a node, click it and look for:

**Error Message:**
```json
{
  "message": "Invalid API key provided: sk_test_***",
  "type": "invalid_request_error",
  "code": "invalid_api_key"
}
```

**Common Errors:**

| Error Message | Cause | Fix |
|---------------|-------|-----|
| "Invalid API key" | Wrong or expired key | Update Stripe/Square credentials in n8n |
| "No such customer: cus_..." | Customer deleted | Check customer lookup logic |
| "Amount must be at least $1.00" | Amount too low | Validation should catch this (bug if reaches API) |
| "Rate limit exceeded" | Too many requests | Wait 1 minute, retry |
| "Customer not found" | Email mismatch | Check email format |
| "Email sending failed" | SendGrid issue | Check SendGrid API key, sender verification |
| "Sheets permission denied" | Google auth issue | Re-authenticate Google Sheets connection |

### Performance Metrics

**Execution Duration Breakdown:**

| Node/Step | Expected Time | Warning Threshold |
|-----------|---------------|-------------------|
| Validation | < 100ms | > 500ms |
| Fraud Detection | < 200ms | > 1s |
| Customer Lookup (API) | 500ms - 1.5s | > 3s |
| Create Customer (API) | 500ms - 1.5s | > 3s |
| Create Invoice (API) | 1s - 2s | > 5s |
| Finalize Invoice (API) | 1s - 2s | > 5s |
| Send Email | 500ms - 1.5s | > 3s |
| Log to Sheets | 500ms - 1s | > 3s |
| **Total** | **4s - 8s** | **> 15s** |

**If execution time > 15 seconds:**
- Check network latency
- Check payment gateway API status
- Check n8n server resources (CPU, memory)

---

## Observability Checklist (Use After Every Test)

After running a test, go through this checklist:

### Immediate Checks (within 10 seconds)

- [ ] **HTTP Response received** (not timeout)
- [ ] **Response status is "success"** (or expected error for invalid tests)
- [ ] **invoice_id or charge_id present** in response
- [ ] **trace_id present** for tracking

### Payment Gateway (within 1 minute)

- [ ] **Customer exists** in Stripe/Square dashboard
- [ ] **Invoice or payment visible** in dashboard
- [ ] **Amount matches exactly** (including currency)
- [ ] **Status is correct** (Open for invoices, Succeeded for charges)
- [ ] **Description matches** service_description

### Email (within 2 minutes)

- [ ] **Email shows "Delivered"** in SendGrid/Mailgun
- [ ] **Email received in inbox** (check spam if not)
- [ ] **Subject line appropriate** (mentions invoice/payment)
- [ ] **Payment link present** and functional
- [ ] **Amount displayed correctly**

### Google Sheets (within 5 seconds)

- [ ] **Row added to sheet**
- [ ] **All columns populated** (no blanks except charge_id for invoices)
- [ ] **Email MASKED** (e.g., s***h@example.com)
- [ ] **Name MASKED** (e.g., S*** J***)
- [ ] **Amount has 2 decimal places**
- [ ] **Trace ID matches HTTP response**

### n8n Execution Log (within 1 minute)

- [ ] **Execution shows "Success"** (green checkmark)
- [ ] **All nodes green** (no red errors)
- [ ] **PHI masked in "Prepare Billing Data" node**
- [ ] **Execution time under 10 seconds**
- [ ] **No error messages in any node**

---

## Common Observability Questions

**Q: The HTTP response says "success" but I don't see the invoice in Stripe. What's wrong?**

**A:** Check n8n execution log. Look for the "API: Create Invoice" node. If it's red, there was an error creating the invoice. The HTTP response might be returning success prematurely (before invoice creation). This is a workflow bug.

---

**Q: Email shows "Delivered" in SendGrid but patient didn't receive it. Why?**

**A:** Possible causes:
1. Email in spam folder (check there first!)
2. Email address typo (verify in Stripe customer record)
3. Recipient's email server delayed delivery (wait 10 minutes)
4. Corporate email filter blocked it (ask IT to whitelist)

---

**Q: Google Sheets row is added but email is NOT masked. Is this critical?**

**A:** **YES! This is a CRITICAL SECURITY BUG!** PHI (email addresses) must ALWAYS be masked in logs. Check the "Prepare Billing Data" node in n8n — the masking function may not be working.

---

**Q: n8n execution shows success but response time was 18 seconds. Is this a problem?**

**A:** Yes, this is a performance issue. Acceptable response time is under 10 seconds. Check:
- Stripe API latency (check status.stripe.com)
- n8n server resources (CPU/memory)
- Network connectivity

---

**Q: I see two invoices in Stripe for the same invoice_reference. How did this happen?**

**A:** The idempotency check failed. This should NEVER happen and indicates a serious bug. Check:
- Idempotency Check node in n8n
- Whether `ENABLE_IDEMPOTENCY_CHECK` is set to `true`
- Database/cache for idempotency tracking

---

**Q: Invoice shows "Draft" status in Stripe instead of "Open". What's wrong?**

**A:** The "Finalize Invoice" node either didn't run or failed. Check n8n execution log:
- Did "Finalize Invoice" node execute?
- Is there a red error on that node?
- Check conditional logic — maybe it was skipped by mistake

---

## Pro Tips for Monitoring

### 1. Use Trace IDs Everywhere

The `trace_id` (e.g., `PAY-1730390096000`) is your golden thread. Use it to correlate:
- HTTP response
- n8n execution (search by trace_id)
- Google Sheets row
- Audit logs (Module 09)

**Pro tip:** When reporting bugs, always include the `trace_id`!

### 2. Set Up Alerts

Configure alerts for:
- Fraud risk score > 30 (medium/high risk)
- Execution time > 10 seconds (performance degradation)
- Email bounces (delivery failures)
- API errors (Stripe/Square issues)

### 3. Monitor Trends

Track over time:
- Average execution time (should stay under 8s)
- Email delivery rate (should be > 95%)
- Fraud detection rate (false positives?)
- Payment success rate (should be > 98% in test mode)

### 4. Regular Health Checks

Daily:
- [ ] Check last 10 executions in n8n (all green?)
- [ ] Spot-check Google Sheets (PHI still masked?)
- [ ] Verify payment gateway connection (test mode active?)

Weekly:
- [ ] Review SendGrid activity (any blacklist warnings?)
- [ ] Check Stripe logs for unusual errors
- [ ] Audit PHI masking (no leaks?)

---

## Observability Best Practices

### DO:
✅ Check ALL five observability sources for critical transactions
✅ Use trace_id to correlate across systems
✅ Verify PHI masking EVERY time (security!)
✅ Monitor execution times (performance matters)
✅ Set up alerts for anomalies
✅ Keep logs for at least 30 days (compliance)

### DON'T:
❌ Trust only the HTTP response (incomplete picture)
❌ Ignore long execution times (performance degrades over time)
❌ Skip email delivery verification (customers won't tell you until it's urgent)
❌ Assume PHI is always masked (verify regularly!)
❌ Delete logs immediately (you might need them for debugging)

---

## Observability Tools Reference

| Tool | Purpose | URL |
|------|---------|-----|
| Stripe Dashboard | Payment gateway truth | https://dashboard.stripe.com |
| Square Dashboard | Payment gateway truth | https://developer.squareup.com |
| SendGrid Activity | Email delivery status | https://app.sendgrid.com |
| Google Sheets | Audit trail | https://sheets.google.com |
| n8n Executions | Technical workflow log | http://your-n8n-instance/executions |

---

**Observability is your safety net. Use it every time!**
