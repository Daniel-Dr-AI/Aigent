# Module 06 Core: Document Capture & OCR

**Version:** core-1.0.0
**Branch:** Core (SMB-Ready, Non-PHI)
**Target Users:** Service providers, retail businesses, accounting firms, legal offices, small businesses

---

## Purpose

Automated document processing workflow that downloads documents from URLs, extracts text via OCR (Optical Character Recognition), and parses common fields like names, dates, and amounts. Perfect for processing invoices, receipts, forms, and contracts.

**NOT FOR:** Medical records or PHI-containing documents (use Enterprise version)

---

## Features

✅ **Included (Core)**
- Document download from URL
- Google Cloud Vision OCR (text extraction)
- Basic field extraction (name, date, amount)
- Regex pattern matching
- Full text capture
- Google Sheets logging
- Trace ID tracking
- Non-blocking error handling

❌ **Removed (Enterprise Only)**
- Medical document classification
- HIPAA-compliant PHI extraction
- Multi-page PDF processing
- Advanced AI-powered field detection
- Custom extraction templates
- Document validation against schemas
- Confidence scoring
- Human-in-the-loop review workflow
- Document type classification (invoice vs receipt)
- Multi-language OCR
- Handwriting recognition
- Table extraction
- S3/cloud storage integration
- Batch processing
- Webhook callbacks on completion

---

## Data Flow

```
Webhook → Metadata → Validate URL → Download → OCR (Google Vision) → Extract Fields → Sheets → Success
             ↓
           Error (400)
```

**Execution Time:** ~3000ms average (Google Vision API latency)

---

## Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `file_url` | string (URL) | not empty, accessible file |

**Optional Fields:**
- None (minimal input for simplicity)

---

## Setup Instructions

### 1. Import Workflow
- Import `module_06_core.json` to n8n

### 2. Create Google Cloud Vision Account (REQUIRED)

**This module CANNOT work without Google Cloud Vision API.**

1. **Create Google Cloud Project:**
   - Go to https://console.cloud.google.com
   - Create new project or select existing

2. **Enable Cloud Vision API:**
   - Navigate to "APIs & Services" → Library
   - Search "Cloud Vision API"
   - Click "Enable"

3. **Create Service Account:**
   - Go to "APIs & Services" → Credentials
   - Click "Create Credentials" → Service Account
   - Download JSON key file

4. **Add to n8n:**
   - Settings → Credentials → New Credential
   - Type: "Google Cloud Vision API"
   - Upload JSON key file
   - Save

**Cost:** Google Cloud Vision charges **$1.50 per 1,000 images** (first 1,000/month free)

### 3. Connect Google Sheets

Create sheet with columns:
```
timestamp | document_id | file_url | ocr_text | extracted_name | extracted_date | extracted_amount
```

**Note:** `ocr_text` column will contain first 500 characters only (to avoid cell size limits)

### 4. Set Variables

**Required:**
```bash
GOOGLE_SHEET_ID="your-sheet-id"
```

**Optional:**
```bash
GOOGLE_SHEET_TAB="Documents"  # Default tab name
```

### 5. Test with Sample Document

**Sample Invoice URL (free test image):**
```
https://raw.githubusercontent.com/tesseract-ocr/docs/master/invoice-sample.png
```

```bash
curl -X POST https://your-n8n-instance/webhook/document-upload \
  -H 'Content-Type: application/json' \
  -d '{
    "file_url": "https://example.com/invoice.png"
  }'
```

### 6. Supported File Formats

**Images:**
- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)
- TIFF (.tif, .tiff)

**Documents:**
- PDF (single-page only in Core - first page extracted)

**File Size Limit:** 20MB per file (Google Vision limit)

**Note:** For multi-page PDFs, only the first page is processed. Use Enterprise for full PDF processing.

### 7. Activate
- Toggle workflow to "Active"
- Test with a sample document first
- Monitor Google Cloud Console for API usage

---

## Response Examples

