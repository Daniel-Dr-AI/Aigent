# Module 11 – Universal Connector Manager Suite

**Version:** 1.0.0
**Author:** Aigent Development Team
**Date:** November 9, 2025
**Branch:** Core

---

## Overview

Module 11 is the **Universal Connector Manager Suite** for the Aigent Modular Workflow System. It provides a unified, registry-driven integration layer for all external third-party connectors used across Core and Enterprise modules.

### Purpose

1. **Single Integration Hub** – Centralized registry for all connectors (calendar, messaging, payments, video, etc.)
2. **Mock Mode Support** – Test workflows without live API calls using vendor JSON examples
3. **Unified Normalization** – Consistent payload structure across all modules
4. **Environment Switching** – Seamless toggle between live and mock operation
5. **Automated Testing** – Full test harness for validation and performance benchmarking

---

## Architecture

Module 11 consists of three tightly integrated submodules:

### **M11A – Connector Manager** (Registry + Normalization Engine)
- Central registry management (`connectors_registry.json`)
- Request/response normalization by connector type
- Dynamic routing between live and mock modes
- Authentication handling (API Key, Bearer, OAuth2)
- Module-specific connector resolution

### **M11B – Mock Simulator** (Vendor JSON & Local Testing Layer)
- Serves pre-recorded mock responses from `/mocks/` directory
- Latency simulation for realistic testing
- Random error injection for reliability testing
- Mock file upload and management
- Schema validation

### **M11C – Test Harness** (Automated Validation + Benchmarking)
- Batch testing across all registered connectors
- Mock vs. live response comparison
- Performance metrics (latency, success rate)
- Google Sheets logging
- Slack/Teams notifications

---

## File Structure

```
Aigent_Modules_Core/
├── module_11A_connector_manager.json    # M11A workflow
├── module_11B_mock_simulator.json       # M11B workflow
├── module_11C_test_harness.json         # M11C workflow
├── connectors_registry.json             # Master connector registry
├── MODULE_11_README.md                  # This file
├── mocks/                               # Mock JSON responses
│   ├── cal_com_availability.json
│   ├── cal_com_bookings.json
│   ├── zoom_meeting.json
│   ├── stripe_charge.json
│   ├── sendgrid_email.json
│   ├── twilio_sms.json
│   ├── google_sheets_append.json
│   ├── airtable_record.json
│   └── slack_notification.json
├── schemas/                             # JSON validation schemas
│   ├── calendar_availability.schema.json
│   ├── video_meeting.schema.json
│   ├── payment_charge.schema.json
│   ├── messaging_email.schema.json
│   ├── messaging_sms.schema.json
│   └── notification.schema.json
└── cache/                               # Test results cache
    └── last_test_results.json
```

---

## Installation & Setup

### 1. Import Workflows

Import all three workflows into your n8n instance:
1. `module_11A_connector_manager.json`
2. `module_11B_mock_simulator.json`
3. `module_11C_test_harness.json`

### 2. Configure Environment Variables

#### Required Variables

```bash
# Base n8n URL (required for module communication)
N8N_BASE_URL=https://your-n8n-instance.com
```

#### Optional Variables

```bash
# Registry and paths
CONNECTOR_REGISTRY_PATH=/path/to/connectors_registry.json  # Defaults to ./connectors_registry.json
MOCK_BASE_PATH=/path/to/mocks                              # Defaults to ./mocks
SCHEMA_BASE_PATH=/path/to/schemas                          # Defaults to ./schemas
CACHE_PATH=/path/to/cache                                  # Defaults to ./cache

# Mock mode control
MOCK_MODE_GLOBAL=true                    # Enable mock mode for all connectors
MOCK_CALENDAR=true                       # Enable mock mode for calendar connectors only
MOCK_MESSAGING=false                     # Disable mock mode for messaging
MOCK_PAYMENTS=false                      # Disable mock mode for payments
MOCK_VIDEO=false                         # Disable mock mode for video

# Mock behavior tuning
MOCK_LATENCY_MS=300-1200                 # Simulate latency (range in ms)
MOCK_RANDOM_ERROR_RATE=0.05              # 5% random error injection

# Testing
CONNECTOR_UNDER_TEST=cal_com             # Limit test harness to specific connector
DEFAULT_TIMEOUT_MS=10000                 # Request timeout (default: 10 seconds)

# Logging & Notifications
GOOGLE_SHEET_ID=your_sheet_id            # For test result logging
LOG_SHEET_TAB=Connector_Tests            # Sheet tab name
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/...  # Slack/Teams webhook
```

