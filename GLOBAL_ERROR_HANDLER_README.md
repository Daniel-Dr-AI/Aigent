# Aigent Global Error Handler

## Overview

Universal error handling workflow for all Aigent modules (Core & Enterprise). Completely integration-agnostic and scalable - supports any notification service, logging destination, or monitoring platform through environment variables.

**Version:** 2.0
**Type:** Error Workflow
**Compatibility:** All Aigent Core & Enterprise modules
**Architecture:** Modular, conditional routing based on available integrations

---

## Features

### ✅ **Universal Compatibility**
- Works with ANY integration (Slack, Discord, Teams, email, databases, etc.)
- No hard-coded service dependencies
- Automatically detects and uses available integrations
- Gracefully skips unavailable services

### ✅ **Security & Compliance**
- Optional sensitive data redaction (HIPAA, GDPR, PCI-DSS)
- Removes tokens, passwords, PHI, PII before external transmission
- Configurable redaction patterns
- Trace ID for audit trails

### ✅ **Flexible Notification**
- **Webhook:** Any HTTP endpoint (Slack, Discord, Teams, custom)
- **Email:** SMTP-based email notifications
- **Monitoring APIs:** Datadog, Sentry, New Relic, etc.
- Multiple destinations simultaneously

### ✅ **Flexible Logging**
- **Google Sheets:** Structured error log table
- **Database:** SQL/NoSQL database logging
- **File System:** Local file logging
- **Monitoring APIs:** External observability platforms

### ✅ **Standardized Responses**
- Returns HTTP 500 with structured JSON
- Includes trace ID in response header
- Consistent error format across all workflows

---

## Installation

### 1. Import Workflow

```bash
# In n8n UI
Workflows → Import from File → Select global_error_handler.json
```

### 2. Configure Environment Variables

Add to your `.env` file (only configure what you need):

```bash
#================================================
# Global Error Handler Configuration
#================================================

# --- Security ---
REDACT_SENSITIVE_DATA=true              # Enable/disable redaction
DEPLOYMENT_ENV=production               # Environment label

# --- Notifications (Optional - Configure ANY) ---
NOTIFICATION_WEBHOOK_URL=               # Slack, Discord, Teams, etc.
ERROR_EMAIL_ADDRESS=                    # Email notification recipient
ERROR_FROM_EMAIL=noreply@aigent.app     # Email sender

# --- Logging (Optional - Configure ANY) ---
ENABLE_ERROR_LOGGING=true               # Master switch for logging

## Option 1: Google Sheets
ERROR_LOG_SHEET_ID=                     # Google Sheet ID
ERROR_LOG_TAB=ErrorLog                  # Tab name (default: ErrorLog)

## Option 2: Database
ERROR_DB_CONNECTION=                    # Database connection string
ERROR_DB_TABLE=error_logs               # Table name

## Option 3: File System
ERROR_LOG_PATH=/var/log/aigent/errors.log

# --- Monitoring API (Optional) ---
MONITORING_API_URL=                     # Datadog, Sentry, etc.
MONITORING_API_KEY=                     # API authentication key
```

### 3. Configure n8n Credentials (Only if Using)

**For Email Notifications:**
- Settings → Credentials → Add Credential
- Type: SMTP
- Configure your SMTP server details

**For Google Sheets:**
- Settings → Credentials → Add Credential
- Type: Google Sheets OAuth2
- Authorize your Google account

### 4. Set as Error Workflow

For **each workflow** you want to protect:

1. Open the workflow
2. Settings → Error Workflow
3. Select: `Aigent_Global_Error_Handler`
4. Save

---

## Configuration Examples

### Example 1: Slack Only

```bash
REDACT_SENSITIVE_DATA=true
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
ENABLE_ERROR_LOGGING=false
```

**Result:** Errors go to Slack only, no logging.

---

### Example 2: Email + Google Sheets

```bash
REDACT_SENSITIVE_DATA=true
ERROR_EMAIL_ADDRESS=devops@yourcompany.com
ERROR_FROM_EMAIL=errors@aigent.app
ENABLE_ERROR_LOGGING=true
ERROR_LOG_SHEET_ID=1abc123def456
ERROR_LOG_TAB=ErrorLog
```