### Success (200)
```json
{
  "document_id": "DOC-1730851234567",
  "file_url": "https://example.com/invoice.png",
  "ocr_text": "INVOICE\nDate: 11/06/2025\nName: John Smith\nAmount: $150.00\n...",
  "extracted": {
    "name": "John Smith",
    "date": "11/06/2025",
    "amount": "$150.00"
  },
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Provide file_url",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

### Download Failed (500)
```json
{
  "success": false,
  "error": "Failed to download file from URL",
  "timestamp": "2025-11-06T12:34:56.789Z"
}
```

---

## Field Extraction Logic

### Automatic Extraction Patterns

The workflow uses regex patterns to extract common fields:

**Name Extraction:**
```regex
/name[:\s]+([a-zA-Z\s]+)/i
```
- Looks for "name:" or "Name:" followed by letters and spaces
- Example: "Name: John Smith" → "John Smith"

**Date Extraction:**
```regex
/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/
```
- Matches common date formats
- Examples:
  - 11/06/2025
  - 11-06-25
  - 1/6/2025

**Amount Extraction:**
```regex
/\$?([\d,]+\.?\d*)/
```
- Matches dollar amounts with optional $ symbol
- Examples:
  - $150.00
  - $1,250.50
  - 50.99

### Customizing Extraction

To extract additional fields or modify patterns:

1. Open workflow in n8n
2. Navigate to "Extract Fields" node (Code node)
3. Add new regex patterns:
```javascript
const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
```

---

## Understanding OCR Results

### Full Text Output

Google Cloud Vision returns the entire document text as a single string:
```
INVOICE

Date: 11/06/2025
Customer Name: Jane Doe
Amount Due: $275.50

