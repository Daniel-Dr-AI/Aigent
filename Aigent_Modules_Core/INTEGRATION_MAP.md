# Module 11 Integration Map

## Completed Integrations

### Module 01 - Intake/Lead Capture
- **Connectors**: `slack_webhook` (notification), `sendgrid` (messaging)
- **Endpoints**: `send_notification`, `send_email`
- **Test**: `curl -X POST http://localhost:5678/webhook/intake-lead -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com","phone":"5551234567","interest":"General Inquiry"}'`
- **Expected**: `{success:true, trace_id:"LEAD-...", message:"Thank you! We received your information."}`

### Module 02 - Consult Booking
- **Connectors**: `cal_com`/`calendly`/`google_calendar` (calendar)
- **Endpoints**: `availability`, `bookings`
- **Test**: `curl -X POST http://localhost:5678/webhook/consult-booking -H "Content-Type: application/json" -d '{"name":"Jane Smith","email":"jane@example.com","phone":"5559876543","service_type":"Consultation"}'`
- **Expected**: `{success:true, booking_id:"...", scheduled_time:"...", trace_id:"BOOK-..."}`

## Integrations in Progress

### Module 03 - Telehealth/Video Session
- **Connectors**: `zoom`/`google_meet`/`doxy_me` (video), `sendgrid` (messaging)
- **Endpoints**: `create_meeting`, `send_email`
- **Test**: `curl -X POST http://localhost:5678/webhook/telehealth-session -H "Content-Type: application/json" -d '{"booking_id":"...", "patient_name":"John Doe", "scheduled_time":"2025-11-15T14:00:00Z"}'`
- **Expected**: `{success:true, meeting_id:"...", join_url:"...", trace_id:"SESSION-..."}`

### Module 04 - Billing/Payment
- **Connectors**: `stripe` (payment), `sendgrid` (messaging)
- **Endpoints**: `create_charge`, `send_email`
- **Test**: `curl -X POST http://localhost:5678/webhook/billing-payment -H "Content-Type: application/json" -d '{"booking_id":"...", "amount":100, "currency":"USD", "customer_email":"john@example.com"}'`
- **Expected**: `{success:true, charge_id:"...", status:"succeeded", receipt_url:"...", trace_id:"PAY-..."}`

### Module 05 - Follow-up Campaign
- **Connectors**: `sendgrid` (messaging), `twilio` (messaging-sms)
- **Endpoints**: `send_email`, `send_sms`
- **Test**: `curl -X POST http://localhost:5678/webhook/followup-campaign -H "Content-Type: application/json" -d '{"campaign_id":"...", "recipients":[{"email":"john@example.com","phone":"5551234567"}], "template":"followup_1"}'`
- **Expected**: `{success:true, sent_count:1, trace_id:"CAMP-..."}`

### Module 06 - Document Processing
- **Connectors**: `google_cloud_vision` (ocr), `google_sheets` (storage)
- **Endpoints**: `detect_text`, `append`
- **Test**: `curl -X POST http://localhost:5678/webhook/document-process -H "Content-Type: application/json" -d '{"document_url":"...", "document_type":"insurance_card"}'`
- **Expected**: `{success:true, extracted_text:"...", fields:{}, trace_id:"DOC-..."}`

### Module 07 - Analytics/Reporting
- **Connectors**: `google_sheets` (storage)
- **Endpoints**: `read`, `append`
- **Test**: `curl -X POST http://localhost:5678/webhook/generate-report -H "Content-Type: application/json" -d '{"report_type":"monthly", "start_date":"2025-11-01", "end_date":"2025-11-30"}'`
- **Expected**: `{success:true, report_url:"...", stats:{}, trace_id:"REPORT-..."}`

### Module 08 - Omnichannel Messaging
- **Connectors**: `sendgrid` (email), `twilio` (sms), `telegram` (chat), `slack_webhook` (notification)
- **Endpoints**: `send_email`, `send_sms`, `send_message`, `send_notification`
- **Test**: `curl -X POST http://localhost:5678/webhook/send-message -H "Content-Type: application/json" -d '{"recipient":"john@example.com", "channel":"email", "message":"Hello", "priority":"normal"}'`
- **Expected**: `{success:true, message_id:"...", channel:"email", trace_id:"MSG-..."}`

### Module 09 - Event Logging
- **Connectors**: `google_sheets` (storage), `slack_webhook` (notification)
- **Endpoints**: `append`, `send_notification`
- **Test**: `curl -X POST http://localhost:5678/webhook/log-event -H "Content-Type: application/json" -d '{"event_type":"error", "severity":"high", "message":"Database connection failed", "metadata":{}}'`
- **Expected**: `{success:true, logged:true, alert_sent:true, trace_id:"EVENT-..."}`

