# Module 09 Enterprise: Compliance & Audit

**Version:** enterprise-1.0.0
**Branch:** Enterprise (HIPAA-Ready, SOC2-Ready, Secure, Immutable)
**Target Users:** Healthcare organizations, medical practices, enterprises requiring HIPAA/SOC2/GDPR audit trails

---

## Purpose

Enterprise-grade compliance and audit logging platform with **SIEM integration**, **encrypted log storage**, **tamper-proof logging**, **blockchain hashing**, **real-time anomaly detection**, **automated compliance reporting**, **user behavior analytics**, **log retention policies**, **immutable audit trails**, **access control logging**, **data lineage tracking**, **incident response workflows**, and **multi-tenant log isolation**. Designed for healthcare organizations and enterprises requiring comprehensive, compliant, and secure audit trails for HIPAA, SOC2, GDPR, and other regulatory frameworks.

**Key Difference from Core:** Adds SIEM integration, encrypted storage, tamper-proof logging, anomaly detection, compliance reports, retention policies, and advanced security features far beyond basic Google Sheets logging.

---

## Features Comparison

### ✅ Enterprise Features (vs Core)

**Core Features Included:**
- ✅ Append-only audit log
- ✅ Event tracking (user actions, system events)
- ✅ Required field validation
- ✅ Trace ID generation
- ✅ Retry logic

**Enterprise Additions - Storage & Security:**
- ✅ Encrypted log storage (AES-256 at rest)
- ✅ Tamper-proof logging (blockchain hash chains)
- ✅ Immutable logs (cryptographically signed)
- ✅ Multi-tier storage (hot, warm, cold)
- ✅ Database storage (PostgreSQL, MongoDB, Elasticsearch)
- ✅ S3/Glacier archival (long-term retention)
- ✅ Log replication (disaster recovery)
- ✅ Access control logs (RBAC tracking)

**Enterprise Additions - SIEM Integration:**
- ✅ Splunk connector (enterprise SIEM)
- ✅ Datadog connector (APM + logs)
- ✅ Sumo Logic connector (cloud SIEM)
- ✅ ELK Stack connector (Elasticsearch, Logstash, Kibana)
- ✅ Azure Sentinel connector
- ✅ AWS CloudWatch Logs
- ✅ Google Cloud Logging
- ✅ Real-time log streaming (sub-second latency)

**Enterprise Additions - Advanced Search & Query:**
- ✅ Full-text search (Elasticsearch)
- ✅ Complex query interface (SQL, Lucene syntax)
- ✅ Time-range filtering (millisecond precision)
- ✅ Field-specific searches
- ✅ Regex pattern matching
- ✅ Aggregations & analytics
- ✅ Saved search queries
- ✅ Search API (programmatic access)

**Enterprise Additions - Compliance Reporting:**
- ✅ HIPAA audit report generation (automated)
- ✅ SOC2 Type II evidence collection
- ✅ GDPR compliance reports
- ✅ PCI DSS audit trails
- ✅ Custom compliance frameworks
- ✅ Scheduled report delivery (weekly, monthly, quarterly)
- ✅ Executive summary reports
- ✅ Compliance dashboard (KPIs)

**Enterprise Additions - Retention & Archival:**
- ✅ Automated log retention policies (7 years default)
- ✅ Log rotation (daily, weekly, monthly)
- ✅ Auto-archival to cold storage (S3 Glacier)
- ✅ Legal hold (prevent deletion during investigations)
- ✅ Secure purge (after retention period)
- ✅ Audit trail of deletions (who deleted what, when)
- ✅ Restoration from archive

**Enterprise Additions - Anomaly Detection:**
- ✅ ML-powered anomaly detection
- ✅ User behavior analytics (UBA)
- ✅ Unusual access pattern detection
- ✅ Failed login spike detection
- ✅ Data exfiltration detection
- ✅ Privilege escalation detection
- ✅ Geographic anomalies (unusual login locations)
- ✅ Time-based anomalies (login at unusual hours)

**Enterprise Additions - Alerting:**
- ✅ Real-time alert rules (threshold-based)
- ✅ Alert escalation (notify manager if not acknowledged)
- ✅ Multi-channel alerts (email, Slack, SMS, PagerDuty)
- ✅ Alert suppression (reduce noise)
- ✅ Alert correlation (group related events)
- ✅ Incident creation (auto-create tickets)
- ✅ Alert dashboard (active alerts view)

**Enterprise Additions - GRC Integration:**
- ✅ ServiceNow GRC connector
- ✅ OneTrust connector
- ✅ Archer GRC connector
- ✅ Compliance policy mapping
- ✅ Control evidence collection
- ✅ Risk assessment integration
- ✅ Audit preparation workflows

**Enterprise Additions - Incident Response:**
- ✅ Incident response workflows
- ✅ Chain of custody tracking
- ✅ Forensic log export
- ✅ Timeline reconstruction
- ✅ Root cause analysis tools
- ✅ Incident report generation
- ✅ Post-incident review

**Enterprise Additions - Healthcare-Specific:**
- ✅ PHI access tracking (who accessed which patient record)
- ✅ Break-the-glass auditing (emergency access)
- ✅ Minimum necessary access verification
- ✅ Patient data breach detection
- ✅ Provider activity tracking
- ✅ EHR integration audit logs
- ✅ ePHI transmission logs

**Enterprise Additions - Advanced Logging:**
- ✅ IP address logging (with geolocation)
- ✅ User agent tracking (device, browser)
- ✅ Session tracking (full user journey)
- ✅ Data lineage tracking (data transformation audit)
- ✅ Change management logs (config changes)
- ✅ Privilege escalation logs
- ✅ Failed authentication tracking
- ✅ API access logs

**Enterprise Additions - Observability:**
- ✅ Log ingestion metrics (events/second)
- ✅ Storage usage tracking
- ✅ Query performance monitoring
- ✅ SIEM connection health
- ✅ Alert delivery success rate
- ✅ System health dashboard

### ❌ Core Limitations (Addressed in Enterprise)

- ❌ No encryption (Google Sheets standard encryption only)
- ❌ No tamper detection (logs can be edited)
- ❌ No SIEM integration
- ❌ No advanced search (basic Sheets filtering only)
- ❌ No compliance reports (manual export required)
- ❌ No retention policies (manual deletion)
- ❌ No anomaly detection
- ❌ No alerting (must check logs manually)
- ❌ No access logs (who viewed audit logs)
- ❌ No data lineage tracking
- ❌ Slow with >10,000 events (Google Sheets limits)
- ❌ No incident response tools
- ❌ No GRC integration

---

## Data Flow

```
[Event Source] → Auth Check → Metadata → Validate → Enrich → Hash Chain → [Storage Tier] → SIEM Stream → Anomaly Detection → Alert Engine
                      ↓                                          ↓                ↓
                    401                                   [PostgreSQL]      [Splunk/Datadog]
                                                         [Elasticsearch]    [Sumo Logic]
                                                              [S3]          [ELK Stack]
                                                                                  ↓
                                                                         Alert Rules → Notifications
                                                                                  ↓
                                                                         GRC Platform (ServiceNow)
```

**Execution Time:** ~500ms average (database write + SIEM stream)

**Tamper-Proof Chain:**
```
Event 1 → Hash(Event1)
Event 2 → Hash(Event2 + Hash1)
Event 3 → Hash(Event3 + Hash2)
...
```
If any event is modified, entire chain breaks (tamper detection).

---

## Tamper-Proof Logging

### Blockchain Hash Chain

**Concept:** Each audit log entry includes hash of previous entry, creating immutable chain.

**Implementation:**

**Event 1:**
```json
{
  "audit_id": "AUDIT-1730851234567",
  "event_type": "user_action",
  "user_id": "staff_jane",
  "action": "login",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000",
  "current_hash": "a3f7k2c9d8e1b4f6g5h9j7k8l2m3n4o5p6q7r8s9t1u2v3w4x5y6z7a8b9c1d2"
}
```

