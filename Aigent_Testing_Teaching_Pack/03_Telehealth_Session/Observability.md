# Module 03: Telehealth Session - Observability Guide

**Module:** 03 - Telehealth Session
**Version:** 1.1.0-enhanced
**Last Updated:** 2025-10-31
**Audience:** Complete beginners
**PHI Level:** HIGH - This module handles patient names, emails, and phone numbers

---

## What is "Observability"?

**Simple definition:** Observability means being able to **see what's happening** inside your system.

**Think of it like this:**
- When you order a pizza online, you get:
  - Immediate confirmation ("Order received!")
  - Text updates ("Your pizza is in the oven")
  - Email receipt (permanent record)
  - Tracking page (detailed progress)
- That's observability — making the invisible visible!

**For Module 03 (Telehealth Session):**
- You can't "see" a video session being created, BUT...
- You can check: HTTP response, email notifications, SMS delivery, CRM updates, Google Sheets logs, n8n execution details
- That's observability!

---

## Why Observability Matters

**Scenario 1: Everything Works**
- Module 02 sends confirmed booking
- Module 03 creates Zoom session silently
- Patient receives link via SMS and email
- **Without observability:** Hope everything worked!
- **With observability:** "Session SESSION-123 created in 1.8 seconds. SMS delivered. Email delivered. CRM updated. ✅"

**Scenario 2: Something Breaks**
- Booking is sent
- No session link received
- **WITHOUT observability:** "Video session failed... no idea why! Check everything!"
- **WITH observability:** "Node 'Create Telehealth Session' failed: Zoom API returned 401 Unauthorized. Fix: Reconnect Zoom OAuth credential."

**The difference:** Hours of frustrated debugging vs. 5-minute fix!

**Critical in Module 03:** This module handles PHI (Protected Health Information). You need to verify that:
1. Session was created successfully
2. Patient received their link
3. Provider received their link
4. PHI is properly masked in logs
5. All notifications delivered

---

## Where to Look: The Observability Stack

Module 03 provides observability in **6 places:**

1. **HTTP Response** (immediate feedback)
2. **n8n Execution Log** (detailed debugging)
3. **SMS Delivery** (Twilio confirmation)
4. **Email Delivery** (SendGrid confirmation)
5. **CRM Updates** (HubSpot fields)
6. **Google Sheets Audit Log** (permanent record with masked PHI)

Let's explore each one:

---

## 1. HTTP Response (Immediate Feedback)

**What it is:** The JSON response returned immediately after Module 02 triggers the workflow

**Where to see it:**
- n8n execution response (if triggered manually)
- Module 02's execution log (shows what Module 03 returned)
- Terminal/Postman (if testing via webhook directly)

**What to look for:**

### Success Response

```json
{
  "success": true,
  "message": "Telehealth session created successfully",
  "session_id": "clinic-001_cal_abc123_1730217600000",
  "session_link": "https://zoom.us/j/1234567890?pwd=abc123xyz",
  "host_link": "https://zoom.us/s/1234567890?zak=provider_token",
  "session_password": "secure123",
  "scheduled_time": "2025-11-05T14:00:00.000Z",
  "expires_at": "2025-11-06T14:00:00.000Z",
  "platform": "Zoom",
  "patient_email": "jane.doe@example.com",
  "patient_name": "Jane Doe",
  "metadata": {
    "workflow_version": "1.1.0-enhanced",
    "trace_id": "SESSION-1730217600000",
    "execution_time_ms": 1834,
    "performance_category": "fast",
    "timestamp": "2025-10-30T14:30:00.000Z",
    "crm_updated": true,
    "patient_sms_sent": true,
    "patient_email_sent": true,
    "provider_email_sent": true,
    "logged": true,
    "phi_level": "HIGH",
    "security_compliant": true
  }
}
```

**What each field tells you:**
- `success: true` ✅ Session created successfully
- `session_id` → Unique identifier (use this in bug reports!)
- `session_link` → Patient join URL (what patient clicks)
- `host_link` → Provider join URL (elevated permissions)
- `session_password` → Password required to join (if enabled)
- `expires_at` → When link becomes invalid (default: 1 day after appointment)
- `metadata.execution_time_ms` → Performance metric (1834ms = 1.8 seconds)
- `metadata.crm_updated` → Did HubSpot update succeed? (true/false)
- `metadata.patient_sms_sent` → Did SMS deliver? (true/false)
- `metadata.patient_email_sent` → Did patient email send? (true/false)
- `metadata.provider_email_sent` → Did provider email send? (true/false)
- `metadata.logged` → Did Google Sheets log succeed? (true/false)
- `metadata.phi_level: "HIGH"` → This module handles sensitive PHI
- `metadata.security_compliant: true` → Waiting room ON, password ON, encryption ON