**Result:** Email notifications + structured logging to Google Sheets.

---

### Example 3: Full Observability Stack

```bash
REDACT_SENSITIVE_DATA=true
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
ERROR_EMAIL_ADDRESS=oncall@yourcompany.com
ENABLE_ERROR_LOGGING=true
ERROR_LOG_SHEET_ID=1abc123def456
MONITORING_API_URL=https://api.datadoghq.com/api/v1/events
MONITORING_API_KEY=your_datadog_api_key
```

**Result:**
- Slack notification
- Email to on-call
- Google Sheets log
- Datadog event tracking

---

### Example 4: Development (No Redaction)

```bash
REDACT_SENSITIVE_DATA=false
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/DEV/WEBHOOK
ENABLE_ERROR_LOGGING=true
ERROR_LOG_SHEET_ID=1dev_sheet_id
DEPLOYMENT_ENV=development
```

**Result:** Full error details (including sensitive data) for debugging.

---

## Error Object Structure

### Standardized Error Format

```json
{
  "success": false,
  "trace_id": "ERROR-Workflow_Name-execution_id-abc123",
  "timestamp": "2025-11-07T19:00:00.000Z",
  "execution": {
    "id": "12345",
    "mode": "trigger",
    "started_at": "2025-11-07T18:59:50.000Z",
    "stopped_at": "2025-11-07T19:00:00.000Z"
  },
  "workflow": {
    "id": "67890",
    "name": "Aigent_Module_01_Core_V2",
    "active": true
  },
  "error": {
    "message": "Connection refused: Database unavailable",
    "node": "Database Query Node",
    "node_type": "n8n-nodes-base.postgres",
    "stack": "Error: Connection refused...",
    "cause": null,
    "context": null
  },
  "environment": {
    "platform": "n8n",
    "version": "aigent-v2.0",
    "deployment": "production"
  }
}
```

### With Redaction Enabled

Sensitive fields are replaced with `[REDACTED]`:

```json
{
  "error": {
    "message": "Authentication failed",
    "context": {
      "username": "john.doe",
      "password": "[REDACTED]",
      "api_key": "[REDACTED]",
      "patient_ssn": "[REDACTED]"
    }
  }
}
```

---

## Workflow Logic

### Flow Diagram

```
Error Trigger
    ↓
Normalize Error Data (standardize format)
    ↓
Check Redaction? → [YES] → Redact Sensitive Data
                → [NO]  → Pass Through
    ↓
Check Webhook? → [YES] → Send Webhook Notification
               → [NO]  → Skip
    ↓
Check Email? → [YES] → Send Email
             → [NO]  → Skip
    ↓
Check Logging Enabled? → [YES] → Prepare Log Entry
                       → [NO]  → Skip to Response
    ↓
Check Google Sheets? → [YES] → Log to Sheets
                     → [NO]  → Skip
    ↓
Check Monitoring API? → [YES] → Send to Monitoring
                      → [NO]  → Skip
    ↓
Return 500 Error Response
```

### Conditional Routing

**Every integration check:**
- ✅ **TRUE:** Execute integration node
- ❌ **FALSE:** Skip gracefully, continue to next check
- 🔄 **Multiple:** Can execute multiple destinations in sequence

---

## Testing

### Test 1: Trigger a Test Error

Create a simple workflow:

```json
{
  "name": "Error_Test_Workflow",
  "nodes": [
    {
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger"
    },
    {
      "name": "Force Error",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "throw new Error('Test error for global handler');"
      }
    }
  ]
}
```

1. Set `Aigent_Global_Error_Handler` as error workflow
2. Execute the test workflow
3. Verify notifications/logs appear based on your config

### Test 2: Verify Redaction

```bash
# Enable redaction
REDACT_SENSITIVE_DATA=true
NOTIFICATION_WEBHOOK_URL=your_webhook_url

# Create error with sensitive data
throw new Error('Auth failed: password=secret123 api_key=abc123');

# Check webhook payload - should show [REDACTED]
```

