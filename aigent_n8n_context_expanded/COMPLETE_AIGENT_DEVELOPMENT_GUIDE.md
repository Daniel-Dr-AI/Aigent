# Complete Aigent Development Guide - n8n Context Bundle

**Version:** 2.0.0 - Enterprise Edition
**Created:** 2025-11-15
**Purpose:** Comprehensive n8n documentation for entire Aigent module suite (Core M01-M10, Enterprise M11+, and future projects)

---

## 📊 Expanded Bundle Statistics

- **Total Files:** 74+ markdown documents
- **Bundle Size:** ~500 KB
- **Coverage:** Complete workflow development lifecycle
- **Modules Supported:** All Aigent Core (M01-M10) + Enterprise (M11+) + Future Projects
- **Optimized For:** Production-grade connector management, orchestration, data transformation, and automation workflows

---

## 🎯 What This Bundle Covers

### Core Modules (M01-M10) Support

| Module | Primary Needs | Documentation Sections |
|--------|--------------|----------------------|
| **M01 - Intake/Lead Capture** | Webhooks, messaging connectors, error handling | 2, 3, 4, 6, 7 |
| **M02 - Consult Booking** | Calendar connectors, scheduling, data transformation | 3, 4, 9, 12 |
| **M03 - Telehealth/Video** | Video connectors, orchestration, environment config | 3, 4, 7, 10 |
| **M04 - Billing/Payment** | Payment connectors, error handling, security | 3, 4, 6, 7, 14 |
| **M05 - Follow-up Campaign** | Batch processing, messaging, scheduling | 3, 4, 11, 12 |
| **M06 - Document Processing** | OCR, data transformation, storage integration | 3, 4, 9 |
| **M07 - Analytics/Reporting** | Data aggregation, transformations, scheduling | 9, 11, 12 |
| **M08 - Omnichannel Messaging** | Multi-connector orchestration, routing | 3, 4, 5, 10 |
| **M09 - Event Logging** | Error handling, audit patterns, storage | 3, 6, 9 |
| **M10 - Orchestration** | Sub-workflows, inter-module communication, conditionals | 5, 10, 11 |

### Enterprise Modules (M11+) Support

| Module | Primary Needs | Documentation Sections |
|--------|--------------|----------------------|
| **M11A - Connector Manager** | Webhooks, Code nodes, Switch routing, env vars, HTTP requests | 2, 3, 4, 5, 7 |
| **M11B - Mock Simulator** | Webhooks, Code nodes, file-based mocks | 2, 3, 7 |
| **M11C - Test Harness** | HTTP requests, testing patterns, validation | 4, 15 |

---

## 📁 Complete Directory Structure

