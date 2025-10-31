# Module 03: Telehealth Session - Key Points

**Module:** 03 - Telehealth Session
**Purpose:** Quick reference for essential concepts and reminders
**PHI Level:** HIGH - Handles patient names, emails, and phone numbers

---

## 🎯 What This Module Does

**In one sentence:**
Creates secure, HIPAA-compliant video sessions and delivers session links to patients and providers via SMS and email.

**Why it matters:**
This is the first PHI-sensitive module. If it fails, the appointment exists but patient can't attend — leading to no-shows, frustrated patients, and provider operational burden.

---

## ✅ Core Functionality

**1. Accepts confirmed booking from Module 02**
- Receives: appointment_id, patient details, scheduled time, provider info
- Validates: all required fields present and correctly formatted
- Rejects: incomplete or malformed data with clear error messages

**2. Creates secure video session**
- Platform: Zoom for Healthcare, Doxy.me, or Amwell
- Security: Waiting room ON, password required, enhanced encryption
- Generates: unique session_id, patient link, host link, password
- Tracks: expiration time (default: 1 day after appointment)

**3. Delivers session links via multi-channel**
- SMS (Twilio): Patient receives text with link and password
- Email (SendGrid): Patient and provider receive HTML emails
- PHI masking: Provider email subject uses masked patient name
- Graceful degradation: Session succeeds even if SMS/email fails

**4. Updates tracking systems**
- HubSpot CRM: telehealth_status, session link, expiration tracking
- Google Sheets: Audit log with MASKED patient data
- Execution metadata: Delivery status, performance metrics, security compliance

---

## 🔑 Key Concepts

### 1. **PHI (Protected Health Information)**
**What it is:** Any information that can identify a patient and their healthcare

**Examples in Module 03:**
- Patient name: "Jane Doe"
- Patient email: "jane.doe@example.com"
- Patient phone: "+15551234567"
- Appointment details: date, time, reason

**Real-world analogy:** Like a patient's medical chart — must be protected at all times

**Why it matters:**
- HIPAA requires strict protection
- Violations = fines ($100-$50,000 per violation)
- This module is "PHI Level: HIGH" — handles the most sensitive data

**How Module 03 protects PHI:**
- Masked in Google Sheets logs
- Masked in provider email subjects
- Encrypted in transit (HTTPS)
- Access-controlled (only authorized systems)

---

### 2. **PHI Masking (Level 2)**
**What it is:** Hiding parts of patient data while keeping it identifiable

**Masking pattern:**
- Email: `jane.doe@example.com` → `j***e@example.com`
- Phone: `+1-555-123-4567` → `+1-555-***-4567`
- Name: `Jane Doe` → `J*** D***`

**Where PHI is MASKED:**
- Google Sheets audit logs
- Provider email subjects (inbox privacy)
- Internal notifications
- Error messages

**Where PHI is FULL (unmasked):**
- Zoom/Doxy API calls (necessary to create session)
- Patient SMS and email (patient needs their own info)
- Provider email body (provider needs full patient details)
- HubSpot CRM (secure, access-controlled)

**Real-world analogy:** Like using initials in public conversation ("J.D. is here") but full name in private chart notes

**Why it matters:**
- Minimizes PHI exposure in logs and previews
- If logs are leaked, less PHI is revealed
- HIPAA "minimum necessary" principle
- Balances operational visibility with security

---

### 3. **Video Platform API**
**What it is:** The service that hosts the actual video call (Zoom, Doxy.me, Amwell)

**How it works:**
1. Module 03 sends API request: "Create meeting for Jane Doe on Nov 5 at 2 PM"
2. Platform responds: "Meeting created! Here's the link: zoom.us/j/123..."
3. Module 03 stores link and sends to patient

**Platform requirements:**
- **Zoom:** Pro/Business/Healthcare account + OAuth2 credential
- **Doxy.me:** HIPAA-compliant plan + API key
- **Amwell:** Enterprise account + OAuth2

**Why it matters:**
- This is the slowest part of the workflow (1-2 seconds typical)
- If API fails, entire workflow fails (critical path)
- Requires BAA (Business Associate Agreement) for HIPAA compliance

