# cURL Testing Snippets

**What is cURL?** A simple tool for sending data to web addresses from your computer's command line (like typing a web address into a browser, but more powerful).

**Why use cURL?** Test webhooks and APIs quickly without building forms or clicking through websites.

**For Complete Beginners:** This guide explains everything step-by-step, assuming zero technical knowledge.

---

## How to Use This Guide

1. **Open your terminal/command prompt:**
   - **Windows:** Press `Windows key + R`, type `cmd`, press Enter
   - **Mac:** Press `Command + Space`, type `terminal`, press Enter
   - **Linux:** Press `Ctrl + Alt + T`

2. **Copy a snippet from below**

3. **Replace the placeholder values** (things in ALL_CAPS or wrapped in `< >`)

4. **Paste into your terminal and press Enter**

5. **Read the response** — it will show you what happened

---

## What You'll See in the Snippets

- `curl` = The command name (tells your computer to send web data)
- `-X POST` = Send data (like submitting a form)
- `-H` = Header (extra information about what you're sending)
- `-d` = Data (the actual information you want to send)
- `\` = Line continuation (makes long commands easier to read — you can remove these and put everything on one line)

---

## Important Safety Notes

⚠️ **Always use mock data** from `MockIdentities.json` — never real patient information!

⚠️ **Test in development environments** only — not your live production system!

⚠️ **Never share API keys** publicly — keep them secret!

---

## Module 01: Intake & Lead Capture

### Test 1: Submit a Valid Lead (Happy Path)

**What this does:** Sends a new patient lead to your intake webhook

**When to use:** Test that leads are received and processed correctly

```bash
curl -X POST https://YOUR-N8N-URL.com/webhook/intake-lead-capture-v1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Anderson",
    "email": "alice.anderson.test@example.com",
    "phone": "+15551234001",
    "source": "website",
    "message": "I would like to schedule a consultation next week.",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "spring_2025"
  }'
```

**What to replace:**
- `YOUR-N8N-URL.com` → Your actual n8n instance URL (e.g., `n8n.yourclinic.com`)
- Webhook path should match your `WEBHOOK_ID` environment variable

**Expected response:**
```json
{
  "status": "success",
  "message": "Lead received successfully",
  "lead_id": "L-20251031-001"
}
```

**What success looks like:**
- You see `"status": "success"` in the response
- A new row appears in your Google Sheet within 10 seconds
- A notification appears in your Slack/Teams channel
- The workflow execution shows green checkmarks in n8n

---

### Test 2: Submit Lead with Missing Email (Invalid Data)

**What this does:** Tests error handling when required fields are missing

**When to use:** Verify your workflow catches validation errors

```bash
curl -X POST https://YOUR-N8N-URL.com/webhook/intake-lead-capture-v1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "No",
    "last_name": "Email",
    "phone": "+15556661001",
    "source": "website",
    "message": "I forgot to provide my email address"
  }'
```

**Expected response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["email is required"]
}
```

**What success looks like:**
- You see `"status": "error"` in the response
- The error message clearly states what's wrong
- No incomplete data is saved to your sheet
- The workflow execution log shows the validation node caught the error

---

### Test 3: Submit Lead with Phone Number in Various Formats

**What this does:** Tests phone normalization (converting different formats to a standard one)

**When to use:** Verify that phone numbers are handled consistently

```bash
# Format 1: With spaces
curl -X POST https://YOUR-N8N-URL.com/webhook/intake-lead-capture-v1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Phone",
    "email": "test.phone@example.com",
    "phone": "555 123 4567",
    "source": "website"
  }'

# Format 2: With parentheses and dashes
curl -X POST https://YOUR-N8N-URL.com/webhook/intake-lead-capture-v1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Phone2",
    "email": "test.phone2@example.com",
    "phone": "(555) 123-4567",
    "source": "website"
  }'

# Format 3: Already in E.164 format
curl -X POST https://YOUR-N8N-URL.com/webhook/intake-lead-capture-v1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Phone3",
    "email": "test.phone3@example.com",
    "phone": "+15551234567",
    "source": "website"
  }'
```

**Expected result:** All three phone numbers should be stored as `+15551234567` in your Google Sheet

---

## Module 02: Consult Booking & Scheduling

