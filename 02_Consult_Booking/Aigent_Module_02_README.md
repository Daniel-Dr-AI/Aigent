# Aigent Module 02 – Consult Booking & Scheduling

**Version:** 1.0.0
**Author:** Aigent Automation Engineering
**Template Type:** Universal Clinic Template
**Status:** Production Ready
**Dependencies:** Module 01 (optional)

---

## Overview

The **Consult Booking & Scheduling** module automates the appointment booking workflow for medical offices. It integrates with popular scheduling platforms (Cal.com, Acuity Scheduling, SimplyBook.me, Google Calendar), intelligently selects appointment times, and delivers multi-channel confirmations via SMS and email.

### Key Features

- **Multi-Platform Scheduling:** Works with Cal.com, Acuity, SimplyBook.me, Calendly, or Google Calendar
- **Intelligent Time Selection:** Matches patient preferences to available slots or suggests alternatives
- **Dual-Channel Confirmations:** Immediate SMS + branded email with calendar invites
- **CRM Integration:** Auto-updates contact records with appointment status and lifecycle progression
- **Error Resilience:** Handles no-availability scenarios with retry dates
- **Module Chaining:** Accepts input from Module 01 (Intake) or standalone booking forms
- **PHI-Safe:** Only captures scheduling data (name, email, phone, service type)
- **Zero Hardcoded Credentials:** 100% environment variable driven

---

## Architecture

### Data Flow
```
Module 01 Output / Booking Form → Webhook → Validation → Check Availability →
  Select Best Slot → Create Booking → Parallel:
                                      ├─ Update CRM
                                      ├─ Send SMS
                                      └─ Send Email
                                      ↓
                                Success Response (appointment_status.json)
```

### Node Breakdown

| Node # | Name | Type | Purpose |
|--------|------|------|---------|
| 201 | Webhook Trigger | Webhook | Accept POST booking requests |
| 202 | Validate Booking Data | If | Verify required fields (email, name, phone, service_type) |
| 203 | Return Validation Error | Respond to Webhook | 400 error for invalid input |
| 204 | Check Scheduling Availability | HTTP Request | Query scheduling API for available slots |
| 205 | Select Best Time Slot | Code | Match patient preference to available times |
| 206 | Create Booking | HTTP Request | Confirm appointment in scheduling system |
| 207 | Update CRM | HubSpot | Update contact with appointment status |
| 208 | Send SMS Confirmation | Twilio | Immediate text message confirmation |
| 209 | Send Email Confirmation | SendGrid | Branded email with calendar invite |
| 210 | Merge All Confirmations | Merge | Consolidate delivery statuses |
| 211 | Return Success Response | Respond to Webhook | 200 success with appointment details |
| 212 | Check Slot Selection Errors | If | Detect no-availability scenarios |
| 213 | Return No Availability Error | Respond to Webhook | 409 error with retry date |
| 214 | Error Handler | NoOp | Catch execution errors |

---

## Installation

### 1. Import Workflow

In your n8n instance:
1. Navigate to **Workflows** → **Import from File**
2. Select `Aigent_Module_02_Consult_Booking.json`
3. Click **Import**

### 2. Configure Credentials

Create the following credentials in n8n:

#### Scheduling System (Cal.com Example)
- **Type:** HTTP Header Auth
- **Name:** `Cal.com API Key`
- **Header:** `Authorization`
- **Value:** `Bearer YOUR_CAL_COM_API_KEY`

**Alternative Providers:**
- **Acuity Scheduling:** Use Basic Auth with User ID + API Key
- **SimplyBook.me:** Use HTTP Header Auth with `X-Company-Login` and `X-Token`
- **Google Calendar:** Use Google OAuth2 API credentials

#### HubSpot (or alternate CRM)
- **Type:** HubSpot API
- **Name:** `HubSpot Account`
- **API Key/OAuth:** Configure per HubSpot documentation

#### Twilio (SMS)
- **Type:** Twilio API
- **Name:** `Twilio Account`
- **Account SID:** From Twilio console
- **Auth Token:** From Twilio console

#### SendGrid (Email)
- **Type:** SendGrid API
- **Name:** `SendGrid API`
- **API Key:** From SendGrid settings

### 3. Configure Environment Variables

Copy `.env.aigent_module_02_example` to your n8n environment:

