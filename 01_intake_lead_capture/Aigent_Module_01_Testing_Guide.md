# Aigent Module 01 - Testing & Validation Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] All environment variables configured in `.env` or n8n settings
- [ ] Credentials created in n8n and IDs match env vars
- [ ] Workflow imported successfully
- [ ] Workflow activated (green toggle)
- [ ] Webhook URL copied and accessible

### Service Verification
- [ ] CRM API key/OAuth tested independently
- [ ] Google Sheet exists with correct ID
- [ ] Google Sheet tab named correctly (default: `Leads`)
- [ ] Notification webhook URL tested with Postman/cURL
- [ ] All credential scopes/permissions granted

---

## Test Cases

### Test 1: Valid Lead Submission

**Objective:** Verify end-to-end workflow with valid data

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "phone": "+1-555-111-2222",
    "interest": "Dental Consultation",
    "referral_source": "Google Search"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "data": {
    "contact_id": "12345",
    "email": "alice.johnson@example.com",
    "name": "Alice Johnson",
    "timestamp": "2025-10-29T14:30:00.000Z"
  },
  "metadata": {
    "crm_updated": true,
    "notification_sent": true,
    "stored": true
  }
}
```

**Verification Steps:**
1. Check CRM for new contact "Alice Johnson"
2. Verify Slack/Teams received notification
3. Confirm new row in Google Sheet with all fields
4. Review n8n execution log (should be green/successful)

**Pass Criteria:**
- HTTP 200 response
- `success: true` in response
- Contact exists in CRM with correct data
- Notification received in configured channel
- Google Sheet row appended with timestamp

---

### Test 2: Invalid Email Format

**Objective:** Verify email validation

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith",
    "email": "invalid-email",
    "phone": "+1-555-333-4444",
    "interest": "General Inquiry",
    "referral_source": "Walk-in"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing or invalid required fields: name, email, phone",
  "timestamp": "2025-10-29T14:35:00.000Z"
}
```

**Verification Steps:**
1. Confirm HTTP 400 status code
2. Verify NO contact created in CRM
3. Verify NO notification sent
4. Verify NO Google Sheet row added

**Pass Criteria:**
- HTTP 400 response
- `success: false` in response
- Error message indicates validation failure
- No data persisted in any system

---

### Test 3: Missing Required Field (Phone)

**Objective:** Verify required field enforcement

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Davis",
    "email": "charlie.davis@example.com",
    "interest": "Urgent Care",
    "referral_source": "Referral"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing or invalid required fields: name, email, phone",
  "timestamp": "2025-10-29T14:40:00.000Z"
}
```

**Pass Criteria:**
- HTTP 400 response
- No data persistence
- Workflow execution stops at validation node

---

### Test 4: Optional Fields Omitted

**Objective:** Verify workflow handles missing optional fields gracefully

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Diana Prince",
    "email": "diana.prince@example.com",
    "phone": "+1-555-777-8888"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "data": {
    "contact_id": "12346",
    "email": "diana.prince@example.com",
    "name": "Diana Prince",
    "timestamp": "2025-10-29T14:45:00.000Z"
  },
  "metadata": {
    "crm_updated": true,
    "notification_sent": true,
    "stored": true
  }
}
```

**Verification Steps:**
1. Check CRM contact - `interest` should be "General Inquiry" (default)
2. Check CRM contact - `referral_source` should be "Direct" (default)
3. Google Sheet row should have empty cells for optional fields

**Pass Criteria:**
- HTTP 200 response
- Default values applied for missing optional fields
- All systems updated successfully

---

### Test 5: Duplicate Lead Detection

**Objective:** Verify CRM upsert behavior (update vs. create)

**Step 1: Create initial lead**
```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Eve Wilson",
    "email": "eve.wilson@example.com",
    "phone": "+1-555-999-0000",
    "interest": "Initial Consultation",
    "referral_source": "Facebook"
  }'
```

**Step 2: Submit duplicate with updated data**
```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Eve Wilson",
    "email": "eve.wilson@example.com",
    "phone": "+1-555-999-0001",
    "interest": "Follow-up Consultation",
    "referral_source": "Direct Call"
  }'
```

**Expected Behavior:**
- First submission creates new contact
- Second submission updates existing contact (same email)
- CRM contact reflects latest data (phone, interest, referral_source)

**Verification Steps:**
1. Search CRM for "eve.wilson@example.com"
2. Verify only ONE contact exists
3. Verify phone is "+1-555-999-0001" (updated)
4. Verify interest is "Follow-up Consultation" (updated)

**Pass Criteria:**
- No duplicate contacts in CRM
- Contact data reflects most recent submission
- Both executions return success

---

### Test 6: Special Characters in Name

**Objective:** Verify handling of international names and special characters

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "José García-Hernández",
    "email": "jose.garcia@example.com",
    "phone": "+34-612-345-678",
    "interest": "Especialidad Médica",
    "referral_source": "Búsqueda en línea"
  }'