**Common issues:**
- 401 Unauthorized: OAuth expired (reconnect)
- 429 Rate limit: Too many requests (throttle)
- Timeout: API slow or down (check status page)

---

### 4. **Session Expiration Tracking**
**What it is:** Automatically marking session links as invalid after appointment ends

**Default:** Link expires 1 day after scheduled appointment time

**Example:**
- Appointment: Nov 5 at 2:00 PM
- Session created: Nov 4 at 3:00 PM
- Link expires: Nov 6 at 2:00 PM (24 hours post-appointment)

**Why it matters:**
- Security: Links shouldn't work indefinitely
- Compliance: HIPAA best practice to limit access windows
- Operations: Enables automated cleanup
- Prevents: Patient using old link for wrong appointment

**Configurable:**
```
SESSION_LINK_EXPIRY_DAYS=1  (default)
SESSION_LINK_EXPIRY_DAYS=7  (for testing)
```

---

### 5. **Graceful Degradation**
**What it is:** Non-critical failures don't stop the main purpose

**Example:**
- Session created successfully ✅
- SMS sent successfully ✅
- Email sent successfully ✅
- CRM update failed ❌ (HubSpot down)
- **Result:** Workflow returns SUCCESS (session was created!)

**Implementation:** `continueOnFail: true` on nodes 309-313

**Critical vs. Non-critical:**

| Operation | Critical? | If it fails... |
|-----------|-----------|----------------|
| Create Video Session (307) | YES ❌ | Entire workflow fails |
| Update CRM (309) | NO ✅ | Workflow continues |
| Send SMS (310) | NO ✅ | Workflow continues (patient has email) |
| Send Email (311/312) | NO ✅ | Workflow continues |
| Log to Sheets (313) | NO ✅ | Workflow continues |

**Why it matters:**
- Resilience: Session succeeds even if CRM is down
- User experience: Patient gets link even if SMS fails (still has email)
- Operational priority: Video session is mission-critical, notifications are nice-to-have

**Delivery status tracking:**
```json
{
  "metadata": {
    "crm_updated": true,
    "patient_sms_sent": false,  // Twilio was down
    "patient_email_sent": true,
    "provider_email_sent": true,
    "logged": true
  }
}
```

---

### 6. **Multi-Channel Notification**
**What it is:** Delivering session link via multiple methods simultaneously

**Channels:**
1. **SMS (Twilio):** Instant, mobile-friendly, high open rate
2. **Email (SendGrid):** Professional, includes instructions, supports HTML
3. **CRM (HubSpot):** Permanent record, accessible to staff

**Real-world analogy:** Like sending both a text and email when confirming a dinner reservation — ensures message is received

**Why multiple channels:**
- Redundancy: If SMS fails, patient has email
- User preference: Some check email, others prefer texts
- Accessibility: Different devices, different preferences
- Reliability: Higher chance of delivery via at least one channel

**Content differences:**

| Channel | Patient | Provider |
|---------|---------|----------|
| SMS | Join link + password + date/time | Not sent (providers use email) |
| Email | HTML template, big button, checklist | Host link + full patient details |
| CRM | Link stored, status updated | Provider accesses via CRM if needed |

---

### 7. **Security-First Defaults**
**What it is:** Session created with maximum security settings by default

**Default settings:**

| Feature | Default | Why |
|---------|---------|-----|
| Waiting Room | ON | Prevents unauthorized access |
| Password Required | ON | Additional authentication layer |
| Join Before Host | OFF | Provider controls session start |
| Enhanced Encryption | ON | End-to-end encryption (HIPAA required) |
| Auto-Admit | OFF | Manual approval for all participants |
| Recording | OFF | Must be explicitly enabled |

**Real-world analogy:** Like a bank vault — locked by default, requires explicit action to open

**Why it matters:**
- HIPAA compliance out-of-the-box
- Clinics don't need to remember to enable security
- Reduces risk of accidental PHI exposure
- Meets "technical safeguards" requirements (45 CFR § 164.312)

**Overriding for low-risk use:**
```
ENABLE_WAITING_ROOM=false  (not recommended)
REQUIRE_SESSION_PASSWORD=false  (not recommended)
ALLOW_JOIN_BEFORE_HOST=true  (convenience over security)
```

---

## ⚠️ Critical Reminders

