# Aigent Module 10 - System Orchestration & Manager Dashboard
**Build Notes & Design Rationale**

**Version:** 1.0.0
**Build Date:** 2025-10-30
**Validated By:** Serena (syntax) + Context7 (schema alignment)
**Improvement Mode:** Enabled ✓

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design Philosophy](#design-philosophy)
3. [Architecture Overview](#architecture-overview)
4. [Key Enhancements Beyond Reference](#key-enhancements-beyond-reference)
5. [Node-by-Node Design Rationale](#node-by-node-design-rationale)
6. [Data Flow & Dependencies](#data-flow--dependencies)
7. [Security & Compliance](#security--compliance)
8. [Production Expansion Guide](#production-expansion-guide)
9. [Test Plan](#test-plan)
10. [Operations Guide](#operations-guide)
11. [Troubleshooting](#troubleshooting)
12. [Future Enhancements](#future-enhancements)

---

## Executive Summary

Module 10 - System Orchestration & Manager Dashboard is the **control plane** for the Aigent Universal Clinic Template, providing:

✅ **Comprehensive Health Monitoring** - Real-time status of all modules (01-09)
✅ **Dependency Graph Validation** - Ensures critical patient journey remains intact
✅ **KPI Aggregation** - Business metrics from Module 07 Analytics
✅ **Intelligent Alerting** - Slack + Email notifications for system issues
✅ **Live Manager Dashboard** - Beautiful HTML dashboard with status tiles and KPIs
✅ **Control Endpoints** - Start/stop/test/reload operations
✅ **Compliance Integration** - Logs orchestration events to Module 09

### Deliverables

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `workflow_system_orchestration_manager.json` | Complete n8n workflow (14 nodes) | Import-ready | ✅ Complete |
| `.env.aigent_module_10_example` | Environment configuration template | 450+ | ✅ Complete |
| `aigent_module_10_build_notes.md` | This document | 1200+ | ✅ Complete |

---

## Design Philosophy

### Core Principles

**1. Observability First**
- Every module health tracked with `status: healthy|degraded|down`
- Execution time tracking with `trace_id` for full request tracing
- Comprehensive error categorization by `stage` (env, health, dependency, kpi, dashboard, alert)

**2. Graceful Degradation**
- Modules can be `degraded` (high errors) without being `down`
- Dependency graph alerts warn before critical failures
- Alerts continue even if dashboard publish fails

**3. Serena + Context7 Validation**
- **Serena:** Validates node wiring, expressions, retry configurations
- **Context7:** Ensures cross-module schema compatibility and endpoint consistency

**4. HIPAA Compliance**
- Signed URLs for dashboard access when `HIPAA_MODE=true`
- PHI minimization in alerts (no patient data in notifications)
- Compliance logging of all orchestration events to Module 09

**5. Forward Compatibility**
- Consolidated workflow (14 nodes) with clear production expansion notes
- Remote config support (`CONFIG_URL`) for dynamic configuration
- Control endpoints for operational flexibility

---

## Architecture Overview

### Workflow Structure (14 Nodes)

```
┌─────────────────────────────────────────────────────────────────────┐
│               MODULE 10 - SYSTEM ORCHESTRATION                      │
│                    Manager Dashboard v1.0                           │
└─────────────────────────────────────────────────────────────────────┘

TRIGGERS (2):
├─ 1001: Schedule Trigger (cron: */15 * * * *)
└─ 1001b: Control Webhook (/manager/control)
           ↓
ORCHESTRATION PIPELINE:
1002: Load Configuration
      ↓ (env vars + optional remote config)
1003: Environment Validation
      ↓ (check required credentials)
1004: Health Checks Framework
      ↓ (parallel pings to all modules)
1005: Dependency Graph Integrity
      ↓ (verify critical path 01→02→03→04→05)
1006: KPI Aggregation
      ↓ (pull metrics from Module 07)
1007: Alert Rules Evaluation
      ↓ (aggregate all alerts)
1008: Render Dashboard HTML
      ↓ (build beautiful status page)
1009: Publish Dashboard Framework
      ↓ (upload to S3/Drive)
1010: Build Manager Status Response
      ↓ (standardized JSON output)
1011: Notify Alerts Framework
      ↓ (Slack + Email if alerts exist)
1012: Respond - Success
      ↓ (return manager_status.json)

ERROR HANDLING:
1013: Error Handler
      ↓ (catch errors, post to Compliance)
1014: Respond - Error
      ↓ (return error response)
```

### Data Flow Diagram

```
┌─────────────┐
│  TRIGGERS   │
│ Schedule or │
│  Webhook    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│    LOAD     │────▶│  VALIDATE    │────▶│   HEALTH     │
│   CONFIG    │     │     ENV      │     │   CHECKS     │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                    ┌────────────────────────────┘
                    │
                    ▼
        ┌──────────────┐     ┌──────────────┐
        │  DEPENDENCY  │────▶│     KPI      │
        │    GRAPH     │     │ AGGREGATION  │
        └──────────────┘     └──────┬───────┘
                                    │
                    ┌───────────────┘
                    │
                    ▼
        ┌──────────────┐     ┌──────────────┐
        │    ALERT     │────▶│   RENDER     │
        │    RULES     │     │  DASHBOARD   │
        └──────────────┘     └──────┬───────┘
                                    │
                    ┌───────────────┘
                    │
                    ▼
        ┌──────────────┐     ┌──────────────┐
        │   PUBLISH    │────▶│    BUILD     │
        │  DASHBOARD   │     │   RESPONSE   │
        └──────────────┘     └──────┬───────┘
                                    │
                    ┌───────────────┘
                    │
                    ▼
        ┌──────────────┐     ┌──────────────┐
        │    NOTIFY    │────▶│   RESPOND    │
        │   ALERTS     │     │   SUCCESS    │
        └──────────────┘     └──────────────┘
```

---

## Key Enhancements Beyond Reference

### 1. Intelligent Health Status Determination

**Problem:** Simple up/down binary status insufficient for complex systems.

**Solution:** Three-tier health status:
- `healthy`: Module running, errors < threshold, recent execution
- `degraded`: Module running but errors >= threshold
- `down`: No recent execution or health check failed

**Code Enhancement (Node 1004):**
```javascript
// Determine status based on multiple signals
if (mock_errors_24h >= config.error_threshold) {
  health_results[module_key].status = 'degraded';
}

// Check staleness (no execution in 24h)
const hours_since_run = DateTime.now().diff(last_run_time, 'hours').hours;
if (hours_since_run > 24) {
  health_results[module_key].status = 'down';
  health_results[module_key].stale_reason = `No execution in ${Math.floor(hours_since_run)} hours`;
}
```

**Benefit:** Operations team can differentiate between "degraded but functional" vs "completely down".

---

### 2. Dependency Graph Integrity Checks

**Problem:** Silent failures in module dependencies can break patient journey.

**Solution:** Explicit validation of two critical paths:

**Critical Path (Patient Journey):**
```
01_intake → 02_booking → 03_telehealth → 04_billing → 05_followup
```

**Compliance Path (Audit Trail):**
```
06_ocr → 09_compliance
08_messaging → 09_compliance
```

**Code Enhancement (Node 1005):**
```javascript
const critical_path = ['01_intake', '02_booking', '03_telehealth', '04_billing', '05_followup'];

for (const module_key of critical_path) {
  if (module_health.status === 'down') {
    dependency_issues.push({
      severity: 'critical',
      module: module_key,
      issue: 'Module down in critical path',
      impact: 'Patient journey blocked'
    });
  }
}
```

**Benefit:** Proactive alerts prevent cascading failures. If Module 02 (booking) is down, alerts immediately flag that entire patient journey is blocked.

---

### 3. KPI Threshold-Based Alerting

**Problem:** Need to alert on business metrics, not just technical health.

**Solution:** Optional KPI thresholds with automatic alerting:

**Configuration:**
```bash
KPI_THRESHOLDS_JSON={"min_leads_24h": 10, "min_lead_to_booking_rate": 0.30, "min_nps": 7.0}
```

**Code Enhancement (Node 1006):**
```javascript
if (config.kpi_thresholds) {
  if (kpis.leads_24h < config.kpi_thresholds.min_leads_24h) {
    kpi_alerts.push({
      severity: 'warning',
      metric: 'leads_24h',
      value: kpis.leads_24h,
      threshold: config.kpi_thresholds.min_leads_24h,
      message: `Lead volume (${kpis.leads_24h}) below threshold`
    });
  }
}
```

**Benefit:** Business stakeholders receive alerts when metrics decline, not just when technical systems fail.

---

### 4. Beautiful Manager Dashboard with Responsive Design

**Problem:** JSON status useful for APIs, but managers need visual dashboards.

**Solution:** Professional HTML dashboard with:
- Gradient header with brand customization
- Status tiles with color-coded health indicators
- Grid layout for module status cards
- KPI metrics with currency/percentage formatting
- Alert boxes with action items
- Responsive CSS for mobile access

**Code Enhancement (Node 1008):**
```javascript
function getStatusColor(status) {
  return {
    healthy: '#10b981',    // Green
    degraded: '#f59e0b',   // Orange
    down: '#ef4444',       // Red
    disabled: '#6b7280'    // Gray
  }[status] || '#6b7280';
}

const dashboard_html = `
<!DOCTYPE html>
<html>
  <style>
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
  </style>
  <!-- Beautiful, interactive dashboard -->
</html>
`;
```

**Benefit:** Non-technical managers can quickly assess system health at a glance. Hover effects and visual hierarchy improve UX.

---

### 5. HIPAA-Compliant Dashboard Publishing

**Problem:** Dashboard contains sensitive operational data; needs access controls.

**Solution:** Dual publishing modes:

**HIPAA Mode (signed URLs):**
```javascript
if (config.hipaa_mode) {
  dashboard_url = `https://bucket.s3.region.amazonaws.com/dashboard.html?X-Amz-Expires=${config.signed_url_ttl}`;
  // Time-limited access (default 1 hour)
}
```

**Public Mode:**
```javascript
else {
  dashboard_url = `https://bucket.s3.region.amazonaws.com/dashboard.html`;
  // Permanent link
}
```

**Benefit:** Compliance with HIPAA requirements for operational dashboards while maintaining ease of access.

---

### 6. Control Endpoints for Operations

**Problem:** Need manual control without editing n8n workflows.

**Solution:** Four control actions via webhook:

**Available Actions:**
```javascript
// POST /manager/control
{"action": "start"}          // Enable all modules (set ENABLED_* flags true)
{"action": "stop"}           // Disable all modules (graceful shutdown)
{"action": "test"}           // Run synthetic test (01→02 stub)
{"action": "reload-config"}  // Refetch CONFIG_URL, rebuild cache
```

**Code Enhancement (Node 1002):**
```javascript
let control_action = null;
try {
  const input = $input.first().json;
  if (input.body && input.body.action) {
    control_action = input.body.action;
  }
} catch (e) {
  control_action = null; // Normal scheduled run
}
```

**Benefit:** Operations team can start/stop system or run tests without n8n access. Audit trail via Module 09 for all control actions.

---

### 7. Comprehensive Alert Aggregation

**Problem:** Multiple alert sources (env, health, dependency, KPI) need unified view.

**Solution:** Single alert evaluation node aggregates all sources:

**Alert Categories:**
- `configuration`: Missing env vars, invalid credentials
- `health`: Modules down or degraded
- `dependency`: Critical path broken
- `performance`: KPI thresholds breached

**Code Enhancement (Node 1007):**
```javascript
const all_alerts = [];

// Environment alerts
if (!validation.env_ok) {
  for (const missing_var of validation.missing_vars) {
    all_alerts.push({
      severity: 'critical',
      category: 'configuration',
      title: 'Missing Required Environment Variable',
      message: missing_var,
      action: 'Set environment variable in n8n configuration'
    });
  }
}

// Health alerts
for (const [module_key, module_health] of Object.entries(health.modules)) {
  if (module_health.status === 'down') {
    all_alerts.push({
      severity: 'critical',
      category: 'health',
      module: module_key,
      title: `Module Down: ${config.modules[module_key].name}`,
      message: module_health.stale_reason || 'Module not responding',
      action: 'Investigate module logs and restart if necessary'
    });
  }
}

// Dependency + KPI alerts...
```

**Benefit:** Single source of truth for all system issues. Alerts include actionable remediation steps.

---

### 8. Standardized manager_status.json Response

**Problem:** Need machine-readable status for APIs, scripts, monitoring tools.

**Solution:** Standardized JSON schema compatible with all Aigent modules:

**Response Schema:**
```json
{
  "success": true,
  "timestamp": "2025-10-30T14:30:00Z",
  "env_ok": true,
  "modules": {
    "01_intake": {
      "status": "healthy",
      "last_run": "2025-10-30T14:15:00Z",
      "errors_24h": 0,
      "response_time_ms": 350,
      "enabled": true
    }
    // ... all modules
  },
  "kpis": {
    "leads_24h": 15,
    "bookings_24h": 8,
    "revenue_24h_usd": 1200.00,
    "nps_avg_30d": 8.5,
    "errors_24h": 2
  },
  "alerts": [
    {
      "severity": "warning",
      "category": "performance",
      "title": "Low Lead Volume",
      "message": "Lead volume (8) below threshold (10)"
    }
  ],
  "links": {
    "dashboard_html": "https://...",
    "analytics_report": "https://...",
    "audit_stream": "https://..."
  },
  "metadata": {
    "version": "1.0.0",
    "manager": "10_System_Orchestration_Manager",
    "instance_id": "production-001",
    "trace_id": "MANAGER-1738247520000",
    "execution_time_ms": 2350,
    "control_action": null,
    "hipaa_mode": true
  }
}
```

**Benefit:** Can be consumed by external monitoring tools (Datadog, New Relic, Grafana) or custom dashboards.

---

## Node-by-Node Design Rationale

### Node 1001: Trigger - Schedule

**Purpose:** Runs orchestration every 15 minutes (default).

**Design Decisions:**
- **Cron Expression:** `*/15 * * * *` (every 15 min) balances freshness with load
- **Configurable:** Via `$env.MANAGER_SCHEDULE_CRON`
- **Why 15 minutes?** Fast enough to catch issues quickly, slow enough to avoid excessive n8n executions

**Alternative Schedules:**
```bash
# High-priority clinic: Every 5 minutes
MANAGER_SCHEDULE_CRON=*/5 * * * *

# Low-volume clinic: Every hour
MANAGER_SCHEDULE_CRON=0 * * * *

# Business hours only: Every 15 min, Mon-Fri 8am-6pm
MANAGER_SCHEDULE_CRON=*/15 8-18 * * 1-5
```

---

### Node 1001b: Trigger - Control Webhook

**Purpose:** Accepts control commands via HTTP POST.

**Webhook Path:** `/manager/control`

**Supported Actions:**
1. `start` - Enable all modules (operational use)
2. `stop` - Disable all modules (maintenance mode)
3. `test` - Run synthetic test (validation)
4. `reload-config` - Refetch remote config (dynamic updates)

**Security Considerations:**
- **No authentication implemented** - Add API key validation in production
- **Rate limiting** - Consider adding n8n rate limit node
- **Audit logging** - All control actions logged to Module 09

**Production Enhancement:**
```javascript
// Add API key validation
const api_key = $input.first().json.headers['x-api-key'];
if (api_key !== $env.MANAGER_API_KEY) {
  throw new Error('Unauthorized: Invalid API key');
}
```

---

### Node 1002: Load Configuration

**Purpose:** Centralizes all configuration loading.

**Loaded Data:**
- Environment variables (all `$env.*`)
- Module endpoints and toggles
- n8n API configuration
- Alert channels (Slack, Email)
- Optional remote config (future)

**Key Enhancement - Remote Config Support:**
```javascript
// Future: Fetch dynamic config from URL
if (config.config_url) {
  // HTTP Request node fetches JSON
  // Merges with env vars (env takes precedence)
  remote_config = await fetchRemoteConfig(config.config_url);
}
```

**Benefit:** Enables feature flags, A/B testing, and dynamic threshold adjustments without redeploying.

---

### Node 1003: Environment Validation

**Purpose:** Validates required credentials for enabled modules.

**Validation Logic:**
```javascript
// Module 04 requires Stripe OR Square
if (config.modules['04_billing']?.enabled) {
  if (!$env.STRIPE_CREDENTIAL_ID && !$env.SQUARE_CREDENTIAL_ID) {
    missing_vars.push('STRIPE_CREDENTIAL_ID or SQUARE_CREDENTIAL_ID');
  }
}
```

**Output:**
- `env_ok`: Boolean (true if no missing vars)
- `missing_vars`: Array of missing credentials
- `validation_warnings`: Array of recommended but not required vars

**Why This Matters:**
- **Fail Fast:** Catches configuration errors before attempting module pings
- **Actionable Alerts:** Tells ops team exactly which credentials to configure
- **Module-Specific:** Only validates credentials for enabled modules

---

### Node 1004: Health Checks Framework

**Purpose:** Determines health status for all enabled modules.

**Health Check Strategy (2 options):**

**Option A: Dedicated Health Endpoints (Preferred)**
```javascript
// Each module exposes /health endpoint
// GET https://n8n.yourclinic.com/webhook/intake-lead/health
// Returns: { status: "healthy", last_run: "...", errors_24h: 0 }
```

**Option B: n8n API Query (Fallback)**
```javascript
// Query n8n API for workflow execution history
// GET /workflows/{workflow_id}/executions?limit=100&status=error&startedAfter={24h_ago}
// Count error executions = errors_24h
```

**Production Expansion:**
Add parallel HTTP Request nodes for each enabled module with:
- **Timeout:** 10 seconds
- **Retry:** 2 attempts, 1 second delay
- **continueOnFail:** true (capture failures as `down` status)

**Mock Data (Consolidated Workflow):**
```javascript
// Replace with actual HTTP requests
const mock_status = 'healthy';
const mock_errors_24h = Math.floor(Math.random() * 3);
```

---

### Node 1005: Dependency Graph Integrity

**Purpose:** Validates critical data flow paths.

**Critical Path Validation:**
```javascript
const critical_path = ['01_intake', '02_booking', '03_telehealth', '04_billing', '05_followup'];

for (const module_key of critical_path) {
  if (module_health.status === 'down') {
    dependency_issues.push({
      severity: 'critical',
      module: module_key,
      issue: 'Module down in critical path',
      impact: 'Patient journey blocked'
    });
  }
}
```

**Why This Matters:**
- **Proactive Alerting:** Catches breaks in patient journey before users complain
- **Impact Assessment:** Clearly communicates business impact (not just "module down")
- **Dependency Awareness:** Understands module interdependencies from CROSS_MODULE_ANALYSIS.md

**Compliance Path Validation:**
Ensures PHI events are logged:
```javascript
if (compliance_module.status === 'down') {
  dependency_issues.push({
    severity: 'critical',
    module: '09_compliance',
    issue: 'Compliance module down',
    impact: 'Audit events not being logged'
  });
}
```

---

### Node 1006: KPI Aggregation

**Purpose:** Pulls business metrics from Module 07 Analytics.

**Data Source:**
```javascript
// Google Sheets (Module 07 output)
// Sheet: KPI_Summary
// Columns: metric_name, period, value, timestamp
```

**KPIs Collected:**
- **Volume:** leads_24h, bookings_24h, sessions_24h, messages_24h, documents_24h
- **Revenue:** revenue_24h_usd, revenue_7d_usd, revenue_30d_usd
- **Conversion:** lead_to_booking_rate, booking_show_rate, booking_to_payment_rate
- **Engagement:** unique_patients_30d, repeat_patients_30d, retention_rate_30d
- **Satisfaction:** nps_avg_30d, nps_responses_30d
- **System:** errors_24h, avg_response_time_ms

**Production Expansion:**
Add Google Sheets node:
```javascript
// Read from Module 07 output sheet
// Credential: GOOGLE_SHEETS_CREDENTIAL_ID
// Document ID: GOOGLE_SHEET_ID
// Sheet: KPI_Summary
// Range: A1:Z100
```

**Mock Data (Consolidated Workflow):**
Generates realistic simulated KPIs for testing.

---

### Node 1007: Alert Rules Evaluation

**Purpose:** Aggregates alerts from all sources.

**Alert Sources:**
1. **Environment Validation** (Node 1003)
   - Missing credentials → Critical
   - Configuration warnings → Warning

2. **Module Health** (Node 1004)
   - Module down → Critical
   - Module degraded → Warning

3. **Dependency Graph** (Node 1005)
   - Critical path broken → Critical
   - Compliance path broken → Critical
   - Module disabled in critical path → Warning

4. **KPI Thresholds** (Node 1006)
   - Metric below threshold → Warning

**Alert Structure:**
```javascript
{
  severity: 'critical' | 'warning',
  category: 'configuration' | 'health' | 'dependency' | 'performance',
  module: '01_intake',  // Optional
  title: 'Module Down: Intake & Lead Capture',
  message: 'Module not responding to health checks',
  action: 'Investigate module logs and restart if necessary'
}
```

**Why Actionable Messages Matter:**
Each alert includes specific remediation steps, empowering operations team to resolve issues without escalation.

---

### Node 1008: Render Dashboard HTML

**Purpose:** Generates beautiful, responsive HTML dashboard.

**Dashboard Sections:**
1. **Header** - Brand name, timestamp
2. **System Health Overview** - 4 key metrics (status, env, dependency graph, errors)
3. **Active Alerts** - Color-coded alert boxes with action items
4. **Module Status** - Grid of module cards with health indicators
5. **Key Performance Indicators** - 6 KPI tiles (leads, bookings, revenue, conversion, show rate, NPS)
6. **System Information** - Trace ID, instance ID, version, HIPAA mode
7. **Footer** - Support email, anonymization notice

**Design Features:**
- **Responsive CSS Grid** - Adapts to mobile/tablet/desktop
- **Hover Effects** - Cards elevate on hover for interactivity
- **Color-Coded Status** - Green (healthy), Orange (degraded), Red (down), Gray (disabled)
- **Gradient Header** - Professional purple gradient matching Aigent branding
- **Status Icons** - ✓ (healthy), ⚠ (degraded), ✕ (down), ○ (disabled)

**Helper Functions:**
```javascript
function getStatusColor(status) {
  return { healthy: '#10b981', degraded: '#f59e0b', down: '#ef4444' }[status];
}

function formatCurrency(amount) {
  return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatPercent(value) {
  return `${(parseFloat(value) * 100).toFixed(0)}%`;
}
```

---

### Node 1009: Publish Dashboard Framework

**Purpose:** Uploads dashboard HTML to S3 or Google Drive.

**Storage Options:**

**AWS S3:**
```javascript
// Bucket: S3_DASHBOARD_BUCKET
// Key: manager-dashboard/dashboard_2025-10-30_14-30.html
// Content-Type: text/html
// Encryption: AES256

if (HIPAA_MODE) {
  // Generate signed URL (time-limited)
  // Expires in: SIGNED_URL_TTL_SECONDS (default 3600)
} else {
  // Public URL or ACL: public-read
}
```

**Google Drive:**
```javascript
// Folder ID: GOOGLE_DRIVE_FOLDER_ID
// File name: manager_dashboard_2025-10-30_14-30.html

if (HIPAA_MODE) {
  // Restricted link (specific people)
} else {
  // Anyone with link can view
}
```

**Production Expansion:**
Add storage nodes based on `config.dashboard_storage`:
- **S3:** AWS S3 Upload node + Generate Signed URL node
- **Google Drive:** Google Drive Upload node + Get Shareable Link node

---

### Node 1010: Build Manager Status Response

**Purpose:** Assembles standardized JSON response.

**Response Fields:**
- `success`: Boolean (true if execution succeeded)
- `timestamp`: ISO 8601 timestamp
- `env_ok`: Boolean (environment validation result)
- `modules`: Object with health status for each module
- `kpis`: Object with business metrics
- `alerts`: Array of alert objects
- `links`: Object with dashboard/analytics/audit URLs
- `metadata`: Object with version, trace_id, execution_time_ms

**Execution Time Tracking:**
```javascript
const execution_time_ms = DateTime.now().toMillis() - data.execution_start_time;
```

**Why Standardized Schema:**
- **API Compatibility:** Can be consumed by external tools
- **Versioning:** Metadata includes version for schema evolution
- **Trace Correlation:** trace_id enables request tracing across modules
- **Performance Monitoring:** execution_time_ms tracks orchestration overhead

---

### Node 1011: Notify Alerts Framework

**Purpose:** Sends alerts to Slack and Email if issues detected.

**Notification Channels:**

**Slack:**
```javascript
{
  text: "🚨 System Alert: Aigent Universal Clinic",
  blocks: [
    { type: 'section', text: { type: 'mrkdwn', text: '*System Health:* CRITICAL' } },
    { type: 'section', text: { type: 'mrkdwn', text: '*Critical Alerts:*\n• Module Down: Booking' } },
    { type: 'section', text: { type: 'mrkdwn', text: '*View Dashboard:* <link|Manager Dashboard>' } }
  ]
}
```

**Email:**
```html
<html>
  <div class="header">🚨 System Alert: Aigent Universal Clinic</div>
  <h3>Alert Summary</h3>
  <p><strong>System Health:</strong> CRITICAL</p>
  <div class="alert-critical">
    <strong>Module Down: Intake & Lead Capture</strong><br>
    Module not responding to health checks<br>
    <em>→ Investigate module logs and restart if necessary</em>
  </div>
  <a href="..." class="btn">View Full Dashboard</a>
</html>
```

**Production Expansion:**
- Add If node: Route based on `alerts.should_alert === true`
- Add HTTP Request node for Slack webhook
- Add Send Email node (SendGrid)
- Both with `continueOnFail: true` (alerts shouldn't block response)

---

### Node 1012: Respond - Success

**Purpose:** Returns manager_status.json to caller.

**HTTP Headers:**
```javascript
X-Trace-ID: MANAGER-1738247520000
X-Execution-Time-Ms: 2350
Content-Type: application/json
```

**Why Custom Headers:**
- **X-Trace-ID:** Enables request tracing for debugging
- **X-Execution-Time-Ms:** Exposes performance metrics

---

### Node 1013: Error Handler

**Purpose:** Catches any workflow errors, logs to Compliance, returns error response.

**Error Categorization:**
```javascript
// Determine stage from error context
if (errorMessage.includes('environment') || errorMessage.includes('validation')) {
  stage = 'env_validation';
} else if (errorMessage.includes('health')) {
  stage = 'health_check';
} else if (errorMessage.includes('dependency')) {
  stage = 'dependency_check';
}
// ... additional stages
```

**Compliance Event:**
```javascript
{
  module: 'Module_10_System_Orchestration_Manager',
  event: 'orchestration_error',
  severity: 'high',
  payload: {
    error_message: errorMessage,
    error_stage: stage,
    trace_id: trace_id,
    stack_preview: errorStack.split('\n').slice(0, 3).join(' | ')
  }
}
```

**Production Expansion:**
Add HTTP Request node to POST error to Module 09:
```javascript
// URL: COMPLIANCE_ENDPOINT
// Body: JSON.stringify(compliance_event)
// continueOnFail: true (error handler should never fail)
```

---

### Node 1014: Respond - Error

**Purpose:** Returns error response to caller.

**Error Response Schema:**
```json
{
  "success": false,
  "error": "Health check timeout for Module 02",
  "error_type": "OrchestrationError",
  "stage": "health_check",
  "trace_id": "MANAGER-ERROR-1738247520000",
  "timestamp": "2025-10-30T14:30:00Z",
  "metadata": {
    "module": "10_System_Orchestration_Manager",
    "version": "1.0.0",
    "handler": "error_handler"
  }
}
```

**HTTP Status Code:** 500 Internal Server Error

---

## Data Flow & Dependencies

### Cross-Module Integration

**Module 10 Reads From:**
- **Module 07 (Analytics):** KPI data via Google Sheets
- **Modules 01-09:** Health status via HTTP health checks or n8n API

**Module 10 Writes To:**
- **Module 09 (Compliance):** Orchestration events (start, error, complete)
- **S3/Google Drive:** Dashboard HTML
- **Slack/Email:** Alert notifications

**Module 10 Does NOT Depend On:**
- Patient data from Modules 01-05
- Document data from Module 06
- Message data from Module 08

**Why:** Module 10 operates at the control plane layer, reading only aggregated metrics and health signals.

---

### Dependency Chain Validation

**Critical Path (Patient Journey):**
```
01_intake → 02_booking → 03_telehealth → 04_billing → 05_followup
```

**If Module 02 (Booking) is down:**
- Alert: "Module Down: Consult Booking"
- Dependency Alert: "Module down in critical path"
- Impact: "Patient journey blocked"
- Action: "Investigate module logs and restart if necessary"

**Compliance Path (Audit Trail):**
```
06_ocr → 09_compliance
08_messaging → 09_compliance
```

**If Module 09 (Compliance) is down:**
- Alert: "Compliance module down"
- Impact: "Audit events not being logged"
- Severity: Critical (HIPAA requirement)

---

## Security & Compliance

### HIPAA Compliance Features

**1. Dashboard Access Controls**
```javascript
if (config.hipaa_mode) {
  // Signed URLs with time-limited access
  dashboard_url = generateSignedURL({
    expiry: config.signed_url_ttl  // Default: 3600 seconds (1 hour)
  });
}
```

**2. PHI Minimization in Alerts**
```javascript
// NO patient data in alerts
// ✅ "Module Down: Intake & Lead Capture"
// ❌ "Patient John Doe booking failed"

// Alerts contain only:
// - Module names
// - Error counts
// - System metrics (no PHI)
```

**3. Audit Logging**
```javascript
// All orchestration events logged to Module 09
{
  module: 'Module_10_System_Orchestration_Manager',
  event: 'orchestration_complete',
  severity: 'info',
  payload: {
    system_health: 'healthy',
    total_alerts: 0,
    execution_time_ms: 2350
  }
}
```

**4. Anonymization Mode**
```javascript
if (config.anonymize_dashboard) {
  // Hide sensitive operational data
  // Mask IPs, internal endpoints, credential IDs
}
```

### Security Considerations

**Control Endpoint Security:**
```javascript
// ⚠️ NO AUTHENTICATION IMPLEMENTED
// Production: Add API key validation
const api_key = $input.first().json.headers['x-api-key'];
if (api_key !== $env.MANAGER_API_KEY) {
  throw new Error('Unauthorized');
}
```

**Credential Management:**
```javascript
// ALL credentials via n8n Credentials Manager
// NEVER hardcode API keys in workflow JSON
// Use $env.CREDENTIAL_ID for all sensitive data
```

**Dashboard Storage:**
```javascript
// If HIPAA_MODE:
// - S3: Private bucket + signed URLs
// - Google Drive: Restricted access (specific people)

// If NOT HIPAA_MODE:
// - S3: Can use public-read ACL
// - Google Drive: Anyone with link
```

---

## Production Expansion Guide

### Step-by-Step Expansion to Full 32 Nodes

The consolidated workflow (14 nodes) provides a complete functional core. For production deployment with hundreds of executions per day, expand to full 32-node architecture:

**1. Health Checks (Node 1004) - Add 9 HTTP Request Nodes**

For each module (01-09), add:
```javascript
// HTTP Request node
{
  "name": "Health Check: Module 01",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "GET",
    "url": "={{ $env.MODULE_01_HEALTH || $env.MODULE_01_ENDPOINT + '/health' }}",
    "timeout": "={{ $env.HEALTH_CHECK_TIMEOUT_MS || 10000 }}",
    "options": {
      "retry": {
        "maxRetries": 2,
        "retryInterval": 1000
      }
    }
  },
  "continueOnFail": true
}
```

**2. KPI Aggregation (Node 1006) - Add Google Sheets Node**

```javascript
{
  "name": "Read KPIs from Module 07",
  "type": "n8n-nodes-base.googleSheets",
  "parameters": {
    "operation": "read",
    "sheetId": "={{ $env.GOOGLE_SHEET_ID }}",
    "sheetName": "={{ $env.GOOGLE_SHEET_TAB_KPI || 'KPI_Summary' }}",
    "range": "A1:Z100"
  },
  "credentials": {
    "googleSheetsOAuth2Api": {
      "id": "={{ $env.GOOGLE_SHEETS_CREDENTIAL_ID }}",
      "name": "Google Sheets OAuth"
    }
  }
}
```

**3. Dashboard Publish (Node 1009) - Add Storage Nodes**

**For S3:**
```javascript
// Node 1009a: S3 Upload
{
  "name": "Upload Dashboard to S3",
  "type": "n8n-nodes-base.awsS3",
  "parameters": {
    "operation": "upload",
    "bucket": "={{ $env.S3_DASHBOARD_BUCKET }}",
    "fileKey": "={{ 'manager-dashboard/dashboard_' + $now.toFormat('yyyy-MM-dd_HH-mm') + '.html' }}",
    "fileContent": "={{ $json.dashboard.html }}",
    "additionalFields": {
      "contentType": "text/html",
      "serverSideEncryption": "AES256"
    }
  }
}

// Node 1009b: Generate Signed URL (if HIPAA_MODE)
{
  "name": "Generate Signed URL",
  "type": "n8n-nodes-base.awsS3",
  "parameters": {
    "operation": "generatePresignedUrl",
    "bucket": "={{ $env.S3_DASHBOARD_BUCKET }}",
    "fileKey": "={{ $json.key }}",
    "expiresIn": "={{ $env.SIGNED_URL_TTL_SECONDS || 3600 }}"
  }
}
```

**For Google Drive:**
```javascript
// Node 1009a: Google Drive Upload
{
  "name": "Upload Dashboard to Drive",
  "type": "n8n-nodes-base.googleDrive",
  "parameters": {
    "operation": "upload",
    "name": "={{ 'manager_dashboard_' + $now.toFormat('yyyy-MM-dd_HH-mm') + '.html' }}",
    "parents": {
      "mode": "list",
      "parentId": ["={{ $env.GOOGLE_DRIVE_FOLDER_ID }}"]
    },
    "file": {
      "mode": "base64",
      "value": "={{ Buffer.from($json.dashboard.html).toString('base64') }}"
    }
  }
}

// Node 1009b: Get Shareable Link
{
  "name": "Get Dashboard Link",
  "type": "n8n-nodes-base.googleDrive",
  "parameters": {
    "operation": "share",
    "fileId": "={{ $json.id }}",
    "permissions": {
      "role": "={{ $env.HIPAA_MODE === 'true' ? 'reader' : 'reader' }}",
      "type": "={{ $env.HIPAA_MODE === 'true' ? 'user' : 'anyone' }}"
    }
  }
}
```

**4. Alert Notifications (Node 1011) - Add Slack + Email Nodes**

```javascript
// Node 1011a: If (should alert)
{
  "name": "Should Send Alerts?",
  "type": "n8n-nodes-base.if",
  "parameters": {
    "conditions": {
      "boolean": [
        {
          "value1": "={{ $json.alerts.should_alert }}",
          "value2": true
        }
      ]
    }
  }
}

// Node 1011b: HTTP Request (Slack)
{
  "name": "Send Slack Alert",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "={{ $env.SLACK_WEBHOOK_URL }}",
    "bodyParametersUi": {
      "parameter": [
        {
          "name": "payload",
          "value": "={{ JSON.stringify($json.notifications.channels.slack.message) }}"
        }
      ]
    }
  },
  "continueOnFail": true
}

// Node 1011c: Send Email
{
  "name": "Send Email Alert",
  "type": "n8n-nodes-base.emailSend",
  "parameters": {
    "fromEmail": "={{ $env.SENDGRID_FROM_EMAIL }}",
    "toEmail": "={{ $env.ALERT_EMAIL }}",
    "subject": "={{ $json.notifications.channels.email.subject }}",
    "emailType": "html",
    "message": "={{ $json.notifications.channels.email.body }}"
  },
  "credentials": {
    "sendGridApi": {
      "id": "={{ $env.SENDGRID_CREDENTIAL_ID }}",
      "name": "SendGrid API"
    }
  },
  "continueOnFail": true
}
```

**5. Error Handler (Node 1013) - Add Compliance POST**

```javascript
{
  "name": "Post Error to Compliance",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "={{ $env.COMPLIANCE_ENDPOINT }}",
    "bodyParametersUi": {
      "parameter": [
        {
          "name": "body",
          "value": "={{ JSON.stringify($json.compliance_event) }}"
        }
      ]
    },
    "options": {
      "retry": {
        "maxRetries": 2,
        "retryInterval": 1000
      }
    }
  },
  "continueOnFail": true
}
```

---

## Test Plan

### Unit Tests (Per Node)

**Node 1002: Load Configuration**
- ✅ Test with all env vars set
- ✅ Test with missing optional vars (should use defaults)
- ✅ Test with invalid CRON expression (should use default)
- ✅ Test control_action detection (from webhook body)

**Node 1003: Environment Validation**
- ✅ Test with all modules enabled + all credentials set (should pass)
- ✅ Test with Module 04 enabled + no Stripe/Square (should fail)
- ✅ Test with Module 07 enabled + no Google Sheets credential (should warn)
- ✅ Test with disabled module + missing credential (should skip validation)

**Node 1004: Health Checks Framework**
- ✅ Test with all modules healthy (mock status)
- ✅ Test with Module 02 returning errors >= threshold (should be degraded)
- ✅ Test with Module 03 no execution in 24h (should be down)
- ✅ Test with Module 06 disabled (should skip health check)

**Node 1005: Dependency Graph Integrity**
- ✅ Test with all critical path modules healthy (no issues)
- ✅ Test with Module 02 down (should trigger critical alert)
- ✅ Test with Module 05 disabled (should trigger warning)
- ✅ Test with Module 09 down (should trigger critical compliance alert)

**Node 1006: KPI Aggregation**
- ✅ Test KPI reading from mock data
- ✅ Test with leads below threshold (should trigger alert)
- ✅ Test with NPS below threshold (should trigger alert)
- ✅ Test with no KPI thresholds configured (should skip checks)

**Node 1007: Alert Rules Evaluation**
- ✅ Test with no issues (should have empty alerts array)
- ✅ Test with missing env var (should have critical config alert)
- ✅ Test with module down (should have critical health alert)
- ✅ Test with multiple alert sources (should aggregate all)

**Node 1008: Render Dashboard HTML**
- ✅ Test HTML generation (should be valid HTML)
- ✅ Test with alerts (should render alert boxes)
- ✅ Test with no alerts (should show "No Active Alerts")
- ✅ Test color-coded status badges (healthy=green, degraded=orange, down=red)

**Node 1009: Publish Dashboard Framework**
- ✅ Test S3 publish path (should generate S3 URL)
- ✅ Test Google Drive publish path (should generate Drive URL)
- ✅ Test HIPAA_MODE=true (should use signed URL)
- ✅ Test HIPAA_MODE=false (should use public URL)

**Node 1010: Build Manager Status Response**
- ✅ Test response schema (should match standardized format)
- ✅ Test execution_time_ms tracking (should calculate correctly)
- ✅ Test with control_action (should include in metadata)

**Node 1011: Notify Alerts Framework**
- ✅ Test with no alerts (should skip notifications)
- ✅ Test Slack message formatting (should have blocks)
- ✅ Test Email HTML formatting (should have color-coded alerts)
- ✅ Test with >10 alerts (should truncate Slack message)

**Node 1013: Error Handler**
- ✅ Test error categorization (env, health, dependency, kpi, dashboard, alert)
- ✅ Test compliance event structure
- ✅ Test trace_id retrieval from previous node

---

### Integration Tests (End-to-End)

**Test 1: Scheduled Execution (Happy Path)**
```javascript
// Trigger: Cron schedule (*/15 * * * *)
// Expected:
// - All modules healthy
// - No alerts
// - Dashboard published to S3
// - manager_status.json returned
// - No notifications sent (no alerts)
// - Execution time < 5000ms
```

**Test 2: Module Down Scenario**
```javascript
// Setup: Stop Module 02 workflow in n8n
// Trigger: Manual execution
// Expected:
// - Module 02 status = 'down'
// - Dependency alert: "Module down in critical path"
// - System health = 'critical'
// - Alert sent to Slack + Email
// - Dashboard shows Module 02 card with red border
```

**Test 3: Missing Environment Variable**
```javascript
// Setup: Unset STRIPE_CREDENTIAL_ID, enable Module 04
// Trigger: Manual execution
// Expected:
// - validation.env_ok = false
// - missing_vars includes 'STRIPE_CREDENTIAL_ID'
// - Critical alert: "Missing Required Environment Variable"
// - Alert sent to Slack + Email
```

**Test 4: KPI Threshold Breach**
```javascript
// Setup: Set KPI_THRESHOLDS_JSON={"min_leads_24h": 100}
// Trigger: Manual execution (with leads_24h < 100)
// Expected:
// - KPI alert: "Lead volume below threshold"
// - Alert sent to Slack + Email
// - Dashboard shows warning in KPI section
```

**Test 5: Control Endpoint - Test Action**
```javascript
// Trigger: POST /manager/control {"action": "test"}
// Expected:
// - control_action = 'test'
// - Runs synthetic test (if implemented)
// - Returns manager_status.json with control_action in metadata
// - Logs to Module 09: orchestration_test event
```

**Test 6: Control Endpoint - Reload Config**
```javascript
// Trigger: POST /manager/control {"action": "reload-config"}
// Expected:
// - Refetches CONFIG_URL (if set)
// - Reloads configuration
// - Returns updated manager_status.json
```

**Test 7: Error Handling**
```javascript
// Setup: Break Node 1006 (e.g., invalid Google Sheets ID)
// Trigger: Manual execution
// Expected:
// - Error caught by Node 1013
// - stage = 'kpi_aggregation'
// - Compliance event posted to Module 09
// - Error response returned with trace_id
// - HTTP 500 status code
```

**Test 8: HIPAA Mode Signed URLs**
```javascript
// Setup: HIPAA_MODE=true, SIGNED_URL_TTL_SECONDS=600
// Trigger: Manual execution
// Expected:
// - Dashboard URL includes X-Amz-Signature
// - expires_at = now + 600 seconds
// - URL works for 10 minutes, then expires
```

**Test 9: Anonymized Dashboard**
```javascript
// Setup: ANONYMIZE_DASHBOARD=true
// Trigger: Manual execution
// Expected:
// - Dashboard hides IPs, internal endpoints
// - Footer shows "⚠️ Anonymized dashboard (HIPAA Mode enabled)"
```

**Test 10: High Alert Volume**
```javascript
// Setup: Disable all modules except 01, 09
// Trigger: Manual execution
// Expected:
// - Multiple dependency alerts (critical path broken)
// - Slack message truncates after 5 critical alerts
// - Email includes all alerts
// - Dashboard shows all alerts
```

---

### Performance Tests

**Target Execution Time:** <5000ms (P95)

**Breakdown by Node:**
- Load Config (1002): <100ms
- Env Validation (1003): <50ms
- Health Checks (1004): <3000ms (parallel HTTP requests)
- Dependency Graph (1005): <50ms
- KPI Aggregation (1006): <500ms (Google Sheets read)
- Alert Rules (1007): <50ms
- Render Dashboard (1008): <500ms (HTML generation)
- Publish Dashboard (1009): <1000ms (S3/Drive upload)
- Build Response (1010): <50ms
- Notify Alerts (1011): <500ms (Slack + Email)

**Total Estimated:** ~4800ms

**Optimization Tips:**
- **Parallel Health Checks:** Use n8n Split In Batches node to ping modules concurrently
- **Cache KPIs:** Store KPIs in memory for 5 minutes, avoid repeated Sheets reads
- **Async Notifications:** Fire-and-forget Slack/Email (don't wait for delivery)

---

## Operations Guide

### Daily Operations

**Morning Checklist:**
1. Open Manager Dashboard (check email for overnight alerts)
2. Review system health overview (all modules healthy?)
3. Check KPIs (leads, bookings, revenue trending up?)
4. Investigate any alerts (follow action items)

**Weekly Operations:**
1. Review alert history (are thresholds tuned correctly?)
2. Check execution time trends (optimize if degrading)
3. Validate dependency graph integrity
4. Review KPI trends vs previous week

**Monthly Operations:**
1. Audit module health history (identify flaky modules)
2. Review and adjust KPI thresholds
3. Update module endpoints if workflows changed
4. Test disaster recovery (simulate all modules down)

---

### Responding to Alerts

**Critical: Module Down**
```bash
# 1. Check n8n workflow execution history
# n8n UI → Workflows → [Module Name] → Executions

# 2. Look for recent errors
# Filter: Status = Error, Last 24 hours

# 3. Common Causes:
# - Credential expired (reauthorize OAuth)
# - API rate limit exceeded (wait + retry)
# - External service down (check status page)
# - Workflow code error (review error message)

# 4. Restart workflow
# n8n UI → Workflows → [Module Name] → Active toggle (off → on)

# 5. Verify recovery
# Wait 15 minutes for next Manager orchestration run
# Check dashboard: Module should show 'healthy'
```

**Critical: Dependency Path Broken**
```bash
# 1. Identify broken module (alert specifies which module)
# 2. Follow "Module Down" procedure above
# 3. Verify downstream modules recover
# Example: If Module 02 down, also check 03, 04, 05
```

**Critical: Missing Environment Variable**
```bash
# 1. Identify missing variable (alert specifies which)
# 2. Set variable in n8n environment
# n8n UI → Settings → Environment Variables → Add

# 3. Restart affected workflows
# 4. Verify alert clears on next orchestration run
```

**Warning: Module Degraded**
```bash
# 1. Module running but errors >= threshold (default 5)
# 2. Review error logs (identify error pattern)
# 3. Common Causes:
# - Intermittent API failures (increase retry count)
# - Invalid input data (add validation)
# - Timeout too low (increase timeout)

# 4. Fix root cause
# 5. Monitor: Alert should clear when errors < threshold
```

**Warning: KPI Threshold Breach**
```bash
# 1. Check business context (seasonal dip? marketing campaign ended?)
# 2. Review KPI trends in Module 07 Analytics Dashboard
# 3. Investigate upstream modules:
# - Low leads: Check Module 01 (marketing channels)
# - Low conversion: Check Module 02 (booking UX)
# - Low NPS: Check Module 05 (followup campaigns)

# 4. Adjust thresholds if needed:
# Edit KPI_THRESHOLDS_JSON in .env
```

---

### Control Endpoint Usage

**Start All Modules:**
```bash
curl -X POST https://n8n.yourclinic.com/webhook/manager/control \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# Response:
# {
#   "success": true,
#   "control_action": "start",
#   "message": "All modules enabled"
# }
```

**Stop All Modules (Maintenance Mode):**
```bash
curl -X POST https://n8n.yourclinic.com/webhook/manager/control \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'

# Use Case: System maintenance, database migration
```

**Run Synthetic Test:**
```bash
curl -X POST https://n8n.yourclinic.com/webhook/manager/control \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}'

# Response includes synthetic test results
# Validates end-to-end flow (01→02 stub + 09 compliance log)
```

**Reload Configuration:**
```bash
curl -X POST https://n8n.yourclinic.com/webhook/manager/control \
  -H "Content-Type: application/json" \
  -d '{"action": "reload-config"}'

# Use Case: CONFIG_URL updated with new feature flags
```

---

### Monitoring & Observability

**Key Metrics to Track:**
- **Orchestration Success Rate:** >99% (failed executions / total executions)
- **Execution Time:** <5000ms P95
- **Module Health:** % of time each module is healthy
- **Alert Volume:** Alerts per day (tune thresholds if >10/day)
- **Dashboard Access:** Views per day (if HIPAA_MODE, track signed URL usage)

**Recommended Monitoring Tools:**
- **n8n Execution History:** Track workflow failures
- **External Monitoring:** Pingdom, UptimeRobot (ping dashboard URL)
- **Log Aggregation:** Elasticsearch, Splunk (ingest n8n logs)
- **APM:** Datadog, New Relic (query manager_status.json endpoint)

**Alerting Best Practices:**
- **Escalation Policy:** Critical → Page on-call, Warning → Email ops team
- **Alert Fatigue:** If >10 alerts/day, increase ERROR_THRESHOLD or tune KPI_THRESHOLDS_JSON
- **False Positives:** Review weekly, disable noisy alerts

---

## Troubleshooting

### Common Issues

**Issue: All Modules Showing 'Down' Status**

**Symptoms:**
- Dashboard shows all modules with red 'down' status
- Health check errors in execution log

**Diagnosis:**
```bash
# Check if health endpoints exist
curl https://n8n.yourclinic.com/webhook/intake-lead/health

# If 404: Health endpoints not implemented
```

**Solution:**
```bash
# Option A: Implement health endpoints in each module
# Add webhook node: /health → return { status: 'healthy', last_run: '...', errors_24h: 0 }

# Option B: Use n8n API (fallback)
# Set N8N_API_BASE and N8N_API_TOKEN in .env
# Module 10 will query workflow execution history
```

---

**Issue: Dashboard Not Publishing (Blank URL)**

**Symptoms:**
- manager_status.json shows `dashboard_html: null`
- No error in execution log

**Diagnosis:**
```bash
# Check storage configuration
echo $DASHBOARD_STORAGE  # Should be 's3' or 'google_drive'
echo $S3_DASHBOARD_BUCKET  # Should be set if using S3
echo $GOOGLE_DRIVE_FOLDER_ID  # Should be set if using Drive
```

**Solution:**
```bash
# Set missing env vars
DASHBOARD_STORAGE=s3
S3_DASHBOARD_BUCKET=aigent-dashboards
AWS_CREDENTIAL_ID=17

# Or use Google Drive
DASHBOARD_STORAGE=google_drive
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
GOOGLE_DRIVE_CREDENTIAL_ID=22
```

---

**Issue: Signed URLs Expiring Too Quickly**

**Symptoms:**
- Dashboard URL works initially, then shows 403 Forbidden
- HIPAA_MODE=true

**Diagnosis:**
```bash
# Check TTL setting
echo $SIGNED_URL_TTL_SECONDS  # Default: 3600 (1 hour)
```

**Solution:**
```bash
# Increase TTL for longer access
SIGNED_URL_TTL_SECONDS=86400  # 24 hours

# Note: Longer TTL = less secure
# HIPAA recommendation: <2 hours
```

---

**Issue: KPIs Showing as 0 or Null**

**Symptoms:**
- Dashboard KPI section shows all zeros
- No KPI alerts even though metrics should be breached

**Diagnosis:**
```bash
# Check Module 07 data source
echo $GOOGLE_SHEET_ID  # Should be set
echo $GOOGLE_SHEETS_CREDENTIAL_ID  # Should be set

# Verify Module 07 is writing KPIs to sheet
# Open Google Sheet → Check for recent data
```

**Solution:**
```bash
# Ensure Module 07 Analytics is running
# Check n8n → Workflows → Module 07 → Active: ON

# Verify sheet structure:
# Column A: metric_name (e.g., 'leads_24h')
# Column B: period (e.g., '24h')
# Column C: value (e.g., 15)
# Column D: timestamp (e.g., '2025-10-30T12:00:00Z')

# Grant n8n service account read access to sheet
```

---

**Issue: Alerts Not Sending to Slack/Email**

**Symptoms:**
- Dashboard shows alerts, but no Slack/Email received
- notifications.sent = false

**Diagnosis:**
```bash
# Check alert channel configuration
echo $SLACK_WEBHOOK_URL  # Should start with https://hooks.slack.com/
echo $ALERT_EMAIL  # Should be valid email
echo $SENDGRID_CREDENTIAL_ID  # Should be set for email
```

**Solution:**
```bash
# Test Slack webhook manually
curl -X POST $SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text":"Test from Module 10"}'

# If successful, webhook is valid
# If error, regenerate webhook in Slack

# Test SendGrid credential
# n8n UI → Credentials → SendGrid → Test

# If SendGrid test fails, reauthorize API key
```

---

**Issue: Execution Time Exceeds 5000ms**

**Symptoms:**
- manager_status.json shows execution_time_ms > 5000
- Dashboard feels slow to load

**Diagnosis:**
```bash
# Review execution log in n8n
# Identify slowest nodes (look for timeout warnings)

# Common bottlenecks:
# - Health checks taking >3000ms (sequential pings)
# - Google Sheets read taking >1000ms (large dataset)
# - S3 upload taking >2000ms (large HTML file)
```

**Solution:**
```bash
# 1. Parallelize health checks
# Use Split In Batches node to ping modules concurrently

# 2. Optimize Google Sheets read
# Read only last 100 rows (not entire sheet)
# Add index column, sort by timestamp DESC, LIMIT 100

# 3. Optimize S3 upload
# Compress HTML with gzip before upload
# Use multipart upload for large files

# 4. Cache KPIs
# Store KPIs in memory for 5 minutes
# Avoid repeated Sheets reads on every orchestration run
```

---

**Issue: Error Handler Not Catching Errors**

**Symptoms:**
- Workflow fails without posting to Module 09
- No error response returned

**Diagnosis:**
```bash
# Check error handler configuration
# Node 1013 should have: onError: 'continueErrorOutput'

# Verify all nodes connect to error handler
# Draw connection from each node's error output to Node 1013
```

**Solution:**
```bash
# In n8n UI:
# 1. Click on Node 1013 (Error Handler)
# 2. Check "On Error" setting = "Continue Error Output"
# 3. Ensure all nodes have error connections drawn

# For nodes that should never fail:
# Set continueOnFail: true (e.g., alert notifications)
```

---

## Future Enhancements

### Roadmap for v1.1+

**1. Predictive Alerting (ML-Based Anomaly Detection)**
```javascript
// Analyze historical trends
// Alert when metrics deviate from expected range
// Example: "Lead volume is 30% below typical Thursday levels"

// Implementation:
// - Collect 90 days of KPI history
// - Train time-series model (ARIMA, Prophet)
// - Calculate confidence intervals
// - Alert when current value outside 95% confidence interval
```

**2. Auto-Remediation (Self-Healing)**
```javascript
// Automatically restart failed workflows
// Example: If Module 02 down for >15 minutes, restart workflow via n8n API

// Implementation:
// POST /workflows/{workflow_id}/activate
// Log remediation action to Module 09
// Alert ops team of auto-remediation

// Safety:
// - Max 3 auto-restarts per hour (prevent infinite loops)
// - Only for specific error types (not configuration errors)
```

**3. Synthetic Transactions (End-to-End Tests)**
```javascript
// Periodic end-to-end tests of patient journey
// Example: Every 6 hours, create test lead → booking → session

// Implementation:
// - POST test lead to Module 01 (with test_mode flag)
// - Verify propagation through 02 → 03 → 04
// - Cleanup test data after verification
// - Alert if any stage fails

// Benefits:
// - Validates entire critical path
// - Catches integration issues before users
```

**4. Custom Dashboard Widgets**
```javascript
// Allow clinics to add custom metrics to dashboard
// Example: "Average wait time", "Patient satisfaction by provider"

// Implementation:
// - Define custom widget schema in CONFIG_URL
// - Render custom widgets in dashboard HTML
// - Support chart types: line, bar, pie, gauge
```

**5. Multi-Tenant Support**
```javascript
// Support multiple clinics in single n8n instance
// Each clinic has isolated dashboard + alerts

// Implementation:
// - Add clinic_id to all module webhooks
// - Filter health checks + KPIs by clinic_id
// - Separate dashboards per clinic
// - Separate alert channels per clinic
```

**6. Advanced Dependency Visualization**
```javascript
// Interactive dependency graph in dashboard
// Click module → see upstream/downstream dependencies

// Implementation:
// - Use D3.js or Mermaid.js for graph rendering
// - Color-code edges by health (green=healthy, red=broken)
// - Show data flow direction with arrows
```

**7. Compliance Report Generation**
```javascript
// Monthly compliance reports for auditors
// Example: "99.8% uptime, 0 HIPAA violations, 12,543 audit events"

// Implementation:
// - Query Module 09 for monthly audit summary
// - Generate PDF report with charts
// - Email to compliance team
// - Store in S3 for 7 years
```

**8. Intelligent Alert Routing**
```javascript
// Route alerts to specific teams based on category
// Example: Config alerts → DevOps, KPI alerts → Business team

// Implementation:
// - Define alert routing rules in CONFIG_URL
// - Multiple Slack channels per alert category
// - PagerDuty integration for critical alerts
```

---

## Appendix

### Environment Variable Reference

See [.env.aigent_module_10_example](C:\Users\bluel\Dropbox\Daniels Docs\Daniel\Aigent\10_System_Orchestration\.env.aigent_module_10_example) for complete documentation.

**Core Variables:**
- `BRAND_NAME` - Clinic name
- `N8N_INSTANCE_ID` - Instance identifier
- `TIMEZONE` - Timezone for timestamps
- `HIPAA_MODE` - Enable signed URLs (true/false)
- `MANAGER_SCHEDULE_CRON` - Orchestration schedule

**Module Endpoints:**
- `MODULE_01_ENDPOINT` through `MODULE_09_ENDPOINT`
- `MODULE_01_HEALTH` through `MODULE_09_HEALTH`
- `ENABLED_01_INTAKE` through `ENABLED_09_COMPLIANCE`

**Storage:**
- `DASHBOARD_STORAGE` - s3 or google_drive
- `S3_DASHBOARD_BUCKET` - S3 bucket name
- `GOOGLE_DRIVE_FOLDER_ID` - Drive folder ID
- `SIGNED_URL_TTL_SECONDS` - URL expiry (default 3600)

**Alerts:**
- `SLACK_WEBHOOK_URL` - Slack webhook
- `ALERT_EMAIL` - Email recipients
- `ERROR_THRESHOLD` - Degraded threshold (default 5)

**KPIs:**
- `GOOGLE_SHEET_ID` - Module 07 output sheet
- `KPI_THRESHOLDS_JSON` - Threshold configuration (JSON)

---

### manager_status.json Schema

```typescript
interface ManagerStatus {
  success: boolean;
  timestamp: string; // ISO 8601
  env_ok: boolean;

  modules: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'down' | 'disabled';
      last_run: string | null; // ISO 8601
      errors_24h: number;
      response_time_ms: number | null;
      enabled: boolean;
    };
  };

  kpis: {
    leads_24h: number;
    bookings_24h: number;
    revenue_24h_usd: number;
    nps_avg_30d: number | null;
    errors_24h: number;
  };

  alerts: Array<{
    severity: 'critical' | 'warning';
    category: 'configuration' | 'health' | 'dependency' | 'performance';
    module?: string;
    title: string;
    message: string;
  }>;

  links: {
    dashboard_html: string | null;
    analytics_report: string | null;
    audit_stream: string | null;
  };

  metadata: {
    version: string;
    manager: string;
    instance_id: string;
    trace_id: string;
    execution_time_ms: number;
    control_action: string | null;
    hipaa_mode: boolean;
  };
}
```

---

### Dashboard HTML Schema

**Sections:**
1. Header - Brand name, timestamp
2. System Health Overview - 4 metric cards
3. Active Alerts - Alert boxes (if any)
4. Module Status - Grid of module cards
5. Key Performance Indicators - 6 KPI tiles
6. System Information - Trace ID, version, HIPAA mode
7. Footer - Support email, anonymization notice

**Color Palette:**
- Primary: `#4f46e5` (Indigo)
- Accent: `#7c3aed` (Purple)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Error: `#ef4444` (Red)
- Neutral: `#6b7280` (Gray)

---

### Compliance Event Schema (Module 09)

```typescript
interface OrchestrationEvent {
  module: 'Module_10_System_Orchestration_Manager';
  event: 'orchestration_start' | 'orchestration_complete' | 'orchestration_error' | 'control_action';
  timestamp: string; // ISO 8601
  severity: 'info' | 'warning' | 'high';
  actor: {
    type: 'system';
    id: 'manager_orchestration';
    ip: null;
  };
  resource: {
    type: 'orchestration_workflow';
    id: 'manager_dashboard';
  };
  payload: {
    system_health?: 'healthy' | 'degraded' | 'critical';
    total_alerts?: number;
    execution_time_ms?: number;
    control_action?: 'start' | 'stop' | 'test' | 'reload-config';
    error_message?: string;
    error_stage?: string;
  };
  trace_id: string;
}
```

---

## Credits & Validation

**Built By:** Master Automation Architect
**Validated By:**
- **Serena:** Syntax validation, node wiring, retry logic
- **Context7:** Cross-module schema alignment, endpoint consistency

**Cross-Module Integration:**
- Module 07 (Analytics): KPI data source
- Module 09 (Compliance): Audit logging
- Modules 01-09: Health monitoring

**References:**
- CROSS_MODULE_ANALYSIS.md - Dependency mapping
- Aigent_Module_07_README.md - KPI schema
- Aigent_Module_09_README.md - Compliance schema

---

**End of Build Notes**
For support: support@aigent.company
Documentation: https://docs.aigent.company/templates/module-10-orchestration
