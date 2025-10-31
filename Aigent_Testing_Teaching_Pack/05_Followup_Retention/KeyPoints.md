# Module 05: Follow-Up & Retention - Key Points

**Module:** 05 - Follow-Up & Retention
**Version:** 1.1.0-enhanced
**Key Points Version:** 1.0
**Last Updated:** 2025-10-31

---

## What This Module Does

**One sentence:** Automatically sends a 14-day sequence of follow-up communications (emails and texts) to patients after their visit to increase satisfaction, collect feedback, and encourage rebookings.

**Why it matters:** Without follow-up, patients feel forgotten after their visit. This module maintains the relationship, improves retention, and drives repeat business — increasing patient lifetime value by 30-50%.

---

## Core Functionality

Module 05 provides these main features:

1. **Multi-Touch Sequence** - Sends 4 timed touchpoints over 14 days (Day 0, 3, 7, 14)
2. **Multi-Channel Delivery** - Combines email and SMS for maximum reach
3. **Dynamic Link Generation** - Creates personalized survey and rebooking links with tracking
4. **Phone Normalization** - Handles various phone formats automatically
5. **Graceful SMS Handling** - Continues sequence even when phone number is missing
6. **Engagement Tracking** - Records which touches were sent and their delivery status
7. **UTM Tracking** - Enables marketing attribution for rebooking conversions
8. **Retry Logic** - Automatically retries failed API calls for +40% reliability

---

## Key Concepts

### 1. Multi-Touch Sequence

**Plain language:** Instead of sending one "thank you" email and hoping patients remember you, send a series of messages over time to stay top-of-mind.

**Real-world analogy:**

Think of dating. You don't just have one great first date and never call again. You:
- Day 0: Send "thanks for a great time" text (Day-0 touch)
- Day 3: Check in "how's your week going?" (Day-3 touch)
- Day 7: Suggest next activity together (Day-7 touch)
- Day 14: Make concrete plans (Day-14 touch)

Same with patients — multiple touches build relationship.

**Why it matters:**
- Single touches have <5% conversion rate
- Multi-touch sequences have 20-30% conversion rate
- Patients appreciate ongoing care concern

**How to test it:**
- Trigger sequence
- Verify Day-0 email/SMS arrive immediately
- (For full test: manually resume wait nodes to test Day 3/7/14)

---

### 2. Wait Nodes

**Plain language:** Wait nodes pause the workflow for a specified time (3 days, 7 days, etc.) before continuing to the next touchpoint.

**Real-world analogy:**

Like setting a kitchen timer. You put cookies in the oven, set timer for 12 minutes, do other things, then when timer beeps, you take cookies out. Wait nodes are workflow timers.

**Why it matters:**
- Can't send all touches immediately (would overwhelm patient)
- Proper timing increases engagement (3-day wellness check finds problems)
- Allows patient to complete survey before rebooking ask

**How to test it:**
- Check n8n execution shows "Waiting" status after Day-0
- Verify resume time is 72 hours later
- Use manual resume webhook for faster testing

**Technical note:** Requires n8n execution retention ≥14 days (set `EXECUTIONS_DATA_MAX_AGE=336`).

---

### 3. Phone Normalization

**Plain language:** Phone numbers come in many formats ((555) 123-4567, +1-555-123-4567, 5551234567). Phone normalization converts all formats to a standard format (E.164: +15551234567) that Twilio requires.

**Real-world analogy:**

Like converting different currencies to USD for accounting:
- £100 → $130 USD
- €100 → $110 USD
- ¥100 → $0.90 USD

All stored as USD regardless of input format.

**Why it matters:**
- Twilio rejects incorrectly formatted numbers
- Users input phone numbers in many formats
- Normalization ensures SMS always sends

**How to test it:**
- Send phone in format: (555) 123-4567
- Check n8n log for normalized output: 15551234567
- Verify Twilio SMS sent successfully

---

### 4. Dynamic Link Generation

**Plain language:** Survey and rebooking links are generated dynamically for each patient, including their email, patient_id, and trace_id as URL parameters for tracking.

