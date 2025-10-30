# Aigent Module 01 – Intake & Lead Capture

**Version:** 1.0.0
**Author:** Aigent Automation Engineering
**Template Type:** Universal Clinic Template
**Status:** Production Ready

---

## Overview

The **Intake & Lead Capture** module is the foundational workflow for patient acquisition in small medical offices. It accepts lead data from multiple sources (web forms, chatbots, landing pages), validates input, integrates with your CRM, sends internal notifications, and maintains an audit trail.

### Key Features

- **Omnichannel Input:** Accept leads via webhook from any source
- **Intelligent Validation:** Email format, required field checks, data sanitization
- **CRM Agnostic:** Pre-configured for HubSpot with easy swap for Salesforce, Zoho, or custom APIs
- **Multi-Channel Notifications:** Slack, Teams, SMS (Twilio), or email alerts
- **Audit Trail:** Automatic logging to Google Sheets, Airtable, or database
- **PHI-Safe:** No protected health information in this intake stage
- **Zero Hardcoded Credentials:** 100% environment variable driven

---

## Architecture

### Data Flow
```
Web Form/Chatbot → Webhook → Validation → CRM Upsert → Parallel:
                                                        ├─ Notification
                                                        └─ Data Store
                                          ↓
                                    Success Response
```

### Node Breakdown

| Node # | Name | Type | Purpose |
|--------|------|------|---------|
| 001 | Webhook Trigger | Webhook | Accept POST requests with lead data |
| 002 | Validate Required Fields | If | Verify name, email (regex), phone presence |
| 003 | Return Validation Error | Respond to Webhook | 400 error for invalid data |
| 004 | Upsert Contact to CRM | HubSpot | Create/update CRM contact record |
| 005 | Merge Webhook + CRM Data | Merge | Combine original payload with CRM IDs |
| 006 | Send Internal Notification | HTTP Request | Alert staff via Slack/Teams/SMS |
| 007 | Append to Data Store | Google Sheets | Log lead for audit trail |
| 008 | Merge All Results | Merge | Consolidate execution outputs |
| 009 | Return Success Response | Respond to Webhook | 200 success with contact data |
| 010 | Error Handler | NoOp | Catch and log workflow errors |

---

## Installation

### 1. Import Workflow

In your n8n instance:
1. Navigate to **Workflows** → **Import from File**
2. Select `Aigent_Module_01_Intake_LeadCapture.json`
3. Click **Import**

### 2. Configure Credentials

Create the following credentials in n8n:

#### HubSpot (or alternate CRM)
- **Type:** HubSpot API
- **Name:** `HubSpot Account` (or set via `HUBSPOT_CREDENTIAL_NAME`)
- **API Key/OAuth:** Configure per HubSpot documentation

#### Google Sheets (or alternate data store)
- **Type:** Google Sheets OAuth2 API
- **Name:** `Google Sheets OAuth` (or set via `GOOGLE_SHEETS_CREDENTIAL_NAME`)
- **Scopes:** `spreadsheets`

#### Notification Service (Slack example)
- **Type:** HTTP Header Auth
- **Name:** `Slack Webhook Auth`
- **Header:** `Authorization`
- **Value:** `Bearer YOUR_SLACK_TOKEN` (if required by webhook)

### 3. Configure Environment Variables

Copy `.env.aigent_module_01_example` to your n8n environment:

**Docker/Docker Compose:**
```bash
# Add to docker-compose.yml under n8n service:
environment:
  - ALLOWED_ORIGINS=https://yourdomain.com
  - HUBSPOT_CREDENTIAL_ID=1
  - NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
  - GOOGLE_SHEET_ID=YOUR_SHEET_ID
  # ... (add all required variables)
```

**Self-Hosted (systemd/pm2):**
```bash
# Export to shell before starting n8n:
export ALLOWED_ORIGINS="https://yourdomain.com"
export HUBSPOT_CREDENTIAL_ID="1"
# ... (add all required variables)
```

**n8n Cloud:**
- Navigate to **Settings** → **Environments**
- Add each variable as key-value pair

### 4. Activate Workflow

1. Open the imported workflow
2. Verify all credential references resolve (green checkmarks)
3. Click **Active** toggle in top-right corner
4. Copy the webhook URL from the **Webhook Trigger** node

---

## Usage

### Input Schema

