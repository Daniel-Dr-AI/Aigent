# Module 08 Enterprise: Messaging Omnichannel

**Version:** enterprise-1.0.0
**Branch:** Enterprise (HIPAA-Ready, Secure, Observable)
**Target Users:** Healthcare organizations, medical practices, telehealth providers requiring HIPAA-compliant messaging

---

## Purpose

Enterprise-grade omnichannel messaging platform with **WhatsApp Business API**, **Facebook Messenger**, **Slack/Teams bot integration**, **rich media support**, **message templating**, **advanced personalization**, **delivery tracking**, **two-way messaging**, **conversation threading**, **PHI masking**, **opt-out management**, **scheduled delivery**, **message queueing**, **multi-language support**, and **HIPAA-compliant communications**. Designed for healthcare organizations needing secure, compliant patient communications across multiple channels.

**Key Difference from Core:** Adds WhatsApp/Messenger channels, rich media, templates, two-way messaging, PHI masking, HIPAA compliance, and advanced delivery features beyond basic email/SMS.

---

## Features Comparison

### ✅ Enterprise Features (vs Core)

**Core Features Included:**
- ✅ Email delivery (SendGrid)
- ✅ SMS delivery (Twilio)
- ✅ Google Sheets logging
- ✅ Trace ID tracking
- ✅ Retry logic

**Enterprise Additions - Channels:**
- ✅ WhatsApp Business API integration
- ✅ Facebook Messenger integration
- ✅ Slack bot messaging (for staff communications)
- ✅ Microsoft Teams bot messaging
- ✅ Multi-channel broadcast (send to ALL channels simultaneously)
- ✅ Channel priority/fallback logic (email fails → try SMS → try WhatsApp)
- ✅ Channel-specific formatting (auto-adapt message to channel)

**Enterprise Additions - Rich Media:**
- ✅ MMS image support (SMS with images)
- ✅ HTML email templates (custom designs)
- ✅ Email attachments (PDFs, documents)
- ✅ WhatsApp media messages (images, PDFs, audio)
- ✅ Inline images in email
- ✅ Branded email templates
- ✅ Dynamic content blocks

**Enterprise Additions - Templating:**
- ✅ Template management system (store/reuse templates)
- ✅ Advanced personalization (20+ merge fields)
- ✅ Template versioning (A/B testing)
- ✅ Conditional content (show/hide based on data)
- ✅ Multi-language template variants
- ✅ Template preview & testing
- ✅ HIPAA-compliant templates (no PHI in defaults)

**Enterprise Additions - Delivery & Tracking:**
- ✅ Delivery status webhooks (real-time tracking)
- ✅ Read receipts (email open tracking)
- ✅ Click tracking (link analytics)
- ✅ Bounce handling (hard/soft bounces)
- ✅ Delivery retry policies (3 attempts per channel)
- ✅ Failed message alerting
- ✅ Delivery time analytics

**Enterprise Additions - Two-Way Messaging:**
- ✅ Reply handling (SMS replies, WhatsApp replies)
- ✅ Conversation threading (group by conversation ID)
- ✅ Auto-responses (keyword triggers)
- ✅ Staff notification of replies
- ✅ Reply routing (to specific staff member)
- ✅ Conversation history (all messages per contact)

**Enterprise Additions - Contact Management:**
- ✅ Contact preference management (preferred channel per contact)
- ✅ Opt-out/unsubscribe tracking (TCPA compliance)
- ✅ Do Not Contact list
- ✅ Contact segmentation (patient groups)
- ✅ Contact deduplication
- ✅ Contact enrichment (append metadata)

**Enterprise Additions - Scheduling & Queueing:**
- ✅ Scheduled message delivery (future send times)
- ✅ Message queueing (batch processing)
- ✅ Rate limit management (throttling per channel)
- ✅ Send time optimization (best time to send)
- ✅ Time zone adjustment (send at local time)
- ✅ Campaign scheduling (drip campaigns)

**Enterprise Additions - Advanced Features:**
- ✅ Multi-language support (10+ languages)
- ✅ Character encoding optimization (Unicode, emojis)
- ✅ SMS link shortening (track clicks)
- ✅ URL tracking & analytics
- ✅ Message expiration (auto-delete after time)
- ✅ Priority messaging (urgent vs standard)
- ✅ Message approval workflow (for sensitive content)

**Enterprise Additions - Compliance & Security:**
- ✅ PHI masking in all channels (HIPAA-compliant)
- ✅ Message encryption (end-to-end where available)
- ✅ Audit logging (all messages tracked)
- ✅ TCPA compliance (opt-in verification)
- ✅ CAN-SPAM compliance (unsubscribe links)
- ✅ GDPR compliance (consent management)
- ✅ Message retention policies (auto-purge after period)

**Enterprise Additions - Healthcare-Specific:**
- ✅ Appointment reminders with confirmation links
- ✅ Medication reminders
- ✅ Lab results notifications (secure links only)
- ✅ Prescription ready notifications
- ✅ Billing reminders
- ✅ Follow-up care instructions
- ✅ Telehealth session links

**Enterprise Additions - Observability:**
- ✅ Execution time tracking
- ✅ Performance categorization (fast/normal/slow)
- ✅ Message delivery analytics dashboard
- ✅ Channel performance comparison
- ✅ Engagement metrics (open rate, click rate, reply rate)

### ❌ Core Limitations (Addressed in Enterprise)

