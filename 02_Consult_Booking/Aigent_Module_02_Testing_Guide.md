# Aigent Module 02 - Testing & Validation Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] All environment variables configured in `.env` or n8n settings
- [ ] Scheduling system API credentials created and tested
- [ ] CRM credentials configured (HubSpot/Salesforce/Zoho)
- [ ] Twilio credentials configured and phone number verified
- [ ] SendGrid credentials configured and sender email verified
- [ ] Workflow imported successfully
- [ ] Workflow activated (green toggle)
- [ ] Webhook URL copied and accessible

### Scheduling System Configuration
- [ ] Event type created in scheduling system
- [ ] Event type ID added to environment variables
- [ ] Availability windows configured (business hours)
- [ ] Timezone correctly set
- [ ] Test booking created manually to verify setup

### Service Verification
- [ ] Scheduling API tested independently (Postman/cURL)
- [ ] CRM contact update permissions verified
- [ ] Twilio SMS test sent successfully
- [ ] SendGrid email test sent successfully
- [ ] All credential scopes/permissions granted

---

## Test Cases

### Test 1: Valid Booking with Preferred Time

**Objective:** Verify end-to-end workflow with patient's preferred date/time

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "phone": "+1-555-111-2222",
    "service_type": "General Consultation",
    "preferred_date": "2025-11-05",
    "preferred_time": "14:00",
    "notes": "First-time patient",
    "contact_id": "12345"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment_id": "cal_abc123",
  "patient_email": "alice.johnson@example.com",
  "patient_name": "Alice Johnson",
  "scheduled_time": "2025-11-05T14:00:00.000Z",
  "scheduled_time_formatted": "Tuesday, November 5, 2025 at 2:00 PM",
  "service_type": "General Consultation",
  "channel": "Cal.com",
  "metadata": {
    "crm_updated": true,
    "sms_sent": true,
    "email_sent": true
  }
}
```

**Verification Steps:**
1. Check scheduling system for new appointment at 2:00 PM on Nov 5
2. Verify patient received SMS confirmation
3. Verify patient received email confirmation with calendar invite
4. Check CRM contact (ID: 12345) - status should be "SCHEDULED"
5. Review n8n execution log (should be green/successful)

**Pass Criteria:**
- HTTP 200 response
- `success: true` in response
- Appointment exists in scheduling system at correct time
- SMS delivered (check Twilio logs)
- Email delivered (check SendGrid activity)
- CRM contact updated with appointment_status, appointment_date, appointment_id

---

### Test 2: Booking Without Preferred Time (Next Available)

**Objective:** Verify workflow suggests next available slot when preference not specified

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith",
    "email": "bob.smith@example.com",
    "phone": "+1-555-222-3333",
    "service_type": "Follow-up Consultation"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "appointment_id": "cal_xyz789",
  "scheduled_time": "2025-10-30T09:00:00.000Z",
  "scheduled_time_formatted": "Wednesday, October 30, 2025 at 9:00 AM"
}
```

**Verification Steps:**
1. Confirm scheduled_time is within next 7 days
2. Verify appointment is first available slot in scheduling system
3. Check confirmations sent with correct auto-selected time

**Pass Criteria:**
- HTTP 200 response
- Appointment booked at first available slot
- All confirmations sent successfully
- Time is reasonable (within business hours, not immediate/same-day unless enabled)

---

### Test 3: Invalid Email Format

**Objective:** Verify email validation

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Davis",
    "email": "invalid-email",
    "phone": "+1-555-444-5555",
    "service_type": "Urgent Care"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing or invalid required fields: email, name, phone, service_type",
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

**Verification Steps:**
1. Confirm HTTP 400 status code
2. Verify NO appointment created in scheduling system
3. Verify NO SMS or email sent
4. Verify NO CRM update

**Pass Criteria:**
- HTTP 400 response
- `success: false` in response
- Error message indicates validation failure
- No data persisted in any system
- Workflow execution stops at validation node (Node 202)

---

### Test 4: Missing Required Field (Service Type)

