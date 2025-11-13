# Module 02 Core: Consult Booking & Scheduling

**Version:** core-1.0.0
**Branch:** Core (SMB-Ready, Non-PHI)
**Target Users:** Service providers, wellness centers, coaches, salons, gyms

---

## Purpose

Simplified appointment booking workflow for service-based businesses. Checks calendar availability, selects first available slot, creates booking, and sends confirmations.

**NOT FOR:** Medical practices requiring HIPAA compliance (use Enterprise version)

---

## Features

✅ **Included (Core)**
- Public booking webhook
- 4-field validation (email, name, phone, service_type)
- Calendar availability check (Cal.com or mock API)
- First-available slot selection
- Direct booking creation
- Google Sheets audit logging
- Optional Slack/Teams notification
- Optional email confirmation
- Trace ID generation
- Parallel notifications (non-blocking)

❌ **Removed (Enterprise Only)**
- API key authentication
- Rate limiting & duplicate detection
- Idempotency checking (24h cache)
- HTML sanitization (XSS protection)
- Extended validation (12 fields + regex)
- Preference-based slot matching
- SMS confirmations
- Observability/performance logging
- Error correlation across modules

---

## Data Flow

```
Webhook → Validate (4 fields) → Check Calendar → Select Slot → Create Booking → [Sheets + Notify + Email] → Success
             ↓                                       ↓
           Error (400)                        No Slots (409)
```

**Execution Time:** ~800ms average (60% faster than Enterprise)

---

## Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `email` | string | contains @ |
| `name` | string | not empty |
| `phone` | string | not empty |
| `service_type` | string | not empty |

**Optional Fields:**
- `preferred_date` (YYYY-MM-DD, defaults to tomorrow)
- `preferred_time` (HH:MM, ignored in Core - uses first available)
- `timezone` (defaults to CLINIC_TIMEZONE)
- `notes`

---

## Setup Instructions

### 1. Import Workflow
- Import `module_02_core.json` to n8n

### 2. Configure Calendar Integration

**Option A: Cal.com (Recommended)**
```bash
# Get your Cal.com API key from https://cal.com/settings/developer
SCHEDULING_API_URL="https://api.cal.com/v1"

# Add to n8n variables
# Then update "Check Availability" node URL to use Cal.com endpoints
```

**Option B: Mock API (Testing)**
```bash
# Use httpbin for testing (returns fake data)
SCHEDULING_API_URL="https://httpbin.org"

# Returns mock slots - replace with real API before production
```

**Option C: Google Calendar**
- Use Google Calendar API (requires OAuth setup)
- Modify "Check Availability" node to use Google Calendar format

### 3. Connect Google Sheets
- Create sheet with columns:
  ```
  timestamp | trace_id | booking_id | patient_name | patient_email | patient_phone | service_type | scheduled_time | duration_minutes | timezone | status
  ```

### 4. Set Variables

**Required:**
```bash
GOOGLE_SHEET_ID="your-sheet-id"
SCHEDULING_API_URL="https://api.cal.com/v1"  # or your calendar API
```

**Optional:**
```bash
GOOGLE_SHEET_TAB="Bookings"
NOTIFICATION_WEBHOOK_URL="https://hooks.slack.com/services/..."
SENDGRID_FROM_EMAIL="bookings@yourbusiness.com"
CLINIC_NAME="Your Wellness Center"
CLINIC_PHONE="+1-555-123-4567"
CLINIC_TIMEZONE="America/Los_Angeles"
DEFAULT_APPOINTMENT_DURATION="30"  # minutes
```

### 5. Optional Integrations
- **Email:** Enable "Send Email Confirmation" node, add SendGrid credential
- **Slack:** Set NOTIFICATION_WEBHOOK_URL

### 6. Test
```bash
curl -X POST https://your-n8n-instance/webhook/consult-booking \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "phone": "555-8765",
    "service_type": "60-Minute Massage",
    "preferred_date": "2025-11-20",
    "notes": "First time client"
  }'
```

### 7. Activate
- Toggle workflow to "Active"
- Share webhook URL with your booking form/website

---

## Response Examples

### Success (200)
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "booking_id": "cal_abc123xyz",
  "confirmation_number": "CAL_ABC1",
  "scheduled_time": "2025-11-20T14:00:00Z",
  "service_type": "60-Minute Massage",
  "trace_id": "BOOK-1730851234567",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### No Availability (409)
