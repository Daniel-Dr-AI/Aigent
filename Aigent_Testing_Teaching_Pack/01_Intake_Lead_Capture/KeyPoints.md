# Module 01: Intake & Lead Capture - Key Points

**Module:** 01 - Intake & Lead Capture
**Purpose:** Quick reference for essential concepts and reminders

---

## 🎯 What This Module Does

**In one sentence:**
Captures new patient leads from web forms and saves them to Google Sheets and your CRM.

**Why it matters:**
This is the first contact with potential patients. If it fails, you lose them forever.

---

## ✅ Core Functionality

**1. Accepts lead data via webhook**
- Receives: name, email, phone, source, message, UTM parameters
- Validates: all required fields present and correctly formatted
- Rejects: incomplete or malformed data

**2. Processes and enriches data**
- Normalizes phone numbers to E.164 format (+15551234567)
- Parses names into first/last
- Calculates lead score (0-100 based on data completeness)
- Tracks execution time and metadata

**3. Saves to multiple destinations**
- Google Sheets (primary storage)
- HubSpot or other CRM (optional)
- Compliance audit log (Module 09)

**4. Notifies team**
- Sends Slack/Teams message for each new lead
- Masks PHI (email, phone, IP) in notifications
- Non-blocking (failures don't prevent lead capture)

---

## 🔑 Key Concepts

### 1. **Webhook**
**What it is:** A special URL that receives data when someone submits a form

**Real-world analogy:** Like a mailbox — people can drop letters in, you check it periodically to see what arrived

**In Module 01:** Your website sends lead data to the webhook, which triggers the workflow

---

### 2. **Validation**
**What it is:** Checking that data is complete and correctly formatted before processing

**Why it matters:** Prevents garbage data from polluting your database

**What's validated:**
- Name: not empty, at least 2 characters
- Email: matches email pattern (something@something.com)
- Phone: not empty, at least 7 digits

---

### 3. **Phone Normalization**
**What it is:** Converting various phone formats to a single standard (E.164)

**Examples:**
- Input: `(555) 123-4567` → Output: `+15551234567`
- Input: `555.123.4567` → Output: `+15551234567`
- Input: `555-123-4567` → Output: `+15551234567`

**Why it matters:**
- Consistent format makes data usable for SMS (Module 05)
- Prevents duplicates (same number in different formats)
- Works internationally (+81 for Japan, +44 for UK, etc.)

---

### 4. **Lead Scoring**
**What it is:** Automatic calculation of lead quality (0-100 scale)

**Factors:**
- Data completeness (more fields = higher score)
- Email domain (corporate email > free email like @gmail)
- Phone provided (yes = higher score)
- UTM parameters present (shows tracking = higher score)

**Score ranges:**
- 0-30: Low quality (minimal info)
- 31-60: Medium quality (basic info)
- 61-80: High quality (complete info)
- 81-100: Very high quality (complete + corporate email)

**Why it matters:** Helps sales team prioritize which leads to call first

---

### 5. **PHI Masking**
**What it is:** Hiding sensitive patient information in logs and notifications

**What gets masked:**
- Email: `alice.anderson@example.com` → `a***n@example.com`
- Phone: `+15551234567` → `***-***-4567`
- IP Address: `192.168.1.100` → `192.168.x.x`

**Where it's masked:** Slack/Teams notifications, error logs

**Where it's NOT masked:** Google Sheets (secure, access-controlled storage)

**Why it matters:** HIPAA compliance — prevents accidental PHI exposure

---

### 6. **Graceful Degradation**
**What it is:** Non-critical failures don't stop the main purpose

**Example:**
- Slack notification fails (network issue)
- BUT lead still saves to Google Sheets
- Workflow returns success (lead was captured)

**Implementation:** `continueOnFail: true` on notification nodes

**Why it matters:** Notifications are "nice to have" — lead capture is mission-critical

---

### 7. **Idempotency** (Advanced)
**What it is:** Running the same action twice produces the same result safely

**In Module 01:** Each webhook submission creates a new lead (NOT idempotent by design)

**Why not idempotent:**
- Lead IDs are unique per submission
- Business decision: allow duplicate leads (user might submit twice intentionally)
- Deduplication happens later (in CRM, if needed)

---

## ⚠️ Critical Reminders

### Testing
1. **NEVER use real patient data** — always use MockIdentities.json
2. **Test in development environment** — not production
3. **Verify PHI masking** — check every Slack notification
4. **Check all 4 outputs** — HTTP response, Google Sheets, Slack, n8n logs

### Security
1. **PHI masking must work** — if full email/phone appears in Slack, STOP
2. **CORS must be configured** — `ALLOWED_ORIGINS=*` ONLY for testing
3. **Credentials must be secure** — use OAuth2 where possible, not API keys
4. **No hardcoded secrets** — all credentials in environment variables

### Data Quality
1. **Phone normalization is automatic** — expect E.164 format in output
2. **Lead scores vary** — more complete data = higher score
3. **Optional fields can be empty** — that's OK!
4. **Validation errors are helpful** — they prevent bad data

### Performance
1. **Target: < 5 seconds** — average execution time
2. **Google Sheets is slowest** — 1-2 seconds is normal
3. **Retries increase time** — but increase reliability
4. **Timeouts are safety nets** — workflow won't run forever

---

## 🚀 Testing Checklist (Quick)

**Before testing:**
- [ ] Workflow is active (green toggle)
- [ ] Environment variables set (see EnvMatrix.md)
- [ ] Google Sheet exists with correct tab
- [ ] Slack webhook tested independently

**During testing:**
- [ ] Use mock data from MockIdentities.json
- [ ] Check HTTP response for status
- [ ] Verify row in Google Sheets
- [ ] Confirm Slack notification
- [ ] Check PHI masking

**After testing:**
- [ ] Review n8n execution logs
- [ ] Calculate average execution time
- [ ] Document any issues
- [ ] Clean up test data (optional)

---

## 📊 Success Metrics

**What "working correctly" looks like:**

| Metric | Target | How to Check |
|--------|--------|--------------|
| Success rate | >99% | n8n execution history (green vs. red) |
| Execution time | <5s average | `execution_time_ms` in responses |
| Validation accuracy | 100% | Invalid data rejected, valid accepted |
| PHI masking | 100% | No full email/phone in Slack |
| Data completeness | 100% | All submitted fields in Google Sheets |
| Notification delivery | >95% | Slack messages vs. Sheet rows (OK if some fail) |

---

## 🔄 Data Flow (Simplified)

```
Web Form
   ↓
Webhook Trigger (receives data)
   ↓
Validation (checks required fields)
   ↓
Enrichment (normalize phone, calculate score, add metadata)
   ↓
┌─────────┬──────────┬──────────┐
│ Google  │ HubSpot  │  Slack   │
│ Sheets  │ (opt)    │  Alert   │
└─────────┴──────────┴──────────┘
   ↓
HTTP Response (success/error)
```

---

## 🎓 Learning Progression

**Level 1: Beginner**
- ✅ Run Test 1.1 (Happy Path) successfully
- ✅ Understand what a webhook is
- ✅ Read HTTP responses
- ✅ Find data in Google Sheets

**Level 2: Intermediate**
- ✅ Run all Happy Path and Invalid Input tests
- ✅ Understand validation logic
- ✅ Use n8n execution logs for debugging
- ✅ Explain phone normalization

**Level 3: Advanced**
- ✅ Run all 17 test cases successfully
- ✅ Troubleshoot errors independently
- ✅ Verify PHI masking
- ✅ Analyze performance metrics

**Level 4: Expert**
- ✅ Create custom test scenarios
- ✅ Teach others how to test this module
- ✅ Optimize workflow configuration
- ✅ Contribute to documentation improvements

---

## 💡 Pro Tips

**1. Keep a Test Log**
Write down each test:
```
2:30 PM - TC-HP-001 - Alice Anderson - Lead ID: L-20251031-001 - Success ✅
2:32 PM - TC-INV-001 - Missing email - Got error as expected ✅
```

**2. Use Browser DevTools**
When testing from a webpage:
- Press F12 to open DevTools
- Go to Network tab
- Watch the webhook POST request
- See response in real-time

**3. Bookmark Your Google Sheet**
Quick access for verifying each test

**4. Create Slack Test Channel**
Use `#test-leads` instead of `#leads` during testing

**5. Review n8n Stats Weekly**
Workflow → Settings → Statistics shows trends over time

---

## 🎯 Common Misconceptions

**Myth:** "The workflow is slow (5 seconds) — something's wrong!"
**Reality:** 2-5 seconds is normal. External APIs (Google Sheets, HubSpot) add latency.

**Myth:** "PHI masking in Slack means data is lost!"
**Reality:** Full data is safely stored in Google Sheets. Masking is ONLY for notifications.

**Myth:** "If Slack fails, the lead is lost!"
**Reality:** Notifications are non-blocking. Lead saves to Google Sheets even if Slack fails.

**Myth:** "I can test with real patient data if I delete it after"
**Reality:** NEVER test with real PHI. Use MockIdentities.json exclusively.

**Myth:** "Duplicate leads in Google Sheets means a bug"
**Reality:** Each submission creates a new lead (by design). Check Lead IDs — if different, they're different submissions.

---

## 🔗 Related Modules

**Module 02** (Consult Booking) uses lead data from Module 01
**Module 05** (Follow-Up) engages leads captured in Module 01
**Module 07** (Analytics) analyzes lead sources and scores
**Module 09** (Compliance) logs all lead capture events

---

## 📚 Additional Resources

**In this package:**
- `TestPlan.md` — Step-by-step testing instructions
- `TestCases.md` — All 17 test cases detailed
- `Observability.md` — Where to look to see what's happening
- `Troubleshooting.md` — Common problems and solutions
- `TeachingNotes.md` — How to explain this to others

**External:**
- n8n webhook docs: docs.n8n.io/workflows/webhooks
- Google Sheets API: developers.google.com/sheets
- E.164 phone format: en.wikipedia.org/wiki/E.164

---

## 🏆 You've Mastered Module 01 When...

- [ ] You can run all 17 tests from memory
- [ ] You can explain what a webhook does to a non-technical person
- [ ] You can troubleshoot common errors without this guide
- [ ] You understand why PHI masking matters
- [ ] You can teach someone else to test this module
- [ ] You feel confident deploying this to production

---

**Keep this file open as a quick reference while testing!** 📌
