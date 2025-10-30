# Aigent Module 06 - Document Capture & OCR

**Version:** 1.0.0
**Last Updated:** 2025-01-15
**Node Range:** 601-636
**Purpose:** Automated document ingestion, OCR processing, structured data extraction, secure storage, and EHR/CRM synchronization

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Input Schema](#input-schema)
4. [Output Schema](#output-schema)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [OCR Engines](#ocr-engines)
8. [Document Types](#document-types)
9. [Redaction & PHI Protection](#redaction--phi-protection)
10. [Storage Integration](#storage-integration)
11. [EHR Integration](#ehr-integration)
12. [CRM Integration](#crm-integration)
13. [Compliance Logging](#compliance-logging)
14. [Platform Setup Guides](#platform-setup-guides)
15. [Testing](#testing)
16. [Troubleshooting](#troubleshooting)
17. [Security & Compliance](#security--compliance)
18. [Advanced Customization](#advanced-customization)

---

## Overview

Module 06 implements a production-ready document processing pipeline for healthcare clinics that:
- Accepts documents from multiple sources (webhook uploads, S3/Drive watch, email attachments)
- Performs OCR with selectable engines (Mistral, Gemini, ABBYY, Tesseract)
- Extracts structured data based on document type
- Redacts sensitive information (SSN, MRN, credit cards)
- Stores original and redacted versions securely
- Syncs structured data to EHR and CRM systems
- Logs all operations for compliance audit trails

### Key Features

- **Multi-source ingestion:** Webhook, S3/Drive watch, IMAP email
- **4 OCR engines:** Mistral (default), Google Gemini, ABBYY Cloud, Tesseract
- **Document type detection:** Auto-infer from filename or metadata
- **Structured extraction:** Map OCR text to normalized schemas per doc_type
- **PHI redaction:** Regex-based masking of sensitive data
- **Secure storage:** S3 with encryption + signed URLs, or Google Drive
- **EHR sync:** Redox, DrChrono, NextGen integrations
- **CRM sync:** HubSpot, Salesforce, Zoho integrations
- **Compliance logging:** Google Sheets or Airtable audit trail
- **HIPAA-compliant:** BAA-approved vendors, encryption, time-limited URLs

### Module Chaining

**Accepts input from:** Any upstream module (01-05) or direct file upload
**Input format:** File (PDF/JPG/PNG) + optional metadata JSON
**Output format:** `structured_record.json`
**Next module:** Analytics, Reporting, or Compliance modules

---

## Architecture

### Workflow Components

```
┌──────────────────────────────────────────────────────────────────┐
│                   DOCUMENT INGESTION LAYER                        │
└──────────────────────────────────────────────────────────────────┘

  Webhook Upload (601)
  OR S3 Watch (future)
  OR IMAP Email (future)
        ↓
  Identify Doc & Extract Metadata (602)
        ↓
  Validate Source, Size, MIME (603) ──→ [Invalid] ──→ Return Error (604)
        ↓ [Valid]

┌──────────────────────────────────────────────────────────────────┐
│                        OCR PROCESSING LAYER                       │
└──────────────────────────────────────────────────────────────────┘

  Select OCR Engine (605)
        ↓
  ┌─────────────────────────────────────┐
  │  Switch by OCR_ENGINE env var:     │
  │  • Mistral OCR (609)               │
  │  • Google Gemini Vision (610)      │
  │  • ABBYY Cloud OCR (611)           │
  │  • Tesseract Self-Hosted (612)     │
  └─────────────────────────────────────┘
        ↓
  Post-Process OCR Output (613)
        ↓
  Map to Normalized Schema (614)
        ↓

┌──────────────────────────────────────────────────────────────────┐
│                    REDACTION & STORAGE LAYER                      │
└──────────────────────────────────────────────────────────────────┘

  Check If Redaction Enabled (615)
        ↓ [REDACTION_ENABLED=true]
  Redact Sensitive Data (616)
        ↓
  Prepare Storage Paths (617)
        ↓
  ┌─────────────────────────────────────┐
  │  Switch by STORAGE_PROVIDER:       │
  │  • S3: Upload Original (619)       │
  │        Upload Redacted (620)       │
  │        Generate Signed URLs (621)  │
  │  • GDrive: Upload to Drive (622)   │
  └─────────────────────────────────────┘
        ↓

┌──────────────────────────────────────────────────────────────────┐
│                   DOWNSTREAM SYNC LAYER                           │
└──────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────┐
  │  Parallel Execution:              │
  │                                   │
  │  EHR Sync (if enabled, 623-626):  │
  │  • DrChrono - Attach Doc (625)    │
  │  • Redox - Send Media (626)       │
  │                                   │
  │  CRM Sync (if enabled, 627-629):  │
  │  • HubSpot - Update Contact (628) │
  │  • Salesforce - Attach (629)      │
  └───────────────────────────────────┘
        ↓
  ┌─────────────────────────────────────┐
  │  Compliance Logging (630-632):     │
  │  • Google Sheets (631)             │
  │  • Airtable (632)                  │
  └─────────────────────────────────────┘
        ↓
  Build structured_record.json (633)
        ↓
  Return Success Response (634)


┌──────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING LAYER                         │
└──────────────────────────────────────────────────────────────────┘

  Any Stage Error ──→ Error Handler (635) ──→ Return Error (636)
```

### Node Breakdown

| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| 601 | Webhook Upload | Webhook | Accept multipart file uploads |
| 602 | Identify Document | Code | Extract metadata, infer doc_type |
| 603 | Validate Input | If | Verify source, size, MIME type |
| 604 | Return Validation Error | Respond | 400 error response |
| 605 | Select OCR Engine | Set | Read OCR_ENGINE env var |
| 606 | Switch: Mistral | If | Route to Mistral if engine=mistral |
| 607 | Switch: Gemini | If | Route to Gemini if engine=gemini |
| 608 | Switch: ABBYY | If | Route to ABBYY if engine=abbyy |
| 609 | Mistral OCR API | HTTP | Call Mistral OCR endpoint |
| 610 | Gemini Vision API | HTTP | Call Google Gemini vision model |
| 611 | ABBYY Cloud OCR | HTTP | Call ABBYY Cloud OCR |
| 612 | Tesseract OCR | Execute | Run Tesseract CLI (self-hosted) |
| 613 | Post-Process OCR | Code | Normalize OCR responses |
| 614 | Map to Schema | Code | Extract structured fields by doc_type |
| 615 | Check Redaction | If | Evaluate REDACTION_ENABLED flag |
| 616 | Redact Data | Code | Mask SSN, MRN, CC, emails |
| 617 | Prepare Paths | Code | Generate document_id and storage keys |
| 618 | Switch: S3 | If | Route to S3 if STORAGE_PROVIDER=s3 |
| 619 | Upload Original S3 | AWS S3 | Upload original file to S3 |
| 620 | Upload Redacted S3 | AWS S3 | Upload redacted file to S3 |
| 621 | Generate Signed URLs | Code | Create time-limited S3 URLs |
| 622 | Upload GDrive | Google Drive | Upload to Google Drive |
| 623 | Check EHR Sync | If | Evaluate EHR_SYNC_ENABLED flag |
| 624 | Switch: DrChrono | If | Route to DrChrono if EHR_TARGET=drchrono |
| 625 | DrChrono Attach | HTTP | Create clinical note in DrChrono |
| 626 | Redox Send | HTTP | Send media event to Redox |
| 627 | Check CRM Sync | If | Evaluate CRM_SYNC_ENABLED flag |
| 628 | HubSpot Update | HubSpot | Update contact with doc metadata |
| 629 | Salesforce Attach | Salesforce | Attach document to contact |
| 630 | Switch: Sheets | If | Route to Sheets if LOG_TARGET=sheets |
| 631 | Log Sheets | Google Sheets | Append compliance log entry |
| 632 | Log Airtable | Airtable | Append to Airtable log |
| 633 | Build Output | Code | Construct structured_record.json |
| 634 | Return Success | Respond | Return 200 with JSON |
| 635 | Error Handler | Code | Format error response |
| 636 | Return Error | Respond | Return 500 with error JSON |

---

## Input Schema

### Accepted Input Sources

#### A) Webhook Upload (Primary)

```bash
curl -X POST https://your-n8n-instance.com/webhook/aigent-document-capture \
  -F "file=@lab_result.pdf" \
  -F 'metadata={
    "patient_name": "Jane Doe",
    "patient_email": "jane@example.com",
    "patient_id": "ext_12345",
    "doc_type": "lab_result",
    "capture_ts": "2025-01-15T10:30:00Z"
  }'
```

#### B) S3 Watch (Future Enhancement)

```json
{
  "file_path": "s3://aigent-uploads/incoming/lab_result_20250115.pdf",
  "metadata": {
    "patient_id": "ext_12345",
    "doc_type": "lab_result"
  },
  "source": "s3"
}
```

#### C) IMAP Email (Future Enhancement)

```json
{
  "email": {
    "from": "jane@example.com",
    "subject": "Lab Results for Jane Doe",
    "attachment": "lab_result.pdf"
  },
  "source": "email"
}
```

### Metadata Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_name` | string | No | Patient full name |
| `patient_email` | string | No | Patient email address |
| `patient_id` | string | No | External patient ID (MRN) |
| `doc_type` | string | No | Document type (auto-inferred if omitted) |
| `source` | string | No | Ingestion source (webhook/s3/gdrive/email) |
| `capture_ts` | ISO 8601 | No | Document capture timestamp |

### Supported Document Types

- `intake_form` - Patient registration forms
- `id_card` - Driver's license, passport
- `insurance_card` - Health insurance cards
- `lab_result` - Laboratory test results
- `invoice` - Billing statements
- `consent_form` - Signed consent forms
- `prescription` - Prescription documents
- `referral` - Referral forms
- `other` - Uncategorized documents

---

## Output Schema

### Success Response (structured_record.json)

```json
{
  "success": true,
  "document_id": "doc_DOC-1737285600000_2025-01-19T10-30-00-000Z",
  "doc_type": "lab_result",
  "patient": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "external_id": "ext_12345"
  },
  "extracted": {
    "date_of_service": "2025-01-15",
    "provider": "Dr. Smith",
    "values": [
      {
        "key": "hdl",
        "value": "62 mg/dL"
      },
      {
        "key": "ldl",
        "value": "98 mg/dL"
      },
      {
        "key": "glucose",
        "value": "95 mg/dL"
      },
      {
        "key": "a1c",
        "value": "5.4 %"
      }
    ]
  },
  "storage": {
    "original_url": "https://aigent-clinic-documents.s3.us-east-1.amazonaws.com/clinic-docs/lab_result/doc_abc123_original.pdf?X-Amz-Expires=600...",
    "redacted_url": "https://aigent-clinic-documents.s3.us-east-1.amazonaws.com/clinic-docs/lab_result/doc_abc123_redacted.pdf?X-Amz-Expires=600..."
  },
  "sync": {
    "ehr": {
      "target": "drchrono",
      "status": "updated",
      "record_id": "ehr_789"
    },
    "crm": {
      "target": "hubspot",
      "status": "updated",
      "contact_id": "crm_456"
    }
  },
  "metadata": {
    "ocr_engine": "mistral",
    "confidence": 0.94,
    "processed_at": "2025-01-19T10:32:15Z",
    "logged_to_compliance": true
  },
  "trace_id": "DOC-1737285600000"
}
```

### Error Response

```json
{
  "success": false,
  "error": "OCR processing failed: API timeout",
  "stage": "ocr",
  "trace_id": "DOC-1737285600000",
  "timestamp": "2025-01-19T10:32:15Z"
}
```

**Error Stages:**
- `validation` - Input validation failed
- `ingest` - File ingestion failed
- `ocr` - OCR processing failed
- `map` - Schema mapping failed
- `store` - Storage upload failed
- `sync` - EHR/CRM sync failed

---

## Installation

### 1. Import Workflow

```bash
# Option A: n8n UI
1. Open n8n
2. Click "Import from File"
3. Select Aigent_Module_06_Document_Capture_OCR.json
4. Click "Import"

# Option B: n8n CLI
n8n import:workflow --input=Aigent_Module_06_Document_Capture_OCR.json
```

### 2. Configure Environment Variables

```bash
# Copy example file
cp .env.aigent_module_06_example .env

# Edit with your credentials
nano .env

# Load into n8n
n8n start --env-file=.env
```

### 3. Set Up Credentials

#### AWS S3 Credentials
```bash
n8n credentials:create \
  --type=aws \
  --name="AWS Credentials" \
  --data='{
    "accessKeyId":"YOUR_ACCESS_KEY",
    "secretAccessKey":"YOUR_SECRET_KEY",
    "region":"us-east-1"
  }'
```

#### HubSpot OAuth2
```bash
n8n credentials:create \
  --type=hubspotOAuth2Api \
  --name="HubSpot OAuth2 API"
# Follow OAuth flow in browser
```

#### Google Sheets Service Account
```bash
n8n credentials:create \
  --type=googleSheetsServiceAccountApi \
  --name="Google Sheets OAuth2" \
  --data='{
    "email":"your-service-account@project.iam.gserviceaccount.com",
    "privateKey":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  }'
```

### 4. Activate Workflow

```bash
# Via CLI
n8n workflow:activate --id=MODULE_06_WORKFLOW_ID

# Via UI
Click "Active" toggle in workflow editor
```

---

## Configuration

### OCR Engine Selection

Set the `OCR_ENGINE` environment variable:

```bash
# Mistral OCR (default - fast, accurate, commercial)
OCR_ENGINE=mistral
MISTRAL_OCR_API_KEY=your_mistral_api_key

# Google Gemini (structured extraction, vision model)
OCR_ENGINE=gemini
GEMINI_API_KEY=your_gemini_api_key

# ABBYY Cloud (premium quality, complex documents)
OCR_ENGINE=abbyy
ABBYY_APP_ID=your_app_id
ABBYY_APP_PASSWORD=your_password

# Tesseract (open-source, self-hosted)
OCR_ENGINE=tesseract
TESSERACT_CMD=/usr/bin/tesseract
```

### Storage Provider Selection

```bash
# AWS S3 (recommended for HIPAA)
STORAGE_PROVIDER=s3
S3_BUCKET=aigent-clinic-documents
S3_REGION=us-east-1

# Google Drive (alternative)
STORAGE_PROVIDER=gdrive
GDRIVE_FOLDER_ID=your_folder_id
```

### Enable/Disable Features

```bash
# Redaction
REDACTION_ENABLED=true

# EHR Sync
EHR_SYNC_ENABLED=true
EHR_TARGET=drchrono

# CRM Sync
CRM_SYNC_ENABLED=true
CRM_TARGET=hubspot

# HIPAA Mode
HIPAA_MODE=true
```

---

## OCR Engines

### Mistral OCR (Recommended)

**Pros:**
- Fast processing (< 5 seconds per page)
- High accuracy (95%+ on clean documents)
- Structured output with confidence scores
- Commercial API with SLA

**Cons:**
- Requires API key (paid service)
- Cloud-based (network dependency)

**Setup:**
```bash
OCR_ENGINE=mistral
MISTRAL_OCR_API_KEY=your_api_key_here
```

**Cost:** ~$0.01 per page (pricing varies)

### Google Gemini Vision

**Pros:**
- Excellent for complex layouts
- Natural language extraction
- Can interpret handwriting
- Structured JSON responses

**Cons:**
- Slower than Mistral (10-15 seconds)
- More expensive
- Requires prompt engineering

**Setup:**
```bash
OCR_ENGINE=gemini
GEMINI_API_KEY=your_gemini_api_key
```

**Cost:** ~$0.025 per page (Gemini Pro Vision)

### ABBYY Cloud OCR

**Pros:**
- Premium quality (99%+ accuracy)
- Best for complex documents
- Multi-language support
- Enterprise-grade

**Cons:**
- Most expensive option
- Slower processing
- Requires separate account

**Setup:**
```bash
OCR_ENGINE=abbyy
ABBYY_APP_ID=your_app_id
ABBYY_APP_PASSWORD=your_password
```

**Cost:** ~$0.05 per page (pricing varies by plan)

### Tesseract (Self-Hosted)

**Pros:**
- Free and open-source
- No external API calls
- Full control over data
- Good for simple documents

**Cons:**
- Lower accuracy (80-90%)
- Requires installation and maintenance
- Slower on large documents
- Limited structured extraction

**Setup:**
```bash
# Install Tesseract
sudo apt-get install tesseract-ocr

# Configure n8n
OCR_ENGINE=tesseract
TESSERACT_CMD=/usr/bin/tesseract
OCR_LANGUAGE=eng
```

**Cost:** Free (compute costs only)

### OCR Engine Comparison

| Engine | Accuracy | Speed | Cost | Structured Output | HIPAA |
|--------|----------|-------|------|-------------------|-------|
| Mistral | 95% | Fast | $0.01/page | Yes | Yes (BAA) |
| Gemini | 93% | Medium | $0.025/page | Yes | Yes (BAA) |
| ABBYY | 99% | Slow | $0.05/page | Yes | Yes (BAA) |
| Tesseract | 85% | Medium | Free | No | Yes (self-hosted) |

---

## Document Types

### Auto-Detection Logic

Module 06 automatically infers document type from filename patterns:

```javascript
// Node 602: Identify Document & Extract Metadata
if (fileName.includes('lab') || fileName.includes('result')) {
  docType = 'lab_result';
}
else if (fileName.includes('intake') || fileName.includes('form')) {
  docType = 'intake_form';
}
else if (fileName.includes('id') || fileName.includes('card')) {
  docType = 'id_card';
}
// ... additional patterns
```

### Extraction Templates by Doc Type

#### Lab Results

**Extracted fields:**
- `date_of_service` - Test date
- `provider` - Ordering physician
- `values[]` - Lab measurements (HDL, LDL, glucose, A1C, etc.)

**Example:**
```json
{
  "doc_type": "lab_result",
  "extracted": {
    "date_of_service": "2025-01-15",
    "provider": "Dr. Smith",
    "values": [
      { "key": "hdl", "value": "62 mg/dL" },
      { "key": "ldl", "value": "98 mg/dL" }
    ]
  }
}
```

#### Intake Forms

**Extracted fields:**
- `date_of_service` - Visit date
- `values[]` - Demographics (DOB, phone, address, emergency contact)

**Example:**
```json
{
  "doc_type": "intake_form",
  "extracted": {
    "values": [
      { "key": "dob", "value": "1985-06-15" },
      { "key": "phone", "value": "555-123-4567" }
    ]
  }
}
```

#### Insurance Cards

**Extracted fields:**
- `values[]` - Policy details (member ID, group number, plan name)

**Example:**
```json
{
  "doc_type": "insurance_card",
  "extracted": {
    "values": [
      { "key": "id_number", "value": "ABC123456789" },
      { "key": "group_number", "value": "GRP-999" }
    ]
  }
}
```

### Custom Extraction Templates

Add custom patterns in Node 614 (`Map to Normalized Schema`):

```javascript
if (docType === 'prescription') {
  // Extract medication, dosage, frequency
  const medPattern = /Medication[:\\s]*([A-Za-z]+\\s\\d+mg)/i;
  const medMatch = text.match(medPattern);
  if (medMatch) {
    extracted.values.push({
      key: 'medication',
      value: medMatch[1]
    });
  }
}
```

---

## Redaction & PHI Protection

### What Gets Redacted

When `REDACTION_ENABLED=true`, the following patterns are masked:

#### 1. Social Security Numbers (SSN)
```
Original: 123-45-6789
Redacted: 123-45-****
```

#### 2. Credit Card Numbers
```
Original: 4111 1111 1111 1234
Redacted: **** **** **** 1234
```

#### 3. Medical Record Numbers (MRN)
```
Original: MRN: 123456789
Redacted: MRN: ****6789
```

#### 4. Email Addresses
```
Original: patient@example.com
Redacted: p***@example.com
```

### Redaction Configuration

```bash
# Enable/disable redaction
REDACTION_ENABLED=true

# Configure what to redact
REDACT_SSN=true
REDACT_CREDIT_CARD=true
REDACT_MRN=true
REDACT_EMAIL=true
REDACT_PHONE=false

# Preserve last N digits
REDACT_PRESERVE_LAST_DIGITS=4

# Redaction character
REDACTION_CHAR=*
```

### Redaction Implementation (Node 616)

```javascript
// SSN: XXX-XX-1234 → XXX-XX-****
redactedText = text.replace(
  /(\d{3}[-\s]?\d{2}[-\s]?)(\d{4})/g,
  '$1****'
);

// Credit Card: 4111 1111 1111 1234 → **** **** **** 1234
redactedText = redactedText.replace(
  /(\d{4})[\s\-]?(\d{4})[\s\-]?(\d{4})[\s\-]?(\d{4})/g,
  '**** **** **** $4'
);

// MRN: MRN: 123456789 → MRN: ****6789
redactedText = redactedText.replace(
  /(?:MRN|Account|Member)[:\s#]*(\d+)(\d{4})/gi,
  (match, p1, p2) => match.replace(p1 + p2, '****' + p2)
);
```

### Storage Strategy

Both original and redacted versions are stored:

```json
{
  "storage": {
    "original_url": "s3://.../doc_123_original.pdf",
    "redacted_url": "s3://.../doc_123_redacted.pdf"
  }
}
```

**Usage guidelines:**
- **Original:** For clinical review by authorized providers
- **Redacted:** For billing, insurance claims, non-clinical staff

---

## Storage Integration

### AWS S3 (Recommended)

#### Configuration

```bash
STORAGE_PROVIDER=s3
S3_BUCKET=aigent-clinic-documents
S3_REGION=us-east-1
S3_PREFIX=clinic-docs/
S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/...
```

#### Bucket Structure

```
aigent-clinic-documents/
├── clinic-docs/
│   ├── intake_form/
│   │   ├── doc_abc123_original.pdf
│   │   └── doc_abc123_redacted.pdf
│   ├── lab_result/
│   │   ├── doc_def456_original.pdf
│   │   └── doc_def456_redacted.pdf
│   └── insurance_card/
│       ├── doc_ghi789_original.jpg
│       └── doc_ghi789_redacted.jpg
```

#### S3 Security Features

**Server-side encryption:**
```bash
S3_SERVER_SIDE_ENCRYPTION=AES256
```

**Versioning:**
```bash
S3_VERSIONING_ENABLED=true
```

**Object metadata:**
```json
{
  "Metadata": {
    "document_id": "doc_abc123",
    "doc_type": "lab_result",
    "patient_id": "ext_12345",
    "trace_id": "DOC-1737285600000"
  }
}
```

**Signed URLs (time-limited):**
```bash
# HIPAA Mode: 10 minutes
SIGNED_URL_TTL_SECONDS=600

# Non-HIPAA: 1 hour
SIGNED_URL_TTL_SECONDS=3600
```

#### S3 Bucket Policy (HIPAA Compliance)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::aigent-clinic-documents/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    },
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:user/n8n-service"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::aigent-clinic-documents/*"
    }
  ]
}
```

### Google Drive (Alternative)

#### Configuration

```bash
STORAGE_PROVIDER=gdrive
GDRIVE_FOLDER_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ
GDRIVE_CREDENTIAL_ID=your_gdrive_credential_id
```

#### Folder Structure

```
Clinic Documents/
├── Intake Forms/
│   ├── doc_abc123_original.pdf
│   └── doc_abc123_redacted.pdf
├── Lab Results/
└── Insurance Cards/
```

#### HIPAA Compliance with Google Drive

**Requirements:**
1. Google Workspace Enterprise (not free Gmail)
2. Signed BAA with Google
3. Enable encryption at rest
4. Disable public sharing
5. Enable audit logging

**Configuration:**
```bash
HIPAA_MODE=true
STORAGE_PROVIDER=gdrive
```

---

## EHR Integration

### Supported EHR Systems

- **Redox:** Universal interoperability platform
- **DrChrono:** Direct API integration
- **NextGen:** Practice management system

### Redox Integration

#### Configuration

```bash
EHR_SYNC_ENABLED=true
EHR_TARGET=redox
REDOX_API_KEY=your_redox_api_key
REDOX_SOURCE_ID=your_source_id
REDOX_DESTINATION_ID=your_destination_id
```

#### Message Format

Redox uses standardized HL7 FHIR-based messages:

```json
{
  "Meta": {
    "DataModel": "Media",
    "EventType": "New",
    "EventDateTime": "2025-01-19T10:30:00Z"
  },
  "Patient": {
    "Identifiers": [
      {
        "ID": "ext_12345",
        "IDType": "MRN"
      }
    ]
  },
  "Media": {
    "FileType": "application/pdf",
    "FileName": "lab_result.pdf",
    "FileContents": "https://s3.../doc_abc123_original.pdf",
    "DocumentType": "lab_result"
  }
}
```

### DrChrono Integration

#### Configuration

```bash
EHR_SYNC_ENABLED=true
EHR_TARGET=drchrono
DRCHRONO_TOKEN=your_oauth_token
```

#### API Call (Node 625)

```http
POST https://app.drchrono.com/api/clinical_notes
Authorization: Bearer {DRCHRONO_TOKEN}
Content-Type: application/json

{
  "patient": "ext_12345",
  "date": "2025-01-15",
  "description": "Uploaded document: lab_result - doc_abc123",
  "document_url": "https://s3.../doc_abc123_original.pdf"
}
```

### NextGen Integration

#### Configuration

```bash
EHR_SYNC_ENABLED=true
EHR_TARGET=nextgen
NEXTGEN_CLIENT_ID=your_client_id
NEXTGEN_CLIENT_SECRET=your_secret
NEXTGEN_BASE_URL=https://api.nextgen.com
```

---

## CRM Integration

### HubSpot Integration

#### Configuration

```bash
CRM_SYNC_ENABLED=true
CRM_TARGET=hubspot
HUBSPOT_API_KEY=pat-na1-your-private-app-token
```

#### Contact Update (Node 628)

Updates HubSpot contact with document metadata:

```json
{
  "properties": {
    "last_document_upload": "2025-01-19T10:30:00Z",
    "last_document_type": "lab_result",
    "document_url": "https://s3.../doc_abc123_redacted.pdf",
    "document_count": 5
  }
}
```

#### Custom Properties Setup

Create these properties in HubSpot:
1. `last_document_upload` (Date)
2. `last_document_type` (Single-line text)
3. `document_url` (Single-line text)
4. `document_count` (Number)

### Salesforce Integration

#### Configuration

```bash
CRM_SYNC_ENABLED=true
CRM_TARGET=salesforce
SALESFORCE_CREDENTIAL_ID=your_salesforce_credential_id
```

#### Attachment Creation (Node 629)

Attaches document to Salesforce contact record:

```json
{
  "ParentId": "003xxxxxxxxxxxxxxx",
  "Name": "lab_result.pdf",
  "Body": "<base64_encoded_file>",
  "Description": "Document upload: lab_result - doc_abc123"
}
```

---

## Compliance Logging

### Google Sheets Logging

#### Configuration

```bash
LOG_TARGET=sheets
GOOGLE_SHEETS_CREDENTIAL_ID=your_credential_id
GOOGLE_SHEET_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
GOOGLE_SHEET_TAB=OCR_Log
```

#### Log Schema

| Column | Value |
|--------|-------|
| Timestamp | 2025-01-19T10:30:00Z |
| Document ID | doc_abc123 |
| Doc Type | lab_result |
| Patient ID | ext_12345 |
| Patient Name | Jane Doe |
| Source | webhook |
| File Size (MB) | 2.5 |
| OCR Engine | mistral |
| Confidence | 0.94 |
| Redacted | true |
| Storage URL | s3://... |
| EHR Synced | updated |
| CRM Synced | updated |
| Trace ID | DOC-1737285600000 |

#### Sheet Setup

1. Create Google Sheet: "Aigent OCR Compliance Log"
2. Add headers (row 1): Timestamp, Document ID, Doc Type, ...
3. Share with service account email
4. Grant "Editor" permission

### Airtable Logging

#### Configuration

```bash
LOG_TARGET=airtable
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE=OCR_Log
```

#### Base Schema

```
OCR_Log Table:
- Timestamp (Date)
- Document ID (Single line text)
- Doc Type (Single select)
- Patient ID (Single line text)
- OCR Engine (Single select)
- Confidence (Number)
- Storage URL (URL)
- Trace ID (Single line text)
```

---

## Platform Setup Guides

### Mistral OCR Setup

1. Sign up at [mistral.ai](https://mistral.ai)
2. Navigate to API Keys
3. Create new API key
4. Copy key to `.env`:
   ```bash
   MISTRAL_OCR_API_KEY=your_api_key_here
   ```

### Google Gemini Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Enable Gemini API
4. Copy key to `.env`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key
   ```

### ABBYY Cloud Setup

1. Sign up at [ABBYY Cloud OCR](https://cloud.abbyy.com)
2. Create application
3. Note Application ID and Password
4. Configure `.env`:
   ```bash
   ABBYY_APP_ID=your_app_id
   ABBYY_APP_PASSWORD=your_password
   ```

### Tesseract Setup (Ubuntu/Debian)

```bash
# Install Tesseract
sudo apt-get update
sudo apt-get install -y tesseract-ocr

# Install additional language data
sudo apt-get install -y tesseract-ocr-eng tesseract-ocr-spa

# Verify installation
tesseract --version

# Configure n8n
OCR_ENGINE=tesseract
TESSERACT_CMD=/usr/bin/tesseract
OCR_LANGUAGE=eng
```

### AWS S3 Setup

#### 1. Create S3 Bucket

```bash
aws s3 mb s3://aigent-clinic-documents --region us-east-1
```

#### 2. Enable Versioning

```bash
aws s3api put-bucket-versioning \
  --bucket aigent-clinic-documents \
  --versioning-configuration Status=Enabled
```

#### 3. Enable Encryption

```bash
aws s3api put-bucket-encryption \
  --bucket aigent-clinic-documents \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

#### 4. Create IAM User

```bash
aws iam create-user --user-name n8n-document-service
```

#### 5. Attach Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::aigent-clinic-documents/*"
    }
  ]
}
```

#### 6. Generate Access Keys

```bash
aws iam create-access-key --user-name n8n-document-service
```

---

## Testing

### Test Mode

Enable test mode to skip actual API calls:

```bash
TEST_MODE=true
TEST_MOCK_OCR_RESPONSE=true
```

### Manual Testing

#### Test 1: Upload Lab Result

```bash
curl -X POST https://your-n8n-instance.com/webhook/aigent-document-capture \
  -F "file=@sample_lab_result.pdf" \
  -F 'metadata={
    "patient_name": "Test Patient",
    "patient_email": "test@example.com",
    "patient_id": "test_123",
    "doc_type": "lab_result"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "document_id": "doc_...",
  "doc_type": "lab_result",
  "extracted": {
    "values": [...]
  },
  "storage": {
    "original_url": "https://...",
    "redacted_url": "https://..."
  }
}
```

#### Test 2: Upload Intake Form

```bash
curl -X POST https://your-n8n-instance.com/webhook/aigent-document-capture \
  -F "file=@intake_form.pdf" \
  -F 'metadata={"doc_type":"intake_form","patient_id":"test_456"}'
```

#### Test 3: Invalid File Type

```bash
curl -X POST https://your-n8n-instance.com/webhook/aigent-document-capture \
  -F "file=@document.docx"
```

**Expected response:**
```json
{
  "success": false,
  "error": "Validation failed: unsupported MIME type",
  "stage": "validation"
}
```

#### Test 4: File Too Large

```bash
# Upload 20MB file (exceeds MAX_FILE_MB=15)
curl -X POST https://your-n8n-instance.com/webhook/aigent-document-capture \
  -F "file=@large_file.pdf"
```

**Expected response:**
```json
{
  "success": false,
  "error": "Validation failed: file too large",
  "stage": "validation",
  "details": {
    "size_mb": "20.5"
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. OCR API Timeout

**Symptom:** Error after 30 seconds: "OCR processing failed: timeout"

**Causes:**
- Large file size (> 10MB)
- Poor image quality requiring extra processing
- OCR API rate limiting

**Fix:**
```bash
# Increase timeout
OCR_TIMEOUT_MS=60000

# Reduce file size before upload
MAX_FILE_MB=10

# Try different OCR engine
OCR_ENGINE=mistral  # Faster than ABBYY
```

#### 2. S3 Upload Permission Denied

**Symptom:** "Access Denied" when uploading to S3

**Causes:**
- Incorrect AWS credentials
- IAM policy missing PutObject permission
- Bucket policy blocks access

**Fix:**
```bash
# Verify credentials
aws s3 ls s3://aigent-clinic-documents --profile n8n-service

# Check IAM policy includes:
{
  "Action": ["s3:PutObject", "s3:GetObject"],
  "Resource": "arn:aws:s3:::aigent-clinic-documents/*"
}
```

#### 3. Redaction Not Working

**Symptom:** Original text still visible in redacted file

**Causes:**
- REDACTION_ENABLED=false
- Regex patterns not matching format
- Node 616 skipped due to conditional

**Fix:**
```bash
# Enable redaction
REDACTION_ENABLED=true

# Verify Node 615 condition evaluates to true
# Check Node 616 is connected and executing

# Test regex patterns
echo "SSN: 123-45-6789" | sed 's/\([0-9]\{3\}-[0-9]\{2\}-\)[0-9]\{4\}/\1****/'
```

#### 4. EHR Sync Failing

**Symptom:** "EHR sync status: failed"

**Causes:**
- EHR_SYNC_ENABLED=false
- Invalid OAuth token
- Patient ID not found in EHR
- Network connectivity

**Fix:**
```bash
# Enable EHR sync
EHR_SYNC_ENABLED=true

# Refresh OAuth token (DrChrono example)
curl -X POST https://drchrono.com/o/token/ \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_SECRET"

# Verify patient exists
curl -X GET "https://app.drchrono.com/api/patients?external_id=ext_12345" \
  -H "Authorization: Bearer $DRCHRONO_TOKEN"
```

#### 5. Compliance Log Not Updating

**Symptom:** Google Sheets/Airtable not showing new entries

**Causes:**
- LOG_TARGET misconfigured
- Credential expired
- Sheet/table doesn't exist
- Column headers mismatch

**Fix:**
```bash
# Verify LOG_TARGET
LOG_TARGET=sheets

# Check Google Sheet ID
GOOGLE_SHEET_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789

# Verify service account has Editor permission
# on the Google Sheet

# Ensure column headers match exactly:
# Timestamp, Document ID, Doc Type, Patient ID, ...
```

### Debug Mode

Enable detailed logging:

```bash
DEBUG_MODE=true
LOG_ALL_REQUESTS=true
```

Logs will show:
- HTTP request/response bodies
- OCR processing details
- Storage upload confirmations
- EHR/CRM API calls

---

## Security & Compliance

### HIPAA Compliance

#### Requirements

1. **Business Associate Agreement (BAA)**
   - AWS S3: ✅ Available
   - Google Drive: ✅ Available (Workspace Enterprise)
   - Mistral: ✅ Available
   - Gemini: ✅ Available
   - ABBYY: ✅ Available
   - Tesseract: ✅ Self-hosted (no BAA needed)

2. **Encryption at Rest**
   ```bash
   S3_SERVER_SIDE_ENCRYPTION=AES256
   ```

3. **Encryption in Transit**
   - All API calls use HTTPS
   - TLS 1.2 or higher

4. **Access Controls**
   - Time-limited signed URLs
   - IAM role-based access
   - Audit logging enabled

5. **Data Minimization**
   - Redaction of non-essential PHI
   - Separate original/redacted versions

#### HIPAA Mode Configuration

```bash
HIPAA_MODE=true
REDACTION_ENABLED=true
SIGNED_URL_TTL_SECONDS=600
REQUIRE_BAA_VENDORS=true
BAA_APPROVED_VENDORS=mistral,gemini,abbyy,aws,hubspot,drchrono,redox
AUDIT_TRAIL_ENABLED=true
```

### Data Retention

```bash
# Compliance log retention
LOG_RETENTION_DAYS=2555  # 7 years (HIPAA requirement)

# Document storage retention (configure S3 lifecycle)
aws s3api put-bucket-lifecycle-configuration \
  --bucket aigent-clinic-documents \
  --lifecycle-configuration file://lifecycle.json
```

**lifecycle.json:**
```json
{
  "Rules": [
    {
      "Id": "Archive after 7 years",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 2555,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### Access Audit Trail

All document operations are logged:
- Who uploaded (patient_id, source IP)
- When uploaded (capture_ts)
- What was uploaded (doc_type, file hash)
- Who accessed (signed URL requests)
- What was extracted (OCR confidence, field count)

### PHI-Safe Design

**What Module 06 Processes:**
- Document images/PDFs
- Contact information (name, email)
- Administrative metadata
- Document classifications

**What Module 06 Excludes:**
- Diagnosis codes (ICD-10)
- Treatment plans
- Progress notes
- Prescription details (if not doc_type)

---

## Advanced Customization

### Custom Document Types

Add new document types in Node 602:

```javascript
// Node 602: Identify Document & Extract Metadata
else if (nameLower.includes('referral')) {
  docType = 'referral';
}
else if (nameLower.includes('prescription') || nameLower.includes('rx')) {
  docType = 'prescription';
}
```

Then add extraction logic in Node 614:

```javascript
// Node 614: Map to Normalized Schema
else if (docType === 'referral') {
  // Extract referring provider, specialist, reason
  const referPattern = /Referring to[:\\s]*([A-Z][a-z]+\\s[A-Z][a-z]+)/i;
  const referMatch = text.match(referPattern);
  if (referMatch) {
    extracted.values.push({
      key: 'referred_to',
      value: referMatch[1]
    });
  }
}
```

### Multi-Language OCR

```bash
# English + Spanish
OCR_LANGUAGE=eng+spa

# French
OCR_LANGUAGE=fra

# Tesseract: Install additional language packs
sudo apt-get install tesseract-ocr-fra tesseract-ocr-deu
```

### Webhook Authentication

Add API key authentication to webhook:

```javascript
// Node 601: Webhook - Document Upload
// Add validation in Node 602

const apiKey = $input.item.json.headers['x-api-key'];
const validKey = $env.WEBHOOK_API_KEY;

if (apiKey !== validKey) {
  throw new Error('Unauthorized: Invalid API key');
}
```

### Batch Processing

Process multiple files in parallel:

```javascript
// Split incoming array of files
const files = $input.item.json.files;
return files.map(file => ({ json: file, binary: { data: file } }));
```

### Custom Storage Providers

Add Azure Blob Storage:

```javascript
// Node 618: Add Azure switch
else if (storageProvider === 'azure') {
  // Use Azure Blob Storage node
  // Connection string: $env.AZURE_STORAGE_CONNECTION_STRING
}
```

---

## Support

For issues, questions, or feature requests:

- **GitHub Issues:** [github.com/aigent/universal-clinic-template/issues](https://github.com/aigent/universal-clinic-template/issues)
- **Documentation:** [docs.aigent.com/module-06](https://docs.aigent.com/module-06)
- **Email:** support@aigent.com

---

## License

Copyright 2025 Aigent Company. All rights reserved.

This workflow is part of the Aigent Universal Clinic Template and is licensed for use by Aigent customers only.

---

**Version History:**

- **1.0.0** (2025-01-15): Initial release
  - Multi-source document ingestion (webhook, S3, Drive, IMAP)
  - 4 OCR engines (Mistral, Gemini, ABBYY, Tesseract)
  - Document type auto-detection and structured extraction
  - PHI redaction with regex patterns
  - Secure storage (S3/Drive) with signed URLs
  - EHR sync (Redox, DrChrono, NextGen)
  - CRM sync (HubSpot, Salesforce, Zoho)
  - Compliance logging (Google Sheets, Airtable)
  - HIPAA-compliant architecture
