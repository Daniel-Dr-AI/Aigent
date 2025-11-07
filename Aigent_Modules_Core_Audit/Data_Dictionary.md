# Aigent Core Suite - Complete Data Dictionary

**Version**: 1.0.0
**Date**: 2025-11-06
**Modules**: 01-10 Core

---

## Overview

This document defines all data fields used across the Aigent Core Suite modules. It provides a canonical reference for:
- Field names and types
- Source modules (where data originates)
- Consumer modules (where data is used)
- Validation rules
- Storage locations

---

## Common Fields (All Modules)

| Field Name | Type | Format | Description | Source | Used By |
|------------|------|--------|-------------|--------|---------|
| `timestamp` | string | ISO 8601 | Event timestamp | ALL | ALL |
| `trace_id` | string | `{PREFIX}-{millis}` | Unique event ID | ALL | ALL, M09 |
| `success` | boolean | true/false | Operation result | ALL (responses) | Frontend |
| `error` | string | free text | Error message | ALL (error paths) | Frontend |
| `workflow_version` | string | semver | Module version | M01 only | M09 (audit) |
| `module` | string | module_name | Module identifier | M01 only | M09 (audit) |

### Trace ID Formats

| Module | Prefix | Example | Notes |
|--------|--------|---------|-------|
| M01 Intake | `LEAD-` | `LEAD-1730851234567` | Lead capture events |
| M02 Booking | `BOOK-` | `BOOK-1730851234567` | Booking events |
| M03 Telehealth | `SESSION-` | `SESSION-1730851234567` | Session creation |
| M04 Billing | `PAY-` | `PAY-1730851234567` | Payment transactions |
| M05 Followup | `CAMPAIGN-` | `CAMPAIGN-1730851234567` | Email campaigns |
| M06 OCR | `DOC-` | `DOC-1730851234567` | Document processing |
| M07 Analytics | `REPORT-` | `REPORT-1730851234567` | Report generation |
| M08 Messaging | `MSG-` | `MSG-1730851234567` | Message sending |
| M09 Compliance | `AUDIT-` | `AUDIT-1730851234567` | Audit logging |
| M10 Orchestration | `ORCH-` | `ORCH-1730851234567` | Orchestrated workflows |

**Issue**: All use `Date.now()` - collision risk under high load.
**Recommendation**: Add random suffix: `{PREFIX}-{millis}-{random6}`

---

## Module 01: Intake & Lead Capture

### Input Fields

| Field | Type | Required | Validation | Default | Example |
|-------|------|----------|------------|---------|---------|
| `name` | string | YES | not empty | - | "John Doe" |
| `email` | string | YES | contains "@" | - | "john@example.com" |
| `phone` | string | YES | not empty | - | "555-1234" |
| `interest` | string | NO | - | "General Inquiry" | "Fitness Consultation" |
| `referral_source` | string | NO | - | "Direct" | "Google" |
| `notes` | string | NO | - | "" | "Interested in evening classes" |

### Output Fields (Google Sheets: `Leads`)

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `timestamp` | string | auto | ISO 8601 timestamp |
| `trace_id` | string | auto | `LEAD-{timestamp}` |
| `name` | string | input | Full name (as provided) |
| `first_name` | string | derived | First word of name |
| `last_name` | string | derived | Remaining words of name |
| `email` | string | input | Lowercase, trimmed |
| `phone` | string | derived | Digits only (normalized) |
| `phone_display` | string | input | Original format |
| `interest` | string | input | Interest area |
| `referral_source` | string | input | How they found you |
| `notes` | string | input | Additional notes |
| `status` | string | hardcoded | Always "NEW" |

**Storage**: Google Sheets tab `Leads`

---

## Module 02: Consult Booking

### Input Fields

