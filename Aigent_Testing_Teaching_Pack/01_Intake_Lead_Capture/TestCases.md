# Module 01: Intake & Lead Capture - Test Cases

**Module:** 01 - Intake & Lead Capture
**Version:** 1.1.0-enhanced
**Test Cases Version:** 1.0
**Last Updated:** 2025-10-31

---

## Purpose of This Document

This document lists **all individual test cases** for Module 01 in a structured, easy-to-reference format.

**Use this document to:**
- Quickly find a specific test
- Check expected inputs and outputs
- Track which tests you've completed
- Reference test data for bug reports

**Companion document:** See `TestPlan.md` for step-by-step instructions on HOW to run each test.

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
| Happy Path | 3 | 2 | 1 | 0 | 0 |
| Invalid Input | 5 | 5 | 0 | 0 | 0 |
| Edge Case | 4 | 0 | 2 | 2 | 0 |
| Integration | 3 | 1 | 2 | 0 | 0 |
| Performance | 1 | 0 | 1 | 0 | 0 |
| Security | 1 | 1 | 0 | 0 | 0 |
| **TOTAL** | **17** | **9** | **6** | **2** | **0** |

---

## Happy Path Test Cases

### TC-HP-001: Submit Valid Lead (Complete Data)

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 5 minutes

**Description:**
Submit a lead with all fields populated correctly. This is the most common scenario.

**Prerequisites:**
- Workflow is active
- Google Sheets configured
- Notification webhook configured

**Test Data:**
```json
{
  "name": "Alice Anderson",
  "email": "alice.anderson.test@example.com",
  "phone": "+15551234001",
  "source": "website",
  "message": "I'm interested in scheduling a consultation next week.",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "spring_2025"
}
```

**Expected HTTP Response:**
```json
{
  "status": "success",
  "message": "Lead captured successfully",
  "lead_id": "L-YYYYMMDD-XXX",
  "execution_time_ms": 1000-3000
}
```

**Expected Google Sheets Entry:**
- Row added with all fields
- Phone normalized to E.164 (+15551234001)
- Lead score: 70-80 (high quality lead)
- Timestamp: Current date/time

**Expected Notification:**
- Slack/Teams message appears within 5 seconds
- Contains masked email: `a***n@example.com`
- Contains masked phone: `***-***-4001`
- Shows lead score

**Pass Criteria:**
- ✅ HTTP 200 status with success response
- ✅ Google Sheets row created correctly
- ✅ Notification sent
- ✅ All data fields match input
- ✅ Execution completes in <5 seconds

**Failure Scenarios to Check:**
- ❌ If HTTP 500: Check workflow execution logs
- ❌ If no Sheets row: Check Google Sheets credential
- ❌ If no notification: Check webhook URL (non-blocking, should still succeed)

---

### TC-HP-002: Submit Valid Lead (Minimal Data)

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 3 minutes

**Description:**
Submit a lead with only required fields (name, email, phone). Optional fields should be handled gracefully.

**Test Data:**
```json
{
  "name": "Bob Builder",
  "email": "bob.builder.test@example.com",
  "phone": "(555) 123-4002"
}
```

**Expected HTTP Response:**
```json
{
  "status": "success",
  "message": "Lead captured successfully",
  "lead_id": "L-YYYYMMDD-XXX"
}
```

**Expected Google Sheets Entry:**
- Name, email, phone populated
- Phone normalized: `+15551234002`
- Source: Empty or "unknown"
- Message: Empty
- UTM fields: Empty
- Lead score: 30-40 (lower due to missing data)

**Pass Criteria:**
- ✅ Lead accepted despite minimal data
- ✅ Optional fields don't cause errors
- ✅ Phone number normalized correctly
- ✅ Lower lead score reflects data completeness

---

### TC-HP-003: Phone Number Normalization

**Priority:** P1 (High)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 5 minutes (run 5 sub-tests)

