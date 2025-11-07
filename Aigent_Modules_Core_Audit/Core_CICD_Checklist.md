# Aigent Core Suite - CI/CD & Deployment Checklist

**Version**: 1.0.0
**Date**: 2025-11-06
**Purpose**: Complete workflow import/export, versioning, testing, and deployment guide

---

## Module Naming Standards

### File Naming Convention
```
module_{XX}_core.json
```

Examples:
- ✅ `module_01_core.json` (CORRECT)
- ❌ `Aigent_Module_01_Core.json` (too verbose)
- ❌ `m01.json` (too short)
- ❌ `intake.json` (not descriptive)

### Workflow Name Convention (inside JSON)
```json
{
  "name": "Aigent_Module_{XX}_Core_{Description}",
  "meta": {
    "version": "core-{MAJOR}.{MINOR}.{PATCH}",
    "branch": "Core"
  }
}
```

Examples:
- ✅ `Aigent_Module_01_Core_Intake_LeadCapture` (name)
  - `core-1.0.0` (version)
- ✅ `Aigent_Module_02_Core_Consult_Booking` (name)
  - `core-1.1.0` (version after fixes)

---

## Version Control

### Semantic Versioning (semver)

**Format**: `core-MAJOR.MINOR.PATCH`

| Part | When to Increment | Example |
|------|-------------------|---------|
| MAJOR | Breaking changes (schema changes, removed nodes) | 1.x.x → 2.0.0 |
| MINOR | New features (new nodes, new variables) | 1.0.x → 1.1.0 |
| PATCH | Bug fixes (no new features) | 1.0.0 → 1.0.1 |

**Current Versions** (as of audit):
- M01-M10: `core-1.0.0` (initial release)

**Recommended Version After Fixes**:
- M01-M10: `core-1.1.0` (CORS fixes, validation improvements = MINOR)

### Version Tracking

**Update in 3 places**:
1. **Workflow meta** (line ~268 in JSON):
```json
"meta": {
  "version": "core-1.1.0",  // ← HERE
  ...
}
```

2. **Module README** (first line):
```markdown
# Module 01: Intake & Lead Capture
**Version:** core-1.1.0  ← HERE
```

3. **Git Tag**:
```bash
git tag -a module-01-core-v1.1.0 -m "M01: CORS fixes, validation improvements"
git push origin module-01-core-v1.1.0
```

---

## Workflow Export/Import Process

### Exporting from n8n

#### Method 1: Manual Export (Single Workflow)
1. Open workflow in n8n
2. Click "⋮" (three dots) → "Download"
3. Save as `module_{XX}_core.json`
4. Move to repository: `Aigent_Modules_Core/`

#### Method 2: CLI Export (All Workflows)
```bash
# Export all workflows
n8n export:workflow --all --output=./exports

# Export specific workflow by ID
n8n export:workflow --id=123 --output=./exports/module_01_core.json

# Export with credentials (for backup)
n8n export:credentials --all --output=./exports/credentials.json
```

**⚠️ WARNING**: Never commit `credentials.json` to git (contains secrets)!

---

### Importing to n8n

#### Method 1: Manual Import (Single Workflow)
1. n8n → "Workflows" → "Import from File"
2. Select `module_{XX}_core.json`
3. Click "Import"
4. Connect credentials (Google Sheets, Stripe, etc.)
5. Set variables (GOOGLE_SHEET_ID, etc.)
6. **DO NOT ACTIVATE YET** - test first

#### Method 2: CLI Import (Batch)
```bash
# Import all workflows from directory
cd Aigent_Modules_Core
for file in module_*_core.json; do
  n8n import:workflow --input="$file"
done

# Import specific workflow
n8n import:workflow --input=module_01_core.json
```

#### Method 3: API Import (Automated CI/CD)
```bash
# Using n8n API
curl -X POST https://n8n.yourdomain.com/api/v1/workflows \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @module_01_core.json
```

---

## Pre-Deployment Checklist (Per Module)

### ✅ JSON Integrity
- [ ] Valid JSON syntax (use `jq . module_XX_core.json` to validate)
- [ ] All required keys present: `name`, `nodes`, `connections`, `active`, `settings`, `tags`, `meta`
- [ ] All node IDs unique
- [ ] All connections reference valid node IDs
- [ ] No orphan nodes (every node is connected)

