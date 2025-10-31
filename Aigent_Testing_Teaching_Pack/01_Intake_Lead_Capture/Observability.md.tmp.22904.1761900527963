# Module 01: Intake & Lead Capture - Observability Guide

**Module:** 01 - Intake & Lead Capture
**Version:** 1.1.0-enhanced
**Last Updated:** 2025-10-31
**Audience:** Complete beginners

---

## What is "Observability"?

**Simple definition:** Observability means being able to **see what's happening** inside your system.

**Think of it like this:**
- You can't see inside a car engine while driving, BUT...
- The dashboard shows you: speed, fuel level, engine temperature, warning lights
- That's observability — making the invisible visible!

**For workflows:**
- You can't "see" data flowing through nodes, BUT...
- Logs, dashboards, and notifications show you: what data arrived, which nodes succeeded, how long it took, what errors occurred
- That's observability!

---

## Why Observability Matters

**Scenario 1: Everything Works**
- You submit a lead
- It silently saves to Google Sheets
- How do you know it worked?
- **Observability tells you:** "Lead L-20251031-001 captured in 2.3 seconds ✅"

**Scenario 2: Something Breaks**
- You submit a lead
- No response for 30 seconds
- **WITHOUT observability:** "Something's broken... no idea what!"
- **WITH observability:** "Node 'Write to Google Sheets' failed: Invalid credentials. Fix: Reconnect Google account."

**The difference:** Hours of frustrated debugging vs. 5-minute fix!

---

## Where to Look: The Observability Stack

Module 01 provides observability in **4 places:**

1. **HTTP Response** (immediate feedback)
2. **Google Sheets** (permanent record)
3. **Slack/Teams Notifications** (team alerts)
4. **n8n Execution Logs** (detailed debugging)

Let's explore each one:

---

## 1. HTTP Response (Immediate Feedback)

**What it is:** The JSON response you see immediately after submitting a lead

**Where to see it:**
- Terminal/command prompt (when using cURL)
- Browser developer console (when testing via webpage)
- Postman response pane

**What to look for:**

### Success Response

```json
{
  "status": "success",
  "message": "Lead captured successfully",
  "lead_id": "L-20251031-001",
  "execution_time_ms": 2341,
  "workflow_version": "1.1.0-enhanced"
}
```

**What each field tells you:**
- `status: "success"` ✅ Lead was processed correctly
- `message` → Human-readable confirmation
- `lead_id` → Unique identifier (use this in bug reports!)
- `execution_time_ms` → Performance metric (2341ms = 2.3 seconds)
- `workflow_version` → Which version of the workflow ran

**Performance interpretation:**
- **Fast:** < 2000ms (2 seconds) — great!
- **Normal:** 2000-5000ms — acceptable
- **Slow:** > 5000ms (5 seconds) — investigate
- **Very slow:** > 10000ms — performance problem

---