### Testing
1. **NEVER use real patient data** — always use mock data from MockIdentities.json
2. **Test in development environment** — not production
3. **Verify PHI masking FIRST** — check Google Sheets before any other tests
4. **Check all 6 outputs** — HTTP response, n8n logs, SMS, email, CRM, Sheets

### Security
1. **PHI masking must work** — if full email/phone appears in Google Sheets, STOP
2. **Provider email subjects must be masked** — inbox privacy protection
3. **Patient SMS/email must have full PHI** — they need their info to join
4. **Session links must expire** — verify expires_at is calculated correctly
5. **Waiting room must be enabled** — check session settings

### Data Quality
1. **Phone must be E.164 format** — +15551234567 (no spaces, dashes, parens)
2. **Email must be valid** — use regex validation
3. **scheduled_time must be ISO 8601** — "2025-11-05T14:00:00.000Z"
4. **Session IDs must be unique** — includes timestamp for uniqueness

### Performance
1. **Target: < 2200ms** — average execution time
2. **Node 307 (Create Session) is slowest** — 1-2 seconds is normal
3. **Parallel operations save time** — nodes 309-313 run simultaneously
4. **Retries increase time but increase reliability** — 3 attempts for critical operations

---

## 🚀 Testing Checklist (Quick)

**Before testing:**
- [ ] Module 03 workflow is active (green toggle)
- [ ] Module 02 successfully triggers Module 03
- [ ] Environment variables set (see EnvMatrix.md)
- [ ] Zoom/Doxy OAuth credential connected
- [ ] Twilio account funded and "From" number verified
- [ ] SendGrid API key valid
- [ ] HubSpot credential connected
- [ ] Google Sheet exists with correct tab

**During testing:**
- [ ] Use mock data from MockIdentities.json
- [ ] Check HTTP response for session_link
- [ ] Verify SMS delivered (check Twilio console)
- [ ] Confirm patient email received
- [ ] Confirm provider email received
- [ ] Verify provider email subject is MASKED
- [ ] Check PHI masking in Google Sheets

**After testing:**
- [ ] Review n8n execution logs
- [ ] Verify all parallel operations executed
- [ ] Calculate average execution time
- [ ] Document any issues
- [ ] Clean up test sessions (optional)

---

## 📊 Success Metrics

**What "working correctly" looks like:**

| Metric | Target | How to Check |
|--------|--------|--------------|
| Success rate | >99% | n8n execution history (green vs. red) |
| Execution time | <2200ms average | `execution_time_ms` in responses |
| SMS delivery | >95% | Twilio console status = "delivered" |
| Email delivery | >95% | SendGrid activity status = "delivered" |
| PHI masking accuracy | 100% | Google Sheets shows j***e@example.com |
| CRM sync | >90% | HubSpot fields populated (OK if some fail) |
| Session link validity | 100% | Links work until expires_at |

---

## 🔄 Data Flow (Simplified)

```
Module 02 (Booking Confirmed)
   ↓
Webhook Trigger (Node 301)
   ↓
Enhanced Validation (Node 302)
   ↓
PHI Masking (Node 305)
   ↓
Prepare Session Data (Node 306)
   ↓
Create Telehealth Session (Node 307) ← CRITICAL PATH
   ↓
Format Session Links (Node 308)
   ↓
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│   CRM    │   SMS    │  Email   │  Email   │  Sheets  │
│  Update  │ Patient  │ Patient  │ Provider │   Log    │
│  (309)   │  (310)   │  (311)   │  (312)   │  (313)   │
└──────────┴──────────┴──────────┴──────────┴──────────┘
   ↓ (all run in parallel)
Merge Results (Node 314)
   ↓
Build Execution Metadata (Node 315)
   ↓
Return Success Response (Node 316)
   ↓
Output: session_record.json
```

**Critical dependencies:**
- Nodes 301-307 must succeed (linear critical path)
- Nodes 309-313 can fail individually (parallel graceful degradation)

---

## 🔗 Integration Points

**Receives from:**
- **Module 02** (Consult Booking): booking_confirmation.json
  - appointment_id, patient details, scheduled_time, provider info

**Sends to:**
- **Module 04** (Billing): session_id for payment linkage
- **Module 05** (Follow-Up): patient contact info for post-session survey
- **Module 09** (Compliance): PHI access audit trail

