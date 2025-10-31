# Module 02: Consult Booking & Scheduling - Observability Guide

**Module:** 02 - Consult Booking & Scheduling
**Version:** 1.1.0-enhanced
**Last Updated:** 2025-10-31
**Audience:** Complete beginners

---

## What is "Observability"?

**Simple definition:** Observability means being able to **see what's happening** inside your booking system.

**Think of it like this:**
- When you book a flight online, you can't see the airline's computer systems working, BUT...
- You get: confirmation email, seat number, booking reference, flight status
- That's observability  making the invisible visible!

**For appointment booking:**
- You can't "see" the workflow checking calendars and sending confirmations, BUT...
- Logs, emails, calendar events, and notifications show you: what appointments were created, who was notified, whether there were conflicts, how long it took
- That's observability!

---

## Why Observability Matters

**Scenario 1: Everything Works**
- Patient requests an appointment for November 15 at 2:30 PM
- System checks availability, books the slot, sends confirmations
- How do you know it worked?
- **Observability tells you:** "Appointment BOOK-123456789 confirmed, calendar updated, email sent, SMS delivered "

**Scenario 2: Something Breaks**
- Patient requests an appointment
- No response for 30 seconds
- **WITHOUT observability:** "Is it booked? Did they get an email? No idea!"
- **WITH observability:** "Node 'Google Calendar Create Event' failed: Invalid API credentials. Fix: Reconnect Google Calendar. Patient NOT notified yet."

**The difference:** Lost appointments and confused patients vs. confident, debuggable system!

---

## Why This Module Needs EXTRA Observability

Module 02 is more complex than Module 01 because it:

1. **Checks external availability** (calendar API can fail or be slow)
2. **Creates calendar events** (must verify they actually appear)
3. **Sends TWO types of confirmations** (email AND SMS)
4. **Handles timezones** (easy to mess up, hard to debug)
5. **Prevents double-booking** (critical to verify)
6. **Generates .ics attachments** (must test they work)

**Bottom line:** More moving parts = more things to observe!

---

## Where to Look: The Observability Stack

Module 02 provides observability in **6 places:**

1. **HTTP Response** (immediate feedback)
2. **Email Inbox** (patient confirmation with .ics attachment)
3. **SMS Message** (patient confirmation via text)
4. **Calendar System** (Google Calendar / Cal.com)
5. **Google Sheets** (appointment log)
6. **n8n Execution Logs** (detailed debugging)

Let's explore each one:

---

## 1. HTTP Response (Immediate Feedback)

**What it is:** The JSON response you see immediately after requesting an appointment

**Where to see it:**
- Terminal/command prompt (when using cURL)
- Browser developer console (when testing via API)
- Postman response pane

**What to look for:**

### Success Response

```json
{
  "success": true,
  "booking_id": "BOOK-123456789",
  "appointment_time": "2025-11-15T14:30:00-05:00",
  "timezone": "America/New_York",
  "confirmation_sent": {
    "email": true,
    "sms": true
  },
  "calendar_event_id": "evt_abc123xyz",
  "trace_id": "BOOK-1730419200000"
}
```

**What each field tells you:**
- `success: true`  Appointment was booked successfully
- `booking_id` ’ Unique identifier (use this in support requests!)
- `appointment_time` ’ Exact date/time with timezone offset
- `timezone` ’ Patient's timezone (verify this matches request)
- `confirmation_sent.email` ’ Email confirmation sent (true/false)
- `confirmation_sent.sms` ’ SMS confirmation sent (true/false)
- `calendar_event_id` ’ Calendar system's event ID (for tracking)
- `trace_id` ’ Trace identifier for debugging

**What to verify:**
- [ ] `appointment_time` matches what you requested
- [ ] Timezone offset is correct (e.g., `-05:00` for Eastern Time in winter)
- [ ] Both email and SMS show `true` (unless SMS is optional)
- [ ] `calendar_event_id` is present (proves calendar was updated)

---

### Smart Recommendation Response