```
aigent_n8n_context_expanded/
├── README.md                                  # Quick reference
├── COMPLETE_AIGENT_DEVELOPMENT_GUIDE.md      # This comprehensive guide
├── AIGENT_CONTEXT_BUNDLE_GUIDE.md            # Original guide (Module 11 focus)
│
├── 1_core_workflows/                          # 6 files - Workflow fundamentals
│   ├── activating_and_examining_the_workflow.md
│   ├── building_a_mini-workflow.md
│   ├── connections.md
│   ├── create_and_run.md
│   ├── execution_order_in_multi-branch_workflows.md  ⭐ Critical for M10
│   └── executions.md
│
├── 2_webhooks/                                # 4 files - Webhook triggers
│   ├── webhook_credentials.md
│   ├── webhook_node_common_issues.md
│   ├── webhook_node_documentation.md          ⭐ Used in M01-M11
│   └── webhook_node_workflow_development_documentation.md
│
├── 3_code_nodes/                              # 7 files - Business logic
│   ├── code_in_n8n_documentation_and_guides.md
│   ├── code_node_common_issues.md             ⭐ Debugging reference
│   ├── code_node_cookbook.md                  ⭐ Patterns for M11A registry
│   ├── code_node_documentation.md
│   ├── item_linking_in_the_code_node.md       ⭐ For M07, M09 aggregation
│   ├── process_data_using_code.md
│   └── using_the_code_node.md
│
├── 4_http_requests/                           # 3 files - API communication
│   ├── http_request_credentials.md            ⭐ Auth patterns for M11A
│   ├── http_request_node_common_issues.md     ⭐ Troubleshooting M11C bug
│   └── http_request_node_documentation.md
│
├── 5_conditionals/                            # 1 file - Operation routing
│   └── switch.md                              ⭐ Critical for M08, M10, M11A
│
├── 6_error_handling/                          # 3 files - Production resilience
│   ├── dealing_with_errors_in_workflows.md
│   ├── error_handling.md                      ⭐ Used in all modules
│   └── error_trigger_node_documentation.md    ⭐ For M09 audit logging
│
├── 7_environment_variables/                   # 5 files - Configuration
│   ├── credentials_environment_variables.md   ⭐ API keys for M01-M10
│   ├── deployment_environment_variables.md
│   ├── endpoints_environment_variables.md
│   ├── environment_variables_overview.md      ⭐ Complete reference
│   └── workflows_environment_variables.md     ⭐ Workflow-level config
│
├── 8_workflow_management/                     # 5 files - DevOps
│   ├── debug_and_re-run_past_executions.md
│   ├── exporting_and_importing_workflows.md   ⭐ For M11 corrections
│   ├── export_and_import_workflows.md
│   ├── git_and_n8n.md                         ⭐ Version control
│   └── manual_partial_and_production_executions.md
│
├── 9_data_transformation/                     # 6 files - Data manipulation ✨ NEW
│   ├── data_transformation_functions.md       ⭐ Complete function reference
│   ├── data_transformation_functions_for_arrays.md  ⭐ For M07 analytics
│   ├── data_transformation_functions_for_objects.md ⭐ For M06 document parsing
│   ├── data_transformation_functions_for_strings.md ⭐ For M01 intake normalization
│   ├── merging_and_splitting_data.md          ⭐ For M08 omnichannel
│   └── transforming_data.md
│
├── 10_orchestration/                          # 4 files - Sub-workflows ✨ NEW
│   ├── execute_sub-workflow.md                ⭐ For M10 orchestration
│   ├── execute_sub-workflow_trigger_node_documentation.md
│   ├── splitting_with_conditionals.md         ⭐ For M08 channel routing
│   └── sub-workflows.md                       ⭐ Module composition patterns
│
├── 11_batch_processing/                       # 3 files - Bulk operations ✨ NEW
│   ├── loop_over_items_split_in_batches.md    ⭐ For M05 campaigns
│   ├── looping.md                             ⭐ For M07 report generation
│   └── split_out.md                           ⭐ For M08 multi-channel sending
│
├── 12_scheduling/                             # 2 files - Automated triggers ✨ NEW
│   ├── activation_trigger_node_documentation.md
│   └── schedule_trigger_node_documentation.md ⭐ For M05, M07 cron jobs
│
├── 13_api_design/                             # 12 files - REST API patterns ✨ NEW
│   └── [Complete n8n REST API documentation]  ⭐ For external integrations
│
├── 14_production_deployment/                  # 4 files - Scaling ✨ NEW
│   ├── configuration_methods.md               ⭐ Production config
│   ├── configuring_queue_mode.md              ⭐ High-volume processing
│   ├── concurrency_control.md                 ⭐ Rate limiting
│   └── docker.md                              ⭐ Container deployment
│
└── 15_testing_debugging/                      # 5 files - Quality assurance ✨ NEW
    ├── debug_and_re-run_past_executions.md    ⭐ Debugging workflows
    └── [Troubleshooting guides]               ⭐ Common issues resolution
```

---

## 🆕 What's New in Version 2.0 (Expanded Bundle)

### New Category: 9_data_transformation/
**Why:** M06 (Document Processing), M07 (Analytics), M01 (Lead Capture) need robust data manipulation

**Key Files:**
- `data_transformation_functions_for_arrays.md` - Array operations for M07 analytics
- `data_transformation_functions_for_objects.md` - Object manipulation for M06 OCR results
- `merging_and_splitting_data.md` - Data merging for M08 omnichannel

**Use Cases:**
- M01: Normalize lead data from different sources (form, API, webhook)
- M06: Transform OCR results into structured data
- M07: Aggregate analytics data across date ranges
- M08: Merge responses from multiple channels (email, SMS, Telegram)

### New Category: 10_orchestration/
**Why:** M10 (Orchestration) calls sub-workflows, M08 needs complex routing

**Key Files:**
- `sub-workflows.md` - Module composition patterns
- `execute_sub-workflow.md` - Calling other workflows programmatically
- `splitting_with_conditionals.md` - Advanced routing patterns