```

**Pass Criteria:**
- HTTP 200 response
- Name stored correctly with accents/hyphens
- CRM and Google Sheets preserve special characters

---

### Test 7: Phone Number Format Variations

**Objective:** Verify workflow accepts various phone formats

**Test Cases:**
```bash
# US format with dashes
curl -X POST https://your-n8n.com/webhook/intake-lead -H "Content-Type: application/json" \
  -d '{"name":"Test 1","email":"test1@example.com","phone":"555-123-4567"}'

# US format with parentheses
curl -X POST https://your-n8n.com/webhook/intake-lead -H "Content-Type: application/json" \
  -d '{"name":"Test 2","email":"test2@example.com","phone":"(555) 123-4567"}'

# International format
curl -X POST https://your-n8n.com/webhook/intake-lead -H "Content-Type: application/json" \
  -d '{"name":"Test 3","email":"test3@example.com","phone":"+44 20 7946 0958"}'

# Numeric only
curl -X POST https://your-n8n.com/webhook/intake-lead -H "Content-Type: application/json" \
  -d '{"name":"Test 4","email":"test4@example.com","phone":"5551234567"}'
```

**Pass Criteria:**
- All variations accepted (validation only checks non-empty)
- Phone stored as submitted in CRM/data store

---

### Test 8: Long Field Values

**Objective:** Verify handling of edge cases (very long inputs)

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hubert Blaine Wolfeschlegelsteinhausenbergerdorff Sr.",
    "email": "hubert.blaine.wolfeschlegelsteinhausenbergerdorff@example.com",
    "phone": "+1-555-888-9999",
    "interest": "I am interested in a comprehensive consultation regarding multiple chronic conditions including but not limited to cardiovascular assessment, endocrine evaluation, and general wellness screening.",
    "referral_source": "Recommended by Dr. Anderson at the Springfield Medical Center following my annual physical examination"
  }'
```

**Pass Criteria:**
- HTTP 200 response (or graceful truncation if CRM has limits)
- Data stored without corruption
- No timeout or execution errors

---

### Test 9: Concurrent Load Test

**Objective:** Verify workflow handles simultaneous requests

**Method:** Apache Bench
```bash
# Create test payload file
echo '{
  "name": "Load Test User",
  "email": "loadtest@example.com",
  "phone": "+1-555-000-0000",
  "interest": "Load Testing",
  "referral_source": "Automated Test"
}' > test_payload.json

# Execute 100 requests with 10 concurrent connections
ab -n 100 -c 10 -T 'application/json' \
  -p test_payload.json \
  https://your-n8n.com/webhook/intake-lead
```

**Expected Metrics:**
- **Mean response time:** < 2000ms
- **Success rate:** > 99%
- **Failed requests:** < 1

**Verification Steps:**
1. Check Apache Bench output for performance metrics
2. Review n8n execution history (should show 100 executions)
3. Verify all executions completed successfully
4. Check CRM for contact count (should match successful executions)

**Pass Criteria:**
- 95% of requests complete within 2 seconds
- Error rate < 1%
- No CRM rate limit errors

---

### Test 10: Error Recovery (Simulated CRM Failure)

**Objective:** Verify workflow error handling when CRM is unavailable

**Setup:**
1. Temporarily invalidate CRM credential (remove API key)
2. Submit valid lead

**Request:**
```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Error Test",
    "email": "error.test@example.com",
    "phone": "+1-555-000-0001",
    "interest": "Testing",
    "referral_source": "Test"
  }'
```

**Expected Behavior:**
- Workflow execution fails at CRM node
- Error handler catches failure
- Execution log shows error details

**Verification Steps:**
1. Check n8n execution log for red/failed status
2. Verify error message indicates CRM authentication failure
3. Confirm notification and data store nodes did NOT execute

**Pass Criteria:**
- Workflow fails gracefully (no crash)
- Error logged with clear message
- No partial data persistence (transaction-like behavior)

**Cleanup:**
- Restore valid CRM credential

---

## Performance Benchmarks

### Baseline Metrics (Single Execution)

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Validation Time | < 50ms | n8n execution log |
| CRM Upsert Time | < 500ms | n8n execution log |
| Notification Time | < 300ms | n8n execution log |
| Data Store Time | < 400ms | n8n execution log |
| **Total Execution** | **< 2000ms** | Webhook response time |

### Load Test Targets

| Scenario | Requests | Concurrency | Success Rate | Avg Response Time |
|----------|----------|-------------|--------------|-------------------|
| Light Load | 50/min | 5 | 100% | < 1000ms |
| Medium Load | 100/min | 10 | > 99% | < 2000ms |
| Heavy Load | 200/min | 20 | > 95% | < 3000ms |

---

## Debugging Tools

### n8n Execution Inspector

1. Navigate to **Executions** tab in n8n
2. Click on execution ID
3. Review:
   - Node-by-node execution path
   - Input/output JSON for each node
   - Error messages and stack traces
   - Execution duration per node

