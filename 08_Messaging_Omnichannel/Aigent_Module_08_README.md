# Aigent Module 08 - Messaging & Omnichannel Hub

**Version:** 1.0.0
**Last Updated:** 2025-01-15
**Node Range:** 801-832
**Purpose:** Unified messaging hub for SMS, WhatsApp, Email, Telegram, and Webchat communications

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Input Schema](#input-schema)
4. [Output Schema](#output-schema)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Channel Setup Guides](#channel-setup-guides)
8. [Message Routing Logic](#message-routing-logic)
9. [Intent Classification](#intent-classification)
10. [AIgent Bot Integration](#aigent-bot-integration)
11. [CRM Integration](#crm-integration)
12. [Staff Notifications](#staff-notifications)
13. [Message Logging](#message-logging)
14. [Conversation Threading](#conversation-threading)
15. [Outbound Campaigns](#outbound-campaigns)
16. [Advanced Features](#advanced-features)
17. [Testing](#testing)
18. [Troubleshooting](#troubleshooting)
19. [Security & Compliance](#security--compliance)
20. [Analytics Integration](#analytics-integration)

---

## Overview

Module 08 is the real-time communications engine of the Aigent Universal Clinic Template. It serves as the central hub for all patient-clinic interactions across multiple messaging channels, providing intelligent routing, automated responses via AI, and comprehensive conversation management.

### Key Features

- **Omnichannel support:** SMS, WhatsApp, Email, Telegram, Webchat
- **Intelligent routing:** Intent classification, priority detection, business hours awareness
- **AI bot integration:** Automated responses via AIgent bot API with confidence scoring
- **CRM synchronization:** Auto-creates contacts, updates conversation history in real-time
- **Staff notifications:** Real-time alerts via Slack, Teams, or Email with message preview
- **Conversation logging:** Complete audit trail in Google Sheets/Airtable/Database
- **After-hours handling:** Automated responses outside business hours with queueing
- **Urgent escalation:** Immediate staff alerts for emergency keywords
- **Thread management:** Groups conversations and maintains context across messages
- **Multi-language support:** Translation and language detection (optional)
- **Rich media handling:** Images, videos, documents, voice messages
- **PHI-safe design:** Redacts sensitive information in logs automatically

### Module Chaining

**Accepts input from:**
- Direct patient messages (SMS, WhatsApp, Email, Telegram)
- Module 05 (Follow-up campaigns triggering conversations)
- Webchat widgets on clinic website

**Input format:** Channel-specific message payloads (normalized internally to unified schema)

**Output format:** `message_log.json`

**Integrates with:**
- Module 02 (Booking) - Routes booking-intent messages
- Module 04 (Billing) - Routes billing-intent messages
- Module 07 (Analytics) - Provides messaging metrics
- AIgent Bot API - For intelligent auto-responses

---

## Architecture

### Workflow Components

```
┌────────────────────────────────────────────────────────────────────┐
│                    INBOUND MESSAGE RECEPTION LAYER                  │
└────────────────────────────────────────────────────────────────────┘

  Webhook - Unified Receiver (801)
        ↓
  Normalize Message Format (802)
    • Twilio SMS: From, To, Body, MessageSid
    • Twilio WhatsApp: From (whatsapp:...), Body
    • SendGrid Email: from, to, subject, text, html
    • Telegram: message.from.id, message.text
    • Webchat: Custom format with channel field
        ↓
  Validate Message (803)
    • Check: channel, from, message not empty
    • Reject invalid with 400 error
        ↓
  Classify Message Intent (805)
    • Extract keywords
    • Determine intent: booking, billing, urgent, support, general
    • Check priority: urgent vs normal
    • Check business hours vs after-hours


┌────────────────────────────────────────────────────────────────────┐
│                       CONTACT MANAGEMENT LAYER                      │
└────────────────────────────────────────────────────────────────────┘

  Check If Test Message (806)
    • Filter test phone numbers
    • Skip processing if test pattern matches
        ↓
  Lookup Contact in CRM (807)
    • Search HubSpot by phone or email
    • Retrieve contact record if exists
        ↓
  Check If Contact Exists (808)
        ↓ [Not Found]
  Create New Contact (809)
    • Auto-create with phone/email
    • Set lifecycle_stage: "lead"
    • Set lead_source: channel (sms, whatsapp, etc.)
        ↓
  Merge Contact Data (810)
    • Combine message with contact info
    • Prepare enriched payload for routing


┌────────────────────────────────────────────────────────────────────┐
│                    INTELLIGENT ROUTING LAYER                        │
└────────────────────────────────────────────────────────────────────┘

  ┌─── Check If Urgent (811)
  │         ↓ [Priority = urgent]
  │    Send Urgent Alert to Slack (812)
  │         ↓
  │    Continue to Bot/Staff Response
  │
  └─── Check If After Hours (813)
            ↓ [after_hours = true]
       Generate After-Hours Response (814)
            ↓ [after_hours = false, during business hours]
       Check If AIgent Bot Enabled (815)
            ↓ [AIGENT_BOT_ENABLED = true]
       Call AIgent Bot API (816)
            • POST to AIGENT_BOT_ENDPOINT
            • Include: message, contact, intent, context
            • Timeout: 30 seconds
            ↓
       Process Bot Response (817)
            • Extract response text
            • Check confidence score
            • Fallback to human if confidence < threshold
            ↓ [AIGENT_BOT_ENABLED = false]
       Generate Default Response (818)
            • "A team member will respond shortly"


┌────────────────────────────────────────────────────────────────────┐
│                  OUTBOUND RESPONSE DELIVERY LAYER                   │
└────────────────────────────────────────────────────────────────────┘

  Switch by Channel (819-821)
        ↓
  ┌─ SMS (819)
  │    → Send SMS via Twilio (822)
  │       • POST to Twilio Messages API
  │       • From: TWILIO_FROM_NUMBER
  │       • To: Original sender
  │       • Body: Response message
  │
  ├─ WhatsApp (820)
  │    → Send WhatsApp via Twilio (823)
  │       • POST to Twilio Messages API
  │       • From: whatsapp:TWILIO_WHATSAPP_NUMBER
  │       • To: whatsapp:Original sender
  │       • Body: Response message
  │
  └─ Email (821)
       → Send Email Reply (824)
          • SMTP send via configured email service
          • From: EMAIL_FROM
          • To: Original sender email
          • Subject: Re: [original subject]
          • Body: Response message


┌────────────────────────────────────────────────────────────────────┐
│                   LOGGING & NOTIFICATION LAYER                      │
└────────────────────────────────────────────────────────────────────┘

  Update CRM Contact (825)
    • Set last_message_date: timestamp
    • Set last_message_channel: sms/whatsapp/email
    • Set last_message_content: truncated message (200 chars)
    • Increment total_messages counter
        ↓
  Log to Google Sheets (826)
    • Append row with full conversation data
    • Columns: Timestamp, Trace ID, Direction, Channel, From, To,
      Contact Name, Contact ID, Message, Intent, Priority,
      Response, Response Type, After Hours
        ↓
  Check If Staff Notification Needed (827)
    • Condition: STAFF_NOTIFICATION_ENABLED = true
    • Condition: auto_response = false (manual response needed)
        ↓ [Notification Needed]
  Notify Staff on Slack (828)
    • POST to SLACK_WEBHOOK_URL
    • Channel: SLACK_MESSAGES_CHANNEL
    • Include: Contact name, channel, intent, message preview,
      dashboard link for reply
        ↓
  Build message_log.json (829)
    • Construct standardized output schema
    • Include: trace_id, message_log, contact, classification, metadata
        ↓
  Return message_log.json (830)
    • HTTP 200 with JSON response


┌────────────────────────────────────────────────────────────────────┐
│                       ERROR HANDLING LAYER                          │
└────────────────────────────────────────────────────────────────────┘

  Any Stage Error
        ↓
  Error Handler (831)
    • Capture error message and stage
    • Log to console if DEBUG_MODE = true
    • Format error response
        ↓
  Return Error Response (832)
    • HTTP 500 with error JSON
    • Include: success:false, error, stage, trace_id, timestamp
```

### Node Breakdown

| Node ID | Name | Type | Purpose | Inputs | Outputs |
|---------|------|------|---------|--------|---------|
| 801 | Webhook Receiver | Webhook | Accept all inbound messages | HTTP POST body | Raw message payload |
| 802 | Normalize Format | Code | Convert to unified schema | Channel-specific payload | Normalized message object |
| 803 | Validate Message | If | Check required fields | Normalized message | Valid or invalid branch |
| 804 | Return Validation Error | Respond | 400 error response | Invalid message | HTTP 400 JSON |
| 805 | Classify Intent | Code | Detect intent, priority, hours | Normalized message | Message + classification |
| 806 | Check Test Message | If | Filter test numbers | Message + classification | Test or real branch |
| 807 | Lookup Contact | HubSpot | Find existing contact | Phone/email | Contact record or empty |
| 808 | Check Contact Exists | If | Evaluate CRM lookup | Contact record | Exists or not found |
| 809 | Create New Contact | HubSpot | Auto-create contact | Phone/email from message | New contact ID |
| 810 | Merge Contact Data | Code | Enrich message with contact | Message + contact | Enriched payload |
| 811 | Check Urgent | If | Evaluate priority | Classification.priority | Urgent or normal |
| 812 | Send Urgent Alert | HTTP | Notify staff via Slack | Urgent message | Slack notification sent |
| 813 | Check After Hours | If | Evaluate business hours | Classification.after_hours | After-hours or business hours |
| 814 | Generate After-Hours Response | Code | Create auto-reply | Message + hours config | After-hours response text |
| 815 | Check Bot Enabled | If | Evaluate bot flag | AIGENT_BOT_ENABLED env | Bot or manual route |
| 816 | Call Bot API | HTTP | Request bot response | Message + contact + intent | Bot response JSON |
| 817 | Process Bot Response | Code | Extract response text | Bot API response | Formatted bot response |
| 818 | Generate Default Response | Code | Fallback response | Message data | Default response text |
| 819 | Switch: SMS | If | Route if channel=sms | Channel field | SMS or other |
| 820 | Switch: WhatsApp | If | Route if channel=whatsapp | Channel field | WhatsApp or other |
| 821 | Switch: Email | If | Route if channel=email | Channel field | Email or other |
| 822 | Send SMS | HTTP | Twilio SMS API | Response message | Twilio MessageSid |
| 823 | Send WhatsApp | HTTP | Twilio WhatsApp API | Response message | Twilio MessageSid |
| 824 | Send Email | Email Send | SMTP delivery | Response message | Email sent confirmation |
| 825 | Update CRM | HubSpot | Update contact record | Contact ID + message data | Updated contact |
| 826 | Log to Sheets | Google Sheets | Append conversation log | Full message data | Sheet row appended |
| 827 | Check Staff Notification | If | Evaluate notification need | Auto-response flag | Notify or skip |
| 828 | Notify Staff | HTTP | Slack webhook | Message preview | Slack notification sent |
| 829 | Build Output | Code | Construct message_log.json | All processed data | Standardized JSON |
| 830 | Return Success | Respond | HTTP 200 response | message_log.json | HTTP 200 JSON |
| 831 | Error Handler | Code | Format error response | Error object | Error JSON |
| 832 | Return Error | Respond | HTTP 500 response | Error JSON | HTTP 500 JSON |

---

## Input Schema

### Unified Schema (Post-Normalization)

After Node 802 normalizes all channel-specific payloads, the workflow uses this unified schema:

```json
{
  "trace_id": "MSG-1737285600000",
  "channel": "sms|whatsapp|telegram|email|webchat",
  "direction": "inbound",
  "from": "+15551234567",
  "to": "+15557654321",
  "message": "Can I reschedule my appointment for next week?",
  "timestamp": "2025-01-30T13:22:00Z",
  "attachments": [],
  "metadata": {
    "message_sid": "SMabc123xyz",
    "num_media": 0,
    "patient_id": "ext_12345",
    "thread_id": "t_001"
  }
}
```

### Channel-Specific Input Formats

#### 1. Twilio SMS

**Webhook payload from Twilio:**
```json
{
  "MessageSid": "SMabc123xyz456",
  "AccountSid": "ACxxxxxxxxxxxxxxxx",
  "MessagingServiceSid": "MGxxxxxxxxxxxxxxxx",
  "From": "+15551234567",
  "To": "+15557654321",
  "Body": "Can I reschedule my appointment?",
  "NumMedia": "0",
  "NumSegments": "1",
  "FromCity": "SAN FRANCISCO",
  "FromState": "CA",
  "FromZip": "94105",
  "FromCountry": "US",
  "ToCity": "SAN FRANCISCO",
  "ToState": "CA",
  "ToZip": "94105",
  "ToCountry": "US"
}
```

**After normalization:**
```json
{
  "trace_id": "MSG-1737285600000",
  "channel": "sms",
  "from": "+15551234567",
  "to": "+15557654321",
  "message": "Can I reschedule my appointment?",
  "metadata": {
    "message_sid": "SMabc123xyz456",
    "num_media": 0
  }
}
```

#### 2. Twilio WhatsApp

**Webhook payload:**
```json
{
  "MessageSid": "SMabc123xyz456",
  "From": "whatsapp:+15551234567",
  "To": "whatsapp:+14155238886",
  "Body": "Hello, I need to reschedule",
  "NumMedia": "0",
  "ProfileName": "Jane Doe"
}
```

**After normalization:**
```json
{
  "trace_id": "MSG-1737285600000",
  "channel": "whatsapp",
  "from": "+15551234567",
  "to": "+14155238886",
  "message": "Hello, I need to reschedule",
  "metadata": {
    "message_sid": "SMabc123xyz456",
    "profile_name": "Jane Doe",
    "num_media": 0
  }
}
```

#### 3. SendGrid Inbound Parse (Email)

**Webhook payload:**
```json
{
  "headers": "Received: from mail-sor-f65.google.com...",
  "dkim": "{@gmail.com : pass}",
  "to": "clinic@yourclinic.com",
  "from": "patient@example.com",
  "sender_ip": "209.85.220.65",
  "spam_report": "{...}",
  "envelope": "{\"to\":[\"clinic@yourclinic.com\"],\"from\":\"patient@example.com\"}",
  "subject": "Question about my appointment",
  "spam_score": "0.1",
  "charsets": "{\"to\":\"UTF-8\",\"from\":\"UTF-8\",\"subject\":\"UTF-8\",\"text\":\"UTF-8\"}",
  "SPF": "pass",
  "text": "Hi,\\n\\nCan I reschedule my appointment to next Thursday?\\n\\nThanks,\\nJane",
  "html": "<p>Hi,</p><p>Can I reschedule my appointment to next Thursday?</p><p>Thanks,<br>Jane</p>",
  "attachments": "0"
}
```

**After normalization:**
```json
{
  "trace_id": "MSG-1737285600000",
  "channel": "email",
  "from": "patient@example.com",
  "to": "clinic@yourclinic.com",
  "message": "Hi,\\n\\nCan I reschedule my appointment to next Thursday?\\n\\nThanks,\\nJane",
  "metadata": {
    "subject": "Question about my appointment",
    "attachments_count": 0,
    "spam_score": "0.1"
  }
}
```

#### 4. Telegram Bot

**Webhook payload:**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 456,
    "from": {
      "id": 987654321,
      "is_bot": false,
      "first_name": "Jane",
      "last_name": "Doe",
      "username": "janedoe",
      "language_code": "en"
    },
    "chat": {
      "id": 987654321,
      "first_name": "Jane",
      "last_name": "Doe",
      "username": "janedoe",
      "type": "private"
    },
    "date": 1704067200,
    "text": "I need to reschedule my appointment"
  }
}
```

**After normalization:**
```json
{
  "trace_id": "MSG-1737285600000",
  "channel": "telegram",
  "from": "987654321",
  "message": "I need to reschedule my appointment",
  "timestamp": "2025-01-01T12:00:00Z",
  "metadata": {
    "chat_id": 987654321,
    "username": "janedoe",
    "first_name": "Jane",
    "last_name": "Doe"
  }
}
```

#### 5. Webchat (Custom)

**Webhook payload:**
```json
{
  "channel": "webchat",
  "from": "visitor_abc123",
  "message": "Can I get information about pricing?",
  "metadata": {
    "visitor_id": "visitor_abc123",
    "session_id": "session_xyz789",
    "page_url": "https://yourclinic.com/services",
    "referrer": "https://google.com"
  }
}
```

**After normalization:**
```json
{
  "trace_id": "MSG-1737285600000",
  "channel": "webchat",
  "from": "visitor_abc123",
  "message": "Can I get information about pricing?",
  "timestamp": "2025-01-30T13:22:00Z",
  "metadata": {
    "visitor_id": "visitor_abc123",
    "session_id": "session_xyz789",
    "page_url": "https://yourclinic.com/services"
  }
}
```

---

## Output Schema

### message_log.json (Success)

```json
{
  "success": true,
  "trace_id": "MSG-1737285600000",
  "message_log": {
    "direction": "inbound",
    "channel": "sms",
    "from": "+15551234567",
    "to": "+15557654321",
    "timestamp": "2025-01-30T13:22:00Z",
    "message": "Can I reschedule my appointment for next week?",
    "response": "I can help you reschedule. What date and time work best for you?",
    "response_type": "aigent_bot",
    "auto_response": true
  },
  "contact": {
    "id": "crm_123456",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+15551234567",
    "lifecycle_stage": "customer"
  },
  "classification": {
    "intent": "booking",
    "priority": "normal",
    "after_hours": false,
    "keywords_matched": ["reschedule", "appointment"]
  },
  "metadata": {
    "logged_to_crm": true,
    "logged_to_datastore": true,
    "staff_notified": false,
    "bot_confidence": 0.95,
    "processing_time_ms": 1250,
    "processed_at": "2025-01-30T13:22:05Z"
  }
}
```

### message_log.json (Error)

```json
{
  "success": false,
  "error": "Bot API timeout after 30 seconds",
  "stage": "bot_api",
  "trace_id": "MSG-1737285600000",
  "timestamp": "2025-01-30T13:22:35Z",
  "fallback": "Staff notification sent for manual response"
}
```

---

## Installation

### Prerequisites

- n8n instance (version 1.0.0+)
- Twilio account (for SMS/WhatsApp)
- SendGrid account (for email, optional)
- HubSpot account (or Salesforce/Zoho)
- Google Sheets (or Airtable/PostgreSQL for logging)
- Slack workspace (for staff notifications, optional)

### 1. Import Workflow

```bash
# Via n8n UI
1. Open n8n web interface
2. Navigate to Workflows
3. Click "Import from File"
4. Select Aigent_Module_08_Messaging_Omnichannel.json
5. Click "Import"
6. Workflow will appear in your workflows list

# Via n8n CLI
n8n import:workflow --input=Aigent_Module_08_Messaging_Omnichannel.json

# Verify import
n8n workflow:list | grep "Module 08"
```

### 2. Configure Environment Variables

```bash
# Copy example file
cp .env.aigent_module_08_example .env

# Edit with your configuration
nano .env

# Or use your preferred editor
code .env
vi .env
```

**Minimum required variables:**
```bash
# Webhook
WEBHOOK_ID_MODULE_08=aigent_msg_hub_001

# Business Hours
BUSINESS_HOURS_START=8
BUSINESS_HOURS_END=18
BUSINESS_DAYS=1,2,3,4,5

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+15551234567
TWILIO_CREDENTIAL_ID=your_twilio_credential_id

# CRM (HubSpot)
HUBSPOT_API_KEY=pat-na1-xxxxxxxxxxxxxxxxx
HUBSPOT_CREDENTIAL_ID=your_hubspot_credential_id

# Logging (Google Sheets)
GOOGLE_SHEETS_CREDENTIAL_ID=your_gsheet_credential_id
GOOGLE_SHEET_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
SHEET_MESSAGES_TAB=Messages

# Staff Notifications (Slack)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
SLACK_MESSAGES_CHANNEL=#messages
SLACK_URGENT_CHANNEL=#urgent

# Clinic Branding
BRAND_NAME=Your Clinic Name
```

### 3. Set Up Credentials in n8n

#### Twilio Basic Auth
```bash
# Via n8n UI:
1. Settings → Credentials → New Credential
2. Select "HTTP Header Auth"
3. Name: "Twilio Basic Auth"
4. Add header:
   - Name: Authorization
   - Value: Basic [Base64 of AccountSID:AuthToken]

# Generate Base64 value:
echo -n "ACxxxxxxxxxxxxx:your_auth_token" | base64
# Result: QUNxxxxxxxxxxxxx...

# Via n8n CLI:
n8n credentials:create \
  --type=httpBasicAuth \
  --name="Twilio Basic Auth" \
  --data='{"user":"ACxxxxxxxxxxxxx","password":"your_auth_token"}'
```

#### HubSpot OAuth2
```bash
# Via n8n UI:
1. Settings → Credentials → New Credential
2. Select "HubSpot OAuth2 API"
3. Click "Connect my account"
4. Follow OAuth flow in browser
5. Grant permissions: crm.objects.contacts.read, crm.objects.contacts.write
6. Save credential

# Note credential ID for use in .env
```

#### Google Sheets Service Account
```bash
# Via n8n UI:
1. Settings → Credentials → New Credential
2. Select "Google Sheets Service Account"
3. Upload JSON key file from Google Cloud Console
4. Save credential

# Generate service account key:
1. Go to Google Cloud Console
2. IAM & Admin → Service Accounts
3. Create service account: "n8n-messaging-hub"
4. Grant role: "Editor"
5. Create key → JSON → Download
6. Upload to n8n credentials

# Share Google Sheet with service account email:
# service-account-name@project-id.iam.gserviceaccount.com
```

#### SMTP Email
```bash
# Via n8n UI:
1. Settings → Credentials → New Credential
2. Select "SMTP"
3. Configure:
   - Host: smtp.gmail.com
   - Port: 587
   - Security: STARTTLS
   - User: your_email@gmail.com
   - Password: your_app_password
4. Test connection
5. Save credential

# Gmail App Password:
1. Google Account → Security
2. 2-Step Verification → Enable
3. App Passwords → Generate
4. Use generated password in SMTP config
```

### 4. Configure External Webhooks

Each messaging platform needs to POST incoming messages to your n8n webhook.

**n8n Webhook URL Format:**
```
https://your-n8n-instance.com/webhook/aigent-message-hub
```

or

```
https://your-n8n-instance.com/webhook-test/aigent-message-hub
```

(Use `/webhook-test/` during development for easier testing)

### 5. Activate Workflow

```bash
# Via n8n UI:
1. Open Module 08 workflow
2. Click "Active" toggle in top-right
3. Verify status: "Active" (green)

# Via n8n CLI:
n8n workflow:activate --id=YOUR_WORKFLOW_ID

# Verify activation:
n8n workflow:list | grep "Module 08"
# Should show: [ACTIVE] Aigent Module 08...
```

---

## Configuration

### Business Hours Setup

```bash
# Standard hours (8 AM - 6 PM, Monday-Friday)
BUSINESS_HOURS_START=8
BUSINESS_HOURS_END=18
BUSINESS_DAYS=1,2,3,4,5
TIMEZONE=America/New_York

# Extended hours (7 AM - 8 PM, Monday-Saturday)
BUSINESS_HOURS_START=7
BUSINESS_HOURS_END=20
BUSINESS_DAYS=1,2,3,4,5,6

# 24/7 operation (disable after-hours mode)
BUSINESS_HOURS_START=0
BUSINESS_HOURS_END=24
BUSINESS_DAYS=0,1,2,3,4,5,6
```

**How it works:**
- Node 805 checks current time against configured hours
- If outside hours OR on non-business day → `after_hours = true`
- Node 813 routes to after-hours auto-response (Node 814)
- Messages queued for staff review during next business hours

### Intent Keywords Configuration

Customize keywords for intent classification:

```bash
# Booking intent
BOOKING_KEYWORDS=appointment,schedule,reschedule,book,cancel,change time,move appointment,availability,available times

# Billing intent
BILLING_KEYWORDS=payment,bill,invoice,charge,cost,price,pay,receipt,insurance,claim

# Urgent intent
URGENT_KEYWORDS=emergency,urgent,asap,pain,severe,help,911,bleeding,chest pain,difficulty breathing

# Support intent
SUPPORT_KEYWORDS=question,help,how,what,why,information,explain,clarify
```

**Classification Logic (Node 805):**
```javascript
const message = ($json.message || '').toLowerCase();

for (const [category, keywordList] of Object.entries(keywords)) {
  if (keywordList.some(kw => message.includes(kw))) {
    intent = category;
    break;
  }
}

// Default to 'general' if no keywords matched
```

### Auto-Response Templates

Customize automated response messages:

```bash
# After-hours message
AFTER_HOURS_MESSAGE=Thank you for contacting ${BRAND_NAME}. Our office hours are ${BUSINESS_HOURS_START} AM - ${BUSINESS_HOURS_END} PM, Monday-Friday. We'll respond to your message during business hours. For medical emergencies, please call 911.

# Default response (bot disabled)
DEFAULT_AUTO_RESPONSE=Thank you for contacting ${BRAND_NAME}. A team member will respond to your message shortly.

# Urgent acknowledgment
URGENT_AUTO_RESPONSE=We've received your urgent message and are notifying our team immediately. For life-threatening emergencies, please call 911 or go to the nearest emergency room.

# New contact welcome
NEW_CONTACT_WELCOME=Thank you for contacting ${BRAND_NAME}! We're glad to hear from you. A team member will be with you shortly.
```

**Template Variables:**
- `${BRAND_NAME}` → Your clinic name
- `${BUSINESS_HOURS_START}` → Opening time
- `${BUSINESS_HOURS_END}` → Closing time

---

## Channel Setup Guides

### Twilio SMS Setup

#### 1. Create Twilio Account

1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for free trial (includes $15 credit)
3. Verify your email and phone number
4. Complete onboarding questionnaire

#### 2. Get Phone Number

```
Console → Phone Numbers → Buy a Number
1. Select country: United States
2. Filter: SMS capabilities
3. Choose number (e.g., +1 555 123 4567)
4. Click "Buy"
5. Cost: ~$1/month
```

#### 3. Configure SMS Webhook

```
Console → Phone Numbers → Manage → Active Numbers
1. Click on your phone number
2. Scroll to "Messaging"
3. Configure with:
   - A MESSAGE COMES IN:
     • Webhook: https://your-n8n.com/webhook/aigent-message-hub
     • HTTP POST
   - PRIMARY HANDLER FAILS:
     • Leave as default or set fallback URL
4. Click "Save"
```

#### 4. Get API Credentials

```
Console → Account → API keys & tokens
1. Copy Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
2. Copy Auth Token: (click "View" to reveal)
3. Store in .env:
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_FROM_NUMBER=+15551234567
```

#### 5. Test SMS Reception

```bash
# Send test SMS to your Twilio number
# From your personal phone, text: "Test message"

# Check n8n execution log
# Should see execution of Module 08 workflow

# Verify in Google Sheets
# Check Messages tab for new row
```

#### 6. Webhook Signature Verification (Optional but Recommended)

For production, verify Twilio webhook signatures to prevent spoofing:

```javascript
// Add to Node 802 (Normalize Message Format)
const crypto = require('crypto');

if (body.MessageSid) {  // Twilio SMS/WhatsApp
  const signature = input.headers['x-twilio-signature'];
  const url = 'https://your-n8n.com/webhook/aigent-message-hub';

  // Build string to sign
  let dataString = url;
  const keys = Object.keys(body).sort();
  keys.forEach(key => {
    dataString += key + body[key];
  });

  // Generate HMAC
  const hmac = crypto.createHmac('sha1', $env.TWILIO_AUTH_TOKEN);
  hmac.update(Buffer.from(dataString, 'utf-8'));
  const expectedSignature = hmac.digest('base64');

  if (signature !== expectedSignature) {
    throw new Error('Invalid Twilio signature');
  }
}
```

### Twilio WhatsApp Setup

#### 1. Enable WhatsApp Sandbox (Development)

```
Console → Messaging → Try it out → Try WhatsApp
1. Scan QR code or click "Join Sandbox"
2. From WhatsApp, send message: "join [your-sandbox-code]"
3. Example: "join happy-elephant-42"
4. Receive confirmation message
```

#### 2. Configure WhatsApp Webhook

```
Console → Messaging → Try WhatsApp → Sandbox Settings
1. WHEN A MESSAGE COMES IN:
   • Webhook: https://your-n8n.com/webhook/aigent-message-hub
   • HTTP POST
2. STATUS CALLBACK URL:
   • Leave empty or set monitoring URL
3. Click "Save"
```

#### 3. Test WhatsApp Messages

```bash
# From WhatsApp, send test message to sandbox number
# Message: "Can I book an appointment?"

# Check n8n execution log
# Should see workflow execution

# Verify normalization
# Channel should be detected as "whatsapp"
```

#### 4. Production WhatsApp Setup

For production use, apply for WhatsApp Business API:

```
Console → Messaging → WhatsApp → Get started
1. Request access (requires business verification)
2. Approval time: 1-2 weeks
3. Requirements:
   - Business website
   - Facebook Business Manager account
   - Business verification documents
4. Costs:
   - Setup fee: Free
   - Per-message: ~$0.005 (varies by country)
```

**Production webhook configuration:**
```
Console → Messaging → WhatsApp → Senders → Configure
1. Select your WhatsApp sender
2. Inbound Settings:
   • Webhook: https://your-n8n.com/webhook/aigent-message-hub
   • HTTP POST
3. Save configuration
```

**.env configuration:**
```bash
TWILIO_WHATSAPP_NUMBER=+14155238886  # Sandbox
# OR
TWILIO_WHATSAPP_NUMBER=+15551234567  # Production approved number

TWILIO_WHATSAPP_ENABLED=true
```

### SendGrid Email Setup

#### 1. Create SendGrid Account

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for free tier (100 emails/day)
3. Verify email address
4. Complete sender identity verification

#### 2. Configure Inbound Parse

```
Settings → Inbound Parse → Add Host & URL
1. Subdomain: inbound
2. Domain: yourclinic.com
   • Result: inbound.yourclinic.com
3. Destination URL: https://your-n8n.com/webhook/aigent-message-hub
4. Check spam: Yes (optional)
5. POST raw body: No
6. Click "Add"
```

#### 3. DNS Configuration

Add MX record to your domain DNS:

```
Type: MX
Host: inbound.yourclinic.com
Value: mx.sendgrid.net
Priority: 10
TTL: 3600
```

**Verification:**
```bash
# Check DNS propagation (may take 24-48 hours)
nslookup -type=MX inbound.yourclinic.com

# Expected output:
# inbound.yourclinic.com  mail exchanger = 10 mx.sendgrid.net
```

#### 4. Test Email Reception

```bash
# Send test email to: anything@inbound.yourclinic.com
# From: your-personal-email@gmail.com
# Subject: Test inbound email
# Body: This is a test message

# Check n8n execution log
# Verify email payload received and normalized

# Check Google Sheets Messages tab
# Should see new row with channel="email"
```

#### 5. SMTP Outbound (for replies)

Configure SMTP for sending email replies:

```bash
# Get API Key
Settings → API Keys → Create API Key
1. Name: "n8n Messaging Hub"
2. Permissions: Full Access (or Mail Send only)
3. Copy key: SG.xxxxxxxxxxxxxxxxxxxxxxxxxx

# Configure in .env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_SECURE=true

EMAIL_FROM=noreply@yourclinic.com
EMAIL_FROM_NAME=Your Clinic Name
```

**Test SMTP:**
```bash
# Send test via n8n Email Send node
curl -X POST https://your-n8n.com/webhook/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "body": "Test message"
  }'
```

### Telegram Bot Setup

#### 1. Create Bot via BotFather

```
1. Open Telegram app
2. Search for @BotFather
3. Start conversation
4. Send command: /newbot
5. Follow prompts:
   • Bot name: "Your Clinic Bot"
   • Username: "yourclinicbot" (must end with 'bot')
6. Receive token: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
7. Save token to .env:
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
```

#### 2. Configure Bot Settings

```
Send to @BotFather:
• /setdescription → "Get help from Your Clinic"
• /setabouttext → "Official bot for Your Clinic. Get appointment info, ask questions, and connect with our team."
• /setuserpic → Upload clinic logo
• /setcommands → Set available commands:
  start - Start conversation
  help - Get help
  appointment - Book or reschedule appointment
  billing - Billing questions
  contact - Contact clinic staff
```

#### 3. Set Webhook

```bash
# Set webhook URL via Telegram Bot API
curl -X POST https://api.telegram.org/bot123456:ABC-DEF.../setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-n8n.com/webhook/aigent-message-hub",
    "allowed_updates": ["message", "callback_query"]
  }'

# Verify webhook
curl https://api.telegram.org/bot123456:ABC-DEF.../getWebhookInfo

# Expected response:
{
  "ok": true,
  "result": {
    "url": "https://your-n8n.com/webhook/aigent-message-hub",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": 0
  }
}
```

#### 4. Configure in .env

```bash
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=yourclinicbot
TELEGRAM_WEBHOOK=https://your-n8n.com/webhook/aigent-message-hub
```

#### 5. Test Bot

```
1. Search for your bot: @yourclinicbot
2. Click "Start" button
3. Send test message: "Hello"
4. Check n8n execution log
5. Verify bot response received
```

#### 6. Bot Commands Implementation

Add command handling to Node 802:

```javascript
// Handle Telegram commands
if (body.message && body.message.text && body.message.text.startsWith('/')) {
  const command = body.message.text.split(' ')[0].substring(1);

  switch (command) {
    case 'start':
      // Send welcome message
      break;
    case 'help':
      // Send help information
      break;
    case 'appointment':
      // Route to booking intent
      normalized.metadata.forced_intent = 'booking';
      break;
    case 'billing':
      // Route to billing intent
      normalized.metadata.forced_intent = 'billing';
      break;
  }
}
```

### Webchat Widget Integration

#### Option 1: Custom Webchat

**HTML Widget:**
```html
<!-- Add to your website -->
<div id="clinic-chat-widget"></div>

<script>
(function() {
  const widget = {
    init: function() {
      this.createWidget();
      this.setupEventListeners();
    },

    createWidget: function() {
      const container = document.getElementById('clinic-chat-widget');
      container.innerHTML = `
        <div class="chat-button" onclick="widget.toggleChat()">
          💬 Chat with us
        </div>
        <div class="chat-window" id="chat-window" style="display: none;">
          <div class="chat-header">
            <span>Your Clinic</span>
            <button onclick="widget.toggleChat()">✕</button>
          </div>
          <div class="chat-messages" id="chat-messages"></div>
          <div class="chat-input">
            <input type="text" id="chat-input" placeholder="Type your message..." />
            <button onclick="widget.sendMessage()">Send</button>
          </div>
        </div>
      `;
    },

    toggleChat: function() {
      const window = document.getElementById('chat-window');
      window.style.display = window.style.display === 'none' ? 'block' : 'none';
    },

    sendMessage: function() {
      const input = document.getElementById('chat-input');
      const message = input.value.trim();
      if (!message) return;

      // Display user message
      this.addMessage(message, 'user');

      // Send to n8n
      fetch('https://your-n8n.com/webhook/aigent-message-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'webchat',
          from: this.getVisitorId(),
          message: message,
          metadata: {
            visitor_id: this.getVisitorId(),
            session_id: this.getSessionId(),
            page_url: window.location.href,
            referrer: document.referrer
          }
        })
      })
      .then(response => response.json())
      .then(data => {
        // Display bot response
        if (data.message_log && data.message_log.response) {
          this.addMessage(data.message_log.response, 'bot');
        }
      })
      .catch(error => {
        console.error('Chat error:', error);
        this.addMessage('Sorry, there was an error. Please try again.', 'bot');
      });

      input.value = '';
    },

    addMessage: function(text, type) {
      const messages = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = `chat-message chat-message-${type}`;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    },

    getVisitorId: function() {
      let visitorId = localStorage.getItem('clinic_visitor_id');
      if (!visitorId) {
        visitorId = 'visitor_' + Math.random().toString(36).substring(7);
        localStorage.setItem('clinic_visitor_id', visitorId);
      }
      return visitorId;
    },

    getSessionId: function() {
      let sessionId = sessionStorage.getItem('clinic_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substring(7);
        sessionStorage.setItem('clinic_session_id', sessionId);
      }
      return sessionId;
    }
  };

  widget.init();
  window.widget = widget;
})();
</script>

<style>
.chat-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #667eea;
  color: white;
  padding: 15px 25px;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
}

.chat-window {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: #667eea;
  color: white;
  padding: 15px;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.chat-message {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  max-width: 80%;
}

.chat-message-user {
  background: #e5e7eb;
  margin-left: auto;
  text-align: right;
}

.chat-message-bot {
  background: #667eea;
  color: white;
}

.chat-input {
  display: flex;
  padding: 15px;
  border-top: 1px solid #e5e7eb;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  margin-right: 10px;
}

.chat-input button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
```

**Configuration:**
```bash
WEBCHAT_ENABLED=true
WEBCHAT_PROVIDER=custom
WEBCHAT_WIDGET_ID=custom_v1
```

#### Option 2: Intercom Integration

```bash
# Install Intercom on your website
# Add Intercom script with your app ID

# Configure webhook in Intercom:
# Settings → Webhooks → Add webhook
# URL: https://your-n8n.com/webhook/aigent-message-hub
# Topics: conversation.user.created, conversation.user.replied

# .env configuration
WEBCHAT_ENABLED=true
WEBCHAT_PROVIDER=intercom
WEBCHAT_WIDGET_ID=your_intercom_app_id
INTERCOM_ACCESS_TOKEN=your_access_token
```

#### Option 3: Drift Integration

```bash
# Install Drift widget on website
# Configure webhook in Drift:
# Settings → App Settings → Webhooks
# URL: https://your-n8n.com/webhook/aigent-message-hub
# Events: new_message

# .env configuration
WEBCHAT_ENABLED=true
WEBCHAT_PROVIDER=drift
WEBCHAT_WIDGET_ID=your_drift_embed_id
DRIFT_ACCESS_TOKEN=your_access_token
```

---

## Message Routing Logic

### Routing Decision Tree

```
┌──────────────────────────────────────────────────────────┐
│ Message Received                                          │
└───────────────────────┬──────────────────────────────────┘
                        ↓
               [Classify Intent & Priority]
                        ↓
            ┌───────────┴───────────┐
            │                       │
      [URGENT?]              [NOT URGENT]
            │                       │
            ↓                       ↓
   Send Slack Alert        [AFTER HOURS?]
            │                       │
            ↓                  ┌────┴────┐
    [Continue to Bot]          │         │
            │                YES        NO
            │                  │         │
            │                  ↓         ↓
            │         Auto-Response  [Bot Enabled?]
            │                  │         │
            │                  │    ┌────┴────┐
            │                  │   YES       NO
            │                  │    │         │
            │                  │    ↓         ↓
            │                  │  Bot API  Default
            │                  │    │      Response
            │                  │    ↓         │
            │                  │ [Confidence?]│
            │                  │    │         │
            │                  │ ┌──┴──┐      │
            │                  │ │     │      │
            │                  │HIGH  LOW     │
            │                  │ │     │      │
            └──────────────────┴─┴─────┴──────┘
                        ↓
              [Send Response via Channel]
                        ↓
              [Update CRM & Log]
                        ↓
            [Notify Staff if Needed]
```

### Priority Matrix

| Scenario | Intent | After Hours | Action | Staff Notified | Auto-Response |
|----------|--------|-------------|--------|----------------|---------------|
| 1 | urgent | Yes | Immediate Slack alert + After-hours message | Yes (urgent channel) | Yes |
| 2 | urgent | No | Immediate Slack alert + Bot/Human response | Yes (urgent channel) | Conditional |
| 3 | booking | Yes | After-hours message only | No | Yes |
| 4 | booking | No | Bot response (if enabled) | Conditional | Yes |
| 5 | billing | Yes | After-hours message only | No | Yes |
| 6 | billing | No | Bot response (if enabled) | Conditional | Yes |
| 7 | support | Yes | After-hours message only | No | Yes |
| 8 | support | No | Bot response (if enabled) | Conditional | Yes |
| 9 | general | Yes | After-hours message only | No | Yes |
| 10 | general | No | Bot response or default | Conditional | Yes/No |

### Routing Rules Configuration

```bash
# Priority routing
ROUTE_URGENT_TO_STAFF=true
ROUTE_AFTER_HOURS_AUTO=true
ROUTE_KNOWN_TO_BOT=true
ROUTE_NEW_TO_STAFF=false

# Intent-based forwarding
FORWARD_BOOKING_TO_MODULE_02=true
FORWARD_BILLING_TO_MODULE_04=true

# Module webhooks
MODULE_02_WEBHOOK=https://n8n.instance.com/webhook/aigent-booking
MODULE_04_WEBHOOK=https://n8n.instance.com/webhook/aigent-billing
```

**Implementation in workflow:**

Add to Node 829 (Build message_log.json):

```javascript
// Forward to other modules based on intent
if ($env.FORWARD_BOOKING_TO_MODULE_02 === 'true' && $json.classification.intent === 'booking') {
  // Call Module 02 webhook
  const bookingPayload = {
    patient_email: $json.contact.email,
    patient_name: $json.contact.name,
    request: $json.message,
    source: 'messaging_hub',
    trace_id: $json.trace_id
  };

  await fetch($env.MODULE_02_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingPayload)
  });
}

if ($env.FORWARD_BILLING_TO_MODULE_04 === 'true' && $json.classification.intent === 'billing') {
  // Call Module 04 webhook
  const billingPayload = {
    patient_email: $json.contact.email,
    inquiry: $json.message,
    source: 'messaging_hub',
    trace_id: $json.trace_id
  };

  await fetch($env.MODULE_04_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(billingPayload)
  });
}
```

---

## Intent Classification

### Classification Algorithm (Node 805)

```javascript
// Extract keywords and classify message intent
const message = ($json.message || '').toLowerCase();

const keywords = {
  booking: ($ env.BOOKING_KEYWORDS || 'appointment,schedule,reschedule,book,cancel,change time').split(','),
  billing: ($env.BILLING_KEYWORDS || 'payment,bill,invoice,charge,cost,price').split(','),
  urgent: ($env.URGENT_KEYWORDS || 'emergency,urgent,asap,pain,severe,help').split(','),
  support: ($env.SUPPORT_KEYWORDS || 'question,help,how,what,why').split(','),
  general: []
};

let intent = 'general';
let priority = 'normal';
let keywordsMatched = [];

// Check each category
for (const [category, keywordList] of Object.entries(keywords)) {
  const matched = keywordList.filter(kw => message.includes(kw.toLowerCase()));
  if (matched.length > 0) {
    intent = category;
    keywordsMatched = matched;
    break;
  }
}

// Set priority based on intent
if (intent === 'urgent' || message.includes('emergency')) {
  priority = 'urgent';
}

// Check if after hours
const now = new Date();
const hour = now.getHours();
const dayOfWeek = now.getDay();
const businessHoursStart = parseInt($env.BUSINESS_HOURS_START || 8);
const businessHoursEnd = parseInt($env.BUSINESS_HOURS_END || 18);
const businessDays = ($env.BUSINESS_DAYS || '1,2,3,4,5').split(',').map(d => parseInt(d));

const isBusinessDay = businessDays.includes(dayOfWeek);
const isBusinessHours = hour >= businessHoursStart && hour < businessHoursEnd;
const isAfterHours = !isBusinessDay || !isBusinessHours;

return {
  json: {
    ...$json,
    classification: {
      intent: intent,
      priority: priority,
      keywords_matched: keywordsMatched,
      after_hours: isAfterHours,
      confidence: keywordsMatched.length > 0 ? 0.9 : 0.5
    }
  }
};
```

### Intent Examples

#### 1. Booking Intent

**Messages:**
- "Can I reschedule my appointment?"
- "I need to book a consultation"
- "What times are available tomorrow?"
- "I want to cancel my appointment"
- "Do you have any openings next week?"

**Classification:**
```json
{
  "intent": "booking",
  "priority": "normal",
  "keywords_matched": ["reschedule", "appointment"],
  "confidence": 0.9
}
```

**Routing:**
- Bot responds with available times
- OR forwards to Module 02 for booking workflow
- OR notifies staff if bot disabled

#### 2. Billing Intent

**Messages:**
- "I have a question about my bill"
- "How much does a consultation cost?"
- "I need a receipt for my payment"
- "My insurance didn't cover the charge"
- "Can I set up a payment plan?"

**Classification:**
```json
{
  "intent": "billing",
  "priority": "normal",
  "keywords_matched": ["bill"],
  "confidence": 0.9
}
```

**Routing:**
- Bot provides pricing information
- OR forwards to Module 04 for billing inquiry
- OR notifies billing staff

#### 3. Urgent Intent

**Messages:**
- "Emergency! Severe chest pain"
- "Urgent: Patient having difficulty breathing"
- "Help! My child is bleeding heavily"
- "ASAP - severe allergic reaction"
- "I think I need to go to the ER"

**Classification:**
```json
{
  "intent": "urgent",
  "priority": "urgent",
  "keywords_matched": ["emergency", "severe", "pain"],
  "confidence": 1.0
}
```

**Routing:**
- **IMMEDIATE** Slack alert to #urgent channel
- Auto-response: "We've notified our team. For life-threatening emergencies, call 911."
- Staff receives push notification
- Escalates to on-call provider if configured

#### 4. Support Intent

**Messages:**
- "What are your office hours?"
- "How do I prepare for my procedure?"
- "Can you explain my lab results?"
- "What insurance do you accept?"
- "Why was I charged twice?"

**Classification:**
```json
{
  "intent": "support",
  "priority": "normal",
  "keywords_matched": ["what", "how"],
  "confidence": 0.7
}
```

**Routing:**
- Bot answers FAQ if configured
- OR notifies support staff
- If after-hours: "We'll respond during business hours"

#### 5. General Intent

**Messages:**
- "Hello"
- "Hi there"
- "Just checking in"
- "Thank you"
- "Goodbye"

**Classification:**
```json
{
  "intent": "general",
  "priority": "normal",
  "keywords_matched": [],
  "confidence": 0.5
}
```

**Routing:**
- Bot provides conversational response
- "Hello! How can I help you today?"
- OR default response: "A team member will respond shortly"

### Custom Intent Addition

To add a new intent category:

**1. Define keywords in .env:**
```bash
INSURANCE_KEYWORDS=insurance,coverage,policy,claims,authorization,pre-auth
```

**2. Update Node 805 classification:**
```javascript
const keywords = {
  booking: ...,
  billing: ...,
  insurance: ($env.INSURANCE_KEYWORDS || '').split(','),  // Add new category
  urgent: ...,
  support: ...,
  general: []
};
```

**3. Add routing logic in Node 815:**
```javascript
if (intent === 'insurance') {
  // Forward to insurance specialist
  // OR trigger specific bot flow
}
```

**4. Update CRM field mapping:**
```bash
# Track insurance inquiries separately
CRM_FIELD_INSURANCE_INQUIRIES=insurance_inquiry_count
```

---

## AIgent Bot Integration

### Bot Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    AIgent Bot System                      │
└──────────────────────────────────────────────────────────┘

Module 08 (Node 816)
        ↓ HTTP POST
AIgent Bot API Endpoint
        ↓
┌─────────────────────────────┐
│ Natural Language Processing  │
│ - Intent Recognition        │
│ - Entity Extraction         │
│ - Context Understanding     │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Knowledge Base              │
│ - FAQ Database              │
│ - Clinic Information        │
│ - Appointment Slots         │
│ - Pricing Information       │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Response Generation         │
│ - Template-based            │
│ - Dynamic (GPT-powered)     │
│ - Context-aware             │
└─────────────┬───────────────┘
              ↓
        Confidence Score
              ↓
   ┌──────────┴──────────┐
   │                     │
 HIGH                  LOW
   │                     │
   ↓                     ↓
Automated            Human
Response            Escalation
```

### Bot Request Format (Node 816)

```json
{
  "message": "Can I reschedule my appointment for next week?",
  "channel": "sms",
  "from": "+15551234567",
  "contact": {
    "id": "crm_123456",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+15551234567",
    "lifecycle_stage": "customer"
  },
  "intent": "booking",
  "context": {
    "patient_id": "ext_12345",
    "thread_id": "t_001",
    "previous_messages": [
      {
        "role": "user",
        "content": "Hello",
        "timestamp": "2025-01-30T13:20:00Z"
      },
      {
        "role": "assistant",
        "content": "Hi Jane! How can I help you today?",
        "timestamp": "2025-01-30T13:20:05Z"
      }
    ],
    "conversation_history_enabled": true,
    "max_context_messages": 10
  },
  "capabilities": {
    "can_book": true,
    "can_reschedule": true,
    "can_answer_faq": true,
    "can_access_records": false
  },
  "clinic_info": {
    "name": "Your Clinic",
    "hours": "8 AM - 6 PM, Monday-Friday",
    "phone": "+15557654321",
    "website": "https://yourclinic.com"
  }
}
```

### Bot Response Format

**Successful Response:**
```json
{
  "response": {
    "text": "I can help you reschedule. I see you have an appointment scheduled for February 2nd at 2 PM. What date and time would you prefer?",
    "confidence": 0.95,
    "requires_human": false,
    "suggested_actions": [
      {
        "label": "View Available Times",
        "action": "show_availability",
        "data": {
          "start_date": "2025-02-05",
          "end_date": "2025-02-12"
        }
      }
    ]
  },
  "metadata": {
    "intent_detected": "booking_reschedule",
    "entities": [
      {
        "type": "date",
        "value": "next week",
        "normalized": "2025-02-05 to 2025-02-12"
      }
    ],
    "processing_time_ms": 450,
    "model": "gpt-4-turbo",
    "context_used": true
  }
}
```

**Low Confidence Response:**
```json
{
  "response": {
    "text": "I want to make sure I understand correctly. Could you clarify what you need help with?",
    "confidence": 0.65,
    "requires_human": true,
    "escalation_reason": "Ambiguous intent, requires clarification"
  },
  "metadata": {
    "intent_detected": "unclear",
    "suggested_intents": ["booking", "billing"],
    "processing_time_ms": 380
  }
}
```

**Error Response:**
```json
{
  "error": {
    "code": "BOT_UNAVAILABLE",
    "message": "Bot service temporarily unavailable",
    "retry_after": 30
  },
  "fallback": {
    "text": "I'm having trouble right now. A team member will respond shortly.",
    "notify_staff": true
  }
}
```

### Bot Configuration

```bash
# Enable bot
AIGENT_BOT_ENABLED=true

# Bot endpoint
AIGENT_BOT_ENDPOINT=https://api.aigent.com/v1/chat
AIGENT_BOT_API_KEY=your_aigent_api_key_here

# Confidence threshold (0.0 - 1.0)
# Responses below threshold escalate to human
AIGENT_BOT_CONFIDENCE_THRESHOLD=0.8

# Bot capabilities
AIGENT_BOT_CAN_BOOK=true
AIGENT_BOT_CAN_RESCHEDULE=true
AIGENT_BOT_CAN_ANSWER_FAQ=true
AIGENT_BOT_CAN_ACCESS_RECORDS=false
AIGENT_BOT_CAN_PROCESS_PAYMENTS=false

# Context management
AIGENT_BOT_CONTEXT_ENABLED=true
AIGENT_BOT_MAX_CONTEXT_MESSAGES=10
AIGENT_BOT_CONTEXT_WINDOW_HOURS=24

# Timeout
AIGENT_BOT_TIMEOUT_MS=30000

# Fallback behavior
AIGENT_BOT_FALLBACK_TO_HUMAN=true
AIGENT_BOT_NOTIFY_ON_ESCALATION=true
```

### Bot Response Processing (Node 817)

```javascript
// Extract bot response from API call
const botResponse = $json;
const originalMessage = $node["Merge Contact Data"].json;

let response = {
  message: 'Thank you for your message. A team member will respond shortly.',
  auto_response: false,
  response_type: 'default',
  bot_confidence: 0
};

try {
  if (botResponse.response && botResponse.response.text) {
    const confidence = botResponse.response.confidence || 0;
    const threshold = parseFloat($env.AIGENT_BOT_CONFIDENCE_THRESHOLD || 0.8);

    if (confidence >= threshold) {
      // High confidence - use bot response
      response = {
        message: botResponse.response.text,
        auto_response: true,
        response_type: 'aigent_bot',
        bot_confidence: confidence,
        requires_human: false
      };
    } else {
      // Low confidence - escalate to human
      response = {
        message: 'Thank you for your message. A team member will review and respond shortly.',
        auto_response: true,
        response_type: 'bot_low_confidence',
        bot_confidence: confidence,
        requires_human: true,
        escalation_reason: botResponse.response.escalation_reason || 'Low confidence score'
      };

      // Trigger staff notification
      if ($env.AIGENT_BOT_NOTIFY_ON_ESCALATION === 'true') {
        // Staff will be notified via Node 828
      }
    }
  }
} catch (error) {
  // Bot API error - use fallback
  response = {
    message: botResponse.fallback?.text || 'Thank you for your message. A team member will respond shortly.',
    auto_response: true,
    response_type: 'bot_error',
    bot_confidence: 0,
    requires_human: true,
    error: error.message
  };
}

return {
  json: {
    ...originalMessage,
    response: response
  }
};
```

### Bot Training & Improvement

**1. Collect training data from conversation logs:**
```sql
-- Query Google Sheets or database
SELECT
  message,
  intent,
  bot_response,
  bot_confidence,
  human_override,
  resolution_time_minutes
FROM messages
WHERE channel IN ('sms', 'whatsapp', 'email')
AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY bot_confidence ASC;
```

**2. Identify low-confidence conversations:**
- Conversations with confidence < 0.8
- Conversations that required human intervention
- Conversations with delayed resolution

**3. Retrain bot with corrected responses:**
```json
// Training data format
{
  "conversations": [
    {
      "input": "Can I get a refund for my visit?",
      "intent": "billing_refund",
      "correct_response": "I can help with refund requests. Could you provide your appointment date and reason for the refund request?",
      "confidence_target": 0.95
    },
    {
      "input": "What insurance do you take?",
      "intent": "insurance_inquiry",
      "correct_response": "We accept most major insurance plans including Blue Cross, Aetna, UnitedHealthcare, and Cigna. Would you like me to verify your specific plan?",
      "confidence_target": 0.95
    }
  ]
}
```

**4. Update bot knowledge base:**
- Add new FAQ entries
- Update clinic information (hours, services, pricing)
- Add seasonal information (holiday hours, flu shot availability)

**5. Monitor bot performance metrics:**
```bash
# Track in Module 07 Analytics
BOT_RESPONSE_RATE=conversations handled by bot / total conversations
BOT_ESCALATION_RATE=bot escalations / bot attempts
BOT_RESOLUTION_RATE=resolved without human / bot conversations
AVG_BOT_CONFIDENCE=average confidence score
```

---

## CRM Integration

### HubSpot Integration

#### Contact Lookup (Node 807)

**API Request:**
```http
GET https://api.hubapi.com/crm/v3/objects/contacts/search
Authorization: Bearer pat-na1-xxxxxxxxx
Content-Type: application/json

{
  "filterGroups": [
    {
      "filters": [
        {
          "propertyName": "phone",
          "operator": "EQ",
          "value": "+15551234567"
        }
      ]
    }
  ],
  "properties": [
    "email",
    "firstname",
    "lastname",
    "phone",
    "lifecyclestage",
    "last_message_date",
    "last_message_channel",
    "total_messages"
  ],
  "limit": 1
}
```

**Response (Contact Found):**
```json
{
  "results": [
    {
      "id": "123456",
      "properties": {
        "email": "jane@example.com",
        "firstname": "Jane",
        "lastname": "Doe",
        "phone": "+15551234567",
        "lifecyclestage": "customer",
        "last_message_date": "2025-01-25T10:30:00Z",
        "last_message_channel": "sms",
        "total_messages": "12"
      },
      "createdAt": "2024-06-15T14:20:00Z",
      "updatedAt": "2025-01-25T10:30:05Z"
    }
  ]
}
```

**Response (Contact Not Found):**
```json
{
  "results": [],
  "total": 0
}
```

#### Contact Creation (Node 809)

**API Request:**
```http
POST https://api.hubapi.com/crm/v3/objects/contacts
Authorization: Bearer pat-na1-xxxxxxxxx
Content-Type: application/json

{
  "properties": {
    "phone": "+15551234567",
    "firstname": "New",
    "lastname": "Contact",
    "lifecyclestage": "lead",
    "lead_source": "sms",
    "createdate": "2025-01-30T13:22:00Z"
  }
}
```

**Response:**
```json
{
  "id": "789012",
  "properties": {
    "phone": "+15551234567",
    "firstname": "New",
    "lastname": "Contact",
    "lifecyclestage": "lead",
    "lead_source": "sms"
  },
  "createdAt": "2025-01-30T13:22:00Z"
}
```

#### Contact Update (Node 825)

**API Request:**
```http
PATCH https://api.hubapi.com/crm/v3/objects/contacts/123456
Authorization: Bearer pat-na1-xxxxxxxxx
Content-Type: application/json

{
  "properties": {
    "last_message_date": "2025-01-30T13:22:00Z",
    "last_message_channel": "sms",
    "last_message_content": "Can I reschedule my appointment for next week?",
    "total_messages": "13"
  }
}
```

**Response:**
```json
{
  "id": "123456",
  "properties": {
    "last_message_date": "2025-01-30T13:22:00Z",
    "last_message_channel": "sms",
    "last_message_content": "Can I reschedule my appointment for next week?",
    "total_messages": "13"
  },
  "updatedAt": "2025-01-30T13:22:05Z"
}
```

#### Custom Properties Setup

Create custom fields in HubSpot:

```
Settings → Properties → Create property

1. Last Message Date
   - Object: Contact
   - Group: Contact Information
   - Label: Last Message Date
   - Field type: Date picker
   - API name: last_message_date

2. Last Message Channel
   - Object: Contact
   - Group: Contact Information
   - Label: Last Message Channel
   - Field type: Single-line text
   - API name: last_message_channel

3. Last Message Content
   - Object: Contact
   - Group: Contact Information
   - Label: Last Message Content
   - Field type: Multi-line text
   - API name: last_message_content

4. Total Messages
   - Object: Contact
   - Group: Contact Information
   - Label: Total Messages
   - Field type: Number
   - API name: total_messages

5. Preferred Channel
   - Object: Contact
   - Group: Contact Information
   - Label: Preferred Channel
   - Field type: Dropdown
   - Options: SMS, WhatsApp, Email, Telegram
   - API name: preferred_channel
```

### Salesforce Integration

#### Configuration

```bash
CRM_PROVIDER=salesforce
SALESFORCE_CREDENTIAL_ID=your_salesforce_credential_id
SALESFORCE_INSTANCE_URL=https://yourinstance.salesforce.com
SALESFORCE_API_VERSION=v57.0
```

#### Custom Fields

Create custom fields in Salesforce:

```
Setup → Object Manager → Contact → Fields & Relationships

1. Last_Message_Date__c (Date/Time)
2. Last_Message_Channel__c (Text(50))
3. Last_Message_Content__c (Long Text Area(255))
4. Total_Messages__c (Number(10,0))
5. Preferred_Channel__c (Picklist: SMS, WhatsApp, Email, Telegram)
```

#### Update Logic (Node 825)

Replace HubSpot node with Salesforce node:

```json
{
  "parameters": {
    "authentication": "oAuth2",
    "resource": "contact",
    "operation": "update",
    "contactId": "={{$json.contact.id}}",
    "updateFields": {
      "customFields": [
        {
          "fieldId": "Last_Message_Date__c",
          "value": "={{$json.timestamp}}"
        },
        {
          "fieldId": "Last_Message_Channel__c",
          "value": "={{$json.channel}}"
        },
        {
          "fieldId": "Last_Message_Content__c",
          "value": "={{$json.message.substring(0, 200)}}"
        },
        {
          "fieldId": "Total_Messages__c",
          "value": "={{($json.contact.total_messages || 0) + 1}}"
        }
      ]
    }
  }
}
```

### Zoho CRM Integration

#### Configuration

```bash
CRM_PROVIDER=zoho
ZOHO_CREDENTIAL_ID=your_zoho_credential_id
ZOHO_API_DOMAIN=https://www.zohoapis.com
ZOHO_ORGANIZATION_ID=your_org_id
```

#### Custom Fields

```
Setup → Modules and Fields → Contacts → Layout

1. Last Message Date (Date/Time)
2. Last Message Channel (Single Line)
3. Last Message Content (Multi Line)
4. Total Messages (Number)
5. Preferred Channel (Pick List)
```

#### API Examples

**Search Contact by Phone:**
```javascript
// Node 807 - Zoho CRM Contact Lookup
const phone = $json.from;

const options = {
  method: 'GET',
  url: `${$env.ZOHO_API_DOMAIN}/crm/v2/Contacts/search?phone=${phone}`,
  headers: {
    'Authorization': `Zoho-oauthtoken {{$credentials.zoho.accessToken}}`
  }
};

const response = await this.helpers.request(options);
const contact = response.data && response.data.length > 0 ? response.data[0] : null;

return { contact };
```

**Create New Contact:**
```javascript
// Node 808 - Create Contact in Zoho
const contactData = {
  "data": [{
    "First_Name": $json.first_name || "Unknown",
    "Last_Name": $json.last_name || "Patient",
    "Phone": $json.from,
    "Lead_Source": $json.channel,
    "Last_Message_Date": new Date().toISOString(),
    "Last_Message_Channel": $json.channel,
    "Last_Message_Content": $json.message.substring(0, 250),
    "Total_Messages": 1
  }]
};

const options = {
  method: 'POST',
  url: `${$env.ZOHO_API_DOMAIN}/crm/v2/Contacts`,
  headers: {
    'Authorization': `Zoho-oauthtoken {{$credentials.zoho.accessToken}}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(contactData)
};

const response = await this.helpers.request(options);
return response.data[0].details;
```

**Update Contact with Message History:**
```javascript
// Node 825 - Update Zoho Contact
const contactId = $json.contact_id;
const totalMessages = ($json.contact.Total_Messages || 0) + 1;

const updateData = {
  "data": [{
    "id": contactId,
    "Last_Message_Date": new Date().toISOString(),
    "Last_Message_Channel": $json.channel,
    "Last_Message_Content": $json.message.substring(0, 250),
    "Total_Messages": totalMessages
  }]
};

const options = {
  method: 'PUT',
  url: `${$env.ZOHO_API_DOMAIN}/crm/v2/Contacts`,
  headers: {
    'Authorization': `Zoho-oauthtoken {{$credentials.zoho.accessToken}}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updateData)
};

await this.helpers.request(options);
```

---

## Staff Notifications

Staff notifications ensure your team receives real-time alerts when messages require human attention. Module 08 supports Slack, Microsoft Teams, and Email notifications with customizable routing rules.

### Notification Triggers

Messages trigger staff notifications when:
- **Urgent keywords detected:** "emergency", "urgent", "pain", "help"
- **After business hours:** Patient messages outside configured hours
- **Bot confidence low:** AIgent bot confidence score < threshold
- **Bot disabled:** `AIGENT_BOT_ENABLED=false`
- **New contact:** First message from unknown patient
- **Manual escalation:** Patient requests human assistance

### Slack Integration

#### Slack Workspace Setup

**1. Create Slack App:**
```
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: "Aigent Message Hub"
4. Select your workspace
```

**2. Enable Incoming Webhooks:**
```
Features → Incoming Webhooks → Toggle ON
Click "Add New Webhook to Workspace"
Select channel: #messages (or create new channel)
Copy webhook URL
```

**3. Configure Channels:**
```
Create channels:
#messages - General patient messages
#urgent - Emergency/urgent messages
#after-hours - Messages outside business hours
```

**4. Add to .env:**
```bash
NOTIFICATION_CHANNEL=slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
SLACK_MESSAGES_CHANNEL=#messages
SLACK_URGENT_CHANNEL=#urgent
STAFF_NOTIFICATION_ENABLED=true
```

#### Slack Message Format

**Standard Message Notification (Node 811):**
```json
{
  "channel": "#messages",
  "username": "Aigent Message Hub",
  "icon_emoji": ":speech_balloon:",
  "attachments": [{
    "color": "#36a64f",
    "title": "New Message from Patient",
    "fields": [
      {
        "title": "From",
        "value": "+1 (555) 123-4567",
        "short": true
      },
      {
        "title": "Channel",
        "value": "SMS",
        "short": true
      },
      {
        "title": "Intent",
        "value": "booking",
        "short": true
      },
      {
        "title": "Priority",
        "value": "normal",
        "short": true
      },
      {
        "title": "Message",
        "value": "Can I reschedule my appointment for next week?",
        "short": false
      }
    ],
    "actions": [
      {
        "type": "button",
        "text": "Reply",
        "url": "https://dashboard.yourclinic.com/messages/12345"
      },
      {
        "type": "button",
        "text": "View Contact",
        "url": "https://app.hubspot.com/contacts/12345"
      }
    ],
    "footer": "Aigent Module 08",
    "ts": 1642521600
  }]
}
```

**Urgent Message Alert (Node 812):**
```json
{
  "channel": "#urgent",
  "username": "Aigent Message Hub",
  "icon_emoji": ":rotating_light:",
  "text": "<!channel> URGENT MESSAGE RECEIVED",
  "attachments": [{
    "color": "#ff0000",
    "title": "🚨 URGENT: Emergency Keywords Detected",
    "fields": [
      {
        "title": "From",
        "value": "+1 (555) 123-4567 (Jane Doe)",
        "short": true
      },
      {
        "title": "Channel",
        "value": "WhatsApp",
        "short": true
      },
      {
        "title": "Keywords Matched",
        "value": "severe, pain",
        "short": false
      },
      {
        "title": "Message",
        "value": "I'm having severe chest pain and difficulty breathing. Need help ASAP.",
        "short": false
      }
    ],
    "actions": [
      {
        "type": "button",
        "text": "RESPOND NOW",
        "url": "https://dashboard.yourclinic.com/messages/urgent/12345",
        "style": "danger"
      }
    ],
    "footer": "Received",
    "ts": 1642521600
  }]
}
```

#### Custom Slack Notification Code

**Node 811 - Slack Notification (HTTP Request):**
```javascript
const contact = $json.contact || {};
const contactName = contact.firstname && contact.lastname
  ? `${contact.firstname} ${contact.lastname}`
  : 'Unknown Patient';

const isUrgent = $json.priority === 'urgent';
const channel = isUrgent ? $env.SLACK_URGENT_CHANNEL : $env.SLACK_MESSAGES_CHANNEL;

const message = {
  channel: channel,
  username: 'Aigent Message Hub',
  icon_emoji: isUrgent ? ':rotating_light:' : ':speech_balloon:',
  text: isUrgent ? '<!channel> URGENT MESSAGE RECEIVED' : null,
  attachments: [{
    color: isUrgent ? '#ff0000' : '#36a64f',
    title: isUrgent ? '🚨 URGENT: Emergency Keywords Detected' : 'New Message from Patient',
    fields: [
      {
        title: 'From',
        value: `${$json.from} (${contactName})`,
        short: true
      },
      {
        title: 'Channel',
        value: $json.channel.toUpperCase(),
        short: true
      },
      {
        title: 'Intent',
        value: $json.intent || 'general',
        short: true
      },
      {
        title: 'Priority',
        value: $json.priority || 'normal',
        short: true
      },
      {
        title: 'Message',
        value: $json.message,
        short: false
      }
    ],
    actions: [
      {
        type: 'button',
        text: isUrgent ? 'RESPOND NOW' : 'Reply',
        url: `${$env.STAFF_DASHBOARD_URL}/${$json.message_id}`,
        style: isUrgent ? 'danger' : 'primary'
      },
      {
        type: 'button',
        text: 'View Contact',
        url: contact.profile_url || '#'
      }
    ],
    footer: 'Aigent Module 08',
    ts: Math.floor(Date.parse($json.timestamp) / 1000)
  }]
};

return { json: message };
```

### Microsoft Teams Integration

#### Teams Webhook Setup

**1. Add Incoming Webhook Connector:**
```
1. Open Teams channel (e.g., "Messages")
2. Click "..." → Connectors
3. Search "Incoming Webhook"
4. Click "Configure"
5. Name: "Aigent Message Hub"
6. Upload icon (optional)
7. Click "Create"
8. Copy webhook URL
```

**2. Configure .env:**
```bash
NOTIFICATION_CHANNEL=teams
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/xxxxx-xxxx-xxxx-xxxx-xxxxxx/IncomingWebhook/xxxxx
STAFF_NOTIFICATION_ENABLED=true
```

#### Teams Message Format

**Adaptive Card for Patient Messages:**
```json
{
  "type": "message",
  "attachments": [{
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.2",
      "body": [
        {
          "type": "TextBlock",
          "text": "New Message from Patient",
          "weight": "Bolder",
          "size": "Medium"
        },
        {
          "type": "FactSet",
          "facts": [
            {
              "title": "From:",
              "value": "+1 (555) 123-4567 (Jane Doe)"
            },
            {
              "title": "Channel:",
              "value": "SMS"
            },
            {
              "title": "Intent:",
              "value": "booking"
            },
            {
              "title": "Priority:",
              "value": "normal"
            }
          ]
        },
        {
          "type": "TextBlock",
          "text": "Can I reschedule my appointment for next week?",
          "wrap": true,
          "separator": true
        }
      ],
      "actions": [
        {
          "type": "Action.OpenUrl",
          "title": "Reply",
          "url": "https://dashboard.yourclinic.com/messages/12345"
        },
        {
          "type": "Action.OpenUrl",
          "title": "View Contact",
          "url": "https://app.hubspot.com/contacts/12345"
        }
      ]
    }
  }]
}
```

### Email Notifications

**Configure .env:**
```bash
NOTIFICATION_CHANNEL=email
STAFF_EMAIL=staff@yourclinic.com
SMTP_CREDENTIAL_ID=your_smtp_credential_id
```

**Email Template (Node 811 - Send Email):**
```
Subject: [Aigent] New Message - {{$json.intent}} - {{$json.priority}}

From: {{$json.from}}
Channel: {{$json.channel}}
Intent: {{$json.intent}}
Priority: {{$json.priority}}
Received: {{$json.timestamp}}

Message:
---
{{$json.message}}
---

Patient: {{$json.contact.firstname}} {{$json.contact.lastname}}
CRM Link: {{$json.contact.profile_url}}

Reply: {{$env.STAFF_DASHBOARD_URL}}/{{$json.message_id}}

---
Aigent Module 08 - Messaging Hub
```

### Notification Routing Logic

**Decision Matrix:**

| Condition | Channel | Urgency | Mention |
|-----------|---------|---------|---------|
| Urgent keywords | #urgent | @channel | Yes |
| After hours | #after-hours | None | No |
| Bot confidence < 0.8 | #messages | None | No |
| Bot disabled | #messages | None | No |
| New contact | #messages | None | No |
| Normal message | #messages | None | No |

**Routing Code (Node 811):**
```javascript
// Determine notification channel and urgency
let slackChannel = $env.SLACK_MESSAGES_CHANNEL;
let mentionChannel = false;
let color = '#36a64f'; // green

if ($json.priority === 'urgent') {
  slackChannel = $env.SLACK_URGENT_CHANNEL;
  mentionChannel = true;
  color = '#ff0000'; // red
} else if ($json.is_after_hours) {
  // Optionally use separate after-hours channel
  slackChannel = $env.SLACK_AFTER_HOURS_CHANNEL || $env.SLACK_MESSAGES_CHANNEL;
  color = '#ffa500'; // orange
} else if ($json.bot_response && $json.bot_response.confidence < 0.8) {
  color = '#ffff00'; // yellow - needs review
}

const messageText = mentionChannel ? '<!channel> URGENT MESSAGE RECEIVED' : null;

return {
  channel: slackChannel,
  text: messageText,
  color: color
};
```

---

## Message Logging

Module 08 logs all conversations to ensure compliance, analytics, and audit trails. Supports Google Sheets, Airtable, PostgreSQL, and MongoDB.

### Google Sheets Logging

**Default logging provider** - best for small-medium clinics (<10,000 messages/month).

#### Setup Google Sheets

**1. Create Spreadsheet:**
```
1. Go to Google Sheets: https://sheets.google.com
2. Create new spreadsheet: "Aigent Message Logs"
3. Create tabs:
   - Messages (main log)
   - Conversations (threaded view)
   - Analytics (summary)
```

**2. Messages Tab Headers (Row 1):**
```
A: message_id
B: timestamp
C: channel
D: from
E: to
F: contact_id
G: contact_name
H: message
I: intent
J: priority
K: is_urgent
L: is_after_hours
M: bot_enabled
N: bot_response
O: bot_confidence
P: human_response
Q: response_time_seconds
R: thread_id
S: conversation_count
T: metadata
```

**3. Configure n8n Credential:**
```
1. n8n → Credentials → Add Credential
2. Type: Google Sheets OAuth2 API
3. Name: "Google Sheets - Message Logs"
4. Authorize with Google account
5. Copy credential ID to .env
```

**4. Update .env:**
```bash
LOG_STORAGE=sheets
GOOGLE_SHEETS_CREDENTIAL_ID=your_gsheet_credential_id
GOOGLE_SHEET_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
SHEET_MESSAGES_TAB=Messages
```

#### Logging Code (Node 826)

**Google Sheets Append Row:**
```javascript
// Prepare log entry
const logEntry = {
  message_id: $json.message_id,
  timestamp: $json.timestamp,
  channel: $json.channel,
  from: $json.from,
  to: $json.to,
  contact_id: $json.contact?.id || '',
  contact_name: $json.contact ? `${$json.contact.firstname} ${$json.contact.lastname}` : '',
  message: $json.message,
  intent: $json.intent || 'general',
  priority: $json.priority || 'normal',
  is_urgent: $json.priority === 'urgent' ? 'TRUE' : 'FALSE',
  is_after_hours: $json.is_after_hours ? 'TRUE' : 'FALSE',
  bot_enabled: $env.AIGENT_BOT_ENABLED === 'true' ? 'TRUE' : 'FALSE',
  bot_response: $json.bot_response?.message || '',
  bot_confidence: $json.bot_response?.confidence || '',
  human_response: $json.human_response || '',
  response_time_seconds: $json.response_time || '',
  thread_id: $json.thread_id || '',
  conversation_count: $json.conversation_count || 1,
  metadata: JSON.stringify($json.metadata || {})
};

return { logEntry };
```

**Google Sheets Node Configuration:**
```
Node Type: Google Sheets
Operation: Append
Credential: {{$env.GOOGLE_SHEETS_CREDENTIAL_ID}}
Document ID: {{$env.GOOGLE_SHEET_ID}}
Sheet Name: {{$env.SHEET_MESSAGES_TAB}}
Data Mode: Define Below
Columns:
  - message_id: {{$json.message_id}}
  - timestamp: {{$json.timestamp}}
  - channel: {{$json.channel}}
  - from: {{$json.from}}
  - to: {{$json.to}}
  - contact_id: {{$json.contact_id}}
  - contact_name: {{$json.contact_name}}
  - message: {{$json.message}}
  - intent: {{$json.intent}}
  - priority: {{$json.priority}}
  - is_urgent: {{$json.is_urgent}}
  - is_after_hours: {{$json.is_after_hours}}
  - bot_enabled: {{$json.bot_enabled}}
  - bot_response: {{$json.bot_response}}
  - bot_confidence: {{$json.bot_confidence}}
  - human_response: {{$json.human_response}}
  - response_time_seconds: {{$json.response_time_seconds}}
  - thread_id: {{$json.thread_id}}
  - conversation_count: {{$json.conversation_count}}
  - metadata: {{$json.metadata}}
```

### Airtable Logging

**Alternative logging provider** - best for teams needing relational data and custom views.

#### Setup Airtable Base

**1. Create Base:**
```
1. Go to Airtable: https://airtable.com
2. Create new base: "Aigent Message Hub"
3. Create tables:
   - Messages (main log)
   - Contacts (linked to Messages)
   - Conversations (grouped messages)
```

**2. Messages Table Fields:**
```
- message_id (Single line text, Primary)
- timestamp (Date with time)
- channel (Single select: SMS, WhatsApp, Email, Telegram, Webchat)
- from (Phone number or Email)
- to (Phone number or Email)
- contact (Link to Contacts table)
- message (Long text)
- intent (Single select: booking, billing, urgent, support, general)
- priority (Single select: urgent, normal)
- is_urgent (Checkbox)
- is_after_hours (Checkbox)
- bot_enabled (Checkbox)
- bot_response (Long text)
- bot_confidence (Number, 0-1)
- human_response (Long text)
- response_time_seconds (Number)
- thread (Link to Conversations table)
- metadata (Long text, JSON)
```

**3. Configure n8n Credential:**
```
1. Airtable → Account → Generate API Key
2. n8n → Credentials → Add Credential
3. Type: Airtable Personal Access Token
4. Paste API key
5. Copy credential ID to .env
```

**4. Update .env:**
```bash
LOG_STORAGE=airtable
AIRTABLE_CREDENTIAL_ID=your_airtable_credential_id
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE=Messages
```

#### Airtable Node Configuration

**Node 826 - Airtable Create Record:**
```
Node Type: Airtable
Operation: Create
Credential: {{$env.AIRTABLE_CREDENTIAL_ID}}
Base ID: {{$env.AIRTABLE_BASE_ID}}
Table: {{$env.AIRTABLE_TABLE}}
Fields:
  - message_id: {{$json.message_id}}
  - timestamp: {{$json.timestamp}}
  - channel: {{$json.channel}}
  - from: {{$json.from}}
  - to: {{$json.to}}
  - contact: [{{$json.contact_id}}] (array of record IDs)
  - message: {{$json.message}}
  - intent: {{$json.intent}}
  - priority: {{$json.priority}}
  - is_urgent: {{$json.priority === 'urgent'}}
  - is_after_hours: {{$json.is_after_hours}}
  - bot_enabled: {{$env.AIGENT_BOT_ENABLED === 'true'}}
  - bot_response: {{$json.bot_response?.message}}
  - bot_confidence: {{$json.bot_response?.confidence}}
  - metadata: {{JSON.stringify($json.metadata)}}
```

### PostgreSQL Logging

**Enterprise logging provider** - best for high-volume clinics (>50,000 messages/month) requiring SQL analytics.

#### Database Schema

**Create Messages Table:**
```sql
CREATE TABLE messages (
  message_id VARCHAR(255) PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  channel VARCHAR(50) NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  to_address VARCHAR(255),
  contact_id VARCHAR(255),
  contact_name VARCHAR(255),
  message TEXT NOT NULL,
  intent VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'normal',
  is_urgent BOOLEAN DEFAULT FALSE,
  is_after_hours BOOLEAN DEFAULT FALSE,
  bot_enabled BOOLEAN DEFAULT FALSE,
  bot_response TEXT,
  bot_confidence DECIMAL(3,2),
  human_response TEXT,
  response_time_seconds INTEGER,
  thread_id VARCHAR(255),
  conversation_count INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_from ON messages(from_address);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_intent ON messages(intent);
CREATE INDEX idx_messages_priority ON messages(priority);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_metadata ON messages USING GIN(metadata);

-- Create conversations view
CREATE VIEW conversations AS
SELECT
  thread_id,
  MIN(timestamp) as started_at,
  MAX(timestamp) as last_message_at,
  COUNT(*) as message_count,
  MAX(contact_name) as contact_name,
  MAX(channel) as primary_channel,
  BOOL_OR(is_urgent) as had_urgent_message,
  AVG(bot_confidence) as avg_bot_confidence
FROM messages
WHERE thread_id IS NOT NULL
GROUP BY thread_id;
```

**Configure .env:**
```bash
LOG_STORAGE=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=clinic_db
POSTGRES_USER=n8n_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_TABLE=messages
```

**Node 826 - PostgreSQL Insert:**
```javascript
// Code Function to prepare SQL
const message = $json;
const contact = message.contact || {};

const sql = `
INSERT INTO messages (
  message_id, timestamp, channel, from_address, to_address,
  contact_id, contact_name, message, intent, priority,
  is_urgent, is_after_hours, bot_enabled, bot_response, bot_confidence,
  thread_id, conversation_count, metadata
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18
)`;

const values = [
  message.message_id,
  message.timestamp,
  message.channel,
  message.from,
  message.to,
  contact.id || null,
  contact.firstname && contact.lastname ? `${contact.firstname} ${contact.lastname}` : null,
  message.message,
  message.intent || 'general',
  message.priority || 'normal',
  message.priority === 'urgent',
  message.is_after_hours || false,
  process.env.AIGENT_BOT_ENABLED === 'true',
  message.bot_response?.message || null,
  message.bot_response?.confidence || null,
  message.thread_id || null,
  message.conversation_count || 1,
  JSON.stringify(message.metadata || {})
];

return { sql, values };
```

### PHI Redaction in Logs

**Automatically redact sensitive information** when `PHI_SAFE_MODE=true`.

**Redaction Patterns (Node 826 - before logging):**
```javascript
// PHI redaction function
function redactPHI(text) {
  if (!text || $env.PHI_SAFE_MODE !== 'true') return text;

  let redacted = text;

  // SSN: 123-45-6789
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]');

  // Credit Card: 4111-1111-1111-1111
  redacted = redacted.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CC-REDACTED]');

  // MRN: MRN: 12345678
  redacted = redacted.replace(/MRN:?\s*\d+/gi, '[MRN-REDACTED]');

  // Date of Birth (various formats)
  redacted = redacted.replace(/\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/g, '[DOB-REDACTED]');

  // Custom patterns from env
  if ($env.PHI_PATTERNS) {
    const patterns = $env.PHI_PATTERNS.split(',');
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.trim(), 'gi');
      redacted = redacted.replace(regex, '[PHI-REDACTED]');
    });
  }

  return redacted;
}

// Apply to message before logging
const safeMessage = redactPHI($json.message);
const safeBotResponse = redactPHI($json.bot_response?.message);

return {
  ...message,
  message: safeMessage,
  bot_response: safeBotResponse
};
```

### Log Retention and Archiving

**Automatic archiving** for compliance and storage management.

**Archive Old Messages (Scheduled Workflow):**
```javascript
// Run monthly: Archive messages older than MESSAGE_RETENTION_DAYS

const retentionDays = parseInt($env.MESSAGE_RETENTION_DAYS) || 365;
const archiveDate = new Date();
archiveDate.setDate(archiveDate.getDate() - retentionDays);

// For Google Sheets: Move to "Archived" tab
// For Airtable: Move to "Archived Messages" table
// For PostgreSQL:
const archiveSQL = `
INSERT INTO messages_archive
SELECT * FROM messages
WHERE timestamp < $1;

DELETE FROM messages
WHERE timestamp < $1;
`;

return {
  archiveDate: archiveDate.toISOString(),
  sql: archiveSQL
};
```

---

## Conversation Threading

Conversation threading groups related messages from the same contact, maintaining context and enabling coherent multi-turn interactions.

### Threading Logic

**Thread Creation Rules:**
1. **New thread** if:
   - First message from contact
   - Last message > `THREAD_TIMEOUT_HOURS` ago
   - Contact explicitly starts new conversation

2. **Continue thread** if:
   - Message from same contact
   - Within timeout window
   - Same channel (optional)

### Thread ID Generation

**Code (Node 804 - Thread Manager):**
```javascript
const contact_id = $json.contact?.id;
const channel = $json.channel;
const currentTime = new Date($json.timestamp);

// Fetch last thread for this contact
const lastThread = await getLastThread(contact_id);

let thread_id;
let conversation_count = 1;

if (lastThread) {
  const lastMessageTime = new Date(lastThread.last_message_at);
  const hoursSinceLastMessage = (currentTime - lastMessageTime) / (1000 * 60 * 60);

  const threadTimeout = parseInt($env.THREAD_TIMEOUT_HOURS) || 24;

  if (hoursSinceLastMessage < threadTimeout) {
    // Continue existing thread
    thread_id = lastThread.thread_id;
    conversation_count = lastThread.message_count + 1;
  } else {
    // Create new thread (timeout exceeded)
    thread_id = `thread_${contact_id}_${Date.now()}`;
    conversation_count = 1;
  }
} else {
  // First message from contact - create new thread
  thread_id = `thread_${contact_id}_${Date.now()}`;
  conversation_count = 1;
}

return {
  thread_id,
  conversation_count,
  is_new_thread: conversation_count === 1
};
```

### Context Window Management

**Retrieve conversation history** for bot context.

**Fetch Recent Messages (Node 816 - Before Bot Call):**
```javascript
// Get last N messages in thread for context
const thread_id = $json.thread_id;
const contextWindowSize = parseInt($env.CONTEXT_WINDOW_SIZE) || 10;

// For Google Sheets
const sheet = $env.GOOGLE_SHEET_ID;
const query = `SELECT * FROM ${$env.SHEET_MESSAGES_TAB} WHERE thread_id = '${thread_id}' ORDER BY timestamp DESC LIMIT ${contextWindowSize}`;

// For PostgreSQL
const sql = `
SELECT message_id, timestamp, channel, from_address, message, bot_response
FROM messages
WHERE thread_id = $1
ORDER BY timestamp DESC
LIMIT $2
`;

const contextMessages = await executeQuery(sql, [thread_id, contextWindowSize]);

// Reverse to chronological order
contextMessages.reverse();

// Format for bot
const conversationHistory = contextMessages.map(msg => ({
  role: msg.from_address === $json.from ? 'patient' : 'assistant',
  content: msg.from_address === $json.from ? msg.message : msg.bot_response,
  timestamp: msg.timestamp
}));

return {
  conversation_history: conversationHistory,
  context_message_count: conversationHistory.length
};
```

### Thread Metadata Tracking

**Store thread-level analytics:**
```javascript
// Thread metadata
const threadMetadata = {
  thread_id: $json.thread_id,
  contact_id: $json.contact?.id,
  started_at: $json.is_new_thread ? $json.timestamp : lastThread.started_at,
  last_message_at: $json.timestamp,
  message_count: $json.conversation_count,
  primary_channel: $json.channel,
  channels_used: [...new Set([...(lastThread?.channels_used || []), $json.channel])],
  intents_discussed: [...new Set([...(lastThread?.intents_discussed || []), $json.intent])],
  had_urgent_message: lastThread?.had_urgent_message || $json.priority === 'urgent',
  bot_handled_count: lastThread?.bot_handled_count + (botResponse ? 1 : 0),
  human_handled_count: lastThread?.human_handled_count + (botResponse ? 0 : 1),
  avg_response_time: calculateAvgResponseTime(),
  status: 'active' // active, resolved, escalated
};

// Update threads table
await updateThread(threadMetadata);
```

### Thread Expiration

**Automatically close inactive threads:**
```javascript
// Scheduled workflow: Daily at 2 AM
// Close threads with no activity for > THREAD_TIMEOUT_HOURS

const threadTimeout = parseInt($env.THREAD_TIMEOUT_HOURS) || 24;
const expirationTime = new Date();
expirationTime.setHours(expirationTime.getHours() - threadTimeout);

// PostgreSQL
const closeSQL = `
UPDATE threads
SET status = 'expired',
    closed_at = NOW()
WHERE status = 'active'
  AND last_message_at < $1
`;

// Google Sheets
// Filter rows where last_message_at < expirationTime
// Update status column to 'expired'

await execute(closeSQL, [expirationTime.toISOString()]);
```

---

## Outbound Campaigns

Send bulk messages to patient segments for appointment reminders, health tips, or announcements. **Requires opt-in consent and TCPA compliance.**

### Campaign Configuration

**Enable outbound messaging:**
```bash
OUTBOUND_ENABLED=true
OUTBOUND_RATE_LIMIT=10  # messages per minute
REQUIRE_OPTIN=true
OPTOUT_KEYWORD=STOP
OPTIN_KEYWORD=START
```

### Opt-In Management

**Track patient consent** in CRM custom field: `communication_preferences`.

**Opt-In via Inbound Message:**
```javascript
// Node 803 - Detect Opt-In/Opt-Out
const message = $json.message.toUpperCase().trim();
const from = $json.from;

if (message === $env.OPTOUT_KEYWORD || message === 'STOP' || message === 'UNSUBSCRIBE') {
  // Update CRM: Set opted_out = true
  await updateCRMContact(from, {
    communication_preferences: 'opted_out',
    opted_out_at: new Date().toISOString(),
    opted_out_channel: $json.channel
  });

  // Send confirmation
  const response = `You've been unsubscribed from ${$env.BRAND_NAME} messages. Reply START to re-subscribe. For support, call us at ${$env.CLINIC_PHONE}.`;

  return {
    send_response: true,
    response_message: response,
    skip_bot: true
  };
}

if (message === $env.OPTIN_KEYWORD || message === 'START' || message === 'SUBSCRIBE') {
  // Update CRM: Set opted_in = true
  await updateCRMContact(from, {
    communication_preferences: 'opted_in',
    opted_in_at: new Date().toISOString(),
    opted_in_channel: $json.channel
  });

  const response = `Welcome! You're now subscribed to ${$env.BRAND_NAME} messages. Reply STOP anytime to unsubscribe.`;

  return {
    send_response: true,
    response_message: response,
    skip_bot: true
  };
}

return { send_response: false };
```

### Campaign Workflow

**Separate n8n workflow for outbound campaigns** (not part of Module 08, but integrates with it).

**Example: Appointment Reminder Campaign**
```
Workflow: "Outbound - Appointment Reminders"

1. Schedule Trigger (Daily at 9 AM)
2. Query CRM: Appointments tomorrow
3. Filter: Only opted-in patients
4. Loop: For each appointment
   5. Prepare message
   6. Rate limit delay
   7. Call Module 08 outbound endpoint
   8. Log campaign delivery
```

**Outbound Message Format:**
```javascript
// POST to Module 08 webhook with source=outbound
{
  "source": "outbound",
  "campaign_id": "appt-reminder-2025-01-15",
  "channel": "sms",  // or patient's preferred channel
  "to": "+15551234567",
  "message": "Hi Jane! Reminder: You have an appointment tomorrow at 2 PM with Dr. Smith. Reply C to confirm or R to reschedule.",
  "contact_id": "12345",
  "metadata": {
    "appointment_id": "appt_67890",
    "appointment_time": "2025-01-16T14:00:00Z",
    "provider": "Dr. Smith"
  }
}
```

**Node 801 - Detect Outbound Messages:**
```javascript
// Differentiate inbound vs outbound
const isOutbound = $json.source === 'outbound' || $json.campaign_id;

if (isOutbound) {
  // Skip intent classification, bot processing
  // Go directly to channel sender
  return {
    is_outbound: true,
    skip_processing: true,
    direct_send: true
  };
} else {
  // Normal inbound processing
  return {
    is_outbound: false,
    skip_processing: false
  };
}
```

### Rate Limiting

**Prevent carrier throttling and spam flags:**
```javascript
// Node 820 - Rate Limiter (before Twilio send)
const rateLimit = parseInt($env.OUTBOUND_RATE_LIMIT) || 10; // per minute
const delayMs = (60 / rateLimit) * 1000;

// n8n built-in delay or custom implementation
await new Promise(resolve => setTimeout(resolve, delayMs));

return $json;
```

### TCPA Compliance

**Telephone Consumer Protection Act** compliance requirements:

1. **Express consent:** Patients must opt-in before receiving automated messages
2. **Clear identity:** Messages must identify the sender (clinic name)
3. **Opt-out mechanism:** Every message must include "Reply STOP to opt-out"
4. **Time restrictions:** No messages before 8 AM or after 9 PM local time
5. **Record keeping:** Maintain opt-in/opt-out records for 4+ years

**Compliant Message Template:**
```javascript
const message = `${$env.BRAND_NAME}: ${messageContent}. Reply STOP to opt-out.`;

// Verify time restrictions
const hour = new Date().getHours();
if (hour < 8 || hour >= 21) {
  throw new Error('TCPA violation: Cannot send messages before 8 AM or after 9 PM');
}

// Verify opt-in status
if (!contact.communication_preferences || contact.communication_preferences === 'opted_out') {
  throw new Error('TCPA violation: Contact has not opted in or has opted out');
}

return { compliant_message: message };
```

---

## Advanced Features

### Multi-Language Support

**Automatic translation** for non-English messages.

**Configure .env:**
```bash
ENABLE_TRANSLATION=true
TRANSLATION_SERVICE=google
GOOGLE_TRANSLATE_API_KEY=your_api_key
SUPPORTED_LANGUAGES=en,es,fr,zh
DEFAULT_LANGUAGE=en
```

**Translation Node (Node 806):**
```javascript
// Detect language
const detectResponse = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?key=${$env.GOOGLE_TRANSLATE_API_KEY}`, {
  method: 'POST',
  body: JSON.stringify({ q: $json.message })
});

const detected = await detectResponse.json();
const detectedLang = detected.data.detections[0][0].language;

let translatedMessage = $json.message;
let originalLang = detectedLang;

// Translate to English if not English
if (detectedLang !== 'en' && $env.ENABLE_TRANSLATION === 'true') {
  const translateResponse = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${$env.GOOGLE_TRANSLATE_API_KEY}`, {
    method: 'POST',
    body: JSON.stringify({
      q: $json.message,
      source: detectedLang,
      target: 'en'
    })
  });

  const translated = await translateResponse.json();
  translatedMessage = translated.data.translations[0].translatedText;
}

return {
  original_message: $json.message,
  original_language: originalLang,
  message: translatedMessage,  // English version for processing
  needs_translation_back: originalLang !== 'en'
};
```

**Translate Bot Response Back:**
```javascript
// After bot responds in English, translate back to patient's language
if ($json.needs_translation_back && $json.original_language !== 'en') {
  const translateResponse = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${$env.GOOGLE_TRANSLATE_API_KEY}`, {
    method: 'POST',
    body: JSON.stringify({
      q: $json.bot_response.message,
      source: 'en',
      target: $json.original_language
    })
  });

  const translated = await translateResponse.json();
  $json.bot_response.message = translated.data.translations[0].translatedText;
}

return $json;
```

### Voice Message Transcription

**Transcribe voice notes** from WhatsApp, Telegram.

**Configure .env:**
```bash
ENABLE_VOICE_TRANSCRIPTION=true
TRANSCRIPTION_SERVICE=assemblyai
ASSEMBLYAI_API_KEY=your_api_key
```

**Transcription Node:**
```javascript
// Node 803 - Detect voice message
const hasVoice = $json.metadata?.media_type === 'audio' || $json.metadata?.voice_url;

if (hasVoice && $env.ENABLE_VOICE_TRANSCRIPTION === 'true') {
  const audioUrl = $json.metadata.voice_url;

  // Upload to AssemblyAI
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'authorization': $env.ASSEMBLYAI_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ audio_url: audioUrl })
  });

  const transcript = await uploadResponse.json();
  const transcriptId = transcript.id;

  // Poll for completion
  let transcriptionResult;
  while (true) {
    const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { 'authorization': $env.ASSEMBLYAI_API_KEY }
    });
    transcriptionResult = await statusResponse.json();

    if (transcriptionResult.status === 'completed') break;
    if (transcriptionResult.status === 'error') throw new Error('Transcription failed');

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Replace message with transcription
  $json.message = transcriptionResult.text;
  $json.metadata.original_media_type = 'audio';
  $json.metadata.transcription_confidence = transcriptionResult.confidence;
}

return $json;
```

### Rich Media Handling

**Process images, documents, videos** sent by patients.

**Configure .env:**
```bash
PROCESS_ATTACHMENTS=true
MAX_ATTACHMENT_SIZE_MB=10
ALLOWED_ATTACHMENT_TYPES=image/jpeg,image/png,application/pdf
ATTACHMENT_STORAGE=s3
S3_BUCKET=clinic-message-attachments
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your_key
S3_SECRET_ACCESS_KEY=your_secret
```

**Attachment Processing Node:**
```javascript
// Node 803 - Process Attachments
const mediaUrl = $json.metadata?.media_url;

if (mediaUrl && $env.PROCESS_ATTACHMENTS === 'true') {
  // Download attachment
  const mediaResponse = await fetch(mediaUrl);
  const mediaBuffer = await mediaResponse.buffer();
  const mimeType = mediaResponse.headers.get('content-type');
  const fileSize = parseInt(mediaResponse.headers.get('content-length')) / (1024 * 1024); // MB

  // Validate
  const maxSize = parseInt($env.MAX_ATTACHMENT_SIZE_MB) || 10;
  const allowedTypes = $env.ALLOWED_ATTACHMENT_TYPES.split(',');

  if (fileSize > maxSize) {
    throw new Error(`Attachment too large: ${fileSize}MB (max ${maxSize}MB)`);
  }

  if (!allowedTypes.includes(mimeType)) {
    throw new Error(`Attachment type not allowed: ${mimeType}`);
  }

  // Upload to S3
  const fileName = `${$json.message_id}_${Date.now()}.${mimeType.split('/')[1]}`;
  const s3Url = await uploadToS3(mediaBuffer, fileName, mimeType);

  // Attach to message metadata
  $json.metadata.attachment_url = s3Url;
  $json.metadata.attachment_type = mimeType;
  $json.metadata.attachment_size_mb = fileSize;

  // Append to message text
  $json.message += `\n\n[Attachment: ${mimeType}]`;
}

return $json;
```

### Interactive Messages

**Send buttons, quick replies** (WhatsApp, Telegram).

**WhatsApp Interactive Message:**
```javascript
// Node 822 - Twilio WhatsApp with buttons
const interactiveMessage = {
  "messaging_service_sid": $env.TWILIO_MESSAGING_SERVICE_SID,
  "to": `whatsapp:${$json.to}`,
  "content_sid": "HX...",  // Twilio Content Template
  "content_variables": JSON.stringify({
    "1": "Jane Doe",
    "2": "Tomorrow at 2 PM",
    "3": "Dr. Smith"
  })
};

// Or manual interactive structure
const message = {
  "from": `whatsapp:${$env.TWILIO_WHATSAPP_NUMBER}`,
  "to": `whatsapp:${$json.to}`,
  "body": "Your appointment is tomorrow at 2 PM. Please choose an option:",
  "persistent_action": [
    "Confirm|confirm_appt",
    "Reschedule|reschedule_appt",
    "Cancel|cancel_appt"
  ]
};

return message;
```

**Telegram Inline Keyboard:**
```javascript
// Node 824 - Telegram with inline buttons
const telegramMessage = {
  chat_id: $json.from,
  text: "Your appointment is tomorrow at 2 PM. Please choose:",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "✅ Confirm", callback_data: "confirm_appt" },
        { text: "📅 Reschedule", callback_data: "reschedule_appt" }
      ],
      [
        { text: "❌ Cancel", callback_data: "cancel_appt" }
      ]
    ]
  }
};

await fetch(`https://api.telegram.org/bot${$env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(telegramMessage)
});
```

---

## Testing

Comprehensive testing ensures Module 08 handles all channels, intents, and edge cases correctly.

### Test Matrix

| # | Test Case | Channel | Input | Expected Output |
|---|-----------|---------|-------|-----------------|
| 1 | Inbound SMS | SMS | "Can I reschedule?" | Intent: booking, Bot response |
| 2 | Inbound WhatsApp | WhatsApp | "What's my bill?" | Intent: billing, Bot response |
| 3 | Inbound Email | Email | Support question | Intent: support, Bot response |
| 4 | Inbound Telegram | Telegram | General query | Intent: general, Bot response |
| 5 | Urgent SMS | SMS | "Emergency! Severe pain!" | Priority: urgent, Slack alert |
| 6 | After-hours message | SMS | Message at 10 PM | Auto-response, queue |
| 7 | Bot low confidence | Any | Ambiguous question | Human escalation |
| 8 | New contact | SMS | First message | Welcome, CRM create |
| 9 | Known contact | SMS | Follow-up message | Thread continuation |
| 10 | Opt-out | SMS | "STOP" | Opt-out confirmation |
| 11 | Opt-in | SMS | "START" | Opt-in confirmation |
| 12 | Voice message | WhatsApp | Voice note | Transcription |
| 13 | Image attachment | WhatsApp | Photo | S3 upload, process |
| 14 | Multi-language | Any | Spanish message | Translation, response |
| 15 | Thread timeout | SMS | Message after 48h | New thread |
| 16 | Duplicate message | Any | Same message 2x | Deduplication |
| 17 | Invalid phone | SMS | Malformed number | Error handling |
| 18 | Rate limit | Any | 100 msgs/min | Throttling |
| 19 | Webhook signature | SMS | Invalid signature | Rejection |
| 20 | PHI in message | Any | "SSN: 123-45-6789" | Redaction in logs |

### Test Setup

**1. Create Test Environment:**
```bash
# Copy .env
cp .env.aigent_module_08_example .env.test

# Use test credentials
TWILIO_FROM_NUMBER=+15551234567  # Twilio test number
FILTER_TEST_MESSAGES=true
TEST_PHONE_PATTERN=^\+1555
```

**2. Configure Test Bot:**
```bash
AIGENT_BOT_ENDPOINT=https://mock-bot.example.com/chat
# Or use test mode that returns fixed responses
AIGENT_BOT_TEST_MODE=true
```

**3. Test Data:**
```json
{
  "test_contacts": [
    {
      "name": "Test Patient 1",
      "phone": "+15551111111",
      "email": "test1@example.com",
      "crm_id": "test_001"
    },
    {
      "name": "Test Patient 2",
      "phone": "+15552222222",
      "email": "test2@example.com",
      "crm_id": "test_002"
    }
  ]
}
```

### Automated Testing

**Postman Collection:**
```json
{
  "info": {
    "name": "Aigent Module 08 - Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Test 1: Inbound SMS",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "urlencoded",
          "urlencoded": [
            { "key": "MessageSid", "value": "SM{{$randomUUID}}" },
            { "key": "From", "value": "+15551111111" },
            { "key": "To", "value": "+15557654321" },
            { "key": "Body", "value": "Can I reschedule my appointment?" }
          ]
        },
        "url": "{{n8n_webhook_url}}"
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function() {",
              "  pm.response.to.have.status(200);",
              "});",
              "pm.test('Response contains message_log', function() {",
              "  const json = pm.response.json();",
              "  pm.expect(json).to.have.property('message_log');",
              "});",
              "pm.test('Intent is booking', function() {",
              "  const json = pm.response.json();",
              "  pm.expect(json.message_log.intent).to.equal('booking');",
              "});"
            ]
          }
        }
      ]
    },
    {
      "name": "Test 5: Urgent Message",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "urlencoded",
          "urlencoded": [
            { "key": "MessageSid", "value": "SM{{$randomUUID}}" },
            { "key": "From", "value": "+15551111111" },
            { "key": "To", "value": "+15557654321" },
            { "key": "Body", "value": "Emergency! I'm having severe chest pain!" }
          ]
        },
        "url": "{{n8n_webhook_url}}"
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Priority is urgent', function() {",
              "  const json = pm.response.json();",
              "  pm.expect(json.message_log.priority).to.equal('urgent');",
              "});",
              "pm.test('Slack notification sent', function() {",
              "  // Verify via Slack API or mock",
              "});"
            ]
          }
        }
      ]
    }
  ]
}
```

### Manual Testing Checklist

**Pre-Flight:**
- [ ] All credentials configured in n8n
- [ ] Webhook URL accessible (use ngrok for local testing)
- [ ] Test phone numbers configured in Twilio
- [ ] CRM test account ready
- [ ] Google Sheets test spreadsheet created
- [ ] Slack test channel created

**Channel Tests:**
- [ ] Send SMS via Twilio console → verify webhook receives
- [ ] Send WhatsApp message → verify normalization
- [ ] Send email to SendGrid → verify parsing
- [ ] Send Telegram message → verify bot receives
- [ ] Test webchat widget → verify payload

**Routing Tests:**
- [ ] Send booking-related message → verify intent=booking
- [ ] Send urgent message → verify Slack alert in #urgent
- [ ] Send message at 11 PM → verify after-hours response
- [ ] Send message with bot disabled → verify staff notification

**CRM Tests:**
- [ ] New contact sends message → verify CRM create
- [ ] Existing contact sends message → verify CRM update
- [ ] Check CRM record → verify conversation history appended

**Logging Tests:**
- [ ] Send message → verify Google Sheets row added
- [ ] Check log → verify PHI redacted
- [ ] Verify all fields populated correctly

**Bot Tests:**
- [ ] Send clear question → verify high-confidence response
- [ ] Send ambiguous question → verify low-confidence escalation
- [ ] Check conversation context → verify history included

---

## Troubleshooting

### Common Issues

#### Issue 1: Webhook Not Receiving Messages

**Symptoms:**
- Twilio/SendGrid sends message, but n8n shows no execution

**Diagnosis:**
```bash
# Check n8n webhook URL
curl -X POST https://your-n8n.com/webhook/aigent-message-hub \
  -d "MessageSid=TEST123" \
  -d "From=+15551234567" \
  -d "Body=Test message"