**Use Cases:**
- M10: Orchestrate new patient onboarding (M01 → M02 → M03 → M04)
- M08: Route messages to different channels based on recipient preferences
- Complex workflows: Break large workflows into reusable sub-workflows

### New Category: 11_batch_processing/
**Why:** M05 (Follow-up Campaign), M07 (Analytics) process bulk data

**Key Files:**
- `loop_over_items_split_in_batches.md` - Process large datasets in chunks
- `looping.md` - Iteration patterns
- `split_out.md` - Split data streams

**Use Cases:**
- M05: Send 1000+ follow-up emails in batches
- M07: Generate reports for hundreds of patient records
- M06: Process multiple documents in bulk

### New Category: 12_scheduling/
**Why:** M05 (Campaigns), M07 (Reports) need automated triggers

**Key Files:**
- `schedule_trigger_node_documentation.md` - Cron-based scheduling
- `activation_trigger_node_documentation.md` - Workflow activation patterns

**Use Cases:**
- M05: Daily follow-up campaign at 9am
- M07: Monthly analytics report on the 1st
- M09: Hourly audit log archival

### New Category: 13_api_design/
**Why:** External systems need to call Aigent modules via REST API

**Key Files:**
- Complete n8n REST API documentation (12 files)
- API authentication, endpoints, webhook management

**Use Cases:**
- External CRM calls M01 to capture leads
- Patient portal calls M02 for booking
- Mobile app calls M03 for video sessions
- Third-party billing system integrates with M04

### New Category: 14_production_deployment/
**Why:** Scale Aigent suite to production workloads

**Key Files:**
- `configuring_queue_mode.md` - Handle high volume
- `concurrency_control.md` - Rate limiting and throttling
- `docker.md` - Container deployment
- `configuration_methods.md` - Production config best practices

**Use Cases:**
- Deploy Aigent suite in Docker Swarm/Kubernetes
- Handle 10,000+ leads per day (M01)
- Process 1000s of payments simultaneously (M04)
- Queue-based execution for reliability

### New Category: 15_testing_debugging/
**Why:** Ensure quality across all modules before production

**Key Files:**
- `debug_and_re-run_past_executions.md` - Debugging failed executions
- Troubleshooting guides - Common issues resolution

**Use Cases:**
- Debug M11C test harness failures
- Re-run failed M04 payment charges
- Test M05 campaign before sending to 1000s of recipients
- Validate M11A connector configuration

---

## 🔧 Module-Specific Usage Guide

### M01 - Intake/Lead Capture

**Primary Documentation:**
- `2_webhooks/webhook_node_documentation.md` - Webhook trigger setup
- `3_code_nodes/code_node_cookbook.md` - Data normalization patterns
- `9_data_transformation/data_transformation_functions_for_strings.md` - Clean phone/email input
- `4_http_requests/http_request_node_documentation.md` - Call SendGrid, Slack via M11A
- `6_error_handling/error_handling.md` - Handle invalid lead data

**Common Patterns:**
```javascript
// Normalize phone number (from 3_code_nodes/code_node_cookbook.md)
const phone = $json.phone?.replace(/[^\d]/g, '') || '';
const normalizedPhone = phone.length === 10 ? `+1${phone}` : phone;

// Validate email (from 9_data_transformation/...strings.md)
const email = $json.email?.toLowerCase().trim();
const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
```

---

### M02 - Consult Booking

**Primary Documentation:**
- `12_scheduling/schedule_trigger_node_documentation.md` - Check availability hourly
- `4_http_requests/http_request_credentials.md` - Calendar API auth (Cal.com, Calendly)
- `9_data_transformation/data_transformation_functions_for_dates.md` - Timezone handling
- `6_error_handling/error_handling.md` - Handle booking conflicts

**Common Patterns:**
```javascript
// Timezone conversion (from 9_data_transformation/...dates.md)
const localTime = new Date($json.requested_time);
const timezone = $env.CLINIC_TIMEZONE || 'America/New_York';
const zonedTime = localTime.toLocaleString('en-US', { timeZone: timezone });

// Check availability (from 4_http_requests/)
const response = await $http.get(
  `${$env.SCHEDULING_API_URL}/availability`,
  {
    headers: { 'Authorization': `Bearer ${$env.CALCOM_API_KEY}` },
    params: { start: startDate, end: endDate }
  }
);
```