**Objective:** Verify required field enforcement

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Diana Prince",
    "email": "diana.prince@example.com",
    "phone": "+1-555-666-7777"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing or invalid required fields: email, name, phone, service_type",
  "timestamp": "2025-10-29T14:35:00.000Z"
}
```

**Pass Criteria:**
- HTTP 400 response
- No appointment created
- Workflow stops at validation node

---

### Test 5: No Available Slots (Fully Booked)

**Objective:** Verify handling when scheduling system has no availability

**Setup:**
1. Temporarily set `SCHEDULING_EVENT_TYPE_ID` to a fully-booked event type, OR
2. Request date far in future beyond configured availability

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Eve Wilson",
    "email": "eve.wilson@example.com",
    "phone": "+1-555-888-9999",
    "service_type": "General Consultation",
    "preferred_date": "2026-12-31"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "No available appointments",
  "message": "No time slots available in the requested timeframe. Please try alternative dates.",
  "retry_after": "2027-01-07T00:00:00.000Z",
  "alternatives": [],
  "contact_info": {
    "phone": "+1 (555) 123-4567",
    "email": "info@yourclinic.com"
  },
  "timestamp": "2025-10-29T14:40:00.000Z"
}
```

**Verification Steps:**
1. Confirm HTTP 409 (Conflict) status code
2. Verify `retry_after` date is provided
3. Check clinic contact info included
4. Verify no appointment created

**Pass Criteria:**
- HTTP 409 response
- Error includes actionable next steps (retry date, contact info)
- No partial booking or confirmations sent
- Workflow reaches Node 213 (No Availability Error)

---

### Test 6: Integration with Module 01 Output

**Objective:** Verify workflow accepts Module 01 output format

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "67890",
    "name": "Frank Miller",
    "email": "frank.miller@example.com",
    "phone": "+1-555-999-0000",
    "service_type": "General Inquiry",
    "referral_source": "Google Ads"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "appointment_id": "cal_def456",
  "metadata": {
    "crm_updated": true
  }
}
```

**Verification Steps:**
1. Verify appointment created successfully
2. Check CRM contact (ID: 67890) updated (not new contact created)
3. Confirm referral_source metadata passed through to booking

**Pass Criteria:**
- HTTP 200 response
- Existing CRM contact updated (verify by contact_id)
- Metadata includes referral attribution

---

### Test 7: Phone Number Format Variations

**Objective:** Verify workflow accepts various phone formats

**Test Cases:**
```bash
# US format with dashes
curl -X POST https://your-n8n.com/webhook/consult-booking -H "Content-Type: application/json" \
  -d '{"name":"Test 1","email":"test1@example.com","phone":"555-123-4567","service_type":"Test"}'

# US format with parentheses
curl -X POST https://your-n8n.com/webhook/consult-booking -H "Content-Type: application/json" \
  -d '{"name":"Test 2","email":"test2@example.com","phone":"(555) 123-4567","service_type":"Test"}'

# International format (E.164)
curl -X POST https://your-n8n.com/webhook/consult-booking -H "Content-Type: application/json" \
  -d '{"name":"Test 3","email":"test3@example.com","phone":"+44 20 7946 0958","service_type":"Test"}'

# Numeric only (10 digits)
curl -X POST https://your-n8n.com/webhook/consult-booking -H "Content-Type: application/json" \
  -d '{"name":"Test 4","email":"test4@example.com","phone":"5551234567","service_type":"Test"}'
```

**Pass Criteria:**
- All variations accepted (validation only checks non-empty)
- SMS delivery successful for all formats (Twilio auto-normalizes)
- Phone stored as submitted in CRM

**Note:** If SMS delivery fails for non-E.164 formats, add phone normalization in Node 202:

```javascript
// Normalize phone to E.164
const phone = $json.body.phone.replace(/\D/g, ''); // Remove non-digits
const normalizedPhone = phone.startsWith('1') ? `+${phone}` : `+1${phone}`;
```

---

### Test 8: Special Characters in Name and Notes

**Objective:** Verify handling of special characters and international names

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "José García-Hernández",
    "email": "jose.garcia@example.com",
    "phone": "+34-612-345-678",
    "service_type": "Consulta General",
    "notes": "Preferencia: idioma español. Alergias: penicilina."
  }'
```