**Real-world analogy:**

Like a boarding pass with your name and seat already printed. The airline generates it custom for you — not a blank generic pass.

**Why it matters:**
- Survey can pre-fill patient info (fewer fields to type)
- Rebooking can show patient's history (better UX)
- trace_id links survey responses back to specific follow-up sequence

**How to test it:**
- Trigger sequence
- Copy survey_link from response
- Paste in browser
- Verify parameters appear in URL

**Example:**
```
https://example.com/survey?email=jane%40example.com&patient_id=12345&trace_id=FU-1730300400000
```

---

### 5. UTM Tracking Parameters

**Plain language:** UTM parameters are special codes added to URLs (like `?utm_source=followup&utm_medium=email`) that tell Google Analytics where traffic came from.

**Real-world analogy:**

Like writing "Referral from Sarah" on a new patient form. You know which marketing channel brought them in.

**Why it matters:**
- Measure which follow-up emails drive rebookings
- Calculate ROI of follow-up sequences
- Optimize messaging based on conversion data

**How to test it:**
- Copy rebooking_link from response
- Verify includes: utm_source=followup, utm_medium=email, utm_campaign=day14_rebook
- Test link loads booking page correctly

**Required for:** Marketing attribution, conversion tracking, A/B testing

---

### 6. Retry Logic

**Plain language:** If SendGrid or Twilio API calls fail temporarily (network blip, brief outage), n8n automatically retries the call 2 times before giving up.

**Real-world analogy:**

Like calling someone and getting "line busy" — you hang up, wait 30 seconds, try again. You don't give up after one busy signal.

**Why it matters:**
- Network issues happen (5-10% of requests fail temporarily)
- Retry logic increases success rate from 90% to 99%
- Patients receive communications even during brief API outages

**How to test it:**
- (Advanced) Mock SendGrid to return 500 on first attempt, 202 on second
- Verify n8n execution log shows 2 API calls
- Confirm email delivered despite first failure

**Configuration:** `maxTries: 2`, `waitBetweenTries: 500ms`, `continueOnFail: true`

---

### 7. Touch Tracking

**Plain language:** The module records which communications were sent (day0_email, day0_sms, etc.) and their delivery status (sent/failed) in the response and database.

**Real-world analogy:**

Like a mail carrier's delivery log: "Delivered package to 123 Main St at 2:00 PM ✅" or "Unable to deliver, no access to building ❌".

**Why it matters:**
- Know which patients received which touches
- Identify delivery failures quickly
- Calculate engagement metrics (open rate, click rate)
- Feed data to Module 07 (Analytics)

**How to test it:**
- Check HTTP response `touches_sent` array
- Verify `touch_results` shows status for each touch
- Confirm Google Sheets log includes touches_sent

**Tracked data:**
- Touch name (day0_email, day3_sms, etc.)
- Status (sent/failed)
- Timestamp
- Error message (if failed)
- SMS SID (for Twilio lookups)

---

## Critical Reminders

### Testing

- ⚠️ **NEVER use real patient data** - Use mock data only
- ⚠️ **Test in development environment** - Not production
- ⚠️ **Verify in 4 places** - HTTP response, n8n, SendGrid, Twilio
- ⚠️ **Check multi-day sequence** - Use manual resume for testing
- ⚠️ **Document test results** - Use Checklist.md

### Security

- ⚠️ **No PHI masking required** - Module 05 handles marketing data (not clinical PHI)
- ⚠️ **BUT respect privacy** - Don't log patient emails unnecessarily
- ⚠️ **Use trace_id** - For correlation instead of exposing patient identifiers in logs
- ⚠️ **Verify SMS opt-outs** - Respect patient communication preferences

### Data Quality

- ⚠️ **Validate email format** - Invalid emails = bounces = poor sender reputation
- ⚠️ **Validate phone format** - Invalid phones = wasted Twilio costs
- ⚠️ **Clean data at source** - Module 01/02 should validate before Module 05
- ⚠️ **Monitor bounce rates** - Email >5% bounce = data quality issue

### Performance

