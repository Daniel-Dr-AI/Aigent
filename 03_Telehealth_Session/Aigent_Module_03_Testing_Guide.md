# Aigent Module 03 - Testing & Validation Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] All environment variables configured in `.env` or n8n settings
- [ ] Telehealth platform credentials created and tested
- [ ] Telehealth platform BAA signed (HIPAA compliance)
- [ ] CRM credentials configured (HubSpot/Salesforce/Zoho)
- [ ] Twilio HIPAA-eligible account configured
- [ ] SendGrid credentials configured and sender verified
- [ ] Google Sheets logging sheet created with correct headers
- [ ] Workflow imported successfully
- [ ] Workflow activated (green toggle)
- [ ] Webhook URL copied and accessible

### Telehealth Platform Configuration
- [ ] Zoom: Account ID, Client ID, Client Secret added to credential
- [ ] Zoom: Scopes include `meeting:write:admin`, `meeting:read:admin`
- [ ] Zoom: HIPAA settings enabled (encryption, waiting room, password)
- [ ] Doxy.me: API key generated and added to credential
- [ ] Doxy.me: Clinic name configured correctly
- [ ] Test meeting created manually in platform to verify setup

### Service Verification
- [ ] Telehealth API tested independently (Postman/cURL)
- [ ] CRM contact update permissions verified
- [ ] Twilio SMS test sent successfully
- [ ] SendGrid email test sent successfully
- [ ] Google Sheets write access verified
- [ ] All credential scopes/permissions granted

---

## Test Cases

### Test 1: Valid Session Creation (End-to-End)

**Objective:** Verify complete workflow from appointment confirmation to session delivery

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "test_001",
    "patient_name": "Alice Johnson",
    "patient_email": "alice.johnson@example.com",
    "patient_phone": "+1-555-111-2222",
    "scheduled_time": "2025-11-05T14:00:00Z",
    "service_type": "General Consultation",
    "provider_name": "Dr. Smith",
    "contact_id": "12345"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Telehealth session created successfully",
  "session_id": "clinic-001_test_001_1730217600000",
  "session_link": "https://zoom.us/j/1234567890?pwd=abc123",
  "host_link": "https://zoom.us/s/1234567890?zak=xyz789",
  "session_password": "securePass123",
  "scheduled_time": "2025-11-05T14:00:00Z",
  "duration": 30,
  "patient_email": "alice.johnson@example.com",
  "provider": "Zoom",
  "metadata": {
    "crm_updated": true,
    "patient_sms_sent": true,
    "patient_email_sent": true,
    "provider_email_sent": true,
    "logged": true
  }
}
```

**Verification Steps:**
1. **Telehealth Platform:**
   - Check Zoom/Doxy.me dashboard
   - Verify meeting scheduled for Nov 5, 2025 at 2:00 PM
   - Confirm topic matches service type
   - Check security settings (waiting room, password enabled)

2. **Patient Notifications:**
   - Verify SMS received with join link and password
   - Verify email received with comprehensive instructions
   - Test patient join link (should redirect to Zoom/platform)
   - Verify session password shown in SMS and email

3. **Provider Notifications:**
   - Verify provider email received
   - Check host link present and different from patient link
   - Verify session credentials displayed

4. **CRM:**
   - Check contact (ID: 12345) in CRM
   - Verify `telehealth_status` = "SCHEDULED"
   - Verify `telehealth_link` contains session URL
   - Verify `telehealth_session_id` matches response

5. **Data Store:**
   - Check Google Sheets "Telehealth Sessions" tab
   - Verify new row with session details
   - Confirm all fields populated correctly

6. **n8n Execution Log:**
   - Review execution (should be green/successful)
   - Check each node executed successfully
   - Verify no error messages

**Pass Criteria:**
- HTTP 200 response
- `success: true` in response
- Session exists in telehealth platform
- All notifications delivered (SMS + 2 emails)
- CRM updated with session details
- Google Sheets row appended
- All links functional and unique

---

### Test 2: Appointment Not Confirmed (Validation Error)

**Objective:** Verify workflow rejects unconfirmed appointments

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": false,
    "appointment_id": "test_002",
    "patient_email": "bob.smith@example.com",
    "scheduled_time": "2025-11-06T10:00:00Z"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Appointment not confirmed or missing required data",
  "message": "Cannot create telehealth session for unconfirmed appointment. Required: appointment_id, patient_email, scheduled_time, appointment_confirmed=true",
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

**Verification Steps:**
1. Confirm HTTP 400 status code
2. Verify NO session created in telehealth platform
3. Verify NO notifications sent (SMS or email)
4. Verify NO CRM update
5. Check workflow execution stopped at validation node (Node 302)

**Pass Criteria:**
- HTTP 400 response
- `success: false` in response
- Error message indicates validation failure
- No session created
- No data persisted in any system

---

### Test 3: Missing Required Field (Patient Email)

**Objective:** Verify required field enforcement

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "test_003",
    "scheduled_time": "2025-11-07T15:00:00Z"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Appointment not confirmed or missing required data",
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

**Pass Criteria:**
- HTTP 400 response
- No session created
- Workflow stops at validation node

---

### Test 4: Integration with Module 02 Output

**Objective:** Verify workflow accepts Module 02 output format

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "success": true,
    "appointment_confirmed": true,
    "appointment_id": "cal_abc123",
    "patient_email": "charlie.davis@example.com",
    "patient_name": "Charlie Davis",
    "patient_phone": "+1-555-333-4444",
    "scheduled_time": "2025-11-08T11:00:00Z",
    "service_type": "Follow-up Consultation",
    "provider_name": "Dr. Wilson",
    "contact_id": "67890"
  }'
```

