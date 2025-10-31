# Module 04: Billing & Payments - Key Points

**Module:** 04 - Billing & Payments
**Purpose:** Quick reference for essential concepts and reminders

---

## What This Module Does

**In one sentence:**
Processes patient payments through Stripe or Square, creates invoices, sends payment links via email, and logs all transactions to Google Sheets.

**Why it matters:**
This module handles real money! If it fails, you could lose revenue, double-charge patients, create compliance issues, or violate PCI-DSS security standards. One mistake can cost thousands of dollars and damage patient trust.

---

## Core Functionality

**1. Accepts billing requests via webhook**
- Receives: patient details, amount, currency, service description
- Validates: required fields, amount limits, email format, currency codes
- Rejects: incomplete data, suspicious amounts, disposable email addresses

**2. Prevents duplicate charges (Idempotency)**
- Checks for duplicate invoice references before processing
- Prevents accidental double-charging if patient clicks "Pay" twice
- Tracks processed invoices for 24 hours (configurable)

**3. Creates or looks up customers**
- Searches for existing customer by email in Stripe/Square
- Creates new customer if not found
- Maintains single customer record per patient

**4. Creates invoices**
- Generates invoice in payment gateway (Stripe or Square)
- Adds line items with service descriptions
- Finalizes invoice to make it payable
- Supports two modes: invoice_link (send link) or charge_now (immediate charge)

**5. Processes payments**
- Invoice mode: Sends payment link for patient to pay later
- Charge mode: Processes immediate payment using saved payment method
- Supports multiple currencies: USD, CAD, EUR, GBP, AUD

**6. Sends email notifications**
- Invoice emails with payment links (for invoice_link mode)
- Receipt emails with receipt links (for charge_now mode)
- Professional email templates with clinic branding

**7. Logs all transactions**
- Records every payment to Google Sheets
- Masks PHI (email addresses, names) for HIPAA compliance
- Provides audit trail for accounting and compliance

**8. Fraud detection**
- Blocks disposable email addresses (tempmail.com, etc.)
- Flags high-value transactions for manual review
- Enforces amount limits (min: $1, max: $100,000)
- Calculates risk scores for each transaction

---

## Key Concepts

### 1. Payment Gateway Integration

**What it is:** Connection to Stripe or Square to process payments

**Real-world analogy:** Like a cash register at a store — it processes transactions and keeps records

**In Module 04:**
- Stripe is the primary gateway (recommended)
- Square is alternative option
- All payment processing happens in their systems (PCI-compliant)
- n8n never stores credit card data

**Key distinction:**
- **TEST mode:** For testing (fake money, test cards)
- **LIVE mode:** For production (real money, real cards)
- NEVER test in LIVE mode!

---

### 2. Invoice vs. Immediate Charge

**Two billing modes:**

**Invoice Link Mode (billing_mode: "invoice_link")**
- Creates invoice in Stripe/Square
- Sends email with payment link to patient
- Patient pays when ready (like a bill)
- Use case: Scheduled procedures, payment plans

**Charge Now Mode (billing_mode: "charge_now")**
- Charges patient's saved payment method immediately
- Sends receipt email
- Payment processed right away (like a purchase)
- Use case: Completed services, card-on-file billing

**Why this matters:**
- Choose correct mode based on your business process
- Invoice mode gives patient flexibility
- Charge mode ensures immediate payment

---

### 3. Idempotency (Duplicate Prevention)

**What it is:** Ensuring the same request doesn't create duplicate charges

**Real-world analogy:** Like a "Do Not Disturb" sign on a hotel room — once you've knocked, knocking again doesn't open a second door