### Test 4: Book an Appointment

**What this does:** Creates a new appointment in Google Calendar

**When to use:** Test end-to-end booking flow

```bash
curl -X POST https://YOUR-N8N-URL.com/webhook/booking \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "TEST-P-001",
    "first_name": "Alice",
    "last_name": "Anderson",
    "email": "alice.anderson.test@example.com",
    "phone": "+15551234001",
    "appointment_date": "2025-11-15",
    "appointment_time": "14:00",
    "timezone": "America/New_York",
    "provider_id": "TEST-PROV-001",
    "appointment_type": "consultation",
    "notes": "First visit - general checkup"
  }'
```

**What to replace:**
- `appointment_date` → Use a future date (format: YYYY-MM-DD)
- `appointment_time` → Use business hours (format: HH:MM in 24-hour time)
- `timezone` → Your actual timezone (see EnvMatrix.md for list)

**Expected response:**
```json
{
  "status": "success",
  "message": "Appointment booked successfully",
  "appointment_id": "APT-20251115-001",
  "calendar_event_id": "abc123xyz789",
  "confirmation_email_sent": true
}
```

**What success looks like:**
- Appointment appears in Google Calendar
- Patient receives confirmation email within 2 minutes
- Calendar invite (.ics file) is attached to email

---

### Test 5: Attempt Double-Booking (Should Fail)

**What this does:** Try to book two appointments at the same time

**When to use:** Verify double-booking prevention

**Step 1:** Book the first appointment (use Test 4 above)

**Step 2:** Try to book a second appointment at the exact same time:

```bash
curl -X POST https://YOUR-N8N-URL.com/webhook/booking \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "TEST-P-002",
    "first_name": "Bob",
    "last_name": "Builder",
    "email": "bob.builder.test@example.com",
    "phone": "+15551234002",
    "appointment_date": "2025-11-15",
    "appointment_time": "14:00",
    "timezone": "America/New_York",
    "provider_id": "TEST-PROV-001",
    "appointment_type": "consultation"
  }'
```

**Expected response:**
```json
{
  "status": "error",
  "message": "Time slot unavailable",
  "available_times": ["13:00", "15:00", "16:00"]
}
```

---

## Module 03: Telehealth Session

### Test 6: Generate Zoom Meeting Link

**What this does:** Creates a Zoom video meeting for a telehealth visit

**When to use:** Test video platform integration

```bash
curl -X POST https://YOUR-N8N-URL.com/webhook/telehealth \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "TEST-P-001",
    "appointment_id": "APT-20251115-001",
    "provider_id": "TEST-PROV-001",
    "session_duration_minutes": 30,
    "scheduled_start": "2025-11-15T14:00:00Z",
    "platform": "zoom"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "session_id": "TH-20251115-001",
  "platform": "zoom",
  "join_url": "https://zoom.us/j/1234567890?pwd=abc123",
  "provider_join_url": "https://zoom.us/s/1234567890?zak=xyz789",
  "session_expires_at": "2025-11-15T15:00:00Z",
  "email_sent_to_patient": true
}
```

**What success looks like:**
- Patient receives email with join link
- Provider can join using separate secure link
- Meeting is configured with waiting room (HIPAA requirement)

---

## Module 04: Billing & Payments

### Test 7: Process Payment (Test Card - Success)

**What this does:** Charges a test credit card using Stripe

**When to use:** Verify payment processing

⚠️ **Important:** Use Stripe test mode (`sk_test_...`) and test card numbers only!

```bash
curl -X POST https://YOUR-N8N-URL.com/webhook/payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "TEST-P-001",
    "appointment_id": "APT-20251115-001",
    "amount": 150.00,
    "currency": "usd",
    "description": "Consultation - Dr. Sarah Smith",
    "card_number": "4242424242424242",
    "exp_month": "12",
    "exp_year": "2030",
    "cvc": "123",
    "billing_zip": "12345"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "payment_id": "PAY-20251115-001",
  "stripe_charge_id": "ch_1A2B3C4D5E6F7G8H",
  "amount": 150.00,
  "currency": "usd",
  "receipt_url": "https://stripe.com/receipts/...",
  "receipt_email_sent": true
}
```

---

### Test 8: Process Payment (Test Card - Decline)