**Performance interpretation:**
- **Fast:** < 2000ms (2 seconds) — great!
- **Normal:** 2000-3000ms — acceptable
- **Slow:** 3000-5000ms — investigate (Zoom/Doxy API slowness)
- **Very slow:** > 5000ms (5 seconds) — performance problem

---

### Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "error_code": "VALIDATION_FAILED",
  "details": [
    "patient_email: required and must be valid format",
    "scheduled_time: must be valid ISO 8601 format"
  ],
  "timestamp": "2025-10-30T14:30:00.000Z",
  "trace_id": "SESSION-1730217600000",
  "support_email": "support@yourclinic.com",
  "execution_time_ms": 52
}
```

**What each field tells you:**
- `success: false` ❌ Session creation failed
- `error` → High-level problem category
- `error_code` → Programmatic code for automation ("VALIDATION_FAILED", "API_ERROR", "TIMEOUT")
- `details` → **Specific** issues (this is the most important field!)
- `trace_id` → Use this to find the exact execution in n8n logs
- `execution_time_ms` → How quickly the error was detected (52ms = almost instant)

**Error categories:**
- **Validation errors** → Input data is wrong (fix Module 02 output or test data)
- **API errors** → Zoom/Doxy API failed (check credentials, API status)
- **Timeout errors** → API took too long (increase timeout or check network)
- **PHI masking errors** → Security violation (critical — stop testing immediately!)

**Note:** Error responses never include patient data (PHI-safe error messages)

---

## 2. n8n Execution Log (Detailed Debugging)

**What it is:** Complete record of every workflow execution, node by node

**Where to find it:**
1. Open n8n in your browser
2. Click "Executions" in the left sidebar
3. Find executions for "Aigent_Module_03_Telehealth_Session"

**What you should see:**

### Execution List

```
[Green ✓] Aigent_Module_03... | 2025-10-30 2:30 PM | Success | 1.8s
[Green ✓] Aigent_Module_03... | 2025-10-30 2:25 PM | Success | 2.1s
[Red X]   Aigent_Module_03... | 2025-10-30 2:20 PM | Error   | 0.4s
```

**Color coding:**
- **Green ✓** = Success (all critical nodes completed)
- **Red X** = Error (at least one critical node failed)
- **Yellow ⚠** = Warning (some nodes failed but workflow continued - this is OK if CRM/SMS failed but session created)

---

### Viewing Execution Details

**Click on any execution to see:**

1. **Execution Overview:**
   - Start time
   - End time
   - Total duration
   - Status (success/error)
   - Trace ID (SESSION-...)

2. **Node-by-Node Flow:**
   - Each node shows as a card
   - Green = succeeded
   - Red = failed
   - Gray = not executed (validation failed, conditional path not taken)
   - Orange = failed but continued (continueOnFail = true)

3. **Data Flowing Through Nodes:**
   - Click on any node to see:
     - **Input data** (what went into this node)
     - **Output data** (what came out)
     - **Execution time** (how long this node took)
     - **Error message** (if it failed)

---

### How to Debug Using Logs

**Scenario: Session creation failed**

**Step 1:** Open the failed execution (red X)

**Step 2:** Identify which node failed (will be highlighted in red)

**Step 3:** Click on the failed node

**Step 4:** Read the error message

**Common error patterns:**

**Error: "401 Unauthorized" at Node 307 (Create Telehealth Session)**
- **Cause:** Zoom/Doxy OAuth credential expired or disconnected
- **Fix:** Reconnect credential in n8n (Credentials → Zoom OAuth2 → Reconnect)

**Error: "Invalid email format" at Node 302 (Enhanced Validation)**
- **Cause:** patient_email from Module 02 is malformed
- **Fix:** Check Module 02 output, verify email validation logic

**Error: "Meeting not found" at Node 307**
- **Cause:** Wrong API endpoint or Zoom account doesn't have meeting privileges
- **Fix:** Verify `TELEHEALTH_API_BASE_URL`, check Zoom account type (must be Pro or higher)

**Error: "Rate limit exceeded (429)" at Node 307**
- **Cause:** Too many API calls to Zoom/Doxy (hit hourly limit)
- **Fix:** Wait 15 minutes, or implement request throttling

**Error: "Timeout after 15000ms" at Node 307**
- **Cause:** Zoom/Doxy API is extremely slow or down
- **Fix:** Check status.zoom.us, increase `WORKFLOW_TIMEOUT_MS`, retry later

**Error: "From number not verified" at Node 310 (Send Patient SMS)**
- **Cause:** Twilio sending number not verified or deactivated
- **Fix:** Verify phone number in Twilio console

**Error: "Invalid API key" at Node 311 (Send Patient Email)**
- **Cause:** SendGrid API key expired or incorrect
- **Fix:** Generate new API key in SendGrid, update `SENDGRID_API_KEY`

---

### Execution Time Analysis

**Look at the execution time for each node to find bottlenecks:**

**Example execution breakdown:**
```
301: Webhook Trigger           42ms   (fast ✅)
302: Enhanced Validation       38ms   (fast ✅)
303: Route Validation          5ms    (fast ✅)
305: PHI Masking              15ms   (fast ✅)
306: Prepare Session Data      22ms   (fast ✅)
307: Create Telehealth Session 1320ms (slow but normal ⚠️)
308: Format Session Links      18ms   (fast ✅)
309: Update CRM                265ms  (normal ✅)
310: Send Patient SMS          180ms  (normal ✅)
311: Send Patient Email        220ms  (normal ✅)
312: Send Provider Email       210ms  (normal ✅)
313: Log Session               95ms   (fast ✅)
314: Merge Results            8ms    (fast ✅)
315: Build Metadata           12ms   (fast ✅)
316: Return Success           6ms    (fast ✅)
Total                         1834ms (fast ✅)
```

**Analysis:**
- Node 307 (Create Telehealth Session) is slowest — 1.32 seconds
- This is **normal** — external APIs (Zoom, Doxy) are always slower than internal processing
- Nodes 309-313 run in parallel (not sequential), so their times don't add up
- Total time < 2200ms target = excellent performance ✅

**If Node 307 takes > 5 seconds:**
- Check Zoom/Doxy API status pages
- Verify internet connection speed
- Check if retry logic is triggering (3 attempts = 3x the normal time)
- Consider increasing timeout from 15s to 30s

---

## 3. SMS Delivery (Twilio Confirmation)

**What it is:** Confirmation that patient SMS was delivered successfully

**Where to check:**

### Option 1: n8n Execution Log

1. Open execution in n8n
2. Find Node 310: "Send Patient SMS"
3. Click on it
4. Look at **Output** data

**What to look for:**

```json
{
  "sid": "SM1234567890abcdef1234567890abcdef",
  "status": "queued",
  "to": "+15551234567",
  "from": "+15559876543",
  "body": "Hi Jane, Your telehealth appointment is ready!...",
  "date_created": "2025-10-30T14:30:00Z",
  "price": "-0.0075",
  "price_unit": "USD"
}
```

**Fields to verify:**
- `sid` → Twilio message ID (use this to track delivery in Twilio console)
- `status` → "queued" (just sent), "sent" (delivered to carrier), "delivered" (received by phone)
- `to` → Patient phone number (verify it's correct)
- `from` → Your clinic's Twilio number
- `body` → Message content (verify link is present)

**Status progression:**
- `queued` → Just sent to Twilio
- `sent` → Delivered to carrier (AT&T, Verizon, etc.)
- `delivered` → Received by patient's phone (final confirmation)
- `failed` → Delivery failed (invalid number, carrier issue)
- `undelivered` → Carrier rejected (phone off, number disconnected)

---

### Option 2: Twilio Console

1. Go to console.twilio.com
2. Click "Messaging" → "Logs" → "Message logs"
3. Find message by `sid` or phone number
4. View detailed delivery status

**What to check:**
- Delivery timestamp
- Error codes (if failed)
- Carrier response
- Number validity

**Common SMS delivery issues:**

**Issue: status = "failed", error_code: 21211**
- **Meaning:** Invalid "To" phone number
- **Fix:** Verify patient_phone is in E.164 format (+15551234567)

**Issue: status = "failed", error_code: 21408**
- **Meaning:** Permission denied (number not verified in Twilio trial account)
- **Fix:** Verify recipient number in Twilio, or upgrade to paid account

**Issue: status = "undelivered", error_code: 30006**
- **Meaning:** Carrier rejected (landline, number disconnected, invalid)
- **Fix:** Verify number with patient, use email as backup

**Issue: SMS not delivered after 5 minutes**
- **Meaning:** Carrier delay (rare but possible)
- **Fix:** Check Twilio status page, patient's phone may be off

---

### Patient SMS Content Verification

**Patient should receive:**

```
Hi Jane,

