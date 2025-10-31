# Aigent Testing & Learning Package - Module Transfer Prompt

**Purpose:** Use this prompt in a new Claude Code conversation to create a complete, detailed testing package for a specific Aigent module.

**Instructions:**
1. Copy everything below the line "=== START TRANSFER PROMPT ==="
2. Replace `[MODULE_NUMBER]` and `[MODULE_NAME]` with the specific module
3. Paste into a new Claude Code conversation
4. Claude will create the complete module package with Module 01-level detail

---

## Module Reference Guide

Use these exact values when replacing placeholders:

| Module Number | Module Name | Workflow File |
|--------------|-------------|---------------|
| 02 | Consult_Booking_Scheduling | 02_Consult_Booking/workflow_module_02_enhanced.json |
| 03 | Telehealth_Session | 03_Telehealth_Session/workflow_module_03_enhanced.json |
| 04 | Billing_Payments | 04_Billing_Payments/workflow_module_04_enhanced.json |
| 05 | Followup_Retention | 05_Followup_Retention/workflow_module_05_enhanced.json |
| 06 | Document_Capture_OCR | 06_Document_Capture_OCR/workflow_module_06_enhanced.json |
| 07 | Analytics_Dashboard | 07_Analytics_Dashboard/workflow_module_07_enhanced.json |
| 08 | Messaging_Omnichannel | 08_Messaging_Omnichannel/workflow_module_08_enhanced.json |
| 09 | Compliance_Audit | 09_Compliance_Audit/workflow_module_09_enhanced.json |
| 10 | System_Orchestration_Manager | 10_System_Orchestration_Manager/workflow_module_10_enhanced.json |

---

=== START TRANSFER PROMPT ===

# ROLE
You are the **Master QA Architect and Course Author** for Aigent Company.

Your mission is to create a **complete, beginner-friendly Testing Package** for **Aigent Module [MODULE_NUMBER]: [MODULE_NAME]**.

---

# CONTEXT

## Existing Work Completed

The following files ALREADY EXIST and should be used as references:

**`/Aigent_Testing_Teaching_Pack/00_Shared/`** - Universal materials (DO NOT modify):
- README.md - Package introduction
- Course_Syllabus.md - Learning roadmap
- EnvMatrix.md - Complete environment variable guide
- MockIdentities.json - Test data for all modules
- BugReport_Template.md - Bug documentation guide
- cURL_Snippets.md - Command-line testing examples
- TestData_Generators.js - Random test data generator
- Compliance_Fixtures.json - Audit event test data

**`/Aigent_Testing_Teaching_Pack/01_Intake_Lead_Capture/`** - EXEMPLAR MODULE (use as template):
- TestPlan.md (620 lines) - Step-by-step testing instructions
- TestCases.md (450 lines) - All test cases documented
- Observability.md (500 lines) - Where to look for results
- Troubleshooting.md (600 lines) - Common problems and solutions
- KeyPoints.md (300 lines) - Essential concepts quick reference
- Checklist.md (250 lines) - Testing progress tracker
- MockData/ folder - 3 JSON files with test data

**Module 01 is your TEMPLATE.** Replicate its structure, depth, and beginner-friendly approach.

---

# YOUR TASK

Create a **complete testing package** for **Module [MODULE_NUMBER]: [MODULE_NAME]** with the SAME quality and comprehensiveness as Module 01.

## Source Information

**Read these files for module details:**
1. `[WORKFLOW_FILE_PATH]` - The n8n workflow JSON (read first 200 lines minimum)
2. `[MODULE_NUMBER]_[MODULE_NAME]/module_[MODULE_NUMBER]_build_notes.md` - If exists, read for technical details
3. `[MODULE_NUMBER]_[MODULE_NAME]/README.md` - If exists, read for overview

## Output Location

Create all files in: `/Aigent_Testing_Teaching_Pack/[MODULE_NUMBER]_[MODULE_NAME]/`

---

# STRUCTURE REQUIREMENTS

Create these files (follow Module 01 structure exactly):

## 1. TestPlan.md (~600-700 lines)

**Purpose:** Complete step-by-step testing instructions

