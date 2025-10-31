# Module 03: Telehealth Session - Troubleshooting Guide

**Module:** 03 - Telehealth Session
**Version:** 1.1.0-enhanced
**Last Updated:** 2025-10-31
**For:** Complete beginners
**PHI Level:** HIGH - Handle with extra care

---

## How to Use This Guide

**When to use this:**
- Session creation failed and you don't know why
- You got an error message you don't understand
- SMS or email not delivered
- Something works in testing but not in production
- PHI masking not working correctly

**How to use this:**
1. Find your symptom in the Table of Contents
2. Read the likely causes
3. Try each solution step by step
4. Check if the problem is fixed
5. If not fixed, try the next solution

**Still stuck?** Use the Bug Report Template (`/00_Shared/BugReport_Template.md`)

---

## Table of Contents

1. [Webhook and API Issues](#webhook-and-api-issues)
2. [Validation Errors](#validation-errors)
3. [Zoom/Doxy API Issues](#zoomdoxy-api-issues)
4. [SMS Delivery Failures](#sms-delivery-failures)
5. [Email Delivery Failures](#email-delivery-failures)
6. [CRM Update Issues](#crm-update-issues)
7. [Performance Issues](#performance-issues)
8. [PHI Masking Problems](#phi-masking-problems)
9. [Session Link Issues](#session-link-issues)
10. [Provider Access Issues](#provider-access-issues)
11. [Environment Variable Issues](#environment-variable-issues)
12. [Network and Timeout Issues](#network-and-timeout-issues)

---

## Webhook and API Issues

### Problem: "404 Not Found" when Module 02 triggers Module 03

**Symptom:**
```
curl: (22) The requested URL returned error: 404
```

**Likely causes:**
1. Module 03 workflow is not active
2. Wrong webhook URL in Module 02
3. Webhook path changed

**Solutions:**

**Solution 1: Activate the workflow**
1. Open n8n
2. Go to Workflows
3. Find "Aigent_Module_03_Telehealth_Session"
4. Toggle switch at top-right to ON (should turn blue/green)
5. Try your test again

**Solution 2: Verify webhook URL**
1. Open Module 03 workflow in n8n
2. Click on "Webhook Trigger" node (Node 301)
3. Copy the "Production URL" shown
4. Compare with URL in Module 02 Node 211 (where it calls Module 03)
5. Update if they don't match

**Solution 3: Check webhook path**
1. Verify `WEBHOOK_ID_MODULE_03` environment variable
2. URL should be: `https://your-n8n.com/webhook/telehealth-session`
3. If path is different, update Module 02 to use correct URL

---

### Problem: Module 02 succeeds but Module 03 never executes

**Symptom:**
- Module 02 shows success
- But no execution appears in Module 03 logs
- Patient doesn't receive session link

**Likely causes:**
1. Module 02 isn't actually calling Module 03
2. Webhook URL in Module 02 is wrong
3. CORS blocking the request

**Solutions:**

**Solution 1: Verify Module 02 calls Module 03**
1. Open Module 02 workflow
2. Find node that should trigger Module 03 (usually after booking confirmed)
3. Verify it has HTTP Request to Module 03 webhook
4. Check that this node is connected in the workflow path

**Solution 2: Test webhook directly**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "test_123",
    "patient_name": "Test Patient",
    "patient_email": "test@example.com",
    "patient_phone": "+15551234567",
    "scheduled_time": "2025-11-05T14:00:00.000Z",
    "provider_name": "Dr. Smith",
    "contact_id": "12345"
  }'
```
If this works, the webhook is fine — problem is in Module 02.

**Solution 3: Check CORS settings**
1. Verify `ALLOWED_ORIGINS` in Module 03 environment
2. Should include Module 02's domain or use `*` for testing
3. Restart Module 03 after changing

---

### Problem: "Connection refused" or "Network unreachable"

**Symptom:**
```
Error: connect ECONNREFUSED
```

**Likely causes:**
1. n8n server is down
2. Firewall blocking connection
3. Wrong hostname/port

**Solutions:**

**Solution 1: Check n8n is running**
```bash
# If using Docker:
docker ps | grep n8n

# If using PM2:
pm2 list | grep n8n

# If direct process:
ps aux | grep n8n
```

**Solution 2: Verify webhook URL**
- Make sure URL uses correct protocol (http vs https)
- Verify port number (default: 5678 for n8n)
- Check domain name resolves: `ping your-n8n-domain.com`

**Solution 3: Check firewall**
- Ensure port 5678 (or your n8n port) is open
- Test from same network first
- If using Docker, verify port mapping: `-p 5678:5678`

---

## Validation Errors

### Problem: "patient_email: required and must be valid format"

**Symptom:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["patient_email: required and must be valid format"]
}
```

**Likely causes:**
1. Module 02 isn't sending patient_email
2. Email field is nested incorrectly
3. Email format is invalid

**Solutions:**

**Solution 1: Check Module 02 output**
1. Open Module 02 execution in n8n
2. Find the node that calls Module 03
3. Check the output data being sent
4. Verify `patient_email` field exists at top level
5. Example correct format:
```json
{
  "patient_email": "test@example.com"
}
```

**Solution 2: Check field name (case-sensitive!)**
```json
❌ WRONG: {"PatientEmail": "test@example.com"}
❌ WRONG: {"patient_Email": "test@example.com"}
✅ RIGHT: {"patient_email": "test@example.com"}
```

**Solution 3: Verify email format**
- Must have @ symbol
- Must have domain (something.com)
- No spaces
- Max 320 characters
- Example valid: `jane.doe@example.com`

---

### Problem: "scheduled_time: must be valid ISO 8601 format"

**Symptom:**
```json
{
  "details": ["scheduled_time: must be valid ISO 8601 format"]
}
```

**Your time looks valid but gets rejected**

**Common causes:**

**1. Wrong format**
```json
❌ WRONG: "2025-11-05 14:00:00"  (missing T separator)
❌ WRONG: "2025-11-05"  (no time component)
❌ WRONG: "11/05/2025 2:00 PM"  (US date format)
✅ RIGHT: "2025-11-05T14:00:00.000Z"  (ISO 8601)
✅ RIGHT: "2025-11-05T14:00:00-05:00"  (with timezone)
```

**2. Invalid date**
```json
❌ WRONG: "2025-02-30T14:00:00.000Z"  (Feb 30 doesn't exist)
❌ WRONG: "2025-13-01T14:00:00.000Z"  (month 13 doesn't exist)
```

**Solution:** Use Luxon or moment.js in Module 02 to format dates:
```javascript
// In Module 02:
const scheduledTime = DateTime.fromJSDate(appointmentDate).toISO();
// Result: "2025-11-05T14:00:00.000Z"
```

---

### Problem: "duration_minutes: must be between 5 and 240"

**Symptom:**
```json
{
  "details": ["duration_minutes: must be between 5 and 240"]
}
```

**Likely causes:**
1. Duration is 0 or negative
2. Duration exceeds 4 hours (240 minutes)
3. Duration field missing (defaults to 30, so this is rare)

**Solutions:**

**Solution 1: Check duration value**
```json
❌ WRONG: "duration_minutes": 0
❌ WRONG: "duration_minutes": 300  (5 hours)
❌ WRONG: "duration_minutes": -15
✅ RIGHT: "duration_minutes": 30
✅ RIGHT: "duration_minutes": 60
```

**Solution 2: Set reasonable defaults in Module 02**
```javascript
const duration = bookingData.duration_minutes || 30;
if (duration < 5) duration = 5;
if (duration > 240) duration = 240;
```

**Business logic:** 5-minute minimum prevents abuse, 240-minute maximum aligns with typical telehealth platform limits.

---

### Problem: "patient_name: required, minimum 2 characters"

**Symptom:**
```json
{
  "details": ["patient_name: required, minimum 2 characters"]
}
```

**Likely causes:**
1. Name field is empty or whitespace only
2. Name is single character (e.g., "J")
3. Name exceeds 100 characters

**Solutions:**

**Solution 1: Verify Module 02 sends name**
Check that `patient_name` is populated:
```json
❌ WRONG: "patient_name": ""
❌ WRONG: "patient_name": " "  (whitespace only)
❌ WRONG: "patient_name": "J"  (too short)
✅ RIGHT: "patient_name": "Jane Doe"
```

**Solution 2: Handle edge cases in Module 02**
```javascript
let name = patientData.name || patientData.full_name || '';
name = name.trim();
if (name.length < 2) {
  // Handle error - require valid name before booking
}
```

---

## Zoom/Doxy API Issues

### Problem: "401 Unauthorized" from Zoom API

**Symptom:**
```
Error at Node 307 (Create Telehealth Session):
401 Unauthorized
```

**Likely causes:**
1. Zoom OAuth credential expired
2. Wrong Zoom account connected
3. OAuth token not refreshed

**Solutions:**

**Solution 1: Reconnect Zoom OAuth**
1. In n8n, go to Credentials
2. Find your Zoom OAuth2 credential
3. Click "Reconnect"
4. Sign in to Zoom (use account with Healthcare/Pro license)
5. Grant permissions
6. Test credential (click "Test" button)
7. If test succeeds, try Module 03 again

**Solution 2: Verify Zoom account type**
- **Required:** Zoom Pro, Business, or Healthcare account
- **NOT supported:** Free Zoom account (no API access)
- Check: zoom.us → Account → Account Type
- If Free, upgrade to Pro or higher

**Solution 3: Check OAuth scopes**
Required scopes for Zoom:
- `meeting:write:admin` (create meetings)
- `meeting:read:admin` (read meeting details)

Verify scopes in Zoom Marketplace app settings.

---

### Problem: "Meeting not found" from Zoom

**Symptom:**
```
Error at Node 307:
404 Not Found: Meeting does not exist
```

**Likely causes:**
1. Wrong API endpoint
2. Trying to update meeting that doesn't exist yet
3. Meeting ID from previous step is incorrect

**Solutions:**

**Solution 1: Verify API endpoint**
Should be: `POST /v2/users/me/meetings` (create new meeting)
NOT: `PATCH /v2/meetings/{meetingId}` (update existing)

**Solution 2: Check Node 307 configuration**
1. Method should be POST (not PATCH, not GET)
2. URL should be: `{{$env.TELEHEALTH_API_BASE_URL}}/users/me/meetings`
3. Don't include meeting ID in create request

---

### Problem: "Rate limit exceeded (429)" from Zoom/Doxy

**Symptom:**
```
Error at Node 307:
429 Too Many Requests
```

**What this means:** You've hit Zoom/Doxy's hourly API limit

**Zoom limits:**
- Free: N/A (no API access)
- Pro: 100 requests per day
- Business: 1,000 requests per day
- Healthcare: 10,000 requests per day

**Solutions:**

**Solution 1: Wait and retry**
1. Wait 15 minutes
2. Check `X-RateLimit-Reset` header for exact reset time
3. Retry after reset time

**Solution 2: Implement request throttling**
In production, add delay between session creations:
- Max 1 session per second
- Use queue system for burst traffic

**Solution 3: Upgrade Zoom account**
If hitting limits regularly, upgrade to higher tier.

---

### Problem: Doxy.me returns "Room name already exists"

**Symptom:**
```
Error at Node 307:
409 Conflict: Room name already in use
```

**Likely causes:**
1. Using same room name for multiple sessions
2. Session ID not unique

**Solutions:**

**Solution 1: Verify session ID includes timestamp**
Check Node 306 (Prepare Session Data):
```javascript
const sessionId = `${clinicId}_${appointmentId}_${Date.now()}`;
```
The `Date.now()` ensures uniqueness.

**Solution 2: Check for duplicate appointments**
If same appointment_id is used twice (e.g., testing), session ID will collide. Use unique appointment IDs.

**Solution 3: Delete old Doxy room**
In Doxy.me dashboard, manually delete old test rooms.

---

### Problem: "Waiting room not supported" for Doxy.me

**Symptom:**
```
Error at Node 307:
400 Bad Request: waiting_room setting not supported
```

**Cause:** Doxy.me doesn't have "waiting room" feature like Zoom

**Solution:**
Update Node 306 to use platform-specific settings:
```javascript
let settings;
if (platform === 'Zoom') {
  settings = {
    waiting_room: true,
    password_required: true
  };
} else if (platform === 'Doxy.me') {
  settings = {
    require_pin: true  // Doxy equivalent of password
  };
}
```

---

## SMS Delivery Failures

### Problem: "From number not verified" (Twilio error 21212)

**Symptom:**
```
Error at Node 310 (Send Patient SMS):
21212: The 'From' number +15559876543 is not a verified phone number
```

**Likely causes:**
1. Using Twilio trial account
2. "From" number not verified in Twilio

**Solutions:**

**Solution 1: Verify phone number**
1. Go to console.twilio.com
2. Click "Phone Numbers" → "Manage" → "Verified Caller IDs"
3. Click "Add a new Caller ID"
4. Enter your clinic's phone number
5. Verify via SMS or call
6. Use this number as `TWILIO_FROM_NUMBER`

**Solution 2: Upgrade to paid Twilio account**
Trial accounts can only send to verified numbers. Paid accounts can send to any number.

---

### Problem: SMS not delivered (status: "undelivered", error 30006)

**Symptom:**
In Twilio console, message shows:
```
Status: undelivered
Error Code: 30006 (Landline or unreachable carrier)
```

**Likely causes:**
1. Phone number is a landline (can't receive SMS)
2. Number is disconnected
3. Carrier blocking messages

**Solutions:**

**Solution 1: Verify number is mobile**
- Ask patient if number is mobile or landline
- Use phone number validation service (e.g., Twilio Lookup API)
- If landline, use email as primary delivery method

**Solution 2: Check number validity**
- Test with different phone number
- Verify E.164 format: `+15551234567`
- No spaces, dashes, or parentheses

**Solution 3: Patient contact alternative**
- Email still sent (graceful degradation!)
- Call patient to provide link verbally
- Update patient's phone number in CRM

---

### Problem: SMS sent but session link is broken/truncated

**Symptom:**
Patient receives SMS but link doesn't work or is cut off

**Likely causes:**
1. URL too long (Zoom URLs can be 200+ characters)
2. Carrier truncated message
3. Line breaks in URL

**Solutions:**

**Solution 1: Use URL shortener**
In Node 310, add URL shortening:
```javascript
// Use Bitly, TinyURL, or custom shortener
const shortLink = await shortenUrl(sessionLink);
```

**Solution 2: Reduce message length**
Template should be concise:
```
Hi Jane,

Join telehealth: [SHORT_LINK]
Password: secure123
Nov 5, 2 PM

- Your Clinic
```

**Solution 3: Check message length**
SMS limit: 160 characters per segment
If message > 160 chars, carrier may split it incorrectly.

---

### Problem: Patient didn't receive SMS (status: "delivered" in Twilio)

**Symptom:**
- Twilio shows "delivered"
- Patient says they didn't get it

**Likely causes:**
1. Phone number belongs to someone else
2. Message filtered as spam
3. Phone was off at delivery time

**Solutions:**

**Solution 1: Verify phone number**
Ask patient:
- Is +15551234567 your current number?
- Do you receive other texts at this number?
- Check your spam/blocked messages folder

**Solution 2: Check carrier filtering**
Some carriers filter automated messages. Solutions:
- Use registered sender ID (Twilio)
- Apply for 10DLC registration (US)
- Use verified business profile

**Solution 3: Resend via email**
Patient should have email with same link. Direct them to check email.

---

## Email Delivery Failures

### Problem: "Invalid API key" (SendGrid)

**Symptom:**
```
Error at Node 311/312 (Send Email):
401 Unauthorized: Invalid API key
```

**Likely causes:**
1. SendGrid API key is wrong
2. API key was deleted/regenerated
3. API key doesn't have mail.send permission

**Solutions:**

**Solution 1: Verify API key**
1. Go to app.sendgrid.com
2. Navigate to Settings → API Keys
3. Check if your key still exists
4. If not, create new key with "Full Access" or "Mail Send" permission
5. Update `SENDGRID_API_KEY` environment variable
6. Restart n8n

**Solution 2: Test API key**
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@yourclinic.com"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```
If returns 401, API key is invalid.

---

### Problem: Email bounced (invalid recipient)

**Symptom:**
In SendGrid Activity, email shows status "Bounced"

**Likely causes:**
1. Patient email address is wrong
2. Mailbox doesn't exist
3. Domain doesn't exist

**Solutions:**

**Solution 1: Verify email address**
1. Check HubSpot/CRM for correct email
2. Ask patient to confirm email address
3. Look for typos (gmial.com vs gmail.com)

**Solution 2: Use email validation**
In Module 02, add email validation service:
- Kickbox, ZeroBounce, or similar
- Validates email before booking
- Prevents bounce issues

**Solution 3: Collect backup email**
During intake, ask for secondary email address.

---

### Problem: Email goes to spam

**Symptom:**
SendGrid shows "Delivered" but patient says email not in inbox

**Likely causes:**
1. Sender domain not verified
2. No SPF/DKIM/DMARC records
3. Email content triggers spam filters

**Solutions:**

**Solution 1: Verify sender domain**
1. In SendGrid, go to Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Follow DNS setup instructions
4. Wait for verification (15 minutes - 24 hours)

**Solution 2: Check email content**
Avoid spam triggers:
- ❌ ALL CAPS SUBJECT LINES
- ❌ Multiple exclamation marks!!!
- ❌ "Click here", "Act now", "Free"
- ❌ No unsubscribe link
- ✅ Professional tone
- ✅ Clinic branding
- ✅ Clear purpose

**Solution 3: Ask patient to check spam**
Most common solution: email is in spam folder. Ask patient to:
1. Check spam/junk folder
2. Mark as "Not Spam"
3. Add sender to contacts

---

### Problem: Provider email shows full patient name in subject

**Symptom:**
Provider email subject: "Telehealth Ready - Jane Doe - Nov 5"
(Should be masked: "Telehealth Ready - J*** D*** - Nov 5")

**Cause:** PHI masking not applied to email subject

**Solution:**

**Check Node 312 (Send Provider Email):**
```javascript
// Subject should use masked name:
subject: "Telehealth Ready - {{ $json.patient_name_masked }} - {{ formatDate }}"

// NOT:
subject: "Telehealth Ready - {{ $json.patient_name }} - {{ formatDate }}"
```

Verify Node 305 (PHI Masking) created `patient_name_masked` field.

---

### Problem: Email HTML not rendering (shows plain text)

**Symptom:**
Patient receives email but it's plain text, no formatting/images

**Likely causes:**
1. Email client doesn't support HTML
2. HTML template has syntax error
3. Images not loading (broken URLs)

**Solutions:**

**Solution 1: Provide plain text fallback**
In Node 311/312, include both HTML and plain text:
```json
{
  "content": [
    {
      "type": "text/plain",
      "value": "Plain text version..."
    },
    {
      "type": "text/html",
      "value": "<html>HTML version...</html>"
    }
  ]
}
```

**Solution 2: Test HTML template**
Use HTML validator: validator.w3.org
Check for:
- Unclosed tags
- Invalid attributes
- JavaScript (not supported in email)

**Solution 3: Use inline CSS**
Email clients don't support `<style>` tags well. Use inline styles:
```html
<div style="background-color: #f0f0f0; padding: 20px;">
  <h1 style="color: #333;">Your Appointment</h1>
</div>
```

---

## CRM Update Issues

### Problem: "Contact not found" in HubSpot

**Symptom:**
```
Error at Node 309 (Update CRM):
404 Not Found: Contact ID 12345 does not exist
```

**Likely causes:**
1. contact_id from Module 02 is wrong
2. Contact was deleted in HubSpot
3. Using wrong HubSpot account

**Solutions:**

**Solution 1: Verify contact_id**
1. Open Module 02 execution
2. Check what contact_id was sent to Module 03
3. Go to HubSpot → Contacts
4. Search for contact by email
5. Compare contact ID in URL with contact_id sent

**Solution 2: Check if contact exists**
```bash
curl https://api.hubapi.com/crm/v3/objects/contacts/12345 \
  -H "Authorization: Bearer YOUR_HUBSPOT_TOKEN"
```
If 404, contact doesn't exist.

**Solution 3: Create contact first**
If contact was deleted, recreate in Module 02 before calling Module 03.

---

### Problem: "Property does not exist" in HubSpot

**Symptom:**
```
Error at Node 309:
400 Bad Request: Property 'telehealth_link' does not exist
```

**Likely causes:**
1. Custom property not created in HubSpot
2. Property name misspelled
3. Wrong object type (using Deal property on Contact)

**Solutions:**

**Solution 1: Create custom properties**
1. Go to HubSpot → Settings → Properties
2. Select "Contact properties"
3. Create these properties:
   - `telehealth_status` (single-line text)
   - `telehealth_link` (single-line text)
   - `telehealth_session_id` (single-line text)
   - `telehealth_platform` (single-line text)
   - `telehealth_scheduled_time` (date/time)
   - `telehealth_expires_at` (date/time)
   - `last_telehealth_update` (date/time)

**Solution 2: Check property names (case-sensitive!)**
```json
❌ WRONG: "TelehealthLink"
❌ WRONG: "telehealth_Link"
✅ RIGHT: "telehealth_link"
```

---

### Problem: CRM update succeeds but fields show "undefined"

**Symptom:**
HubSpot contact shows:
```
Telehealth Link: undefined
Telehealth Status: undefined
```

**Likely causes:**
1. Node 309 mapping references wrong fields
2. Data from Node 308 doesn't have expected structure

**Solutions:**

**Solution 1: Check Node 308 output**
1. Open execution
2. Click Node 308 (Format Session Links)
3. Verify output includes:
   - `session_link`
   - `session_id`
   - `platform`
   - `expires_at`

**Solution 2: Update Node 309 field mapping**
```javascript
// Should be:
"telehealth_link": "={{ $json.session_link }}"

// NOT:
"telehealth_link": "={{ $json.link }}"  // Wrong field name
```

---

## Performance Issues

### Problem: Execution takes > 5 seconds

**Symptom:**
`execution_time_ms: 6500` or higher

**Target:** < 2200ms average

**Likely causes:**
1. Zoom/Doxy API is slow
2. Network latency
3. Multiple retries happening
4. Email template too large

**Solutions:**

**Solution 1: Check individual node times**
1. Open execution in n8n
2. Look at execution time for each node
3. Find the slowest node
4. Common slow nodes:
   - Node 307 (Create Telehealth Session): 500-2000ms (normal)
   - Node 309 (Update CRM): 200-500ms (normal)
   - Node 311/312 (Send Emails): 200-400ms each (normal)

If any node > 5000ms, that's the bottleneck.

**Solution 2: Check if retries are triggering**
Look at n8n execution details:
- If Node 307 shows 3 attempts, API is failing and retrying
- Check Zoom/Doxy status pages
- Verify credentials

**Solution 3: Optimize email templates**
- Reduce image sizes (<100KB total)
- Use image CDN (not attachments)
- Minimize HTML complexity

**Solution 4: Increase timeout**
```
WORKFLOW_TIMEOUT_MS=300000  (5 minutes)
```
This is a band-aid — investigate why it's so slow!

---

### Problem: Parallel operations not actually parallel

**Symptom:**
Nodes 309-313 execute sequentially (slow) instead of parallel (fast)

**Likely causes:**
1. Nodes connected sequentially in workflow
2. Dependencies between nodes

**Solutions:**

**Solution 1: Verify workflow structure**
All nodes 309-313 should connect FROM Node 308, not from each other:
```
Node 308 → Node 309 (CRM)
        → Node 310 (SMS)
        → Node 311 (Email Patient)
        → Node 312 (Email Provider)
        → Node 313 (Logging)
```

NOT:
```
Node 308 → Node 309 → Node 310 → Node 311 → Node 312 → Node 313
```

**Solution 2: Remove dependencies**
Ensure nodes 309-313 don't reference each other's output.

---

### Problem: Workflow times out after 2 minutes

**Symptom:**
```
Execution timed out after 120000ms
```

**Solution:**
1. Increase timeout:
   ```
   WORKFLOW_TIMEOUT_MS=300000  (5 minutes)
   ```
2. Restart n8n
3. This is a band-aid — investigate why it's so slow (see above)

---

## PHI Masking Problems

### Problem: Google Sheets shows full patient email (unmasked)

**Symptom:**
Google Sheets cell shows: `jane.doe@example.com`
Should show: `j***e@example.com`

**THIS IS A CRITICAL SECURITY ISSUE!**

**Solutions:**

**Solution 1: Verify PHI masking is enabled**
```
ENABLE_PHI_MASKING=true
```

**Solution 2: Check Node 305 (PHI Masking for Logs)**
1. Open workflow
2. Find Node 305
3. Verify masking logic:
```javascript
function maskEmail(email) {
  const [local, domain] = email.split('@');
  const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
  return maskedLocal + '@' + domain;
}
```

**Solution 3: Check Node 313 (Log Session)**
Verify it uses `patient_email_masked` NOT `patient_email`:
```javascript
// Should be:
"Patient Email": "={{ $json.patient_email_masked }}"

// NOT:
"Patient Email": "={{ $json.patient_email }}"
```

**Solution 4: If in production, STOP IMMEDIATELY**
1. Disable the workflow
2. Delete exposed data from Google Sheets
3. Report as critical security incident
4. Do NOT re-enable until masking is confirmed working
5. Review access logs (who saw exposed data?)

---

### Problem: Provider email subject shows masked name

**Symptom:**
Provider email subject: "Telehealth Ready - J*** D***"
Provider can't identify patient from subject line alone

**Note:** This is actually CORRECT behavior for inbox privacy! But if clinic wants full name in subject:

**Solution:**
Update Node 312 subject line:
```javascript
// For masked (recommended for privacy):
subject: "Telehealth Ready - {{ $json.patient_name_masked }} - {{ formatDate }}"

// For full name (if clinic requires):
subject: "Telehealth Ready - {{ $json.patient_name }} - {{ formatDate }}"
```

**Trade-off:** Full name in subject = less privacy (visible in inbox preview, notifications)

---

### Problem: Patient SMS shows masked name

**Symptom:**
Patient SMS says "Hi J***,"
Should say "Hi Jane,"

**Cause:** Using masked name in patient communications (incorrect)

**Solution:**
Check Node 310 (Send Patient SMS):
```javascript
// Should be:
message: "Hi {{ $json.patient_name.split(' ')[0] }},"  // First name only

// NOT:
message: "Hi {{ $json.patient_name_masked.split(' ')[0] }},"
```

**Rule:** Patients receive FULL PHI (they're consenting). Only LOGS get masked PHI.

---

## Session Link Issues

### Problem: Session link expired before appointment time

**Symptom:**
Patient tries to join, sees "Meeting has expired" or "Link invalid"

**Likely causes:**
1. expires_at calculated incorrectly
2. Using Zoom instant meeting (expires immediately) instead of scheduled
3. Platform automatically expired old test sessions

**Solutions:**

**Solution 1: Check expires_at calculation**
Node 308 should calculate expiration as:
```javascript
const expiresAt = startTime.plus({
  days: parseInt($env.SESSION_LINK_EXPIRY_DAYS) || 1
}).toISO();
```
Default: 1 day AFTER scheduled_time (not 1 day after creation)

**Solution 2: Verify Zoom meeting type**
In Node 307, meeting type should be:
```json
{
  "type": "2"  // Scheduled meeting
}
```
NOT:
```json
{
  "type": "1"  // Instant meeting (expires when host leaves)
}
```

**Solution 3: For testing, disable expiration**
```
SESSION_LINK_EXPIRY_DAYS=365
```
Links valid for 1 year (testing only! Not for production)

---

### Problem: Session link works but requires password patient doesn't have

**Symptom:**
Patient clicks link, sees "Enter Meeting Password", but doesn't know password

**Likely causes:**
1. Password required but not included in SMS/email
2. Password generation failed
3. Platform doesn't support password in URL

**Solutions:**

**Solution 1: Verify password in notifications**
Check Node 310 (SMS) and Node 311 (Email):
```javascript
// Should include:
"Password: {{ $json.session_password }}"
```

**Solution 2: Include password in URL (Zoom)**
For Zoom, password can be embedded in URL:
```
https://zoom.us/j/1234567890?pwd=abc123xyz
```
Verify Node 308 extracts `join_url` (includes password) not `meeting_url` (no password).

**Solution 3: Disable password requirement**
If passwords cause too many issues:
```
REQUIRE_SESSION_PASSWORD=false
```
(Less secure — only for low-risk use cases)

---

### Problem: Multiple sessions created for same appointment

**Symptom:**
Patient has 2-3 different session links for same appointment

**Likely causes:**
1. Module 03 triggered multiple times for same booking
2. Module 02 retry logic creating duplicates

**Solutions:**

**Solution 1: Check Module 02 retries**
Verify Module 02 doesn't call Module 03 multiple times on success.

**Solution 2: Implement idempotency in Module 03**
Check if session already exists before creating new one:
```javascript
// In Node 306:
const existingSession = await checkCRM(appointmentId);
if (existingSession.telehealth_session_id) {
  return existingSession;  // Return existing session
}
// Otherwise create new session
```

**Solution 3: Use unique appointment IDs**
Ensure Module 02 generates unique appointment_id for each booking.

---

## Provider Access Issues

### Problem: Provider clicks host_link but doesn't have host controls

**Symptom:**
Provider joins meeting but can't:
- Start/stop recording
- Admit from waiting room
- Mute participants

**Likely causes:**
1. Provider used patient link instead of host link
2. host_link not extracted correctly from Zoom response
3. Wrong Zoom account role

**Solutions:**

**Solution 1: Verify provider receives host_link**
Check Node 312 (Send Provider Email):
```javascript
// Button should link to:
href: "={{ $json.host_link }}"

// NOT:
href: "={{ $json.session_link }}"  // This is patient link!
```

**Solution 2: Check Node 308 extraction**
For Zoom:
```javascript
hostLink = response.start_url;  // NOT join_url!
```

**Solution 3: Verify Zoom account**
Provider must sign in with same Zoom account that created meeting.

---

### Problem: Provider email not sent

**Symptom:**
- Patient receives SMS and email ✅
- Provider receives nothing ❌

**Likely causes:**
1. Provider email address not in input data
2. Node 312 failed
3. Email filtered as spam

**Solutions:**

**Solution 1: Check input data includes provider info**
Module 02 should send:
```json
{
  "provider_name": "Dr. Smith",
  "provider_email": "dr.smith@clinic.com"
}
```

**Solution 2: Verify Node 312 executed**
1. Check n8n execution
2. Find Node 312 (Send Provider Email)
3. If orange (failed but continued), check error
4. If gray (not executed), verify connection from Node 308

**Solution 3: Check provider's spam folder**
Provider emails often filtered because:
- Subject contains patient name (even masked)
- Automated sender
- Ask provider to whitelist `noreply@yourclinic.com`

---

## Environment Variable Issues

### Problem: "undefined" appears in session data

**Symptom:**
Session created but fields show:
```
Platform: undefined
Clinic ID: undefined
```

**Cause:** Environment variable referenced but not set

**Solutions:**

**Solution 1: Check which variable is missing**
Common missing variables:
- `TELEHEALTH_PLATFORM` (Zoom, Doxy.me, Amwell)
- `CLINIC_ID` (your clinic identifier)
- `DEFAULT_SESSION_DURATION` (defaults to 30)
- `SESSION_LINK_EXPIRY_DAYS` (defaults to 1)

**Solution 2: Set environment variables**
- Docker: Add to docker-compose.yml
- n8n Cloud: Settings → Environment Variables
- Self-hosted: Export in shell before starting n8n

Example `.env` file:
```bash
TELEHEALTH_PLATFORM=Zoom
CLINIC_ID=clinic-001
DEFAULT_SESSION_DURATION=30
SESSION_LINK_EXPIRY_DAYS=1
ENABLE_PHI_MASKING=true
```

**Solution 3: Restart n8n after changes**
```bash
# Docker:
docker-compose restart

# PM2:
pm2 restart n8n
```

---

### Problem: Changes to .env file don't take effect

**Symptom:**
You changed `TELEHEALTH_PLATFORM=Zoom` to `TELEHEALTH_PLATFORM=Doxy.me` but workflow still creates Zoom sessions

**Cause:** n8n caches environment variables

**Solution:**
1. After changing .env file, RESTART n8n:
   ```bash
   docker-compose restart
   # or
   pm2 restart n8n
   ```
2. Verify change took effect:
   - In workflow, check `{{$env.TELEHEALTH_PLATFORM}}`
   - Should show new value

---

## Network and Timeout Issues

### Problem: "ETIMEDOUT" or "ESOCKETTIMEDOUT"

**Symptom:**
```
Error at Node 307:
ETIMEDOUT: Connection timed out
```

**Likely causes:**
1. Zoom/Doxy API is down
2. Network connectivity issues
3. Firewall blocking API requests
4. Timeout setting too low

**Solutions:**

**Solution 1: Check API status pages**
- Zoom: status.zoom.us
- Doxy.me: status.doxy.me
- Amwell: (check their status page)

If outages reported, wait and retry later.

**Solution 2: Increase timeout**
In Node 307, set:
```json
{
  "timeout": 30000  // 30 seconds (instead of default 15s)
}
```

**Solution 3: Check network connectivity**
```bash
# Test internet connection:
ping zoom.us

# Test API endpoint:
curl -I https://api.zoom.us/v2/users/me
```

**Solution 4: Check firewall**
Ensure outbound HTTPS (port 443) is allowed to:
- api.zoom.us
- api.doxy.me
- api.sendgrid.com
- api.hubapi.com
- api.twilio.com

---

### Problem: SSL certificate errors

**Symptom:**
```
Error: unable to verify the first certificate
```

**Likely causes:**
1. Self-signed certificate on n8n server
2. Corporate proxy intercepting SSL
3. System time incorrect (certificate appears expired)

**Solutions:**

**Solution 1: Check system time**
```bash
date
```
If incorrect, sync with NTP server.

**Solution 2: Update CA certificates**
```bash
# Ubuntu/Debian:
sudo apt-get update && sudo apt-get install ca-certificates

# CentOS/RHEL:
sudo yum install ca-certificates
```

**Solution 3: Disable SSL verification (TESTING ONLY!)**
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
```
**WARNING:** This is insecure! Only use for local testing.

---

## Still Stuck?

**If you've tried everything and it still doesn't work:**

1. **Document the problem** using `/00_Shared/BugReport_Template.md`

2. **Gather this information:**
   - Exact error message
   - n8n execution ID
   - trace_id from response
   - Which node failed (number and name)
   - Test data used
   - Screenshots of error
   - What you've already tried

3. **Check these resources:**
   - n8n documentation: docs.n8n.io
   - Zoom API docs: marketplace.zoom.us/docs/api-reference
   - Doxy.me API docs: doxy.me/en/api
   - Twilio docs: www.twilio.com/docs
   - SendGrid docs: docs.sendgrid.com
   - HubSpot docs: developers.hubspot.com

4. **Check status pages:**
   - n8n: status.n8n.io
   - Zoom: status.zoom.us
   - Twilio: status.twilio.com
   - SendGrid: status.sendgrid.com
   - HubSpot: status.hubspot.com

5. **Get help:**
   - Team lead or technical support
   - n8n community forum: community.n8n.io
   - Module build notes: `module_03_build_notes.md`

---

## Quick Reference: Error Codes

| Error Code | Meaning | Common Fix |
|------------|---------|------------|
| 400 Bad Request | Invalid input data | Check validation errors in response |
| 401 Unauthorized | Invalid credentials | Reconnect OAuth credential in n8n |
| 403 Forbidden | No permission | Check API scopes, account type |
| 404 Not Found | Resource doesn't exist | Verify IDs, activate workflow |
| 409 Conflict | Duplicate resource | Use unique session IDs |
| 429 Too Many Requests | Rate limit hit | Wait, implement throttling |
| 500 Internal Server Error | Something broke | Check n8n execution logs |
| 503 Service Unavailable | External API down | Check status pages, retry later |
| ETIMEDOUT | Network timeout | Increase timeout, check connectivity |
| ECONNREFUSED | Connection refused | Verify n8n is running, check firewall |

### Twilio Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| 21211 | Invalid 'To' number | Use E.164 format (+15551234567) |
| 21212 | 'From' number not verified | Verify number in Twilio console |
| 21408 | Permission denied (trial) | Verify recipient or upgrade account |
| 30006 | Landline/unreachable | Use mobile number, try email |

---

**Remember:** Finding problems means testing is working! Every bug found is a bug fixed! 🐛🔍