### 3. Set Up Connector Credentials

Configure n8n credentials for live connectors:
- **Google Sheets OAuth2** (required for logging)
- **SendGrid API** (optional)
- **Twilio API** (optional)
- **Stripe API** (optional)
- **Google Cloud OAuth2** (for Vision API)
- **Airtable API** (optional)

### 4. Activate Workflows

Activate all three workflows in n8n.

---

## Usage

### M11A – Connector Manager

#### **Operation: lookup**

Find connector definition by ID.

```bash
POST https://your-n8n-instance/webhook/connector/lookup
{
  "connector_id": "cal_com"
}
```

**Response:**
```json
{
  "success": true,
  "connector": {
    "id": "cal_com",
    "type": "calendar",
    "name": "Cal.com",
    "base_url": "...",
    "endpoints": { ... }
  }
}
```

#### **Operation: normalize**

Standardize request/response payloads.

```bash
POST https://your-n8n-instance/webhook/connector/normalize
{
  "connector_id": "cal_com",
  "direction": "request",
  "payload": {
    "preferred_date": "2025-11-10",
    "duration": 30
  }
}
```

**Response:**
```json
{
  "success": true,
  "normalized_payload": {
    "date": "2025-11-10",
    "duration": 30,
    "timezone": "America/New_York"
  }
}
```

#### **Operation: execute**

Execute connector call (live or mock).

```bash
POST https://your-n8n-instance/webhook/connector/execute
{
  "connector_id": "cal_com",
  "endpoint": "availability",
  "payload": {
    "date": "2025-11-10",
    "duration": 30
  }
}
```

**Response (Mock Mode):**
```json
{
  "success": true,
  "source": "mock",
  "connector_id": "cal_com",
  "endpoint": "availability",
  "data": {
    "slots": [...]
  },
  "simulated_latency_ms": 450
}
```

**Response (Live Mode):**
```json
{
  "success": true,
  "source": "live",
  "connector_id": "cal_com",
  "endpoint": "availability",
  "data": {
    "slots": [...]
  },
  "duration_ms": 742,
  "status_code": 200
}
```

#### **Operation: connector-resolve**

Get connector configuration for a calling module.

```bash
POST https://your-n8n-instance/webhook/connector/connector-resolve
{
  "module_id": "module_02_core",
  "service_type": "calendar"
}
```

**Response:**
```json
{
  "success": true,
  "module_id": "module_02_core",
  "service_type": "calendar",
  "primary_connector": {
    "id": "cal_com",
    "name": "Cal.com",
    "type": "calendar",
    "endpoints": ["availability", "bookings"]
  },
  "alternatives": [
    {"id": "calendly", "name": "Calendly"},
    {"id": "google_calendar", "name": "Google Calendar"}
  ]
}
```

---

### M11B – Mock Simulator

#### **Operation: mock-fetch**

Serve stored mock JSON response.

```bash
POST https://your-n8n-instance/webhook/connector/mock-fetch
{
  "connector_id": "cal_com",
  "endpoint": "availability"
}
```

**Response:**
```json
{
  "success": true,
  "source": "mock",
  "data": {
    "slots": [...]
  },
  "mock_file": "/path/to/cal_com_availability.json",
  "simulated_latency_ms": 320
}
```

