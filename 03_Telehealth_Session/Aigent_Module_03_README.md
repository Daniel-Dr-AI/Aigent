# Aigent Module 03 – Telehealth Session

**Version:** 1.0.0
**Author:** Aigent Automation Engineering
**Template Type:** Universal Clinic Template
**Status:** Production Ready
**Dependencies:** Module 02 (required)

---

## Overview

The **Telehealth Session** module automates the creation and delivery of secure video consultation sessions for medical practices. It integrates with HIPAA-compliant telehealth platforms (Zoom for Healthcare, Doxy.me, Amwell, Microsoft Teams, Google Meet), generates unique session links, and delivers multi-channel notifications to both patients and providers.

### Key Features

- **Multi-Platform Support:** Works with Zoom for Healthcare, Doxy.me, Amwell, MS Teams, Google Meet
- **Automated Session Creation:** Generates unique session links immediately after appointment booking
- **Dual Notifications:** SMS + comprehensive email to patients with join instructions
- **Provider Alerts:** Email with host link and session credentials
- **Security-First:** Waiting rooms, passwords, enhanced encryption, HIPAA compliance
- **CRM Integration:** Updates contact records with session status and links
- **Audit Logging:** Records all session details for compliance and analytics
- **Module Chaining:** Accepts Module 02 output, triggers Module 04/05 workflows
- **PHI-Safe:** Only handles appointment scheduling data and session metadata

---

## Architecture

### Data Flow
```
Module 02 Output → Webhook → Validate Appointment → Prepare Session Data →
  Create Session (Zoom/Doxy/Amwell) → Format Links → Parallel:
                                                      ├─ Update CRM
                                                      ├─ SMS Patient
                                                      ├─ Email Patient
                                                      ├─ Email Provider
                                                      └─ Log to Data Store
                                                      ↓
                                      Success Response (telehealth_record.json)
```

### Node Breakdown

| Node # | Name | Type | Purpose |
|--------|------|------|---------|
| 301 | Webhook Trigger | Webhook | Accept confirmed appointment from Module 02 |
| 302 | Validate Appointment Data | If | Verify appointment_confirmed=true and required fields |
| 303 | Return Validation Error | Respond to Webhook | 400 error for unconfirmed/invalid appointments |
| 304 | Prepare Session Data | Code | Generate unique session_id and structure data |
| 305 | Create Telehealth Session | HTTP Request | Create meeting in telehealth platform |
| 306 | Format Session Links | Code | Extract and normalize patient/host URLs |
| 307 | Update CRM | HubSpot | Mark telehealth status and store links |
| 308 | Send Patient SMS | Twilio | Text with join link and password |
| 309 | Send Patient Email | SendGrid | Comprehensive HTML email with instructions |
| 310 | Send Provider Email | SendGrid | Host link and session credentials |
| 311 | Log Session | Google Sheets | Audit trail and analytics |
| 312 | Merge All Notifications | Merge | Consolidate delivery statuses |
| 313 | Return Success Response | Respond to Webhook | 200 with telehealth_record.json |
| 314 | Error Handler | NoOp | Catch execution errors |

---

## Installation

### 1. Import Workflow

In your n8n instance:
1. Navigate to **Workflows** → **Import from File**
2. Select `Aigent_Module_03_Telehealth_Session.json`
3. Click **Import**

### 2. Configure Credentials

Create the following credentials in n8n:

#### Zoom for Healthcare (Recommended)
- **Type:** OAuth2 API
- **Name:** `Zoom for Healthcare OAuth`
- **Authorization URL:** `https://zoom.us/oauth/authorize`
- **Access Token URL:** `https://zoom.us/oauth/token`
- **Client ID:** From Zoom Marketplace app
- **Client Secret:** From Zoom Marketplace app
- **Scope:** `meeting:write`, `meeting:read`, `user:read`
- **Auth URI Query Parameters:** `account_id=[YOUR_ACCOUNT_ID]`

**Important:** Zoom for Healthcare requires a **Business Associate Agreement (BAA)** for HIPAA compliance. Standard Zoom accounts are NOT compliant.