**Docker/Docker Compose:**
```bash
# Add to docker-compose.yml under n8n service:
environment:
  # Scheduling
  - SCHEDULING_PROVIDER_NAME=Cal.com
  - SCHEDULING_API_BASE_URL=https://api.cal.com/v1
  - SCHEDULING_BASE_URL=https://cal.com/yourclinic
  - SCHEDULING_CREDENTIAL_ID=10
  - SCHEDULING_EVENT_TYPE_ID=123456
  - CLINIC_TIMEZONE=America/New_York

  # CRM
  - HUBSPOT_CREDENTIAL_ID=1

  # Notifications
  - TWILIO_CREDENTIAL_ID=15
  - TWILIO_FROM_NUMBER=+15551234567
  - SENDGRID_CREDENTIAL_ID=17
  - SENDGRID_FROM_EMAIL=appointments@yourclinic.com

  # Clinic Info
  - CLINIC_NAME=Your Clinic Name
  - CLINIC_PHONE=+1 (555) 123-4567
  - CLINIC_EMAIL=info@yourclinic.com
  - CLINIC_ADDRESS=123 Medical Plaza
  - BRAND_PRIMARY_COLOR=#4F46E5

  # ... (add all required variables)
```

**n8n Cloud:**
- Navigate to **Settings** → **Environments**
- Add each variable as key-value pair

### 4. Configure Scheduling System

#### Cal.com Setup
1. Log in to Cal.com dashboard
2. Navigate to **Settings** → **Developer** → **API Keys**
3. Create new API key with `bookings:read`, `bookings:write` scopes
4. Copy **Event Type ID** from event type settings
5. Add to environment:
   ```bash
   SCHEDULING_API_BASE_URL=https://api.cal.com/v1
   SCHEDULING_EVENT_TYPE_ID=123456
   ```

#### Acuity Scheduling Setup
1. Log in to Acuity Scheduling
2. Navigate to **Business Settings** → **Integrations** → **API**
3. Copy **User ID** and **API Key**
4. Add to environment:
   ```bash
   SCHEDULING_API_BASE_URL=https://acuityscheduling.com/api/v1
   ACUITY_USER_ID=12345
   ```
5. Create Basic Auth credential with User ID as username, API Key as password

#### SimplyBook.me Setup
1. Log in to SimplyBook.me admin panel
2. Navigate to **Settings** → **API**
3. Enable API access and copy **Company Login** and **API Token**
4. Add to environment:
   ```bash
   SCHEDULING_API_BASE_URL=https://user-api.simplybook.me
   SIMPLYBOOK_COMPANY_LOGIN=yourclinic
   ```

### 5. Activate Workflow

1. Open the imported workflow
2. Verify all credential references resolve (green checkmarks)
3. Click **Active** toggle in top-right corner
4. Copy the webhook URL from the **Webhook Trigger** node

---

## Usage

### Input Schema

#### Direct Booking (Standalone)
Send POST request to webhook URL with JSON body:

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "+1-555-123-4567",
  "service_type": "General Consultation",
  "preferred_date": "2025-11-05",
  "preferred_time": "14:00",
  "notes": "First-time patient, needs parking directions",
  "contact_id": "67890"
}
```

#### Chained from Module 01
Module 01 output automatically includes `contact_id`:

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "+1-555-123-4567",
  "service_type": "Follow-up Consultation",
  "contact_id": "12345"
}
```

**Field Specifications**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `name` | String | Yes | Not empty | Patient full name |
| `email` | String | Yes | Email format | Patient email address |
| `phone` | String | Yes | Not empty | Patient phone number |
| `service_type` | String | Yes | Not empty | Type of consultation/service |
| `preferred_date` | String | No | ISO 8601 date | Preferred appointment date (YYYY-MM-DD) |
| `preferred_time` | String | No | HH:MM format | Preferred time (24-hour format) |
| `notes` | String | No | - | Additional patient notes/requests |
| `contact_id` | String | No | - | CRM contact ID (from Module 01) |
| `referral_source` | String | No | - | Marketing attribution |

### Success Response (200)

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment_id": "cal_abc123xyz",
  "patient_email": "jane.doe@example.com",
  "patient_name": "Jane Doe",
  "scheduled_time": "2025-11-05T14:00:00.000Z",
  "scheduled_time_formatted": "Tuesday, November 5, 2025 at 2:00 PM",
  "service_type": "General Consultation",
  "channel": "Cal.com",
  "booking_url": "https://cal.com/yourclinic/event/cal_abc123xyz",
  "reschedule_url": "https://cal.com/yourclinic/reschedule/cal_abc123xyz",
  "metadata": {
    "crm_updated": true,
    "sms_sent": true,
    "email_sent": true,
    "sms_sid": "SM1234567890abcdef",
    "email_message_id": "msg_xyz789"
  },
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

### Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "error": "Missing or invalid required fields: email, name, phone, service_type",
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

#### No Availability (409)
```json
{
  "success": false,
  "error": "No available appointments",
  "message": "No time slots available in the requested timeframe. Please try alternative dates.",
  "retry_after": "2025-11-06T00:00:00.000Z",
  "alternatives": [
    {
      "time": "2025-11-06T09:00:00.000Z",
      "duration": 30
    },
    {
      "time": "2025-11-06T14:30:00.000Z",
      "duration": 30
    }
  ],
  "contact_info": {
    "phone": "+1 (555) 123-4567",
    "email": "info@yourclinic.com"
  },
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

---

## Configuration

### Switching Scheduling Systems

#### From Cal.com to Acuity Scheduling

1. **Update Environment Variables:**
```bash
SCHEDULING_PROVIDER_NAME=Acuity Scheduling
SCHEDULING_API_BASE_URL=https://acuityscheduling.com/api/v1
ACUITY_USER_ID=12345
SCHEDULING_CREDENTIAL_ID=11
```

2. **Modify Node 204 (Check Scheduling Availability):**
   - Change URL to: `={{$env.SCHEDULING_API_BASE_URL}}/availability/dates`
   - Update query parameters:
     ```json
     {
       "appointmentTypeID": "={{$env.SCHEDULING_EVENT_TYPE_ID}}",
       "month": "={{ DateTime.fromISO($json.body.preferred_date).toFormat('yyyy-MM') }}",
       "timezone": "={{$env.CLINIC_TIMEZONE}}"
     }
     ```

3. **Modify Node 206 (Create Booking):**
   - Change URL to: `={{$env.SCHEDULING_API_BASE_URL}}/appointments`
   - Update body parameters:
     ```json
     {
       "appointmentTypeID": "={{$env.SCHEDULING_EVENT_TYPE_ID}}",
       "datetime": "={{ $json.slot_time }}",
       "firstName": "={{ $('Webhook Trigger - Booking Request').first().json.body.name.split(' ')[0] }}",
       "lastName": "={{ $('Webhook Trigger - Booking Request').first().json.body.name.split(' ').slice(1).join(' ') }}",
       "email": "={{ $('Webhook Trigger - Booking Request').first().json.body.email }}",
       "phone": "={{ $('Webhook Trigger - Booking Request').first().json.body.phone }}"
     }
     ```

#### From Cal.com to Google Calendar

1. **Create Google Calendar OAuth2 credential**
2. **Replace Node 204 & 206 with Google Calendar nodes:**
   - Node 204: **Google Calendar - List Events** (to check availability)
   - Node 206: **Google Calendar - Create Event**

3. **Update Event Creation:**
   ```javascript
   {
     "calendarId": "={{$env.GOOGLE_CALENDAR_ID || 'primary'}}",
     "summary": "={{$json.body.service_type}} - {{$json.body.name}}",
     "start": {
       "dateTime": "={{$json.slot_time}}",
       "timeZone": "={{$env.CLINIC_TIMEZONE}}"
     },
     "end": {
       "dateTime": "={{ DateTime.fromISO($json.slot_time).plus({minutes: parseInt($env.DEFAULT_APPOINTMENT_DURATION)}).toISO() }}",
       "timeZone": "={{$env.CLINIC_TIMEZONE}}"
     },
     "attendees": [
       {
         "email": "={{$json.body.email}}",
         "displayName": "={{$json.body.name}}"
       }
     ],
     "description": "Service: {{$json.body.service_type}}\nPhone: {{$json.body.phone}}"
   }
   ```

### Customizing Confirmation Messages

#### SMS Template (Node 208)

Edit the `message` parameter:

```javascript
=Hi {{ $('Webhook Trigger - Booking Request').first().json.body.name.split(' ')[0] }},

🎉 You're all set! Your {{ $('Webhook Trigger - Booking Request').first().json.body.service_type }} is confirmed.

📅 {{ DateTime.fromISO($json.start || $json.startTime).toFormat('EEEE, MMMM d') }}
🕐 {{ DateTime.fromISO($json.start || $json.startTime).toFormat('h:mm a') }}
📍 {{ $env.CLINIC_NAME }}
🆔 {{ ($json.id || $json.uid).substring(0, 8) }}

Need changes? Reply RESCHEDULE
Questions? {{ $env.CLINIC_PHONE }}

