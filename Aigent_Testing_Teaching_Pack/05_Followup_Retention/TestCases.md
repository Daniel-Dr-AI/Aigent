# Module 05: Follow-Up & Retention - Test Cases

**Module:** 05 - Follow-Up & Retention
**Version:** 1.1.0-enhanced
**Test Cases Version:** 1.0
**Last Updated:** 2025-10-31

---

## Table of Contents

1. [Test Case Summary](#test-case-summary)
2. [Happy Path Tests](#happy-path-tests)
3. [Invalid Input Tests](#invalid-input-tests)
4. [Integration Tests](#integration-tests)
5. [Performance Tests](#performance-tests)
6. [Security Tests](#security-tests)
7. [Edge Case Tests](#edge-case-tests)
8. [Test Execution Tracker](#test-execution-tracker)
9. [Test Results Summary Template](#test-results-summary-template)
10. [Quick Reference: Test Data](#quick-reference-test-data)

---

## Test Case Summary

### Total Test Count by Category

| Category | Test Count | Priority Breakdown | Total Priority Points |
|----------|-----------|-------------------|----------------------|
| Happy Path | 5 | P0: 5 | 50 |
| Invalid Input | 7 | P1: 7 | 35 |
| Integration | 3 | P0: 3 | 30 |
| Performance | 2 | P2: 2 | 10 |
| Security | 1 | P1: 1 | 5 |
| Edge Cases | 4 | P2: 4 | 8 |
| **TOTAL** | **22** | | **138** |

### Priority Definitions

**P0 - Critical:** Must pass before production deployment. Core functionality.

**P1 - High:** Should pass before production. Important validations and integrations.

**P2 - Medium:** Nice to have. Performance and edge cases.

**P3 - Low:** Optional. Future enhancements or rare scenarios.

---

## Happy Path Tests

These tests verify that the module works correctly when everything is set up properly.

---

### TC-HP-001: Complete Sequence Start (Email + SMS)

**Priority:** P0 - Critical

**Category:** Happy Path

**Description:** Verify that a valid patient with complete data triggers the follow-up sequence with both email and SMS delivery on Day 0.

**Prerequisites:**
- Module 05 workflow is active
- SendGrid API key configured
- Twilio credentials configured
- Test email and phone number available

**Test Data:**

```json
{
  "patient_id": "12345",
  "patient_email": "jane.doe@example.com",
  "patient_phone": "+1-555-123-4567",
  "patient_name": "Jane Doe",
  "visit_type": "General Consultation",
  "visit_date": "2025-10-30T14:00:00Z",
  "provider_name": "Dr. Smith"
}
```

**Expected HTTP Response:**

```json
{
  "success": true,
  "trace_id": "FU-1730300400000",
  "patient_id": "12345",
  "sequence_status": "initiated",
  "touches_sent": ["day0_email", "day0_sms"],
  "touch_results": [
    {
      "touch": "day0_email",
      "status": "sent",
      "sent_at": "2025-10-30T14:00:00Z"
    },
    {
      "touch": "day0_sms",
      "status": "sent",
      "sent_at": "2025-10-30T14:00:05Z",
      "sms_sid": "SM123abc..."
    }
  ],
  "survey_link": "https://example.com/survey?email=jane.doe%40example.com&patient_id=12345&trace_id=FU-1730300400000",
  "rebooking_link": "https://example.com/book?patient_id=12345&utm_source=followup&utm_medium=email&utm_campaign=day14_rebook&trace_id=FU-1730300400000",
  "execution_time_ms": 1200,
  "performance_category": "normal"
}
```

**Expected Database/Storage Changes:**
- Google Sheets: New row added with patient_id 12345, trace_id, touches_sent
- n8n execution history: New successful execution

**Expected Notifications:**
- SendGrid: Email delivered to jane.doe@example.com with subject "Thank you for your visit - [Clinic Name]"
- Twilio: SMS delivered to +1-555-123-4567 with message starting "Hi Jane Doe, thank you..."

**Pass Criteria:**

- [x] HTTP status code is 200
- [x] Response has `"success": true`
- [x] `trace_id` starts with "FU-" followed by timestamp
- [x] `touches_sent` contains both "day0_email" and "day0_sms"
- [x] Both touch_results show `"status": "sent"`
- [x] Email delivered (verified in SendGrid Activity)
- [x] SMS delivered (verified in Twilio Logs)
- [x] n8n execution shows "Success" status
- [x] `execution_time_ms` < 3000
- [x] Survey link includes all required parameters
- [x] Rebooking link includes UTM parameters

**Failure Scenarios to Check:**

- Email send failure (SendGrid API error)
- SMS send failure (Twilio API error)
- Phone normalization error
- Link generation error

---

### TC-HP-002: Email-Only Sequence (No Phone)

**Priority:** P0 - Critical

**Category:** Happy Path

**Description:** Verify that the sequence works correctly when no phone number is provided (email-only patients).

**Prerequisites:**
- Module 05 workflow is active
- SendGrid API key configured

**Test Data:**

```json
{
  "patient_id": "12346",
  "patient_email": "john.smith@example.com",
  "patient_name": "John Smith",
  "visit_type": "Follow-up Appointment"
}
```

**Expected HTTP Response:**

```json
{
  "success": true,
  "trace_id": "FU-1730300500000",
  "patient_id": "12346",
  "sequence_status": "initiated",
  "touches_sent": ["day0_email"],
  "touch_results": [
    {
      "touch": "day0_email",
      "status": "sent",
      "sent_at": "2025-10-30T14:05:00Z"
    }
  ]
}
```

**Expected Database/Storage Changes:**
- Google Sheets: New row with email-only sequence
- n8n execution: Successful completion

**Expected Notifications:**
- SendGrid: Email delivered
- Twilio: No SMS attempt (gracefully skipped)

**Pass Criteria:**

- [x] HTTP status code is 200
- [x] Response has `"success": true`
- [x] `touches_sent` contains only "day0_email" (no SMS)
- [x] touch_results array does NOT include day0_sms entry
- [x] Email delivered (verified in SendGrid)
- [x] No SMS sent (verified in Twilio — no record)
- [x] n8n execution shows "Success" (not error)

**Failure Scenarios to Check:**

- Sequence fails because phone is missing (should NOT happen)
- SMS marked as "failed" instead of skipped (should NOT happen)

---

### TC-HP-003: Minimal Required Fields

**Priority:** P0 - Critical

**Category:** Happy Path

**Description:** Verify that the sequence works with only the minimum required fields using default values for optional fields.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "minimal_001",
  "patient_email": "minimal@example.com",
  "visit_type": "Consultation"
}
```

**Expected HTTP Response:**

```json
{
  "success": true,
  "patient_id": "minimal_001",
  "touches_sent": ["day0_email"]
}
```

**Expected Notifications:**
- Email greeting: "Hi Valued Patient," (default name)
- Email content mentions: "Consultation" (visit type)
- Email signature: "Your Provider and the [Clinic Name] Team" (default provider)

**Pass Criteria:**

- [x] HTTP status code is 200
- [x] Response has `"success": true`
- [x] Email delivered with default values
- [x] Email greeting shows "Hi Valued Patient,"
- [x] Email signature shows "Your Provider"
- [x] No validation errors

**Failure Scenarios to Check:**

- Validation fails for missing optional fields (should NOT happen)
- Default values not applied correctly

---

### TC-HP-004: Survey Link Generation

**Priority:** P0 - Critical

**Category:** Happy Path

**Description:** Verify that survey links are generated correctly with all required tracking parameters and proper URL encoding.

**Prerequisites:**
- `SURVEY_BASE_URL` environment variable configured

**Test Data:**

```json
{
  "patient_id": "survey_test_001",
  "patient_email": "survey.test+special@example.com",
  "visit_type": "Test Visit"
}
```

**Expected HTTP Response:**

Survey link should be:
```
https://example.com/survey?email=survey.test%2Bspecial%40example.com&patient_id=survey_test_001&trace_id=FU-1730300600000
```

**Expected Database/Storage Changes:**
- Survey link stored with correct encoding

**Expected Notifications:**
- Email includes clickable survey link

**Pass Criteria:**

- [x] Response includes `survey_link` field
- [x] Survey link starts with configured `SURVEY_BASE_URL`
- [x] Email parameter is URL-encoded (+ becomes %2B, @ becomes %40)
- [x] Survey link includes `patient_id=survey_test_001`
- [x] Survey link includes `trace_id=FU-...`
- [x] All parameters are present and correctly encoded

**Failure Scenarios to Check:**

- URL encoding missing or incorrect
- Missing tracking parameters
- Survey link not clickable in email

---

### TC-HP-005: Rebooking Link with UTM Tracking

**Priority:** P0 - Critical

**Category:** Happy Path

**Description:** Verify that rebooking links include proper UTM tracking parameters for marketing attribution.

**Prerequisites:**
- `REBOOKING_LINK` environment variable configured

**Test Data:**

```json
{
  "patient_id": "rebook_test_001",
  "patient_email": "rebook@example.com",
  "visit_type": "General Consultation"
}
```

**Expected HTTP Response:**

Rebooking link should be:
```
https://example.com/book?patient_id=rebook_test_001&utm_source=followup&utm_medium=email&utm_campaign=day14_rebook&trace_id=FU-1730300700000
```

**Expected Database/Storage Changes:**
- Rebooking link stored with UTM parameters

**Expected Notifications:**
- Day-14 email will include this rebooking link

**Pass Criteria:**

- [x] Response includes `rebooking_link` field
- [x] Link includes `utm_source=followup`
- [x] Link includes `utm_medium=email`
- [x] Link includes `utm_campaign=day14_rebook`
- [x] Link includes `patient_id=rebook_test_001`
- [x] Link includes `trace_id=FU-...`

**Failure Scenarios to Check:**

- Missing UTM parameters
- UTM values incorrect
- Link not clickable in email

---

## Invalid Input Tests

These tests verify that the module correctly rejects invalid or incomplete data.

---

### TC-INV-001: Missing patient_email

**Priority:** P1 - High

**Category:** Invalid Input

**Description:** Verify that the module rejects requests without a patient email address.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "12347",
  "patient_name": "Test Patient",
  "visit_type": "Consultation"
}
```

**Expected HTTP Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      "patient_email: required and must be valid email format"
    ],
    "trace_id": "ERR-1730300800000"
  },
  "validated_at": "2025-10-30T14:20:00Z"
}
```

**Expected Database/Storage Changes:**
- No record created

**Expected Notifications:**
- No email sent
- No SMS sent

**Pass Criteria:**

- [x] HTTP status code is 400 (Bad Request)
- [x] Response has `"success": false`
- [x] Error code is "VALIDATION_FAILED"
- [x] Error details mention "patient_email: required"
- [x] No email sent (verified in SendGrid)
- [x] No SMS sent (verified in Twilio)
- [x] n8n execution shows validation error path

**Failure Scenarios to Check:**

- Validation passes when it shouldn't (critical bug)
- Wrong HTTP status code returned

---

### TC-INV-002: Invalid Email Format

**Priority:** P1 - High

**Category:** Invalid Input

**Description:** Verify that the module rejects invalid email addresses.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "12348",
  "patient_email": "not-an-email",
  "visit_type": "Consultation"
}
```

**Expected HTTP Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "details": [
      "patient_email: required and must be valid email format"
    ]
  }
}
```

**Expected Database/Storage Changes:**
- No record created

**Expected Notifications:**
- No email sent
- No SMS sent

**Pass Criteria:**

- [x] HTTP status code is 400
- [x] Validation error mentions invalid email format
- [x] No communications sent

**Failure Scenarios to Check:**

- Invalid emails pass validation (security risk)

---

### TC-INV-003: Email Too Long (>320 characters)

**Priority:** P1 - High

**Category:** Invalid Input

**Description:** Verify that the module rejects emails exceeding RFC 5321 maximum length.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "12349",
  "patient_email": "this-is-a-very-long-email-address-that-exceeds-the-maximum-allowed-length-of-320-characters-according-to-rfc-5321-specifications-for-email-addresses-and-should-be-rejected-by-the-validation-logic-to-prevent-issues-with-email-delivery-systems-that-cannot-handle-such-long-addresses-properly-test@example.com",
  "visit_type": "Consultation"
}
```

**Expected HTTP Response:**

```json
{
  "success": false,
  "error": {
    "details": [
      "patient_email: maximum 320 characters (RFC 5321)"
    ]
  }
}
```

**Expected Database/Storage Changes:**
- No record created

**Expected Notifications:**
- No communications sent

**Pass Criteria:**

- [x] HTTP status code is 400
- [x] Error mentions 320 character limit
- [x] No communications sent

**Failure Scenarios to Check:**

- Long emails accepted (causes delivery failures later)

---

### TC-INV-004: Missing patient_id

**Priority:** P1 - High

**Category:** Invalid Input

**Description:** Verify that the module rejects requests without a patient ID.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_email": "test@example.com",
  "visit_type": "Consultation"
}
```

**Expected HTTP Response:**

```json
{
  "success": false,
  "error": {
    "details": [
      "patient_id: required for CRM linking"
    ]
  }
}
```

**Expected Database/Storage Changes:**
- No record created

**Expected Notifications:**
- No communications sent

**Pass Criteria:**

- [x] HTTP status code is 400
- [x] Error mentions patient_id is required
- [x] No communications sent

**Failure Scenarios to Check:**

- Sequence starts without patient_id (breaks CRM linking)

---

### TC-INV-005: Missing visit_type

**Priority:** P1 - High

**Category:** Invalid Input

**Description:** Verify that the module rejects requests without a visit type.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "12350",
  "patient_email": "test@example.com"
}
```

**Expected HTTP Response:**

```json
{
  "success": false,
  "error": {
    "details": [
      "visit_type: required for message personalization"
    ]
  }
}
```

**Expected Database/Storage Changes:**
- No record created

**Expected Notifications:**
- No communications sent

**Pass Criteria:**

- [x] HTTP status code is 400
- [x] Error mentions visit_type is required

**Failure Scenarios to Check:**

- Email sent without visit type (broken personalization)

---

### TC-INV-006: Phone Number Too Short

**Priority:** P1 - High

**Category:** Invalid Input

**Description:** Verify that phone numbers with fewer than 7 digits are rejected.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "12351",
  "patient_email": "test@example.com",
  "patient_phone": "12345",
  "visit_type": "Consultation"
}
```

**Expected HTTP Response:**

```json
{
  "success": false,
  "error": {
    "details": [
      "patient_phone: must be 7-20 digits"
    ]
  }
}
```

**Expected Database/Storage Changes:**
- No record created

**Expected Notifications:**
- No communications sent

**Pass Criteria:**

- [x] HTTP status code is 400
- [x] Error mentions phone must be 7-20 digits

**Failure Scenarios to Check:**

- Invalid phone numbers pass (SMS delivery fails)

---

### TC-INV-007: Future Visit Date

**Priority:** P1 - High

**Category:** Invalid Input

**Description:** Verify that visit dates in the future are rejected.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "12352",
  "patient_email": "test@example.com",
  "visit_type": "Consultation",
  "visit_date": "2026-12-31T00:00:00Z"
}
```

**Expected HTTP Response:**

```json
{
  "success": false,
  "error": {
    "details": [
      "visit_date: cannot be in the future"
    ]
  }
}
```

**Expected Database/Storage Changes:**
- No record created

**Expected Notifications:**
- No communications sent

**Pass Criteria:**

- [x] HTTP status code is 400
- [x] Error mentions visit date cannot be in future

**Failure Scenarios to Check:**

- Future dates accepted (follow-ups sent before visit happens)

---

## Integration Tests

These tests verify that Module 05 integrates correctly with external services.

---

### TC-INT-001: SendGrid Email Delivery

**Priority:** P0 - Critical

**Category:** Integration

**Description:** Verify that emails are successfully delivered through SendGrid with proper personalization.

**Prerequisites:**
- SendGrid API key configured
- SendGrid account active
- "From" email verified in SendGrid

**Test Data:**

Use same data as TC-HP-001.

**Expected HTTP Response:**

Day-0 email touch shows `"status": "sent"`

**Expected Database/Storage Changes:**
- SendGrid Activity shows email record

**Expected Notifications:**
- Email delivered within 5 seconds
- Status: "Delivered" (not bounced)
- Subject: "Thank you for your visit - [Clinic Name]"
- Body includes patient name, visit type, provider name

**Pass Criteria:**

- [x] Email appears in SendGrid Activity within 5 seconds
- [x] Status is "Delivered" (green)
- [x] Email content is properly personalized
- [x] No bounce or spam report
- [x] Click tracking enabled (if configured)

**Failure Scenarios to Check:**

- SendGrid API key invalid
- Email bounced (invalid recipient)
- Email marked as spam
- Personalization failed (shows template variables)

---

### TC-INT-002: Twilio SMS Delivery

**Priority:** P0 - Critical

**Category:** Integration

**Description:** Verify that SMS messages are successfully delivered through Twilio with proper formatting.

**Prerequisites:**
- Twilio Account SID and Auth Token configured
- Twilio phone number active
- Twilio account has sufficient credits

**Test Data:**

Use same data as TC-HP-001.

**Expected HTTP Response:**

Day-0 SMS touch shows `"status": "sent"` with `sms_sid` included.

**Expected Database/Storage Changes:**
- Twilio Logs show message record

**Expected Notifications:**
- SMS delivered within 30 seconds
- Status: "Delivered" (green)
- Message: "Hi [Patient Name], thank you for your visit to [Clinic Name]..."
- From: Your configured Twilio number

**Pass Criteria:**

- [x] SMS appears in Twilio Logs within 10 seconds
- [x] Status is "Delivered" (green)
- [x] SMS content is properly personalized
- [x] Message sent from correct Twilio number
- [x] No error codes
- [x] Price charged is visible

**Failure Scenarios to Check:**

- Twilio credentials invalid
- Phone number invalid or undeliverable
- Insufficient account balance
- SMS blocked by carrier

---

### TC-INT-003: Google Sheets Logging

**Priority:** P0 - Critical

**Category:** Integration

**Description:** Verify that follow-up sequence data is logged to Google Sheets.

**Prerequisites:**
- Google Sheets integration configured in workflow
- Spreadsheet has "Follow-Up Sequences" tab
- Service account has write permissions

**Test Data:**

Use same data as TC-HP-001.

**Expected HTTP Response:**

Standard success response.

**Expected Database/Storage Changes:**

New row added to Google Sheets with:

| trace_id | patient_id | patient_email | sequence_status | touches_sent | created_at |
|----------|-----------|---------------|-----------------|--------------|------------|
| FU-1730... | 12345 | jane.doe@... | initiated | day0_email, day0_sms | 2025-10-30... |

**Expected Notifications:**
- None specific to this test

**Pass Criteria:**

- [x] New row appears in spreadsheet within 10 seconds
- [x] All columns populated correctly
- [x] trace_id matches response
- [x] touches_sent lists both email and SMS
- [x] No duplicate rows

**Failure Scenarios to Check:**

- Google Sheets integration disabled
- Service account permissions missing
- Spreadsheet tab not found
- Row not written

---

## Performance Tests

These tests verify that the module performs within acceptable time limits.

---

### TC-PERF-001: Execution Time (Day-0 Response)

**Priority:** P2 - Medium

**Category:** Performance

**Description:** Verify that the module responds within 3 seconds for Day-0 sequence initialization.

**Prerequisites:**
- Module 05 workflow is active
- Normal network conditions

**Test Data:**

```json
{
  "patient_id": "perf_test_001",
  "patient_email": "perf@example.com",
  "visit_type": "Performance Test"
}
```

**Expected HTTP Response:**

```json
{
  "success": true,
  "execution_time_ms": 1200,
  "performance_category": "normal"
}
```

**Expected Database/Storage Changes:**
- Standard storage writes

**Expected Notifications:**
- Email sent within timing window

**Pass Criteria:**

- [x] Total execution time (measured with `time` command) < 3000ms
- [x] Response includes `execution_time_ms` field
- [x] `execution_time_ms` < 2000ms (normal performance)
- [x] `performance_category` is "fast" or "normal" (not "slow")

**Performance Categories:**
- fast: <1000ms
- normal: 1000-3000ms
- slow: >3000ms

**Failure Scenarios to Check:**

- Execution time >5000ms (investigate causes)
- SendGrid/Twilio API delays
- n8n server overload

---

### TC-PERF-002: Concurrent Sequences

**Priority:** P2 - Medium

**Category:** Performance

**Description:** Verify that the module can handle 5 sequences starting simultaneously.

**Prerequisites:**
- Module 05 workflow is active
- Sufficient server resources

**Test Data:**

5 requests with different patient_ids (concurrent_1 through concurrent_5).

**Expected HTTP Response:**

All 5 requests return `"success": true` within 5 seconds total.

**Expected Database/Storage Changes:**
- 5 records created in Google Sheets
- 5 successful executions in n8n

**Expected Notifications:**
- 5 emails sent (verified in SendGrid)
- No delivery failures

**Pass Criteria:**

- [x] All 5 requests return `"success": true`
- [x] Total time for all 5 < 5 seconds
- [x] No execution failures in n8n
- [x] All 5 emails sent (check SendGrid)
- [x] No server errors or timeouts

**Failure Scenarios to Check:**

- Some requests timeout
- Server runs out of resources
- Executions queue and delay

---

## Security Tests

These tests verify that the module protects patient data appropriately.

---

### TC-SEC-001: PHI Masking Verification

**Priority:** P1 - High

**Category:** Security

**Description:** Verify that no Protected Health Information (PHI) appears in logs or error messages inappropriately.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "sec_test_001",
  "patient_email": "security.test@example.com",
  "patient_phone": "+1-555-999-8888",
  "patient_name": "Security Test Patient",
  "visit_type": "Security Verification Visit"
}
```

**Expected HTTP Response:**

Standard success response.

**Expected Database/Storage Changes:**
- Patient data stored correctly in Google Sheets (expected)

**Expected Notifications:**
- Email sent with patient data (expected for delivery)

**Pass Criteria:**

- [x] n8n execution log shows data correctly (expected for debugging)
- [x] No patient data in server console logs
- [x] Error messages (if any) don't expose patient names or contact info
- [x] Trace_id used for correlation instead of patient identifiers in logs

**Note:** Module 05 handles marketing communications (not clinical PHI), so data visibility in execution logs is acceptable. However, server-side console logs should not log patient contact information.

**Failure Scenarios to Check:**

- Patient names/emails appear in console logs
- Error messages expose PHI
- Logs show full phone numbers unnecessarily

---

## Edge Case Tests

These tests verify unusual but valid scenarios.

---

### TC-EDGE-001: International Characters in Name

**Priority:** P2 - Medium

**Category:** Edge Case

**Description:** Verify that patient names with international characters (accents, umlauts, etc.) are handled correctly.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "edge_001",
  "patient_email": "international@example.com",
  "patient_name": "José García-Pérez",
  "visit_type": "Consultation"
}
```

**Expected HTTP Response:**

```json
{
  "success": true,
  "patient_id": "edge_001"
}
```

**Expected Database/Storage Changes:**
- Name stored with correct accents

**Expected Notifications:**
- Email greeting: "Hi José García-Pérez," (accents intact)

**Pass Criteria:**

- [x] HTTP response has `"success": true`
- [x] Email delivered successfully
- [x] Email greeting shows name with correct accents
- [x] No character encoding errors
- [x] Name stored correctly in database

**Failure Scenarios to Check:**

- Accents become garbled (encoding issue)
- Validation rejects international characters

---

### TC-EDGE-002: Very Long Visit Type

**Priority:** P2 - Medium

**Category:** Edge Case

**Description:** Verify that long visit types (up to 200 characters) are handled correctly.

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "edge_002",
  "patient_email": "longvisit@example.com",
  "visit_type": "Comprehensive Annual Physical Exam with Full Blood Panel, Cardiovascular Screening, Cancer Screening, Mental Health Assessment, Nutritional Counseling, and Preventive Care Planning"
}
```

**Expected HTTP Response:**

```json
{
  "success": true,
  "patient_id": "edge_002"
}
```

**Expected Database/Storage Changes:**
- Full visit type stored

**Expected Notifications:**
- Email shows full visit type correctly
- Email formatting not broken by long text

**Pass Criteria:**

- [x] HTTP response has `"success": true`
- [x] Email shows full visit type correctly
- [x] Email formatting is not broken by long text

**Failure Scenarios to Check:**

- Text truncated unexpectedly
- Email layout broken

---

### TC-EDGE-003: Phone Number Various Formats

**Priority:** P2 - Medium

**Category:** Edge Case

**Description:** Verify that phone numbers in different formats are normalized correctly to E.164 format.

**Test Cases:**

| Format | Input | Expected Normalized | Expected Display |
|--------|-------|---------------------|------------------|
| US Standard | (555) 123-4567 | 15551234567 | (555) 123-4567 |
| E.164 | +15551234567 | 15551234567 | +15551234567 |
| Digits Only | 5551234567 | 15551234567 | 5551234567 |
| International | +44 20 7946 0958 | 442079460958 | +44 20 7946 0958 |

**Prerequisites:**
- Module 05 workflow is active
- Twilio configured

**Test Data (US Standard format):**

```json
{
  "patient_id": "edge_003",
  "patient_email": "phone@example.com",
  "patient_phone": "(555) 123-4567",
  "visit_type": "Test"
}
```

**Expected HTTP Response:**

```json
{
  "success": true,
  "touches_sent": ["day0_email", "day0_sms"]
}
```

**Expected Database/Storage Changes:**
- Phone stored in normalized format

**Expected Notifications:**
- SMS sent successfully
- Twilio logs show "To" number as +15551234567 (E.164)

**Pass Criteria:**

- [x] SMS sent successfully (check Twilio)
- [x] Twilio shows "To" number in E.164 format (+15551234567)
- [x] Original format preserved in response display field

**Test each format above separately.**

**Failure Scenarios to Check:**

- Phone normalization fails
- SMS not delivered due to formatting
- International numbers rejected

---

### TC-EDGE-004: Empty String vs Null for Optional Fields

**Priority:** P2 - Medium

**Category:** Edge Case

**Description:** Verify that empty strings are treated the same as null for optional fields (defaults applied).

**Prerequisites:**
- Module 05 workflow is active

**Test Data:**

```json
{
  "patient_id": "edge_004",
  "patient_email": "empty@example.com",
  "patient_name": "",
  "patient_phone": "",
  "provider_name": "",
  "visit_type": "Test"
}
```

**Expected HTTP Response:**

```json
{
  "success": true,
  "patient_id": "edge_004",
  "touches_sent": ["day0_email"]
}
```

**Expected Database/Storage Changes:**
- Defaults applied and stored

**Expected Notifications:**
- Email greeting: "Hi Valued Patient," (default applied)
- Email signature: "Your Provider" (default applied)
- No SMS sent (empty phone treated as null)

**Pass Criteria:**

- [x] HTTP response has `"success": true`
- [x] Email greeting shows "Hi Valued Patient,"
- [x] Email signature shows "Your Provider"
- [x] No SMS sent (phone is empty)
- [x] No validation errors

**Failure Scenarios to Check:**

- Empty strings cause validation errors
- Defaults not applied
- Empty phone triggers SMS attempt

---

## Test Execution Tracker

Use this tracker to monitor your testing progress:

### Happy Path Tests

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-HP-001 | Complete Sequence Start | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-HP-002 | Email-Only Sequence | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-HP-003 | Minimal Required Fields | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-HP-004 | Survey Link Generation | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-HP-005 | Rebooking Link UTM | [ ] Not Run / [ ] Pass / [ ] Fail | | |

### Invalid Input Tests

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-INV-001 | Missing patient_email | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-INV-002 | Invalid Email Format | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-INV-003 | Email Too Long | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-INV-004 | Missing patient_id | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-INV-005 | Missing visit_type | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-INV-006 | Phone Too Short | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-INV-007 | Future Visit Date | [ ] Not Run / [ ] Pass / [ ] Fail | | |

### Integration Tests

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-INT-001 | SendGrid Delivery | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-INT-002 | Twilio SMS Delivery | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-INT-003 | Google Sheets Logging | [ ] Not Run / [ ] Pass / [ ] Fail | | |

### Performance Tests

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-PERF-001 | Execution Time | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-PERF-002 | Concurrent Sequences | [ ] Not Run / [ ] Pass / [ ] Fail | | |

### Security Tests

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-SEC-001 | PHI Masking | [ ] Not Run / [ ] Pass / [ ] Fail | | |

### Edge Case Tests

| Test ID | Test Name | Status | Result | Notes |
|---------|-----------|--------|--------|-------|
| TC-EDGE-001 | International Characters | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-EDGE-002 | Long Visit Type | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-EDGE-003 | Phone Formats | [ ] Not Run / [ ] Pass / [ ] Fail | | |
| TC-EDGE-004 | Empty vs Null | [ ] Not Run / [ ] Pass / [ ] Fail | | |

---

## Test Results Summary Template

Use this template to summarize your test results:

### Test Execution Summary

**Date:** _________________

**Tester:** _________________

**Module Version:** 1.1.0-enhanced

**Environment:** Development / Staging / Production (circle one)

### Overall Results

| Category | Total Tests | Passed | Failed | Skipped | Pass Rate |
|----------|------------|--------|--------|---------|-----------|
| Happy Path | 5 | | | | |
| Invalid Input | 7 | | | | |
| Integration | 3 | | | | |
| Performance | 2 | | | | |
| Security | 1 | | | | |
| Edge Cases | 4 | | | | |
| **TOTAL** | **22** | | | | |

### Critical Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Performance Metrics

- Average execution time: _________ ms
- Fastest execution: _________ ms
- Slowest execution: _________ ms
- Email delivery rate: _________ %
- SMS delivery rate: _________ %

### Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Sign-Off

**Tester Signature:** _________________

**Date:** _________________

**Status:** Ready for Production / Needs Rework (circle one)

---

## Quick Reference: Test Data

### Valid Test Emails

Use these for testing:
- jane.doe@example.com
- john.smith@example.com
- test.user@example.com

### Valid Test Phone Numbers

Use these for testing (won't actually send SMS):
- +1-555-123-4567
- +1-555-999-8888
- +1-555-000-0000

### Required Fields

Always include:
1. patient_id
2. patient_email
3. visit_type

### Optional Fields

Can omit (defaults applied):
- patient_name → "Valued Patient"
- provider_name → "Your Provider"
- visit_date → Current timestamp
- patient_phone → Skips SMS

### Environment Variables to Check

- SENDGRID_API_KEY
- SENDGRID_FROM_EMAIL
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- SURVEY_BASE_URL
- REBOOKING_LINK
- CLINIC_NAME

---

**End of Test Cases**

For step-by-step testing instructions, see [TestPlan.md](TestPlan.md).

For monitoring and observability guidance, see [Observability.md](Observability.md).

For troubleshooting help, see [Troubleshooting.md](Troubleshooting.md).