# Expected: 200 OK with JSON response
# Actual: 404 or timeout = webhook not active
```

**Solutions:**
1. **Activate workflow:** Ensure Module 08 workflow is ACTIVE (not draft)
2. **Check webhook path:** Verify Node 801 webhook path matches platform configuration
3. **Firewall:** Ensure n8n instance accessible from Twilio/SendGrid IPs
4. **HTTPS required:** Most platforms require HTTPS webhooks (use ngrok for local dev)

**Fix:**
```bash
# For local development with ngrok
ngrok http 5678
# Use ngrok URL in Twilio webhook config:
# https://abc123.ngrok.io/webhook/aigent-message-hub
```

#### Issue 2: CRM Contact Not Found/Created

**Symptoms:**
- Messages process but CRM shows no updates
- Error: "Contact not found and auto-create failed"

**Diagnosis:**
```javascript
// Node 807 - Add debug logging
console.log('Searching CRM for:', $json.from);
console.log('CRM response:', response);

// Check credential validity
const testCall = await this.helpers.request({
  url: 'https://api.hubapi.com/contacts/v1/lists/all/contacts/all',
  headers: { 'Authorization': `Bearer ${$credentials.hubspot.accessToken}` }
});
console.log('CRM auth test:', testCall);
```

**Solutions:**
1. **Check credentials:** Verify CRM credential in n8n → Credentials
2. **API permissions:** Ensure API key has contact read/write permissions
3. **Phone format:** CRM expects E.164 format (+1234567890), verify normalization
4. **Rate limits:** Check if CRM API rate limit exceeded

**Fix:**
```javascript
// Node 802 - Ensure E.164 phone format
let normalizedPhone = $json.from;