#### **Operation: mock-upload**

Upload new vendor JSON file.

```bash
POST https://your-n8n-instance/webhook/connector/mock-upload
{
  "connector_id": "zoom",
  "endpoint": "create_meeting",
  "mock_data": {
    "id": "12345",
    "join_url": "https://zoom.us/j/12345"
  }
}
```

**Response:**
```json
{
  "success": true,
  "connector_id": "zoom",
  "endpoint": "create_meeting",
  "filename": "zoom_create_meeting.json",
  "path": "/path/to/mocks/zoom_create_meeting.json"
}
```

#### **Operation: mock-validate**

Validate mock against schema.

```bash
POST https://your-n8n-instance/webhook/connector/mock-validate
{
  "connector_id": "stripe",
  "endpoint": "create_charge"
}
```

**Response:**
```json
{
  "success": true,
  "connector_id": "stripe",
  "endpoint": "create_charge",
  "schema_conformance": 100,
  "validation_errors": []
}
```

#### **Operation: mock-list**

List all available mocks.

```bash
POST https://your-n8n-instance/webhook/connector/mock-list
```

**Response:**
```json
{
  "success": true,
  "mocks": [
    {"connector_id": "cal_com", "endpoint": "availability", "filename": "cal_com_availability.json"},
    {"connector_id": "zoom", "endpoint": "meeting", "filename": "zoom_meeting.json"}
  ],
  "count": 2
}
```

---

### M11C – Test Harness

#### **Test All Connectors**

```bash
POST https://your-n8n-instance/webhook/connector-test
{
  "test_mode": "all"
}
```

#### **Test Single Connector**

```bash
POST https://your-n8n-instance/webhook/connector-test
{
  "test_mode": "single",
  "connector_id": "cal_com"
}
```

**Response:**
```json
{
  "success": true,
  "test_run_id": "TEST-1699545600-abc123",
  "timestamp": "2025-11-09T12:00:00Z",
  "duration_ms": 5420,
  "total_connectors": 8,
  "connectors_passed": 7,
  "connectors_failed": 1,
  "total_tests": 32,
  "tests_passed": 30,
  "tests_failed": 2,
  "success_rate": "93.8",
  "average_latency_ms": 450,
  "failed_connectors": ["acuity"],
  "detailed_results": [...]
}
```

---

## Integration with Existing Modules

### Module 02 (Consult Booking) Integration

**Before (Direct API call):**
```javascript
// Hardcoded API URL
const url = process.env.SCHEDULING_API_URL + '/availability';
```

**After (Using M11A):**
```javascript
// Resolve connector dynamically
const connectorResponse = await $http.request({
  method: 'POST',
  url: `${process.env.N8N_BASE_URL}/webhook/connector/connector-resolve`,
  body: {
    module_id: 'module_02_core',
    service_type: 'calendar'
  }
});

const connector = connectorResponse.primary_connector;

// Execute via M11A
const response = await $http.request({
  method: 'POST',
  url: `${process.env.N8N_BASE_URL}/webhook/connector/execute`,
  body: {
    connector_id: connector.id,
    endpoint: 'availability',
    payload: { date: '2025-11-10', duration: 30 }
  }
});
```

**Benefits:**
- Dynamic connector selection
- Automatic mock/live switching
- Payload normalization
- Centralized error handling

---

## Connector Registry Format

The `connectors_registry.json` file defines all available connectors.

### Example Entry

```json
{
  "id": "cal_com",
  "type": "calendar",
  "name": "Cal.com",
  "base_url": "{{$env.SCHEDULING_API_URL}}",
  "auth": {
    "mode": "bearer",
    "token_env": "CALCOM_API_KEY"
  },
  "endpoints": {
    "availability": {
      "path": "/availability",
      "method": "GET",
      "request_map": {
        "date": "date",
        "duration": "duration"
      },
      "response_map": {
        "slots": "slots"
      }
    }
  },
  "mock": {
    "file": "./mocks/cal_com_availability.json",
    "schema": "./schemas/calendar_availability.schema.json"
  },
  "modules_using": ["module_02_core", "module_02_enterprise"]
}
```