```json
{
  "success": true,
  "booking_id": "BOOK-123456790",
  "appointment_time": "2025-11-16T14:00:00-08:00",
  "timezone": "America/Los_Angeles",
  "selection_method": "smart_recommendation",
  "recommendation_score": 0.92,
  "alternatives": [
    {"time": "2025-11-16T15:00:00-08:00", "duration": 30},
    {"time": "2025-11-17T10:00:00-08:00", "duration": 30}
  ],
  "confirmation_sent": {
    "email": true,
    "sms": true
  }
}
```

**Additional fields:**
- `selection_method: "smart_recommendation"` ’ System chose the time (patient didn't specify)
- `recommendation_score: 0.92` ’ Confidence score (0.0 to 1.0, higher is better)
- `alternatives` ’ Other available times (patient can reschedule)

**What to verify:**
- [ ] Recommended time is during business hours (usually 8 AM - 5 PM)
- [ ] Recommendation score is reasonable (> 0.7 is good)
- [ ] Alternatives array has 2-3 options

---

### Error Response (Validation Failed)

```json
{
  "success": false,
  "error": "Validation failed",
  "error_code": "VALIDATION_FAILED",
  "details": [
    "email: required and must be valid format",
    "phone: minimum 7 digits"
  ],
  "timestamp": "2025-10-31T14:30:00Z",
  "trace_id": "BOOK-1730419200000",
  "support_email": "support@yourclinic.com"
}
```

**What each field tells you:**
- `success: false` L Booking failed
- `error_code` ’ Machine-readable error type
- `details` ’ **Specific** validation errors (most important!)
- `timestamp` ’ When the error occurred
- `trace_id` ’ Use this in bug reports
- `support_email` ’ Who to contact for help

**Common validation errors:**
- "email: required and must be valid format"
- "phone: minimum 7 digits"
- "name: required, minimum 2 characters"
- "preferred_date: cannot be in the past"
- "preferred_date: must be valid ISO 8601 format (YYYY-MM-DD)"
- "preferred_time: must be valid HH:MM format"

---

### Error Response (No Availability)

```json
{
  "success": false,
  "error": "No available appointments",
  "error_code": "NO_AVAILABILITY",
  "details": [
    "No available slots found for the requested date and time",
    "Calendar fully booked for next 7 days"
  ],
  "alternatives": [
    {"date": "2025-11-22", "time": "10:00"},
    {"date": "2025-11-22", "time": "14:00"}
  ],
  "trace_id": "BOOK-1730419200000"
}
```

**What this means:**
- Calendar is fully booked for requested time
- Check `alternatives` array for available times
- This is NOT a bug  it's normal when calendars fill up

---

### Performance Interpretation

**Response time expectations:**
- **Fast:** < 3 seconds (calendar check was quick)
- **Normal:** 3-8 seconds (acceptable, includes calendar API call)
- **Slow:** 8-15 seconds (calendar API is slow, investigate)
- **Very slow:** > 15 seconds (problem! Check calendar API status)

**Note:** Booking takes longer than lead capture (Module 01) because:
1. Must call external calendar API to check availability
2. Must create calendar event
3. Must generate .ics file
4. Must send email AND SMS

---

## 2. Email Confirmation (Patient Receives)

**What it is:** Confirmation email sent to the patient with appointment details and .ics calendar attachment

**Where to see it:** The email inbox of the address you used in the test

**What you should see:**

### Email Structure

**Subject Line:**
```
Appointment Confirmed: November 15, 2025 at 2:30 PM
```

**Email Body (simplified):**
```
Hi Sarah Johnson,

Your appointment has been confirmed!

Appointment Details:
" Date: Friday, November 15, 2025
" Time: 2:30 PM (Eastern Time)
" Service: Initial Consultation
" Booking ID: BOOK-123456789

=Î Calendar Attachment:
We've attached an .ics file to this email.
Click it to add this appointment to your calendar (Outlook, Apple Calendar, Google Calendar).

Need to cancel or reschedule?
Call us at (555) 123-4567 or reply to this email.

Thank you,
[Your Clinic Name]
```

**Attachment:**
```
appointment_20251115_1430.ics (1 KB)
```

---

### What to Verify

**Email Delivery:**
- [ ] Email received within 30 seconds of booking
- [ ] Not in spam folder (check if missing)
- [ ] From address is your clinic email
- [ ] Subject line includes correct date and time

**Email Content:**
- [ ] Patient name is correct
- [ ] Appointment date matches booking
- [ ] Appointment time matches booking
- [ ] Timezone is PATIENT's timezone (not clinic's!)
- [ ] Service type is correct
- [ ] Booking ID matches HTTP response