**What this does:** Tests payment failure handling

```bash
curl -X POST https://YOUR-N8N-URL.com/webhook/payment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "TEST-P-006",
    "appointment_id": "APT-20251115-002",
    "amount": 150.00,
    "currency": "usd",
    "description": "Consultation - Dr. Sarah Smith",
    "card_number": "4000000000000002",
    "exp_month": "12",
    "exp_year": "2030",
    "cvc": "123",
    "billing_zip": "12345"
  }'
```

**Expected response:**
```json
{
  "status": "error",
  "error_type": "card_declined",
  "message": "Your card was declined",
  "decline_code": "generic_decline",
  "payment_id": null
}
```

**What success looks like:**
- Error is handled gracefully (no crash)
- Patient sees friendly error message
- Staff receives notification of failed payment
- Retry is offered to patient

---

## Module 08: Messaging Omnichannel

### Test 9: Send Inbound SMS Message

**What this does:** Simulates receiving an SMS from a patient

**When to use:** Test message routing and intent classification

```bash
curl -X POST https://YOUR-N8N-URL.com/webhook/sms-inbound \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'From=+15551234001&To=+15559876543&Body=I need to reschedule my appointment for tomorrow'
```

**Expected response:**
```json
{
  "status": "success",
  "message_id": "MSG-20251031-001",
  "intent": "booking",
  "priority": "normal",
  "auto_response_sent": true
}
```

**What success looks like:**
- Message is classified with correct intent ("booking")
- Auto-response is sent to patient within seconds
- Staff notification is sent
- Message is logged in CRM/Google Sheets

---

### Test 10: Send Urgent Message

**What this does:** Tests priority detection for urgent patient messages

```bash
curl -X POST https://YOUR-N8N-URL.com/webhook/sms-inbound \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'From=+15551234003&To=+15559876543&Body=URGENT: Severe chest pain, need help immediately!'
```

**Expected response:**
```json
{
  "status": "success",
  "message_id": "MSG-20251031-002",
  "intent": "urgent",
  "priority": "urgent",
  "auto_response_sent": true,
  "staff_alert_sent": true,
  "escalated": true
}
```

**What success looks like:**
- Message is flagged as URGENT
- Staff receives immediate alert (push notification/call)
- Auto-response directs patient to 911 if needed
- Message appears at top of queue

---

## Testing Slack/Teams Webhooks

### Test 11: Send Notification to Slack

**What this does:** Verifies your Slack webhook is working

```bash
curl -X POST YOUR_SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test notification from Aigent Testing Package",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Test Notification*\nIf you see this, your Slack integration is working correctly! ✅"
        }
      }
    ]
  }'
```

**What to replace:**
- `YOUR_SLACK_WEBHOOK_URL` → Your actual Slack webhook (from EnvMatrix.md)

**Expected result:** Message appears in your Slack channel within 2 seconds

---

### Test 12: Send Notification to Microsoft Teams

**What this does:** Verifies your Teams webhook is working

```bash
curl -X POST YOUR_TEAMS_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    "summary": "Test Notification",
    "themeColor": "0078D7",
    "title": "Test Notification from Aigent",
    "text": "If you see this, your Microsoft Teams integration is working correctly! ✅"
  }'
```

**What to replace:**
- `YOUR_TEAMS_WEBHOOK_URL` → Your actual Teams webhook (from EnvMatrix.md)

**Expected result:** Message appears in your Teams channel within 2 seconds

---

## Testing Google Sheets Write

### Test 13: Manually Add Row to Google Sheet (Using Sheets API)

**What this does:** Tests Google Sheets write access directly

⚠️ **Note:** This requires a Google Sheets API key. For most users, testing through Module 01 intake workflow is easier.

```bash
curl -X POST "https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID/values/YOUR_TAB_NAME:append?valueInputOption=RAW" \
  -H "Authorization: Bearer YOUR_GOOGLE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "values": [
      ["Test", "User", "test.user@example.com", "+15551234567", "2025-10-31", "website", "Test entry from cURL"]
    ]
  }'
```

**Easier alternative:** Just run Module 01 intake workflow — it writes to Sheets automatically!

---

## Common cURL Errors & Solutions

### Error: "curl: command not found"

**Problem:** cURL is not installed on your computer

