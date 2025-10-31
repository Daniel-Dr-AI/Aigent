# Module 02: Consult Booking & Scheduling - Key Points

**Module:** 02 - Consult Booking & Scheduling
**Version:** 1.1.0-enhanced
**Purpose:** Quick reference for essential concepts and reminders

---

## 🎯 What This Module Does

**In one sentence:**
Books patient appointments by checking calendar availability, preventing double-bookings, creating calendar events, and sending confirmation emails and SMS with calendar attachments (.ics files).

**Why it matters:**
This is the bridge between patient interest and actual appointments. If it fails, patients can't book, leading to lost revenue, scheduling chaos, and poor patient experience.

---

## ✅ Core Functionality

**1. Accepts booking requests**
- Receives: patient info, service type, preferred date/time, timezone
- Validates: all required fields, date format, time format, no past dates
- Rejects: incomplete, malformed, or past appointment requests

**2. Checks calendar availability**
- Queries Google Calendar or Cal.com for existing appointments
- Detects conflicts and double-bookings
- Suggests alternative times if requested time is unavailable
- Implements smart slot recommendation (when patient doesn't specify time)

**3. Handles timezones**
- Converts patient timezone to clinic timezone
- Stores both times for accurate scheduling
- Ensures patient and provider see correct local times
- Accounts for daylight saving time automatically

**4. Creates calendar events**
- Creates event in Google Calendar or Cal.com
- Includes patient details, service type, booking ID
- Sets correct duration based on service type
- Returns calendar event ID for tracking

**5. Sends confirmations**
- Email: HTML formatted with appointment details + .ics attachment
- SMS: Text message with date, time, booking ID, cancel instructions
- Both show time in patient's local timezone
- Failures don't block booking (graceful degradation)

**6. Logs and tracks**
- Saves all bookings to Google Sheets
- Records confirmation delivery status
- Tracks performance metrics
- Generates booking ID for reference

---

## 🔑 Key Concepts

### 1. **Calendar Integration**

**What it is:** Real-time synchronization with Google Calendar or Cal.com

**Real-world analogy:** Like checking a restaurant's reservation book before seating a customer — you can't double-book a table!

**Why it matters:**
- Prevents double-bookings (provider can't be in two places)
- Keeps staff schedule accurate
- Provides single source of truth
- Enables online booking without manual intervention

**How to test:**
1. Book appointment at 2:00 PM
2. Check calendar — event should appear within 10 seconds
3. Try booking another at 2:00 PM — should be rejected

---

### 2. **Timezone Conversion**

**What it is:** Converting appointment times between patient timezone and clinic timezone

**Example:**
- Patient in Los Angeles (Pacific Time) books 10:00 AM
- Clinic in New York (Eastern Time) sees 1:00 PM (3 hours ahead)
- Both are the SAME moment, just displayed differently

**Why it matters:** Wrong timezone = patient shows up at wrong time = wasted appointment!

**How it works:**
- Patient specifies timezone: `America/Los_Angeles`
- Patient specifies time: `10:00`
- System converts to clinic timezone: `America/New_York` → `13:00`
- Email shows patient: "10:00 AM Pacific Time"
- Calendar shows clinic: "1:00 PM Eastern Time"

**Critical:** Always use IANA timezone names (America/New_York), NOT abbreviations (EST)!

---

### 3. **Double-Booking Prevention**

**What it is:** System checks for existing appointments before creating new ones

**How it works:**
1. Patient requests 2:00 PM on November 15
2. System queries calendar for that date/time
3. If slot is empty → proceed with booking
4. If slot is occupied → reject and suggest alternatives

**Why it matters:**
- Provider can't be in two places at once
- Prevents scheduling conflicts
- Maintains calendar integrity
- Improves patient experience

**Test this:**
- Book appointment at 2:00 PM → succeeds
- Try booking another at 2:00 PM → rejected
- Try booking at 2:30 PM → succeeds (different time)

---

### 4. **.ics Calendar Attachment**

**What it is:** A special file format that adds events to calendar apps (Outlook, Apple Calendar, Google Calendar)

**Real-world analogy:** Like a concert ticket that automatically adds the show to your phone's calendar when you scan it

**How it works:**
- System generates .ics file with appointment details
- File is attached to confirmation email
- Patient double-clicks .ics file
- Event is imported into their calendar app

**Why it matters:**
- Reduces no-shows (appointment is in patient's calendar)
- Works across all calendar platforms
- Patient doesn't have to manually enter details

**What to test:**
- Download .ics from confirmation email
- Double-click to open
- Verify event appears in your calendar
- Check time is correct in YOUR timezone

---

### 5. **Smart Slot Recommendation**

**What it is:** When patient doesn't specify a time, system recommends optimal slot based on historical no-show patterns

**How it works:**
- System finds all available slots in next 7 days
- Analyzes historical data for no-show patterns
- Recommends times with highest attendance rates (typically mid-morning or mid-afternoon)
- Provides 2-3 alternatives

**Why it matters:**
- Reduces no-shows by suggesting better times
- Fills schedule optimally
- Improves patient experience

**Example:**
- Avoid lunch hours (12-1 PM) — high no-show rate
- Prefer 10 AM or 2 PM — low no-show rate

---

### 6. **Graceful Degradation**

**What it is:** System continues working even when non-critical parts fail

**Example:**
- Calendar creation succeeds ✅
- Email sent successfully ✅
- SMS fails (Twilio down) ❌
- **Result:** Booking still succeeds! Patient gets email confirmation.

**Why it matters:**
- Maximizes uptime
- Critical functions (booking) don't fail because of non-critical functions (SMS)
- Better patient experience

**What to test:**
- Temporarily disable SMS (wrong Twilio credentials)
- Submit booking
- Verify booking still succeeds
- Check HTTP response shows `sms: false` but `success: true`

---

### 7. **Service Types**

**What it is:** Different appointment categories with different durations and purposes

**Common service types:**
- Initial Consultation: 30-60 minutes
- Follow-up Visit: 15-30 minutes
- Annual Physical: 45-60 minutes
- Urgent Care: 15-20 minutes
- Telehealth Consultation: 30 minutes
- Specialist Referral: 60 minutes

**Why it matters:**
- Correct duration prevents schedule gaps or overlaps
- Different services may have different pricing
- Some services trigger different workflows (telehealth → Module 03)

---

## ⚡ Critical Reminders

### Testing
- ✅ **DO** use future dates (at least tomorrow)
- ✅ **DO** use 24-hour time format (14:30, not 2:30 PM)
- ✅ **DO** specify timezone or use clinic default
- ✅ **DO** verify calendar event actually created
- ✅ **DO** test .ics attachment downloads and opens
- ❌ **DON'T** use past dates (will be rejected)
- ❌ **DON'T** use timezone abbreviations (EST, PST)
- ❌ **DON'T** assume confirmations sent without checking
- ❌ **DON'T** test on production calendar (use test calendar!)

### Security
- ✅ Phone numbers may be visible in calendar (provider needs to call)
- ✅ Email addresses may be visible (provider needs to email)
- ❌ Do NOT expose calendar to public (should be provider-only)

### Data Quality
- ✅ Phone numbers should be normalized (+15551234567)
- ✅ Timezones should be IANA format (America/New_York)
- ✅ Booking IDs should be unique (BOOK-[timestamp])
- ✅ All confirmations should show time in patient's timezone

### Performance
- ✅ Target: < 8 seconds total execution time
- ✅ Calendar API: 1-3 seconds (normal)
- ✅ Email + SMS: 1-2 seconds total (normal)
- ❌ If > 10 seconds, investigate slowness

---

## 📊 Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Booking success rate | > 99% | High availability required |
| Double-booking prevention | 100% | MUST prevent conflicts |
| Email delivery rate | > 98% | Primary confirmation method |
| SMS delivery rate | > 95% | Secondary confirmation |
| Calendar sync accuracy | 100% | Events must appear correctly |
| Timezone accuracy | 100% | Wrong time = missed appointment |
| Response time (P95) | < 8 seconds | Acceptable user experience |
| .ics attachment works | > 99% | Improves patient experience |

---

## 📈 Data Flow

```
Booking Request (webhook/API)
    ↓
Validation (required fields, date/time format)
    ↓
Normalize Phone (+15551234567)
    ↓
Timezone Conversion (patient → clinic)
    ↓
Check Calendar Availability
    ↓
  Available? ──No──> Return 409 + Suggest Alternatives
    ↓ Yes
Create Calendar Event (Google/Cal.com)
    ↓
Generate .ics File (for email attachment)
    ↓
Send Email Confirmation (with .ics)
    ↓
Send SMS Confirmation (parallel)
    ↓
Log to Google Sheets (appointment record)
    ↓
Notify Staff (Slack/Teams, optional)
    ↓
Return 200 Success Response
```

---

## 🔗 Integration Points

**Receives from:**
- Module 01 (leads who complete intake and want to book)
- Direct booking forms (website, patient portal)
- Manual API calls (admin booking for patient)

**Sends to:**
- Google Calendar / Cal.com (event creation)
- SendGrid (email confirmations)
- Twilio (SMS confirmations)
- Google Sheets (appointment log)
- Module 09 (audit logging, if enabled)

**Triggers:**
- Module 03 (telehealth session creation, if video visit)
- Module 05 (follow-up sequence, post-appointment)
- Module 04 (billing, if prepayment required)

---

## 🔧 Environment Variables (Key)

**Critical (Required):**
```bash
SCHEDULING_API_BASE_URL=https://api.cal.com/v1
SCHEDULING_EVENT_TYPE_ID=123456
SCHEDULING_CREDENTIAL_ID=google_calendar_001
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
CLINIC_TIMEZONE=America/New_York
CLINIC_EMAIL=appointments@yourdomain.com
```

**Important (Highly Recommended):**
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_FROM=+15551234567
ENABLE_DUPLICATE_CHECK=true
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=17:00
```

**Optional (Nice to Have):**
```bash
CLINIC_NAME=Your Clinic Name
CLINIC_ADDRESS=123 Main St, City, State
APPOINTMENT_BUFFER_MINUTES=15
MIN_BOOKING_NOTICE_HOURS=24
```

See `/00_Shared/EnvMatrix.md` for complete list.

---

## ✅ Testing Checklist (Quick)

### Before Testing
- [ ] n8n workflow active
- [ ] Google Calendar or Cal.com configured
- [ ] SendGrid API key set and sender verified
- [ ] Twilio configured (optional but recommended)
- [ ] CLINIC_TIMEZONE set correctly
- [ ] Test calendar created (not production!)

### During Testing
- [ ] Use future dates only (tomorrow or later)
- [ ] Use 24-hour time format (14:30)
- [ ] Use IANA timezone names (America/New_York)
- [ ] Use mock data from `/00_Shared/MockIdentities.json`
- [ ] Test different timezones
- [ ] Test double-booking prevention

### After Testing
- [ ] Verify calendar event created
- [ ] Check email received with .ics attachment
- [ ] Test .ics file opens in calendar app
- [ ] Verify SMS received (if enabled)
- [ ] Check Google Sheets logged appointment
- [ ] Review n8n execution log for errors
- [ ] Delete test appointments from calendar

---

## 🎯 Mastery Checklist

**You've mastered Module 02 when you can:**

- [ ] Book appointments without referring to documentation
- [ ] Explain timezone handling to a non-technical person
- [ ] Troubleshoot calendar sync issues independently
- [ ] Verify double-booking prevention works correctly
- [ ] Interpret confirmation delivery failures
- [ ] Test different service types confidently
- [ ] Debug timezone conversion problems
- [ ] Verify .ics attachments work across different calendar apps
- [ ] Explain graceful degradation with real examples
- [ ] Confidently test in multiple timezones

---

## ❗ Common Mistakes

**Mistake #1:** Using 12-hour time format
- ❌ `"preferred_time": "2:30 PM"`
- ✅ `"preferred_time": "14:30"`

**Mistake #2:** Forgetting timezone
- ❌ No timezone specified → defaults to clinic timezone
- ✅ `"timezone": "America/Los_Angeles"`

**Mistake #3:** Testing with past dates
- ❌ `"preferred_date": "2020-01-01"`
- ✅ `"preferred_date": "2025-11-15"` (future date)

**Mistake #4:** Not checking calendar after booking
- ❌ Trusting HTTP 200 response alone
- ✅ Open calendar to verify event exists

**Mistake #5:** Using timezone abbreviations
- ❌ `"timezone": "PST"`
- ✅ `"timezone": "America/Los_Angeles"`

**Mistake #6:** Not testing .ics attachment
- ❌ Assuming it works
- ✅ Download and open .ics file to verify

**Mistake #7:** Testing on production calendar
- ❌ Creating test appointments in real provider calendar
- ✅ Use separate test calendar

---

## 💡 Pro Tips

**Tip #1:** Use worldtimebuddy.com to verify timezone conversions

**Tip #2:** Keep Google Calendar open in browser tab during testing to see events appear in real-time

**Tip #3:** Use YOUR real phone number for SMS testing (replace mock data)

**Tip #4:** Create a test calendar specifically for testing (Google Calendar → Create new calendar → "Test Appointments")

**Tip #5:** Test .ics files in multiple calendar apps (Outlook, Apple Calendar, Google Calendar) — they sometimes render differently

**Tip #6:** Intentionally test with timezones different from yours to verify conversions work

**Tip #7:** Keep a log of test bookings with their booking IDs for easy cleanup later

---

## 🎓 Key Takeaways

1. **Calendar integration is the heart of this module** — if calendar fails, everything fails
2. **Timezone handling is CRITICAL** — wrong timezone = missed appointment
3. **Double-booking prevention is non-negotiable** — must work 100% of the time
4. **Email + .ics is the primary confirmation method** — SMS is secondary
5. **Graceful degradation ensures reliability** — booking succeeds even if SMS fails
6. **Always verify in calendar** — HTTP 200 doesn't guarantee event was created
7. **Use IANA timezone names always** — abbreviations cause problems

---

**Keep this file handy as your quick reference guide!** 📌

**Next steps:**
- Review [TestPlan.md](TestPlan.md) for step-by-step testing
- Read [Observability.md](Observability.md) to know where to look
- Use [Troubleshooting.md](Troubleshooting.md) when issues arise