**Calendar Attachment (.ics file):**
- [ ] Attachment is present
- [ ] Attachment filename is descriptive (e.g., `appointment_20251115_1430.ics`)
- [ ] File size is reasonable (1-5 KB)
- [ ] Double-clicking the file opens your calendar app
- [ ] Event details in calendar match email
- [ ] Event timezone is correct

---

### Testing the .ics Attachment

**Step-by-step test:**

1. **Download the .ics file** from the email
2. **Double-click the file** (should open Outlook, Apple Calendar, or Google Calendar)
3. **Verify the event details:**
   - Event title includes patient name + service type
   - Event date is correct
   - Event time is correct **in your local timezone**
   - Event duration is correct (usually 30 minutes)
   - Event location shows clinic address (if configured)
4. **Add to calendar** (click "Add" or "Save")
5. **Verify it appears** in your calendar

**Common issues:**
- L .ics file doesn't open ’ File may be corrupted, check generation logic
- L Wrong time in calendar ’ Timezone issue in .ics file
- L Event doesn't save ’ Calendar app may not support .ics format

---

### Timezone Verification (CRITICAL!)

**Scenario:** Patient in Denver (Mountain Time) books appointment at 10:00 AM their time, clinic in New York (Eastern Time)

**What patient should see in email:**
```
Time: 10:00 AM Mountain Time
```

**What .ics file should do:**
- When opened in Denver, shows 10:00 AM
- When opened in New York, shows 12:00 PM (2 hours ahead)
- When opened in Los Angeles, shows 9:00 AM (1 hour behind)

**Test this:**
- Book appointment with different timezone than yours
- Download .ics file
- Verify time shown in YOUR calendar is CONVERTED correctly

---

## 3. SMS Confirmation (Patient Receives)

**What it is:** Text message sent to patient's phone with appointment details

**Where to see it:** The phone number you used in the test (must be YOUR real phone for testing!)

**What you should see:**

### SMS Message

```
Your appointment is confirmed for Fri, Nov 15 at 2:30 PM ET.
Booking ID: BOOK-123456789.
Reply CANCEL to cancel or call (555) 123-4567.
```

---

### What to Verify

**SMS Delivery:**
- [ ] SMS received within 60 seconds of booking
- [ ] From number matches your configured Twilio number
- [ ] Sender name shows clinic name (if configured)

**SMS Content:**
- [ ] Appointment date is correct (abbreviated format is OK)
- [ ] Appointment time is correct
- [ ] Timezone abbreviation is present (ET, CT, MT, PT)
- [ ] Booking ID matches HTTP response
- [ ] Contact information included (phone or reply instructions)

**SMS Length:**
- SMS should be under 160 characters (1 message)
- If > 160 characters, it sends as multiple messages (costs more)
- Verify message isn't unnecessarily long

---

### SMS Testing Tips

**Use YOUR real phone number for testing:**
- Replace the test phone number with yours
- Actually receive the SMS
- Verify it's readable and clear

**International numbers:**
- SMS may not be sent if Twilio doesn't support the country
- Check `confirmation_sent.sms: false` in HTTP response
- This is expected behavior, not a bug

**SMS opt-out handling:**
- Some modules support "Reply CANCEL"
- Verify this text appears in SMS (if configured)

---

### Common SMS Issues

