# Aigent Module 07 – Analytics & Reporting Dashboard Build Notes (v1.1 Enhanced)

**Document Version:** 1.1.0-enhanced
**Workflow Version:** 1.1.0-enhanced
**Author:** Aigent Automation Engineering (Master Automation Architect + Serena + Context7)
**Created:** 2025-10-30
**Module:** 07 - Analytics & Reporting Dashboard
**Purpose:** Technical design documentation, enhancement rationale, test plan, operations guide

---

## Executive Summary

### What This Module Does

Module 07 is the **central analytics engine** that aggregates data from all modules (01-06), computes comprehensive KPIs, and generates professional executive dashboards. It runs on a daily schedule (6 AM default) to provide clinic leadership with actionable insights across the entire patient journey.

**Core Capabilities:**
1. **Multi-Source Data Collection:** HubSpot, Cal.com, Stripe, Typeform, Google Sheets
2. **Comprehensive KPI Computation:** 25+ metrics across volume, conversion, revenue, NPS, OCR, engagement
3. **Professional HTML Dashboard:** Responsive, print-friendly, color-coded metrics
4. **Flexible Reporting Periods:** Daily, weekly, monthly, custom periods
5. **Period-over-Period Comparison:** Growth tracking (framework ready)
6. **Automated Distribution:** Email, Slack, S3/GDrive storage (production expansion)

### Why v1.1 Enhanced Matters

The enhanced version transforms basic metric aggregation into a **comprehensive business intelligence system** with:

1. **Flexible Reporting Periods:** Daily/weekly/monthly/custom with timezone awareness
2. **Advanced KPI Computation:** Net Promoter Score, retention rates, funnel analysis
3. **Professional HTML Dashboard:** Executive-ready with color-coded thresholds
4. **Performance Monitoring:** Execution time tracking, data source health
5. **Production Expansion Framework:** Clear paths for parallel API calls, storage, distribution

### Performance Profile

- **Target Execution Time:** <15000ms (15 seconds)
- **P95 Target:** <30000ms
- **Schedule:** Daily at 6 AM (configurable)
- **PHI Level:** NONE (aggregate metrics only - no individual patient data)
- **Dependencies:** Modules 01-06 (data sources)

---

## Architecture Overview

### Analytics Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                MODULE 07: ANALYTICS & REPORTING DASHBOARD            │
│                        (Scheduled Daily)                             │
└─────────────────────────────────────────────────────────────────────┘

TRIGGER
┌──────────────────────┐
│  701: Schedule       │  Daily at 6 AM (configurable)
│  Trigger             │
└──────────────────────┘
         ↓
┌──────────────────────┐
│  702: Initialize     │  - Calculate reporting period
│  Reporting Period    │  - Support daily/weekly/monthly/custom
│                      │  - Timezone awareness
│                      │  - Generate trace_id
│                      │  - Start execution timer
└──────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────────────┐
│            DATA COLLECTION (PRODUCTION: PARALLEL)                    │
│                                                                      │
│  703: Collect & Normalize Data (Consolidated)                       │
│                                                                      │
│  PRODUCTION EXPANSION: Parallel API calls with retry logic         │
│  ├─ HubSpot Contacts API (leads)                                   │
│  ├─ Cal.com Bookings API (appointments)                            │
│  ├─ Stripe Charges API (payments)                                  │
│  ├─ Typeform Responses API (NPS)                                   │
│  └─ Google Sheets (OCR metrics + fallbacks)                        │
│                                                                      │
│  Each with: retryOnFail=true, maxTries=2, continueOnFail=true     │
└──────────────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────┐
│  704: Compute KPIs   │  COMPREHENSIVE METRICS:
│                      │
│                      │  VOLUME:
│                      │  - Total leads, bookings, visits, revenue
│                      │  - No-shows, cancellations
│                      │  - Documents processed
│                      │
│                      │  CONVERSION RATES:
│                      │  - Lead → Booking
│                      │  - Booking → Visit (show rate)
│                      │  - Visit → Payment
│                      │  - Retention rate
│                      │
│                      │  NPS ANALYSIS:
│                      │  - Average score, net score
│                      │  - Promoters, passives, detractors
│                      │  - Segment breakdown
│                      │
│                      │  REVENUE:
│                      │  - Total revenue, avg per patient
│                      │  - Unique paying patients
│                      │
│                      │  OCR PERFORMANCE:
│                      │  - Avg confidence, processing time
│                      │  - By engine, by doc_type
│                      │
│                      │  ENGAGEMENT:
│                      │  - Unique patients, repeat patients
│                      │  - Retention rate
└──────────────────────┘
         ↓
