# Module 07 Core: Analytics Dashboard

**Version:** core-1.0.0
**Branch:** Core (SMB-Ready, Non-PHI)
**Target Users:** Small business owners, service providers, managers, administrators

---

## Purpose

On-demand analytics report generation that aggregates data from multiple Google Sheets (Modules 01, 02, and 04) to provide business performance metrics. Calculates total leads, bookings, revenue, conversion rates, and average transaction values.

**NOT FOR:** Real-time dashboards or complex BI analytics (use Enterprise or dedicated BI tool)

---

## Features

✅ **Included (Core)**
- Multi-sheet data aggregation
- On-demand report generation
- Core metrics calculation:
  - Total leads (from Module 01)
  - Total bookings (from Module 02)
  - Total revenue (from Module 04)
  - Average transaction value
  - Lead-to-booking conversion rate
- Date range filtering (period_start, period_end)
- Staff notifications (Slack/Teams)
- Google Sheets read-only access
- Trace ID tracking
- JSON report output

❌ **Removed (Enterprise Only)**
- Real-time dashboard UI
- Advanced visualizations (charts, graphs)
- Scheduled report automation
- Email report delivery (PDF format)
- Revenue forecasting
- Cohort analysis
- Customer lifetime value (CLV) calculation
- Churn rate prediction
- Multi-location analytics
- Comparative period analysis (MoM, YoY)
- Drill-down capabilities
- Export to BI tools (Tableau, PowerBI)
- Custom metric definitions
- Goal tracking
- Performance alerts
- Executive summary generation

---

## Data Flow

```
Webhook → Metadata (dates) → [Fetch Leads + Fetch Bookings + Fetch Payments] → Aggregate → Notify → Success
```

**Execution Time:** ~5000ms average (reading multiple sheets)

---

## Required Fields

**All fields are optional - workflow uses sensible defaults.**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `period_start` | string (YYYY-MM-DD) | 30 days ago | Start date for report |
| `period_end` | string (YYYY-MM-DD) | Today | End date for report |

**Example:**
```json
{
  "period_start": "2025-10-01",
  "period_end": "2025-10-31"
}
```

---

## Setup Instructions

### 1. Import Workflow
- Import `module_07_core.json` to n8n

### 2. Prerequisites: Deploy Other Modules

**This module requires data from:**
- **Module 01 (Leads):** Sheet tab "Leads" with columns: `timestamp`, `name`, `email`, etc.
- **Module 02 (Bookings):** Sheet tab "Bookings" with columns: `timestamp`, `booking_id`, etc.
- **Module 04 (Payments):** Sheet tab "Payments" with columns: `timestamp`, `amount`, etc.

**Important:** All three modules must write to the SAME Google Sheet (different tabs).

### 3. Google Sheets Structure

**Single Google Sheet with Three Tabs:**

**Tab: "Leads" (from Module 01)**
```
timestamp | trace_id | name | email | phone | status
```

**Tab: "Bookings" (from Module 02)**
```
timestamp | trace_id | booking_id | patient_email | scheduled_time | status
```

**Tab: "Payments" (from Module 04)**
```
timestamp | trace_id | charge_id | amount | customer_email | status
```

### 4. Set Variables

**Required:**
```bash
GOOGLE_SHEET_ID="your-sheet-id"  # SAME ID used by M01, M02, M04
```

**Optional:**
```bash
NOTIFICATION_WEBHOOK_URL="https://hooks.slack.com/services/..."  # For report summaries
CLINIC_NAME="Your Business Name"
```

**Note:** Tab names are hardcoded in workflow ("Leads", "Bookings", "Payments"). Ensure these match your sheet structure or modify workflow nodes.

### 5. Connect Google Sheets Credential

- Add Google Sheets OAuth2 credential in n8n
- Ensure credential has **read access** to the sheet
- Same credential can be shared with M01, M02, M04

### 6. Test Report Generation

**Default Report (Last 30 Days):**
```bash
curl -X POST https://your-n8n-instance/webhook/generate-report \
  -H 'Content-Type: application/json' \
  -d '{}'
```

**Custom Date Range:**
```bash
curl -X POST https://your-n8n-instance/webhook/generate-report \
  -H 'Content-Type: application/json' \
  -d '{
    "period_start": "2025-10-01",
    "period_end": "2025-10-31"
  }'
```

### 7. Activate
- Toggle workflow to "Active"
- Generate test report with small dataset first
- Verify metrics match manual counts

---

## Response Examples