**No SMS received:**
- Check Twilio account balance (out of credits?)
- Verify TWILIO_ACCOUNT_SID is correct
- Verify TWILIO_AUTH_TOKEN is correct
- Verify TWILIO_PHONE_FROM is a valid Twilio number
- Check if phone number is landline (can't receive SMS)

**SMS received but garbled:**
- Special characters may not render
- Emojis may break on some carriers
- Keep SMS text simple (ASCII only)

**SMS delayed > 5 minutes:**
- Twilio occasionally has delivery delays
- Check Twilio status page
- Not a workflow issue

---

## 4. Calendar System (Google Calendar / Cal.com)

**What it is:** The actual calendar event created in your scheduling system

**Where to see it:**
- **Google Calendar:** Open https://calendar.google.com
- **Cal.com:** Open your Cal.com dashboard

**What you should see:**

### Google Calendar Event

**Event appearance:**
```
=Å Sarah Johnson - Initial Consultation
   Friday, November 15, 2025
   2:30 PM  3:00 PM (Eastern Time)

   Details:
   Booking ID: BOOK-123456789
   Patient: Sarah Johnson
   Email: sarah.johnson@example.com
   Phone: +1-555-0101
   Service: Initial Consultation
   Notes: First-time patient, referred by Dr. Smith
```

---

### What to Verify

**Event Basics:**
- [ ] Event appears within 10 seconds of booking
- [ ] Event title includes patient name + service type
- [ ] Event date matches booking
- [ ] Event time matches booking **in clinic's timezone**
- [ ] Event duration is correct (usually 30 minutes)

**Event Details:**
- [ ] Patient email added as attendee (optional)
- [ ] Patient phone in description
- [ ] Booking ID in description
- [ ] Service type in description
- [ ] Any special notes from booking request

**Timezone Verification:**
- [ ] Event shows correct time in YOUR timezone
- [ ] If patient in different timezone, event auto-converts
- [ ] Verify timezone in event properties

**Conflict Detection:**
- [ ] No overlapping events at same time
- [ ] Calendar shows available slots correctly
- [ ] Double-booking was prevented

---

### Calendar Verification Steps

**After each booking test:**

1. **Open your calendar** (Google Calendar or Cal.com)
2. **Navigate to the appointment date**
3. **Find the event** (should appear within 10 seconds)
4. **Click on the event** to see details
5. **Verify all fields** match booking request
6. **Check for conflicts** (no overlapping events)

**If event doesn't appear:**
- Check n8n execution logs for calendar API errors
- Verify SCHEDULING_API_BASE_URL is correct
- Verify calendar credentials are connected
- Check if calendar is set to read-only (should be editable)

---

### Cal.com Specific Notes

**Event structure:**
Cal.com events may look slightly different but should include:
- Event type name
- Attendee email
- Booking reference
- Custom fields (if configured)

**Availability check:**
Cal.com has built-in availability checking, so conflicts should be rare.

---

## 5. Google Sheets (Appointment Log)

**What it is:** A spreadsheet where every appointment is logged as a row

**Where to find it:**
1. Go to the URL in your `GOOGLE_SHEET_ID` environment variable
2. Click on the "Appointments" tab (or tab specified in config)

**What you should see:**

### Column Headers

| Booking ID | Name | Email | Phone | Service | Date | Time | Timezone | Status | Created At | Calendar Event ID | Confirmation Email | Confirmation SMS |
|------------|------|-------|-------|---------|------|------|----------|--------|------------|-------------------|-------------------|-----------------|

---

### Example Row

```
BOOK-123456789 | Sarah Johnson | sarah.johnson@example.com | +15550101 | Initial Consultation | 2025-11-15 | 14:30 | America/New_York | confirmed | 2025-10-31 14:23:45 | evt_abc123xyz | sent | sent
```

---

### What to Look For

** Good signs:**
- New row appears within 15 seconds of booking
- All fields populated correctly
- Phone number normalized to E.164 format (+1...)
- Timezone stored as IANA format (America/New_York)
- Timestamp is accurate
- Booking ID is unique
- Calendar Event ID matches calendar system
- Confirmation statuses are "sent"

**L Warning signs:**
- Row doesn't appear (integration failure  check n8n logs)
- Missing fields (workflow logic issue)
- Phone not normalized (normalization node failed)
- Duplicate Booking IDs (serious bug  report immediately!)
- Wrong timestamp (timezone misconfiguration)
- Calendar Event ID is empty (calendar creation failed but booking succeeded)
- Confirmation statuses are "failed" or empty

---

### Using Google Sheets for Analysis

**Quick checks you can do:**

**1. Count today's appointments:**
Filter "Created At" column for today's date

**2. Check appointment distribution:**
Sort by "Date" to see booking patterns

**3. Find specific bookings:**
Use Ctrl+F (or Cmd+F) to search for Booking ID, patient name, or email

**4. Verify confirmations:**
Filter "Confirmation Email" and "Confirmation SMS" for "failed" to find issues

**5. Check timezone distribution:**
Filter "Timezone" column to see where patients are located

**6. Audit trail:**
All bookings are logged permanently for compliance and auditing

---

## 6. n8n Execution Logs (Detailed Debugging)

**What it is:** Complete record of every workflow execution, node by node

**Where to find it:**
1. Open n8n in your browser
2. Click "Executions" in the left sidebar
3. You'll see a list of recent executions

**What you should see:**

### Execution List

```
[Green ] Aigent_Module_02... | 2025-10-31 2:23 PM | Success | 4.5s
[Green ] Aigent_Module_02... | 2025-10-31 2:20 PM | Success | 3.2s
[Red X]   Aigent_Module_02... | 2025-10-31 2:15 PM | Error   | 1.1s
```

**Color coding:**
- **Green ** = Success (all nodes completed)
- **Red X** = Error (at least one node failed)
- **Yellow  ** = Warning (some nodes failed but workflow continued)

---

### Viewing Execution Details

**Click on any execution to see:**

1. **Execution Overview:**
   - Start time
   - End time
   - Total duration
   - Status (success/error)
   - Booking ID (if successful)

2. **Node-by-Node Flow:**
   - Each node shows as a card
   - Green = succeeded
   - Red = failed
   - Gray = not executed (conditional path not taken)

3. **Data Flowing Through Nodes:**
   - Click on any node to see:
     - **Input data** (what went into this node)
     - **Output data** (what came out)
     - **Execution time** (how long this node took)
     - **Error message** (if it failed)

---

### Key Nodes to Check

**1. Webhook Trigger:**
- **What to check:** Verify input data matches what you sent
- **Common issues:** Missing fields, wrong data types

**2. Validation Node:**
- **What to check:** See which validations passed/failed
- **Common issues:** Email format, phone length, date format

**3. Check Calendar Availability:**
- **What to check:** See available slots returned by calendar API
- **Common issues:** API timeout, no availability, wrong event type ID
- **Execution time:** Usually 1-3 seconds (depends on calendar API speed)

**4. Create Calendar Event:**
- **What to check:** Verify event_id was returned
- **Common issues:** Invalid credentials, calendar read-only, duplicate event
- **Execution time:** Usually 1-2 seconds

**5. Generate .ics File:**
- **What to check:** Verify .ics content is valid
- **Common issues:** Timezone formatting, special characters
- **Execution time:** Usually < 100ms

**6. Send Email Confirmation:**
- **What to check:** Verify SendGrid API response is successful
- **Common issues:** Invalid API key, sender not verified, attachment too large
- **Execution time:** Usually 500ms - 2 seconds

**7. Send SMS Confirmation:**
- **What to check:** Verify Twilio API response shows "sent" or "queued"
- **Common issues:** Invalid credentials, insufficient balance, unsupported country
- **Execution time:** Usually 300ms - 1 second

**8. Log to Google Sheets:**
- **What to check:** Verify row was appended successfully
- **Common issues:** Sheet not found, permission denied, quota exceeded
- **Execution time:** Usually 500ms - 1.5 seconds

---

### Execution Time Analysis

**Look at the execution time for each node to find bottlenecks:**

**Example execution breakdown:**
```
Webhook Trigger                  42ms   (fast )
Add Metadata                    15ms   (fast )
Validation                      28ms   (fast )
Normalize Phone                 25ms   (fast )
Check Calendar Availability    2100ms  (normal )
Create Calendar Event          1850ms  (normal )
Generate .ics File               75ms   (fast )
Send Email Confirmation         920ms  (normal )
Send SMS Confirmation           650ms  (normal )
Log to Google Sheets            480ms  (normal )
Total                          6185ms  (acceptable )
```

**Analysis:**
- Calendar operations (check + create) take ~4 seconds  this is normal
- Email and SMS add ~1.5 seconds total
- Total time ~6 seconds = acceptable for booking workflow

**If total time > 10 seconds:**
- Check calendar API status
- Check SendGrid/Twilio API status
- Verify internet connection
- Consider increasing timeout values

---

### How to Debug Using Logs

**Scenario: Booking failed**

**Step 1:** Open the failed execution (red X)

**Step 2:** Identify which node failed (highlighted in red)

**Step 3:** Click on the failed node

**Step 4:** Read the error message

**Common error patterns:**

**Error: "Invalid credentials"**
- **Node:** Google Calendar, Cal.com
- **Cause:** API credential expired or disconnected
- **Fix:** Reconnect credential in n8n

**Error: "404 Not Found"**
- **Node:** Calendar API
- **Cause:** Wrong event type ID or calendar ID
- **Fix:** Verify SCHEDULING_EVENT_TYPE_ID is correct

**Error: "403 Forbidden"**
- **Node:** Google Calendar
- **Cause:** Calendar is read-only or insufficient permissions
- **Fix:** Grant edit access to calendar

**Error: "Validation failed: email"**
- **Node:** Validation
- **Cause:** Invalid email format in request
- **Fix:** Check test data, ensure email is valid

**Error: "Timeout after 30000ms"**
- **Node:** Calendar API
- **Cause:** Calendar API is down or extremely slow
- **Fix:** Retry later, check calendar system status

**Error: "SMTP Error"**
- **Node:** Send Email
- **Cause:** SendGrid issue (invalid key, sender not verified)
- **Fix:** Verify SendGrid credentials and sender email

**Error: "Twilio Error 21211"**
- **Node:** Send SMS
- **Cause:** Invalid Twilio phone number
- **Fix:** Verify TWILIO_PHONE_FROM is correct

**Error: "No availability found"**
- **Node:** Check Availability
- **Cause:** Calendar is fully booked
- **Fix:** NOT a bug  expected behavior. Try different date.

---

## Observability Checklist

Use this checklist after each test to verify observability is working:

### After Submitting a Booking Request

**HTTP Response:**
- [ ] Received response within 10 seconds
- [ ] Response includes `success` field (true/false)
- [ ] If success, includes `booking_id`
- [ ] If success, includes `appointment_time` with timezone
- [ ] If success, `confirmation_sent.email` is true
- [ ] If success, `confirmation_sent.sms` is true
- [ ] If success, includes `calendar_event_id`
- [ ] If error, includes specific `details` array

**Email Confirmation:**
- [ ] Email received within 30 seconds
- [ ] Subject line includes date and time
- [ ] Email body shows all appointment details
- [ ] Timezone in email matches PATIENT timezone
- [ ] .ics file is attached
- [ ] .ics file opens in calendar app correctly
- [ ] Event in .ics shows correct time in local timezone

**SMS Confirmation:**
- [ ] SMS received within 60 seconds
- [ ] SMS includes date, time, timezone abbreviation
- [ ] SMS includes booking ID
- [ ] SMS includes contact/cancel instructions
- [ ] SMS is readable (no garbled text)

**Calendar System:**
- [ ] Event appears in calendar within 10 seconds
- [ ] Event title includes patient name + service
- [ ] Event date and time match booking
- [ ] Event time is in CLINIC timezone
- [ ] Event duration is correct (30 min default)
- [ ] Event details include booking ID and notes
- [ ] No overlapping events (conflict check worked)

**Google Sheets:**
- [ ] New row appears within 15 seconds
- [ ] All fields populated correctly
- [ ] Phone normalized to E.164 format
- [ ] Timezone stored correctly
- [ ] Booking ID matches HTTP response
- [ ] Calendar Event ID matches calendar system
- [ ] Confirmation statuses show "sent"

**n8n Execution Log:**
- [ ] Execution appears in list
- [ ] Status is "Success" (green)
- [ ] All nodes show green checkmarks
- [ ] Execution time < 10 seconds
- [ ] No error messages
- [ ] Calendar API nodes show valid responses

**If ANY checkbox fails, investigate immediately!**

---

## Common Observability Questions

### Q: How long should I wait to see results?

**A:**
- HTTP response: Immediate (< 10 seconds)
- Email confirmation: 15-30 seconds
- SMS confirmation: 30-60 seconds
- Calendar event: 5-10 seconds
- Google Sheets: 10-15 seconds
- n8n logs: Immediate

If longer than these times, something is slow or broken.

---

### Q: What if calendar event created but no email sent?

**A:** This can happen if SendGrid fails but calendar succeeds. Check:
1. HTTP response shows `confirmation_sent.email: false`
2. n8n execution log for email node error
3. Verify SENDGRID_API_KEY is correct
4. Check SendGrid status (status.sendgrid.com)
5. Verify sender email is verified in SendGrid

**Important:** Booking still succeeded! Just notification failed. You can manually email the patient.

---

### Q: What if email sent but no calendar event?

**A:** This is BAD! It means:
1. Patient was told appointment is confirmed
2. But calendar doesn't have it (provider won't show up!)
3. Check n8n logs for calendar API errors
4. Manually add event to calendar
5. Report as critical bug