### Module 10 - Orchestration
- **Connectors**: `module_webhook` (internal)
- **Endpoints**: `intake_lead`, `consult_booking`, `telehealth_session`, etc.
- **Test**: `curl -X POST http://localhost:5678/webhook/orchestrate -H "Content-Type: application/json" -d '{"workflow":"new_patient_onboarding", "data":{"name":"John Doe", "email":"john@example.com"}}'`
- **Expected**: `{success:true, workflow_id:"...", steps_completed:[], trace_id:"ORCH-..."}`

---

## Environment Variables Required

```bash
# Core
N8N_BASE_URL=http://localhost:5678
CONNECTOR_REGISTRY_PATH=C:\Users\bluel\Dropbox\Daniels Docs\Daniel\Aigent\Aigent_Modules_Core\connectors_registry.json
MOCK_BASE_PATH=C:\Users\bluel\Dropbox\Daniels Docs\Daniel\Aigent\Aigent_Modules_Core\mocks
SCHEMA_BASE_PATH=C:\Users\bluel\Dropbox\Daniels Docs\Daniel\Aigent\Aigent_Modules_Core\schemas
DEFAULT_TIMEOUT_MS=10000

# Mock Control
MOCK_MODE_GLOBAL=true
MOCK_CALENDAR=true
MOCK_MESSAGING=true
MOCK_PAYMENTS=true
MOCK_VIDEO=true

# Calendar (Module 02)
SCHEDULING_API_URL=https://api.cal.com
CALCOM_API_KEY=xxx
CALENDLY_API_KEY=xxx

# Messaging (Modules 01, 05, 08)
SENDGRID_FROM_EMAIL=noreply@example.com
SENDGRID_API_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TELEGRAM_BOT_TOKEN=xxx

# Payments (Module 04)
STRIPE_API_KEY=xxx

# Video (Module 03)
VIDEO_PLATFORM_API_KEY=xxx

# Storage (All modules)
GOOGLE_SHEET_ID=xxx
GOOGLE_SHEET_TAB=Leads

# Clinic Defaults
CLINIC_TIMEZONE=America/New_York
CLINIC_NAME=Your Clinic
CLINIC_PHONE=555-000-0000
DEFAULT_APPOINTMENT_DURATION=30

# Notifications (Modules 01, 08, 09)
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

# Internal (Module 10)
MODULE_API_KEY=xxx
ALLOWED_ORIGINS=http://localhost
```

---

## Integration Status

| Module | Status | Connectors | Endpoints | Version |
|--------|--------|------------|-----------|---------|
| M01 | ✅ Complete | notification, messaging | send_notification, send_email | v1.2.0 |
| M02 | ✅ Complete | calendar | availability, bookings | v1.2.0 |
| M03 | ✅ Complete | video, messaging | create_meeting, send_email | v1.2.0 |
| M04 | ✅ Complete | payment, messaging | create_charge, send_email | v1.2.0 |
| M05 | ✅ Complete | messaging | send_email, send_sms | v1.2.0 |
| M06 | ✅ Complete | ocr, storage | detect_text, append | v1.2.0 |
| M07 | ✅ Complete | storage (direct) | read, append | v1.2.0 |
| M08 | ✅ Complete | messaging (multi) | send_email, send_sms | v1.2.0 |
| M09 | ✅ Complete | storage (direct) | append | v1.2.0 |
| M10 | ✅ Complete | internal (webhooks) | orchestration | v1.2.0 |

**Last Updated**: 2025-11-12 18:30 UTC

---

## Integration Summary

### Modules with Full M11A Integration
- **M01**: Notification + Messaging connectors (Slack Webhook, SendGrid)
- **M02**: Calendar connector (Cal.com/Calendly/Google Calendar)
- **M03**: Video + Messaging connectors (Zoom/Google Meet/Doxy.me, SendGrid)
- **M04**: Payment + Messaging connectors (Stripe, SendGrid)
- **M05**: Messaging connector (SendGrid bulk campaigns)
- **M06**: OCR connector (Google Cloud Vision)
- **M08**: Multi-channel Messaging (SendGrid email, Twilio SMS)

### Modules Using Direct APIs (No M11A Integration Needed)
- **M07**: Analytics - uses Google Sheets API directly for aggregation
- **M09**: Audit Logging - uses Google Sheets API directly for compliance logs
- **M10**: Orchestration - calls other modules via internal webhooks

### Key Integration Features
✅ All modules updated to **v1.2.0**
✅ Mock/Live mode switching via `MOCK_MODE_GLOBAL` environment variable
✅ Response normalization for M11A format (`response.data`)
✅ Backward compatibility maintained (legacy nodes disabled, not deleted)
✅ All external API calls routed through Module 11A Connector Manager
✅ Module 11B Mock Simulator support for testing without live APIs
✅ Centralized connector configuration via `connectors_registry.json`