Thank you for your business!
```

### Confidence Scores (Not Included in Core)

Google Vision provides confidence scores (0-1) for OCR accuracy, but Core version doesn't expose these. For confidence-based filtering, upgrade to Enterprise.

### Common OCR Issues

**1. Low-Quality Images:**
- **Issue:** Blurry or low-resolution images produce poor OCR results
- **Solution:** Ensure images are at least 300 DPI, well-lit, high-contrast

**2. Handwritten Text:**
- **Issue:** Google Vision struggles with cursive handwriting
- **Solution:** Use printed/typed documents, or upgrade to Enterprise for specialized handwriting OCR

**3. Non-English Text:**
- **Issue:** Core doesn't specify language hints
- **Solution:** Works for most languages automatically, but accuracy varies

**4. Complex Layouts:**
- **Issue:** Multi-column documents may have scrambled text order
- **Solution:** Use Enterprise for layout-aware extraction

---

## Integration with Other Modules

### Module 04 (Billing & Payments)

**Flow:** Document Upload (M06) → Extract Invoice → Charge Customer (M04)

**Use Case:** Process invoice, extract amount, create Stripe charge

**Data Passed:**
```json
{
  "amount": 15000,  // Extracted $150.00 → 15000 cents
  "customer_email": "extracted from document",
  "description": "Invoice from document DOC-1730851234567"
}
```

### Module 01 (Lead Capture)

**Flow:** Lead submits document → OCR extracts info → Log as lead

**Use Case:** Contact forms with uploaded ID cards, business cards

### Module 09 (Audit Log)

**Flow:** Document processed → Log audit event

**Use Case:** Track all document processing for compliance

**Data Passed:**
```json
{
  "event_type": "document_processed",
  "user_id": "system",
  "resource_id": "DOC-1730851234567",
  "action": "ocr_extract",
  "details": "Extracted name, date, amount from invoice"
}
```

---

## Use Cases

### ✅ Perfect For

**Invoices & Receipts:**
- Vendor invoices → Extract amount, date, vendor name
- Customer receipts → Log for accounting
- Expense reports → Extract transaction details

**Forms:**
- Application forms → Extract applicant info
- Survey responses (printed) → Digitize data
- Registration forms → Capture participant details

**Legal Documents:**
- Contracts → Extract parties, dates, amounts
- Agreements → Archive with searchable text
- Letters → Convert to digital records

**Business Cards:**
- Scan cards → Extract name, phone, email
- Networking events → Digitize contacts

**General Documents:**
- Letters → Archive with searchable text
- Certificates → Extract names, dates, credentials
- Shipping labels → Extract tracking numbers

### ❌ Not Suitable For

- Medical records (use Enterprise with HIPAA compliance)
- PHI-containing documents (use Enterprise)
- Multi-page PDFs (use Enterprise)
- Complex tables/spreadsheets (use Enterprise)
- Handwritten notes (accuracy poor, use Enterprise)
- Multi-language documents requiring specific language models (use Enterprise)
- High-volume batch processing (use Enterprise)
- Documents requiring human review/validation (use Enterprise)

---

## Troubleshooting

### Google Vision API Errors

**Issue:** "Invalid API key" or "Permission denied"

**Solutions:**
1. **Verify credential in n8n:**
   - Settings → Credentials → Find Google Cloud Vision credential
   - Test credential
2. **Check API enabled:**
   - Google Cloud Console → APIs & Services → Dashboard
   - Verify "Cloud Vision API" shows in enabled APIs
3. **Check service account permissions:**
   - IAM & Admin → Service Accounts
   - Ensure account has "Cloud Vision API User" role
4. **Quota exceeded:**
   - Console → APIs & Services → Quotas
   - Check daily request limit (1,000 free/month)

### Download Failed

**Issue:** "Failed to download file from URL"

**Solutions:**
1. **Verify URL is accessible:**
   - Try opening URL in browser
   - Ensure URL is publicly accessible (no authentication required)
2. **Check file format:**
   - Must be image (PNG, JPG) or PDF
   - File extension should match actual format
3. **Large files:**
   - Google Vision limit: 20MB
   - Compress or resize image
4. **HTTPS required:**
   - Some servers reject HTTP requests
   - Use HTTPS URLs when possible

### No Text Extracted

**Issue:** OCR completes but `ocr_text` is empty

**Solutions:**
1. **Check image quality:**
   - Image must have readable text
   - Minimum 300 DPI recommended
   - Good contrast between text and background
2. **File is blank:**
   - Verify file actually contains text/content
3. **Wrong file type:**
   - Ensure file is document/image, not executable or data file

### Field Extraction Fails

**Issue:** `extracted.name`, `extracted.date`, or `extracted.amount` is null

**Cause:** Regex patterns didn't match document structure

**Solutions:**
1. **Check raw OCR text:**
   - Review `ocr_text` in Google Sheets
   - Identify actual text patterns
2. **Adjust regex patterns:**
   - Modify "Extract Fields" node code
   - Test new patterns with sample text
3. **Document format mismatch:**
   - Extraction works best with standard invoice/receipt formats
   - Custom documents may require custom patterns

**Example Custom Pattern:**
```javascript
// In "Extract Fields" node
const invoiceNumberMatch = text.match(/invoice\s*#?\s*(\d+)/i);
const vendorMatch = text.match(/vendor[:\s]+(.+)/i);
```

### Sheets Not Updating

**Issue:** OCR successful but not logged to Sheets

**Solutions:**
1. Verify `GOOGLE_SHEET_ID` is correct
2. Check tab name matches `GOOGLE_SHEET_TAB` (default: "Documents")
3. Ensure column headers match exactly (case-sensitive)
4. Check Google Sheets credential has write access
5. Review "Log to Sheets" node in execution logs

---

## Performance

| Metric | Core | Enterprise |
|--------|------|------------|
| Avg Execution | 3000ms | 4500ms |
| P95 Execution | 5000ms | 8000ms |
| Nodes | 8 | 18 |
| Max File Size | 20MB | 50MB (chunked) |
| Max Pages | 1 (first page only) | Unlimited |

**Why 3000ms?**
- Google Vision API responds in ~2500ms
- Download time: ~300ms
- Field extraction: ~100ms
- Sheets logging: ~100ms

**Performance Tips:**
- Use compressed images (smaller = faster download)
- PNG/JPEG preferred over TIFF (smaller file size)
- Host files on fast CDN (reduces download time)

---

## Cost Analysis

### Google Cloud Vision Pricing

| Volume | Cost per 1,000 Images | Monthly Cost (Example) |
|--------|----------------------|------------------------|
| **First 1,000** | Free | $0 |
| **1,001 - 5,000,000** | $1.50 | $6 (for 5,000) |
| **5,000,001+** | $0.60 | $600 (for 1,000,000) |

**Official Pricing:** https://cloud.google.com/vision/pricing

### Example Costs

**Scenario 1: 50 invoices/month**
- Volume: 50 images
- **Cost:** $0 (within free tier)

**Scenario 2: 500 receipts/month**
- Volume: 500 images
- **Cost:** $0 (within free tier)

**Scenario 3: 2,000 documents/month**
- Volume: 2,000 images
- Free tier: 1,000 images
- Paid: 1,000 images × $1.50/1000 = $1.50
- **Cost:** $1.50/month

**Scenario 4: 10,000 forms/month**
- Volume: 10,000 images
- Free tier: 1,000 images
- Paid: 9,000 images × $1.50/1000 = $13.50
- **Cost:** $13.50/month

### Total Monthly Cost (Example: 5,000 docs/month)

| Component | Cost | Notes |
|-----------|------|-------|
| **Google Vision** | $6.00 | 5,000 images/month |
| n8n Cloud | $20.00 | Workflow hosting |
| Google Sheets | Free | Document logs |
| **Total** | **$26/month** | ~$0.005/document |

---

## Upgrade to Enterprise

**When to Upgrade:**
- Need medical document processing (HIPAA compliance)
- Need multi-page PDF processing
- Need advanced AI field extraction (ML models)
- Need document classification (invoice vs receipt auto-detection)
- Need confidence scoring/validation
- Need human review workflows
- Need custom extraction templates
- Need batch processing (100+ docs at once)
- Need S3/cloud storage integration
- Need table/spreadsheet extraction
- Need multi-language optimization

**Enterprise Additions:**
- ✅ HIPAA-compliant PHI masking
- ✅ Multi-page PDF processing
- ✅ Advanced AI extraction (GPT-4 Vision)
- ✅ Document type classification
- ✅ Confidence scores & validation
- ✅ Human-in-the-loop review
- ✅ Custom extraction templates
- ✅ Table extraction
- ✅ Batch processing
- ✅ S3/cloud storage integration
- ✅ Multi-language optimization
- ✅ Handwriting recognition

**Migration Steps:**
1. Export document logs from Core Sheets
2. Import `module_06_enterprise.json`
3. Configure additional services (S3, etc.)
4. Set up extraction templates
5. Test in parallel
6. Switch webhook URLs
7. Deactivate Core version

---

## Security Considerations

### Current Security Level: Basic

**Included:**
- ✅ HTTPS encryption (n8n enforces)
- ✅ Google Cloud secure API
- ✅ Service account authentication
- ✅ Google Sheets access control

**Not Included (Enterprise Only):**
- ❌ PHI masking
- ❌ HIPAA compliance
- ❌ Document encryption at rest
- ❌ Role-based access control
- ❌ Audit trail logging
- ❌ Data retention policies

**Recommendations:**
1. **Don't process PHI or medical documents** (use Enterprise)
2. **Restrict Google Sheets access** to authorized personnel only
3. **Use private file URLs** (not publicly shared links)
4. **Enable Google Cloud audit logs** (track API usage)
5. **Review extracted data regularly** for sensitive info leakage
6. **Delete documents** after processing (Core doesn't store files)

### Data Privacy

**What's Stored:**
- ✅ Document URL (in Google Sheets)
- ✅ OCR text (first 500 chars in Sheets)
- ✅ Extracted fields (name, date, amount)

**What's NOT Stored:**
- ❌ Original file (downloaded temporarily, then discarded)
- ❌ Full OCR text (truncated to 500 chars for Sheets)
- ❌ Google Vision API logs (stored by Google for 30 days)

**Data Flow:**
1. File URL provided → n8n downloads → OCR via Google → Extract → Log to Sheets → File discarded
2. Google stores API logs for 30 days (Google's retention policy)
3. Google Sheets data persists until manually deleted

---

## Best Practices

### Image Quality

**For Best OCR Results:**
1. **Resolution:** Minimum 300 DPI (dots per inch)
2. **Contrast:** High contrast between text and background
3. **Lighting:** Even lighting, no shadows
4. **Orientation:** Upright text (not rotated)
5. **Format:** PNG or JPEG preferred

**Poor Results:**
- Blurry or low-resolution images
- Shadows or uneven lighting
- Rotated or skewed text
- Handwritten text (cursive especially)

### Document Preparation

**Before Uploading:**
1. **Scan at 300+ DPI** if using scanner
2. **Crop unnecessary borders** (reduces file size)
3. **Convert to PNG/JPEG** from other formats
4. **Ensure text is readable** to human eye (if you can't read it, OCR can't either)

### URL Hosting

**Recommended:**
- Cloud storage: AWS S3, Google Cloud Storage, Azure Blob
- CDN: Cloudflare, Fastly
- Secure file hosting: Dropbox, Google Drive (with public link)

**Not Recommended:**
- Temporary/expiring URLs (will fail if link expires during processing)
- Password-protected files (Core doesn't support authentication)
- Very slow servers (will increase execution time)

---

## Support

### Documentation
- **Core Guide:** This file
- **Google Vision Docs:** https://cloud.google.com/vision/docs
- **OCR Best Practices:** https://cloud.google.com/vision/docs/ocr

### Community
- **Forum:** https://community.aigent.company
- **GitHub:** https://github.com/aigent/modules/issues
- **Google Cloud Support:** https://cloud.google.com/support

---

## License

MIT License (Open Source)

---

**Version:** core-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 05: Follow-up & Retention](module_05_README.md)
**Next Module:** [Module 07: Analytics Dashboard](module_07_README.md)