**Triggers:**
- **CRM (HubSpot):** Real-time contact update
- **SMS (Twilio):** Immediate patient notification
- **Email (SendGrid):** Patient and provider notifications
- **Logging (Google Sheets):** Permanent audit record

---

## 🔧 Environment Variables (Top 7 Most Important)

| Variable | Purpose | Example |
|----------|---------|---------|
| `TELEHEALTH_PLATFORM` | Which video service | "Zoom" / "Doxy.me" / "Amwell" |
| `TELEHEALTH_API_BASE_URL` | API endpoint | "https://api.zoom.us/v2" |
| `ENABLE_PHI_MASKING` | Mask PHI in logs | "true" (always!) |
| `SESSION_LINK_EXPIRY_DAYS` | Link expiration | "1" (1 day after appointment) |
| `ENABLE_WAITING_ROOM` | Security feature | "true" (HIPAA best practice) |
| `REQUIRE_SESSION_PASSWORD` | Additional auth | "true" (HIPAA best practice) |
| `DEFAULT_SESSION_DURATION` | Session length | "30" (30 minutes) |

**See also:** EnvMatrix.md for complete list

---

## 🎓 Mastery Checklist

**Level 1: Beginner**
- [ ] Run successful session creation test
- [ ] Understand what a video session is
- [ ] Read HTTP responses
- [ ] Find session link in SMS/email

**Level 2: Intermediate**
- [ ] Run all Happy Path tests
- [ ] Understand PHI masking concept
- [ ] Use n8n execution logs for debugging
- [ ] Verify SMS/email delivery via provider consoles

**Level 3: Advanced**
- [ ] Run all test cases successfully
- [ ] Troubleshoot API errors independently
- [ ] Verify PHI masking in all 6 observability sources
- [ ] Analyze performance metrics and identify bottlenecks

**Level 4: Expert**
- [ ] Create custom test scenarios
- [ ] Teach others how to test this module
- [ ] Optimize workflow configuration for performance
- [ ] Contribute to documentation improvements
- [ ] Configure production alerts and monitoring

---

## ❌ Common Misconceptions

**Myth:** "The workflow is slow (2 seconds) — something's wrong!"
**Reality:** 1.5-2.5 seconds is normal. External APIs (Zoom, Doxy, Twilio, SendGrid) add latency. Node 307 alone takes 1-2 seconds.

**Myth:** "PHI masking in Google Sheets means data is lost!"
**Reality:** Full data is in HubSpot CRM and video platform. Masking is ONLY for logs (security best practice).

**Myth:** "If CRM update fails, the session is lost!"
**Reality:** Session is created successfully. CRM is nice-to-have. Session link is delivered via SMS/email and can be manually added to CRM later.

