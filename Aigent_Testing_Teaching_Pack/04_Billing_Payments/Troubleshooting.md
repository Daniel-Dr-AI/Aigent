# Module 04: Billing & Payments - Troubleshooting Guide

**Module:** 04 - Billing & Payments
**Version:** 1.1.0-enhanced
**Last Updated:** 2025-10-31
**For:** Complete beginners

---

## How to Use This Guide

**When to use this:**
- A payment test failed and you don't know why
- You got an error message you don't understand
- Invoices aren't being created in Stripe/Square
- Emails aren't being sent to patients
- Results are inconsistent or slow

**How to use this:**
1. Find your symptom in the Table of Contents
2. Read the likely causes
3. Try each solution step by step
4. Check if the problem is fixed
5. If not fixed, try the next solution

**Still stuck?** Use the Bug Report Template (`/00_Shared/BugReport_Template.md`)

---

## Table of Contents

1. [Webhook & API Connection Issues](#webhook--api-connection-issues)
2. [Validation Errors](#validation-errors)
3. [Payment Gateway API Errors](#payment-gateway-api-errors)
4. [Customer Creation Failures](#customer-creation-failures)
5. [Invoice Creation Failures](#invoice-creation-failures)
6. [Email Delivery Problems](#email-delivery-problems)
7. [Google Sheets Integration Issues](#google-sheets-integration-issues)
8. [Authentication & Credentials Problems](#authentication--credentials-problems)
9. [Amount & Currency Issues](#amount--currency-issues)
10. [Duplicate Invoice Detection Issues](#duplicate-invoice-detection-issues)
11. [Fraud Detection False Positives](#fraud-detection-false-positives)
12. [Performance & Timeout Issues](#performance--timeout-issues)
13. [PHI Masking Failures](#phi-masking-failures-security-critical)
14. [Idempotency Issues](#idempotency-issues)
15. [Environment Variable Configuration](#environment-variable-configuration)

---

## Webhook & API Connection Issues

### Problem: "404 Not Found" when submitting payment request

**Symptom:**
```
curl: (22) The requested URL returned error: 404
```

**Likely causes:**
1. Workflow is not active
2. Wrong webhook URL
3. Webhook path changed
4. n8n server is down

**Solutions:**

**Solution 1: Activate the workflow**
1. Open n8n
2. Go to Workflows
3. Find "Aigent_Module_04: Billing & Payments Enhanced (v1.1)"
4. Toggle switch at top-right to ON (should turn blue/green)
5. Try your test again

**Solution 2: Verify webhook URL**
1. Open the workflow in n8n
2. Click on "Webhook: Billing Payment Request" node (first node)
3. Copy the "Production URL" shown
4. Use that exact URL in your cURL command
5. Common mistake: Using test URL instead of production URL

**Solution 3: Check webhook path**
1. Verify `WEBHOOK_ID` environment variable
2. URL should match: `https://your-n8n.com/webhook/billing-payment`
3. If `WEBHOOK_ID` is empty, n8n generates a random one
4. Check the webhook node to see the actual path

---

### Problem: "CORS error" when testing from browser

**Symptom:**
```
Access to fetch has been blocked by CORS policy
```

**What this means:**
Your website is trying to send payment data to the webhook, but the webhook is blocking it for security reasons.

**Likely cause:**
`ALLOWED_ORIGINS` environment variable doesn't include your website domain

**Solution:**
1. Check current `ALLOWED_ORIGINS` value
2. Add your website domain:
   ```
   ALLOWED_ORIGINS=https://yourwebsite.com,https://www.yourwebsite.com
   ```
3. For testing, you can temporarily use:
   ```
   ALLOWED_ORIGINS=*
   ```
   (This allows ANY website — only use for testing!)
4. Restart workflow after changing environment variables

---

### Problem: Webhook times out after 30-60 seconds

**Symptom:**
```
Error: Request timeout after 60000ms
```

**Likely causes:**
1. Stripe/Square API is very slow
2. Email service (SendGrid) is slow or down
3. Network connectivity issues
4. Workflow timeout setting too low

**Solution 1: Increase timeout**
1. Set `WORKFLOW_TIMEOUT_MS=120000` (2 minutes)
2. Restart workflow
3. Try test again

**Solution 2: Check external API status**
1. Stripe: status.stripe.com
2. Square: status.squareup.com
3. SendGrid: status.sendgrid.com
4. If any show outages, wait and retry later

**Solution 3: Check which step is slow**
1. Open execution in n8n
2. Look at execution time for each node
3. Find the slowest node
4. Common slow nodes:
   - Stripe API calls: 500-2000ms (normal)
   - Email sending: 500-1500ms (normal)
   - Google Sheets: 500-1000ms (normal)
   - If any node > 5000ms, that's the problem

---

## Validation Errors

### Problem: "patient_email is required" but I sent an email!

**Symptom:**
```json
{
  "status": "error",
  "errors": ["patient_email: required and must be valid email format"]
}
```

**Likely causes:**
1. Field name is wrong (case-sensitive!)
2. Email is in nested object
3. JSON formatting error

**Solutions:**

**Solution 1: Check field name (case matters!)**
```json
❌ WRONG: {"Patient_Email": "test@example.com"}
✅ RIGHT: {"patient_email": "test@example.com"}

❌ WRONG: {"email": "test@example.com"}  (missing "patient_")
✅ RIGHT: {"patient_email": "test@example.com"}
```

**Solution 2: Make sure email is at top level**
```json
❌ WRONG:
{
  "patient": {
    "email": "test@example.com"
  }
}

✅ RIGHT:
{
  "patient_email": "test@example.com"
}
```

**Solution 3: Check JSON formatting**
- Use a JSON validator: jsonlint.com
- Common mistakes:
  - Missing comma between fields
  - Missing quotes around strings
  - Trailing comma after last field

---

### Problem: "invalid email format" for a valid email

**Symptom:**
```json
{
  "status": "error",
  "errors": ["patient_email: required and must be valid email format"]
}
```

**Your email looks valid but gets rejected**

**Common causes:**

**1. Extra spaces**
```json
❌ WRONG: "patient_email": " test@example.com"  (space before)
❌ WRONG: "patient_email": "test@example.com "  (space after)
✅ RIGHT: "patient_email": "test@example.com"
```

**2. International domain without proper encoding**
```json
❌ WRONG: "test@cañón.com"  (special chars in domain)
✅ RIGHT: "test@xn--caon-8na.com"  (punycode encoding)
```

**3. Missing TLD**
```json
❌ WRONG: "test@company"
✅ RIGHT: "test@company.com"
```

**Solution:** Copy/paste the email exactly from test data to avoid typos

---

### Problem: "amount: minimum charge is $1" error

**Symptom:**
```json
{
  "errors": ["amount: minimum charge is $1"]
}
```

**Your amount:** `0.50` (50 cents)

**Cause:** Amount is below the minimum payment threshold

**Solution:**
1. Check `MIN_PAYMENT_AMOUNT` environment variable (default: $1.00)
2. Use an amount >= the minimum:
   - ✅ `"amount": "1.00"` (minimum)
   - ✅ `"amount": "150.00"` (typical)
   - ❌ `"amount": "0.50"` (below minimum)
3. Always use 2 decimal places: `"150.00"` not `"150"`

---

### Problem: "amount: maximum charge is $100000" error

**Symptom:**
```json
{
  "errors": ["amount: maximum charge is $100000 (fraud protection)"]
}
```

**Your amount:** `999999.00` (nearly $1 million)

**Cause:** Amount exceeds fraud protection maximum

**Solution:**
1. Check `MAX_PAYMENT_AMOUNT` environment variable (default: $100,000)
2. If this is a legitimate high-value transaction:
   - Increase `MAX_PAYMENT_AMOUNT` in environment variables
   - Restart workflow
3. If testing, use a realistic amount:
   - ✅ `"amount": "5000.00"` (high but reasonable)
   - ❌ `"amount": "999999.00"` (triggers fraud protection)

---

## Payment Gateway API Errors

### Problem: "No such customer" error from Stripe/Square

**Symptom:**
```
Error: No such customer: cus_ABC123
```

**Likely causes:**
1. Customer ID is wrong
2. Customer was deleted from Stripe/Square
3. Using TEST mode key but customer is in LIVE mode (or vice versa)

**Solutions:**

**Solution 1: Let the workflow create the customer**
1. Remove `customer_id` from your test data
2. Provide `patient_email` and `patient_name` instead
3. Workflow will automatically:
   - Look up customer by email
   - Create new customer if doesn't exist

**Solution 2: Verify test mode matches**
1. Check your Stripe/Square dashboard
2. Look for "TEST MODE" indicator (top-left in Stripe)
3. Verify API key in n8n starts with `sk_test_` (Stripe) or is from Sandbox (Square)
4. If customer exists in LIVE mode, it won't be found in TEST mode

**Solution 3: Create customer first**
1. Go to Stripe/Square dashboard
2. Manually create a test customer with the email
3. Note the customer ID
4. Use that ID in your test (or let workflow look up by email)

---

### Problem: "Invalid API key provided" error

**Symptom:**
```
Error: Invalid API key provided: sk_test_***
```

**Likely causes:**
1. API key is wrong or expired
2. API key is for wrong environment (TEST vs LIVE)
3. API key not set in n8n credentials

**Solutions:**

**Solution 1: Verify API key in Stripe/Square dashboard**

**For Stripe:**
1. Log into Stripe Dashboard
2. Click "Developers" (top-right)
3. Click "API keys"
4. Verify you're in TEST mode (toggle at top)
5. Copy "Secret key" (starts with `sk_test_`)
6. Paste into n8n credential

**For Square:**
1. Log into Square Developer Dashboard
2. Select "Sandbox" environment
3. Go to Credentials
4. Copy "Sandbox Access Token"
5. Paste into n8n credential

**Solution 2: Update credential in n8n**
1. Go to n8n → Credentials
2. Find your Stripe/Square credential
3. Click "Edit"
4. Update API key
5. Click "Save"
6. Test the credential (click "Test" button)

**Solution 3: Check environment variable**
1. Verify `STRIPE_API_KEY` or `SQUARE_API_KEY` is set
2. Should start with `sk_test_` (Stripe) or be from Sandbox (Square)
3. Restart n8n after changing environment variables

---

### Problem: "Your card was declined" error

**Symptom:**
```
Error: Your card was declined
```

**Likely causes:**
1. Using a test card that simulates decline
2. In LIVE mode with real card (NEVER test in LIVE mode!)
3. Insufficient funds on test card

**Solutions:**

**Solution 1: Use success test card**

**For Stripe:**
```json
"payment_method_id": "pm_card_visa"
```

Or for Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002 (intentionally fails)
- Insufficient funds: 4000 0000 0000 9995 (intentionally fails)

**Use the SUCCESS card (4242...) for happy path tests!**

**For Square:**
- See: https://developer.squareup.com/docs/testing/test-values
- Use Square-provided test card numbers

**Solution 2: Verify you're in TEST mode**
1. Check Stripe/Square dashboard for "TEST MODE" indicator
2. NEVER use real credit cards for testing
3. API key should be TEST key: `sk_test_...`

---

### Problem: "Rate limit exceeded" error

**Symptom:**
```
Error: You have exceeded your rate limit. Please wait and try again.
```

**Cause:** Too many API calls to Stripe/Square in a short time

**Solution:**
1. Wait 1 minute before retrying
2. Reduce `CRM_RETRY_COUNT` environment variable:
   ```
   CRM_RETRY_COUNT=2  (instead of 3)
   ```
3. Slow down your testing (don't run 10 tests in 10 seconds)
4. Check Stripe/Square rate limits:
   - Stripe: 100 requests/second (very high, rarely hit)
   - Square: Varies by endpoint

---

## Customer Creation Failures

### Problem: Customer created but with wrong email

**Symptom:**
Customer appears in Stripe/Square but email doesn't match what you sent

**Likely causes:**
1. Email was masked (PHI masking) before sending to Stripe (BUG!)
2. Using wrong field name
3. Data transformation error in workflow

**Solutions:**

**Solution 1: Check PHI masking node placement**
1. Open workflow in n8n
2. Find "Prepare Billing Data (with PHI masking)" node
3. This node should mask data ONLY for logs, not for Stripe API calls
4. Check execution log to see what was sent to Stripe
5. If email is masked in Stripe API call, this is a bug — report it!

**Solution 2: Verify field mapping**
1. Open "API: Create/Lookup Customer" node
2. Check email field mapping
3. Should map to: `{{$json.patient_email}}`
4. NOT: `{{$json.masked_email}}`

**Solution 3: Check execution log**
1. Go to n8n → Executions
2. Click the execution
3. Click "API: Create/Lookup Customer" node
4. Look at INPUT data (what was sent to Stripe)
5. Email should be FULL email, not masked

---

### Problem: Duplicate customers being created

**Symptom:**
Same patient has multiple customer records in Stripe/Square

**Likely causes:**
1. Email address is slightly different (case, spaces, typos)
2. Customer lookup logic not working
3. Creating customer instead of looking up existing

**Solutions:**

**Solution 1: Check customer lookup logic**
1. Workflow should first SEARCH for existing customer by email
2. Only CREATE if not found
3. Open "API: Create/Lookup Customer" node in workflow
4. Verify it searches by email first

**Solution 2: Use consistent email addresses**
```json
❌ PROBLEM:
Test 1: "Alice@Example.com"
Test 2: "alice@example.com"
Test 3: "alice@example.com " (trailing space)
(Creates 3 customers!)

✅ SOLUTION:
Always use: "alice@example.com" (lowercase, no spaces)
```

**Solution 3: Manually merge duplicates in dashboard**
1. Go to Stripe/Square dashboard
2. Find duplicate customers
3. Merge or delete duplicates manually
4. Fix the root cause (email consistency)

---

## Invoice Creation Failures

### Problem: "Invoice already exists" error

**Symptom:**
```json
{
  "status": "error",
  "message": "Invoice already exists"
}
```

**Cause:** You're using the same `invoice_reference` twice (this is IDEMPOTENCY working correctly!)

**Solution:**
1. Use a unique `invoice_reference` for each test:
   ```json
   Test 1: "invoice_reference": "INV-2025-001"
   Test 2: "invoice_reference": "INV-2025-002"
   Test 3: "invoice_reference": "INV-2025-003"
   ```
2. This is NOT a bug — it's preventing duplicate charges!
3. If you intentionally want to test idempotency, run same request twice and verify second is rejected

---

### Problem: Invoice created but missing line items (Stripe)

**Symptom:**
Invoice appears in Stripe but has no line items (shows $0.00)

**Likely causes:**
1. "Add Line Item" node failed
2. Amount not passed correctly
3. Service description missing

**Solutions:**

**Solution 1: Check "Add Line Item" node execution**
1. Go to n8n → Executions
2. Click the execution
3. Find "API: Add Line Item (Stripe only)" node
4. Check if it has a green checkmark (success) or red X (failure)
5. If red X, click it to see error message

**Solution 2: Verify amount is passed**
1. Check "Add Line Item" node input
2. Amount should be in CENTS for Stripe:
   - $150.00 = 15000 cents
3. Check conversion logic in workflow

**Solution 3: Verify service_description**
1. Line item needs a description
2. Check that `service_description` field is provided in request
3. Look at "Add Line Item" node to see what description was sent

---

### Problem: Invoice created but not finalized

**Symptom:**
Invoice appears in Stripe but status is "Draft" instead of "Open"

**Likely cause:**
"Finalize Invoice" node failed or didn't execute

**Solution:**
1. Open execution in n8n
2. Find "API: Finalize Invoice" node
3. Check if it executed (green checkmark)
4. If it failed:
   - Click to see error message
   - Common issue: Invoice has $0.00 (must have amount > $0)
5. If it didn't execute:
   - Check conditional logic before this node
   - May be skipped for certain billing modes

---

## Email Delivery Problems

### Problem: No email sent to patient

**Symptom:**
- Invoice created in Stripe ✅
- HTTP response shows success ✅
- But patient doesn't receive email ❌

**Solutions:**

**Solution 1: Verify SendGrid API key**
1. Check `SENDGRID_API_KEY` environment variable is set
2. Test the key independently:
   ```bash
   curl -X POST https://api.sendgrid.com/v3/mail/send \
     -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"billing@yourcompany.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
   ```
3. If you get error, API key is invalid or expired

**Solution 2: Check sender email is verified**
1. Log into SendGrid dashboard
2. Go to Settings → Sender Authentication
3. Verify your sender email (e.g., billing@yourcompany.com) is verified
4. If not verified, SendGrid won't send emails

**Solution 3: Check spam folder**
1. Look in patient's spam/junk folder
2. Test emails often go to spam
3. For production, set up proper SPF/DKIM records

**Solution 4: Check n8n execution log**
1. Go to n8n → Executions
2. Click the execution
3. Find "API: Send Email" node
4. Check if it executed successfully
5. If failed, read error message
6. Common errors:
   - `401 Unauthorized` → Invalid API key
   - `403 Forbidden` → Sender not verified
   - `400 Bad Request` → Malformed email data

**Solution 5: Verify email is not masked**
1. Email should be FULL address when sent to SendGrid
2. PHI masking should ONLY apply to logs, not actual email sending
3. Check execution log to see what email address was used

---

### Problem: Email sent but patient doesn't receive it

**Symptom:**
- SendGrid shows email as "Delivered"
- But patient didn't receive it

**Solutions:**

**Solution 1: Check email address is correct**
1. Verify patient email in test data
2. Common mistake: Typo in email address
3. Check SendGrid Activity to see what address it was sent to

**Solution 2: Check spam filters**
1. Ask patient to check spam/junk folder
2. In SendGrid Activity, check for "Spam Report" events
3. Whitelist sender email

**Solution 3: Check email service provider**
1. Some corporate email servers block test emails
2. Try sending to a different email address (Gmail, Outlook, etc.)

---

### Problem: Email sent but looks broken (formatting issues)

**Symptom:**
Email arrives but images don't load, or layout is broken

**Solutions:**

**Solution 1: Check email template**
1. Open "API: Send Email" node in workflow
2. Check HTML template
3. Verify all image URLs are absolute (not relative)
4. Test template using SendGrid's "Send Test Email" feature

**Solution 2: Verify payment link**
1. Check that `{{hosted_invoice_url}}` variable is populated
2. Should be a full URL from Stripe/Square
3. Click the link to verify it works

---

## Google Sheets Integration Issues

### Problem: No row appears in Google Sheets

**Symptom:**
- HTTP response shows success
- Invoice created in Stripe
- But no row in Google Sheets

**Solutions:**

**Solution 1: Verify sheet ID and tab name**
1. Check `GOOGLE_SHEETS_ID` in environment variables
2. Open that sheet in browser
3. Verify tab name matches `GOOGLE_SHEET_TAB` (default: "Payments")
4. Tab names are case-sensitive!

**Solution 2: Check Google Sheets credential**
1. In n8n, go to Credentials
2. Find your Google Sheets credential
3. Click "Test" button
4. If it fails, reconnect:
   - Click "Reconnect"
   - Sign in with Google
   - Grant permissions
   - Save credential

**Solution 3: Check sheet permissions**
1. Open Google Sheet
2. Click "Share" button
3. Verify the Google account used in n8n credential has Editor access
4. If using service account, add service account email with Editor permission

**Solution 4: Check for sheet protection**
1. In Google Sheets, go to Data → Protected sheets and ranges
2. If the sheet is protected, either:
   - Remove protection, OR
   - Add the n8n service account to allowed editors

**Solution 5: Review n8n execution log**
1. Go to n8n → Executions
2. Find the execution
3. Click on "Google Sheets" node
4. Read the error message
5. Common errors:
   - `401 Unauthorized` → Reconnect credential
   - `404 Not Found` → Wrong sheet ID
   - `403 Forbidden` → No write permission

---

### Problem: Wrong data in Google Sheets

**Symptom:**
Row exists but data doesn't match what you sent

**Check these:**

**1. Email masking (expected!)**
- You sent: `alice.anderson.test@example.com`
- Sheets shows: `a***n@example.com`
- This is CORRECT — PHI masking is working!

**2. Name masking (expected!)**
- You sent: `name: "Alice Anderson"`
- Sheets shows: `A*** A***`
- This is CORRECT — PHI masking is working!

**3. Amount formatting**
- You sent: `"amount": "150.00"`
- Sheets shows: `150` (without decimals)
- Fix: Format column as "Number" with 2 decimal places in Google Sheets

**4. Missing optional fields**
- You didn't send: `patient_id`
- Sheets shows: empty cell
- This is CORRECT — optional fields can be empty!

**If data is genuinely wrong:**
1. Check the webhook INPUT in n8n execution log
2. Trace data through each node
3. Find where transformation occurs
4. Report as a bug (see BugReport_Template.md)

---

## Authentication & Credentials Problems

### Problem: "Invalid credentials" error for Stripe/Square

**Symptom:**
```
Error: Invalid credentials (Stripe)
```

**Solutions:**

**Solution 1: Verify API key is TEST key**

**For Stripe:**
1. API key MUST start with `sk_test_` (not `sk_live_`)
2. Check Stripe dashboard shows "TEST MODE" badge
3. Never test with live keys!

**For Square:**
1. API key must be from "Sandbox" environment (not "Production")
2. Check Square dashboard shows "Sandbox" in environment switcher

**Solution 2: Reconnect credential in n8n**
1. n8n → Credentials
2. Find Stripe/Square credential
3. Click "Edit"
4. Update API key
5. Click "Test" button to verify
6. Save credential

**Solution 3: Check credential is selected in workflow**
1. Open workflow
2. Click on Stripe/Square API nodes
3. Verify "Credential to connect with" field is set
4. Should show your credential name
5. If blank, select it from dropdown

---

### Problem: "Invalid credentials" for SendGrid

**Symptom:**
```
Error: Invalid API key (SendGrid)
```

**Solutions:**

**Solution 1: Verify SendGrid API key**
1. Log into SendGrid dashboard
2. Go to Settings → API Keys
3. Verify your API key exists and has "Full Access" permissions
4. If expired or deleted, create new one
5. Update in n8n credentials

**Solution 2: Check API key starts with "SG."**
1. SendGrid API keys always start with `SG.`
2. If your key doesn't, it's wrong
3. Copy the full key (including `SG.` prefix)

---

## Amount & Currency Issues

### Problem: Amount shows as cents instead of dollars

**Symptom:**
You sent `"amount": "150.00"` but invoice shows $15,000.00

**Cause:** Amount was already in cents, but workflow converted to cents again

**Solution:**
1. Always send amount as dollars with decimal point:
   - ✅ `"amount": "150.00"` (dollars)
   - ❌ `"amount": "15000"` (cents)
2. Workflow handles conversion to cents for Stripe API
3. Check "Prepare Billing Data" node to see conversion logic

---

### Problem: "Unsupported currency" error

**Symptom:**
```json
{
  "errors": ["currency: must be one of USD, CAD, EUR, GBP, AUD"]
}
```

**Cause:** You're using a currency that's not configured

**Solutions:**

**Solution 1: Use supported currency**
1. Check `SUPPORTED_CURRENCIES` environment variable
2. Default: USD, CAD, EUR, GBP, AUD
3. Use one of these currencies

**Solution 2: Add currency to supported list**
1. Update `SUPPORTED_CURRENCIES` environment variable:
   ```
   SUPPORTED_CURRENCIES=USD,CAD,EUR,GBP,AUD,NZD,JPY
   ```
2. Restart workflow
3. Verify Stripe/Square supports the currency

**Solution 3: Check Stripe account supports currency**
1. Not all Stripe accounts support all currencies
2. Log into Stripe → Settings → Payment methods
3. Verify the currency is enabled
4. You may need to enable it in Stripe settings first

---

## Duplicate Invoice Detection Issues

### Problem: Duplicate invoices NOT being detected

**Symptom:**
You sent the same request twice with same `invoice_reference`, but TWO invoices were created

**THIS IS A CRITICAL BUG!**

**Solutions:**

**Solution 1: Verify idempotency is enabled**
1. Check `ENABLE_IDEMPOTENCY_CHECK` environment variable
2. Should be set to `true`
3. If `false`, idempotency is disabled (not recommended!)

**Solution 2: Check idempotency logic in workflow**
1. Open workflow in n8n
2. Find "Check for Duplicate Invoice" node
3. Verify it runs BEFORE invoice creation
4. Check execution log to see if this node executed

**Solution 3: Check invoice_reference is unique**
1. Idempotency uses `invoice_reference` as key
2. Each request must have `invoice_reference` field
3. If missing, idempotency can't work

**Solution 4: Check idempotency window**
1. Default window: 24 hours
2. After 24 hours, same invoice_reference is allowed (for recurring billing)
3. If testing beyond 24 hours, use new invoice_reference

---

### Problem: Legitimate invoice rejected as duplicate

**Symptom:**
You sent a NEW invoice but got "Invoice already exists" error

**Cause:** You accidentally used the same `invoice_reference` as a previous invoice

**Solution:**
1. Use a unique `invoice_reference` for each invoice:
   ```
   INV-2025-001
   INV-2025-002
   INV-2025-003
   ```
2. Or use timestamp-based references:
   ```
   INV-20251031-120000
   INV-20251031-120100
   ```
3. This is NOT a bug — idempotency is working correctly!

---

## Fraud Detection False Positives

### Problem: Legitimate email blocked as "disposable"

**Symptom:**
```json
{
  "message": "Fraud check failed",
  "reason": "Disposable email domain detected"
}
```

**But the email is legitimate!**

**Solutions:**

**Solution 1: Check disposable domain list**
1. Workflow has a list of known disposable email domains
2. Examples: tempmail.com, guerrillamail.com, 10minutemail.com
3. If patient's email domain is on this list by mistake, update the list

**Solution 2: Whitelist specific domains**
1. Add `FRAUD_WHITELIST_DOMAINS` environment variable:
   ```
   FRAUD_WHITELIST_DOMAINS=yourlegitdomain.com,anotherdomain.com
   ```
2. These domains will bypass fraud checks

**Solution 3: Disable fraud detection (not recommended)**
1. Set `ENABLE_FRAUD_DETECTION=false`
2. Only do this if fraud detection causes more problems than it solves
3. Monitor for actual fraud attempts

---

### Problem: High-value transaction flagged incorrectly

**Symptom:**
```json
{
  "review_required": true,
  "reason": "High-value transaction"
}
```

**But this is a normal transaction for your clinic**

**Solution:**
1. Adjust `HIGH_VALUE_THRESHOLD` environment variable
2. Default: $5,000
3. If your clinic regularly processes $10,000 procedures:
   ```
   HIGH_VALUE_THRESHOLD=15000
   ```
4. Restart workflow

---

## Performance & Timeout Issues

### Problem: Execution takes > 10 seconds

**Symptom:**
`execution_time_ms: 15000` or higher

**Target:** < 8000ms (8 seconds)

**Likely causes:**
1. Stripe/Square API is slow
2. Email service is slow
3. Network latency
4. Multiple retries happening

**Solutions:**

**Solution 1: Check individual node times**
1. Open execution in n8n
2. Look at execution time for each node
3. Find the slowest node
4. Common slow nodes:
   - Stripe API: 1000-3000ms (normal)
   - SendGrid: 500-1500ms (normal)
   - Google Sheets: 500-1000ms (normal)
   - If any node > 5000ms, that's the problem

**Solution 2: Reduce retry attempts**
```
PAYMENT_RETRY_COUNT=1  (instead of 3)
EMAIL_RETRY_COUNT=1  (instead of 2)
```
Fewer retries = faster failures

**Solution 3: Check network**
1. Test internet speed: fast.com
2. If slow (<10 Mbps), network is the bottleneck
3. Try from different network/location

**Solution 4: Check external API status**
1. Stripe: status.stripe.com
2. Square: status.squareup.com
3. SendGrid: status.sendgrid.com
4. If any show outages, performance will suffer

---

### Problem: Workflow times out completely

**Symptom:**
```
Execution timed out after 120000ms
```

**Solution:**
1. Increase timeout:
   ```
   WORKFLOW_TIMEOUT_MS=300000  (5 minutes)
   ```
2. Restart workflow
3. This is a band-aid — investigate why it's so slow!
4. See "Execution takes > 10 seconds" above

---

## PHI Masking Failures (Security Critical)

### Problem: Full email visible in Google Sheets

**Symptom:**
Google Sheets shows `alice.anderson.test@example.com` instead of `a***n@example.com`

**THIS IS A CRITICAL SECURITY ISSUE!**

**Solution:**

**1. Verify PHI masking is enabled**
```
ENABLE_PHI_MASKING=true
```

**2. Check the masking node**
1. Open workflow in n8n
2. Find node "Prepare Billing Data (with PHI masking)"
3. Verify it runs BEFORE Google Sheets node
4. Check the masking logic is correct

**3. Check execution log**
1. Open execution in n8n
2. Click "Prepare Billing Data" node
3. Look at OUTPUT
4. Email should be masked: `a***n@example.com`
5. If not masked, masking logic is broken (critical bug!)

**4. If in production, STOP IMMEDIATELY**
1. Disable the workflow
2. Delete any sheets rows with exposed PHI
3. Report as critical security incident
4. Do NOT re-enable until masking is confirmed working

---

### Problem: Full name visible in logs

**Symptom:**
n8n execution log shows "Alice Anderson" instead of "A*** A***"

**THIS IS A HIPAA VIOLATION!**

**Solution:**
Same as above — verify PHI masking node is working and runs before any logging

---

### Problem: PHI masked in Stripe/Square (WRONG!)

**Symptom:**
Customer created in Stripe with email `a***n@example.com`

**This means PHI masking is applied TOO EARLY!**

**Solution:**
1. PHI masking should ONLY apply to:
   - Google Sheets logs
   - Execution logs
   - Notifications
2. PHI should NOT be masked when sending to:
   - Stripe/Square (they need real email to process payment)
   - SendGrid (they need real email to send message)
3. Check workflow node order
4. Masking should happen in a BRANCH, not in main flow

---

## Idempotency Issues

### Problem: Same request processed twice despite idempotency

**Symptom:**
You sent same request twice, both succeeded, two invoices created

**THIS IS A CRITICAL BUG — patient could be double-charged!**

**Solutions:**

**Solution 1: Verify idempotency is enabled**
```
ENABLE_IDEMPOTENCY_CHECK=true
```

**Solution 2: Check invoice_reference is provided**
1. Idempotency requires `invoice_reference` field
2. If missing, each request is treated as new
3. Always provide unique `invoice_reference`

**Solution 3: Check idempotency storage**
1. Idempotency checks are stored (in memory, database, or cache)
2. If storage is cleared between requests, duplicates won't be detected
3. For production, use persistent storage (not in-memory)

**Solution 4: Check timing**
1. If requests are >24 hours apart, they're allowed (configurable)
2. Idempotency window: `IDEMPOTENCY_WINDOW_HOURS` (default: 24)

---

## Environment Variable Configuration

### Problem: "undefined" appears in data

**Symptom:**
Google Sheets shows: `Currency: undefined`

**Cause:**
Environment variable is referenced but not set

**Solution:**
1. Check which field shows "undefined"
2. Find corresponding environment variable
3. Set it in your n8n environment
4. Common missing variables:
   - `DEFAULT_CURRENCY` (default: USD)
   - `SENDGRID_API_KEY`
   - `GOOGLE_SHEETS_ID`
   - `MIN_PAYMENT_AMOUNT`
   - `MAX_PAYMENT_AMOUNT`

**How to set environment variables:**
- Docker: Add to docker-compose.yml
- n8n Cloud: Settings → Environment Variables
- Self-hosted: Export in shell before starting n8n

---

### Problem: Changes to .env file don't take effect

**Symptom:**
You changed `DEFAULT_CURRENCY=USD` to `DEFAULT_CURRENCY=CAD` but workflow still uses USD

**Cause:**
n8n caches environment variables

**Solution:**
1. After changing .env file, RESTART n8n:
   - Docker: `docker-compose restart`
   - PM2: `pm2 restart n8n`
   - Direct: Stop and start n8n process
2. Verify change took effect:
   - In workflow, check `{{$env.DEFAULT_CURRENCY}}`
   - Should show new value

---

## Still Stuck?

**If you've tried everything and it still doesn't work:**

1. **Document the problem** using `/00_Shared/BugReport_Template.md`

2. **Gather this information:**
   - Exact error message
   - Test data used
   - n8n execution ID
   - Screenshots of error
   - What you've already tried

3. **Check these resources:**
   - Stripe docs: stripe.com/docs/api
   - Square docs: developer.squareup.com/docs
   - SendGrid docs: docs.sendgrid.com
   - n8n docs: docs.n8n.io
   - API status pages (see above)

4. **Get help:**
   - Team lead or technical support
   - n8n community forum
   - Module build notes

---

## Quick Reference: Error Codes

| Error Code | Meaning | Common Fix |
|------------|---------|------------|
| 400 Bad Request | Invalid input data | Check validation errors in response |
| 401 Unauthorized | Invalid credentials | Reconnect credential in n8n |
| 402 Payment Required | Stripe account issue | Check Stripe account status |
| 403 Forbidden | No permission | Check API key permissions |
| 404 Not Found | Resource doesn't exist | Check customer ID, invoice ID |
| 409 Conflict | Duplicate resource | Use unique invoice_reference |
| 429 Too Many Requests | Rate limit hit | Slow down, wait a minute |
| 500 Internal Server Error | Stripe/Square error | Check status pages, try later |
| 503 Service Unavailable | External API down | Check status pages, try later |

---

## Quick Reference: Common Error Messages

### Stripe Errors

| Error Message | Meaning | Fix |
|---------------|---------|-----|
| "No such customer" | Customer ID is wrong | Let workflow create/lookup customer |
| "No such invoice" | Invoice ID is wrong | Check invoice was created |
| "Invalid currency" | Currency not supported | Use USD, CAD, EUR, GBP, or AUD |
| "Amount must be at least $0.50" | Amount too low | Use amount >= $1.00 |
| "Card was declined" | Payment failed | Use test card 4242 4242 4242 4242 |
| "Invalid API key" | Wrong API key | Update to sk_test_ key |

### SendGrid Errors

| Error Message | Meaning | Fix |
|---------------|---------|-----|
| "Unauthorized" | Invalid API key | Check SENDGRID_API_KEY |
| "Bad Request: from email does not contain a valid address" | Sender email invalid | Verify sender in SendGrid |
| "The from email does not match a verified Sender Identity" | Sender not verified | Verify sender in SendGrid dashboard |

### Validation Errors

| Error Message | Meaning | Fix |
|---------------|---------|-----|
| "patient_email: required and must be valid email format" | Email missing or invalid | Provide valid email |
| "amount: minimum charge is $1" | Amount too low | Use amount >= $1.00 |
| "amount: maximum charge is $100000" | Amount too high | Reduce amount or increase MAX_PAYMENT_AMOUNT |
| "currency: must be one of..." | Invalid currency | Use supported currency |
| "invoice_reference: required for duplicate prevention" | Missing invoice_reference | Add unique invoice_reference |

---

**Remember:** Billing errors can cost real money! Test thoroughly in TEST mode before going live!