- ⚠️ **Target <2 seconds** - Day-0 execution should complete in 1-2 seconds
- ⚠️ **Monitor API latency** - SendGrid/Twilio slow? Check status pages
- ⚠️ **Check execution time** - `execution_time_ms` field tracks performance
- ⚠️ **Scale considerations** - 100+ concurrent sequences? Use n8n queue mode

---

## Testing Checklist (Quick)

### Before Testing

- [ ] Workflow is active (green toggle in n8n)
- [ ] SendGrid API key configured
- [ ] Twilio credentials configured
- [ ] Environment variables set (SURVEY_BASE_URL, REBOOKING_LINK, CLINIC_NAME)
- [ ] Mock data prepared (see MockData/ folder)
- [ ] Terminal/cURL ready

### During Testing

- [ ] Webhook URL copied correctly
- [ ] cURL command runs without errors
- [ ] HTTP response shows "success": true
- [ ] trace_id copied for tracking
- [ ] touches_sent lists expected touches
- [ ] All touch_results show "status": "sent"

### After Testing

- [ ] Email delivered (verified in SendGrid Activity)
- [ ] SMS delivered (verified in Twilio Logs)
- [ ] n8n execution shows "Success" status
- [ ] Google Sheets updated (if configured)
- [ ] Survey link tested (loads correctly)
- [ ] Rebooking link tested (has UTM parameters)
- [ ] Results documented in Checklist.md

---

## Success Metrics

| Metric | Target | Measurement | Good Sign | Warning Sign |
|--------|--------|-------------|-----------|-------------|
| Email Delivery Rate | >95% | SendGrid Activity | 98% delivered | <90% delivered |
| SMS Delivery Rate | >90% | Twilio Logs | 95% delivered | <85% delivered |
| Execution Time | <2000ms | execution_time_ms | 1200ms | >3000ms |
| Sequence Start Rate | >99% | n8n executions | 100% started | <95% started |
| Survey Completion | >15% | Survey platform | 20% complete | <10% complete |
| Rebooking Rate | >10% | Booking system | 15% rebooked | <5% rebooked |
| Error Rate | <1% | n8n failures | 0.1% errors | >2% errors |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   MODULE 05 DATA FLOW (14 DAYS)                 │
└─────────────────────────────────────────────────────────────────┘

INPUT: Module 04 (Billing) sends billing_confirmation.json
  ↓
┌──────────────────────┐
│ DAY 0: Thank You     │  ← Patient completes visit
│ - Email: Thank you   │
│ - SMS: Thank you     │
│ - Time: Immediate    │
└──────────────────────┘
  ↓
  ⏱ WAIT 72 HOURS ⏱
  ↓
┌──────────────────────┐
│ DAY 3: Wellness      │  ← 3 days post-visit
│ - Email: How are you │
│ - SMS: Check-in      │
│ - Time: +72h         │
└──────────────────────┘
  ↓
  ⏱ WAIT 96 HOURS ⏱
  ↓
┌──────────────────────┐
│ DAY 7: Survey        │  ← 7 days post-visit
│ - Email: Survey link │
│ - SMS: Survey link   │
│ - Time: +168h total  │
└──────────────────────┘
  ↓
  ⏱ WAIT 168 HOURS ⏱
  ↓
┌──────────────────────┐
│ DAY 14: Rebooking    │  ← 14 days post-visit
│ - Email: Rebook link │
│ - SMS: (none)        │
│ - Time: +336h total  │
└──────────────────────┘
  ↓
OUTPUT: followup_feedback.json
  ↓
