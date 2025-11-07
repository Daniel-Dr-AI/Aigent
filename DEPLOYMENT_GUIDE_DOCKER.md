# Aigent Docker Deployment Guide

## Overview

This guide covers deploying the Aigent workflow suite to a Docker self-hosted n8n environment using environment variables loaded from `.env` files.

**Migration Status:** ✅ Complete - All workflows converted from Cloud `$vars` to Docker-compatible `$env`

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Setup](#environment-setup)
4. [Importing Workflows](#importing-workflows)
5. [Testing & Validation](#testing--validation)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Software

- Docker Desktop (v20.10+) or Docker Engine + Docker Compose
- Git (for version control)
- Text editor (VS Code recommended)

### Required Accounts & Services

Depending on which modules you're deploying:

- **Google Workspace** (for Google Sheets data storage)
- **SendGrid** (for email notifications)
- **Twilio** (optional - for SMS/WhatsApp)
- **Airtable** (optional - Enterprise alternative to Google Sheets)
- **Telegram Bot** (optional - for Telegram messaging)
- **Video Platform** (optional - Zoom, Doxy.me, or similar)

---

## Quick Start

### 1. Clone/Download the Repository

```bash
cd /path/to/aigent
```

### 2. Create Environment File

```bash
# Copy the template
cp .env.template .env

# Edit with your values
nano .env  # or use your preferred editor
```

### 3. Start Docker Environment

```bash
# Start n8n with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f n8n
```

### 4. Access n8n

Open your browser to: `http://localhost:5678`

Create an admin account on first launch.

### 5. Import Workflows

Navigate to:
- **Core Modules:** `Aigent_Modules_Core/*_env.json`
- **Enterprise Modules:** `Aigent_Modules_Enterprise/*_env.json`

Use n8n's "Import from File" feature to import each workflow.

---

## Environment Setup

### Essential Environment Variables

The following variables are **required** for basic operation:

```bash
# Minimum viable configuration
ALLOWED_ORIGINS=https://yourdomain.com
CLINIC_NAME=Your Clinic Name
CLINIC_PHONE=+1-555-0100
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SHEET_TAB=Sheet1
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
N8N_BASE_URL=http://localhost:5678
```

### Optional Feature Toggles

```bash
# Enterprise Features
API_KEY_ENABLED=true          # Enable API authentication
API_KEY=your_secure_api_key

# Rate Limiting
RATE_LIMIT_ENABLED=true
MAX_CAMPAIGNS_PER_HOUR=10
```

### Complete Variable Reference

See [environment_variables_reference.md](migration_reports/environment_variables_reference.md) for a complete list of all 38 environment variables and their usage across modules.

---

## Importing Workflows

### Import Order

For best results, import workflows in this order:

1. **Module 01** (Intake/Lead Capture) - Foundation module
2. **Module 10** (System Orchestration) - Coordinates other modules
3. **Modules 02-09** - Import in any order based on your needs

### Import Process

1. In n8n, click **Workflows** → **Import from File**
2. Select a workflow JSON file (e.g., `module_01_core_v2_env.json`)
3. Click **Import**
4. Activate the workflow using the toggle switch

### Core vs Enterprise

- **Core Modules** (`module_XX_core_v2.json`): Basic functionality, Google Sheets storage
- **Enterprise Modules** (`module_XX_enterprise.json`): Advanced features, API auth, rate limiting, Airtable support

Choose the version that matches your needs. Do not import both versions of the same module.

---

## Configuring n8n Credentials

Some integrations require credentials to be configured in n8n's credential manager:

### Required Credentials

1. **Google Sheets API**
   - Type: OAuth2 or Service Account
   - Used by: All modules for data storage
   - Setup: Follow n8n's Google Sheets credential guide

2. **SendGrid API**
   - Type: API Key
   - Used by: Modules 02, 03, 04, 05, 08
   - API Key: From SendGrid dashboard

3. **Twilio API** (Optional)
   - Type: API credentials
   - Used by: Module 08 (Messaging)
   - Account SID + Auth Token: From Twilio console

### Credential Setup Steps

1. Go to **Settings** → **Credentials** in n8n
2. Click **Add Credential**
3. Search for the service (e.g., "Google Sheets")
4. Follow the OAuth flow or enter API keys
5. Name the credential (e.g., "Aigent Google Sheets")
6. Save

### Linking Credentials to Workflows

After importing workflows:

1. Open each workflow
2. Click on nodes that show a credential warning (red triangle)
3. Select the credential you created
4. Save the workflow

---

## Testing & Validation

### Pre-Deployment Checklist

- [ ] All environment variables configured in `.env`
- [ ] Docker container running (`docker ps` shows n8n)
- [ ] n8n accessible at http://localhost:5678
- [ ] All credentials configured in n8n
- [ ] Workflows imported and activated

### Module 01 - Test Lead Submission

```bash
# Test webhook endpoint
curl -X POST http://localhost:5678/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test@example.com",
    "phone": "+15550100",
    "interest": "General Inquiry"
  }'
```

Expected response: `{"success": true, "trace_id": "LEAD-..."}`

### Check Logs

```bash
# View n8n logs
docker-compose logs -f n8n

# Check for errors
docker-compose logs n8n | grep -i error

# View recent executions in n8n UI
# Go to: Executions → View recent runs
```

### Using Mock Data

The project includes test data in `Aigent_Testing_Teaching_Pack/`:

- **Happy Path**: `happy_path_leads.json` - Valid test data
- **Invalid Data**: `invalid_data.json` - Test error handling
- **Edge Cases**: `edge_cases.json` - Boundary conditions

Use n8n's "Test Workflow" feature with this mock data.

---

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

**Symptom:** Workflows fail with "undefined" or empty values

**Solution:**
```bash
# Restart n8n to reload .env
docker-compose down
docker-compose up -d

# Verify variables loaded
docker-compose exec n8n env | grep CLINIC_NAME
```

#### 2. Credential Errors

**Symptom:** "Credentials not found" or authentication failures

**Solution:**
- Re-create credentials in n8n UI
- Ensure OAuth tokens haven't expired
- Check credential names match workflow nodes

#### 3. Webhook Not Found (404)

**Symptom:** `POST /webhook/intake-lead` returns 404

**Solution:**
- Ensure workflow is **activated** (toggle switch on)
- Check webhook path matches exactly
- Verify no typos in webhook node configuration

#### 4. Google Sheets Permission Denied

**Symptom:** "Insufficient permissions" when writing to sheet

**Solution:**
- Share the Google Sheet with the service account email
- Grant "Editor" permissions
- For OAuth: Ensure scopes include `spreadsheets`

### Debug Mode

Enable verbose logging:

```bash
# Add to .env
N8N_LOG_LEVEL=debug

# Restart
docker-compose restart n8n
```

### Checking Migration Success

```bash
# Verify no $vars remain (should return nothing)
grep -r "\$vars\." Aigent_Modules_Core/*_env.json Aigent_Modules_Enterprise/*_env.json

# Verify $env is used (should show many matches)
grep -r "\$env\." Aigent_Modules_Core/*_env.json | wc -l
```

---

## Production Deployment

### Security Hardening

1. **Set n8n Encryption Key**
   ```bash
   # Generate secure key
   openssl rand -base64 32

   # Add to .env
   N8N_ENCRYPTION_KEY=your_generated_key
   ```

2. **Enable HTTPS**
   - Use reverse proxy (Nginx, Caddy, Traefik)
   - Obtain SSL certificate (Let's Encrypt recommended)
   - Update `N8N_BASE_URL` to HTTPS URL

3. **Enable API Authentication**
   ```bash
   API_KEY_ENABLED=true
   API_KEY=generate_strong_random_key
   ```

4. **Restrict CORS Origins**
   ```bash
   # Only allow your domain
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

5. **Use Secrets Management**
   - Consider Docker Secrets or HashiCorp Vault
   - Never commit `.env` to version control
   - Rotate API keys regularly

### Database Configuration

For production, use PostgreSQL instead of SQLite:

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:14
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data

  n8n:
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
```

### Backup Strategy

```bash
# Backup workflows (export from n8n UI)
# Backup database
docker-compose exec postgres pg_dump -U n8n n8n > backup_$(date +%Y%m%d).sql

# Backup environment
cp .env .env.backup_$(date +%Y%m%d)

# Backup execution history
docker-compose exec n8n n8n export:workflow --all --output=/data/workflows_backup.json
```

### Monitoring

Recommended monitoring solutions:

- **Uptime:** UptimeRobot, Pingdom
- **Logs:** ELK Stack, Grafana Loki
- **Metrics:** Prometheus + Grafana
- **Alerts:** Configure `OBSERVABILITY_WEBHOOK_URL` for Slack/Discord

---

## Module Reference

### Module Overview

| Module | Name | Core | Enterprise | Description |
|--------|------|------|------------|-------------|
| 01 | Intake/Lead Capture | ✅ | ✅ | Form submissions, lead intake |
| 02 | Consult Booking | ✅ | ✅ | Appointment scheduling |
| 03 | Telehealth Session | ✅ | ✅ | Video call management |
| 04 | Billing & Payments | ✅ | ✅ | Payment processing |
| 05 | Follow-up Retention | ✅ | ✅ | Patient engagement campaigns |
| 06 | Document OCR | ✅ | ✅ | Document processing, OCR |
| 07 | Analytics Dashboard | ✅ | ✅ | Metrics and reporting |
| 08 | Messaging Omnichannel | ✅ | ✅ | Multi-channel messaging |
| 09 | Compliance & Audit | ✅ | ✅ | Compliance logging, HIPAA |
| 10 | System Orchestration | ✅ | ✅ | Inter-module coordination |

### File Naming Convention

- **Core V2**: `module_XX_core_v2_env.json` (Recommended)
- **Core V1**: `module_XX_core_env.json` (Legacy)
- **Enterprise**: `module_XX_enterprise_env.json`

---

## Migration Notes

### What Changed

All workflow files have been converted from:
```javascript
{{$vars.CLINIC_NAME}}  // Cloud n8n Variables
```

To:
```javascript
{{$env.CLINIC_NAME}}   // Docker Environment Variables
```

### Conversion Statistics

- **Total Files Processed:** 30
- **Total References Converted:** 220
- **Remaining $vars:** 0
- **Success Rate:** 100%

### Backup Location

Original (pre-migration) workflows are backed up in:
```
backup_pre_env/
├── Aigent_Modules_Core/
└── Aigent_Modules_Enterprise/
```

To restore original files:
```bash
cp -r backup_pre_env/Aigent_Modules_Core/* Aigent_Modules_Core/
cp -r backup_pre_env/Aigent_Modules_Enterprise/* Aigent_Modules_Enterprise/
```

---

## Next Steps

1. ✅ Import workflows to n8n
2. ⬜ Configure credentials
3. ⬜ Test each module with mock data
4. ⬜ Configure webhook URLs in your frontend
5. ⬜ Set up monitoring and alerts
6. ⬜ Plan production deployment
7. ⬜ Train team on workflow usage

---

## Support & Resources

- **Migration Report:** [vars_to_env_report.md](migration_reports/vars_to_env_report.md)
- **Environment Variables:** [environment_variables_reference.md](migration_reports/environment_variables_reference.md)
- **Testing Pack:** `Aigent_Testing_Teaching_Pack/`
- **n8n Documentation:** https://docs.n8n.io
- **Docker Documentation:** https://docs.docker.com

---

## Changelog

### v2.0.0 (2025-11-07)
- Converted all workflows from Cloud `$vars` to Docker `$env`
- Generated environment variable templates
- Created comprehensive deployment guide
- Added backup for all original workflows

---

*Deployment guide generated as part of Aigent Docker Migration v1.0*