### Webhook Testing with Postman

**Collection Setup:**
1. Create new request: `POST https://your-n8n.com/webhook/intake-lead`
2. Set header: `Content-Type: application/json`
3. Add body (JSON):
   ```json
   {
     "name": "{{$randomFullName}}",
     "email": "{{$randomEmail}}",
     "phone": "{{$randomPhoneNumber}}",
     "interest": "Test",
     "referral_source": "Postman"
   }
   ```
4. Use Postman variables for dynamic data generation

### CRM Verification Script

**Python Script to Check CRM Sync:**
```python
import requests
import os

# HubSpot example
HUBSPOT_API_KEY = os.getenv('HUBSPOT_API_KEY')
TEST_EMAIL = 'test@example.com'

response = requests.get(
    f'https://api.hubapi.com/contacts/v1/contact/email/{TEST_EMAIL}/profile',
    params={'hapikey': HUBSPOT_API_KEY}
)

if response.status_code == 200:
    contact = response.json()
    print(f"Contact found: {contact['properties']['firstname']['value']}")
    print(f"Phone: {contact['properties']['phone']['value']}")
    print(f"Last modified: {contact['properties']['lastmodifieddate']['value']}")
else:
    print(f"Contact not found or error: {response.status_code}")
```

### Google Sheets Verification

**Apps Script (Google Sheets):**
```javascript
function verifyLeadCount() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');
  const lastRow = sheet.getLastRow();
  const recentLeads = sheet.getRange(lastRow - 9, 1, 10, 8).getValues(); // Last 10 leads

  Logger.log(`Total leads: ${lastRow - 1}`); // Exclude header
  Logger.log('Recent leads:');
  recentLeads.forEach((lead, index) => {
    Logger.log(`${index + 1}. ${lead[1]} - ${lead[2]} - ${lead[0]}`); // name - email - timestamp
  });
}
```

---

## Automated Testing Setup

### GitHub Actions CI/CD

**.github/workflows/test-workflow.yml:**
```yaml
name: Test Aigent Module 01

on:
  push:
    paths:
      - 'Aigent_Module_01_Intake_LeadCapture.json'
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours

jobs:
  test-workflow:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Test valid lead submission
        run: |
          response=$(curl -s -X POST ${{ secrets.N8N_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{"name":"CI Test","email":"ci@example.com","phone":"+1-555-000-0000"}')

          success=$(echo $response | jq -r '.success')
          if [ "$success" != "true" ]; then
            echo "Workflow test failed"
            exit 1
          fi

      - name: Test invalid email
        run: |
          response=$(curl -s -w "%{http_code}" -X POST ${{ secrets.N8N_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{"name":"CI Test","email":"invalid","phone":"+1-555-000-0000"}')

          http_code=$(echo $response | tail -c 4)
          if [ "$http_code" != "400" ]; then
            echo "Validation test failed"
            exit 1
          fi
```

### Monitoring with Uptime Robot

**Configuration:**
1. Create HTTP(s) monitor
2. URL: `https://your-n8n.com/webhook/intake-lead`
3. Method: POST
4. Headers: `Content-Type: application/json`
5. Body:
   ```json
   {"name":"Monitor","email":"monitor@example.com","phone":"555-0000"}
   ```
6. Alert Contacts: your-email@example.com
7. Monitoring Interval: 5 minutes

**Expected:**
- HTTP 200 response
- Response contains `"success":true`

---

## Rollback Procedure

If critical issues arise in production:

1. **Immediate Deactivation:**
   - Toggle workflow to "Inactive" in n8n
   - This stops all incoming webhook requests

2. **Revert to Previous Version:**
   ```bash
   # If workflow JSON is version controlled
   git checkout HEAD~1 Aigent_Module_01_Intake_LeadCapture.json
   ```
   - Re-import previous version to n8n

3. **Isolate Issue:**
   - Review recent executions for error patterns
   - Check CRM/data store for data integrity issues

4. **Fix and Test:**
   - Apply fix to workflow
   - Run all test cases in staging environment
   - Verify no data loss or corruption

5. **Gradual Re-activation:**
   - Activate workflow
   - Monitor first 10 executions closely
   - Verify CRM/notification/data store sync

---

## Sign-Off Checklist

Before deploying to production:

- [ ] All 10 test cases passed
- [ ] Load test met performance targets
- [ ] CRM data verified for accuracy
- [ ] Notifications received in correct channels
- [ ] Google Sheets logging confirmed
- [ ] Error handling tested (simulated failures)
- [ ] Environment variables documented
- [ ] Credentials secured (not in code/version control)
- [ ] Monitoring configured (Uptime Robot or equivalent)
- [ ] Rollback procedure documented and tested
- [ ] Stakeholders trained on workflow functionality

---

**Testing completed by:** ___________________________
**Date:** ___________________________
**Production deployment approved by:** ___________________________
**Date:** ___________________________
