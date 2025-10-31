# Bug Report Template

**Date:** [YYYY-MM-DD]
**Reporter:** [Your Name]
**Module:** [e.g., Module 01 - Intake & Lead Capture]
**Severity:** [Critical / High / Medium / Low]

---

## Bug Title
[One-sentence description of the problem]

**Example:** "Email confirmation not sent after booking appointment"

---

## Summary
[2-3 sentences describing what went wrong in plain language]

**Example:**
"When I tested booking an appointment using Alice Anderson (TEST-P-001), the workflow completed successfully and the appointment was added to Google Calendar. However, the patient did not receive a confirmation email. The SendGrid node showed a green checkmark, but no email arrived."

---

## Steps to Reproduce
[Numbered steps that someone else can follow to see the same problem]

**Example:**
1. Open Module 02 workflow in n8n
2. Click "Execute Workflow" button
3. Use test data from MockIdentities.json: Alice Anderson (TEST-P-001)
4. Select appointment time: Tomorrow at 2:00 PM
5. Click "Book Appointment"
6. Wait 5 minutes
7. Check alice.anderson.test@example.com inbox

---

## Expected Behavior
[What SHOULD have happened]

**Example:**
"Alice Anderson should receive a confirmation email within 1-2 minutes containing:
- Appointment date and time
- Provider name (Dr. Sarah Smith)
- Calendar link (.ics file)
- Cancellation/rescheduling link"

---

## Actual Behavior
[What ACTUALLY happened]

**Example:**
"No email was received. Checked spam folder - nothing there either. SendGrid dashboard shows zero sends for this time period."

---

## Test Data Used
[Which mock identity or data you used - so others can reproduce exactly]

**Example:**
```json
{
  "patient_id": "TEST-P-001",
  "first_name": "Alice",
  "last_name": "Anderson",
  "email": "alice.anderson.test@example.com",
  "phone": "+15551234001",
  "appointment_date": "2025-11-01",
  "appointment_time": "14:00",
  "provider_id": "TEST-PROV-001"
}
```

---

## Environment Details
[Information about your testing setup]

**n8n Version:** [e.g., 1.19.4]
**Workflow Version:** [e.g., 1.1.0-enhanced]
**Environment:** [Development / Staging / Production]
**Operating System:** [Windows / Mac / Linux]
**Browser (if relevant):** [Chrome / Firefox / Safari / Edge]

---

## Screenshots
[Attach or describe any relevant screenshots]

**Example:**
"Screenshot 1: SendGrid node showing green checkmark (success)"
"Screenshot 2: SendGrid dashboard showing 0 emails sent in last hour"
"Screenshot 3: n8n execution log showing 'Email sent successfully' message"

---

## Error Messages
[Copy exact error messages if any appeared]

**Example:**
```
No error messages displayed in n8n.
Console shows: "Execution #12345 completed successfully"
```

---

## Workflow Execution ID
[If available, the n8n execution ID for this specific run]

**Example:** `12345` (found in workflow execution history)

---

## What I've Already Tried
[List any troubleshooting steps you attempted]

**Example:**
- Checked SendGrid API key is correct (it is)
- Verified email address is valid (it is)
- Tested SendGrid connection using n8n test button (works)
- Tried with a different mock patient (Bob Builder, TEST-P-002) - same issue
- Checked SendGrid account status (active, no issues)

---

## Impact Assessment
[How does this bug affect real-world use?]

**Severity Definitions:**
- **Critical:** Prevents core functionality; data loss risk; security vulnerability
- **High:** Major feature doesn't work; no workaround available
- **Medium:** Feature works partially; workaround exists but inconvenient
- **Low:** Minor issue; cosmetic problem; easy workaround

**Example (High Severity):**
"If patients don't receive confirmation emails, they may forget their appointments or assume the booking failed. This directly impacts show rates and patient satisfaction. No automatic workaround exists."

---

## Suggested Fix (Optional)
[If you have ideas about what might be wrong]

**Example:**
"Check if the SENDGRID_FROM_EMAIL environment variable is verified in SendGrid. Unverified sender addresses are silently rejected."

---

## Additional Notes
[Any other relevant information]

**Example:**
"This worked correctly yesterday. Only change since then was updating the SendGrid API key. Old key was `sk_test_...`, new key is `sk_live_...`."

---