See you soon!
- {{ $env.CLINIC_NAME }}
```

**Customization Options:**
- Add parking instructions
- Include pre-visit checklist
- Add telehealth link for virtual appointments
- Include insurance requirements

#### Email Template (Node 209)

The HTML template supports extensive customization:

**Brand Colors:**
```css
background: {{$env.BRAND_PRIMARY_COLOR || '#4F46E5'}};
```

**Logo Addition:**
```html
<div class="header">
  <img src="{{$env.CLINIC_LOGO_URL}}" alt="{{$env.CLINIC_NAME}}" style="max-width: 200px;">
  <h1>Appointment Confirmed</h1>
</div>
```

**Additional Sections:**
```html
<div class="detail-row">
  <div class="label">What to Bring</div>
  <div class="value">
    • Photo ID<br>
    • Insurance card<br>
    • List of current medications
  </div>
</div>
```

### Business Rules Configuration

#### Minimum Advance Booking

Modify Node 204 query parameters:

```javascript
"startTime": "={{ $json.body.preferred_date ? $json.body.preferred_date : $now.plus({hours: parseInt($env.MIN_BOOKING_ADVANCE_HOURS)}).toISO() }}"
```

Set in environment:
```bash
MIN_BOOKING_ADVANCE_HOURS=24  # Require 24-hour advance notice
```

#### Buffer Time Between Appointments

Add buffer logic in Node 205 (Select Best Time Slot):

```javascript
// Filter out slots within buffer time of existing appointments
const bufferMinutes = parseInt($env.BUFFER_TIME_MINUTES) || 0;

const filteredSlots = availableSlots.filter(slot => {
  const slotTime = DateTime.fromISO(slot.time);
  return !existingAppointments.some(appt => {
    const apptTime = DateTime.fromISO(appt.time);
    const timeDiff = Math.abs(slotTime - apptTime);
    return timeDiff < (bufferMinutes * 60 * 1000);
  });
});
```

#### Auto-Confirmation vs. Manual Approval

For manual approval workflow:

1. Set environment variable:
```bash
AUTO_CONFIRM_BOOKINGS=false
```

2. Modify Node 206 to create "pending" status:
```json
{
  "status": "pending",
  "requiresApproval": true
}
```

3. Add staff notification node after booking creation
4. Connect to Module 05 (Staff Dashboard) for approval interface

---

## Integrations

### Chaining with Module 01 (Intake)

**In Module 01 Success Response (Node 009):**

Add webhook call to Module 02:

```javascript
// After CRM update, trigger booking workflow
const bookingPayload = {
  name: $json.body.name,
  email: $json.body.email,
  phone: $json.body.phone,
  contact_id: $json.id || $json.vid,
  service_type: $json.body.interest || 'General Consultation',
  referral_source: $json.body.referral_source
};

// Call Module 02
await $http.post($env.MODULE_02_WEBHOOK_URL, bookingPayload);
```

### Triggering Module 03 (Appointment Reminders)

**In Module 02 Success Response (Node 211):**

Add webhook call to Module 03:

```javascript
// Trigger reminder workflow
const reminderPayload = {
  appointment_id: $('Create Booking in Scheduling System').first().json.id,
  patient_email: $('Webhook Trigger - Booking Request').first().json.body.email,
  patient_phone: $('Webhook Trigger - Booking Request').first().json.body.phone,
  patient_name: $('Webhook Trigger - Booking Request').first().json.body.name,
  appointment_time: $('Create Booking in Scheduling System').first().json.start,
  service_type: $('Webhook Trigger - Booking Request').first().json.body.service_type
};