### Field Descriptions

- **`id`** – Unique connector identifier
- **`type`** – Connector category (calendar, messaging, payment, video, etc.)
- **`name`** – Human-readable name
- **`base_url`** – API base URL (supports `{{$env.VAR}}` syntax)
- **`auth`** – Authentication configuration
  - `mode`: `bearer`, `apiKey`, `oauth2`, `credential`, `none`
  - `token_env`: Environment variable name for token
  - `credential_name`: n8n credential name
- **`endpoints`** – Available API endpoints
  - `path`: Endpoint path
  - `method`: HTTP method
  - `request_map`: Maps standard fields to connector-specific fields
  - `response_map`: Maps connector response to standard fields
- **`mock`** – Mock configuration
  - `file`: Path to mock JSON file
  - `schema`: Path to validation schema
- **`modules_using`** – List of modules that use this connector

---

## Normalization Adapters

M11A includes type-specific normalization adapters to ensure consistent payloads across all connectors.

### Calendar Adapter

**Request Normalization:**
```javascript
{
  date: req.date || req.preferred_date || today,
  duration: req.duration || 30,
  timezone: req.timezone || 'America/New_York'
}
```

**Response Normalization:**
```javascript
{
  slots: res.slots || res.data?.slots || res.available_times || [],
  next_available: res.next_available || res.slots[0] || null
}
```

### Messaging Adapter

**Request Normalization:**
```javascript
{
  recipient: req.recipient || req.to || req.email,
  message: req.message || req.body || req.text,
  channel: req.channel || 'email'
}
```

**Response Normalization:**
```javascript
{
  message_id: res.message_id || res.id || res.sid,
  status: res.status || 'sent'
}
```

### Payment Adapter

**Request Normalization:**
```javascript
{
  amount: req.amount,
  currency: req.currency || 'USD',
  customer_email: req.customer_email || req.email
}
```

**Response Normalization:**
```javascript
{
  charge_id: res.charge_id || res.id,
  status: res.status,
  receipt_url: res.receipt_url
}
```

---

## Testing Strategy

### 1. Unit Testing (Mock Mode)

Test individual workflows without live API dependencies.

```bash
# Enable global mock mode
export MOCK_MODE_GLOBAL=true

# Run test harness
curl -X POST https://your-n8n-instance/webhook/connector-test \
  -H "Content-Type: application/json" \
  -d '{"test_mode": "all"}'
```

### 2. Integration Testing (Live Mode)

Test against actual external APIs.

```bash
# Disable mock mode
export MOCK_MODE_GLOBAL=false

# Test specific connector
export CONNECTOR_UNDER_TEST=cal_com

curl -X POST https://your-n8n-instance/webhook/connector-test \
  -H "Content-Type: application/json" \
  -d '{"test_mode": "single", "connector_id": "cal_com"}'
```

### 3. Performance Testing

Measure latency and reliability.

```bash
# Run test harness and check metrics
{
  "average_latency_ms": 450,
  "success_rate": "98.5%",
  "failed_connectors": []
}
```

### 4. Schema Validation

Ensure mock responses match live API structure.

```bash
curl -X POST https://your-n8n-instance/webhook/connector/mock-validate \
  -H "Content-Type: application/json" \
  -d '{"connector_id": "stripe", "endpoint": "create_charge"}'
```

---

## Troubleshooting

### Issue: Registry not loading

**Error:**
```json
{
  "success": false,
  "error": "Failed to load registry",
  "registry_path": "/path/to/connectors_registry.json"
}
```

**Solution:**
- Verify `CONNECTOR_REGISTRY_PATH` is set correctly
- Check file permissions
- Ensure JSON is valid (use `jq . connectors_registry.json`)