Send POST request to webhook URL with JSON body:

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "+1-555-123-4567",
  "interest": "General Consultation",
  "referral_source": "Google Ads"
}
```

#### Field Specifications

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `name` | String | Yes | Not empty | Full name; split into first/last for CRM |
| `email` | String | Yes | Regex pattern | Must match email format |
| `phone` | String | Yes | Not empty | Any format accepted; normalize in CRM |
| `interest` | String | No | - | Service/treatment interest |
| `referral_source` | String | No | - | Marketing attribution |

### Success Response (200)

```json
{
  "success": true,
  "message": "Lead captured successfully",
  "data": {
    "contact_id": "12345",
    "email": "jane.doe@example.com",
    "name": "Jane Doe",
    "timestamp": "2025-10-29T14:30:00.000Z"
  },
  "metadata": {
    "crm_updated": true,
    "notification_sent": true,
    "stored": true
  }
}
```

### Error Response (400)

```json
{
  "success": false,
  "error": "Missing or invalid required fields: name, email, phone",
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

---

## Configuration

### Switching CRM Systems

**From HubSpot to Salesforce:**

1. In node `004 - Upsert Contact to CRM`:
   - Change **Type** to `n8n-nodes-base.salesforce`
   - Update credential reference:
     ```
     SALESFORCE_CREDENTIAL_ID=2
     SALESFORCE_CREDENTIAL_NAME=Salesforce Production
     ```
   - Remap fields to Salesforce Contact object

2. Update `.env`:
   ```bash
   # Comment out HubSpot
   # HUBSPOT_CREDENTIAL_ID=1

   # Add Salesforce
   SALESFORCE_CREDENTIAL_ID=2
   SALESFORCE_CREDENTIAL_NAME=Salesforce Production
   ```

**Custom API Integration:**

Replace node `004` with **HTTP Request** node:
```javascript
{
  "method": "POST",
  "url": "https://your-crm.com/api/v1/contacts",
  "authentication": "genericCredentialType",
  "body": {
    "name": "={{ $json.body.name }}",
    "email": "={{ $json.body.email }}",
    "phone": "={{ $json.body.phone }}"
  }
}
```

### Switching Data Stores

**From Google Sheets to Airtable:**

1. In node `007 - Append to Data Store`:
   - Change **Type** to `n8n-nodes-base.airtable`
   - Configure:
     ```
     Base ID: {{ $env.AIRTABLE_BASE_ID }}
     Table: {{ $env.AIRTABLE_TABLE_NAME }}
     ```

2. Update `.env`:
   ```bash
   AIRTABLE_CREDENTIAL_ID=7
   AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
   AIRTABLE_TABLE_NAME=Leads
   ```

**Database Storage (PostgreSQL):**

Replace node `007` with **Postgres** node:
```sql
INSERT INTO patient_leads
(timestamp, name, email, phone, interest, referral_source, crm_contact_id, status)
VALUES
($now.toISO(), $json.body.name, $json.body.email, $json.body.phone,
 $json.body.interest, $json.body.referral_source, $json.id, 'NEW');
```

### Notification Channels

**Slack (Current Default):**
- Webhook URL in `NOTIFICATION_WEBHOOK_URL`
- Channel in `NOTIFICATION_CHANNEL` (e.g., `#leads`)

**Microsoft Teams:**
- Replace Slack webhook URL with Teams incoming webhook
- Adjust body format:
  ```json
  {
    "@type": "MessageCard",
    "summary": "New Lead",
    "text": "New Lead: {{ $json.body.name }}"
  }
  ```

**Twilio SMS:**

Replace node `006` with **Twilio** node:
```javascript
{
  "operation": "send",
  "from": "={{ $env.TWILIO_FROM_NUMBER }}",
  "to": "={{ $env.TWILIO_TO_NUMBER }}",
  "message": "New lead: {{ $json.body.name }} - {{ $json.body.phone }}"
}
```

---

## Customization

### Adding Additional Validation

In node `002 - Validate Required Fields`, add conditions:

```javascript
// Example: Validate phone format (US)
{
  "id": "validation-phone-format",
  "leftValue": "={{ $json.body.phone }}",
  "rightValue": "^\\+?1?[-.]?\\(?\\d{3}\\)?[-.]?\\d{3}[-.]?\\d{4}$",
  "operator": {
    "type": "string",
    "operation": "regex"
  }
}

// Example: Require interest field
{
  "id": "validation-interest",
  "leftValue": "={{ $json.body.interest }}",
  "rightValue": "",
  "operator": {
    "type": "string",
    "operation": "notEmpty"
  }
}
```

### Enriching Lead Data

Add a **Code** node after validation to:

```javascript
// Normalize phone number
const phone = $json.body.phone.replace(/\D/g, '');

// Extract UTM parameters (if sent in webhook)
const utmSource = $json.body.utm_source || 'direct';
const utmCampaign = $json.body.utm_campaign || '';

// Assign lead score based on interest
const interestScores = {
  'Urgent Consultation': 10,
  'General Consultation': 5,
  'Information Request': 2
};
const leadScore = interestScores[$json.body.interest] || 1;

return {
  ...($json.body),
  phone_normalized: phone,
  utm_source: utmSource,
  utm_campaign: utmCampaign,
  lead_score: leadScore,
  processed_at: new Date().toISOString()
};
```

### Multi-Language Support

Add translation node before CRM upsert:

```javascript
// Example: Detect language from interest field
const translations = {
  'es': { interest: 'Consulta General' },
  'fr': { interest: 'Consultation Générale' }
};

const detectedLang = detectLanguage($json.body.interest); // Use translation API
const translatedInterest = translations[detectedLang]?.interest || $json.body.interest;

return {
  ...($json.body),
  interest: translatedInterest,
  language: detectedLang
};
```

---

## Security & Compliance

### PHI Handling

**This module is PHI-SAFE by design:**
- Only captures contact info (name, email, phone)
- No medical history, symptoms, or diagnoses
- Suitable for pre-appointment intake

**For PHI workflows:**
- Use Aigent Module 03 (Appointment & PHI Capture)
- Enable `HIPAA_MODE=true` in environment
- Ensure all services have signed BAAs

### CORS Configuration

Restrict webhook origins in production:

```bash
# Development (allow all)
ALLOWED_ORIGINS=*

# Production (specific domains only)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Credential Security

**Best Practices:**
- Never commit `.env` files to version control
- Use n8n's credential encryption (enabled by default)
- Rotate API keys quarterly
- Use OAuth2 over API keys where possible
- Enable n8n audit logs for credential access

### Data Retention

Configure automatic cleanup:

```bash
# Retain lead data for 7 years (HIPAA compliance)
DATA_RETENTION_DAYS=2555
```

Implement cleanup workflow (separate):
```javascript
// Delete Google Sheets rows older than retention period
DELETE FROM Leads
WHERE timestamp < NOW() - INTERVAL '{{ $env.DATA_RETENTION_DAYS }} days';
```

---

## Testing

### Manual Test (via cURL)

```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test@example.com",
    "phone": "+1-555-000-0000",
    "interest": "Test Consultation",
    "referral_source": "Manual Test"
  }'