// Remove whatsapp: prefix
normalizedPhone = normalizedPhone.replace('whatsapp:', '');

// Ensure + prefix
if (!normalizedPhone.startsWith('+')) {
  normalizedPhone = '+1' + normalizedPhone; // Assume US if no country code
}

// Remove formatting
normalizedPhone = normalizedPhone.replace(/[\s\-\(\)]/g, '');

$json.from = normalizedPhone;
```

#### Issue 3: Bot Always Returns Low Confidence

**Symptoms:**
- Every message escalates to human despite clear intent
- Bot confidence always < 0.8

**Diagnosis:**
```bash
# Test bot endpoint directly
curl -X POST https://api.aigent.com/v1/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can I book an appointment?",
    "contact": {"id": "123", "name": "Test"},
    "context": [],
    "capabilities": ["book_appointment"]
  }'

# Expected: confidence > 0.8
# Actual: confidence < 0.8 or error = bot misconfigured
```

**Solutions:**
1. **Check bot training:** Ensure bot trained on clinic-specific FAQs
2. **Context required:** Some bots need conversation history for confidence
3. **Capabilities mismatch:** Verify capabilities array matches bot's training
4. **API version:** Check bot API version compatibility

**Fix:**
```javascript
// Node 816 - Enhance bot request with more context
const botRequest = {
  message: $json.message,
  contact: {
    id: $json.contact?.id,
    name: $json.contact?.firstname + ' ' + $json.contact?.lastname,
    phone: $json.from,
    // Add more context
    last_appointment: $json.contact?.last_appointment_date,
    patient_since: $json.contact?.create_date,
    preferred_provider: $json.contact?.preferred_provider
  },
  conversation_history: $json.conversation_history || [],
  intent_hint: $json.intent, // Provide detected intent
  capabilities: [
    'book_appointment',
    'reschedule_appointment',
    'answer_faq',
    'billing_questions'
  ],
  clinic_info: {
    name: $env.BRAND_NAME,
    hours: `${$env.BUSINESS_HOURS_START} AM - ${$env.BUSINESS_HOURS_END} PM`,
    phone: $env.CLINIC_PHONE
  }
};
```

#### Issue 4: Messages Logged with Wrong Timestamp

**Symptoms:**
- Google Sheets shows messages with future/past timestamps
- Timezone appears incorrect

**Diagnosis:**
```javascript
// Node 802 - Log timestamp at each stage
console.log('Webhook timestamp:', $json.timestamp);
console.log('Server time:', new Date().toISOString());
console.log('Timezone:', $env.TIMEZONE);