| Field | Type | Required | Validation | Default | Example |
|-------|------|----------|------------|---------|---------|
| `email` | string | YES | contains "@" | - | "jane@example.com" |
| `name` | string | YES | not empty | - | "Jane Smith" |
| `phone` | string | YES | not empty | - | "555-9876" |
| `service_type` | string | YES | not empty | - | "Consultation" |
| `preferred_date` | string | NO | YYYY-MM-DD | null | "2025-11-15" |
| `preferred_time` | string | NO | HH:MM | null | "14:00" |
| `timezone` | string | NO | - | `$vars.CLINIC_TIMEZONE` | "America/New_York" |
| `notes` | string | NO | - | "" | "Needs wheelchair access" |

### Output Fields (Google Sheets: `Bookings`)

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `timestamp` | string | auto | ISO 8601 timestamp |
| `trace_id` | string | auto | `BOOK-{timestamp}` |
| `booking_id` | string | Cal.com API | External booking ID |
| `patient_name` | string | input | Patient name |
| `patient_email` | string | input | Patient email (lowercase) |
| `patient_phone` | string | derived | Digits only |
| `service_type` | string | input | Type of service |
| `scheduled_time` | string | Cal.com API | ISO 8601 appointment time |
| `duration_minutes` | number | Cal.com API | Appointment duration |
| `timezone` | string | input | Patient timezone |
| `status` | string | hardcoded | Always "SCHEDULED" |

### API Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `booking_id` | string | From Cal.com/scheduling API |
| `confirmation_number` | string | Shortened booking_id (8 chars, uppercase) |
| `scheduled_time` | string | ISO 8601 timestamp |
| `service_type` | string | Service booked |
| `trace_id` | string | Internal tracking ID |

**Storage**: Google Sheets tab `Bookings`

---

## Module 03: Telehealth Session

### Input Fields

| Field | Type | Required | Validation | Default | Example |
|-------|------|----------|------------|---------|---------|
| `booking_id` | string | YES | not empty | - | "abc123xyz" |
| `patient_email` | string | YES | contains "@" | - | "patient@example.com" |
| `scheduled_time` | string | NO | ISO 8601 | +1 hour | "2025-11-15T14:00:00Z" |
| `duration_minutes` | number | NO | > 0 | 30 | 30 |

### Output Fields (Google Sheets: `Sessions`)

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `timestamp` | string | auto | ISO 8601 timestamp |
| `session_id` | string | auto | `SESSION-{timestamp}` (same as trace_id) |
| `booking_id` | string | input | Link to M02 booking |
| `meeting_id` | string | Zoom API | Video meeting ID |
| `patient_email` | string | input | Patient email |
| `meeting_url` | string | Zoom API | Patient join URL |
| `scheduled_start` | string | input | ISO 8601 session start time |
| `duration_minutes` | number | input | Session duration |
| `status` | string | hardcoded | Always "SCHEDULED" |

### API Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Internal session ID |
| `meeting_url` | string | Patient join URL |
| `provider_url` | string | Provider join URL (if different) |
| `scheduled_start` | string | ISO 8601 timestamp |
| `duration_minutes` | number | Session duration |

**Storage**: Google Sheets tab `Sessions`

---

## Module 04: Billing & Payments

### Input Fields

| Field | Type | Required | Validation | Default | Example |
|-------|------|----------|------------|---------|---------|
| `amount` | number | YES | > 0 | - | 5000 (cents) |
| `customer_email` | string | YES | contains "@" | - | "customer@example.com" |
| `description` | string | YES | not empty | - | "Consultation Fee" |
| `currency` | string | NO | - | "usd" | "usd" |
| `booking_id` | string | NO | - | null | "abc123" |

### Output Fields (Google Sheets: `Payments`)

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `timestamp` | string | auto | ISO 8601 timestamp |
| `trace_id` | string | auto | `PAY-{timestamp}` |
| `charge_id` | string | Stripe API | Stripe charge ID |
| `amount` | number | Stripe API | Amount in cents |
| `currency` | string | Stripe API | Currency code |
| `customer_email` | string | input | Customer email |
| `description` | string | input | Payment description |
| `status` | string | Stripe API | "succeeded" or "failed" |
| `receipt_url` | string | Stripe API | Receipt URL |