---

### M03 - Telehealth/Video Session

**Primary Documentation:**
- `4_http_requests/http_request_credentials.md` - Zoom/Meet API auth
- `10_orchestration/execute_sub-workflow.md` - Call M02 for booking, M08 for notifications
- `7_environment_variables/workflows_environment_variables.md` - Video platform config

**Common Patterns:**
```javascript
// Create Zoom meeting (from 4_http_requests/)
const meeting = await $http.post(
  'https://api.zoom.us/v2/users/me/meetings',
  {
    topic: `Consultation with ${$json.patient_name}`,
    start_time: $json.scheduled_time,
    duration: 30
  },
  {
    headers: { 'Authorization': `Bearer ${$env.VIDEO_PLATFORM_API_KEY}` }
  }
);

// Call M08 to send join URL (from 10_orchestration/execute_sub-workflow.md)
const result = await $execution.executeWorkflow('M08_Omnichannel_Messaging', {
  recipient: $json.patient_email,
  channel: 'email',
  message: `Your video session: ${meeting.join_url}`
});
```

---

### M04 - Billing/Payment

**Primary Documentation:**
- `4_http_requests/http_request_credentials.md` - Stripe API authentication
- `6_error_handling/error_handling.md` - Payment failure handling
- `7_environment_variables/credentials_environment_variables.md` - Secure API key storage

**Common Patterns:**
```javascript
// Create Stripe charge with error handling (from 6_error_handling/)
try {
  const charge = await $http.post(
    'https://api.stripe.com/v1/charges',
    {
      amount: $json.amount * 100, // Convert to cents
      currency: $json.currency || 'USD',
      source: $json.payment_method_id,
      description: `Booking ${$json.booking_id}`
    },
    {
      headers: { 'Authorization': `Bearer ${$env.STRIPE_API_KEY}` }
    }
  );

  return { success: true, charge_id: charge.id, status: charge.status };
} catch (error) {
  // Log to M09, notify via M08
  await $execution.executeWorkflow('M09_Event_Logging', {
    event_type: 'payment_failure',
    severity: 'high',
    message: error.message,
    metadata: { booking_id: $json.booking_id, amount: $json.amount }
  });

  return { success: false, error: error.message };
}
```

---

### M05 - Follow-up Campaign

**Primary Documentation:**
- `11_batch_processing/loop_over_items_split_in_batches.md` - Process 1000s of recipients
- `12_scheduling/schedule_trigger_node_documentation.md` - Daily campaign at 9am
- `4_http_requests/http_request_node_documentation.md` - Call M11A for SendGrid/Twilio

**Common Patterns:**
```javascript
// Batch process recipients (from 11_batch_processing/loop_over_items...)
// Split 1000 recipients into batches of 50
const recipients = $json.recipients || [];
const batchSize = 50;

for (let i = 0; i < recipients.length; i += batchSize) {
  const batch = recipients.slice(i, i + batchSize);

  // Process batch via M11A
  await $http.post(`${$env.N8N_BASE_URL}/webhook/connector-manager/execute`, {
    connector_id: 'sendgrid',
    endpoint: 'send_bulk_email',
    payload: {
      recipients: batch,
      template: $json.template,
      campaign_id: $json.campaign_id
    }
  });

  // Rate limiting (from 14_production_deployment/concurrency_control.md)
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

---

### M06 - Document Processing

**Primary Documentation:**
- `9_data_transformation/data_transformation_functions_for_objects.md` - Parse OCR results
- `4_http_requests/http_request_credentials.md` - Google Cloud Vision API auth
- `11_batch_processing/loop_over_items_split_in_batches.md` - Process multiple documents

**Common Patterns:**
```javascript
// Extract structured data from OCR results (from 9_data_transformation/...objects.md)
const ocrResult = $json.ocr_response?.textAnnotations || [];
const fullText = ocrResult[0]?.description || '';

// Parse insurance card fields
const extractField = (label) => {
  const regex = new RegExp(`${label}:\\s*([^\\n]+)`);
  const match = fullText.match(regex);
  return match ? match[1].trim() : null;
};

const insuranceData = {
  member_id: extractField('Member ID'),
  group_number: extractField('Group'),
  insurance_company: extractField('Insurance Company'),
  raw_text: fullText
};

