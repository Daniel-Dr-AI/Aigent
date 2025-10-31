# Environment Variables Matrix (EnvMatrix)

**What This Is:** A complete guide to all the "connection settings" used in Aigent workflows

**For Complete Beginners:** Think of environment variables as a contact list for your computer programs. Just like you save phone numbers in your contacts instead of memorizing them, workflows save connection details in environment variables instead of writing them directly in the code.

---

## Why Environment Variables Matter

**Imagine this scenario:**
You write your friend's phone number directly into 50 different text messages. Then your friend changes their number. Now you have to find and update all 50 messages!

**Better approach:**
Save the number once in your contacts as "Friend's Phone". Reference "Friend's Phone" in all messages. When the number changes, update it once in contacts, and all references automatically use the new number.

**That's what environment variables do for workflows!**

---

## How to Read This Guide

Each variable explanation includes:
- **What It Is:** Plain-language description
- **Why You Need It:** Real-world purpose
- **Example Value:** What it looks like
- **Where Used:** Which modules need it
- **How to Get It:** Step-by-step instructions
- **Beginner Tip:** Extra help for first-timers

---

## Table of Contents

1. [Webhook Configuration](#webhook-configuration)
2. [CRM Integration](#crm-integration)
3. [Notification Services](#notification-services)
4. [Data Storage](#data-storage)
5. [Communication (Email & SMS)](#communication-email--sms)
6. [Calendar Integration](#calendar-integration)
7. [Video Platforms](#video-platforms)
8. [Payment Processing](#payment-processing)
9. [Document Storage](#document-storage)
10. [OCR Services](#ocr-services)
11. [Analytics & Reporting](#analytics--reporting)
12. [Compliance & Audit](#compliance--audit)
13. [Security Settings](#security-settings)
14. [Performance Tuning](#performance-tuning)
15. [Feature Flags](#feature-flags)

---

## Webhook Configuration

### WEBHOOK_ID
**What It Is:** A unique name for your webhook (like a nickname for a specific entrance to your system)

**Why You Need It:** Helps you identify which workflow received data when reviewing logs

**Example Value:** `intake-lead-capture-v1`

**Where Used:** Modules 01, 02, 08

**How to Get It:** You make this up! Choose something descriptive like `module-01-intake` or `booking-webhook-prod`

**Beginner Tip:** Use lowercase letters, numbers, and dashes only. No spaces or special characters.

---

### ALLOWED_ORIGINS
**What It Is:** A list of websites that are allowed to send data to your webhook (like a guest list for a party)

**Why You Need It:** Security! This prevents random websites from sending fake data to your system.

**Example Value (Development):** `*` (means "allow anyone" — only safe for testing!)

**Example Value (Production):** `https://yourdomain.com,https://www.yourdomain.com`

**Where Used:** Modules 01, 02, 08

**How to Get It:** Use the web address(es) of your actual clinic website or intake forms

**Beginner Tip:**
- During testing, use `*` (asterisk) to allow all websites
- Before going live, change this to your real website addresses
- Separate multiple addresses with commas, no spaces

**Visual Guide:**
```
Testing:    ALLOWED_ORIGINS=*
Production: ALLOWED_ORIGINS=https://myclinic.com,https://www.myclinic.com
```

---

## CRM Integration

**CRM = "Customer Relationship Management"** — A system that stores information about your leads and patients (like HubSpot, Salesforce, or Zoho)

### HUBSPOT_CREDENTIAL_ID
**What It Is:** A number that points to your saved HubSpot login in n8n

**Why You Need It:** Tells the workflow which HubSpot account to use (you might have multiple)

**Example Value:** `1`

**Where Used:** Module 01

**How to Get It:**
1. In n8n, click the menu icon (three horizontal lines) in the top-left
2. Click "Credentials"
3. Find your HubSpot credential in the list
4. Look at the URL in your browser — the number at the end is your ID
   - Example: `.../credentials/1` means the ID is `1`

**Beginner Tip:** If you don't see a HubSpot credential, you need to create one first:
1. Go to Credentials → "Add Credential"
2. Search for "HubSpot"
3. Follow the connection wizard
4. Once saved, come back and get the ID

---

### HUBSPOT_CREDENTIAL_NAME
**What It Is:** The nickname you gave your HubSpot connection

**Why You Need It:** Some n8n nodes ask for the name instead of the ID

**Example Value:** `HubSpot Production Account`

**Where Used:** Module 01

**How to Get It:**
1. Go to n8n → Credentials
2. Look at the name column next to your HubSpot credential
3. Copy the exact name (case-sensitive!)

**Beginner Tip:** Name your credentials clearly:
- ✅ Good: "HubSpot Production", "HubSpot Testing", "HubSpot Sandbox"
- ❌ Bad: "cred1", "My Credential", "Test"

---

### CRM_RETRY_COUNT
**What It Is:** How many times to try again if HubSpot doesn't respond

**Why You Need It:** Sometimes internet connections hiccup. This prevents losing data due to temporary problems.

**Example Value:** `3` (try up to 3 times)

**Where Used:** Module 01

**How to Get It:** You choose! Recommendations:
- **Testing:** `2` (fail fast so you spot real problems)
- **Production:** `3` (more forgiving for temporary network issues)

**Beginner Tip:** Higher numbers = more resilient, but slower failure detection. Start with `3`.

---

### CRM_RETRY_DELAY_MS
**What It Is:** How long to wait between retry attempts (measured in milliseconds)

**Why You Need It:** Give the service time to recover before trying again

**Example Value:** `1000` (wait 1 second)

**Where Used:** Module 01

**How to Get It:** Recommendations:
- `500` = 0.5 seconds (impatient)
- `1000` = 1 second (standard)
- `2000` = 2 seconds (very patient)

**Beginner Tip:** 1000 milliseconds = 1 second. So `1000` means "wait 1 second before trying again."

---

## Notification Services

**Notifications = Messages sent to your team when something important happens** (like "New lead received!" or "ERROR: Payment failed!")

### NOTIFICATION_WEBHOOK_URL
**What It Is:** The web address where notifications are sent (usually Slack, Microsoft Teams, or Discord)

**Why You Need It:** So your team gets instant alerts about new leads, bookings, errors, etc.

**Example Value:** `https://hooks.slack.com/services/YOUR-WORKSPACE-ID/YOUR-CHANNEL-ID/YOUR-SECRET-TOKEN`

**Where Used:** Modules 01, 02, 03, 04, 05, 09, 10

**How to Get It (Slack):**
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "Aigent Notifications" and choose your workspace
4. Click "Incoming Webhooks" in the sidebar
5. Turn on "Activate Incoming Webhooks"
6. Click "Add New Webhook to Workspace"
7. Choose the channel where you want notifications (like #leads or #alerts)
8. Copy the webhook URL that appears

**How to Get It (Microsoft Teams):**
1. Open Teams and go to the channel where you want notifications
2. Click the "..." (three dots) next to the channel name
3. Click "Connectors"
4. Search for "Incoming Webhook" and click "Configure"
5. Give it a name like "Aigent Notifications"
6. Copy the URL that appears

**Beginner Tip:**
- Test your webhook! In Slack, post a test message using this simple command in your terminal:
  ```bash
  curl -X POST YOUR-WEBHOOK-URL -H 'Content-Type: application/json' -d '{"text":"Test from Aigent!"}'
  ```
- You should see "Test from Aigent!" appear in your channel immediately

---

### NOTIFICATION_CHANNEL
**What It Is:** The specific channel, room, or destination within your notification service

**Why You Need It:** Organize notifications (leads go to #leads, errors go to #errors, etc.)

**Example Value:** `#leads` (for Slack) or `Leads Channel` (for Teams)

**Where Used:** Modules 01, 02, 03, 04, 05, 09, 10

**How to Get It:** Look at the channel name in your Slack or Teams — that's it!

**Beginner Tip:**
- Slack channels start with `#`
- Teams channels use their full display name
- Use different channels for different types of notifications (don't mix leads with errors)

---

### ERROR_NOTIFICATION_WEBHOOK_URL
**What It Is:** A SEPARATE webhook for error messages (problems with the system itself)

**Why You Need It:** Separate urgent error alerts from routine notifications so they don't get lost in the noise

**Example Value:** `https://hooks.slack.com/services/YOUR-ERROR-WORKSPACE/YOUR-ERROR-CHANNEL/YOUR-ERROR-TOKEN`

**Where Used:** All modules (error handling)

**How to Get It:** Follow the same steps as `NOTIFICATION_WEBHOOK_URL`, but choose a different channel (like #errors or #tech-alerts)

**Beginner Tip:**
- Optional but HIGHLY recommended
- Send errors to a channel monitored by technical staff
- Leave empty (blank) to disable separate error notifications

---

### SUPPORT_EMAIL
**What It Is:** Email address shown to users when something goes wrong

**Why You Need It:** Gives users a way to contact you if they encounter problems

**Example Value:** `support@yourdomain.com`

**Where Used:** All modules (error responses)

**How to Get It:** Use your clinic's support email, or create a new one like `help@yourdomain.com`

**Beginner Tip:** Make sure this email address is monitored! Users will actually send messages here when problems occur.

---

## Data Storage

**Data Storage = Where information is saved permanently** (like Google Sheets, Airtable, or databases)

### GOOGLE_SHEET_ID
**What It Is:** The unique identifier for a specific Google Sheet

**Why You Need It:** Tells the workflow which spreadsheet to write data into

**Example Value:** `1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`

**Where Used:** Modules 01, 02, 05, 07

**How to Get It:**
1. Open your Google Sheet in a web browser
2. Look at the URL in the address bar:
   ```
   https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit
   ```
3. The long string of letters and numbers between `/d/` and `/edit` is your Sheet ID
4. Copy everything from the first character until the `/edit`

**Beginner Tip:**
- The Sheet ID is usually 40-45 characters long
- It contains both letters and numbers
- Create separate sheets for testing vs. production (they'll have different IDs)

---

### GOOGLE_SHEET_TAB
**What It Is:** The name of the specific tab (worksheet) within your Google Sheet

**Why You Need It:** One Google Sheet can have multiple tabs. This specifies which one to use.

**Example Value:** `Leads` or `Bookings` or `Sheet1`

**Where Used:** Modules 01, 02, 05, 07

**How to Get It:**
1. Open your Google Sheet
2. Look at the bottom of the screen
3. You'll see tab names like "Sheet1", "Leads", etc.
4. Copy the exact tab name (case-sensitive!)

**Beginner Tip:**
- Right-click a tab and choose "Rename" to give it a clear name
- Use names like "Leads", "Appointments", "Payments" instead of "Sheet1", "Sheet2"
- The name must match EXACTLY (including capital letters)

---

### GOOGLE_SHEETS_CREDENTIAL_ID
**What It Is:** The number pointing to your saved Google Sheets login in n8n

**Why You Need It:** Authorizes n8n to read and write to your Google Sheets

**Example Value:** `6`

**Where Used:** Modules 01, 02, 05, 07

**How to Get It:**
1. In n8n, go to Credentials
2. Find your "Google Sheets" credential
3. Look at the URL: `.../credentials/6` means the ID is `6`

**Beginner Tip:**
- Google Sheets uses OAuth2 authentication (the secure "Sign in with Google" method)
- You'll need to authorize n8n to access your sheets the first time
- The credential works for ALL your Google Sheets, not just one

---

## Communication (Email & SMS)

### SENDGRID_API_KEY
**What It Is:** Your password for sending emails through SendGrid (an email delivery service)

**Why You Need It:** Workflows need this to send appointment confirmations, follow-ups, and notifications

**Example Value:** `SG.aBc123XyZ789.dEf456-gHi789_jKl012MnO345pQr678`

**Where Used:** Modules 02, 03, 04, 05

**How to Get It:**
1. Sign up for SendGrid (free tier available): https://sendgrid.com
2. Go to Settings → API Keys
3. Click "Create API Key"
4. Choose "Full Access" (or at least "Mail Send" permission)
5. Give it a name like "Aigent Production"
6. Click "Create & View"
7. **IMMEDIATELY COPY THE KEY** — you can only see it once!

**Beginner Tip:**
- Store the API key somewhere safe (like a password manager)
- SendGrid will only show it once — if you lose it, you must create a new one
- Free tier allows 100 emails/day, perfect for testing

---

### SENDGRID_FROM_EMAIL
**What It Is:** The "From" email address that appears when patients receive emails

**Why You Need It:** Patients need to see who sent the email (and reply if needed)

**Example Value:** `noreply@yourdomain.com` or `appointments@yourdomain.com`

**Where Used:** Modules 02, 03, 04, 05

**How to Get It:**
1. You choose the email address
2. It should be at your domain (not @gmail.com)
3. Verify it in SendGrid:
   - Go to Settings → Sender Authentication
   - Add your domain or specific sender address
   - Follow verification steps (usually involves clicking a link)

**Beginner Tip:**
- `noreply@yourdomain.com` = patients shouldn't reply to this email
- `appointments@yourdomain.com` = patients can reply with questions
- Choose wisely based on whether you want to receive replies!

---

### TWILIO_ACCOUNT_SID
**What It Is:** Your Twilio account identifier (like a username)

**Why You Need It:** Required to send SMS messages through Twilio

**Example Value:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (replace x's with your actual SID)

**Where Used:** Modules 02, 05, 08

**How to Get It:**
1. Sign up for Twilio: https://www.twilio.com/try-twilio
2. After signing in, go to the Dashboard (Console)
3. You'll see "Account SID" near the top
4. Click the icon to copy it

**Beginner Tip:**
- Twilio gives you free credit when you sign up (great for testing!)
- Account SID starts with "AC"
- It's safe to see (but keep your Auth Token secret!)

---

### TWILIO_AUTH_TOKEN
**What It Is:** Your Twilio password (used together with Account SID)

**Why You Need It:** Proves you're authorized to send SMS from your account

**Example Value:** `9876543210fedcba9876543210fedcba`

**Where Used:** Modules 02, 05, 08

**How to Get It:**
1. Go to Twilio Dashboard (Console)
2. You'll see "Auth Token" next to Account SID
3. Click "Show" to reveal it
4. Click the copy icon

**Beginner Tip:**
- **Keep this SECRET!** Anyone with your Auth Token can send SMS (and charge your account!)
- Never share it publicly or commit it to GitHub
- Store it as an environment variable (not hardcoded in workflows)

---

### TWILIO_FROM_NUMBER
**What It Is:** The phone number that SMS messages come from

**Why You Need It:** Patients will see this as the sender when they receive texts

**Example Value:** `+15551234567` (with country code!)

**Where Used:** Modules 02, 05, 08

**How to Get It:**
1. In Twilio, go to Phone Numbers → Manage → Active Numbers
2. If you don't have one yet:
   - Click "Buy a number"
   - Choose your country
   - Select a number (free trial accounts get one free number)
   - Click "Buy"
3. Copy the number in E.164 format: `+1` (country code) + area code + number

**Beginner Tip:**
- Always include the `+` and country code: `+15551234567` (US) or `+442071234567` (UK)
- Don't use spaces, dashes, or parentheses in the environment variable
- For testing, Twilio gives you a free number
- For production, you can choose a local number or toll-free number

---

## Calendar Integration

### GOOGLE_CALENDAR_ID
**What It Is:** The unique identifier for a specific Google Calendar

**Why You Need It:** Tells the workflow which calendar to check for available times and create appointments

**Example Value:** `youremail@gmail.com` (for your primary calendar) or `abc123xyz@group.calendar.google.com` (for a shared calendar)

**Where Used:** Module 02

**How to Get It:**
1. Go to Google Calendar (calendar.google.com)
2. On the left side, find the calendar you want to use
3. Click the three dots next to the calendar name
4. Click "Settings and sharing"
5. Scroll down to "Integrate calendar"
6. Copy the "Calendar ID"

**Beginner Tip:**
- Your primary calendar ID is usually just your Gmail address
- Shared calendars (like "Appointments") have IDs like `abc123@group.calendar.google.com`
- You can create a dedicated calendar for Aigent appointments (recommended!)

**To create a dedicated calendar:**
1. In Google Calendar, click the "+" next to "Other calendars"
2. Click "Create new calendar"
3. Name it "Aigent Appointments" (or similar)
4. Click "Create calendar"
5. Now get its Calendar ID using the steps above

---

### CAL_COM_API_KEY
**What It Is:** Your password for accessing Cal.com (an alternative to Google Calendar)

**Why You Need It:** Lets workflows create bookings in your Cal.com account

**Example Value:** `cal_test_1234567890abcdefghij`

**Where Used:** Module 02

**How to Get It:**
1. Sign up for Cal.com: https://cal.com
2. Go to Settings → Security → API Keys
3. Click "New API key"
4. Give it a name like "Aigent Integration"
5. Choose permissions (select "Bookings: Read and Write")
6. Click "Create"
7. Copy the API key immediately (you can only see it once!)

**Beginner Tip:**
- Cal.com has generous free tiers
- API keys start with `cal_live_` (production) or `cal_test_` (testing)
- Store safely — you can't view it again after creation

---

## Video Platforms

### ZOOM_ACCOUNT_ID
**What It Is:** Your Zoom account identifier

**Why You Need It:** Required to create Zoom meeting links programmatically

**Example Value:** `AbC123XyZ789DeFgHiJk`

**Where Used:** Module 03

**How to Get It:**
1. Go to Zoom Marketplace: https://marketplace.zoom.us
2. Sign in with your Zoom account
3. Click "Develop" → "Build App"
4. Create a "Server-to-Server OAuth" app
5. After creation, you'll see your "Account ID"
6. Copy it

**Beginner Tip:**
- You need a Zoom Pro, Business, or Enterprise account (not free Basic)
- This is for automating meeting creation, not for attending meetings yourself
- The free trial of Zoom Pro works fine for testing!

---

### ZOOM_CLIENT_ID
**What It Is:** Your Zoom app's public identifier

**Why You Need It:** Part of the authentication process for creating Zoom meetings

**Example Value:** `Ab1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9`

**Where Used:** Module 03

**How to Get It:** In your Zoom Server-to-Server OAuth app (created above), you'll see "Client ID" listed

---

### ZOOM_CLIENT_SECRET
**What It Is:** Your Zoom app's secret password

**Why You Need It:** Proves your app is authorized to create meetings

**Example Value:** `Zy9Wx8Vu7Ts6Rq5Po4Nm3Lk2Jh1Ig0`

**Where Used:** Module 03

**How to Get It:** In your Zoom Server-to-Server OAuth app, you'll see "Client Secret" — click to reveal and copy

**Beginner Tip:** Keep this SECRET! Anyone with your Client Secret can create Zoom meetings in your account.

---

### DOXYME_API_KEY
**What It Is:** Your Doxy.me password for creating telehealth video links

**Why You Need It:** Doxy.me is a HIPAA-compliant video platform designed for healthcare

**Example Value:** `doxy_1234567890abcdefghijklmnop`

**Where Used:** Module 03

**How to Get It:**
1. Sign up for Doxy.me: https://doxy.me
2. Upgrade to a paid plan (required for API access)
3. Go to Account Settings → Integrations → API
4. Click "Generate API Key"
5. Copy the key

**Beginner Tip:**
- Doxy.me is specifically designed for healthcare (HIPAA-compliant out of the box)
- Free tier exists but doesn't include API access
- Very popular among telehealth providers

---

## Payment Processing

### STRIPE_SECRET_KEY
**What It Is:** Your Stripe password for processing payments (starts with `sk_`)

**Why You Need It:** Allows workflows to charge credit cards securely

**Example Value:** `sk_test_51AbCdEf1234567890...` (test) or `sk_live_51AbCdEf...` (production)

**Where Used:** Module 04

**How to Get It:**
1. Sign up for Stripe: https://stripe.com
2. Go to Dashboard → Developers → API keys
3. You'll see two keys:
   - **Test mode:** `sk_test_...` (use this first!)
   - **Live mode:** `sk_live_...` (use this for real payments)
4. Click to reveal the secret key
5. Copy it

**Beginner Tip:**
- ALWAYS start with test mode (`sk_test_...`)
- Test mode uses fake credit cards (Stripe provides test card numbers)
- Test cards: `4242 4242 4242 4242` (Visa), expiry any future date, any CVC
- Switch to live mode only when ready for real payments!

---

### STRIPE_PUBLISHABLE_KEY
**What It Is:** Your Stripe public identifier (safe to expose in frontend code)

**Why You Need It:** Used in payment forms visible to patients

**Example Value:** `pk_test_51AbCdEf...` (test) or `pk_live_51AbCdEf...` (production)

**Where Used:** Module 04

**How to Get It:** Same location as Secret Key (Dashboard → Developers → API keys)

**Beginner Tip:**
- This one is safe to share publicly (unlike the secret key!)
- Must match the mode of your secret key (test with test, live with live)

---

### STRIPE_WEBHOOK_SECRET
**What It Is:** A password that proves webhook events actually came from Stripe

**Why You Need It:** Security! Prevents hackers from faking payment success notifications

**Example Value:** `whsec_1234567890abcdefghijklmnopqrstuvwxyz`

**Where Used:** Module 04

**How to Get It:**
1. In Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL (your n8n webhook URL)
4. Select events to listen for (at minimum: `payment_intent.succeeded`, `payment_intent.failed`)
5. Click "Add endpoint"
6. You'll see "Signing secret" — click to reveal and copy

**Beginner Tip:**
- This verifies that payment notifications really came from Stripe
- Without this, someone could fake a "payment succeeded" message
- Each webhook endpoint has its own signing secret

---

## Document Storage

### AWS_S3_ACCESS_KEY_ID
**What It Is:** Your Amazon Web Services username for storing files

**Why You Need It:** Workflows upload documents (like insurance cards) to S3 for secure storage

**Example Value:** `AKIAIOSFODNN7EXAMPLE`

**Where Used:** Module 06, 09

**How to Get It:**
1. Sign up for AWS: https://aws.amazon.com
2. Go to IAM (Identity and Access Management)
3. Click "Users" → "Add users"
4. Create a user named "aigent-s3-uploader"
5. Enable "Programmatic access"
6. Attach policy "AmazonS3FullAccess" (or create custom policy with less access)
7. Click "Create user"
8. **Copy the Access Key ID immediately** (shown only once!)

**Beginner Tip:**
- AWS has a generous free tier (5GB storage free for 12 months)
- Access Key ID is like a username (safe to see, but don't share publicly)
- For testing, use a dedicated "test" bucket

---

### AWS_S3_SECRET_ACCESS_KEY
**What It Is:** Your AWS password (used with Access Key ID)

**Why You Need It:** Proves you're authorized to upload files to S3

**Example Value:** `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

**Where Used:** Module 06, 09

**How to Get It:** Shown when you create the IAM user (same process as Access Key ID above)

**Beginner Tip:**
- **KEEP THIS SECRET!** Anyone with this can access your S3 buckets!
- You only see this once during IAM user creation
- If lost, you must create a new access key (can't retrieve old ones)

---

### AWS_S3_BUCKET_NAME
**What It Is:** The name of the specific "folder" in S3 where files are stored

**Why You Need It:** Tells the workflow where to upload documents

**Example Value:** `aigent-patient-documents-prod`

**Where Used:** Module 06, 09

**How to Get It:**
1. In AWS Console, go to S3
2. Click "Create bucket"
3. Choose a globally unique name (e.g., `your-clinic-name-documents`)
4. Select a region close to your users
5. **Enable "Block all public access"** (important for privacy!)
6. Click "Create bucket"
7. Use that bucket name

**Beginner Tip:**
- Bucket names must be globally unique across ALL AWS users
- Use lowercase letters, numbers, and dashes only
- Include your organization name to ensure uniqueness
- NEVER make patient document buckets public!

---

### AWS_S3_REGION
**What It Is:** The geographic location where your S3 bucket is stored

**Why You Need It:** Tells the system which AWS data center to connect to

**Example Value:** `us-east-1` (Virginia) or `us-west-2` (Oregon) or `eu-west-1` (Ireland)

**Where Used:** Module 06, 09

**How to Get It:**
1. Go to S3 in AWS Console
2. Click on your bucket name
3. Look at "AWS Region" in the bucket details
4. Use the code format (e.g., `us-east-1`), not the full name (e.g., "US East (N. Virginia)")

**Beginner Tip:**
- Choose a region close to your users (faster uploads/downloads)
- Common regions:
  - `us-east-1`: Virginia (cheapest, most services)
  - `us-west-2`: Oregon (West Coast)
  - `eu-west-1`: Ireland (Europe)
  - `ap-southeast-1`: Singapore (Asia)

---

## OCR Services

**OCR = Optical Character Recognition** — Technology that reads text from images (like scanning an insurance card and extracting the policy number)

### MISTRAL_API_KEY
**What It Is:** Your password for Mistral AI's document reading service

**Why You Need It:** Mistral AI can read text from images with high accuracy

**Example Value:** `mstr_1234567890abcdefghijklmnopqrstuvwxyz`

**Where Used:** Module 06

**How to Get It:**
1. Sign up at https://mistral.ai
2. Go to API section
3. Generate an API key
4. Copy it

**Beginner Tip:**
- Mistral offers competitive pricing
- Good for structured documents (insurance cards, IDs)
- Free tier available for testing

---

### GEMINI_API_KEY
**What It Is:** Your password for Google Gemini AI (Google's document reading service)

**Why You Need It:** Provides an alternative OCR engine with different strengths

**Example Value:** `AIzaSyAbc123Xyz789Def456Ghi789`

**Where Used:** Module 06

**How to Get It:**
1. Go to Google AI Studio: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Choose or create a Google Cloud project
4. Copy the API key

**Beginner Tip:**
- Gemini excels at understanding context and handwriting
- Part of Google Cloud (same account as Google Sheets, Calendar)
- Free quota available for testing

---

### ABBYY_API_KEY
**What It Is:** Your password for ABBYY Cloud OCR (professional-grade document recognition)

**Why You Need It:** ABBYY is industry-leading OCR, especially for complex documents

**Example Value:** `abbyy_1234567890abcdefghijklmnopqrstuvwxyz`

**Where Used:** Module 06

**How to Get It:**
1. Sign up at https://www.abbyy.com/cloud-ocr-sdk/
2. Create an application
3. Generate an API key
4. Copy it

**Beginner Tip:**
- ABBYY is premium OCR (more expensive but highest accuracy)
- Best for complex medical documents with lots of fields
- Free trial available

---

## Analytics & Reporting

### GOOGLE_ANALYTICS_TRACKING_ID
**What It Is:** A code that connects your website to Google Analytics

**Why You Need It:** Track how many people visit your booking page, where they come from, etc.

**Example Value:** `G-XXXXXXXXXX` (GA4) or `UA-XXXXXXXXX-X` (Universal Analytics)

**Where Used:** Module 07

**How to Get It:**
1. Sign up for Google Analytics: https://analytics.google.com
2. Create a property for your website
3. Go to Admin → Property → Data Streams
4. Select your web stream
5. Copy the "Measurement ID" (starts with `G-`)

**Beginner Tip:**
- Google Analytics is free
- GA4 (starts with `G-`) is the newer version — use this one!
- Universal Analytics (`UA-`) is being phased out

---

## Compliance & Audit

### AUDIT_LOG_BACKEND
**What It Is:** Where audit logs are stored (PostgreSQL, Google Sheets, Airtable, or S3)

**Why You Need It:** HIPAA requires keeping records of who accessed what and when

**Example Value:** `postgresql` or `sheets` or `airtable` or `s3`

**Where Used:** Module 09

**How to Get It:** You choose based on your infrastructure!
- `postgresql` = Best for high-security, high-volume (requires database setup)
- `sheets` = Easiest for small clinics (no database needed)
- `airtable` = Good balance of easy + searchable
- `s3` = Archival storage (cheapest for long-term)

**Beginner Tip:**
- Start with `sheets` for simplicity
- Graduate to `postgresql` when you exceed ~10,000 records or need faster searches
- HIPAA requires 7 years of retention (2,555 days)

---

### AUDIT_RETENTION_DAYS
**What It Is:** How long to keep audit logs before deleting them

**Why You Need It:** HIPAA requires 7 years; GDPR has different requirements

**Example Value:** `2555` (7 years for HIPAA)

**Where Used:** Module 09

**How to Get It:** Regulatory requirements:
- **HIPAA (US):** 7 years minimum = `2555` days
- **GDPR (EU):** Varies by purpose, consult legal counsel
- **Best Practice:** `2555` or longer

**Beginner Tip:**
- Don't set this too short — you could violate healthcare laws!
- Don't set it unnecessarily long — uses more storage
- `2555` days is the safe default for healthcare

---

## Security Settings

### HIPAA_MODE
**What It Is:** A master switch that enables extra security checks for healthcare compliance

**Why You Need It:** When enabled, applies stricter data protection and logging

**Example Value:** `true` or `false`

**Where Used:** All modules

**How to Get It:** You choose!
- `false` = Non-healthcare use, or intake forms without medical info
- `true` = Any module handling PHI (Protected Health Information)

**Beginner Tip:**
- Modules 03-10 should ALWAYS have `HIPAA_MODE=true`
- Module 01 can use `false` if only collecting name/email/phone (no medical info)
- When in doubt, use `true` (more secure)

---

### ENABLE_PHI_MASKING
**What It Is:** Automatically hides sensitive information in logs

**Why You Need It:** Prevents accidentally exposing patient data when troubleshooting

**Example Value:** `true` or `false`

**Where Used:** All modules

**How to Get It:** You choose!
- `true` = Production (always mask PHI in logs)
- `false` = Local testing only (see full data for debugging)

**Beginner Tip:**
- ALWAYS `true` in production
- Can use `false` in local development to see actual values
- When PHI masking is on:
  - `jane.doe@example.com` becomes `j***e@example.com`
  - `555-123-4567` becomes `***-***-4567`
  - `123-45-6789` (SSN) becomes `XXX-XX-6789`

---

### TZ (Timezone)
**What It Is:** Your clinic's timezone (used for scheduling, timestamps, and logs)

**Why You Need It:** Ensures appointments and records use the correct local time

**Example Value:** `America/New_York` or `America/Los_Angeles` or `Europe/London`

**Where Used:** All modules

**How to Get It:**
1. Find your timezone name: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
2. Look in the "TZ database name" column
3. Use the format `Continent/City` (e.g., `America/Chicago`, not "CST")

**Common Timezones:**
- `America/New_York` (Eastern Time)
- `America/Chicago` (Central Time)
- `America/Denver` (Mountain Time)
- `America/Los_Angeles` (Pacific Time)
- `America/Phoenix` (Arizona — no DST)
- `Europe/London` (UK)
- `Europe/Paris` (Central Europe)
- `Asia/Tokyo` (Japan)

**Beginner Tip:**
- Use the full name, not abbreviations (`America/New_York`, not `EST`)
- This handles daylight saving time automatically
- If you have multiple clinics in different zones, use the primary clinic's timezone

---

## Performance Tuning

### WORKFLOW_TIMEOUT_MS
**What It Is:** Maximum time (in milliseconds) a workflow can run before being forcibly stopped

**Why You Need It:** Prevents workflows from running forever if something goes wrong

**Example Value:** `120000` (2 minutes)

**Where Used:** All modules

**How to Get It:** Recommendations:
- **Simple workflows (Modules 01, 02, 08):** `60000` (1 minute)
- **Standard workflows (Modules 03, 04, 05):** `120000` (2 minutes)
- **Heavy workflows (Modules 06, 07, 09):** `300000` (5 minutes)

**Beginner Tip:**
- 1000 milliseconds = 1 second
- So `120000` = 120 seconds = 2 minutes
- If workflows time out frequently, increase this value
- If workflows hang, decrease this to fail faster

---

### MAX_PARALLEL_EXECUTIONS
**What It Is:** How many workflow instances can run simultaneously

**Why You Need It:** Controls system load and prevents overwhelming your server

**Example Value:** `10`

**Where Used:** All modules

**How to Get It:** Recommendations based on expected volume:
- **Low volume (<50/day):** `5`
- **Medium volume (50-500/day):** `10`
- **High volume (>500/day):** `25`

**Beginner Tip:**
- Higher numbers = can handle more simultaneous users
- Higher numbers = more server resources needed
- Start with `10` and adjust based on performance

---

## Feature Flags

**Feature Flags = On/Off switches for specific functionality** (lets you enable/disable features without changing code)

### ENABLE_LEAD_SCORING
**What It Is:** Automatically calculate how likely a lead is to convert

**Why You Need It:** Helps prioritize which leads to follow up with first

**Example Value:** `true` or `false`

**Where Used:** Module 01

**How to Get It:** You choose!
- `true` = Calculate lead scores (recommended)
- `false` = Skip scoring (faster, but less insight)

**Beginner Tip:** Lead scoring looks at factors like:
- Email domain (@gmail.com vs. @corporatedomain.com)
- Phone number provided
- Urgency keywords in message
- Time of day submitted

---

### ENABLE_PHONE_NORMALIZATION
**What It Is:** Automatically format phone numbers consistently

**Why You Need It:** Users enter phones many ways: "(555) 123-4567", "555.123.4567", "+1-555-123-4567"

**Example Value:** `true` or `false`

**Where Used:** Modules 01, 02, 05, 08

**How to Get It:** You choose!
- `true` = Normalize all phone numbers to E.164 format (recommended)
- `false` = Store exactly as entered

**What it does:**
- Input: `(555) 123-4567`
- Output: `+15551234567`

**Beginner Tip:** Always use `true` — makes phone numbers usable for SMS and reduces duplicates

---

### ENABLE_PERFORMANCE_TRACKING
**What It Is:** Record how long each workflow execution takes

**Why You Need It:** Identify slow workflows and performance bottlenecks

**Example Value:** `true` or `false`

**Where Used:** All modules

**How to Get It:** You choose!
- `true` = Track execution times (recommended)
- `false` = Skip tracking (slightly faster, no performance data)

**What it tracks:**
- Total execution time
- Time per node
- Categorization (fast <2s, normal 2-5s, slow >5s)

**Beginner Tip:** Use `true` in production — helps you spot problems before users complain

---

## Quick Reference: What Variables Do I Need for Each Module?

### Module 01: Intake & Lead Capture
**Essential:**
- `WEBHOOK_ID`
- `ALLOWED_ORIGINS`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_TAB`
- `GOOGLE_SHEETS_CREDENTIAL_ID`
- `NOTIFICATION_WEBHOOK_URL`

**Optional:**
- `HUBSPOT_CREDENTIAL_ID` (if using HubSpot)
- `ENABLE_LEAD_SCORING`
- `ENABLE_PHONE_NORMALIZATION`

---

### Module 02: Consult Booking & Scheduling
**Essential:**
- `GOOGLE_CALENDAR_ID` or `CAL_COM_API_KEY`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID` (if using SMS confirmations)
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `TZ` (timezone)

**Optional:**
- `GOOGLE_SHEET_ID` (for booking logs)

---

### Module 03: Telehealth Session
**Essential:**
- `ZOOM_ACCOUNT_ID` + `ZOOM_CLIENT_ID` + `ZOOM_CLIENT_SECRET` (or other video platform)
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `ENABLE_PHI_MASKING` (set to `true`!)

**Optional:**
- `DOXYME_API_KEY` (HIPAA-compliant alternative)

---

### Module 04: Billing & Payments
**Essential:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY` (for receipts)
- `ENABLE_PHI_MASKING` (set to `true`!)

---

### Module 05: Follow-Up & Retention
**Essential:**
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `GOOGLE_SHEET_ID` (for engagement tracking)

---

### Module 06: Document Capture & OCR
**Essential:**
- `AWS_S3_ACCESS_KEY_ID`
- `AWS_S3_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `AWS_S3_REGION`
- `MISTRAL_API_KEY` or `GEMINI_API_KEY` (at least one OCR service)
- `ENABLE_PHI_MASKING` (set to `true`!)
- `HIPAA_MODE` (set to `true`!)

---

### Module 07: Analytics & Reporting
**Essential:**
- `GOOGLE_SHEET_ID` (for reading data)
- `SENDGRID_API_KEY` (for emailing reports)
- `TZ` (for date ranges)

**Optional:**
- `GOOGLE_ANALYTICS_TRACKING_ID`

---

### Module 08: Messaging Omnichannel
**Essential:**
- `TWILIO_ACCOUNT_SID` (for SMS)
- `TWILIO_AUTH_TOKEN`
- `SENDGRID_API_KEY` (for email)
- `WEBHOOK_ID` (for incoming messages)
- `NOTIFICATION_WEBHOOK_URL` (for alerts)

---

### Module 09: Compliance & Audit
**Essential:**
- `AUDIT_LOG_BACKEND` (`postgresql`, `sheets`, `airtable`, or `s3`)
- `AUDIT_RETENTION_DAYS` (`2555` for HIPAA)
- `ENABLE_PHI_MASKING` (set to `true`!)
- `HIPAA_MODE` (set to `true`!)
- Backend-specific credentials (e.g., `GOOGLE_SHEETS_CREDENTIAL_ID` if using Sheets)

---

### Module 10: System Orchestration
**Essential:**
- Access to all other modules' environment variables
- `NOTIFICATION_WEBHOOK_URL` (for health check alerts)
- `ERROR_NOTIFICATION_WEBHOOK_URL`

---

## Testing vs. Production Values

**IMPORTANT:** Use different values for testing vs. production!

| Variable | Testing | Production |
|----------|---------|------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `SENDGRID_API_KEY` | Separate key | Separate key |
| `GOOGLE_SHEET_ID` | Test sheet | Production sheet |
| `NOTIFICATION_CHANNEL` | `#test-alerts` | `#leads` |
| `ALLOWED_ORIGINS` | `*` | `https://yourdomain.com` |
| `HIPAA_MODE` | `false` (faster testing) | `true` (required!) |
| `ENABLE_PHI_MASKING` | `false` (see test data) | `true` (required!) |

**Beginner Tip:** Create two `.env` files:
- `.env.testing` — with test credentials
- `.env.production` — with real credentials

Never mix them up!

---

## Security Checklist

Before going live, verify:

✅ All secret keys (Stripe, Twilio, SendGrid, AWS) are set as environment variables (NOT hardcoded in workflows)

✅ `.env` file is in `.gitignore` (never committed to version control)

✅ Production `ALLOWED_ORIGINS` is restrictive (no `*`)

✅ `HIPAA_MODE=true` for all modules handling patient data

✅ `ENABLE_PHI_MASKING=true` in production

✅ Test mode API keys replaced with live mode (Stripe, etc.)

✅ Separate notification channels for errors vs. routine alerts

✅ S3 buckets have "Block all public access" enabled

✅ Audit logging enabled (`AUDIT_LOG_ENABLED=true`)

✅ `SUPPORT_EMAIL` is monitored

✅ All credentials use OAuth2 where possible (not API keys)

---

## Common Mistakes & How to Avoid Them

### Mistake 1: Hardcoding secrets in workflows
❌ **Wrong:** Putting `sk_live_ABC123` directly in a workflow node

✅ **Right:** Using `{{ $env.STRIPE_SECRET_KEY }}` in the node

**Why it matters:** Hardcoded secrets get committed to version control, exposing them publicly.

---

### Mistake 2: Using production API keys for testing
❌ **Wrong:** Testing with `sk_live_...` or real phone numbers

✅ **Right:** Using `sk_test_...` and Twilio test credentials

**Why it matters:** Test runs can charge real credit cards or send SMS to real patients!

---

### Mistake 3: Forgetting to change `ALLOWED_ORIGINS` in production
❌ **Wrong:** Leaving `ALLOWED_ORIGINS=*` in production

✅ **Right:** Setting `ALLOWED_ORIGINS=https://yourdomain.com`

**Why it matters:** Anyone can submit data to your webhook from any website (spam, abuse, fake data).

---

### Mistake 4: Not separating test and production data stores
❌ **Wrong:** Using the same Google Sheet for testing and production

✅ **Right:** Separate sheets: "Leads (TEST)" and "Leads (PRODUCTION)"

**Why it matters:** Test data pollutes production reports; deleting test data might accidentally delete real patient records.

---

### Mistake 5: Disabling PHI masking in production
❌ **Wrong:** `ENABLE_PHI_MASKING=false` in production (to see full logs)

✅ **Right:** `ENABLE_PHI_MASKING=true` always in production

**Why it matters:** Logs containing unmasked PHI violate HIPAA; can result in massive fines.

---

## Getting Help

**If a variable isn't working:**
1. Check spelling (case-sensitive!)
2. Check for extra spaces before/after the value
3. Verify the credential ID exists in n8n
4. Test with a simple value first (e.g., hardcoded string)
5. Check module-specific `Troubleshooting.md`

**If you're missing a credential:**
1. Check which module needs it in the "Where Used" section
2. Follow the "How to Get It" steps carefully
3. Verify it's saved correctly in n8n Credentials
4. Test the credential in isolation (use n8n's "Test" button)

**If you're confused about what a variable does:**
1. Read the "Why You Need It" section above
2. Check the module's `TeachingNotes.md`
3. Look for examples in `/MockData/` folders
4. Ask in your team's support channel (or support@aigent.company)

---

## Glossary

**Environment Variable:** A setting stored outside the workflow code, like a phone number stored in contacts

**Credential:** A saved username/password in n8n (so you don't have to enter it repeatedly)

**API Key:** A password that lets one program talk to another

**Webhook:** A web address that receives data automatically (like a mailbox for programs)

**OAuth2:** A secure "Sign in with..." method (like "Sign in with Google")

**E.164 Format:** International phone number format: `+` + country code + number (e.g., `+15551234567`)

**PHI (Protected Health Information):** Any patient data that must be kept private by law

**HIPAA:** A U.S. law requiring healthcare organizations to protect patient privacy

**S3:** Amazon's file storage service (like Dropbox for programs)

**OCR (Optical Character Recognition):** Technology that reads text from images

**CRM (Customer Relationship Management):** Software for managing customer/patient relationships

**TZ (Timezone):** Your geographic timezone (like `America/New_York`)

---

## Summary

You now understand:
- ✅ What environment variables are and why they're used
- ✅ How to get credentials for each service (Stripe, SendGrid, Twilio, etc.)
- ✅ Which variables are required for each module
- ✅ The difference between test and production values
- ✅ Common security mistakes and how to avoid them
- ✅ Where to find help when stuck

**Next step:** Review `/00_Shared/MockIdentities.json` to see the test data you'll use with these credentials!

---

**Remember:** Environment variables keep your workflows secure, flexible, and easy to maintain. Take time to set them up correctly — it pays off immensely! 🔐