**Must include:**
- Welcome section explaining what the module does
- "Before You Begin" prerequisites
- Test Suite Overview (total tests, categories, time estimates)
- Detailed test sections:
  - Happy Path Tests (3-5 tests)
  - Invalid Input Tests (5-7 tests)
  - Integration Tests (2-4 tests)
  - Performance Tests (1-2 tests)
  - Security Tests (1-2 tests)
  - Edge Case Tests (2-4 tests)
- Each test must have:
  - **Purpose:** What this test verifies
  - **Test Data:** Complete JSON payload
  - **cURL Command:** Ready-to-copy command
  - **Steps to Execute:** Numbered instructions
  - **Expected Results:** What you should see (HTTP response, database, notifications, logs)
  - **Pass Criteria:** Checkboxes for verification
  - **Common Mistakes:** What to avoid
  - **Troubleshooting:** Quick fixes
- Observability Checklist (what to verify after each test)
- Common Issues & Solutions section
- Success Criteria summary
- Next Steps section

**Tone:** Beginner-friendly, explain all technical terms, step-by-step clarity

---

## 2. TestCases.md (~400-500 lines)

**Purpose:** Structured reference of all individual test cases

**Must include:**
- Test Case Summary table (category, total, priority breakdown)
- Each test case documented with:
  - TC-ID (e.g., TC-HP-001, TC-INV-001)
  - Name
  - Category (Happy Path, Invalid Input, etc.)
  - Priority (P0-Critical, P1-High, P2-Medium, P3-Low)
  - Description
  - Prerequisites
  - Test Data (complete JSON)
  - Expected HTTP Response
  - Expected Database/Storage Changes
  - Expected Notifications
  - Pass Criteria (checkboxes)
  - Failure Scenarios to check
- Test Execution Tracker (checklist)
- Test Results Summary Template
- Quick Reference: Test Data section

**Format:** Structured tables and lists for easy reference

---

## 3. Observability.md (~500-600 lines)

**Purpose:** Where to look to verify success

**Must include:**
- "What is Observability?" section (beginner-friendly explanation)
- "Why Observability Matters" (real-world scenarios)
- "The Observability Stack" for this module (4+ places to check)
- Detailed sections for each observability source:
  - HTTP Response interpretation
  - Database/Storage verification
  - Notification checking
  - n8n execution log navigation
  - Module-specific dashboards or UIs
- For each source:
  - What it is
  - Where to find it
  - What to look for (good signs, warning signs)
  - How to interpret results
- Observability Checklist (verify after each test)
- Common Observability Questions (Q&A format)
- Pro Tips for monitoring
- Observability Best Practices

**Tone:** Educational, visual descriptions, beginner-accessible

---

## 4. Troubleshooting.md (~600-700 lines)

**Purpose:** Solutions to common problems

**Must include:**
- "How to Use This Guide" section
- Table of Contents (10+ problem categories)
- For each problem category (10-15 categories minimum):
  - **Problem:** Clear symptom description
  - **Likely causes:** 3-5 possible reasons
  - **Solutions:** Step-by-step fixes (Solution 1, Solution 2, etc.)
  - **Code examples** where applicable
  - **Screenshots descriptions** where helpful
- Problem categories must include:
  - Webhook/API Issues
  - Validation Errors
  - Database/Storage Problems
  - Notification Failures
  - Performance Issues
  - Integration Errors
  - Environment Variable Issues
  - Module-specific issues (based on module functionality)
- "Still Stuck?" section (escalation path)
- Quick Reference: Error Codes table
- Common error messages with explanations

**Format:** Problem → Cause → Solution structure, easy to scan

---

## 5. KeyPoints.md (~300-400 lines)

**Purpose:** Quick reference for essential concepts

**Must include:**
- "What This Module Does" (one sentence + why it matters)
- "Core Functionality" (numbered list of main features)
- "Key Concepts" section (5-7 concepts):
  - Each concept explained in plain language
  - Real-world analogy
  - Why it matters
  - How to test it
- "Critical Reminders" (Testing, Security, Data Quality, Performance)
- "Testing Checklist (Quick)" (before, during, after)
- "Success Metrics" (table with targets)
- "Data Flow" (simple ASCII diagram)
- "Integration Points" (receives from, sends to, triggers)
- "Environment Variables (Key)" (top 5-7 most important)
- "Mastery Checklist" (skills you should have)
- "Common Misconceptions" (myth vs. reality)
- "Pro Tips" (5+ practical tips)