**Pass Criteria:**
- HTTP 200 response
- Session created successfully
- CRM contact (ID: 67890) updated (not new contact created)
- All fields from Module 02 preserved and used correctly

---

### Test 5: Session Link Functionality (Patient Join)

**Objective:** Verify patient can join session using link

**Setup:**
1. Complete Test 1 to create session
2. Extract `session_link` from response
3. Note `session_password` if required

**Test Steps:**
1. Open `session_link` in browser
2. If prompted, enter `session_password`
3. Attempt to join meeting

**Expected Behavior:**
- **If before scheduled time and `join_before_host` is false:**
  - Should show "Meeting has not started" or "Waiting for host"
  - Participant placed in waiting room (if enabled)

- **If within join window (10 min before to end time):**
  - Should enter waiting room (if enabled)
  - Or join directly if waiting room disabled

- **If after scheduled end time + buffer:**
  - Should show "Meeting has ended" or expired message

**Verification:**
- Patient view loads correctly
- Password accepted (if required)
- Waiting room functions (if enabled)
- No access before join window
- Link expires after session

**Pass Criteria:**
- Link redirects to correct platform (Zoom/Doxy.me)
- Password authentication works
- Security settings applied correctly
- Link expires appropriately

---

### Test 6: Session Link Functionality (Provider Host)

**Objective:** Verify provider can start session using host link

**Setup:**
1. Complete Test 1 to create session
2. Extract `host_link` from provider email
3. Provider must be logged into Zoom with correct account

**Test Steps:**
1. Open `host_link` in browser (or Zoom app)
2. Click "Start Meeting"
3. Verify host controls available

**Expected Behavior:**
- Provider can start meeting before scheduled time
- Host controls visible:
  - Admit from waiting room
  - Mute/unmute all
  - Start/stop recording
  - End meeting for all
- Meeting starts immediately without waiting

**Pass Criteria:**
- Host link opens meeting with elevated permissions
- Provider can control all meeting settings
- Can admit patients from waiting room
- Recording controls available (if enabled)

---

### Test 7: Security Settings Verification

**Objective:** Verify security settings applied correctly

**Configuration:**
```bash
ENABLE_WAITING_ROOM=true
REQUIRE_SESSION_PASSWORD=true
ALLOW_JOIN_BEFORE_HOST=false
ENABLE_E2E_ENCRYPTION=true
```

**Test Steps:**
1. Create session with security settings enabled
2. Test patient join experience
3. Check Zoom meeting settings

