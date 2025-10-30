# Aigent Module 09 - Compliance & Audit Logging

**Version:** 1.0.0
**Last Updated:** 2025-10-30
**Node Range:** 901-932
**Purpose:** HIPAA-compliant, tamper-evident audit trail for all Aigent modules

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Input Schema](#input-schema)
4. [Output Schema](#output-schema)
5. [Installation](#installation)
6. [Storage Backends](#storage-backends)
7. [Hash Chain Verification](#hash-chain-verification)
8. [PHI Minimization](#phi-minimization)
9. [Alert Configuration](#alert-configuration)
10. [Retention Policy](#retention-policy)
11. [Integration Guide](#integration-guide)
12. [Security & Compliance](#security--compliance)
13. [Query Examples](#query-examples)
14. [Troubleshooting](#troubleshooting)
15. [Performance Tuning](#performance-tuning)

---

## Overview

Module 09 is the **compliance and audit logging engine** for the Aigent Universal Clinic Template. It provides a centralized, immutable, searchable audit trail for all operations across Modules 01-08.

### Key Features

- **Universal Event Ingestion:** Accepts audit events from any upstream module via webhook
- **Tamper Detection:** Blockchain-style SHA-256 hash chain prevents record alteration
- **PHI Minimization:** HIPAA-compliant data masking (emails, IPs, IDs, SSNs)
- **Multi-Backend Storage:** PostgreSQL (recommended), Google Sheets, or Airtable
- **Cold Archive:** Encrypted S3 JSONL append-only logs with signed URLs
- **Real-Time Alerts:** Slack and Email notifications for high-risk events
- **Retention Management:** Automatic expiration tracking (default 7 years)
- **Comprehensive Logging:** Captures actor, resource, timestamp, payload, and context

### Why Module 09?

**Regulatory Compliance:**
- HIPAA requires audit trails for all PHI access (45 CFR § 164.308(a)(1)(ii)(D))
- Demonstrates "reasonable safeguards" and "access controls"
- Supports breach notification requirements (who accessed what, when)

**Operational Benefits:**
- **Forensics:** Investigate security incidents with complete event history
- **Debugging:** Trace failures across module boundaries via trace_id
- **Analytics:** Understand system usage patterns and user behavior
- **Accountability:** Track administrative actions (exports, bulk operations, config changes)

---

## Architecture

### Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Aigent Module 09                                │
│                   Compliance & Audit Logging                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐       ┌───────────┐       ┌────────────┐       ┌──────────┐
│ Module   │       │  Module   │       │  Module    │       │ Module   │
│ 01-08    ├──────>│  Webhook  ├──────>│  Validate  ├──────>│   PHI    │
│ Events   │ POST  │  Receiver │ JSON  │ Normalize  │       │   Mask   │
└──────────┘       └───────────┘       └────────────┘       └────┬─────┘
                        901                   902                  │ 903
                                                                    v
┌──────────┐       ┌───────────┐       ┌────────────┐       ┌──────────┐
│  Alert   │<──────│  Evaluate │       │ Determine  │       │   Hash   │
│  Slack   │       │   Alert   │       │  Backends  │<──────│  Chain   │
│  Email   │       │ Conditions│       │  Routing   │       │  SHA-256 │
└──────────┘       └───────────┘       └────────────┘       └──────────┘
  917-918              915                   905                  904

                                                                    v
┌──────────┐       ┌───────────┐       ┌────────────┐       ┌──────────┐
│   S3     │<──────│  Primary  │       │  Postgres  │       │  Sheets  │
│ Archive  │       │  Storage  │──────>│  Airtable  │       │  Airtable│
│ Encrypted│       │  Switch   │       │  Sheets    │       │          │
└──────────┘       └───────────┘       └────────────┘       └──────────┘
  911-913              906                 907-909

                         │
                         v
                  ┌──────────┐
                  │ Response │
                  │ audit_log│
                  │  .json   │
                  └──────────┘
                      920
```

### Node Breakdown

| Node | Name | Type | Purpose |
|------|------|------|---------|
| 901 | Webhook Receiver | Webhook | Receives POST events from Modules 01-08 |
| 902 | Validate & Normalize | Code | Enforces schema, generates audit_id (ksuid) |
| 903 | PHI Minimization | Code | Masks emails, IPs, IDs; redacts SSN/passwords |
| 904 | Calculate Hash Chain | Code | SHA-256(canonical_data + prev_hash) → record_hash |
| 905 | Determine Backends | Code | Routes to primary/secondary storage |
| 906 | Route: Primary Storage | Switch | Routes to PostgreSQL/Sheets/Airtable |
| 907 | PostgreSQL - Insert | Postgres | ACID-compliant insert with idempotency |
| 908 | Google Sheets - Append | Sheets | Lightweight storage (< 10k records) |
| 909 | Airtable - Create | Airtable | Medium-volume relational storage |
| 910 | Route: Secondary Archive | Switch | Routes to S3/Google Drive |
| 911 | Prepare S3 Archive | Code | Formats JSONL with partitioning (yyyy/MM/dd/HH) |
| 912 | S3 - Append Archive | AWS S3 | Encrypted append-only log |
| 913 | Generate Signed URL | Code | Time-limited S3 access (10min default) |
| 914 | Google Drive - Upload | GDrive | Fallback archive (individual JSON files) |
| 915 | Evaluate Alert Conditions | Code | Checks severity, watch events, after-hours |
| 916 | Route: Send Alerts | If | Conditional alert routing |
| 917 | Slack - Alert | HTTP | Formatted Slack webhook message |
| 918 | Email - Alert | Email | HTML email alert to security team |
| 919 | Build Response | Code | Constructs standardized audit_log.json |
| 920 | Respond - Success | Webhook Response | Returns 200 with audit details |
| 930 | Error Handler | Code | Catches errors, logs to DLQ |
| 931 | S3 - Dead Letter Queue | AWS S3 | Persists failed events for investigation |
| 932 | Respond - Error | Webhook Response | Returns 500 with error details |

---

## Input Schema

Upstream modules (01-08) POST JSON events to the webhook endpoint:

**Endpoint:** `POST https://your-n8n.com/webhook/aigent-audit-log`

**Required Fields:**
```json
{
  "module": "Module_06_Document_Capture_OCR",
  "event": "document_uploaded",
  "timestamp": "2025-10-30T14:05:11Z"
}
```

**Complete Schema:**
```json
{
  "module": "string (required)",
  "event": "string (required)",
  "timestamp": "ISO 8601 string (required)",
  "severity": "info | warning | high | critical (default: info)",
  "actor": {
    "type": "system | user | bot",
    "id": "user_id or service_name",
    "ip": "203.0.113.42"
  },
  "resource": {
    "type": "patient_record | document | appointment | invoice | etc.",
    "id": "resource_identifier"
  },
  "payload": {
    "...arbitrary event-specific data..."
  },
  "trace_id": "string (optional, auto-generated if missing)"
}
```

### Event Examples

**Module 01 - Lead Created:**
```json
{
  "module": "Module_01_Intake_Lead_Capture",
  "event": "lead_created",
  "timestamp": "2025-10-30T10:15:00Z",
  "severity": "info",
  "actor": {
    "type": "system",
    "id": "intake_form_bot",
    "ip": "10.0.1.42"
  },
  "resource": {
    "type": "lead",
    "id": "lead_98765"
  },
  "payload": {
    "source": "website_form",
    "campaign": "google_ads_2025_q4"
  },
  "trace_id": "LEAD-1737285600000"
}
```

**Module 06 - Document Exported (High Risk):**
```json
{
  "module": "Module_06_Document_Capture_OCR",
  "event": "document_export",
  "timestamp": "2025-10-30T20:30:00Z",
  "severity": "high",
  "actor": {
    "type": "user",
    "id": "doctor_jane_smith",
    "ip": "203.0.113.42"
  },
  "resource": {
    "type": "document",
    "id": "doc_abc123"
  },
  "payload": {
    "doc_type": "lab_result",
    "patient_id": "pat_123456789",
    "export_format": "pdf",
    "destination": "email"
  },
  "trace_id": "DOC-1737332400000"
}
```

**Module 03 - Login Failure (Alert Trigger):**
```json
{
  "module": "Module_03_Telehealth_Session",
  "event": "login_failure",
  "timestamp": "2025-10-30T14:22:00Z",
  "severity": "warning",
  "actor": {
    "type": "user",
    "id": "unknown_user",
    "ip": "198.51.100.88"
  },
  "resource": {
    "type": "auth",
    "id": "telehealth_portal"
  },
  "payload": {
    "reason": "invalid_credentials",
    "attempt_count": 3
  },
  "trace_id": "AUTH-1737286920000"
}
```

---

## Output Schema

Module 09 returns a standardized `audit_log.json` response:

**Success Response (200 OK):**
```json
{
  "success": true,
  "audit_id": "aud_1737285911234_a3f9c",
  "ingested_at": "2025-10-30T14:05:12Z",
  "module": "Module_06_Document_Capture_OCR",
  "event": "document_uploaded",
  "severity": "info",
  "record_hash": "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
  "prev_hash": "3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "backends": {
    "primary": "postgres",
    "secondary": "s3"
  },
  "retention": {
    "policy_days": 2555,
    "expires_at": "2032-10-28T14:05:12Z"
  },
  "alerts_triggered": ["none"],
  "metadata": {
    "writer": "Aigent_Module_09",
    "version": "1.0.0",
    "hash_algorithm": "SHA-256",
    "phi_masked": true,
    "trace_id": "DOC-1737285600000"
  },
  "archive": {
    "url": "https://aigent-audit-archive.s3.us-east-1.amazonaws.com/audit/2025/10/30/14/audit.jsonl?X-Amz-...",
    "expires_at": "2025-10-30T14:15:12Z",
    "bucket": "aigent-audit-archive",
    "key": "audit/2025/10/30/14/audit.jsonl"
  }
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "PostgreSQL connection timeout",
  "error_type": "DatabaseError",
  "stage": "persist",
  "trace_id": "err_1737285911234",
  "timestamp": "2025-10-30T14:05:12Z",
  "metadata": {
    "module": "Aigent_Module_09",
    "version": "1.0.0",
    "handler": "error_handler"
  }
}
```

**Response Headers:**
- `X-Audit-ID`: Unique audit record identifier
- `X-Trace-ID`: Original trace_id from input (or auto-generated)
- `Content-Type`: application/json

---

## Installation

### Prerequisites

1. **n8n instance** (self-hosted or n8n Cloud)
2. **Storage backend** (choose one):
   - **PostgreSQL 12+** (recommended for production)
   - **Google Sheets** (lightweight, < 10k records)
   - **Airtable** (medium volume, 10k-100k records)
3. **Archive backend** (optional but recommended):
   - **AWS S3** (encrypted, immutable, queryable via Athena)
   - **Google Drive** (fallback)
4. **Alert channels** (optional):
   - **Slack** (webhook URL)
   - **Email** (SMTP or SendGrid)

### Step 1: Import Workflow

1. Copy `Aigent_Module_09_Compliance_Audit.json`
2. In n8n: **Workflows → Import from File**
3. Select the JSON file
4. Workflow imported with nodes 901-932

### Step 2: Configure Environment Variables

1. Copy `.env.aigent_module_09_example` to `.env`
2. **Set primary storage:**
   ```bash
   LOG_PRIMARY=postgres
   PG_CONN_STRING=postgresql://audit_user:password@localhost:5432/audit_db
   PG_TABLE=audit_log
   ```

3. **Set secondary archive (optional):**
   ```bash
   LOG_SECONDARY=s3
   S3_BUCKET=aigent-audit-archive
   S3_ACCESS_KEY_ID=AKIA...
   S3_SECRET_ACCESS_KEY=wJalr...
   ```

4. **Configure alerts:**
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../XXX...
   ALERT_EMAIL=security@yourclinic.com
   ALERT_SEVERITY=warning,high,critical
   ```

### Step 3: Set Up Storage Backend

#### Option A: PostgreSQL (Recommended)

**1. Create Database:**
```bash
createdb audit_db
psql audit_db
```

**2. Create User:**
```sql
CREATE USER audit_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE audit_db TO audit_user;
```

**3. Create Schema:**
```sql
CREATE TABLE audit_log (
  audit_id VARCHAR(255) PRIMARY KEY,
  ts TIMESTAMP WITH TIME ZONE NOT NULL,
  module VARCHAR(255) NOT NULL,
  event VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  actor_type VARCHAR(50),
  actor_id VARCHAR(255),
  actor_ip VARCHAR(100),
  resource_type VARCHAR(255),
  resource_id VARCHAR(255),
  payload_json JSONB,
  record_hash VARCHAR(64) NOT NULL,
  prev_hash VARCHAR(64) NOT NULL,
  retention_expires_at TIMESTAMP WITH TIME ZONE,
  trace_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_audit_ts ON audit_log(ts DESC);
CREATE INDEX idx_audit_module ON audit_log(module);
CREATE INDEX idx_audit_event ON audit_log(event);
CREATE INDEX idx_audit_severity ON audit_log(severity);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_resource ON audit_log(resource_id);
CREATE INDEX idx_audit_trace ON audit_log(trace_id);
CREATE INDEX idx_audit_hash ON audit_log(record_hash);

-- JSONB index for payload queries
CREATE INDEX idx_audit_payload ON audit_log USING GIN(payload_json);
```

**4. Configure n8n Credential:**
- n8n → **Credentials → Add Credential**
- Type: **PostgreSQL**
- Host: `localhost`, Port: `5432`
- Database: `audit_db`
- User: `audit_user`, Password: `secure_password_here`
- Copy credential ID to `.env` as `POSTGRES_CREDENTIAL_ID`

#### Option B: Google Sheets (Lightweight)

**1. Create Spreadsheet:**
- Go to [Google Sheets](https://sheets.google.com)
- Create new sheet: **"Aigent Audit Log"**
- Rename first tab to **"AuditLog"**

**2. Add Headers (Row 1):**
```
audit_id | ts | module | event | severity | actor_type | actor_id | actor_ip |
resource_type | resource_id | payload_json | record_hash | prev_hash |
retention_expires_at | trace_id
```

**3. Configure n8n Credential:**
- n8n → **Credentials → Add Credential**
- Type: **Google Sheets OAuth2 API**
- Authorize with Google account
- Copy credential ID to `.env` as `GOOGLE_SHEETS_CREDENTIAL_ID`
- Copy sheet ID from URL to `.env` as `GOOGLE_SHEET_ID`

#### Option C: Airtable (Medium Volume)

**1. Create Base:**
- Go to [Airtable](https://airtable.com)
- Create new base: **"Aigent Audit Log"**
- Rename table to **"AuditLog"**

**2. Create Fields:**
| Field Name | Type | Options |
|------------|------|---------|
| audit_id | Single line text | Primary field |
| ts | Date with time | Include time |
| module | Single line text | |
| event | Single line text | |
| severity | Single select | Options: info, warning, high, critical |
| actor_type | Single line text | |
| actor_id | Single line text | |
| actor_ip | Single line text | |
| resource_type | Single line text | |
| resource_id | Single line text | |
| payload_json | Long text | JSON formatted |
| record_hash | Single line text | |
| prev_hash | Single line text | |
| retention_expires_at | Date with time | Include time |
| trace_id | Single line text | |

**3. Configure n8n Credential:**
- Airtable → **Account → Generate API Key**
- n8n → **Credentials → Add Credential**
- Type: **Airtable Personal Access Token**
- Paste API key
- Copy credential ID to `.env` as `AIRTABLE_CREDENTIAL_ID`
- Copy base ID and table name to `.env`

### Step 4: Configure S3 Archive (Optional)

**1. Create S3 Bucket:**
```bash
aws s3 mb s3://aigent-audit-archive --region us-east-1
```

**2. Enable Encryption:**
```bash
aws s3api put-bucket-encryption \
  --bucket aigent-audit-archive \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

**3. Set Bucket Policy (Private):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::aigent-audit-archive/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

**4. Configure IAM User:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::aigent-audit-archive",
        "arn:aws:s3:::aigent-audit-archive/*"
      ]
    }
  ]
}
```

**5. Configure n8n Credential:**
- n8n → **Credentials → Add Credential**
- Type: **AWS**
- Access Key ID & Secret from IAM user
- Region: `us-east-1`
- Copy credential ID to `.env` as `AWS_CREDENTIAL_ID`

### Step 5: Test Workflow

**1. Activate Workflow:**
- Click **Active** toggle in n8n

**2. Get Webhook URL:**
- Click on Node 901 (Webhook Receiver)
- Copy **Production URL**: `https://your-n8n.com/webhook/aigent-audit-log`

**3. Send Test Event:**
```bash
curl -X POST https://your-n8n.com/webhook/aigent-audit-log \
  -H "Content-Type: application/json" \
  -d '{
    "module": "test",
    "event": "test_event",
    "timestamp": "2025-10-30T14:00:00Z",
    "severity": "info",
    "actor": {
      "type": "user",
      "id": "test_user",
      "ip": "127.0.0.1"
    },
    "resource": {
      "type": "test_resource",
      "id": "test_123"
    },
    "payload": {
      "test": true
    }
  }'
```

**4. Verify Response:**
```json
{
  "success": true,
  "audit_id": "aud_...",
  "module": "test",
  "event": "test_event",
  "record_hash": "...",
  "backends": {
    "primary": "postgres",
    "secondary": "s3"
  },
  ...
}
```

**5. Check Storage:**
- **PostgreSQL:** `SELECT * FROM audit_log ORDER BY ts DESC LIMIT 1;`
- **Google Sheets:** Check last row in AuditLog tab
- **S3:** `aws s3 ls s3://aigent-audit-archive/audit/ --recursive`

---

## Storage Backends

### Comparison Matrix

| Feature | PostgreSQL | Google Sheets | Airtable | S3 Archive |
|---------|-----------|---------------|----------|------------|
| **Capacity** | Unlimited | ~10k rows | ~100k rows | Unlimited |
| **Query Speed** | Excellent | Poor | Good | Good (Athena) |
| **ACID** | Yes | No | Limited | No |
| **Cost** | $50-200/mo | Free | $10-100/mo | $5-20/mo |
| **Indexing** | Yes | No | Limited | No |
| **JSONB Queries** | Yes | No | No | No |
| **Backup** | Built-in | Manual | Built-in | Versioned |
| **Tamper Resistance** | Medium | Low | Medium | High |
| **Setup Complexity** | Medium | Easy | Easy | Medium |

### Recommendation by Volume

| Daily Events | Primary Storage | Secondary Archive |
|--------------|----------------|-------------------|
| < 100 | Google Sheets | None |
| 100-1,000 | Airtable or Postgres | S3 |
| 1,000-10,000 | PostgreSQL | S3 |
| 10,000+ | PostgreSQL (optimized) | S3 + Athena |

---

## Hash Chain Verification

Module 09 implements a **blockchain-style hash chain** to detect tampering.

### How It Works

Each audit record includes:
1. **record_hash:** SHA-256 hash of canonical record data
2. **prev_hash:** The `record_hash` of the previous record

**Chain Structure:**
```
Record 1: prev_hash = GENESIS (all zeros)
          record_hash = SHA-256(record_1_data + GENESIS)

Record 2: prev_hash = record_1.record_hash
          record_hash = SHA-256(record_2_data + record_1.record_hash)

Record 3: prev_hash = record_2.record_hash
          record_hash = SHA-256(record_3_data + record_2.record_hash)
```

**Canonical Data Includes:**
- audit_id
- ts (timestamp)
- module
- event
- severity
- actor_type, actor_id
- resource_type, resource_id
- payload_hash (SHA-256 of payload JSON)
- prev_hash

### Verification Query (PostgreSQL)

**Verify single record:**
```sql
WITH current_record AS (
  SELECT
    audit_id,
    ts,
    module,
    event,
    severity,
    actor_type,
    actor_id,
    resource_type,
    resource_id,
    payload_json,
    record_hash,
    prev_hash
  FROM audit_log
  WHERE audit_id = 'aud_1737285911234_a3f9c'
),
canonical AS (
  SELECT
    encode(
      digest(
        jsonb_build_object(
          'audit_id', audit_id,
          'ts', ts,
          'module', module,
          'event', event,
          'severity', severity,
          'actor_type', actor_type,
          'actor_id', actor_id,
          'resource_type', resource_type,
          'resource_id', resource_id,
          'payload_hash', encode(digest(payload_json::text, 'sha256'), 'hex'),
          'prev_hash', prev_hash
        )::text,
        'sha256'
      ),
      'hex'
    ) AS computed_hash,
    record_hash AS stored_hash
  FROM current_record
)
SELECT
  CASE
    WHEN computed_hash = stored_hash THEN 'VALID'
    ELSE 'TAMPERED'
  END AS verification_status,
  computed_hash,
  stored_hash
FROM canonical;
```

**Verify entire chain:**
```sql
WITH RECURSIVE chain AS (
  -- Start with first record
  SELECT
    audit_id,
    ts,
    record_hash,
    prev_hash,
    '0000000000000000000000000000000000000000000000000000000000000000' AS expected_prev_hash,
    1 AS position
  FROM audit_log
  ORDER BY ts ASC
  LIMIT 1

  UNION ALL

  -- Recursively verify each subsequent record
  SELECT
    a.audit_id,
    a.ts,
    a.record_hash,
    a.prev_hash,
    c.record_hash AS expected_prev_hash,
    c.position + 1 AS position
  FROM audit_log a
  INNER JOIN chain c ON a.ts > c.ts
  WHERE a.ts = (
    SELECT MIN(ts) FROM audit_log WHERE ts > c.ts
  )
)
SELECT
  position,
  audit_id,
  ts,
  CASE
    WHEN prev_hash = expected_prev_hash THEN 'VALID'
    ELSE 'BROKEN_CHAIN'
  END AS chain_status,
  prev_hash,
  expected_prev_hash
FROM chain
ORDER BY position;
```

**Expected Output:**
```
position | audit_id           | ts                  | chain_status | prev_hash | expected_prev_hash
---------|--------------------|--------------------|--------------|-----------|-------------------
1        | aud_...001         | 2025-10-30 10:00:00 | VALID       | 0000...   | 0000...
2        | aud_...002         | 2025-10-30 10:05:00 | VALID       | 4e07...   | 4e07...
3        | aud_...003         | 2025-10-30 10:10:00 | VALID       | 3b6a...   | 3b6a...
```

### Detecting Tampering

**Scenario 1: Record Modified**
- Change `actor_id` from `user_123` to `user_456`
- Verification query shows: `TAMPERED`
- `computed_hash ≠ stored_hash`

**Scenario 2: Record Deleted**
- Delete record in middle of chain
- Next record's `prev_hash` no longer matches previous `record_hash`
- Chain verification shows: `BROKEN_CHAIN`

**Scenario 3: Record Inserted**
- Insert fake record between two existing records
- Fake record's `record_hash` doesn't match next record's `prev_hash`
- Chain verification shows: `BROKEN_CHAIN`

### Limitations

**Cannot Prevent:**
- **Deletion of all records:** If attacker has database access and deletes entire table
- **Recomputation:** If attacker has source code and recomputes entire chain (mitigated by S3 archive)

**Mitigation:**
1. **Immutable Archive:** S3 with versioning and MFA delete
2. **Read-Only Replica:** Real-time replication to separate database
3. **Periodic Snapshots:** Daily hash chain checkpoints to external storage
4. **Access Controls:** Restrict audit database write access to n8n service only

---

## PHI Minimization

Module 09 automatically applies **HIPAA-compliant data minimization** per 45 CFR § 164.514(d).

### Masking Rules

**1. Email Addresses** (`MASK_EMAIL_LOCAL=true`)
```
Before: john.doe@example.com
After:  j***@example.com
```

**2. IP Addresses** (`MASK_IP=true`)
```
IPv4:
Before: 203.0.113.42
After:  203.0.113.***

IPv6:
Before: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
After:  2001:0db8:85a3:0000:****
```

**3. Patient/User IDs** (`MASK_ID_LAST_DIGITS=4`)
```
Before: patient_id=123456789
After:  patient_id=***6789
```

**4. Phone Numbers** (always last 4 digits)
```
Before: +1-555-123-4567
After:  +1-555-123-***7
```

**5. Complete Redaction** (always removed)
```
Fields containing these keywords are entirely replaced with [REDACTED]:
- ssn
- password
- token
- secret
- credit_card
- cvv
```

### Payload Masking

The PHI minimization algorithm recursively processes the `payload_json` field:

**Example Input:**
```json
{
  "patient_id": "pat_987654321",
  "patient_email": "jane.smith@example.com",
  "ssn": "123-45-6789",
  "diagnosis": "Type 2 Diabetes",
  "credit_card": "4111-1111-1111-1111",
  "lab_results": {
    "glucose": 145,
    "patient_mrn": "MRN123456"
  }
}
```

**After Masking:**
```json
{
  "patient_id": "***4321",
  "patient_email": "j***@example.com",
  "ssn": "[REDACTED]",
  "diagnosis": "Type 2 Diabetes",
  "credit_card": "[REDACTED]",
  "lab_results": {
    "glucose": 145,
    "patient_mrn": "***3456"
  }
}
```

### Configuration

**Disable masking entirely (not recommended):**
```bash
MASK_EMAIL_LOCAL=false
MASK_IP=false
MASK_ID_LAST_DIGITS=0
```

**Aggressive masking (compliance-first):**
```bash
MASK_EMAIL_LOCAL=true
MASK_IP=true
MASK_ID_LAST_DIGITS=0  # Redact IDs entirely
```

---

## Alert Configuration

### Alert Triggers

Module 09 triggers alerts when:

1. **Severity Threshold:** Event severity in `ALERT_SEVERITY` list
2. **Watch Events:** Event name in `WATCH_EVENTS` list
3. **After-Hours PHI Access:** PHI-related event outside business hours
4. **Failed Authentication:** `login_failure` or `auth_failure` events
5. **Bulk Operations:** `bulk_download`, `bulk_export`, `mass_delete` events

### Configuration

```bash
# Alert on warning, high, critical severity
ALERT_SEVERITY=warning,high,critical

# Always alert on these events (regardless of severity)
WATCH_EVENTS=document_export,bulk_download,login_failure,phi_access

# After-hours monitoring (18:00 to 08:00)
AFTER_HOURS_START=18:00
AFTER_HOURS_END=08:00
TIMEZONE=America/New_York

# Slack webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../XXX...

# Email alerts
ALERT_EMAIL=security@yourclinic.com
```

### Slack Alert Format

**Example Alert:**
```
🚨 *Audit Alert: after_hours_phi_access, severity_threshold*

Audit Event: document_export
Module: Module_06_Document_Capture_OCR
Severity: high
Actor: user: doctor_jane_smith (203.0.113.***)
Resource: document: doc_***123
Timestamp: 2025-10-30T20:30:00Z
Trace ID: DOC-1737332400000

Conditions Met:
- Severity high meets alert threshold
- PHI access at 20:00 UTC (after hours)

Aigent Module 09 - Audit ID: aud_1737332400567_x9z2a
```

### Email Alert Format

HTML email with:
- **Subject:** `🚨 Audit Alert: document_export [high]`
- **Body:** Formatted table with event details
- **Conditions Met:** Bullet list of triggered conditions
- **Audit ID & Trace ID:** For correlation and investigation

### Alert Testing

**Trigger severity alert:**
```bash
curl -X POST https://your-n8n.com/webhook/aigent-audit-log \
  -H "Content-Type: application/json" \
  -d '{
    "module": "test",
    "event": "test_alert",
    "severity": "high",
    "timestamp": "2025-10-30T14:00:00Z",
    "actor": {"type": "user", "id": "test_user"}
  }'
```

**Trigger watch event alert:**
```bash
curl -X POST https://your-n8n.com/webhook/aigent-audit-log \
  -H "Content-Type: application/json" \
  -d '{
    "module": "Module_06",
    "event": "document_export",
    "severity": "info",
    "timestamp": "2025-10-30T14:00:00Z",
    "actor": {"type": "user", "id": "test_user"},
    "resource": {"type": "document", "id": "doc_123"}
  }'
```

**Trigger after-hours alert:**
```bash
# Set timestamp to after hours (e.g., 8 PM)
curl -X POST https://your-n8n.com/webhook/aigent-audit-log \
  -H "Content-Type: application/json" \
  -d '{
    "module": "Module_06",
    "event": "phi_access",
    "severity": "info",
    "timestamp": "2025-10-30T20:00:00Z",
    "actor": {"type": "user", "id": "test_user"},
    "resource": {"type": "patient_record", "id": "pat_123"}
  }'
```

---

## Retention Policy

### Default Retention

**HIPAA Requirement:** 6 years from date of creation or last effective date (whichever is later)

**Module 09 Default:** 7 years (2,555 days) for safety margin

### Configuration

```bash
# Retention period in days
RETENTION_DAYS=2555  # 7 years

# Enable automatic purge (requires separate scheduled workflow)
AUTO_PURGE_ENABLED=false

# Purge schedule (weekly on Sunday at 2 AM)
PURGE_SCHEDULE=0 2 * * 0

# Log proof-of-deletion
LOG_DELETIONS=true
```

### Retention Expiration

Each audit record includes `retention_expires_at` timestamp:

```sql
SELECT
  audit_id,
  ts,
  retention_expires_at,
  EXTRACT(DAY FROM (retention_expires_at - NOW())) AS days_until_expiration
FROM audit_log
WHERE retention_expires_at < NOW() + INTERVAL '30 days'
ORDER BY retention_expires_at ASC;
```

### Manual Purge Procedure

**1. Query expired records:**
```sql
SELECT COUNT(*)
FROM audit_log
WHERE retention_expires_at < NOW();
```

**2. Export to archive (compliance requirement):**
```bash
pg_dump \
  --table=audit_log \
  --where="retention_expires_at < NOW()" \
  --format=custom \
  --file=audit_log_purge_$(date +%Y%m%d).dump \
  audit_db
```

**3. Compress and upload to long-term storage:**
```bash
gzip audit_log_purge_$(date +%Y%m%d).dump
aws s3 cp audit_log_purge_$(date +%Y%m%d).dump.gz \
  s3://aigent-audit-archive/retention/purged/
```

**4. Delete from database:**
```sql
BEGIN;

-- Log deletion event (for meta-audit)
INSERT INTO audit_log (
  audit_id, ts, module, event, severity, actor_type, actor_id,
  resource_type, resource_id, payload_json, record_hash, prev_hash,
  retention_expires_at, trace_id
) VALUES (
  'aud_purge_' || EXTRACT(EPOCH FROM NOW())::TEXT,
  NOW(),
  'Aigent_Module_09',
  'retention_purge',
  'info',
  'system',
  'retention_policy',
  'audit_log',
  'expired_records',
  jsonb_build_object('purged_count', (SELECT COUNT(*) FROM audit_log WHERE retention_expires_at < NOW())),
  'proof_of_deletion_hash',
  (SELECT record_hash FROM audit_log ORDER BY ts DESC LIMIT 1),
  NOW() + INTERVAL '2555 days',
  'PURGE-' || EXTRACT(EPOCH FROM NOW())::TEXT
);

-- Delete expired records
DELETE FROM audit_log
WHERE retention_expires_at < NOW();

COMMIT;
```

**5. Verify deletion:**
```sql
SELECT COUNT(*)
FROM audit_log
WHERE retention_expires_at < NOW();
-- Expected: 0
```

### Automated Purge Workflow

**Create separate n8n workflow:**
```
1. Schedule Trigger (weekly: 0 2 * * 0)
2. PostgreSQL Query: SELECT expired records
3. S3 Upload: Export to archive
4. PostgreSQL Delete: DELETE expired records
5. Audit Event: Log purge to Module 09
6. Email: Notify admin of purge completion
```

---

## Integration Guide

### Module 01 - Intake & Lead Capture

**Events to Log:**
- `lead_created`: New lead captured from form
- `lead_updated`: Lead information modified
- `lead_converted`: Lead converted to patient
- `form_submitted`: Intake form submission

**Example Integration (Node in Module 01):**
```javascript
// After lead creation, send audit event
const auditEvent = {
  module: 'Module_01_Intake_Lead_Capture',
  event: 'lead_created',
  timestamp: new Date().toISOString(),
  severity: 'info',
  actor: {
    type: 'system',
    id: 'intake_form_bot',
    ip: $json.client_ip || '0.0.0.0'
  },
  resource: {
    type: 'lead',
    id: $json.lead_id
  },
  payload: {
    source: $json.source,
    campaign: $json.campaign,
    form_fields: Object.keys($json.form_data).length
  },
  trace_id: $json.lead_id
};

await $http.post({
  url: 'https://your-n8n.com/webhook/aigent-audit-log',
  body: auditEvent,
  json: true
});
```

### Module 06 - Document Capture & OCR

**Events to Log:**
- `document_uploaded`: Document received
- `document_processed`: OCR completed
- `document_viewed`: User accessed document
- `document_exported`: Document downloaded/exported (HIGH RISK)
- `document_deleted`: Document removed

**Example Integration:**
```javascript
// After document export
const auditEvent = {
  module: 'Module_06_Document_Capture_OCR',
  event: 'document_export',
  timestamp: new Date().toISOString(),
  severity: 'high',  // Export is high-risk
  actor: {
    type: 'user',
    id: $json.user_id,
    ip: $json.request_ip
  },
  resource: {
    type: 'document',
    id: $json.document_id
  },
  payload: {
    doc_type: $json.doc_type,
    patient_id: $json.patient_id,
    export_format: $json.format,
    destination: $json.destination,
    file_size_bytes: $json.file_size
  },
  trace_id: $json.trace_id
};

await $http.post({
  url: 'https://your-n8n.com/webhook/aigent-audit-log',
  body: auditEvent,
  json: true
});
```

### Module 08 - Messaging & Omnichannel Hub

**Events to Log:**
- `message_sent`: Outbound message
- `message_received`: Inbound message
- `conversation_started`: New thread
- `bulk_message_sent`: Campaign message (HIGH RISK if PHI)

**Example Integration:**
```javascript
// After sending message
const auditEvent = {
  module: 'Module_08_Messaging_Omnichannel_Hub',
  event: 'message_sent',
  timestamp: new Date().toISOString(),
  severity: 'info',
  actor: {
    type: $json.actor_type || 'bot',
    id: $json.actor_id || 'message_bot',
    ip: null
  },
  resource: {
    type: 'message',
    id: $json.message_id
  },
  payload: {
    channel: $json.channel,
    patient_id: $json.patient_id,
    message_length: $json.message.length,
    contains_phi: $json.contains_phi || false
  },
  trace_id: $json.message_id
};

await $http.post({
  url: 'https://your-n8n.com/webhook/aigent-audit-log',
  body: auditEvent,
  json: true
});
```

### General Best Practices

**1. Always Include:**
- `module`: Full module name for filtering
- `event`: Specific action (use consistent naming)
- `timestamp`: ISO 8601 format
- `trace_id`: For correlation across modules

**2. Set Appropriate Severity:**
- `info`: Normal operations (lead created, form submitted)
- `warning`: Suspicious but not critical (failed login, rate limit)
- `high`: Security-relevant (document export, bulk operation)
- `critical`: Security breach (unauthorized access, data leak)

**3. Minimize PHI in Payload:**
- Use IDs instead of names
- Include metadata, not content
- Let Module 09 handle masking, but don't send unnecessary PHI

**4. Use Descriptive Resource Types:**
- `patient_record`, `document`, `appointment`, `invoice`, `lead`, `message`
- Enables filtering: "Show all `document` exports by user X"

---

## Security & Compliance

### HIPAA Compliance

**Module 09 supports HIPAA requirements:**

**§ 164.308(a)(1)(ii)(D) - Information System Activity Review:**
- ✅ Logs all PHI access events
- ✅ Regularly review audit logs (query examples below)
- ✅ Alert on suspicious activity

**§ 164.312(b) - Audit Controls:**
- ✅ Hardware, software, procedural mechanisms to record and examine PHI activity
- ✅ Tamper-evident hash chain
- ✅ Immutable S3 archive

**§ 164.308(a)(3)(ii)(A) - Access Authorization:**
- ✅ Logs who accessed what, when
- ✅ Tracks actor (user, system, bot)
- ✅ Records IP addresses (masked)

**§ 164.414 - Breach Notification:**
- ✅ Provides evidence for "who was affected" analysis
- ✅ Timeline of access events
- ✅ Extent of unauthorized access

### Security Best Practices

**1. Restrict Audit Database Access:**
```sql
-- Create read-only role for auditors
CREATE ROLE auditor_readonly;
GRANT CONNECT ON DATABASE audit_db TO auditor_readonly;
GRANT SELECT ON audit_log TO auditor_readonly;

-- Revoke write access (only n8n service should write)
REVOKE INSERT, UPDATE, DELETE ON audit_log FROM auditor_readonly;
```

**2. Enable PostgreSQL Audit Logging:**
```
# postgresql.conf
logging_collector = on
log_statement = 'ddl'  # Log schema changes
log_connections = on
log_disconnections = on
log_duration = on
```

**3. S3 Bucket Security:**
```bash
# Enable versioning (prevents deletion)
aws s3api put-bucket-versioning \
  --bucket aigent-audit-archive \
  --versioning-configuration Status=Enabled

# Enable MFA delete (requires MFA to delete)
aws s3api put-bucket-versioning \
  --bucket aigent-audit-archive \
  --versioning-configuration Status=Enabled,MFADelete=Enabled \
  --mfa "arn:aws:iam::123456789012:mfa/root-account-mfa-device 123456"

# Enable object lock (WORM - Write Once Read Many)
aws s3api put-object-lock-configuration \
  --bucket aigent-audit-archive \
  --object-lock-configuration '{
    "ObjectLockEnabled": "Enabled",
    "Rule": {
      "DefaultRetention": {
        "Mode": "GOVERNANCE",
        "Days": 2555
      }
    }
  }'
```

**4. Network Security:**
- ✅ Webhook endpoint HTTPS only (TLS 1.2+)
- ✅ Restrict n8n instance to private network or VPN
- ✅ Use IP allowlist for PostgreSQL connections
- ✅ Enable CloudFlare or AWS WAF for DDoS protection

**5. Credential Rotation:**
- 🔄 Rotate PostgreSQL password quarterly
- 🔄 Rotate AWS access keys quarterly
- 🔄 Rotate webhook auth tokens monthly
- 🔄 Review and revoke unused credentials

### Business Associate Agreements (BAAs)

**Ensure BAAs signed with:**
- ✅ AWS (S3): [HIPAA Compliance](https://aws.amazon.com/compliance/hipaa-compliance/)
- ✅ PostgreSQL Hosting Provider (if cloud-hosted)
- ✅ n8n (if using n8n Cloud): [BAA Agreement](https://n8n.io/legal/business-associate-agreement)
- ✅ Google (if using Sheets/Drive): [G Suite BAA](https://support.google.com/a/answer/3407054)
- ✅ Airtable: Contact for Enterprise BAA

### Incident Response

**If audit log tampering detected:**

1. **Isolate:** Immediately revoke write access to audit database
2. **Investigate:** Query hash chain to identify tampered records
3. **Restore:** Recover from S3 archive or last known good backup
4. **Notify:** Report to security team and compliance officer
5. **Document:** Create incident report with timeline and impact
6. **Remediate:** Patch vulnerability, rotate credentials, enhance monitoring

**Tampering Detection Query:**
```sql
-- Run daily via cron job
SELECT
  COUNT(*) AS tampered_records
FROM (
  SELECT
    audit_id,
    ts,
    CASE
      WHEN encode(
        digest(
          jsonb_build_object(...)::text,
          'sha256'
        ),
        'hex'
      ) = record_hash THEN 'VALID'
      ELSE 'TAMPERED'
    END AS status
  FROM audit_log
) AS verification
WHERE status = 'TAMPERED';
```

If `tampered_records > 0`, trigger alert immediately.

---

## Query Examples

### Common Audit Queries

**1. All events for a specific patient:**
```sql
SELECT
  ts,
  module,
  event,
  actor_id,
  payload_json
FROM audit_log
WHERE payload_json @> '{"patient_id": "***6789"}'  -- Use masked ID
ORDER BY ts DESC;
```

**2. All document exports in last 30 days:**
```sql
SELECT
  ts,
  actor_id,
  actor_ip,
  resource_id,
  payload_json->>'doc_type' AS doc_type,
  payload_json->>'patient_id' AS patient_id
FROM audit_log
WHERE event = 'document_export'
  AND ts > NOW() - INTERVAL '30 days'
ORDER BY ts DESC;
```

**3. Failed login attempts by user:**
```sql
SELECT
  ts,
  actor_id,
  actor_ip,
  payload_json->>'reason' AS failure_reason
FROM audit_log
WHERE event IN ('login_failure', 'auth_failure')
  AND actor_id = 'user_123'
ORDER BY ts DESC;
```

**4. After-hours PHI access:**
```sql
SELECT
  ts,
  module,
  event,
  actor_id,
  actor_ip,
  resource_type,
  resource_id
FROM audit_log
WHERE (
    event IN ('phi_access', 'document_view', 'patient_record_access')
    OR resource_type IN ('patient_record', 'document')
  )
  AND (
    EXTRACT(HOUR FROM ts) >= 18
    OR EXTRACT(HOUR FROM ts) < 8
  )
  AND ts > NOW() - INTERVAL '7 days'
ORDER BY ts DESC;
```

**5. High-risk events by severity:**
```sql
SELECT
  ts,
  module,
  event,
  severity,
  actor_id,
  resource_type,
  resource_id
FROM audit_log
WHERE severity IN ('high', 'critical')
  AND ts > NOW() - INTERVAL '7 days'
ORDER BY ts DESC;
```

**6. Activity by specific user:**
```sql
SELECT
  ts,
  module,
  event,
  resource_type,
  resource_id,
  severity
FROM audit_log
WHERE actor_id = 'doctor_jane_smith'
  AND ts > NOW() - INTERVAL '24 hours'
ORDER BY ts DESC;
```

**7. Bulk operations (potential data breach):**
```sql
SELECT
  ts,
  event,
  actor_id,
  actor_ip,
  payload_json->>'record_count' AS records_affected,
  payload_json->>'destination' AS export_destination
FROM audit_log
WHERE event IN ('bulk_download', 'bulk_export', 'mass_delete')
ORDER BY ts DESC;
```

**8. Most active modules (last 7 days):**
```sql
SELECT
  module,
  COUNT(*) AS event_count,
  COUNT(DISTINCT actor_id) AS unique_actors
FROM audit_log
WHERE ts > NOW() - INTERVAL '7 days'
GROUP BY module
ORDER BY event_count DESC;
```

**9. Events by hour (identify peak times):**
```sql
SELECT
  EXTRACT(HOUR FROM ts) AS hour,
  COUNT(*) AS event_count
FROM audit_log
WHERE ts > NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM ts)
ORDER BY hour;
```

**10. Search by trace_id (cross-module correlation):**
```sql
SELECT
  ts,
  module,
  event,
  actor_id,
  resource_type,
  resource_id
FROM audit_log
WHERE trace_id = 'DOC-1737285600000'
ORDER BY ts ASC;
```

### Advanced JSONB Queries

**11. Find documents with specific type:**
```sql
SELECT
  ts,
  actor_id,
  resource_id,
  payload_json->>'doc_type' AS doc_type
FROM audit_log
WHERE event = 'document_uploaded'
  AND payload_json->>'doc_type' = 'lab_result'
  AND ts > NOW() - INTERVAL '30 days';
```

**12. Events with payload containing specific field:**
```sql
SELECT
  ts,
  module,
  event,
  actor_id,
  payload_json
FROM audit_log
WHERE payload_json ? 'ssn'  -- Check if key exists
  OR payload_json ? 'credit_card'
ORDER BY ts DESC;
```

**13. Aggregate by actor type:**
```sql
SELECT
  actor_type,
  COUNT(*) AS total_events,
  COUNT(DISTINCT actor_id) AS unique_actors,
  AVG(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) AS high_severity_rate
FROM audit_log
WHERE ts > NOW() - INTERVAL '30 days'
GROUP BY actor_type;
```

---

## Troubleshooting

### Issue 1: Workflow Not Receiving Events

**Symptoms:**
- POST to webhook returns 404 or timeout
- No execution history in n8n

**Diagnosis:**
```bash
# Check webhook URL
curl -v https://your-n8n.com/webhook/aigent-audit-log

# Expected: 200 OK or 400 (missing body)
# Actual: 404 = workflow not active or wrong path
```

**Solutions:**
1. **Activate workflow:** Ensure workflow toggle is ON
2. **Verify webhook path:** Node 901 path must match URL
3. **Check n8n instance:** Ensure n8n is running and accessible
4. **Test with simple payload:**
   ```bash
   curl -X POST https://your-n8n.com/webhook/aigent-audit-log \
     -H "Content-Type: application/json" \
     -d '{"module":"test","event":"test","timestamp":"2025-10-30T14:00:00Z"}'
   ```

### Issue 2: PostgreSQL Connection Error

**Symptoms:**
- Error: `PostgreSQL connection timeout`
- Stage: `persist`

**Diagnosis:**
```bash
# Test PostgreSQL connection
psql -h localhost -U audit_user -d audit_db -c "SELECT 1;"

# Check if table exists
psql -h localhost -U audit_user -d audit_db -c "\dt"
```

**Solutions:**
1. **Check credentials:** Verify `PG_CONN_STRING` in `.env`
2. **Create table:** Run schema SQL (see Installation section)
3. **Network access:** Ensure n8n can reach PostgreSQL host
4. **Connection pool:** Check if max connections exceeded:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

### Issue 3: Hash Chain Verification Fails

**Symptoms:**
- Hash chain query shows `TAMPERED` or `BROKEN_CHAIN`

**Diagnosis:**
```sql
-- Check if prev_hash matches previous record_hash
WITH chain AS (
  SELECT
    audit_id,
    ts,
    record_hash,
    prev_hash,
    LAG(record_hash) OVER (ORDER BY ts) AS expected_prev_hash
  FROM audit_log
  ORDER BY ts
)
SELECT
  audit_id,
  ts,
  CASE
    WHEN prev_hash = expected_prev_hash OR prev_hash = '0000...' THEN 'VALID'
    ELSE 'BROKEN'
  END AS status
FROM chain
WHERE prev_hash != expected_prev_hash
  AND prev_hash != '0000000000000000000000000000000000000000000000000000000000000000';
```

**Possible Causes:**
1. **Concurrent writes:** Two events processed simultaneously
2. **Manual record insertion:** Record added without proper prev_hash
3. **Database corruption:** Rare, but possible
4. **Tampering:** Unauthorized modification

**Solutions:**
1. **Check S3 archive:** Compare against immutable archive
2. **Restore from backup:** Use last known good backup
3. **Re-verify:** Run verification query multiple times
4. **Lock down:** Revoke write access, investigate

### Issue 4: S3 Upload Fails

**Symptoms:**
- Error: `Access Denied` or `NoSuchBucket`
- Stage: `archive`

**Diagnosis:**
```bash
# Test S3 access
aws s3 ls s3://aigent-audit-archive/

# Test upload
echo "test" | aws s3 cp - s3://aigent-audit-archive/test.txt
```

**Solutions:**
1. **Check credentials:** Verify `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`
2. **Bucket exists:** Create bucket if missing:
   ```bash
   aws s3 mb s3://aigent-audit-archive --region us-east-1
   ```
3. **IAM policy:** Ensure user has `s3:PutObject` permission
4. **Bucket policy:** Remove any DENY rules blocking uploads

### Issue 5: Alerts Not Sending

**Symptoms:**
- High-severity events logged but no Slack/Email alert

**Diagnosis:**
```bash
# Test Slack webhook
curl -X POST https://hooks.slack.com/services/T.../B.../XXX... \
  -H "Content-Type: application/json" \
  -d '{"text": "Test from Aigent Module 09"}'

# Expected: "ok"
```

**Solutions:**
1. **Check alert config:** Verify `ALERT_SEVERITY` and `WATCH_EVENTS`
2. **Test webhook:** Use curl to test Slack/Email directly
3. **Review alert conditions:** Send test event matching criteria
4. **Check execution history:** Look for errors in nodes 917-918

### Issue 6: PHI Masking Not Applied

**Symptoms:**
- Full emails/IPs visible in audit logs

**Diagnosis:**
```sql
-- Check if masking applied
SELECT
  actor_id,
  actor_ip,
  payload_json->>'patient_email' AS patient_email
FROM audit_log
WHERE actor_id LIKE '%@%'  -- Should be masked
  OR actor_ip NOT LIKE '%***%'  -- Should be masked
LIMIT 10;
```

**Solutions:**
1. **Check env vars:** Verify `MASK_EMAIL_LOCAL=true`, `MASK_IP=true`
2. **Review Node 903:** Ensure PHI minimization code is correct
3. **Test masking:**
   ```javascript
   // In Node 903
   console.log('Before masking:', $json.actor_id);
   // ... masking code ...
   console.log('After masking:', $json.actor_id);
   ```

### Issue 7: Duplicate Audit IDs

**Symptoms:**
- Error: `duplicate key value violates unique constraint "audit_log_pkey"`

**Diagnosis:**
```sql
-- Check for duplicate audit_ids
SELECT audit_id, COUNT(*)
FROM audit_log
GROUP BY audit_id
HAVING COUNT(*) > 1;
```

**Solutions:**
1. **Check audit_id generation:** Node 902 should use timestamp + random
2. **Add idempotency:** PostgreSQL INSERT uses `ON CONFLICT DO NOTHING`
3. **Use UUIDs:** Alternative to ksuid pattern:
   ```javascript
   const { v4: uuidv4 } = require('uuid');
   const audit_id = `aud_${uuidv4()}`;
   ```

### Issue 8: Performance Degradation

**Symptoms:**
- Slow query responses
- High CPU on PostgreSQL

**Diagnosis:**
```sql
-- Check slow queries
SELECT
  query,
  calls,
  total_time / 1000 AS total_seconds,
  mean_time / 1000 AS avg_seconds
FROM pg_stat_statements
WHERE query LIKE '%audit_log%'
ORDER BY total_time DESC
LIMIT 10;

-- Check missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE tablename = 'audit_log'
  AND n_distinct > 100;
```

**Solutions:**
1. **Add indexes:** See Installation section for recommended indexes
2. **Vacuum table:** `VACUUM ANALYZE audit_log;`
3. **Partition table:** For >1M records, partition by date:
   ```sql
   CREATE TABLE audit_log_2025_10 PARTITION OF audit_log
   FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
   ```
4. **Archive old data:** Move records >1 year to separate table

---

## Performance Tuning

### PostgreSQL Optimization

**1. Connection Pooling:**
```bash
# .env
PG_POOL_MIN=5
PG_POOL_MAX=20
```

**2. Prepared Statements:**
```sql
-- Node 907 - Use prepared statement
PREPARE insert_audit AS
INSERT INTO audit_log (audit_id, ts, module, event, ...)
VALUES ($1, $2, $3, $4, ...);

EXECUTE insert_audit ('aud_...', '2025-10-30', 'Module_01', 'lead_created', ...);
```

**3. Batch Inserts (future enhancement):**
```sql
-- Instead of individual inserts, batch 100 at a time
INSERT INTO audit_log (audit_id, ts, module, ...)
VALUES
  ('aud_001', ...),
  ('aud_002', ...),
  ...
  ('aud_100', ...);
```

**4. Partitioning (>1M records):**
```sql
-- Convert to partitioned table
CREATE TABLE audit_log_partitioned (
  LIKE audit_log INCLUDING ALL
) PARTITION BY RANGE (ts);

-- Create monthly partitions
CREATE TABLE audit_log_2025_10 PARTITION OF audit_log_partitioned
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE audit_log_2025_11 PARTITION OF audit_log_partitioned
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

**5. Autovacuum Tuning:**
```
# postgresql.conf
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
```

### S3 Archive Optimization

**1. Lifecycle Policy (move to Glacier after 1 year):**
```json
{
  "Rules": [{
    "Id": "ArchiveOldAudits",
    "Status": "Enabled",
    "Transitions": [{
      "Days": 365,
      "StorageClass": "GLACIER"
    }],
    "Prefix": "audit/"
  }]
}
```

**2. Partition Pruning (Athena queries):**
```sql
-- Query only specific partitions
SELECT * FROM audit_logs
WHERE year=2025 AND month=10 AND day=30 AND hour=14;
```

**3. Compression (gzip JSONL):**
```javascript
// Node 911 - Compress before upload
const zlib = require('zlib');
const compressed = zlib.gzipSync(jsonl_record);
event.s3_archive.compressed = compressed.toString('base64');
```

### Query Performance Tips

**1. Use Indexes:**
```sql
-- Already created in schema, but verify:
EXPLAIN ANALYZE
SELECT * FROM audit_log WHERE actor_id = 'user_123';

-- Should show "Index Scan using idx_audit_actor"
```

**2. Limit Result Sets:**
```sql
-- Always use LIMIT for large tables
SELECT * FROM audit_log
ORDER BY ts DESC
LIMIT 100;  -- Good

-- Avoid full table scans
SELECT * FROM audit_log;  -- Bad for large tables
```

**3. Use Materialized Views for Dashboards:**
```sql
-- Pre-compute expensive aggregations
CREATE MATERIALIZED VIEW audit_summary AS
SELECT
  DATE(ts) AS date,
  module,
  event,
  COUNT(*) AS event_count
FROM audit_log
GROUP BY DATE(ts), module, event;

-- Refresh daily
REFRESH MATERIALIZED VIEW audit_summary;
```

---

## Appendix

### Environment Variable Reference

See `.env.aigent_module_09_example` for complete list (150+ variables)

### Glossary

- **Audit Log:** Chronological record of system activities
- **Hash Chain:** Blockchain-style linked hashes for tamper detection
- **PHI:** Protected Health Information (HIPAA)
- **Idempotency:** Ability to process same request multiple times without duplication
- **JSONL:** JSON Lines format (one JSON object per line)
- **Retention Policy:** Rules for how long to keep audit records
- **Dead Letter Queue:** Storage for failed events
- **Signed URL:** Time-limited URL for secure S3 access

### Related Documentation

- [Module 01 - Intake & Lead Capture](Aigent_Module_01_README.md)
- [Module 06 - Document Capture & OCR](Aigent_Module_06_README.md)
- [Module 08 - Messaging & Omnichannel Hub](Aigent_Module_08_README_EXPANDED.md)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [n8n Documentation](https://docs.n8n.io)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [AWS S3 Encryption](https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html)

### Support & Community

**Issues:**
- GitHub: https://github.com/your-org/aigent-modules/issues

**Commercial Support:**
- Email: support@aigent.com
- Pricing: Contact for enterprise support packages

---

**End of Module 09 Documentation**

*Version 1.0.0 - Last Updated: 2025-10-30*