```

**Expected Result:**
- HTTP 200 response with `success: true`
- New contact in CRM
- Notification in Slack/Teams
- New row in Google Sheet

### Validation Test (Invalid Email)

```bash
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "invalid-email",
    "phone": "+1-555-000-0000"
  }'
```

**Expected Result:**
- HTTP 400 response with validation error

### Load Testing

Use Apache Bench or k6:

```bash
# Test 100 requests with 10 concurrent connections
ab -n 100 -c 10 -T 'application/json' \
  -p test_payload.json \
  https://your-n8n.com/webhook/intake-lead
```

**Performance Targets:**
- Response time: < 2 seconds (95th percentile)
- Throughput: > 50 requests/minute
- Error rate: < 0.1%

---

## Troubleshooting

### Common Issues

#### 1. "Credential not found" Error

**Symptom:** Workflow fails on CRM or notification node
**Solution:**
- Verify credential IDs match environment variables
- Check credential names in n8n Settings → Credentials
- Ensure credentials have correct permissions

#### 2. Webhook Returns 404

**Symptom:** cURL test returns "Not Found"
**Solution:**
- Verify workflow is **Active** (toggle in top-right)
- Check webhook path in trigger node settings
- Confirm `WEBHOOK_ID` matches production URL

#### 3. CRM Upsert Fails

**Symptom:** Contact not created in CRM
**Solution:**
- Test CRM credential independently (create test contact)
- Verify required fields in CRM (some require additional properties)
- Check CRM API rate limits

#### 4. Notification Not Received

**Symptom:** No Slack/Teams message
**Solution:**
- Test webhook URL with Postman/cURL
- Verify `NOTIFICATION_CHANNEL` exists
- Check n8n execution log for HTTP errors

#### 5. Data Store Append Fails

**Symptom:** Lead not logged to Google Sheets
**Solution:**
- Verify `GOOGLE_SHEET_ID` is correct (from sheet URL)
- Ensure sheet tab exists (default: 'Leads')
- Check Google Sheets API quota limits
- Confirm OAuth scopes include `spreadsheets`

### Debug Mode

Enable verbose logging:

```bash
DEBUG_MODE=true
```

Add **Code** node after each major step:

```javascript
console.log('Node 004 CRM Output:', JSON.stringify($json, null, 2));
return $json;
```

View logs in n8n: **Executions** → Select execution → **Logs** tab

---

## Performance Optimization

### Parallel Execution

The workflow already runs notification + data store in parallel. To add more parallel operations:

```javascript
// After CRM upsert, connect to multiple paths:
CRM Upsert → ├─ Send Notification
             ├─ Append to Data Store
             ├─ Enrich with External API
             └─ Update Marketing Platform
