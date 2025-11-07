# Module 08 Core: Messaging Omnichannel

**Version:** core-1.0.0
**Branch:** Core (SMB-Ready, Non-PHI)
**Target Users:** Service providers, wellness centers, salons, gyms, event organizers, small businesses

---

## Purpose

Unified messaging workflow that routes messages through either email or SMS channels. Single webhook endpoint handles both channels with simple parameter-based routing. Perfect for appointment reminders, notifications, and customer communications.

**NOT FOR:** High-volume marketing campaigns or HIPAA-compliant messaging (use Enterprise or dedicated platforms)

---

## Features

✅ **Included (Core)**
- Unified messaging endpoint (single webhook)
- Channel routing (email OR sms)
- SendGrid email delivery
- Twilio SMS delivery
- Message validation (3 required fields)
- Google Sheets delivery logging
- Trace ID tracking
- Retry logic (2 attempts per channel)
- Non-blocking error handling

❌ **Removed (Enterprise Only)**
- WhatsApp integration
- Multi-channel broadcast (send to ALL channels simultaneously)
- Message templates with variables
- Rich media support (images, attachments)
- Read receipts & delivery confirmations
- Two-way messaging (replies)
- Scheduled message delivery
- Message queuing for throttling
- SMS link shortening
- Unsubscribe management
- Contact preference storage
- Message history per contact
- PHI masking for HIPAA compliance
- Priority routing
- Fallback channel logic (email fails → try SMS)

---

## Data Flow

```
Webhook → Metadata → Validate → Route by Channel → [Email OR SMS] → Log → Success
             ↓
           Error (400)
```

**Execution Time:** ~700ms average (SendGrid/Twilio latency)

---

## Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `recipient` | string | Email address OR phone number |
| `channel` | string | "email" or "sms" |
| `message` | string | Not empty |

**Optional Fields:**
- None (minimal configuration)

---

## Setup Instructions

### 1. Import Workflow
- Import `module_08_core.json` to n8n

### 2. Email Setup: SendGrid (REQUIRED for email channel)

**Skip if only using SMS.**

1. **Create SendGrid Account:** https://sendgrid.com/pricing
2. **Verify Sender Email:** Settings → Sender Authentication
3. **Create API Key:** Settings → API Keys → Create (Mail Send permission)
4. **Add to n8n:**
   - Settings → Credentials → SendGrid API
   - Paste API key
   - Save

**Cost:** Free tier (100 emails/day), Essentials $19.95/month (40,000 emails)

### 3. SMS Setup: Twilio (REQUIRED for sms channel)

**Skip if only using email.**

1. **Create Twilio Account:** https://www.twilio.com/try-twilio
   - Free trial: $15 credit (test SMS)
   - Production: Pay-as-you-go

2. **Get Phone Number:**
   - Console → Phone Numbers → Buy a Number
   - Cost: $1.50/month for US number

3. **Get Credentials:**
   - Console → Account → Account SID
   - Console → Account → Auth Token

4. **Add to n8n:**
   - Settings → Credentials → Twilio API
   - Enter Account SID, Auth Token
   - Save

**Cost:**
- Phone number: $1.50/month
- SMS: $0.0079/message (US domestic)

### 4. Connect Google Sheets

Create sheet with columns:
```
timestamp | message_id | recipient | channel | status
```

### 5. Set Variables

**Required (depends on channels used):**
```bash
GOOGLE_SHEET_ID="your-sheet-id"
SENDGRID_FROM_EMAIL="hello@yourbusiness.com"  # If using email
TWILIO_FROM_NUMBER="+15551234567"             # If using SMS
```

**Optional:**
```bash
GOOGLE_SHEET_TAB="Messages"
CLINIC_NAME="Your Business Name"
```

### 6. Test Email Channel

```bash
curl -X POST https://your-n8n-instance/webhook/send-message \
  -H 'Content-Type: application/json' \
  -d '{
    "recipient": "test@example.com",
    "channel": "email",
    "message": "This is a test email from Module 08!"
  }'
```

### 7. Test SMS Channel