**Pass Criteria:**
- HTTP 200 response
- Name stored correctly with accents and hyphens
- Notes field preserved with special characters
- SMS and email display special characters correctly

---

### Test 9: Booking Close to Preferred Time (Closest Match)

**Objective:** Verify slot selection algorithm finds closest available time

**Setup:**
1. Request preferred_time: 14:00 (2:00 PM)
2. Assume 14:00 slot is unavailable
3. Available slots: 13:30, 14:30, 15:00

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grace Lee",
    "email": "grace.lee@example.com",
    "phone": "+1-555-100-2000",
    "service_type": "Follow-up",
    "preferred_date": "2025-11-06",
    "preferred_time": "14:00"
  }'
```

**Expected Behavior:**
- Algorithm selects 14:30 (closest to 14:00)

**Verification Steps:**
1. Check scheduled_time in response
2. Verify it's the closest available slot to preferred_time
3. Confirm appointment created at that time

**Pass Criteria:**
- Closest available slot selected (14:30, not 13:30 or 15:00)
- Response includes alternatives in metadata (optional enhancement)

---

### Test 10: CRM Update Without Contact ID

**Objective:** Verify workflow behavior when contact_id is missing

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Henry Ford",
    "email": "henry.ford@example.com",
    "phone": "+1-555-200-3000",
    "service_type": "New Patient Consultation"
  }'
```

**Expected Behavior:**
- Workflow completes successfully
- CRM update fails gracefully (contact ID required for update)
- OR creates new CRM contact (if workflow modified for this)

**Verification Steps:**
1. Check response - should be HTTP 200
2. Review n8n execution log - Node 207 may show error but workflow continues
3. Verify appointment still created
4. Confirm SMS and email sent despite CRM error

**Pass Criteria:**
- HTTP 200 response (booking successful)
- `crm_updated: false` in metadata
- SMS and email still sent
- Workflow does not crash

**Enhancement (Optional):**
Modify Node 207 to search for contact by email if contact_id missing:

```javascript
// If no contact_id, search by email
if (!$('Webhook Trigger - Booking Request').first().json.body.contact_id) {
  const contact = await $http.get(`https://api.hubapi.com/contacts/v1/contact/email/${email}/profile`);
  return contact.vid; // Use found contact ID
}
```

---

### Test 11: Concurrent Bookings (Race Condition)

**Objective:** Verify workflow handles simultaneous requests for same time slot

**Method:** Apache Bench with identical payloads

```bash
# Create test payload
echo '{
  "name": "Concurrent Test",
  "email": "concurrent@example.com",
  "phone": "+1-555-000-0000",
  "service_type": "Test",
  "preferred_date": "2025-11-10",
  "preferred_time": "10:00"
}' > concurrent_payload.json

# Execute 5 requests simultaneously
ab -n 5 -c 5 -T 'application/json' \
  -p concurrent_payload.json \
  https://your-n8n.com/webhook/consult-booking
```

**Expected Behavior:**
- First request succeeds, books 10:00 slot
- Subsequent requests receive different slot (10:30, 11:00, etc.) OR no-availability error

**Verification Steps:**
1. Check Apache Bench output - count successful (200) vs. failed (409) responses
2. Review scheduling system - should show 1-5 appointments (depending on availability)
3. Verify no double-bookings at same time

**Pass Criteria:**
- No appointments overlap (same time slot)
- Each successful response has unique appointment_id
- Error rate acceptable (< 20% if limited slots)

**Note:** True race condition prevention requires locking mechanism in scheduling system

---

### Test 12: Email Deliverability Check

**Objective:** Verify email passes spam filters and renders correctly

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spam Test",
    "email": "YOUR_REAL_EMAIL@gmail.com",
    "phone": "+1-555-000-0001",
    "service_type": "Email Test"
  }'
```

**Verification Steps:**
1. Check inbox (not spam folder)
2. Verify sender name displays as clinic name
3. Test links (reschedule URL)
4. Check HTML rendering in multiple clients:
   - Gmail web
   - Outlook desktop
   - iOS Mail app
   - Android Gmail app
5. Verify calendar invite attachment (if enabled)

