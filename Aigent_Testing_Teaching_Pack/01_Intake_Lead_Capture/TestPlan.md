# Module 01: Intake & Lead Capture - Test Plan

**Module:** 01 - Intake & Lead Capture
**Version:** 1.1.0-enhanced
**Test Plan Version:** 1.0
**Last Updated:** 2025-10-31
**Audience:** Complete beginners welcome!

---

## Welcome!

This test plan will guide you through testing the **Intake & Lead Capture** module step-by-step.

**What this module does:** Captures new patient leads from your website, landing pages, or chatbots and saves them to your CRM and Google Sheets.

**Why testing matters:** This is the first point of contact for new patients. If it fails, you lose potential patients forever!

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
- [ ] Google Sheets set up with "Leads" tab
- [ ] Slack or Teams webhook configured for notifications
- [ ] Mock data ready (see `/00_Shared/MockIdentities.json`)

**You DON'T need:**
- ❌ Real patient data (use mock data only!)
- ❌ Production CRM (HubSpot optional for this test)
- ❌ Coding skills (we'll give you everything to copy/paste)

### Safety Reminders

⚠️ **NEVER use real patient data in testing!**

⚠️ **Test in a development environment** — not your live system!

⚠️ **Use mock data** from `MockIdentities.json` only

✅ **All test data is completely fictional and safe**

---

## Test Environment Setup

### Step 1: Verify Workflow is Active

**What to do:**
1. Open your n8n instance in a web browser
2. Click on "Workflows" in the left sidebar
3. Find "Aigent_Module_01_Intake_LeadCapture_Enhanced"
4. Look at the toggle switch at the top-right

**What you should see:**
- Toggle switch should be ON (colored, not gray)
- You should see "Active" next to the toggle

**If it's not active:**
1. Click the toggle to turn it on
2. If it fails to activate, check the error message
3. Common issue: Missing environment variables (see Troubleshooting.md)

---

### Step 2: Get Your Webhook URL

**What to do:**
1. Open the Module 01 workflow in n8n
2. Click on the first node (called "Webhook Trigger - Intake Form")
3. Look for "Webhook URLs" section
4. You'll see two URLs: "Production URL" and "Test URL"
5. Copy the **Production URL** (it looks like: `https://your-n8n.com/webhook/intake-lead`)

**What you should see:**
```
Production URL: https://your-n8n.com/webhook/intake-lead
Test URL: https://your-n8n.com/webhook-test/intake-lead
```

**Save this URL** — you'll use it in every test!

**Beginner tip:** The webhook URL is like a mailbox address where you'll send test data.

---

### Step 3: Verify Google Sheets Connection

**What to do:**
1. Open the Google Sheet specified in your `GOOGLE_SHEET_ID` environment variable
2. Make sure there's a tab called "Leads" (or whatever you specified in `GOOGLE_SHEET_TAB`)
3. The tab can be empty — we'll add test data

**What you should see:**
- A Google Sheet with column headers like: Name, Email, Phone, Source, Created Date
- Or an empty sheet (we'll create headers during first test)

**If you don't have a Google Sheet yet:**
1. Go to sheets.google.com
2. Click "+ Blank" to create a new sheet
3. Name it "Aigent Testing Leads"
4. Rename the first tab to "Leads"
5. Copy the Sheet ID from the URL (see EnvMatrix.md for how)

---

### Step 4: Verify Notification Channel

**What to do:**
1. Send a test message to your Slack/Teams webhook (see `/00_Shared/cURL_Snippets.md` Test 11 or 12)
2. Verify the message appears in your designated channel

**What you should see:**
- Test message appears within 2 seconds
- Message is in the correct channel

**If no message appears:**
- Double-check your webhook URL (no typos!)
- Verify the channel exists
- Check webhook permissions

---

## Test Suite Overview

We'll run **17 comprehensive tests** covering:

| Test Category | Number of Tests | Purpose |
|--------------|----------------|---------|
| Happy Path | 3 | Verify basic functionality works |
| Invalid Inputs | 5 | Test error handling |
| Edge Cases | 4 | Unusual but valid scenarios |
| Integration | 3 | Verify connections to external systems |
| Performance | 1 | Check speed and efficiency |
| Security | 1 | Verify data protection |

**Time estimate:** 45-60 minutes for all tests (first time)

**You can:**
- Run all tests in order (recommended for first time)
- Run specific categories (e.g., just Happy Path tests)
- Repeat any test as many times as needed

---

## Happy Path Tests

**What "Happy Path" means:** Everything works correctly — the ideal scenario

### Test 1.1: Submit Valid Lead (Basic Fields)

**Purpose:** Verify the module accepts and processes a complete, valid lead

**Why this matters:** This is the most common scenario. If this doesn't work, nothing else will!

**Difficulty:** ⭐ Beginner

**Time:** 5 minutes

---

#### Setup

1. Open your terminal/command prompt
2. Have your webhook URL ready (from Step 2 above)
3. Have the cURL command ready (see below)

---

#### Test Data

We'll use **Alice Anderson** from MockIdentities.json:

```json
{
  "first_name": "Alice",
  "last_name": "Anderson",
  "email": "alice.anderson.test@example.com",
  "phone": "+15551234001",
  "source": "website",
  "message": "I'm interested in scheduling a consultation next week.",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "spring_2025"
}
```

---

#### Steps to Execute

**Step 1:** Copy this cURL command and replace `YOUR-WEBHOOK-URL` with your actual webhook URL:

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Anderson",
    "email": "alice.anderson.test@example.com",
    "phone": "+15551234001",
    "source": "website",
    "message": "I am interested in scheduling a consultation next week.",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "spring_2025"
  }'
```

**Windows Command Prompt users:** Put the entire command on one line and use double quotes with escaped inner quotes.

**Step 2:** Paste the command into your terminal and press Enter

**Step 3:** Wait 2-5 seconds for the response

---

#### Expected Results

**1. Terminal Response (immediate):**
```json
{
  "status": "success",
  "message": "Lead captured successfully",
  "lead_id": "L-20251031-001",
  "execution_time_ms": 1234
}
```

**What each field means:**
- `status: "success"` = Lead was accepted
- `message` = Human-readable confirmation
- `lead_id` = Unique identifier assigned to this lead
- `execution_time_ms` = How long the workflow took (in milliseconds)

**2. Google Sheets (within 10 seconds):**

Open your Google Sheet and verify a new row was added with:
- Name: Alice Anderson
- Email: alice.anderson.test@example.com
- Phone: +15551234001
- Source: website
- Message: I'm interested in scheduling a consultation next week.
- UTM Source: google
- UTM Medium: cpc
- UTM Campaign: spring_2025
- Created Date: [today's date and time]
- Lead Score: [a number between 0-100]

**3. Slack/Teams Notification (within 5 seconds):**

Check your notification channel for a message like:
```
🎉 New Lead Received!
Name: Alice Anderson
Email: a***n@example.com (masked)
Phone: ***-***-4001
Source: website
Lead Score: 75/100
```

**Note:** Email and phone are masked for privacy (this is correct!)

**4. n8n Execution Log (check if you want):**

1. In n8n, click "Executions" in the left sidebar
2. You should see a new execution with green checkmarks
3. Click on it to see the data flowing through each node

---

#### What Success Looks Like

✅ Terminal shows `"status": "success"`

✅ New row in Google Sheets with correct data

✅ Notification appears in Slack/Teams

✅ All data fields match what you sent

✅ Lead score is calculated (should be 70-80 for this lead)

✅ Email and phone are masked in notification (privacy protection!)

---

#### Common Mistakes

❌ **Forgot to replace `YOUR-WEBHOOK-URL`**
- Error: "Could not resolve host"
- Fix: Copy your actual webhook URL from n8n

❌ **Workflow not active**
- Error: "404 Not Found"
- Fix: Activate the workflow in n8n (toggle switch)

❌ **Typo in JSON**
- Error: "Unexpected token"
- Fix: Copy the example exactly, check for missing commas or quotes

❌ **Wrong Google Sheet tab name**
- Error: Sheet updates but no data appears
- Fix: Verify `GOOGLE_SHEET_TAB` matches your actual tab name

---

#### Troubleshooting

**If you see an error response:**

1. Read the error message carefully — it often tells you exactly what's wrong
2. Common errors:
   - `"email is required"` = You forgot to include email in the JSON
   - `"invalid email format"` = Email doesn't look like a valid email address
   - `"phone is required"` = Phone number is missing
3. Check Troubleshooting.md for module-specific issues

**If no Slack notification appears:**

1. Verify `NOTIFICATION_WEBHOOK_URL` is set correctly
2. Test the webhook independently (see cURL_Snippets.md Test 11)
3. Check if the workflow has `continueOnFail: true` for notifications (it should)
4. This is OK for testing — notification failures don't block lead capture

**If no Google Sheets row appears:**

1. Verify `GOOGLE_SHEET_ID` is correct
2. Check that Google Sheets credential is connected in n8n
3. Open the execution in n8n and look for errors on the "Write to Sheets" node
4. Verify the sheet isn't protected or read-only

---

### Test 1.2: Submit Valid Lead (Minimal Fields)

**Purpose:** Verify the module works with only required fields (name, email, phone)

**Why this matters:** Not all intake forms collect the same information. The system should handle minimal data gracefully.

**Difficulty:** ⭐ Beginner

**Time:** 3 minutes

---

#### Test Data

```json
{
  "name": "Bob Builder",
  "email": "bob.builder.test@example.com",
  "phone": "(555) 123-4002"
}
```

**Note:** Phone is in a different format — the system should normalize it!

---

#### Steps to Execute

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Builder",
    "email": "bob.builder.test@example.com",
    "phone": "(555) 123-4002"
  }'
```

---

#### Expected Results

**Terminal Response:**
```json
{
  "status": "success",
  "message": "Lead captured successfully",
  "lead_id": "L-20251031-002"
}
```

**Google Sheets:**
- Name: Bob Builder
- Email: bob.builder.test@example.com
- Phone: **+15551234002** (normalized to E.164 format!)
- Source: [empty or "unknown"]
- Message: [empty]
- UTM fields: [empty]

**Key observation:** Phone number `(555) 123-4002` was automatically converted to `+15551234002`

---

#### What Success Looks Like

✅ Lead accepted despite minimal information

✅ Phone normalized to international format (+1...)

✅ Empty fields don't cause errors

✅ Lead score is lower (30-40) due to less information

---

### Test 1.3: Submit Lead with Phone Normalization

**Purpose:** Verify the system handles various phone number formats

**Why this matters:** Users enter phone numbers many different ways. The system should accept all reasonable formats and standardize them.

**Difficulty:** ⭐ Beginner

**Time:** 5 minutes

---

#### Test Data (Run each one separately)

**Format 1: Spaces**
```json
{"name": "Test User 1", "email": "test1@example.com", "phone": "555 123 4567"}
```

**Format 2: Dashes**
```json
{"name": "Test User 2", "email": "test2@example.com", "phone": "555-123-4567"}
```

**Format 3: Parentheses**
```json
{"name": "Test User 3", "email": "test3@example.com", "phone": "(555) 123-4567"}
```

**Format 4: Dots**
```json
{"name": "Test User 4", "email": "test4@example.com", "phone": "555.123.4567"}
```

**Format 5: Already E.164**
```json
{"name": "Test User 5", "email": "test5@example.com", "phone": "+15551234567"}
```

---

#### Steps to Execute

Run each format separately:

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User 1", "email": "test1@example.com", "phone": "555 123 4567"}'
```

(Change the data for each test)

---

#### Expected Results

**All five tests** should result in the same normalized phone number in Google Sheets:

`+15551234567`

---

#### What Success Looks Like

✅ All phone formats are accepted

✅ All are normalized to `+15551234567` in Google Sheets

✅ No validation errors

✅ Consistent format across all leads (easy to use for SMS later!)

---

## Invalid Input Tests

**What this means:** Testing how the system handles bad or missing data

**Why this matters:** Users make mistakes. The system should give helpful error messages, not crash!

### Test 2.1: Missing Email

**Purpose:** Verify the system rejects leads without email addresses

**Difficulty:** ⭐ Beginner

**Time:** 2 minutes

---

#### Test Data

```json
{
  "name": "No Email",
  "phone": "+15556661001",
  "source": "website"
}
```

**Note:** Email field is completely missing

---

#### Steps to Execute

```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No Email",
    "phone": "+15556661001",
    "source": "website"
  }'