This is why checking ALL observability sources matters!

---

### Q: How do I verify timezone conversion is correct?

**A:**
1. Book appointment with timezone different from yours
2. Check HTTP response: time should have correct offset (e.g., `-07:00` for Mountain)
3. Check email: time should show in PATIENT timezone
4. Check calendar: time should show in CLINIC timezone (auto-converted)
5. Open .ics file: time should show correctly in YOUR timezone

**Example:**
- Patient in Denver requests 10:00 AM Mountain Time
- Email shows: 10:00 AM MT
- Calendar (if clinic in NYC) shows: 12:00 PM ET
- .ics opened in LA shows: 9:00 AM PT

All three should be THE SAME MOMENT, just displayed differently!

---

### Q: What if SMS not sent but email worked?

**A:** This is OK if:
- Phone number is international and Twilio doesn't support it
- Patient opted out of SMS
- Twilio account out of credits

Check HTTP response:
```json
"confirmation_sent": {
  "email": true,
  "sms": false
}
```

If `sms: false`, check n8n logs for Twilio error. SMS is "nice to have" but email is critical.

---

### Q: Can I see historical bookings?

**A:** Yes!
- **n8n logs:** Last 30 days (configurable)
- **Google Sheets:** Forever (unless you delete rows)
- **Calendar:** Forever (unless you delete events)