// Validate extracted data
const isValid = insuranceData.member_id && insuranceData.insurance_company;
```

---

### M07 - Analytics/Reporting

**Primary Documentation:**
- `9_data_transformation/data_transformation_functions_for_arrays.md` - Data aggregation
- `11_batch_processing/looping.md` - Iterate through records
- `12_scheduling/schedule_trigger_node_documentation.md` - Monthly report generation
- `3_code_nodes/item_linking_in_the_code_node.md` - Multi-item processing

**Common Patterns:**
```javascript
// Aggregate analytics (from 9_data_transformation/...arrays.md)
const bookings = $json.bookings || [];

const stats = {
  total_bookings: bookings.length,
  total_revenue: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
  avg_booking_value: 0,
  by_service: {},
  by_date: {}
};

// Group by service type
bookings.forEach(booking => {
  const service = booking.service_type || 'Unknown';
  if (!stats.by_service[service]) {
    stats.by_service[service] = { count: 0, revenue: 0 };
  }
  stats.by_service[service].count++;
  stats.by_service[service].revenue += booking.amount || 0;

  // Group by date
  const date = booking.scheduled_time?.split('T')[0];
  stats.by_date[date] = (stats.by_date[date] || 0) + 1;
});

stats.avg_booking_value = stats.total_revenue / stats.total_bookings || 0;
```

---

### M08 - Omnichannel Messaging

**Primary Documentation:**
- `5_conditionals/switch.md` - Route by channel (email, SMS, Telegram, Slack)
- `10_orchestration/splitting_with_conditionals.md` - Multi-channel routing
- `4_http_requests/http_request_node_documentation.md` - Call multiple APIs via M11A

**Common Patterns:**
```javascript
// Channel routing (from 5_conditionals/switch.md)
// Switch node with 5 outputs: email, sms, telegram, slack, fallback

// In Code node, prepare channel-specific payload
const channel = $json.channel?.toLowerCase();
const message = $json.message;
const recipient = $json.recipient;

let connectorId, endpoint, payload;

switch (channel) {
  case 'email':
    connectorId = 'sendgrid';
    endpoint = 'send_email';
    payload = {
      to: recipient,
      subject: $json.subject || 'Notification',
      html: message
    };
    break;

  case 'sms':
    connectorId = 'twilio';
    endpoint = 'send_sms';
    payload = {
      to: recipient,
      body: message
    };
    break;

  case 'telegram':
    connectorId = 'telegram';
    endpoint = 'send_message';
    payload = {
      chat_id: recipient,
      text: message
    };
    break;

  case 'slack':
    connectorId = 'slack_webhook';
    endpoint = 'send_notification';
    payload = {
      text: message,
      channel: recipient
    };
    break;

  default:
    throw new Error(`Unsupported channel: ${channel}`);
}

return { connector_id: connectorId, endpoint, payload };
```

---

### M09 - Event Logging

**Primary Documentation:**
- `6_error_handling/error_trigger_node_documentation.md` - Capture workflow errors
- `3_code_nodes/item_linking_in_the_code_node.md` - Aggregate log entries
- `7_environment_variables/workflows_environment_variables.md` - Log levels config

**Common Patterns:**
```javascript
// Structured logging (from 6_error_handling/error_trigger.md)
const logEntry = {
  timestamp: new Date().toISOString(),
  event_type: $json.event_type || 'info',
  severity: $json.severity || 'low',
  module: $json.module || 'unknown',
  message: $json.message,
  metadata: $json.metadata || {},
  trace_id: $json.trace_id || 'unknown',
  environment: $env.NODE_ENV || 'development'
};

// Determine if alert needed
const alertSeverities = ['high', 'critical'];
const shouldAlert = alertSeverities.includes(logEntry.severity);

if (shouldAlert) {
  // Call M08 to send Slack notification
  await $http.post(`${$env.N8N_BASE_URL}/webhook/send-message`, {
    recipient: '#alerts',
    channel: 'slack',
    message: `🚨 ${logEntry.severity.toUpperCase()}: ${logEntry.message}`,
    metadata: logEntry
  });
}

