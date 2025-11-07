# Module 05 Core: Follow-up & Retention

**Version:** core-1.0.0
**Branch:** Core (SMB-Ready, Non-PHI)
**Target Users:** Service providers, wellness centers, coaches, retail businesses, event organizers

---

## Purpose

Sends batch email campaigns to multiple recipients for follow-ups, retention, and re-engagement. Processes recipients sequentially and logs delivery status. Perfect for small businesses sending newsletters, promotions, and reminders.

**NOT FOR:** Large-scale email marketing with advanced segmentation (use Enterprise or dedicated email platform)

---

## Features

✅ **Included (Core)**
- Batch email processing (sequential delivery)
- Simple variable substitution (`{name}` replacement)
- Campaign tracking via trace ID
- Per-recipient delivery logging
- Google Sheets campaign history
- Non-blocking failure handling
- Retry logic (2 attempts per email)
- SendGrid delivery reports

❌ **Removed (Enterprise Only)**
- Advanced email templates
- Dynamic personalization (first_name, last_name, custom fields)
- A/B testing
- Send time optimization
- Click/open tracking
- Unsubscribe management
- Audience segmentation
- Drip campaign automation
- SMS fallback delivery
- WhatsApp integration
- Multi-language support
- Conversion tracking analytics
- CRM integration for targeting

---

## Data Flow

```
Webhook → Validate → Split Recipients → Loop: [Send Email → Log Status] → Format Summary → Success
             ↓
           Error
```

**Execution Time:** ~500ms per recipient (sequential processing)

---

## Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `recipients` | array | not empty, valid email addresses |
| `subject` | string | not empty |
| `message` | string | not empty |

**Optional Fields:**
- None (minimal configuration for simplicity)

---

## Setup Instructions

### 1. Import Workflow
- Import `module_05_core.json` to n8n

### 2. Create SendGrid Account (REQUIRED)

**This module requires SendGrid for email delivery.**

1. **Sign up:** https://sendgrid.com/pricing (Free tier: 100 emails/day)
2. **Verify sender email:**
   - Settings → Sender Authentication
   - Verify single sender email (e.g., `hello@yourbusiness.com`)
3. **Create API Key:**
   - Settings → API Keys → Create API Key
   - Choose "Restricted Access" → Mail Send (Full Access)
   - Copy key (starts with `SG.`)
4. **Add to n8n:**
   - Settings → Credentials → New Credential
   - Type: "SendGrid API"
   - Paste API Key
   - Save

**Cost:**
- **Free:** 100 emails/day
- **Essentials:** $19.95/month (40,000 emails/month)
- **Pro:** $89.95/month (120,000 emails/month)

### 3. Connect Google Sheets

Create sheet with columns:
```
timestamp | campaign_id | recipient | subject | status
```

### 4. Set Variables

**Required:**
```bash
GOOGLE_SHEET_ID="your-sheet-id"
SENDGRID_FROM_EMAIL="hello@yourbusiness.com"  # Must be verified in SendGrid
```

**Optional:**
```bash
GOOGLE_SHEET_TAB="Campaigns"
CLINIC_NAME="Your Business Name"  # Used in email body
```

### 5. Test with Small Batch

```bash
curl -X POST https://your-n8n-instance/webhook/followup-campaign \
  -H 'Content-Type: application/json' \
  -d '{
    "recipients": [
      "test1@example.com",
      "test2@example.com"
    ],
    "subject": "Thank you for your visit!",
    "message": "Hi {name},\n\nThank you for visiting us. We hope to see you again soon!\n\nBest regards,\nThe Team"
  }'
```

### 6. Activate
- Toggle workflow to "Active"
- Start with small batches (<10 recipients)
- Monitor SendGrid Activity logs
- Scale up gradually

---

## Response Examples

### Success (200)
```json
{
  "success": true,
  "message": "Campaign sent successfully",
  "data": {
    "campaign_id": "CAMPAIGN-1730851234567",
    "total_recipients": 50,
    "sent": 48,
    "failed": 2
  },
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Missing required fields: recipients, subject, message",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

---

## Variable Substitution

### Supported Variables

**Core supports ONE variable:**
- `{name}` → Replaced with email username (part before @)

**Example:**
```
Email: sarah.johnson@example.com
Message: "Hi {name}, welcome!"
Result: "Hi sarah.johnson, welcome!"
```

**Limitations:**
- No first name/last name separation
- No custom variables (Enterprise only)
- Simple string replacement (case-sensitive)

### Example Usage

**Template:**
```
Subject: Thanks for your visit, {name}!

Hi {name},

Thank you for choosing our services. We hope you had a great experience!

If you have any feedback, reply to this email.

Best regards,
Your Business Name
```

**Sent to:** `jane@example.com`

**Result:**
```
Subject: Thanks for your visit, jane!

Hi jane,

Thank you for choosing our services. We hope you had a great experience!

If you have any feedback, reply to this email.