**Verification:**
1. **Waiting Room:**
   - Patient sees "Waiting for host to let you in"
   - Provider must manually admit

2. **Password:**
   - Password required to join
   - Matches password in SMS/email

3. **Join Before Host:**
   - Patient cannot enter until host starts
   - Shows "Meeting has not started" message

4. **Encryption:**
   - Zoom dashboard shows encryption enabled
   - Meeting indicator shows encrypted status

**Pass Criteria:**
- All security settings applied
- Waiting room functions correctly
- Password required and validated
- Host must start meeting first
- Encryption enabled (where supported)

---

### Test 8: SMS Deliverability Check

**Objective:** Verify SMS content and delivery

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "test_sms",
    "patient_name": "SMS Test Patient",
    "patient_email": "smstest@example.com",
    "patient_phone": "YOUR_REAL_PHONE_NUMBER",
    "scheduled_time": "2025-11-10T16:00:00Z",
    "service_type": "SMS Test",
    "provider_name": "Dr. Test"
  }'
```

**Verification Steps:**
1. **Check SMS Received:**
   - Arrives within 30 seconds
   - Sender ID shows clinic Twilio number

2. **Content Verification:**
   - Patient name (first name only)
   - Date formatted correctly (e.g., "Sun, Nov 10")
   - Time formatted correctly (e.g., "4:00 PM")
   - Provider name shown
   - Clickable join link
   - Password displayed (if required)
   - Instructions ("Join 5 min early", etc.)
   - Clinic phone for questions

3. **Link Functionality:**
   - Click link in SMS
   - Should open Zoom/platform in mobile app or browser
   - Password auto-filled or shown for manual entry

4. **Twilio Logs:**
   - Log in to Twilio console
   - Find message by SID (from response metadata)
   - Verify status: "delivered"
   - Check delivery time

**Pass Criteria:**
- SMS delivered within 30 seconds
- All dynamic content correct
- Link clickable on mobile
- Formatting readable
- No truncation or encoding issues

---

### Test 9: Email Deliverability and Rendering

**Objective:** Verify email content, deliverability, and rendering

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "test_email",
    "patient_name": "Email Test Patient",
    "patient_email": "YOUR_REAL_EMAIL@gmail.com",
    "patient_phone": "+15550000001",
    "scheduled_time": "2025-11-11T13:00:00Z",
    "service_type": "Email Test",
    "provider_name": "Dr. Email Test"
  }'
```

**Verification Steps:**

1. **Delivery Check:**
   - Email arrives in inbox (not spam folder)
   - From address shows clinic email
   - Subject line clear: "Your Telehealth Appointment - Nov 11, 2025"

2. **Content Verification:**
   - Patient first name in greeting
   - Formatted date/time with timezone
   - Provider name
   - Session duration
   - Platform name (Zoom/Doxy.me)
   - Large "Join Telehealth Appointment" button
   - Password displayed prominently (if required)
   - Pre-appointment checklist
   - Technical requirements section
   - Troubleshooting contact info
   - Session ID and appointment ID
   - HIPAA compliance notice

3. **HTML Rendering Test:**
   - Test in multiple email clients:
     - Gmail web
     - Outlook desktop
     - iOS Mail app
     - Android Gmail app
   - Verify:
     - Brand colors display correctly
     - Button clickable
     - No broken layout
     - Images load (if logo included)

4. **Link Functionality:**
   - Click "Join" button
   - Should open Zoom/platform in browser or app
   - Password accessible for copying

5. **SendGrid Logs:**
   - Check SendGrid activity feed
   - Verify status: "delivered"
   - Check open rate (if tracking enabled)
   - Check click rate on join button