┌──────────────────────┐
│  705: Generate HTML  │  PROFESSIONAL DASHBOARD:
│  Report              │  - Responsive CSS Grid layout
│                      │  - Color-coded metrics (green/yellow/red)
│                      │  - Tables with thresholds
│                      │  - Print-friendly styling
│                      │  - Accessibility features
└──────────────────────┘
         ↓
┌──────────────────────┐
│  706: Execution      │  - Calculate execution time
│  Tracking & Build    │  - Performance categorization
│  Output              │  - Build aggregated_metrics.json
│                      │  - Prepare HTML for storage
└──────────────────────┘
         ↓
┌──────────────────────┐
│  707: Return         │  aggregated_metrics.json
│  Analytics Complete  │  (Data Contract 07)
└──────────────────────┘

OUTPUT (Data Contract 07)
aggregated_metrics.json
  ├─ success: true
  ├─ trace_id
  ├─ period: "2025-10-01 to 2025-10-30"
  ├─ totals: { leads, bookings, visits, revenue, ... }
  ├─ averages: { revenue_per_patient, nps_score, ocr_confidence, ... }
  ├─ rates: { lead_to_booking, show_rate, retention, ... }
  ├─ segments: { promoters, passives, detractors, unique_patients, ... }
  ├─ ocr_breakdown: { by_engine, by_doc_type }
  ├─ growth: { revenue_growth_pct, patient_growth_pct, ... }
  ├─ report_links: { html_report, sheet_url, looker_dashboard }
  └─ metadata: { execution_time_ms, performance_category, ... }

PRODUCTION EXPANSION (Add before Node 707):
  ├─ S3/GDrive Upload (HTML report)
  ├─ Generate Signed URLs
  ├─ Email Distribution (to leadership)
  ├─ Slack Notification (daily summary)
  ├─ Google Sheets Logging (historical trends)
  └─ Looker Studio Export (BI integration)
```

---

## Key Enhancements Beyond Reference

### 1. Flexible Reporting Periods

**Reference Implementation:** Fixed 30-day period

**Enhanced v1.1 Implementation:**

```javascript
// Node 702: Initialize Reporting Period

const periodType = $env.REPORT_PERIOD_TYPE || 'monthly';
const timezone = $env.TIMEZONE || 'America/New_York';
const now = DateTime.now().setZone(timezone);

if (periodType === 'daily') {
  // Yesterday's data
  startDate = now.minus({ days: 1 }).startOf('day');
  endDate = now.minus({ days: 1 }).endOf('day');
}
else if (periodType === 'weekly') {
  // Last 7 days
  startDate = now.minus({ days: 7 }).startOf('day');
  endDate = now.minus({ days: 1 }).endOf('day');
}
else if (periodType === 'monthly') {
  // Last 30 days (default)
  startDate = now.minus({ days: 30 }).startOf('day');
  endDate = now.minus({ days: 1 }).endOf('day');
}
else if (periodType === 'custom') {
  // Custom period from env vars
  const periodDays = parseInt($env.REPORT_PERIOD_DAYS || 30);
  endDate = now.minus({ days: 1 }).endOf('day');
  startDate = now.minus({ days: periodDays }).startOf('day');
}
```

**Configuration:**

```bash
# Environment variables
REPORT_PERIOD_TYPE=monthly  # daily, weekly, monthly, custom
REPORT_PERIOD_DAYS=30       # Used for custom period
TIMEZONE=America/New_York   # Clinic timezone
ANALYTICS_TRIGGER_HOUR=6    # Daily run time (6 AM)
```

**Why This Matters:**
- **Flexibility:** Different reporting needs (daily ops vs monthly exec review)
- **Timezone Accuracy:** Data aligned to clinic hours (not UTC)
- **Customizable:** Easily adjust period length without code changes

---

### 2. Comprehensive KPI Computation

**Reference Implementation:** Basic counts only

**Enhanced v1.1 Implementation:**

**Volume Metrics:**
```javascript
const totalLeads = raw.leads.length;
const totalBookings = raw.bookings.length;
const completedVisits = raw.bookings.filter(b => b.status === 'completed').length;
const totalRevenue = raw.payments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
```

**Conversion Rates:**
```javascript
const leadToBookingRate = totalLeads > 0 ? (totalBookings / totalLeads) : 0;
const showRate = totalBookings > 0 ? (completedVisits / totalBookings) : 0;
const visitToPaymentRate = completedVisits > 0 ? (raw.payments.length / completedVisits) : 0;
```

**NPS Analysis:**
```javascript
const npsScores = raw.nps.map(n => n.nps_score);
const avgNPS = npsScores.reduce((a, b) => a + b, 0) / npsScores.length;

