# Aigent Module 04 – Billing & Payments

**Version:** 1.0.0
**Author:** Aigent Automation Engineering
**Template Type:** Universal Clinic Template
**Status:** Production Ready
**Dependencies:** Module 03 (required)

---

## Overview

The **Billing & Payments** module automates the complete billing lifecycle for medical practices. It accepts service completion data from Module 03, creates invoices in Stripe or Square, processes payments or generates hosted payment links, sends branded receipts via email/SMS, and syncs transactions to QuickBooks Online for accounting.

### Key Features

- **Multi-Gateway Support:** Stripe (default) or Square
- **Flexible Billing Modes:** Immediate charge (card on file) or hosted invoice link
- **Automated Receipts:** Email + optional SMS
- **Accounting Sync:** QuickBooks Online or PracticeSuite
- **Membership Support:** Optional recurring subscriptions
- **PHI-Safe:** No diagnosis codes or clinical notes
- **Error Resilience:** Payment failure handling with trace IDs
- **Module Chaining:** Accepts Module 03 output, triggers Module 05

---

## Architecture

### Data Flow
```
Module 03 Output → Validate → Prepare → Lookup/Create Customer →
  Create Invoice → Add Line Items → Finalize →
    charge_now OR invoice_link →
  Parallel: QuickBooks + Email + SMS →
  Success Response (invoice_record.json)
```

### Node Count: 23 nodes

---

## Installation

### 1. Import Workflow
n8n → Workflows → Import → `Aigent_Module_04_Billing_Payments.json`

### 2. Configure Credentials

#### Stripe
- Type: HTTP Header Auth
- Header: `Authorization`
- Value: `Bearer sk_live_YOUR_KEY`

#### QuickBooks Online
- Type: OAuth2
- Scopes: `com.intuit.quickbooks.accounting`

#### SendGrid
- Type: SendGrid API
- API Key from SendGrid

### 3. Environment Variables
```bash
PAYMENT_GATEWAY=stripe
BILLING_MODE=invoice_link
ACCOUNTING_TARGET=quickbooks
QBO_REALM_ID=YOUR_COMPANY_ID
```

---

## Usage

### Input (from Module 03)
```json
{
  "patient_email": "jane@example.com",
  "patient_name": "Jane Doe",
  "service_code": "CONSULT_30",
  "amount": 12000,
  "currency": "USD"
}
```

### Success Response
```json
{
  "success": true,
  "invoice_id": "inv_123",
  "payment_id": "ch_456",
  "accounting_id": "789",
  "gateway": "Stripe",
  "amount": 12000,
  "paid": false,
  "hosted_invoice_url": "https://...",
  "metadata": {
    "receipt_sent": true,
    "synced_to_accounting": true
  }
}
```

---

## Configuration

### Billing Modes

**charge_now:** Immediate charge with saved card
```bash
BILLING_MODE=charge_now
```
Output: `paid: true`, `receipt_url`

**invoice_link:** Send payment link to customer
```bash
BILLING_MODE=invoice_link
```
Output: `paid: false`, `hosted_invoice_url`

### Switching Gateways

From Stripe to Square:
```bash
PAYMENT_GATEWAY=square
SQUARE_ACCESS_TOKEN=YOUR_TOKEN
```

---

## Troubleshooting

### Payment Declined
- Verify customer has valid payment method
- Switch to `invoice_link` mode

### QuickBooks Not Syncing
- Check OAuth token expiration
- Verify `QBO_REALM_ID` correct
- Check customer/item IDs in QuickBooks

### Receipt Not Delivered
- Verify SendGrid API key
- Check `RECEIPT_FROM_EMAIL` verified

---

## Security & Compliance

### PCI DSS Compliant
- No card numbers stored
- Uses gateway tokenization
- Hosted payment pages

### PHI-Safe
- Only billing identifiers
- No diagnosis codes
- Generic service descriptions

---

## Integration with Module 03

Add to Module 03 Success Response:
```javascript
await $http.post($env.MODULE_04_WEBHOOK_URL, {
  patient_email: $json.patient_email,
  amount: 12000,
  service_code: 'CONSULT_30'
});
```

---

## License
**Proprietary - Aigent Company** © 2025

---

## Changelog

### v1.0.0 (2025-10-29)
- Initial release
- Stripe and Square support
- QuickBooks sync
- Email/SMS receipts
- Dual billing modes