**Description:**
Verify various phone number formats are normalized to E.164 standard.

**Sub-Tests:**

**TC-HP-003a:** Phone with spaces
```json
{"name": "Test 1", "email": "test1@example.com", "phone": "555 123 4567"}
```
Expected normalized: `+15551234567`

**TC-HP-003b:** Phone with dashes
```json
{"name": "Test 2", "email": "test2@example.com", "phone": "555-123-4567"}
```
Expected normalized: `+15551234567`

**TC-HP-003c:** Phone with parentheses
```json
{"name": "Test 3", "email": "test3@example.com", "phone": "(555) 123-4567"}
```
Expected normalized: `+15551234567`

**TC-HP-003d:** Phone with dots
```json
{"name": "Test 4", "email": "test4@example.com", "phone": "555.123.4567"}
```
Expected normalized: `+15551234567`

**TC-HP-003e:** Phone already in E.164
```json
{"name": "Test 5", "email": "test5@example.com", "phone": "+15551234567"}
```
Expected normalized: `+15551234567` (unchanged)

**Pass Criteria:**
- ✅ All 5 formats result in identical normalized phone: `+15551234567`
- ✅ All leads accepted successfully
- ✅ Google Sheets shows consistent format across all entries

---

## Invalid Input Test Cases

### TC-INV-001: Missing Email

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 2 minutes

**Description:**
Verify leads are rejected when email is missing.

**Test Data:**
```json
{
  "name": "No Email",
  "phone": "+15556661001",
  "source": "website"
}
```

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["email is required"],
  "support_email": "support@yourdomain.com"
}
```

**Expected Google Sheets:**
- No new row created

**Expected Notification:**
- No notification sent

**Pass Criteria:**
- ✅ HTTP 400 (Bad Request) or similar error status
- ✅ Clear error message about missing email
- ✅ Invalid data NOT saved to Google Sheets
- ✅ Support email provided in response

---

### TC-INV-002: Invalid Email Format

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 3 minutes (run 3 sub-tests)

**Description:**
Verify email validation rejects malformed addresses.

**Sub-Tests:**

**TC-INV-002a:** Not an email
```json
{"name": "Bad Email 1", "email": "not-an-email", "phone": "+15556661002"}
```
Expected: Error - "invalid email format"

**TC-INV-002b:** Missing @ symbol
```json
{"name": "Bad Email 2", "email": "bademail.com", "phone": "+15556661003"}
```
Expected: Error - "invalid email format"

**TC-INV-002c:** Missing domain
```json
{"name": "Bad Email 3", "email": "bad@", "phone": "+15556661004"}
```
Expected: Error - "invalid email format"

**Pass Criteria:**
- ✅ All three formats rejected
- ✅ Consistent error message
- ✅ No data saved to Google Sheets

---

### TC-INV-003: Missing Phone Number

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 2 minutes

**Description:**
Verify leads are rejected when phone is missing.

**Test Data:**
```json
{
  "name": "No Phone",
  "email": "no.phone.test@example.com",
  "source": "website"
}
```

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["phone is required"]
}
```

**Pass Criteria:**
- ✅ Error response
- ✅ Clear message about missing phone
- ✅ No data saved

---

### TC-INV-004: Phone Number Too Short

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 2 minutes

**Description:**
Verify phone validation catches incomplete numbers.

**Test Data:**
```json
{
  "name": "Short Phone",
  "email": "short.phone@example.com",
  "phone": "123"
}
```

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["phone number too short (minimum 7 digits)"]
}
```

**Pass Criteria:**
- ✅ Rejected with clear error
- ✅ Minimum length enforced (7 digits)

---

### TC-INV-005: Missing Name

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 2 minutes

**Description:**
Verify leads are rejected when name is missing.

**Test Data:**
```json
{
  "email": "no.name@example.com",
  "phone": "+15556661005"
}
```

**Expected HTTP Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["name is required"]
}
```