const promoters = npsScores.filter(s => s >= 9).length;
const passives = npsScores.filter(s => s >= 7 && s <= 8).length;
const detractors = npsScores.filter(s => s <= 6).length;

// Net Promoter Score = (% Promoters) - (% Detractors)
const npsNetScore = (((promoters / totalNPS) - (detractors / totalNPS)) * 100);
```

**Revenue Analytics:**
```javascript
const uniquePayingPatients = new Set(raw.payments.map(p => p.email)).size;
const avgRevenuePerPatient = totalRevenue / uniquePayingPatients;
```

**OCR Performance:**
```javascript
const avgOCRConfidence = raw.ocr.reduce((sum, d) => sum + d.confidence, 0) / raw.ocr.length;
const avgProcessingTime = raw.ocr.reduce((sum, d) => sum + d.processing_time_sec, 0) / raw.ocr.length;

// OCR by engine/doc_type breakdown
const ocrByEngine = {};
raw.ocr.forEach(doc => {
  const engine = doc.ocr_engine || 'unknown';
  ocrByEngine[engine] = (ocrByEngine[engine] || 0) + 1;
});
```

**Patient Engagement:**
```javascript
const repeatPatients = raw.bookings.reduce((acc, booking) => {
  acc[booking.email] = (acc[booking.email] || 0) + 1;
  return acc;
}, {});
const repeatPatientsCount = Object.values(repeatPatients).filter(count => count > 1).length;
const retentionRate = uniquePatients > 0 ? (repeatPatientsCount / uniquePatients) : 0;
```

**25+ Metrics Computed:**
1. Total leads
2. Total bookings
3. Completed visits
4. No-shows
5. Cancelled appointments
6. Total revenue
7. NPS responses
8. Documents processed
9. Revenue per patient
10. Average NPS score
11. Net Promoter Score
12. OCR confidence
13. Document processing time
14. Lead-to-booking rate
15. Booking-to-visit rate (show rate)
16. Visit-to-payment rate
17. Retention rate
18. Promoters count
19. Passives count
20. Detractors count
21. Unique patients
22. Repeat patients
23. Unique paying patients
24. OCR by engine breakdown
25. OCR by doc_type breakdown

---

### 3. Professional HTML Dashboard

**Reference Implementation:** Plain text or basic table

**Enhanced v1.1 Implementation:**

**Design Features:**
- Responsive CSS Grid layout (4 columns on desktop, stacks on mobile)
- Color-coded metrics with thresholds:
  - Green (≥70%): Good performance
  - Orange (50-70%): Needs improvement
  - Red (<50%): Critical attention needed
- Print-friendly styling (removes box shadows, optimizes for paper)
- Accessibility: Semantic HTML, ARIA labels ready
- Modern font stack: -apple-system, Roboto, etc.

**Color-Coding Logic:**

```javascript
function getMetricColor(value, type) {
  if (type === 'conversion') {
    if (value >= 0.7) return '#4caf50'; // Green
    if (value >= 0.5) return '#ff9800'; // Orange
    return '#f44336'; // Red
  }
  if (type === 'nps') {
    if (value >= 50) return '#4caf50';  // Excellent
    if (value >= 0) return '#ff9800';   // Good
    return '#f44336'; // Poor
  }
  if (type === 'confidence') {
    if (value >= 0.9) return '#4caf50';  // High confidence
    if (value >= 0.75) return '#ff9800'; // Medium
    return '#f44336'; // Low confidence
  }
  return '#2196f3'; // Default blue
}
```

**Dashboard Sections:**
1. Header with clinic name, period, timestamp
2. Volume Metrics (4-card grid)
3. Conversion Funnel (table with status indicators)
4. Revenue Analytics (2-card grid)
5. NPS Analysis (2-card grid + segment table)
6. OCR Performance (3-card grid)
7. Patient Engagement (4-card grid)
8. Footer with data sources, report ID

**Sample HTML Output:**

```html
<div class="metric-card">
  <div class="metric-label">Lead → Booking Rate</div>
  <div class="metric-value" style="color: #4caf50;">65%</div>
  <div class="metric-status">✓ Good</div>