**Pass Criteria:**
- Email arrives in inbox (not spam)
- HTML renders correctly across all email clients
- All dynamic values populated (name, date, time, etc.)
- Links functional
- Calendar invite opens in calendar app
- Branding (colors, logo) displays correctly

**Spam Score Check:**
Use [Mail-Tester.com](https://www.mail-tester.com):
1. Send test booking to provided email address
2. Check spam score (target: 8/10 or higher)
3. Review issues flagged by Mail Tester

---

### Test 13: SMS Deliverability Check

**Objective:** Verify SMS delivery and content

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SMS Test",
    "email": "smstest@example.com",
    "phone": "YOUR_REAL_PHONE_NUMBER",
    "service_type": "SMS Test"
  }'
```

**Verification Steps:**
1. Check SMS received on phone
2. Verify sender ID displays correctly (clinic Twilio number)
3. Test message length (< 160 characters or segmented correctly)
4. Check special characters render correctly
5. Verify links clickable (if included)

**Pass Criteria:**
- SMS delivered within 30 seconds
- All dynamic content correct (name, date, time, booking ID)
- Formatting readable (line breaks preserved)
- Sender ID recognizable

**Twilio Logs Check:**
1. Log in to Twilio console
2. Navigate to **Messaging** → **Logs**
3. Find message by SID (from response metadata)
4. Verify status: "delivered"
5. Check delivery time and any errors

---

### Test 14: Error Recovery (Simulated Scheduling API Failure)

**Objective:** Verify workflow error handling when scheduling system is unavailable

**Setup:**
1. Temporarily invalidate scheduling API credential (remove API key) OR
2. Set `SCHEDULING_API_BASE_URL` to invalid URL

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Error Test",
    "email": "error@example.com",
    "phone": "+1-555-000-0002",
    "service_type": "Error Test"
  }'
```

**Expected Behavior:**
- Workflow execution fails at Node 204 (Check Scheduling Availability)
- Error handler (Node 214) catches error
- Execution log shows error details

**Verification Steps:**
1. Check n8n execution log for red/failed status
2. Verify error message indicates API authentication/connection failure
3. Confirm NO confirmations sent (SMS, email)
4. Verify NO CRM update

**Pass Criteria:**
- Workflow fails gracefully (no crash)
- Error logged with clear message
- No partial data persistence
- Error handler node executed

**Cleanup:**
- Restore valid scheduling API credential

---

### Test 15: Load Test (High Volume Bookings)

**Objective:** Verify workflow handles high concurrent booking volume

**Method:** Apache Bench with realistic booking data

```bash
# Create test payload with dynamic data
cat > load_test_payload.json << EOF
{
  "name": "Load Test User",
  "email": "loadtest@example.com",
  "phone": "+1-555-000-0000",
  "service_type": "Load Test"
}
EOF

# Execute 200 requests with 20 concurrent connections
ab -n 200 -c 20 -T 'application/json' \
  -p load_test_payload.json \
  https://your-n8n.com/webhook/consult-booking
```

**Expected Metrics:**
- **Mean response time:** < 3000ms
- **Success rate:** > 95%
- **Failed requests:** < 10

**Verification Steps:**
1. Review Apache Bench output for performance metrics
2. Check n8n execution history (should show 200 executions)
3. Count successful appointments in scheduling system
4. Verify CRM contact count matches successful bookings
5. Check Twilio/SendGrid logs for delivery status

**Pass Criteria:**
- 95% of requests complete within 5 seconds
- Error rate < 5%
- No scheduling system rate limit errors
- No CRM API quota exceeded errors
- No SMS/email delivery failures due to rate limits

**Performance Tuning (If Needed):**
1. Enable API retry (already in workflow)
2. Increase n8n worker threads
3. Implement Redis queue for high-volume buffering
4. Add rate limiting on webhook endpoint

---

## Scheduling System-Specific Tests

### Cal.com Integration Test

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cal.com Test",
    "email": "calcom@example.com",
    "phone": "+1-555-100-0001",
    "service_type": "Cal.com Test"
  }'