**Solution (Windows):**
1. Open PowerShell as Administrator
2. Run: `winget install curl`
3. Or download from: https://curl.se/windows/

**Solution (Mac):** cURL comes pre-installed. If missing, run: `brew install curl`

**Solution (Linux):** Run: `sudo apt-get install curl` (Ubuntu/Debian) or `sudo yum install curl` (RedHat/CentOS)

---

### Error: "Could not resolve host"

**Problem:** The URL you entered doesn't exist or has a typo

**Solution:**
- Double-check the URL for typos
- Verify your n8n instance is running
- Test the URL in a web browser first

---

### Error: "Connection refused"

**Problem:** The server isn't running or the port is wrong

**Solution:**
- Verify your n8n instance is running (go to URL in browser)
- Check firewall settings
- Verify you're using the correct port (usually :5678 for n8n)

---

### Error: "SSL certificate problem"

**Problem:** HTTPS certificate can't be verified (common in local development)

**Solution (Development Only):**
Add `-k` flag to bypass SSL verification:
```bash
curl -k -X POST https://YOUR-URL...
```

⚠️ **Never use `-k` in production!** Fix your SSL certificates instead.

---

### Error: "Unexpected token '<' in JSON"

**Problem:** The server returned HTML instead of JSON (usually an error page)

**Solution:**
- Check if the URL is correct
- Look at the full response (remove `-s` flag to see everything)
- The server might be returning an HTML error page — check n8n logs

---

## Windows Command Prompt vs. PowerShell

**If using Windows Command Prompt (cmd):**
- Use `^` instead of `\` for line breaks
- Remove the line breaks entirely (put command on one line)

**If using PowerShell:**
- The snippets above should work as-is
- If you see errors, try adding `--% ` before the curl command

**Example for Windows Command Prompt (all one line):**
```cmd
curl -X POST https://YOUR-URL.com/webhook/intake -H "Content-Type: application/json" -d "{\"first_name\": \"Alice\", \"last_name\": \"Anderson\", \"email\": \"alice@example.com\", \"phone\": \"+15551234001\"}"
```

---

## Quick Reference: HTTP Status Codes

When you run a cURL command, you'll see a response code. Here's what they mean:

| Code | Meaning | What It Means for You |
|------|---------|----------------------|
| 200 | OK | Success! Everything worked |
| 201 | Created | Success! New resource created |
| 400 | Bad Request | You sent invalid data (check your JSON) |
| 401 | Unauthorized | API key is wrong or missing |
| 403 | Forbidden | You don't have permission |
| 404 | Not Found | The URL doesn't exist (check for typos) |
| 429 | Too Many Requests | You're sending requests too fast (slow down!) |
| 500 | Internal Server Error | Something crashed on the server (not your fault) |
| 503 | Service Unavailable | Server is down or overloaded |

---

## Tips for Success

### 1. Start Simple
- Test webhook connectivity first (Test 11 or 12)
- Then test with minimal data
- Gradually add complexity

### 2. Use Pretty Print
Add `| python -m json.tool` to make responses readable:
```bash
curl -X POST https://YOUR-URL.com/webhook/intake \
  -H "Content-Type: application/json" \
  -d '{...}' | python -m json.tool
```

### 3. Save Common Commands
Create a text file with your frequently-used snippets (with URLs already filled in)

### 4. Check the Response
Always read the response! It tells you what actually happened.

### 5. Use Mock Data
All examples in this file use data from `MockIdentities.json` — do the same!

---

## Next Steps

Once you're comfortable with cURL:
1. Try Postman (visual tool for API testing) — see `Postman_Collection.json`
2. Automate test sequences with bash scripts
3. Create custom test scenarios for your clinic

---

## Getting Help

**If cURL isn't working:**
1. Test the URL in a web browser first
2. Check your n8n workflow is running (green "Active" toggle)
3. Review the module's `Troubleshooting.md`
4. Verify environment variables are set (EnvMatrix.md)

**If responses are unexpected:**
1. Check the n8n execution logs
2. Verify you're using the correct mock data
3. Look for error messages in the response
4. Compare to expected responses in module TestCases.md

---

**Remember:** cURL is just a tool for sending data. Don't be intimidated — start with simple tests and build up! 🚀