```

---

#### Expected Results

**Terminal Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["email is required"],
  "support_email": "support@yourdomain.com"
}
```

**Google Sheets:** No new row (invalid data is NOT saved)

**Slack Notification:** No notification (only valid leads trigger notifications)

---

#### What Success Looks Like

✅ Error response clearly states email is required

✅ No data saved to Google Sheets

✅ Helpful error message (not a cryptic code)

✅ Support email provided for user to get help

---

### Test 2.2: Invalid Email Format

**Purpose:** Verify email validation catches malformed addresses

**Difficulty:** ⭐ Beginner

**Time:** 2 minutes

---

#### Test Data (Run each separately)

**Test 2.2a: Not an email**
```json
{"name": "Bad Email 1", "email": "not-an-email", "phone": "+15556661002"}
```

**Test 2.2b: Missing @**
```json
{"name": "Bad Email 2", "email": "bademail.com", "phone": "+15556661003"}
```

**Test 2.2c: Missing domain**
```json
{"name": "Bad Email 3", "email": "bad@", "phone": "+15556661004"}
```

---

#### Expected Results (All Three Tests)

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["invalid email format"]
}
```

---

#### What Success Looks Like

✅ All three malformed emails are rejected

✅ Clear error message about email format

✅ No invalid data saved

---

### Test 2.3: Missing Phone Number

**Purpose:** Verify phone number is required

**Difficulty:** ⭐ Beginner

**Time:** 2 minutes

---

#### Test Data

```json
{
  "name": "No Phone",
  "email": "no.phone.test@example.com",
  "source": "website"
}
```

---

#### Expected Results

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["phone is required"]
}
```