**Pass Criteria:**
- ✅ Error response
- ✅ Name requirement enforced
- ✅ No data saved

---

## Edge Case Test Cases

### TC-EDGE-001: Very Long Name

**Priority:** P1 (High)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 3 minutes

**Description:**
Verify system handles long names without truncation or errors.

**Test Data:**
```json
{
  "name": "Maximiliana-Alexandrina-Christophina-Josephina Van Der Hoogenstraaten-Smythe-Worthington III",
  "email": "very.long.name.test@example.com",
  "phone": "+15555551001"
}
```

**Pass Criteria:**
- ✅ Lead accepted
- ✅ Full name preserved in Google Sheets
- ✅ No truncation errors
- ✅ Notification handles long name (may truncate gracefully with "...")

**Known Limitation:**
- Slack has a message length limit (~4000 chars)
- Very long names may be truncated in notifications only
- This is acceptable as long as full data is in Google Sheets

---

### TC-EDGE-002: Special Characters in Name

**Priority:** P1 (High)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 3 minutes

**Description:**
Verify Unicode and special characters (accents, apostrophes, hyphens) work correctly.

**Test Data:**
```json
{
  "name": "François O'Reilly-Müller",
  "email": "francois.oreilly@example.com",
  "phone": "+15555551003"
}
```