### Issue: Mock file not found

**Error:**
```json
{
  "success": false,
  "error": "Mock file not found",
  "attempted_path": "/path/to/mocks/cal_com_availability.json"
}
```

**Solution:**
- Verify `MOCK_BASE_PATH` is set correctly
- Check that mock file exists
- Ensure filename matches pattern: `{connector_id}_{endpoint}.json`

### Issue: Live API call failing

**Error:**
```json
{
  "success": false,
  "source": "live",
  "error": "Request timeout"
}
```

**Solution:**
- Check environment variables for API keys/tokens
- Verify network connectivity
- Increase `DEFAULT_TIMEOUT_MS`
- Check connector `base_url` is correct

### Issue: Authentication failing

**Error:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Solution:**
- Verify authentication credentials in n8n
- Check `auth.token_env` matches actual environment variable name
- For OAuth2, re-authenticate credential

---

## Advanced Configuration

### Custom Latency Simulation

Simulate real-world API latency for testing.

```bash
# Random latency between 300ms and 1200ms
export MOCK_LATENCY_MS=300-1200
```

### Random Error Injection

Test error handling and retry logic.

```bash
# 5% of requests will randomly fail
export MOCK_RANDOM_ERROR_RATE=0.05
```

### Granular Mock Control

Enable mock mode for specific connector types.

```bash
# Mock calendar APIs only
export MOCK_CALENDAR=true
export MOCK_MESSAGING=false
export MOCK_PAYMENTS=false
```

### Historical Test Results

Test results are saved to both:
1. `cache/last_test_results.json` (latest results)
2. `cache/test_results_{timestamp}.json` (historical archive)

---

## Supported Connectors

### Calendar Services
- Cal.com
- Calendly
- Google Calendar

### Video Conferencing
- Zoom
- Google Meet
- Doxy.me

### Payment Processing
- Stripe

### Messaging
- SendGrid (Email)
- Twilio (SMS)
- Telegram
- WhatsApp (planned)

### Storage
- Google Sheets
- Google Cloud Vision (OCR)

### CRM
- Airtable
- HubSpot (planned)
- Salesforce (planned)

### Notifications
- Slack Webhook
- Teams Webhook

### Internal
- N8N Module Webhooks (M01-M10)

---

## Roadmap

### v1.1 (Planned)
- [ ] Advanced schema validation with Ajv
- [ ] Webhook signature validation
- [ ] Retry logic with exponential backoff
- [ ] Circuit breaker pattern
- [ ] Connector health monitoring

### v1.2 (Planned)
- [ ] Multi-region support
- [ ] Connector versioning
- [ ] A/B testing between connectors
- [ ] Rate limiting per connector
- [ ] Cost tracking per connector

### v2.0 (Planned)
- [ ] GraphQL connector support
- [ ] gRPC connector support
- [ ] WebSocket connector support
- [ ] Connector marketplace
- [ ] Auto-generated connector SDKs

---

## Contributing

To add a new connector:

1. **Add to Registry** – Update `connectors_registry.json`
2. **Create Mock** – Add mock JSON to `/mocks/`
3. **Create Schema** – Add validation schema to `/schemas/`
4. **Test** – Run test harness to validate
5. **Document** – Update this README

---

## Support

For issues, questions, or feature requests:
- GitHub Issues: [Aigent Issues](https://github.com/yourusername/aigent/issues)
- Documentation: [Aigent Docs](https://docs.aigent.com)
- Community: [Aigent Discord](https://discord.gg/aigent)

---

## License

Copyright © 2025 Aigent Development Team. All rights reserved.

---

## Changelog

### v1.0.0 (2025-11-09)
- Initial release
- M11A Connector Manager
- M11B Mock Simulator
- M11C Test Harness
- 15+ pre-configured connectors
- Mock JSON examples and schemas
- Comprehensive documentation