---

### Test 2.4: Phone Number Too Short

**Purpose:** Verify phone validation catches incomplete numbers

**Difficulty:** ⭐ Beginner

**Time:** 2 minutes

---

#### Test Data

```json
{
  "name": "Short Phone",
  "email": "short.phone@example.com",
  "phone": "123"
}
```

---

#### Expected Results

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["phone number too short (minimum 7 digits)"]
}
```

---

### Test 2.5: Missing Name

**Purpose:** Verify name is required

**Difficulty:** ⭐ Beginner

**Time:** 2 minutes

---

#### Test Data

```json
{
  "email": "no.name@example.com",
  "phone": "+15556661005"
}
```

---

#### Expected Results

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["name is required"]
}
```

---

## Edge Case Tests

**What this means:** Unusual but valid scenarios

**Why this matters:** Real-world data is messy. The system should handle unusual cases gracefully.

### Test 3.1: Very Long Name

**Purpose:** Verify the system handles long names without truncation or errors

**Difficulty:** ⭐⭐ Intermediate

**Time:** 3 minutes

---

#### Test Data

Use the "very_long_name" edge case from MockIdentities.json:

```json
{
  "name": "Maximiliana-Alexandrina-Christophina-Josephina Van Der Hoogenstraaten-Smythe-Worthington III",
  "email": "very.long.name.test@example.com",
  "phone": "+15555551001"
}
```

