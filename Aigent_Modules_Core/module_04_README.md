# Module 04 Core: Billing & Payments

**Version:** core-1.0.0
**Branch:** Core (SMB-Ready, Non-PHI)
**Target Users:** Service providers, wellness centers, coaches, salons, gyms, spas

---

## Purpose

Processes one-time payments via Stripe for services rendered. Creates charges, generates receipts, and logs transactions. Simple payment processing for service-based businesses.

**NOT FOR:** Healthcare billing with insurance claims (use Enterprise version)

---

## Features

✅ **Included (Core)**
- Stripe payment processing
- One-time charge creation
- Payment status validation
- Email receipts (optional)
- Google Sheets transaction logging
- Staff notifications
- Trace ID tracking
- Retry logic (2 attempts)
- Proper HTTP status codes (200/400/402)

❌ **Removed (Enterprise Only)**
- Square payment integration
- QuickBooks Online sync
- Duplicate charge prevention (24h window)
- SMS receipt delivery
- Refund automation
- Subscription/recurring billing
- Payment plan management
- Multiple payment method support
- Advanced fraud detection
- Revenue analytics dashboard
- Tax calculation
- Invoice generation
- Insurance claims processing

---

## Data Flow

```
Webhook → Validate → Stripe Charge → Check Status → [Sheets + Email + Notify] → Success
             ↓                              ↓
           Error (400)              Payment Declined (402)
```

**Execution Time:** ~1200ms average (Stripe API latency)

---

## Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `amount` | number | > 0 (in cents, e.g., 5000 = $50.00) |
| `customer_email` | string | valid email format |
| `description` | string | not empty |

**Optional Fields:**
- `currency` (string, defaults to "usd")
- `booking_id` (string, for linking to appointments)
- `customer_name` (string, appears on Stripe receipt)

---

## Setup Instructions

### 1. Import Workflow
- Import `module_04_core.json` to n8n

### 2. Create Stripe Account (REQUIRED)

**This module CANNOT work without a Stripe account.**

1. **Sign up:** https://stripe.com/register
2. **Get API Keys:**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy **Secret Key** (starts with `sk_test_...` for testing)
   - For production: Use live keys (`sk_live_...`)
3. **Add to n8n:**
   - Settings → Credentials → New Credential
   - Type: "Stripe API"
   - Paste Secret Key
   - Save

**Cost:** Stripe charges **2.9% + $0.30** per successful transaction

### 3. Connect Google Sheets

Create sheet with columns:
```
timestamp | trace_id | charge_id | amount | currency | customer_email | customer_name | description | status | receipt_url
```

### 4. Set Variables

**Required:**
```bash
GOOGLE_SHEET_ID="your-sheet-id"
```

**Optional:**
```bash
GOOGLE_SHEET_TAB="Payments"
SENDGRID_FROM_EMAIL="payments@yourbusiness.com"
NOTIFICATION_WEBHOOK_URL="https://hooks.slack.com/services/..."
CLINIC_NAME="Your Business Name"
CLINIC_PHONE="+1-555-123-4567"
```

### 5. Optional Integrations

**Enable Email Receipts:**
1. Add SendGrid credential to n8n
2. **Enable "Send Email Receipt" node** (disabled by default)
3. Set `SENDGRID_FROM_EMAIL` variable
4. **Note:** Stripe automatically sends receipts, so this may be redundant

**Enable Staff Notifications:**
1. Create Slack/Teams incoming webhook
2. Set `NOTIFICATION_WEBHOOK_URL` variable
3. Notifications sent on successful payments

### 6. Test with Stripe Test Mode

**Test Card Numbers:**
- **Success:** `4242 4242 4242 4242`
- **Declined:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)

```bash
curl -X POST https://your-n8n-instance/webhook/billing-payment \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 5000,
    "customer_email": "customer@example.com",
    "customer_name": "Jane Smith",
    "description": "60-Minute Massage Therapy",
    "currency": "usd",
    "booking_id": "BOOK-1730851234567"
  }'
```

### 7. Switch to Live Mode (Production)

1. **Update Stripe credential** in n8n to use **Live Secret Key** (`sk_live_...`)
2. **Verify bank account** connected in Stripe Dashboard (for payouts)
3. **Test with real card** (will create actual charge)
4. **Monitor first 10 transactions** carefully

### 8. Activate
- Toggle workflow to "Active"
- **Use test mode** until fully confident
- Monitor Stripe Dashboard for all transactions

---

## Response Examples