**How it works:**
1. Each request includes unique `invoice_reference` (like "INV-2025-001")
2. System checks: "Have I seen this invoice_reference before?"
3. If YES: Return existing invoice (don't charge again)
4. If NO: Create new invoice

**Example:**
```
Request 1: invoice_reference: "INV-2025-001" → Invoice created ✅
Request 2: invoice_reference: "INV-2025-001" → Duplicate detected, invoice returned (not created again) ✅
```

**Why it matters:**
Prevents accidental double-charging if:
- Patient clicks "Pay" button twice
- Network hiccup causes retry
- API call times out and gets retried

**Critical:** Always use unique invoice_reference for each new invoice!

---

### 4. PCI-DSS Compliance

**What it is:** Security standard for handling credit card data

**PCI-DSS Rules:**
1. **NEVER store credit card numbers** in your system
2. **NEVER log credit card data** in execution logs
3. **NEVER transmit card data** except to PCI-compliant processors
4. **Always use HTTPS** for all payment communications

**In Module 04:**
- ✅ Credit card data ONLY handled by Stripe/Square (PCI-compliant)
- ✅ n8n NEVER sees or stores card numbers
- ✅ Patients enter cards directly on Stripe/Square hosted pages
- ✅ n8n only receives tokens (not actual card numbers)

**What we store:**
- ❌ NOT: 4242 4242 4242 4242 (credit card number)
- ✅ YES: pm_abc123 (payment method token from Stripe)

**Why it matters:** Violating PCI-DSS can result in huge fines, losing ability to process payments, and legal liability

---

### 5. PHI Masking

**What it is:** Hiding patient identifying information in logs and sheets

**What gets masked:**
- Email: `alice.anderson@example.com` → `a***n@example.com`
- Name: `Alice Anderson` → `A*** A***`

**Where it's masked:**
- n8n execution logs (for debugging)
- Google Sheets (for recordkeeping)
- Audit logs (for compliance)

**Where it's NOT masked:**
- Stripe/Square (they need real data to process payments)
- Email sending (SendGrid needs real email to deliver message)
- Invoice documents (patient needs to see their own info)

**Why it matters:**
- HIPAA compliance — logs might be viewed by developers, support staff
- Reduces risk of PHI exposure in case of breach
- Still allows debugging and troubleshooting

**Critical:** If you see full email/name in logs, PHI masking is broken (security bug!)

---

### 6. Fraud Detection

**What it is:** Automated checks to identify suspicious transactions

**What it detects:**

**1. Disposable Email Addresses**
- Blocked domains: tempmail.com, guerrillamail.com, 10minutemail.com
- Risk: Patient might be testing stolen cards
- Action: Request rejected

**2. Suspiciously High Amounts**
- Threshold: > $100,000 (configurable)
- Risk: Data entry error or fraud attempt
- Action: Request rejected

**3. High-Value Transactions**
- Threshold: > $5,000 (configurable)
- Risk: Legitimate but unusual
- Action: Allowed but flagged for manual review

**Risk Scoring:**
- 0-25: LOW (normal transaction)
- 26-50: MEDIUM (flagged for review)
- 51-100: CRITICAL (blocked)

**Why it matters:**
Protects your clinic from:
- Fraudulent charges
- Chargebacks
- Money laundering
- Payment gateway account suspension

---

### 7. Multi-Currency Support

**What it is:** Accepting payments in different currencies

**Supported currencies:**
- USD (US Dollar) — default
- CAD (Canadian Dollar)
- EUR (Euro)
- GBP (British Pound)
- AUD (Australian Dollar)

**How it works:**
1. Specify currency in request: `"currency": "CAD"`
2. Amount is in that currency: `"amount": "200.00"` = CAD $200
3. Invoice created in that currency
4. Patient pays in that currency (no conversion)

**Important notes:**
- Currency must match patient's location for best experience
- Stripe/Square handles currency processing
- Each currency has its own minimum amount rules
- NOT all Stripe/Square accounts support all currencies (check settings)

**Why it matters:**
- Serve international patients
- Comply with local billing requirements
- Avoid confusion with currency conversions

---

### 8. Customer Management

**What it is:** Maintaining patient records in payment gateway

**Customer lifecycle:**

**1. First visit:**
- Patient submits payment request
- System searches Stripe/Square for customer by email
- NOT found → Create new customer
- Customer ID assigned (e.g., `cus_ABC123`)

**2. Return visit:**
- Patient submits another payment request
- System searches by email again
- FOUND → Use existing customer ID
- Attach new invoice to existing customer

**Benefits:**
- Single customer record per patient (no duplicates)
- Payment history viewable in Stripe/Square
- Can store payment methods for future use
- Easier to issue refunds

**Why it matters:**
- Clean data in payment gateway
- Better patient experience (recognizes returning patients)
- Enables features like saved cards, subscriptions

---

## Critical Reminders

### Testing
1. **ALWAYS use TEST mode** — NEVER test with live API keys
2. **Use test cards only** — 4242 4242 4242 4242 (Stripe success card)
3. **Test in development environment** — not production
4. **Verify all 5 outputs** — HTTP response, Stripe/Square, Email, Google Sheets, n8n logs
5. **Use unique invoice_reference** for each test to avoid idempotency conflicts

### Security
1. **PHI masking must work** — if full email/name in logs, STOP immediately
2. **PCI-DSS compliance is mandatory** — no credit card data in n8n ever
3. **TEST vs LIVE keys** — sk_test_ for testing, sk_live_ for production
4. **No hardcoded secrets** — all credentials in environment variables
5. **Audit trail required** — log every transaction for compliance

### Data Quality
1. **Amounts must have 2 decimal places** — "150.00" not "150"
2. **Unique invoice_reference required** — prevents duplicates
3. **Valid currency codes** — USD, CAD, EUR, GBP, AUD only
4. **Email validation is strict** — disposable domains blocked
5. **Amount limits enforced** — $1 minimum, $100,000 maximum

### Performance
1. **Target: < 8 seconds** — average execution time
2. **Stripe API is slowest** — 2-4 seconds is normal for invoice creation
3. **Timeouts are safety nets** — workflow won't run forever
4. **Email sending adds time** — 1-2 seconds for SendGrid API

---

## Testing Checklist (Quick)

**Before testing:**
- [ ] Workflow is active (green toggle)
- [ ] Environment variables set (see EnvMatrix.md)
- [ ] Stripe/Square in TEST mode (verify in dashboard)
- [ ] Test API key configured (starts with sk_test_)
- [ ] SendGrid API key configured
- [ ] Google Sheet exists with correct tab
- [ ] Test credit cards ready (4242 4242 4242 4242)

**During testing:**
- [ ] Use unique invoice_reference for each test
- [ ] Check HTTP response for status
- [ ] Verify invoice in Stripe/Square dashboard
- [ ] Confirm email delivery (check inbox or SendGrid logs)
- [ ] Verify row in Google Sheets
- [ ] Check PHI masking (email should be a***n@example.com)

**After testing:**
- [ ] Review n8n execution logs
- [ ] Calculate average execution time
- [ ] Document any issues
- [ ] Verify no duplicate charges were created
- [ ] Clean up test data (optional)

---

## Success Metrics

**What "working correctly" looks like:**

| Metric | Target | How to Check |
|--------|--------|--------------|
| Success rate | >99% | n8n execution history (green vs. red) |
| Execution time | <8s average | `execution_time_ms` in responses |
| Validation accuracy | 100% | Invalid data rejected, valid accepted |
| PHI masking | 100% | No full email/name in logs or sheets |
| Idempotency | 100% | Duplicate requests return existing invoice |
| Email delivery | >95% | SendGrid logs vs. invoice count |
| Fraud detection | 100% | Disposable emails blocked |
| Invoice creation | >99% | Invoices appear in Stripe/Square |

---

## Data Flow (Simplified)

```
Payment Request (Webhook)
   ↓
Enhanced Validation
(email, amount, currency, required fields)
   ↓
Fraud Detection & Velocity Checks
(disposable emails, high amounts, risk scoring)
   ↓
Idempotency Check
(duplicate invoice_reference detection)
   ↓
Prepare Billing Data + PHI Masking
(mask email/name for logs only)
   ↓
┌─────────────────────────────────┐
│   Stripe/Square API Calls       │
├─────────────────────────────────┤
│ 1. Lookup Customer (by email)  │
│ 2. Create Customer (if needed) │
│ 3. Create Invoice              │
│ 4. Add Line Item (Stripe only) │
│ 5. Finalize Invoice            │
│ 6. Charge Now (if charge_now)  │
└─────────────────────────────────┘
   ↓
Send Email (Invoice Link or Receipt)
   ↓
Log to Google Sheets (with PHI masking)
   ↓
HTTP Response (success/error)
```

---

## Integration Points

**Receives from:**
- Module 03 (Telehealth Session) → Billing for completed consults
- Module 02 (Consult Booking) → Deposit charges
- External website → Payment widget submissions
- Manual API calls → Admin-initiated billing

**Sends to:**
- Stripe/Square → Payment processing
- SendGrid → Email notifications
- Google Sheets → Transaction logs
- Module 09 (Compliance) → Audit trail

**Triggers:**
- Module 05 (Follow-Up) → Payment receipts, failed payment notifications
- Module 07 (Analytics) → Revenue tracking
- Module 09 (Compliance) → Transaction auditing

---

## Environment Variables (Key)

**Payment Gateway:**
```
STRIPE_API_KEY=sk_test_...        # Stripe secret key (TEST mode)
SQUARE_API_KEY=sandbox-sq0...     # Square access token (Sandbox)
PAYMENT_GATEWAY=stripe            # Which gateway to use (stripe or square)
```

**Email Service:**
```
SENDGRID_API_KEY=SG.abc123...     # SendGrid API key
EMAIL_FROM=billing@clinic.com     # Sender email (must be verified)
EMAIL_REPLY_TO=support@clinic.com # Reply-to email
```

**Data Storage:**
```
GOOGLE_SHEETS_ID=1abc123...       # Google Sheet ID for logs
GOOGLE_SHEET_TAB=Payments         # Tab name in sheet
```

**Amount Limits:**
```
MIN_PAYMENT_AMOUNT=1              # Minimum charge ($1.00)
MAX_PAYMENT_AMOUNT=100000         # Maximum charge ($100,000)
HIGH_VALUE_THRESHOLD=5000         # Flag amounts above this
```

**Currency:**
```
DEFAULT_CURRENCY=USD              # Default if not specified
SUPPORTED_CURRENCIES=USD,CAD,EUR,GBP,AUD  # Allowed currencies
```

**Security:**
```
ENABLE_IDEMPOTENCY_CHECK=true     # Prevent duplicate charges
IDEMPOTENCY_WINDOW_HOURS=24       # How long to track duplicates
ENABLE_PHI_MASKING=true           # Mask email/name in logs
ENABLE_FRAUD_DETECTION=true       # Block suspicious transactions
```

---

## Mastery Checklist

**Skills you should have after testing Module 04:**

**Beginner Level:**
- [ ] Understand difference between invoice_link and charge_now modes
- [ ] Can create a test invoice using cURL
- [ ] Know how to check if invoice was created in Stripe dashboard
- [ ] Can verify email was sent in SendGrid
- [ ] Understand why TEST mode is critical

**Intermediate Level:**
- [ ] Can troubleshoot common validation errors
- [ ] Understand idempotency and why it prevents duplicates
- [ ] Can verify PHI masking is working correctly
- [ ] Know how to check fraud detection settings
- [ ] Can test multi-currency payments

**Advanced Level:**
- [ ] Can debug failed Stripe/Square API calls
- [ ] Understand PCI-DSS compliance requirements
- [ ] Can configure fraud detection thresholds
- [ ] Know how to optimize performance
- [ ] Can switch between Stripe and Square gateways

**Expert Level:**
- [ ] Can teach others how to test this module
- [ ] Can customize fraud detection rules
- [ ] Understand the full data flow from webhook to payment
- [ ] Can handle edge cases and error scenarios
- [ ] Ready to manage production payment processing

---

## Common Misconceptions

**Myth:** "The workflow is slow (8 seconds) — something's wrong!"
**Reality:** 4-8 seconds is normal. Stripe API calls take 2-4 seconds, plus email and sheets logging. This is expected.

**Myth:** "PHI masking in sheets means data is lost!"
**Reality:** Full data is safely stored in Stripe/Square. Masking is ONLY for logs/sheets (HIPAA compliance).

**Myth:** "I can test with live API keys if I use small amounts"
**Reality:** NEVER test with live keys. Even $0.01 charges are real transactions with fees, tax reporting, and compliance implications.

**Myth:** "Same invoice_reference means it's a bug"
**Reality:** Idempotency is WORKING correctly — it's preventing duplicate charges. Use unique invoice_reference for each test.

**Myth:** "n8n stores credit card data securely"
**Reality:** n8n should NEVER store credit card data at all. Only Stripe/Square (PCI-compliant) handles cards.

**Myth:** "Fraud detection blocks too many legitimate payments"
**Reality:** Fraud detection only blocks disposable emails and excessive amounts. Configure thresholds to match your business.

**Myth:** "Email failures mean the payment failed"
**Reality:** Email delivery is separate from payment processing. Invoice can be created successfully even if email fails.

---

## Pro Tips

**1. Keep a Test Spreadsheet**
Track each test with invoice_reference and results:
```
INV-2025-001 | TC-HP-001 | Sarah Johnson | $150.00 | Success ✅
INV-2025-002 | TC-HP-002 | Michael Chen  | $225.50 | Success ✅
INV-2025-003 | TC-INV-001| Missing email | Error ✅ (expected)
```

**2. Use Stripe Dashboard Test Clock**
Stripe has a "test clock" feature to simulate future dates for testing subscriptions and scheduled payments

**3. Monitor SendGrid Email Activity**
Keep SendGrid dashboard open during testing to verify emails are sent in real-time

**4. Bookmark Your Google Sheet**
Quick access to verify each transaction is logged

**5. Use Stripe CLI for Webhooks**
Install Stripe CLI to test webhook events (payment succeeded, failed, etc.)

**6. Check Stripe Logs for API Calls**
Stripe Dashboard → Developers → Logs shows every API call made by n8n

**7. Test Refunds Separately**
After successful payment tests, test refund functionality (if implemented)

**8. Save Successful Responses**
Keep examples of successful responses for comparison when troubleshooting

**9. Test Each Currency**
Don't just test USD — verify CAD, EUR, GBP, AUD all work

**10. Review Execution Time Trends**
n8n shows execution time trends over time — watch for performance degradation

---

## Related Modules

**Module 02** (Consult Booking) → Triggers billing for appointment deposits
**Module 03** (Telehealth Session) → Triggers billing for completed consultations
**Module 05** (Follow-Up) → Sends payment reminders, receipt confirmations
**Module 07** (Analytics) → Tracks revenue, payment success rates
**Module 09** (Compliance) → Logs all billing events for auditing

---

## Additional Resources

**In this package:**
- `TestPlan.md` — Step-by-step testing instructions
- `TestCases.md` — All 18 test cases detailed
- `Observability.md` — Where to look to see what's happening
- `Troubleshooting.md` — Common problems and solutions
- `Checklist.md` — Testing progress tracker

**External:**
- Stripe API docs: stripe.com/docs/api
- Square API docs: developer.squareup.com/docs
- SendGrid API docs: docs.sendgrid.com
- PCI-DSS standards: pcisecuritystandards.org
- n8n webhook docs: docs.n8n.io/workflows/webhooks

---

## You've Mastered Module 04 When...

- [ ] You can run all 18 tests from memory
- [ ] You can explain the difference between invoice and charge modes
- [ ] You understand why idempotency prevents double-charging
- [ ] You can verify PHI masking is working correctly
- [ ] You know the difference between TEST and LIVE mode
- [ ] You can troubleshoot common Stripe/Square errors
- [ ] You understand PCI-DSS compliance requirements
- [ ] You can teach someone else to test this module
- [ ] You feel confident managing production billing

---

**Keep this file open as a quick reference while testing!**