**Spam Score Check:**
1. Forward email to mail-tester@mail-tester.com
2. Check score at [mail-tester.com](https://www.mail-tester.com)
3. Target score: 8/10 or higher

**Pass Criteria:**
- Email delivered to inbox (not spam)
- All dynamic content correct
- HTML renders correctly across email clients
- Button functional
- Spam score > 8/10
- Branding (colors, logo) displays correctly

---

### Test 10: Provider Email Notification

**Objective:** Verify provider receives email with host link

**Request:**
Same as Test 9, but check provider's email inbox

**Verification Steps:**
1. **Provider Email Content:**
   - Subject: "Telehealth Session Ready - Patient Name - Nov 11, 1:00 PM"
   - Patient name, date/time
   - Platform (Zoom)
   - "Start Telehealth Session (Host Link)" button
   - Session ID, meeting ID
   - Password (if required)
   - Patient contact email

2. **Host Link Functionality:**
   - Click "Start" button
   - Should open meeting with host permissions
   - Different URL than patient link

**Pass Criteria:**
- Provider email delivered
- Host link present and functional
- Session credentials displayed
- Link has elevated permissions

---

### Test 11: CRM Update Verification

**Objective:** Verify CRM contact updated with session details

**Setup:**
1. Ensure contact exists in CRM (ID: 12345)
2. Note current telehealth status (should be empty or previous value)

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "test_crm",
    "patient_name": "CRM Test",
    "patient_email": "crmtest@example.com",
    "scheduled_time": "2025-11-12T09:00:00Z",
    "contact_id": "12345"
  }'
```

**Verification Steps:**
1. Open CRM (HubSpot) contact (ID: 12345)
2. Check fields:
   - `telehealth_status` = "SCHEDULED"
   - `telehealth_link` = session join URL
   - `telehealth_session_id` = unique session ID
   - `telehealth_platform` = "Zoom" (or provider name)
   - `telehealth_scheduled_time` = "2025-11-12T09:00:00Z"
   - `last_telehealth_update` = current timestamp
   - `appointment_status` = "TELEHEALTH_READY"

**Pass Criteria:**
- All CRM fields updated correctly
- Existing contact modified (no duplicate created)
- Status progressed appropriately
- Session link accessible from CRM

---

### Test 12: Google Sheets Logging

**Objective:** Verify session details logged to Google Sheets

**Request:**
Same as Test 11

**Verification Steps:**
1. Open Google Sheet (ID from environment)
2. Navigate to "Telehealth Sessions" tab
3. Check latest row contains:
   - `timestamp` = current time
   - `session_id` = unique ID
   - `appointment_id` = "test_crm"
   - `platform_meeting_id` = Zoom meeting ID
   - `patient_name` = "CRM Test"
   - `patient_email` = "crmtest@example.com"
   - `provider_name` = provider from env or request
   - `scheduled_time` = "2025-11-12T09:00:00Z"
   - `duration` = 30 (or configured default)
   - `platform` = "Zoom"
   - `session_link` = patient join URL
   - `host_link` = provider start URL
   - `status` = "SCHEDULED"
   - `created_at` = timestamp

**Pass Criteria:**
- New row appended successfully
- All fields populated correctly
- No empty cells (except optional fields)
- Links functional when clicked from sheet

---

### Test 13: Session Without Phone Number (Email Only)

**Objective:** Verify workflow handles missing phone gracefully

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "test_no_phone",
    "patient_name": "No Phone Patient",
    "patient_email": "nophone@example.com",
    "scheduled_time": "2025-11-13T10:00:00Z"
  }'
```

**Expected Behavior:**
- Session created successfully
- Email sent
- SMS node skipped or fails gracefully
- Workflow continues to completion

**Verification:**
- Check response: `patient_sms_sent: false`
- Email still sent successfully
- n8n execution log shows SMS node error but workflow completes

**Pass Criteria:**
- HTTP 200 response
- Session created despite missing phone
- Email delivered
- SMS failure doesn't stop workflow

**Enhancement (Optional):**
Modify Node 302 to make phone optional in validation, or add error handling to SMS node.

---

### Test 14: Concurrent Session Creation

**Objective:** Verify workflow handles multiple simultaneous requests

**Method:** Apache Bench

```bash
# Create test payload
cat > telehealth_payload.json << EOF
{
  "appointment_confirmed": true,
  "appointment_id": "concurrent_test",
  "patient_name": "Concurrent Test",
  "patient_email": "concurrent@example.com",
  "patient_phone": "+15550000000",
  "scheduled_time": "2025-11-15T14:00:00Z"
}
EOF

# Execute 20 requests with 5 concurrent connections
ab -n 20 -c 5 -T 'application/json' \
  -p telehealth_payload.json \
  https://your-n8n.com/webhook/telehealth-session
```