Google Sheets is your permanent audit log.

---

## Pro Tips

**1. Keep Multiple Windows Open**
During testing, have these open simultaneously:
- Terminal (for cURL commands)
- Email inbox (to see confirmations arrive)
- Calendar (to see events appear)
- Google Sheets (to see rows added)
- n8n Executions (to debug)

**2. Use a Test Calendar**
Don't test on your real provider calendar! Create a test calendar:
- Google Calendar: Create new calendar called "Test Appointments"
- Cal.com: Create test event type

**3. Use Your Real Phone**
For SMS testing, replace mock phone with your real number. Actually receive the SMS!

**4. Test .ics Files**
Always download and open .ics attachments. Verify they:
- Open in your calendar app
- Show correct time in YOUR timezone
- Have correct event details

**5. Create a Test Log**
Keep notes:
```
2:23 PM - Booked Sarah Johnson for 11/15 2:30 PM ET
          Booking ID: BOOK-123456789
          Email:  Received, .ics works
          SMS:  Received
          Calendar:  Event created (evt_abc123xyz)
          Sheets:  Row added

2:27 PM - Tested invalid email format
          Expected: 400 error
          Result:  Got 400 with correct error message
```

**6. Test Timezone Conversions**
Intentionally use timezones different from yours:
- If you're in Eastern, test with Pacific
- If you're in Pacific, test with Eastern
- Verify conversions are correct