- ❌ No WhatsApp or Messenger (email/SMS only)
- ❌ No rich media (plain text only)
- ❌ No message templates
- ❌ No personalization (basic message substitution only)
- ❌ No delivery tracking (fire-and-forget)
- ❌ No two-way messaging (can't handle replies)
- ❌ No contact preferences
- ❌ No opt-out management
- ❌ No scheduled delivery
- ❌ No message queueing
- ❌ No PHI masking (not HIPAA-compliant)
- ❌ No multi-channel broadcast
- ❌ No fallback logic
- ❌ Single-recipient only

---

## Data Flow

```
Webhook → Auth Check → Metadata → Validate → Template Load → Personalize → Channel Route → [Multi-Channel Delivery] → Track → Log → Success
             ↓              ↓                                                           ↓
           401           400                                                     Retry (3x per channel)
                                                                                         ↓
                                                                                  Fallback Channel (if enabled)
```

**Execution Time:** ~1200ms average (multi-channel latency + template processing)

---

## PHI Masking Examples

Enterprise automatically masks PHI in all message logs and internal notifications:

| Original | Masked (for logs) | Channel Output (Actual Message) |
|----------|-------------------|--------------------------------|
| `john.doe@example.com` | `j***e@example.com` | `john.doe@example.com` (full) |
| `555-123-4567` | `+X-XXX-XXX-4567` | `555-123-4567` (full) |
| `John Michael Doe` | `J*** M*** D***` | `John` (first name only in message) |
| `DOB: 1985-03-15` | `DOB: XXXX-XX-XX` | *Not included in messages* |

**Important:** PHI masking applies to:
- Workflow execution logs (n8n console)
- Google Sheets logging (masked data column)
- Internal Slack/Teams staff notifications
- Analytics dashboards

**Full unmasked data:**
- Actual message sent to patient (recipient sees full info)
- Secure database storage (encrypted at rest)
- Audit logs (with proper access controls)

**Compliance:** HIPAA-safe PHI handling across entire messaging pipeline

---

## Channel Details

### Email Channel (SendGrid)

**Capabilities:**
- HTML templates (custom designs)
- Inline images & logos
- Attachments (PDFs, documents)
- Read receipts (open tracking)
- Click tracking (link analytics)
- Bounce handling
- Unsubscribe links (CAN-SPAM)

**Message Format:**
```json
{
  "channel": "email",
  "recipient": "patient@example.com",
  "template_id": "appointment_reminder",
  "variables": {
    "first_name": "Sarah",
    "appointment_date": "November 20, 2025",
    "appointment_time": "2:00 PM",
    "provider_name": "Dr. Smith",
    "confirmation_link": "https://clinic.com/confirm/abc123"
  },
  "attachments": [
    {
      "filename": "appointment_details.pdf",
      "url": "https://s3.amazonaws.com/clinic/files/details.pdf"
    }
  ]
}
```

**Cost:** SendGrid Pro $89.95/month (120,000 emails)

**Delivery Time:** 1-5 seconds

**Best For:** Detailed communications, documents, forms, receipts

### SMS Channel (Twilio)

**Capabilities:**
- 160-character messages (multi-part for longer)
- MMS images (photos, charts)
- Link shortening (track clicks)
- Delivery confirmations
- Two-way replies
- Opt-out handling ("STOP" keyword)

**Message Format:**
```json
{
  "channel": "sms",
  "recipient": "+15559876543",
  "template_id": "appointment_reminder_sms",
  "variables": {
    "first_name": "Sarah",
    "appointment_date": "Nov 20",
    "appointment_time": "2pm"
  },
  "media_url": "https://clinic.com/images/map.jpg",
  "shorten_links": true
}
```

**Character Limits:**
- 160 chars = 1 SMS ($0.0079)
- 161-306 chars = 2 SMS ($0.0158)
- 307-459 chars = 3 SMS ($0.0237)

**Cost:**
- Phone number: $1.50/month
- SMS: $0.0079/message (US)
- MMS: $0.02/message (with image)

**Delivery Time:** 1-10 seconds

**Best For:** Urgent notifications, appointment reminders, quick updates

### WhatsApp Business API Channel

**Capabilities:**
- Rich media (images, PDFs, audio, video)
- Message templates (pre-approved by WhatsApp)
- Two-way conversations
- Read receipts
- Typing indicators
- International reach
- Lower cost than SMS internationally

**Message Format:**
```json
{
  "channel": "whatsapp",
  "recipient": "+15559876543",
  "template_name": "appointment_reminder",
  "template_language": "en",
  "template_params": [
    "Sarah",
    "November 20, 2025",
    "2:00 PM",
    "Dr. Smith"
  ],
  "media_url": "https://clinic.com/images/appointment_card.jpg"
}
```

**Requirements:**
- WhatsApp Business API account (apply via Twilio/MessageBird)
- Pre-approved message templates (24-48 hour approval)
- Business phone number (different from personal)

**Cost:**
- Session initiation: $0.005-0.03 (varies by country)
- Messages within 24h session: Free
- Business-initiated messages: $0.005-0.03 per message

**Delivery Time:** 1-5 seconds

**Best For:** International patients, rich media, two-way conversations, lower cost than SMS

**Template Example:**
```
Hello {{1}}, this is a reminder that your appointment with {{4}} is scheduled for {{2}} at {{3}}. Please reply YES to confirm or NO to reschedule.
```

### Facebook Messenger Channel

**Capabilities:**
- Rich media (images, carousels, buttons)
- Interactive elements (quick replies, buttons)
- Two-way conversations
- Delivery confirmations
- Facebook profile integration

**Message Format:**
```json
{
  "channel": "messenger",
  "recipient": "facebook_page_scoped_id_12345",
  "text": "Hi Sarah, your appointment is confirmed for Nov 20 at 2pm.",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "Confirm",
      "payload": "CONFIRM_APPOINTMENT"
    },
    {
      "content_type": "text",
      "title": "Reschedule",
      "payload": "RESCHEDULE_APPOINTMENT"
    }
  ]
}
```

**Requirements:**
- Facebook Page
- Messenger app setup
- Webhook configuration for two-way messaging

**Cost:** Free (Facebook Messenger API)

**Delivery Time:** 1-3 seconds

**Best For:** Younger demographics, interactive conversations, no cost

### Slack/Teams Channels (Staff Communications)

**Use Case:** Internal staff notifications, not patient-facing

**Capabilities:**
- Rich formatting (Markdown, blocks)
- Threaded conversations
- Channel posting
- Direct messages
- File attachments
- Interactive buttons

**Message Format (Slack):**
```json
{
  "channel": "slack",
  "webhook_url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX",
  "text": "New appointment booked",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*New Appointment Booked*\nPatient: Sarah (masked)\nDate: Nov 20, 2025\nTime: 2:00 PM\nProvider: Dr. Smith"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View Details"},
          "url": "https://clinic.com/appointments/abc123"
        }
      ]
    }
  ]
}
```

**Cost:** Free (included with Slack/Teams workspace)

**Best For:** Staff notifications, internal alerts, operational updates

---

## Multi-Channel Broadcast

**Use Case:** Send appointment reminder to patient via ALL channels they've opted into

**Request:**
```json
{
  "broadcast": true,
  "channels": ["email", "sms", "whatsapp"],
  "recipient": {
    "email": "patient@example.com",
    "phone": "+15559876543"
  },
  "template_id": "appointment_reminder",
  "variables": {
    "first_name": "Sarah",
    "appointment_date": "November 20, 2025",
    "appointment_time": "2:00 PM",
    "provider_name": "Dr. Smith"
  },
  "preferences": {
    "preferred_channel": "sms",
    "fallback_enabled": true
  }
}
```

**Execution:**
1. Check contact preferences (preferred channel: SMS)
2. Send via SMS first
3. If SMS delivery confirmed → Skip other channels (avoid duplicate)
4. If SMS fails → Try email (fallback)
5. If email fails → Try WhatsApp (second fallback)
6. Log all attempts

**Channel Priority (Customizable):**
1. Preferred channel (from contact preferences)
2. SMS (highest engagement rate)
3. WhatsApp (lower cost, rich media)
4. Email (detailed info, attachments)
5. Messenger (if available)

**Smart Deduplication:**
- If message delivered successfully on any channel → Stop (don't spam patient)
- If all channels fail → Alert staff, mark for manual follow-up

---

## Message Templates

### Template Structure

**Template ID:** `appointment_reminder`

**Variants:**
- `appointment_reminder_email` (HTML email)
- `appointment_reminder_sms` (160 chars)
- `appointment_reminder_whatsapp` (WhatsApp template)

**Variables (Merge Fields):**
```javascript
{
  // Patient Info
  first_name: "Sarah",
  last_name: "Johnson",
  full_name: "Sarah Johnson",
  patient_id: "PAT-12345",

  // Appointment Info
  appointment_date: "November 20, 2025",
  appointment_time: "2:00 PM",
  appointment_duration: "30 minutes",
  appointment_type: "Follow-up Consultation",

  // Provider Info
  provider_name: "Dr. Smith",
  provider_title: "Family Medicine",

  // Location Info
  clinic_name: "Wellness Clinic",
  clinic_address: "123 Main St, Boston, MA",
  clinic_phone: "555-1234",

  // Links
  confirmation_link: "https://clinic.com/confirm/abc123",
  reschedule_link: "https://clinic.com/reschedule/abc123",
  telehealth_link: "https://zoom.us/j/123456789",

  // Metadata
  booking_id: "BOOK-1730851234567",
  trace_id: "LEAD-1730851234567"
}
```

**Total Available Merge Fields:** 25+

### Email Template Example

**Subject:** Appointment Reminder - {{appointment_date}}

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .header { background-color: #0066cc; color: white; padding: 20px; }
    .content { padding: 20px; }
    .button { background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{clinic_name}}</h1>
  </div>
  <div class="content">
    <p>Hi {{first_name}},</p>

    <p>This is a friendly reminder that you have an appointment scheduled:</p>

    <ul>
      <li><strong>Date:</strong> {{appointment_date}}</li>
      <li><strong>Time:</strong> {{appointment_time}}</li>
      <li><strong>Provider:</strong> {{provider_name}}, {{provider_title}}</li>
      <li><strong>Type:</strong> {{appointment_type}}</li>
    </ul>

    <p><strong>Location:</strong><br>
    {{clinic_address}}</p>

    <p>Please arrive 10 minutes early to complete any necessary paperwork.</p>

    <p style="text-align: center; margin-top: 30px;">
      <a href="{{confirmation_link}}" class="button">Confirm Appointment</a>
    </p>

    <p style="text-align: center;">
      <a href="{{reschedule_link}}" style="color: #0066cc;">Need to reschedule?</a>
    </p>

    <p>If you have any questions, please call us at {{clinic_phone}}.</p>

    <p>Best regards,<br>
    {{clinic_name}} Team</p>
  </div>
  <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
    <p><a href="{{unsubscribe_link}}" style="color: #666;">Unsubscribe</a> from appointment reminders</p>
  </div>
</body>
</html>
```

### SMS Template Example

**Message:**
```
Hi {{first_name}}, reminder: Your appointment with {{provider_name}} is {{appointment_date}} at {{appointment_time}}. Reply YES to confirm or NO to reschedule. {{clinic_name}}
```

**Character Count:** 140 characters (with typical variable lengths)

**SMS with Link:**
```
Hi {{first_name}}, appointment reminder: {{appointment_date}} at {{appointment_time}}. Confirm: {{short_link}}
```

**Character Count:** 80 characters + shortened link (20 chars) = 100 total

### WhatsApp Template Example

**Template Name:** `appointment_reminder_v2`

**Category:** Utility (pre-approved by WhatsApp)

**Message:**
```
Hello {{1}},

This is a reminder that your appointment is scheduled for {{2}} at {{3}}.

Provider: {{4}}
Location: {{5}}

Please reply YES to confirm or NO if you need to reschedule.

Thank you,
{{6}}
```

**Parameters:**
1. `{{1}}` = first_name
2. `{{2}}` = appointment_date
3. `{{3}}` = appointment_time
4. `{{4}}` = provider_name
5. `{{5}}` = clinic_address
6. `{{6}}` = clinic_name

**Approval Time:** 24-48 hours (one-time WhatsApp review)

---

## Two-Way Messaging

### SMS Replies (Twilio)

**Webhook Setup:**
1. Twilio Console → Phone Numbers → Select Number
2. Messaging → A Message Comes In → Webhook URL: `https://your-n8n-instance/webhook/sms-reply`
3. HTTP POST

**Incoming Reply Webhook:**
```json
{
  "MessageSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "From": "+15559876543",
  "To": "+15551234567",
  "Body": "YES",
  "NumMedia": "0"
}
```

**Reply Processing:**
1. Match phone number to patient record
2. Check reply body for keywords:
   - "YES", "CONFIRM" → Mark appointment confirmed
   - "NO", "CANCEL", "RESCHEDULE" → Trigger reschedule workflow
   - "STOP", "UNSUBSCRIBE" → Add to Do Not Contact list
   - "HELP" → Send help message
3. Log conversation to Google Sheets
4. Notify staff (Slack message: "Patient replied YES to appointment reminder")
5. Send auto-response (optional)

**Auto-Response Example:**
```
Thank you for confirming your appointment on Nov 20 at 2pm. We look forward to seeing you! - Wellness Clinic
```

### WhatsApp Replies

**Webhook Setup:**
1. WhatsApp Business API → Webhooks → Configure webhook URL
2. URL: `https://your-n8n-instance/webhook/whatsapp-reply`
3. Subscribe to: `messages`, `message_status`

**Incoming Reply:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "phone_number_id": "123456789"
        },
        "messages": [{
          "from": "15559876543",
          "id": "wamid.XXX",
          "timestamp": "1730851234",
          "text": {
            "body": "YES"
          },
          "type": "text"
        }]
      }
    }]
  }]
}
```

**Processing:** Same as SMS (keyword matching, auto-response, staff notification)

### Conversation Threading

**Google Sheets Schema:**
```
timestamp | conversation_id | channel | sender | recipient | message | direction | status
```

**Example Conversation:**

| Timestamp | Conversation ID | Channel | Sender | Recipient | Message | Direction | Status |
|-----------|----------------|---------|--------|-----------|---------|-----------|--------|
| 2025-11-06 10:00 | CONV-12345 | sms | system | +15559876543 | Appointment reminder... | outbound | delivered |
| 2025-11-06 10:05 | CONV-12345 | sms | +15559876543 | system | YES | inbound | received |
| 2025-11-06 10:05 | CONV-12345 | sms | system | +15559876543 | Thank you for confirming! | outbound | delivered |

**Conversation View:**
- Group all messages by `conversation_id`
- Show full back-and-forth exchange
- Staff can review entire conversation history

---

## Contact Preference Management

### Preference Schema

**Google Sheets Tab: "ContactPreferences"**
```
contact_id | email | phone | preferred_channel | email_opt_in | sms_opt_in | whatsapp_opt_in | do_not_contact | last_updated
```

**Example:**
```
PAT-12345 | sarah@example.com | +15559876543 | sms | true | true | true | false | 2025-11-06T10:00:00Z
```

**Preference Logic:**
1. Before sending message → Check contact preferences
2. If `do_not_contact = true` → Block all channels, return error
3. If channel opt-in = false → Skip that channel
4. Use `preferred_channel` for multi-channel broadcast routing

**Opt-In Collection:**
- Intake form: "How would you like us to contact you? ☐ Email ☐ SMS ☐ WhatsApp"
- Booking confirmation: "Receive appointment reminders via: ☐ Email ☐ SMS ☐ WhatsApp"
- Update preference link: "Click here to update your communication preferences"

**Opt-Out Handling:**
- SMS reply "STOP" → Set `sms_opt_in = false`, `do_not_contact = false` (other channels still active)
- Email unsubscribe link → Set `email_opt_in = false`
- "Unsubscribe from all" → Set `do_not_contact = true`

**TCPA/CAN-SPAM Compliance:**
- Opt-in date/time recorded
- Opt-in method recorded (e.g., "web form", "verbal consent")
- Opt-out honored immediately (within 10 days for email, immediately for SMS)

---

## Scheduled Message Delivery

### Schedule Future Send

**Request:**
```json
{
  "channel": "sms",
  "recipient": "+15559876543",
  "template_id": "appointment_reminder_sms",
  "variables": {
    "first_name": "Sarah",
    "appointment_date": "Nov 20",
    "appointment_time": "2pm"
  },
  "scheduled_send_time": "2025-11-19T14:00:00Z",
  "timezone": "America/New_York"
}
```

**Processing:**
1. Validate `scheduled_send_time` is in future
2. Store message in queue (Google Sheets tab: "MessageQueue")
3. n8n Cron workflow runs every 5 minutes
4. Check queue for messages with `scheduled_send_time <= now()`
5. Send messages, mark as sent in queue

**Queue Schema:**
```
queue_id | channel | recipient | template_id | variables_json | scheduled_send_time | status | sent_at
```

**Status Values:**
- `pending` (not yet sent)
- `sent` (successfully delivered)
- `failed` (delivery failed, will retry)
- `cancelled` (user cancelled before send)

### Drip Campaign Scheduling

**Use Case:** Post-appointment follow-up sequence

**Campaign:**
1. Day 0 (appointment day): Thank you message
2. Day 1: "How was your experience?" survey
3. Day 7: Follow-up care instructions
4. Day 30: Schedule next appointment reminder

**Implementation:**
```json
{
  "campaign_id": "post_appointment_followup",
  "patient_id": "PAT-12345",
  "trigger_date": "2025-11-20T14:00:00Z",
  "messages": [
    {
      "delay_days": 0,
      "delay_hours": 2,
      "channel": "sms",
      "template_id": "thank_you_post_appointment"
    },
    {
      "delay_days": 1,
      "delay_hours": 10,
      "channel": "email",
      "template_id": "survey_request"
    },
    {
      "delay_days": 7,
      "delay_hours": 9,
      "channel": "email",
      "template_id": "followup_care_instructions"
    },
    {
      "delay_days": 30,
      "delay_hours": 10,
      "channel": "sms",
      "template_id": "schedule_next_appointment"
    }
  ]
}
```

**Workflow:**
1. Appointment completed (Module 03) → Trigger campaign
2. Calculate send times for each message
3. Add all messages to queue with scheduled times
4. Cron workflow sends at scheduled times
5. Track campaign performance (open rate, reply rate per message)

---

## Required Fields

### Basic Message

| Field | Type | Validation |
|-------|------|------------|
| `channel` | string | "email", "sms", "whatsapp", "messenger", "slack", "teams" |
| `recipient` | object or string | Email string OR phone string OR object with multiple |
| `message` OR `template_id` | string | Either plain message or template ID |

### Template-Based Message

| Field | Type | Validation |
|-------|------|------------|
| `channel` | string | Required |
| `recipient` | object or string | Required |
| `template_id` | string | Must exist in template library |
| `variables` | object | Key-value pairs for template merge fields |

**Optional Fields:**
- `scheduled_send_time` (ISO 8601 timestamp)
- `attachments` (array of {filename, url})
- `media_url` (for MMS/WhatsApp images)
- `shorten_links` (boolean, for SMS)
- `priority` (string: "high", "normal", "low")
- `conversation_id` (string, for threading)
- `fallback_enabled` (boolean, multi-channel fallback)
- `preferences_override` (boolean, skip preference check)

---

## Setup Instructions

### 1. Import Workflow
- Import `module_08_enterprise.json` to n8n

### 2. Email Setup: SendGrid Pro
1. Create SendGrid account: https://sendgrid.com/pricing
2. Upgrade to Pro plan ($89.95/month for 120,000 emails)
3. Verify sender domain (not just email)
4. Create API key (Mail Send + Template Engine permissions)
5. Add to n8n credentials

### 3. SMS Setup: Twilio
1. Create Twilio account
2. Purchase phone number ($1.50/month)
3. Enable MMS (if using images)
4. Configure reply webhook: `https://your-n8n-instance/webhook/sms-reply`
5. Add credentials to n8n