Module 07 (Analytics) - Engagement metrics
```

---

## Integration Points

### Receives Data From

| Module | Data Contract | Fields Used |
|--------|---------------|-------------|
| Module 04 (Billing) | billing_confirmation.json | patient_id, patient_email, patient_phone, patient_name, visit_type, visit_date, provider_name |
| Manual Trigger | (same) | (same) |

### Sends Data To

| Destination | Format | Purpose |
|-------------|--------|---------|
| SendGrid | Email API | Send emails |
| Twilio | SMS API | Send SMS |
| Google Sheets | Append row | Track sequences |
| Module 07 (Analytics) | followup_feedback.json | Engagement metrics |

### Triggers

| Trigger | Destination | Condition |
|---------|-------------|-----------|
| (none) | - | Module 05 doesn't trigger other modules |

**Note:** Module 05 is an endpoint. It receives triggers from Module 04 but doesn't trigger downstream modules automatically.

---

## Environment Variables (Key)

Top 7 most important environment variables for Module 05:

| Variable | Purpose | Example | Required? |
|----------|---------|---------|-----------|
| `SENDGRID_API_KEY` | SendGrid authentication | `SG.abc123...` | ✅ Yes |
| `SENDGRID_FROM_EMAIL` | Email "From" address | `noreply@clinic.com` | ✅ Yes |
| `TWILIO_ACCOUNT_SID` | Twilio authentication | `ACxxxxxxxx...` | ✅ Yes (if SMS) |
| `TWILIO_AUTH_TOKEN` | Twilio authentication | `abc123...` | ✅ Yes (if SMS) |
| `TWILIO_PHONE_NUMBER` | SMS "From" number | `+15559998888` | ✅ Yes (if SMS) |
| `SURVEY_BASE_URL` | Survey platform URL | `https://typeform.com/to/abc123` | ⚠️ Recommended |
| `REBOOKING_LINK` | Booking page URL | `https://clinic.com/book` | ⚠️ Recommended |
| `CLINIC_NAME` | Clinic name for emails | `Your Clinic` | ⚠️ Recommended |

**See `/00_Shared/EnvMatrix.md` for complete list.**

---

## Mastery Checklist

You've mastered Module 05 when you can:

- [ ] Explain the 14-day multi-touch sequence (Day 0, 3, 7, 14)
- [ ] Trigger a follow-up sequence using cURL
- [ ] Verify email delivery in SendGrid Activity
- [ ] Verify SMS delivery in Twilio Logs
- [ ] Read and interpret HTTP response fields (trace_id, touches_sent, touch_results)
- [ ] Check n8n execution logs to debug failures
- [ ] Test phone normalization with various formats
- [ ] Verify survey link generation and parameters
- [ ] Verify rebooking link UTM tracking parameters
- [ ] Explain how wait nodes work and why execution retention matters
- [ ] Troubleshoot common issues (email bounce, SMS undelivered, validation errors)
- [ ] Monitor performance using execution_time_ms
- [ ] Use trace_id to track sequences across systems
- [ ] Manually resume wait nodes for testing (advanced)
- [ ] Calculate engagement metrics (delivery rate, survey completion, rebooking rate)

---

## Common Misconceptions

### Myth vs. Reality

**Myth:** "If HTTP response shows 'sent', the email was definitely delivered to patient's inbox."

**Reality:** HTTP response shows API acceptance, not final delivery. SendGrid may accept the email but it still bounces or goes to spam. Always verify in SendGrid Activity.

---

**Myth:** "The 14-day sequence blocks the HTTP response until Day 14."

**Reality:** HTTP response returns immediately after Day-0 (1-2 seconds). The sequence continues in the background using wait nodes. Patient journey is 14 days, but API call is <2 seconds.

---

**Myth:** "I need to wait 14 days to test the full sequence."

**Reality:** You can manually trigger wait node resume webhooks to test Day 3/7/14 immediately. Or, reduce wait times temporarily to 1 minute for testing.

---

**Myth:** "Phone normalization will fix any phone number, no matter how broken."

**Reality:** Phone normalization handles format variations ((555) 123-4567 vs +15551234567), but can't fix fundamentally invalid numbers (5 digits, letters, etc.). Validation rejects invalid numbers.

---

**Myth:** "Module 05 requires HIPAA PHI masking like Module 06."

**Reality:** Module 05 handles marketing communications (patient name, email, phone), not clinical PHI (diagnosis, treatment). PHI masking is not required, though privacy best practices still apply.

---

**Myth:** "If one touch fails (e.g., SMS), the whole sequence fails."