### Error Response

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "email is required",
    "phone number too short (minimum 7 digits)"
  ],
  "support_email": "support@yourdomain.com",
  "execution_time_ms": 45
}
```

**What each field tells you:**
- `status: "error"` ❌ Something went wrong
- `message` → High-level problem category
- `errors` → **Specific** issues (this is the most important field!)
- `support_email` → Who to contact for help
- `execution_time_ms` → How quickly the error was detected (45ms = almost instant)

**Error categories:**
- **Validation errors** → Your input data is wrong (fix it and retry)
- **Integration errors** → External service failed (Google Sheets, Slack, etc.)
- **System errors** → Workflow configuration problem (check environment variables)

---

## 2. Google Sheets (Permanent Record)

**What it is:** A spreadsheet where every lead is saved as a row

**Where to find it:**
1. Go to the URL in your `GOOGLE_SHEET_ID` environment variable
2. Click on the tab specified in `GOOGLE_SHEET_TAB` (usually "Leads")

**What you should see:**

### Column Headers

| Lead ID | Name | Email | Phone | Source | Message | UTM Source | UTM Medium | UTM Campaign | Lead Score | Created At | IP Address |
|---------|------|-------|-------|--------|---------|------------|------------|--------------|------------|------------|------------|

---

### Example Row

```
L-20251031-001 | Alice Anderson | alice.anderson.test@example.com | +15551234001 | website | I'm interested... | google | cpc | spring_2025 | 75 | 2025-10-31 14:23:45 | 192.168.1.100
```

---

### What to Look For

**✅ Good signs:**
- New row appears within 5-10 seconds of submission
- All fields populated correctly
- Phone number normalized to E.164 format (+1...)
- Lead score calculated (0-100)
- Timestamp accurate
- Lead ID is unique

**❌ Warning signs:**
- Row doesn't appear (integration failure — check n8n logs)
- Missing fields (workflow logic issue)
- Phone not normalized (normalization node failed)
- Duplicate Lead IDs (serious bug — report immediately!)
- Wrong timestamp (timezone misconfiguration)

---

### Using Google Sheets for Analysis

**Quick checks you can do:**

**1. Count today's leads:**
Filter "Created At" column for today's date

**2. Check lead quality:**
Sort by "Lead Score" column (high scores = better leads)

**3. Find leads from specific sources:**
Filter "Source" column (website, facebook, referral, etc.)

**4. Spot validation issues:**
Look for rows with empty required fields (shouldn't exist!)

**5. Verify phone normalization:**
All phone numbers should start with `+` and have no spaces/dashes

---

## 3. Slack/Teams Notifications (Team Alerts)

**What it is:** Real-time messages sent to your team channel for each new lead

**Where to see it:**
The channel specified in `NOTIFICATION_CHANNEL` (e.g., #leads, #new-patients)

**What a notification looks like:**

```
🎉 New Lead Received!

Name: Alice Anderson
Email: a***n@example.com
Phone: ***-***-4001
Source: website
Lead Score: 75/100
Message: I'm interested in scheduling a consultation next week.