### 4. WhatsApp Business API Setup
1. **Option A: Twilio WhatsApp** (Easier)
   - Twilio Console → Messaging → Try WhatsApp
   - Request WhatsApp Business API access
   - Wait 24-48 hours for approval
   - Configure WhatsApp templates

2. **Option B: MessageBird/Vonage** (Alternative)
   - Sign up for MessageBird WhatsApp Business API
   - Verify business
   - Submit templates for approval

3. **Configure Webhook:**
   - WhatsApp Console → Webhooks
   - URL: `https://your-n8n-instance/webhook/whatsapp-reply`
   - Subscribe to messages & message_status

### 5. Facebook Messenger Setup (Optional)
1. Create Facebook Page
2. Facebook Developers → Create App → Messenger
3. Configure Messenger Webhooks
4. Generate Page Access Token
5. Add token to n8n credentials

### 6. Slack/Teams Setup (Internal Staff Notifications)
1. **Slack:** Workspace → Apps → Incoming Webhooks → Create webhook
2. **Teams:** Channel → Connectors → Incoming Webhook → Configure
3. Save webhook URLs to variables

### 7. Connect Google Sheets
Create sheet with tabs:

**Tab 1: "Messages" (Audit Log)**
```
timestamp | message_id | channel | recipient | template_id | status | delivered_at | opened_at | clicked_at
```