### Test 3: Multiple Destinations

```bash
# Configure all destinations
NOTIFICATION_WEBHOOK_URL=...
ERROR_EMAIL_ADDRESS=...
ENABLE_ERROR_LOGGING=true
ERROR_LOG_SHEET_ID=...
MONITORING_API_URL=...

# Trigger error, verify all destinations receive notification
```

---

## Supported Integrations

### Notification Services

| Service | Configuration | Credential Needed |
|---------|--------------|-------------------|
| **Slack** | `NOTIFICATION_WEBHOOK_URL` | ❌ No |
| **Discord** | `NOTIFICATION_WEBHOOK_URL` | ❌ No |
| **Microsoft Teams** | `NOTIFICATION_WEBHOOK_URL` | ❌ No |
| **Email (SMTP)** | `ERROR_EMAIL_ADDRESS` | ✅ SMTP Credentials |
| **Custom Webhook** | `NOTIFICATION_WEBHOOK_URL` | ❌ No (optional auth header) |

### Logging Destinations

| Destination | Configuration | Credential Needed |
|------------|--------------|-------------------|
| **Google Sheets** | `ERROR_LOG_SHEET_ID` | ✅ Google OAuth2 |
| **PostgreSQL** | `ERROR_DB_CONNECTION` | ✅ DB Credentials |
| **MySQL** | `ERROR_DB_CONNECTION` | ✅ DB Credentials |
| **MongoDB** | `ERROR_DB_CONNECTION` | ✅ DB Credentials |
| **File System** | `ERROR_LOG_PATH` | ❌ No |

### Monitoring Platforms

| Platform | Configuration | Notes |
|----------|--------------|-------|
| **Datadog** | `MONITORING_API_URL` + `MONITORING_API_KEY` | Events API |
| **Sentry** | `MONITORING_API_URL` + `MONITORING_API_KEY` | DSN URL |
| **New Relic** | `MONITORING_API_URL` + `MONITORING_API_KEY` | Insights API |
| **Custom** | `MONITORING_API_URL` + `MONITORING_API_KEY` | Any HTTP endpoint |

---

## Redaction Patterns

### Default Sensitive Patterns

The workflow automatically redacts fields matching these patterns:

- `token` / `Token` / `TOKEN`
- `password` / `Password` / `PASSWORD`
- `secret` / `Secret` / `SECRET`
- `apikey` / `apiKey` / `API_KEY`
- `api_key` / `Api_Key`
- `bearer` / `Bearer`
- `authorization` / `Authorization`
- `ssn` / `SSN`
- `social security`
- `credit card` / `creditcard`
- `phi` / `PHI` (Protected Health Information)
- `pii` / `PII` (Personally Identifiable Information)
- `healthcare`
- `medical record`

### Custom Patterns

To add custom redaction patterns, edit the `Redact Sensitive Data` node:

```javascript
const sensitivePatterns = [
  /token/i,
  /password/i,
  // Add your custom patterns:
  /internal_id/i,
  /employee_number/i,
  /confidential/i
];
```

---

## Advanced Configuration

### Database Logging Schema

If using `ERROR_DB_CONNECTION`, create this table:

```sql
CREATE TABLE error_logs (
  id SERIAL PRIMARY KEY,
  trace_id VARCHAR(255) UNIQUE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  workflow_name VARCHAR(255) NOT NULL,
  workflow_id VARCHAR(100),
  execution_id VARCHAR(100),
  error_message TEXT,
  error_node VARCHAR(255),
  error_node_type VARCHAR(100),
  deployment_env VARCHAR(50),
  redacted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trace_id ON error_logs(trace_id);
CREATE INDEX idx_timestamp ON error_logs(timestamp);
CREATE INDEX idx_workflow_name ON error_logs(workflow_name);
```

### Google Sheets Setup

1. Create a new Google Sheet
2. Add headers to first row:
   ```
   trace_id | timestamp | workflow_name | workflow_id | execution_id | error_message | error_node | error_node_type | deployment_env | redacted
   ```
