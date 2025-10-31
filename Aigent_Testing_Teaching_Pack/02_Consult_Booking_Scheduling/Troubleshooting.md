# Module 02: Consult Booking & Scheduling - Troubleshooting Guide

**Module:** 02 - Consult Booking & Scheduling
**Version:** 1.1.0-enhanced
**Last Updated:** 2025-10-31
**For:** Complete beginners

---

## How to Use This Guide

**When to use this:**
- A booking test failed and you don't know why
- Calendar events aren't appearing
- Confirmations (email/SMS) aren't being sent
- Timezone conversions seem wrong
- Double-booking prevention isn't working
- Something works sometimes but not always

**How to use this:**
1. Find your symptom in the Table of Contents
2. Read the likely causes
3. Try each solution step by step
4. Check if the problem is fixed
5. If not fixed, try the next solution
6. Still stuck? See "Still Stuck?" section at the end

**Important:** Most booking issues fall into one of these categories:
- Validation errors (your test data is wrong)
- Calendar API issues (credentials or connectivity)
- Timezone problems (configuration or conversion)
- Notification failures (SendGrid/Twilio)

---

## Table of Contents

1. [Validation Errors](#validation-errors)
2. [Calendar Integration Issues](#calendar-integration-issues)
3. [Email Confirmation Problems](#email-confirmation-problems)
4. [SMS Confirmation Problems](#sms-confirmation-problems)
5. [Timezone Issues](#timezone-issues)
6. [Double-Booking Prevention](#double-booking-prevention)
7. [Performance Issues](#performance-issues)
8. [Google Sheets Logging Problems](#google-sheets-logging-problems)
9. [Data Quality Issues](#data-quality-issues)
10. [Environment Variable Issues](#environment-variable-issues)
11. [n8n Workflow Problems](#n8n-workflow-problems)
12. [.ics Attachment Issues](#ics-attachment-issues)

---

## Validation Errors

### Problem: "email is required" but I sent an email!

**Symptom:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["email: required and must be valid format"]
}
```

**Likely causes:**
1. Field name is wrong (case-sensitive!)
2. Email is in nested object
3. JSON formatting error
4. Extra spaces in field name

**Solutions:**

**Solution 1: Check field name (case matters!)**
```json
❌ WRONG: {"Email": "test@example.com"}
✅ RIGHT: {"email": "test@example.com"}

❌ WRONG: {"e-mail": "test@example.com"}
✅ RIGHT: {"email": "test@example.com"}
```

**Solution 2: Make sure email is at top level**
```json
❌ WRONG:
{
  "patient": {
    "email": "test@example.com"
  }
}

✅ RIGHT:
{
  "email": "test@example.com"
}
```

**Solution 3: Check JSON formatting**
- Use a JSON validator: jsonlint.com
- Common mistakes:
  - Missing comma between fields
  - Missing quotes around strings
  - Trailing comma after last field

**Solution 4: Remove extra spaces**
```json
❌ WRONG: "email ": "test@example.com"
✅ RIGHT: "email": "test@example.com"
```

---

### Problem: "preferred_date: cannot be in the past"

**Symptom:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["preferred_date: cannot be in the past"]
}
```

**Cause:** You're trying to book an appointment for a date that has already passed

**Solutions:**

**Solution 1: Use a future date**
```json
❌ WRONG: "preferred_date": "2020-01-01"
✅ RIGHT: "preferred_date": "2025-11-15"
```

**Solution 2: Use tomorrow's date**
- Today is 2025-10-31
- Use 2025-11-01 or later

**Solution 3: Check your timezone**
- If you're testing late at night, make sure you're not accidentally using "today" which might be "yesterday" in another timezone
- Always use dates at least 1 day in the future to be safe

---

### Problem: "preferred_date: must be valid ISO 8601 format (YYYY-MM-DD)"

**Symptom:**
Your date looks fine but gets rejected

**Common causes:**

**1. Wrong date format**
```json
❌ WRONG: "preferred_date": "11/15/2025"  (MM/DD/YYYY)
❌ WRONG: "preferred_date": "15-11-2025"  (DD-MM-YYYY)
❌ WRONG: "preferred_date": "Nov 15, 2025"  (text format)
✅ RIGHT: "preferred_date": "2025-11-15"  (YYYY-MM-DD)
```

**2. Slashes instead of dashes**
```json
❌ WRONG: "preferred_date": "2025/11/15"
✅ RIGHT: "preferred_date": "2025-11-15"
```

**3. Invalid date (like February 30)**
```json
❌ WRONG: "preferred_date": "2025-02-30"  (Feb has 28/29 days)
✅ RIGHT: "preferred_date": "2025-02-28"
```

**Remember:** Always use YYYY-MM-DD format!

---

### Problem: "preferred_time: must be valid HH:MM format"

**Symptom:**
Your time is rejected

**Common causes:**

**1. Using 12-hour format instead of 24-hour**
```json
❌ WRONG: "preferred_time": "2:30 PM"
❌ WRONG: "preferred_time": "2:30pm"
❌ WRONG: "preferred_time": "14:30:00"  (includes seconds)
✅ RIGHT: "preferred_time": "14:30"  (24-hour format, HH:MM)
```

**2. Missing leading zero**
```json
❌ WRONG: "preferred_time": "9:00"  (should be 09:00)
✅ RIGHT: "preferred_time": "09:00"
```

**3. Invalid time**
```json
❌ WRONG: "preferred_time": "25:00"  (hour > 23)
❌ WRONG: "preferred_time": "14:60"  (minute > 59)
✅ RIGHT: "preferred_time": "14:30"
```

**Quick reference:**
- 9:00 AM = 09:00
- 12:00 PM (noon) = 12:00
- 2:30 PM = 14:30
- 5:00 PM = 17:00
- 11:30 PM = 23:30

---

### Problem: "phone: minimum 7 digits"

**Symptom:**
Your phone number is rejected

**Common causes:**

**1. Phone number too short**
```json
❌ WRONG: "phone": "123"
❌ WRONG: "phone": "555-1234"  (only 7 digits, missing area code)
✅ RIGHT: "phone": "+1-555-123-4567"
```

**2. Missing country code**
For international numbers, include country code:
```json
✅ US: "phone": "+1-555-123-4567"
✅ UK: "phone": "+44-20-7123-4567"
✅ Japan: "phone": "+81-3-1234-5678"
```

**3. Extra characters that aren't digits**
The validator counts ONLY digits (not spaces, dashes, or parentheses):
```json
✅ VALID: "phone": "+1-555-123-4567"  (10 digits after +1)
✅ VALID: "phone": "(555) 123-4567"  (10 digits)
✅ VALID: "phone": "5551234567"  (10 digits)
```

---

## Calendar Integration Issues

### Problem: "No available appointments" when calendar is empty

**Symptom:**
```json
{
  "success": false,
  "error": "No available appointments",
  "error_code": "NO_AVAILABILITY"
}
```

But you KNOW the calendar is empty!

**Likely causes:**
1. Wrong calendar ID
2. Wrong event type ID
3. Calendar API credentials expired
4. Requesting time outside business hours
5. Calendar API is down

**Solutions:**

**Solution 1: Verify calendar credentials**
1. Open n8n → Credentials
2. Find your Google Calendar credential
3. Click "Test" button
4. If it fails, click "Reconnect"
5. Sign in with Google
6. Grant permissions
7. Save credential

**Solution 2: Check calendar ID**
```bash
# In environment variables
GOOGLE_CALENDAR_ID=your-calendar@gmail.com
```
1. Open Google Calendar in browser
2. Go to Settings → Calendars
3. Find your calendar
4. Copy the Calendar ID (email format)
5. Verify it matches environment variable

**Solution 3: Verify event type (Cal.com)**
```bash
SCHEDULING_EVENT_TYPE_ID=123456
```
1. Log into Cal.com
2. Go to Event Types
3. Find the event type you want to use
4. Copy its ID
5. Update environment variable

**Solution 4: Check business hours**
- If you're requesting 11:00 PM but business hours are 9 AM - 5 PM, it will be rejected
- Try requesting a time during business hours (e.g., 14:00 / 2:00 PM)

**Solution 5: Test calendar API directly**
```bash
curl "https://www.googleapis.com/calendar/v3/calendars/YOUR_CALENDAR_ID/events?maxResults=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
If this fails, Google Calendar API is down or credentials are wrong

---

### Problem: Calendar event not created

**Symptom:**
- HTTP response shows success ✅
- Email/SMS confirmations sent ✅
- But no event in Google Calendar ❌

**This is CRITICAL — patient was told appointment is confirmed but provider won't see it!**

**Solutions:**

**Solution 1: Check n8n execution log**
1. Open n8n → Executions
2. Find the booking execution
3. Click on "Create Calendar Event" node
4. Read the error message
5. Common errors:
   - `403 Forbidden` → Calendar is read-only
   - `401 Unauthorized` → Credential expired
   - `404 Not Found` → Wrong calendar ID

**Solution 2: Verify calendar permissions**
1. Open Google Calendar
2. Click on your calendar → Settings
3. Share with the Google account used in n8n
4. Grant "Make changes to events" permission
5. Save

**Solution 3: Check calendar isn't read-only**
1. Try manually creating an event in Google Calendar
2. If you can't, the calendar is read-only
3. Check calendar settings
4. Enable editing

**Solution 4: Verify calendar_event_id in response**
```json
{
  "success": true,
  "calendar_event_id": "evt_abc123xyz"  ← This should be present!
}
```
If `calendar_event_id` is missing or empty, event creation failed

**Solution 5: Check Google Calendar API quota**
- Google Calendar API has daily limits
- If you've created 100s of test events, you may hit quota
- Wait 24 hours or use a different calendar

---

### Problem: Events created in wrong calendar

**Symptom:**
Event is created, but in a different calendar than expected

**Solutions:**

**Solution 1: Verify calendar ID**
```bash
GOOGLE_CALENDAR_ID=your-calendar@gmail.com
```
Should match the calendar where you want events

**Solution 2: Check if you have multiple calendars**
1. Open Google Calendar
2. Left sidebar shows all calendars
3. Make sure you're looking at the right one!
4. Event might be in "Other calendars" section

**Solution 3: Use calendar-specific ID**
Don't use "primary" — use the actual calendar email address

---

### Problem: Calendar API timeout

**Symptom:**
```
Error: Timeout after 30000ms
Node: Create Calendar Event
```

**Likely causes:**
1. Google Calendar API is slow
2. Network connectivity issues
3. Too many retries

**Solutions:**

**Solution 1: Increase timeout**
```bash
CALENDAR_API_TIMEOUT_MS=60000  # 60 seconds
```

**Solution 2: Check Google Calendar status**
Go to: https://www.google.com/appsstatus/dashboard/
Look for Calendar API issues

**Solution 3: Check your internet connection**
```bash
ping google.com
```
If slow or failing, network is the issue

**Solution 4: Retry the booking**
Sometimes it's just a temporary glitch — try again

---

## Email Confirmation Problems

### Problem: No email confirmation sent

**Symptom:**
- Booking succeeds ✅
- Calendar event created ✅
- But patient receives no email ❌

**Solutions:**

**Solution 1: Check HTTP response**
```json
{
  "confirmation_sent": {
    "email": false  ← This tells you email failed
  }
}
```
If `email: false`, check n8n logs for why

**Solution 2: Verify SendGrid API key**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```
1. Log into SendGrid
2. Go to Settings → API Keys
3. Verify the key exists and is active
4. If not, create a new key
5. Update environment variable

**Solution 3: Check sender email is verified**
1. Log into SendGrid
2. Go to Settings → Sender Authentication
3. Verify your sender email is verified
4. If not, complete verification process

**Solution 4: Check SendGrid logs**
1. Log into SendGrid
2. Go to Activity → Activity Feed
3. Search for the recipient email
4. Look for delivery status and errors
5. Common errors:
   - Bounced (invalid email address)
   - Dropped (unsubscribed or blocked)
   - Deferred (temporary delay, will retry)

**Solution 5: Check spam folder**
Ask recipient to check spam/junk folder

**Solution 6: Test SendGrid independently**
```bash
curl -X POST "https://api.sendgrid.com/v3/mail/send" \
  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{
      "to": [{"email": "test@example.com"}]
    }],
    "from": {"email": "appointments@yourdomain.com"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test email"}]
  }'
```
If this fails, SendGrid credentials are wrong

---

### Problem: Email sent but .ics attachment missing

**Symptom:**
- Email received ✅
- But no calendar attachment ❌

**Solutions:**

**Solution 1: Check .ics generation node**
1. Open n8n execution log
2. Find "Generate .ics File" node
3. Verify it executed (green checkmark)
4. Click on it to see output
5. Check if `ics_content` field has data

**Solution 2: Verify email template includes attachment**
1. Check email sending node in workflow
2. Verify attachments field is configured
3. Should reference the .ics file from previous node

**Solution 3: Check file size**
- .ics files should be < 5 KB
- If larger, email providers may strip it
- Review .ics generation logic

**Solution 4: Check email client**
Some email clients (especially web-based) hide attachments:
- Try viewing email in different client (Gmail app, Outlook, etc.)
- Look for "Download attachment" link

---

### Problem: Email has wrong time or timezone

**Symptom:**
Email says "2:30 PM Eastern" but patient is in Pacific timezone

**Solutions:**

**Solution 1: Verify email template uses patient timezone**
Email should show time in PATIENT's timezone, not clinic's

Check email template:
```
❌ WRONG: Your appointment is at {{clinic_local_time}}
✅ RIGHT: Your appointment is at {{appointment_time}} {{patient_timezone}}
```

**Solution 2: Verify timezone conversion logic**
1. Check n8n execution log
2. Find timezone conversion node
3. Verify input: patient timezone (America/Los_Angeles)
4. Verify output: correct converted time

**Solution 3: Test with different timezones**
Book appointments with different timezones and verify each email shows correct local time

---

## SMS Confirmation Problems

### Problem: No SMS confirmation sent

**Symptom:**
- Booking succeeds ✅
- Email sent ✅
- But no SMS received ❌

**Solutions:**

**Solution 1: Check HTTP response**
```json
{
  "confirmation_sent": {
    "sms": false  ← This tells you SMS failed
  }
}
```

**Solution 2: Verify Twilio credentials**
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_FROM=+15551234567
```
1. Log into Twilio
2. Go to Account → General Settings
3. Verify Account SID and Auth Token
4. Update environment variables if different

**Solution 3: Check Twilio account balance**
1. Log into Twilio
2. Check account balance
3. If $0.00, add funds
4. SMS costs ~$0.0075 per message

**Solution 4: Verify phone number format**
```json
✅ CORRECT: "+15551234567"
❌ WRONG: "555-123-4567"  (missing country code)
❌ WRONG: "15551234567"  (missing +)
```

**Solution 5: Check if phone is a landline**
Twilio cannot send SMS to landlines — only mobile phones

**Solution 6: Check Twilio logs**
1. Log into Twilio
2. Go to Monitor → Logs → SMS
3. Find your message
4. Check delivery status:
   - `sent` → Delivered successfully
   - `failed` → See error code
   - `undelivered` → Carrier rejected
5. Common error codes:
   - 21211 → Invalid 'To' phone number
   - 21408 → Permission to send SMS not enabled
   - 21610 → Unsubscribed recipient

**Solution 7: Test Twilio independently**
```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json" \
  --data-urlencode "To=+15551234567" \
  --data-urlencode "From=+15557654321" \
  --data-urlencode "Body=Test SMS" \
  -u "YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN"
```

---

### Problem: SMS sent but message is garbled

**Symptom:**
SMS received but has strange characters or is cut off

**Solutions:**

**Solution 1: Remove special characters**
- Avoid emojis in SMS (may not render on all carriers)
- Stick to ASCII characters (A-Z, 0-9, basic punctuation)

**Solution 2: Shorten message**
- SMS limit is 160 characters
- Messages > 160 chars split into multiple messages
- Keep SMS brief and essential

**Solution 3: Check encoding**
- Non-ASCII characters use different encoding
- This reduces character limit to 70 chars
- Use plain English text only

---

### Problem: SMS delayed (> 5 minutes)

**Symptom:**
SMS eventually arrives but takes > 5 minutes

**Causes:**
1. Carrier delays (not your fault!)
2. Twilio queue backlog
3. Recipient phone is off or out of service

**Solutions:**

**Solution 1: Check Twilio status**
Go to: https://status.twilio.com
Look for SMS delivery delays

**Solution 2: Accept that SMS is not instant**
- SMS can take 30 seconds to 5 minutes
- Email is more reliable for critical confirmations
- This is why module sends BOTH email and SMS

**Solution 3: Verify message was queued**
Check Twilio logs — if status is `queued` or `sent`, it's on its way

---

## Timezone Issues

### Problem: Wrong time in calendar event

**Symptom:**
Patient books 10:00 AM, but calendar shows 8:00 AM (or some other wrong time)

**This is a CRITICAL issue — provider will miss appointment!**

**Solutions:**

**Solution 1: Verify clinic timezone**
```bash
CLINIC_TIMEZONE=America/New_York
```
Should match your clinic's actual timezone

Common values:
- `America/New_York` (Eastern)
- `America/Chicago` (Central)
- `America/Denver` (Mountain)
- `America/Los_Angeles` (Pacific)

**Solution 2: Check timezone conversion logic**
1. Open n8n execution log
2. Find "Timezone Conversion" node
3. Check input:
   - Patient timezone: `America/Los_Angeles`
   - Patient time: `10:00`
4. Check output:
   - Clinic timezone: `America/New_York`
   - Clinic time: `13:00` (10 AM Pacific = 1 PM Eastern)

**Solution 3: Account for daylight saving time**
Timezone offsets change with DST:
- Eastern: UTC-5 (winter) or UTC-4 (summer)
- Pacific: UTC-8 (winter) or UTC-7 (summer)

Always use IANA timezone names (America/New_York), NOT abbreviations (EST)!

**Solution 4: Manually verify conversion**
Use a timezone converter: worldtimebuddy.com
- Enter patient time in patient timezone
- Verify it matches clinic time in clinic timezone

---

### Problem: .ics file shows wrong time when opened

**Symptom:**
- Email says 2:30 PM Pacific
- But when you open .ics file, calendar shows 12:30 PM Pacific

**Solutions:**

**Solution 1: Check .ics file timezone**
1. Download .ics file
2. Open in text editor (Notepad)
3. Look for DTSTART and DTEND lines
4. Should include timezone info:
   ```
   DTSTART;TZID=America/Los_Angeles:20251115T143000
   ```

**Solution 2: Verify .ics generation includes timezone**
1. Check n8n "Generate .ics" node
2. Verify timezone is included in event
3. Should use patient's timezone

**Solution 3: Test in different calendar apps**
- Outlook
- Apple Calendar
- Google Calendar

Sometimes one app renders it correctly and another doesn't

---

### Problem: Timezone abbreviation confusion

**Symptom:**
Email says "2:30 PM EST" but it's currently daylight saving time (should be EDT)

**Solution:**
Don't use abbreviations! Use full timezone names:
```
❌ AVOID: EST, CST, MST, PST
✅ USE: Eastern Time, Central Time, Mountain Time, Pacific Time
```

Or be specific:
```
✅ 2:30 PM Eastern Daylight Time
✅ 2:30 PM America/New_York
```

---

## Double-Booking Prevention

### Problem: Double-booking not prevented

**Symptom:**
- Book appointment at 2:00 PM → succeeds ✅
- Book another at 2:00 PM → also succeeds ❌
- Calendar now has 2 overlapping events!

**This is CRITICAL — provider can't be in two places at once!**

**Solutions:**

**Solution 1: Verify duplicate check is enabled**
```bash
ENABLE_DUPLICATE_CHECK=true
```

**Solution 2: Check availability node ran**
1. Open n8n execution log
2. Find "Check Calendar Availability" node
3. Verify it executed BEFORE "Create Calendar Event"
4. Should show available slots or conflicts

**Solution 3: Verify calendar is being checked**
1. Manually create an appointment in Google Calendar at 2:00 PM
2. Try booking via workflow at 2:00 PM
3. Should be rejected with "No availability"
4. If it succeeds, availability check is broken

**Solution 4: Check provider/calendar ID**
If you have multiple providers/calendars:
- Verify you're checking the SAME calendar you're booking into
- Provider A's calendar won't prevent double-booking Provider B

**Solution 5: Review availability logic**
1. Check workflow's availability checking node
2. Verify it:
   - Fetches existing events
   - Compares requested time with existing events
   - Detects overlaps
   - Rejects if conflict found

---

### Problem: Valid time rejected as "not available"

**Symptom:**
Calendar is empty, but booking is rejected with "No availability"

**Solutions:**

**Solution 1: Check business hours**
```bash
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=17:00
```
Requesting 7:00 AM or 8:00 PM will be rejected

**Solution 2: Check minimum notice period**
```bash
MIN_BOOKING_NOTICE_HOURS=24
```
If set to 24, you can't book for today — must be at least tomorrow

**Solution 3: Check buffer time**
```bash
APPOINTMENT_BUFFER_MINUTES=15
```
If last appointment ends at 2:00 PM, next available is 2:15 PM (with 15-min buffer)

**Solution 4: Verify availability check isn't too strict**
Some configs require 30-min gaps between appointments — check your settings

---

## Performance Issues

### Problem: Booking takes > 15 seconds

**Symptom:**
HTTP response is slow, execution time > 15000ms

**Target:** < 8 seconds

**Solutions:**

**Solution 1: Check individual node times**
1. Open n8n execution log
2. Look at execution time for each node
3. Find the slowest one
4. Common slow nodes:
   - Calendar availability check: 1-3 seconds (normal)
   - Create calendar event: 1-2 seconds (normal)
   - Send email: 500ms-2 seconds (normal)
   - Send SMS: 300ms-1 second (normal)
   - If any node > 5 seconds, that's the problem

**Solution 2: Check calendar API performance**
- Google Calendar API can be slow during peak times
- Try booking at different time of day
- Check Google Workspace status: google.com/appsstatus

**Solution 3: Reduce retries**
```bash
CALENDAR_RETRY_COUNT=1  # Instead of 3
EMAIL_RETRY_COUNT=1
```
Fewer retries = faster failures

**Solution 4: Check network speed**
```bash
# Test speed
ping google.com
curl -w "@curl-format.txt" -o /dev/null -s https://www.google.com
```
If slow, network is the bottleneck

---

### Problem: Booking times out after 2 minutes

**Symptom:**
```
Execution timed out after 120000ms
```

**Solution:**
```bash
WORKFLOW_TIMEOUT_MS=300000  # 5 minutes
```

But this is a band-aid — investigate why it's so slow!

---

## Google Sheets Logging Problems

### Problem: No row appears in Google Sheets

**Symptom:**
- Booking succeeds ✅
- Calendar event created ✅
- Email/SMS sent ✅
- But no row in Google Sheets ❌

**Solutions:**

**Solution 1: Check Google Sheets credential**
1. n8n → Credentials
2. Find Google Sheets credential
3. Click "Test"
4. If fails, reconnect

**Solution 2: Verify sheet ID and tab**
```bash
GOOGLE_SHEET_ID=1abc...xyz
GOOGLE_SHEET_TAB=Appointments
```
1. Open sheet in browser
2. Verify tab name matches (case-sensitive!)

**Solution 3: Check sheet permissions**
1. Share sheet with Google account used in n8n
2. Grant Editor access

**Solution 4: Check n8n execution log**
1. Find "Log to Google Sheets" node
2. Read error message
3. Common errors:
   - `401 Unauthorized` → Reconnect credential
   - `404 Not Found` → Wrong sheet ID
   - `403 Forbidden` → No write permission

---

### Problem: Wrong data in Google Sheets

**Symptom:**
Row exists but data doesn't match booking

**Check:**

**1. Phone normalization (expected!)**
- You sent: `(555) 123-4567`
- Sheets shows: `+15551234567`
- This is CORRECT!

**2. Timezone stored**
Verify timezone is stored as IANA format:
- ✅ `America/New_York`
- ❌ `EST` or `-05:00`

**3. Booking ID matches**
Google Sheets Booking ID should match HTTP response

---

## Data Quality Issues

### Problem: Booking ID not generated

**Symptom:**
HTTP response missing `booking_id` or shows `booking_id: null`

**Solution:**
1. Check "Generate Booking ID" node
2. Verify it executes
3. Format should be: `BOOK-[timestamp]`
4. Example: `BOOK-1730419200000`

---

### Problem: Confirmations show wrong patient name

**Symptom:**
Email addressed to "John Smith" but patient is "Jane Doe"

**Solutions:**

**Solution 1: Check test data**
Make sure you're using correct mock data

**Solution 2: Check execution log**
Trace `name` field through workflow to find where it changes

**Solution 3: Verify no caching**
Clear browser cache or use incognito mode when testing

---

## Environment Variable Issues

### Problem: "undefined" appears in calendar events or emails

**Symptom:**
Calendar event says: "Appointment with undefined at undefined Clinic"

**Cause:**
Environment variable is referenced but not set

**Solution:**
```bash
# Find which variables are missing
CLINIC_NAME=Your Clinic Name
CLINIC_ADDRESS=123 Main St
CLINIC_PHONE=+1-555-123-4567
```

Check environment and set all required variables

---

### Problem: Changes to environment variables don't take effect

**Symptom:**
Changed `CLINIC_TIMEZONE=America/Los_Angeles` but bookings still use `America/New_York`

**Cause:**
n8n caches environment variables

**Solution:**
1. After changing .env file, RESTART n8n:
   ```bash
   # Docker
   docker-compose restart

   # PM2
   pm2 restart n8n

   # Direct
   Stop and start n8n process
   ```

2. Verify change took effect:
   - In workflow, check `{{$env.CLINIC_TIMEZONE}}`

---

## n8n Workflow Problems

### Problem: Workflow won't activate

**Symptom:**
Toggle switch doesn't turn on, or immediately turns off

**Solutions:**

**Solution 1: Check for webhook conflicts**
Another workflow might use the same webhook path

**Solution 2: Verify all credentials**
1. Open workflow
2. Look for nodes with red warnings
3. Connect each credential

**Solution 3: Check for errors**
Look at bottom of n8n screen for error messages

---

### Problem: Can't see execution data

**Symptom:**
Open execution, but nodes show "No data"

**Solution:**
```bash
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
```
Restart n8n after changing

---

## .ics Attachment Issues

### Problem: .ics file won't open

**Symptom:**
Double-click .ics file, but nothing happens or error appears

**Solutions:**

**Solution 1: Install calendar app**
- Windows: Outlook (comes with Office)
- Mac: Calendar (built-in)
- Linux: Evolution, Thunderbird, or import to Google Calendar

**Solution 2: Import manually**
1. Open your calendar app
2. Look for "Import" or "Import .ics file"
3. Select downloaded .ics file

**Solution 3: Verify .ics file format**
1. Open .ics file in text editor
2. Should start with: `BEGIN:VCALENDAR`
3. Should end with: `END:VCALENDAR`
4. Should include: `BEGIN:VEVENT` and `END:VEVENT`

If format is wrong, .ics generation node is broken

---

### Problem: .ics file creates event with wrong time

**See "Timezone Issues" section above**

---

## Still Stuck?

**If you've tried everything and it still doesn't work:**

**1. Document the problem**
Use `/00_Shared/BugReport_Template.md`

**2. Gather information:**
- Exact error message
- Test data used
- n8n execution ID
- Screenshots
- What you've tried

**3. Check these resources:**
- n8n documentation: docs.n8n.io
- Google Calendar API status: google.com/appsstatus
- SendGrid status: status.sendgrid.com
- Twilio status: status.twilio.com

**4. Get help:**
- Team lead or technical support
- n8n community forum: community.n8n.io
- Module build notes: `module_02_build_notes.md`

---

## Quick Reference: Common Error Codes

| Error Code | Meaning | Common Fix |
|------------|---------|------------|
| 400 Bad Request | Invalid input data | Check validation errors in response |
| 401 Unauthorized | Invalid credentials | Reconnect credential in n8n |
| 403 Forbidden | No permission | Grant Editor access to calendar/sheet |
| 404 Not Found | Calendar/resource not found | Verify IDs are correct |
| 409 Conflict | No availability / double-booking | Try different time |
| 429 Too Many Requests | Rate limit hit | Slow down, wait a minute |
| 500 Internal Server Error | Workflow error | Check n8n execution logs |
| 503 Service Unavailable | External API down | Check status pages |

---

## Quick Troubleshooting Flowchart

**Booking failed:**
1. Check HTTP response for error details
2. Check n8n execution log for which node failed
3. Read error message and follow solutions above

**Booking succeeded but calendar empty:**
1. Check n8n execution log → "Create Calendar Event" node
2. Verify credentials
3. Check calendar permissions

**Booking succeeded but no confirmations:**
1. Check HTTP response: `confirmation_sent` flags
2. Check n8n execution log for email/SMS nodes
3. Verify SendGrid/Twilio credentials
4. Check spam folder / SMS delivery logs

**Wrong timezone:**
1. Verify CLINIC_TIMEZONE environment variable
2. Check timezone conversion in execution log
3. Test with worldtimebuddy.com

**Double-booking occurred:**
1. Verify ENABLE_DUPLICATE_CHECK=true
2. Check "Check Availability" node in execution log
3. Verify correct calendar is being checked

---

**Remember:** Most issues are configuration or data problems, not bugs! Check credentials, environment variables, and test data first! 🔍