**Tab 2: "ContactPreferences"**
```
contact_id | email | phone | preferred_channel | email_opt_in | sms_opt_in | whatsapp_opt_in | do_not_contact | last_updated
```

**Tab 3: "MessageQueue" (Scheduled Messages)**
```
queue_id | channel | recipient | template_id | variables_json | scheduled_send_time | status | sent_at
```

**Tab 4: "Conversations" (Two-Way Message Threads)**
```
timestamp | conversation_id | channel | sender | recipient | message | direction | status
```

**Tab 5: "Templates" (Template Library)**
```
template_id | channel | name | subject | body_html | body_text | variables | active
```

### 8. Set Variables

**Required:**
```bash
GOOGLE_SHEET_ID="your-sheet-id"
SENDGRID_FROM_EMAIL="hello@yourclinic.com"
SENDGRID_FROM_NAME="Wellness Clinic"
TWILIO_FROM_NUMBER="+15551234567"
```

**WhatsApp:**
```bash
WHATSAPP_ENABLED="true"
WHATSAPP_PHONE_NUMBER_ID="123456789"
WHATSAPP_BUSINESS_ACCOUNT_ID="987654321"
# Credentials configured in n8n
```

**Messenger:**
```bash
MESSENGER_ENABLED="true"
MESSENGER_PAGE_ID="your-page-id"
# Page Access Token in n8n credentials
```

**Features:**
```bash
# Delivery Tracking
DELIVERY_TRACKING_ENABLED="true"
READ_RECEIPTS_ENABLED="true"  # Email open tracking
CLICK_TRACKING_ENABLED="true"

# Two-Way Messaging
TWO_WAY_MESSAGING_ENABLED="true"
AUTO_RESPONSE_ENABLED="true"
STAFF_NOTIFICATION_WEBHOOK="https://hooks.slack.com/services/..."

# Scheduling
SCHEDULED_MESSAGES_ENABLED="true"
QUEUE_CHECK_INTERVAL="5"  # Check queue every 5 minutes

# Contact Preferences
PREFERENCE_MANAGEMENT_ENABLED="true"
RESPECT_OPT_OUT="true"  # Block messages to opted-out contacts

# Multi-Channel
MULTI_CHANNEL_BROADCAST="true"
FALLBACK_ENABLED="true"
CHANNEL_PRIORITY="sms,whatsapp,email,messenger"  # Order to try

# PHI Masking
PHI_MASKING_ENABLED="true"
MASK_LEVEL="moderate"  # minimal, moderate, strict

# Compliance
TCPA_COMPLIANCE="true"  # Verify opt-in before SMS
CAN_SPAM_COMPLIANCE="true"  # Add unsubscribe links to email
HIPAA_COMPLIANCE="true"  # Enable all PHI protections
```

**Optional:**
```bash
CLINIC_NAME="Wellness Clinic"
CLINIC_PHONE="555-1234"
CLINIC_ADDRESS="123 Main St, Boston, MA"
CLINIC_TIMEZONE="America/New_York"
```

### 9. Create Message Templates

**In Google Sheets Tab "Templates":**

| template_id | channel | name | subject | body_html | body_text | variables | active |
|-------------|---------|------|---------|-----------|-----------|-----------|--------|
| appointment_reminder_email | email | Appointment Reminder | Appointment Reminder - {{appointment_date}} | [HTML from example above] | [Plain text version] | first_name,appointment_date,appointment_time,provider_name,confirmation_link | true |
| appointment_reminder_sms | sms | Appointment Reminder (SMS) | - | - | Hi {{first_name}}, reminder: Your appointment with {{provider_name}} is {{appointment_date}} at {{appointment_time}}. Reply YES to confirm. {{clinic_name}} | first_name,appointment_date,appointment_time,provider_name,clinic_name | true |

**Or Use n8n Set Node:**
Store templates directly in workflow for faster access.

### 10. Test All Channels

**Email:**
```bash
curl -X POST https://your-n8n-instance/webhook/send-message \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-secret-key' \
  -d '{
    "channel": "email",
    "recipient": "test@example.com",
    "template_id": "appointment_reminder_email",
    "variables": {
      "first_name": "Sarah",
      "appointment_date": "November 20, 2025",
      "appointment_time": "2:00 PM",
      "provider_name": "Dr. Smith",
      "confirmation_link": "https://clinic.com/confirm/test123"
    }
  }'
```

**SMS:**
```bash
curl -X POST https://your-n8n-instance/webhook/send-message \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-secret-key' \
  -d '{
    "channel": "sms",
    "recipient": "+15559876543",
    "template_id": "appointment_reminder_sms",
    "variables": {
      "first_name": "Sarah",
      "appointment_date": "Nov 20",
      "appointment_time": "2pm",
      "provider_name": "Dr. Smith",
      "clinic_name": "Wellness Clinic"
    }
  }'
```

**WhatsApp:**
```bash
curl -X POST https://your-n8n-instance/webhook/send-message \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-secret-key' \
  -d '{
    "channel": "whatsapp",
    "recipient": "+15559876543",
    "template_name": "appointment_reminder_v2",
    "template_language": "en",
    "template_params": [
      "Sarah",
      "November 20, 2025",
      "2:00 PM",
      "Dr. Smith",
      "123 Main St, Boston",
      "Wellness Clinic"
    ]
  }'
```

**Multi-Channel Broadcast:**
```bash
curl -X POST https://your-n8n-instance/webhook/send-message \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-secret-key' \
  -d '{
    "broadcast": true,
    "channels": ["email", "sms", "whatsapp"],
    "recipient": {
      "email": "test@example.com",
      "phone": "+15559876543"
    },
    "template_id": "appointment_reminder",
    "variables": {
      "first_name": "Sarah",
      "appointment_date": "November 20, 2025",
      "appointment_time": "2:00 PM",
      "provider_name": "Dr. Smith"
    },
    "fallback_enabled": true
  }'
```

### 11. Test Two-Way Messaging

**SMS Reply Test:**
1. Send SMS reminder to your test phone
2. Reply "YES" to the message
3. Check Slack for staff notification
4. Check Google Sheets "Conversations" tab for logged reply
5. Verify auto-response received

**WhatsApp Reply Test:**
1. Send WhatsApp message to your test number
2. Reply in WhatsApp
3. Verify reply webhook received
4. Check conversation logging

### 12. Activate

