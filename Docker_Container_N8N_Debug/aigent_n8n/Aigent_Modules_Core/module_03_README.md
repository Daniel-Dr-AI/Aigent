# Module 03 Core: Telehealth Session

**Version:** core-1.0.0
**Branch:** Core (SMB-Ready, Non-PHI)
**Target Users:** Wellness coaches, therapists, counselors, fitness trainers, life coaches

---

## Purpose

Creates video meeting links for scheduled sessions and delivers them to clients. Supports Zoom, Google Meet, or mock API for testing. Designed for non-medical telehealth and remote coaching.

**NOT FOR:** Medical telehealth requiring HIPAA compliance (use Enterprise version)

---

## Features

✅ **Included (Core)**
- Video meeting creation (Zoom/Google Meet)
- Automatic meeting URL generation
- Meeting link delivery via email
- Google Sheets session logging
- Staff notifications (Slack/Teams)
- Trace ID tracking
- Mock mode for testing without video API
- Retry logic on meeting creation (2 attempts)
- Parallel notifications (non-blocking)

❌ **Removed (Enterprise Only)**
- HIPAA-compliant end-to-end encryption
- Waiting room queue management
- Session recording with audit trail
- PHI data masking
- Separate provider/patient URL security
- Post-session SOAP notes generation
- Attendance tracking
- Session duration monitoring
- Auto-recording management
- Rate limiting & duplicate prevention

---

## Data Flow

```
Webhook → Validate → Create Video Meeting → Extract URLs → [Sheets + Email + Notify] → Success
             ↓                                ↓
           Error                         No Meeting (500)
```

**Execution Time:** ~600ms average (vs ~1500ms Enterprise)

---

## Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `booking_id` | string | not empty |
| `patient_email` | string | contains @ |

**Optional Fields:**
- `scheduled_time` (ISO 8601, defaults to +1 hour from now)
- `duration_minutes` (number, defaults to 30)
- `patient_name` (string, used in email/meeting title)

---

## Setup Instructions

### 1. Import Workflow
- Import `module_03_core.json` to n8n

### 2. Choose Video Platform

**Option A: Zoom (Recommended)**

1. **Create Zoom Account:** https://zoom.us/signup
2. **Create JWT App (for API access):**
   - Go to https://marketplace.zoom.us/develop/create
   - Choose "JWT" app type (being deprecated, use OAuth 2.0 for production)
   - Note your API Key and Secret
3. **Get Zoom API Credentials:**
   - For OAuth 2.0: Follow https://marketplace.zoom.us/docs/guides/auth/oauth
   - Add Zoom OAuth2 credential in n8n
4. **Configure Workflow:**
   ```bash
   VIDEO_PLATFORM_API_URL="https://api.zoom.us/v2"
   VIDEO_PLATFORM_API_KEY="your-jwt-token-or-oauth-credential"
   ```

**Option B: Google Meet**

1. **Enable Google Calendar API** in Google Cloud Console
2. **Create OAuth2 Credentials**
3. **Add Google Calendar credential** to n8n
4. **Update "Create Video Meeting" node** to use Google Calendar API:
   ```
   POST https://www.googleapis.com/calendar/v3/calendars/primary/events
   Body: { conferenceData: { createRequest: {...} } }
   ```

**Option C: Mock API (Testing Only)**
```bash
# Uses httpbin for testing - returns fake meeting data
VIDEO_PLATFORM_API_URL="https://httpbin.org/anything"

# No API key needed for mock mode
# Replace with real platform before production!
```

### 3. Connect Google Sheets

Create sheet with columns:
```
timestamp | session_id | booking_id | meeting_id | patient_email | meeting_url | scheduled_start | duration_minutes | status
```

### 4. Set Variables

**Required:**
```bash
GOOGLE_SHEET_ID="your-sheet-id"
```