### ✅ Variables Referenced
- [ ] All `$vars.{VAR_NAME}` have defaults or are documented
- [ ] No hardcoded secrets (API keys, credentials)
- [ ] `GOOGLE_SHEET_ID` referenced (or documented as required)
- [ ] `ALLOWED_ORIGINS` used instead of `"*"` ⚠️ CRITICAL

### ✅ Credentials Required
- [ ] Document in module README which credentials needed
- [ ] Test with credentials disconnected (should fail gracefully)
- [ ] Verify credential names match n8n settings

### ✅ Error Handling
- [ ] All nodes have `continueOnFail` set appropriately
  - Data nodes (Sheets, HTTP): `continueOnFail: true` (non-blocking)
  - Validation nodes: `continueOnFail: false` (should fail)
  - Response nodes: `continueOnFail: false` (must respond)
- [ ] Error connections exist (connect to error handler)
- [ ] All error paths return structured JSON with `success: false`

### ✅ Performance
- [ ] Nodes with external API calls have `timeout` set (5-15s)
- [ ] Retry logic configured: `retryOnFail: true`, `maxTries: 2-3`
- [ ] Parallel execution used where possible

### ✅ Metadata
- [ ] `tags` include: `Aigent-Core`, `Module-XX`, `SMB-Ready`
- [ ] `meta.version` matches README and git tag
- [ ] `meta.description` accurately describes module

---

## Testing Checklist (Per Module)

### Pre-Deployment Testing

#### Standalone Test
```bash
# Test with valid data
curl -X POST https://staging-n8n.yourdomain.com/webhook/{path} \
  -H "Content-Type: application/json" \
  -d @tests/module_XX_valid.json

# Expected: 200 + success response
```

#### Invalid Input Test
```bash
# Test with missing fields
curl -X POST https://staging-n8n.yourdomain.com/webhook/{path} \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'

# Expected: 400 + error message
```

#### CORS Test
```bash
# Test with wrong origin
curl -X POST https://staging-n8n.yourdomain.com/webhook/{path} \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d @tests/module_XX_valid.json

# Expected: 403 Forbidden
```

#### Load Test
```bash
# Send 100 requests
for i in {1..100}; do
  curl -X POST https://staging-n8n.yourdomain.com/webhook/{path} \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"User$i\",\"email\":\"user$i@test.com\",\"phone\":\"555-$i\"}" &
done
wait

# Expected: All succeed (or 61st returns 429 if rate limited)
```

#### Integration Test (if applicable)
```bash
# M02 depends on M01
# 1. Call M01 (get email)
# 2. Call M02 (use same email)
# 3. Verify both Sheets tabs populated
```

---

## Deployment Process

### Environment Strategy

**Environments**:
1. **Local Dev**: n8n on localhost:5678
2. **Staging**: staging-n8n.yourdomain.com
3. **Production**: n8n.yourdomain.com

### Deployment Stages

#### Stage 1: Local Development
1. Make changes to workflow in n8n local
2. Test with local Google Sheets (dev sheet)
3. Export to JSON
4. Commit to git: `git commit -m "M01: Add length validation"`

#### Stage 2: Staging Deployment
1. Import to staging n8n
2. Connect to staging Google Sheets (test data)
3. Set staging variables:
```bash
GOOGLE_SHEET_ID={staging-sheet-id}
ALLOWED_ORIGINS=https://staging.yourdomain.com
```
4. Run full test suite (see above)
5. Monitor for 24 hours

#### Stage 3: Production Deployment

**Pre-Deployment**:
- [ ] Backup current production workflows (export JSON)
- [ ] Backup production Google Sheets (download CSV)
- [ ] Schedule deployment during low-traffic window
- [ ] Notify team of deployment

**Deployment Steps**:
1. Import new workflow to production n8n
2. **DO NOT ACTIVATE YET**
3. Update production variables (if needed)
4. Verify credentials connected
5. Run smoke test (single valid request)
6. **If smoke test passes**: Deactivate old version, activate new version
7. **If smoke test fails**: Rollback (see below)

**Post-Deployment**:
- [ ] Monitor execution logs for 1 hour
- [ ] Check Google Sheets for data quality
- [ ] Verify notifications working
- [ ] Test one real user flow
- [ ] Document deployment in changelog

---

## Rollback Procedure

### If Deployment Fails

**Immediate Rollback**:
1. Deactivate new workflow version
2. Reactivate previous workflow version (from backup)
3. Verify old version working
4. Investigate failure in staging