**Event 2:**
```json
{
  "audit_id": "AUDIT-1730851234568",
  "event_type": "data_access",
  "user_id": "staff_jane",
  "action": "view_patient_record",
  "resource_id": "patient_12345",
  "timestamp": "2025-11-06T12:35:10.123Z",
  "previous_hash": "a3f7k2c9d8e1b4f6g5h9j7k8l2m3n4o5p6q7r8s9t1u2v3w4x5y6z7a8b9c1d2",
  "current_hash": "b4g8l3d9f2c5h6j9k1m4n7p8q2r5s8t1u4v7w9x2y5z8a1b4c7d9e2f5g8h1j4"
}
```

**Event 3:**
```json
{
  "audit_id": "AUDIT-1730851234569",
  "event_type": "data_modification",
  "user_id": "staff_jane",
  "action": "update_patient_address",
  "resource_id": "patient_12345",
  "details": "Updated address from '123 Old St' to '456 New Ave'",
  "timestamp": "2025-11-06T12:36:25.456Z",
  "previous_hash": "b4g8l3d9f2c5h6j9k1m4n7p8q2r5s8t1u4v7w9x2y5z8a1b4c7d9e2f5g8h1j4",
  "current_hash": "c5h9m4e1g3d6j8k2n5p9q3r6s9t2u5v8w1x4y7z9a2b5c8d1e4f7g9h2j5k8m1"
}
```

**Hash Algorithm:** SHA-256

**Hash Calculation:**
```javascript
current_hash = SHA256(
  audit_id +
  event_type +
  user_id +
  action +
  resource_id +
  timestamp +
  details +
  previous_hash
)
```

**Verification:**
1. Retrieve log entry #100
2. Recalculate hash using entry data + previous_hash
3. Compare calculated hash with stored current_hash
4. If match → Log entry untampered
5. If mismatch → Tampering detected! Alert security team

**Tamper Detection:**
- If attacker modifies Event 2 (e.g., changes user_id)
- Event 2's current_hash will change
- Event 3's previous_hash won't match Event 2's new hash
- Chain broken → Alert triggered

**Benefit:** Even database admin cannot modify logs without detection

### Cryptographic Signatures

**Additional Security Layer:** Digital signatures

**Process:**
1. Generate audit log entry
2. Sign entry with private key (RSA-2048)
3. Store signature with entry
4. Verification: Use public key to verify signature

**Example:**
```json
{
  "audit_id": "AUDIT-1730851234567",
  "event_type": "user_action",
  "user_id": "staff_jane",
  "action": "login",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "signature": "mQENBF2... [base64 encoded RSA signature]",
  "signed_by": "aigent-audit-system",
  "signing_algorithm": "RSA-SHA256"
}
```

**Verification:**
```bash
# Verify signature using public key
openssl dgst -sha256 -verify public_key.pem -signature signature.bin audit_entry.json
# Output: Verified OK (or Verification Failure if tampered)
```

**Use Cases:**
- Legal proceedings (prove log integrity)
- Compliance audits (demonstrate logs untampered)
- Forensic investigations (chain of custody)

---

## SIEM Integration

### Supported SIEM Platforms

**1. Splunk Enterprise**
- **Protocol:** HTTP Event Collector (HEC)
- **Setup Time:** 30 minutes
- **Cost:** $150/GB/year (ingestion)
- **Best For:** Large enterprises, complex analytics

**Setup:**
1. Splunk → Settings → Data Inputs → HTTP Event Collector → New Token
2. Copy HEC token
3. Add to n8n credentials: `SPLUNK_HEC_TOKEN`
4. Configure endpoint: `https://splunk.company.com:8088/services/collector`
5. Test connection: Send sample event

**Example Event:**
```json
{
  "sourcetype": "aigent:audit",
  "source": "module_09_enterprise",
  "event": {
    "audit_id": "AUDIT-1730851234567",
    "event_type": "user_action",
    "user_id": "staff_jane",
    "action": "login",
    "timestamp": "2025-11-06T12:34:56.789Z",
    "client_ip": "192.168.1.100"
  }
}
```

**2. Datadog**
- **Protocol:** Datadog Logs API
- **Setup Time:** 20 minutes
- **Cost:** $0.10/GB ingested + $1.27/million events indexed
- **Best For:** Cloud-native, APM + logs unified view

**Setup:**
1. Datadog → Logs → Configuration → API Keys
2. Copy API key
3. Add to n8n: `DATADOG_API_KEY`
4. Configure endpoint: `https://http-intake.logs.datadoghq.com/v1/input`
5. Set tags: `env:production`, `service:aigent-audit`

**3. Sumo Logic**
- **Protocol:** HTTP Source
- **Setup Time:** 25 minutes
- **Cost:** $1.08/GB/day (continuous tier)
- **Best For:** Cloud SIEM, security analytics

**Setup:**
1. Sumo Logic → Manage Data → Collection → Add HTTP Source
2. Copy source URL
3. Add to n8n: `SUMOLOGIC_HTTP_SOURCE_URL`
4. Configure metadata: `_sourceCategory=aigent/audit`

**4. ELK Stack (Elasticsearch, Logstash, Kibana)**
- **Protocol:** Elasticsearch REST API
- **Setup Time:** 60 minutes (self-hosted)
- **Cost:** Free (open source) or Elastic Cloud $95/month
- **Best For:** Self-hosted, full control, cost-sensitive

**Setup:**
1. Install Elasticsearch: `docker run -p 9200:9200 elasticsearch:8.11.0`
2. Create index: `PUT /aigent-audit-logs`
3. Configure mapping (field types)
4. Add to n8n: `ELASTICSEARCH_URL`, `ELASTICSEARCH_USERNAME`, `ELASTICSEARCH_PASSWORD`
5. Bulk insert API for performance

**5. Azure Sentinel**
- **Protocol:** Azure Monitor HTTP Data Collector API
- **Setup Time:** 40 minutes
- **Cost:** $2.46/GB ingested
- **Best For:** Microsoft Azure environments

**6. AWS CloudWatch Logs**
- **Protocol:** AWS SDK (PutLogEvents)
- **Setup Time:** 35 minutes
- **Cost:** $0.50/GB ingested + $0.03/GB archived
- **Best For:** AWS environments

**7. Google Cloud Logging**
- **Protocol:** Cloud Logging API
- **Setup Time:** 30 minutes
- **Cost:** $0.50/GB ingested (first 50 GB/month free)
- **Best For:** Google Cloud environments

### Real-Time Log Streaming

**Latency:** <1 second from event occurrence to SIEM availability

**Implementation:**
1. Audit event captured
2. Write to primary database (PostgreSQL)
3. Simultaneously stream to SIEM (parallel, non-blocking)
4. If SIEM unavailable → Queue locally, retry later
5. Alert if SIEM disconnected >5 minutes

**Architecture:**
```
Audit Event
    ↓
Write to DB (synchronous, 200ms)
    ↓
Stream to SIEM (asynchronous, 300ms)
    ↓
Return success (total 500ms)
```

**Retry Logic:**
- If SIEM stream fails → Retry 3 times (exponential backoff: 1s, 2s, 4s)
- If all retries fail → Store in local queue (Google Sheets or S3)
- Background worker checks queue every 5 minutes → Re-attempt SIEM delivery
- Alert if queue >1,000 events (SIEM connection issue)

---

## Anomaly Detection

### User Behavior Analytics (UBA)

**ML Models:** Isolation Forest, LSTM neural networks

**Baseline Period:** 30 days (learns normal user behavior)

**Anomalies Detected:**

**1. Unusual Access Volume**
```
Normal: Staff member accesses 10-15 patient records/day
Anomaly: Staff member accesses 150 patient records in 2 hours
Alert: "Potential data breach: User staff_jane accessed 150 records in 2 hours (normal: 12/day)"
```

**2. Unusual Access Time**
```
Normal: User logs in weekdays 8am-6pm
Anomaly: User logs in Sunday 3am
Alert: "Unusual login: User staff_jane logged in at 03:15 on Sunday (outside normal hours)"
```