// Check timezone conversion
const localTime = new Date().toLocaleString('en-US', { timeZone: $env.TIMEZONE });
console.log('Local time:', localTime);
```

**Solutions:**
1. **Normalize timestamps:** Always use ISO 8601 format
2. **Timezone config:** Set `TIMEZONE` env variable correctly
3. **Channel differences:** Each channel sends timestamps differently

**Fix:**
```javascript
// Node 802 - Normalize timestamp
let timestamp;

if ($json.timestamp) {
  // Telegram sends Unix timestamp (seconds)
  if (typeof $json.timestamp === 'number') {
    timestamp = new Date($json.timestamp * 1000).toISOString();
  } else {
    timestamp = new Date($json.timestamp).toISOString();
  }
} else {
  // Default to current server time
  timestamp = new Date().toISOString();
}

$json.timestamp = timestamp;
```

#### Issue 5: After-Hours Detection Incorrect

**Symptoms:**
- Messages during business hours get after-hours response
- After-hours messages processed as normal

**Diagnosis:**
```javascript
// Node 805 - Debug business hours logic
const now = new Date();
const hour = now.getHours();
const day = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

console.log('Current hour:', hour);
console.log('Current day:', day);
console.log('Business hours:', $env.BUSINESS_HOURS_START, '-', $env.BUSINESS_HOURS_END);
console.log('Business days:', $env.BUSINESS_DAYS);