#### Doxy.me (Alternative)
- **Type:** HTTP Header Auth
- **Name:** `Doxy.me API Key`
- **Header:** `Authorization`
- **Value:** `Bearer YOUR_DOXYEME_API_KEY`

#### Amwell (Alternative)
- **Type:** OAuth2 API
- **Name:** `Amwell OAuth`
- **Authorization URL:** `https://api.amwell.com/oauth/authorize`
- **Access Token URL:** `https://api.amwell.com/oauth/token`
- **Client ID:** From Amwell developer portal
- **Client Secret:** From Amwell developer portal

#### CRM (HubSpot)
- **Type:** HubSpot API
- **Name:** `HubSpot Account`
- **API Key/OAuth:** Configure per HubSpot documentation

#### SMS (Twilio)
- **Type:** Twilio API
- **Name:** `Twilio Account`
- **Account SID:** From Twilio console
- **Auth Token:** From Twilio console

**Important:** Twilio HIPAA compliance requires a **Business Associate Agreement**. Enable HIPAA-eligible features in Twilio console.

#### Email (SendGrid)
- **Type:** SendGrid API
- **Name:** `SendGrid API`
- **API Key:** From SendGrid settings

#### Data Store (Google Sheets)
- **Type:** Google Sheets OAuth2 API
- **Name:** `Google Sheets OAuth`
- **Scopes:** `spreadsheets`

### 3. Configure Environment Variables

Copy `.env.aigent_module_03_example` to your n8n environment:

**Docker/Docker Compose:**
```bash
# Add to docker-compose.yml under n8n service:
environment:
  # Telehealth Platform
  - TELEHEALTH_PROVIDER_NAME=Zoom
  - TELEHEALTH_API_BASE_URL=https://api.zoom.us/v2
  - TELEHEALTH_CREDENTIAL_ID=20
  - TELEHEALTH_MEETING_TYPE=2
  - DEFAULT_SESSION_DURATION=30

  # Security Settings
  - ENABLE_WAITING_ROOM=true
  - ENABLE_AUTO_RECORDING=false
  - ALLOW_JOIN_BEFORE_HOST=false
  - REQUIRE_SESSION_PASSWORD=true

  # CRM
  - HUBSPOT_CREDENTIAL_ID=1

  # Notifications
  - TWILIO_CREDENTIAL_ID=15
  - TWILIO_FROM_NUMBER=+15551234567
  - SENDGRID_CREDENTIAL_ID=17
  - SENDGRID_FROM_EMAIL=telehealth@yourclinic.com

  # Clinic Info
  - CLINIC_NAME=Your Clinic Name
  - CLINIC_ID=clinic-001
  - CLINIC_PHONE=+1 (555) 123-4567
  - CLINIC_EMAIL=info@yourclinic.com
  - CLINIC_TIMEZONE=America/New_York
  - PROVIDER_EMAIL=provider@yourclinic.com

  # Data Store
  - GOOGLE_SHEET_ID=YOUR_SHEET_ID
  - GOOGLE_SHEETS_CREDENTIAL_ID=6

  # ... (add all required variables)
```

### 4. Configure Telehealth Platform

#### Zoom for Healthcare Setup