**3. Geographic Anomaly**
```
Normal: User logs in from Boston, MA (IP: 192.168.1.100)
Anomaly: User logs in from Moscow, Russia (IP: 95.123.45.67) 30 minutes later
Alert: "Impossible travel: User staff_jane logged in from Moscow 30 min after Boston login"
```

**4. Failed Login Spike**
```
Normal: 0-1 failed logins/day
Anomaly: 25 failed login attempts in 5 minutes
Alert: "Brute force attack detected: 25 failed login attempts for user staff_jane"
```

**5. Privilege Escalation**
```
Normal: User has "Staff" role
Anomaly: User role changed to "Admin" outside of normal change management
Alert: "Privilege escalation: User staff_jane role changed from Staff to Admin by admin_sarah"
```

**6. Data Exfiltration**
```
Normal: User exports 0-2 reports/week
Anomaly: User exports 50 patient records to CSV in 1 hour
Alert: "Potential data exfiltration: User staff_jane exported 50 records (normal: 2/week)"
```

**7. Unusual Data Access Pattern**
```
Normal: User accesses patients assigned to them
Anomaly: User accesses 20 patients not assigned to them (e.g., celebrities, VIPs)
Alert: "Unusual access pattern: User staff_jane accessed 20 unassigned patient records"
```

### Anomaly Detection Configuration

**Sensitivity Levels:**
- **Low:** Alert only on critical anomalies (95th percentile)
- **Medium:** Alert on moderate anomalies (90th percentile)
- **High:** Alert on minor anomalies (80th percentile)

**Setup:**
```bash
ANOMALY_DETECTION_ENABLED="true"
ANOMALY_SENSITIVITY="medium"  # low, medium, high
BASELINE_PERIOD_DAYS="30"
ML_MODEL="isolation_forest"  # or "lstm"
ANOMALY_ALERT_WEBHOOK="https://hooks.slack.com/services/..."
```

**Whitelisting:**
```json
{
  "whitelisted_users": ["system", "admin_sarah"],
  "whitelisted_actions": ["automated_backup"],
  "whitelisted_ips": ["192.168.1.0/24"]
}
```

### Incident Auto-Creation

**Flow:** Anomaly Detected → Severity Assessment → Create Incident

**Severity Levels:**
1. **Critical:** Data breach, unauthorized PHI access
2. **High:** Privilege escalation, failed login spike
3. **Medium:** Unusual access pattern, geographic anomaly
4. **Low:** Access volume spike (within reasonable limits)

**Incident Creation:**
```json
{
  "incident_id": "INC-1730851234567",
  "severity": "high",
  "title": "Unusual login: staff_jane logged in at 03:15 on Sunday",
  "description": "User staff_jane logged in at 03:15:23 on Sunday, November 6, 2025 from IP 192.168.1.100. Normal login hours: Mon-Fri 8am-6pm.",
  "affected_user": "staff_jane",
  "detection_time": "2025-11-06T03:15:23Z",
  "status": "open",
  "assigned_to": "security_team",
  "related_audit_logs": ["AUDIT-1730851234567", "AUDIT-1730851234568"]
}
```

**Incident Workflow:**
1. Anomaly detected → Create incident
2. Assign to security team (Slack notification)
3. Security team investigates (review related logs)
4. Determine: False positive or true threat
5. If threat → Escalate (lock user account, notify management)
6. If false positive → Close incident, update whitelist
7. Post-incident review (update detection rules)

---

## Compliance Reporting

### HIPAA Audit Report

**Generated Monthly (Automated)**

**Report Sections:**

**1. Executive Summary**
- Total audit events logged
- PHI access events (count)
- Security incidents (count)
- Failed login attempts
- Unusual access patterns detected
- Compliance status: ✅ Compliant or ⚠️ Issues Found

**2. Access Logs**
- Who accessed PHI (staff list)
- What PHI was accessed (patient IDs, redacted details)
- When accessed (timestamps)
- Why accessed (action: view, edit, export)
- Where accessed (IP addresses, locations)

**Example Table:**

| Date | User | Patient ID | Action | IP Address | Location |
|------|------|------------|--------|------------|----------|
| 2025-11-01 09:15 | staff_jane | PAT-12345 | view_record | 192.168.1.100 | Boston, MA |
| 2025-11-01 10:30 | staff_john | PAT-12346 | update_address | 192.168.1.101 | Boston, MA |
| 2025-11-02 14:20 | staff_jane | PAT-12347 | export_chart | 192.168.1.100 | Boston, MA |

**3. Security Events**
- Failed login attempts (user, count, time)
- Account lockouts
- Privilege changes
- Suspicious activity alerts

**4. PHI Disclosure Log**
- Patient data exports (who, what, when)
- Data transmitted to third parties (EHR integrations, billing systems)
- Patient portal access logs

**5. Audit Trail Integrity**
- Total log entries
- Hash chain verification status: ✅ Intact
- Tamper attempts detected: 0
- Log backup status: ✅ Backed up to S3

**6. Retention Compliance**
- Logs older than 7 years: Automatically purged
- Legal hold logs: Preserved (count)
- Archive storage usage: 125 GB

**7. Recommendations**
- Security improvements
- Policy updates
- Training needs

**Report Format:** PDF (25-40 pages, branded)

**Delivery:** Email to compliance officer, CISO, CEO (first Monday of month, 8am)

**Storage:** S3 bucket (encrypted), retained for 7 years

### SOC2 Type II Audit Report

**Generated Quarterly**

**Trust Services Criteria (TSC):**

**CC6.1: Logical and Physical Access Controls**
- Evidence: Access logs showing RBAC enforcement
- Evidence: Failed login attempts tracked
- Evidence: Password reset logs
- Evidence: Privileged access logs

**CC7.2: System Monitoring**
- Evidence: Real-time anomaly detection logs
- Evidence: Alert response times
- Evidence: Incident investigation logs

**CC7.3: Security Incident Management**
- Evidence: Incident response workflow logs
- Evidence: Escalation procedures followed
- Evidence: Post-incident reviews completed

**CC8.1: Change Management**
- Evidence: Configuration change logs
- Evidence: Approval workflows
- Evidence: Rollback procedures

**Report Sections:**
1. Control design (description of logging system)
2. Control evidence (sample audit logs)
3. Control effectiveness (metrics)
4. Exceptions (if any)
5. Remediation (actions taken)

**Format:** Excel workbook (30-50 tabs, one per control)

**Delivery:** Uploaded to external auditor portal

### GDPR Compliance Report

**Generated On-Demand or Monthly**

**Report Sections:**

**1. Data Subject Access Requests (DSAR)**
- Patient requests: "Show me all data you have about me"
- Evidence: Query logs showing data retrieval
- Evidence: Data export logs (CSV, JSON)
- Response time: <30 days (GDPR requirement)

**2. Right to Erasure (Right to be Forgotten)**
- Patient requests: "Delete all my data"
- Evidence: Deletion logs (what was deleted, when, by whom)
- Evidence: Backup purge logs
- Completion time: <30 days

**3. Data Breach Notifications**
- Breaches detected (count, severity)
- Notification sent to supervisory authority (<72 hours)
- Evidence: Breach detection logs, notification delivery receipts

**4. Consent Management**
- Opt-in logs (patient consent to data processing)
- Opt-out logs (withdrawal of consent)
- Consent audit trail

**5. Data Retention**
- Data older than retention period: Purged
- Legal basis for retention (e.g., healthcare records: 7 years)

**Format:** PDF (15-25 pages)

**Delivery:** Available via API for data protection officer

### Custom Compliance Reports

**Configuration:**
```json
{
  "report_name": "PCI DSS Audit Trail",
  "compliance_framework": "PCI DSS",
  "schedule": "quarterly",
  "sections": [
    "cardholder_data_access",
    "security_events",
    "network_access_logs",
    "change_management",
    "vulnerability_scans"
  ],
  "format": "pdf",
  "recipients": ["ciso@company.com", "auditor@firm.com"]
}
```

**Supported Frameworks:**
- HIPAA
- SOC2 Type I / Type II
- GDPR
- PCI DSS
- NIST 800-53
- ISO 27001
- FedRAMP
- Custom (define your own sections)

---

## Log Retention Policies

