# Module 02: Consult Booking & Scheduling - Key Points

**Module:** 02 - Consult Booking & Scheduling
**Purpose:** Quick reference for essential concepts

---

## What This Module Does

**In one sentence:** Books patient appointments, syncs with calendar, and sends confirmations.

**Why it matters:** Appointment errors waste time, frustrate patients, and lose revenue.

---

## Core Functionality

1. **Accepts booking requests** (from Module 01 or direct forms)
2. **Validates appointment data** (date, time, required fields)
3. **Checks calendar availability** (prevents double-booking)
4. **Creates calendar event** (Google Calendar or Cal.com)
5. **Sends confirmation email** (with .ics attachment)
6. **Sends confirmation SMS** (optional, via Twilio)
7. **Logs to Google Sheets** (tracking and reporting)
8. **Notifies staff** (Slack/Teams)

---

## Key Concepts

### 1. Calendar Integration
**What it is:** Real-time sync with Google Calendar or Cal.com

**Why it matters:**
- Prevents double-bookings
- Keeps staff schedule up-to-date
- Provides single source of truth

**How it works:**
- Before booking: Check calendar for conflicts
- If available: Create event
- If unavailable: Suggest alternative times

---

### 2. Double-Booking Prevention
**What it is:** System checks existing appointments before booking new ones

**Test this:**
- Book appointment at 2:00 PM
- Try booking another at 2:00 PM
- Should be rejected with alternative times

**Common causes of failures:**
- Calendar not refreshed
- Timezone mismatch
- Wrong provider ID

---

### 3. Timezone Handling
**What it is:** Converting between patient timezone and clinic timezone

**Example:**
- Patient in Los Angeles (Pacific): 2:00 PM
- Clinic in New York (Eastern): 5:00 PM
- Calendar shows: 5:00 PM (clinic time)
- Confirmation shows: 2:00 PM Pacific (patient time)

**Critical:** Both must be correct or patient shows up at wrong time!

---

### 4. Confirmation Delivery
**What it is:** Email + SMS sent immediately after booking

**Email includes:**
- Date, time, provider
- .ics calendar file (imports to phone/computer calendars)
- Cancellation/rescheduling link
- Clinic contact info

**SMS includes:**
- Brief confirmation
- Date/time
- Reply-to-cancel option

---

### 5. Service Types
**What it is:** Different appointment categories with different durations

**Common types:**
- Consultation: 30-60 minutes
- Follow-up: 15-30 minutes
- Urgent care: 15-20 minutes
- Annual checkup: 45-60 minutes

**Why it matters:** Correct duration prevents schedule gaps or overlaps

---

## Test Checklist (Quick)

**Before testing:**
- [ ] Google Calendar or Cal.com configured
- [ ] SendGrid API key set
- [ ] Twilio configured (optional)
- [ ] Clinic timezone set correctly

**During testing:**
- [ ] Use future dates only (not past dates!)
- [ ] Use mock data from MockIdentities.json
- [ ] Verify all confirmations sent
- [ ] Check calendar event created

**After testing:**
- [ ] Review all confirmations for accuracy
- [ ] Verify timezone conversions
- [ ] Test double-booking prevention
- [ ] Clean up test appointments from calendar

---

## Critical Tests

**Must pass:**
1. **Test 2.1:** Basic booking works
2. **Test 2.8:** Double-booking is prevented
3. **Test 2.10:** Email confirmations deliver
4. **Test 2.12:** Timezone handling is correct

**If any of these fail, module is NOT production-ready!**

---

## Common Mistakes

**Mistake:** Using 12-hour time format (2:00 PM)
**Fix:** Use 24-hour format (14:00)

**Mistake:** Forgetting timezone in test data
**Fix:** Always specify timezone or use clinic default

**Mistake:** Testing with past dates
**Fix:** Always use future dates (at least tomorrow)

**Mistake:** Not checking calendar after booking
**Fix:** Open Google Calendar to verify event exists

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Booking success rate | >99% |
| Double-booking prevention | 100% |
| Email delivery | >98% |
| SMS delivery | >95% (if configured) |
| Calendar sync accuracy | 100% |
| Timezone accuracy | 100% |

---

## Data Flow

```
Booking Request
    ↓
Validation
    ↓
Calendar Availability Check
    ↓
  Available? ──No──> Suggest Alternatives
    ↓ Yes
Create Calendar Event
    ↓
Send Email + SMS
    ↓
Log to Google Sheets
    ↓
Notify Staff
    ↓
Success Response
```

---

## Integration Points

**Receives from:** Module 01 (leads who want to book)

**Sends to:**
- Google Calendar / Cal.com (event creation)
- SendGrid (email confirmations)
- Twilio (SMS confirmations)
- Google Sheets (appointment log)
- Module 09 (audit logging)

**Triggers:** Module 03 (telehealth session creation, if video visit)

---

## Environment Variables (Key)

```
GOOGLE_CALENDAR_ID=your-calendar@gmail.com
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=appointments@yourdomain.com
CLINIC_TIMEZONE=America/New_York
TWILIO_ACCOUNT_SID=ACxxx (optional)
TWILIO_AUTH_TOKEN=xxx (optional)
TWILIO_FROM_NUMBER=+15551234567 (optional)
```

See EnvMatrix.md for complete list.

---

## Mastery Checklist

You've mastered Module 02 when you can:

- [ ] Book appointments without referring to documentation
- [ ] Explain timezone handling to a non-technical person
- [ ] Troubleshoot calendar sync issues
- [ ] Verify double-booking prevention works
- [ ] Interpret confirmation delivery failures
- [ ] Test different service types confidently

---

**Keep this file handy as a quick reference!** 📌