**Expected Metrics:**
- **Mean response time:** < 5000ms
- **Success rate:** 100%
- **Failed requests:** 0

**Verification Steps:**
1. Check Apache Bench output for performance metrics
2. Review Zoom dashboard - should show 20 meetings created
3. Count Google Sheets rows - should have 20 new entries
4. Check CRM - contact updated (only one contact, updated 20 times)

**Pass Criteria:**
- All requests succeed
- Unique session created for each request
- No duplicate meeting IDs
- All notifications sent
- Performance meets targets

---

### Test 15: Error Recovery (Simulated Zoom API Failure)

**Objective:** Verify workflow error handling when telehealth API fails

**Setup:**
1. Temporarily invalidate Zoom credential (remove token or change client ID)

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "error_test",
    "patient_email": "errortest@example.com",
    "scheduled_time": "2025-11-16T12:00:00Z"
  }'
```

**Expected Behavior:**
- Workflow fails at Node 305 (Create Telehealth Session)
- Error handler (Node 314) catches error
- Execution log shows error details
- NO notifications sent (SMS, email)
- NO CRM update
- NO Google Sheets row

**Verification Steps:**
1. Check n8n execution log for red/failed status
2. Review error message - should indicate API authentication failure
3. Verify no partial data persistence
4. Check error handler node executed

**Pass Criteria:**
- Workflow fails gracefully (no crash)
- Error logged with clear message
- No partial session created
- Error handler node executed
- No notifications sent despite error

**Cleanup:**
- Restore valid Zoom credential

---

### Test 16: Platform-Specific Tests (Zoom)

**Objective:** Verify Zoom-specific features and settings

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "zoom_specific",
    "patient_email": "zoomtest@example.com",
    "scheduled_time": "2025-11-17T15:00:00Z"
  }'
```

**Zoom-Specific Verification:**
1. **Meeting Settings (in Zoom dashboard):**
   - Meeting type: Scheduled meeting (type 2)
   - Waiting room: Enabled
   - Require password: Enabled
   - Encryption: Enhanced encryption
   - Mute upon entry: Enabled
   - Join before host: Disabled
   - Auto recording: Cloud (if enabled in env) or None

2. **Join URL Format:**
   - Format: `https://zoom.us/j/{meetingId}?pwd={encryptedPassword}`
   - Meeting ID: 10-11 digit number
   - Password: Embedded in URL or separate parameter

3. **Host URL Format:**
   - Format: `https://zoom.us/s/{meetingId}?zak={hostKey}`
   - Contains host authentication key (zak)
   - Different from join URL

**Pass Criteria:**
- All Zoom settings applied from environment
- HIPAA compliance features enabled
- Meeting ID and password unique
- Host link has elevated permissions

---

### Test 17: Platform-Specific Tests (Doxy.me)

**Setup:**
1. Switch to Doxy.me configuration:
```bash
TELEHEALTH_PROVIDER_NAME=Doxy.me
TELEHEALTH_API_BASE_URL=https://api.doxy.me/api/v1
```

2. Modify Node 305 for Doxy.me API format (see README Configuration section)

**Request:**
Same as Test 16

**Doxy.me-Specific Verification:**
1. **Room Settings:**
   - Room name format: Matches session_id
   - PIN required: Enabled (if configured)
   - Waiting room: Enabled (if configured)

2. **Join URL Format:**
   - Format: `https://doxy.me/{clinic_name}/{room_name}`
   - Clinic name matches environment variable
   - Room name unique per session

3. **Host URL Format:**
   - Format: `https://doxy.me/{clinic_name}/{room_name}?provider=true`
   - Provider parameter enables host controls

**Pass Criteria:**
- Session created in Doxy.me
- Room accessible via URL
- PIN displayed in notifications (if required)
- Provider URL has elevated permissions

---

## Integration Tests