## Beginner's Checklist
[Before submitting, verify you've checked these common issues]

- [ ] I used mock data from MockIdentities.json (not real patient data)
- [ ] I checked the environment variables are set correctly (EnvMatrix.md)
- [ ] I verified credentials are connected in n8n
- [ ] I looked at the Troubleshooting.md file for this module
- [ ] I checked the workflow execution logs in n8n
- [ ] I waited enough time for the action to complete (sometimes APIs are slow)
- [ ] I checked spam/junk folders for emails
- [ ] I tried the test with at least two different mock identities
- [ ] I have screenshots or can reproduce this consistently
- [ ] I noted the exact time the bug occurred (helps with log searches)

---

## For System Administrator Use Only
[Leave this section blank - will be filled by technical team]

**Assigned To:** [Name]
**Priority:** [P0 / P1 / P2 / P3]
**Target Fix Date:** [YYYY-MM-DD]
**Status:** [New / Investigating / In Progress / Fixed / Won't Fix]
**Root Cause:** [To be filled after investigation]
**Fix Details:** [To be filled when resolved]
**Related Issues:** [Links to similar bugs if any]

---

## Example Bug Reports

### Example 1: Missing Error Handling (High Severity)

**Bug Title:** "Workflow crashes when HubSpot API is down"

**Summary:**
"During testing of Module 01, I intentionally disabled my HubSpot connection to test error handling. Instead of showing a graceful error message, the entire workflow crashed with a red 'ERROR' status. The lead data was lost and no notification was sent to staff."

**Steps to Reproduce:**
1. Open Module 01 workflow
2. Go to n8n Credentials
3. Temporarily disable HubSpot credential
4. Submit a test lead (Laura Lewis, TEST-L-001)
5. Observe workflow execution

**Expected Behavior:**
"Workflow should catch the HubSpot error, log it, send an error notification to staff, and save the lead data to Google Sheets as a fallback. Lead data should not be lost."

**Actual Behavior:**
"Workflow stopped at the HubSpot node with error: 'Invalid credentials'. No fallback behavior occurred. Lead data was not saved anywhere. No error notification sent."

**Impact:**
"If HubSpot goes down or credentials expire, all incoming leads are lost until someone manually notices and fixes the connection. This is a critical data loss scenario."

---

### Example 2: UI Display Issue (Low Severity)

**Bug Title:** "Patient name overflows in dashboard on mobile"

**Summary:**
"When viewing the Manager Dashboard (Module 10) on a mobile phone, patient names longer than 20 characters overflow out of their table cell and overlap with the next column."

**Steps to Reproduce:**
1. Open Manager Dashboard
2. Generate test data including edge case: Maximiliana Van Der Hoogenstraaten-Smythe-Worthington III
3. View dashboard on mobile device (iPhone 12, Safari)
4. Observe patient name in "Recent Bookings" table

**Expected Behavior:**
"Long names should wrap to a second line or be truncated with ellipsis (...)"

**Actual Behavior:**
"Name extends beyond table cell, overlapping the 'Appointment Time' column"

**Impact (Low):**
"Visual display issue only. Dashboard is still functional. Workaround: view on desktop/tablet."

---

### Example 3: Incorrect Calculation (Medium Severity)

**Bug Title:** "NPS score calculation includes non-survey responses"

**Summary:**
"Module 07 analytics dashboard is calculating NPS (Net Promoter Score) by including patients who never responded to the NPS survey. This inflates the denominator and makes the NPS score artificially low."

**Steps to Reproduce:**
1. Open Module 07 workflow
2. Generate analytics report for date range: 2025-10-01 to 2025-10-31
3. Look at NPS calculation
4. Compare to source data in Google Sheets

**Expected Behavior:**
"NPS should be calculated as: ((promoters - detractors) / total_respondents) × 100
Only count patients who actually answered the NPS question."

**Actual Behavior:**
"Formula is using total_patients in denominator instead of total_respondents
Example: 8 promoters, 2 detractors, 10 respondents, 20 total patients
Expected NPS: ((8-2)/10) × 100 = 60
Actual NPS: ((8-2)/20) × 100 = 30"

**Impact (Medium):**
"NPS metric is inaccurate, leading to incorrect business decisions. However, the data itself is not lost and can be recalculated manually."

---

## Tips for Writing Good Bug Reports

### DO:
✅ Be specific and detailed
✅ Include exact steps to reproduce
✅ Use mock data from MockIdentities.json
✅ Note the time and date
✅ Include screenshots when helpful
✅ Test with multiple mock identities to confirm
✅ Check if the issue is already in Troubleshooting.md

### DON'T:
❌ Use real patient data (even in bug reports!)
❌ Be vague ("it doesn't work")
❌ Skip the reproduction steps
❌ Forget to note which test data you used
❌ Report without checking environment variables first
❌ Assume you know the cause (unless you're certain)

---

## Severity Guidelines

### Critical (Fix Immediately)
- Data loss or corruption
- Security vulnerability (PHI exposure, etc.)
- System completely down
- Payment processing broken
- Compliance violation (HIPAA breach, etc.)

### High (Fix Within Days)
- Major feature doesn't work
- No workaround available
- Affects many users
- Blocks other testing

### Medium (Fix Within Weeks)
- Feature partially works
- Workaround exists
- Affects specific scenarios
- Incorrect calculations or logic

### Low (Fix When Possible)
- Cosmetic issues
- Minor UX problems
- Edge cases with easy workarounds
- Documentation typos

---

## Remember
- **Good bug reports save time** — clear reproduction steps mean faster fixes
- **Use mock data** — keeps everyone safe and compliant
- **Be patient** — complex bugs take time to investigate
- **Follow up** — check back to see if more information is needed

---

**Need help writing a bug report?**
Review the examples above or ask your team lead for guidance!

**Found a critical security issue?**
Contact your security team immediately: [security@yourorganization.com]