Best regards,
Your Business Name
```

---

## Integration with Other Modules

### Module 01 (Lead Capture)

**Flow:** New Lead (M01) → Welcome Email (M05)

**Option 1: Manual**
- Export leads from M01 Google Sheets
- Manually trigger M05 with lead emails

**Option 2: Automated**
- n8n workflow: "On new row in Leads sheet" → Call M05 webhook
- Send welcome series to new leads

### Module 02 (Consult Booking)

**Flow:** Booking Confirmed (M02) → Reminder Email (M05)

**Use Case:** Send appointment reminder 24 hours before session

**Data Passed:**
```json
{
  "recipients": ["patient@example.com"],
  "subject": "Appointment Reminder: Tomorrow at 2pm",
  "message": "Hi {name}, this is a reminder about your appointment tomorrow..."
}
```

### Module 04 (Billing)

**Flow:** Payment Complete (M04) → Thank You Email (M05)

**Use Case:** Send thank-you message after successful payment

### Module 03 (Telehealth)

**Flow:** Session Complete → Follow-up Survey (M05)

**Use Case:** Send post-session feedback request

---

## Campaign Ideas

### Welcome Series
**Trigger:** New lead from Module 01
**Template:**
```
Subject: Welcome to {CLINIC_NAME}!

Hi {name},

Welcome! We're excited to have you...
```

### Appointment Reminders
**Trigger:** 24h before booking (M02)
**Template:**
```
Subject: Reminder: Your appointment tomorrow

Hi {name},

This is a friendly reminder about your appointment...
```

### Re-engagement Campaign
**Trigger:** 30 days since last visit
**Template:**
```
Subject: We miss you, {name}!

Hi {name},

It's been a while since your last visit. We'd love to see you again...

[Special offer code]
```

### Thank You Notes
**Trigger:** After payment (M04)
**Template:**
```
Subject: Thank you for your payment

Hi {name},

Thank you for your recent payment. We appreciate your business...
```

### Event Invitations
**Trigger:** Manual/scheduled
**Template:**
```
Subject: You're invited: Special Workshop

Hi {name},

