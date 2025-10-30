# Aigent Module 08 – Messaging Omnichannel Hub Build Notes (v1.1 Enhanced)

**Document Version:** 1.1.0-enhanced
**Workflow Version:** 1.1.0-enhanced
**Author:** Aigent Automation Engineering
**Created:** 2025-10-30
**Module:** 08 - Messaging Omnichannel Hub
**Purpose:** Technical documentation for unified messaging system

---

## Executive Summary

Module 08 is a **unified messaging hub** that normalizes inbound communications from 5+ channels (SMS, WhatsApp, Email, Telegram, Webchat), classifies intent (booking/billing/urgent/support), and generates intelligent auto-responses. It provides 24/7 patient communication with after-hours handling and urgent message escalation.

**Key Capabilities:**
1. **Multi-Channel Normalization:** Twilio SMS, WhatsApp, SendGrid Email, Telegram, Webchat → unified schema
2. **Intent Classification:** Keyword-based detection (booking, billing, urgent, support, general)
3. **Priority Detection:** Urgent vs. normal with emergency escalation
4. **Business Hours Awareness:** Different responses for business hours vs. after-hours
5. **Auto-Response Generation:** Intent-specific responses with AIgent Bot integration framework
6. **Channel Routing:** Send response via original channel (SMS→SMS, Email→Email)
7. **CRM Integration:** Log all conversations to HubSpot (production expansion)

**PHI Level:** HIGH (patient messages may contain health information)

---

## Key Enhancements

### 1. Universal Message Normalization

**Supported Channels:**
- **Twilio SMS:** MessageSid, From, To, Body
- **Twilio WhatsApp:** whatsapp:+number format
- **SendGrid Inbound Parse:** from, to, subject, text/html
- **Telegram Bot:** message.from, message.text
- **Webchat:** visitor_id, message, session_id

**Normalized Schema:**
```json
{
  "trace_id": "MSG-1730217600000",
  "channel": "sms",
  "direction": "inbound",
  "from": "+15551234567",
  "to": "+15559876543",
  "message": "I need to reschedule my appointment",
  "timestamp": "2025-10-30T14:00:00Z",
  "metadata": {
    "message_sid": "SM123abc",
    "from_city": "New York",
    "from_state": "NY"
  }
}
```

### 2. Intent Classification

**Intents Detected:**
- `booking` - Keywords: book, schedule, appointment, reschedule, cancel
- `billing` - Keywords: payment, bill, invoice, charge, insurance
- `urgent` - Keywords: urgent, emergency, pain, bleeding, severe, 911
- `support` - Keywords: question, help, info, hours, location
- `general` - Fallback for unmatched messages

**Priority Detection:**
```javascript
const urgentKeywords = ['urgent', 'emergency', 'pain', 'bleeding', 'severe'];
const priority = urgentKeywords.some(k => message.includes(k)) ? 'urgent' : 'normal';
```

### 3. Business Hours Awareness

```javascript
const currentHour = DateTime.now().setZone(timezone).hour;
const isBusinessHours = (
  currentDay >= 1 && currentDay <= 5 &&  // Mon-Fri
  currentHour >= 8 && currentHour < 18   // 8am-6pm
);
```

**Responses:**
- **Business Hours:** Intent-specific responses + "A team member will respond shortly"
- **After Hours:** "Office is currently closed. Hours: Mon-Fri 8am-6pm. We'll respond when we reopen."
- **Urgent (any time):** "We've received your urgent message and are alerting our staff immediately."

---

## Architecture

```
INBOUND MESSAGE (Any Channel)
  ↓
801: Webhook Trigger
  ↓
802: Normalize Format (Twilio/SendGrid/Telegram/Webchat → unified schema)
  ↓
803: Validation (channel whitelist, message length, spam check)
  ↓
804: Validation Router
  ↓
807: Classify Intent (booking/billing/urgent/support + priority detection)
  ↓
808: Generate Auto-Response (after-hours, urgent, intent-specific, AIgent Bot)
  ↓
809: Route to Channel (SMS→Twilio, Email→SendGrid, etc.)
  ↓
810: Send Response
  ↓
811: Log to CRM (HubSpot conversation timeline)
  ↓
812: Return Success
```

---

## Operations

### Daily Monitoring
- [ ] Review inbound message volume by channel
- [ ] Check urgent message response times (<5 min)
- [ ] Verify after-hours auto-responses working
- [ ] Review misclassified intents (adjust keywords)

### Configuration

```bash
# Business Hours
BUSINESS_HOURS_START=8     # 8 AM
BUSINESS_HOURS_END=18      # 6 PM
BUSINESS_HOURS_TEXT="Monday-Friday, 8am-6pm EST"
TIMEZONE=America/New_York

# Channels
ALLOWED_CHANNELS=sms,whatsapp,email,telegram,webchat

# AIgent Bot (optional)
AIGENT_BOT_ENABLED=false
AIGENT_BOT_ENDPOINT=https://bot.aigent.com/api/v1/chat

# Contact
CLINIC_NAME=Your Clinic
BOOKING_URL=https://clinic.com/book
BILLING_PHONE=+15551234567
```

---

## Troubleshooting

**Issue:** "Messages not normalizing"
- Check channel format matches expected (Twilio MessageSid, SendGrid from/to)
- Add debug logging to Node 802
- Verify webhook payloads

**Issue:** "Intent misclassified"
- Review keyword list in Node 807
- Add domain-specific keywords
- Consider ML-based classification (AIgent Bot)

**Issue:** "Responses not sending"
- Verify channel credentials (Twilio, SendGrid)
- Check rate limits (Twilio 1/sec default)
- Enable retry logic (2 attempts, 1s delay)

---

This completes Module 08 build notes.