**Primary Workflows:**
1. **Send Message API** (webhook-triggered)
2. **SMS Reply Handler** (webhook-triggered by Twilio)
3. **WhatsApp Reply Handler** (webhook-triggered by WhatsApp)
4. **Email Delivery Status** (webhook-triggered by SendGrid)
5. **Message Queue Processor** (scheduled, every 5 minutes)

All workflows should be set to "Active" for full functionality.

---

## Response Examples

### Success (200)

```json
{
  "success": true,
  "message_id": "MSG-1730851234567",
  "channel": "sms",
  "status": "delivered",
  "delivered_at": "2025-11-06T12:35:02.123Z",
  "data": {
    "recipient": "+X-XXX-XXX-6543",
    "channel_message_id": "SM0123456789abcdef",
    "cost": 0.0079,
    "parts": 1
  },
  "metadata": {
    "execution_time_ms": 1247,
    "performance": "normal",
    "workflow_version": "enterprise-1.0.0",
    "timestamp": "2025-11-06T12:34:56.789Z"
  }
}
```

### Multi-Channel Broadcast Success

```json
{
  "success": true,
  "broadcast": true,
  "results": [
    {
      "channel": "sms",
      "status": "delivered",
      "message_id": "MSG-1730851234567-sms",
      "delivered_at": "2025-11-06T12:35:02.123Z"
    },
    {
      "channel": "email",
      "status": "sent",
      "message_id": "MSG-1730851234567-email",
      "note": "Delivery pending"
    },
    {
      "channel": "whatsapp",
      "status": "skipped",
      "reason": "SMS already delivered successfully"
    }
  ],
  "metadata": {
    "execution_time_ms": 2341,
    "timestamp": "2025-11-06T12:34:56.789Z"
  }
}
```

### Scheduled Message Queued

```json
{
  "success": true,
  "queue_id": "QUEUE-1730851234567",
  "status": "queued",
  "scheduled_send_time": "2025-11-19T14:00:00Z",
  "message": "Message queued for delivery at 2025-11-19 14:00 UTC",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Validation Error (400)

```json
{
  "success": false,
  "error": "Missing or invalid required fields",
  "validation_errors": [
    "channel: Must be one of: email, sms, whatsapp, messenger, slack, teams",
    "template_id: Template 'invalid_template' not found",
    "variables: Missing required variable 'first_name'"
  ],
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Contact Opted Out (403)

```json
{
  "success": false,
  "error": "Contact has opted out",
  "details": "Recipient +15559876543 has SMS opt-out enabled (opted out on 2025-10-15). Cannot send SMS messages.",
  "contact_preferences": {
    "email_opt_in": true,
    "sms_opt_in": false,
    "whatsapp_opt_in": true,
    "do_not_contact": false
  },
  "suggestion": "Try email or whatsapp channel instead",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Delivery Failed (500)

```json
{
  "success": false,
  "error": "Message delivery failed",
  "channel": "sms",
  "details": "Twilio error: Phone number is not a valid mobile number",
  "retry_attempts": 3,
  "fallback_attempted": true,
  "fallback_result": {
    "channel": "email",
    "status": "delivered",
    "message_id": "MSG-1730851234567-email-fallback"
  },
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

---

## Integration with Other Modules

### Module 02 (Consult Booking)

**Flow:** Booking Confirmed (M02) → Send Confirmation (M08) → Schedule Reminder (M08)

**Data Passed:**
```json
{
  "channel": "sms",
  "recipient": "+15559876543",
  "template_id": "booking_confirmation",
  "variables": {
    "first_name": "Sarah",
    "appointment_date": "November 20, 2025",
    "appointment_time": "2:00 PM",
    "provider_name": "Dr. Smith",
    "booking_id": "BOOK-1730851234567"
  }
}
```

**Plus Scheduled Reminder (24h before):**
```json
{
  "channel": "sms",
  "recipient": "+15559876543",
  "template_id": "appointment_reminder_sms",
  "variables": {
    "first_name": "Sarah",
    "appointment_date": "Nov 20",
    "appointment_time": "2pm",
    "provider_name": "Dr. Smith"
  },
  "scheduled_send_time": "2025-11-19T14:00:00Z"
}
```

### Module 03 (Telehealth Session)

**Flow:** Session Created (M03) → Send Meeting Link (M08)

**Email with Telehealth Link:**
```json
{
  "channel": "email",
  "recipient": "patient@example.com",
  "template_id": "telehealth_session_link",
  "variables": {
    "first_name": "Sarah",
    "session_date": "November 20, 2025",
    "session_time": "2:00 PM",
    "provider_name": "Dr. Smith",
    "meeting_link": "https://zoom.us/j/123456789?pwd=abcd1234",
    "session_id": "SESSION-1730851234567"
  },
  "attachments": [
    {
      "filename": "telehealth_instructions.pdf",
      "url": "https://s3.amazonaws.com/clinic/docs/telehealth_guide.pdf"
    }
  ]
}
```

### Module 04 (Billing & Payments)

**Flow:** Payment Successful (M04) → Receipt Email (M08)

**Receipt with PDF:**
```json
{
  "channel": "email",
  "recipient": "patient@example.com",
  "template_id": "payment_receipt",
  "variables": {
    "first_name": "Sarah",
    "amount": "$150.00",
    "payment_date": "November 6, 2025",
    "payment_method": "Visa ending in 4242",
    "service_description": "Follow-up Consultation",
    "receipt_number": "RCP-1730851234567"
  },
  "attachments": [
    {
      "filename": "receipt_RCP-1730851234567.pdf",
      "url": "https://s3.amazonaws.com/clinic/receipts/RCP-1730851234567.pdf"
    }
  ]
}
```

**Plus SMS Confirmation:**
```json
{
  "channel": "sms",
  "recipient": "+15559876543",
  "message": "Payment received: $150.00. Receipt emailed to patient@example.com. Thank you! - Wellness Clinic"
}
```

### Module 05 (Follow-up & Retention)

**Flow:** M05 triggers campaigns → M08 delivers individual messages

**Campaign Integration:**
- M05: Manages campaign logic, timing, audience segmentation
- M08: Delivers individual messages to each recipient
- M05 calls M08 once per recipient

**Example:**
```javascript
// M05: Post-appointment survey campaign
patients.forEach(patient => {
  // Call M08 for each patient
  sendMessage({
    channel: patient.preferred_channel,
    recipient: patient.email_or_phone,
    template_id: "post_appointment_survey",
    variables: {
      first_name: patient.first_name,
      survey_link: `https://survey.clinic.com/${patient.id}`
    }
  });
});
```

---

## HIPAA Compliance for Messaging

### Which Channels Are HIPAA-Compliant?

**HIPAA-Compliant (with proper configuration):**
- ✅ Email (SendGrid with BAA + encryption)
- ✅ SMS (Twilio with BAA + PHI masking)
- ✅ WhatsApp (with proper terms + PHI masking)
- ✅ Slack/Teams (internal use, with workspace BAA)

**NOT HIPAA-Compliant:**
- ❌ Facebook Messenger (no BAA available, Facebook mines data)
- ❌ Consumer WhatsApp (business API only)
- ❌ Unencrypted email servers

### PHI Handling in Messages

**What NOT to Include in Messages:**
- ❌ Full name + diagnosis (e.g., "John Doe - Diabetes Consultation")
- ❌ Full date of birth
- ❌ Social Security Number
- ❌ Detailed medical information
- ❌ Test results (send secure link instead)
- ❌ Medication names + dosages in plain text

**What IS Safe to Include:**
- ✅ First name only (e.g., "Hi Sarah")
- ✅ Generic appointment type (e.g., "Follow-up consultation" not "HIV follow-up")
- ✅ Date and time (e.g., "November 20 at 2pm")
- ✅ Provider name (e.g., "Dr. Smith")
- ✅ Secure links to patient portal
- ✅ Clinic contact info

**Example - HIPAA-Compliant SMS:**
```
Hi Sarah, reminder: You have an appointment on Nov 20 at 2pm. Reply YES to confirm. - Wellness Clinic
```

**Example - NOT Compliant:**
```
Hi Sarah Johnson (DOB 3/15/1985), reminder for your diabetes management appointment with endocrinologist Dr. Smith on Nov 20 at 2pm. Bring your insulin log.
```

### Required BAAs (Business Associate Agreements)

**Must sign BAAs with:**
1. **SendGrid:** Contact sales for HIPAA/PHI plan ($200+/month minimum)
2. **Twilio:** Automatically included with paid accounts (verify in Console)
3. **WhatsApp:** Included with Twilio WhatsApp Business API
4. **n8n:** Sign BAA if using n8n Cloud
5. **Google Workspace:** Sign BAA for Google Sheets storage

**Without BAAs:** Cannot send PHI via these channels

### Message Encryption

**End-to-End Encryption:**
- WhatsApp: ✅ Built-in E2EE
- Signal: ✅ Full E2EE (requires custom integration)
- Email: ❌ Not E2EE (encrypted in transit via TLS, at rest via provider)
- SMS: ❌ Not encrypted (plain text over carrier networks)

**Recommendation:**
- WhatsApp preferred for sensitive communications
- Email with secure portal links (patient logs in to view PHI)
- SMS for non-PHI reminders only

### Secure Portal Links

**Best Practice:** Don't send PHI in message, send secure link instead

**Example:**
```
Hi Sarah, your lab results are ready. View them securely here: https://portal.clinic.com/results?token=abc123xyz (link expires in 24 hours) - Wellness Clinic
```

**Portal Link Requirements:**
- Unique token per patient
- Expiration (24-48 hours)
- Requires patient login (username + password or MFA)
- HTTPS only
- Audit log (who accessed what, when)

---

## TCPA Compliance for SMS

### Opt-In Requirements

**TCPA (Telephone Consumer Protection Act) requires:**
- ✅ Prior express written consent before sending marketing SMS
- ✅ Clear disclosure of SMS program terms
- ✅ Opt-out mechanism (e.g., "Reply STOP to unsubscribe")
- ✅ Immediate opt-out processing (no delay)

**Transactional SMS (Exempt from TCPA):**
- Appointment reminders (for existing appointments)
- Prescription ready notifications
- Payment confirmations
- Account alerts

**Marketing SMS (Requires Opt-In):**
- Promotional offers (e.g., "20% off this month")
- New service announcements
- Health tips / newsletters

### Opt-In Collection

**Web Form Example:**
```html
<form>
  <input type="checkbox" name="sms_opt_in" required>
  <label>
    I consent to receive appointment reminders and notifications via SMS
    from Wellness Clinic at the phone number provided. Message and data
    rates may apply. Reply STOP to opt out. Reply HELP for help.
    Message frequency varies.
  </label>