**Optional (Video Platform):**
```bash
VIDEO_PLATFORM_API_URL="https://api.zoom.us/v2"
VIDEO_PLATFORM_API_KEY="your-zoom-jwt-or-oauth-token"
```

**Optional (Notifications & Email):**
```bash
GOOGLE_SHEET_TAB="Sessions"
SENDGRID_FROM_EMAIL="sessions@yourbusiness.com"
NOTIFICATION_WEBHOOK_URL="https://hooks.slack.com/services/..."
CLINIC_NAME="Your Wellness Center"
CLINIC_PHONE="+1-555-123-4567"
```

### 5. Optional Integrations

**Enable Email Delivery:**
1. Add SendGrid credential in n8n
2. **Enable "Send Email with Meeting Link" node** (disabled by default)
3. Set `SENDGRID_FROM_EMAIL` variable
4. Customize email template in node

**Enable Staff Notifications:**
1. Create Slack/Teams incoming webhook
2. Set `NOTIFICATION_WEBHOOK_URL` variable
3. Notifications include meeting details

### 6. Test

```bash
curl -X POST https://your-n8n-instance/webhook/telehealth-session \
  -H 'Content-Type: application/json' \
  -d '{
    "booking_id": "BOOK-1730851234567",
    "patient_email": "patient@example.com",
    "patient_name": "Sarah Johnson",
    "scheduled_time": "2025-11-20T14:00:00Z",
    "duration_minutes": 60
  }'
```

### 7. Activate
- Toggle workflow to "Active"
- Test with mock API first, then switch to real platform
- Monitor execution logs for first few sessions

---

## Response Examples