Your telehealth appointment is ready!

📅 Tuesday, November 5
🕐 2:00 PM America/New_York
🎥 Provider: Dr. Smith

🔗 Join here:
https://zoom.us/j/1234567890?pwd=abc123xyz

🔑 Password: secure123

⚠️ Join 5 min early to test your connection.

Questions? Call +1-555-123-4567

- Your Clinic Name Team
```

**What to verify:**
- ✅ Patient first name (personalization)
- ✅ Formatted date/time with timezone
- ✅ Provider name
- ✅ Session link (clickable on mobile)
- ✅ Password (if required)
- ✅ Pre-session reminder
- ✅ Clinic contact info

**Red flags:**
- ❌ Full patient name in subject/preview (should be first name only)
- ❌ Broken link (URL truncated or malformed)
- ❌ Missing password (when Zoom requires it)
- ❌ Wrong timezone (patient sees incorrect time)

---

## 4. Email Delivery (SendGrid Confirmation)

**What it is:** Confirmation that patient and provider emails were sent successfully

**Where to check:**

### Option 1: n8n Execution Log

**Patient Email (Node 311):**

1. Open execution in n8n
2. Find Node 311: "Send Patient Email"
3. Click on it
4. Look at **Output** data

```json
{
  "statusCode": 202,
  "body": "",
  "headers": {
    "x-message-id": "abc123xyz"
  }
}
```

**What this means:**
- `statusCode: 202` → Accepted (SendGrid received email, will deliver)
- `x-message-id` → SendGrid message ID (use to track in SendGrid dashboard)

**Provider Email (Node 312):**

Same process as above. Look for:
- `statusCode: 202` → Success
- `x-message-id` → Tracking ID

---

### Option 2: SendGrid Dashboard

1. Go to app.sendgrid.com
2. Click "Activity" in left sidebar
3. Filter by recipient email or date
4. Find your message

**What to check:**
- **Processed:** SendGrid accepted the email
- **Delivered:** Email reached recipient's inbox
- **Opened:** Recipient opened email (if tracking enabled)
- **Clicked:** Recipient clicked session link
- **Bounced:** Email rejected (invalid address, mailbox full)
- **Spam:** Marked as spam by recipient or filter

**Delivery statuses:**

| Status | Meaning | Action |
|--------|---------|--------|
| Processed | SendGrid accepted | Wait for delivery (30s-2min) |
| Delivered | Email reached inbox | Success ✅ |
| Opened | Recipient opened | Engagement confirmed ✅ |
| Clicked | Recipient clicked link | Session link accessed ✅ |
| Bounced | Invalid email address | Verify patient_email with patient |
| Dropped | SendGrid blocked (spam, unsubscribed) | Check suppression list |
| Deferred | Temporary delay (mailbox full) | Will retry automatically |
| Spam | Marked as spam | Review email content, sender reputation |

---

### Patient Email Content Verification

**Patient should receive HTML email with:**

**Subject:** "Your Telehealth Appointment is Ready - November 5 at 2:00 PM"

**Body structure:**
1. Header with clinic logo
2. Personalized greeting ("Hi Jane,")
3. Appointment details (date, time, provider)
4. **Big green button** "Join Telehealth Session"
5. Session password (if required)
6. Pre-session checklist:
   - ✅ Test camera and microphone
   - ✅ Find quiet, private space
   - ✅ Have insurance card ready
   - ✅ Join 5 minutes early
7. Technical requirements (Chrome/Firefox/Safari, stable internet)
8. Support contact info
9. HIPAA compliance notice
10. Footer with clinic branding

**What to verify:**
- ✅ Email renders correctly (no broken HTML)
- ✅ "Join" button links to correct session_link
- ✅ Password displayed (if required)
- ✅ Date/time formatted with timezone
- ✅ Clinic branding present
- ✅ HIPAA compliance notice included

**Red flags:**
- ❌ Plain text instead of HTML (template failed)
- ❌ Broken images (logo not loading)
- ❌ Link doesn't work (URL malformed)
- ❌ Missing password (when required)
- ❌ Unprofessional formatting

---

### Provider Email Content Verification

**Provider should receive HTML email with:**

**Subject:** "Telehealth Ready - J*** D*** - Nov 5, 2:00 PM"
(Note: Patient name is **MASKED** in subject for inbox privacy!)

**Body structure:**
1. Header with clinic logo
2. Greeting ("Dr. Smith,")
3. Masked patient info in preview:
   - Patient: J*** D***
   - Email: j***e@example.com
   - Phone: +1-555-***-4567
4. **Big blue button** "Start Telehealth Session (Host)"
5. Full patient details (UNMASKED - inside email body):
   - Patient: Jane Doe
   - Email: jane.doe@example.com
   - Phone: +15551234567
6. Appointment context (reason, duration, special notes)
7. Pre-session provider checklist
8. Host controls reminder
9. Support contact for technical issues

**What to verify:**
- ✅ Subject uses **MASKED** patient name (J*** D***)
- ✅ Email body shows **FULL** patient details
- ✅ "Start Session" button links to host_link (not session_link!)
- ✅ Host link includes provider token (elevated permissions)
- ✅ Patient contact info accurate

**Red flags:**
- ❌ Subject shows full patient name (inbox privacy violation!)
- ❌ Email body shows masked patient info (provider needs full details)
- ❌ "Start" button links to patient link (provider won't have host controls)

**Why masked subject?**
- Provider's email preview visible to others (inbox on screen, notifications)
- Subject protects PHI in previews
- Full details inside email body (secure once opened)

---

## 5. CRM Updates (HubSpot Verification)

**What it is:** Confirmation that patient/contact record was updated with session details

**Where to check:**

### Option 1: n8n Execution Log

1. Open execution in n8n
2. Find Node 309: "Update CRM with Session"
3. Click on it
4. Look at **Output** data

```json
{
  "id": "12345678",
  "properties": {
    "telehealth_status": "SCHEDULED",
    "telehealth_link": "https://zoom.us/j/1234567890?pwd=...",
    "telehealth_session_id": "clinic-001_cal_abc123_1730217600000",
    "telehealth_platform": "Zoom",
    "telehealth_scheduled_time": "2025-11-05T14:00:00.000Z",
    "telehealth_expires_at": "2025-11-06T14:00:00.000Z",
    "last_telehealth_update": "2025-10-30T14:30:00.000Z",
    "appointment_status": "TELEHEALTH_READY"
  },
  "updatedAt": "2025-10-30T14:30:00.123Z"
}
```

**What to verify:**
- `id` → HubSpot contact ID (should match contact_id from Module 02)
- `telehealth_status: "SCHEDULED"` → Session created successfully
- `telehealth_link` → Patient join URL (verify it's populated)
- `telehealth_expires_at` → Expiration tracking (default: 1 day after appointment)
- `appointment_status: "TELEHEALTH_READY"` → Status progression tracked

---

### Option 2: HubSpot Dashboard

1. Go to app.hubspot.com
2. Navigate to Contacts
3. Search for patient by email or name
4. Open contact record
5. Scroll to "Telehealth" section (custom properties)

**What you should see:**

| Property | Value | Status |
|----------|-------|--------|
| Telehealth Status | SCHEDULED | ✅ |
| Telehealth Link | https://zoom.us/j/... | ✅ |
| Telehealth Session ID | clinic-001_cal_abc123_... | ✅ |
| Telehealth Platform | Zoom | ✅ |
| Telehealth Scheduled Time | 2025-11-05 2:00 PM | ✅ |
| Telehealth Expires At | 2025-11-06 2:00 PM | ✅ |
| Last Telehealth Update | 2025-10-30 2:30 PM | ✅ |
| Appointment Status | TELEHEALTH_READY | ✅ |

**What to verify:**
- ✅ All fields populated (no "undefined" or empty values)
- ✅ Session link is clickable and correct
- ✅ Dates/times accurate with correct timezone
- ✅ Status shows "SCHEDULED" or "TELEHEALTH_READY"

**Red flags:**
- ❌ Fields empty (CRM update failed — check Node 309)
- ❌ Wrong contact updated (contact_id mismatch)
- ❌ Expired link already (expires_at calculation error)

---

### CRM Update Failure (Non-Blocking)

**Important:** CRM update failures should **NOT** block session creation!

**Test this:**
1. Temporarily disable HubSpot credential (disconnect OAuth)
2. Trigger Module 03 with valid booking
3. Verify:
   - ✅ Session still created (Node 307 succeeds)
   - ✅ SMS/Email still sent
   - ✅ HTTP response shows `crm_updated: false` (honest reporting)
   - ❌ HubSpot fields not updated (expected)

**This is called "graceful degradation"** — CRM is nice to have, but session creation is mission-critical.

**Recovery:**
1. Reconnect HubSpot credential
2. Manually trigger CRM update (via Module 10 or manual workflow)
3. Or: Let next patient interaction update CRM (eventual consistency)

---

## 6. Google Sheets Audit Log (Permanent Record)

**What it is:** A spreadsheet where every session is logged with **MASKED** PHI

**Where to find it:**
1. Go to the URL in your `GOOGLE_SHEET_ID_MODULE_03` environment variable
2. Click on the tab specified in `GOOGLE_SHEET_TAB_MODULE_03` (usually "Telehealth_Sessions")

**What you should see:**

### Column Headers

| Session ID | Patient Name (Masked) | Patient Email (Masked) | Patient Phone (Masked) | Provider | Platform | Scheduled Time | Session Link | Expires At | Created At | CRM Updated | SMS Sent | Email Sent | Logged By |
|------------|----------------------|------------------------|------------------------|----------|----------|----------------|--------------|------------|------------|-------------|----------|------------|-----------|

---

### Example Row

```
clinic-001_cal_abc123_1730217600000 | J*** D*** | j***e@example.com | +1-555-***-4567 | Dr. Smith | Zoom | 2025-11-05 14:00 | https://zoom.us/j/... | 2025-11-06 14:00 | 2025-10-30 14:30 | true | true | true | Module_03_v1.1
```

---

### What to Look For

**✅ Good signs:**
- New row appears within 5-10 seconds of execution
- All fields populated correctly
- **Patient data is MASKED** (j***e@example.com, +1-555-***-4567, J*** D***)
- Session link is present and clickable
- Expires_at is calculated correctly (1 day after scheduled_time)
- Delivery status accurate (sms_sent, email_sent)

**❌ Warning signs:**
- Row doesn't appear (logging failed — check Node 313)
- **UNMASKED PHI** (jane.doe@example.com) → **CRITICAL SECURITY ISSUE**
- Missing session_link (formatting error in Node 308)
- Wrong expires_at (calculation error)
- All delivery statuses false (notifications failed)

---

### PHI Masking Verification (CRITICAL!)

**This is the most important security check for Module 03!**

**What you should see (CORRECT):**
- `j***e@example.com` (first + last char + domain)
- `+1-555-***-4567` (country code + area code + last 4 digits)
- `J*** D***` (first char of each name part + ***)

**What you should NEVER see (VIOLATION):**
- `jane.doe@example.com` (full email exposed!)
- `+15551234567` (full phone number!)
- `Jane Doe` (full name!)

**If you see unmasked data in Google Sheets:**
1. **Stop testing immediately**
2. Delete exposed data from sheet
3. Report as critical security issue
4. Review Node 305 (PHI Masking for Logs)
5. Verify `ENABLE_PHI_MASKING=true` in environment
6. **Do NOT continue testing until fixed**

**Why masking matters in logs:**
- Google Sheets has broader access than CRM (often shared with ops team)
- If sheet is accidentally shared, PHI exposure is minimized
- HIPAA compliance: "minimum necessary" principle
- Security incident mitigation: logs leaked = less PHI exposed

---

### Using Google Sheets for Analysis

**Quick checks you can do:**

**1. Count today's sessions:**
Filter "Created At" column for today's date

**2. Check delivery success rate:**
Count rows where `sms_sent = true` and `email_sent = true`

**3. Find sessions by platform:**
Filter "Platform" column (Zoom, Doxy.me, Amwell)

**4. Identify expiring sessions:**
Filter "Expires At" column for dates < TODAY + 1 day

**5. Audit CRM sync issues:**
Filter rows where `crm_updated = false` (indicates HubSpot failures)

**6. Verify PHI masking:**
Manually review 5-10 random rows to ensure masking logic working

---

## Observability Checklist

Use this checklist after each test to verify observability is working:

### After Triggering Module 03

**HTTP Response:**
- [ ] Received immediate response (<5 seconds)
- [ ] Response includes `success: true`
- [ ] Response includes `session_id`
- [ ] Response includes `session_link` and `host_link`
- [ ] Response includes `metadata.execution_time_ms`
- [ ] Response includes delivery status (sms_sent, email_sent, crm_updated)
- [ ] If error, response includes specific `details` array

**n8n Execution Log:**
- [ ] Execution appears in list
- [ ] Status is "Success" (green) or "Warning" (yellow)
- [ ] Node 307 (Create Telehealth Session) succeeded
- [ ] All parallel nodes (309-313) executed
- [ ] Execution time < 2200ms (target)
- [ ] No unexpected red errors

**SMS Delivery (Twilio):**
- [ ] Node 310 output shows `sid` (message ID)
- [ ] Status is "queued", "sent", or "delivered"
- [ ] Patient phone number correct
- [ ] Message includes session link and password

**Email Delivery (SendGrid):**
- [ ] Node 311 output shows `statusCode: 202` (patient email)
- [ ] Node 312 output shows `statusCode: 202` (provider email)
- [ ] `x-message-id` present for tracking
- [ ] Patient email includes session link
- [ ] Provider email subject uses **MASKED** name

**CRM Update (HubSpot):**
- [ ] Node 309 output shows contact `id`
- [ ] `telehealth_status: "SCHEDULED"`
- [ ] `telehealth_link` populated
- [ ] `expires_at` calculated correctly
- [ ] Contact record updated in HubSpot dashboard

**Google Sheets Audit Log:**
- [ ] New row appears within 10 seconds
- [ ] All fields populated correctly
- [ ] **Patient name MASKED** (J*** D***)
- [ ] **Patient email MASKED** (j***e@example.com)
- [ ] **Patient phone MASKED** (+1-555-***-4567)
- [ ] Session link present
- [ ] Expires_at = scheduled_time + 1 day
- [ ] Delivery statuses accurate

**If ANY checkbox fails, investigate immediately!**

---

## Monitoring Dashboards (Optional)

**For production deployments, consider:**

### Google Sheets as a Dashboard

Create additional tabs with formulas:

**Tab: "Daily Summary"**
```
=COUNTIF(Telehealth_Sessions!A:A, "*"&TEXT(TODAY(),"YYYYMMDD")&"*")
```
Shows count of today's sessions

**Tab: "Platform Breakdown"**
```
=COUNTIF(Telehealth_Sessions!F:F, "Zoom")
=COUNTIF(Telehealth_Sessions!F:F, "Doxy.me")
=COUNTIF(Telehealth_Sessions!F:F, "Amwell")
```
Shows sessions per platform

**Tab: "Delivery Success Rate"**
```
=COUNTIF(Telehealth_Sessions!K:K, "true") / COUNTA(Telehealth_Sessions!K:K)
```
Shows SMS delivery percentage

**Tab: "Expiring Soon"**
```
=FILTER(Telehealth_Sessions!A:I, Telehealth_Sessions!I:I < TODAY() + 1)
```
Shows sessions expiring in next 24 hours

---

### n8n Workflow Statistics

**n8n automatically tracks:**
- Total executions
- Success rate
- Average execution time
- Error rate

**To view:**
1. Open the workflow
2. Click "Workflow" menu → "Settings" → "Statistics"

---

## Common Observability Questions

### Q: How long should I wait to see results?

**A:**
- HTTP response: Immediate (< 5 seconds)
- n8n logs: Immediate
- SMS delivery: 5-30 seconds (Twilio)
- Email delivery: 30 seconds - 2 minutes (SendGrid)
- CRM update: 10-30 seconds (HubSpot API)
- Google Sheets: 5-10 seconds

If longer than these times, something is slow or broken.

---

### Q: What if session created but no SMS?

**A:** This is OK! SMS is "nice to have" but non-blocking. The important thing is the session was created. Check:
1. Twilio account status (suspended? out of credits?)
2. Patient phone number valid (E.164 format?)
3. Workflow has `continueOnFail: true` for Node 310
4. Patient can still access session via email

---

### Q: What if I see SMS sent but no email?

**A:** This is OK! Patient has SMS link. Check:
1. SendGrid API key is correct
2. SendGrid service is up (check status.sendgrid.com)
3. Patient email address is valid
4. Email not marked as spam (check SendGrid activity)

---

### Q: What if Google Sheets shows unmasked PHI?

**A:** This is BAD! It means:
1. PHI masking is broken (Node 305 failed)
2. **STOP testing immediately**
3. Delete exposed data
4. Report as critical security issue
5. Verify `ENABLE_PHI_MASKING=true`
6. Review Node 305 logic

This is a critical issue — security violation!

---

### Q: How do I know if PHI masking is working?

**A:** Check Google Sheets audit log:
- Emails should look like `j***e@example.com`
- Phones should look like `+1-555-***-4567`
- Names should look like `J*** D***`

If you see FULL email/phone/name in Google Sheets, masking is broken — report immediately!

**Note:** Patient SMS/email should have FULL PHI (necessary for service delivery). Only LOGS use masked PHI.

---

### Q: Can I see historical executions?

**A:** Yes! n8n keeps execution logs for a configurable time period (default: 30 days). Go to Executions → use date filter.

---

### Q: What if CRM shows success but fields aren't updated?

**A:** Check:
1. Correct contact ID used (from Module 02)
2. HubSpot custom properties exist (telehealth_status, telehealth_link, etc.)
3. n8n has permission to update those properties
4. Field mapping in Node 309 is correct

---

## Pro Tips

**1. Keep Multiple Tabs Open During Testing**
- Tab 1: n8n Executions
- Tab 2: Google Sheets Audit Log
- Tab 3: Twilio Console
- Tab 4: SendGrid Activity
- Tab 5: HubSpot Contact Record

Refresh each after testing to see real-time updates.

**2. Use Trace IDs for Correlation**
Every execution has a unique `trace_id` (e.g., "SESSION-1730217600000"). Use this to:
- Find execution in n8n
- Search Google Sheets
- Correlate SMS delivery in Twilio
- Track email in SendGrid

**3. Create a Test Log**
Keep a simple text file noting:
```
2:30 PM - Booking cal_abc123 - Session ID: clinic-001_cal_abc123_1730217600000 - Success - 1.8s
2:32 PM - Booking cal_def456 - Session ID: clinic-001_cal_def456_1730217660000 - Success - 2.1s
2:35 PM - Invalid email test - Expected error - Got "VALIDATION_FAILED" ✓
```

**4. Test PHI Masking First**
Before doing any other tests, verify PHI masking is working:
1. Create one test session
2. Check Google Sheets immediately
3. Verify patient data is masked
4. If not masked, fix before continuing

**5. Monitor Expiration Tracking**
Periodically check `expires_at` field:
- Should be scheduled_time + 1 day (default)
- Sessions past expiration should be cleaned up
- Use for compliance: "session links not accessible indefinitely"

**6. Set Up Alerts for Delivery Failures**
In production, configure:
- Slack/Teams alert if `sms_sent: false` (patient may not have link!)
- Email alert if `email_sent: false`
- Dashboard for overall delivery success rate (<95% = investigate)

---

## Observability Best Practices

**DO:**
- ✅ Check all 6 observability sources after each test
- ✅ Verify PHI masking in Google Sheets for every test
- ✅ Monitor execution times to catch performance degradation
- ✅ Review n8n logs when errors occur
- ✅ Track SMS/email delivery rates
- ✅ Use trace IDs for debugging

**DON'T:**
- ❌ Rely on only one observability source (check all 6!)
- ❌ Ignore slow execution times (they indicate problems)
- ❌ Delete Google Sheets data (you'll need it for auditing)
- ❌ Expose full PHI in logs/sheets
- ❌ Forget to verify delivery statuses

---

## Summary

**Observability for Module 03 means checking:**

1. **HTTP Response** → Immediate feedback (success/error, metadata)
2. **n8n Execution Log** → Detailed debugging (node-by-node view)
3. **SMS Delivery** → Patient received link via text
4. **Email Delivery** → Patient and provider received emails
5. **CRM Updates** → HubSpot fields populated
6. **Google Sheets** → Permanent audit log (with MASKED PHI)

**After every test, verify:**
- ✅ All 6 sources show consistent data
- ✅ PHI is MASKED in Google Sheets
- ✅ PHI is FULL in patient SMS/email (necessary for service)
- ✅ Provider email subject uses MASKED name (inbox privacy)
- ✅ Execution time is acceptable (<2200ms target)
- ✅ No errors in logs

**If something's wrong:**
- Start with HTTP response (tells you success/error)
- Check n8n logs (tells you which node failed)
- Verify SMS/email delivery (tells you if patient/provider notified)
- Review CRM (tells you if tracking updated)
- Check Google Sheets (tells you if audit logged with proper masking)

---

**Next Steps:**
- Practice using all 6 observability sources during testing
- Set up your preferred monitoring dashboard
- Configure alerts for production deployments
- Read `Troubleshooting.md` for common issues
- Review `KeyPoints.md` for critical reminders

**Happy Observing!** 👀