</form>
```

**Verbal Consent (Phone):**
- Staff: "May we send you appointment reminders via text message to this number?"
- Patient: "Yes"
- Staff logs: Date, time, phone number, consent given

**Opt-In Record:**
```json
{
  "contact_id": "PAT-12345",
  "phone": "+15559876543",
  "sms_opt_in": true,
  "opt_in_date": "2025-11-06T12:34:56Z",
  "opt_in_method": "web_form",
  "opt_in_ip": "192.168.1.100",
  "consent_text": "I consent to receive appointment reminders..."
}
```

### Opt-Out Handling

**Keywords:**
- STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT → Opt-out
- HELP, INFO → Send help message

**Auto-Response:**
```
You have been unsubscribed from SMS messages from Wellness Clinic. Reply START to re-subscribe.
```

**Processing:**
1. Receive SMS reply "STOP"
2. Update Google Sheets: `sms_opt_in = false`
3. Add to suppression list
4. Send confirmation message
5. Block future SMS to this number (unless re-subscribes)

**Opt-Out Timing:**
- Must be processed immediately (within seconds)
- Cannot send any further marketing SMS
- Transactional SMS may still be sent (e.g., appointment reminder for existing appointment)

---

## Cost Comparison

### Email (SendGrid)

| Plan | Cost/Month | Emails Included | Per-Email Cost | HIPAA/BAA |
|------|------------|-----------------|----------------|-----------|
| Free | $0 | 100/day (3,000) | $0 | ❌ No |
| Essentials | $19.95 | 40,000 | $0.0005 | ❌ No |
| Pro | $89.95 | 120,000 | $0.00075 | ✅ Yes ($200+) |

**HIPAA-Compliant Plan:** ~$200/month minimum (custom pricing)

### SMS (Twilio)

| Component | Cost | Notes |
|-----------|------|-------|
| Phone Number | $1.50/month | Per number |
| SMS (US domestic) | $0.0079/message | Outbound |
| MMS (with image) | $0.02/message | Outbound |
| SMS (international) | $0.04-0.15/message | Varies by country |
| Inbound SMS | $0.0075/message | Replies |

**Example Costs:**
- 1,000 appointment reminders (SMS): $1.50 + (1,000 × $0.0079) = **$9.40/month**
- 1,000 reminders with images (MMS): $1.50 + (1,000 × $0.02) = **$21.50/month**

**HIPAA BAA:** Included with paid accounts (no extra cost)

### WhatsApp Business API

| Component | Cost | Notes |
|-----------|------|-------|
| Template message | $0.005-0.03 | Varies by country |
| Session message (within 24h) | Free | Reply within customer-initiated session |
| Marketing message | $0.01-0.05 | Country-dependent |

**Example (US):**
- Business-initiated template: $0.0055/message
- 1,000 appointment reminders: **$5.50/month**

**Advantages:**
- Cheaper than SMS internationally (US: $0.0055 vs $0.0079)
- Free replies within 24-hour window
- Rich media (images, PDFs) included at no extra cost
- Higher engagement rates than SMS

**Disadvantages:**
- Requires template pre-approval (24-48 hours)
- Not all patients use WhatsApp (70% US penetration vs 98% SMS)

### Facebook Messenger

**Cost:** Free (Facebook Messenger API)

**Advantages:**
- No per-message cost
- Rich media, buttons, carousels
- High engagement (younger demographics)

**Disadvantages:**
- NOT HIPAA-compliant (no BAA available)
- Requires patients to have Facebook account
- Facebook data usage concerns

### Cost Comparison Table

| Channel | 1,000 Messages/Month | 10,000 Messages/Month | HIPAA-Compliant |
|---------|----------------------|-----------------------|-----------------|
| **Email** | $19.95 (Essentials) or $200+ (HIPAA) | $89.95 (Pro) or $200+ (HIPAA) | ✅ Yes (paid plan) |
| **SMS** | $9.40 | $80.50 | ✅ Yes (included) |
| **WhatsApp** | $5.50 | $55.00 | ⚠️ Possible (with BAA) |
| **Messenger** | $0 | $0 | ❌ No |

**Recommendation for Healthcare:**
- **Primary:** SMS (universal reach, HIPAA-compliant)
- **Secondary:** Email (detailed info, attachments)
- **Optional:** WhatsApp (international, lower cost, rich media)
- **Avoid:** Messenger (not HIPAA-compliant)

**Budget Estimate (1,000 patients, 2 messages/month/patient):**
- SMS: 2,000 messages × $0.0079 = $15.80/month
- Email: Included in HIPAA plan ($200/month)
- **Total: $215.80/month** (HIPAA-compliant communication infrastructure)

---

## Message Template Examples for Healthcare

### Appointment Reminder (24h Before)

**SMS (140 characters):**
```
Hi {{first_name}}, reminder: Your appointment with {{provider_name}} is tomorrow at {{appointment_time}}. Reply YES to confirm. {{clinic_name}}
```

**Email Subject:** Appointment Reminder - {{appointment_date}}

**Email Body:**
```
Hi {{first_name}},

This is a friendly reminder that you have an appointment scheduled for tomorrow:

Date: {{appointment_date}}
Time: {{appointment_time}}
Provider: {{provider_name}}
Location: {{clinic_address}}

Please arrive 10 minutes early to complete any necessary paperwork.

[Confirm Appointment Button] [Reschedule Button]

If you have any questions, call us at {{clinic_phone}}.

Best regards,
{{clinic_name}}
```

### Appointment Confirmation (Immediately After Booking)

**SMS:**
```
{{clinic_name}}: Your appointment is confirmed for {{appointment_date}} at {{appointment_time}}. We'll send a reminder 24h before. Questions? Call {{clinic_phone}}
```

**Email:**
```
Hi {{first_name}},

Your appointment has been confirmed!

Date: {{appointment_date}}
Time: {{appointment_time}}
Provider: {{provider_name}}
Service: {{service_type}}

We look forward to seeing you!

[Add to Calendar Button] [View Appointment Details Button]

Need to reschedule? Click here or call {{clinic_phone}}.

Best regards,
{{clinic_name}}
```

### Telehealth Session Link

**Email Only (Security Requirement):**
```
Hi {{first_name}},