### Success (200)
```json
{
  "success": true,
  "message": "Video session created successfully",
  "data": {
    "session_id": "SESSION-1730851234567",
    "meeting_id": "123-456-789",
    "meeting_url": "https://zoom.us/j/123456789?pwd=abc123",
    "scheduled_start": "2025-11-20T14:00:00Z",
    "duration_minutes": 60
  },
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Missing required fields: booking_id, patient_email",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Meeting Creation Failed (500)
```json
{
  "success": false,
  "error": "Failed to create video meeting. Please check API credentials.",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

---

## Video Platform Setup Details

### Zoom Setup (Recommended)

**Free Plan:** 100 participants, 40-minute limit
**Pro Plan:** $14.99/month, unlimited time

**API Setup:**
1. Create Zoom account at https://zoom.us/signup
2. Go to https://marketplace.zoom.us/develop/create
3. Create Server-to-Server OAuth app
4. Note Account ID, Client ID, Client Secret
5. Add Zoom credential to n8n with these values

**Meeting Creation:**
```javascript
POST /users/me/meetings
{
  "topic": "Session with {patient_name}",
  "type": 2,  // Scheduled meeting
  "start_time": "{scheduled_time}",
  "duration": {duration_minutes},
  "settings": {
    "join_before_host": true,
    "waiting_room": false  // Enterprise has true
  }
}
```

**Response:**
- `id` → meeting_id
- `join_url` → meeting_url (for patient)
- `start_url` → provider_url (not stored in Core)

### Google Meet Setup

**Requirements:**
- Google Workspace account (not free Gmail)
- Google Calendar API enabled

**API Setup:**
1. Enable Calendar API in GCP Console
2. Create OAuth 2.0 credentials
3. Add to n8n as "Google Calendar OAuth2"

**Meeting Creation:**
```javascript
POST /calendar/v3/calendars/primary/events?conferenceDataVersion=1
{
  "summary": "Session with {patient_name}",
  "start": { "dateTime": "{scheduled_time}" },
  "end": { "dateTime": "{calculated_end_time}" },
  "conferenceData": {
    "createRequest": { "requestId": "{unique_id}" }
  }
}
```

**Response:**
- `conferenceData.entryPoints[0].uri` → meeting_url

---

## Integration with Other Modules

### Module 02 (Consult Booking)

**Flow:** Booking (M02) → Session Creation (M03)

**Data Passed:**
```json
{
  "booking_id": "BOOK-1730851234567",
  "patient_email": "from M02",
  "patient_name": "from M02",
  "scheduled_time": "from M02 booking",
  "duration_minutes": "from service type"
}
```

**Automation Options:**
1. **Manual:** Staff creates sessions from booking confirmations
2. **Automated:** n8n workflow triggers M03 when M02 creates booking
3. **Scheduled:** Cron job creates sessions 1 hour before booking time

### Module 04 (Billing)

**Flow:** Session (M03) → Payment (M04)

**Data Passed:**
```json
{
  "booking_id": "links back to original booking",
  "customer_email": "patient_email",
  "amount": "session fee in cents",
  "description": "Video session on {date}"
}
```

### Module 08 (Messaging)

**Flow:** Session Created → Send Reminder

Use M08 to send SMS reminder 1 hour before session with meeting URL.

---

## Troubleshooting

### Meeting Creation Fails

**Issue:** "Failed to create video meeting"

**Solutions:**
1. **Check API credentials:**
   - Verify `VIDEO_PLATFORM_API_KEY` is set
   - Test credential independently (e.g., Postman)
   - Ensure OAuth token not expired
2. **Check API URL:**
   - Zoom: `https://api.zoom.us/v2`
   - Google Meet: `https://www.googleapis.com/calendar/v3`
3. **Review execution logs:**
   - Look for "Create Video Meeting" node output
   - Check HTTP status codes (401 = auth, 403 = permissions)
4. **Zoom-specific:**
   - Verify account can create meetings (not suspended)
   - Check rate limits (max 100 meetings/day on free plan)

### Email Not Sending

**Issue:** Meeting created but patient doesn't receive email

**Solutions:**
1. **Enable email node:**
   - "Send Email with Meeting Link" node is **disabled by default**
   - Click node → toggle to enabled
2. **Check SendGrid:**
   - Verify `SENDGRID_FROM_EMAIL` is set
   - Ensure email is verified sender in SendGrid
   - Check SendGrid activity logs
3. **Check email content:**
   - Verify `meeting_url` extracted correctly
   - Test with static URL first

### Google Sheets Not Updating

**Issue:** Sessions created but not logged

**Solutions:**
1. Verify `GOOGLE_SHEET_ID` is correct
2. Check sheet tab name matches `GOOGLE_SHEET_TAB` variable (default: "Sessions")
3. Ensure column headers match exactly (case-sensitive)
4. Review "Log to Google Sheets" node in execution logs

### Mock API Not Working

**Issue:** Using httpbin for testing but responses don't match

**Solutions:**
1. Mock API returns fake data - this is expected
2. "Extract Meeting URLs" node looks for `join_url` (Zoom format)
3. Update extraction logic for mock responses:
   ```javascript
   // Mock response has different structure
   meeting_url = $json.json.join_url || "https://mock-meeting.example.com/123"
   ```
4. Use mock mode only for workflow testing, not for real sessions

---

## Performance

| Metric | Core | Enterprise |
|--------|------|------------|
| Avg Execution | 600ms | 1500ms |
| P95 Execution | 1200ms | 3000ms |
| Nodes | 11 | 22 |
| API Calls | 1-2 | 4-6 |
| Features | Basic | HIPAA + Advanced |

**Why Faster?**
- No PHI masking overhead
- No waiting room setup
- No session recording configuration
- No attendance tracking
- Single meeting URL (not separate provider/patient URLs)

---

## Use Cases

### ✅ Perfect For
- Wellness coaching sessions
- Fitness training sessions
- Life coaching appointments
- Therapy/counseling (non-medical)
- Tutoring sessions
- Music lessons
- Career counseling
- Nutritionist consultations
- Spa consultation calls
- Personal styling sessions

### ❌ Not Suitable For
- Medical telehealth (use Enterprise)
- HIPAA-compliant appointments (use Enterprise)
- Sessions requiring recording (use Enterprise)
- Multi-participant group sessions (needs custom setup)
- Telehealth requiring waiting rooms (use Enterprise)

---

## Cost Analysis

### Video Platform Costs

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Zoom** | 40 min limit | $14.99/mo (Pro), $19.99/mo (Business) |
| **Google Meet** | 60 min limit (Workspace required) | $6-18/user/mo |
| **Mock API** | Free (testing only) | N/A |

### Supporting Services

| Service | Cost | Purpose |
|---------|------|---------|
| n8n Cloud | $20/month | Workflow hosting |
| Google Sheets | Free | Session logging |
| SendGrid | $19.95/month | Email delivery (optional) |
| **Total** | **$40-55/month** | (Zoom Pro + n8n + SendGrid) |

**Per-Session Cost:** ~$0.05 (for 1000 sessions/month)

---

## Upgrade to Enterprise

**When to Upgrade:**
- Need HIPAA compliance (medical telehealth)
- Need session recordings with audit trail
- Need waiting room management
- Need separate provider/patient URLs
- Need attendance tracking
- Need PHI data masking
- Need post-session notes/documentation

**Enterprise Additions:**
- ✅ HIPAA-compliant configuration
- ✅ Automatic session recording
- ✅ Waiting room with host approval
- ✅ Attendance logs
- ✅ Session duration monitoring
- ✅ Provider/patient URL separation
- ✅ PHI masking in notifications
- ✅ Integration with EHR systems

**Migration Steps:**
1. Export session logs from Core Sheets
2. Import `module_03_enterprise.json`
3. Configure additional variables (recording settings, etc.)
4. Update video platform settings (waiting room, recording)
5. Test in parallel with Core
6. Switch webhook URLs
7. Deactivate Core version

---

## Security Considerations

### Current Security Level: Basic

**Included:**
- ✅ HTTPS encryption (n8n enforces)
- ✅ Meeting passwords (if enabled in video platform)
- ✅ Email delivery only (no public sharing)
- ✅ Google Sheets access control

**Not Included (Enterprise Only):**
- ❌ PHI masking
- ❌ HIPAA compliance
- ❌ Waiting room security
- ❌ Session recording encryption
- ❌ Audit trail logging

**Recommendations:**
1. **Enable meeting passwords** in Zoom/Google Meet settings
2. **Restrict Google Sheets access** to authorized staff only
3. **Use verified email sender** for SendGrid
4. **Monitor session logs** for unusual activity
5. **Upgrade to Enterprise** if handling medical/sensitive sessions

---

## Compliance

### HIPAA Compliance: ❌ NOT COMPLIANT

**Core version is NOT suitable for:**
- Medical telehealth
- Mental health therapy (if PHI involved)
- Healthcare consultations
- Any PHI-containing video sessions

**Why Not Compliant:**
- No PHI masking in logs/notifications
- No Business Associate Agreements (BAA) enforcement
- No session encryption beyond platform defaults
- No audit trail for access
- No waiting room security

**For HIPAA Compliance:** Use Enterprise version with:
- ✅ BAA with video platform (Zoom Healthcare plan)
- ✅ BAA with n8n, SendGrid, Google
- ✅ PHI masking enabled
- ✅ Session recording with encryption
- ✅ Full audit trail

---

## Support

### Documentation
- **Core Guide:** This file
- **Zoom API Docs:** https://marketplace.zoom.us/docs/api-reference/zoom-api
- **Google Meet Docs:** https://developers.google.com/calendar/api/guides/create-events

### Community
- **Forum:** https://community.aigent.company
- **GitHub:** https://github.com/aigent/modules/issues
- **Discord:** https://discord.gg/aigent

---

## License

MIT License (Open Source)

---

**Version:** core-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 02: Consult Booking](module_02_README.md)
**Next Module:** [Module 04: Billing & Payments](module_04_README.md)
