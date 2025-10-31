# Module 05: Follow-Up & Retention - Troubleshooting Guide

**Module:** 05 - Follow-Up & Retention
**Version:** 1.1.0-enhanced
**Troubleshooting Guide Version:** 1.0
**Last Updated:** 2025-10-31

---

## How to Use This Guide

This guide helps you solve common problems with Module 05.

**Format:** Each problem follows this structure:

```
PROBLEM: Clear symptom description
↓
LIKELY CAUSES: 3-5 possible reasons
↓
SOLUTIONS: Step-by-step fixes
```

**How to use:**
1. Find your symptom in the Table of Contents
2. Jump to that section
3. Read the likely causes
4. Try each solution in order
5. If still stuck, see "Still Stuck?" section at the end

---

## Table of Contents

1. [Webhook & API Issues](#webhook--api-issues)
2. [Validation Errors](#validation-errors)
3. [SendGrid Email Problems](#sendgrid-email-problems)
4. [Twilio SMS Problems](#twilio-sms-problems)
5. [Link Generation Issues](#link-generation-issues)
6. [Wait Node Not Resuming](#wait-node-not-resuming)
7. [Performance Issues](#performance-issues)
8. [Phone Normalization Problems](#phone-normalization-problems)
9. [Google Sheets Integration Issues](#google-sheets-integration-issues)
10. [Sequence Not Triggering](#sequence-not-triggering)
11. [Touch Delivery Failures](#touch-delivery-failures)
12. [Data Quality Issues](#data-quality-issues)
13. [Environment Variable Problems](#environment-variable-problems)
14. [Execution Timeout Issues](#execution-timeout-issues)
15. [Multi-Day Sequence Issues](#multi-day-sequence-issues)

---

## Webhook & API Issues

### Problem 1: "Webhook URL not found" (HTTP 404)

**Symptoms:**
- cURL command returns: `curl: (22) The requested URL returned error: 404`
- Or: `{"error": "Not Found"}`
- n8n shows no new execution

**Likely Causes:**

1. **Workflow is not active**
   - Green toggle in n8n is OFF
   - Workflow was deactivated accidentally

2. **Wrong webhook URL**
   - Copied wrong URL (Test URL instead of Production URL)
   - Typo in URL
   - Extra characters or spaces

3. **n8n server is down**
   - n8n not running
   - Network issue

**Solutions:**

**Solution 1: Verify workflow is active**

```bash
# Steps:
1. Open n8n in browser
2. Go to Workflows
3. Find "Aigent Module 05: Followup & Retention Enhanced"
4. Check toggle at top-right is GREEN (ON)
5. If OFF, click to turn ON
6. Wait 5 seconds for activation
7. Retry your cURL command
```

**Solution 2: Get correct webhook URL**

```bash
# Steps:
1. Open Module 05 workflow in n8n
2. Click on first node: "Webhook: Trigger Follow-Up Sequence"
3. Look for "Webhook URLs" section
4. Copy "Production URL" (NOT Test URL)
5. Should look like: https://your-n8n.com/webhook/aigent-followup
6. Replace YOUR-WEBHOOK-URL in cURL command
7. Retry
```

**Solution 3: Check for URL typos**

```bash
# Common mistakes:
❌ https://your-n8n.com/webhook/aigent-followup/  (extra slash)
❌ https://your-n8n.com/webhook/aigent-follow-up  (wrong path)
❌ https://your-n8n.com/webhook/aigent followup   (space)
✅ https://your-n8n.com/webhook/aigent-followup   (correct)

# Fix: Copy URL directly from n8n (don't type manually)
```

**Solution 4: Verify n8n is running**

```bash
# Check if n8n is accessible:
curl https://your-n8n.com/

# Should return n8n login page HTML
# If timeout or connection refused, n8n is down
# Restart n8n service or Docker container
```

---

### Problem 2: "Connection refused" or "Could not resolve host"

**Symptoms:**
- cURL returns: `curl: (7) Failed to connect`
- Or: `curl: (6) Could not resolve host`
- Looks like network is broken

**Likely Causes:**

1. **Wrong hostname/domain**
   - Typo in n8n URL
   - Domain doesn't exist

2. **Network connectivity issue**
   - Internet connection down
   - Firewall blocking request

3. **n8n not running**
   - Docker container stopped
   - n8n process crashed

**Solutions:**

**Solution 1: Verify n8n URL**

```bash
# Test basic connectivity:
ping your-n8n.com

# Should show replies like:
# Reply from 1.2.3.4: bytes=32 time=20ms TTL=64

# If "could not find host", domain is wrong
```

**Solution 2: Check from browser**

```bash
# Steps:
1. Open browser
2. Go to: https://your-n8n.com/
3. If you see n8n login page, n8n is running
4. If browser shows "can't reach this page", n8n is down
5. Check n8n server status or Docker logs
```

**Solution 3: Check firewall/VPN**

```bash
# If on corporate network:
- Disable VPN temporarily and retry
- Check if firewall allows outbound HTTPS
- Try from different network (mobile hotspot)
```

---

## Validation Errors

### Problem 3: "patient_email: required and must be valid email format"

**Symptoms:**
- HTTP 400 response
- Error message: `"patient_email: required and must be valid email format"`
- No email sent

**Likely Causes:**

1. **Missing patient_email field**
   - Forgot to include in JSON
   - Typo in field name

2. **Invalid email format**
   - Missing @ symbol
   - Missing domain (.com, .org, etc.)
   - Spaces in email

3. **Email field is empty string**
   - `"patient_email": ""`
   - Null or undefined

**Solutions:**

**Solution 1: Verify field is included**

```json
// ❌ Wrong (missing patient_email):
{
  "patient_id": "12345",
  "visit_type": "Consultation"
}

// ✅ Correct:
{
  "patient_id": "12345",
  "patient_email": "jane@example.com",
  "visit_type": "Consultation"
}
```

**Solution 2: Check email format**

```bash
# Valid email formats:
✅ jane.doe@example.com
✅ john+test@clinic.org
✅ patient123@hospital.co.uk

# Invalid formats:
❌ jane@example (missing .com)
❌ jane.example.com (missing @)
❌ jane @example.com (space)
❌ @example.com (missing username)
```

**Solution 3: Validate JSON**

```bash
# Copy your JSON payload
# Paste into: https://jsonlint.com/
# Fix any syntax errors shown
# Ensure patient_email has value
```

---

### Problem 4: "patient_id: required for CRM linking"

**Symptoms:**
- HTTP 400 response
- Error: `"patient_id: required for CRM linking"`

**Likely Causes:**

1. **Missing patient_id field**
2. **patient_id is empty string**
3. **patient_id is null**

**Solutions:**

**Solution 1: Add patient_id**

```json
// ✅ Correct:
{
  "patient_id": "12345",
  "patient_email": "jane@example.com",
  "visit_type": "Consultation"
}

// ❌ Wrong (missing patient_id):
{
  "patient_email": "jane@example.com",
  "visit_type": "Consultation"
}

// ❌ Wrong (empty patient_id):
{
  "patient_id": "",
  "patient_email": "jane@example.com",
  "visit_type": "Consultation"
}
```

---

### Problem 5: "visit_date: cannot be in the future"

**Symptoms:**
- HTTP 400 response
- Error: `"visit_date: cannot be in the future"`

**Likely Causes:**

1. **Visit date set to future date**
   - Accidentally used future date
   - Testing with incorrect date

2. **Timezone confusion**
   - Date is today in your timezone but tomorrow in UTC

**Solutions:**

**Solution 1: Use past or current date**

```json
// ❌ Wrong (future date):
{
  "visit_date": "2026-12-31T00:00:00Z"
}

// ✅ Correct (past date):
{
  "visit_date": "2025-10-30T14:00:00Z"
}

// ✅ Correct (omit field to use current date):
{
  "patient_id": "12345",
  "patient_email": "jane@example.com",
  "visit_type": "Consultation"
  // visit_date not included - defaults to now
}
```

**Solution 2: Check timezone**

```bash
# If using current date, ensure ISO 8601 format with Z (UTC):
✅ "2025-10-30T14:00:00Z"
✅ "2025-10-30T14:00:00.000Z"

# Not recommended (may have timezone issues):
❌ "2025-10-30"
❌ "10/30/2025"
```

---

## SendGrid Email Problems

### Problem 6: Email not delivered (bounced)

**Symptoms:**
- HTTP response shows `"status": "sent"` for email
- SendGrid Activity shows "Bounced"
- Patient never receives email

**Likely Causes:**

1. **Invalid email address**
   - Email doesn't exist
   - Domain doesn't exist
   - Typo in email

2. **Recipient's inbox full**
   - Mailbox quota exceeded
   - Temporary issue

3. **Email marked as spam**
   - Content triggers spam filters
   - Sender reputation poor

**Solutions:**

**Solution 1: Verify email address**

```bash
# Check SendGrid Activity for bounce reason:
1. Log into SendGrid
2. Go to Activity
3. Find the bounced email
4. Click on it
5. Read bounce reason

# Common bounce reasons:
- "550 User unknown" → Email address doesn't exist
- "554 Mailbox full" → Inbox full
- "550 Rejected" → Spam filter blocked
```

**Solution 2: Update email address**

```bash
# If email is invalid:
1. Check patient record in your CRM
2. Verify correct email address
3. Update in CRM
4. Retry follow-up sequence with correct email
```

**Solution 3: Check sender reputation**

```bash
# SendGrid sender reputation check:
1. SendGrid → Settings → Sender Authentication
2. Check spam report rate (<0.1% is good)
3. Check bounce rate (<5% is good)
4. If high rates, investigate email content and list quality
```

---

### Problem 7: Email sent but not received (no bounce)

**Symptoms:**
- SendGrid shows "Delivered"
- Patient says they didn't receive it
- No bounce, no spam report

**Likely Causes:**

1. **Email in spam folder**
   - Spam filter caught it
   - Patient's email provider is aggressive

2. **Email filters/rules**
   - Patient has email rule moving it
   - Corporate email filter

3. **Wrong email address**
   - Email delivered to someone else
   - Patient gave wrong email

**Solutions:**

**Solution 1: Check spam folder**

```bash
# Ask patient to:
1. Open their email
2. Go to Spam/Junk folder
3. Look for email from your clinic
4. If found, mark as "Not Spam"
```

**Solution 2: Verify email address**

```bash
# Confirm with patient:
"What email address should we use?"
"Is it: jane.doe@example.com?"
"Can you check if you received anything at all?"
```

**Solution 3: Send test email**

```bash
# Send direct test email to patient:
1. Use SendGrid directly (not through Module 05)
2. Ask patient if they received it
3. If yes, Module 05 email should arrive too
4. If no, email address or spam issue
```

---

### Problem 8: "SendGrid API error: Invalid API key"

**Symptoms:**
- n8n execution shows SendGrid node failed
- Error: "Invalid API key" or "Unauthorized"
- HTTP 401 response from SendGrid

**Likely Causes:**

1. **Wrong API key**
   - Typo in API key
   - Copied incomplete key

2. **API key expired**
   - Key was revoked
   - Key was regenerated

3. **API key not configured**
   - Missing from n8n credentials
   - Wrong credential selected

**Solutions:**

**Solution 1: Verify API key in n8n**

```bash
# Steps:
1. Open n8n
2. Go to Settings → Credentials
3. Find "SendGrid API" credential
4. Click Edit
5. Check API Key field has value
6. API key should start with "SG."
7. Should be ~70 characters long
```

**Solution 2: Generate new API key**

```bash
# In SendGrid:
1. Log into SendGrid
2. Go to Settings → API Keys
3. Click "Create API Key"
4. Name: "n8n Module 05"
5. Permissions: "Full Access" (or "Mail Send" minimum)
6. Click Create & View
7. Copy API key (starts with SG.)
8. Paste into n8n credentials
9. Save
10. Retry test
```

**Solution 3: Check API key permissions**

```bash
# Ensure API key has "Mail Send" permission:
1. SendGrid → Settings → API Keys
2. Find your key
3. Check permissions
4. Should have "Mail Send" enabled
5. If not, edit key and add permission
```

---

## Twilio SMS Problems

### Problem 9: SMS not delivered (undelivered status)

**Symptoms:**
- HTTP response shows `"status": "sent"` for SMS
- Twilio logs show "Undelivered"
- Patient never receives SMS

**Likely Causes:**

1. **Invalid phone number**
   - Number doesn't exist
   - Wrong country code
   - Landline (can't receive SMS)

2. **Carrier blocked message**
   - Carrier spam filter
   - Opt-out list
   - Content flagged

3. **Phone out of service**
   - Number disconnected
   - Phone turned off

**Solutions:**

**Solution 1: Check Twilio error code**

```bash
# Steps:
1. Log into Twilio
2. Go to Messaging → Logs
3. Find the undelivered message
4. Check "Error Code" field

# Common error codes:
- 30003: Unreachable destination handset
- 30004: Message blocked by carrier
- 30005: Unknown destination handset
- 30006: Landline or unreachable carrier
```

**Solution 2: Verify phone number format**

```bash
# Correct format (E.164):
✅ +15551234567 (US)
✅ +442079460958 (UK)
✅ +61412345678 (Australia)

# Wrong format:
❌ 555-123-4567 (missing country code)
❌ (555) 123-4567 (not E.164)
❌ 5551234567 (missing +1)

# Module 05 normalizes phone, but ensure input is valid
```

**Solution 3: Test with different number**

```bash
# Try Twilio test number:
+15005550006 (Twilio magic number - always delivers)

# If test number works, original number has issue
# If test number fails too, Twilio configuration issue
```

---

### Problem 10: "Twilio API error: Authenticate"

**Symptoms:**
- n8n execution shows Twilio node failed
- Error: "Unable to create record: Authenticate"
- HTTP 401 response from Twilio

**Likely Causes:**

1. **Wrong Account SID**
   - Typo in Account SID
   - Using Test credentials in production

2. **Wrong Auth Token**
   - Typo in Auth Token
   - Token was regenerated

3. **Credentials not configured**
   - Missing from n8n
   - Wrong credential selected

**Solutions:**

**Solution 1: Verify Twilio credentials**

```bash
# In n8n:
1. Settings → Credentials
2. Find "Twilio API" credential
3. Check Account SID (starts with AC...)
4. Check Auth Token (32 characters)
5. Ensure no extra spaces

# Get correct values from Twilio:
1. Log into Twilio
2. Go to Console Dashboard
3. Copy Account SID
4. Copy Auth Token
5. Paste into n8n credentials
6. Save and retry
```

**Solution 2: Check for Test credentials**

```bash
# Test credentials look like:
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (starts with AC)
Auth Token: test_auth_token_xxxxxxxxxxxxxxxx

# Production credentials:
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: 32-character random string

# Don't use Test credentials in production!
```

---

### Problem 11: SMS sent but very slow (>2 minutes)

**Symptoms:**
- Twilio shows "Delivered" eventually
- Delivery takes >2 minutes
- Patient complains of delays

**Likely Causes:**

1. **Carrier delays**
   - Recipient's carrier is slow
   - High carrier traffic

2. **Twilio queue backup**
   - Twilio experiencing high volume
   - Account rate limits

3. **International SMS**
   - Cross-border SMS slower
   - Additional carrier hops

**Solutions:**

**Solution 1: Check Twilio status**

```bash
# Visit: https://status.twilio.com/
# Look for:
- Service degradation alerts
- SMS delivery delays
- Carrier issues

# If Twilio is experiencing issues, wait it out
```

**Solution 2: Check carrier**

```bash
# Some carriers are slower than others
# In Twilio logs, check:
1. Which carrier was used
2. Check average delivery time for that carrier
3. If consistently slow, consider warning patients

# Typical delivery times:
- US carriers: 5-30 seconds
- International: 30-120 seconds
```

---

## Link Generation Issues

### Problem 12: Survey link returns 404

**Symptoms:**
- Patient clicks survey link
- Gets "Page not found" error
- Survey doesn't load

**Likely Causes:**

1. **Wrong SURVEY_BASE_URL**
   - Environment variable not set
   - URL points to wrong survey platform
   - Typo in URL

2. **Survey platform not configured**
   - Survey doesn't exist
   - Survey platform down

3. **URL parameters not accepted**
   - Survey platform doesn't accept query parameters
   - Parameters not configured as hidden fields

**Solutions:**

**Solution 1: Verify SURVEY_BASE_URL**

```bash
# Check environment variable:
1. n8n → Settings → Environment Variables
2. Look for SURVEY_BASE_URL
3. Should be: https://your-survey-platform.com/survey

# Test base URL in browser:
curl https://your-survey-platform.com/survey
# Should load survey (may show error about missing params, that's OK)
```

**Solution 2: Configure survey platform**

```bash
# For Typeform:
1. Create survey
2. Enable "Hidden Fields"
3. Add fields: email, patient_id, trace_id
4. Copy survey URL and set as SURVEY_BASE_URL

# For SurveyMonkey:
1. Create survey
2. Enable "Custom Variables"
3. Add variables: email, patient_id, trace_id
4. Copy survey link and set as SURVEY_BASE_URL
```

**Solution 3: Test link manually**

```bash
# Copy survey link from HTTP response
# Example:
https://example.com/survey?email=jane%40example.com&patient_id=12345&trace_id=FU-123

# Paste in browser
# Should load survey
# If 404, base URL is wrong
# If loads but params not captured, configure hidden fields
```

---

### Problem 13: Rebooking link doesn't track conversions

**Symptoms:**
- Patients click rebooking link
- Appointments booked
- No UTM parameters showing in analytics

**Likely Causes:**

1. **Booking system doesn't capture UTM**
   - Booking platform ignores query parameters
   - Google Analytics not configured

2. **UTM parameters stripped**
   - Redirect strips parameters
   - Booking system reloads page without params

3. **Analytics not configured**
   - Google Analytics not installed
   - UTM tracking not enabled

**Solutions:**

**Solution 1: Verify UTM capture**

```bash
# Test rebooking link:
1. Copy rebooking link from response
2. Paste in browser
3. Open browser console (F12)
4. Type: window.location.search
5. Should show: ?patient_id=...&utm_source=followup&utm_medium=email...
6. If empty, parameters were stripped
```

**Solution 2: Configure booking system**

```bash
# Add hidden fields to booking form:
<input type="hidden" name="utm_source" id="utm_source">
<input type="hidden" name="utm_medium" id="utm_medium">
<input type="hidden" name="utm_campaign" id="utm_campaign">

# JavaScript to populate:
const params = new URLSearchParams(window.location.search);
document.getElementById('utm_source').value = params.get('utm_source');
document.getElementById('utm_medium').value = params.get('utm_medium');
document.getElementById('utm_campaign').value = params.get('utm_campaign');
```

**Solution 3: Use trace_id instead**

```bash
# If UTM doesn't work, use trace_id:
1. Rebooking link includes trace_id parameter
2. Capture trace_id in booking form
3. Save trace_id with booking record
4. Match bookings to follow-up sequences via trace_id
```

---

## Wait Node Not Resuming

### Problem 14: Day-3 touches never sent

**Symptoms:**
- Day-0 emails/SMS sent successfully
- 3+ days later, no Day-3 messages
- n8n execution shows "Waiting" status forever

**Likely Causes:**

1. **n8n execution retention too short**
   - Executions deleted before 14 days
   - Default retention: 7 days, need 14+

2. **n8n server restarted**
   - Wait node state lost on restart
   - Need queue mode for persistence

3. **Wait node webhook not configured**
   - Resume webhook not accessible
   - Webhook URL changed

**Solutions:**

**Solution 1: Increase execution retention**

```bash
# In n8n environment variables:
EXECUTIONS_DATA_MAX_AGE=336  # Keep for 14 days (336 hours)

# How to set:
1. Stop n8n
2. Edit .env file or docker-compose.yml
3. Add: EXECUTIONS_DATA_MAX_AGE=336
4. Restart n8n
5. Verify in n8n Settings → Executions
```

**Solution 2: Enable queue mode**

```bash
# For production, use queue mode:
# In docker-compose.yml:
services:
  n8n:
    environment:
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
  redis:
    image: redis:alpine

# Queue mode persists wait states to Redis
# Survives n8n restarts
```

**Solution 3: Manual resume (for testing)**

```bash
# Find execution ID in n8n UI
# Manually trigger Day-3 resume:
curl -X POST https://your-n8n.com/webhook-waiting/module-05-wait-day3

# This forces resume for testing
# Don't use in production (wait naturally)
```

---

## Performance Issues

### Problem 15: Execution time >5 seconds (very slow)

**Symptoms:**
- HTTP response takes 5-10+ seconds
- `execution_time_ms` >5000
- `performance_category` is "slow"

**Likely Causes:**

1. **SendGrid API slow**
   - SendGrid experiencing high load
   - Network latency

2. **Twilio API slow**
   - Twilio experiencing delays
   - SMS queue backup

3. **n8n server overloaded**
   - High CPU usage
   - Low memory
   - Many workflows running

**Solutions:**

**Solution 1: Check SendGrid status**

```bash
# Visit: https://status.sendgrid.com/
# Look for service degradation alerts
# If SendGrid is slow, not much you can do (wait it out)
```

**Solution 2: Check Twilio status**

```bash
# Visit: https://status.twilio.com/
# Look for delivery delay alerts
```

**Solution 3: Check n8n server resources**

```bash
# Check CPU and memory:
docker stats n8n

# Look for:
- CPU >80% (overloaded)
- Memory >90% (low memory)

# Solutions:
- Upgrade server (more CPU/RAM)
- Reduce concurrent workflows
- Optimize workflows
```

**Solution 4: Review n8n execution log**

```bash
# Find which node is slow:
1. Open execution in n8n
2. Check each node's execution time
3. If SendGrid node is slow (>3s), SendGrid issue
4. If Twilio node is slow (>3s), Twilio issue
5. If code node is slow, optimize code
```

---

## Phone Normalization Problems

### Problem 16: Phone number format error

**Symptoms:**
- Twilio error: "Invalid 'To' Phone Number"
- SMS not sent
- Phone normalization failed

**Likely Causes:**

1. **Non-numeric characters**
   - Phone has letters or symbols
   - Invalid format

2. **Wrong country code**
   - Missing country code
   - Wrong prefix

3. **Too short or too long**
   - Less than 7 digits
   - More than 20 digits

**Solutions:**

**Solution 1: Verify input format**

```bash
# Module 05 accepts these formats:
✅ +15551234567 (E.164)
✅ (555) 123-4567 (US standard)
✅ 555-123-4567 (US dashed)
✅ 5551234567 (digits only - assumes US)

# Not accepted:
❌ 555.123.4567 (dots cause issues)
❌ 1-800-FLOWERS (letters)
❌ 12345 (too short)
```

**Solution 2: Check n8n execution log**

```bash
# Find normalization output:
1. Open execution in n8n
2. Click "Prepare Follow-Up Data" node
3. Check output:
   - patient_phone_normalized: "15551234567" ✅
   - patient_phone_display: "+1-555-123-4567" ✅
4. If normalized is null or malformed, input was invalid
```

---

## Google Sheets Integration Issues

### Problem 17: Data not appearing in Google Sheets

**Symptoms:**
- HTTP response shows success
- No new row in Google Sheets
- Tracking data missing

**Likely Causes:**

1. **Google Sheets node disabled**
   - Node not connected in workflow
   - Node has error

2. **Wrong spreadsheet ID**
   - Environment variable points to wrong sheet
   - Spreadsheet deleted

3. **Permissions issue**
   - Service account doesn't have access
   - Sheet is read-only

**Solutions:**

**Solution 1: Check n8n execution log**

```bash
# Find Google Sheets node:
1. Open execution in n8n
2. Look for Google Sheets node (if configured)
3. Check for error
4. If node didn't execute, it may be disabled or not connected
```

**Solution 2: Verify spreadsheet ID**

```bash
# Check environment variable:
GOOGLE_SHEETS_ID=1A2B3C4D5E6F7G8H9I0J...

# Verify in browser:
https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J.../edit

# Should open your tracking spreadsheet
```

**Solution 3: Check permissions**

```bash
# Share spreadsheet with service account:
1. Open Google Sheet
2. Click Share
3. Add service account email (looks like: xxx@xxx.iam.gserviceaccount.com)
4. Give "Editor" permission
5. Save
6. Retry test
```

---

## Sequence Not Triggering

### Problem 18: No response from webhook at all

**Symptoms:**
- cURL hangs forever
- No response
- No execution in n8n

**Likely Causes:**

1. **Network timeout**
   - Request taking too long
   - Server not responding

2. **n8n crashed**
   - Process died
   - Out of memory

3. **Firewall blocking**
   - Request blocked before reaching n8n

**Solutions:**

**Solution 1: Add timeout to cURL**

```bash
# Add --max-time flag:
curl --max-time 10 -X POST YOUR-WEBHOOK-URL ...

# If times out after 10s, server not responding
```

**Solution 2: Check n8n logs**

```bash
# Docker:
docker logs n8n

# Look for:
- Error messages
- Out of memory errors
- Crash reports

# Restart if needed:
docker restart n8n
```

---

## Quick Reference: Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 400 | Validation failed | Check required fields (patient_email, patient_id, visit_type) |
| 401 | Authentication failed | Check SendGrid/Twilio API keys |
| 403 | Permission denied | Verify SendGrid sender or Twilio number is active |
| 404 | Webhook not found | Check workflow is active, URL is correct |
| 500 | Internal server error | Check n8n logs, restart if needed |
| 30003 (Twilio) | Unreachable phone | Phone number invalid or disconnected |
| 30004 (Twilio) | Message blocked | Carrier spam filter blocked SMS |

---

## Common Error Messages

**"patient_email: required and must be valid email format"**
- Fix: Add valid email address to request

**"patient_id: required for CRM linking"**
- Fix: Add patient_id to request

**"visit_type: required for message personalization"**
- Fix: Add visit_type to request

**"patient_phone: must be 7-20 digits"**
- Fix: Provide valid phone number or omit field

**"visit_date: cannot be in the future"**
- Fix: Use past or current date, or omit field

**"Invalid API key" (SendGrid)**
- Fix: Regenerate SendGrid API key and update n8n credentials

**"Authenticate" (Twilio)**
- Fix: Verify Twilio Account SID and Auth Token in n8n credentials

**"Invalid 'To' Phone Number" (Twilio)**
- Fix: Ensure phone number is valid E.164 format

---

## Still Stuck?

If you've tried the solutions above and still have issues:

### Step 1: Gather Information

Collect these details:
- [ ] HTTP response (full JSON)
- [ ] n8n execution ID
- [ ] Screenshot of n8n execution log
- [ ] SendGrid Activity screenshot (if email issue)
- [ ] Twilio SMS log screenshot (if SMS issue)
- [ ] Environment variables list (redact sensitive values)

### Step 2: Check Documentation

Review these files:
- [TestPlan.md](TestPlan.md) - Detailed test procedures
- [Observability.md](Observability.md) - Where to look for clues
- [KeyPoints.md](KeyPoints.md) - Quick concept reference
- Module build_notes.md - Technical architecture

### Step 3: Search n8n Community

Visit: https://community.n8n.io/
- Search for your error message
- Check SendGrid/Twilio integration topics
- Ask question with details from Step 1

### Step 4: Contact Support

**n8n Support:**
- Cloud: support@n8n.io
- Self-hosted: community.n8n.io

**SendGrid Support:**
- https://support.sendgrid.com/

**Twilio Support:**
- https://support.twilio.com/

### Step 5: Debug Mode

Enable detailed logging:

```bash
# In n8n environment:
N8N_LOG_LEVEL=debug

# Restart n8n
# Retry test
# Check logs for detailed error info
```

---

**End of Troubleshooting Guide**

**Remember:**
- Start with simple checks (workflow active? URL correct?)
- Check multiple observability sources (response + SendGrid + Twilio + n8n)
- Document what you tried (helps support help you faster)
- Most issues are configuration (credentials, URLs, permissions)

For testing procedures, see [TestPlan.md](TestPlan.md).