const businessDays = $env.BUSINESS_DAYS.split(',').map(d => parseInt(d));
const isBusinessDay = businessDays.includes(day);
const isBusinessHour = hour >= parseInt($env.BUSINESS_HOURS_START) && hour < parseInt($env.BUSINESS_HOURS_END);

console.log('Is business day?', isBusinessDay);
console.log('Is business hour?', isBusinessHour);
```

**Solutions:**
1. **Timezone mismatch:** Server timezone vs. clinic timezone
2. **Day indexing:** JavaScript uses 0=Sunday, verify .env uses same
3. **Hour boundaries:** Business hours should be 24-hour format

**Fix:**
```javascript
// Node 805 - Correct business hours check with timezone
const { DateTime } = require('luxon');

const clinicTime = DateTime.now().setZone($env.TIMEZONE);
const hour = clinicTime.hour;
const day = clinicTime.weekday; // Luxon: 1=Monday, 7=Sunday

// Convert .env business days to Luxon format
const businessDays = $env.BUSINESS_DAYS.split(',').map(d => {
  const dayNum = parseInt(d);
  return dayNum === 0 ? 7 : dayNum; // Convert Sunday from 0 to 7
});

const isBusinessDay = businessDays.includes(day);
const isBusinessHour = hour >= parseInt($env.BUSINESS_HOURS_START) &&
                        hour < parseInt($env.BUSINESS_HOURS_END);