// Append to Google Sheets
await $http.post(`${$env.N8N_BASE_URL}/webhook/connector-manager/execute`, {
  connector_id: 'google_sheets',
  endpoint: 'append',
  payload: {
    sheet_id: $env.AUDIT_LOG_SHEET_ID,
    values: [[
      logEntry.timestamp,
      logEntry.event_type,
      logEntry.severity,
      logEntry.module,
      logEntry.message,
      JSON.stringify(logEntry.metadata)
    ]]
  }
});
```

---

### M10 - Orchestration

**Primary Documentation:**
- `10_orchestration/sub-workflows.md` - Workflow composition patterns
- `10_orchestration/execute_sub-workflow.md` - Call other modules programmatically
- `5_conditionals/switch.md` - Route to different workflows based on workflow type

**Common Patterns:**
```javascript
// New patient onboarding orchestration (from 10_orchestration/sub-workflows.md)
const workflow = $json.workflow;
const data = $json.data;

const workflows = {
  new_patient_onboarding: async () => {
    // Step 1: Capture lead (M01)
    const leadResult = await $execution.executeWorkflow('M01_Intake_Lead_Capture', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      interest: 'New Patient'
    });

    if (!leadResult.success) {
      throw new Error('Lead capture failed');
    }

    // Step 2: Book consultation (M02)
    const bookingResult = await $execution.executeWorkflow('M02_Consult_Booking', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      service_type: 'Initial Consultation'
    });

    if (!bookingResult.success) {
      throw new Error('Booking failed');
    }

    // Step 3: Create video session (M03)
    const sessionResult = await $execution.executeWorkflow('M03_Telehealth_Session', {
      booking_id: bookingResult.booking_id,
      patient_name: data.name,
      scheduled_time: bookingResult.scheduled_time
    });

    // Step 4: Log orchestration completion (M09)
    await $execution.executeWorkflow('M09_Event_Logging', {
      event_type: 'orchestration_complete',
      severity: 'info',
      message: 'New patient onboarding completed',
      metadata: {
        workflow,
        lead_id: leadResult.trace_id,
        booking_id: bookingResult.booking_id,
        session_id: sessionResult.meeting_id
      }
    });

    return {
      success: true,
      workflow_id: $execution.id,
      steps_completed: ['lead_capture', 'booking', 'video_session'],
      booking_id: bookingResult.booking_id,
      video_url: sessionResult.join_url
    };
  },

  payment_reminder: async () => {
    // Different orchestration flow...
  }
};