Join us for an exclusive workshop on...
```

---

## Troubleshooting

### SendGrid Errors

**Issue:** "API key not valid"

**Solutions:**
1. Verify SendGrid credential in n8n
2. Check API key hasn't expired
3. Ensure API key has "Mail Send" permission
4. Test API key directly:
   ```bash
   curl -X POST https://api.sendgrid.com/v3/mail/send \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "personalizations": [{"to": [{"email": "test@example.com"}]}],
       "from": {"email": "sender@example.com"},
       "subject": "Test",
       "content": [{"type": "text/plain", "value": "Test"}]
     }'
   ```

**Issue:** "Invalid from email address"

**Solutions:**
1. **Verify sender email** in SendGrid Dashboard:
   - Settings → Sender Authentication → Verify Single Sender
2. Check `SENDGRID_FROM_EMAIL` matches verified email exactly
3. Cannot use arbitrary email addresses (SendGrid enforces verification)

### Email Not Delivered

**Issue:** Campaign shows "sent" but recipient didn't receive

**Solutions:**
1. **Check SendGrid Activity:**
   - Dashboard → Activity → Search by recipient email
   - Status: Delivered, Bounced, Blocked, Dropped?
2. **Spam folder:** Ask recipient to check spam/junk
3. **Bounced emails:**
   - Hard bounce (invalid email) → Remove from list
   - Soft bounce (full inbox) → Retry later
4. **Blocked:**
   - Recipient previously unsubscribed
   - Email marked as spam by recipient
5. **Check recipient email validity:**
   - No typos
   - Domain exists (e.g., @gmial.com vs @gmail.com)

### Slow Sending

**Issue:** Campaign with 100 recipients takes too long

**Cause:** Sequential processing (one email at a time)

**Solutions:**
1. **Expected:** 500ms × 100 = 50 seconds (normal)
2. **Optimization (requires workflow edit):**
   - Change loop batch size to 10 (sends 10 at a time)
   - Reduces time to ~10 seconds
3. **Upgrade to Enterprise:**
   - Parallel processing
   - Bulk email API usage
   - 10x faster for large campaigns

### Variable Not Replaced

**Issue:** Email contains `{name}` literally

**Cause:** Variable substitution failed

**Solutions:**
1. **Check spelling:** Must be exactly `{name}` (case-sensitive)
2. **Review "Send Email" node:**
   - Variable replacement logic in message field
3. **Verify recipient email format:**
   - Must contain @ symbol
   - Username extracted from part before @

---

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Avg per Recipient** | 500ms | SendGrid API latency |
| **10 Recipients** | ~5 seconds | Sequential processing |
| **50 Recipients** | ~25 seconds | |
| **100 Recipients** | ~50 seconds | Recommended max |
| **Node Count** | 9 | Simple workflow |

**Scalability Limit:** Best for <100 recipients per campaign

**For Larger Campaigns:** Use Enterprise version (parallel processing) or dedicated email platform (Mailchimp, ConvertKit)

---

## Use Cases

### ✅ Perfect For
- Welcome emails for new leads
- Appointment reminders
- Post-visit thank-you notes
- Re-engagement campaigns (30-60 day inactive)
- Event invitations
- Workshop announcements
- Special offer notifications
- Feedback/survey requests
- Seasonal greetings
- Small newsletter lists (<100 subscribers)

### ❌ Not Suitable For
- Large email lists (>100 recipients) → Use Enterprise or Mailchimp
- Transactional emails (receipts, confirmations) → Use Module 03/04 email features
- Complex personalization (first/last name, custom fields) → Use Enterprise
- A/B testing → Use Enterprise
- Automated drip campaigns → Use Enterprise
- Unsubscribe management → Use dedicated platform
- Click tracking analytics → Use Enterprise

---

## Best Practices

### Email Content

1. **Keep it short:** 100-200 words max
2. **Clear call-to-action:** One primary action (book, reply, click)
3. **Personalize with {name}:** Makes emails feel less automated
4. **Mobile-friendly:** Most recipients read on mobile
5. **Include contact info:** Phone, email, website
6. **Avoid spam triggers:**
   - Don't use ALL CAPS
   - Avoid excessive punctuation!!!
   - No "Free", "Winner", "Act Now" spam words

### Sending Strategy

1. **Test first:** Send to yourself before full campaign
2. **Start small:** 10 recipients first batch
3. **Monitor delivery:** Check SendGrid Activity after first batch
4. **Timing matters:**
   - Best: Tuesday-Thursday, 10am-12pm local time
   - Avoid: Weekends, early morning, late night
5. **Frequency:** No more than 1-2 emails per week per recipient
6. **Clean list:** Remove bounced/invalid emails

### Compliance

1. **Include unsubscribe option:** Add "Reply STOP to unsubscribe" (manual process in Core)
2. **CAN-SPAM compliance:**
   - Include physical address (footer)
   - Accurate subject lines (no deception)
   - Honor opt-outs within 10 days
3. **GDPR (if applicable):**
   - Obtain consent before emailing (opt-in)
   - Provide unsubscribe mechanism
4. **Build trust:** Only email people who expect it

---

## Cost Analysis

### SendGrid Pricing Tiers

| Plan | Cost | Emails/Month | Notes |
|------|------|--------------|-------|
| **Free** | $0 | 3,000 (100/day) | Good for testing, small lists |
| **Essentials** | $19.95 | 40,000 | ~$0.0005/email |
| **Pro** | $89.95 | 120,000 | ~$0.00075/email |

### Example Costs

**Scenario 1: Weekly newsletter, 50 subscribers**
- 50 emails × 4 weeks = 200 emails/month
- **Plan:** Free tier ✅
- **Cost:** $0

**Scenario 2: Daily reminders, 30 clients**
- 30 emails × 30 days = 900 emails/month
- **Plan:** Free tier ✅
- **Cost:** $0

**Scenario 3: Bi-weekly campaign, 500 subscribers**
- 500 emails × 2 = 1,000 emails/month
- **Plan:** Free tier ✅
- **Cost:** $0

**Scenario 4: Weekly campaign, 2,000 subscribers**
- 2,000 emails × 4 = 8,000 emails/month
- **Plan:** Essentials ($19.95)
- **Cost:** $19.95/month

### Total Monthly Cost (Example)

| Component | Cost | Notes |
|-----------|------|-------|
| SendGrid | $19.95 | Essentials plan |
| n8n Cloud | $20 | Workflow hosting |
| Google Sheets | Free | Campaign logging |
| **Total** | **$39.95/month** | For up to 40k emails |

**Per-Email Cost:** ~$0.001 (0.1 cents)

---

## Upgrade to Enterprise

**When to Upgrade:**
- Need advanced personalization (first/last name, custom fields)
- Need A/B testing
- Need automated drip campaigns
- Need click/open tracking
- Need audience segmentation
- Need SMS/WhatsApp channels
- Need unsubscribe management
- Need >100 recipients per batch efficiently
- Need CRM integration for targeting

**Enterprise Additions:**
- ✅ Advanced email templates (drag-and-drop builder)
- ✅ Dynamic personalization engine
- ✅ A/B subject line testing
- ✅ Send time optimization (ML-powered)
- ✅ Click/open tracking analytics
- ✅ Automated drip sequences
- ✅ SMS fallback delivery
- ✅ WhatsApp integration
- ✅ Unsubscribe management
- ✅ List segmentation
- ✅ CRM integration (HubSpot, Salesforce)

**Migration Steps:**
1. Export campaign logs from Core Sheets
2. Import `module_05_enterprise.json`
3. Configure additional integrations (CRM, SMS)
4. Set up email templates
5. Test in parallel
6. Switch webhook URLs
7. Deactivate Core version

---

## Support

### Documentation
- **Core Guide:** This file
- **SendGrid Docs:** https://docs.sendgrid.com
- **SendGrid Activity Logs:** https://app.sendgrid.com/email_activity

### Community
- **Forum:** https://community.aigent.company
- **GitHub:** https://github.com/aigent/modules/issues

---

## License

MIT License (Open Source)

---

**Version:** core-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 04: Billing & Payments](module_04_README.md)
**Next Module:** [Module 06: Document Capture & OCR](module_06_README.md)