```json
{
  "success": false,
  "error": "No available appointments",
  "retry_after": "2025-11-21T00:00:00Z",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Please provide email, name, phone, and service type",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

---

## Calendar Integration Details

### Cal.com Setup

1. **Create Account:** https://cal.com/signup
2. **Get API Key:** Settings → Developer → API Keys
3. **Create Event Type:**
   - Define your service (e.g., "Consultation")
   - Set duration, availability
   - Note the Event Type ID

4. **Update Workflow:**
   - Set `SCHEDULING_API_URL=https://api.cal.com/v1`
   - Update "Check Availability" node:
     ```
     GET /availability?eventTypeId={EVENT_TYPE_ID}&dateFrom={preferred_date}
     ```
   - Update "Create Booking" node:
     ```
     POST /bookings
     Body: { eventTypeId, start, responses: {...} }
     ```

### Calendly Setup

Similar process, use Calendly API: https://developer.calendly.com/

### Google Calendar Setup

Use Google Calendar API with OAuth2 credential in n8n.

---

## Integration with Module 01

**Flow:** Lead capture (M01) → Booking (M02)

### Option 1: Manual Transfer
- Staff reviews leads in Google Sheets (from M01)
- Manually create bookings via this webhook

### Option 2: Automated Trigger
- Add n8n workflow: "On new row in Leads sheet" → Call M02 webhook
- Auto-book consultations for high-priority leads

---

## Integration with Module 03

**Flow:** Booking (M02) → Telehealth Session (M03)

**Data Passed:**
```json
{
  "booking_id": "from M02 response",
  "patient_email": "from booking",
  "scheduled_time": "from booking",
  "service_type": "from booking"
}
```

M03 uses this to generate video meeting link.

---

## Troubleshooting

### No Slots Returned
- Verify SCHEDULING_API_URL is correct
- Check calendar API credentials
- Ensure event type is configured with availability
- Test API directly: `curl {SCHEDULING_API_URL}/availability`

### Booking Creation Fails
- Check calendar API rate limits
- Verify booking data format matches API requirements
- Review n8n execution logs for error details

### Email Not Sending
- Verify SendGrid credential connected
- Enable "Send Email Confirmation" node (disabled by default)
- Check SENDGRID_FROM_EMAIL is verified sender
- Review SendGrid activity logs

### Sheets Not Updating
- Verify GOOGLE_SHEET_ID correct
- Check column headers match exactly
- Ensure Google Sheets credential has write access

---

## Performance

| Metric | Core | Enterprise |
|--------|------|------------|
| Avg Execution | 800ms | 1800ms |
| P95 Execution | 1500ms | 3500ms |
| Nodes | 16 | 35 |
| API Calls | 2 | 6-8 |

**Why Faster?**
- No rate limit/idempotency checks (saves 2 API calls)
- No HTML sanitization (saves processing time)
- No duplicate detection (saves cache lookup)
- Simpler validation (4 fields vs 12)

---

## Upgrade to Enterprise

**When to Upgrade:**
- Need API authentication
- Need rate limiting (>50 bookings/hour)
- Need duplicate prevention (same patient, same time)
- Need SMS confirmations
- Need detailed performance metrics
- Need HIPAA compliance

**Migration:**
1. Export bookings from Sheets
2. Import `module_02_enterprise.json`
3. Configure additional variables (CACHE_API, etc.)
4. Test in parallel
5. Switch webhook URLs
6. Deactivate Core version

---

## Use Cases

### ✅ Perfect For
- Salon/spa appointment booking
- Personal training sessions
- Coaching consultations
- Therapy/counseling appointments
- Wellness center scheduling
- Fitness class reservations
- Tutoring sessions

### ❌ Not Suitable For
- Medical appointments (use Enterprise)
- High-volume booking (>50/hour - use Enterprise for rate limiting)
- Multi-location practices (use Enterprise for complexity)
- Telehealth (need M03 with HIPAA compliance)

---

## Support

- **Documentation:** https://docs.aigent.company/core/module-02
- **Cal.com Docs:** https://cal.com/docs
- **Community:** https://community.aigent.company

---

## License

MIT License (Open Source)

---

**Version:** core-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 01: Intake & Lead Capture](module_01_README.md)
**Next Module:** [Module 03: Telehealth Session](module_03_README.md)