const isAfterHours = !isBusinessDay || !isBusinessHour;

$json.is_after_hours = isAfterHours;
```

#### Issue 6: Duplicate Messages

**Symptoms:**
- Same message appears twice in logs
- Bot responds multiple times

**Diagnosis:**
```javascript
// Check for duplicate webhook calls
console.log('Message SID:', $json.metadata?.message_sid);
console.log('Message ID:', $json.message_id);

// Query log to check if message_id already exists
const existingLog = await queryLog($json.message_id);
if (existingLog) {
  console.log('DUPLICATE DETECTED:', $json.message_id);
}
```

**Solutions:**
1. **Webhook retries:** Platforms retry failed webhooks (Twilio retries if no 200 response)
2. **Missing deduplication:** Add deduplication check
3. **Timeout issues:** n8n timeout causes platform to retry

**Fix:**
```javascript
// Node 801 - Add deduplication check
const messageId = $json.MessageSid || $json.message_id || `${$json.From}_${Date.now()}`;

// Check if already processed (query log storage)
const isDuplicate = await checkIfProcessed(messageId);

if (isDuplicate) {
  return {
    skip: true,
    message: 'Duplicate message ignored',
    message_id: messageId
  };
}

// Continue processing
$json.message_id = messageId;
```

#### Issue 7: Slack Notifications Not Sending

**Symptoms:**
- Messages processed successfully but no Slack alert
- Slack returns 404 or invalid_payload error

**Diagnosis:**
```bash
# Test Slack webhook directly
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message from Aigent Module 08"}'