**Myth:** "Patient SMS should show masked name (J*** D***)"
**Reality:** Patient receives FULL PHI (they're consenting). Only LOGS and PROVIDER EMAIL SUBJECTS use masked PHI.

**Myth:** "Provider needs patient's permission to access video session"
**Reality:** Provider uses host_link with elevated permissions. Patient uses session_link with standard permissions.

**Myth:** "Sessions expire immediately after creation"
**Reality:** Sessions expire `SESSION_LINK_EXPIRY_DAYS` after scheduled_time (default: 1 day post-appointment), not after creation time.

---

## 💡 Pro Tips

**1. Test PHI Masking First, Always**
Before any other testing:
```
1. Create one test session
2. Check Google Sheets immediately
3. Verify: j***e@example.com, +1-555-***-4567, J*** D***
4. If not masked → STOP and fix before continuing
```

**2. Keep Provider Consoles Open During Testing**
- Tab 1: n8n Executions
- Tab 2: Twilio Console (SMS delivery)
- Tab 3: SendGrid Activity (email delivery)
- Tab 4: HubSpot Contact Record
- Tab 5: Google Sheets Audit Log
- Tab 6: Zoom/Doxy Dashboard (verify session exists)

**3. Use Trace IDs for End-to-End Tracking**
Every execution has unique `trace_id` (e.g., "SESSION-1730217600000"). Use it to:
- Find execution in n8n
- Search Google Sheets for corresponding row
- Correlate SMS in Twilio console
- Track emails in SendGrid activity
- Reference in bug reports

**4. Test Link Expiration with Short Duration**
For testing:
```
SESSION_LINK_EXPIRY_DAYS=0.01  # Expires in ~15 minutes
```
Create session, wait 20 minutes, try to join — should see "Link expired"

**5. Create Test Patient Personas**
Use consistent test identities:
- **Alice Anderson** — Happy path (everything works)
- **Bob Builder** — Invalid email (test validation)
- **Charlie Chen** — International phone (test E.164)
- **Diana Davis** — Edge cases (special characters)

**6. Monitor Platform-Specific Limits**
- **Zoom Pro:** 100 requests/day
- **Doxy.me:** 1000 rooms/month (check plan)
- **Twilio:** Check account balance
- **SendGrid:** 100 emails/day (free tier)

**7. Verify Waiting Room and Password**
After creating test session:
1. Open session_link in incognito browser
2. Should see waiting room (can't join yet)
3. Should prompt for password
4. Open host_link in regular browser (signed into Zoom)
5. Provider can admit patient from waiting room

---

## 🔗 Related Modules

**Module 02** (Consult Booking) → Sends confirmed booking to Module 03
**Module 04** (Billing) → Uses session_id to link payments to sessions
**Module 05** (Follow-Up) → Engages patient post-session based on session completion
**Module 09** (Compliance) → Logs all telehealth session creation events for audit

---

## 📚 Additional Resources

**In this package:**
- `TestPlan.md` — Step-by-step testing instructions
- `TestCases.md` — All test cases detailed
- `Observability.md` — Where to look to see what's happening
- `Troubleshooting.md` — Common problems and solutions
- `TeachingNotes.md` — How to explain this to others

**External:**
- n8n webhook docs: docs.n8n.io/workflows/webhooks
- Zoom API docs: marketplace.zoom.us/docs/api-reference/zoom-api
- Doxy.me API docs: doxy.me/en/api
- Twilio SMS docs: www.twilio.com/docs/sms
- SendGrid API docs: docs.sendgrid.com
- HIPAA technical safeguards: hhs.gov/hipaa/for-professionals/security

**Platform-specific:**
- Zoom for Healthcare: zoom.us/healthcare
- Doxy.me HIPAA: doxy.me/en/hipaa
- Amwell Telehealth: amwell.com

---

## 🏆 You've Mastered Module 03 When...

- [ ] You can create a session and verify delivery via all 6 channels
- [ ] You can explain PHI masking to a non-technical person
- [ ] You can troubleshoot Zoom/Doxy API errors without this guide
- [ ] You understand why graceful degradation matters
- [ ] You can verify security settings (waiting room, password, encryption)
- [ ] You know the difference between session_link and host_link
- [ ] You can teach someone else to test this module
- [ ] You feel confident deploying this to production with real patients

---

## 🎯 Quick Reference Card

**Print and keep near your desk during testing:**

```
MODULE 03: TELEHEALTH SESSION QUICK REFERENCE

Critical Path: Create Session (Node 307) must succeed
Non-Critical: CRM, SMS, Email, Logging can fail

Target Performance: <2200ms average

PHI Masking:
✅ FULL in: Zoom API, Patient SMS/Email, CRM
❌ MASKED in: Google Sheets, Provider email subject

Expiration: scheduled_time + 1 day (default)

Session Types:
- session_link = Patient (standard permissions)
- host_link = Provider (elevated permissions)

Key Checks:
1. Session link works
2. SMS delivered (Twilio console)
3. Emails sent (SendGrid activity)
4. Google Sheets shows MASKED PHI
5. Provider subject shows J*** D*** (not Jane Doe)
6. CRM updated (HubSpot fields populated)

If it breaks:
1. Check n8n execution (which node failed?)
2. Check error message (what's the problem?)
3. Check API status pages (is service down?)
4. Read Troubleshooting.md (solution likely there)
5. Use trace_id to correlate across systems

Emergency: PHI exposed in Google Sheets?
→ STOP testing immediately
→ Delete exposed data
→ Report security incident
→ Fix Node 305 (PHI Masking)
→ Do not continue until verified working
```

---

**Keep this file open as a quick reference while testing!** 📌