// Execute workflow
const result = await workflows[workflow]();
return result;
```

---

### M11A - Connector Manager

**Primary Documentation:**
- `2_webhooks/webhook_node_documentation.md` - Webhook with persistent ID
- `3_code_nodes/code_node_cookbook.md` - globalThis registry pattern
- `5_conditionals/switch.md` - Operation routing (load, lookup, normalize, execute, connector-resolve)
- `4_http_requests/http_request_node_documentation.md` - Call M11B mock simulator
- `7_environment_variables/environment_variables_overview.md` - 15+ env vars

**Already covered in AIGENT_CONTEXT_BUNDLE_GUIDE.md - see that file for detailed M11A patterns**

---

### M11B - Mock Simulator

**Primary Documentation:**
- `2_webhooks/webhook_node_documentation.md` - Webhook configuration
- `3_code_nodes/code_node_documentation.md` - File-based mock loading
- `7_environment_variables/workflows_environment_variables.md` - MOCK_BASE_PATH, MOCK_LATENCY_MS

**Already covered in AIGENT_CONTEXT_BUNDLE_GUIDE.md**

---

### M11C - Test Harness

**Primary Documentation:**
- `4_http_requests/http_request_node_documentation.md` - HTTP Request to M11A
- `15_testing_debugging/debug_and_re-run_past_executions.md` - Debugging failed tests

**Already covered in AIGENT_CONTEXT_BUNDLE_GUIDE.md**

---

## 🎓 Learning Paths

### Path 1: New Aigent Developer (0-2 weeks)

**Week 1: Core Foundations**
1. Read `1_core_workflows/` (all 6 files)
2. Read `2_webhooks/webhook_node_documentation.md`
3. Read `3_code_nodes/code_node_documentation.md`
4. **Hands-on:** Import and study M01 (Intake/Lead Capture)

**Week 2: Advanced Patterns**
1. Read `4_http_requests/http_request_node_documentation.md`
2. Read `5_conditionals/switch.md`
3. Read `9_data_transformation/` (all files)
4. **Hands-on:** Build a simple webhook → code node → HTTP request workflow

### Path 2: Aigent Module Maintainer (2-4 weeks)

**Week 3: Orchestration & Batch Processing**
1. Read `10_orchestration/` (all files)
2. Read `11_batch_processing/` (all files)
3. Study M10 (Orchestration) implementation
4. **Hands-on:** Build a multi-step orchestration workflow

**Week 4: Production Readiness**
1. Read `14_production_deployment/` (all files)
2. Read `15_testing_debugging/` (all files)
3. Read `6_error_handling/` (all files)
4. **Hands-on:** Deploy a module to production with proper error handling

### Path 3: Aigent Enterprise Architect (4+ weeks)

**Week 5: Enterprise Patterns**
1. Study M11A/B/C implementation (connector management)
2. Read `13_api_design/` (all files)
3. Read `7_environment_variables/` (all files)
4. **Hands-on:** Build a custom connector adapter

**Week 6+: Advanced Topics**
1. Queue mode configuration for high-volume workflows
2. Custom node development (if needed)
3. Multi-instance deployment and load balancing
4. **Hands-on:** Scale Aigent suite to handle 10,000+ daily workflows

---

## 📚 Quick Reference by Use Case

### Building a New Core Module

**Essential Reading:**
1. `1_core_workflows/building_a_mini-workflow.md`
2. `2_webhooks/webhook_node_documentation.md`
3. `3_code_nodes/code_node_documentation.md`
4. `4_http_requests/http_request_node_documentation.md`
5. `6_error_handling/error_handling.md`
6. `7_environment_variables/workflows_environment_variables.md`

**Pattern:** Webhook → Code (normalize data) → HTTP Request (call M11A) → Code (handle response) → Return Success/Error

### Adding Batch Processing

**Essential Reading:**
1. `11_batch_processing/loop_over_items_split_in_batches.md`
2. `14_production_deployment/concurrency_control.md`
3. `3_code_nodes/item_linking_in_the_code_node.md`

**Pattern:** Schedule Trigger → Fetch Data → Split in Batches → Loop (process each batch) → Aggregate Results

### Building Orchestration Workflows

**Essential Reading:**
1. `10_orchestration/sub-workflows.md`
2. `10_orchestration/execute_sub-workflow.md`
3. `5_conditionals/switch.md`

**Pattern:** Webhook → Switch (workflow type) → Execute Sub-Workflow (multiple modules) → Aggregate Results → Log Event

### Deploying to Production

**Essential Reading:**
1. `14_production_deployment/docker.md`
2. `14_production_deployment/configuring_queue_mode.md`
3. `7_environment_variables/deployment_environment_variables.md`
4. `8_workflow_management/git_and_n8n.md`

**Pattern:** Local Dev → Git Version Control → Docker Build → Queue Mode Config → Production Deployment

### Debugging Issues

**Essential Reading:**
1. `15_testing_debugging/debug_and_re-run_past_executions.md`
2. All `*_common_issues.md` files in each category
3. `6_error_handling/dealing_with_errors_in_workflows.md`

**Pattern:** Identify Failed Execution → Read Error Details → Check Common Issues → Re-run with Debug Mode → Fix and Test

---

## 🔄 Integration with Existing Aigent Resources

### Cross-Reference with Aigent Documentation

| Aigent Doc | n8n Context Bundle Section |
|-----------|---------------------------|
| `module_01_README.md` | 2, 3, 4, 6, 9 |
| `module_02_README.md` | 3, 4, 9, 12 |
| `module_03_README.md` | 3, 4, 7, 10 |
| `module_04_README.md` | 3, 4, 6, 7 |
| `module_05_README.md` | 3, 4, 11, 12 |
| `module_06_README.md` | 3, 4, 9 |
| `module_07_README.md` | 9, 11, 12 |
| `module_08_README.md` | 3, 4, 5, 10 |
| `module_09_README.md` | 3, 6, 9 |
| `module_10_README.md` | 5, 10, 11 |
| `MODULE_11_DEEP_DEBUG_ANALYSIS.md` | 2, 3, 4, 5, 7 |
| `MODULE_11_CORRECTIONS_SUMMARY.md` | 2, 3, 4, 5, 6, 7, 8 |
| `INTEGRATION_MAP.md` | All sections (comprehensive reference) |

### Environment Variables Alignment

**Aigent Module Env Vars → n8n Documentation:**
- `CONNECTOR_REGISTRY_PATH` → `7_environment_variables/workflows_environment_variables.md`
- `MOCK_MODE_GLOBAL` → `7_environment_variables/deployment_environment_variables.md`
- `SENDGRID_API_KEY` → `7_environment_variables/credentials_environment_variables.md`
- `N8N_BASE_URL` → `7_environment_variables/endpoints_environment_variables.md`

---

## 🚀 Next Steps

### Immediate Actions

1. **Upload Expanded Bundle to Claude:**
   - Location: `C:\Users\bluel\Projects\aigent_n8n\aigent_n8n_context_expanded\`
   - Size: ~500 KB (74 files)
   - Use when: Building or debugging any Aigent module

2. **Read This Guide:**
   - Location: `COMPLETE_AIGENT_DEVELOPMENT_GUIDE.md` (this file)
   - Contains: Module-specific patterns, learning paths, quick reference

3. **Reference Module-Specific Sections:**
   - Find your module (M01-M11) in "Module-Specific Usage Guide" above
   - Follow the documentation links and code patterns

### Future Projects

This expanded bundle supports:
- ✅ All current Aigent Core modules (M01-M10)
- ✅ All current Aigent Enterprise modules (M11A-C)
- ✅ Future connector-based modules
- ✅ Future orchestration workflows
- ✅ Future batch processing workflows
- ✅ Any n8n-based automation project

**Categories to use for new projects:**
- **API Integration Projects:** Sections 2, 3, 4, 7
- **Data Processing Projects:** Sections 3, 9, 11
- **Workflow Orchestration Projects:** Sections 5, 10
- **Scheduled Automation Projects:** Sections 11, 12
- **Production Deployments:** Sections 14, 15

---

## 📞 Support & Resources

**Bundle Documentation:**
- This guide: `COMPLETE_AIGENT_DEVELOPMENT_GUIDE.md`
- Original guide: `AIGENT_CONTEXT_BUNDLE_GUIDE.md` (M11 focus)
- Quick reference: `README.md`

**Aigent Module Documentation:**
- Integration map: `Aigent_Modules_Core/INTEGRATION_MAP.md`
- Module READMEs: `Aigent_Modules_Core/module_XX_README.md`
- M11 analysis: `Aigent_Modules_Core/MODULE_11_DEEP_DEBUG_ANALYSIS.md`

**n8n Resources:**
- Official docs: https://docs.n8n.io/
- Community: https://community.n8n.io/
- GitHub: https://github.com/n8n-io/n8n

---

## ✅ Validation Checklist (All Modules)

Use this when building or updating any Aigent module:

**Core Requirements:**
- [ ] Webhook has persistent `webhookId` (if webhook-triggered)
- [ ] All Code nodes have null guards (`?.` optional chaining)
- [ ] HTTP Request nodes use `url` parameter (not `uri`)
- [ ] Environment variables documented in module README
- [ ] Error handling implemented (try-catch in Code nodes)
- [ ] Trace IDs generated and passed through workflow

**Advanced Requirements:**
- [ ] Switch nodes have `combinator: "and"` field (if using Switch)
- [ ] Batch processing implemented for bulk operations (if needed)
- [ ] Sub-workflow calls use correct workflow IDs (if using orchestration)
- [ ] Scheduling configured correctly (if using Schedule Trigger)
- [ ] Queue mode enabled for high-volume workflows (if needed)

**Production Requirements:**
- [ ] Workflow exports cleanly (no dangling connections)
- [ ] All Switch/IF conditions visible after import
- [ ] Environment-specific config uses env vars (not hardcoded)
- [ ] Logging to M09 for critical events
- [ ] Error notifications to M08 for failures
- [ ] Docker deployment tested (if deploying to containers)

---

## 📄 License

This bundle is derived from n8n documentation (https://docs.n8n.io/) for educational and development purposes. Original content belongs to n8n.io.

Curated and optimized for complete Aigent module suite development by Claude Code.

---

**Last Updated:** 2025-11-15
**Bundle Version:** 2.0.0 - Enterprise Edition
**Compatible with:** n8n v1.118.2+
**Supports:** Aigent Core (M01-M10), Enterprise (M11+), Future Projects

**Perfect for building production-ready, enterprise-scale n8n automation workflows! 🚀**