# Expected: "ok"
# Actual: "invalid_token" or "channel_not_found" = webhook misconfigured
```

**Solutions:**
1. **Webhook expired:** Regenerate webhook in Slack
2. **Channel deleted:** Verify #messages and #urgent channels exist
3. **Payload format:** Slack requires specific JSON structure
4. **Workspace mismatch:** Webhook created for different workspace

**Fix:**
```javascript
// Node 811 - Validate Slack payload before send
const slackPayload = {
  channel: $json.slack_channel || '#messages',
  username: 'Aigent Message Hub',
  text: 'New message received', // Fallback text required
  attachments: [{
    color: $json.color || '#36a64f',
    fields: [
      { title: 'From', value: $json.from, short: true },
      { title: 'Message', value: $json.message, short: false }
    ]
  }]
};

// Validate required fields
if (!slackPayload.text && !slackPayload.attachments) {
  throw new Error('Slack payload must have text or attachments');
}

return { json: slackPayload };
```

#### Issue 8: Email Messages Not Received

**Symptoms:**
- SendGrid Inbound Parse configured but emails not triggering workflow
- No errors in SendGrid or n8n logs

**Diagnosis:**
```bash
# Check SendGrid Inbound Parse settings
# Settings → Inbound Parse → Check webhook URL

# Test email send
# Send email to: test@inbound.yourclinic.com

# Check SendGrid Activity Feed
# https://app.sendgrid.com/email_activity

# Check n8n executions
# Should see webhook execution with email payload
```

**Solutions:**
1. **DNS not configured:** MX records must point to SendGrid
2. **Webhook URL wrong:** Must match n8n webhook exactly
3. **Domain verification:** Domain must be verified in SendGrid
4. **Spam folder:** Check if test emails in spam

**Fix:**
```bash
# Verify DNS configuration
nslookup -type=MX inbound.yourclinic.com

# Should return:
# inbound.yourclinic.com MX preference = 10, mail exchanger = mx.sendgrid.net

