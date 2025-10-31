# Module 01: Intake & Lead Capture - Troubleshooting Guide

**Module:** 01 - Intake & Lead Capture
**Version:** 1.1.0-enhanced
**Last Updated:** 2025-10-31
**For:** Complete beginners

---

## How to Use This Guide

**When to use this:**
- A test failed and you don't know why
- You got an error message you don't understand
- Something works in testing but not in production
- Results are inconsistent or slow

**How to use this:**
1. Find your symptom in the Table of Contents
2. Read the likely causes
3. Try each solution step by step
4. Check if the problem is fixed
5. If not fixed, try the next solution

**Still stuck?** Use the Bug Report Template (`/00_Shared/BugReport_Template.md`)

---

## Table of Contents

1. [Webhook Issues](#webhook-issues)
2. [Validation Errors](#validation-errors)
3. [Google Sheets Problems](#google-sheets-problems)
4. [Notification Failures](#notification-failures)
5. [Performance Issues](#performance-issues)
6. [Data Quality Problems](#data-quality-problems)
7. [Security & PHI Masking](#security--phi-masking)
8. [Environment Variable Issues](#environment-variable-issues)
9. [n8n Workflow Problems](#n8n-workflow-problems)
10. [Integration Errors](#integration-errors)

---

## Webhook Issues

### Problem: "404 Not Found" when submitting lead

**Symptom:**
```
curl: (22) The requested URL returned error: 404
```

**Likely causes:**
1. Workflow is not active
2. Wrong webhook URL
3. Webhook path changed

**Solutions:**

**Solution 1: Activate the workflow**
1. Open n8n
2. Go to Workflows
3. Find "Aigent_Module_01..."
4. Toggle switch at top-right to ON (should turn blue/green)
5. Try your test again

**Solution 2: Verify webhook URL**
1. Open the workflow in n8n
2. Click on "Webhook Trigger" node (first node)
3. Copy the "Production URL" shown
4. Use that exact URL in your cURL command
5. Common mistake: Using test URL instead of production URL

**Solution 3: Check webhook path**
1. Verify `WEBHOOK_ID` environment variable
2. URL should match: `https://your-n8n.com/webhook/YOUR-WEBHOOK-ID`
3. If `WEBHOOK_ID` is empty, n8n generates a random one
4. Check the webhook node to see the actual path

---

### Problem: "CORS error" when testing from browser

**Symptom:**
```
Access to fetch has been blocked by CORS policy
```

**What this means:**
Your website is trying to send data to the webhook, but the webhook is blocking it for security reasons.

**Likely cause:**
`ALLOWED_ORIGINS` environment variable doesn't include your website domain

**Solution:**
1. Check current `ALLOWED_ORIGINS` value
2. Add your website domain:
   ```
   ALLOWED_ORIGINS=https://yourwebsite.com,https://www.yourwebsite.com
   ```
3. For testing, you can temporarily use:
   ```
   ALLOWED_ORIGINS=*
   ```
   (This allows ANY website — only use for testing!)
4. Restart workflow after changing environment variables

---

### Problem: Webhook times out after 30 seconds

**Symptom:**
```
Error: Request timeout after 30000ms
```

**Likely causes:**
1. External API is very slow (Google Sheets, HubSpot)
2. Network connectivity issues
3. Workflow timeout setting too low

**Solution 1: Increase timeout**
1. Set `WORKFLOW_TIMEOUT_MS=120000` (2 minutes)
2. Restart workflow
3. Try test again

**Solution 2: Check external API status**
1. Google Sheets: status.google.com
2. HubSpot: status.hubspot.com
3. Slack: status.slack.com
4. If any show outages, wait and retry later

**Solution 3: Simplify test**
1. Temporarily disable HubSpot integration
2. Test with just Google Sheets
3. If it works, the issue is HubSpot slowness
4. Enable HubSpot again and increase retry delay

---

## Validation Errors

### Problem: "email is required" but I sent an email!

**Symptom:**
```json
{
  "status": "error",
  "errors": ["email is required"]
}
```

**Likely causes:**
1. Field name is wrong (case-sensitive!)
2. Email is in nested object
3. JSON formatting error

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
  "user": {
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

---

### Problem: "invalid email format" for a valid email

**Symptom:**
```json
{
  "status": "error",
  "errors": ["invalid email format"]
}
```

**Your email looks valid but gets rejected**

**Common causes:**

**1. Extra spaces**
```json
❌ WRONG: "email": " test@example.com"  (space before)
❌ WRONG: "email": "test@example.com "  (space after)
✅ RIGHT: "email": "test@example.com"
```

**2. International domain without proper encoding**
```json
❌ WRONG: "test@cañón.com"  (special chars in domain)
✅ RIGHT: "test@xn--caon-8na.com"  (punycode encoding)
```

**3. Missing TLD**
```json
❌ WRONG: "test@company"
✅ RIGHT: "test@company.com"
```

**Solution:** Copy/paste the email exactly from MockIdentities.json to avoid typos

---

### Problem: Phone validation fails for international numbers

**Symptom:**
```json
{
  "errors": ["phone number too short (minimum 7 digits)"]
}
```

**Your phone:** `+81312345678` (11 digits total)

**Cause:** Validation counts ONLY digits, not the `+` symbol

**Solution:**
International numbers are supported! The error means:
1. Check that your phone has at least 7 digits (not counting + or country code)
2. Verify format: `+[country code][number]`
3. Examples:
   - ✅ US: `+15551234567`
   - ✅ Japan: `+81312345678`
   - ✅ UK: `+442071234567`

---

## Google Sheets Problems

### Problem: No row appears in Google Sheets

**Symptom:**
- HTTP response shows success
- Slack notification sent
- But no row in Google Sheets

**This is a serious issue — data is being lost!**

**Solutions:**

**Solution 1: Verify sheet ID and tab name**
1. Check `GOOGLE_SHEET_ID` in environment variables
2. Open that sheet in browser
3. Verify tab name matches `GOOGLE_SHEET_TAB`
4. Tab names are case-sensitive!

**Solution 2: Check Google Sheets credential**
1. In n8n, go to Credentials
2. Find your Google Sheets credential
3. Click "Test" button
4. If it fails, reconnect:
   - Click "Reconnect"
   - Sign in with Google
   - Grant permissions
   - Save credential

**Solution 3: Check sheet permissions**
1. Open Google Sheet
2. Click "Share" button
3. Verify the Google account used in n8n credential has Editor access
4. If not, add that email address with Editor permission

**Solution 4: Check for sheet protection**
1. In Google Sheets, go to Data → Protected sheets and ranges
2. If the sheet is protected, either:
   - Remove protection, OR
   - Add the n8n service account to allowed editors

**Solution 5: Review n8n execution log**
1. Go to n8n → Executions
2. Find the execution
3. Click on "Google Sheets" node
4. Read the error message
5. Common errors:
   - `401 Unauthorized` → Reconnect credential
   - `404 Not Found` → Wrong sheet ID
   - `403 Forbidden` → No write permission

---

### Problem: Duplicate rows appear

**Symptom:**
Same lead appears 2 or 3 times in Google Sheets

**Causes:**
1. You submitted the same test multiple times (user error — this is normal in testing!)
2. Retry logic triggered (network hiccup, legitimate retry)
3. Bug in idempotency logic (rare)

**Solutions:**

**Solution 1: Expected behavior in testing**
- Each webhook submission creates a new row
- If you run the same cURL command 3 times, you'll get 3 rows
- This is correct behavior!
- Use different test data for each test (see MockIdentities.json)

**Solution 2: Check Lead IDs**
1. If Lead IDs are different (L-20251031-001, L-20251031-002), these are DIFFERENT submissions (not duplicates)
2. If Lead IDs are the SAME, this is a bug — report it!

**Solution 3: For production (not testing)**
- Implement deduplication in your intake form (prevent double-clicks)
- Use Lead ID to track which leads have been processed
- This module intentionally does NOT deduplicate (business decision)

---

### Problem: Wrong data in Google Sheets

**Symptom:**
Row exists but data doesn't match what you sent

**Check these:**

**1. Phone normalization (expected!)**
- You sent: `(555) 123-4567`
- Sheets shows: `+15551234567`
- This is CORRECT — phone normalization is working!

**2. Name parsing**
- You sent: `name: "Alice Anderson"`
- Sheets shows: First Name: Alice, Last Name: Anderson
- This is CORRECT — name parsing is working!

**3. Missing optional fields**
- You sent only: name, email, phone
- Sheets shows empty cells for: source, message, UTM fields
- This is CORRECT — optional fields are optional!

**4. Lead score calculation**
- You sent complete data
- Sheets shows: Lead Score: 75
- This is CORRECT — lead score is calculated automatically!

**If data is genuinely wrong:**
1. Check the webhook INPUT in n8n execution log
2. Trace data through each node
3. Find where transformation occurs
4. Report as a bug (see BugReport_Template.md)

---

## Notification Failures

### Problem: No Slack/Teams notification

**Symptom:**
- Lead saved to Google Sheets ✅
- HTTP response shows success ✅
- But no Slack/Teams message ❌

**This is OK in testing — notifications are "nice to have" but not critical**

**Solutions:**

**Solution 1: Verify webhook URL**
1. Check `NOTIFICATION_WEBHOOK_URL` environment variable
2. Test the webhook independently:
   ```bash
   curl -X POST YOUR_SLACK_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"text":"Test from troubleshooting guide"}'
   ```
3. If you see the message in Slack, the URL is correct

**Solution 2: Check Slack/Teams service status**
1. Slack: status.slack.com
2. Teams: status.office365.com
3. If there's an outage, wait and try later

**Solution 3: Verify channel exists**
1. Open Slack/Teams
2. Find the channel specified in `NOTIFICATION_CHANNEL`
3. If it doesn't exist, create it OR change environment variable

**Solution 4: Check continueOnFail setting**
1. Open workflow in n8n
2. Click on Slack notification node
3. Go to Settings tab
4. Verify "Continue On Fail" is enabled (should be!)
5. This ensures notification failures don't block lead capture

---

### Problem: Notification shows unmasked PHI

**Symptom:**
Slack message shows full email `alice.anderson.test@example.com` instead of `a***n@example.com`

**THIS IS A CRITICAL SECURITY ISSUE!**

**Solution:**

**1. Verify PHI masking is enabled**
```
ENABLE_PHI_MASKING=true
```

**2. Check the masking node**
1. Open workflow in n8n
2. Find node "PHI Masking for Logs" or similar
3. Verify it's between data processing and notification
4. Check the masking logic is correct

**3. If in production, STOP IMMEDIATELY**
1. Disable the workflow
2. Delete any messages with exposed PHI
3. Report as critical security incident
4. Do NOT re-enable until masking is confirmed working

---

## Performance Issues

### Problem: Execution takes > 10 seconds

**Symptom:**
`execution_time_ms: 15000` or higher

**Target:** < 5000ms (5 seconds)

**Likely causes:**
1. Google Sheets API is slow
2. HubSpot API is slow
3. Network latency
4. Multiple retries happening

**Solutions:**

**Solution 1: Check individual node times**
1. Open execution in n8n
2. Look at execution time for each node
3. Find the slowest node
4. Common slow nodes:
   - Google Sheets: 500-2000ms (normal)
   - HubSpot: 500-1500ms (normal)
   - Slack: 200-500ms (normal)
   - If any node > 5000ms, that's the problem

**Solution 2: Reduce retry attempts**
```
CRM_RETRY_COUNT=2  (instead of 3)
DATASTORE_RETRY_COUNT=1  (instead of 2)
```
Fewer retries = faster failures

**Solution 3: Check network**
1. Test internet speed: fast.com
2. If slow (<10 Mbps), network is the bottleneck
3. Try from different network/location

**Solution 4: Check external API status**
See "Webhook times out" section above

---

### Problem: Workflow times out after 2 minutes

**Symptom:**
```
Execution timed out after 120000ms
```

**Solution:**
1. Increase timeout:
   ```
   WORKFLOW_TIMEOUT_MS=300000  (5 minutes)
   ```
2. Restart workflow
3. This is a band-aid — investigate why it's so slow!
4. See "Execution takes > 10 seconds" above

---

## Data Quality Problems

### Problem: Lead score is always 0

**Symptom:**
Every lead in Google Sheets shows Lead Score: 0

**Causes:**
1. Lead scoring node not running
2. Logic error in scoring calculation
3. Missing required fields for scoring

**Solutions:**

**Solution 1: Verify lead scoring is enabled**
```
ENABLE_LEAD_SCORING=true
```

**Solution 2: Check execution log**
1. Open execution in n8n
2. Find "Calculate Lead Score" node
3. Check if it executed (green checkmark)
4. Click on it and view output data
5. Should show `lead_score: [number]`

**Solution 3: Provide more data**
Lead score is based on data completeness:
- Name only: ~20 points
- Name + email + phone: ~40 points
- All fields + UTM data: ~75-80 points

Test with complete data from TC-HP-001

---

### Problem: Phone numbers not normalized

**Symptom:**
Google Sheets shows `(555) 123-4567` instead of `+15551234567`

**Causes:**
1. Phone normalization disabled
2. Normalization node not running
3. Logic error in normalization

**Solutions:**

**Solution 1: Enable phone normalization**
```
ENABLE_PHONE_NORMALIZATION=true
```

**Solution 2: Check execution log**
1. Find "Normalize Phone" node
2. Verify it executed
3. Check input vs. output
4. Input: `(555) 123-4567`
5. Output should be: `+15551234567`

**Solution 3: Verify phone format**
Normalization works for:
- `555-123-4567`
- `(555) 123-4567`
- `555.123.4567`
- `555 123 4567`
- `+15551234567` (already normalized)

Does NOT work for:
- `123` (too short)
- `abcd` (not a number)

---

## Security & PHI Masking

### Problem: Full email visible in Slack

**See "Notification shows unmasked PHI" above**

**THIS IS CRITICAL — fix immediately!**

---

### Problem: IP addresses not masked in logs

**Symptom:**
Logs show `192.168.1.100` instead of `192.168.x.x`

**Solution:**
1. Verify `ENABLE_IP_TRACKING=true` (to track IPs)
2. AND `ENABLE_PHI_MASKING=true` (to mask them in logs)
3. Check IP masking logic in workflow
4. IP masking should only apply to logs/notifications, NOT Google Sheets

---

## Environment Variable Issues

### Problem: "undefined" appears in data

**Symptom:**
Google Sheets shows: Source: undefined

**Cause:**
Environment variable is referenced but not set

**Solution:**
1. Check which field shows "undefined"
2. Find corresponding environment variable
3. Set it in your n8n environment
4. Common missing variables:
   - `NOTIFICATION_WEBHOOK_URL`
   - `HUBSPOT_CREDENTIAL_ID`
   - `GOOGLE_SHEET_TAB`

**How to set environment variables:**
- Docker: Add to docker-compose.yml
- n8n Cloud: Settings → Environment Variables
- Self-hosted: Export in shell before starting n8n

---

### Problem: Changes to .env file don't take effect

**Symptom:**
You changed `GOOGLE_SHEET_TAB=Leads` to `GOOGLE_SHEET_TAB=Test_Leads` but data still goes to old tab

**Cause:**
n8n caches environment variables

**Solution:**
1. After changing .env file, RESTART n8n:
   - Docker: `docker-compose restart`
   - PM2: `pm2 restart n8n`
   - Direct: Stop and start n8n process
2. Verify change took effect:
   - In workflow, check `{{$env.GOOGLE_SHEET_TAB}}`
   - Should show new value

---

## n8n Workflow Problems

### Problem: Workflow won't activate

**Symptom:**
Toggle switch doesn't turn on, or immediately turns off

**Causes:**
1. Webhook conflict (another workflow uses same path)
2. Missing required credentials
3. Syntax error in expression

**Solutions:**

**Solution 1: Check for webhook conflicts**
1. Go to n8n → Workflows
2. Search for workflows with webhook triggers
3. Check if any use the same path
4. Change `WEBHOOK_ID` to make it unique

**Solution 2: Verify all credentials**
1. Open workflow
2. Look for nodes with red credential warnings
3. Connect each credential
4. Test each credential

**Solution 3: Check for errors**
1. Look at bottom of n8n screen for error messages
2. Click on any red error indicators
3. Fix the reported issue

---

### Problem: Can't see execution data

**Symptom:**
Open execution, but all nodes show "No data"

**Cause:**
`SAVE_EXECUTION_DATA` is set to `none` or `onlyOnError`

**Solution:**
1. Set environment variable:
   ```
   SAVE_EXECUTION_DATA=all
   ```
2. Restart n8n
3. Run a new test
4. Execution data should now be visible

---

## Integration Errors

### Problem: HubSpot sync fails

**Symptom:**
```
Error: Invalid credentials (HubSpot)
```

**Solutions:**

**Solution 1: Reconnect HubSpot**
1. n8n → Credentials
2. Find HubSpot credential
3. Click "Reconnect"
4. Sign in to HubSpot
5. Grant permissions
6. Test credential

**Solution 2: Verify API key/OAuth**
1. If using API key, check it's still valid in HubSpot
2. If using OAuth, token may have expired (reconnect)
3. Check HubSpot account status (not suspended)

**Solution 3: Disable HubSpot temporarily**
1. Remove or disable HubSpot node in workflow
2. Test with just Google Sheets
3. Once working, re-enable HubSpot

---

## Still Stuck?

**If you've tried everything and it still doesn't work:**

1. **Document the problem** using `/00_Shared/BugReport_Template.md`

2. **Gather this information:**
   - Exact error message
   - Test data used (from MockIdentities.json)
   - n8n execution ID
   - Screenshots of error
   - What you've already tried

3. **Check these resources:**
   - n8n documentation: docs.n8n.io
   - n8n community forum: community.n8n.io
   - Google Sheets API status: status.google.com
   - HubSpot API status: status.hubspot.com
   - Slack API status: status.slack.com

4. **Get help:**
   - Team lead or technical support
   - n8n community forum
   - Module build notes: `module_01_build_notes.md`

---

## Quick Reference: Error Codes

| Error Code | Meaning | Common Fix |
|------------|---------|------------|
| 400 Bad Request | Invalid input data | Check validation errors in response |
| 401 Unauthorized | Invalid credentials | Reconnect credential in n8n |
| 403 Forbidden | No permission | Check Google Sheets sharing settings |
| 404 Not Found | Webhook doesn't exist | Activate workflow |
| 429 Too Many Requests | Rate limit hit | Slow down, wait a minute |
| 500 Internal Server Error | Something broke in workflow | Check n8n execution logs |
| 503 Service Unavailable | External API down | Check status pages, try later |

---

**Remember:** Testing is about finding problems! Finding bugs means the testing is working! 🐛🔍