**Tone:** Concise, scannable, reference-friendly

---

## 6. Checklist.md (~250-300 lines)

**Purpose:** Printable testing progress tracker

**Must include:**
- "How to Use This Checklist" instructions
- Pre-Testing Setup checklist
- Test tracking tables for each category:
  - Test ID | Test Name | Status | Result | Notes columns
  - Pass/Fail checkboxes
  - Space for notes
- Category-specific tables:
  - Happy Path Tests
  - Invalid Input Tests
  - Integration Tests
  - Performance Tests
  - Security Tests
  - Edge Case Tests
- Observability Checks section
- Final Summary:
  - Overall Results table
  - Pass/Fail Criteria
  - Overall Status
- Issues Found section (numbered list)
- Performance Notes section
- Security Notes section
- Next Steps section
- Sign-Off section (signatures, approval)
- Appendix: Quick Test Data Reference

**Format:** Tables, checkboxes, form-like structure

---

## 7. MockData/ Folder

Create 3 JSON files:

### happy_path_data.json
- Valid test data for happy path tests
- 3-5 complete examples
- cURL examples included
- Expected results documented

### invalid_data.json
- Invalid test data for error handling
- Covers all validation scenarios
- Expected errors documented
- cURL examples included

### edge_cases.json
- Unusual but valid scenarios
- International data
- Boundary conditions
- Special characters
- cURL examples included

Each JSON file must include:
- `_description` field
- `_usage` field
- `_expected` or `_note` field
- `curl_examples` object with ready-to-use commands

---

# CONTENT QUALITY STANDARDS

## Beginner Accessibility

**Assume the reader:**
- Has never done software testing before
- Doesn't know technical terminology
- Needs step-by-step guidance
- Benefits from real-world analogies

**Therefore:**
- Define ALL technical terms on first use
- Explain "why" before "how"
- Use simple, short sentences
- Provide visual descriptions ("You should see a green checkmark...")
- Include "Common Mistakes" sections
- Offer troubleshooting inline

## Examples from Module 01

**Good definition (from Module 01):**
> **Webhook:** A special URL that receives data when someone submits a form. Like a mailbox — people can drop letters in, you check it periodically to see what arrived.

**Good instruction (from Module 01):**
> 1. Open your terminal/command prompt
> 2. Copy this cURL command and replace `YOUR-WEBHOOK-URL` with your actual webhook URL
> 3. Paste the command into your terminal and press Enter
> 4. Wait 2-5 seconds for the response

**Good expected result (from Module 01):**
> You should see a green "Execution Successful" box appear in the top-right corner of n8n within 5 seconds. If you see a red "Error" label instead, it means one of your environment variables is missing.

## Test Coverage

**Each module must test:**
1. **Happy Path** - Everything works correctly
2. **Invalid Inputs** - Bad or missing data
3. **System Failures** - API or integration errors
4. **Edge Cases** - Unusual but valid scenarios
5. **Security** - PHI masking, data protection
6. **Performance** - Speed and efficiency
7. **Integration** - Connections to external systems
8. **Recovery** - Retry and error handling
9. **Compliance** - HIPAA logging where applicable

**Minimum test count:** 15-20 comprehensive test cases per module

---

# MODULE-SPECIFIC GUIDANCE

## Module 02: Consult Booking & Scheduling

**Key testing areas:**
- Appointment validation (date, time, required fields)
- Calendar integration (Google Calendar, Cal.com)
- Double-booking prevention
- Timezone handling
- Email confirmations (with .ics attachment)
- SMS confirmations (Twilio)
- Conflict detection and alternative time suggestions

**Critical tests:**
- Book valid appointment
- Prevent double-booking
- Handle timezone conversions
- Deliver confirmations (email + SMS)
- Validate past date rejection

**Integrations to test:**
- Google Calendar / Cal.com
- SendGrid (email)
- Twilio (SMS)
- Google Sheets (appointment log)

---

## Module 03: Telehealth Session

**Key testing areas:**
- Video platform integration (Zoom, Doxy.me, Amwell)
- PHI masking (Level 2)
- Session link generation
- Session expiration logic
- Provider privacy controls
- Waiting room configuration (HIPAA requirement)

**Critical tests:**
- Generate Zoom meeting link
- Generate Doxy.me link
- Verify PHI masking in logs
- Test session expiration
- Verify provider-only links separate from patient links