---

#### Expected Results

✅ Lead accepted (no truncation error)

✅ Full name saved to Google Sheets

✅ Name appears completely in notification (or truncated gracefully with "...")

---

### Test 3.2: Special Characters in Name

**Purpose:** Verify Unicode and special characters work correctly

**Difficulty:** ⭐⭐ Intermediate

**Time:** 3 minutes

---

#### Test Data

```json
{
  "name": "François O'Reilly-Müller",
  "email": "francois.oreilly@example.com",
  "phone": "+15555551003"
}
```

---

#### Expected Results

✅ Special characters (ç, ', ü) are preserved

✅ No encoding errors

✅ Name displays correctly in Google Sheets and notifications

---

### Test 3.3: Email with Plus Addressing

**Purpose:** Verify email aliases (user+tag@domain.com) work

**Difficulty:** ⭐⭐ Intermediate

**Time:** 2 minutes

---

#### Test Data

```json
{
  "name": "Test User",
  "email": "test.user+tag123@example.com",
  "phone": "+15555551006"
}
```

---

#### Expected Results

✅ Email accepted (+ symbol is valid in email addresses)

✅ Full email saved (not truncated at +)

---

### Test 3.4: International Phone Number

**Purpose:** Verify non-US phone numbers work

**Difficulty:** ⭐⭐ Intermediate

**Time:** 3 minutes

---

#### Test Data

```json
{
  "name": "Yuki Tanaka",
  "email": "yuki.tanaka.test@example.com",
  "phone": "+81312345678"
}
```

**Note:** This is a Japanese phone number (+81 is Japan's country code)

---

#### Expected Results

✅ International phone accepted

✅ Saved in E.164 format: `+81312345678`

✅ No US-specific validation errors

---

## Integration Tests

**What this means:** Testing connections to external systems

**Why this matters:** The workflow depends on Google Sheets, Slack, and optionally HubSpot. These integrations must work correctly.

### Test 4.1: Google Sheets Integration

**Purpose:** Verify data is written to Google Sheets correctly

**Difficulty:** ⭐ Beginner

**Time:** 5 minutes

---

#### Steps

1. **Clear Google Sheet** (optional, for clean test):
   - Delete all rows except the header row

2. **Submit 3 test leads** using Test 1.1, 1.2, and 1.3 above

3. **Verify Google Sheets** contains exactly 3 rows of data

---

#### Expected Results

**Row 1:** Alice Anderson with all fields populated

**Row 2:** Bob Builder with minimal fields

**Row 3:** Phone normalization test user

**All rows should have:**
- Timestamp (creation date/time)
- Lead ID (unique for each)
- Lead score (calculated automatically)

---

#### What Success Looks Like

✅ All 3 leads appear in Google Sheets

✅ Data matches what was submitted

✅ Phone numbers are normalized

✅ Timestamps are accurate

✅ Lead scores vary based on data completeness

---

### Test 4.2: Slack/Teams Notification Integration

**Purpose:** Verify notifications are sent for each lead

**Difficulty:** ⭐ Beginner

**Time:** 3 minutes

---

#### Steps

1. **Clear Slack/Teams channel** (scroll to find test start point)

2. **Submit 2 test leads** (use any from Happy Path tests)

3. **Check notification channel** for 2 new messages

---

#### Expected Results

**Two notifications** appear within 5 seconds of submission

**Each notification contains:**
- Lead name
- Masked email (e.g., `a***n@example.com`)
- Masked phone (last 4 digits only)
- Source
- Lead score

---

### Test 4.3: CRM Integration (HubSpot - Optional)

**Purpose:** Verify leads are sent to HubSpot (if configured)

**Difficulty:** ⭐⭐⭐ Advanced (requires HubSpot account)

**Time:** 5 minutes

---

**Skip this test if:**
- You don't have HubSpot configured
- You're using a different CRM
- You're testing Google Sheets only

---

#### Steps

1. Submit a test lead (use Alice Anderson from Test 1.1)

2. Open HubSpot in a web browser

3. Go to Contacts → View all contacts

4. Search for "alice.anderson.test@example.com"

---

#### Expected Results

✅ Contact exists in HubSpot

✅ All fields (name, email, phone, source, UTM data) are populated

✅ Lead score matches what's in Google Sheets

---

## Performance Tests

### Test 5.1: Execution Time

**Purpose:** Verify the workflow completes quickly

**Difficulty:** ⭐⭐ Intermediate

**Time:** 5 minutes

---

#### Steps

1. Submit 10 test leads quickly (use TestData_Generators.js or repeat Test 1.1)

2. Note the `execution_time_ms` in each response

3. Calculate average execution time

---

#### Expected Results

**Target performance:**
- **Fast:** <2 seconds (2000ms)
- **Normal:** 2-5 seconds (2000-5000ms)
- **Slow:** >5 seconds (needs investigation)

**What affects speed:**
- Google Sheets API latency
- HubSpot API latency
- Network conditions
- Number of parallel executions

---

#### What Success Looks Like

✅ Average execution time is under 3 seconds

✅ No executions timeout (max is 2 minutes by default)

✅ All leads are processed successfully

---

## Security Tests

### Test 6.1: PHI Masking in Notifications

**Purpose:** Verify sensitive data is masked in Slack/Teams

**Difficulty:** ⭐ Beginner

**Time:** 3 minutes

---

#### Steps

1. Submit a test lead with clear email and phone:
   ```json
   {
     "name": "Security Test",
     "email": "security.test@example.com",
     "phone": "+15559998888"
   }
   ```

2. Check the Slack/Teams notification

---

#### Expected Results

**Notification should show:**
- Email: `s***t@example.com` (NOT `security.test@example.com`)
- Phone: `***-***-8888` (NOT full number)

**Google Sheets should show:**
- Full email (unmasked)
- Full phone (unmasked)

**Why:** Google Sheets is secure and private. Slack/Teams channels might be visible to more people, so we mask PHI there.

---

#### What Success Looks Like

✅ Email masked in notification

✅ Phone masked in notification

✅ Full data in Google Sheets (for actual use)

✅ Masking is consistent across all leads

---

## What to Do If Tests Fail

### General Troubleshooting Steps

1. **Read the error message carefully** — it usually tells you what's wrong

2. **Check environment variables** (see EnvMatrix.md)
   - Are all required variables set?
   - Any typos in variable names or values?

3. **Verify workflow is active** (green toggle in n8n)

4. **Check credentials** in n8n:
   - Google Sheets connected?
   - All credentials tested and working?

5. **Review execution logs** in n8n:
   - Which node failed?
   - What was the error message?

6. **Consult Troubleshooting.md** for module-specific issues

---

### When to Report a Bug

Report a bug if:
- ✅ You followed the test plan exactly
- ✅ You used mock data from MockIdentities.json
- ✅ You verified environment variables are correct
- ✅ The error is reproducible (happens every time)
- ✅ You've checked Troubleshooting.md

**How to report:**
Use `/00_Shared/BugReport_Template.md` and include:
- Which test failed (e.g., "Test 1.1")
- What you expected
- What actually happened
- Screenshots of error messages
- Test data you used

---

## Test Completion Checklist

After finishing all tests, verify:

- [ ] All Happy Path tests passed (3/3)
- [ ] All Invalid Input tests passed (5/5)
- [ ] All Edge Case tests passed (4/4)
- [ ] All Integration tests passed (2/2 or 3/3 with HubSpot)
- [ ] Performance test completed (execution time <5s average)
- [ ] Security test passed (PHI masking works)
- [ ] Google Sheets contains test leads
- [ ] Slack/Teams received notifications
- [ ] No errors in n8n execution logs
- [ ] Reviewed KeyPoints.md for major takeaways

**Total:** 17 tests

---

## Next Steps

**After completing Module 01 testing:**

1. ✅ Review `/01_Intake_Lead_Capture/KeyPoints.md` for important reminders

2. ✅ Read `/01_Intake_Lead_Capture/TeachingNotes.md` if you want deeper understanding

3. ✅ Try creating your own test scenarios using TestData_Generators.js

4. ✅ Move to Module 02 (Consult Booking & Scheduling) testing

5. ✅ Practice teaching someone else how to run Test 1.1

---

## Time to Celebrate! 🎉

You've completed comprehensive testing of the Intake & Lead Capture module!

**You now know how to:**
- ✅ Submit leads via webhook
- ✅ Verify data in Google Sheets
- ✅ Check Slack/Teams notifications
- ✅ Test validation and error handling
- ✅ Handle edge cases
- ✅ Verify security (PHI masking)
- ✅ Troubleshoot common issues

**This is a foundational skill** — these same testing principles apply to all other modules!

---

**Questions? Issues? Feedback?**

Consult:
- `Troubleshooting.md` for specific problems
- `TeachingNotes.md` for deeper explanations
- `KeyPoints.md` for quick review
- Your team lead or technical support

**Happy Testing!** 🚀
