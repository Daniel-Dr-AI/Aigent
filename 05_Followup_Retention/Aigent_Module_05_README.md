# Aigent Module 05 - Follow-Up & Retention

**Version:** 1.0.0
**Last Updated:** 2025-01-15
**Node Range:** 501-522
**Purpose:** Multi-touch post-visit follow-up sequence with surveys, NPS scoring, and rebooking automation

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Input Schema](#input-schema)
4. [Output Schema](#output-schema)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Follow-Up Sequence](#follow-up-sequence)
8. [Survey Integration](#survey-integration)
9. [NPS Scoring](#nps-scoring)
10. [CRM Integration](#crm-integration)
11. [Platform Setup Guides](#platform-setup-guides)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)
14. [Security & Compliance](#security--compliance)
15. [Advanced Customization](#advanced-customization)

---

## Overview

Module 05 implements an automated post-visit follow-up sequence designed to:
- Build patient relationships with timely check-ins
- Collect feedback via surveys with NPS scoring
- Identify dissatisfied patients for proactive outreach
- Drive rebooking through strategic timing
- Update CRM with engagement and sentiment data

### Key Features

- **Multi-touch sequence:** Day-0, Day-3, Day-7, Day-14
- **Dual-channel delivery:** Email + SMS for each touch
- **Survey capture:** Typeform/Google Forms integration
- **NPS scoring:** Automatic classification (Promoter/Passive/Detractor)
- **Low NPS alerts:** Instant Slack notifications for scores < 7
- **Rebooking automation:** Day-14 offer with tracking
- **CRM sync:** Updates contact engagement and sentiment
- **PHI-safe:** No clinical data or diagnosis codes
- **Credential-agnostic:** All credentials via environment variables

### Module Chaining

**Accepts input from:** Module 04 (Billing & Payments)
**Input format:** `invoice_record.json`
**Output format:** `followup_feedback.json`
**Next module:** None (terminal module)

---

## Architecture

### Workflow Components

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIN FOLLOW-UP SEQUENCE                   │
└─────────────────────────────────────────────────────────────┘

  Webhook Trigger (501)
        ↓
  Validate Input (502) ──→ [Invalid] ──→ Return Error (503)
        ↓ [Valid]
  Prepare Data (504)
        ↓
  ┌─────────────────────────────────┐
  │  DAY-0: Immediate Thank You     │
  │  • Email (505)                  │
  │  • SMS (506)                    │
  └─────────────────────────────────┘
        ↓
  Wait 72 Hours (507)
        ↓
  ┌─────────────────────────────────┐
  │  DAY-3: Check-In                │
  │  • Email (508)                  │
  │  • SMS (509)                    │
  └─────────────────────────────────┘
        ↓
  Wait 96 Hours (510)
        ↓
  ┌─────────────────────────────────┐
  │  DAY-7: Survey Request          │
  │  • Email (511)                  │
  │  • SMS (512)                    │
  └─────────────────────────────────┘
        ↓
  Wait 168 Hours (513)
        ↓
  ┌─────────────────────────────────┐
  │  DAY-14: Rebooking Offer        │
  │  • Email (514)                  │
  └─────────────────────────────────┘
        ↓
  Return Confirmation (522)


┌─────────────────────────────────────────────────────────────┐
│                  SURVEY RESPONSE HANDLER                     │
└─────────────────────────────────────────────────────────────┘

  Survey Webhook (515)
        ↓
  Parse Survey (516) ──→ Extract NPS, Feedback, Patient Info
        ↓
  Check NPS Score (517)
        ↓ [NPS < 7]
  Send Slack Alert (518)
        ↓
  ┌───────────────────────────────────┐
  │  Parallel Execution               │
  │  • Update CRM (519)               │
  │  • Log to Google Sheets (520)    │
  └───────────────────────────────────┘
        ↓
  Return Survey Confirmation (521)
```

### Node Breakdown

| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| 501 | Webhook Trigger | Webhook | Accept follow-up initiation |
| 502 | Validate Input | If | Verify required fields |
| 503 | Return Error | Respond | Error response |
| 504 | Prepare Data | Code | Initialize sequence variables |
| 505 | Day-0 Email | HTTP Request | Thank you email |
| 506 | Day-0 SMS | HTTP Request | Thank you SMS |
| 507 | Wait 72h | Wait | Pause until Day-3 |
| 508 | Day-3 Email | HTTP Request | Check-in email |
| 509 | Day-3 SMS | HTTP Request | Check-in SMS |
| 510 | Wait 96h | Wait | Pause until Day-7 |
| 511 | Day-7 Email | HTTP Request | Survey email |
| 512 | Day-7 SMS | HTTP Request | Survey SMS |
| 513 | Wait 168h | Wait | Pause until Day-14 |
| 514 | Day-14 Email | HTTP Request | Rebooking email |
| 515 | Survey Webhook | Webhook | Accept survey responses |
| 516 | Parse Survey | Code | Extract NPS and feedback |
| 517 | Check NPS | If | Evaluate if low NPS |
| 518 | Slack Alert | HTTP Request | Notify staff of low NPS |
| 519 | Update CRM | HubSpot | Sync survey data |
| 520 | Log Sheets | Google Sheets | Record response |
| 521 | Survey Response | Respond | Confirm survey receipt |
| 522 | Follow-Up Response | Respond | Confirm sequence start |

---

## Input Schema

### Required Fields

```json
{
  "patient_id": "string",
  "patient_email": "string",
  "visit_type": "string"
}
```

### Full Schema (from Module 04 output)

```json
{
  "trace_id": "INV-1234567890-PAY",
  "patient_id": "12345",
  "patient_email": "patient@example.com",
  "patient_phone": "+15551234567",
  "patient_name": "Jane Smith",
  "visit_type": "Initial Consultation",
  "visit_date": "2025-01-15T14:30:00Z",
  "provider_name": "Dr. John Williams",
  "invoice_id": "inv_abc123",
  "payment_status": "paid",
  "amount_paid": 15000,
  "currency": "usd"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_id` | string | Yes | Unique patient identifier |
| `patient_email` | string | Yes | Patient email address |
| `visit_type` | string | Yes | Type of visit (e.g., "Initial Consultation") |
| `patient_phone` | string | No | Patient phone (for SMS) |
| `patient_name` | string | No | Patient full name (default: "Valued Patient") |
| `visit_date` | ISO 8601 | No | Visit timestamp (default: now) |
| `provider_name` | string | No | Provider name (default: "Your Provider") |
| `trace_id` | string | No | Tracking ID from previous modules |

---

## Output Schema

### Main Sequence Response (Node 522)

```json
{
  "success": true,
  "trace_id": "FU-1737072000000",
  "patient_id": "12345",
  "sequence_status": "completed",
  "touches_sent": [
    "day0_email",
    "day0_sms",
    "day3_email",
    "day3_sms",
    "day7_survey_email",
    "day7_survey_sms",
    "day14_rebook_email"
  ],
  "message": "Follow-up sequence initiated successfully"
}
```

### Survey Response (Node 521)

```json
{
  "success": true,
  "trace_id": "FU-1737072000000",
  "patient_id": "12345",
  "nps_score": 9,
  "nps_category": "promoter",
  "feedback_received": true,
  "timestamp": "2025-01-22T10:30:00Z"
}
```

### Error Response (Node 503)

```json
{
  "success": false,
  "error": "Missing required fields: patient_id, patient_email, visit_type",
  "trace_id": "FU-1737072000000"
}
```

---

## Installation

### 1. Import Workflow

```bash
# Option A: n8n UI
1. Open n8n
2. Click "Import from File"
3. Select Aigent_Module_05_Followup_Retention.json
4. Click "Import"

# Option B: n8n CLI
n8n import:workflow --input=Aigent_Module_05_Followup_Retention.json
```

### 2. Configure Environment Variables

```bash
# Copy example file
cp .env.aigent_module_05_example .env

# Edit with your credentials
nano .env

# Load into n8n
n8n start --env-file=.env
```

### 3. Set Up Credentials

#### Email API (SendGrid example)
```bash
n8n credentials:create \
  --type=httpHeaderAuth \
  --name="SendGrid API" \
  --data='{"name":"Authorization","value":"Bearer YOUR_SENDGRID_API_KEY"}'
```

#### SMS API (Twilio example)
```bash
n8n credentials:create \
  --type=httpBasicAuth \
  --name="Twilio API" \
  --data='{"user":"YOUR_ACCOUNT_SID","password":"YOUR_AUTH_TOKEN"}'
```

#### HubSpot OAuth2
```bash
n8n credentials:create \
  --type=hubspotOAuth2Api \
  --name="HubSpot OAuth2 API"
# Follow OAuth flow in browser
```

#### Google Sheets Service Account
```bash
n8n credentials:create \
  --type=googleSheetsServiceAccountApi \
  --name="Google Sheets Service Account" \
  --data='{"email":"YOUR_SERVICE_ACCOUNT_EMAIL","privateKey":"YOUR_PRIVATE_KEY"}'
```

### 4. Activate Workflow

```bash
# Via CLI
n8n workflow:activate --id=MODULE_05_WORKFLOW_ID

# Via UI
Click "Active" toggle in workflow editor
```

---

## Configuration

### Timing Configuration

Adjust follow-up delays in `.env`:

```bash
# Default: 72 hours (3 days)
FOLLOWUP_DAY3_DELAY_HOURS=72

# Default: 96 hours (7 days total from visit)
FOLLOWUP_DAY7_DELAY_HOURS=96

# Default: 168 hours (14 days total from visit)
FOLLOWUP_DAY14_DELAY_HOURS=168
```

**Example custom timing:**
```bash
# Accelerated sequence for time-sensitive specialties
FOLLOWUP_DAY3_DELAY_HOURS=24    # Day-1 check-in
FOLLOWUP_DAY7_DELAY_HOURS=72    # Day-4 survey
FOLLOWUP_DAY14_DELAY_HOURS=168  # Day-11 rebooking
```

### Message Customization

#### Day-0: Thank You (Nodes 505, 506)

**Email subject:**
```
Thank you for your visit - {{$json.clinic_name}}
```

**Email body:**
```
Hi {{$json.patient_name}},

Thank you for choosing {{$json.clinic_name}} for your {{$json.visit_type}} visit on {{$formatDate($json.visit_date, 'MMM d, yyyy')}}. We appreciate your trust in our care.

If you have any questions or concerns, please don't hesitate to reach out to our team.

Warm regards,
{{$json.provider_name}} and the {{$json.clinic_name}} Team
```

**SMS body:**
```
Hi {{$json.patient_name}}, thank you for your visit to {{$json.clinic_name}} today! We appreciate you. - {{$json.provider_name}}
```

#### Day-3: Check-In (Nodes 508, 509)

**Email subject:**
```
How are you feeling? - {{$json.clinic_name}}
```

**Email body:**
```
Hi {{$json.patient_name}},

It's been a few days since your {{$json.visit_type}} visit with us. We wanted to check in and see how you're feeling.

If you have any questions about your visit or your care plan, we're here to help. Just reply to this email or give us a call.

Take care,
{{$json.provider_name}} and the {{$json.clinic_name}} Team
```

#### Day-7: Survey (Nodes 511, 512)

**Email subject:**
```
We'd love your feedback - {{$json.clinic_name}}
```

**Email body:**
```
Hi {{$json.patient_name}},

Your feedback helps us improve our care. Would you take 2 minutes to share your experience?

Survey Link: {{$env.SURVEY_BASE_URL}}?email={{$json.patient_email}}&patient_id={{$json.patient_id}}&trace_id={{$json.trace_id}}

Thank you for helping us serve you better!

Best,
{{$json.provider_name}} and the {{$json.clinic_name}} Team
```

#### Day-14: Rebooking (Node 514)

**Email subject:**
```
Ready to book your next visit? - {{$json.clinic_name}}
```

**Email body:**
```
Hi {{$json.patient_name}},

We hope you're doing well! If you're ready for your next {{$json.visit_type}} visit or need any follow-up care, we'd love to see you again.

Book your next appointment here: {{$json.rebooking_link}}?utm_source=followup&utm_medium=email&utm_campaign=day14_rebook

Looking forward to caring for you again,
{{$json.provider_name}} and the {{$json.clinic_name}} Team
```

---

## Follow-Up Sequence

### Sequence Timeline

```
Day-0 (Immediate)
├── Thank You Email
└── Thank You SMS

    ⏰ Wait 72 hours

Day-3
├── Check-In Email
└── Check-In SMS

    ⏰ Wait 96 hours (7 days total)

Day-7
├── Survey Email
└── Survey SMS

    ⏰ Wait 168 hours (14 days total)

Day-14
└── Rebooking Email
```

### Wait Node Execution

**Important:** Wait nodes pause the workflow execution and resume after the specified time. Ensure:

1. **Webhook IDs are unique:**
   ```bash
   WAIT_WEBHOOK_DAY3=unique_id_1
   WAIT_WEBHOOK_DAY7=unique_id_2
   WAIT_WEBHOOK_DAY14=unique_id_3
   ```

2. **n8n execution timeout is disabled:**
   ```bash
   # In n8n settings
   EXECUTIONS_TIMEOUT=-1
   ```

3. **Database persistence is enabled:**
   ```bash
   # Use PostgreSQL or MySQL (not SQLite) for production
   DB_TYPE=postgresdb
   DB_POSTGRESDB_HOST=localhost
   DB_POSTGRESDB_DATABASE=n8n
   ```

### Execution Flow

1. **Trigger:** Webhook receives `invoice_record.json` from Module 04
2. **Validation:** Check required fields (`patient_id`, `patient_email`, `visit_type`)
3. **Preparation:** Initialize tracking variables and generate `trace_id`
4. **Day-0 Touch:** Send thank you email and SMS in parallel
5. **Wait 72h:** Execution pauses, stored in database
6. **Resume Day-3:** Send check-in email and SMS
7. **Wait 96h:** Execution pauses again
8. **Resume Day-7:** Send survey email and SMS
9. **Wait 168h:** Final pause
10. **Resume Day-14:** Send rebooking email
11. **Complete:** Return confirmation response

---

## Survey Integration

### Supported Providers

- **Typeform** (recommended)
- **Google Forms**
- **SurveyMonkey** (custom integration)
- **Jotform** (custom integration)

### Typeform Setup

#### 1. Create Form

1. Go to [Typeform.com](https://typeform.com)
2. Create new form with:
   - **NPS question:** "How likely are you to recommend us? (0-10)"
     - Type: Opinion Scale (0-10)
     - Field name: `nps_score`
   - **Feedback question:** "What could we improve?"
     - Type: Long Text
     - Field name: `feedback_text`

#### 2. Add Hidden Fields

```
Settings → Hidden Fields:
- email
- patient_id
- trace_id
```

#### 3. Configure Webhook

```
Connect → Webhooks → Add webhook:
URL: https://your-n8n-instance.com/webhook/aigent-survey-response
```

#### 4. Set Environment Variables

```bash
SURVEY_PROVIDER=typeform
SURVEY_BASE_URL=https://form.typeform.com/to/YOUR_FORM_ID
TYPEFORM_FORM_ID=YOUR_FORM_ID
TYPEFORM_API_KEY=tfp_your_api_key_here
```

### Google Forms Setup

#### 1. Create Form

1. Go to [Google Forms](https://forms.google.com)
2. Create new form with:
   - **NPS question:** "How likely are you to recommend us? (0-10)"
     - Type: Linear Scale (0-10)
   - **Feedback question:** "What could we improve?"
     - Type: Paragraph

#### 2. Add Hidden Fields

Use URL parameters for tracking:
```
https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?entry.123456789={email}&entry.987654321={patient_id}&entry.111111111={trace_id}
```

**Find entry IDs:**
1. Open form in edit mode
2. Right-click question → Inspect
3. Find `entry.XXXXXX` in HTML

#### 3. Configure Response Webhook

Google Forms doesn't have native webhooks. Use Google Apps Script:

```javascript
function onFormSubmit(e) {
  var responses = e.response.getItemResponses();
  var data = {
    email: e.response.getRespondentEmail(),
    entry: {}
  };

  responses.forEach(function(response) {
    var fieldName = response.getItem().getTitle();
    data.entry[fieldName] = response.getResponse();
  });

  UrlFetchApp.fetch('https://your-n8n-instance.com/webhook/aigent-survey-response', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data)
  });
}
```

**Install trigger:**
1. Tools → Script Editor
2. Paste code above
3. Edit → Current project's triggers
4. Add trigger: `onFormSubmit` on "Form submit"

#### 4. Set Environment Variables

```bash
SURVEY_PROVIDER=google_forms
SURVEY_BASE_URL=https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform
```

### Survey Response Parsing (Node 516)

The workflow automatically parses responses from both providers:

```javascript
const surveyProvider = $env.SURVEY_PROVIDER || 'typeform';
const response = $input.item.json.body;

let email, patientId, traceId, nps, feedback;

if (surveyProvider === 'typeform') {
  email = response.form_response?.hidden?.email;
  patientId = response.form_response?.hidden?.patient_id;
  traceId = response.form_response?.hidden?.trace_id;

  const answers = response.form_response?.answers || [];
  const npsAnswer = answers.find(a => a.type === 'number' || a.type === 'opinion_scale');
  nps = npsAnswer?.number || npsAnswer?.opinion_scale;

  const feedbackAnswer = answers.find(a => a.type === 'text' || a.type === 'long_text');
  feedback = feedbackAnswer?.text;

} else if (surveyProvider === 'google_forms') {
  email = response.entry?.['entry.email'];
  patientId = response.entry?.['entry.patient_id'];
  traceId = response.entry?.['entry.trace_id'];
  nps = parseInt(response.entry?.['entry.nps']);
  feedback = response.entry?.['entry.feedback'];
}
```

---

## NPS Scoring

### What is NPS?

**Net Promoter Score (NPS)** measures customer loyalty on a 0-10 scale:

- **0-6:** Detractors (unhappy, may churn)
- **7-8:** Passives (satisfied but not enthusiastic)
- **9-10:** Promoters (loyal advocates)

**Calculation:**
```
NPS = (% Promoters) - (% Detractors)
```

### Automatic Classification (Node 516)

```javascript
let npsCategory = null;
if (nps !== null) {
  if (nps >= 9) npsCategory = 'promoter';
  else if (nps >= 7) npsCategory = 'passive';
  else npsCategory = 'detractor';
}
```

### Low NPS Alerting (Nodes 517-518)

Patients with NPS < 7 trigger immediate staff alerts:

```
Condition: NPS Score < 7
Action: Send Slack message to #patient-feedback channel
```

**Alert format:**
```
:warning: Low NPS Alert:
Patient 12345 gave NPS score of 4 (detractor).
Feedback: "Wait time was too long and staff seemed rushed."
Trace ID: FU-1737072000000
```

**Configure threshold:**
```bash
# Default: 7
NPS_LOW_THRESHOLD=7

# More sensitive (alerts for passives too)
NPS_LOW_THRESHOLD=9
```

### CRM NPS Sync (Node 519)

Survey data updates CRM contact properties:

| CRM Field | Value |
|-----------|-------|
| `nps_score` | 9 |
| `nps_category` | "promoter" |
| `last_survey_date` | "2025-01-22T10:30:00Z" |
| `followup_sequence_status` | "survey_completed" |

---

## CRM Integration

### Supported CRMs

- **HubSpot** (native)
- **Salesforce** (native)
- **Zoho CRM** (native)
- **Pipedrive** (native)

### HubSpot Configuration

#### 1. Create Custom Properties

```bash
# In HubSpot Settings → Properties → Contacts
1. NPS Score (Number, 0-10)
2. NPS Category (Dropdown: promoter, passive, detractor)
3. Last Survey Date (Date picker)
4. Follow-up Sequence Status (Dropdown: initiated, survey_completed, etc.)
```

#### 2. Set Environment Variables

```bash
CRM_PROVIDER=hubspot
CRM_CREDENTIAL_ID=your_hubspot_credential_id
CRM_CREDENTIAL_NAME=HubSpot OAuth2 API
HUBSPOT_API_KEY=pat-na1-your-private-app-token

# Field mapping
CRM_FIELD_NPS_SCORE=nps_score
CRM_FIELD_NPS_CATEGORY=nps_category
CRM_FIELD_LAST_SURVEY_DATE=last_survey_date
CRM_FIELD_FOLLOWUP_STATUS=followup_sequence_status
```

#### 3. Create Private App (for API key)

```
Settings → Integrations → Private Apps → Create:
Name: Aigent Module 05
Scopes:
- crm.objects.contacts.read
- crm.objects.contacts.write
```

### Salesforce Configuration

#### 1. Create Custom Fields

```sql
-- In Salesforce Setup → Object Manager → Contact → Fields
NPS_Score__c (Number, 0-10)
NPS_Category__c (Picklist: Promoter, Passive, Detractor)
Last_Survey_Date__c (Date/Time)
Followup_Sequence_Status__c (Picklist: Initiated, Survey Completed)
```

#### 2. Set Environment Variables

```bash
CRM_PROVIDER=salesforce
CRM_CREDENTIAL_ID=your_salesforce_credential_id
SALESFORCE_INSTANCE_URL=https://yourinstance.salesforce.com
SALESFORCE_API_VERSION=v57.0

# Field mapping (use API names with __c)
CRM_FIELD_NPS_SCORE=NPS_Score__c
CRM_FIELD_NPS_CATEGORY=NPS_Category__c
CRM_FIELD_LAST_SURVEY_DATE=Last_Survey_Date__c
CRM_FIELD_FOLLOWUP_STATUS=Followup_Sequence_Status__c
```

---

## Platform Setup Guides

### Slack Integration

#### 1. Create Incoming Webhook

```
Slack Workspace → Apps → Incoming Webhooks → Add to Slack
1. Choose channel: #patient-feedback
2. Copy webhook URL
```

#### 2. Configure Environment

```bash
ALERT_PROVIDER=slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_ALERT_CHANNEL=#patient-feedback
SLACK_BOT_NAME=Aigent Feedback Bot
```

### Microsoft Teams Integration

#### 1. Create Incoming Webhook

```
Teams Channel → Connectors → Incoming Webhook → Configure
1. Name: Aigent Feedback Bot
2. Upload icon (optional)
3. Copy webhook URL
```

#### 2. Configure Environment

```bash
ALERT_PROVIDER=microsoft_teams
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR_WEBHOOK_URL
```

### Google Sheets Logging

#### 1. Create Service Account

```bash
# In Google Cloud Console
1. APIs & Services → Credentials → Create Credentials → Service Account
2. Name: Aigent Module 05
3. Grant role: Editor
4. Create key (JSON)
5. Download key file
```

#### 2. Create Google Sheet

```
1. Create new sheet: "Aigent Survey Responses"
2. Add headers:
   - Timestamp
   - Patient ID
   - Email
   - NPS Score
   - NPS Category
   - Feedback
   - Trace ID
   - Survey Provider
3. Share sheet with service account email
```

#### 3. Configure Environment

```bash
LOG_PROVIDER=google_sheets
GSHEET_CREDENTIAL_ID=your_gsheet_credential_id
GSHEET_SURVEY_LOG_ID=1ABCDefGHIJKlmnOPQRSTUVwxyZ123456789
GSHEET_SURVEY_SHEET_NAME=Survey_Responses
```

---

## Testing

### Test Mode

Enable test mode to override all communication endpoints:

```bash
TEST_MODE=true
TEST_EMAIL_OVERRIDE=test@yourclinic.com
TEST_PHONE_OVERRIDE=+15559999999
```

All emails and SMS will be sent to test addresses instead of real patients.

### Manual Testing

#### 1. Test Main Sequence

```bash
curl -X POST https://your-n8n-instance.com/webhook/aigent-followup \
  -H "Content-Type: application/json" \
  -d '{
    "trace_id": "TEST-001",
    "patient_id": "test_patient_123",
    "patient_email": "test@example.com",
    "patient_phone": "+15551234567",
    "patient_name": "Test Patient",
    "visit_type": "Test Visit",
    "visit_date": "2025-01-15T14:30:00Z",
    "provider_name": "Dr. Test Provider"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "trace_id": "TEST-001",
  "patient_id": "test_patient_123",
  "sequence_status": "completed",
  "touches_sent": ["day0_email", "day0_sms", ...],
  "message": "Follow-up sequence initiated successfully"
}
```

#### 2. Test Survey Response (Promoter)

```bash
curl -X POST https://your-n8n-instance.com/webhook/aigent-survey-response \
  -H "Content-Type: application/json" \
  -d '{
    "form_response": {
      "hidden": {
        "email": "test@example.com",
        "patient_id": "test_patient_123",
        "trace_id": "TEST-001"
      },
      "answers": [
        {
          "type": "opinion_scale",
          "opinion_scale": 10
        },
        {
          "type": "text",
          "text": "Excellent experience!"
        }
      ]
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "trace_id": "TEST-001",
  "patient_id": "test_patient_123",
  "nps_score": 10,
  "nps_category": "promoter",
  "feedback_received": true
}
```

#### 3. Test Survey Response (Detractor - triggers alert)

```bash
curl -X POST https://your-n8n-instance.com/webhook/aigent-survey-response \
  -H "Content-Type: application/json" \
  -d '{
    "form_response": {
      "hidden": {
        "email": "test@example.com",
        "patient_id": "test_patient_123",
        "trace_id": "TEST-001"
      },
      "answers": [
        {
          "type": "opinion_scale",
          "opinion_scale": 4
        },
        {
          "type": "text",
          "text": "Long wait time and staff was not attentive."
        }
      ]
    }
  }'
```

**Expected behavior:**
- Slack alert sent to #patient-feedback
- CRM updated with NPS = 4, category = "detractor"
- Google Sheets log entry created

### Automated Testing

See [Aigent_Module_05_Testing_Guide.md](./Aigent_Module_05_Testing_Guide.md) for comprehensive test suite.

---

## Troubleshooting

### Common Issues

#### 1. Wait Nodes Not Resuming

**Symptom:** Workflow pauses at wait node and never resumes.

**Causes:**
- Execution timeout too short
- SQLite database (use PostgreSQL/MySQL)
- Missing webhook IDs

**Fix:**
```bash
# .env
EXECUTIONS_TIMEOUT=-1
DB_TYPE=postgresdb

# Ensure unique webhook IDs
WAIT_WEBHOOK_DAY3=aigent_wait_day3_unique_id_1
WAIT_WEBHOOK_DAY7=aigent_wait_day7_unique_id_2
WAIT_WEBHOOK_DAY14=aigent_wait_day14_unique_id_3
```

#### 2. Survey Webhook Not Receiving Data

**Symptom:** Survey submissions not triggering survey webhook.

**Causes:**
- Webhook URL incorrect in survey provider
- Firewall blocking incoming requests
- HTTPS required (some providers)

**Fix:**
```bash
# Verify webhook URL
echo $WEBHOOK_ID_SURVEY

# Test webhook manually
curl -X POST https://your-n8n-instance.com/webhook/aigent-survey-response \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Check n8n logs
docker logs n8n_container_name | grep aigent-survey-response
```

#### 3. NPS Parsing Fails

**Symptom:** NPS score shows as `null` in CRM.

**Causes:**
- Survey question type mismatch
- Field name incorrect in Typeform/Google Forms
- Response format changed

**Fix:**
```javascript
// Add debug logging to Node 516 (Parse Survey)
console.log('Raw survey response:', JSON.stringify(response, null, 2));

// Verify field names match
SURVEY_PROVIDER=typeform
// Typeform: answers[].type === 'opinion_scale'
// Google Forms: entry['entry.nps']
```

#### 4. Low NPS Alerts Not Sending

**Symptom:** Detractor responses don't trigger Slack alerts.

**Causes:**
- Slack webhook URL incorrect
- Channel doesn't exist
- NPS threshold too low

**Fix:**
```bash
# Test Slack webhook
curl -X POST $SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test alert from Aigent Module 05"}'

# Verify threshold
NPS_LOW_THRESHOLD=7  # Should alert for NPS 0-6

# Check node 517 condition
# Node: "Check If Low NPS"
# Condition: {{$json.needs_attention}} === true
# Set in Node 516: needs_attention = nps < 7
```

#### 5. CRM Updates Fail

**Symptom:** Survey data not syncing to HubSpot/Salesforce.

**Causes:**
- Credential expired
- Custom fields don't exist
- Field mapping incorrect

**Fix:**
```bash
# Verify credential
n8n credentials:list | grep CRM_CREDENTIAL_NAME

# Check field names
# HubSpot: lowercase with underscores (nps_score)
# Salesforce: API names with __c (NPS_Score__c)

# Test CRM API manually
curl -X GET "https://api.hubapi.com/crm/v3/objects/contacts" \
  -H "Authorization: Bearer $HUBSPOT_API_KEY"
```

### Debug Mode

Enable detailed logging:

```bash
DEBUG_MODE=true
LOG_ALL_REQUESTS=true
```

Logs will show:
- All HTTP request/response bodies
- Wait node status
- Survey parsing intermediate steps
- CRM API calls

---

## Security & Compliance

### PHI-Safe Design

This module is designed to be **HIPAA-compliant** by excluding Protected Health Information (PHI):

**Excluded:**
- Diagnosis codes (ICD-10)
- Treatment notes
- Prescription details
- Lab results
- Clinical observations

**Included (safe):**
- Contact information (name, email, phone)
- Visit metadata (date, type, provider name)
- Feedback and satisfaction scores
- Appointment booking links

### Data Retention

Configure retention policies:

```bash
# Default: 365 days
SURVEY_DATA_RETENTION_DAYS=365

# For GDPR compliance (30 days)
SURVEY_DATA_RETENTION_DAYS=30
```

### Opt-Out Mechanism

Include unsubscribe links in all messages:

```bash
OPTOUT_LINK_ENABLED=true
OPTOUT_LINK_URL=https://yourclinic.com/unsubscribe?patient_id={{patient_id}}
```

**Email footer template:**
```
---
If you prefer not to receive follow-up messages, you can unsubscribe here: {{$env.OPTOUT_LINK_URL}}
```

### Credential Security

**Best practices:**
1. Never hardcode credentials in workflow
2. Use n8n credential manager
3. Rotate API keys quarterly
4. Restrict credential access by role
5. Enable audit logging

```bash
# Enable audit logs
N8N_LOG_LEVEL=info
N8N_LOG_OUTPUT=file
N8N_LOG_FILE_LOCATION=/var/log/n8n/audit.log
```

---

## Advanced Customization

### Custom Timing Sequences

#### Example 1: Accelerated Sequence (Urgent Care)

```bash
# Day-0: Immediate
# Day-1: Check-in
FOLLOWUP_DAY3_DELAY_HOURS=24
# Day-3: Survey
FOLLOWUP_DAY7_DELAY_HOURS=48
# Day-7: Rebooking
FOLLOWUP_DAY14_DELAY_HOURS=96
```

#### Example 2: Extended Sequence (Specialty Care)

```bash
# Day-0: Immediate
# Day-7: Check-in
FOLLOWUP_DAY3_DELAY_HOURS=168
# Day-14: Survey
FOLLOWUP_DAY7_DELAY_HOURS=168
# Day-30: Rebooking
FOLLOWUP_DAY14_DELAY_HOURS=384
```

### Adding WhatsApp Support

#### 1. Enable WhatsApp

```bash
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=twilio
WHATSAPP_FROM_NUMBER=whatsapp:+15551234567
```

#### 2. Add WhatsApp Nodes

Duplicate SMS nodes (506, 509, 512) and modify:

```json
{
  "parameters": {
    "url": "https://api.twilio.com/2010-04-01/Accounts/{{$env.SMS_ACCOUNT_SID}}/Messages.json",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "To",
          "value": "whatsapp:{{$json.patient_phone}}"
        },
        {
          "name": "From",
          "value": "{{$env.WHATSAPP_FROM_NUMBER}}"
        },
        {
          "name": "Body",
          "value": "Your message here"
        }
      ]
    }
  },
  "name": "Day-0: Send Thank You WhatsApp"
}
```

### Multi-Language Support

#### Add language detection:

```javascript
// Node 504: Prepare Follow-Up Data
const language = input.preferred_language || 'en';
const translations = {
  en: {
    day0_subject: 'Thank you for your visit',
    day3_subject: 'How are you feeling?'
  },
  es: {
    day0_subject: 'Gracias por su visita',
    day3_subject: '¿Cómo se siente?'
  }
};

return {
  json: {
    ...existingData,
    language: language,
    translations: translations[language]
  }
};
```

#### Update email nodes:

```json
{
  "name": "subject",
  "value": "={{$json.translations.day0_subject}} - {{$json.clinic_name}}"
}
```

### Segmented Follow-Up Logic

Customize sequence based on visit type:

```javascript
// Node 504: Prepare Follow-Up Data
let delays = {
  day3: 72,
  day7: 96,
  day14: 168
};

// Adjust for urgent care
if (input.visit_type === 'Urgent Care') {
  delays = { day3: 24, day7: 48, day14: 96 };
}

// Adjust for surgery follow-up
if (input.visit_type === 'Post-Surgical') {
  delays = { day3: 24, day7: 72, day14: 240 };
}

return { json: { ...existingData, delays } };
```

Then reference in wait nodes:
```json
{
  "amount": "={{$json.delays.day3}}",
  "unit": "hours"
}
```

---

## Support

For issues, questions, or feature requests:

- **GitHub Issues:** [github.com/aigent/universal-clinic-template/issues](https://github.com/aigent/universal-clinic-template/issues)
- **Documentation:** [docs.aigent.com/module-05](https://docs.aigent.com/module-05)
- **Email:** support@aigent.com

---

## License

Copyright 2025 Aigent Company. All rights reserved.

This workflow is part of the Aigent Universal Clinic Template and is licensed for use by Aigent customers only.

---

**Version History:**

- **1.0.0** (2025-01-15): Initial release
  - Multi-touch follow-up sequence (Day-0, Day-3, Day-7, Day-14)
  - Survey integration (Typeform, Google Forms)
  - NPS scoring and low NPS alerts
  - CRM sync and Google Sheets logging