### API Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `charge_id` | string | Stripe charge ID |
| `amount` | number | Amount charged (cents) |
| `currency` | string | Currency code |
| `status` | string | Payment status |
| `receipt_url` | string | Stripe receipt URL |
| `failure_code` | string | Error code (if declined) |
| `failure_message` | string | Error message (if declined) |

**Storage**: Google Sheets tab `Payments`

---

## Module 05: Follow-up & Retention

### Input Fields

| Field | Type | Required | Validation | Default | Example |
|-------|------|----------|------------|---------|---------|
| `recipients` | array[string] | YES | not empty | - | ["user1@test.com", "user2@test.com"] |
| `subject` | string | YES | not empty | - | "Special Offer!" |
| `message` | string | YES | not empty | - | "Hello {name}, ..." |

### Output Fields (Google Sheets: `Campaigns`)

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `timestamp` | string | auto | ISO 8601 timestamp |
| `campaign_id` | string | auto | `CAMPAIGN-{timestamp}` |
| `recipient` | string | input | Individual recipient email |
| `subject` | string | input | Email subject |
| `status` | string | SendGrid result | "sent" or "failed" |

**Storage**: Google Sheets tab `Campaigns` (one row per recipient)

---

## Module 06: Document Capture & OCR

### Input Fields

| Field | Type | Required | Validation | Default | Example |
|-------|------|----------|------------|---------|---------|
| `file_url` | string | YES | not empty | - | "https://example.com/doc.pdf" |

### Output Fields (Google Sheets: `Documents`)

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `timestamp` | string | auto | ISO 8601 timestamp |
| `document_id` | string | auto | `DOC-{timestamp}` |
| `file_url` | string | input | Original document URL |
| `ocr_text` | string | Google Vision | Full OCR text (truncated 500 chars) |
| `extracted_name` | string | regex | Name extracted via regex |
| `extracted_date` | string | regex | Date extracted via regex |
| `extracted_amount` | string | regex | Dollar amount extracted |

**Storage**: Google Sheets tab `Documents`

---

## Module 07: Analytics & Dashboard

### Input Fields

| Field | Type | Required | Validation | Default | Example |
|-------|------|----------|------------|---------|---------|
| `period_start` | string | NO | YYYY-MM-DD | 30 days ago | "2025-10-01" |
| `period_end` | string | NO | YYYY-MM-DD | today | "2025-11-01" |

### Output Fields

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `report_id` | string | auto | `REPORT-{timestamp}` |
| `period_start` | string | input | Report start date |
| `period_end` | string | input | Report end date |
| `metrics.total_leads` | number | Google Sheets | Count from Leads tab |
| `metrics.total_bookings` | number | Google Sheets | Count from Bookings tab |
| `metrics.total_revenue` | number | Google Sheets | Sum from Payments tab (in dollars) |
| `metrics.avg_transaction` | number | calculated | Revenue / bookings |
| `metrics.conversion_rate` | string | calculated | (bookings / leads) * 100 + "%" |
| `timestamp` | string | auto | ISO 8601 timestamp |

**Storage**: Not stored, returned as API response only

---

## Module 08: Messaging Omnichannel

### Input Fields

| Field | Type | Required | Validation | Default | Example |
|-------|------|----------|------------|---------|---------|
| `recipient` | string | YES | not empty | - | "user@example.com" or "+15551234567" |
| `channel` | string | YES | not empty | - | "email" or "sms" |
| `message` | string | YES | not empty | - | "Your appointment is tomorrow" |

### Output Fields (Google Sheets: `Messages`)

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `timestamp` | string | auto | ISO 8601 timestamp |
| `message_id` | string | auto | `MSG-{timestamp}` |
| `recipient` | string | input | Email or phone number |
| `channel` | string | input | "email" or "sms" |
| `status` | string | hardcoded | Always "delivered" |