**Rollback via JSON Re-Import**:
```bash
# If workflow corrupted, re-import backup
n8n import:workflow --input=backups/module_01_core_v1.0.0.json

# Activate backup
# Settings → Workflows → Find backup → Activate
```

### Rollback Checklist
- [ ] New version deactivated
- [ ] Old version activated
- [ ] Smoke test passes on old version
- [ ] Users notified (if downtime occurred)
- [ ] Incident report created
- [ ] Root cause analysis scheduled

---

## Continuous Integration (CI)

### GitHub Actions Workflow Example

Create `.github/workflows/n8n-validate.yml`:

```yaml
name: Validate n8n Workflows

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Validate JSON Syntax
        run: |
          cd Aigent_Modules_Core
          for file in module_*_core.json; do
            echo "Validating $file..."
            jq empty "$file" || exit 1
          done

      - name: Check Required Keys
        run: |
          cd Aigent_Modules_Core
          for file in module_*_core.json; do
            echo "Checking $file..."
            jq -e '.name and .nodes and .connections and .settings and .tags and .meta' "$file" > /dev/null || exit 1
          done

      - name: Check for Secrets
        run: |
          cd Aigent_Modules_Core
          if grep -r "sk_live_" *.json; then
            echo "ERROR: Found Stripe live key in workflow!"
            exit 1
          fi
          if grep -r "ya29\." *.json; then
            echo "ERROR: Found OAuth token in workflow!"
            exit 1
          fi

      - name: Check CORS Config
        run: |
          cd Aigent_Modules_Core
          if grep -r '"allowedOrigins": "\*"' *.json; then
            echo "ERROR: Found CORS wildcard in workflow!"
            exit 1
          fi
```

---

## Continuous Deployment (CD)

### Automated Deployment Pipeline

**Trigger**: Git push to `main` branch with tag `module-XX-core-vX.X.X`

**Pipeline**:
1. ✅ Validate JSON (see CI above)
2. ✅ Run unit tests (validate node connections)
3. ✅ Deploy to staging
4. ✅ Run integration tests on staging
5. ⏸️ Manual approval (Slack notification)
6. ✅ Deploy to production (if approved)
7. ✅ Run smoke tests on production
8. ✅ Notify team of deployment

### Example CD Script

```bash
#!/bin/bash
# deploy.sh - Deploy workflow to n8n

set -e

MODULE=$1  # e.g., "01"
ENV=$2     # e.g., "staging" or "production"

if [ -z "$MODULE" ] || [ -z "$ENV" ]; then
  echo "Usage: ./deploy.sh <module_number> <env>"
  exit 1
fi

FILE="Aigent_Modules_Core/module_${MODULE}_core.json"

if [ ! -f "$FILE" ]; then
  echo "ERROR: File $FILE not found"
  exit 1
fi

# Validate JSON
echo "Validating JSON..."
jq empty "$FILE" || exit 1

# Check CORS
echo "Checking CORS..."
if grep -q '"allowedOrigins": "\*"' "$FILE"; then
  echo "ERROR: CORS wildcard found!"
  exit 1
fi

# Import to n8n
echo "Importing to $ENV..."
case $ENV in
  staging)
    N8N_URL="https://staging-n8n.yourdomain.com"
    ;;
  production)
    N8N_URL="https://n8n.yourdomain.com"
    ;;
  *)
    echo "ERROR: Invalid environment $ENV"
    exit 1
    ;;
esac

curl -X POST "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @"$FILE"

echo "✅ Deployment complete!"
```

Usage:
```bash
./deploy.sh 01 staging
./deploy.sh 01 production  # after manual approval
```

---

## Monitoring & Observability

### Key Metrics to Track

**Per Module**:
- Execution count (successful)
- Execution count (failed)
- Average execution time
- P95 execution time
- Error rate (%)

**Dashboard Example** (n8n built-in or external):
```
Module 01 (Intake)
  ✅ Executions (24h): 1,234
  ❌ Errors (24h): 5 (0.4%)
  ⏱ Avg time: 487ms
  ⏱ P95 time: 892ms
```

### Alerts

**Set up alerts for**:
- Error rate > 5%
- Execution time > 5s (P95)
- No executions in 1 hour (unexpected silence)
- Google Sheets API quota exceeded
- Stripe/SendGrid API errors

