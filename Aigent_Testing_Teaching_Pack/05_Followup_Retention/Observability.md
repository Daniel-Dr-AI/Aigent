# Module 05: Follow-Up & Retention - Observability Guide

**Module:** 05 - Follow-Up & Retention
**Version:** 1.1.0-enhanced
**Observability Guide Version:** 1.0
**Last Updated:** 2025-10-31

---

## Table of Contents

1. [What is Observability?](#what-is-observability)
2. [Why Observability Matters](#why-observability-matters)
3. [The Observability Stack](#the-observability-stack)
4. [HTTP Response Analysis](#http-response-analysis)
5. [n8n Execution Logs](#n8n-execution-logs)
6. [SendGrid Email Activity](#sendgrid-email-activity)
7. [Twilio SMS Logs](#twilio-sms-logs)
8. [Google Sheets Tracking](#google-sheets-tracking)
9. [Wait Node Monitoring](#wait-node-monitoring)
10. [Observability Checklist](#observability-checklist)
11. [Common Observability Questions](#common-observability-questions)
12. [Pro Tips for Monitoring](#pro-tips-for-monitoring)
13. [Observability Best Practices](#observability-best-practices)

---

## What is Observability?

**Simple definition:** Observability is your ability to understand what's happening inside your system by looking at the outputs it produces.

**Real-world analogy:**

Think of observability like the dashboard in your car:
- **Speedometer** → How fast am I going? (Performance)
- **Fuel gauge** → Do I have enough fuel? (Resource availability)
- **Check engine light** → Is something wrong? (Error detection)
- **GPS** → Where am I? (Trace/tracking)

In Module 05, observability means answering questions like:
- Did the follow-up sequence start successfully?
- Were emails delivered to patients?
- Were SMS messages sent?
- How long did it take to execute?
- Are there any errors I need to fix?

**Key concept:** You can't be inside the n8n workflow watching it run. Observability gives you "windows" to peek inside and see what happened.

---

## Why Observability Matters

### Real-World Scenarios

**Scenario 1: The Silent Failure**

Your billing module (Module 04) completes successfully, but follow-up emails never arrive. Without observability, you wouldn't know until patients complain weeks later.

**With observability:**
1. Check n8n execution logs → See Module 05 was never triggered
2. Check Module 04 logs → See webhook call to Module 05 failed
3. Fix webhook URL → Problem solved in 5 minutes

**Without observability:**
- Patients receive no thank-you emails for weeks
- Satisfaction scores drop
- No one knows why until patient survey results come in

---

**Scenario 2: The Partial Delivery**

Follow-up sequences start, but only 60% of emails actually deliver. The rest bounce or get marked as spam.

**With observability:**
1. Check SendGrid Activity → Notice 40% bounce rate
2. Review bounce reasons → "Invalid recipient" errors
3. Discover data quality issue → Patient emails have typos
4. Fix data validation in Module 01 → Bounce rate drops to <5%

**Without observability:**
- You think everything is working
- 40% of patients never hear from you
- No rebooking conversions from those patients

---

**Scenario 3: The Performance Degradation**

Follow-up sequences that used to take 1 second now take 8 seconds. Patient experience suffers.

**With observability:**
1. Check `execution_time_ms` in responses → Notice increase
2. Review n8n execution logs → See SendGrid API calls taking 6 seconds
3. Check SendGrid status page → SendGrid experiencing high load
4. Enable retry logic → System becomes resilient

**Without observability:**
- Slow performance goes unnoticed
- Some sequences timeout and fail
- Patients don't receive communications

---

### Business Impact

| Observable Metric | Business Impact if Unknown |
|-------------------|---------------------------|
| Email delivery rate | Lost patient engagement, lower satisfaction |
| SMS delivery rate | Wasted Twilio costs, patients miss reminders |
| Sequence start rate | Revenue loss from missed rebookings |
| Execution time | Poor patient experience, system timeouts |
| Error rate | Undetected failures, broken patient journeys |

**Bottom line:** Observability turns invisible problems into visible, fixable issues.

---

## The Observability Stack

Module 05 provides **5 observability sources**. Each shows different information.

### The 5 Windows Into Module 05

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE 05 OBSERVABILITY                       │
└─────────────────────────────────────────────────────────────────┘

1. HTTP RESPONSE (Immediate)
   ├─ What: JSON response from webhook call
   ├─ When: Immediately after triggering sequence
   ├─ Shows: Success/failure, trace_id, touches_sent, execution_time
   └─ Use for: Quick success/failure check

2. N8N EXECUTION LOGS (Immediate)
   ├─ What: Detailed flow of data through workflow nodes
   ├─ When: Immediately after execution
   ├─ Shows: Each node's input/output, errors, timing
   └─ Use for: Debugging, understanding flow, troubleshooting

3. SENDGRID EMAIL ACTIVITY (5-30 seconds)
   ├─ What: Email delivery tracking from SendGrid
   ├─ When: 5-30 seconds after sending
   ├─ Shows: Delivery status, opens, clicks, bounces
   └─ Use for: Email delivery verification, engagement tracking

4. TWILIO SMS LOGS (10-60 seconds)
   ├─ What: SMS delivery tracking from Twilio
   ├─ When: 10-60 seconds after sending
   ├─ Shows: Delivery status, error codes, pricing
   └─ Use for: SMS delivery verification, cost tracking

5. GOOGLE SHEETS TRACKING (5-15 seconds)
   ├─ What: Sequence records in spreadsheet
   ├─ When: 5-15 seconds after execution
   ├─ Shows: Patient data, sequence status, touches sent
   └─ Use for: Historical tracking, analytics, reporting

```

**Key insight:** No single source tells the whole story. You need to check multiple sources to fully understand what happened.

---

## HTTP Response Analysis

### What is an HTTP Response?

When you trigger Module 05 with a cURL command or API call, the module sends back a message (JSON format) telling you what happened. This is the HTTP response.

**Where to see it:** Your terminal window immediately after running cURL.

---

### Anatomy of a Success Response

```json
{
  "success": true,
  "trace_id": "FU-1730300400000",
  "patient_id": "12345",
  "sequence_status": "initiated",
  "touches_sent": ["day0_email", "day0_sms"],
  "touch_results": [
    {
      "touch": "day0_email",
      "status": "sent",
      "sent_at": "2025-10-30T14:00:00Z"
    },
    {
      "touch": "day0_sms",
      "status": "sent",
      "sent_at": "2025-10-30T14:00:05Z",
      "sms_sid": "SM123abc456def789ghi"
    }
  ],
  "survey_link": "https://example.com/survey?email=jane%40example.com&patient_id=12345&trace_id=FU-1730300400000",
  "rebooking_link": "https://example.com/book?patient_id=12345&utm_source=followup&utm_medium=email&utm_campaign=day14_rebook&trace_id=FU-1730300400000",
  "execution_time_ms": 1200,
  "performance_category": "normal",
  "completed_at": "2025-10-30T14:00:01.200Z",
  "metadata": {
    "module": "aigent_module_05",
    "version": "1.1",
    "total_touches": 2
  }
}
```

### Field-by-Field Breakdown

#### success (boolean)

**What it means:**
- `true`: Sequence started successfully
- `false`: Validation failed or critical error

**Good sign:**
```json
"success": true
```

**Warning sign:**
```json
"success": false
```

**What to do if false:**
- Look at `error` field for details
- Check `error.code` for error type
- Review `error.details` for specific validation failures

---

#### trace_id (string)

**What it means:** Unique identifier for this sequence execution. Use this to track the sequence across all systems.

**Format:** `FU-` followed by Unix timestamp in milliseconds

**Example:**
```json
"trace_id": "FU-1730300400000"
```

**Why it matters:**
- Search for this trace_id in n8n logs
- Search for this trace_id in Google Sheets
- Search for this trace_id in survey responses
- Search for this trace_id in rebooking records

**Pro tip:** Copy trace_id immediately after testing. You'll need it to verify results in other systems.

---

#### patient_id (string)

**What it means:** The patient identifier you sent in the request (echoed back for confirmation).

**Good sign:**
```json
"patient_id": "12345"
```

Matches the patient_id you sent in the request.

**Warning sign:**

patient_id doesn't match what you sent → Possible data corruption or routing issue.

---

#### sequence_status (string)

**What it means:** Current status of the follow-up sequence.

**Possible values:**
- `"initiated"`: Sequence started, Day-0 touches sent
- `"in_progress"`: Sequence running (Day 3/7/14 pending)
- `"completed"`: All 14 days completed
- `"failed"`: Sequence encountered critical error

**Good sign:**
```json
"sequence_status": "initiated"
```

This is the expected status after triggering.

**Note:** Full sequence completion takes 14 days. Initial response shows "initiated" because only Day-0 touches have been sent.

---

#### touches_sent (array)

**What it means:** List of communication touchpoints that were successfully sent.

**Possible values:**
- `"day0_email"`: Day-0 thank-you email
- `"day0_sms"`: Day-0 thank-you SMS
- `"day3_email"`: Day-3 wellness check email
- `"day3_sms"`: Day-3 wellness check SMS
- `"day7_survey_email"`: Day-7 survey request email
- `"day7_survey_sms"`: Day-7 survey request SMS
- `"day14_rebook_email"`: Day-14 rebooking email

**Good sign (both email and SMS):**
```json
"touches_sent": ["day0_email", "day0_sms"]
```

Both Day-0 touchpoints sent successfully.

**Good sign (email only, no phone provided):**
```json
"touches_sent": ["day0_email"]
```

Only email sent because patient_phone was not provided (expected behavior).

**Warning sign:**
```json
"touches_sent": []
```

No touches sent at all → Critical failure, investigate immediately.

**Warning sign:**
```json
"touches_sent": ["day0_email"]
```

When phone number WAS provided but only email sent → SMS failed, check Twilio.

---

#### touch_results (array of objects)

**What it means:** Detailed delivery status for each touch, including success/failure reasons.

**Structure:**

```json
{
  "touch": "day0_email",
  "status": "sent",
  "sent_at": "2025-10-30T14:00:00Z"
}
```

**Field breakdown:**

- `touch`: Which touchpoint (day0_email, day0_sms, etc.)
- `status`: `"sent"` (success) or `"failed"` (failure)
- `sent_at`: ISO 8601 timestamp when sent
- `sms_sid` (SMS only): Twilio message SID for lookup
- `error` (if failed): Error message

**Good sign:**
```json
"touch_results": [
  {
    "touch": "day0_email",
    "status": "sent",
    "sent_at": "2025-10-30T14:00:00Z"
  },
  {
    "touch": "day0_sms",
    "status": "sent",
    "sent_at": "2025-10-30T14:00:05Z",
    "sms_sid": "SM123abc456"
  }
]
```

Both touches sent successfully.

**Warning sign:**
```json
"touch_results": [
  {
    "touch": "day0_email",
    "status": "sent",
    "sent_at": "2025-10-30T14:00:00Z"
  },
  {
    "touch": "day0_sms",
    "status": "failed",
    "error": "Invalid phone number"
  }
]
```

Email sent, but SMS failed. Check phone number format.

**What to do if status is "failed":**
1. Read the `error` field for reason
2. Check Twilio/SendGrid logs for more details
3. Verify credentials are configured correctly
4. Check account status (suspended? out of credits?)

---

#### survey_link (string)

**What it means:** Dynamically generated survey URL with tracking parameters.

**Format:**
```
https://example.com/survey?email={url_encoded_email}&patient_id={id}&trace_id={trace_id}
```

**Good sign:**
```json
"survey_link": "https://example.com/survey?email=jane%40example.com&patient_id=12345&trace_id=FU-1730300400000"
```

**What to check:**
- [ ] URL starts with configured `SURVEY_BASE_URL`
- [ ] `email` parameter is URL-encoded (`@` becomes `%40`)
- [ ] `patient_id` parameter matches patient
- [ ] `trace_id` parameter matches this execution

**How to verify:** Copy the URL and paste into browser. Survey should load with patient info pre-filled (if survey platform supports it).

**Warning sign:**

URL is malformed or missing parameters → Survey won't work, investigate link generation logic.

---

#### rebooking_link (string)

**What it means:** Dynamically generated rebooking URL with UTM tracking parameters for marketing attribution.

**Format:**
```
https://example.com/book?patient_id={id}&utm_source=followup&utm_medium=email&utm_campaign=day14_rebook&trace_id={trace_id}
```

**Good sign:**
```json
"rebooking_link": "https://example.com/book?patient_id=12345&utm_source=followup&utm_medium=email&utm_campaign=day14_rebook&trace_id=FU-1730300400000"
```

**What to check:**
- [ ] URL starts with configured `REBOOKING_LINK`
- [ ] `utm_source=followup` present
- [ ] `utm_medium=email` present
- [ ] `utm_campaign=day14_rebook` present
- [ ] `patient_id` matches patient
- [ ] `trace_id` matches this execution

**Why UTM parameters matter:** These allow you to track rebooking conversions in Google Analytics and attribute them to the Day-14 follow-up email.

**How to verify:** Copy the URL and paste into browser. Booking page should load. Check browser console or network tab to confirm UTM parameters are captured.

---

#### execution_time_ms (number)

**What it means:** How long (in milliseconds) it took to execute the Day-0 portion of the sequence.

**Performance categories:**
- **Fast:** <1000ms (excellent)
- **Normal:** 1000-3000ms (acceptable)
- **Slow:** >3000ms (investigate)

**Good sign:**
```json
"execution_time_ms": 1200,
"performance_category": "normal"
```

Execution completed in 1.2 seconds — acceptable performance.

**Warning sign:**
```json
"execution_time_ms": 5000,
"performance_category": "slow"
```

Execution took 5 seconds — investigate SendGrid/Twilio API delays, server performance, or network issues.

**What to do if slow:**
1. Check SendGrid status: https://status.sendgrid.com/
2. Check Twilio status: https://status.twilio.com/
3. Review n8n execution log for slow nodes
4. Check n8n server CPU/memory usage
5. Consider enabling caching or optimization

**Note:** `execution_time_ms` only measures Day-0 sequence initialization (email/SMS sending). It does NOT include the 14-day wait times. Total sequence duration is always 14 days.

---

#### metadata (object)

**What it means:** Additional context about the execution.

**Fields:**
- `module`: Module identifier ("aigent_module_05")
- `version`: Module version ("1.1")
- `total_touches`: Number of touches sent in this execution

**Good sign:**
```json
"metadata": {
  "module": "aigent_module_05",
  "version": "1.1",
  "total_touches": 2
}
```

**Why it matters:** Version tracking helps during upgrades. If you deploy v1.2, you can filter responses by version to compare performance.

---

### Anatomy of an Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      "patient_email: required and must be valid email format",
      "patient_phone: must be 7-20 digits"
    ],
    "trace_id": "ERR-1730300800000"
  },
  "validated_at": "2025-10-30T14:20:00Z"
}
```

### Error Field Breakdown

#### error.code (string)

**What it means:** Machine-readable error code for programmatic handling.

**Common codes:**
- `VALIDATION_FAILED`: Input data didn't pass validation
- `SENDGRID_ERROR`: SendGrid API failure
- `TWILIO_ERROR`: Twilio API failure
- `INTERNAL_ERROR`: Unexpected error in workflow

**Good to know:** Error codes are consistent across executions. You can filter logs or build alerts based on error codes.

---

#### error.message (string)

**What it means:** Human-readable error summary.

**Example:**
```json
"message": "Request validation failed"
```

Tells you generally what went wrong.

---

#### error.details (array)

**What it means:** Specific field-level errors. Each string describes one validation failure.

**Example:**
```json
"details": [
  "patient_email: required and must be valid email format",
  "patient_phone: must be 7-20 digits",
  "visit_date: cannot be in the future"
]
```

**How to fix:**
1. Read each detail line
2. Fix the corresponding field in your request
3. Retry the request

**Pro tip:** Copy error details into your bug tracker or notes. They tell you exactly what to fix.

---

#### error.trace_id (string)

**What it means:** Unique identifier for this error (starts with "ERR-" instead of "FU-").

**Why it matters:** Use this to search n8n logs for the failed execution.

---

### Quick Response Checklist

After triggering Module 05, check these fields in order:

1. **success** → Is it `true`? If no, read `error` and stop.
2. **trace_id** → Copy this! You'll need it for tracking.
3. **touches_sent** → Are expected touches listed? (day0_email, day0_sms)
4. **touch_results** → Do all show `"status": "sent"`? If any show "failed", investigate.
5. **execution_time_ms** → Is it <3000ms? If no, investigate performance.
6. **survey_link** → Does it have all parameters? Copy and test in browser.
7. **rebooking_link** → Does it have UTM parameters? Copy and test in browser.

**Time to verify:** ~30 seconds

---

## n8n Execution Logs

### What are n8n Execution Logs?

n8n execution logs show you the detailed flow of data through each node in the workflow. Think of it like a replay of the entire execution, node by node.

**Where to find them:**
1. Open n8n in your browser
2. Click "Executions" in the left sidebar
3. Click on a specific execution to see details

---

### Understanding the Execution List

When you click "Executions," you see a list like this:

```
┌────────────────────────────────────────────────────────────────┐
│ Executions                                                     │
├────────────────────────────────────────────────────────────────┤
│ ✅ Aigent Module 05: Followup & Retention    2 minutes ago    │
│ ✅ Aigent Module 05: Followup & Retention    15 minutes ago   │
│ ❌ Aigent Module 05: Followup & Retention    1 hour ago       │
│ ⏸️ Aigent Module 05: Followup & Retention    3 hours ago      │
└────────────────────────────────────────────────────────────────┘
```

**Status icons:**
- ✅ **Green checkmark:** Execution succeeded
- ❌ **Red X:** Execution failed
- ⏸️ **Pause icon:** Execution is waiting (at a Wait node)

**What to look for:**
- Recent executions should be successful (green)
- Failed executions (red) need investigation
- Waiting executions (pause) are expected for Day 3/7/14 delays

---

### Inside an Execution

Click on an execution to see the detailed view:

```
┌─────────────────────────────────────────────────────────────────┐
│ Aigent Module 05: Followup & Retention                         │
│ Started: 2025-10-30 14:00:00 | Finished: 2025-10-30 14:00:01   │
│ Duration: 1.2s | Status: Success                                │
└─────────────────────────────────────────────────────────────────┘

Node Flow:
  1. [✅] Webhook Trigger → Data received
  2. [✅] Enhanced Validation → Passed
  3. [✅] Validation Passed? → True
  4. [✅] Prepare Follow-Up Data → Links generated
  5. [✅] Prepare Day-0 Email → Email content ready
  6. [✅] API: Send Day-0 Email → Sent (202 Accepted)
  7. [✅] Prepare Day-0 SMS → SMS content ready
  8. [✅] Send SMS? → True (phone provided)
  9. [✅] API: Send Day-0 SMS → Sent (201 Created)
 10. [✅] Merge Day-0 Results → Combined
 11. [✅] Track Day-0 Touches → Recorded
 12. [⏸️] Wait 72 Hours → Paused
```

**Key information:**
- **Duration:** How long execution took (should be <3 seconds for Day-0)
- **Status:** Success/Error/Waiting
- **Node flow:** See which nodes executed and their status

---

### Examining Node Data

Click on any node to see its input and output data.

**Example: Click on "Prepare Follow-Up Data" node**

**Input (what the node received):**
```json
{
  "validated_data": {
    "patient_id": "12345",
    "patient_email": "jane.doe@example.com",
    "patient_phone": "+1-555-123-4567",
    "patient_name": "Jane Doe",
    "visit_type": "General Consultation",
    "visit_date": "2025-10-30T14:00:00Z",
    "provider_name": "Dr. Smith"
  }
}
```

**Output (what the node produced):**
```json
{
  "trace_id": "FU-1730300400000",
  "patient_id": "12345",
  "patient_email": "jane.doe@example.com",
  "patient_phone_normalized": "15551234567",
  "patient_phone_display": "+1-555-123-4567",
  "patient_name": "Jane Doe",
  "visit_type": "General Consultation",
  "survey_link": "https://example.com/survey?email=jane.doe%40example.com&patient_id=12345&trace_id=FU-1730300400000",
  "rebooking_link": "https://example.com/book?patient_id=12345&utm_source=followup&utm_medium=email&utm_campaign=day14_rebook&trace_id=FU-1730300400000"
}
```

**What to look for:**
- ✅ Input data is correct (matches what you sent)
- ✅ Output data includes new fields (trace_id, links)
- ✅ Phone normalization worked (`patient_phone_normalized` is E.164)
- ✅ Links include all required parameters

---

### Common Node Patterns

#### Validation Node (Node 502)

**Good output:**
```json
{
  "validation_passed": true,
  "validated_data": { ... }
}
```

**Bad output:**
```json
{
  "validation_passed": false,
  "errors": [
    "patient_email: required and must be valid email format"
  ]
}
```

**What to do if validation fails:**
- Read `errors` array
- Fix the fields mentioned
- Retry request

---

#### SendGrid Email Node (Node 508)

**Good output (HTTP 202):**
```json
{
  "statusCode": 202,
  "statusMessage": "Accepted"
}
```

SendGrid accepted the email for delivery. Check SendGrid Activity in 5-30 seconds to confirm delivery.

**Bad output (HTTP 400):**
```json
{
  "statusCode": 400,
  "error": "Invalid API key"
}
```

SendGrid API key is incorrect or expired. Fix in n8n credentials.

**Bad output (HTTP 403):**
```json
{
  "statusCode": 403,
  "error": "Sender not verified"
}
```

"From" email address not verified in SendGrid. Verify sender in SendGrid dashboard.

---

#### Twilio SMS Node (Node 511)

**Good output (HTTP 201):**
```json
{
  "sid": "SM123abc456def",
  "status": "queued",
  "to": "+15551234567",
  "from": "+15559998888",
  "body": "Hi Jane Doe, thank you for your visit..."
}
```

SMS queued for delivery. `sid` is the Twilio message ID — use it to track delivery in Twilio logs.

**Bad output (HTTP 400):**
```json
{
  "code": 21211,
  "message": "Invalid 'To' Phone Number"
}
```

Phone number format is invalid. Check phone normalization logic.

**Bad output (HTTP 401):**
```json
{
  "code": 20003,
  "message": "Authenticate"
}
```

Twilio credentials are incorrect. Fix in n8n credentials.

---

### n8n Observability Checklist

After each test, check n8n execution logs for:

- [ ] Execution status is "Success" (green checkmark)
- [ ] All nodes executed (no skipped nodes unexpectedly)
- [ ] Validation node output shows `"validation_passed": true`
- [ ] Prepare Follow-Up Data node output includes `trace_id`, `survey_link`, `rebooking_link`
- [ ] SendGrid node output shows HTTP 202
- [ ] Twilio node output shows HTTP 201 (if SMS sent)
- [ ] Wait node shows "Paused" status (expected)
- [ ] No error messages in any node

**Time to verify:** ~2 minutes

---

## SendGrid Email Activity

### What is SendGrid Activity?

SendGrid Activity is a dashboard that shows the delivery status of every email sent through your SendGrid account.

**Where to find it:**
1. Log into SendGrid dashboard
2. Click "Activity" in left sidebar
3. Filter by recipient, date, or subject

---

### Understanding SendGrid Activity

When you open Activity, you see a list of emails:

```
┌──────────────────────────────────────────────────────────────────┐
│ Email Activity                                                    │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Delivered  | jane.doe@example.com | Thank you for your visit │
│ ⏳ Processed | john.smith@example.com | Thank you for your visit│
│ ⛔ Bounced   | invalid@bad.com       | Thank you for your visit │
│ ⚠️ Deferred  | busy@server.com       | Thank you for your visit │
└──────────────────────────────────────────────────────────────────┘
```

**Status icons:**
- ✅ **Delivered:** Email successfully delivered to inbox
- ⏳ **Processed:** Email accepted by SendGrid, delivery pending
- ⛔ **Bounced:** Email rejected by recipient server
- ⚠️ **Deferred:** Delivery delayed (will retry)
- 🚫 **Dropped:** SendGrid refused to send (invalid recipient, spam, etc.)

---

### Email Status Deep Dive

#### ✅ Delivered

**What it means:** Email was accepted by the recipient's email server and (likely) placed in their inbox.

**Good sign!** This is what you want to see.

**What to check:**
- Delivery time (should be <10 seconds after sending)
- Opens (if open tracking enabled)
- Clicks (if click tracking enabled)

**Note:** "Delivered" means delivered to the server, not necessarily that the patient opened it. Check "Opens" for engagement.

---

#### ⏳ Processed

**What it means:** SendGrid accepted the email and is sending it to the recipient server.

**Normal during first 5-30 seconds.** Should change to "Delivered" soon.

**What to do:**
- Wait 30 seconds and refresh
- If still "Processed" after 2 minutes, investigate

**Possible causes if stuck:**
- Recipient server is slow to respond
- Temporary network issues
- High SendGrid volume

---

#### ⛔ Bounced

**What it means:** Recipient server rejected the email.

**This is a problem.** Email was not delivered.

**Bounce types:**
- **Hard Bounce:** Permanent failure (invalid email address, domain doesn't exist)
- **Soft Bounce:** Temporary failure (inbox full, server temporarily unavailable)

**What to do:**
1. Click on the email to see bounce reason
2. If hard bounce: Update patient email in your CRM (it's invalid)
3. If soft bounce: SendGrid will retry automatically

**Common bounce reasons:**
- "550 User unknown" → Email address doesn't exist
- "550 Mailbox full" → Patient's inbox is full
- "554 Rejected" → Recipient server thinks it's spam

---

#### ⚠️ Deferred

**What it means:** Recipient server asked SendGrid to try again later (temporary issue on their end).

**Normal in small amounts.** SendGrid will retry.

**What to do:**
- Wait 15-30 minutes
- Check back to see if it changed to "Delivered"
- If deferred for >2 hours, contact SendGrid support

---

#### 🚫 Dropped

**What it means:** SendGrid refused to send the email (before even trying).

**This is a problem.** Email was never sent.

**Common drop reasons:**
- Email address is on your suppression list (unsubscribed, bounced before)
- Email address is invalid format
- "From" address not verified
- Content flagged as spam

**What to do:**
1. Click on email to see drop reason
2. Fix the underlying issue
3. If patient unsubscribed, respect their choice (don't re-send)

---

### Checking Email Details

Click on any email in Activity to see full details:

```
┌──────────────────────────────────────────────────────────────────┐
│ Email Details                                                     │
├──────────────────────────────────────────────────────────────────┤
│ To: jane.doe@example.com                                         │
│ From: noreply@yourclinic.com                                     │
│ Subject: Thank you for your visit - Your Clinic                 │
│ Status: Delivered                                                │
│ Sent: 2025-10-30 14:00:00                                        │
│ Delivered: 2025-10-30 14:00:05 (5 seconds)                      │
│ Opened: Yes (2025-10-30 14:05:00)                                │
│ Clicked: No                                                      │
│                                                                   │
│ Events Timeline:                                                 │
│   14:00:00 - Processed                                           │
│   14:00:05 - Delivered                                           │
│   14:05:00 - Opened                                              │
└──────────────────────────────────────────────────────────────────┘
```

**What to look for:**
- ✅ Status: Delivered (green)
- ✅ Delivery time: <10 seconds
- ✅ Opened: Yes (patient engagement)
- ✅ No spam reports

---

### SendGrid Observability Checklist

After each test, check SendGrid Activity for:

- [ ] Email appears in Activity within 5 seconds
- [ ] Status is "Delivered" (green) within 30 seconds
- [ ] Recipient email matches test data
- [ ] Subject line is correct
- [ ] "From" address is correct
- [ ] No bounce or spam report
- [ ] (Optional) Email was opened

**Time to verify:** ~1 minute

---

## Twilio SMS Logs

### What are Twilio SMS Logs?

Twilio SMS Logs show the delivery status of every SMS message sent through your Twilio account.

**Where to find them:**
1. Log into Twilio console
2. Click "Messaging" → "Logs" → "Messages"
3. Filter by date, phone number, or status

---

### Understanding Twilio Message Status

When you open SMS Logs, you see a list of messages:

```
┌──────────────────────────────────────────────────────────────────┐
│ SMS Logs                                                         │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Delivered  | +15551234567 | "Hi Jane Doe, thank you..." | $0.0075 │
│ ⏳ Queued     | +15559876543 | "Hi John Smith, thank you..."| $0.0075 │
│ ⛔ Undelivered| +15551111111 | "Hi Test, thank you..."     | $0.0000 │
│ ❌ Failed     | +1234567     | "Hi Invalid, thank you..."  | $0.0000 │
└──────────────────────────────────────────────────────────────────┘
```

**Status icons:**
- ✅ **Delivered:** SMS successfully delivered to recipient's phone
- ⏳ **Queued:** SMS accepted by Twilio, delivery pending
- 📤 **Sent:** SMS sent to carrier, delivery pending confirmation
- ⛔ **Undelivered:** SMS could not be delivered (carrier rejection, invalid number)
- ❌ **Failed:** SMS failed to send (Twilio error)

---

### SMS Status Deep Dive

#### ✅ Delivered

**What it means:** SMS was delivered to the recipient's phone.

**Good sign!** This is what you want to see.

**What to check:**
- Delivery time (should be <30 seconds after sending)
- Price charged (usually $0.0075-$0.02 per SMS)
- Error code (should be blank)

---

#### ⏳ Queued / 📤 Sent

**What it means:** SMS is in the delivery pipeline.

**Normal during first 10-60 seconds.** Should change to "Delivered" soon.

**What to do:**
- Wait 60 seconds and refresh
- If still "Queued" after 5 minutes, investigate

---

#### ⛔ Undelivered

**What it means:** Carrier rejected the SMS or phone number is unreachable.

**This is a problem.** SMS was not delivered.

**What to do:**
1. Click on the message to see error code
2. Look up error code in Twilio documentation
3. Fix the underlying issue

**Common undelivered reasons:**
- Error 30003: Phone number unreachable
- Error 30004: Message blocked by carrier
- Error 30005: Unknown destination
- Error 30006: Landline or invalid number

---

#### ❌ Failed

**What it means:** Twilio couldn't send the SMS (before even trying carrier).

**This is a problem.** SMS was never sent.

**Common failure reasons:**
- Invalid phone number format
- Missing Twilio credentials
- Insufficient account balance
- "From" number not configured

**What to do:**
1. Check error code
2. Fix configuration issue
3. Retry sending

---

### Checking SMS Details

Click on any message in Twilio Logs to see full details:

```
┌──────────────────────────────────────────────────────────────────┐
│ SMS Details                                                       │
├──────────────────────────────────────────────────────────────────┤
│ SID: SM123abc456def789ghi                                        │
│ To: +15551234567                                                 │
│ From: +15559998888 (Your Twilio number)                          │
│ Body: "Hi Jane Doe, thank you for your visit to Your Clinic..." │
│ Status: Delivered                                                │
│ Price: $0.0075 USD                                               │
│ Direction: outbound-api                                          │
│ Error Code: (none)                                               │
│                                                                   │
│ Timeline:                                                        │
│   14:00:00 - Queued                                              │
│   14:00:02 - Sent                                                │
│   14:00:15 - Delivered                                           │
└──────────────────────────────────────────────────────────────────┘
```

**What to look for:**
- ✅ Status: Delivered
- ✅ Delivery time: <30 seconds
- ✅ No error code
- ✅ Price charged (confirms delivery)
- ✅ Message body is correct

---

### Twilio Observability Checklist

After each test, check Twilio SMS Logs for:

- [ ] SMS appears in logs within 10 seconds
- [ ] Status is "Delivered" (green) within 60 seconds
- [ ] Recipient phone number matches test data (E.164 format)
- [ ] "From" number is your Twilio number
- [ ] Message body is correct and personalized
- [ ] No error code
- [ ] Price charged (confirms sending)

**Time to verify:** ~1 minute

---

## Google Sheets Tracking

### What is Google Sheets Tracking?

If configured in your workflow, Module 05 logs every sequence execution to a Google Sheet for historical tracking and analytics.

**Where to find it:**
1. Open the configured Google Sheets spreadsheet
2. Go to the "Follow-Up Sequences" tab (or your configured tab name)
3. Look for new rows

---

### Understanding the Tracking Sheet

Your sheet should have columns like:

| timestamp | trace_id | patient_id | patient_email | sequence_status | touches_sent | execution_time_ms |
|-----------|----------|------------|---------------|-----------------|--------------|-------------------|
| 2025-10-30 14:00:00 | FU-1730300400000 | 12345 | jane.doe@... | initiated | day0_email, day0_sms | 1200 |
| 2025-10-30 14:05:00 | FU-1730300500000 | 12346 | john.smith@... | initiated | day0_email | 950 |

**What each column shows:**
- **timestamp:** When sequence started
- **trace_id:** Unique sequence identifier
- **patient_id:** Patient identifier
- **patient_email:** Patient email (for filtering)
- **sequence_status:** Current status (initiated, in_progress, completed)
- **touches_sent:** Which touches were sent
- **execution_time_ms:** Performance metric

---

### Google Sheets Observability Checklist

After each test, check Google Sheets for:

- [ ] New row appears within 15 seconds
- [ ] trace_id matches HTTP response
- [ ] patient_id is correct
- [ ] patient_email is correct
- [ ] sequence_status is "initiated"
- [ ] touches_sent lists expected touches
- [ ] execution_time_ms is reasonable (<3000)

**Time to verify:** ~30 seconds

---

## Wait Node Monitoring

### What are Wait Nodes?

Wait nodes pause the workflow execution for a specified time (72 hours for Day 3, 96 hours for Day 7, 168 hours for Day 14).

**Where to find them in n8n:**
1. Open workflow
2. Nodes 514, 522, 530 are Wait nodes

---

### Understanding Wait Node Behavior

**Key concept:** When execution reaches a Wait node, n8n PAUSES the execution and schedules a resume for later. The HTTP response is sent immediately (Day-0 response), and the sequence continues in the background.

**Example:**
1. You trigger sequence at 14:00 on Monday
2. Day-0 email/SMS sent immediately
3. HTTP response returned at 14:00:01
4. Execution pauses at "Wait 72 Hours" node
5. n8n schedules resume for Thursday 14:00
6. Thursday 14:00: Execution resumes, Day-3 email/SMS sent
7. Execution pauses at "Wait 96 Hours" node
8. And so on...

---

### Monitoring Waiting Executions

In n8n Executions list, waiting executions show a pause icon (⏸️).

**What to check:**
- [ ] Execution is in "Waiting" status (not failed)
- [ ] Wait node shows correct resume time
- [ ] No errors before reaching Wait node

**How to verify resume time:**
1. Click on waiting execution
2. Click on Wait node
3. Check "Resume at" timestamp

---

### Wait Node Observability Checklist

For multi-day sequence testing:

- [ ] Day-0 execution completes successfully
- [ ] Execution status changes to "Waiting" (pause icon)
- [ ] Wait node shows correct resume time (72 hours later)
- [ ] After 72 hours, execution resumes and sends Day-3 touches
- [ ] Execution status changes back to "Waiting" for Day-7
- [ ] After 168 hours (Day 7), execution resumes and sends Day-7 touches
- [ ] Execution status changes back to "Waiting" for Day-14
- [ ] After 336 hours (Day 14), execution resumes and sends Day-14 touch
- [ ] Execution status changes to "Success" (completed)

**Time to verify:** 14 days (or use manual resume for testing)

**Manual Resume (for testing):**

You can manually trigger wait node resume by calling the resume webhook:

```bash
curl -X POST https://your-n8n.com/webhook-waiting/module-05-wait-day3
```

See build_notes.md for details on manual resume testing.

---

## Observability Checklist

Use this checklist after every test to ensure complete verification:

### 1. HTTP Response ✅

- [ ] Response received within 3 seconds
- [ ] `success: true` (or expected error)
- [ ] `trace_id` copied for tracking
- [ ] `touches_sent` lists expected touches
- [ ] All `touch_results` show `"status": "sent"`
- [ ] `survey_link` includes all parameters
- [ ] `rebooking_link` includes UTM parameters
- [ ] `execution_time_ms` < 3000

**Time:** ~30 seconds

---

### 2. n8n Execution Log ✅

- [ ] Execution status is "Success" (green)
- [ ] All nodes executed successfully
- [ ] Validation node shows `validation_passed: true`
- [ ] Links generated correctly
- [ ] SendGrid node shows HTTP 202
- [ ] Twilio node shows HTTP 201 (if SMS)
- [ ] No unexpected errors

**Time:** ~2 minutes

---

### 3. SendGrid Activity ✅

- [ ] Email appears within 5 seconds
- [ ] Status is "Delivered" within 30 seconds
- [ ] Recipient email is correct
- [ ] Subject line is correct
- [ ] No bounce or spam report

**Time:** ~1 minute

---

### 4. Twilio SMS Logs ✅

- [ ] SMS appears within 10 seconds
- [ ] Status is "Delivered" within 60 seconds
- [ ] Recipient phone is correct (E.164 format)
- [ ] Message content is personalized
- [ ] No error codes

**Time:** ~1 minute

---

### 5. Google Sheets (if configured) ✅

- [ ] New row appears within 15 seconds
- [ ] trace_id matches
- [ ] All columns populated correctly

**Time:** ~30 seconds

---

**Total verification time:** ~5 minutes per test

---

## Common Observability Questions

### Q: How long should I wait to verify email delivery?

**A:** Check SendGrid Activity after 30 seconds. Most emails deliver within 5-10 seconds, but allow up to 30 seconds for slower recipient servers.

---

### Q: How long should I wait to verify SMS delivery?

**A:** Check Twilio Logs after 60 seconds. Most SMS deliver within 10-30 seconds, but carriers can take up to 1 minute.

---

### Q: What if HTTP response shows "sent" but SendGrid/Twilio shows "failed"?

**A:** The HTTP response indicates the API call succeeded, but actual delivery failed. This can happen if:
- Email address is invalid (SendGrid accepts it but can't deliver)
- Phone number is invalid (Twilio accepts it but carrier rejects)
- Recipient server rejects the message

**Always check SendGrid/Twilio to confirm actual delivery, not just API acceptance.**

---

### Q: How do I track a specific patient's sequence across all systems?

**A:** Use the `trace_id` from the HTTP response:
1. Search n8n executions for trace_id
2. Search Google Sheets for trace_id
3. Search survey responses for trace_id (if patient completed survey)
4. Search booking records for trace_id (if patient rebooked)

---

### Q: What if I see a waiting execution that's been waiting for days?

**A:** This is normal! Follow-up sequences wait 3, 7, and 14 days. Check:
- Execution is not in "Error" state (pause icon ⏸️ is expected)
- Wait node shows correct resume time
- n8n execution retention is set to >14 days

---

### Q: How can I test the full 14-day sequence without waiting 14 days?

**A:** Three options:
1. **Manual resume webhooks:** Manually trigger resume after checking Day-0 (see build_notes.md)
2. **Reduce wait times:** Temporarily change wait node durations to 1 minute for testing
3. **Trust the pattern:** If Day-0 works, Day 3/7/14 will work (same code pattern)

**Recommendation:** Test Day-0 thoroughly, then use manual resume to test one Day-3 execution, then trust the pattern for production.

---

## Pro Tips for Monitoring

### Tip 1: Create a Dashboard

Set up a simple dashboard with these metrics:
- Total sequences started today
- Email delivery rate (delivered / sent)
- SMS delivery rate (delivered / sent)
- Average execution time
- Error count

**Tools:** Google Data Studio, Grafana, or custom Google Sheet

---

### Tip 2: Set Up Alerts

Configure alerts for:
- Email delivery rate <90%
- SMS delivery rate <85%
- Execution time >3 seconds
- Any failed executions

**Tools:** Google Sheets + Apps Script, n8n error workflow, or monitoring service

---

### Tip 3: Use trace_id Everywhere

Always include `trace_id` in:
- Survey responses (already in link)
- Booking confirmations (already in link)
- Support tickets (add manually)
- CRM notes (add manually)

This creates end-to-end traceability from sequence start to patient action.

---

### Tip 4: Monitor SendGrid Sender Reputation

Weekly check:
- SendGrid → Settings → Sender Authentication
- Check spam report rate (<0.1%)
- Check bounce rate (<5%)
- Check unsubscribe rate (<1%)

Poor sender reputation = emails go to spam = lower engagement.

---

### Tip 5: Review Twilio Number Health

Monthly check:
- Twilio → Phone Numbers → Your Number → Insights
- Check spam flagging score
- Check carrier filtering status
- Check opt-out rate

Flagged numbers = SMS blocked by carriers = wasted costs.

---

## Observability Best Practices

### 1. Always Check Multiple Sources

**Never trust just HTTP response.** Always verify:
- HTTP response (API acceptance)
- SendGrid/Twilio (actual delivery)
- n8n logs (execution flow)

**Why:** API can accept a request but still fail to deliver. You need all three to confirm true success.

---

### 2. Use trace_id for Correlation

Every test should follow this pattern:
1. Trigger sequence
2. Copy `trace_id` from response
3. Search n8n logs for trace_id
4. Search SendGrid for recipient email
5. Search Twilio for recipient phone
6. Search Google Sheets for trace_id

This confirms data flow across all systems.

---

### 3. Document Failures

When you find a failure:
1. Copy full HTTP response
2. Screenshot n8n execution log
3. Screenshot SendGrid/Twilio error
4. Document in [Troubleshooting.md](Troubleshooting.md) or issue tracker

**Why:** Failures repeat. Documentation helps you (and your team) fix them faster next time.

---

### 4. Establish Baselines

After testing works correctly, document your "healthy" baselines:
- Email delivery rate: ____%
- SMS delivery rate: ____%
- Average execution time: ____ms
- Error rate: ____%

Compare future performance against baselines to detect degradation early.

---

### 5. Review Regularly

Schedule regular reviews:
- **Daily:** Check execution count, error count
- **Weekly:** Review delivery rates, performance metrics
- **Monthly:** Audit SendGrid/Twilio health, review costs

**Why:** Small problems compound. Early detection prevents major issues.

---

**End of Observability Guide**

For test procedures, see [TestPlan.md](TestPlan.md).

For troubleshooting specific issues, see [Troubleshooting.md](Troubleshooting.md).

For quick concept reference, see [KeyPoints.md](KeyPoints.md).