### Success (200)
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "trace_id": "PAY-1730851234567",
    "charge_id": "ch_3Abc123xyz",
    "amount": 5000,
    "currency": "usd",
    "receipt_url": "https://pay.stripe.com/receipts/abc123"
  },
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Payment Declined (402)
```json
{
  "success": false,
  "error": "Payment declined. Please check card details.",
  "details": "Your card was declined. (Stripe error: card_declined)",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Missing required fields: amount, customer_email, description",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

---

## Understanding Stripe Charges

### Amount Format: CENTS NOT DOLLARS

**CRITICAL:** Stripe amounts must be in **cents** (smallest currency unit)

| Amount (USD) | Send to Webhook | Stripe Processes |
|--------------|-----------------|------------------|
| $10.00 | `"amount": 1000` | $10.00 |
| $50.50 | `"amount": 5050` | $50.50 |
| $100.00 | `"amount": 10000` | $100.00 |

**Why cents?** Avoids floating-point rounding errors in financial calculations.

### Stripe Fee Breakdown

| Transaction | Amount | Stripe Fee | You Receive |
|-------------|--------|------------|-------------|
| $50.00 session | 5000 cents | $1.75 | $48.25 |
| $100.00 package | 10000 cents | $3.20 | $96.80 |
| $25.00 class | 2500 cents | $1.03 | $23.97 |

**Formula:** Fee = (Amount × 2.9%) + $0.30

### Receipt URL

Stripe automatically generates a receipt URL for each successful charge:
- **Format:** `https://pay.stripe.com/receipts/xxx`
- **Customer Access:** Share this URL or Stripe emails it automatically
- **Your Dashboard:** https://dashboard.stripe.com/payments

---

## Integration with Other Modules

### Module 02 (Consult Booking)

**Flow:** Booking (M02) → Payment (M04)

**Option 1: Manual Payment (Current)**
- Staff reviews bookings in Sheets
- Manually calls M04 webhook with booking_id

**Option 2: Automated Payment (Advanced)**
- Add n8n workflow: "On booking confirmed" → trigger M04
- Pass booking_id for linking

### Module 03 (Telehealth Session)

**Flow:** Session Complete (M03) → Charge for Session (M04)

**Data Passed:**
```json
{
  "amount": 7500,  // $75.00 session
  "customer_email": "patient_email from M03",
  "description": "Video session on 2025-11-20",
  "booking_id": "original booking_id"
}
```

### Module 05 (Follow-up)

**Flow:** Payment Success → Thank You Email

Use M05 to send thank-you campaign after successful payment.

### Module 07 (Analytics)

**Flow:** M04 writes to Sheets → M07 reads for revenue reports

Metrics calculated:
- Total revenue
- Average transaction value
- Payment success rate

---

## Troubleshooting

### Stripe API Errors

**Issue:** "Invalid API Key provided"

**Solutions:**
1. Verify Stripe credential in n8n
2. Check you're using **Secret Key** (not Publishable Key)
3. Test vs Live mode:
   - Test keys: `sk_test_...`
   - Live keys: `sk_live_...`
4. Test credential independently:
   ```bash
   curl https://api.stripe.com/v1/charges \
     -u sk_test_YOUR_KEY: \
     -d amount=1000 \
     -d currency=usd \
     -d source=tok_visa \
     -d description="Test"
   ```

### Payment Declined

**Issue:** Customer reports payment failed

**Solutions:**
1. **Check Stripe Dashboard** → Payments → Failed charges
2. **Common reasons:**
   - Insufficient funds
   - Card expired
   - CVC mismatch
   - Bank declined (fraud prevention)
3. **Ask customer to:**
   - Verify card details
   - Contact bank to authorize
   - Try different payment method
4. **Log shows 402 status** (expected for declined payments)

### Amount Incorrect

**Issue:** Customer charged wrong amount

**Solutions:**
1. **Verify amount in cents:**
   - $50.00 must be sent as 5000
   - NOT "50" or "50.00"
2. **Check webhook payload:**
   - Review execution log for "Create Stripe Charge" node
   - Confirm `amount` field value
3. **Stripe Dashboard:**
   - View charge details
   - Confirm amount matches expectation
4. **Refund if needed:**
   - Go to Stripe Dashboard → Payments → Refund
   - Or use Stripe API (Enterprise has automation)

### Sheets Not Updating

**Issue:** Payment successful but not logged

**Solutions:**
1. Verify `GOOGLE_SHEET_ID` correct
2. Check sheet tab name = `GOOGLE_SHEET_TAB` (default: "Payments")
3. Ensure column headers match exactly
4. Review "Log to Sheets" node execution
5. Check Google Sheets credential has write access

### Double Charging

**Issue:** Customer charged twice

**Cause:** Webhook called twice (network retry, user clicked twice)

**Solutions:**
1. **Check Stripe Dashboard:** Look for duplicate `charge_id`
2. **Refund duplicate** via Stripe Dashboard
3. **Prevention (Core limitation):**
   - Core has NO duplicate prevention
   - Implement client-side button disable
   - Use Stripe's idempotency keys (custom code)
4. **Upgrade to Enterprise:** Includes 24h duplicate prevention

---

## Performance

| Metric | Core | Enterprise |
|--------|------|------------|
| Avg Execution | 1200ms | 1800ms |
| Nodes | 12 | 25 |
| API Calls | 1 (Stripe) | 3-4 |
| Features | Basic | Advanced + QuickBooks |

**Why 1200ms?**
- Stripe API typically responds in 800-1000ms
- Google Sheets logging adds ~200ms
- Notifications/email add ~100ms (parallel, non-blocking)

---

## Use Cases