**Pass Criteria:**
- ✅ Special characters (ç, ', ü, -) preserved
- ✅ No encoding errors
- ✅ Displays correctly in Google Sheets
- ✅ Displays correctly in notifications

**Characters to verify:**
- Accented letters: ç, ü, é, ñ, etc.
- Apostrophes: ' (O'Brien, D'Angelo)
- Hyphens: - (double-barreled surnames)

---

### TC-EDGE-003: Email with Plus Addressing

**Priority:** P2 (Medium)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 2 minutes

**Description:**
Verify email aliases (user+tag@domain.com) are valid and not truncated.

**Test Data:**
```json
{
  "name": "Test User",
  "email": "test.user+tag123@example.com",
  "phone": "+15555551006"
}
```

**Pass Criteria:**
- ✅ Email with + symbol accepted
- ✅ Full email saved (not truncated at +)
- ✅ Gmail-style plus addressing supported

**Why this matters:**
Users often use plus addressing for tracking (e.g., `myemail+website@gmail.com` to track which form submitted).

---

### TC-EDGE-004: International Phone Number

**Priority:** P2 (Medium)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 3 minutes

**Description:**
Verify non-US phone numbers are accepted and stored correctly.

**Test Data:**
```json
{
  "name": "Yuki Tanaka",
  "email": "yuki.tanaka.test@example.com",
  "phone": "+81312345678"
}
```

**Expected Result:**
- Phone stored as: `+81312345678` (Japan country code +81)

**Pass Criteria:**
- ✅ International phone accepted
- ✅ Country code preserved
- ✅ E.164 format maintained
- ✅ No US-specific validation applied

**Additional Test Cases (Optional):**
- UK: `+442071234567`
- Australia: `+61212345678`
- Germany: `+493012345678`

---

## Integration Test Cases

### TC-INT-001: Google Sheets Data Persistence

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 5 minutes

**Description:**
Verify all lead data is written to Google Sheets correctly and persistently.

**Test Steps:**
1. Clear Google Sheets (optional, for clean test)
2. Submit 3 leads: TC-HP-001, TC-HP-002, TC-HP-003a
3. Wait 10 seconds
4. Verify Google Sheets contains exactly 3 rows

**Pass Criteria:**
- ✅ All 3 leads appear in Google Sheets
- ✅ Data matches submitted values
- ✅ Phone numbers normalized
- ✅ Timestamps accurate
- ✅ Lead scores vary based on completeness
- ✅ No duplicate entries

**Columns to verify:**
- Lead ID (unique for each)
- Name (exact match)
- Email (exact match)
- Phone (normalized)
- Source
- Message
- UTM Source, Medium, Campaign
- Created Date/Time
- Lead Score (0-100)

---

### TC-INT-002: Slack/Teams Notification Delivery

**Priority:** P1 (High)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 3 minutes

**Description:**
Verify notifications are sent for each valid lead.

**Test Steps:**
1. Note current message count in Slack/Teams channel
2. Submit 2 valid leads (TC-HP-001, TC-HP-002)
3. Check notification channel

**Pass Criteria:**
- ✅ 2 new notifications appear within 5 seconds
- ✅ Each notification contains:
  - Lead name
  - Masked email (e.g., `a***n@example.com`)
  - Masked phone (last 4 digits)
  - Source
  - Lead score
- ✅ Notifications are properly formatted
- ✅ No sensitive data exposed (PHI masking works)

**Non-Blocking Behavior:**
- ⚠️ If notifications fail, lead capture should still succeed
- This is controlled by `continueOnFail: true` setting
- Check Google Sheets to confirm lead was saved even if notification failed

---

### TC-INT-003: HubSpot CRM Sync (Optional)

**Priority:** P1 (High)
**Difficulty:** ⭐⭐⭐ Advanced
**Estimated Time:** 5 minutes

**Prerequisites:**
- HubSpot account configured
- `HUBSPOT_CREDENTIAL_ID` environment variable set
- HubSpot integration enabled in workflow

**Skip if:** Not using HubSpot or using different CRM

**Test Data:**
Use Alice Anderson from TC-HP-001

**Test Steps:**
1. Submit lead via webhook
2. Wait 10 seconds
3. Open HubSpot → Contacts
4. Search for `alice.anderson.test@example.com`

**Pass Criteria:**
- ✅ Contact exists in HubSpot
- ✅ All fields populated correctly:
  - First Name: Alice
  - Last Name: Anderson
  - Email: alice.anderson.test@example.com
  - Phone: +15551234001
  - Lead Source: website
  - UTM parameters populated
- ✅ Lead score matches Google Sheets value
- ✅ Created timestamp matches

**Error Handling:**
- If HubSpot sync fails, verify `continueOnFail: true` allows Google Sheets save to proceed
- Check workflow execution for HubSpot-specific errors

---

## Performance Test Cases

### TC-PERF-001: Execution Time Benchmark

**Priority:** P1 (High)
**Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 10 minutes

**Description:**
Measure workflow execution time under normal conditions.

**Test Steps:**
1. Submit 10 leads rapidly (use TestData_Generators.js or repeat TC-HP-001)
2. Record `execution_time_ms` from each response
3. Calculate average, min, max execution times

**Pass Criteria:**

**Performance Targets:**
- ✅ **Fast:** <2000ms (2 seconds) — 80% of executions
- ✅ **Normal:** 2000-5000ms (2-5 seconds) — acceptable
- ⚠️ **Slow:** >5000ms (5 seconds) — investigate
- ❌ **Very Slow:** >10000ms (10 seconds) — performance issue

**Expected Average:** 2000-3000ms

**Factors Affecting Performance:**
- Google Sheets API latency (~500-1000ms)
- HubSpot API latency (~500-1500ms if enabled)
- Slack/Teams webhook latency (~200-500ms)
- Network conditions
- n8n server load

**What to Check If Slow:**
- Network connectivity
- External API status (Google, HubSpot, Slack)
- Workflow timeout settings (`WORKFLOW_TIMEOUT_MS`)
- Concurrent executions (`MAX_PARALLEL_EXECUTIONS`)

---

## Security Test Cases

### TC-SEC-001: PHI Masking in Notifications

**Priority:** P0 (Critical)
**Difficulty:** ⭐ Beginner
**Estimated Time:** 3 minutes

**Description:**
Verify sensitive data (PHI) is masked in Slack/Teams notifications but preserved in Google Sheets.

**Test Data:**
```json
{
  "name": "Security Test Patient",
  "email": "security.test.patient@example.com",
  "phone": "+15559998888"
}
```

**Expected Notification:**
- Email: `s***t@example.com` (first and last char + domain)
- Phone: `***-***-8888` (last 4 digits only)

**Expected Google Sheets:**
- Email: `security.test.patient@example.com` (FULL, unmasked)
- Phone: `+15559998888` (FULL, unmasked)

**Pass Criteria:**
- ✅ Email masked in notification per pattern: `[first]***[last]@domain`
- ✅ Phone masked in notification: `***-***-[last4]`
- ✅ Full data preserved in Google Sheets
- ✅ Masking is automatic (no manual configuration needed)

**Why This Matters:**
- Google Sheets is access-controlled and HIPAA-compliant
- Slack/Teams channels may be visible to broader teams
- Masking prevents accidental PHI exposure in shared channels

**Additional Check:**
- Verify IP addresses (if logged) are also masked: `192.168.x.x`

---

## Test Execution Tracker

Use this checklist to track your testing progress:

### Happy Path
- [ ] TC-HP-001: Submit Valid Lead (Complete Data)
- [ ] TC-HP-002: Submit Valid Lead (Minimal Data)
- [ ] TC-HP-003: Phone Number Normalization (5 sub-tests)

### Invalid Input
- [ ] TC-INV-001: Missing Email
- [ ] TC-INV-002: Invalid Email Format (3 sub-tests)
- [ ] TC-INV-003: Missing Phone Number
- [ ] TC-INV-004: Phone Number Too Short
- [ ] TC-INV-005: Missing Name

### Edge Cases
- [ ] TC-EDGE-001: Very Long Name
- [ ] TC-EDGE-002: Special Characters in Name
- [ ] TC-EDGE-003: Email with Plus Addressing
- [ ] TC-EDGE-004: International Phone Number

### Integration
- [ ] TC-INT-001: Google Sheets Data Persistence
- [ ] TC-INT-002: Slack/Teams Notification Delivery
- [ ] TC-INT-003: HubSpot CRM Sync (Optional)

### Performance
- [ ] TC-PERF-001: Execution Time Benchmark

### Security
- [ ] TC-SEC-001: PHI Masking in Notifications

---

## Test Results Summary Template

After completing all tests, fill out this summary:

**Test Date:** ___________
**Tester Name:** ___________
**Environment:** [ ] Development [ ] Staging [ ] Production
**Workflow Version:** ___________

| Category | Total | Passed | Failed | Skipped | Pass Rate |
|----------|-------|--------|--------|---------|-----------|
| Happy Path | 3 | ___ | ___ | ___ | ___% |
| Invalid Input | 5 | ___ | ___ | ___ | ___% |
| Edge Cases | 4 | ___ | ___ | ___ | ___% |
| Integration | 3 | ___ | ___ | ___ | ___% |
| Performance | 1 | ___ | ___ | ___ | ___% |
| Security | 1 | ___ | ___ | ___ | ___% |
| **TOTAL** | **17** | ___ | ___ | ___ | ___% |

**Critical Issues Found:** ___________

**Performance Notes:** ___________

**Recommendations:** ___________

---

## Quick Reference: Test Data

**Valid Test Leads:**
- Alice Anderson: `alice.anderson.test@example.com`, `+15551234001`
- Bob Builder: `bob.builder.test@example.com`, `+15551234002`

**Invalid Test Data:**
- Missing email: No email field
- Bad email: `not-an-email`, `bademail.com`, `bad@`
- Short phone: `123`

**Edge Case Data:**
- Long name: Maximiliana-Alexandrina-Christophina-Josephina...
- Special chars: François O'Reilly-Müller
- Plus addressing: `test.user+tag123@example.com`
- International: `+81312345678` (Japan)

---

**Next Steps:**
- See `TestPlan.md` for detailed execution instructions
- See `Troubleshooting.md` for common issues
- See `KeyPoints.md` for important reminders
- Use `BugReport_Template.md` to document any failures