```bash
curl -X POST https://your-n8n-instance/webhook/send-message \
  -H 'Content-Type: application/json' \
  -d '{
    "recipient": "+15559876543",
    "channel": "sms",
    "message": "This is a test SMS from Module 08!"
  }'
```

**Important:** Phone numbers must be in E.164 format: `+[country code][number]`
- US example: `+15551234567`
- UK example: `+447911123456`

### 8. Activate
- Toggle workflow to "Active"
- Test both channels before production use
- Monitor SendGrid Activity and Twilio logs

---

## Response Examples

### Success (200)
```json
{
  "success": true,
  "message_id": "MSG-1730851234567",
  "status": "delivered",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Provide recipient, channel (email|sms), and message",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Channel Error (500 - SendGrid/Twilio failure)
```json
{
  "success": false,
  "error": "Failed to send message via SMS",
  "details": "Twilio error: Invalid phone number format",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

---

## Channel Details

### Email Channel (SendGrid)

**Requirements:**
- SendGrid credential configured
- `SENDGRID_FROM_EMAIL` variable set
- Sender email verified in SendGrid

**Message Format:**
- **Subject:** "Message from {CLINIC_NAME}"
- **Body:** Plain text (message parameter)
- **From:** SENDGRID_FROM_EMAIL
- **To:** recipient parameter

**Delivery Time:** Typically 1-5 seconds

**Tracking:**
- SendGrid Activity Feed: https://app.sendgrid.com/email_activity
- Shows: Delivered, Opened, Bounced, Dropped

**Best For:**
- Detailed messages (no character limit)
- Appointment confirmations
- Receipts & invoices
- Follow-up surveys

### SMS Channel (Twilio)

**Requirements:**
- Twilio credential configured
- `TWILIO_FROM_NUMBER` variable set
- Active Twilio phone number

**Message Format:**
- **Body:** Plain text (message parameter)
- **From:** TWILIO_FROM_NUMBER
- **To:** recipient parameter

**Character Limits:**
- 160 characters = 1 SMS
- 161-306 characters = 2 SMS (charged as 2)
- 307-459 characters = 3 SMS (charged as 3)

**Delivery Time:** Typically 1-10 seconds

**Tracking:**
- Twilio Console: https://console.twilio.com/monitor/logs/sms
- Shows: Queued, Sent, Delivered, Failed

**Best For:**
- Urgent notifications
- Time-sensitive reminders
- Quick updates
- Customers who don't check email

---

## Routing Logic

**Simple if/else routing:**
```javascript
if (channel === "email") {
  → Send Email node
} else {
  → Send SMS node
}
```

**Important:** Core does NOT validate recipient format per channel.
- Email channel with phone number → SendGrid error
- SMS channel with email address → Twilio error

**Recommendation:** Validate recipient format before calling webhook (client-side).

---

## Integration with Other Modules

### Module 02 (Consult Booking)

**Flow:** Booking Confirmed (M02) → Reminder SMS (M08)

**Use Case:** Send appointment reminder 24 hours before

**Data Passed:**
```json
{
  "recipient": "+15559876543",
  "channel": "sms",
  "message": "Reminder: Your appointment is tomorrow at 2pm. See you then!"
}
```

**Automation:**
- Create n8n workflow: "24h before booking" → trigger M08

### Module 03 (Telehealth Session)

**Flow:** Session Created (M03) → Send Meeting Link (M08)

**Use Case:** Deliver video meeting URL via SMS or email

**Data Passed:**
```json
{
  "recipient": "patient@example.com",
  "channel": "email",
  "message": "Your video session link: https://zoom.us/j/123456789. Join at 2pm today."
}
```

### Module 04 (Billing & Payments)

**Flow:** Payment Complete (M04) → Receipt Confirmation (M08)

**Use Case:** Send payment confirmation

**Data Passed:**
```json
{
  "recipient": "customer@example.com",
  "channel": "email",
  "message": "Payment received: $50.00. Thank you! Receipt: https://stripe.com/receipts/abc123"
}
```

### Module 05 (Follow-up)

**Flow:** Campaign (M05) → Individual Message (M08)

**Use Case:** M05 handles batch emails, M08 handles one-off urgent messages

**Distinction:**
- M05: Batch campaigns (50+ recipients)
- M08: One-off messages (1 recipient, urgent)

---

## Use Cases

### ✅ Perfect For

**Appointment Reminders:**
- SMS: "Reminder: Your appointment is tomorrow at 2pm"
- Email: Detailed confirmation with location, instructions

**Order Confirmations:**
- Email: Full receipt, invoice, tracking info
- SMS: "Order #12345 confirmed! Arrives Friday."

**Status Updates:**
- SMS: "Your order is ready for pickup!"
- Email: "Your document has been processed"

**Urgent Notifications:**
- SMS: "Your appointment has been rescheduled to 3pm"
- Email: "Important update regarding your booking"

**Customer Service:**
- Email: Detailed responses to inquiries
- SMS: Quick updates ("We'll call you in 10 minutes")

**Event Reminders:**
- SMS: "Workshop starts in 1 hour! Address: 123 Main St"
- Email: Full event details, agenda, parking info

### ❌ Not Suitable For

- Bulk marketing campaigns (use M05 or dedicated platform)
- Multi-recipient broadcasts (use M05)
- WhatsApp messaging (use Enterprise)
- Two-way conversations (use dedicated platform)
- HIPAA-compliant messaging (use Enterprise)
- Rich media (images, attachments) (use Enterprise)
- Scheduled messages (use Enterprise or n8n Cron)
- High-volume (>100/day) (use Enterprise with queueing)

---

## Troubleshooting

### Email Not Sending (SendGrid)

**Issue:** "Invalid from email address"

**Solutions:**
1. **Verify sender email:**
   - SendGrid Dashboard → Settings → Sender Authentication
   - Email must be verified (check inbox for verification link)
2. **Check SENDGRID_FROM_EMAIL:**
   - Must match verified email exactly
   - Case-sensitive
3. **Free Gmail/Yahoo not allowed:**
   - SendGrid blocks free email providers
   - Use business domain email (e.g., hello@yourbusiness.com)

**Issue:** Email sent but not received

**Solutions:**
1. **Check SendGrid Activity:**
   - Dashboard → Email Activity → Search recipient
   - Status: Delivered, Bounced, Blocked?
2. **Spam folder:** Ask recipient to check spam/junk
3. **Invalid email address:** Verify recipient email format
4. **Bounced:** Hard bounce (invalid) vs soft bounce (full inbox)

### SMS Not Sending (Twilio)

**Issue:** "Invalid phone number format"

**Solutions:**
1. **Use E.164 format:**
   - Correct: `+15551234567`
   - Incorrect: `555-123-4567`, `(555) 123-4567`, `15551234567`
2. **Include country code:**
   - US: +1
   - UK: +44
   - Always include leading +
3. **Verify number is mobile:**
   - Twilio SMS requires mobile numbers (not landlines)

**Issue:** SMS sent but not received

**Solutions:**
1. **Check Twilio logs:**
   - Console → Monitor → Logs → SMS
   - Status: Queued, Sent, Delivered, Undelivered?
2. **Verify TWILIO_FROM_NUMBER:**
   - Must be your purchased Twilio number
   - Format: +15551234567
3. **Carrier blocking:**
   - Some carriers block short codes or unknown numbers
   - Ask recipient to whitelist your number
4. **Message too long:**
   - Keep under 160 characters for reliability
   - Long messages may be split/delayed

### Wrong Channel Used

**Issue:** SMS sent to email address (or vice versa)

**Cause:** Workflow doesn't validate recipient format, only checks if fields exist

**Solutions:**
1. **Client-side validation:**
   - Check recipient format before calling webhook
   - Email: regex `/^[\w.-]+@[\w.-]+\.\w+$/`
   - Phone: regex `/^\+\d{10,15}$/`
2. **Custom workflow modification:**
   - Add validation node after "Validate" node
   - Check recipient matches expected format for channel

### Sheets Not Updating

**Issue:** Messages sent but not logged

**Solutions:**
1. Verify GOOGLE_SHEET_ID correct
2. Check tab name = GOOGLE_SHEET_TAB (default: "Messages")
3. Ensure column headers match exactly
4. Review "Log to Sheets" node in execution logs
5. Check Google Sheets credential has write access

---

## Performance

| Metric | Email | SMS | Notes |
|--------|-------|-----|-------|
| **Avg Execution** | 700ms | 600ms | API latency |
| **P95 Execution** | 1200ms | 1000ms | |
| **Retry Attempts** | 2 | 2 | Auto-retry on fail |
| **Nodes** | 9 | 9 | Same workflow |

**Why Fast?**
- Single API call per message (SendGrid or Twilio)
- Parallel logging (non-blocking)
- Minimal validation

---

## Cost Analysis

### SendGrid (Email) Costs

| Plan | Cost | Emails/Month | Per-Email Cost |
|------|------|--------------|----------------|
| **Free** | $0 | 100/day (3,000/month) | $0 |
| **Essentials** | $19.95 | 40,000 | $0.0005 |
| **Pro** | $89.95 | 120,000 | $0.00075 |

**Example:**
- 500 emails/month → Free tier ✅
- 5,000 emails/month → Essentials ($19.95)
- 50,000 emails/month → Pro ($89.95)

### Twilio (SMS) Costs

| Component | Cost | Notes |
|-----------|------|-------|
| **Phone Number** | $1.50/month | One-time setup |
| **SMS (US domestic)** | $0.0079/message | Outbound |
| **SMS (US shortcode)** | $0.01/message | Higher deliverability |
| **SMS (international)** | Varies | UK: $0.04, AUS: $0.07 |

**Example:**
- 100 SMS/month: $1.50 + (100 × $0.0079) = $2.29/month
- 500 SMS/month: $1.50 + (500 × $0.0079) = $5.45/month
- 1,000 SMS/month: $1.50 + (1,000 × $0.0079) = $9.40/month

**Character Count Impact:**
```
Message: "Reminder: Appointment at 2pm tomorrow" (40 chars)
Cost: $0.0079 (1 SMS)

Message: "Reminder: Your appointment is scheduled for tomorrow at 2:00pm. Please arrive 10 minutes early and bring your ID. Call 555-1234 with questions." (160 chars)
Cost: $0.0079 (1 SMS)

Message: "Reminder: Your appointment is scheduled for tomorrow at 2:00pm. Please arrive 10 minutes early and bring your ID, insurance card, and completed forms. Call 555-1234 with questions or visit example.com/faq" (210 chars)
Cost: $0.0158 (2 SMS)
```

### Combined Monthly Cost (Example)

**Scenario: 200 emails + 100 SMS/month**

| Component | Cost |
|-----------|------|
| SendGrid Free | $0 |
| Twilio Phone | $1.50 |
| 100 SMS | $0.79 |
| n8n Cloud | $20 |
| Google Sheets | Free |
| **Total** | **$22.29/month** |

---

## Message Best Practices

### SMS Best Practices

**Keep it Short:**
- 160 characters or less (1 SMS unit)
- Get to the point quickly

**Include Essentials:**
- Who (business name)
- What (appointment, order, etc.)
- When (date, time)
- Action (if needed)

**Good Example:**
```
Reminder: Your salon appointment is tomorrow at 2pm. Reply CANCEL to reschedule. - Style Studio
```

**Bad Example (too long):**
```
Hello! This is a friendly reminder that you have an upcoming appointment with us at our beautiful new location downtown tomorrow afternoon at 2:00pm. We look forward to seeing you and providing excellent service! Please let us know if you have any questions or need to reschedule. Thank you for choosing us!
```
(280 characters = 2 SMS = double cost)

### Email Best Practices

**Subject Line:**
- Default: "Message from {CLINIC_NAME}"
- Custom subjects not supported in Core (use Enterprise)

**Message Body:**
- No character limit
- Plain text only (HTML not supported in Core)
- Include full details
- Add links for more info

**Good Example:**
```
Hi Sarah,

Your appointment is confirmed for November 20, 2025 at 2:00pm.

Location: 123 Main St, Suite 100
Service: 60-Minute Massage
Provider: Jane Smith

Need to reschedule? Reply to this email or call 555-1234.

Best regards,
Wellness Spa
```

### Phone Number Formatting

**Always Use E.164 Format:**
```
Correct:
+15551234567 (US)
+442071234567 (UK)
+61412345678 (Australia)

Incorrect:
555-123-4567
(555) 123-4567
15551234567 (missing +)
```

**Conversion Examples:**
- US (555) 123-4567 → +15551234567
- UK 020 7123 4567 → +442071234567
- Remove spaces, dashes, parentheses
- Add + and country code

---

## Compliance & Legal

### CAN-SPAM (Email)

**Requirements:**
1. **Truthful subject lines** (not deceptive)
2. **Identify as advertisement** (if marketing)
3. **Include physical address** (not enforced in Core - add manually)
4. **Provide opt-out method** (e.g., "Reply STOP")
5. **Honor opt-outs within 10 days**

**Core Limitation:** No built-in unsubscribe management (manual process)

### TCPA (SMS)

**Requirements:**
1. **Prior express consent** (customer opted in)
2. **Opt-out method** ("Reply STOP to unsubscribe")
3. **Identify sender** (business name)
4. **Honor opt-outs immediately**

**Core Limitation:** No two-way messaging, no automated opt-out handling

**Recommendation:** Only send SMS to customers who explicitly agreed (checkbox, verbal consent)

### HIPAA (Healthcare)

**Core is NOT HIPAA-compliant:**
- No PHI masking
- No encryption beyond standard HTTPS
- No BAA with SendGrid/Twilio (requires special plans)

**If Healthcare Practice:**
- Don't include PHI in messages (names, DOB, diagnoses)
- Use generic messages: "Appointment reminder" (not "Therapy appointment")
- Upgrade to Enterprise for HIPAA compliance

---

## Upgrade to Enterprise

**When to Upgrade:**
- Need WhatsApp integration
- Need multi-channel broadcast (send to ALL channels)
- Need rich media (images, PDFs, attachments)
- Need message templates with variables
- Need scheduled delivery
- Need two-way messaging (handle replies)
- Need read receipts & delivery confirmations
- Need HIPAA compliance
- Need unsubscribe management
- Need contact preferences (email vs SMS per user)
- Need fallback logic (email fails → try SMS)
- Need high-volume queueing (>100/day)
- Need SMS link shortening
- Need priority routing

**Enterprise Additions:**
- ✅ WhatsApp Business API
- ✅ Multi-channel broadcast
- ✅ Rich media support
- ✅ Template engine with variables
- ✅ Scheduled message delivery
- ✅ Two-way messaging handling
- ✅ Read receipts
- ✅ HIPAA-compliant messaging
- ✅ Unsubscribe management
- ✅ Contact preference storage
- ✅ Fallback channel logic
- ✅ Message queueing
- ✅ Link shortening
- ✅ Priority routing

**Migration Steps:**
1. Export message logs from Core Sheets
2. Import `module_08_enterprise.json`
3. Configure additional channels (WhatsApp)
4. Set up templates
5. Configure contact preferences
6. Test in parallel
7. Switch webhook URLs
8. Deactivate Core version

---

## Support

### Documentation
- **Core Guide:** This file
- **SendGrid Docs:** https://docs.sendgrid.com
- **Twilio Docs:** https://www.twilio.com/docs/sms
- **E.164 Format:** https://www.twilio.com/docs/glossary/what-e164

### Community
- **Forum:** https://community.aigent.company
- **GitHub:** https://github.com/aigent/modules/issues
- **SendGrid Support:** https://support.sendgrid.com
- **Twilio Support:** https://support.twilio.com

---

## License

MIT License (Open Source)

---

**Version:** core-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 07: Analytics Dashboard](module_07_README.md)
**Next Module:** [Module 09: Compliance & Audit](module_09_README.md)
