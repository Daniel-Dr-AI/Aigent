# Environment Variables Setup Instructions

**Purpose:** Step-by-step guide to locate and configure all environment variables for the Aigent Universal Clinic Template.

**Audience:** Complete beginners welcome! This guide assumes no prior knowledge.

**Related Files:**
- `.env.master` - Template with all variables
- `EnvMatrix.md` - Quick reference table

---

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Essential Variables Quick Checklist](#essential-variables-quick-checklist)
3. [First-Run Sequence](#first-run-sequence)
4. [Detailed Setup Instructions](#detailed-setup-instructions)
   - [n8n Base URL](#n8n-base-url)
   - [Google Sheets](#google-sheets)
   - [Slack / Teams Webhook](#slack--teams-webhook)
   - [SendGrid Email](#sendgrid-email)
   - [Twilio SMS](#twilio-sms)
   - [Google Calendar](#google-calendar)
   - [Microsoft 365 Calendar](#microsoft-365-calendar)
   - [Zoom Video](#zoom-video)
   - [Stripe Payments](#stripe-payments)
   - [S3 Storage](#s3-storage)
   - [PostgreSQL Database](#postgresql-database)
   - [HubSpot CRM](#hubspot-crm)
   - [Salesforce CRM](#salesforce-crm)
   - [OCR Services](#ocr-services)
   - [WhatsApp Business](#whatsapp-business)
   - [Telegram Bot](#telegram-bot)
5. [Security & Compliance Settings](#security--compliance-settings)
6. [Performance Settings](#performance-settings)
7. [Testing Mode](#testing-mode)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start Guide

**What is a `.env` file?**

A `.env` file is a text file that stores configuration settings (like API keys, passwords, and URLs) for your application. Think of it as a settings file that tells n8n how to connect to external services.

**Why do we need it?**

Instead of hardcoding secrets in workflows (insecure and hard to update), we store them in one central place. When you need to update an API key, you change it once in `.env` instead of editing 50+ workflow nodes.

**Steps to create your `.env` file:**

1. Copy `.env.master` to `.env` in your n8n project root:
   ```bash
   cp 00_Shared/.env.master .env
   ```

2. Open `.env` in a text editor

3. Replace all `paste_here` and `paste_cred_id_here` with real values

4. Save and restart n8n to load new variables

5. Test each module sequentially (start with Module 01)

---

## Essential Variables Quick Checklist

These variables are **required** to run Module 01 (minimum viable setup):

| Variable | Why It's Essential | Where to Find |
|----------|-------------------|---------------|
| `N8N_BASE_URL` | Required for all webhooks to function | Your n8n server URL (e.g., `https://n8n.yourdomain.com`) |
| `GOOGLE_SHEET_ID` | Where leads are stored | Google Sheets URL between `/d/` and `/edit` |
| `GOOGLE_SHEET_TAB` | Tab name in spreadsheet | Case-sensitive tab name (e.g., `Leads`) |
| `N8N_CRED_GOOGLE_SHEETS` | n8n credential for Sheets access | Created in n8n → Credentials → Google Sheets |
| `NOTIFICATION_WEBHOOK_URL` | Team notifications for new leads | Slack Incoming Webhook URL |
| `ALLOWED_ORIGINS` | CORS security setting | `*` for testing, specific domain for production |
| `ENABLE_PHI_MASKING` | HIPAA compliance | Set to `true` (always) |
| `ENABLE_PHONE_NORMALIZATION` | Ensures consistent phone format | Set to `true` (recommended) |

**Action:** Before testing any module, verify these 8 variables are configured correctly.

---

## First-Run Sequence

**Goal:** Get Module 01 (Intake & Lead Capture) working first. This validates your core setup.

### Minimum Configuration for Module 01

```bash
# In your .env file, configure these FIRST:
N8N_BASE_URL=https://your-n8n.com
N8N_WEBHOOK_URL_BASE=https://your-n8n.com
GOOGLE_SHEET_ID=1A2B3C4D5E6F7G8H9I0J...
GOOGLE_SHEET_TAB=Leads
N8N_CRED_GOOGLE_SHEETS=your_google_sheets_cred_id
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALLOWED_ORIGINS=*
ENABLE_PHI_MASKING=true
ENABLE_PHONE_NORMALIZATION=true
CLINIC_NAME=Your Clinic Name
```

### Test Module 01

```bash
# 1. Import Module 01 workflow into n8n
# 2. Activate workflow (green toggle)
# 3. Copy webhook URL from first node
# 4. Test with cURL:
curl -X POST https://your-n8n.com/webhook/intake-lead \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Patient",
    "email": "test@example.com",
    "phone": "555-123-4567"
  }'

# 5. Check Google Sheets - new row should appear
# 6. Check Slack - notification should arrive
```

**If Module 01 works, proceed to Module 02. If not, see [Troubleshooting](#troubleshooting).**

---

## Detailed Setup Instructions

### n8n Base URL

**Variable:** `N8N_BASE_URL`, `N8N_WEBHOOK_URL_BASE`

**Purpose:** The URL where your n8n instance is accessible.

**How to find it:**

1. **If running locally:**
   - Default: `http://localhost:5678`
   - Docker: Check your docker-compose.yml port mapping

2. **If self-hosted on a server:**
   - Your domain: `https://n8n.yourdomain.com`
   - Check your reverse proxy configuration (Nginx, Caddy, Traefik)

3. **If using n8n Cloud:**
   - Your URL: `https://yourworkspace.app.n8n.cloud`
   - Found in n8n Cloud dashboard

**How to set:**

```bash
# Local development:
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_URL_BASE=http://localhost:5678

# Production with custom domain:
N8N_BASE_URL=https://n8n.yourdomain.com
N8N_WEBHOOK_URL_BASE=https://n8n.yourdomain.com

# n8n Cloud:
N8N_BASE_URL=https://yourworkspace.app.n8n.cloud
N8N_WEBHOOK_URL_BASE=https://yourworkspace.app.n8n.cloud
```

**Test:**

```bash
# Open in browser, should show n8n login:
open $N8N_BASE_URL
```

**Troubleshooting:**

- **"Connection refused":** n8n not running - start with `docker-compose up -d` or `n8n start`
- **"SSL error":** Check HTTPS certificate configuration
- **"404":** Wrong URL - verify domain and port

---

### Google Sheets

**Variables:** `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB`, `N8N_CRED_GOOGLE_SHEETS`

**Purpose:** Store leads, appointments, analytics, and audit logs in Google Sheets.

#### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Click "Blank" to create new spreadsheet
3. Rename to "Aigent Clinic Data"
4. Create tabs (bottom):
   - `Leads` (Module 01)
   - `Appointments` (Module 02)
   - `AuditLog` (Module 09)
   - `Analytics` (Module 07)

#### Step 2: Get Sheet ID

1. Look at your browser URL bar
2. URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
3. Copy everything between `/d/` and `/edit`

**Example:**
```
URL: https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J_KLMNOPQRSTUVWXYZ/edit
Sheet ID: 1A2B3C4D5E6F7G8H9I0J_KLMNOPQRSTUVWXYZ
```

#### Step 3: Get Tab Name

1. Look at bottom of Google Sheets
2. Tab name is visible (case-sensitive!)
3. Default first tab is usually "Sheet1"
4. If you renamed it to "Leads", use "Leads" (exact match)

**Common mistake:** Tab name "leads" ≠ "Leads" (case-sensitive)

#### Step 4: Create n8n Credential

1. Open n8n
2. Go to **Settings** → **Credentials**
3. Click **Add Credential**
4. Search for "Google Sheets"
5. Select **Google Sheets OAuth2 API**
6. Click **Sign in with Google**
7. Select your Google account
8. Grant permissions (read/write sheets)
9. Copy the **Credential ID** (appears in URL or credential list)

**Credential ID format:** Looks like `1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6`

#### Step 5: Set Environment Variables

```bash
GOOGLE_SHEET_ID=1A2B3C4D5E6F7G8H9I0J_KLMNOPQRSTUVWXYZ
GOOGLE_SHEET_TAB=Leads
N8N_CRED_GOOGLE_SHEETS=1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6
```

#### Test Google Sheets Connection

```bash
# In n8n, create test workflow:
1. Add "Google Sheets" node
2. Select credential you created
3. Operation: "Append"
4. Spreadsheet ID: Use {{$env.GOOGLE_SHEET_ID}}
5. Sheet: Use {{$env.GOOGLE_SHEET_TAB}}
6. Test with sample data
7. Check Google Sheets - row should appear
```

**Troubleshooting:**

- **403 Forbidden:** Credential doesn't have permissions. Recreate credential and grant access.
- **404 Not Found:** Sheet ID is wrong. Copy again from URL.
- **Tab not found:** Tab name is case-sensitive. Check exact spelling.
- **"Could not find the credentials":** Credential ID is wrong. Check n8n credentials list.

---

### Slack / Teams Webhook

**Variables:** `NOTIFICATION_WEBHOOK_URL`, `NOTIFICATION_CHANNEL`, `SLACK_WEBHOOK_URL`, `TEAMS_WEBHOOK_URL`

**Purpose:** Send notifications to Slack or Microsoft Teams when events occur (new lead, booking, error).

#### Option 1: Slack Incoming Webhook

**Step 1: Create Slack App**

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. App name: "Aigent Notifications"
4. Select your workspace
5. Click **Create App**

**Step 2: Enable Incoming Webhooks**

1. In app settings, click **Incoming Webhooks** (left sidebar)
2. Toggle **Activate Incoming Webhooks** to ON
3. Scroll down, click **Add New Webhook to Workspace**
4. Select channel (e.g., `#leads` or `#general`)
5. Click **Allow**

**Step 3: Copy Webhook URL**

1. Webhook URL will appear (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`)
2. Copy entire URL

**Step 4: Set Environment Variable**

```bash
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
NOTIFICATION_CHANNEL=#leads
```

**Step 5: Test**

```bash
# Test with cURL:
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test notification from Aigent"}'

# Should appear in Slack within 2-5 seconds
```

#### Option 2: Microsoft Teams Webhook

**Step 1: Add Incoming Webhook to Teams**

1. Open Microsoft Teams
2. Go to channel where you want notifications
3. Click **...** (More options) → **Connectors**
4. Search for "Incoming Webhook"
5. Click **Configure**
6. Name: "Aigent Notifications"
7. Upload icon (optional)
8. Click **Create**

**Step 2: Copy Webhook URL**

1. Copy URL (looks like: `https://outlook.office.com/webhook/...`)

**Step 3: Set Environment Variable**

```bash
NOTIFICATION_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR_WEBHOOK
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR_WEBHOOK
```

**Step 4: Test**

```bash
curl -X POST https://outlook.office.com/webhook/YOUR_WEBHOOK \
  -H "Content-Type: application/json" \
  -d '{
    "@type": "MessageCard",
    "text": "Test notification from Aigent"
  }'
```

**Troubleshooting:**

- **No message appears:** Check webhook URL is correct (no typos)
- **"Invalid webhook":** Webhook may have been deleted. Create new one.
- **Messages delayed:** Slack/Teams may queue messages during high load (wait 1-2 min)

---

### SendGrid Email

**Variables:** `EMAIL_PROVIDER`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `N8N_CRED_SENDGRID`

**Purpose:** Send transactional emails (appointment confirmations, follow-ups, receipts).

#### Step 1: Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Click **Sign Up** (Free plan: 100 emails/day)
3. Complete registration and email verification

#### Step 2: Verify Sender Email

1. Log into SendGrid dashboard
2. Go to **Settings** → **Sender Authentication**
3. Click **Verify a Single Sender**
4. Enter your email address (e.g., `noreply@yourdomain.com`)
5. Check inbox and click verification link

**Important:** SendGrid will NOT send emails from unverified addresses.

#### Step 3: Create API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: "Aigent n8n Integration"
4. Permissions: **Full Access** (or minimum: Mail Send)
5. Click **Create & View**
6. **COPY THE API KEY IMMEDIATELY** (you won't see it again)

**API Key format:** Starts with `SG.` followed by ~70 characters

#### Step 4: Create n8n Credential

1. Open n8n → **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "SendGrid"
4. Select **SendGrid API**
5. Paste API Key
6. Click **Save**
7. Copy credential ID

#### Step 5: Set Environment Variables

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
N8N_CRED_SENDGRID=your_sendgrid_cred_id
```

#### Step 6: Test Email Sending

```bash
# In n8n, create test workflow:
1. Add HTTP Request node (POST to SendGrid API)
2. URL: https://api.sendgrid.com/v3/mail/send
3. Authentication: Use SendGrid credential
4. Body:
{
  "personalizations": [{"to": [{"email": "test@example.com"}]}],
  "from": {"email": "{{$env.SENDGRID_FROM_EMAIL}}"},
  "subject": "Test Email",
  "content": [{"type": "text/plain", "value": "This is a test"}]
}
5. Execute node
6. Check test@example.com inbox
```

**Troubleshooting:**

- **403 Forbidden:** API key is wrong or expired. Regenerate in SendGrid.
- **From address not verified:** Go to SendGrid → Sender Authentication → Verify sender.
- **Emails go to spam:** Verify your domain with SendGrid (domain authentication).
- **Account suspended:** Free tier limits: 100/day. Upgrade if needed.

---

### Twilio SMS

**Variables:** `SMS_ENABLED`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `N8N_CRED_TWILIO`

**Purpose:** Send SMS messages (appointment reminders, follow-ups, alerts).

#### Step 1: Create Twilio Account

1. Go to [Twilio](https://www.twilio.com/)
2. Click **Sign Up** (Free trial: $15 credit)
3. Complete registration and phone verification

#### Step 2: Get Account SID and Auth Token

1. Log into Twilio Console
2. Go to **Dashboard** (main page)
3. Look for **Account Info** panel
4. Copy **Account SID** (starts with `AC...`)
5. Copy **Auth Token** (click eye icon to reveal)

**Example:**
```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (34 chars)
Auth Token: 32-character random string
```

#### Step 3: Get Twilio Phone Number

**Option A: Use Trial Number (Free)**

1. Twilio gives you a trial number automatically
2. Go to **Phone Numbers** → **Manage** → **Active Numbers**
3. Copy your trial number (format: `+1234567890`)

**Limitation:** Trial can only send to verified numbers. Verify test numbers in Console → Verified Caller IDs.

**Option B: Buy Phone Number ($1/month)**

1. Go to **Phone Numbers** → **Buy a Number**
2. Select country (e.g., United States)
3. Check **SMS** capability
4. Select number and purchase ($1/month)
5. Copy number in E.164 format: `+15551234567`

#### Step 4: Create n8n Credential

1. Open n8n → **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "Twilio"
4. Select **Twilio API**
5. Paste Account SID
6. Paste Auth Token
7. Click **Save**
8. Copy credential ID

#### Step 5: Set Environment Variables

```bash
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_32_char_token
TWILIO_PHONE_NUMBER=+15551234567
N8N_CRED_TWILIO=your_twilio_cred_id
```

#### Step 6: Test SMS Sending

```bash
# Test with cURL:
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  -d "From=$TWILIO_PHONE_NUMBER" \
  -d "To=+15555555555" \
  -d "Body=Test message from Aigent"

# Check recipient phone for SMS (arrives in 5-30 seconds)
# Check Twilio Console → Messaging → Logs for delivery status
```

**Fallback: Disable SMS**

If you don't want to use SMS:

```bash
SMS_ENABLED=false
# Sequences will send email-only (Module 05 handles this gracefully)
```

**Troubleshooting:**

- **"Authenticate" error:** Account SID or Auth Token is wrong. Copy again from Console.
- **"Invalid From number":** `TWILIO_PHONE_NUMBER` must match your Twilio number exactly (include +).
- **"Unverified number":** On trial account, add recipient to Verified Caller IDs.
- **"Insufficient balance":** Add credit to account (Console → Billing).

---

### Google Calendar

**Variables:** `CALENDAR_PROVIDER`, `N8N_CRED_GOOGLE_CALENDAR`, `GOOGLE_CALENDAR_ID`

**Purpose:** Create appointments in Google Calendar (Module 02).

#### Step 1: Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project (or select existing)
3. Go to **APIs & Services** → **Library**
4. Search "Google Calendar API"
5. Click **Enable**

#### Step 2: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: "n8n Aigent"
5. Authorized redirect URIs: Add your n8n OAuth callback URL
   - Format: `https://your-n8n.com/rest/oauth2-credential/callback`
6. Click **Create**
7. Copy **Client ID** and **Client Secret**

#### Step 3: Create n8n Credential

1. Open n8n → **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "Google Calendar"
4. Select **Google Calendar OAuth2 API**
5. Paste Client ID and Client Secret (from Step 2)
6. Click **Sign in with Google**
7. Select Google account
8. Grant calendar permissions
9. Click **Save**
10. Copy credential ID

#### Step 4: Get Calendar ID

**Option A: Use Primary Calendar**

```bash
GOOGLE_CALENDAR_ID=primary
```

**Option B: Use Specific Calendar**

1. Open [Google Calendar](https://calendar.google.com/)
2. Click ⚙️ (Settings) → **Settings**
3. Click calendar name in left sidebar
4. Scroll to **Integrate calendar**
5. Copy **Calendar ID** (looks like: `abc123@group.calendar.google.com`)

#### Step 5: Set Environment Variables

```bash
CALENDAR_PROVIDER=google
N8N_CRED_GOOGLE_CALENDAR=your_google_calendar_cred_id
GOOGLE_CALENDAR_ID=primary
```

#### Step 6: Test Calendar Integration

```bash
# In n8n, create test workflow:
1. Add "Google Calendar" node
2. Select credential
3. Operation: "Create Event"
4. Calendar ID: {{$env.GOOGLE_CALENDAR_ID}}
5. Event:
   - Summary: Test Appointment
   - Start: 2025-11-01T10:00:00
   - End: 2025-11-01T10:30:00
6. Execute node
7. Check Google Calendar - event should appear
```

**Fallback: Disable Calendar**

```bash
CALENDAR_PROVIDER=none
# Disable calendar node in Module 02 workflow
```

**Troubleshooting:**

- **"Insufficient permission":** Re-authenticate credential and grant calendar.events scope.
- **"Calendar not found":** `GOOGLE_CALENDAR_ID` is wrong. Use "primary" or verify ID.
- **"Invalid credentials":** OAuth token expired. Click "Reconnect" in n8n credential.

---

### Microsoft 365 Calendar

**Variables:** `CALENDAR_PROVIDER`, `N8N_CRED_MICROSOFT_CALENDAR`

**Purpose:** Alternative to Google Calendar for organizations using Microsoft 365.

#### Step 1: Register App in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Name: "n8n Aigent Calendar"
5. Supported account types: **Single tenant**
6. Redirect URI: `https://your-n8n.com/rest/oauth2-credential/callback`
7. Click **Register**

#### Step 2: Configure API Permissions

1. In your app, go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph**
3. Select **Delegated permissions**
4. Add: `Calendars.ReadWrite`, `User.Read`
5. Click **Add permissions**
6. Click **Grant admin consent** (if admin)

#### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: "n8n"
4. Expires: 24 months (or Never for testing)
5. Click **Add**
6. **COPY SECRET VALUE IMMEDIATELY** (you won't see it again)

#### Step 4: Get Application (Client) ID

1. Go to **Overview** page of your app
2. Copy **Application (client) ID**
3. Copy **Directory (tenant) ID**

#### Step 5: Create n8n Credential

1. Open n8n → **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "Microsoft"
4. Select **Microsoft Graph OAuth2 API** or **Microsoft Outlook OAuth2**
5. Paste:
   - Client ID
   - Client Secret
   - Tenant ID
6. Click **Sign in with Microsoft**
7. Grant permissions
8. Click **Save**
9. Copy credential ID

#### Step 6: Set Environment Variables

```bash
CALENDAR_PROVIDER=microsoft
N8N_CRED_MICROSOFT_CALENDAR=your_microsoft_cred_id
```

**Troubleshooting:**

- **"AADSTS50011":** Redirect URI mismatch. Add exact n8n callback URL in Azure.
- **"Insufficient privileges":** Add Calendars.ReadWrite permission in Azure.
- **"Consent required":** Admin must grant consent in Azure AD.

---

### Zoom Video

**Variables:** `VIDEO_PLATFORM`, `ZOOM_API_KEY`, `ZOOM_API_SECRET`, `N8N_CRED_ZOOM`

**Purpose:** Generate Zoom meeting links for telehealth sessions (Module 03).

#### Step 1: Create Zoom Account

1. Go to [Zoom](https://zoom.us/)
2. Sign up for account (Basic plan is free)
3. Log into [Zoom App Marketplace](https://marketplace.zoom.us/)

#### Step 2: Create Server-to-Server OAuth App

**Note:** Zoom deprecated JWT apps. Use Server-to-Server OAuth.

1. Go to **Develop** → **Build App**
2. Select **Server-to-Server OAuth**
3. Click **Create**
4. App name: "Aigent Telehealth"
5. Company name: Your clinic
6. Click **Continue**

#### Step 3: Get Credentials

1. Copy **Account ID**
2. Copy **Client ID**
3. Copy **Client Secret**

#### Step 4: Add Scopes

1. Go to **Scopes** tab
2. Add these scopes:
   - `meeting:write:admin` (create meetings)
   - `meeting:read:admin` (read meeting details)
   - `user:read:admin` (read user info)
3. Click **Continue**

#### Step 5: Activate App

1. Review information
2. Click **Activate App**

#### Step 6: Create n8n Credential

1. Open n8n → **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "Zoom"
4. Select **Zoom OAuth2 API**
5. Paste:
   - Account ID
   - Client ID
   - Client Secret
6. Click **Save**
7. Copy credential ID

#### Step 7: Set Environment Variables

```bash
VIDEO_PLATFORM=zoom
N8N_CRED_ZOOM=your_zoom_cred_id
```

**Fallback: Disable Video Platform**

```bash
VIDEO_PLATFORM=none
# Disable video meeting nodes in Module 03
```

**Troubleshooting:**

- **"Invalid access token":** Client ID or Secret is wrong. Regenerate in Zoom Marketplace.
- **"User not found":** Account ID is wrong. Check Zoom App settings.
- **"Insufficient scope":** Add required scopes in Zoom App → Scopes tab.

---

### Stripe Payments

**Variables:** `PAYMENT_PROVIDER`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `N8N_CRED_STRIPE`

**Purpose:** Process payments for appointments and services (Module 04).

#### Step 1: Create Stripe Account

1. Go to [Stripe](https://stripe.com/)
2. Click **Sign up**
3. Complete registration (business verification required for live mode)

#### Step 2: Get API Keys

1. Log into Stripe Dashboard
2. Go to **Developers** → **API keys**
3. You'll see two sets of keys:
   - **Test mode** (for testing, starts with `sk_test_` and `pk_test_`)
   - **Live mode** (for production, starts with `sk_live_` and `pk_live_`)

**For testing, use Test mode keys:**

4. Copy **Secret key** (starts with `sk_test_`)
5. Copy **Publishable key** (starts with `pk_test_`)

#### Step 3: Create n8n Credential

1. Open n8n → **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "Stripe"
4. Select **Stripe API**
5. Paste Secret Key
6. Click **Save**
7. Copy credential ID

#### Step 4: Set Environment Variables

```bash
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
N8N_CRED_STRIPE=your_stripe_cred_id
```

#### Step 5: Test Payment Processing

**Use Stripe test card numbers:**

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date, any CVV

```bash
# In n8n, create test workflow:
1. Add "Stripe" node
2. Operation: "Create Charge"
3. Amount: 1000 (= $10.00 in cents)
4. Currency: USD
5. Source: tok_visa (test token)
6. Execute node
7. Check Stripe Dashboard → Payments (test mode)
```

**Fallback: Disable Payments**

```bash
PAYMENT_PROVIDER=none
# Disable payment nodes in Module 04
```

**Troubleshooting:**

- **"Invalid API key":** Key is wrong or you're mixing test/live keys. Use consistent mode.
- **"No such token":** Test token format changed. Use `tok_visa` for test charges.
- **"Account not activated":** Complete Stripe account verification for live mode.

---

### S3 Storage

**Variables:** `DOCUMENT_STORAGE_PROVIDER`, `S3_BUCKET_NAME`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `N8N_CRED_S3`

**Purpose:** Store uploaded documents (Module 06) and audit logs (Module 09).

#### Step 1: Create AWS Account

1. Go to [AWS](https://aws.amazon.com/)
2. Click **Create an AWS Account**
3. Complete registration (credit card required, but free tier available)

#### Step 2: Create S3 Bucket

1. Log into [AWS Console](https://console.aws.amazon.com/)
2. Go to **S3** service
3. Click **Create bucket**
4. Bucket name: `aigent-clinic-documents` (must be globally unique)
5. Region: Select closest to you (e.g., `us-east-1`)
6. **Block Public Access**: Keep enabled (for security)
7. Click **Create bucket**

#### Step 3: Create IAM User for n8n

1. Go to **IAM** service
2. Click **Users** → **Add users**
3. Username: `n8n-s3-access`
4. Access type: **Programmatic access** (API key)
5. Click **Next**

#### Step 4: Attach S3 Permissions

1. Permissions: **Attach existing policies directly**
2. Search and select: `AmazonS3FullAccess` (or create custom policy with limited access to your bucket)
3. Click **Next** → **Create user**

#### Step 5: Get Access Keys

1. After user creation, you'll see **Access key ID** and **Secret access key**
2. **COPY BOTH IMMEDIATELY** (secret won't be shown again)

**Example:**
```
Access Key ID: AKIAIOSFODNN7EXAMPLE
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

#### Step 6: Create n8n Credential

1. Open n8n → **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "AWS"
4. Select **AWS Credentials**
5. Paste:
   - Access Key ID
   - Secret Access Key
6. Click **Save**
7. Copy credential ID

#### Step 7: Set Environment Variables

```bash
DOCUMENT_STORAGE_PROVIDER=s3
S3_BUCKET_NAME=aigent-clinic-documents
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
N8N_CRED_S3=your_s3_cred_id
```

#### Step 8: Test S3 Upload

```bash
# Test with AWS CLI:
echo "test file" > test.txt
aws s3 cp test.txt s3://aigent-clinic-documents/test.txt --region us-east-1

# Check in S3 Console - file should appear in bucket
```

**Fallback: Use Google Drive or Disable**

```bash
DOCUMENT_STORAGE_PROVIDER=none
# Or switch to Google Drive (see next section)
```

**Troubleshooting:**

- **"Access Denied":** IAM user doesn't have S3 permissions. Attach `AmazonS3FullAccess` policy.
- **"Bucket not found":** Bucket name is wrong or in different region. Verify in S3 Console.
- **"Invalid security token":** Access keys are wrong. Regenerate in IAM.

---

### PostgreSQL Database

**Variables:** `DATASTORE_PROVIDER`, `POSTGRES_URL`, `N8N_CRED_POSTGRES`

**Purpose:** Alternative to Google Sheets for analytics and audit logs (Modules 07, 09).

#### Step 1: Set Up PostgreSQL

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL (Ubuntu):
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database:
sudo -u postgres createdb aigent_clinic

# Create user:
sudo -u postgres psql
CREATE USER aigent WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE aigent_clinic TO aigent;
\q
```

**Option B: Managed PostgreSQL (Recommended)**

- **Heroku Postgres:** Free tier available
- **AWS RDS:** Free tier available (12 months)
- **DigitalOcean Managed Databases:** $15/month
- **Supabase:** Free tier with PostgreSQL

**Example with Supabase:**

1. Go to [Supabase](https://supabase.com/)
2. Create account and new project
3. Go to **Settings** → **Database**
4. Copy **Connection String** (looks like: `postgres://user:pass@host:5432/db`)

#### Step 2: Compose Connection URL

```
Format: postgres://username:password@host:port/database

Example:
postgres://aigent:secure_password@localhost:5432/aigent_clinic
```

#### Step 3: Create n8n Credential

1. Open n8n → **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "Postgres"
4. Select **PostgreSQL**
5. Enter:
   - Host: `localhost` (or managed DB host)
   - Database: `aigent_clinic`
   - User: `aigent`
   - Password: `your_secure_password`
   - Port: `5432`
   - SSL: Enable if required
6. Click **Save**
7. Copy credential ID

#### Step 4: Set Environment Variables

```bash
DATASTORE_PROVIDER=postgres
POSTGRES_URL=postgres://aigent:secure_password@localhost:5432/aigent_clinic
N8N_CRED_POSTGRES=your_postgres_cred_id
```

#### Step 5: Test Connection

```bash
# Test with psql:
psql postgres://aigent:secure_password@localhost:5432/aigent_clinic

# Should connect and show postgres prompt
# Type \q to exit
```

**Fallback: Use Google Sheets**

```bash
DATASTORE_PROVIDER=sheets
# Most modules support Sheets as default
```

**Troubleshooting:**

- **"Connection refused":** PostgreSQL not running. Start with `sudo systemctl start postgresql`.
- **"Authentication failed":** Password is wrong. Reset with `ALTER USER aigent PASSWORD 'new_password';`.
- **"Database does not exist":** Create database with `createdb aigent_clinic`.
- **"SSL required":** Add `?sslmode=require` to connection URL or enable SSL in credential.

---

### HubSpot CRM

**Variables:** `CRM_PROVIDER`, `CRM_ENABLED`, `HUBSPOT_CREDENTIAL_ID`, `N8N_CRED_HUBSPOT`

**Purpose:** Sync leads and patient data to HubSpot CRM (Modules 01, 10).

#### Step 1: Create HubSpot Account

1. Go to [HubSpot](https://www.hubspot.com/)
2. Click **Get HubSpot free**
3. Complete registration (free CRM available)

#### Step 2: Create Private App

1. Log into HubSpot
2. Go to **Settings** → **Integrations** → **Private Apps**
3. Click **Create a private app**
4. Name: "n8n Aigent Integration"
5. Description: "Sync patient data from Aigent workflows"

#### Step 3: Set Scopes

1. Go to **Scopes** tab
2. Select these scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read` (optional)
   - `crm.objects.deals.write` (optional)
3. Click **Create app**

#### Step 4: Get Access Token

1. After creation, copy **Access Token**
2. **COPY IMMEDIATELY** (you can view it later, but best practice)

#### Step 5: Create n8n Credential

1. Open n8n → **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "HubSpot"
4. Select **HubSpot API**
5. Paste Access Token
6. Click **Save**
7. Copy credential ID

#### Step 6: Set Environment Variables

```bash
CRM_PROVIDER=hubspot
CRM_ENABLED=true
HUBSPOT_CREDENTIAL_ID=your_hubspot_cred_id
N8N_CRED_HUBSPOT=your_hubspot_cred_id
```

#### Step 7: Test HubSpot Integration

```bash
# In n8n, create test workflow:
1. Add "HubSpot" node
2. Operation: "Create Contact"
3. Email: test@example.com
4. First name: Test
5. Last name: Patient
6. Execute node
7. Check HubSpot → Contacts - new contact should appear
```

**Fallback: Disable CRM**

```bash
CRM_ENABLED=false
CRM_PROVIDER=none
# Disable CRM nodes in workflows
```

**Troubleshooting:**

- **"Unauthorized":** Access token is wrong. Regenerate in HubSpot Private Apps.
- **"Insufficient scope":** Add required scopes in HubSpot app settings.
- **"Contact already exists":** HubSpot prevents duplicate emails. Use update instead of create.

---

### Salesforce CRM

**Variables:** `CRM_PROVIDER`, `SALESFORCE_LOGIN_URL`, `N8N_CRED_SALESFORCE`

**Purpose:** Alternative to HubSpot for organizations using Salesforce.

#### Step 1: Create Salesforce Developer Account

1. Go to [Salesforce Developer](https://developer.salesforce.com/)
2. Click **Sign up for free**
3. Complete registration

#### Step 2: Create Connected App

1. Log into Salesforce
2. Go to **Setup** (gear icon)
3. Search "App Manager" in Quick Find
4. Click **New Connected App**
5. Fill in:
   - Connected App Name: "n8n Aigent"
   - API Name: `n8n_Aigent`
   - Contact Email: your email
6. Enable OAuth Settings:
   - Callback URL: `https://your-n8n.com/rest/oauth2-credential/callback`
   - Selected OAuth Scopes:
     - Full access (full)
     - Perform requests on your behalf at any time (refresh_token, offline_access)
7. Click **Save**

#### Step 3: Get Consumer Key and Secret

1. After creation, click **Manage Consumer Details**
2. Verify identity
3. Copy **Consumer Key** (Client ID)
4. Copy **Consumer Secret**

#### Step 4: Create n8n Credential

1. Open n8n → **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "Salesforce"
4. Select **Salesforce OAuth2 API**
5. Paste:
   - Client ID (Consumer Key)
   - Client Secret
   - Environment: Production (or Sandbox)
6. Click **Sign in with Salesforce**
7. Authorize access
8. Click **Save**
9. Copy credential ID

#### Step 5: Set Environment Variables

```bash
CRM_PROVIDER=salesforce
SALESFORCE_LOGIN_URL=https://login.salesforce.com
N8N_CRED_SALESFORCE=your_salesforce_cred_id
```

**Troubleshooting:**

- **"Invalid client credentials":** Consumer Key/Secret is wrong. Verify in Connected App.
- **"Redirect URI mismatch":** Add exact n8n callback URL in Connected App settings.
- **"User hasn't approved":** User must authorize app first time. Click "Sign in with Salesforce".

---

### OCR Services

**Variables:** `OCR_ENGINE`, `MISTRAL_API_KEY`, `GEMINI_API_KEY`, `ABBYY_API_KEY`

**Purpose:** Extract text from documents (Module 06).

#### Option 1: Mistral AI OCR

1. Go to [Mistral AI](https://mistral.ai/)
2. Create account
3. Go to **API** → **API Keys**
4. Click **Create new key**
5. Copy API key

```bash
OCR_ENGINE=mistral
MISTRAL_API_KEY=your_mistral_key
```

#### Option 2: Google Gemini OCR

1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Click **Get API key**
3. Create or select Cloud project
4. Click **Create API key**
5. Copy API key

```bash
OCR_ENGINE=gemini
GEMINI_API_KEY=your_gemini_key
```

#### Option 3: ABBYY Cloud OCR

1. Go to [ABBYY Cloud OCR](https://www.abbyy.com/cloud-ocr-sdk/)
2. Sign up for trial
3. Get API credentials from dashboard

```bash
OCR_ENGINE=abbyy
ABBYY_API_KEY=your_abbyy_key
```

#### Option 4: Tesseract OCR (Free, Local)

**No API key needed** - runs locally:

```bash
OCR_ENGINE=tesseract
# Install Tesseract on server:
# Ubuntu: sudo apt-get install tesseract-ocr
# Mac: brew install tesseract
```

**Fallback: Disable OCR**

```bash
OCR_ENGINE=none
# Documents stored without text extraction
```

---

### WhatsApp Business

**Variables:** `ENABLE_WHATSAPP`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`

**Purpose:** Send messages via WhatsApp (Module 08).

#### Step 1: Set Up WhatsApp Business Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create account
3. Create app
4. Add **WhatsApp** product

#### Step 2: Get Phone Number

1. Go to **WhatsApp** → **Getting Started**
2. Select phone number or add new one
3. Copy **Phone Number ID**

#### Step 3: Get Access Token

1. Go to **WhatsApp** → **API Setup**
2. Copy **Temporary Access Token** (24h expiry - for testing)
3. For production: Generate permanent token in **Settings**

#### Step 4: Set Environment Variables

```bash
ENABLE_WHATSAPP=true
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

**Fallback: Disable WhatsApp**

```bash
ENABLE_WHATSAPP=false
```

---

### Telegram Bot

**Variables:** `ENABLE_TELEGRAM`, `TELEGRAM_BOT_TOKEN`

**Purpose:** Send messages via Telegram (Module 08).

#### Step 1: Create Bot

1. Open Telegram
2. Search for `@BotFather`
3. Send `/newbot`
4. Follow prompts:
   - Bot name: "Aigent Clinic Bot"
   - Username: `aigent_clinic_bot`
5. Copy bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### Step 2: Set Environment Variable

```bash
ENABLE_TELEGRAM=true
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Fallback: Disable Telegram**

```bash
ENABLE_TELEGRAM=false
```

---

## Security & Compliance Settings

### PHI Masking

**Variables:** `ENABLE_PHI_MASKING`, `AUDIT_PHI_FIELDS_MASK`

**Purpose:** Protect patient information in logs and audit trails (HIPAA compliance).

**How to configure:**

```bash
# Always enable for healthcare:
ENABLE_PHI_MASKING=true

# Fields to mask (comma-separated):
AUDIT_PHI_FIELDS_MASK=email,phone,ip,ssn,dob,address
```

**What gets masked:**

```
Before: email=jane.doe@example.com
After: email=j***@e***
```

### CORS Configuration

**Variable:** `ALLOWED_ORIGINS`

**Purpose:** Control which domains can call your webhooks.

**For local testing:**

```bash
ALLOWED_ORIGINS=*
```

**For production:**

```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Credit Card Masking

**Variable:** `ENABLE_CARD_MASKING`

**Purpose:** Mask credit card numbers in logs (PCI-DSS compliance).

```bash
# Always enable for payment processing:
ENABLE_CARD_MASKING=true
```

### Waiting Room for Telehealth

**Variable:** `ENABLE_WAITING_ROOM`

**Purpose:** HIPAA requires waiting rooms for telehealth sessions.

```bash
# Required for HIPAA compliance:
ENABLE_WAITING_ROOM=true
```

---

## Performance Settings

### Workflow Timeout

**Variable:** `WORKFLOW_TIMEOUT_MS`

**Purpose:** Maximum time a workflow can run before timing out.

**Default:** 2 minutes (120000ms)

```bash
# Increase for long-running workflows (Module 05 multi-day):
WORKFLOW_TIMEOUT_MS=600000  # 10 minutes
```

### Execution Retention

**Variable:** `EXECUTIONS_DATA_MAX_AGE`

**Purpose:** How long to keep execution history.

**Critical for Module 05:** Must be ≥14 days (336 hours) to support Day-14 follow-ups.

```bash
# Required for Module 05:
EXECUTIONS_DATA_MAX_AGE=336  # 14 days

# For analytics/auditing:
EXECUTIONS_DATA_MAX_AGE=720  # 30 days
```

### Save Execution Data

**Variable:** `SAVE_EXECUTION_DATA`

**Purpose:** What execution data to save.

**Options:**
- `all` - Save everything (best for debugging)
- `errors` - Save only failed executions (saves space)
- `none` - Don't save (minimal storage)

```bash
# Recommended for development:
SAVE_EXECUTION_DATA=all

# Recommended for production:
SAVE_EXECUTION_DATA=errors
```

### Parallel Executions

**Variable:** `MAX_PARALLEL_EXECUTIONS`

**Purpose:** Limit concurrent workflow executions (prevents server overload).

```bash
# Low-resource server:
MAX_PARALLEL_EXECUTIONS=2

# High-resource server:
MAX_PARALLEL_EXECUTIONS=10
```

---

## Testing Mode

### Enable Test Mode

**Variables:** `ENABLE_TEST_MODE`, `TEST_FIXTURES_DIR`

**Purpose:** Use mock data and safe endpoints for testing.

**When enabled:**
- External API calls use mock responses
- Emails/SMS not actually sent (logged only)
- Database writes go to test tables

**How to enable:**

```bash
ENABLE_TEST_MODE=true
TEST_FIXTURES_DIR=/00_Shared/fixtures
```

**Test fixtures structure:**

```
00_Shared/fixtures/
├── mock_leads.json
├── mock_appointments.json
└── mock_responses/
    ├── sendgrid_success.json
    └── twilio_success.json
```

### Dry Run Mode

**Variable:** `DRY_RUN_MODE`

**Purpose:** Simulate workflows without side effects.

**When enabled:**
- No API calls made
- No database writes
- Execution path logged only

```bash
# Enable for safe testing:
DRY_RUN_MODE=true
```

**Disable for real testing:**

```bash
DRY_RUN_MODE=false
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "Environment variable not found"

**Symptom:** Workflow fails with error like `Cannot read property 'GOOGLE_SHEET_ID' of undefined`

**Cause:** Variable not set in `.env` or n8n not restarted after changes.

**Solution:**

```bash
# 1. Check variable exists in .env:
grep GOOGLE_SHEET_ID .env

# 2. Restart n8n:
docker-compose restart n8n
# Or if running directly:
systemctl restart n8n

# 3. Test in n8n:
# Create test workflow with Code node:
return [{json: {test: $env.GOOGLE_SHEET_ID}}];
# Execute - should show your value
```

#### Issue 2: "n8n credential not found"

**Symptom:** Workflow fails with `Could not find the credentials with the ID "abc123"`

**Cause:** Credential ID in `.env` doesn't match any credential in n8n.

**Solution:**

```bash
# 1. List all credentials in n8n:
# Go to Settings → Credentials
# Click on your credential
# Look at URL: .../credentials/CREDENTIAL_ID/edit

# 2. Copy exact ID from URL

# 3. Update .env:
N8N_CRED_GOOGLE_SHEETS=correct_cred_id_here

# 4. Restart n8n
```

#### Issue 3: "Variables work in n8n UI but not from .env"

**Symptom:** Hardcoded values work, but `{{$env.VAR_NAME}}` returns undefined.

**Cause:** n8n running in Docker may not see environment variables.

**Solution for Docker:**

```yaml
# docker-compose.yml:
services:
  n8n:
    image: n8nio/n8n
    environment:
      # Option 1: List each variable
      - N8N_BASE_URL=${N8N_BASE_URL}
      - GOOGLE_SHEET_ID=${GOOGLE_SHEET_ID}

      # Option 2: Load all from .env
    env_file:
      - .env
```

```bash
# Restart after updating docker-compose.yml:
docker-compose down
docker-compose up -d
```

#### Issue 4: "403 Forbidden / 401 Unauthorized"

**Symptom:** API calls fail with authentication errors.

**Common causes:**

1. **Expired credentials:** Re-authenticate OAuth credentials in n8n
2. **Wrong API key:** Copy API key again from provider
3. **Insufficient permissions:** Add required scopes/permissions
4. **Test vs Live mode:** Using test keys in production or vice versa

**Solution:**

```bash
# 1. Check credential is not expired:
# n8n → Settings → Credentials → Click credential
# If OAuth, click "Reconnect" to refresh

# 2. Verify API key format:
# SendGrid: starts with SG.
# Stripe: starts with sk_test_ or sk_live_
# Twilio: AC... (Account SID)

# 3. Check permissions in provider dashboard
```

#### Issue 5: "Webhook returns 404"

**Symptom:** cURL to webhook URL returns 404 Not Found.

**Causes:**

1. Workflow not active
2. Webhook ID mismatch
3. Wrong base URL

**Solution:**

```bash
# 1. Activate workflow:
# n8n → Workflows → Find workflow → Toggle ON (green)

# 2. Verify webhook ID matches .env:
# In workflow, click webhook node
# Check "Path" field matches INTAKE_WEBHOOK_ID

# 3. Test URL construction:
echo "$N8N_BASE_URL/webhook/$INTAKE_WEBHOOK_ID"
# Should match webhook URL in n8n

# 4. Test webhook directly:
curl -X POST $N8N_BASE_URL/webhook/$INTAKE_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## Essential Variables Quick Checklist

Copy this checklist and check off as you configure each variable:

### Minimum Viable Setup (Module 01 Only)

- [ ] `N8N_BASE_URL` - Your n8n server URL
- [ ] `N8N_WEBHOOK_URL_BASE` - Same as N8N_BASE_URL
- [ ] `GOOGLE_SHEET_ID` - Spreadsheet ID from URL
- [ ] `GOOGLE_SHEET_TAB` - Tab name (e.g., "Leads")
- [ ] `N8N_CRED_GOOGLE_SHEETS` - n8n credential ID
- [ ] `NOTIFICATION_WEBHOOK_URL` - Slack webhook URL
- [ ] `ALLOWED_ORIGINS` - Set to `*` for testing
- [ ] `ENABLE_PHI_MASKING` - Set to `true`
- [ ] `ENABLE_PHONE_NORMALIZATION` - Set to `true`

### Full System Setup (All 10 Modules)

#### Email (Module 05)
- [ ] `EMAIL_PROVIDER` - Set to `sendgrid`
- [ ] `SENDGRID_API_KEY` - API key from SendGrid
- [ ] `SENDGRID_FROM_EMAIL` - Verified sender email
- [ ] `N8N_CRED_SENDGRID` - n8n credential ID

#### SMS (Module 05)
- [ ] `SMS_ENABLED` - Set to `true` or `false`
- [ ] `TWILIO_ACCOUNT_SID` - From Twilio Console
- [ ] `TWILIO_AUTH_TOKEN` - From Twilio Console
- [ ] `TWILIO_PHONE_NUMBER` - E.164 format (+1...)
- [ ] `N8N_CRED_TWILIO` - n8n credential ID

#### Calendar (Module 02)
- [ ] `CALENDAR_PROVIDER` - `google`, `microsoft`, or `none`
- [ ] `N8N_CRED_GOOGLE_CALENDAR` - If using Google
- [ ] `GOOGLE_CALENDAR_ID` - Calendar ID or "primary"

#### Payments (Module 04)
- [ ] `PAYMENT_PROVIDER` - `stripe` or `none`
- [ ] `STRIPE_SECRET_KEY` - From Stripe Dashboard
- [ ] `N8N_CRED_STRIPE` - n8n credential ID

#### Video (Module 03)
- [ ] `VIDEO_PLATFORM` - `zoom` or `none`
- [ ] `N8N_CRED_ZOOM` - If using Zoom

#### Documents (Module 06)
- [ ] `DOCUMENT_STORAGE_PROVIDER` - `s3`, `google_drive`, or `none`
- [ ] `S3_BUCKET_NAME` - If using S3
- [ ] `N8N_CRED_S3` - If using S3

#### Analytics (Module 07)
- [ ] `DATASTORE_PROVIDER` - `sheets` or `postgres`
- [ ] `POSTGRES_URL` - If using PostgreSQL

#### Compliance (Module 09)
- [ ] `AUDIT_LOG_PROVIDER` - `sheets`, `s3`, or `postgres`
- [ ] `ENABLE_HASH_CHAIN` - Set to `true`
- [ ] `AUDIT_RETENTION_DAYS` - Set to `2555` (7 years for HIPAA)

---

## Next Steps

1. **Copy `.env.master` to `.env`:**
   ```bash
   cp 00_Shared/.env.master .env
   ```

2. **Configure essential variables** (minimum 9 for Module 01)

3. **Restart n8n** to load new environment variables

4. **Test Module 01** (see Module 01 TestPlan.md)

5. **Progressively enable modules** (02, 03, 04, etc.)

6. **Never commit `.env` to git** (add to `.gitignore`)

---

**Questions or Issues?**

- Check module-specific TestPlan.md files
- See Troubleshooting.md in each module folder
- Review this document's troubleshooting section
- Join n8n community forum for help

---

**Security Reminder:**

Never share your `.env` file or commit it to version control. It contains secrets that could compromise your systems.

Always use:
```bash
# .gitignore
.env
.env.local
.env.production
```

---

**End of Environment Setup Instructions**