3. Copy Sheet ID from URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
4. Set `ERROR_LOG_SHEET_ID=SHEET_ID`

### Custom Monitoring API

For custom monitoring endpoints, the workflow sends:

```json
{
  "trace_id": "ERROR-...",
  "timestamp": "2025-11-07T19:00:00.000Z",
  "workflow_name": "Workflow Name",
  "error_message": "Error details",
  ...
}
```

Customize the `Send to Monitoring API` node for your API format.

---

## Troubleshooting

### Issue: No notifications received

**Check:**
1. Environment variables are set correctly in `.env`
2. n8n has restarted after env changes: `docker-compose restart n8n`
3. Error workflow is assigned to your workflow
4. Verify env vars loaded: `docker-compose exec n8n env | grep ERROR`

### Issue: Redaction not working

**Check:**
1. `REDACT_SENSITIVE_DATA=true` (exactly, case-sensitive)
2. Restart n8n after changing env var
3. Test with known sensitive field like `password`

### Issue: Google Sheets logging fails

**Check:**
1. Google Sheets credentials are configured in n8n
2. Sheet ID is correct
3. Sheet tab name matches `ERROR_LOG_TAB`
4. Google account has edit access to the sheet
5. Headers exist in row 1

### Issue: Email not sending

**Check:**
1. SMTP credentials configured in n8n
2. `ERROR_EMAIL_ADDRESS` is valid email
3. SMTP server allows connections from n8n host
4. Check n8n logs: `docker-compose logs n8n | grep -i smtp`

---

## Performance Considerations

### Async Execution

The error handler executes synchronously by default. For high-volume environments:

1. Use webhook notifications (fastest)
2. Avoid database logging on critical path
3. Use monitoring APIs with timeout limits

### Rate Limiting

To prevent notification spam during cascading failures:

```javascript
// Add to "Normalize Error Data" node:
const recentErrors = $getWorkflowStaticData('global');
const now = Date.now();
const windowMs = 5 * 60 * 1000; // 5 minutes

if (recentErrors.lastError && (now - recentErrors.lastError) < windowMs) {
  recentErrors.count = (recentErrors.count || 0) + 1;

  // Only notify every 10th error during window
  if (recentErrors.count % 10 !== 0) {
    return { ...standardError, _skip_notifications: true };
  }
} else {
  recentErrors.count = 1;
}

recentErrors.lastError = now;
return standardError;
```

---

## Best Practices

### ✅ Development

```bash
REDACT_SENSITIVE_DATA=false     # See full errors
NOTIFICATION_WEBHOOK_URL=...    # Dev Slack channel
DEPLOYMENT_ENV=development
```

### ✅ Staging

```bash
REDACT_SENSITIVE_DATA=true
NOTIFICATION_WEBHOOK_URL=...    # Staging Slack
ERROR_LOG_SHEET_ID=...          # Staging sheet
DEPLOYMENT_ENV=staging
```

### ✅ Production

```bash
REDACT_SENSITIVE_DATA=true
NOTIFICATION_WEBHOOK_URL=...    # Production alerts
ERROR_EMAIL_ADDRESS=oncall@...
ENABLE_ERROR_LOGGING=true
ERROR_LOG_SHEET_ID=...
MONITORING_API_URL=...
DEPLOYMENT_ENV=production
```

---

## Version History

**v2.0** (2025-11-07)
- Universal integration-agnostic architecture
- Conditional routing based on environment variables
- Sensitive data redaction
- Support for multiple notification channels
- Support for multiple logging destinations
- Standardized error response format
- Trace ID for error tracking
- HIPAA/GDPR compliance features

---

## Support

For issues or questions:
- GitHub: [Aigent Issues](https://github.com/Daniel-Dr-AI/Aigent/issues)
- Documentation: [DEPLOYMENT_GUIDE_DOCKER.md](DEPLOYMENT_GUIDE_DOCKER.md)

---

## License

Same as Aigent project license

---

*Global Error Handler v2.0 - Universal, Modular, Future-Proof*