**Integrations to test:**
- Zoom API
- Doxy.me API
- Amwell API (if configured)
- Email delivery (session links)

---

## Module 04: Billing & Payments

**Key testing areas:**
- Stripe integration
- Payment processing (success, failure)
- PCI-DSS compliance (credit card masking)
- Invoice generation
- Receipt delivery
- Refund processing
- Failed payment retry logic

**Critical tests:**
- Process successful payment (test card 4242...)
- Handle declined payment (test card 4000000000000002)
- Verify credit card masking in logs
- Test invoice email delivery
- Process partial payment

**Integrations to test:**
- Stripe API
- Email delivery (receipts)
- Google Sheets (payment log)

---

## Module 05: Follow-Up & Retention

**Key testing areas:**
- Multi-touch sequence (Day 0, 3, 7, 14)
- Wait nodes (72h, 96h, 168h delays)
- Email delivery
- SMS delivery
- Engagement tracking
- Dynamic link generation (UTM tracking)
- Graceful SMS handling (opt-outs)

**Critical tests:**
- Day 0 touchpoint delivery
- Wait node timing verification
- Email + SMS delivery
- Engagement tracking accuracy
- Handle SMS opt-out

**Integrations to test:**
- SendGrid (email)
- Twilio (SMS)
- Google Sheets (engagement log)

---

## Module 06: Document Capture & OCR

**Key testing areas:**
- Multi-source document ingestion (webhook, S3, Google Drive, email)
- Security validation (file size, type, directory traversal)
- OCR engine orchestration (Mistral, Gemini, ABBYY, Tesseract)
- Document-type classification (9 types)
- PHI redaction (Level 3 - comprehensive)
- OCR quality assurance

**Critical tests:**
- Upload valid document (PDF, JPG, PNG)
- Test each OCR engine
- Verify document classification
- Verify PHI redaction (SSN, credit card, email)
- Test file size validation (prevent DoS)

**Integrations to test:**
- S3 storage
- Mistral AI OCR
- Gemini AI OCR
- ABBYY Cloud OCR
- Tesseract OCR

---

## Module 07: Analytics & Reporting Dashboard

**Key testing areas:**
- Flexible reporting periods (daily, weekly, monthly, custom)
- KPI computation (25+ metrics)
- Color-coded metrics
- HTML dashboard generation
- NPS calculation
- Conversion rate analysis
- Revenue analytics

**Critical tests:**
- Generate daily report
- Generate weekly report
- Verify KPI calculations
- Test color-coded thresholds
- Verify NPS computation

**Integrations to test:**
- Google Sheets (data source)
- Email delivery (dashboard)

---

## Module 08: Messaging Omnichannel

**Key testing areas:**
- Multi-channel normalization (SMS, WhatsApp, Email, Telegram, Webchat)
- Intent classification (booking, billing, urgent, support)
- Priority detection
- Business hours awareness
- Auto-response generation

**Critical tests:**
- Receive SMS message
- Classify intent correctly
- Detect urgent messages
- Generate appropriate auto-response
- Route to correct queue

**Integrations to test:**
- Twilio (SMS)
- WhatsApp API
- Email
- Telegram Bot API

---

## Module 09: Compliance & Audit Logging

**Key testing areas:**
- HIPAA-compliant PHI masking
- Tamper-evident hash chain (SHA-256)
- Multi-backend storage (PostgreSQL, Sheets, Airtable, S3)
- Intelligent alerting (5 conditions)
- 7-year retention policy
- Hash chain verification

**Critical tests:**
- Log audit event
- Verify PHI masking
- Test hash chain integrity
- Trigger alert conditions
- Verify tamper detection

**Integrations to test:**
- PostgreSQL (if configured)
- Google Sheets
- Airtable (if configured)
- S3 (if configured)

---

## Module 10: System Orchestration & Manager Dashboard

**Key testing areas:**
- Health checks (all modules)
- Synthetic test execution
- Dashboard visibility
- Alert aggregation
- System status monitoring
- Cross-module data flow

**Critical tests:**
- Run health check on all modules
- Execute synthetic patient journey
- Verify dashboard updates
- Test alert aggregation

**Integrations to test:**
- All modules (health check endpoints)
- Dashboard UI

---