```

### Caching

For duplicate detection, add **Redis** cache:

```javascript
// Before CRM upsert:
const cacheKey = `lead:${$json.body.email}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return { duplicate: true, existing_id: cached };
}

// After CRM upsert:
await redis.set(cacheKey, $json.id, 'EX', 86400); // 24h TTL
```

### Webhook Queue

For high-volume clinics, add RabbitMQ/Redis queue:

```
Webhook → Queue → Worker Workflow (This Template)
```

Benefits:
- Instant webhook response (< 50ms)
- Buffered processing
- Automatic retry on failure

---

## Integration Examples

### Web Form (HTML + JavaScript)

```html
<form id="intake-form">
  <input type="text" name="name" placeholder="Full Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="tel" name="phone" placeholder="Phone" required>
  <select name="interest">
    <option value="General Consultation">General Consultation</option>
    <option value="Urgent Care">Urgent Care</option>
  </select>
  <input type="hidden" name="referral_source" value="Website">
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('intake-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch('https://your-n8n.com/webhook/intake-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      alert('Thank you! We will contact you soon.');
      window.location.href = '/thank-you';
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Submission failed. Please try again.');
  }
});
</script>
```

### Chatbot (Dialogflow/Rasa)

```python
# Fulfillment webhook (Python/Flask)
@app.route('/dialogflow-webhook', methods=['POST'])
def dialogflow_fulfillment():
    req = request.get_json()

    # Extract entities from Dialogflow
    name = req['queryResult']['parameters']['person']['name']
    email = req['queryResult']['parameters']['email']
    phone = req['queryResult']['parameters']['phone-number']

    # Send to n8n workflow
    payload = {
        'name': name,
        'email': email,
        'phone': phone,
        'interest': 'Chatbot Inquiry',
        'referral_source': 'Chatbot'
    }

    response = requests.post(
        'https://your-n8n.com/webhook/intake-lead',
        json=payload
    )

    if response.json()['success']:
        return jsonify({
            'fulfillmentText': 'Great! Our team will reach out to you shortly.'
        })
    else:
        return jsonify({
            'fulfillmentText': 'Sorry, there was an error. Please try again.'
        })
```

### WordPress (Contact Form 7)

```php
// functions.php
add_action('wpcf7_before_send_mail', 'send_to_n8n_workflow');

function send_to_n8n_workflow($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    $posted_data = $submission->get_posted_data();

    $payload = array(
        'name' => $posted_data['your-name'],
        'email' => $posted_data['your-email'],
        'phone' => $posted_data['your-phone'],
        'interest' => $posted_data['your-interest'],
        'referral_source' => 'WordPress Form'
    );

    wp_remote_post('https://your-n8n.com/webhook/intake-lead', array(
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode($payload)
    ));
}
```

---

## Roadmap

### Planned Enhancements (v1.1)

- [ ] Duplicate lead detection via Redis cache
- [ ] Automatic lead scoring algorithm
- [ ] Email confirmation to patient (opt-in)
- [ ] Multi-language support (Spanish, French)
- [ ] GDPR consent tracking
- [ ] Integration with Calendly/Acuity for instant booking

### Future Modules

- **Module 02:** Appointment Scheduling & Reminders
- **Module 03:** PHI Capture & EHR Integration
- **Module 04:** Post-Visit Follow-Up & Reviews
- **Module 05:** Billing & Payment Collection
- **Module 06:** Patient Portal Access Provisioning

---

## Support

### Documentation
- Full Aigent Template Library: [docs.aigent.company/templates](https://docs.aigent.company/templates)
- n8n Official Docs: [docs.n8n.io](https://docs.n8n.io)

### Community
- Aigent Slack: #workflow-support
- n8n Community Forum: [community.n8n.io](https://community.n8n.io)

### Enterprise Support
- Email: support@aigent.company
- SLA: 4-hour response (Priority), 24-hour response (Standard)

---

## License

**Proprietary - Aigent Company**
© 2025 Aigent Company. All rights reserved.

This template is licensed to medical practices and healthcare organizations for internal use only. Redistribution, resale, or modification for third-party distribution is prohibited without written consent.

---

## Changelog

### v1.0.0 (2025-10-29)
- Initial release
- Core intake & lead capture functionality
- HubSpot, Google Sheets, Slack integrations
- Comprehensive validation and error handling
- Full documentation and .env examples