**Storage**: Google Sheets tab `Messages`

---

## Module 09: Compliance & Audit

### Input Fields

| Field | Type | Required | Validation | Default | Example |
|-------|------|----------|------------|---------|---------|
| `event_type` | string | YES | not empty | - | "LEAD_CREATED" |
| `user_id` | string | YES | not empty | - | "user-123" |
| `action` | string | YES | not empty | - | "CREATE" |
| `resource_id` | string | NO | - | "N/A" | "LEAD-1730851234567" |
| `details` | string | NO | - | "" | "Created via webhook" |

### Output Fields (Google Sheets: `AuditLog`)

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `timestamp` | string | auto | ISO 8601 timestamp |
| `audit_id` | string | auto | `AUDIT-{timestamp}` |
| `event_type` | string | input | Event category |
| `user_id` | string | input | User/system identifier |
| `resource_id` | string | input | Resource being acted upon |
| `action` | string | input | Action performed |
| `details` | string | input | Additional context |

**Storage**: Google Sheets tab `AuditLog`

---

## Module 10: System Orchestration

### Input Fields

| Field | Type | Required | Validation | Default | Example |
|-------|------|----------|------------|---------|---------|
| `workflow_type` | string | YES | "patient-journey" | - | "patient-journey" |
| `patient_name` | string | YES (for patient-journey) | not empty | - | "John Doe" |
| `patient_email` | string | YES (for patient-journey) | contains "@" | - | "john@example.com" |
| `patient_phone` | string | YES (for patient-journey) | not empty | - | "555-1234" |

### Output Fields

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `orchestration_id` | string | auto | `ORCH-{timestamp}` |
| `workflow_type` | string | input | Workflow executed |
| `modules_executed` | array[string] | auto | List of modules called |
| `total_duration_ms` | number | calculated | Total execution time |
| `timestamp` | string | auto | ISO 8601 timestamp |

**Storage**: Not stored, returned as API response only

---

## Field Name Consistency Analysis

### ✅ Consistent Across Modules
- `timestamp` (ISO 8601)
- `trace_id` (prefix-based)
- `success` (boolean)
- `error` (string)

### ⚠️ Inconsistent Naming

| Concept | M01 | M02 | M03 | M04 | Recommendation |
|---------|-----|-----|-----|-----|----------------|
| **Email** | `email` | `patient_email` | `patient_email` | `customer_email` | Standardize to `email` (input) + `{role}_email` (storage) |
| **Phone** | `phone`, `phone_display` | `patient_phone`, `patient_phone` (display missing) | - | - | Add `phone_display` to M02 |
| **Name** | `name`, `first_name`, `last_name` | `patient_name` | - | - | Standardize to `name` (input) + parse to first/last |
| **ID** | `trace_id` | `booking_id` (external), `trace_id` | `session_id` (= trace_id), `booking_id` | `charge_id`, `trace_id` | Good: trace_id always present, external IDs kept separate |

### 🔴 Missing Fields

| Module | Missing | Impact |
|--------|---------|--------|
| M02 | `phone_display` | Can't show original phone format |
| M03 | `patient_name` | No name in session record |
| M04 | `booking_id` reference | Payment not linked to booking |
| All | `created_by` | No audit trail of who created record |
| All | `updated_at` | No modification tracking |

---

## Recommended Standardizations

### 1. Universal Fields (Add to ALL modules)
```json
{
  "timestamp": "2025-11-06T12:34:56.789Z",
  "trace_id": "{PREFIX}-{millis}-{random}",
  "created_by": "system|user_id",
  "source_ip": "1.2.3.4",
  "workflow_version": "core-1.0.0"
}
```