### Test 18: Module 02 → Module 03 Chain

**Objective:** Verify seamless integration between booking and telehealth modules

**Step 1: Create Appointment (Module 02)**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integration Test",
    "email": "integration@example.com",
    "phone": "+15551112222",
    "service_type": "Telehealth Consultation"
  }'
```

**Step 2: Extract Module 02 Response**
```json
{
  "success": true,
  "appointment_id": "cal_integration_123",
  "scheduled_time": "2025-11-18T10:00:00Z",
  ...
}
```

**Step 3: Automatically Trigger Module 03**
(If `AUTO_GENERATE_SESSION=true` in Module 02)

**OR Manually Trigger Module 03:**
```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "cal_integration_123",
    "patient_name": "Integration Test",
    "patient_email": "integration@example.com",
    "patient_phone": "+15551112222",
    "scheduled_time": "2025-11-18T10:00:00Z",
    "service_type": "Telehealth Consultation",
    "contact_id": "CONTACT_ID_FROM_MODULE_02"
  }'
```

**Verification:**
1. Check CRM - single contact with:
   - Appointment status from Module 02
   - Telehealth status from Module 03
   - Both appointment_id and session_id
2. Verify patient received:
   - Booking confirmation (Module 02)
   - Telehealth session link (Module 03)
3. Check Google Sheets:
   - Row in "Leads" tab (Module 01, if used)
   - Row in "Telehealth Sessions" tab (Module 03)

**Pass Criteria:**
- Single CRM contact (no duplicates)
- All statuses updated correctly
- Both confirmations delivered
- Data consistent across modules

---

## Automated Testing Setup

### GitHub Actions CI/CD

**.github/workflows/test-module-03.yml:**
```yaml
name: Test Aigent Module 03

on:
  push:
    paths:
      - 'Aigent_Module_03_Telehealth_Session.json'
  schedule:
    - cron: '0 */12 * * *' # Every 12 hours