### ✅ Perfect For
- Service payment (massage, training, coaching)
- Class/workshop fees
- Membership fees (one-time, not recurring)
- Product sales (retail, boutique)
- Consultation fees
- Event tickets
- Package purchases
- Late cancellation fees

### ❌ Not Suitable For
- Subscription billing (use Enterprise or Stripe Billing directly)
- Payment plans (use Enterprise)
- Healthcare insurance claims (use Enterprise)
- Refund workflows (manual via Stripe Dashboard or use Enterprise)
- Split payments (use Enterprise)
- Multi-currency complex flows (use Enterprise)

---

## Cost Analysis

### Stripe Fees (Per Transaction)

| Transaction Amount | Stripe Fee | Net to You | Effective Rate |
|--------------------|------------|------------|----------------|
| $10.00 | $0.59 | $9.41 | 5.9% |
| $25.00 | $1.03 | $23.97 | 4.1% |
| $50.00 | $1.75 | $48.25 | 3.5% |
| $100.00 | $3.20 | $96.80 | 3.2% |
| $250.00 | $7.55 | $242.45 | 3.0% |

**Formula:** Fee = (Amount × 2.9%) + $0.30

### Monthly Costs (Example: 100 transactions)

| Component | Cost | Notes |
|-----------|------|-------|
| **Stripe** | Varies | 2.9% + $0.30 per transaction |
| n8n Cloud | $20 | Workflow hosting |
| Google Sheets | Free | Transaction logging |
| SendGrid | $19.95 | Optional receipts |
| **Total** | **~$40/month + transaction fees** | (Plus Stripe fees) |

**Example:** 100 × $50 transactions = $5,000 revenue
- Stripe fees: ~$175
- Software costs: ~$40
- **Total costs:** ~$215
- **Net revenue:** $4,785 (95.7%)

---

## Upgrade to Enterprise

**When to Upgrade:**
- Need QuickBooks Online sync (accounting automation)
- Need subscription/recurring billing
- Need payment plans (installments)
- Need duplicate charge prevention
- Need automated refund workflows
- Need Square integration (alternative to Stripe)
- Need insurance claim processing
- Need revenue analytics dashboards

**Enterprise Additions:**
- ✅ QuickBooks Online integration
- ✅ Duplicate detection (24h cache)
- ✅ Refund automation
- ✅ Subscription management
- ✅ Payment plan support
- ✅ Square payment option
- ✅ Advanced fraud detection
- ✅ Revenue forecasting
- ✅ Tax calculation

**Migration Steps:**
1. Export payment logs from Core Sheets
2. Import `module_04_enterprise.json`
3. Configure additional integrations (QuickBooks, etc.)
4. Test in parallel
5. Switch webhook URLs
6. Deactivate Core version

---

## Security Considerations

### Current Security Level: Stripe-Secured

**Included (via Stripe):**
- ✅ PCI DSS Level 1 compliance (highest)
- ✅ Card data never touches your server
- ✅ HTTPS encryption (enforced)
- ✅ Stripe fraud detection

**Included (via n8n):**
- ✅ Secure credential storage
- ✅ Google Sheets access control

**Not Included (Enterprise Only):**
- ❌ Duplicate charge prevention
- ❌ Rate limiting
- ❌ API authentication

**Recommendations:**
1. **Never log full card numbers** (Stripe handles this)
2. **Use test mode** until production-ready
3. **Monitor Stripe Dashboard** daily for fraud
4. **Enable Stripe Radar** (fraud detection, $0.05/transaction)
5. **Restrict webhook URL** to your domain only

### PCI Compliance: ✅ YES

**You are PCI compliant** because:
- Card data goes directly to Stripe (not your workflow)
- No card numbers stored in Google Sheets
- n8n never sees card data
- Stripe handles all PCI requirements

**Your responsibility:**
- Keep Stripe credentials secure
- Use HTTPS for webhook (n8n Cloud enforces)
- Don't log card details manually

---

## Stripe Dashboard Overview

**Access:** https://dashboard.stripe.com

### Key Sections

**Payments:**
- View all charges
- Filter by status (succeeded, failed)
- Search by customer email
- Download CSV reports

**Customers:**
- Manage customer records
- View payment history
- Update billing info

**Disputes:**
- Handle chargebacks
- Submit evidence
- Respond to customer disputes

**Payouts:**
- View scheduled payouts to your bank
- Default: every 2 days
- Adjust schedule: Settings → Payout Schedule

**Webhooks:**
- Optional: Set up webhooks to notify your system of events
- Not required for Core module

---

## Support

### Documentation
- **Core Guide:** This file
- **Stripe API Docs:** https://stripe.com/docs/api
- **Stripe Testing:** https://stripe.com/docs/testing

### Community
- **Forum:** https://community.aigent.company
- **GitHub:** https://github.com/aigent/modules/issues
- **Stripe Support:** https://support.stripe.com

---

## License

MIT License (Open Source)

---

**Version:** core-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 03: Telehealth Session](module_03_README.md)
**Next Module:** [Module 05: Follow-up & Retention](module_05_README.md)