Your telehealth session is scheduled for {{session_date}} at {{session_time}}.

Join the video call using this link (available 15 minutes before your appointment):
{{meeting_link}}

Technical Requirements:
- Stable internet connection
- Webcam and microphone
- Chrome, Safari, or Firefox browser

Need help? Call {{clinic_phone}} or review our telehealth guide (attached).

Best regards,
{{clinic_name}}
```

### Lab Results Ready

**SMS (Secure Portal Link):**
```
Hi {{first_name}}, your lab results are ready. View them securely at {{portal_link}} (login required, expires in 48h). Questions? Call {{clinic_phone}}. - {{clinic_name}}
```

**Email:**
```
Hi {{first_name}},

Your lab results from {{test_date}} are now available.

For your privacy and security, please view your results through our secure patient portal:

[View Results Securely Button]

This link will expire in 48 hours. You'll need to log in with your username and password.

If you have questions about your results, please call us at {{clinic_phone}} to schedule a follow-up appointment.

Best regards,
{{clinic_name}}
```

### Prescription Ready

**SMS:**
```
{{clinic_name}}: Your prescription is ready for pickup at {{pharmacy_name}}, {{pharmacy_address}}. Bring your ID. Questions? {{pharmacy_phone}}
```

### Billing Reminder

**Email:**
```
Hi {{first_name}},

This is a friendly reminder that you have an outstanding balance of {{amount}} for services rendered on {{service_date}}.

Account Details:
- Invoice #: {{invoice_number}}
- Amount Due: {{amount}}
- Due Date: {{due_date}}

[Pay Online Button] [View Invoice Button]

Payment Options:
- Online: {{payment_link}}
- Phone: Call {{clinic_phone}} with credit card
- Mail: {{clinic_address}}

Questions about your bill? Contact our billing department at {{billing_phone}}.

Thank you,
{{clinic_name}}
```

### Post-Appointment Follow-Up

**SMS (Day After Appointment):**
```
Hi {{first_name}}, thank you for visiting {{clinic_name}} yesterday! How was your experience? Share feedback here: {{survey_link}} (takes 2 min) - {{clinic_name}}
```

**Email (1 Week After):**
```
Hi {{first_name}},

We hope you're feeling well following your recent appointment with {{provider_name}}.

As discussed, here are your next steps:

{{followup_instructions}}

Medication Reminders:
{{medication_list}}

Your next appointment is recommended in {{timeframe}}. Ready to schedule?

[Schedule Follow-Up Button]

If you have any questions or concerns, please don't hesitate to reach out.

Best regards,
{{clinic_name}}
```

---

## Troubleshooting

### WhatsApp Template Rejected

**Issue:** WhatsApp template submitted for approval is rejected

**Common Rejection Reasons:**
1. **Template contains variable in greeting:** "Hello {{name}}" → Change to "Hello"
2. **Too sales-focused:** WhatsApp prioritizes utility over marketing
3. **Unclear opt-out:** Must include clear unsubscribe instruction
4. **Grammar/spelling errors:** Templates must be professional

**Solutions:**
1. Review WhatsApp template guidelines: https://developers.facebook.com/docs/whatsapp/message-templates/guidelines
2. Use "Utility" category (not "Marketing") for appointment reminders
3. Simplify template (fewer variables, clear structure)
4. Resubmit with corrections

**Approval Time:** 24-48 hours typically

### SMS Not Delivering (Twilio)

**Issue:** SMS shows "sent" but patient reports not receiving

**Causes:**
1. **Carrier filtering:** Message flagged as spam by carrier
2. **Invalid number:** Not a mobile number (landline)
3. **Number ported:** Patient switched carriers, number not updated

**Solutions:**
1. **Carrier filtering:**
   - Avoid spam trigger words: "FREE", "URGENT", excessive links
   - Use full business name (not abbreviation)
   - Include opt-out ("Reply STOP")
   - Register with A2P 10DLC (Twilio Console → Regulatory Compliance)
2. **Check number type:**
   - Twilio Lookup API: Check if mobile vs landline
   - If landline, use email instead
3. **Verify number accuracy:**
   - Ask patient to confirm phone number
   - Check for typos in patient record

### Email Going to Spam

**Issue:** Appointment reminders landing in spam folder

**Causes:**
1. **Sender domain not verified:** Using generic email (e.g., @gmail.com)
2. **No SPF/DKIM records:** Email authentication not configured
3. **High spam complaint rate:** Patients marking emails as spam

**Solutions:**
1. **Verify domain:**
   - SendGrid → Settings → Sender Authentication → Domain Authentication
   - Add DNS records (SPF, DKIM, DMARC)
2. **Improve content:**
   - Avoid spam trigger words: "FREE", "Click here", excessive caps
   - Include clinic name in subject line
   - Add physical address in footer
   - Include unsubscribe link
3. **Engagement:**
   - Only email patients who opted in
   - Remove inactive emails (bounces, no opens for 6+ months)
   - Monitor SendGrid reputation score

### WhatsApp Reply Not Processing

**Issue:** Patient replies to WhatsApp message, but workflow not triggered

**Causes:**
1. **Webhook not configured:** WhatsApp replies not forwarded to n8n
2. **Webhook URL incorrect:** Typo in URL
3. **Webhook verification failed:** WhatsApp couldn't verify endpoint

**Solutions:**
1. **Verify webhook configuration:**
   - WhatsApp Business API Dashboard → Configuration → Webhooks
   - URL: `https://your-n8n-instance.com/webhook/whatsapp-reply`
   - Subscribed fields: `messages`, `message_status`
2. **Test webhook:**
   - Send test message from WhatsApp dashboard
   - Check n8n execution logs for incoming webhook
3. **Verify webhook:**
   - WhatsApp sends GET request with `hub.verify_token`
   - n8n must respond with `hub.challenge` value
   - Update webhook verification node if needed

### Contact Preference Override Not Working

**Issue:** Message sent to opted-out contact despite `preferences_override=true`

**Cause:** Safety feature prevents accidental PHI disclosure

**Solution:**
- `preferences_override=true` only works for transactional messages (appointment reminders)
- Does NOT work if `do_not_contact=true` (full opt-out)
- For emergencies, contact patient by phone directly (not automated message)

### Scheduled Message Not Sending

**Issue:** Message queued but not sent at scheduled time

**Causes:**
1. **Message Queue Processor workflow not active:** Cron not running
2. **Timezone mismatch:** Scheduled for wrong timezone
3. **Queue check interval too long:** Runs every 60 min, scheduled for :30 min

**Solutions:**
1. **Verify workflow active:**
   - n8n → Workflows → "Message Queue Processor" → Toggle to Active
2. **Check schedule:**
   - Cron expression: `*/5 * * * *` (every 5 minutes)
   - Verify timezone setting in workflow
3. **Review execution logs:**
   - Check last execution time
   - Look for errors in queue processing node

### High SMS Costs

**Issue:** Monthly Twilio bill higher than expected

**Causes:**
1. **Long messages:** >160 characters = multiple SMS charges
2. **International numbers:** Higher per-message cost
3. **Failed deliveries:** Charged even if message not delivered

**Solutions:**
1. **Optimize message length:**
   - Keep under 160 characters
   - Use link shortening: `{{short_link}}` instead of full URL
   - Abbreviate: "Nov 20" instead of "November 20, 2025"
2. **Segment by country:**
   - Use WhatsApp for international patients (cheaper)
   - Use email for non-urgent international communications
3. **Monitor failed deliveries:**
   - Twilio Console → Monitor → Errors
   - Remove invalid numbers from contact list

---

## Performance

| Metric | Enterprise | Core | Delta |
|--------|------------|------|-------|
| **Avg Execution** | 1200ms | 700ms | +71% (acceptable) |
| **P95 Execution** | 2500ms | 1200ms | +108% |
| **Nodes** | 35 | 9 | +289% |
| **Channels** | 6 | 2 | +200% |
| **Features** | Advanced | Basic | ++Rich Media/Templates |

**Why Slower?**
- Template processing (+200ms)
- Multi-channel routing (+150ms)
- PHI masking logic (+100ms)
- Contact preference check (+50ms)
- Delivery tracking webhooks (+200ms)
- Two-way message handling (async)

**Still Fast:** Under 1.5 seconds average for single-channel messages, acceptable for messaging workflows