jobs:
  test-telehealth-workflow:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Test valid session creation
        run: |
          response=$(curl -s -X POST ${{ secrets.N8N_TELEHEALTH_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{
              "appointment_confirmed": true,
              "appointment_id": "ci_test_'$(date +%s)'",
              "patient_email": "ci@example.com",
              "scheduled_time": "'$(date -u -d '+1 day' +%Y-%m-%dT%H:%M:%SZ)'"
            }')

          success=$(echo $response | jq -r '.success')
          if [ "$success" != "true" ]; then
            echo "Session creation test failed"
            echo $response
            exit 1
          fi

          # Verify session_id returned
          session_id=$(echo $response | jq -r '.session_id')
          if [ -z "$session_id" ] || [ "$session_id" == "null" ]; then
            echo "No session_id returned"
            exit 1
          fi

          # Verify session_link returned
          session_link=$(echo $response | jq -r '.session_link')
          if [ -z "$session_link" ] || [ "$session_link" == "null" ]; then
            echo "No session_link returned"
            exit 1
          fi

      - name: Test validation error (unconfirmed appointment)
        run: |
          http_code=$(curl -s -w "%{http_code}" -o /dev/null -X POST ${{ secrets.N8N_TELEHEALTH_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{
              "appointment_confirmed": false,
              "appointment_id": "ci_test_invalid",
              "patient_email": "invalid@example.com",
              "scheduled_time": "'$(date -u -d '+1 day' +%Y-%m-%dT%H:%M:%SZ)'"
            }')

          if [ "$http_code" != "400" ]; then
            echo "Validation test failed (expected 400, got $http_code)"
            exit 1
          fi

      - name: Verify Zoom meeting created
        run: |
          # Query Zoom API for recently created meetings
          meetings=$(curl -s https://api.zoom.us/v2/users/me/meetings \
            -H "Authorization: Bearer ${{ secrets.ZOOM_ACCESS_TOKEN }}")

          # Check if CI test meeting exists
          meeting_exists=$(echo $meetings | jq '[.meetings[].topic] | any(contains("ci_test"))')

          if [ "$meeting_exists" != "true" ]; then
            echo "Meeting not found in Zoom"
            exit 1
          fi

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Module 03 automated tests failed",
              "workflow": "${{ github.workflow }}",
              "status": "failure"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Performance Benchmarks

### Baseline Metrics (Single Execution)

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Validation Time | < 50ms | n8n execution log |
| Session Data Preparation | < 100ms | n8n execution log |
| Zoom API Call (Create Meeting) | < 2000ms | n8n execution log |
| Format Links | < 50ms | n8n execution log |
| CRM Update | < 500ms | n8n execution log |
| SMS Send | < 1000ms | n8n execution log |
| Email Send (Patient) | < 2000ms | n8n execution log |
| Email Send (Provider) | < 2000ms | n8n execution log |
| Google Sheets Log | < 1000ms | n8n execution log |
| **Total Execution** | **< 6000ms** | Webhook response time |

### Load Test Targets

| Scenario | Requests | Concurrency | Success Rate | Avg Response Time |
|----------|----------|-------------|--------------|-------------------|
| Light Load | 10/hour | 1 | 100% | < 4000ms |
| Medium Load | 30/hour | 3 | 100% | < 6000ms |
| Heavy Load | 60/hour | 5 | > 98% | < 8000ms |
| Peak Load | 100/hour | 10 | > 95% | < 10000ms |

**Note:** Zoom rate limits: 100 meetings per day per user. Plan accordingly for high-volume clinics.

---

## Monitoring & Health Checks

### Uptime Robot Configuration

**Monitor: Telehealth Endpoint Health**
- Type: HTTP(s)
- URL: `https://your-n8n.com/webhook/telehealth-session`
- Method: POST
- Headers: `Content-Type: application/json`
- Body (use future date):
  ```json
  {
    "appointment_confirmed": true,
    "appointment_id": "health_check",
    "patient_email": "healthcheck@example.com",
    "scheduled_time": "2026-01-01T12:00:00Z"
  }
  ```
- Interval: 30 minutes
- Alert: Email/SMS when down

**Note:** Use far-future date to avoid creating many test meetings in Zoom.

---

## Rollback Procedure

If critical issues arise in production:

1. **Immediate Deactivation:**
   - Toggle Module 03 workflow to "Inactive"
   - Module 02 will still create appointments but no telehealth links

2. **Manual Fallback:**
   - Create Zoom meetings manually for scheduled appointments
   - Email/SMS links manually to patients

3. **Identify Issue:**
   - Review recent executions for error patterns
   - Check Zoom API status page
   - Verify credentials still valid

4. **Fix and Test:**
   - Apply fix to workflow
   - Run all test cases in staging
   - Verify Zoom meetings created correctly

5. **Gradual Re-activation:**
   - Activate workflow during off-hours
   - Monitor first 5-10 executions closely
   - Verify links functional and notifications sent

6. **Backfill (If Needed):**
   - Identify appointments created during downtime without telehealth links
   - Manually trigger Module 03 for each using appointment data from CRM

---

## Sign-Off Checklist

Before deploying to production:

- [ ] All 18 test cases passed
- [ ] Load test met performance targets
- [ ] Zoom/Doxy.me/Amwell integration verified (meetings created correctly)
- [ ] Security settings applied (waiting room, password, encryption)
- [ ] CRM data verified for accuracy
- [ ] SMS confirmations received and tested
- [ ] Email confirmations received, tested across email clients
- [ ] Provider emails received with host links
- [ ] Session links functional and secure
- [ ] Google Sheets logging verified
- [ ] Error handling tested (API failures)
- [ ] Module 02 integration tested
- [ ] BAA signed with all HIPAA-relevant services (Zoom, Twilio, SendGrid)
- [ ] Environment variables documented
- [ ] Credentials secured (not in code/version control)
- [ ] Monitoring configured (Uptime Robot or equivalent)
- [ ] Rollback procedure documented and tested
- [ ] Staff trained on workflow and troubleshooting
- [ ] Patient-facing documentation updated (how to join telehealth)

---

**Testing completed by:** ___________________________
**Date:** ___________________________
**Production deployment approved by:** ___________________________
**Date:** ___________________________