**7. Monitor Execution Times**
Track how long bookings take:
- First booking of the day (may be slower, cold start)
- 10th booking of the day (should be consistent)
- If times increase over time, investigate

---

## Observability Best Practices

**DO:**
-  Check all 6 observability sources after each test
-  Verify timezone conversions are accurate
-  Test .ics attachments actually work
-  Monitor execution times to catch performance issues
-  Review n8n logs when errors occur
-  Keep Google Sheets data for audit trail

**DON'T:**
- L Rely on only HTTP response (verify calendar was actually updated!)
- L Ignore slow execution times (they indicate problems)
- L Delete Google Sheets data (you'll need it for troubleshooting)
- L Test on production calendar (use test calendar!)
- L Forget to verify email AND SMS were sent
- L Assume timezone conversions are correct without testing

---

## Advanced Observability (Optional)

### Twilio SMS Logs

**Where to find:**
https://console.twilio.com/us1/monitor/logs/sms

**What to check:**
- Message delivery status (delivered, failed, undelivered)
- Error codes (if failed)
- Delivery time
- Message segments (how many SMS parts)

**Common statuses:**
- `queued` ’ SMS queued for delivery
- `sent` ’ SMS sent to carrier
- `delivered` ’ SMS delivered to phone
- `failed` ’ SMS failed (see error code)
- `undelivered` ’ Carrier couldn't deliver

---

### SendGrid Email Logs

**Where to find:**
https://app.sendgrid.com/email_activity

**What to check:**
- Email delivery status (delivered, bounced, opened, clicked)
- Bounce reason (if bounced)
- Spam reports
- Open rate (if tracking enabled)

**Common statuses:**
- `processed` ’ Email accepted by SendGrid
- `delivered` ’ Email delivered to inbox
- `bounced` ’ Email bounced (invalid address, full inbox)
- `deferred` ’ Temporary delay (retry in progress)

---

### Google Calendar Activity

**Where to find:**
Google Calendar Settings ’ Settings ’ Event settings

**What to check:**
- Recent calendar changes
- Who modified events
- Event version history

Useful for debugging "who deleted this appointment?"

---

## Summary

**Observability for Module 02 means checking:**

1. **HTTP Response** ’ Immediate feedback (success/error, booking ID)
2. **Email Confirmation** ’ Patient received email with .ics attachment
3. **SMS Confirmation** ’ Patient received text message
4. **Calendar System** ’ Event actually created in Google Calendar/Cal.com
5. **Google Sheets** ’ Appointment logged for audit trail
6. **n8n Logs** ’ Detailed debugging (node-by-node view)

**After every test, verify:**
-  All 6 sources show consistent data
-  Timezone conversions are accurate
-  .ics attachment works correctly
-  Email AND SMS were sent (unless SMS is optional)
-  Calendar event exists (no phantom bookings!)
-  Execution time is acceptable (< 10 seconds)
-  No errors in logs

**If something's wrong:**
- Start with HTTP response (tells you success/error)
- Check n8n logs (tells you which node failed and why)
- Verify calendar (did event actually get created?)
- Check email/SMS delivery (did patient get notified?)
- Review Google Sheets (is appointment logged?)

**Remember:** Module 02 has MORE observability sources than Module 01 because there are MORE things that can go wrong (calendar APIs, timezones, .ics generation, dual notifications).

**Check everything, every time!**

---

**Next Steps:**
- Practice using all 6 observability sources during testing
- Test timezone conversions with different timezones
- Verify .ics attachments work in different calendar apps
- Read [Troubleshooting.md](Troubleshooting.md) for common issues

**Happy Observing!** =@