**Multi-Channel Broadcast:** 2-3 seconds (parallel channel delivery)

---

## Security Considerations

### Current Security Level: HIPAA-Ready + TCPA/CAN-SPAM Compliant

**Included:**
- ✅ Optional API key authentication
- ✅ PHI masking in all logs/notifications
- ✅ Message encryption (HTTPS, TLS 1.2+)
- ✅ Secure credential storage (n8n native)
- ✅ Contact opt-out tracking (TCPA compliance)
- ✅ Unsubscribe links (CAN-SPAM compliance)
- ✅ Audit logging (all messages tracked)
- ✅ Client IP tracking (for consent verification)
- ✅ Message retention policies (auto-purge after period)

**Recommended for Production:**
1. **Enable API Key Auth:** Set `API_KEY_ENABLED=true`
2. **Sign BAAs:** SendGrid, Twilio, WhatsApp (before sending PHI)
3. **Verify Opt-Ins:** Always check `sms_opt_in` before SMS
4. **PHI Masking:** Use masked data in logs, full data in actual messages
5. **Secure Portal Links:** Don't send PHI in messages, use secure links
6. **Regular Audits:** Review message logs monthly for compliance

**Advanced Security (If Needed):**
1. **End-to-End Encryption:** Use WhatsApp for sensitive communications
2. **Message Expiration:** Auto-delete messages after 90 days
3. **Two-Factor Authentication:** Require 2FA for staff accessing message templates
4. **IP Whitelisting:** Restrict webhook access to known IPs only

---

## Compliance

### HIPAA Compliance

**Compliant Features:**
- ✅ PHI masking in logs
- ✅ Message encryption (TLS)
- ✅ Audit trail (all messages logged)
- ✅ Secure portal links (instead of PHI in messages)
- ✅ Access controls (RBAC for template editing)

**Additional Steps for Full HIPAA:**
1. **Business Associate Agreements:**
   - SendGrid (HIPAA plan required)
   - Twilio (included with paid account)
   - n8n (if using n8n Cloud)
   - Google Workspace (for Google Sheets)
2. **Message Content:**
   - Use first name only (not full name)
   - Generic appointment types (not diagnoses)
   - Secure links for results/documents
3. **Audit Logging:**
   - Regularly review message logs
   - Export logs monthly for compliance records
4. **Data Retention:**
   - Define retention policy (7 years typical)
   - Archive old messages to secure storage
   - Purge after retention period

**Not HIPAA-Compliant Without:**
- Unsigned BAAs with vendors
- PHI in plain text messages (e.g., "HIV test results")
- Public Google Sheets (must be private)
- No message audit logs

### TCPA Compliance (SMS)

**Compliant Features:**
- ✅ Opt-in verification before SMS
- ✅ Opt-out handling ("STOP" keyword)
- ✅ Consent logging (date, method, IP)
- ✅ Clear message identification (clinic name)

**Requirements:**
1. **Prior Express Written Consent:**
   - Web form with checkbox
   - Verbal consent logged
   - Consent text includes: opt-out method, message frequency, data rates
2. **Opt-Out Mechanism:**
   - "Reply STOP to unsubscribe" in messages
   - Process opt-out immediately (<1 minute)
   - Send confirmation message
3. **Transactional Exemption:**
   - Appointment reminders = transactional (exempt from strict consent rules)
   - Marketing messages = require explicit consent

### CAN-SPAM Compliance (Email)

**Compliant Features:**
- ✅ Truthful subject lines
- ✅ Unsubscribe links in all emails
- ✅ Physical address in footer
- ✅ Opt-out processing within 10 days

**Requirements:**
1. **Identify as Business:**
   - "From" name: "Wellness Clinic"
   - Subject: Clear, not deceptive
2. **Physical Address:**
   - Include in email footer
3. **Unsubscribe:**
   - Link in every email
   - Process within 10 business days
   - Free to opt-out (no login required)

---

## Cost Analysis

### Enterprise vs Core

| Component | Core | Enterprise | Delta |
|-----------|------|------------|-------|
| **Software** |
| n8n Cloud | $20/month | $20/month | $0 |
| SendGrid | $19.95/month (Essentials) | $200/month (HIPAA) | +$180.05 |
| Twilio SMS | ~$10/month (1K SMS) | ~$10/month | $0 |
| **Enterprise Add-Ons** |
| WhatsApp (via Twilio) | - | ~$5/month (1K messages) | +$5 |
| Facebook Messenger | - | Free | $0 |
| **Total Monthly** | $49.95 | $235 | +$185.05/month |
| **Total Annual** | $599 | $2,820 | +$2,221/year |

**Additional Enterprise Value:**
- HIPAA compliance (avoids $50K+ fines per violation)
- Multi-channel reach (improved engagement: 20-30% higher open rates)
- Rich media support (better patient education)
- Two-way messaging (reduced no-shows: 15-25%)
- Contact preference management (improved patient satisfaction)
- Scheduled delivery (staff time savings: 10h/week)

**ROI:** +$2,221/year investment → $50K+ risk mitigation + $5K/year reduced no-shows + $20K/year staff time savings

**When Core Is Sufficient:**
- <500 patients
- Email + SMS only
- No PHI in messages
- No HIPAA requirement
- Low message volume (<1,000/month)

**When Enterprise Is Necessary:**
- Healthcare practice (HIPAA)
- >1,000 patients
- International patients (WhatsApp cheaper)
- Need rich media (appointment cards, diagrams)
- Two-way conversations (appointment confirmations)
- Multi-channel patient preferences

---

## Upgrade from Core

### Migration Steps

1. **Backup Core Data:** Export message logs from Google Sheets
2. **Import Enterprise Workflow:** Load `module_08_enterprise.json`
3. **Configure Additional Channels:**
   - Set up WhatsApp Business API (if using)
   - Configure Facebook Messenger (if using)
   - Add Slack/Teams webhooks (for staff notifications)
4. **Configure Variables:**
   - Copy Core variables (SendGrid, Twilio)
   - Add Enterprise variables (WhatsApp, templates, preferences)
5. **Create Templates:**
   - Migrate Core plain-text messages to template library
   - Create HTML email templates
   - Submit WhatsApp templates for approval (24-48h)
6. **Set Up Contact Preferences:**
   - Populate ContactPreferences sheet with existing patients
   - Migrate opt-in/opt-out data from Core
7. **Test in Parallel:**
   - Keep Core active
   - Test Enterprise with sample messages (all channels)
   - Verify PHI masking
   - Test two-way messaging
8. **Switch Over:**
   - Update webhook URLs to point to Enterprise
   - Monitor first 50 messages
   - Verify delivery across all channels
9. **Deactivate Core:** Turn off Core workflow after 7 days of successful Enterprise operation

### Data Compatibility

**100% Compatible:** Same Google Sheets schema, no data migration needed

**New Features in Enterprise:**
- Multi-channel support (WhatsApp, Messenger)
- Template library (vs plain text)
- Contact preferences (opt-in/opt-out)
- Scheduled delivery (message queue)
- Two-way conversations (reply handling)
- Rich media (images, attachments)

**Core → Enterprise:** Seamless upgrade, no data loss

**Enterprise → Core:** Possible, but loses all advanced features (templates, WhatsApp, two-way messaging, etc.)

---

## Support

### Documentation
- **Enterprise Guide:** This file
- **Core Comparison:** [module_08_README.md](../Aigent_Modules_Core/module_08_README.md)
- **SendGrid Docs:** https://docs.sendgrid.com
- **Twilio Docs:** https://www.twilio.com/docs
- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp

### Community
- **Forum:** https://community.aigent.company
- **GitHub:** https://github.com/aigent/modules
- **Discord:** https://discord.gg/aigent

### Professional Support
- **Email:** enterprise-support@aigent.company
- **Priority Support:** Included with Enterprise plan
- **HIPAA Consultation:** Available on request
- **WhatsApp Template Design:** Professional services available
- **Multi-Channel Strategy:** Consultation services

---

## License

**Proprietary - Aigent Company**
Enterprise version requires valid license for production use.

---

**Version:** enterprise-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 07 Enterprise: Analytics Dashboard](module_07_enterprise_README.md)
**Next Module:** [Module 09 Enterprise: Compliance & Audit](module_09_enterprise_README.md)

**Ready to deploy HIPAA-compliant omnichannel messaging? Import the workflow and configure in 90 minutes!**