**Reality:** Retry logic and continueOnFail ensure the sequence continues even if individual touches fail. Email-only patients still get the full email sequence even though SMS is skipped.

---

**Myth:** "Survey completion and rebooking are tracked automatically in Module 05."

**Reality:** Module 05 generates tracking links with trace_id, but you must configure your survey platform and booking system to capture and report on these parameters. Module 07 (Analytics) aggregates this data.

---

## Pro Tips

### Tip 1: Use Test Mode First

Before triggering sequences for real patients, use SendGrid Test Mode and Twilio Test Credentials to avoid sending actual emails/SMS during development.

**SendGrid Test Mode:**
- Use `sandbox_mode: true` in API calls
- Emails accepted but not delivered
- Perfect for testing logic without spamming

**Twilio Test Credentials:**
- Use magic phone number: +15005550006 (always delivers)
- Or use Twilio test credentials (don't send real SMS)

---

### Tip 2: Create a Testing Dashboard

Set up a simple Google Sheet dashboard:

| Date | trace_id | patient_email | day0_email | day0_sms | day3_email | day7_email | survey_completed | rebooked |
|------|----------|---------------|-----------|----------|-----------|-----------|-----------------|----------|
| 2025-10-30 | FU-123 | jane@... | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |

Track each sequence manually during testing to identify patterns.

---

### Tip 3: Monitor Delivery Rates Daily

Set a calendar reminder to check:
- SendGrid delivery rate (goal: >95%)
- Twilio delivery rate (goal: >90%)
- Execution error rate (goal: <1%)

Catching delivery rate drops early prevents major issues.

---

### Tip 4: A/B Test Email Subject Lines

Try different subject lines to optimize open rates:

**Version A:** "Thank you for your visit - [Clinic Name]"
**Version B:** "[Patient Name], thank you for visiting us!"

Track open rates in SendGrid to see which performs better.

---

### Tip 5: Use trace_id for Everything

Always include trace_id in:
- Survey responses (already in link)
- Booking confirmations (already in link)
- Support tickets (add manually if patient contacts you)
- CRM notes

This creates end-to-end traceability from sequence trigger to patient action.

---

### Tip 6: Set Up Alerts for Failures

Configure n8n error workflow to notify you when Module 05 fails:

```
IF: Module 05 execution fails
THEN: Send Slack/email alert with error details
```

Catch failures within minutes, not days.

---

### Tip 7: Review Weekly Engagement Metrics

Every Monday, review:
- Total sequences started last week
- Email delivery rate
- SMS delivery rate
- Survey completion rate (from survey platform)
- Rebooking rate (from booking system)

Identify trends and optimize messaging.

---

### Tip 8: Respect Opt-Outs Immediately

When a patient opts out of SMS:
1. Update their record in your CRM
2. Set patient_phone to null for future sequences
3. Continue email-only follow-up (if allowed)

**Compliance matters.** Ignoring opt-outs violates TCPA (Telephone Consumer Protection Act) and can result in $500-$1500 fines per message.

---

### Tip 9: Use Manual Resume for Efficient Testing

Instead of waiting 14 days, test like this:

```bash
# Day 0: Trigger sequence normally
curl -X POST webhook-url ...

# Check Day-0 results (2 minutes)

# Manually resume Day-3:
curl -X POST https://n8n/webhook-waiting/module-05-wait-day3

# Check Day-3 results (2 minutes)

# Total test time: 5 minutes instead of 14 days
```

---

### Tip 10: Maintain Clean Data at Source

The best time to validate email/phone is when collecting it (Module 01 intake form), not at follow-up (Module 05).

**Implement at source:**
- Real-time email validation on form submit
- Phone format validation with dropdown country code
- "Confirm email" field to catch typos

**Result:** Module 05 has <2% validation failure rate instead of 15%.

---

**End of Key Points**

For step-by-step testing, see [TestPlan.md](TestPlan.md).

For detailed test cases, see [TestCases.md](TestCases.md).

For monitoring guidance, see [Observability.md](Observability.md).

For problem-solving, see [Troubleshooting.md](Troubleshooting.md).