### 2. Person Fields (M01, M02, M03)
```json
{
  "name": "John Doe",          // Input (full name)
  "first_name": "John",         // Parsed
  "last_name": "Doe",           // Parsed
  "email": "john@example.com",  // Input
  "phone": "5551234567",        // Normalized (digits only)
  "phone_display": "555-1234",  // Original format
  "phone_country": "+1"         // Country code (future)
}
```

### 3. Status Fields (All modules)
```json
{
  "status": "PENDING|CONFIRMED|COMPLETED|CANCELLED|FAILED",
  "status_updated_at": "2025-11-06T12:34:56.789Z",
  "status_reason": "Payment failed"
}
```

Currently: `status` always hardcoded ("NEW", "SCHEDULED", "delivered") - no state transitions.

---

## Data Flow Diagram

```
┌─────────────┐
│   M01       │  name, email, phone
│   Intake    ├──────────────────────┐
└─────────────┘                      │
                                     ▼
┌─────────────┐                  (Manual)
│   M02       │  email, name, phone, service_type
│   Booking   ├──────────────────────┐
└─────────────┘                      │
                                     ▼
                                booking_id
                                     │
┌─────────────┐                      │
│   M03       │  booking_id, patient_email
│ Telehealth  ├──────────────────────┘
└─────────────┘
       │
       │ session_id
       ▼
┌─────────────┐
│   M04       │  amount, customer_email, description
│   Billing   │  (no automatic link to session)
└─────────────┘
       │
       │ All data written to Google Sheets
       ▼
┌─────────────┐
│   M07       │  Reads: Leads, Bookings, Payments
│  Analytics  │  Generates: Metrics report
└─────────────┘

┌─────────────┐
│   M10       │  Orchestrates: M01 → M02 → M03
│Orchestration│  (Sequential HTTP calls)
└─────────────┘

(M05, M06, M08, M09 are independent utilities)
```

---

## Storage Summary

### Google Sheets Tabs

| Tab Name | Source Module | Row Count (1K users/mo) | Critical? |
|----------|---------------|--------------------------|-----------|
| `Leads` | M01 | ~1,000 | ✅ Yes |
| `Bookings` | M02 | ~300 | ✅ Yes |
| `Sessions` | M03 | ~300 | ✅ Yes |
| `Payments` | M04 | ~300 | ✅ Yes |
| `Campaigns` | M05 | ~10,000 (10/user) | 🟡 Optional |
| `Documents` | M06 | ~100 | 🟡 Optional |
| `Messages` | M08 | ~3,000 (3/user) | 🟡 Optional |
| `AuditLog` | M09 | ~5,000 (5 events/user) | 🟡 Optional |

**Total Annual**: ~240K rows (if all modules used)

**Google Sheets Limits**:
- Max 10M cells per spreadsheet
- Performance degrades after 10K rows

**Recommendation**: Archive logs monthly, keep 3 months live.

---

## Type Definitions (TypeScript Reference)

```typescript
// Common
interface CommonFields {
  timestamp: string;  // ISO 8601
  trace_id: string;   // {PREFIX}-{millis}
  success: boolean;
}

// M01: Intake
interface LeadInput {
  name: string;
  email: string;
  phone: string;
  interest?: string;
  referral_source?: string;
  notes?: string;
}

interface LeadRecord extends CommonFields {
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone_display: string;
  interest: string;
  referral_source: string;
  notes: string;
  status: 'NEW';
}

// M02: Booking
interface BookingInput {
  email: string;
  name: string;
  phone: string;
  service_type: string;
  preferred_date?: string;
  preferred_time?: string;
  timezone?: string;
  notes?: string;
}

interface BookingRecord extends CommonFields {
  booking_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  service_type: string;
  scheduled_time: string;
  duration_minutes: number;
  timezone: string;
  status: 'SCHEDULED';
}

// (Additional types for M03-M10 follow same pattern)
```

---

**Data Dictionary Complete**
**Total Fields Documented**: 100+
**Modules Covered**: 10/10
**Standardization Issues Found**: 8
**Recommendations**: 15