</div>
```

**Why This Matters:**
- **Executive-Ready:** No post-processing needed - send directly to leadership
- **Visual Hierarchy:** Quick identification of problem areas (red metrics)
- **Print-Friendly:** Can be printed for board meetings
- **Mobile-Responsive:** View on phone/tablet

---

### 4. Production Expansion Framework

**Reference Implementation:** No storage or distribution

**Enhanced v1.1 Implementation:**

**Consolidated Node 703 provides framework for production expansion:**

```javascript
// Framework for data sources
const dataSources = {
  leads: {
    primary: 'hubspot',
    fallback: 'google_sheets',
    retry_config: { maxTries: 2, delay: 1000 }
  },
  bookings: {
    primary: 'calcom',
    fallback: 'google_sheets',
    retry_config: { maxTries: 2, delay: 1000 }
  },
  payments: {
    primary: 'stripe',
    fallback: 'google_sheets',
    retry_config: { maxTries: 2, delay: 1000 }
  },
  nps: {
    primary: 'typeform',
    fallback: 'google_sheets',
    retry_config: { maxTries: 2, delay: 1000 }
  },
  ocr: {
    primary: 'google_sheets',
    fallback: null,
    retry_config: { maxTries: 2, delay: 1000 }
  }
};
```

**Production Expansion Checklist:**

**Data Collection (Replace Node 703):**
- [ ] Add HTTP Request node: HubSpot Contacts API
  - Filter by created_date within period
  - Retry: 2 attempts, 1s delay
  - continueOnFail: true (use fallback if fails)
- [ ] Add Google Sheets node: Leads fallback
- [ ] Add HTTP Request node: Cal.com Bookings API
- [ ] Add Google Sheets node: Bookings fallback
- [ ] Add HTTP Request node: Stripe Charges API
- [ ] Add Google Sheets node: Payments fallback
- [ ] Add HTTP Request node: Typeform Responses API
- [ ] Add Google Sheets node: NPS fallback
- [ ] Add Google Sheets node: OCR metrics (primary source)

**Storage & Distribution (Add after Node 706):**
- [ ] Add AWS S3 node: Upload HTML report
  - Generate signed URL (1-week expiry)
  - Retry: 2 attempts, 2s delay
- [ ] Add Google Drive node: Upload HTML (alternative)
- [ ] Add SendGrid node: Email to leadership@clinic.com
  - Include HTML report as attachment
  - Include summary metrics in body
  - Retry: 2 attempts, 1s delay
- [ ] Add Slack node: Post daily summary
  - Channel: #clinic-analytics
  - Include key metrics + link to full report
- [ ] Add Google Sheets node: Log historical metrics
  - Append row with all KPIs
  - Enables trend analysis over time
- [ ] Add HTTP Request node: Looker Studio webhook
  - Push metrics to BI platform
  - Enable advanced visualizations

**Why This Matters:**
- **Scalability:** Clear path from demo to production
- **Resilience:** Primary + fallback for each data source
- **Distribution:** Automated delivery to stakeholders
- **Historical Tracking:** Trend analysis over weeks/months

---

## Data Contracts & Integration

### Output: Data Contract 07 (aggregated_metrics.json)

**Consumer:** Module 09 (Compliance logging), leadership dashboards, BI tools

**Schema:**

```json
{
  "success": true,
  "trace_id": "ANALYTICS-1730217600000",
  "period": "2025-10-01 to 2025-10-30",
  "period_details": {
    "start": "2025-10-01T00:00:00.000-04:00",
    "end": "2025-10-30T23:59:59.999-04:00",
    "days": 30,
    "type": "monthly"
  },
  "totals": {
    "leads": 150,
    "bookings": 105,
    "completed_visits": 90,
    "no_shows": 10,
    "cancelled": 5,
    "revenue_usd": 22500.00,
    "nps_responses": 75,
    "documents_processed": 200
  },
  "averages": {
    "revenue_per_patient": 250.00,
    "nps_score": 8.3,
    "nps_net_score": 62.0,
    "ocr_confidence": 0.92,
    "doc_processing_time_sec": 5.8
  },
  "rates": {
    "lead_to_booking": 0.70,
    "booking_to_visit": 0.86,
    "visit_to_payment": 1.00,
    "show_rate": 0.86,
    "retention_rate": 0.35
  },
  "segments": {
    "promoters": 55,
    "passives": 15,
    "detractors": 5,
    "unique_patients": 150,
    "repeat_patients": 52,
    "unique_paying_patients": 90
  },
  "ocr_breakdown": {
    "by_engine": {
      "mistral": 180,
      "gemini": 15,
      "tesseract": 5
    },
    "by_doc_type": {
      "lab_result": 80,
      "intake_form": 50,
      "insurance_card": 40,
      "invoice": 30
    }
  },
  "growth": {
    "revenue_growth_pct": null,
    "patient_growth_pct": null,
    "conversion_rate_change": null
  },
  "report_links": {
    "html_report": "https://s3.amazonaws.com/clinic-reports/2025-10-30.html",
    "sheet_url": "https://docs.google.com/spreadsheets/d/...",
    "looker_dashboard": "https://lookerstudio.google.com/..."
  },
  "metadata": {
    "generated_at": "2025-10-31T06:00:00.000-04:00",
    "data_sources": ["Leads", "Bookings", "Payments", "NPS", "OCR"],
    "clinic_name": "Your Clinic",
    "execution_time_ms": 12500,
    "performance_category": "normal",
    "processed_by": "Aigent_Module_07",
    "module": "aigent_module_07",
    "version": "1.1"
  }
}
```

---

## Complete Test Plan

### Unit Tests

#### Test 1: Reporting Period Calculation

**Test Case 1.1: Daily Period**

**Setup:** `REPORT_PERIOD_TYPE=daily`, `TIMEZONE=America/New_York`, Run on 2025-10-31

**Expected:**
- `start: "2025-10-30T00:00:00.000-04:00"`
- `end: "2025-10-30T23:59:59.999-04:00"`
- `days: 1`

**Test Case 1.2: Weekly Period**

**Setup:** `REPORT_PERIOD_TYPE=weekly`, Run on 2025-10-31

**Expected:**
- `start: "2025-10-24T00:00:00.000-04:00"` (7 days ago)
- `end: "2025-10-30T23:59:59.999-04:00"`
- `days: 7`

**Test Case 1.3: Monthly Period (Default)**

**Setup:** No REPORT_PERIOD_TYPE set, Run on 2025-10-31

**Expected:**
- `start: "2025-10-01T00:00:00.000-04:00"` (30 days ago)
- `end: "2025-10-30T23:59:59.999-04:00"`
- `days: 30`

**Test Case 1.4: Custom Period**

**Setup:** `REPORT_PERIOD_TYPE=custom`, `REPORT_PERIOD_DAYS=14`

**Expected:**
- `days: 14`
- Date range covers last 14 days

---

#### Test 2: KPI Computation

**Test Case 2.1: Conversion Rates**

**Input Data:**
- 100 leads
- 70 bookings
- 60 completed visits
- 60 payments

**Expected Rates:**
- `lead_to_booking: 0.70` (70%)
- `booking_to_visit: 0.86` (60/70 = 85.7%)
- `visit_to_payment: 1.00` (100%)
- `show_rate: 0.86` (same as booking_to_visit)

**Test Case 2.2: NPS Calculation**

**Input NPS Scores:**
- 9, 10, 9, 8, 7, 6, 10, 9, 8, 5

**Expected:**
- `avgNPS: 8.1`
- `promoters: 5` (scores 9-10)
- `passives: 3` (scores 7-8)
- `detractors: 2` (scores 0-6)
- `npsNetScore: 30` ((5/10 - 2/10) * 100 = 30)

**Test Case 2.3: Revenue per Patient**

**Input Data:**
- Total revenue: $25,000
- Unique paying patients: 100

**Expected:**
- `avgRevenuePerPatient: 250.00`

---

### Integration Tests

#### Test 3: End-to-End Analytics Generation

**Test Steps:**

```bash
# Step 1: Manually trigger workflow (or wait for scheduled run)
# In n8n UI: Click "Execute Workflow" on Module 07