await $http.post($env.MODULE_03_WEBHOOK_URL, reminderPayload);
```

### WordPress Booking Widget Integration

```php
// wp-booking-widget.php
function clinic_booking_widget_shortcode() {
    ob_start();
    ?>
    <form id="clinic-booking-form">
        <input type="text" name="name" placeholder="Full Name" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="tel" name="phone" placeholder="Phone" required>

        <select name="service_type" required>
            <option value="">Select Service</option>
            <option value="General Consultation">General Consultation</option>
            <option value="Follow-up">Follow-up Visit</option>
            <option value="Urgent Care">Urgent Care</option>
        </select>

        <input type="date" name="preferred_date" min="<?php echo date('Y-m-d', strtotime('+1 day')); ?>">
        <input type="time" name="preferred_time">

        <textarea name="notes" placeholder="Additional notes (optional)"></textarea>

        <button type="submit">Book Appointment</button>
    </form>

    <div id="booking-result"></div>

    <script>
    jQuery('#clinic-booking-form').on('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        const result = jQuery('#booking-result');
        result.html('Booking your appointment...');

        try {
            const response = await fetch('<?php echo get_option('n8n_booking_webhook_url'); ?>', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const json = await response.json();

            if (json.success) {
                result.html(`
                    <div class="success">
                        <h3>Appointment Confirmed!</h3>
                        <p>${json.scheduled_time_formatted}</p>
                        <p>Confirmation sent to ${json.patient_email}</p>
                        <a href="${json.booking_url}">View Booking</a>
                    </div>
                `);
                this.reset();
            } else {
                result.html(`<div class="error">Error: ${json.error}</div>`);
            }
        } catch (error) {
            result.html('<div class="error">Booking failed. Please try again.</div>');
        }
    });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('clinic_booking', 'clinic_booking_widget_shortcode');
```

**Usage:** Add `[clinic_booking]` to any WordPress page

### React Booking Component

```jsx
// BookingForm.jsx
import React, { useState } from 'react';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    preferred_date: '',
    preferred_time: '',
    notes: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(process.env.REACT_APP_N8N_BOOKING_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setFormData({ /* reset form */ });
      }
    } catch (error) {
      setResult({ success: false, error: 'Booking failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit" disabled={loading}>
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <>
              <h3>Appointment Confirmed!</h3>
              <p>{result.scheduled_time_formatted}</p>
              <a href={result.booking_url}>View Booking</a>
            </>
          ) : (
            <p>Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Troubleshooting

### Common Issues

#### 1. No Available Slots Returned

**Symptom:** Always receives 409 "No available appointments" error

**Solution:**
- Verify `SCHEDULING_EVENT_TYPE_ID` matches your scheduling system
- Check event type has availability windows configured
- Confirm `CLINIC_TIMEZONE` matches scheduling system timezone
- Test scheduling API directly:
  ```bash
  curl https://api.cal.com/v1/availability \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d "eventTypeId=123456&startTime=2025-11-01T00:00:00Z"
  ```

#### 2. Booking Created But No Confirmations Sent

**Symptom:** Appointment appears in calendar but no SMS/email received

**Solution:**
- Check Twilio/SendGrid credentials are valid
- Verify phone number format (E.164: +1XXXXXXXXXX)
- Confirm `TWILIO_FROM_NUMBER` is verified in Twilio
- Check `SENDGRID_FROM_EMAIL` is verified in SendGrid
- Review n8n execution log for SMS/email node errors

#### 3. CRM Update Fails

**Symptom:** "Contact not found" or CRM update error

**Solution:**
- Verify `contact_id` is present in webhook payload
- Check HubSpot credential has `contacts` write permissions
- Test CRM credential independently (create test contact)
- If `contact_id` missing, modify Node 207 to create CRM activity instead

#### 4. Wrong Time Zone in Confirmations

**Symptom:** Appointment time displays incorrectly in SMS/email

**Solution:**
- Verify `CLINIC_TIMEZONE` uses IANA format (e.g., `America/New_York`)
- Check scheduling system timezone matches environment variable
- Update DateTime formatting in confirmation nodes:
  ```javascript
  DateTime.fromISO($json.start, { zone: $env.CLINIC_TIMEZONE }).toFormat('h:mm a')
  ```

#### 5. Slot Selection Logic Errors

**Symptom:** Wrong time selected or workflow fails at slot selection

**Solution:**
- Review Node 205 (Select Best Time Slot) execution output
- Verify `preferred_date` and `preferred_time` format (ISO 8601)
- Add debug logging:
  ```javascript
  console.log('Available slots:', availableSlots);
  console.log('Preferred time:', preferredDateTime.toISO());
  console.log('Selected slot:', selectedSlot);
  ```

---

## Security & Compliance

### PHI Handling

**This module is PHI-SAFE by design:**
- Only captures scheduling data (name, email, phone, service type)
- No medical history, symptoms, or diagnoses
- Suitable for pre-appointment booking

**For HIPAA-compliant deployments:**
- Enable `HIPAA_MODE=true` in environment
- Ensure all services have signed BAAs:
  - Scheduling platform (Cal.com Business, Acuity HIPAA)
  - CRM (HubSpot Healthcare, Salesforce Health Cloud)
  - Twilio (HIPAA-eligible account)
  - SendGrid (BAA required for PHI in emails)
- Use encrypted data stores for booking history

### SMS Consent (TCPA Compliance)

**Required for SMS confirmations:**

1. Capture consent in Module 01:
```json
{
  "sms_consent": true,
  "sms_consent_date": "2025-10-29T14:30:00.000Z"
}
```

2. Add consent check in Node 202 (Validation):
```javascript
{
  "id": "validation-sms-consent",
  "leftValue": "={{ $json.body.sms_consent }}",
  "rightValue": true,
  "operator": {
    "type": "boolean",
    "operation": "equals"
  }
}
```

3. Skip SMS node if consent not granted:
```javascript
if (!$json.body.sms_consent) {
  // Only send email confirmation
  return { skip_sms: true };
}
```

### Data Retention

Configure automatic cleanup:

```bash
DATA_RETENTION_DAYS=2555  # 7 years for HIPAA
```

Create scheduled workflow to archive old bookings:

```sql
-- Move to archive table
INSERT INTO booking_archive SELECT * FROM bookings
WHERE created_at < NOW() - INTERVAL '2555 days';

-- Delete from active table
DELETE FROM bookings
WHERE created_at < NOW() - INTERVAL '2555 days';
```

---

## Performance Optimization

### Caching Availability Data

For high-traffic clinics, cache availability responses:

```javascript
// Node 204 - Add caching logic
const cacheKey = `availability:${$env.SCHEDULING_EVENT_TYPE_ID}:${$json.body.preferred_date}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

// Fetch from API
const availability = await $http.get(...);

// Cache for 5 minutes
await redis.set(cacheKey, JSON.stringify(availability), 'EX', 300);

return availability;
```

### Parallel Confirmation Delivery

Already implemented in workflow (Node 207-209 run in parallel), but can optimize further:

```javascript
// Fire-and-forget for non-critical notifications
await Promise.all([
  $http.post($env.MODULE_03_WEBHOOK_URL, reminderPayload),
  $http.post($env.ANALYTICS_WEBHOOK, bookingEvent)
]);
```

### Rate Limit Handling

For scheduling APIs with rate limits:

```javascript
// Node 204/206 - Add retry logic
const maxRetries = parseInt($env.API_RETRY_ATTEMPTS) || 3;
let attempt = 0;

while (attempt < maxRetries) {
  try {
    const response = await $http.post(...);
    return response;
  } catch (error) {
    if (error.statusCode === 429) { // Rate limited
      attempt++;
      await new Promise(r => setTimeout(r, parseInt($env.API_RETRY_DELAY) * attempt));
    } else {
      throw error;
    }
  }
}
```

---

## Testing

See [Aigent_Module_02_Testing_Guide.md](Aigent_Module_02_Testing_Guide.md) for comprehensive test cases.

**Quick Test:**

```bash
curl -X POST https://your-n8n.com/webhook/consult-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test@example.com",
    "phone": "+1-555-000-0000",
    "service_type": "General Consultation",
    "preferred_date": "2025-11-05",
    "preferred_time": "14:00"
  }'
```

**Expected Result:**
- HTTP 200 response with `success: true`
- Appointment created in scheduling system
- SMS sent to patient
- Email sent to patient
- CRM contact updated with appointment status

---

## Roadmap

### Planned Enhancements (v1.1)

- [ ] Multi-provider booking (select specific doctor/practitioner)
- [ ] Recurring appointment scheduling
- [ ] Waitlist management (auto-book cancelled slots)
- [ ] Video consultation link generation (Zoom/Google Meet)
- [ ] Patient portal integration (view/manage appointments)
- [ ] Insurance verification before booking
- [ ] Co-pay collection at booking time

### Future Modules

- **Module 03:** Appointment Reminders (24h/1h before)
- **Module 04:** Pre-Visit Forms & Intake Questionnaires
- **Module 05:** Staff Dashboard & Appointment Management
- **Module 06:** Post-Visit Follow-Up & Review Collection

---

## Support

### Documentation
- Full Aigent Template Library: [docs.aigent.company/templates](https://docs.aigent.company/templates)
- Cal.com API Docs: [cal.com/docs/api-reference](https://cal.com/docs/api-reference)
- Acuity API Docs: [developers.acuityscheduling.com](https://developers.acuityscheduling.com)
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
- Multi-platform scheduling (Cal.com, Acuity, SimplyBook.me, Google Calendar)
- Intelligent time slot selection with preference matching
- Dual-channel confirmations (SMS + email)
- CRM integration with status updates
- No-availability error handling with retry dates
- Module 01 integration support
- Comprehensive documentation and testing guide