```

**Cal.com-Specific Verification:**
1. Check Cal.com dashboard → Bookings
2. Verify booking appears with correct event type
3. Check booking metadata includes `source: aigent_module_02`
4. Verify reschedule URL format: `https://cal.com/yourclinic/reschedule/[uid]`
5. Test reschedule link functionality

**Pass Criteria:**
- Booking visible in Cal.com dashboard
- Email/SMS include valid Cal.com reschedule URL
- Metadata correctly passed

---

### Acuity Scheduling Integration Test

**Setup:**
1. Update environment for Acuity:
```bash
SCHEDULING_PROVIDER_NAME=Acuity Scheduling
SCHEDULING_API_BASE_URL=https://acuityscheduling.com/api/v1
```

2. Modify Node 204 URL to: `={{$env.SCHEDULING_API_BASE_URL}}/availability/dates`
3. Modify Node 206 URL to: `={{$env.SCHEDULING_API_BASE_URL}}/appointments`

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acuity Test",
    "email": "acuity@example.com",
    "phone": "+1-555-200-0002",
    "service_type": "Acuity Test"
  }'
```

**Acuity-Specific Verification:**
1. Check Acuity Scheduling dashboard → Calendar
2. Verify appointment appears at correct time
3. Check appointment type matches `SCHEDULING_EVENT_TYPE_ID`
4. Verify client info (name, email, phone) populated
5. Test confirmation email from Acuity (separate from workflow email)

**Pass Criteria:**
- Appointment created in Acuity
- Client details correctly populated
- Both Acuity and workflow confirmations sent (or disable Acuity's if redundant)

---

## Integration Tests

### Module 01 → Module 02 Chain Test

**Step 1: Trigger Module 01 (Intake)**
```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integration Test Patient",
    "email": "integration@example.com",
    "phone": "+1-555-300-0003",
    "interest": "General Consultation",
    "referral_source": "Website"
  }'
```

**Step 2: Verify Module 01 Response**
```json
{
  "success": true,
  "data": {
    "contact_id": "98765",
    "email": "integration@example.com"
  }
}
```

**Step 3: Manually Trigger Module 02 with Module 01 Output**
```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "98765",
    "name": "Integration Test Patient",
    "email": "integration@example.com",
    "phone": "+1-555-300-0003",
    "service_type": "General Consultation",
    "referral_source": "Website"
  }'
```

**Verification Steps:**
1. Check CRM - contact (ID: 98765) should exist from Module 01
2. Verify Module 02 updates existing contact (doesn't create duplicate)
3. Confirm lifecycle stage progresses: lead → opportunity
4. Check referral_source preserved throughout

**Pass Criteria:**
- Single CRM contact (no duplicates)
- Contact status updated through both modules
- All metadata preserved across modules

---

## Automated Testing Setup

### GitHub Actions CI/CD

**.github/workflows/test-module-02.yml:**
```yaml
name: Test Aigent Module 02

on:
  push:
    paths:
      - 'Aigent_Module_02_Consult_Booking.json'
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours

jobs:
  test-booking-workflow:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Test valid booking
        run: |
          response=$(curl -s -X POST ${{ secrets.N8N_BOOKING_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{"name":"CI Test","email":"ci@example.com","phone":"+15550000000","service_type":"Test"}')

          success=$(echo $response | jq -r '.success')
          if [ "$success" != "true" ]; then
            echo "Booking test failed"
            echo $response
            exit 1
          fi

          # Verify appointment_id returned
          appointment_id=$(echo $response | jq -r '.appointment_id')
          if [ -z "$appointment_id" ] || [ "$appointment_id" == "null" ]; then
            echo "No appointment_id returned"
            exit 1
          fi

      - name: Test validation error
        run: |
          http_code=$(curl -s -w "%{http_code}" -o /dev/null -X POST ${{ secrets.N8N_BOOKING_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{"name":"CI Test","email":"invalid","phone":"+15550000000","service_type":"Test"}')

          if [ "$http_code" != "400" ]; then
            echo "Validation test failed (expected 400, got $http_code)"
            exit 1
          fi

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Module 02 automated tests failed",
              "workflow": "${{ github.workflow }}",
              "status": "failure"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Monitoring & Health Checks

### Uptime Robot Configuration

**Monitor 1: Booking Endpoint Health**
- Type: HTTP(s)
- URL: `https://your-n8n.com/webhook/consult-booking`
- Method: POST
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {"name":"Uptime","email":"uptime@example.com","phone":"+15550000000","service_type":"Health Check"}
  ```
- Interval: 10 minutes
- Alert: Email/SMS when down

**Monitor 2: Scheduling API Health**
- Type: HTTP(s)
- URL: `https://api.cal.com/v1/availability?eventTypeId=123456`
- Method: GET
- Headers: `Authorization: Bearer YOUR_API_KEY`
- Interval: 5 minutes

### Custom Health Check Endpoint

Add to n8n:

```javascript
// New workflow: Health Check
// Webhook: /webhook/health/module-02

// Test components
const checks = {
  scheduling_api: false,
  crm: false,
  sms: false,
  email: false
};

// Test scheduling API
try {
  await $http.get(`${$env.SCHEDULING_API_BASE_URL}/availability`);
  checks.scheduling_api = true;
} catch (e) {}

// Test CRM
try {
  await $http.get('https://api.hubapi.com/contacts/v1/lists/all/contacts/all');
  checks.crm = true;
} catch (e) {}

// Return health status
return {
  status: Object.values(checks).every(v => v) ? 'healthy' : 'degraded',
  checks: checks,
  timestamp: new Date().toISOString()
};
```

---

## Rollback Procedure

If critical issues arise in production:

1. **Immediate Deactivation:**
   - Toggle Module 02 workflow to "Inactive"
   - This stops all incoming booking requests

2. **Fallback to Manual Booking:**
   - Update website booking widget to show phone number
   - Enable manual booking form (email to staff)

3. **Identify Issue:**
   - Review recent executions for error patterns
   - Check scheduling system for data integrity
   - Verify CRM contacts updated correctly

4. **Fix and Test:**
   - Apply fix to workflow
   - Run all test cases in staging environment
   - Verify no double-bookings or missed confirmations

5. **Gradual Re-activation:**
   - Activate workflow during off-hours
   - Monitor first 10-20 executions closely
   - Verify confirmations delivered

6. **Communication:**
   - Notify patients affected by downtime
   - Offer rebooking assistance

---

## Performance Benchmarks

### Baseline Metrics (Single Execution)

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Validation Time | < 50ms | n8n execution log |
| Availability Check | < 1000ms | n8n execution log |
| Slot Selection | < 100ms | n8n execution log |
| Booking Creation | < 2000ms | n8n execution log |
| CRM Update | < 500ms | n8n execution log |
| SMS Send | < 1000ms | n8n execution log |
| Email Send | < 2000ms | n8n execution log |
| **Total Execution** | **< 5000ms** | Webhook response time |

### Load Test Targets

| Scenario | Requests | Concurrency | Success Rate | Avg Response Time |
|----------|----------|-------------|--------------|-------------------|
| Light Load | 20/hour | 2 | 100% | < 3000ms |
| Medium Load | 60/hour | 5 | > 98% | < 5000ms |
| Heavy Load | 120/hour | 10 | > 95% | < 7000ms |
| Peak Load | 200/hour | 20 | > 90% | < 10000ms |

---

## Sign-Off Checklist

Before deploying to production:

- [ ] All 15 test cases passed
- [ ] Load test met performance targets
- [ ] Scheduling system integration verified (appointments created correctly)
- [ ] CRM data verified for accuracy
- [ ] SMS confirmations received and tested
- [ ] Email confirmations received, tested across email clients, passed spam check
- [ ] Error handling tested (API failures, no availability)
- [ ] Module 01 integration tested (if applicable)
- [ ] Environment variables documented
- [ ] Credentials secured (not in code/version control)
- [ ] Monitoring configured (Uptime Robot or equivalent)
- [ ] Rollback procedure documented and tested
- [ ] Stakeholders trained on workflow functionality
- [ ] Patient-facing documentation updated (how to book, reschedule, cancel)

---

**Testing completed by:** ___________________________
**Date:** ___________________________
**Production deployment approved by:** ___________________________
**Date:** ___________________________