1. **Create Zoom App:**
   - Go to [Zoom Marketplace](https://marketplace.zoom.us)
   - Click **Develop** → **Build App**
   - Select **Server-to-Server OAuth** app type
   - Fill in app name, description, company name

2. **Configure Scopes:**
   - Add scopes: `meeting:write:admin`, `meeting:read:admin`, `user:read:admin`

3. **Obtain Credentials:**
   - Copy **Account ID**, **Client ID**, **Client Secret**
   - Add to n8n OAuth2 credential

4. **Enable HIPAA Features:**
   - In Zoom Admin dashboard: **Account Management** → **Account Settings**
   - Enable **Enhanced encryption**, **Waiting room**, **Password**
   - Sign **Business Associate Agreement**

5. **Environment Configuration:**
```bash
TELEHEALTH_PROVIDER_NAME=Zoom
TELEHEALTH_API_BASE_URL=https://api.zoom.us/v2
ZOOM_ACCOUNT_ID=YOUR_ACCOUNT_ID
ZOOM_BAA_ENABLED=true
ZOOM_ENCRYPTION_TYPE=enhanced_encryption
```

#### Doxy.me Setup

1. **Sign up for Doxy.me HIPAA Plan:**
   - Visit [doxy.me](https://doxy.me) and create account
   - Upgrade to HIPAA-compliant plan
   - Sign Business Associate Agreement

2. **Generate API Key:**
   - Navigate to **Settings** → **API Access**
   - Generate new API key
   - Add to n8n HTTP Header Auth credential

3. **Configure Clinic:**
   - Set clinic name (used in room URLs)
   - Configure room settings (PIN requirement, waiting room)

4. **Environment Configuration:**
```bash
TELEHEALTH_PROVIDER_NAME=Doxy.me
TELEHEALTH_API_BASE_URL=https://api.doxy.me/api/v1
DOXYEME_CLINIC_NAME=yourclinic
DOXYEME_PIN_REQUIRED=true
```

#### Amwell Setup

1. **Register with Amwell:**
   - Contact [Amwell](https://business.amwell.com) for provider onboarding
   - Complete credentialing process

2. **Obtain API Credentials:**
   - Access Amwell Developer Portal
   - Create OAuth application
   - Copy Client ID and Secret

3. **Environment Configuration:**
```bash
TELEHEALTH_PROVIDER_NAME=Amwell
TELEHEALTH_API_BASE_URL=https://api.amwell.com/v1
AMWELL_PROVIDER_ID=YOUR_PROVIDER_ID
AMWELL_ORGANIZATION_ID=YOUR_ORG_ID
```

### 5. Create Google Sheet for Logging

1. Create new Google Sheet named "Telehealth Sessions"
2. Add header row:
   ```
   timestamp | session_id | appointment_id | platform_meeting_id | patient_name | patient_email | provider_name | scheduled_time | duration | platform | session_link | host_link | status | created_at
   ```
3. Share sheet with Google service account (from n8n credential)
4. Copy Sheet ID from URL: `docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
5. Add to environment: `GOOGLE_SHEET_ID=YOUR_SHEET_ID`

### 6. Activate Workflow

1. Open the imported workflow
2. Verify all credential references resolve (green checkmarks)
3. Click **Active** toggle in top-right corner
4. Copy the webhook URL from the **Webhook Trigger** node

---

## Usage

### Input Schema

#### From Module 02 (Automatic Chain)
Module 02 success response automatically includes required fields:

```json
{
  "appointment_confirmed": true,
  "appointment_id": "cal_abc123",
  "patient_name": "Jane Doe",
  "patient_email": "jane.doe@example.com",
  "patient_phone": "+1-555-123-4567",
  "scheduled_time": "2025-11-05T14:00:00.000Z",
  "service_type": "General Consultation",
  "provider_name": "Dr. Smith",
  "contact_id": "12345"
}
```

#### Standalone/Manual Trigger
Send POST request to webhook URL:

```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "cal_abc123",
    "patient_name": "Jane Doe",
    "patient_email": "jane.doe@example.com",
    "patient_phone": "+1-555-123-4567",
    "scheduled_time": "2025-11-05T14:00:00.000Z",
    "service_type": "General Consultation",
    "provider_name": "Dr. Smith",
    "contact_id": "12345"
  }'
```

**Field Specifications**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `appointment_confirmed` | Boolean | Yes | Must be `true` | Prevents session creation for cancelled appointments |
| `appointment_id` | String | Yes | Not empty | Unique appointment identifier from Module 02 |
| `patient_name` | String | Yes | Not empty | Patient full name |
| `patient_email` | String | Yes | Email format | Patient email for session link delivery |
| `patient_phone` | String | No | E.164 format | Patient phone for SMS notification |
| `scheduled_time` | String | Yes | ISO 8601 | Appointment date/time (UTC or with timezone) |
| `service_type` | String | No | - | Type of consultation (appears in session topic) |
| `provider_name` | String | No | - | Provider name (defaults to `DEFAULT_PROVIDER_NAME`) |
| `contact_id` | String | No | - | CRM contact ID for updates (from Module 01/02) |

### Success Response (200)

```json
{
  "success": true,
  "message": "Telehealth session created successfully",
  "session_id": "clinic-001_cal_abc123_1730217600000",
  "session_link": "https://zoom.us/j/1234567890?pwd=abcdef123456",
  "host_link": "https://zoom.us/s/1234567890?zak=host_token_xyz",
  "session_password": "secure123",
  "scheduled_time": "2025-11-05T14:00:00.000Z",
  "scheduled_time_formatted": "Tuesday, November 5, 2025 at 2:00 PM",
  "duration": 30,
  "patient_email": "jane.doe@example.com",
  "patient_name": "Jane Doe",
  "provider_name": "Dr. Smith",
  "provider": "Zoom",
  "platform_meeting_id": "1234567890",
  "metadata": {
    "crm_updated": true,
    "patient_sms_sent": true,
    "patient_email_sent": true,
    "provider_email_sent": true,
    "logged": true,
    "sms_sid": "SM1234567890abcdef",
    "patient_email_id": "msg_xyz789",
    "provider_email_id": "msg_abc456"
  },
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

### Error Responses

#### Validation Error (400 - Appointment Not Confirmed)
```json
{
  "success": false,
  "error": "Appointment not confirmed or missing required data",
  "message": "Cannot create telehealth session for unconfirmed appointment. Required: appointment_id, patient_email, scheduled_time, appointment_confirmed=true",
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

#### Platform API Error (500)
```json
{
  "success": false,
  "error": "Telehealth platform API error",
  "message": "Failed to create session in Zoom. Please try again or contact support.",
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

---

## Configuration

### Switching Telehealth Platforms

#### From Zoom to Doxy.me

1. **Update Environment Variables:**
```bash
TELEHEALTH_PROVIDER_NAME=Doxy.me
TELEHEALTH_API_BASE_URL=https://api.doxy.me/api/v1
DOXYEME_CLINIC_NAME=yourclinic
TELEHEALTH_CREDENTIAL_ID=21
```

2. **Modify Node 305 (Create Telehealth Session):**
   - Change credential type to HTTP Header Auth
   - Update URL to: `={{$env.TELEHEALTH_API_BASE_URL}}/rooms`
   - Update body parameters:
     ```json
     {
       "room_name": "={{ $json.session_id }}",
       "display_name": "={{ $json.patient.name }}",
       "pin": "={{ $json.settings.password_required ? Math.floor(1000 + Math.random() * 9000) : null }}",
       "waiting_room": "={{ $json.settings.waiting_room }}"
     }
     ```

3. **Modify Node 306 (Format Session Links):**
   - Doxy.me URL format: `https://doxy.me/{clinic_name}/{room_name}`
   - Host URL: Add `?provider=true` parameter

#### From Zoom to Microsoft Teams

1. **Create Microsoft Graph API Credential:**
   - Type: OAuth2 API
   - Scopes: `Calendars.ReadWrite`, `OnlineMeetings.ReadWrite`

2. **Update Environment:**
```bash
TELEHEALTH_PROVIDER_NAME=Microsoft Teams
TELEHEALTH_API_BASE_URL=https://graph.microsoft.com/v1.0
MS_TEAMS_TENANT_ID=YOUR_TENANT_ID
```

3. **Replace Node 305 with Graph API call:**
```javascript
// POST /users/{userId}/onlineMeetings
{
  "startDateTime": $json.start_time,
  "endDateTime": DateTime.fromISO($json.start_time).plus({minutes: $json.duration}).toISO(),
  "subject": $json.topic,
  "participants": {
    "attendees": [
      {
        "identity": {
          "user": {
            "displayName": $json.patient.name,
            "id": null
          }
        }
      }
    ]
  }
}
```

### Customizing Session Security

#### Enable Enhanced Security Mode

```bash
# .env configuration
ENABLE_WAITING_ROOM=true
REQUIRE_SESSION_PASSWORD=true
ALLOW_JOIN_BEFORE_HOST=false
ENABLE_E2E_ENCRYPTION=true
ZOOM_MUTE_ON_ENTRY=true
```

**Effect:**
- Patients wait in virtual lobby until provider admits them
- Password required to join
- Provider must start session before patients can join
- End-to-end encryption (where supported)
- Patients muted on entry

#### Disable Security for Convenience

```bash
# .env configuration
ENABLE_WAITING_ROOM=false
REQUIRE_SESSION_PASSWORD=false
ALLOW_JOIN_BEFORE_HOST=true
```

**Effect:**
- Patients join directly (no waiting)
- No password required
- Patients can enter before provider

**Warning:** Less secure configuration. Only use for low-risk consultations or when patient experience is prioritized over security.

### Customizing Session Duration

```bash
# Default duration for all sessions
DEFAULT_SESSION_DURATION=30

# Or pass duration in appointment data
{
  "duration": 60  # Override default for specific appointment
}
```

### Customizing Notifications

#### SMS Template (Node 308)

```javascript
=Hi {{ $json.patient_name.split(' ')[0] }},

Your virtual visit is confirmed!

📅 {{ DateTime.fromISO($json.scheduled_time).toFormat('EEE, MMM d') }}
🕐 {{ DateTime.fromISO($json.scheduled_time).toFormat('h:mm a') }}
👨‍⚕️ {{ $json.provider_name }}

🔗 Join here:
{{ $json.session_link }}

{{ $json.session_password ? '🔑 Password: ' + $json.session_password : '' }}

💡 Tips:
• Join 5 min early
• Use Chrome browser
• Have ID & insurance card ready

Questions? {{ $env.CLINIC_PHONE }}

- {{ $env.CLINIC_NAME }}
```

#### Email Template Customization (Node 309)

**Brand Colors:**
```html
<div class="header" style="background: {{$env.BRAND_PRIMARY_COLOR || '#4F46E5'}};">
```

**Add Clinic Logo:**
```html
<div class="header">
  <img src="{{$env.CLINIC_LOGO_URL}}" alt="{{$env.CLINIC_NAME}}" style="max-width: 200px; margin-bottom: 15px;">
  <h1>Your Telehealth Appointment</h1>
</div>
```

**Add Custom Instructions:**
```html
<div class="instructions">
  <strong>📋 Before Your Appointment:</strong>
  <ul>
    <li>Complete pre-visit questionnaire: {{$env.PRE_VISIT_FORM_URL}}</li>
    <li>Upload insurance card photos: {{$env.INSURANCE_UPLOAD_URL}}</li>
    <li>Prepare list of current medications</li>
  </ul>
</div>
```

### Business Rules Configuration

#### Restrict Session Creation Window

Prevent sessions from being created too far in advance or too close to appointment time:

**Modify Node 304 (Prepare Session Data):**
```javascript
// Check if appointment is within acceptable window
const scheduledTime = DateTime.fromISO($input.first().json.body.scheduled_time);
const now = DateTime.now();
const hoursUntilAppointment = scheduledTime.diff(now, 'hours').hours;

const minHours = parseInt($env.MIN_SESSION_CREATE_ADVANCE_HOURS) || 1;
const maxDays = parseInt($env.MAX_SESSION_CREATE_ADVANCE_DAYS) || 7;
const maxHours = maxDays * 24;

if (hoursUntilAppointment < minHours) {
  throw new Error(`Session creation too close to appointment time. Minimum ${minHours} hour(s) advance required.`);
}

if (hoursUntilAppointment > maxHours) {
  throw new Error(`Session creation too far in advance. Maximum ${maxDays} day(s) allowed.`);
}

// Continue with session creation...
```

#### Auto-Generate Session on Appointment Booking

**In Module 02 Success Response (Node 211):**

Add automatic trigger to Module 03:

```javascript
// After successful booking, immediately create telehealth session
if ($env.AUTO_GENERATE_SESSION === 'true') {
  const telehealthPayload = {
    appointment_confirmed: true,
    appointment_id: $json.appointment_id,
    patient_name: $json.patient_name,
    patient_email: $json.patient_email,
    patient_phone: $json.body.phone,
    scheduled_time: $json.scheduled_time,
    service_type: $json.service_type,
    provider_name: $env.DEFAULT_PROVIDER_NAME,
    contact_id: $json.body.contact_id
  };

  await $http.post($env.MODULE_03_WEBHOOK_URL, telehealthPayload);
}
```

---

## Integrations

### Chaining with Module 02 (Booking)

**Method 1: Automatic Trigger (Recommended)**

In Module 02 Node 211 (Return Success Response), add webhook call:

```javascript
// After appointment booked, create telehealth session
const response = await $http.post($env.MODULE_03_WEBHOOK_URL, {
  appointment_confirmed: true,
  appointment_id: $json.appointment_id,
  patient_name: $json.patient_name,
  patient_email: $json.patient_email,
  patient_phone: $('Webhook Trigger - Booking Request').first().json.body.phone,
  scheduled_time: $json.scheduled_time,
  service_type: $json.service_type,
  provider_name: $env.DEFAULT_PROVIDER_NAME || 'Provider',
  contact_id: $('Webhook Trigger - Booking Request').first().json.body.contact_id
});

return {
  ...originalResponse,
  telehealth: {
    session_created: response.success,
    session_id: response.session_id,
    session_link: response.session_link
  }
};
```

**Method 2: Conditional Trigger (For Specific Service Types)**

```javascript
// Only create telehealth for virtual appointments
if ($json.service_type.toLowerCase().includes('telehealth') ||
    $json.service_type.toLowerCase().includes('virtual')) {
  await $http.post($env.MODULE_03_WEBHOOK_URL, telehealthPayload);
}
```

### Triggering Module 04 (Pre-Visit Forms)

**In Module 03 Success Response (Node 313):**

```javascript
// After session created, send pre-visit forms
const preVisitPayload = {
  patient_email: $('Format Session Links').first().json.patient_email,
  patient_name: $('Format Session Links').first().json.patient_name,
  appointment_id: $('Format Session Links').first().json.appointment_id,
  session_id: $('Format Session Links').first().json.session_id,
  scheduled_time: $('Format Session Links').first().json.scheduled_time,
  form_deadline: DateTime.fromISO($('Format Session Links').first().json.scheduled_time).minus({hours: 24}).toISO()
};

await $http.post($env.MODULE_04_WEBHOOK_URL, preVisitPayload);
```

### EMR Integration (eClinicalWorks, Epic, Cerner)

**Method: Create Appointment Note with Telehealth Link**

Add node after session creation to POST to EMR API:

```javascript
// Example: Epic FHIR API
POST /Appointment/{appointmentId}/note
{
  "text": `Telehealth session created.
    Platform: ${$json.provider}
    Session ID: ${$json.session_id}
    Patient Join Link: ${$json.session_link}
    Provider Start Link: ${$json.host_link}
    Password: ${$json.session_password || 'N/A'}`
}
```

---

## Troubleshooting

### Common Issues

#### 1. Session Creation Fails (Zoom API Error)

**Symptom:** "Failed to create meeting" error in execution log

**Solutions:**
- **Check OAuth Token:** Re-authorize Zoom credential in n8n
- **Verify Account ID:** Ensure `ZOOM_ACCOUNT_ID` is correct
- **Check API Scopes:** Credential must have `meeting:write:admin` scope
- **Account Type:** Zoom for Healthcare requires Pro or higher plan
- **Rate Limits:** Zoom limits 100 meetings created per day (per user)

**Test Independently:**
```bash
curl -X POST https://api.zoom.us/v2/users/me/meetings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"topic":"Test","type":2,"start_time":"2025-11-05T14:00:00Z","duration":30}'
```

#### 2. Patient Doesn't Receive Session Link

**Symptom:** Session created successfully but patient reports no email/SMS

**Solutions:**
- **SMS:** Check Twilio logs for delivery status
- **Email:** Check SendGrid activity for delivery/bounce/spam
- **Email Format:** Verify `patient_email` is valid format
- **Phone Format:** Ensure E.164 format for SMS (`+15551234567`)
- **Spam Filters:** Session link may trigger spam filters - whitelist sender

#### 3. Session Link Doesn't Work

**Symptom:** Patient clicks link but gets "Invalid meeting" error

**Solutions:**
- **Timing:** Zoom meetings can't be joined until 10 min before start time (unless `join_before_host` enabled)
- **Password:** Verify password in SMS/email matches meeting password
- **Expiration:** Check session hasn't passed scheduled end time + buffer
- **Browser:** Zoom works best in Chrome, Firefox, Safari (not Internet Explorer)

#### 4. CRM Update Fails

**Symptom:** Session created but CRM shows no telehealth status

**Solutions:**
- **Contact ID:** Verify `contact_id` is present in webhook payload
- **CRM Permissions:** Check HubSpot credential has `contacts` write scope
- **Custom Fields:** Ensure `telehealth_status`, `telehealth_link` fields exist in CRM
- **Field Types:** Verify field types match (text for link, single-line text for status)

**Create Custom HubSpot Fields:**
1. HubSpot → **Settings** → **Properties** → **Contact Properties**
2. Create: `telehealth_status` (Single-line text)
3. Create: `telehealth_link` (Single-line text)
4. Create: `telehealth_session_id` (Single-line text)

#### 5. Provider Can't Start Meeting

**Symptom:** Provider clicks host link but gets access denied

**Solutions:**
- **Host Key:** Verify provider is logged into Zoom with correct account
- **Claim Host:** Provider may need to "Claim Host" if another host started meeting
- **Alternative Hosts:** Add providers as alternative hosts in Zoom settings
- **Zoom App:** Provider should use Zoom desktop app (not web) for best results

---

## Security & Compliance

### HIPAA Compliance

**This module is HIPAA-COMPLIANT when configured correctly:**

✅ **Required Configuration:**
1. **Telehealth Platform:** Must use HIPAA-eligible service:
   - Zoom for Healthcare (with BAA signed)
   - Doxy.me HIPAA plan
   - Amwell (HIPAA-compliant by default)
2. **Communication Channels:**
   - Twilio: HIPAA-eligible account with BAA
   - SendGrid: BAA required for PHI in emails
3. **Encryption:**
   - Enable `ENABLE_E2E_ENCRYPTION=true`
   - Use `ZOOM_ENCRYPTION_TYPE=enhanced_encryption`
4. **Access Controls:**
   - Enable `ENABLE_WAITING_ROOM=true`
   - Enable `REQUIRE_SESSION_PASSWORD=true`
   - Set `ALLOW_JOIN_BEFORE_HOST=false`
5. **Audit Logging:**
   - Enable `HIPAA_COMPLIANT_LOGGING=true`
   - Enable `LOG_SESSION_ACCESS=true`

**BAA Requirements:**
- Zoom: [Request BAA](https://zoom.us/hipaa)
- Twilio: [Enable HIPAA Features](https://www.twilio.com/hipaa)
- SendGrid: [Contact Sales for BAA](https://sendgrid.com/hipaa/)
- Doxy.me: Included with HIPAA plan

### Data Security

**Session Link Security:**
- Links contain unique meeting IDs and tokens
- Passwords required for additional security
- Links expire after session end time + buffer
- Waiting room prevents unauthorized access

**Data Storage:**
- Session links stored in CRM (encrypted at rest)
- Google Sheets logging should use service account with restricted access
- Avoid storing session links in plain text logs

**Best Practices:**
- Rotate API credentials quarterly
- Use OAuth2 over API keys where possible
- Enable 2FA on all platform accounts
- Regularly audit session access logs

### Recording Consent

**If enabling session recording:**

1. **Enable Consent Tracking:**
```bash
ENABLE_RECORDING_CONSENT=true
RECORDING_CONSENT_REQUIRED=true
```

2. **Add Consent Field to Module 02:**
   - Checkbox in booking form: "I consent to this session being recorded"
   - Pass in appointment data: `"recording_consent": true`

3. **Modify Node 305 (Create Session):**
```javascript
"settings": {
  "auto_recording": $json.recording_consent ? "cloud" : "none",
  "recording_consent_required": true
}
```

4. **Zoom Configuration:**
   - **Account Settings** → **Recording** → **Consent**
   - Enable "Ask participants for consent when recording"

---

## Performance Optimization

### Reduce API Latency

**Concurrent Notifications:**
Already implemented - CRM, SMS, and email send in parallel (Node 307-311).

**Caching Provider Details:**
```javascript
// Node 304: Cache provider data in Redis
const cacheKey = `provider:${$env.DEFAULT_PROVIDER_NAME}`;
const cached = await redis.get(cacheKey);

if (cached) {
  providerData = JSON.parse(cached);
} else {
  providerData = await fetchProviderFromCRM();
  await redis.set(cacheKey, JSON.stringify(providerData), 'EX', 3600);
}
```

### Rate Limit Handling

**Zoom Rate Limits:**
- 100 meeting creations per day per user
- 10 requests per second per account

**Solution: Implement Queue System**

```javascript
// Check rate limit before creation
const dailyCount = await redis.get('zoom_meeting_count');
if (parseInt(dailyCount) >= 100) {
  throw new Error('Daily Zoom meeting creation limit reached. Please try again tomorrow.');
}

// Increment counter
await redis.incr('zoom_meeting_count');
await redis.expire('zoom_meeting_count', 86400); // Reset daily
```

---

## Testing

See [Aigent_Module_03_Testing_Guide.md](Aigent_Module_03_Testing_Guide.md) for comprehensive test cases.

**Quick Test:**

```bash
curl -X POST https://your-n8n.com/webhook/telehealth-session \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_confirmed": true,
    "appointment_id": "test_123",
    "patient_name": "Test Patient",
    "patient_email": "test@example.com",
    "patient_phone": "+15550000000",
    "scheduled_time": "2025-11-05T14:00:00Z",
    "service_type": "Test Consultation",
    "provider_name": "Dr. Test"
  }'
```

**Expected Result:**
- HTTP 200 response with `success: true`
- Session created in Zoom/Doxy.me/Amwell
- Patient receives SMS with join link
- Patient receives email with comprehensive instructions
- Provider receives email with host link
- CRM updated with session details
- Session logged to Google Sheets

---

## Roadmap

### Planned Enhancements (v1.1)

- [ ] Automated pre-session tech check (camera/mic test)
- [ ] Multi-language support for notifications (Spanish, French)
- [ ] Session recording management (auto-upload to EMR)
- [ ] Post-session quality survey integration
- [ ] Interpreter services integration (video/phone interpretation)
- [ ] Breakout rooms for group sessions
- [ ] Screen sharing controls
- [ ] Virtual background requirements
- [ ] Session rescheduling webhook
- [ ] No-show tracking and alerts

### Future Modules

- **Module 04:** Pre-Visit Forms & Medical History
- **Module 05:** Post-Session Follow-Up & Care Plans
- **Module 06:** Prescription Management & E-Prescribing
- **Module 07:** Billing & Insurance Claims

---

## Support

### Documentation
- Full Aigent Template Library: [docs.aigent.company/templates](https://docs.aigent.company/templates)
- Zoom API Docs: [marketplace.zoom.us/docs/api-reference](https://marketplace.zoom.us/docs/api-reference)
- Doxy.me API Docs: [help.doxy.me/en/articles/api](https://help.doxy.me/en/articles/api)
- n8n Official Docs: [docs.n8n.io](https://docs.n8n.io)

### Community
- Aigent Slack: #workflow-support
- n8n Community Forum: [community.n8n.io](https://community.n8n.io)

### Enterprise Support
- Email: support@aigent.company
- SLA: 4-hour response (Priority), 24-hour response (Standard)
- Telehealth Technical Support: telehealth-support@aigent.company

---

## License

**Proprietary - Aigent Company**
© 2025 Aigent Company. All rights reserved.

This template is licensed to medical practices and healthcare organizations for internal use only. Redistribution, resale, or modification for third-party distribution is prohibited without written consent.

---

## Changelog

### v1.0.0 (2025-10-29)
- Initial release
- Multi-platform telehealth support (Zoom, Doxy.me, Amwell)
- Secure session generation with passwords and waiting rooms
- Dual-channel patient notifications (SMS + email)
- Provider email notifications with host link
- CRM integration with session status tracking
- Audit logging to Google Sheets
- HIPAA-compliant configuration options
- Comprehensive documentation and testing guide
