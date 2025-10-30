# Aigent Module 07 - Analytics & Reporting Dashboard

**Version:** 1.0.0
**Last Updated:** 2025-01-15
**Node Range:** 701-731
**Purpose:** Aggregate metrics from all Aigent modules, compute KPIs, and generate executive-ready analytics reports

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Input Sources](#input-sources)
4. [Output Schema](#output-schema)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [KPI Definitions](#kpi-definitions)
8. [Report Formats](#report-formats)
9. [Data Sources](#data-sources)
10. [Visualization Integration](#visualization-integration)
11. [Scheduling](#scheduling)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)
14. [Advanced Features](#advanced-features)

---

## Overview

Module 07 is the analytics engine of the Aigent Universal Clinic Template. It aggregates data from all upstream modules (01-06), normalizes disparate data sources, computes key performance indicators, and generates actionable reports for clinic management.

### Key Features

- **Multi-source aggregation:** HubSpot, Stripe, Cal.com, Typeform, Google Sheets
- **Automated scheduling:** Daily, weekly, or custom CRON schedules
- **KPI computation:** Conversion rates, revenue metrics, NPS, show rates, retention
- **HTML report generation:** Executive-ready dashboard with charts and metrics
- **Multiple output channels:** S3, Google Drive, Email, Looker Studio, Power BI
- **Historical tracking:** Appends summary to Google Sheets for trend analysis
- **PHI-safe design:** Aggregate metrics only, no individual patient identifiers
- **Credential-agnostic:** All API keys via environment variables

### Module Chaining

**Accepts input from:** All Aigent modules (01-06)
**Input format:** Aggregates from multiple sources
**Output format:** `aggregated_metrics.json` + HTML report
**Next module:** Compliance audit, AIgent Manager dashboard

---

## Architecture

### Workflow Components

```
┌──────────────────────────────────────────────────────────────────┐
│                      SCHEDULING LAYER                             │
└──────────────────────────────────────────────────────────────────┘

  Schedule Trigger (701) → Daily at 6 AM (configurable CRON)
        ↓
  Initialize Reporting Period (702) → Calculate date range


┌──────────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION LAYER                          │
└──────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  LEADS (parallel collection):       │
  │  • HubSpot API (703)                │
  │  • Google Sheets (704)              │
  └──────────────┬──────────────────────┘
                 ↓
  Normalize Leads Data (705)
        ↓
  ┌─────────────────────────────────────┐
  │  BOOKINGS (parallel collection):    │
  │  • Cal.com API (706)                │
  │  • Google Sheets (707)              │
  └──────────────┬──────────────────────┘
                 ↓
  Normalize Bookings Data (708)
        ↓
  ┌─────────────────────────────────────┐
  │  PAYMENTS (parallel collection):    │
  │  • Stripe API (709)                 │
  │  • Google Sheets (710)              │
  └──────────────┬──────────────────────┘
                 ↓
  Normalize Payments Data (711)
        ↓
  ┌─────────────────────────────────────┐
  │  NPS (parallel collection):         │
  │  • Google Sheets (712)              │
  │  • Typeform API (713)               │
  └──────────────┬──────────────────────┘
                 ↓
  Normalize NPS Data (714)
        ↓
  Collect OCR Metrics (715)
        ↓
  Normalize OCR Metrics (716)


┌──────────────────────────────────────────────────────────────────┐
│                    ANALYTICS PROCESSING LAYER                     │
└──────────────────────────────────────────────────────────────────┘

  Compute KPIs (717)
        ↓
  Generate HTML Report (718)
        ↓
  Check Report Format (719)


┌──────────────────────────────────────────────────────────────────┐
│                    DISTRIBUTION LAYER                             │
└──────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  Storage (parallel):                │
  │  • Upload to S3 (720)               │
  │  • Upload to Google Drive (721)     │
  └──────────────┬──────────────────────┘
                 ↓
  Generate Report URL (722)
        ↓
  Check If Email Enabled (723)
        ↓ [if enabled]
  Send Report Email (724)
        ↓
  Log Summary to Google Sheets (725)
        ↓
  Build aggregated_metrics.json (726)
        ↓
  Check If Looker Export Enabled (727)
        ↓ [if enabled]
  Export to Looker Studio (728)
        ↓
  Return aggregated_metrics.json (729)


┌──────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING LAYER                         │
└──────────────────────────────────────────────────────────────────┘

  Any Stage Error → Error Handler (730) → Return Error (731)
```

### Node Breakdown

| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| 701 | Schedule Trigger | Schedule | Trigger analytics run (daily 6 AM) |
| 702 | Initialize Period | Code | Calculate reporting date range |
| 703 | Collect Leads (HubSpot) | HubSpot | Fetch leads from CRM |
| 704 | Collect Leads (Sheets) | Google Sheets | Fallback leads source |
| 705 | Normalize Leads | Code | Merge and standardize leads data |
| 706 | Collect Bookings (Cal.com) | HTTP | Fetch bookings from scheduler |
| 707 | Collect Bookings (Sheets) | Google Sheets | Fallback bookings source |
| 708 | Normalize Bookings | Code | Merge and standardize bookings |
| 709 | Collect Payments (Stripe) | HTTP | Fetch payments from gateway |
| 710 | Collect Payments (Sheets) | Google Sheets | Fallback payments source |
| 711 | Normalize Payments | Code | Merge and standardize payments |
| 712 | Collect NPS (Sheets) | Google Sheets | Fetch NPS survey responses |
| 713 | Collect NPS (Typeform) | HTTP | Alternative NPS source |
| 714 | Normalize NPS | Code | Merge and standardize NPS data |
| 715 | Collect OCR Metrics | Google Sheets | Fetch document processing stats |
| 716 | Normalize OCR | Code | Filter and process OCR metrics |
| 717 | Compute KPIs | Code | Calculate all performance indicators |
| 718 | Generate HTML | Code | Create formatted HTML report |
| 719 | Check Format | If | Determine output format |
| 720 | Upload to S3 | AWS S3 | Store report in S3 bucket |
| 721 | Upload to Drive | Google Drive | Alternative storage |
| 722 | Generate URL | Code | Create accessible report link |
| 723 | Check Email | If | Determine if email distribution enabled |
| 724 | Send Email | Email | Distribute report via email |
| 725 | Log to Sheets | Google Sheets | Append summary to historical log |
| 726 | Build Output | Code | Construct standardized JSON output |
| 727 | Check Looker | If | Determine if visualization export enabled |
| 728 | Export to Looker | HTTP | Push metrics to Looker Studio |
| 729 | Return Output | Respond | Return aggregated_metrics.json |
| 730 | Error Handler | Code | Format error response |
| 731 | Return Error | Respond | Return error JSON |

---

## Input Sources

Module 07 aggregates data from multiple sources in parallel. Each source has a primary API endpoint and a fallback to Google Sheets.

### Source 1: Leads (Module 01 output)

**Primary:** HubSpot CRM API
**Fallback:** Google Sheets → Leads tab

**Fields:**
- `email` - Patient email
- `name` - Patient full name
- `source` - Lead source (website, referral, etc.)
- `created_at` - Lead capture timestamp
- `lifecycle_stage` - Lead, MQL, SQL, Customer

### Source 2: Bookings (Module 02 output)

**Primary:** Cal.com API / Acuity API
**Fallback:** Google Sheets → Bookings tab

**Fields:**
- `email` - Patient email
- `patient_name` - Patient name
- `appointment_date` - Scheduled date/time
- `status` - booked, completed, no_show, cancelled
- `visit_type` - Type of appointment

### Source 3: Payments (Module 04 output)

**Primary:** Stripe API / Square API
**Fallback:** Google Sheets → Payments tab

**Fields:**
- `email` - Patient email
- `amount` - Payment amount
- `currency` - Currency code (USD)
- `status` - succeeded, paid
- `created_at` - Payment timestamp

### Source 4: NPS Scores (Module 05 output)

**Primary:** Typeform API
**Fallback:** Google Sheets → Survey_Responses tab

**Fields:**
- `email` - Patient email
- `nps` - NPS score (0-10)
- `timestamp` - Survey completion date
- `feedback` - Optional text feedback

### Source 5: OCR Metrics (Module 06 output)

**Source:** Google Sheets → OCR_Log tab

**Fields:**
- `document_id` - Unique document identifier
- `doc_type` - Document category
- `confidence` - OCR confidence score (0-1)
- `processing_time` - Processing duration (seconds)
- `timestamp` - Processing date
- `ocr_engine` - Engine used (Mistral, Gemini, etc.)

---

## Output Schema

### aggregated_metrics.json

```json
{
  "success": true,
  "trace_id": "ANALYTICS-1737285600000",
  "period": "2025-01-01 to 2025-01-31",
  "totals": {
    "leads": 124,
    "bookings": 86,
    "completed_visits": 74,
    "revenue_usd": 89200.00,
    "nps_avg": 8.6,
    "doc_processing_time_avg_sec": 5.3
  },
  "averages": {
    "revenue_per_patient": 1205.41,
    "nps_score": 8.6,
    "nps_net_score": 65.5,
    "ocr_confidence": 0.94,
    "doc_processing_time_sec": 5.3
  },
  "rates": {
    "lead_to_booking": 0.69,
    "booking_to_visit": 0.86,
    "visit_to_payment": 1.00,
    "show_rate": 0.86,
    "retention_rate": 0.73
  },
  "segments": {
    "promoters": 45,
    "passives": 22,
    "detractors": 8,
    "unique_patients": 68,
    "repeat_patients": 50
  },
  "report_links": {
    "html_report": "https://clinic-reports.s3.us-east-1.amazonaws.com/YourClinic_report_2025-01-31.html",
    "sheet_url": "https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789",
    "looker_dashboard": "https://lookerstudio.google.com/reporting/your-dashboard-id"
  },
  "metadata": {
    "generated_at": "2025-01-31T06:00:00Z",
    "data_sources": ["Leads", "Bookings", "Payments", "NPS", "OCR"],
    "processed_by": "Aigent_Module_07"
  }
}
```

### HTML Report Structure

The HTML report includes:
1. **Header** - Clinic name, reporting period, generation timestamp
2. **Volume Metrics** - Total leads, bookings, visits, revenue
3. **Conversion Funnel** - Lead→Booking, Booking→Visit rates, show rate, retention
4. **Revenue Metrics** - Avg revenue per patient, total payments, visit→payment rate
5. **NPS Analysis** - Avg NPS score, Net Promoter Score, segment breakdown
6. **OCR Performance** - Documents processed, confidence, processing time
7. **Patient Engagement** - Unique patients, repeat patients, no-shows
8. **Footer** - Data sources, generation info

---

## Installation

### 1. Import Workflow

```bash
# Via n8n UI
1. Open n8n
2. Click "Import from File"
3. Select Aigent_Module_07_Analytics_Dashboard.json
4. Click "Import"

# Via CLI
n8n import:workflow --input=Aigent_Module_07_Analytics_Dashboard.json
```

### 2. Configure Environment Variables

```bash
# Copy example file
cp .env.aigent_module_07_example .env

# Edit with your configuration
nano .env

# Key variables to set:
ANALYTICS_SCHEDULE=0 6 * * *
REPORT_PERIOD_DAYS=30
BRAND_NAME=Your Clinic
EMAIL_REPORT_TO=admin@yourclinic.com
```

### 3. Set Up Credentials

#### HubSpot OAuth2
```bash
n8n credentials:create \
  --type=hubspotOAuth2Api \
  --name="HubSpot OAuth2 API"
# Follow OAuth flow
```

#### Stripe API Key
```bash
# Store in n8n credential manager as httpHeaderAuth:
# Header: Authorization
# Value: Bearer sk_live_YOUR_STRIPE_KEY
```

#### Google Sheets Service Account
```bash
n8n credentials:create \
  --type=googleSheetsServiceAccountApi \
  --name="Google Sheets OAuth2"
```

#### AWS S3 Credentials
```bash
n8n credentials:create \
  --type=aws \
  --name="AWS Credentials" \
  --data='{"accessKeyId":"YOUR_KEY","secretAccessKey":"YOUR_SECRET","region":"us-east-1"}'
```

### 4. Activate Workflow

The workflow activates automatically on import if schedule is configured.

```bash
# Verify activation
n8n workflow:list | grep "Module 07"

# Manual activation
n8n workflow:activate --id=MODULE_07_WORKFLOW_ID
```

---

## Configuration

### Schedule Configuration

```bash
# Daily at 6 AM
ANALYTICS_SCHEDULE=0 6 * * *

# Every Monday at 8 AM
ANALYTICS_SCHEDULE=0 8 * * 1

# Twice daily (6 AM and 6 PM)
ANALYTICS_SCHEDULE=0 6,18 * * *

# Every 6 hours
ANALYTICS_SCHEDULE=0 */6 * * *
```

### Reporting Period

```bash
# Last 7 days (weekly report)
REPORT_PERIOD_DAYS=7

# Last 30 days (monthly report)
REPORT_PERIOD_DAYS=30

# Last 90 days (quarterly report)
REPORT_PERIOD_DAYS=90

# Last 365 days (annual report)
REPORT_PERIOD_DAYS=365
```

### Data Source Priority

The workflow tries sources in this order:
1. **Primary API** (HubSpot, Stripe, Cal.com, Typeform)
2. **Fallback Google Sheets**
3. **Continue with available data** (if continueOnFail=true)

Configure source selection:
```bash
# CRM for leads
CRM_PROVIDER=hubspot  # or sheets

# Booking system
BOOKING_PROVIDER=calcom  # or sheets

# Payment gateway
PAYMENT_PROVIDER=stripe  # or sheets

# Survey platform
SURVEY_PROVIDER=typeform  # or sheets
```

---

## KPI Definitions

### Volume Metrics

| Metric | Calculation | Description |
|--------|-------------|-------------|
| **Total Leads** | Count of leads | All new patient inquiries |
| **Appointments Booked** | Count of bookings | Scheduled appointments |
| **Completed Visits** | Bookings with status=completed | Attended appointments |
| **Total Revenue** | Sum of payments | All successful payments |

### Conversion Rates

| Metric | Formula | Target | Description |
|--------|---------|--------|-------------|
| **Lead → Booking** | bookings / leads | 60% | Lead conversion rate |
| **Booking → Visit** | completed_visits / bookings | 80% | Appointment show rate |
| **Visit → Payment** | payments / completed_visits | 100% | Payment collection rate |
| **Show Rate** | 1 - (no_shows / bookings) | 85% | Percentage of kept appointments |
| **Retention Rate** | repeat_patients / unique_patients | 70% | Patient return rate |

### Revenue Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| **Avg Revenue per Patient** | total_revenue / payments_count | Average transaction value |
| **Total Payments** | Count of payments | Number of transactions |

### NPS (Net Promoter Score)

| Metric | Formula | Range | Description |
|--------|---------|-------|-------------|
| **Avg NPS Score** | Sum(nps) / Count(nps) | 0-10 | Average satisfaction score |
| **Net Promoter Score** | (promoters - detractors) / total × 100 | -100 to +100 | Industry standard NPS |

**NPS Segments:**
- **Promoters (9-10):** Loyal enthusiasts who will refer others
- **Passives (7-8):** Satisfied but unenthusiastic customers
- **Detractors (0-6):** Unhappy customers who may damage brand

**NPS Benchmarks:**
- **> 70:** World-class
- **50-70:** Excellent
- **30-50:** Good
- **0-30:** Needs improvement
- **< 0:** Crisis

### OCR Performance Metrics

| Metric | Formula | Target | Description |
|--------|---------|--------|-------------|
| **Documents Processed** | Count of documents | - | Total OCR operations |
| **Avg Confidence Score** | Sum(confidence) / Count | > 0.90 | OCR accuracy indicator |
| **Avg Processing Time** | Sum(time) / Count | < 10 sec | Processing efficiency |

---

## Report Formats

### HTML Report (Default)

**Features:**
- Responsive design (mobile-friendly)
- Color-coded metrics (green for good, red for concerning)
- Grid layout with metric cards
- NPS segment breakdown table
- Professional styling with gradients
- Clinic branding (logo, name)

**Configuration:**
```bash
REPORT_FORMAT=html
REPORT_COLOR_SCHEME=purple  # default, blue, purple, green
CLINIC_LOGO_URL=https://yourclinic.com/logo.png
```

**Output:** `YourClinic_report_2025-01-31.html`

### Markdown Report

**Features:**
- Plain text format
- Easy to embed in documentation
- Version control friendly
- Lightweight

**Configuration:**
```bash
REPORT_FORMAT=markdown
```

**Output:** `YourClinic_report_2025-01-31.md`

### JSON Report

**Features:**
- Machine-readable
- Easy to integrate with other systems
- Includes all raw data

**Configuration:**
```bash
REPORT_FORMAT=json
```

**Output:** `aggregated_metrics.json`

---

## Data Sources

### Google Sheets Setup

#### 1. Create Main Analytics Sheet

Create a Google Sheet with these tabs:

**Leads Tab:**
| Email | Name | Source | Created At | Stage |
|-------|------|--------|------------|-------|

**Bookings Tab:**
| Email | Patient Name | Appointment Date | Status | Visit Type |
|-------|--------------|------------------|--------|------------|

**Payments Tab:**
| Email | Amount | Currency | Status | Payment Date |
|-------|--------|----------|--------|--------------|

**Survey_Responses Tab:**
| Email | Patient ID | NPS Score | Feedback | Timestamp |
|-------|------------|-----------|----------|-----------|

**OCR_Log Tab:**
| Document ID | Doc Type | Confidence | Processing Time | Timestamp | OCR Engine |
|-------------|----------|------------|-----------------|-----------|------------|

**Analytics_Summary Tab:**
| Date | Period | Leads | Bookings | Completed Visits | Revenue USD | Avg NPS | Lead to Booking % | Show Rate % | Retention Rate % | Documents Processed | Report URL |
|------|--------|-------|----------|------------------|-------------|---------|-------------------|-------------|------------------|---------------------|------------|

#### 2. Share with Service Account

1. Create Google Cloud service account
2. Download JSON key
3. Share sheet with service account email
4. Grant "Editor" permission

#### 3. Configure Environment

```bash
GOOGLE_SHEETS_CREDENTIAL_ID=your_credential_id
GOOGLE_SHEET_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
SHEET_LEADS_TAB=Leads
SHEET_BOOKINGS_TAB=Bookings
SHEET_PAYMENTS_TAB=Payments
SHEET_SURVEYS_TAB=Survey_Responses
SHEET_OCR_TAB=OCR_Log
SHEET_ANALYTICS_TAB=Analytics_Summary
```

### HubSpot Integration

#### 1. Create Private App

```
Settings → Integrations → Private Apps → Create:
Name: Aigent Analytics
Scopes:
- crm.objects.contacts.read
- crm.lists.read
```

#### 2. Configure Environment

```bash
CRM_PROVIDER=hubspot
HUBSPOT_API_KEY=pat-na1-your-private-app-token
```

### Stripe Integration

#### 1. Get API Key

```
Dashboard → Developers → API Keys
Copy "Secret key" (starts with sk_live_ or sk_test_)
```

#### 2. Configure Environment

```bash
PAYMENT_PROVIDER=stripe
STRIPE_API_KEY=sk_live_your_stripe_secret_key
```

### Cal.com Integration

#### 1. Get API Token

```
Settings → Developer → API Keys → Generate
```

#### 2. Configure Environment

```bash
BOOKING_PROVIDER=calcom
CALCOM_TOKEN=your_calcom_api_key
CALCOM_API_BASE=https://api.cal.com
```

### Typeform Integration

#### 1. Get Personal Access Token

```
Account → Settings → Personal tokens → Generate
```

#### 2. Configure Environment

```bash
SURVEY_PROVIDER=typeform
TYPEFORM_TOKEN=tfp_your_typeform_api_key
TYPEFORM_FORM_ID=your_form_id
```

---

## Visualization Integration

### Looker Studio

#### 1. Create Data Source

```
1. Go to Looker Studio (formerly Google Data Studio)
2. Create → Data Source
3. Select "Google Sheets" connector
4. Choose your Analytics_Summary sheet
5. Configure fields and data types
```

#### 2. Create Dashboard

```
1. Create → Report
2. Add data source (Analytics_Summary)
3. Add charts:
   - Time series: Leads, Bookings, Revenue over time
   - Scorecard: Current period totals
   - Bar chart: Conversion rates
   - Pie chart: NPS segments
4. Add date range control
```

#### 3. Enable Export

```bash
LOOKER_EXPORT_ENABLED=true
LOOKER_STUDIO_URL=https://lookerstudio.google.com/reporting/your-dashboard-id
```

### Power BI

#### 1. Create Dataset

```
1. Open Power BI Desktop
2. Get Data → Web → Enter Google Sheets CSV export URL
3. Transform data as needed
4. Load to model
```

#### 2. Create Report

```
1. Add visualizations:
   - Card: KPI metrics
   - Line chart: Trends
   - Funnel: Conversion rates
   - Gauge: NPS score
2. Publish to Power BI Service
```

#### 3. Configure API Export

```bash
POWERBI_EXPORT_ENABLED=true
POWERBI_WORKSPACE_ID=your_workspace_id
POWERBI_DATASET_ID=your_dataset_id
POWERBI_CLIENT_ID=your_client_id
POWERBI_CLIENT_SECRET=your_client_secret
```

### Tableau

#### 1. Connect to Google Sheets

```
1. Open Tableau Desktop
2. Connect → To a Server → Google Sheets
3. Authenticate and select Analytics_Summary
4. Load data
```

#### 2. Create Dashboard

```
1. Create visualizations
2. Combine into dashboard
3. Publish to Tableau Server/Online
```

---

## Scheduling

### CRON Expression Examples

```bash
# Every day at 6 AM
ANALYTICS_SCHEDULE=0 6 * * *

# Every weekday at 8 AM
ANALYTICS_SCHEDULE=0 8 * * 1-5

# Every Monday at 9 AM
ANALYTICS_SCHEDULE=0 9 * * 1

# First day of every month at 7 AM
ANALYTICS_SCHEDULE=0 7 1 * *

# Every 4 hours
ANALYTICS_SCHEDULE=0 */4 * * *

# Twice daily: 6 AM and 6 PM
ANALYTICS_SCHEDULE=0 6,18 * * *
```

### Manual Trigger

Enable webhook trigger for on-demand reports:

```bash
WEBHOOK_TRIGGER_ENABLED=true
WEBHOOK_ID_MODULE_07=your_webhook_id
WEBHOOK_API_KEY=your_secure_api_key
```

**Trigger manually:**
```bash
curl -X POST https://your-n8n-instance.com/webhook/aigent-analytics \
  -H "X-API-Key: your_secure_api_key"
```

---

## Testing

### Test Mode

Enable test mode to use sample data:

```bash
TEST_MODE=true
SAMPLE_DATA_PATH=/data/sample_analytics.json
```

### Manual Test Run

```bash
# 1. Activate workflow
n8n workflow:activate --id=MODULE_07_WORKFLOW_ID

# 2. Trigger manually (if webhook enabled)
curl -X POST https://your-n8n-instance.com/webhook/aigent-analytics

# 3. Check execution logs
n8n executions:list --workflow=MODULE_07_WORKFLOW_ID

# 4. View output
n8n execution:show --id=EXECUTION_ID
```

### Expected Output

**Successful execution:**
```json
{
  "success": true,
  "period": "2025-01-01 to 2025-01-31",
  "totals": { "leads": 124, ... },
  "rates": { "lead_to_booking": 0.69, ... },
  "report_links": {
    "html_report": "https://...",
    "sheet_url": "https://..."
  }
}
```

**Failed execution:**
```json
{
  "success": false,
  "error": "Data collection failed: HubSpot API timeout",
  "stage": "data_collection",
  "trace_id": "ANALYTICS-1737285600000"
}
```

---

## Troubleshooting

### Issue 1: No Data Collected

**Symptom:** Report shows 0 for all metrics

**Causes:**
- Date range has no data
- API credentials expired
- Google Sheets empty

**Fix:**
```bash
# Verify date range
REPORT_PERIOD_DAYS=30  # Ensure sufficient data

# Check credentials
n8n credentials:list

# Verify Google Sheets has data
# Open sheet and check row count in each tab

# Enable debug mode
DEBUG_MODE=true
```

### Issue 2: API Rate Limiting

**Symptom:** "429 Too Many Requests" errors

**Causes:**
- Too many API calls
- Running analytics too frequently
- Fetching too many records

**Fix:**
```bash
# Reduce frequency
ANALYTICS_SCHEDULE=0 6 * * *  # Once daily

# Limit records
MAX_RECORDS_PER_SOURCE=5000

# Add delays between requests
RETRY_DELAY_MS=2000
```

### Issue 3: Report Not Generated

**Symptom:** Workflow completes but no report file

**Causes:**
- S3/Drive upload failed
- Invalid credentials
- Storage quota exceeded

**Fix:**
```bash
# Verify S3 credentials
aws s3 ls s3://clinic-reports --profile analytics

# Check S3 bucket exists
aws s3 mb s3://clinic-reports --region us-east-1

# Verify Google Drive folder
# Open Drive and check DRIVE_FOLDER_ID exists

# Enable continueOnFail for storage nodes
# This will create report even if upload fails
```

### Issue 4: Email Not Sent

**Symptom:** Report generated but email not delivered

**Causes:**
- SMTP credentials incorrect
- Email recipient invalid
- Email size too large

**Fix:**
```bash
# Test SMTP credentials
curl smtp://smtp.gmail.com:587 --user "your_email:your_password" --mail-from "your_email@gmail.com"

# Verify EMAIL_REPORT_TO
EMAIL_REPORT_TO=valid@email.com

# Check email size
# If HTML report > 10MB, use link instead of inline
```

### Issue 5: Incorrect KPI Calculations

**Symptom:** Rates don't match expected values

**Causes:**
- Duplicate records
- Date filter issues
- Data not normalized

**Fix:**
```bash
# Enable deduplication
DEDUPLICATION_STRATEGY=email

# Verify date range
VALIDATE_DATE_RANGES=true

# Check raw data
# View Google Sheets to verify source data quality

# Enable debug mode to see intermediate calculations
DEBUG_MODE=true
```

---

## Advanced Features

### Custom Metrics

Define custom KPI calculations:

```bash
CUSTOM_METRICS_ENABLED=true

# Patient Lifetime Value
CUSTOM_METRIC_1_NAME=Patient Lifetime Value
CUSTOM_METRIC_1_FORMULA=total_revenue / unique_patients

# Cost Per Acquisition
CUSTOM_METRIC_2_NAME=Cost Per Acquisition
CUSTOM_METRIC_2_FORMULA=marketing_spend / total_leads

# Marketing spend input
MARKETING_SPEND_USD=5000
```

### BigQuery Export

For large-scale analytics:

```bash
BIGQUERY_EXPORT_ENABLED=true
BIGQUERY_PROJECT_ID=your-gcp-project
BIGQUERY_DATASET_ID=clinic_analytics
BIGQUERY_TABLE_ID=daily_metrics
```

**Benefits:**
- SQL queries on historical data
- Integration with Looker/Data Studio
- Advanced analytics (cohort analysis, predictive models)

### PHI-Safe Mode

Exclude identifiable information from reports:

```bash
PHI_SAFE_MODE=true
```

**Excludes:**
- Patient names
- Email addresses
- Phone numbers

**Includes:**
- Aggregate metrics only
- Counts and averages
- Rates and percentages

### Real-Time Data Integration

Accept real-time updates from upstream modules:

```bash
ACCEPT_UPSTREAM_REALTIME=true
MODULE_01_WEBHOOK=https://n8n.instance.com/webhook/aigent-intake
MODULE_04_WEBHOOK=https://n8n.instance.com/webhook/aigent-billing
```

**Flow:**
1. Module 01-06 complete operations
2. Send webhook to Module 07
3. Module 07 updates running totals
4. Dashboard refreshes in real-time

---

## Support

For issues, questions, or feature requests:

- **GitHub Issues:** [github.com/aigent/universal-clinic-template/issues](https://github.com/aigent/universal-clinic-template/issues)
- **Documentation:** [docs.aigent.com/module-07](https://docs.aigent.com/module-07)
- **Email:** support@aigent.com

---

## License

Copyright 2025 Aigent Company. All rights reserved.

This workflow is part of the Aigent Universal Clinic Template and is licensed for use by Aigent customers only.

---

**Version History:**

- **1.0.0** (2025-01-15): Initial release
  - Multi-source data aggregation (HubSpot, Stripe, Cal.com, Typeform, Sheets)
  - KPI computation (conversion rates, revenue, NPS, show rates, retention)
  - HTML report generation with responsive design
  - Multiple distribution channels (S3, Drive, Email, Looker)
  - Historical tracking via Google Sheets append
  - PHI-safe aggregate metrics
  - Automated scheduling with CRON
  - Error handling and fallback sources