# EXECUTION INSTRUCTIONS

## Step 1: Read Source Files

Read these files to understand the module:

```
1. Read: [WORKFLOW_FILE_PATH] (first 200 lines minimum)
2. Read: [MODULE_PATH]/module_[MODULE_NUMBER]_build_notes.md (if exists)
3. Read: [MODULE_PATH]/README.md (if exists)
4. Review: /Aigent_Testing_Teaching_Pack/01_Intake_Lead_Capture/ (all files for template reference)
```

## Step 2: Create Directory Structure

```bash
mkdir -p Aigent_Testing_Teaching_Pack/[MODULE_NUMBER]_[MODULE_NAME]/MockData
```

## Step 3: Create Files in Order

Create files in this sequence:

1. TestPlan.md (most important - create first)
2. TestCases.md
3. Observability.md
4. Troubleshooting.md
5. KeyPoints.md
6. Checklist.md
7. MockData/happy_path_data.json
8. MockData/invalid_data.json
9. MockData/edge_cases.json

## Step 4: Quality Check

Before completing, verify:

- [ ] All files follow Module 01 structure
- [ ] Beginner-friendly language throughout
- [ ] All technical terms defined
- [ ] Test count: 15-20 comprehensive tests minimum
- [ ] cURL commands are ready-to-use
- [ ] Expected results are clearly described
- [ ] MockData files include curl_examples
- [ ] No real credentials or PHI in examples
- [ ] File headers identify module and version

---

# VALIDATION CHECKLIST

After creating all files, verify:

**Content Quality:**
- [ ] Every technical term explained on first use
- [ ] Step-by-step instructions for every test
- [ ] Expected results describe WHAT YOU SHOULD SEE
- [ ] Common mistakes section in each test
- [ ] Real-world analogies for complex concepts

**Completeness:**
- [ ] 7 core files created
- [ ] 3 MockData JSON files created
- [ ] 15-20 test cases documented minimum
- [ ] All test categories covered (Happy Path, Invalid, Integration, Performance, Security, Edge)

**Consistency:**
- [ ] Follows Module 01 structure
- [ ] Same tone and accessibility level
- [ ] File lengths similar to Module 01 (±20%)
- [ ] Test case IDs follow convention (TC-HP-001, TC-INV-001, etc.)

**Module-Specific:**
- [ ] Addresses module's unique functionality
- [ ] Tests all integrations specific to this module
- [ ] Covers security/compliance requirements
- [ ] Includes module-specific edge cases

---

# SUCCESS CRITERIA

The module testing package is complete when:

1. **All 10 files exist** (7 markdown + 3 JSON)
2. **Total lines ≥ 3,000** (comparable to Module 01)
3. **Test coverage ≥ 15 test cases**
4. **Beginner can follow** without prior knowledge
5. **Ready to use** - all cURL commands work with placeholder replacement

---

# FINAL NOTE

**Quality over speed.** Take the time to:
- Explain concepts thoroughly
- Provide complete examples
- Anticipate beginner questions
- Include visual descriptions
- Document edge cases
- Make it genuinely helpful

**Remember:** This documentation teaches someone who has NEVER done software testing. Every step matters.

---

# BEGIN WORK

Now create the complete testing package for:

**Module [MODULE_NUMBER]: [MODULE_NAME]**

Start by reading the workflow file and build notes, then create all files following the structure above.

=== END TRANSFER PROMPT ===

---

## Usage Example

**To create Module 02 testing package:**

1. Copy everything from "=== START TRANSFER PROMPT ===" to "=== END TRANSFER PROMPT ==="
2. Replace:
   - `[MODULE_NUMBER]` → `02`
   - `[MODULE_NAME]` → `Consult_Booking_Scheduling`
   - `[WORKFLOW_FILE_PATH]` → `02_Consult_Booking/workflow_module_02_enhanced.json`
   - `[MODULE_PATH]` → `02_Consult_Booking`
3. Paste into new Claude Code conversation
4. Claude will create the complete package

---

## Notes

- Each module takes approximately 100k-150k tokens to complete with this level of detail
- Start with Module 02 to ensure consistency
- Proceed through modules 03-10 in order
- Each conversation produces one complete module
- All work is saved to disk automatically

---

**This prompt ensures every module gets Module 01-level quality and comprehensiveness!** 🎯