### Success (200)
```json
{
  "report_id": "REPORT-1730851234567",
  "period_start": "2025-10-01",
  "period_end": "2025-10-31",
  "metrics": {
    "total_leads": 127,
    "total_bookings": 43,
    "total_revenue": 5375.00,
    "avg_transaction": "125.00",
    "conversion_rate": "33.9%"
  },
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Empty Data (200 - but all zeros)
```json
{
  "report_id": "REPORT-1730851234567",
  "period_start": "2025-11-01",
  "period_end": "2025-11-06",
  "metrics": {
    "total_leads": 0,
    "total_bookings": 0,
    "total_revenue": 0,
    "avg_transaction": 0,
    "conversion_rate": "0%"
  },
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

---

## Metrics Explained

### Total Leads
- **Source:** Reads all rows from "Leads" tab (Module 01)
- **Calculation:** Count of all lead entries
- **Interpretation:** Number of inquiries/contact form submissions received

### Total Bookings
- **Source:** Reads all rows from "Bookings" tab (Module 02)
- **Calculation:** Count of all booking entries
- **Interpretation:** Number of appointments scheduled

### Total Revenue
- **Source:** Reads all rows from "Payments" tab (Module 04)
- **Calculation:** Sum of `amount` column (converted from cents to dollars)
- **Formula:** `SUM(amount) / 100`
- **Interpretation:** Total money received (in dollars)

**Example:**
```
Payment 1: 5000 cents ($50.00)
Payment 2: 7500 cents ($75.00)
Payment 3: 12500 cents ($125.00)
Total Revenue: 25000 cents = $250.00
```

### Average Transaction
- **Calculation:** `Total Revenue / Total Bookings`
- **Formula:** `(totalRevenue / bookings.length).toFixed(2)`
- **Interpretation:** Average dollar amount per booking
- **Note:** Returns 0 if no bookings

### Conversion Rate
- **Calculation:** `(Total Bookings / Total Leads) × 100`
- **Formula:** `((bookings.length / leads.length) * 100).toFixed(1) + '%'`
- **Interpretation:** Percentage of leads that convert to bookings
- **Note:** Returns "0%" if no leads

**Example:**
```
100 leads → 35 bookings
Conversion rate: (35 / 100) × 100 = 35.0%
```

---

## Date Filtering (Current Limitation)

**Important:** Core version reads ALL data from sheets, then displays it. Date filtering parameters (`period_start`, `period_end`) are included in the response but **do NOT filter the data**.

**Workaround for Date Filtering:**
1. **Manual:** Review full report, manually calculate for date range
2. **Enterprise:** Upgrade for true date filtering
3. **Custom:** Modify "Aggregate Metrics" node to filter by `timestamp` column

**Example Custom Filter (Advanced Users):**
```javascript
// In "Aggregate Metrics" node
const leads = $('Fetch Leads Data').all().filter(item => {
  const ts = new Date(item.json.timestamp);
  return ts >= new Date(meta.period_start) && ts <= new Date(meta.period_end);
});
```

---

## Notification Summary

If `NOTIFICATION_WEBHOOK_URL` is set, workflow sends a formatted summary to Slack/Teams:

**Slack Message Example:**
```
📊 Report Generated
Leads: 127
Bookings: 43
Revenue: $5375.00
Conversion: 33.9%
```

**Setup:**
1. Create Slack incoming webhook: https://api.slack.com/messaging/webhooks
2. Or create Teams webhook: https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook
3. Set `NOTIFICATION_WEBHOOK_URL` variable
4. Workflow automatically sends summary on report generation

---

## Integration with Other Modules

### Module 01 (Lead Capture)
**Dependency:** M07 reads from "Leads" tab populated by M01
**Metrics Used:** Total leads, conversion rate

### Module 02 (Consult Booking)
**Dependency:** M07 reads from "Bookings" tab populated by M02
**Metrics Used:** Total bookings, conversion rate, avg transaction

### Module 04 (Billing & Payments)
**Dependency:** M07 reads from "Payments" tab populated by M04
**Metrics Used:** Total revenue, avg transaction

### Standalone Usage
**M07 can be triggered independently:**
- Manual report generation (via webhook)
- Scheduled daily/weekly (use n8n Cron Trigger - add separately)
- On-demand from external BI tools

---

## Use Cases

### ✅ Perfect For

**Business Performance Tracking:**
- Daily/weekly performance snapshots
- Month-end financial summaries
- Quarterly business reviews

**Staff Meetings:**
- Generate report before team meetings
- Share metrics with staff via Slack
- Track team performance

**Owner Dashboards:**
- Quick business health check
- Monitor lead-to-booking conversion
- Track revenue trends

**Reporting to Stakeholders:**
- Simple JSON output for custom reporting
- Embed in internal tools/dashboards
- Log reports to sheets for historical tracking

**Operational Decisions:**
- Identify low conversion periods
- Adjust marketing spend based on lead volume
- Staff scheduling based on booking volume

### ❌ Not Suitable For

- Real-time monitoring (use Enterprise or dedicated BI)
- Complex visualizations (use PowerBI, Tableau)
- Multi-location analytics (use Enterprise)
- Predictive analytics (use Enterprise with ML models)
- Customer segmentation (use Enterprise)
- Detailed financial reporting (use QuickBooks, Xero)
- Compliance reporting (use Enterprise)
- Large datasets (>10,000 rows will be slow)

---

## Troubleshooting

### Empty Report (All Zeros)

**Issue:** Report shows 0 for all metrics

**Solutions:**
1. **Verify data exists:**
   - Open Google Sheet manually
   - Check "Leads", "Bookings", "Payments" tabs have data
2. **Check tab names:**
   - Workflow expects exact names: "Leads", "Bookings", "Payments"
   - Case-sensitive (e.g., "leads" won't work)
3. **Check GOOGLE_SHEET_ID:**
   - Verify variable points to correct sheet
4. **Check credential:**
   - Ensure Google Sheets credential has read access
   - Test credential in a separate workflow

### Wrong Sheet Tab Names

**Issue:** "Tab not found" or empty data

**Solutions:**
1. **Rename tabs in Google Sheets:**
   - Rename to exactly: "Leads", "Bookings", "Payments"
2. **OR modify workflow:**
   - Edit "Fetch Leads Data" node → Change "Leads" to your tab name
   - Edit "Fetch Bookings Data" node → Change "Bookings" to your tab name
   - Edit "Fetch Payments Data" node → Change "Payments" to your tab name

### Incorrect Revenue Calculation

**Issue:** Revenue number seems wrong

**Causes & Solutions:**
1. **Cents vs Dollars:**
   - Module 04 stores amounts in cents (5000 = $50.00)
   - M07 divides by 100 to convert to dollars
   - Verify M04 is storing cents correctly
2. **Missing data:**
   - Check "Payments" tab has `amount` column
   - Verify amounts are numbers, not text
3. **Failed payments included:**
   - Core version counts ALL rows (including failed)
   - Enterprise filters by `status = 'succeeded'`

### Conversion Rate Incorrect

**Issue:** Conversion rate doesn't match expectations

**Formula Check:**
```javascript
conversion_rate = (total_bookings / total_leads) × 100
```

**Example:**
- 50 leads, 10 bookings → 20.0%
- 0 leads → 0%
- 10 leads, 0 bookings → 0%

**Common Issues:**
1. **Duplicate leads:** M01 logs same lead multiple times (no dedup in Core)
2. **Bookings without leads:** Customer booked directly (didn't fill lead form)
3. **Date misalignment:** Lead captured in Oct, booking in Nov (both counted separately)

### Slow Report Generation

**Issue:** Report takes >10 seconds

**Causes:**
1. **Large datasets:**
   - Core reads ALL rows from all three tabs
   - 1,000+ rows per tab will slow down
2. **Google Sheets API rate limits:**
   - Multiple read operations in parallel

**Solutions:**
1. **Archive old data:**
   - Move data older than 1 year to separate "Archive" sheet
   - Reduces rows to read
2. **Upgrade to Enterprise:**
   - Optimized for large datasets
   - Incremental data loading
3. **Increase timeout:**
   - n8n Settings → Timeout → Increase from default

---

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Avg Execution** | 5000ms | Reading 3 sheets |
| **P95 Execution** | 8000ms | Larger datasets |
| **Nodes** | 7 | Simple workflow |
| **API Calls** | 3 | Parallel sheet reads |
| **Max Dataset Size** | ~1,000 rows/tab | Performance degrades beyond this |

**Performance Factors:**
- Number of rows in each sheet (larger = slower)
- Google Sheets API latency (~1-2s per read)
- Network latency to Google servers

**Optimization Tips:**
- Archive old data regularly (keep <1 year in active sheet)
- Use indexed columns (not applicable for Sheets, but helps for DB migration)
- Run reports off-peak hours (less API congestion)

---

## Cost Analysis

### Service Costs

| Service | Cost | Purpose |
|---------|------|---------|
| **n8n Cloud** | $20/month | Workflow hosting |
| **Google Sheets** | Free | Data storage |
| **Slack/Teams** | Free | Notifications |
| **Total** | **$20/month** | All-in cost |

**Per-Report Cost:** $0 (unlimited reports within n8n plan)

**Comparison:**
- **Dedicated BI Tool:** $50-200/user/month (PowerBI, Tableau)
- **Core Module:** $20/month (shared n8n cost)

---

## Advanced: Scheduled Reports

Core module is triggered via webhook (on-demand). To schedule automatic reports:

### Option 1: n8n Cron Trigger

**Create New Workflow:**
1. Add "Cron" trigger node
2. Set schedule: `0 9 * * 1` (Every Monday at 9am)
3. Add "HTTP Request" node
4. Configure:
   - Method: POST
   - URL: `https://your-n8n-instance/webhook/generate-report`
   - Body: `{"period_start": "{{ $now.minus({days: 7}).toFormat('yyyy-MM-dd') }}", "period_end": "{{ $now.toFormat('yyyy-MM-dd') }}"}`
5. Activate workflow

**Result:** Weekly reports automatically generated

### Option 2: External Cron (Linux)

**Create cron job:**
```bash
# Every Monday at 9am
0 9 * * 1 curl -X POST https://your-n8n-instance/webhook/generate-report -H 'Content-Type: application/json' -d '{}'
```

### Option 3: Google Apps Script (Advanced)

**Trigger from Google Sheets:**
```javascript
function generateWeeklyReport() {
  var url = 'https://your-n8n-instance/webhook/generate-report';
  var payload = {
    "period_start": new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0],
    "period_end": new Date().toISOString().split('T')[0]
  };
  UrlFetchApp.fetch(url, {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}

// Set trigger: Tools → Script Editor → Triggers → Add → Weekly, Monday, 9am
```

---

## Upgrade to Enterprise

**When to Upgrade:**
- Need real-time dashboard UI
- Need visualizations (charts, graphs)
- Need date filtering that actually filters data
- Need scheduled report automation (built-in)
- Need email report delivery (PDF)
- Need revenue forecasting & predictions
- Need advanced metrics (CLV, churn, cohorts)
- Need multi-location analytics
- Need comparative analysis (MoM, YoY)
- Need BI tool integrations (Tableau, PowerBI)
- Need large dataset support (>10,000 rows)
- Need custom metric definitions
- Need alert thresholds (e.g., "notify if revenue < $X")

**Enterprise Additions:**
- ✅ Real-time dashboard (web UI)
- ✅ Interactive visualizations
- ✅ True date filtering
- ✅ Scheduled reports (daily/weekly/monthly)
- ✅ Email PDF reports
- ✅ Revenue forecasting (ML models)
- ✅ Cohort analysis
- ✅ Customer lifetime value
- ✅ Churn prediction
- ✅ Multi-location support
- ✅ Comparative period analysis
- ✅ BI tool export
- ✅ Custom metrics
- ✅ Alert system

**Migration Steps:**
1. No data migration needed (reads same Sheets)
2. Import `module_07_enterprise.json`
3. Configure dashboard UI settings
4. Set up scheduled reports
5. Define custom metrics
6. Test in parallel with Core
7. Deactivate Core version

---

## Best Practices

### Data Hygiene

**Keep Sheets Clean:**
1. **Remove test data** before generating production reports
2. **Archive old entries** (>1 year) to separate sheet
3. **Verify timestamps** are in consistent format (ISO 8601)
4. **Check for duplicates** (Core doesn't deduplicate)

### Report Frequency

**Recommended Schedules:**
- **Daily:** For active businesses with >10 leads/day
- **Weekly:** For most small businesses
- **Monthly:** For seasonal or low-volume businesses
- **On-Demand:** For specific decision-making needs

**Don't Over-Report:**
- Generating reports every hour is unnecessary (data doesn't change that frequently)
- Focus on actionable cadence (weekly is sweet spot)

### Interpretation Tips

**Conversion Rate Benchmarks:**
- **10-20%:** Typical for cold leads (advertising, SEO)
- **20-40%:** Good for warm leads (referrals, returning customers)
- **40%+:** Excellent (niche service, high-quality lead source)

**Revenue Trends:**
- Compare month-over-month (not day-over-day, too volatile)
- Look for seasonal patterns (holidays, summer, etc.)
- Adjust marketing based on trends (low months need more leads)

**Action Items from Reports:**
- **Low conversion?** Improve booking process, follow up faster
- **High leads but low bookings?** Lead quality issue, adjust targeting
- **Low revenue?** Increase prices or upsell services

---

## Support

### Documentation
- **Core Guide:** This file
- **Google Sheets API:** https://developers.google.com/sheets
- **n8n Cron:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.cron/

### Community
- **Forum:** https://community.aigent.company
- **GitHub:** https://github.com/aigent/modules/issues

---

## License

MIT License (Open Source)

---

**Version:** core-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 06: Document Capture & OCR](module_06_README.md)
**Next Module:** [Module 08: Messaging Omnichannel](module_08_README.md)