# Step 2: Verify execution completes
# Expected: HTTP 200, execution_time_ms < 15000

# Step 3: Verify output structure
# Check response includes:
# - totals (all 8 metrics)
# - averages (all 5 metrics)
# - rates (all 5 rates)
# - segments (all 6 segments)
# - ocr_breakdown (by_engine + by_doc_type)
# - report_links (html_report, sheet_url, looker_dashboard)
# - metadata (execution_time_ms, performance_category)

# Step 4: Verify HTML report generated
# Check binary output includes HTML file
# File size > 10KB
# Contains all metric sections

# Step 5: Manual HTML review
# Open HTML in browser
# Verify:
# - All sections render correctly
# - Metrics display with color coding
# - Tables show all data
# - Print layout works
```

**Expected Results:**
- ✅ Execution completes in <15s
- ✅ All 25+ metrics computed
- ✅ HTML report generated (>10KB)
- ✅ Color-coded metrics display correctly
- ✅ Report is print-friendly

---

## Operations Guide

### Daily Monitoring Checklist

- [ ] **Verify Analytics Ran**
  - Check n8n execution history for Module 07
  - Verify execution at scheduled time (6 AM default)
  - Check execution status: success/failure

- [ ] **Review Key Metrics**
  - Check conversion rates (target: ≥60%)
  - Review NPS net score (target: ≥50)
  - Verify OCR confidence (target: ≥90%)
  - Check show rate (target: ≥85%)

- [ ] **Identify Anomalies**
  - Large drops in conversion rates (>10%)
  - Sudden increase in no-shows
  - Revenue significantly below average
  - Low NPS scores (<7.0)

- [ ] **Distribute Report**
  - Production: Verify email sent to leadership
  - Production: Verify Slack notification posted
  - Production: Verify HTML uploaded to S3/GDrive

### Weekly Tasks

- [ ] **Trend Analysis**
  - Compare week-over-week metrics
  - Identify improving/declining trends
  - Calculate 7-day moving averages

- [ ] **Data Source Health**
  - Verify all data sources (HubSpot, Stripe, Cal.com, Typeform, Sheets)
  - Check for missing data or API errors
  - Test fallback data sources

- [ ] **Report Optimization**
  - Review metric thresholds (adjust if needed)
  - Update HTML styling based on feedback
  - Add new metrics requested by leadership

### Monthly Tasks

- [ ] **Executive Review**
  - Present monthly report to leadership
  - Discuss action items based on metrics
  - Set goals for next month

- [ ] **Historical Analysis**
  - Export 30-day, 60-day, 90-day comparisons
  - Create trend charts (Excel/Looker)
  - Document insights and patterns

- [ ] **System Optimization**
  - Review execution time trends
  - Optimize slow data sources
  - Archive old reports (retain per policy)

---

## Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Data source API failure"

**Symptoms:**
- Missing metrics (e.g., no leads data)
- Execution succeeds but some totals = 0

**Root Causes:**
1. API credentials expired
2. API rate limits exceeded
3. Data source returned empty results

**Solutions:**

**Step 1: Check API Health**
```bash
# Test HubSpot API
curl https://api.hubapi.com/crm/v3/objects/contacts \
  -H "Authorization: Bearer $HUBSPOT_API_KEY"