# If not configured:
# Add MX record in domain DNS:
# Type: MX
# Host: inbound.yourclinic.com
# Value: mx.sendgrid.net
# Priority: 10
```

---

## Security & Compliance

### HIPAA Compliance

Module 08 is designed with HIPAA compliance in mind, but **your implementation must ensure all components meet HIPAA requirements**.

#### PHI Protection Checklist

**Encryption:**
- [ ] **In Transit:** All webhooks use HTTPS (TLS 1.2+)
- [ ] **At Rest:** Google Sheets/Airtable with encryption enabled
- [ ] **Database:** PostgreSQL with encryption at rest
- [ ] **Attachments:** S3 bucket with server-side encryption (SSE)

**Access Controls:**
- [ ] n8n instance restricted to authorized IPs only
- [ ] CRM access via API keys with minimal permissions
- [ ] Google Sheets shared only with service account
- [ ] Slack channels private, member-access only

**Audit Logging:**
- [ ] All message access logged with timestamp, user, action
- [ ] Failed authentication attempts logged
- [ ] PHI access tracked in separate audit log

**Data Minimization:**
- [ ] PHI redaction enabled (`PHI_SAFE_MODE=true`)
- [ ] Only necessary fields stored in logs
- [ ] Conversation history limited to recent messages

**Business Associate Agreements (BAAs):**
- [ ] Twilio: [BAA signed](https://www.twilio.com/legal/hipaa-baa)
- [ ] SendGrid: [BAA signed](https://sendgrid.com/legal/hipaa)
- [ ] HubSpot: [BAA signed](https://legal.hubspot.com/dpa)
- [ ] AWS S3: [BAA signed](https://aws.amazon.com/compliance/hipaa-compliance/)
- [ ] n8n: Self-hosted or [BAA with n8n Cloud](https://n8n.io/legal/business-associate-agreement)

#### PHI Redaction Implementation

**Comprehensive redaction patterns:**
```javascript
// Node 826 - Before logging
function redactPHI(text) {
  if (!text) return text;

  let redacted = text;

  // SSN: 123-45-6789
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]');

  // SSN without dashes: 123456789
  redacted = redacted.replace(/\b\d{9}\b/g, '[SSN-REDACTED]');

  // Credit Card: 4111-1111-1111-1111 or 4111111111111111
  redacted = redacted.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CC-REDACTED]');

  // MRN: MRN: 12345678, MRN 12345678, MRN#12345678
  redacted = redacted.replace(/MRN[:\s#]*\d+/gi, '[MRN-REDACTED]');

  // Date of Birth: MM/DD/YYYY, MM-DD-YYYY
  redacted = redacted.replace(/\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/g, '[DOB-REDACTED]');

  // Medicare/Medicaid ID: 1AB2-CD3-EF45
  redacted = redacted.replace(/\b\d[A-Z]{2}\d-[A-Z]{2}\d-[A-Z]{2}\d{2}\b/g, '[MEDICARE-REDACTED]');

  // Diagnosis codes: ICD-10 (A00.0)
  redacted = redacted.replace(/\b[A-Z]\d{2}\.\d{1,2}\b/g, '[ICD-REDACTED]');

  // Prescription info: "taking Lisinopril 10mg"
  // (optional - may be too aggressive)
  // redacted = redacted.replace(/\b\w+(opril|prazole|statin|cillin)\s+\d+\s*mg\b/gi, '[RX-REDACTED]');

  return redacted;
}

// Apply to all logged fields
const safeMessage = redactPHI($json.message);
const safeBotResponse = redactPHI($json.bot_response?.message);
const safeHumanResponse = redactPHI($json.human_response);

$json.message_logged = safeMessage;
$json.bot_response_logged = safeBotResponse;
$json.human_response_logged = safeHumanResponse;
```

### Webhook Security

**Verify webhook signatures** to prevent unauthorized access.

#### Twilio Signature Verification

**Node 801 - Validate Twilio Webhook:**
```javascript
const crypto = require('crypto');

function validateTwilioSignature(url, params, signature) {
  const authToken = $env.TWILIO_AUTH_TOKEN;

  // Create data string
  let data = url;
  Object.keys(params).sort().forEach(key => {
    data += key + params[key];
  });

  // Create signature
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');

  return signature === expectedSignature;
}

// Check signature
const twilioSignature = $json.headers['x-twilio-signature'];
const url = `https://your-n8n.com${$json.webhookUrl}`;
const params = $json.body;

const isValid = validateTwilioSignature(url, params, twilioSignature);

if (!isValid && $env.DEBUG_MODE !== 'true') {
  throw new Error('Invalid Twilio signature - webhook rejected');
}
```

#### SendGrid Signature Verification

**Node 801 - Validate SendGrid Webhook:**
```javascript
const crypto = require('crypto');

function validateSendGridSignature(publicKey, payload, signature, timestamp) {
  const timestampedPayload = timestamp + payload;

  const verifier = crypto.createVerify('sha256');
  verifier.update(timestampedPayload);

  return verifier.verify(publicKey, signature, 'base64');
}

const sendgridSignature = $json.headers['x-twilio-email-event-webhook-signature'];
const sendgridTimestamp = $json.headers['x-twilio-email-event-webhook-timestamp'];
const payload = JSON.stringify($json.body);
const publicKey = $env.SENDGRID_WEBHOOK_PUBLIC_KEY; // Get from SendGrid settings

const isValid = validateSendGridSignature(publicKey, payload, sendgridSignature, sendgridTimestamp);

if (!isValid) {
  throw new Error('Invalid SendGrid signature - webhook rejected');
}
```

### Data Retention Policies

**Automatically delete old messages** per retention policy.

**Archive and Delete Workflow (Scheduled: Monthly):**
```javascript
// Node 1: Calculate retention date
const retentionDays = parseInt($env.MESSAGE_RETENTION_DAYS) || 365;
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

return { cutoffDate: cutoffDate.toISOString() };

// Node 2: Export to archive (S3/Google Drive)
const archiveData = await queryMessages({
  timestamp_before: $json.cutoffDate
});

await uploadToArchive('message_archive_' + new Date().toISOString() + '.json', archiveData);

// Node 3: Delete from primary storage
if ($env.LOG_STORAGE === 'postgres') {
  await executeSQL(`
    DELETE FROM messages
    WHERE timestamp < $1
  `, [$json.cutoffDate]);
} else if ($env.LOG_STORAGE === 'sheets') {
  // Archive to separate tab, delete from Messages tab
  await moveToArchiveTab($json.cutoffDate);
}

// Node 4: Log retention action
await logAudit({
  action: 'message_retention_cleanup',
  deleted_count: archiveData.length,
  cutoff_date: $json.cutoffDate,
  performed_by: 'system',
  timestamp: new Date().toISOString()
});
```

### Rate Limiting & DDoS Protection

**Prevent abuse and spam:**
```javascript
// Node 802 - Rate Limit Check
const rateLimit = parseInt($env.RATE_LIMIT_MAX_PER_HOUR) || 10;
const from = $json.from;

// Query recent messages from this contact (last hour)
const oneHourAgo = new Date();
oneHourAgo.setHours(oneHourAgo.getHours() - 1);

const recentCount = await queryMessageCount({
  from: from,
  timestamp_after: oneHourAgo.toISOString()
});

if (recentCount >= rateLimit && $env.RATE_LIMIT_ENABLED === 'true') {
  // Send rate limit warning (once)
  if (recentCount === rateLimit) {
    await sendMessage(from, `You've reached the message limit (${rateLimit}/hour). Please try again later or call us at ${$env.CLINIC_PHONE} for urgent matters.`);
  }

  throw new Error(`Rate limit exceeded: ${recentCount} messages in last hour`);
}

return { recent_count: recentCount };
```

---

## Analytics Integration

Module 08 exports message metrics to **Module 07 (Analytics Hub)** for comprehensive reporting.

### Metrics Tracked

**Message Volume:**
- Total messages received (by channel, by hour, by day)
- Inbound vs outbound message counts
- Peak messaging times

**Response Performance:**
- Average response time (bot + human)
- Bot vs human response distribution
- First response time

**Bot Performance:**
- Bot confidence scores (average, distribution)
- Bot accuracy (thumbs up/down from patients)
- Escalation rate (low confidence → human)

**Intent Distribution:**
- Message count by intent (booking, billing, urgent, support, general)
- Intent trends over time

**Channel Distribution:**
- Messages by channel (SMS, WhatsApp, Email, Telegram, Webchat)
- Channel preferences by patient

**Conversation Quality:**
- Thread length (messages per conversation)
- Thread duration (time to resolution)
- Urgent message frequency

### Export to Module 07

**Configure .env:**
```bash
EXPORT_TO_ANALYTICS_MODULE=true
MODULE_07_WEBHOOK=https://n8n.instance.com/webhook/aigent-analytics-ingest
ANALYTICS_EXPORT_FREQUENCY=hourly
```

**Scheduled Export Workflow:**
```javascript
// Workflow: "Module 08 → Module 07 Analytics Export"
// Schedule: Every hour at :00

// Node 1: Aggregate metrics
const lastExport = await getLastExportTimestamp();
const currentTime = new Date().toISOString();

const metrics = await aggregateMetrics(lastExport, currentTime);

// Node 2: Format for Module 07
const analyticsPayload = {
  module: 'module_08_messaging',
  timestamp: currentTime,
  period_start: lastExport,
  period_end: currentTime,
  metrics: {
    message_volume: {
      total: metrics.total_messages,
      by_channel: metrics.by_channel,
      inbound: metrics.inbound_count,
      outbound: metrics.outbound_count
    },
    response_performance: {
      avg_response_time_seconds: metrics.avg_response_time,
      bot_response_count: metrics.bot_responses,
      human_response_count: metrics.human_responses
    },
    bot_performance: {
      avg_confidence: metrics.avg_bot_confidence,
      escalation_rate: metrics.escalation_rate,
      total_bot_handled: metrics.bot_handled
    },
    intent_distribution: metrics.intent_counts,
    channel_distribution: metrics.channel_counts,
    conversation_quality: {
      avg_thread_length: metrics.avg_messages_per_thread,
      avg_thread_duration_hours: metrics.avg_thread_duration,
      urgent_count: metrics.urgent_messages
    }
  },
  top_intents: metrics.top_intents,
  top_urgent_keywords: metrics.top_urgent_keywords
};

// Node 3: POST to Module 07
await this.helpers.request({
  method: 'POST',
  url: $env.MODULE_07_WEBHOOK,
  body: analyticsPayload,
  json: true
});

// Node 4: Update last export timestamp
await saveLastExportTimestamp(currentTime);
```

### Real-Time Dashboards

**Google Sheets Analytics Tab Formulas:**
```
// Sheet: Analytics (auto-updated from Messages tab)

A1: Metric
B1: Value
C1: Period

A2: Total Messages
B2: =COUNTA(Messages!A:A)-1

A3: Today's Messages
B3: =COUNTIF(Messages!B:B,">="&TODAY())

A4: Urgent Messages
B4: =COUNTIF(Messages!K:K,"TRUE")

A5: Avg Bot Confidence
B5: =AVERAGE(Messages!O:O)

A6: SMS Count
B6: =COUNTIF(Messages!C:C,"sms")

A7: WhatsApp Count
B7: =COUNTIF(Messages!C:C,"whatsapp")

A8: Email Count
B8: =COUNTIF(Messages!C:C,"email")

// Chart: Messages by Hour (Pivot Table)
// Rows: HOUR(timestamp)
// Values: COUNT(message_id)
```

**Airtable Dashboard Views:**
```
1. "Today's Messages" - Filter: timestamp is today
2. "Urgent Messages" - Filter: is_urgent = TRUE
3. "Needs Response" - Filter: bot_confidence < 0.8, human_response is empty
4. "By Channel" - Group by: channel
5. "By Intent" - Group by: intent
```

### Custom Analytics Queries

**PostgreSQL Analytics Queries:**
```sql
-- Messages by hour (last 24h)
SELECT
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) as message_count,
  channel
FROM messages
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY hour, channel
ORDER BY hour DESC;

-- Bot performance
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE bot_response IS NOT NULL) as bot_handled,
  AVG(bot_confidence) FILTER (WHERE bot_confidence IS NOT NULL) as avg_confidence,
  COUNT(*) FILTER (WHERE bot_confidence < 0.8) as escalated
FROM messages
GROUP BY date
ORDER BY date DESC;

-- Top intents this week
SELECT
  intent,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM messages
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY intent
ORDER BY count DESC;

-- Response time distribution
SELECT
  CASE
    WHEN response_time_seconds < 60 THEN '< 1 min'
    WHEN response_time_seconds < 300 THEN '1-5 min'
    WHEN response_time_seconds < 900 THEN '5-15 min'
    WHEN response_time_seconds < 3600 THEN '15-60 min'
    ELSE '> 1 hour'
  END as response_time_bucket,
  COUNT(*) as count
FROM messages
WHERE response_time_seconds IS NOT NULL
GROUP BY response_time_bucket
ORDER BY MIN(response_time_seconds);

-- Busiest contacts
SELECT
  contact_name,
  contact_id,
  COUNT(*) as message_count,
  MAX(timestamp) as last_message,
  BOOL_OR(is_urgent) as had_urgent
FROM messages
WHERE contact_id IS NOT NULL
GROUP BY contact_name, contact_id
ORDER BY message_count DESC
LIMIT 20;
```

---

## Migration & Deployment

### Production Deployment Checklist

**Infrastructure:**
- [ ] n8n instance: Production-ready (minimum 2GB RAM, HTTPS enabled)
- [ ] Database: PostgreSQL configured with backups (if using DB logging)
- [ ] Domain: Custom domain with SSL certificate
- [ ] Monitoring: Uptime monitoring configured (UptimeRobot, Pingdom)

**Credentials:**
- [ ] Twilio: Production credentials (not test mode)
- [ ] SendGrid: Production API key with Inbound Parse enabled
- [ ] CRM: Production API keys with proper permissions
- [ ] Bot: Production bot instance (not development)
- [ ] Storage: Production Google Sheets / Airtable / S3

**Webhook Configuration:**
- [ ] Twilio SMS webhook: Production URL configured
- [ ] Twilio WhatsApp webhook: Production URL configured
- [ ] SendGrid Inbound Parse: MX records verified
- [ ] Telegram Bot: Webhook set via setWebhook API
- [ ] All webhooks using HTTPS

**Testing:**
- [ ] Full test matrix completed (20+ tests)
- [ ] Load testing: 100+ concurrent messages handled
- [ ] Error handling: All edge cases tested
- [ ] PHI redaction: Verified working

**Compliance:**
- [ ] BAAs signed with all vendors
- [ ] HIPAA security checklist completed
- [ ] Data retention policy configured
- [ ] Audit logging enabled

**Monitoring:**
- [ ] Error alerts: Webhook to ops channel
- [ ] Performance monitoring: Response time tracking
- [ ] Log rotation: Automatic archival configured

### Phone Number Verification

**Twilio Phone Number Setup:**
```bash
# 1. Purchase phone number
# Twilio Console → Phone Numbers → Buy a Number
# Select: SMS + MMS capable
# Select: Voice capable (optional)

# 2. Configure webhooks
# Phone Number → Messaging
# - A MESSAGE COMES IN: https://your-n8n.com/webhook/aigent-message-hub (HTTP POST)

# 3. WhatsApp enablement
# Twilio Console → Messaging → Try it Out → Try WhatsApp
# - Follow steps to request WhatsApp sender approval
# - Configure webhook same as SMS

# 4. Test messages
curl -X POST https://api.twilio.com/2010-04-01/Accounts/AC.../Messages.json \
  -u "AC...:auth_token" \
  -d "From=+15557654321" \
  -d "To=+15551234567" \
  -d "Body=Test from Aigent Module 08"
```

### Scaling Considerations

**For clinics with >10,000 messages/month:**

1. **Use PostgreSQL** instead of Google Sheets for logging
2. **Enable message queue** (Redis) for async processing
3. **Horizontal scaling:** Deploy multiple n8n instances with load balancer
4. **CDN for attachments:** CloudFront in front of S3
5. **Database read replicas:** For analytics queries
6. **Separate bot instance:** Dedicated server for AIgent bot
7. **Rate limiting:** Implement at webhook level (Nginx/Cloudflare)

**n8n Queue Mode Configuration:**
```bash
# .env for n8n
N8N_QUEUE_MODE=true
N8N_REDIS_HOST=redis
N8N_REDIS_PORT=6379
N8N_WORKERS=5
```

---

## Appendix

### Environment Variable Reference

**Complete list of all 150+ variables** - see [`.env.aigent_module_08_example`](.env.aigent_module_08_example) for full documentation.

### API Rate Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Twilio SMS | 100 msg/sec per account | Burst: 1000/sec |
| Twilio WhatsApp | 80 msg/sec per sender | Business tier |
| SendGrid | 600 emails/sec | Varies by plan |
| HubSpot API | 100 req/10sec | 150,000/day |
| Salesforce API | 100 req/20sec | Varies by license |
| Telegram Bot | 30 msg/sec per chat | 20 different chats |
| Google Sheets | 100 req/100sec/user | Read: 500 req/100sec |

### Support & Community

**Documentation:**
- n8n Documentation: https://docs.n8n.io
- Twilio Docs: https://www.twilio.com/docs
- SendGrid Docs: https://docs.sendgrid.com

**Community:**
- n8n Forum: https://community.n8n.io
- Aigent GitHub: https://github.com/your-repo/aigent-modules

**Commercial Support:**
- Aigent Pro Support: support@aigent.com
- Implementation Services: Contact for custom deployment

---

**End of Module 08 Documentation**

*Version 1.0.0 - Last Updated: 2025-01-15*