Lead ID: L-20251031-001
Captured at: 2025-10-31 2:23 PM
```

---

### What to Look For

**✅ Good signs:**
- Notification appears within 5 seconds
- Email and phone are **masked** (privacy protection!)
- All important fields included
- Readable formatting
- Timestamp matches Google Sheets

**❌ Warning signs:**
- No notification (webhook failed — check URL)
- Notification delayed > 30 seconds (Slack API slowness)
- **Unmasked** email/phone (PHI exposure — security issue!)
- Garbled formatting (message template issue)

---

### PHI Masking Verification

**This is critical for HIPAA compliance!**

**What you should see (CORRECT):**
- `a***n@example.com` (first + last char + domain)
- `***-***-4001` (last 4 digits only)
- `192.168.x.x` (last two octets masked)

**What you should NEVER see (VIOLATION):**
- `alice.anderson.test@example.com` (full email exposed!)
- `+15551234001` (full phone number!)
- `192.168.1.100` (full IP address!)

**If you see unmasked data in notifications:**
1. **Stop testing immediately**
2. Report as critical security issue
3. Review PHI masking node in workflow
4. Verify `ENABLE_PHI_MASKING=true` in environment

---

### Notification Failures (Non-Blocking)

**Important:** Notification failures should **NOT** block lead capture!

**Test this:**
1. Temporarily disable Slack webhook (enter wrong URL)
2. Submit a test lead
3. Verify:
   - ✅ Lead still saves to Google Sheets
   - ✅ HTTP response still shows success
   - ❌ No Slack notification (expected)

**This is called "graceful degradation"** — notifications are nice to have, but not mission-critical.

---

## 4. n8n Execution Logs (Detailed Debugging)

**What it is:** Complete record of every workflow execution, node by node

**Where to find it:**
1. Open n8n in your browser
2. Click "Executions" in the left sidebar
3. You'll see a list of recent executions

**What you should see:**

### Execution List

```
[Green ✓] Aigent_Module_01... | 2025-10-31 2:23 PM | Success | 2.3s
[Green ✓] Aigent_Module_01... | 2025-10-31 2:20 PM | Success | 1.9s
[Red X]   Aigent_Module_01... | 2025-10-31 2:15 PM | Error   | 0.5s
```

**Color coding:**
- **Green ✓** = Success (all nodes completed)
- **Red X** = Error (at least one node failed)
- **Yellow ⚠** = Warning (some nodes failed but workflow continued)

---

### Viewing Execution Details

**Click on any execution to see:**

1. **Execution Overview:**
   - Start time
   - End time
   - Total duration
   - Status (success/error)

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

### How to Debug Using Logs

**Scenario: Lead submission failed**

**Step 1:** Open the failed execution (red X)

**Step 2:** Identify which node failed (will be highlighted in red)

**Step 3:** Click on the failed node

**Step 4:** Read the error message

**Common error patterns:**

**Error: "Invalid credentials"**
- **Node:** Google Sheets or HubSpot
- **Cause:** API credential expired or disconnected
- **Fix:** Reconnect credential in n8n

**Error: "404 Webhook not found"**
- **Node:** Slack/Teams webhook
- **Cause:** Wrong webhook URL
- **Fix:** Verify `NOTIFICATION_WEBHOOK_URL` is correct

**Error: "Required field missing"**
- **Node:** Validation node
- **Cause:** Input data missing required fields
- **Fix:** Check your test data (include name, email, phone)

**Error: "Timeout after 120000ms"**
- **Node:** Any external API call
- **Cause:** API is down or extremely slow
- **Fix:** Increase `WORKFLOW_TIMEOUT_MS` or check API status

---

### Execution Time Analysis

**Look at the execution time for each node to find bottlenecks:**

**Example execution breakdown:**
```
Webhook Trigger           45ms   (fast ✅)
Add Metadata             12ms   (fast ✅)
Validation               23ms   (fast ✅)
Parse Name              18ms   (fast ✅)
Normalize Phone         31ms   (fast ✅)
Calculate Lead Score    42ms   (fast ✅)
Write to Google Sheets  1850ms (slow ⚠️)
Send Notification       520ms  (normal ✅)
Total                   2541ms (acceptable ✅)
```

**Analysis:**
- Google Sheets is the slowest part (1.85 seconds)
- This is normal — external APIs are always slower than internal processing
- Total time < 5 seconds = acceptable performance

**If Google Sheets takes > 5 seconds:**
- Check Google Sheets API status
- Verify internet connection
- Consider reducing retry attempts

---

## Observability Checklist

Use this checklist after each test to verify observability is working:

### After Submitting a Test Lead

**HTTP Response:**
- [ ] Received immediate response (<5 seconds)
- [ ] Response includes `status` field
- [ ] Response includes `lead_id`
- [ ] Response includes `execution_time_ms`
- [ ] If error, response includes specific `errors` array

**Google Sheets:**
- [ ] New row appears within 10 seconds
- [ ] All fields populated correctly
- [ ] Phone number normalized to E.164
- [ ] Lead score calculated (0-100)
- [ ] Timestamp is accurate
- [ ] Lead ID matches HTTP response

**Slack/Teams Notification:**
- [ ] Notification appears within 5 seconds
- [ ] Email is **masked** (e.g., `a***n@example.com`)
- [ ] Phone is **masked** (e.g., `***-***-4001`)
- [ ] All expected fields present
- [ ] Readable formatting
- [ ] Timestamp matches

**n8n Execution Log:**
- [ ] Execution appears in list
- [ ] Status is "Success" (green)
- [ ] All nodes show green checkmarks
- [ ] Execution time < 5 seconds
- [ ] No error messages

**If ANY checkbox fails, investigate immediately!**

---

## Monitoring Dashboards (Optional)

**For production deployments, consider:**

### Google Sheets as a Dashboard

Create additional tabs with formulas:

**Tab: "Daily Summary"**
```
=COUNTIF(Leads!A:A, "*"&TEXT(TODAY(),"YYYYMMDD")&"*")
```
Shows count of today's leads

**Tab: "Source Breakdown"**
```
=COUNTIF(Leads!E:E, "website")
=COUNTIF(Leads!E:E, "facebook")
=COUNTIF(Leads!E:E, "referral")
```
Shows leads per source

**Tab: "Average Lead Score"**
```
=AVERAGE(Leads!J:J)
```
Shows overall lead quality

---

### n8n Workflow Statistics

**n8n automatically tracks:**
- Total executions
- Success rate
- Average execution time
- Error rate

**To view:**
1. Open the workflow
2. Click "Workflow" menu → "Settings" → "Statistics"

---

## Common Observability Questions

### Q: How long should I wait to see results?

**A:**
- HTTP response: Immediate (< 5 seconds)
- Google Sheets: 5-10 seconds
- Slack notification: 2-5 seconds
- n8n logs: Immediate

If longer than these times, something is slow or broken.

---

### Q: What if Google Sheets updates but no notification?

**A:** This is OK! Notifications are "nice to have" but non-blocking. The important thing is the lead was captured. Check:
1. Slack webhook URL is correct
2. Slack service is up (check status.slack.com)
3. Workflow has `continueOnFail: true` for notification node

---

### Q: What if I see a notification but no Google Sheets row?

**A:** This is BAD! It means:
1. Notification succeeded but data storage failed
2. Check n8n execution logs for Google Sheets errors
3. Verify Google Sheets credential is connected
4. Verify sheet isn't protected or read-only

This is a critical issue — data is being lost!

---

### Q: How do I know if PHI masking is working?

**A:** Check Slack/Teams notifications:
- Emails should look like `a***n@example.com`
- Phones should look like `***-***-4001`
- IPs should look like `192.168.x.x`

If you see FULL email/phone/IP in notifications, masking is broken — report immediately!

---

### Q: Can I see historical executions?

**A:** Yes! n8n keeps execution logs for a configurable time period (default: 30 days). Go to Executions → use date filter.

---

## Pro Tips

**1. Keep Google Sheets Open**
During testing, keep the Leads sheet open in a browser tab. Refresh after each test to see new rows appear in real-time.

**2. Use Multiple Monitors**
If possible, have:
- Monitor 1: Terminal (for running cURL commands)
- Monitor 2: Google Sheets + Slack
- Monitor 3: n8n Executions

**3. Create a Test Log**
Keep a simple text file noting:
```
2:23 PM - Submitted Alice Anderson - Lead ID: L-20251031-001 - Success
2:25 PM - Submitted Bob Builder - Lead ID: L-20251031-002 - Success
2:27 PM - Submitted Bad Email - Expected error - Got error ✓
```

**4. Use Browser DevTools**
If testing via web form:
- Open DevTools (F12)
- Go to Network tab
- Watch the webhook POST request
- See response in real-time

**5. Set Up Alerts for Failures**
In production, configure:
- Slack/Teams error notifications (separate channel!)
- Email alerts for critical failures
- Uptime monitoring (e.g., UptimeRobot, Pingdom)

---

## Observability Best Practices

**DO:**
- ✅ Check all 4 observability sources after each test
- ✅ Verify PHI masking in every notification
- ✅ Monitor execution times to catch performance degradation
- ✅ Review n8n logs when errors occur
- ✅ Keep Google Sheets data for historical analysis

**DON'T:**
- ❌ Rely on only one observability source
- ❌ Ignore slow execution times (they indicate problems)
- ❌ Delete Google Sheets data (you'll need it for troubleshooting)
- ❌ Expose full PHI in public channels
- ❌ Forget to check n8n logs after errors

---

## Summary

**Observability for Module 01 means checking:**

1. **HTTP Response** → Immediate feedback (success/error)
2. **Google Sheets** → Permanent record (all lead data)
3. **Slack/Teams** → Team alerts (with PHI masking)
4. **n8n Logs** → Detailed debugging (node-by-node view)

**After every test, verify:**
- ✅ All 4 sources show consistent data
- ✅ PHI is masked in notifications
- ✅ Execution time is acceptable (<5 seconds)
- ✅ No errors in logs

**If something's wrong:**
- Start with HTTP response (tells you success/error)
- Check n8n logs (tells you which node failed)
- Verify Google Sheets (tells you if data was saved)
- Review notifications (tells you if team was alerted)

---

**Next Steps:**
- Practice using all 4 observability sources during testing
- Set up your preferred monitoring dashboard
- Configure alerts for production deployments
- Read `Troubleshooting.md` for common issues

**Happy Observing!** 👀