**Alert Channels**:
- Slack: `#aigent-alerts`
- Email: `ops@yourdomain.com`
- PagerDuty (for critical failures)

---

## Maintenance Windows

### Scheduled Maintenance

**When to Schedule**:
- Major version upgrades (1.x.x → 2.0.0)
- n8n platform upgrades
- Database migrations (if moving off Google Sheets)

**Maintenance Checklist**:
- [ ] Notify users 48 hours in advance
- [ ] Schedule during low-traffic time (2am-4am local)
- [ ] Backup all workflows + data
- [ ] Perform upgrade in staging first
- [ ] Have rollback plan ready
- [ ] Monitor for 4 hours post-upgrade
- [ ] Document changes in changelog

---

## Changelog Template

Create `Aigent_Modules_Core/CHANGELOG.md`:

```markdown
# Changelog - Aigent Core Suite

## [1.1.0] - 2025-11-10

### Added
- M01: Length validation on name/email/phone
- M01: Field-specific error messages
- M01-M10: CORS origin restrictions via ALLOWED_ORIGINS variable

### Changed
- M01-M10: Trace ID now includes random suffix for uniqueness
- M02: SCHEDULING_API_URL default changed from httpbin to documented required var

### Fixed
- M01: HTML escaping in Slack notifications (XSS prevention)
- M05: Split in Batches loop exit condition
- M06-M09: Added missing "settings" and "tags" keys

### Security
- M01-M10: Fixed CORS wildcard vulnerability (CVE-TBD)
- M01-M10: Added rate limiting (60 req/min)

## [1.0.0] - 2025-11-06

### Added
- Initial release of Aigent Core Suite
- M01-M10: All 10 modules complete and functional
```

---

## Best Practices Summary

### DOs ✅
- ✅ Version workflows using semver
- ✅ Test in staging before production
- ✅ Backup before deployment
- ✅ Use variables for all config (no hardcoded values)
- ✅ Document all changes in CHANGELOG
- ✅ Tag git commits with module versions
- ✅ Monitor error rates post-deployment
- ✅ Have rollback plan ready

### DON'Ts ❌
- ❌ Deploy to production without staging test
- ❌ Commit credentials or secrets to git
- ❌ Use CORS wildcard (`allowedOrigins: "*"`) in production
- ❌ Skip backup before deployment
- ❌ Deploy during peak hours
- ❌ Ignore error rate spikes
- ❌ Leave old workflow versions activated (deactivate after migration)

---

## Emergency Procedures

### If Production is Down

1. **Immediate**: Activate previous working version (from backup)
2. **Within 5 min**: Notify team via Slack `#incidents`
3. **Within 15 min**: Root cause analysis (check n8n logs, Google Sheets, API status)
4. **Within 1 hour**: Fix deployed or rollback confirmed stable
5. **Within 24 hours**: Incident report published
6. **Within 1 week**: Post-mortem meeting, preventive measures documented

### If Data Loss Occurs

1. **Immediate**: Stop all workflows (prevent further data corruption)
2. **Within 5 min**: Check Google Sheets version history (restore point)
3. **Within 15 min**: Restore from latest backup (CSV or Sheets revision)
4. **Within 1 hour**: Verify data integrity, identify lost records
5. **Within 24 hours**: Notify affected users (if any), implement daily backups

---

## Tools & Resources

### Recommended Tools
- **JSON Validator**: `jq` (CLI), jsonlint.com (web)
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **Monitoring**: n8n built-in, Datadog, Grafana
- **Backup**: Google Sheets → BigQuery daily export
- **Testing**: curl, Postman, k6 (load testing)

### n8n CLI Installation
```bash
npm install -g n8n
n8n --version
```

### Useful Commands
```bash
# Validate JSON
jq empty module_01_core.json

# Pretty-print JSON
jq . module_01_core.json > module_01_core_formatted.json

# Check for secrets
grep -r "sk_live_" Aigent_Modules_Core/

# Check for CORS wildcard
grep -r '"allowedOrigins": "\*"' Aigent_Modules_Core/

# Export all workflows
n8n export:workflow --all --output=./exports

# Import specific workflow
n8n import:workflow --input=module_01_core.json
```

---

**CI/CD Checklist Complete**
**Total Checks**: 50+
**Critical Procedures**: Deployment, Rollback, Emergency Response
**Automation Level**: High (CI validation, CD pipeline ready)