# Test Stripe API
curl https://api.stripe.com/v1/charges \
  -u $STRIPE_API_KEY:

# Test Cal.com API
curl https://api.cal.com/v1/bookings \
  -H "Authorization: Bearer $CALCOM_API_KEY"
```

**Step 2: Verify Fallback Working**
```bash
# Production: Check if fallback Google Sheets loaded
# If primary API fails, fallback should provide data
# Verify "data_sources" in response includes "Google Sheets (fallback)"
```

**Step 3: Extend Retry Logic**
```javascript
// If API is slow/unreliable, increase retry count
{
  "retryOnFail": true,
  "maxTries": 3,  // Increase from 2 to 3
  "waitBetweenTries": 2000  // Increase from 1000 to 2000
}
```

---

#### Issue 2: "Execution time too slow (>30s)"

**Symptoms:**
- `performance_category: "slow"`
- Execution time exceeds 30 seconds

**Root Causes:**
1. Data sources responding slowly
2. Large data volumes (>1000 records)
3. Sequential API calls (not parallel)

**Solutions:**

**Step 1: Identify Slowest Operation**
```bash
# In n8n execution log, check node execution times
# Identify which data source is slowest
```

**Step 2: Implement Parallel Collection**
```javascript
// Replace consolidated Node 703 with parallel nodes
// All data collection should happen simultaneously
// Leads, Bookings, Payments, NPS, OCR - all in parallel
```

**Step 3: Optimize Data Queries**
```bash
# HubSpot: Use filters to reduce data returned
# - Only fetch required fields
# - Filter by date range in API call (not post-processing)

# Stripe: Use pagination efficiently
# - Limit to 100 records per request
# - Only fetch necessary metadata
```

---

This completes the comprehensive build notes for Module 07. The document provides complete technical design, KPI specifications, HTML dashboard design, and operations guidance for production deployment.