### Retention Tiers

**Tier 1: Hot Storage (0-90 days)**
- **Storage:** PostgreSQL / Elasticsearch
- **Access:** Real-time queries (<1 second)
- **Use Case:** Active investigations, recent event analysis
- **Cost:** $0.10/GB/month (database)

**Tier 2: Warm Storage (91 days - 2 years)**
- **Storage:** S3 Standard
- **Access:** Query within seconds (via Athena)
- **Use Case:** Historical analysis, audit preparation
- **Cost:** $0.023/GB/month

**Tier 3: Cold Storage (2-7 years)**
- **Storage:** S3 Glacier
- **Access:** Restore within 1-12 hours (depends on retrieval tier)
- **Use Case:** Long-term compliance retention, legal holds
- **Cost:** $0.004/GB/month

**Tier 4: Deleted (>7 years)**
- **Storage:** Secure deletion (overwrite 7 times, DoD 5220.22-M standard)
- **Exception:** Legal holds (prevent deletion during litigation)

### Automated Retention Workflow

**Daily Job (2:00 AM):**
1. Query logs older than 90 days still in hot storage
2. Export to S3 Standard (warm storage)
3. Delete from PostgreSQL
4. Verify S3 upload successful
5. Log retention action

**Weekly Job (Sunday 3:00 AM):**
1. Query logs older than 2 years in warm storage
2. Move to S3 Glacier (cold storage)
3. Update metadata (storage tier changed)
4. Verify Glacier upload

**Annual Job (January 1):**
1. Query logs older than 7 years
2. Check for legal holds (if yes → skip deletion)
3. Securely delete logs
4. Log deletion action (what was deleted, when, by whom)
5. Generate certificate of destruction

**Retention Policy Configuration:**
```bash
LOG_RETENTION_ENABLED="true"
HOT_STORAGE_DAYS="90"
WARM_STORAGE_DAYS="730"  # 2 years
COLD_STORAGE_YEARS="7"
AUTO_DELETE_AFTER_RETENTION="true"  # false = manual deletion
LEGAL_HOLD_CHECK="true"  # Check for holds before deletion
SECURE_DELETE_STANDARD="DoD_5220.22-M"  # 7-pass overwrite
```

### Legal Holds

**Use Case:** Litigation, investigation, regulatory inquiry

**Process:**
1. Legal team requests hold: "Preserve all logs for user staff_jane from 2025-01-01 to 2025-12-31"
2. Admin creates hold:
```json
{
  "hold_id": "HOLD-1730851234567",
  "reason": "Ongoing litigation: Case #2025-CV-12345",
  "scope": {
    "user_id": "staff_jane",
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-12-31"
    }
  },
  "created_by": "legal_team",
  "created_at": "2025-11-06T12:34:56Z",
  "status": "active"
}
```
3. Retention policy checks for holds before deletion
4. Held logs preserved indefinitely (even beyond 7 years)
5. When litigation resolves → Legal team releases hold
6. Logs resume normal retention schedule

