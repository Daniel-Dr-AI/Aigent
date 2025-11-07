# Module 01 Core: Intake & Lead Capture

**Version:** core-1.0.0
**Branch:** Core (SMB-Ready, Non-PHI)
**Target Users:** Small businesses, service providers, non-medical practices

---

## Purpose

Simplified lead capture workflow for small businesses (gyms, spas, salons, boutiques). Accepts contact form submissions, logs to Google Sheets, and optionally sends notifications.

**NOT FOR:** Medical practices, PHI handling, HIPAA-compliant environments (use Enterprise version)

---

## Features

✅ **Included (Core)**
- Public webhook (no authentication)
- Basic required field validation
- Google Sheets logging (audit trail)
- Optional Slack/Teams notification
- Optional email auto-reply
- Trace ID generation
- Parallel execution for speed

❌ **Removed (Enterprise Only)**
- API key authentication
- Rate limiting
- Duplicate detection
- PHI masking
- Client IP tracking
- Lead scoring algorithm
- HubSpot CRM integration
- Execution time tracking
- Detailed validation errors
- Performance metrics

---

## Data Flow

```
Webhook → Metadata → Validation → Normalize → [Sheets + Notification + Email] → Success
                          ↓
                        Error
```

**Execution Time:** ~500ms average (2x faster than Enterprise)

---

## Setup Instructions

### 1. Import Workflow
- Open n8n
- Import `module_01_core.json`

### 2. Connect Google Sheets
- Add Google Sheets OAuth2 credential
- Create a sheet with these columns:
  ```
  timestamp | trace_id | name | first_name | last_name | email | phone | phone_display | interest | referral_source | notes | status
  ```

### 3. Configure Variables
**Required:**
- `GOOGLE_SHEET_ID`: Your Google Sheet ID (or edit node directly)

**Optional:**
- `GOOGLE_SHEET_TAB`: Tab name (default: "Leads")
- `NOTIFICATION_WEBHOOK_URL`: Slack/Teams webhook (default: httpbin for testing)
- `SENDGRID_FROM_EMAIL`: If enabling auto-reply email

### 4. Optional Integrations
- **Email Auto-Reply:** Enable "Send Auto-Reply Email" node, connect SendGrid credential
- **Slack/Teams:** Set `NOTIFICATION_WEBHOOK_URL` to your webhook

### 5. Test
```bash
curl -X POST https://your-n8n-instance/webhook/intake-lead \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "555-9876",
    "interest": "Fitness Consultation",
    "referral_source": "Google"
  }'
```

### 6. Activate
- Toggle workflow to "Active"
- Share webhook URL with your website/form

---

## Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `name` | string | not empty |
| `email` | string | contains @ |
| `phone` | string | not empty |

**Optional Fields:**
- `interest` (default: "General Inquiry")
- `referral_source` (default: "Direct")
- `notes`

---

## Response Examples

### Success (200)
```json
{
  "success": true,
  "message": "Thank you! We received your information.",
  "trace_id": "LEAD-1730851234567",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Error (400)
```json
{
  "success": false,
  "error": "Please provide name, email, and phone number",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

---

## Integrations

### Included (Core)
- **Google Sheets** (required): Primary data storage
- **Slack/Teams** (optional): Staff notifications
- **SendGrid** (optional): Auto-reply emails

### Not Included (Enterprise Only)
- HubSpot CRM
- Redis/external cache
- Observability services
- Error logging services

---

## Performance

| Metric | Core | Enterprise |
|--------|------|------------|
| Avg Execution | 500ms | 1500ms |
| P95 Execution | 1000ms | 2500ms |
| Nodes | 11 | 21 |
| Dependencies | 1-3 | 6-8 |

**Why Faster?**
- No external API calls for auth/rate limit/dedup
- No PHI masking overhead
- Fewer validation checks
- Parallel execution with minimal orchestration

---

## Use Cases

### ✅ Perfect For
- Gym membership inquiries
- Spa appointment requests
- Salon contact forms
- Boutique customer inquiries
- General service provider lead capture
- Event registrations
- Newsletter signups (with interest tracking)

### ❌ Not Suitable For
- Medical practices (use Enterprise)
- HIPAA-compliant workflows (use Enterprise)
- High-security environments (use Enterprise)
- Applications requiring rate limiting (use Enterprise)
- PHI/PII handling (use Enterprise)

---

## Upgrade Path

**When to Upgrade to Enterprise:**
- Need HIPAA compliance
- Need API key authentication
- Need rate limiting (>60 req/min)
- Need duplicate detection
- Need CRM integration (HubSpot)
- Need detailed analytics & performance tracking
- Need PHI masking
- Need audit logging with retention policies

**How to Upgrade:**
1. Export your Google Sheets data
2. Import `module_01_enterprise.json`
3. Configure additional credentials (HubSpot, Redis, etc.)
4. Set enterprise-specific variables
5. Migrate data
6. Test thoroughly
7. Swap webhook URLs

---

## Troubleshooting

### Webhook Not Responding
- Check workflow is "Active"
- Verify webhook path: `/webhook/intake-lead`
- Check n8n logs for errors

### Google Sheets Not Updating
- Verify Google Sheets credential connected
- Check `GOOGLE_SHEET_ID` variable is correct
- Ensure sheet has correct column headers
- Check n8n execution logs

### Notification Not Sending
- Verify `NOTIFICATION_WEBHOOK_URL` is set
- Test webhook URL directly
- Check "Send Notification" node has `continueOnFail: true` (non-blocking)

### Email Not Sending
- Verify SendGrid credential connected
- Check "Send Auto-Reply Email" node is enabled (disabled by default)
- Verify `SENDGRID_FROM_EMAIL` is set
- Check SendGrid logs for delivery status

---

## Support & Documentation

- **Full Documentation:** https://docs.aigent.company/core/module-01
- **GitHub Issues:** https://github.com/aigent/modules/issues
- **Community Forum:** https://community.aigent.company

---

## License

Proprietary - Aigent Company
© 2025 Aigent Automation Engineering

---

## Comparison: Core vs Enterprise

| Feature | Core | Enterprise |
|---------|------|------------|
| **Authentication** | None | API Key + Webhook Signature |
| **Rate Limiting** | None | Redis-backed, per-IP |
| **Deduplication** | None | 24h window, external cache |
| **Validation** | Basic (3 fields) | Comprehensive (12+ checks) |
| **PHI Masking** | None | Email, phone, name masking |
| **Data Storage** | Google Sheets | Sheets + HubSpot CRM |
| **Notifications** | Simple text | Rich formatting + priority |
| **Lead Scoring** | None | 10-point algorithm |
| **Performance Tracking** | None | Execution time, categorization |
| **Error Handling** | Generic | Field-specific, detailed |
| **Client IP Tracking** | None | Tracked for audit |
| **Execution Time** | 500ms avg | 1500ms avg |
| **Setup Complexity** | Low (10 min) | Medium (1 hour) |
| **Maintenance** | Low | Medium |
| **Cost** | Low (Sheets only) | Medium (Sheets + HubSpot + Redis) |

**Decision Matrix:**
- **Choose Core** if: SMB, non-medical, <100 leads/day, budget-conscious, quick setup
- **Choose Enterprise** if: Healthcare, PHI handling, >100 leads/day, need CRM, compliance required

---

**Version:** core-1.0.0
**Last Updated:** 2025-11-06
**Next Module:** [Module 02 Core: Consult Booking](module_02_README.md)