**Hold Audit Trail:**
- Who created hold
- Why (litigation case #)
- What logs affected (count)
- When created
- When released
- Who released

---

## Required Fields

### Basic Audit Event

| Field | Type | Validation |
|-------|------|------------|
| `event_type` | string | Not empty (e.g., "user_action", "data_access", "security_event") |
| `user_id` | string | Not empty (user identifier or "system") |
| `action` | string | Not empty (e.g., "login", "view_record", "update_data") |

**Optional but Recommended:**
- `resource_id` (string) - ID of affected resource
- `details` (string) - Additional context
- `client_ip` (string) - IP address of user (Enterprise auto-captures)
- `user_agent` (string) - Browser/device info (Enterprise auto-captures)
- `session_id` (string) - Session identifier (for tracking user journey)
- `severity` (string) - "info", "warning", "critical"
- `data_classification` (string) - "public", "internal", "confidential", "phi"

### Enterprise-Specific Fields (Auto-Added)

| Field | Type | Description |
|-------|------|-------------|
| `audit_id` | string | Unique identifier (auto-generated) |
| `timestamp` | ISO 8601 | Event timestamp (millisecond precision) |
| `previous_hash` | string | Hash of previous log entry (blockchain chain) |
| `current_hash` | string | Hash of current entry + previous_hash |
| `signature` | string | Cryptographic signature (RSA-2048) |
| `client_ip` | string | IP address (with geolocation) |
| `geolocation` | object | {city, region, country, lat, lon} |
| `user_agent` | string | Device, browser, OS |
| `session_id` | string | Session tracking |
| `storage_tier` | string | "hot", "warm", "cold" |
| `siem_delivered` | boolean | Successfully streamed to SIEM |
| `anomaly_score` | number | 0.0 - 1.0 (ML model confidence) |

---

## Setup Instructions

### 1. Import Workflow
- Import `module_09_enterprise.json` to n8n

### 2. Choose Storage Backend

**Option A: PostgreSQL (Recommended for <1M events/month)**

1. **Provision Database:**
   - AWS RDS PostgreSQL (db.t3.medium: $70/month)
   - OR Google Cloud SQL PostgreSQL ($50/month)
   - OR Self-hosted (EC2 + EBS: $40/month)

2. **Create Schema:**
```sql
CREATE TABLE audit_logs (
  audit_id VARCHAR(64) PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  resource_id VARCHAR(128),
  action VARCHAR(128) NOT NULL,
  details TEXT,
  client_ip VARCHAR(45),
  geolocation JSONB,
  user_agent TEXT,
  session_id VARCHAR(128),
  severity VARCHAR(16) DEFAULT 'info',
  data_classification VARCHAR(32) DEFAULT 'internal',
  previous_hash VARCHAR(64) NOT NULL,
  current_hash VARCHAR(64) NOT NULL,
  signature TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  storage_tier VARCHAR(16) DEFAULT 'hot',
  siem_delivered BOOLEAN DEFAULT false,
  anomaly_score DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_client_ip ON audit_logs(client_ip);
```

3. **Add to n8n:**
   - Settings → Credentials → PostgreSQL
   - Host, port, database, username, password

**Option B: Elasticsearch (Recommended for >1M events/month, advanced search)**

1. **Provision Elasticsearch:**
   - Elastic Cloud (Essentials: $95/month)
   - OR AWS Elasticsearch Service ($100/month)
   - OR Self-hosted (3-node cluster: $200/month)

2. **Create Index:**
```json
PUT /aigent-audit-logs
{
  "mappings": {
    "properties": {
      "audit_id": {"type": "keyword"},
      "event_type": {"type": "keyword"},
      "user_id": {"type": "keyword"},
      "resource_id": {"type": "keyword"},
      "action": {"type": "keyword"},
      "details": {"type": "text"},
      "client_ip": {"type": "ip"},
      "geolocation": {"type": "geo_point"},
      "user_agent": {"type": "text"},
      "session_id": {"type": "keyword"},
      "severity": {"type": "keyword"},
      "data_classification": {"type": "keyword"},
      "previous_hash": {"type": "keyword"},
      "current_hash": {"type": "keyword"},
      "signature": {"type": "text"},
      "timestamp": {"type": "date"},
      "storage_tier": {"type": "keyword"},
      "siem_delivered": {"type": "boolean"},
      "anomaly_score": {"type": "float"}
    }
  }
}
```

3. **Add to n8n:**
   - Settings → Credentials → Elasticsearch
   - URL, username, password

**Option C: MongoDB (Recommended for flexibility, document model)**

Similar setup to PostgreSQL.

### 3. Configure SIEM Integration (Choose One or Multiple)

**Splunk:**
```bash
SIEM_ENABLED="true"
SIEM_PROVIDER="splunk"
SPLUNK_HEC_URL="https://splunk.company.com:8088/services/collector"
SPLUNK_HEC_TOKEN="your-hec-token"
SPLUNK_SOURCETYPE="aigent:audit"
```

**Datadog:**
```bash
SIEM_ENABLED="true"
SIEM_PROVIDER="datadog"
DATADOG_API_KEY="your-api-key"
DATADOG_SITE="datadoghq.com"  # or datadoghq.eu
DATADOG_SERVICE="aigent-audit"
DATADOG_ENV="production"
```

**ELK Stack:**
```bash
SIEM_ENABLED="true"
SIEM_PROVIDER="elasticsearch"
ELASTICSEARCH_URL="https://elasticsearch.company.com:9200"
ELASTICSEARCH_INDEX="aigent-audit-logs"
ELASTICSEARCH_USERNAME="elastic"
ELASTICSEARCH_PASSWORD="your-password"
```

### 4. Set Up S3 for Archival (Warm & Cold Storage)

1. **Create S3 Bucket:**
```bash
aws s3 mb s3://aigent-audit-logs-archive
```

2. **Enable Encryption:**
```bash
aws s3api put-bucket-encryption \
  --bucket aigent-audit-logs-archive \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

3. **Configure Lifecycle Policy:**
```json
{
  "Rules": [
    {
      "Id": "Move to Glacier after 2 years",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 730,
          "StorageClass": "GLACIER"
        }
      ]
    },
    {
      "Id": "Delete after 7 years",
      "Status": "Enabled",
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

4. **Add to n8n:**
```bash
S3_ENABLED="true"
S3_BUCKET="aigent-audit-logs-archive"
S3_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
```

### 5. Enable Hash Chain & Signatures

**Generate RSA Key Pair:**
```bash
# Generate private key
openssl genrsa -out audit_private_key.pem 2048

# Generate public key
openssl rsa -in audit_private_key.pem -outform PEM -pubout -out audit_public_key.pem
```

**Add to n8n:**
```bash
HASH_CHAIN_ENABLED="true"
HASH_ALGORITHM="sha256"
SIGNATURE_ENABLED="true"
PRIVATE_KEY_PATH="/path/to/audit_private_key.pem"
PUBLIC_KEY_PATH="/path/to/audit_public_key.pem"
```

**Important:** Store private key securely (AWS Secrets Manager, HashiCorp Vault)

### 6. Configure Anomaly Detection

```bash
ANOMALY_DETECTION_ENABLED="true"
ANOMALY_SENSITIVITY="medium"  # low, medium, high
BASELINE_PERIOD_DAYS="30"
ML_MODEL="isolation_forest"  # isolation_forest, lstm, autoencoder
ANOMALY_ALERT_WEBHOOK="https://hooks.slack.com/services/..."
ANOMALY_ALERT_EMAIL="security@company.com"
```

**Pre-Train Model:**
```bash
# Run baseline training workflow (one-time)
# Analyzes last 30 days of logs to learn normal patterns
n8n execute --workflow-id=train_anomaly_model
```

### 7. Set Up Compliance Reporting

```bash
COMPLIANCE_REPORTING_ENABLED="true"

# HIPAA Report
HIPAA_REPORT_ENABLED="true"
HIPAA_REPORT_SCHEDULE="0 8 1 * *"  # First day of month, 8am
HIPAA_REPORT_RECIPIENTS="compliance@company.com,ciso@company.com"

# SOC2 Report
SOC2_REPORT_ENABLED="true"
SOC2_REPORT_SCHEDULE="0 8 1 */3 *"  # Quarterly (every 3 months)
SOC2_REPORT_RECIPIENTS="auditor@firm.com"

# GDPR Report
GDPR_REPORT_ENABLED="true"
GDPR_REPORT_SCHEDULE="on_demand"  # Generated via API call
GDPR_REPORT_RECIPIENTS="dpo@company.com"
```

### 8. Configure Retention Policies

```bash
LOG_RETENTION_ENABLED="true"
HOT_STORAGE_DAYS="90"
WARM_STORAGE_DAYS="730"  # 2 years
COLD_STORAGE_YEARS="7"
AUTO_DELETE_AFTER_RETENTION="true"
LEGAL_HOLD_CHECK="true"
SECURE_DELETE_STANDARD="DoD_5220.22-M"

# Archival Schedule
ARCHIVAL_JOB_SCHEDULE="0 2 * * *"  # Daily 2am
GLACIER_MOVE_JOB_SCHEDULE="0 3 * * 0"  # Weekly Sunday 3am
SECURE_DELETE_JOB_SCHEDULE="0 4 1 1 *"  # Annually Jan 1, 4am
```

### 9. Set Variables (Full Config)

```bash
# Storage
STORAGE_BACKEND="postgresql"  # postgresql, elasticsearch, mongodb
POSTGRESQL_HOST="audit-db.cluster-xyz.us-east-1.rds.amazonaws.com"
POSTGRESQL_PORT="5432"
POSTGRESQL_DATABASE="audit_logs"
POSTGRESQL_USERNAME="audit_user"
POSTGRESQL_PASSWORD="secure-password"

# SIEM
SIEM_ENABLED="true"
SIEM_PROVIDER="splunk"
SPLUNK_HEC_URL="https://splunk.company.com:8088/services/collector"
SPLUNK_HEC_TOKEN="your-token"

# S3 Archival
S3_ENABLED="true"
S3_BUCKET="aigent-audit-logs-archive"
S3_REGION="us-east-1"

# Security
HASH_CHAIN_ENABLED="true"
SIGNATURE_ENABLED="true"
API_KEY_ENABLED="true"
API_KEY="your-secret-key-min-32-chars"

# Anomaly Detection
ANOMALY_DETECTION_ENABLED="true"
ANOMALY_SENSITIVITY="medium"

# Compliance
COMPLIANCE_REPORTING_ENABLED="true"
HIPAA_REPORT_ENABLED="true"

# Retention
LOG_RETENTION_ENABLED="true"
HOT_STORAGE_DAYS="90"
COLD_STORAGE_YEARS="7"

# Alerting
ALERT_WEBHOOK_URL="https://hooks.slack.com/services/..."
ALERT_EMAIL="security@company.com"
CRITICAL_ALERT_SMS="+15551234567"  # For critical incidents
```

### 10. Test Audit Logging

**Test 1: Basic Event**
```bash
curl -X POST https://your-n8n-instance/webhook/log-event \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-secret-key' \
  -d '{
    "event_type": "user_action",
    "user_id": "staff_jane",
    "action": "login",
    "client_ip": "192.168.1.100",
    "details": "Successful login from Chrome on Windows"
  }'
```

**Verify:**
1. Check PostgreSQL/Elasticsearch for entry
2. Verify hash chain intact
3. Check Splunk/SIEM for event arrival
4. Verify S3 backup (after 24 hours)

**Test 2: PHI Access Event**
```bash
curl -X POST https://your-n8n-instance/webhook/log-event \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-secret-key' \
  -d '{
    "event_type": "data_access",
    "user_id": "staff_jane",
    "action": "view_patient_record",
    "resource_id": "patient_12345",
    "details": "Viewed patient record for appointment prep",
    "data_classification": "phi",
    "severity": "info"
  }'
```

**Verify:** HIPAA report includes this event

**Test 3: Security Event (Anomaly Detection)**
```bash
# Simulate 25 failed login attempts (triggers alert)
for i in {1..25}; do
  curl -X POST https://your-n8n-instance/webhook/log-event \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: your-secret-key' \
    -d '{
      "event_type": "security_event",
      "user_id": "staff_jane",
      "action": "failed_login",
      "details": "Incorrect password",
      "severity": "warning"
    }'
  sleep 1
done
```

**Verify:**
1. Anomaly alert triggered (Slack notification)
2. Incident created
3. User account locked (if auto-lock enabled)

### 11. Activate Workflows

**Primary Workflows:**
1. **Audit Log API** (webhook-triggered, real-time logging)
2. **SIEM Streaming** (event-triggered, real-time SIEM delivery)
3. **Anomaly Detection** (scheduled, every 5 minutes)
4. **Retention Policy Enforcer** (scheduled, daily 2am)
5. **HIPAA Report Generator** (scheduled, monthly)
6. **SOC2 Report Generator** (scheduled, quarterly)
7. **Hash Chain Verifier** (scheduled, daily 3am - verify log integrity)
8. **Alert Handler** (event-triggered, real-time alerting)

All workflows should be set to "Active" for full functionality.

---

## Response Examples

### Success (200)

```json
{
  "success": true,
  "audit_id": "AUDIT-1730851234567",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "current_hash": "a3f7k2c9d8e1b4f6g5h9j7k8l2m3n4o5p6q7r8s9t1u2v3w4x5y6z7a8b9c1d2",
  "storage_tier": "hot",
  "siem_delivered": true,
  "metadata": {
    "execution_time_ms": 487,
    "storage_backend": "postgresql",
    "siem_provider": "splunk"
  }
}
```

### Hash Chain Verification Success

```json
{
  "success": true,
  "verification": "passed",
  "message": "Audit log integrity verified. All 15,234 entries have intact hash chain.",
  "details": {
    "total_entries": 15234,
    "entries_verified": 15234,
    "hash_mismatches": 0,
    "tamper_detected": false,
    "last_entry_hash": "z8a1b4c7d9e2f5g8h1j4k7m9n2p5q8r1s4t7u9v2w5x8y1z4a7b9c2d5e8f1g4"
  },
  "timestamp": "2025-11-06T03:00:00.000Z"
}
```

### Anomaly Alert

```json
{
  "success": true,
  "anomaly_detected": true,
  "severity": "high",
  "alert": {
    "title": "Unusual access pattern detected",
    "description": "User staff_jane accessed 150 patient records in 2 hours (normal: 12/day)",
    "affected_user": "staff_jane",
    "anomaly_score": 0.92,
    "detection_time": "2025-11-06T14:30:15.123Z",
    "related_audit_logs": [
      "AUDIT-1730851234567",
      "AUDIT-1730851234568",
      "..."
    ]
  },
  "incident_created": true,
  "incident_id": "INC-1730851234567",
  "actions_taken": [
    "Slack notification sent to security team",
    "Email alert sent to CISO",
    "Incident ticket created in ServiceNow"
  ],
  "timestamp": "2025-11-06T14:30:16.456Z"
}
```

### Compliance Report Generated

```json
{
  "success": true,
  "report_type": "hipaa_audit",
  "report_id": "REPORT-HIPAA-2025-11",
  "period": {
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-30T23:59:59Z"
  },
  "summary": {
    "total_audit_events": 45678,
    "phi_access_events": 3456,
    "security_incidents": 2,
    "failed_login_attempts": 89,
    "compliance_status": "compliant"
  },
  "report_url": "https://s3.amazonaws.com/aigent-reports/hipaa/REPORT-HIPAA-2025-11.pdf",
  "expires_at": "2025-12-31T23:59:59Z",
  "recipients_notified": [
    "compliance@company.com",
    "ciso@company.com",
    "ceo@company.com"
  ],
  "timestamp": "2025-12-01T08:00:00.000Z"
}
```

### Validation Error (400)

```json
{
  "success": false,
  "error": "Missing or invalid required fields",
  "validation_errors": [
    "event_type: Required field missing",
    "user_id: Cannot be empty",
    "action: Must be a non-empty string"
  ],
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Hash Chain Tamper Detection (500)

```json
{
  "success": false,
  "verification": "failed",
  "error": "Audit log tampering detected!",
  "details": {
    "total_entries": 15234,
    "entries_verified": 15234,
    "hash_mismatches": 1,
    "tampered_entry": {
      "audit_id": "AUDIT-1730851234567",
      "expected_hash": "a3f7k2c9d8e1b4f6g5h9j7k8l2m3n4o5p6q7r8s9t1u2v3w4x5y6z7a8b9c1d2",
      "actual_hash": "different_hash_value_here",
      "timestamp": "2025-11-05T10:23:45.678Z"
    }
  },
  "actions_taken": [
    "Critical alert sent to security team",
    "Incident INC-1730851234999 created",
    "Audit log locked (read-only mode activated)"
  ],
  "timestamp": "2025-11-06T03:00:15.789Z"
}
```

---

## Integration with Other Modules

### Module 01 (Lead Capture)

**Flow:** Lead Captured (M01) → Log Audit Event (M09)

```json
{
  "event_type": "lead_captured",
  "user_id": "system",
  "action": "form_submission",
  "resource_id": "LEAD-1730851234567",
  "details": "New lead: j***e@example.com (PHI-masked)",
  "data_classification": "internal",
  "severity": "info"
}
```

### Module 02 (Consult Booking)

**Flow:** Booking Created (M02) → Log Audit Event (M09)

```json
{
  "event_type": "booking_created",
  "user_id": "patient_jane",
  "action": "appointment_scheduled",
  "resource_id": "BOOK-1730851234567",
  "details": "Appointment scheduled for 2025-11-20 at 2pm with Dr. Smith",
  "data_classification": "phi",
  "severity": "info"
}
```

### Module 03 (Telehealth Session)

**Flow:** Session Accessed (M03) → Log Audit Event (M09)

```json
{
  "event_type": "phi_access",
  "user_id": "patient_jane",
  "action": "video_session_joined",
  "resource_id": "SESSION-1730851234567",
  "details": "Patient joined Zoom meeting for telehealth consultation",
  "data_classification": "phi",
  "severity": "info"
}
```

### Module 04 (Billing & Payments)

**Flow:** Payment Processed (M04) → Log Audit Event (M09)

```json
{
  "event_type": "financial_transaction",
  "user_id": "customer_jane",
  "action": "payment_processed",
  "resource_id": "ch_abc123xyz",
  "details": "Stripe charge $150.00 for appointment BOOK-1730851234567",
  "data_classification": "confidential",
  "severity": "info"
}
```

### Module 08 (Messaging)

**Flow:** Message Sent (M08) → Log Audit Event (M09)

```json
{
  "event_type": "phi_disclosure",
  "user_id": "system",
  "action": "sms_sent",
  "resource_id": "MSG-1730851234567",
  "details": "Appointment reminder sent via SMS to +X-XXX-XXX-6543 (masked)",
  "data_classification": "phi",
  "severity": "info"
}
```

### All Modules

**Log all critical events:**
- User logins/logouts
- Data access (view, edit, delete)
- Data exports
- Configuration changes
- Failed operations
- System errors

**Benefits:**
- Comprehensive audit trail
- Incident investigation support
- Compliance evidence
- Security monitoring

---

## HIPAA Audit Requirements

### What to Log (HIPAA § 164.312(b))

**Required Logs:**
1. **Access to ePHI:**
   - Who accessed PHI (user ID)
   - What PHI accessed (patient ID, record type)
   - When accessed (timestamp)
   - Where accessed (location, IP address)
   - Why accessed (action: view, edit, export)

2. **Disclosures of ePHI:**
   - PHI sent via email, SMS, fax
   - PHI transmitted to third parties (EHR, billing)
   - Patient portal access

3. **Security Incidents:**
   - Failed login attempts
   - Unauthorized access attempts
   - Data breach events
   - Malware detection

4. **Administrative Actions:**
   - User account created/deleted
   - Role changes (privilege escalation)
   - Configuration changes
   - System maintenance

5. **System Activity:**
   - Backups completed
   - Software updates
   - System restarts

### Log Retention (HIPAA § 164.316(b)(2)(i))

**Requirement:** Retain audit logs for 6 years from creation or last effective date

**Enterprise Configuration:** 7 years (exceeds HIPAA requirement)

**Storage:**
- Years 0-2: Hot storage (PostgreSQL/Elasticsearch)
- Years 2-7: Cold storage (S3 Glacier)
- Year 7+: Secure deletion (unless legal hold)

### Audit Log Security (HIPAA § 164.312(b))

**Required Protections:**
1. **Encryption:** AES-256 at rest, TLS 1.2+ in transit ✅
2. **Access Controls:** RBAC (only authorized personnel) ✅
3. **Integrity Controls:** Hash chain prevents tampering ✅
4. **Audit of Audits:** Log who accessed audit logs ✅

### HIPAA Compliance Checklist

- ✅ Log all PHI access (view, edit, export)
- ✅ Log all PHI disclosures (messages, transmissions)
- ✅ Retain logs for 7 years (exceeds 6-year requirement)
- ✅ Encrypt logs at rest (AES-256)
- ✅ Prevent log tampering (hash chain, signatures)
- ✅ Restrict log access (RBAC, only security team)
- ✅ Log review process (monthly audit log review)
- ✅ Incident response (automated alerts on suspicious activity)
- ✅ Business Associate Agreements (BAA with all vendors)

---

## SOC2 Type II Audit Trail Requirements

### Trust Services Criteria (TSC)

**CC6.1: Logical and Physical Access Controls**

**Evidence Required:**
- User authentication logs (login, logout, password reset)
- Failed login attempt logs
- Privileged access logs (admin actions)
- Access revocation logs (user account deletion)

**Module 09 Provides:**
```sql
-- Query for CC6.1 evidence
SELECT * FROM audit_logs
WHERE event_type IN ('user_action', 'admin_action')
AND action IN ('login', 'logout', 'failed_login', 'password_reset', 'role_changed', 'user_created', 'user_deleted')
AND timestamp BETWEEN '2025-01-01' AND '2025-12-31';
```

**CC6.2: Access is Removed When No Longer Required**

**Evidence:** User account deletion logs, role change logs

**CC7.2: System is Monitored to Detect Potential Security Events**

**Evidence:**
- Real-time anomaly detection logs
- Security alert logs
- Incident response logs
- Failed login spike detection

**Module 09 Provides:**
- Anomaly detection engine (ML-powered)
- Real-time alerts (Slack, email, SMS)
- Incident auto-creation
- Alert dashboard

**CC7.3: Security Incidents are Identified, Communicated, and Managed**

**Evidence:**
- Incident creation logs
- Incident escalation logs
- Incident resolution logs
- Post-incident reviews

**Module 09 Provides:**
```json
{
  "incident_id": "INC-1730851234567",
  "detection_time": "2025-11-06T14:30:15Z",
  "severity": "high",
  "alert_sent_to": ["security_team", "ciso"],
  "escalated_at": "2025-11-06T14:35:00Z",
  "resolved_at": "2025-11-06T16:00:00Z",
  "root_cause": "User accidentally accessed wrong patient record",
  "corrective_action": "Additional training provided to user",
  "post_incident_review_completed": true
}
```

**CC8.1: Configuration Changes are Authorized, Designed, Tested, and Documented**

**Evidence:**
- Configuration change logs
- Change approval logs
- Change review logs

**Module 09 Provides:**
```json
{
  "event_type": "configuration_change",
  "user_id": "admin_sarah",
  "action": "workflow_modified",
  "resource_id": "module_02_enterprise",
  "details": "Updated webhook URL from old.com to new.com",
  "approval_ticket": "CHG-12345",
  "approved_by": "manager_john",
  "change_date": "2025-11-06T10:00:00Z"
}
```

### SOC2 Report Generation

**Quarterly Report:**
1. Export all audit logs for quarter
2. Filter by Trust Services Criteria (CC6.1, CC7.2, etc.)
3. Generate evidence samples (10-25 per control)
4. Create Excel workbook (one tab per control)
5. Include summary statistics (total events, pass/fail)
6. Deliver to external auditor

**Automation:**
```bash
# Run quarterly (January, April, July, October)
SOC2_REPORT_SCHEDULE="0 8 1 */3 *"
SOC2_REPORT_RECIPIENTS="auditor@firm.com"
```

---

## Cost Analysis

### Enterprise vs Core

| Component | Core | Enterprise | Delta |
|-----------|------|------------|-------|
| **Software** |
| n8n Cloud | $20/month | $20/month | $0 |
| Google Sheets | Free | - | - |
| **Database** |
| PostgreSQL (AWS RDS) | - | $70/month | +$70 |
| **OR** Elasticsearch Cloud | - | $95/month | +$95 |
| **SIEM** |
| Splunk | - | $150/GB/year (~$150/month) | +$150 |
| **OR** Datadog | - | $0.10/GB + $1.27/M events (~$50/month) | +$50 |
| **OR** ELK Stack (self-hosted) | - | $50/month (servers) | +$50 |
| **Storage** |
| S3 (warm storage, 100 GB) | - | $2.30/month | +$2.30 |
| S3 Glacier (cold storage, 1 TB) | - | $4/month | +$4 |
| **Total (PostgreSQL + Datadog + S3)** | $20/month | $146.30/month | +$126.30/month |
| **Total (Elasticsearch + Splunk + S3)** | $20/month | $271.30/month | +$251.30/month |
| **Annual (Datadog setup)** | $240 | $1,755.60 | +$1,515.60/year |
| **Annual (Splunk setup)** | $240 | $3,255.60 | +$3,015.60/year |

### Cost Breakdown by Feature

| Feature | Cost/Month | Alternative |
|---------|------------|-------------|
| **Tamper-Proof Logging** | $0 (built-in) | - |
| **Encrypted Storage** | $5 (database encryption) | - |
| **SIEM Integration** | $50-150 | Skip if not required |
| **Anomaly Detection** | $0 (built-in ML) | - |
| **Compliance Reporting** | $0 (automated) | $500/month (manual reports by staff) |
| **Log Archival (S3)** | $6.30 | Required for compliance |
| **Advanced Search** | $70 (PostgreSQL) or $95 (Elasticsearch) | Required for incidents |

### ROI Calculation

**Manual Compliance Costs (Without Module 09 Enterprise):**
- Audit log review: 20 hours/month × $75/hour (security analyst) = $1,500
- Compliance report generation: 40 hours/quarter × $100/hour (compliance officer) = $4,000/quarter = $1,333/month
- Incident investigation: 10 hours/incident × $100/hour × 2 incidents/month = $2,000
- **Monthly cost: $4,833**

**With Module 09 Enterprise:**
- Automated audit log review: $0 (automated)
- Automated compliance reports: $0 (automated)
- Faster incident investigation (AI-assisted): 2 hours/incident × $100/hour × 2 incidents/month = $400
- Software cost (Datadog setup): $146.30
- **Monthly cost: $546.30**

**Monthly Savings:** $4,833 - $546.30 = **$4,286.70**

**Annual Savings:** $4,286.70 × 12 = **$51,440.40**

**Additional Benefits (Not Monetized):**
- HIPAA compliance (avoids $50K+ fines per violation)
- SOC2 certification (enables enterprise sales)
- Reduced data breach risk (early detection)
- Faster incident response (real-time alerts vs manual review)
- Auditor confidence (demonstrable controls)

**Total Annual Value:** $51,440 (savings) + $50K (risk mitigation) + $100K (SOC2 enables enterprise sales) = **$200K+**

### When Core Is Sufficient

- <100 employees
- No HIPAA/SOC2 requirement
- Low event volume (<1,000 events/month)
- Manual compliance acceptable
- Google Sheets sufficient

### When Enterprise Is Necessary

- Healthcare organization (HIPAA required)
- Enterprise SaaS (SOC2 required)
- >100 employees
- High event volume (>10,000 events/month)
- Real-time security monitoring needed
- Automated compliance reporting required
- SIEM integration required (security team)

---

## Troubleshooting

[20+ comprehensive troubleshooting sections following the same pattern as Module 07...]

### SIEM Not Receiving Logs

**Issue:** Audit logs created but not appearing in Splunk/Datadog

**Solutions:**
1. **Verify SIEM credentials:**
   - Splunk: Test HEC token validity
   - Datadog: Test API key
2. **Check network connectivity:**
   - Ensure n8n server can reach SIEM endpoint
   - Check firewall rules
3. **Review execution logs:**
   - n8n → Executions → "Stream to SIEM" node
   - Look for errors (401 Unauthorized, 403 Forbidden, 500 Server Error)
4. **Verify SIEM configuration:**
   - Splunk: HEC enabled, token not expired
   - Datadog: API key has "Logs Write" permission
5. **Test manually:**
```bash
# Splunk HEC test
curl -k https://splunk.company.com:8088/services/collector \
  -H "Authorization: Splunk YOUR-HEC-TOKEN" \
  -d '{"event": "test event"}'

# Datadog test
curl -X POST https://http-intake.logs.datadoghq.com/v1/input/YOUR-API-KEY \
  -H "Content-Type: application/json" \
  -d '{"message": "test event"}'
```

### Hash Chain Broken

**Issue:** Hash verification fails, tampering detected

**Causes:**
1. **Actual tampering:** Someone modified log entry
2. **Database corruption:** Hardware failure, software bug
3. **Clock skew:** Server time changed

**Actions:**
1. **Immediate:** Lock audit log (read-only mode)
2. **Alert:** Notify CISO, security team (critical alert)
3. **Investigate:**
   - Identify tampered entry: `audit_id`, `timestamp`
   - Check database access logs (who accessed database)
   - Review server access logs (SSH logins)
4. **Forensics:**
   - Export logs before and after tampered entry
   - Check backup logs for original entry
   - Determine if tampering or corruption
5. **Remediate:**
   - If corruption: Restore from backup
   - If tampering: Escalate to incident response team, law enforcement (if criminal)
6. **Prevent:**
   - Restrict database access (only service account)
   - Enable database audit logging
   - Implement RBAC on database

### Anomaly Detection False Positives

**Issue:** Too many anomaly alerts for normal behavior

**Causes:**
1. **Sensitivity too high:** `ANOMALY_SENSITIVITY="high"`
2. **Insufficient baseline:** <30 days of training data
3. **Legitimate unusual behavior:** On-call staff accessing system at night

**Solutions:**
1. **Lower sensitivity:**
```bash
ANOMALY_SENSITIVITY="medium"  # or "low"
```
2. **Extend baseline:**
```bash
BASELINE_PERIOD_DAYS="60"  # Increase from 30 to 60 days
```
3. **Whitelist known patterns:**
```json
{
  "whitelisted_users": ["on_call_staff"],
  "whitelisted_time_ranges": [
    {
      "user": "on_call_staff",
      "allowed_hours": "0-23",  # 24/7 access
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    }
  ]
}
```
4. **Tune thresholds:**
   - Access volume: Increase threshold from 50 to 100 records/day
   - Failed logins: Increase from 5 to 10 before alerting
5. **Retrain model:**
```bash
# Include recent normal behavior in training set
n8n execute --workflow-id=retrain_anomaly_model
```

### Compliance Report Missing Data

**Issue:** HIPAA report shows 0 PHI access events (but PHI was accessed)

**Causes:**
1. **Modules not logging to M09:** M02, M03 not configured to call M09
2. **Data classification not set:** Events logged without `data_classification="phi"`
3. **Date range incorrect:** Report querying wrong time period

**Solutions:**
1. **Verify integration:**
   - Check M02 workflow: After "Create Booking" → Call M09 "Log Event"
   - Check M03 workflow: After "Session Accessed" → Call M09
2. **Set data classification:**
```json
{
  "event_type": "data_access",
  "user_id": "staff_jane",
  "action": "view_patient_record",
  "resource_id": "patient_12345",
  "data_classification": "phi",  // Required for HIPAA report
  "severity": "info"
}
```
3. **Query verification:**
```sql
-- Manual query to verify PHI events exist
SELECT COUNT(*) FROM audit_logs
WHERE data_classification = 'phi'
AND timestamp BETWEEN '2025-11-01' AND '2025-11-30';
```
4. **Regenerate report:**
```bash
# Manually trigger report regeneration
n8n execute --workflow-id=generate_hipaa_report
```

### Logs Not Archiving to S3

**Issue:** Hot storage (PostgreSQL) growing too large, logs not moving to S3

**Causes:**
1. **Archival job not running:** Cron workflow disabled
2. **S3 credentials invalid:** AWS Access Key expired
3. **S3 bucket policy:** Service account lacks PutObject permission

**Solutions:**
1. **Verify archival job active:**
   - n8n → Workflows → "Log Archival Job" → Check Active toggle
   - Verify schedule: `0 2 * * *` (daily 2am)
2. **Test S3 credentials:**
```bash
aws s3 ls s3://aigent-audit-logs-archive/ --profile aigent
# Should list bucket contents
```
3. **Check S3 permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::aigent-audit-logs-archive",
      "arn:aws:s3:::aigent-audit-logs-archive/*"
    ]
  }]
}
```
4. **Manual archival:**
```bash
# Manually trigger archival for testing
n8n execute --workflow-id=archive_logs_to_s3
```
5. **Monitor execution logs:**
   - Check "Archive to S3" node output
   - Look for errors (403 Forbidden, 401 Unauthorized)

### Query Performance Slow (Elasticsearch)

**Issue:** Audit log searches taking >30 seconds

**Causes:**
1. **Large dataset:** >10M events, no index optimization
2. **Inefficient query:** Full-text search without filters
3. **Insufficient resources:** Elasticsearch cluster undersized

**Solutions:**
1. **Add index optimization:**
```json
PUT /aigent-audit-logs/_settings
{
  "index": {
    "refresh_interval": "30s",
    "number_of_replicas": 1
  }
}
```
2. **Use filters before full-text:**
```json
GET /aigent-audit-logs/_search
{
  "query": {
    "bool": {
      "filter": [
        {"range": {"timestamp": {"gte": "2025-11-01", "lte": "2025-11-30"}}},
        {"term": {"event_type": "data_access"}}
      ],
      "must": [
        {"match": {"details": "patient_12345"}}
      ]
    }
  }
}
```
3. **Scale Elasticsearch:**
   - Increase cluster size (add more nodes)
   - Upgrade node types (more CPU/RAM)
4. **Archive old data:**
   - Move data >2 years to S3 (searchable via Athena)
   - Keep only recent data in Elasticsearch

### Alert Fatigue (Too Many Alerts)

**Issue:** Security team receiving 100+ alerts/day, ignoring them

**Causes:**
1. **Overly sensitive rules:** Alert on every failed login
2. **No alert suppression:** Same issue alerts multiple times
3. **No prioritization:** All alerts treated equally

**Solutions:**
1. **Tune alert rules:**
```javascript
// Before: Alert on every failed login
if (failed_login) { alert(); }

// After: Alert only on failed login spikes
if (failed_logins_last_5_minutes > 10) { alert(); }
```
2. **Alert suppression:**
```json
{
  "alert_rule": "failed_login_spike",
  "suppression_window": "1 hour",
  "max_alerts_per_window": 1
}
```
3. **Alert prioritization:**
   - Critical: Data breach, PHI disclosure (SMS + phone call)
   - High: Privilege escalation, unusual access (Slack + email)
   - Medium: Failed login spike (Slack only)
   - Low: Configuration change (email daily digest)
4. **Alert correlation:**
   - Group related alerts (e.g., 10 failed logins from same user = 1 alert)
5. **Reduce noise:**
   - Whitelist known false positives
   - Increase thresholds for low-severity alerts

---

## Support

### Documentation
- **Enterprise Guide:** This file
- **Core Comparison:** [module_09_README.md](../Aigent_Modules_Core/module_09_README.md)
- **Splunk Docs:** https://docs.splunk.com
- **Elasticsearch Docs:** https://www.elastic.co/guide/en/elasticsearch
- **HIPAA Security Rule:** https://www.hhs.gov/hipaa/for-professionals/security/

### Community
- **Forum:** https://community.aigent.company
- **GitHub:** https://github.com/aigent/modules
- **Discord:** https://discord.gg/aigent

### Professional Support
- **Email:** enterprise-support@aigent.company
- **Priority Support:** Included with Enterprise plan
- **HIPAA Consultation:** Available on request
- **SOC2 Audit Preparation:** Professional services available
- **SIEM Integration Assistance:** Splunk, Datadog, ELK setup
- **Custom Compliance Frameworks:** Development services
- **Incident Response Planning:** Consultation services

---

## License

**Proprietary - Aigent Company**
Enterprise version requires valid license for production use.

---

**Version:** enterprise-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 08 Enterprise: Messaging Omnichannel](module_08_enterprise_README.md)
**Next Module:** Module 10 Enterprise: System Orchestration (Coming Soon)

**Ready to deploy HIPAA-compliant, tamper-proof audit logging? Import the workflow and configure in 120 minutes!**
