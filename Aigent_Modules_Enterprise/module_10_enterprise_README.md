# Module 10 Enterprise: System Orchestration Manager

**Version:** enterprise-1.0.0
**Branch:** Enterprise-Only (No Core Version - Pure Enterprise Module)
**Target Users:** Healthcare organizations, medical practices, enterprises managing complex multi-module workflows

---

## Purpose

Enterprise-grade system orchestration platform providing **master workflow coordination**, **cross-module event routing**, **distributed transaction management (Saga pattern)**, **circuit breaker patterns**, **automatic failover**, **health monitoring dashboard**, **real-time alerting**, **distributed tracing**, **service mesh integration**, **API gateway management**, **message queue orchestration**, **workflow templates**, **dependency graph analysis**, **KPI aggregation**, and **executive dashboard**. Designed as the central nervous system for healthcare organizations running the complete Aigent suite (Modules 01-09).

**Key Difference:** This is the ONLY module with no Core version. Module 10 is enterprise-only because orchestration, service mesh, and distributed systems management are inherently enterprise capabilities requiring sophisticated infrastructure.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MODULE 10: ORCHESTRATION LAYER                       │
│                          (Central Command Center)                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
         ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
         │  API Gateway │    │Message Queue│    │Service Mesh │
         │  (Kong/AWS)  │    │(RabbitMQ/SQS)│   │(Istio/Linkerd)│
         └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
                │                   │                   │
    ┌───────────┴───────────────────┴───────────────────┴───────────┐
    │                     Event Router & Orchestrator                │
    │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
    │   │Circuit      │  │Health       │  │Dependency   │          │
    │   │Breaker      │  │Monitor      │  │Graph        │          │
    │   └─────────────┘  └─────────────┘  └─────────────┘          │
    └────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────┬───────┬───────┬───┴───┬───────┬───────┬───────┬───────┐
        │       │       │       │       │       │       │       │       │
    ┌───▼───┐ ┌─▼────┐ ┌─▼────┐ ┌─▼────┐ ┌─▼────┐ ┌─▼────┐ ┌─▼────┐ ┌─▼────┐
    │Module │ │Module│ │Module│ │Module│ │Module│ │Module│ │Module│ │Module│
    │  01   │ │  02  │ │  03  │ │  04  │ │  05  │ │  06  │ │  07  │ │  08  │
    │Intake │ │Book  │ │Tele  │ │Bill  │ │Follow│ │OCR   │ │Analyt│ │Message│
    └───────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
        │       │       │       │       │       │       │       │
        └───────┴───────┴───────┴───────┴───────┴───────┴───────┴────────────┐
                                                                               │
                                                                         ┌─────▼─────┐
                                                                         │  Module   │
                                                                         │    09     │
                                                                         │Compliance │
                                                                         │   Audit   │
                                                                         └───────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     OBSERVABILITY & MONITORING STACK                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Prometheus  │  │   Grafana    │  │ Jaeger/Zipkin│  │   DataDog  │ │
│  │   (Metrics)  │  │ (Dashboards) │  │   (Tracing)  │  │    (APM)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Features Overview

### Core Orchestration Capabilities

**Workflow Orchestration:**
- Event-driven workflow automation (M01 → M02 → M03 → M04 automatic patient journey)
- 10+ pre-built healthcare workflow templates
- Visual workflow builder (drag-and-drop interface)
- Conditional routing (if patient score > 8, book immediately; if < 5, send nurture campaign)
- Parallel execution (send email + SMS + WhatsApp simultaneously)
- Sequential dependencies (wait for payment before starting telehealth session)
- Saga pattern for distributed transactions (rollback on failure)
- Compensation logic (reverse operations if workflow fails mid-stream)

**Error Handling & Resilience:**
- Circuit breaker patterns (prevent cascade failures across modules)
- Automatic retry with exponential backoff (1s, 2s, 4s, 8s, 16s)
- Dead letter queue (DLQ) handling for failed messages
- Fallback strategies (use backup payment gateway if primary fails)
- Timeout management (configurable per module, 5s-60s)
- Bulkhead isolation (module failures don't spread to healthy modules)
- Rate limiting (global: 1000 req/min, per-module: 100 req/min)
- Health check monitoring (all 9 modules every 15 minutes)

**Monitoring & Observability:**
- Distributed tracing (Jaeger, Zipkin, DataDog APM)
- Real-time dashboard (Grafana with Prometheus metrics)
- Module health status visualization (green/yellow/red status tiles)
- Performance metrics (p50/p95/p99 latency, throughput, error rates)
- Alert notifications (PagerDuty, OpsGenie, Slack, Email, SMS)
- Log aggregation (centralized from all 9 modules)
- Service mesh integration (Istio, Linkerd for microservices)

**Infrastructure Components:**
- API Gateway (Kong, AWS API Gateway, Azure API Management)
- Message Queue (RabbitMQ, AWS SQS, Azure Service Bus)
- Cache Layer (Redis Cluster, Memcached)
- Service Registry (Consul, Eureka, etcd for service discovery)
- Configuration Management (Spring Cloud Config, Consul KV)
- Secret Management (HashiCorp Vault, AWS Secrets Manager)

---

## Common Healthcare Workflows

### 1. New Patient Onboarding Journey

**Flow:** M01 → M02 → M08 → M09

**Steps:**
1. **M01 (Lead Capture):** Patient fills intake form on website
   - Capture: Name, email, phone, insurance, chief complaint
   - Score lead: 0-10 (based on urgency, insurance, medical need)
   - Decision: If score ≥ 8 → Fast-track to booking; If score < 5 → Nurture campaign

2. **M02 (Booking):** Auto-schedule first consultation
   - Check Cal.com availability for next 48 hours
   - If urgent (score ≥ 8): Book first available slot
   - If standard (score 5-7): Offer 3 time slots via email
   - Create HubSpot contact + deal

3. **M08 (Messaging):** Send confirmation
   - Email: Appointment details + intake form link
   - SMS: "Your appointment is confirmed for [date] at [time]"
   - WhatsApp (if opted in): Rich media confirmation with clinic photo

4. **M09 (Compliance):** Audit trail
   - Log: Lead captured → Booking created → Messages sent
   - PHI access: Track who viewed patient data

**Timing:** 2-5 minutes end-to-end (from form submit to confirmation sent)

**Error Handling:**
- If M02 fails (Cal.com down): Fallback to manual booking queue, alert staff
- If M08 fails (Twilio down): Retry 3 times, if still fails, queue for later delivery
- If M09 fails: Store events locally, replay when service restored

**Compensation Logic:**
- If booking fails after lead created: Send "We'll contact you soon" email
- If messaging fails: Staff dashboard shows "unconfirmed bookings" alert

---

### 2. Telehealth Session Flow

**Flow:** M02 → M08 (reminder) → M03 → M04 → M05 → M09

**Steps:**
1. **M02 (Booking):** Appointment scheduled (from previous flow)

2. **M08 (Reminder 24h before):**
   - Email: "Your appointment is tomorrow at [time]"
   - SMS: "Reminder: Telehealth session tomorrow [time]. Join link: [url]"
   - Calendar invite update (if integrated with Google Calendar/Outlook)

3. **M03 (Video Session):** Patient joins Zoom/Doxy.me
   - Generate Zoom meeting 30 min before session
   - Send join link via M08
   - Track session: Start time, end time, duration, participants

4. **M04 (Payment):** Process copay after session
   - Charge patient: $50 copay (or insurance-determined amount)
   - If payment fails: Send payment link via M08, retry in 24h
   - Update HubSpot deal: "Payment received"

5. **M05 (Follow-up):** Schedule next appointment
   - If treatment plan requires follow-up: Auto-suggest 2-week follow-up
   - Send personalized email: "Based on your visit, Dr. [name] recommends..."
   - Educational content: Link to condition-specific resources

6. **M09 (Compliance):** Full audit trail
   - Log: Session accessed, duration, provider, patient
   - PHI disclosure: Video meeting created, recordings stored
   - Billing event: Charge processed

**Timing:** 2-4 weeks from initial booking to follow-up scheduled

**Error Handling:**
- **No-show:** If patient doesn't join within 15 min → Mark booking as no-show → Trigger M05 "reschedule" campaign
- **Payment failure:** Retry 3 times over 3 days → If still fails, send "Payment required" email with manual payment link
- **Session quality issue:** If Zoom reports poor connection → Log incident → Send follow-up survey asking if rescheduling needed

---

### 3. Document Processing Pipeline

**Flow:** M06 → Validation → M09 → M04 (optional billing) → M08

**Steps:**
1. **M06 (Upload & OCR):** Patient uploads insurance card, ID, medical records
   - OCR extract: Name, DOB, insurance ID, policy #
   - Validation: Check extracted data against patient record
   - Confidence score: >90% = auto-approve; <90% = manual review queue

2. **Validation (M10 logic):** Verify extracted data
   - Cross-check: Does insurance ID match patient name?
   - Duplicate detection: Has this document been uploaded before?
   - Fraud check: Is this a known fake insurance card image?

3. **M09 (Compliance):** Audit document handling
   - Log: Document uploaded, OCR performed, data extracted
   - PHI handling: Track who accessed document
   - Retention: Store document for 7 years (HIPAA requirement)

4. **M04 (Bill for processing):** Optional charge for document processing
   - If practice charges for records processing: $10 fee
   - Payment processed automatically

5. **M08 (Notify completion):** Confirmation message
   - Email: "Your documents have been processed. Insurance verified: ✓"
   - SMS: "Insurance card received and verified"

**Timing:** 5-15 minutes for OCR + validation

**Error Handling:**
- **Low confidence OCR (<90%):** Route to staff for manual review → Staff corrects → Re-run validation
- **Invalid insurance:** Send message: "We couldn't verify your insurance. Please upload a clear photo."
- **Document too large:** Reject if >10MB → Ask patient to compress or rescan

---

### 4. Payment Failure Recovery

**Flow:** M04 → M08 → Wait 24h → M04 (retry) → If fail → M08 (call required)

**Steps:**
1. **M04 (Initial charge):** Payment declined (insufficient funds, expired card)
   - Log: Payment failed, reason code (51 = insufficient funds, 54 = expired card)
   - Create retry schedule: 24h, 72h, 7 days

2. **M08 (Notify patient):** Immediate notification
   - Email: "Your payment was declined. Please update your payment method: [link]"
   - SMS: "Payment failed. Update card: [link]"
   - In-app notification (if patient portal exists)

3. **Wait 24h:** Scheduled delay before retry

4. **M04 (Auto-retry):** Attempt charge again
   - If patient updated card: New charge attempt
   - If no update: Try original card again (sometimes temporary bank holds resolve)

5. **If still fails:** Escalate to staff intervention
   - M08 sends: "Please call our billing department: (555) 123-4567"
   - Staff dashboard alert: "Outstanding payment: Patient [name], Amount: $150"
   - Create task in HubSpot: "Follow up on failed payment"

**Timing:** 7 days from initial failure to final escalation

**Success Rate:** ~70% of declined payments succeed on retry (after patient updates card)

---

### 5. Daily Operations Workflows

#### Morning Report (7:00 AM)

**Flow:** M07 → Email to admin

**Steps:**
1. **M07 (Analytics):** Generate yesterday's report
   - Metrics: 15 new leads, 8 bookings, $2,400 revenue, 3 sessions completed
   - Charts: Lead sources (Google Ads: 40%, Referral: 30%, Organic: 30%)
   - Alerts: "Booking rate down 10% from last week" (if applicable)

2. **M08 (Email):** Send to admin/manager
   - Recipients: clinic-manager@example.com, doctor@example.com
   - Subject: "Daily Report: Nov 6, 2025 - 15 Leads, $2.4K Revenue"
   - Attachment: report.pdf (20 pages with detailed breakdown)

#### Appointment Reminders (9:00 AM)

**Flow:** M02 → M08

**Steps:**
1. **M02 (Booking):** Query today's appointments
   - Find all appointments scheduled for today
   - Filter: Already confirmed? Already sent reminder?

2. **M08 (Send reminders):** Batch delivery
   - For each appointment (e.g., 12 appointments today):
     - SMS: "Your appointment is today at [time]. See you soon!"
     - Email: Full details + join link if telehealth

**Timing:** All reminders sent within 10 minutes

#### Nightly Cleanup (11:00 PM)

**Flow:** M09 → M07

**Steps:**
1. **M09 (Archive old logs):** Retention policy enforcement
   - Move logs older than 90 days to S3 Glacier (cold storage)
   - Delete logs older than 7 years (unless legal hold)

2. **M07 (Backup analytics):** Data backup
   - Export Google Sheets data to S3
   - Create snapshot of analytics database
   - Verify backup integrity

**Timing:** 30-60 minutes depending on data volume

---

## Setup Instructions

### 1. Prerequisites

**Infrastructure Requirements:**
- Kubernetes cluster (3+ nodes, 8GB RAM each) OR Docker Swarm
- Load balancer (AWS ALB, NGINX, HAProxy)
- Redis cluster (3 nodes for high availability)
- Message queue (RabbitMQ cluster OR AWS SQS)
- Monitoring stack (Prometheus + Grafana OR DataDog)

**Software Requirements:**
- n8n Enterprise (self-hosted OR n8n Cloud Pro)
- Docker 20.10+
- kubectl 1.24+ (if using Kubernetes)
- Helm 3.10+ (for installing monitoring stack)

**Estimated Setup Time:** 4-6 hours for full infrastructure

---

### 2. Infrastructure Setup

#### Option A: Kubernetes Deployment (Recommended for >100K requests/month)

**Step 1: Install Kubernetes Cluster**

Using AWS EKS:
```bash
# Create EKS cluster
eksctl create cluster \
  --name aigent-cluster \
  --region us-east-1 \
  --nodes 3 \
  --node-type t3.large \
  --with-oidc \
  --managed

# Verify cluster
kubectl get nodes
# Should show 3 nodes in Ready state
```

Using Google GKE:
```bash
# Create GKE cluster
gcloud container clusters create aigent-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-standard-4 \
  --enable-autoscaling \
  --min-nodes 3 \
  --max-nodes 10

# Get credentials
gcloud container clusters get-credentials aigent-cluster --zone us-central1-a

# Verify
kubectl get nodes
```

**Step 2: Install Ingress Controller (Load Balancer)**

```bash
# Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=2 \
  --set controller.nodeSelector."kubernetes\.io/os"=linux \
  --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux

# Wait for external IP
kubectl get svc -n ingress-nginx
# Note the EXTERNAL-IP (this will be your API Gateway endpoint)
```

**Step 3: Install Redis Cluster**

```bash
# Add Bitnami repo
helm repo add bitnami https://charts.bitnami.com/bitnami

# Install Redis cluster (3 master nodes, 3 replicas)
helm install redis bitnami/redis-cluster \
  --namespace redis \
  --create-namespace \
  --set cluster.nodes=6 \
  --set cluster.replicas=1 \
  --set password=YOUR_SECURE_PASSWORD

# Get Redis connection string
kubectl get secret --namespace redis redis-cluster -o jsonpath="{.data.redis-password}" | base64 --decode
# Save this password for n8n configuration
```

**Step 4: Install RabbitMQ**

```bash
# Install RabbitMQ cluster
helm install rabbitmq bitnami/rabbitmq \
  --namespace rabbitmq \
  --create-namespace \
  --set replicaCount=3 \
  --set auth.username=admin \
  --set auth.password=YOUR_SECURE_PASSWORD \
  --set clustering.enabled=true

# Get RabbitMQ credentials
kubectl get secret --namespace rabbitmq rabbitmq -o jsonpath="{.data.rabbitmq-password}" | base64 --decode
```

**Step 5: Install Monitoring Stack (Prometheus + Grafana)**

```bash
# Add Prometheus community repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Install Prometheus + Grafana stack
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.retention=30d \
  --set grafana.adminPassword=YOUR_ADMIN_PASSWORD

# Access Grafana
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
# Open browser: http://localhost:3000 (user: admin, password: YOUR_ADMIN_PASSWORD)
```

**Step 6: Install Distributed Tracing (Jaeger)**

```bash
# Install Jaeger operator
kubectl create namespace observability
kubectl create -f https://github.com/jaegertracing/jaeger-operator/releases/download/v1.49.0/jaeger-operator.yaml -n observability

# Deploy Jaeger instance
cat <<EOF | kubectl apply -f -
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: jaeger
  namespace: observability
spec:
  strategy: production
  storage:
    type: elasticsearch
EOF

# Access Jaeger UI
kubectl port-forward -n observability svc/jaeger-query 16686:16686
# Open browser: http://localhost:16686
```

---

#### Option B: Docker Swarm Deployment (Simpler, for <50K requests/month)

**Step 1: Initialize Docker Swarm**

```bash
# On manager node
docker swarm init --advertise-addr YOUR_SERVER_IP

# On worker nodes (run the join command output from previous step)
docker swarm join --token SWMTKN-... YOUR_MANAGER_IP:2377
```

**Step 2: Create Docker Stack (docker-compose.yml)**

```yaml
version: '3.8'

services:
  # API Gateway (NGINX)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure

  # Redis Cluster
  redis-master:
    image: redis:7-alpine
    command: redis-server --requirepass YOUR_PASSWORD --appendonly yes
    volumes:
      - redis-data:/data
    deploy:
      replicas: 1

  redis-replica:
    image: redis:7-alpine
    command: redis-server --requirepass YOUR_PASSWORD --slaveof redis-master 6379 --masterauth YOUR_PASSWORD
    deploy:
      replicas: 2

  # RabbitMQ
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: YOUR_PASSWORD
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    deploy:
      replicas: 1

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    deploy:
      replicas: 1

  # Grafana
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: YOUR_PASSWORD
    volumes:
      - grafana-data:/var/lib/grafana
    deploy:
      replicas: 1

  # n8n (Module 10 orchestrator)
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=YOUR_PASSWORD
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis-master
      - QUEUE_BULL_REDIS_PASSWORD=YOUR_PASSWORD
    volumes:
      - n8n-data:/home/node/.n8n
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure

volumes:
  redis-data:
  rabbitmq-data:
  prometheus-data:
  grafana-data:
  n8n-data:
```

Deploy stack:
```bash
docker stack deploy -c docker-compose.yml aigent
```

---

### 3. API Gateway Configuration

#### Kong API Gateway Setup

**Step 1: Install Kong**

```bash
# Kubernetes
helm install kong kong/kong \
  --namespace kong \
  --create-namespace \
  --set proxy.type=LoadBalancer \
  --set admin.enabled=true

# Docker
docker run -d --name kong \
  -e "KONG_DATABASE=off" \
  -e "KONG_PROXY_ACCESS_LOG=/dev/stdout" \
  -e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" \
  -e "KONG_PROXY_ERROR_LOG=/dev/stderr" \
  -e "KONG_ADMIN_ERROR_LOG=/dev/stderr" \
  -e "KONG_ADMIN_LISTEN=0.0.0.0:8001" \
  -p 8000:8000 \
  -p 8443:8443 \
  -p 8001:8001 \
  kong:latest
```

**Step 2: Configure Routes for All Modules**

```bash
# Module 01: Intake & Lead Capture
curl -i -X POST http://localhost:8001/services \
  --data name=module-01-intake \
  --data url='https://n8n.yourclinic.com/webhook/intake-lead'

curl -i -X POST http://localhost:8001/services/module-01-intake/routes \
  --data 'paths[]=/api/v1/intake' \
  --data 'methods[]=POST'

# Module 02: Booking
curl -i -X POST http://localhost:8001/services \
  --data name=module-02-booking \
  --data url='https://n8n.yourclinic.com/webhook/consult-booking'

curl -i -X POST http://localhost:8001/services/module-02-booking/routes \
  --data 'paths[]=/api/v1/booking' \
  --data 'methods[]=POST'

# ... repeat for modules 03-09
```

**Step 3: Enable Rate Limiting**

```bash
# Global rate limit: 1000 requests/minute
curl -i -X POST http://localhost:8001/plugins \
  --data name=rate-limiting \
  --data config.minute=1000 \
  --data config.policy=redis \
  --data config.redis_host=redis-master \
  --data config.redis_password=YOUR_PASSWORD

# Per-service rate limit (Module 04 - Billing, more restrictive)
curl -i -X POST http://localhost:8001/services/module-04-billing/plugins \
  --data name=rate-limiting \
  --data config.minute=100
```

**Step 4: Enable Authentication**

```bash
# API Key authentication
curl -i -X POST http://localhost:8001/plugins \
  --data name=key-auth

# Create consumer (for each client application)
curl -i -X POST http://localhost:8001/consumers \
  --data username=aigent-mobile-app

curl -i -X POST http://localhost:8001/consumers/aigent-mobile-app/key-auth \
  --data key=YOUR_SECURE_API_KEY
```

---

#### AWS API Gateway Setup (Alternative)

**Step 1: Create REST API**

```bash
# Create API
aws apigateway create-rest-api \
  --name "Aigent Healthcare API" \
  --description "API Gateway for Aigent Modules 01-10" \
  --region us-east-1

# Note the API ID from response
API_ID=abc123xyz
```

**Step 2: Create Resources for Each Module**

```bash
# Get root resource ID
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[?path==`/`].id' \
  --output text)

# Create /intake resource
aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part intake

# Create POST method
INTAKE_RESOURCE_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[?path==`/intake`].id' \
  --output text)

aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $INTAKE_RESOURCE_ID \
  --http-method POST \
  --authorization-type API_KEY \
  --api-key-required

# Set up integration with n8n webhook
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $INTAKE_RESOURCE_ID \
  --http-method POST \
  --type HTTP \
  --integration-http-method POST \
  --uri 'https://n8n.yourclinic.com/webhook/intake-lead'

# ... repeat for other modules
```

**Step 3: Deploy API**

```bash
# Create deployment
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name production

# Your API Gateway URL:
# https://abc123xyz.execute-api.us-east-1.amazonaws.com/production/intake
```

---

### 4. Module 10 Workflow Setup

**Step 1: Import Workflow to n8n**

```bash
# Upload workflow_system_orchestration_manager.json to n8n
# Via UI: n8n → Workflows → Import from File
# Via CLI (if using n8n CLI):
n8n import:workflow --input=workflow_system_orchestration_manager.json
```

**Step 2: Configure Environment Variables**

In n8n, set these variables (Settings → Variables OR .env file):

```bash
# ============================================================================
# CORE SETTINGS
# ============================================================================
BRAND_NAME="Your Clinic Name"
N8N_INSTANCE_ID="production-001"
TIMEZONE="America/New_York"
HIPAA_MODE="true"

# ============================================================================
# SCHEDULING
# ============================================================================
MANAGER_SCHEDULE_CRON="*/15 * * * *"  # Every 15 minutes

# ============================================================================
# THRESHOLDS
# ============================================================================
ERROR_THRESHOLD="5"  # Alert if module has >5 errors in 24h
HEALTH_CHECK_TIMEOUT_MS="10000"  # 10 seconds

# ============================================================================
# STORAGE
# ============================================================================
DASHBOARD_STORAGE="s3"  # or "google_drive"
S3_DASHBOARD_BUCKET="aigent-dashboards"
S3_REGION="us-east-1"
AWS_CREDENTIAL_ID="aws_credentials_id_from_n8n"
SIGNED_URL_TTL_SECONDS="3600"  # 1 hour
ANONYMIZE_DASHBOARD="false"  # Set true if dashboard will be publicly shared

# OR for Google Drive storage:
# DASHBOARD_STORAGE="google_drive"
# GOOGLE_DRIVE_FOLDER_ID="your_folder_id"
# GOOGLE_DRIVE_CREDENTIAL_ID="google_drive_cred_id"

# ============================================================================
# ALERTS
# ============================================================================
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
ALERT_EMAIL="admin@yourclinic.com"
SUPPORT_EMAIL="support@yourclinic.com"

# ============================================================================
# MODULE ENDPOINTS (Webhook URLs for Modules 01-09)
# ============================================================================
MODULE_01_ENDPOINT="https://n8n.yourclinic.com/webhook/intake-lead"
MODULE_02_ENDPOINT="https://n8n.yourclinic.com/webhook/consult-booking"
MODULE_03_ENDPOINT="https://n8n.yourclinic.com/webhook/telehealth-session"
MODULE_04_ENDPOINT="https://n8n.yourclinic.com/webhook/billing-payment"
MODULE_05_ENDPOINT="https://n8n.yourclinic.com/webhook/followup-campaign"
MODULE_06_ENDPOINT="https://n8n.yourclinic.com/webhook/document-capture"
MODULE_07_ENDPOINT="https://n8n.yourclinic.com/webhook/07-analytics-ingest"
MODULE_08_ENDPOINT="https://n8n.yourclinic.com/webhook/messaging-hub-v1"
MODULE_09_ENDPOINT="https://n8n.yourclinic.com/webhook/aigent-audit-log"

# Module Health Check Endpoints (optional, if modules have dedicated /health endpoints)
MODULE_01_HEALTH="https://n8n.yourclinic.com/webhook/intake-lead/health"
MODULE_02_HEALTH="https://n8n.yourclinic.com/webhook/consult-booking/health"
# ... (continue for modules 03-09)

# ============================================================================
# MODULE ENABLE/DISABLE FLAGS
# ============================================================================
ENABLED_01_INTAKE="true"
ENABLED_02_BOOKING="true"
ENABLED_03_TELEHEALTH="true"
ENABLED_04_BILLING="true"
ENABLED_05_FOLLOWUP="true"
ENABLED_06_OCR="true"
ENABLED_07_ANALYTICS="true"
ENABLED_08_MESSAGING="true"
ENABLED_09_COMPLIANCE="true"

# ============================================================================
# MODULE 07 ANALYTICS DATA SOURCE
# ============================================================================
GOOGLE_SHEET_ID="your_google_sheet_id_with_analytics_data"
GOOGLE_SHEETS_CREDENTIAL_ID="6"  # n8n credential ID for Google Sheets

# ============================================================================
# n8n API (for querying workflow execution status)
# ============================================================================
N8N_API_BASE="http://localhost:5678/api/v1"
N8N_API_TOKEN="your_n8n_api_token"

# ============================================================================
# COMPLIANCE ENDPOINT
# ============================================================================
COMPLIANCE_ENDPOINT="https://n8n.yourclinic.com/webhook/aigent-audit-log"

# ============================================================================
# KPI THRESHOLDS (JSON string)
# ============================================================================
KPI_THRESHOLDS_JSON='{"min_leads_24h":10,"min_lead_to_booking_rate":0.4,"min_nps":8.0}'

# ============================================================================
# MODULE-SPECIFIC CREDENTIALS (validate these are set)
# ============================================================================
HUBSPOT_CREDENTIAL_ID="hubspot_cred_id"
CALCOM_API_KEY="cal_live_abc123xyz"
ZOOM_CREDENTIAL_ID="zoom_cred_id"
STRIPE_CREDENTIAL_ID="stripe_cred_id"
SENDGRID_CREDENTIAL_ID="sendgrid_cred_id"
TWILIO_CREDENTIAL_ID="twilio_cred_id"
MISTRAL_CREDENTIAL_ID="mistral_cred_id"
POSTGRES_CREDENTIAL_ID="postgres_cred_id"
```

**Step 3: Set Up Credentials in n8n**

n8n → Settings → Credentials → Add Credential

Required credentials:
1. **AWS S3** (for dashboard storage)
   - Access Key ID
   - Secret Access Key
   - Region

2. **Google Sheets** (for Module 07 analytics data source)
   - OAuth2 connection OR Service Account JSON

3. **HubSpot** (for modules 01-05, 08)
   - API Key OR OAuth2

4. **Stripe** (for Module 04)
   - API Key (secret key: sk_live_...)

5. **Twilio** (for Module 05, 08)
   - Account SID
   - Auth Token

6. **SendGrid** (for Module 05, 08)
   - API Key

7. **Zoom** (for Module 03)
   - API Key + Secret OR OAuth2

8. **PostgreSQL** (for Module 09 if using postgres storage)
   - Host, port, database, username, password

---

### 5. Health Check Implementation

Module 10 pings each module every 15 minutes to check health. Each module should implement a health check endpoint.

**Option A: Dedicated /health endpoint (recommended)**

Modify each module workflow to add a health check webhook:

```javascript
// Add to each module (e.g., Module 01)
// New webhook node: GET /webhook/intake-lead/health

// Health check response:
{
  "status": "healthy",  // or "degraded" or "down"
  "last_run": "2025-11-06T14:30:00Z",  // ISO timestamp of last execution
  "errors_24h": 0,  // Count of errors in last 24 hours
  "uptime_seconds": 12345,  // How long module has been running
  "version": "1.5.0"
}
```

**Option B: Use n8n API to query execution status**

Module 10 queries n8n API for recent executions:

```bash
# Get recent executions for Module 01 workflow
curl -X GET "http://localhost:5678/api/v1/executions?workflowId=MODULE_01_WORKFLOW_ID&limit=100&status=error" \
  -H "X-N8N-API-KEY: your_api_token"

# Response: Array of error executions
# Count errors in last 24 hours → errors_24h
```

**Implementation in Module 10:**

Node 1004 (Health Checks Framework) uses HTTP Request nodes to ping each module:

```javascript
// For each enabled module:
// HTTP Request node
// - Method: GET
// - URL: {{MODULE_XX_HEALTH}} (e.g., MODULE_01_HEALTH)
// - Timeout: 10000ms
// - Retry: maxTries=2, waitBetweenTries=1000ms
// - continueOnFail: true

// If response.status === "healthy": Mark module healthy
// If response.status === "degraded": Mark module degraded
// If no response (timeout): Mark module down
```

---

### 6. Dashboard Publishing

Module 10 generates an HTML dashboard and publishes it to S3 or Google Drive.

**S3 Publishing Setup:**

```bash
# Create S3 bucket
aws s3 mb s3://aigent-dashboards

# Enable versioning (keep history of dashboards)
aws s3api put-bucket-versioning \
  --bucket aigent-dashboards \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket aigent-dashboards \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Set bucket policy (if HIPAA_MODE=false and dashboard is public)
aws s3api put-bucket-policy \
  --bucket aigent-dashboards \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::aigent-dashboards/*"
    }]
  }'

# If HIPAA_MODE=true: Keep bucket private, use signed URLs
```

**Module 10 Node 1009 Configuration:**

Add AWS S3 node after Node 1008 (Render Dashboard HTML):

```javascript
// AWS S3 Upload node
// - Credential: AWS_CREDENTIAL_ID
// - Bucket Name: {{S3_DASHBOARD_BUCKET}}
// - File Name: manager-dashboard/dashboard_{{$now.format('YYYY-MM-DD_HH-mm')}}.html
// - Binary Data: false (upload HTML string)
// - Body: {{$json.dashboard.html}}
// - Content-Type: text/html
// - ACL: private (if HIPAA) OR public-read (if not HIPAA)
// - Server-Side Encryption: AES256

// Then: Generate Signed URL (if HIPAA_MODE)
// AWS S3 Get Signed URL node
// - Credential: AWS_CREDENTIAL_ID
// - Bucket: {{S3_DASHBOARD_BUCKET}}
// - Key: {{previous_node_output.Key}}
// - Expires In: {{SIGNED_URL_TTL_SECONDS}}
// - HTTP Method: GET
```

**Google Drive Publishing Setup:**

```bash
# Create dedicated folder in Google Drive for dashboards
# Note the folder ID from URL: https://drive.google.com/drive/folders/FOLDER_ID

# Set folder ID in environment
GOOGLE_DRIVE_FOLDER_ID="your_folder_id"
```

Add Google Drive node after Node 1008:

```javascript
// Google Drive Upload node
// - Credential: GOOGLE_DRIVE_CREDENTIAL_ID
// - Resource: File
// - Operation: Upload
// - Name: manager_dashboard_{{$now.format('YYYY-MM-DD_HH-mm')}}.html
// - Parents: {{GOOGLE_DRIVE_FOLDER_ID}}
// - Binary Data: false
// - File Content: {{$json.dashboard.html}}
// - MIME Type: text/html

// Then: Get Shareable Link
// Google Drive node
// - Resource: File
// - Operation: Share
// - File ID: {{previous_node_output.id}}
// - Type: anyone (if not HIPAA) OR user (if HIPAA)
// - Role: reader
```

---

### 7. Alerting Setup

**Slack Alerting:**

1. Create Slack app: https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Add webhook to workspace
4. Copy webhook URL → Set as `SLACK_WEBHOOK_URL`

**PagerDuty Integration (for critical alerts):**

```bash
# Install PagerDuty integration in Slack
# OR use PagerDuty API directly

# Add HTTP Request node after Node 1011 (Notify Alerts)
# - Method: POST
# - URL: https://events.pagerduty.com/v2/enqueue
# - Headers: Content-Type: application/json
# - Body:
{
  "routing_key": "YOUR_PAGERDUTY_INTEGRATION_KEY",
  "event_action": "trigger",
  "payload": {
    "summary": "Aigent System Alert: {{$json.alerts.summary.critical_count}} Critical Issues",
    "severity": "critical",
    "source": "Module 10 Orchestration",
    "custom_details": {
      "system_health": "{{$json.health.system_health}}",
      "total_alerts": "{{$json.alerts.summary.total_alerts}}",
      "dashboard_url": "{{$json.publish.dashboard_url}}"
    }
  }
}
```

**SMS Alerting (for critical issues):**

Use Twilio node to send SMS to on-call engineer:

```javascript
// If node: alerts.summary.critical_count > 0
// Twilio Send SMS node
// - Credential: TWILIO_CREDENTIAL_ID
// - From: +15551234567 (your Twilio number)
// - To: +15559876543 (on-call engineer)
// - Message: "🚨 CRITICAL: {{$json.alerts.summary.critical_count}} critical alerts in Aigent system. View dashboard: {{$json.publish.dashboard_url}}"
```

---

### 8. Distributed Tracing Setup

**Jaeger Integration:**

Module 10 generates trace IDs for each execution. To enable full distributed tracing across modules:

**Step 1: Add trace context to all inter-module calls**

In each module workflow, when calling another module, pass trace ID:

```javascript
// Module 01 calling Module 02
// HTTP Request node
// Headers:
{
  "X-Trace-ID": "{{$json.trace_id}}",
  "X-Parent-Span-ID": "module-01-span-{{$now.toMillis()}}",
  "X-Service-Name": "Module-01-Intake"
}
```

**Step 2: Configure Jaeger agent on each n8n instance**

```bash
# Run Jaeger agent as sidecar container
docker run -d \
  --name jaeger-agent \
  --network=host \
  -e REPORTER_GRPC_HOST_PORT=jaeger-collector:14250 \
  jaegertracing/jaeger-agent:latest
```

**Step 3: Add Jaeger tracing code to Module 10**

```javascript
// Node 1002 (Load Configuration)
// Add Jaeger tracing initialization

const { initTracer } = require('jaeger-client');

const config = {
  serviceName: 'aigent-module-10-orchestration',
  sampler: { type: 'const', param: 1 },
  reporter: { logSpans: true, agentHost: 'localhost', agentPort: 6831 }
};

const tracer = initTracer(config);

// Create span for orchestration execution
const span = tracer.startSpan('orchestration-run');
span.setTag('trace_id', trace_id);
span.setTag('system_health', health.system_health);

// End span at Node 1012 (Respond - Success)
span.finish();
```

---

### 9. Service Mesh Integration (Optional, Advanced)

For microservices architecture with Modules 01-09 as separate services:

**Istio Setup:**

```bash
# Install Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.19.0
export PATH=$PWD/bin:$PATH

# Install Istio on Kubernetes cluster
istioctl install --set profile=production -y

# Enable automatic sidecar injection
kubectl label namespace default istio-injection=enabled

# Deploy Istio ingress gateway
kubectl apply -f samples/addons/prometheus.yaml
kubectl apply -f samples/addons/grafana.yaml
kubectl apply -f samples/addons/jaeger.yaml
kubectl apply -f samples/addons/kiali.yaml

# Access Kiali dashboard (service mesh visualization)
istioctl dashboard kiali
```

**Benefits:**
- Automatic mTLS between modules (encrypted communication)
- Circuit breaker patterns (prevent cascade failures)
- Retry and timeout policies (configurable per service)
- Traffic splitting (A/B testing, canary deployments)
- Distributed tracing (automatic span creation)

---

### 10. Testing the Orchestration Layer

**Test 1: Health Check Execution**

```bash
# Manually trigger orchestration workflow
curl -X POST https://n8n.yourclinic.com/webhook/manager/control \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "test"
  }'

# Expected response:
{
  "success": true,
  "timestamp": "2025-11-06T14:30:00.000Z",
  "env_ok": true,
  "modules": {
    "01_intake": {"status": "healthy", "errors_24h": 0},
    "02_booking": {"status": "healthy", "errors_24h": 1},
    ...
  },
  "kpis": {
    "leads_24h": 15,
    "bookings_24h": 8,
    "revenue_24h_usd": 1200.00
  },
  "alerts": [],
  "links": {
    "dashboard_html": "https://aigent-dashboards.s3.amazonaws.com/manager-dashboard/dashboard_2025-11-06_14-30.html"
  },
  "metadata": {
    "trace_id": "MANAGER-1730905800000",
    "execution_time_ms": 3456
  }
}
```

**Test 2: Simulate Module Failure**

```bash
# Disable Module 02 temporarily
# In n8n, deactivate Module 02 workflow

# Wait 15 minutes for next scheduled health check
# OR manually trigger:
curl -X POST https://n8n.yourclinic.com/webhook/manager/control \
  -d '{"action": "test"}'

# Expected: Alert notification sent to Slack
# Slack message:
# "🚨 System Alert: Your Clinic Name
#  System Health: CRITICAL
#  Total Alerts: 1 (1 critical, 0 warnings)
#
#  🔴 Critical Alerts (1):
#  • Module Down: Consult Booking: Module not responding to health checks
#
#  → Investigate module logs and restart if necessary"
```

**Test 3: KPI Threshold Breach**

```bash
# Set low threshold for testing
KPI_THRESHOLDS_JSON='{"min_leads_24h":100}'  # Unrealistically high threshold

# Trigger orchestration
curl -X POST https://n8n.yourclinic.com/webhook/manager/control \
  -d '{"action": "test"}'

# Expected: Warning alert
# "⚠️ Warning Alerts (1):
#  • KPI Threshold Breached: Lead volume (15) below threshold (100)"
```

**Test 4: Dashboard Generation**

```bash
# Access generated dashboard
# Open URL from response.links.dashboard_html

# Verify dashboard shows:
# - System Health Overview (tiles: Overall Status, Environment Config, Dependency Graph, Errors)
# - Active Alerts (if any)
# - Module Status Grid (9 modules with color-coded status)
# - Key Performance Indicators (6 KPI tiles: Leads, Bookings, Revenue, Conversion, Show Rate, NPS)
# - System Information (Instance ID, Trace ID, Version, HIPAA Mode)
```

---

## Response Examples

### Success Response (200)

```json
{
  "success": true,
  "timestamp": "2025-11-06T14:30:00.000Z",
  "env_ok": true,
  "modules": {
    "01_intake": {
      "status": "healthy",
      "last_run": "2025-11-06T14:15:00Z",
      "errors_24h": 0,
      "response_time_ms": 245,
      "enabled": true
    },
    "02_booking": {
      "status": "healthy",
      "last_run": "2025-11-06T14:20:00Z",
      "errors_24h": 1,
      "response_time_ms": 310,
      "enabled": true
    },
    "03_telehealth": {
      "status": "healthy",
      "last_run": "2025-11-06T13:45:00Z",
      "errors_24h": 0,
      "response_time_ms": 420,
      "enabled": true
    },
    "04_billing": {
      "status": "degraded",
      "last_run": "2025-11-06T14:25:00Z",
      "errors_24h": 6,
      "response_time_ms": 580,
      "enabled": true
    },
    "05_followup": {
      "status": "healthy",
      "last_run": "2025-11-06T12:00:00Z",
      "errors_24h": 0,
      "response_time_ms": 190,
      "enabled": true
    },
    "06_ocr": {
      "status": "disabled",
      "last_run": null,
      "errors_24h": 0,
      "response_time_ms": null,
      "enabled": false
    },
    "07_analytics": {
      "status": "healthy",
      "last_run": "2025-11-06T07:00:00Z",
      "errors_24h": 0,
      "response_time_ms": 520,
      "enabled": true
    },
    "08_messaging": {
      "status": "healthy",
      "last_run": "2025-11-06T14:28:00Z",
      "errors_24h": 2,
      "response_time_ms": 280,
      "enabled": true
    },
    "09_compliance": {
      "status": "healthy",
      "last_run": "2025-11-06T14:29:00Z",
      "errors_24h": 0,
      "response_time_ms": 310,
      "enabled": true
    }
  },
  "kpis": {
    "leads_24h": 15,
    "bookings_24h": 8,
    "revenue_24h_usd": 1200.00,
    "nps_avg_30d": 8.5,
    "errors_24h": 9
  },
  "alerts": [
    {
      "severity": "warning",
      "category": "health",
      "title": "Module Degraded: Billing & Payments",
      "message": "6 errors in last 24 hours (threshold: 5)"
    }
  ],
  "links": {
    "dashboard_html": "https://aigent-dashboards.s3.amazonaws.com/manager-dashboard/dashboard_2025-11-06_14-30.html",
    "analytics_report": null,
    "audit_stream": "https://n8n.yourclinic.com/webhook/aigent-audit-log"
  },
  "metadata": {
    "version": "1.0.0",
    "manager": "10_System_Orchestration_Manager",
    "instance_id": "production-001",
    "trace_id": "MANAGER-1730905800000",
    "execution_time_ms": 3456,
    "control_action": null,
    "hipaa_mode": true
  }
}
```

### Critical Alert Response

```json
{
  "success": true,
  "timestamp": "2025-11-06T14:30:00.000Z",
  "env_ok": false,
  "modules": {
    "01_intake": {"status": "healthy", "errors_24h": 0, "enabled": true},
    "02_booking": {"status": "down", "last_run": "2025-11-05T10:00:00Z", "errors_24h": 0, "enabled": true},
    "03_telehealth": {"status": "healthy", "errors_24h": 0, "enabled": true},
    "04_billing": {"status": "healthy", "errors_24h": 1, "enabled": true},
    "05_followup": {"status": "healthy", "errors_24h": 0, "enabled": true},
    "06_ocr": {"status": "disabled", "enabled": false},
    "07_analytics": {"status": "healthy", "errors_24h": 0, "enabled": true},
    "08_messaging": {"status": "healthy", "errors_24h": 0, "enabled": true},
    "09_compliance": {"status": "healthy", "errors_24h": 0, "enabled": true}
  },
  "kpis": {
    "leads_24h": 15,
    "bookings_24h": 0,
    "revenue_24h_usd": 0.00,
    "nps_avg_30d": 8.5,
    "errors_24h": 1
  },
  "alerts": [
    {
      "severity": "critical",
      "category": "configuration",
      "title": "Missing Required Environment Variable",
      "message": "STRIPE_CREDENTIAL_ID or SQUARE_CREDENTIAL_ID (required for Module 04)"
    },
    {
      "severity": "critical",
      "category": "health",
      "module": "02_booking",
      "title": "Module Down: Consult Booking",
      "message": "No execution in 28 hours",
      "action": "Investigate module logs and restart if necessary"
    },
    {
      "severity": "critical",
      "category": "dependency",
      "module": "02_booking",
      "title": "Module down in critical path",
      "message": "Impact: Patient journey blocked",
      "action": "Restore module health to ensure data flow"
    }
  ],
  "links": {
    "dashboard_html": "https://aigent-dashboards.s3.amazonaws.com/manager-dashboard/dashboard_2025-11-06_14-30.html",
    "analytics_report": null,
    "audit_stream": "https://n8n.yourclinic.com/webhook/aigent-audit-log"
  },
  "metadata": {
    "version": "1.0.0",
    "manager": "10_System_Orchestration_Manager",
    "instance_id": "production-001",
    "trace_id": "MANAGER-1730905800000",
    "execution_time_ms": 2890,
    "control_action": null,
    "hipaa_mode": true
  }
}
```

### Error Response (500)

```json
{
  "success": false,
  "error": "Failed to fetch KPI data from Module 07 Analytics",
  "error_type": "OrchestrationError",
  "stage": "kpi_aggregation",
  "trace_id": "MANAGER-1730905800000",
  "timestamp": "2025-11-06T14:30:00.000Z",
  "metadata": {
    "module": "10_System_Orchestration_Manager",
    "version": "1.0.0",
    "handler": "error_handler"
  }
}
```

---

## Cost Analysis

### Enterprise Infrastructure Costs

| Component | Provider | Tier | Monthly Cost | Notes |
|-----------|----------|------|--------------|-------|
| **Compute** |
| Kubernetes Cluster | AWS EKS | 3 nodes (t3.large) | $150 | 8GB RAM each |
| OR Docker Swarm | Self-hosted | 3 VMs (4 cores, 8GB) | $120 | DigitalOcean/Linode |
| **Load Balancer** |
| AWS ALB | AWS | Standard | $18 | $0.0225/hour + data transfer |
| OR NGINX Ingress | Self-hosted | Included in compute | $0 | |
| **API Gateway** |
| Kong Enterprise | Self-hosted | Open source | $0 | OR Kong Konnect: $200/month |
| AWS API Gateway | AWS | Standard | $100 | ~30K requests/day |
| **Message Queue** |
| RabbitMQ Cluster | Self-hosted | 3 nodes | $75 | OR AWS MQ: $200/month |
| AWS SQS | AWS | Standard | $20 | $0.40 per million requests |
| **Cache** |
| Redis Cluster | Self-hosted | 3 nodes | $60 | OR AWS ElastiCache: $150/month |
| **Monitoring** |
| Prometheus + Grafana | Self-hosted | Open source | $0 | Included in compute |
| DataDog APM | DataDog | Pro | $150 | 5 hosts, 15M spans/month |
| **Distributed Tracing** |
| Jaeger | Self-hosted | Open source | $0 | Included in compute |
| DataDog APM | DataDog | Included | $0 | Bundled with monitoring |
| **Service Mesh** |
| Istio | Self-hosted | Open source | $0 | +10% compute overhead |
| AWS App Mesh | AWS | Standard | $0.025/proxy/hour | ~$50/month for 3 proxies |
| **Storage** |
| S3 (dashboard storage) | AWS | Standard | $5 | 100 GB dashboards |
| **Total (Self-Hosted Stack)** | | | $428/month | EKS + self-hosted components |
| **Total (Managed Stack)** | | | $763/month | AWS managed services |
| **Total (Premium Stack)** | | | $863/month | With DataDog APM |

### Cost by Workload

**Light Workload (<10K requests/day):**
- Docker Swarm (3 small VMs): $120
- Self-hosted components: $60 (Redis) + $75 (RabbitMQ)
- S3 storage: $5
- **Total: $260/month**

**Medium Workload (10K-100K requests/day):**
- Kubernetes EKS (3 t3.large): $150
- Self-hosted stack: $135 (Redis + RabbitMQ)
- AWS API Gateway: $100
- S3 storage: $10
- **Total: $395/month**

**Heavy Workload (>100K requests/day):**
- Kubernetes EKS (5 t3.xlarge): $400
- Managed Redis: $150
- Managed RabbitMQ: $200
- AWS API Gateway: $300
- DataDog APM: $150
- S3 storage: $20
- **Total: $1,220/month**

### ROI Calculation

**Without Module 10 (Manual Orchestration):**
- DevOps engineer time: 40 hours/month @ $100/hour = $4,000
- Monitoring tools: $200
- Incident response: 20 hours/month @ $150/hour = $3,000 (slower response)
- Downtime cost: 2 hours/month @ $5,000/hour = $10,000
- **Total monthly cost: $17,200**

**With Module 10 (Automated Orchestration):**
- Infrastructure: $863 (premium stack with DataDog)
- DevOps engineer time: 10 hours/month @ $100/hour = $1,000 (mostly reviewing alerts)
- Incident response: 5 hours/month @ $150/hour = $750 (faster with automated alerts)
- Downtime: 0.2 hours/month @ $5,000/hour = $1,000 (99.9% uptime)
- **Total monthly cost: $3,613**

**Monthly Savings: $17,200 - $3,613 = $13,587**

**Annual Savings: $163,044**

**Additional Benefits (Not Monetized):**
- 99.9% uptime SLA (vs 98% manual)
- Real-time alerting (seconds vs hours)
- Distributed tracing (debug issues 10x faster)
- Executive dashboard (KPIs visible to leadership)
- HIPAA compliance (audit trail for orchestration layer)

---

## HIPAA Compliance

### Orchestration Layer Security

**1. End-to-End Encryption:**
- TLS 1.3 for all inter-module communication
- mTLS (mutual TLS) if using service mesh (Istio)
- PHI never logged in plain text (use trace IDs only)

**2. Audit Trail:**
- All orchestration events logged to Module 09
- Track: Which module called which, when, with what trace_id
- Retain: 7 years (HIPAA requirement)

**3. PHI Handling:**
- Dashboard MUST NOT display PHI (only aggregated metrics)
- If ANONYMIZE_DASHBOARD=true: Replace patient names with "Patient A", "Patient B"
- Signed URLs for dashboard (time-limited access, 1 hour default)

**4. Access Control:**
- Dashboard URL should NOT be publicly accessible (use signed URLs)
- API Gateway requires authentication (API keys, OAuth2)
- Role-based access control (RBAC): Only admins can view orchestration dashboard

**5. Network Segmentation:**
- Modules should run in private VPC subnets (not public-facing)
- API Gateway in public subnet (edge layer)
- Orchestration layer in management subnet (separate from patient data)

**6. Secret Management:**
- Use AWS Secrets Manager or HashiCorp Vault for credentials
- Rotate API keys every 90 days
- Never commit secrets to git (use .env files, gitignored)

**HIPAA Orchestration Checklist:**

- PHI data is never passed through message queue (only patient IDs, trace IDs)
- Dashboard does not expose PHI (only aggregate counts)
- Signed URLs used for dashboard access (time-limited)
- All inter-module calls logged to Module 09
- Network traffic encrypted (TLS 1.3)
- Service-to-service authentication (API keys or mTLS)
- Secrets stored in vault (not environment variables in plain text)
- Audit logs retained for 7 years
- Incident response plan documented (runbook)

---

## Troubleshooting

### Issue 1: Health Check Failing for All Modules

**Symptoms:**
- All modules show status "down"
- Dashboard shows "System Health: CRITICAL"
- No errors in module logs

**Causes:**
1. Health check timeout too short (10s default)
2. Network connectivity issue (firewall blocking)
3. Module endpoints incorrect (typo in URL)

**Solutions:**

1. **Increase health check timeout:**
```bash
HEALTH_CHECK_TIMEOUT_MS="30000"  # Increase to 30 seconds
```

2. **Verify network connectivity:**
```bash
# From orchestration server, test each module endpoint
curl -v https://n8n.yourclinic.com/webhook/intake-lead

# Check for:
# - Connection timeout (firewall issue)
# - SSL certificate errors (use curl -k to bypass, but fix cert)
# - 404 Not Found (wrong URL)
```

3. **Verify module endpoints:**
```bash
# In n8n, check each module's webhook URL
# Modules → Module 01 → Webhook node → Settings → Webhook Path
# Should match MODULE_01_ENDPOINT
```

4. **Check n8n logs:**
```bash
# Docker
docker logs n8n

# Kubernetes
kubectl logs -n n8n deployment/n8n

# Look for errors like:
# "Webhook execution failed: timeout after 10000ms"
```

---

### Issue 2: Dashboard Not Publishing to S3

**Symptoms:**
- Orchestration completes successfully
- No dashboard URL in response
- Error: "Failed to upload dashboard to S3"

**Causes:**
1. AWS credentials invalid or expired
2. S3 bucket doesn't exist
3. IAM permissions missing (PutObject denied)

**Solutions:**

1. **Verify AWS credentials:**
```bash
# Test AWS credentials
aws s3 ls s3://aigent-dashboards/ --profile n8n

# If error "Unable to locate credentials":
# Credentials not set or wrong profile
```

2. **Check S3 bucket exists:**
```bash
# List all buckets
aws s3 ls

# If aigent-dashboards not listed:
aws s3 mb s3://aigent-dashboards
```

3. **Verify IAM permissions:**
```bash
# Get IAM user policy
aws iam get-user-policy --user-name n8n-service-account --policy-name n8n-s3-access

# Required permissions:
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
      "arn:aws:s3:::aigent-dashboards",
      "arn:aws:s3:::aigent-dashboards/*"
    ]
  }]
}

# If missing, add policy:
aws iam put-user-policy --user-name n8n-service-account --policy-name n8n-s3-access --policy-document file://policy.json
```

4. **Check n8n S3 node configuration:**
```javascript
// In Module 10, Node 1009 (Publish Dashboard)
// Verify S3 node settings:
// - Credential: Correct AWS credential selected
// - Bucket Name: {{$env.S3_DASHBOARD_BUCKET}} (resolves to aigent-dashboards)
// - Region: {{$env.S3_REGION}} (resolves to us-east-1)
// - File Name: manager-dashboard/dashboard_{{$now.format('YYYY-MM-DD_HH-mm')}}.html

// Test execution:
// n8n → Workflows → Module 10 → Test workflow
// Check Node 1009 output for errors
```

---

### Issue 3: Alerts Not Sending to Slack

**Symptoms:**
- Critical alerts detected
- No Slack notification received
- Response shows "notifications.sent: true"

**Causes:**
1. Slack webhook URL invalid or expired
2. Slack channel deleted or bot removed
3. Slack API rate limit exceeded

**Solutions:**

1. **Verify Slack webhook URL:**
```bash
# Test webhook manually
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d '{"text": "Test message from Aigent Module 10"}'

# Expected response: "ok"
# If error "invalid_payload": Webhook URL is wrong
# If error "channel_not_found": Channel was deleted
```

2. **Regenerate webhook:**
```bash
# Go to: https://api.slack.com/apps
# Select your app → Incoming Webhooks → Reinstall to Workspace
# Copy new webhook URL → Update SLACK_WEBHOOK_URL
```

3. **Check Slack rate limits:**
```bash
# Slack allows ~1 message per second per webhook
# If sending multiple alerts rapidly, add delay between messages

# In Module 10, Node 1011 (Notify Alerts):
# Add Wait node after Slack HTTP Request
# Wait duration: 1000ms (1 second)
```

4. **Enable detailed logging:**
```javascript
// In Module 10, Node 1011 (Notify Alerts)
// Add logging before Slack HTTP Request:

console.log('Sending Slack alert:', JSON.stringify($json.notifications.channels.slack.message, null, 2));

// Check n8n execution logs for logged message
// Verify message structure matches Slack API requirements
```

---

### Issue 4: KPI Data Not Loading from Module 07

**Symptoms:**
- Dashboard shows "KPI data unavailable"
- kpis object is empty or null
- Error: "Failed to fetch KPI data from Module 07 Analytics"

**Causes:**
1. Module 07 not enabled or not running
2. Google Sheets ID incorrect
3. Google Sheets credentials expired

**Solutions:**

1. **Verify Module 07 is enabled and running:**
```bash
# Check Module 07 status
curl https://n8n.yourclinic.com/webhook/07-analytics-ingest/health

# If 404: Module 07 not deployed
# If timeout: Module 07 down

# Enable Module 07:
ENABLED_07_ANALYTICS="true"
```

2. **Verify Google Sheets ID:**
```bash
# Google Sheets URL format:
# https://docs.google.com/spreadsheets/d/SHEET_ID/edit

# Copy SHEET_ID and set:
GOOGLE_SHEET_ID="1A2B3C4D5E6F7G8H9I0J"

# Test access:
# Open Google Sheets in browser
# If "You need permission": Share sheet with n8n service account email
```

3. **Verify Google Sheets credentials:**
```bash
# In n8n: Settings → Credentials → Google Sheets
# Test connection: "Test Connection" button
# If error "Invalid credentials": Re-authenticate OAuth2

# OR use Service Account:
# Google Cloud Console → IAM & Admin → Service Accounts
# Create service account → Download JSON key
# Share Google Sheet with service account email (e.g., n8n-service@project.iam.gserviceaccount.com)
```

4. **Check Google Sheets structure:**
```javascript
// Module 07 should output data in this format:
// Sheet name: "KPI_Summary" OR "Analytics"
// Columns: | metric_name | period | value | timestamp |
//          | leads       | 24h    | 15    | 2025-... |
//          | bookings    | 24h    | 8     | 2025-... |

// In Module 10, Node 1006 (KPI Aggregation):
// Add Google Sheets Read node:
// - Credential: GOOGLE_SHEETS_CREDENTIAL_ID
// - Document ID: GOOGLE_SHEET_ID
// - Sheet Name: KPI_Summary
// - Range: A1:Z100

// Map sheet data to KPI structure:
const kpis = {};
for (const row of $input.all()) {
  const metric = row.json.metric_name;
  const period = row.json.period;
  const value = row.json.value;

  kpis[`${metric}_${period}`] = value;
}
```

---

### Issue 5: Circuit Breaker Tripped - Module Unavailable

**Symptoms:**
- Module shows "down" status
- Error: "Circuit breaker open for module 04_billing"
- Requests to module return 503 Service Unavailable

**Causes:**
1. Module has too many consecutive failures (default threshold: 5)
2. Circuit breaker timeout not yet expired (default: 60 seconds)
3. Module still unhealthy after timeout

**Solutions:**

1. **Check circuit breaker status:**
```javascript
// Circuit breaker state stored in Redis
// Key: circuit_breaker:module_04_billing
// Value: {"state": "open", "failures": 7, "last_failure": "2025-11-06T14:30:00Z"}

// Check Redis:
redis-cli
> GET circuit_breaker:module_04_billing
> "{\"state\":\"open\",\"failures\":7,\"last_failure\":\"2025-11-06T14:30:00Z\"}"

// Circuit breaker states:
// - "closed": Normal operation, requests allowed
// - "open": Too many failures, requests blocked (fast-fail)
// - "half_open": Testing if service recovered, allow 1 request
```

2. **Wait for circuit breaker timeout:**
```bash
# Circuit breaker opens after 5 failures
# Stays open for 60 seconds (default)
# Then enters "half_open" state
# If next request succeeds → "closed" (recovered)
# If next request fails → "open" again for another 60s

# Check when circuit will re-test:
# last_failure + 60 seconds = retry time
```

3. **Manually reset circuit breaker:**
```bash
# In Redis:
redis-cli
> DEL circuit_breaker:module_04_billing

# OR reset via API:
curl -X POST https://n8n.yourclinic.com/webhook/manager/control \
  -d '{
    "action": "reset_circuit_breaker",
    "module": "04_billing"
  }'
```

4. **Fix underlying module issue:**
```bash
# Circuit breaker opens because module is failing
# Investigate Module 04 logs:
# - Stripe API errors? (check STRIPE_CREDENTIAL_ID)
# - Database connection timeout? (check POSTGRES_HOST)
# - Rate limit exceeded? (Stripe allows 100 req/sec)

# Fix the root cause, then circuit breaker will close automatically
```

5. **Adjust circuit breaker thresholds:**
```javascript
// In Module 10 configuration:
CIRCUIT_BREAKER_THRESHOLD="10"  // Increase from 5 to 10 failures
CIRCUIT_BREAKER_TIMEOUT="120000"  // Increase from 60s to 120s

// Tradeoff:
// - Higher threshold: More tolerant of transient failures
// - Lower threshold: Faster protection against cascading failures
```

---

### Issue 6: Message Queue Full - RabbitMQ Overload

**Symptoms:**
- Workflows queueing but not executing
- RabbitMQ dashboard shows >10,000 queued messages
- n8n execution delayed by 10+ minutes

**Causes:**
1. Too many concurrent workflows (n8n overwhelmed)
2. Worker processes crashed or paused
3. Message processing slower than message arrival rate

**Solutions:**

1. **Check RabbitMQ queue depth:**
```bash
# Access RabbitMQ management UI: http://localhost:15672
# User: admin, Password: YOUR_PASSWORD

# Check queue: "n8n-queue"
# Messages: Should be <100 under normal load
# If >1,000: Backlog forming

# Via CLI:
docker exec rabbitmq rabbitmqctl list_queues
# Output: n8n-queue 12345 (12,345 messages queued)
```

2. **Increase n8n worker count:**
```bash
# In docker-compose.yml or Kubernetes deployment:
# Add more n8n worker replicas

# Docker Swarm:
docker service scale aigent_n8n=5  # Increase from 3 to 5 workers

# Kubernetes:
kubectl scale deployment n8n --replicas=5

# Each worker can process ~10 workflows/second
# 5 workers = ~50 workflows/second capacity
```

3. **Purge old messages:**
```bash
# If queue is clogged with old, irrelevant messages:
docker exec rabbitmq rabbitmqctl purge_queue n8n-queue

# WARNING: This deletes ALL queued messages
# Only use if messages are stale (e.g., from testing)
```

4. **Enable message TTL:**
```javascript
// Set message time-to-live: expire old messages
// In RabbitMQ policy:
rabbitmqctl set_policy TTL ".*" '{"message-ttl":3600000}' --apply-to queues

// Messages older than 1 hour (3600000ms) are auto-deleted
```

5. **Optimize workflow performance:**
```bash
# Slow workflows cause queue buildup
# Profile slow modules:
# - Module 06 (OCR): 10-30 seconds (slowest)
# - Module 04 (Billing): 2-5 seconds (Stripe API calls)
# - Module 03 (Telehealth): 1-3 seconds (Zoom API)

# Optimize:
# - Enable workflow caching (n8n setting: "Cache between steps")
# - Use async processing (don't wait for slow operations)
# - Split heavy workflows into smaller chunks
```

---

### Issue 7: Distributed Tracing Not Working

**Symptoms:**
- Jaeger UI shows no traces
- Traces not correlating across modules
- Cannot trace patient journey from M01 → M09

**Causes:**
1. Jaeger agent not running
2. Trace context not propagated between modules
3. Sampling rate set to 0 (no traces collected)

**Solutions:**

1. **Verify Jaeger agent running:**
```bash
# Check Jaeger agent container
docker ps | grep jaeger-agent
# Should show running container

# If not running:
docker run -d \
  --name jaeger-agent \
  --network=host \
  -e REPORTER_GRPC_HOST_PORT=jaeger-collector:14250 \
  jaegertracing/jaeger-agent:latest

# Verify logs:
docker logs jaeger-agent
# Should show: "Agent started"
```

2. **Propagate trace context between modules:**
```javascript
// In EVERY module (01-09), when calling another module:
// HTTP Request node → Headers:

{
  "X-Trace-ID": "{{$json.trace_id}}",
  "X-Parent-Span-ID": "{{$json.span_id || 'root'}}",
  "X-Service-Name": "Module-01-Intake"
}

// In receiving module (e.g., Module 02):
// Read headers from webhook trigger:
const trace_id = $input.first().headers['x-trace-id'] || `BOOK-${Date.now()}`;
const parent_span_id = $input.first().headers['x-parent-span-id'] || 'root';

// Create child span:
const span_id = `module-02-${Date.now()}`;

// Pass to next module in chain
```

3. **Increase sampling rate:**
```javascript
// In Jaeger config:
const config = {
  serviceName: 'aigent-orchestration',
  sampler: {
    type: 'probabilistic',  // or 'const'
    param: 1.0  // Sample 100% of traces (1.0), or 10% (0.1)
  }
};

// For production: Use 0.1 (10% sampling) to reduce overhead
// For debugging: Use 1.0 (100% sampling)
```

4. **Check Jaeger UI:**
```bash
# Access Jaeger UI: http://localhost:16686

# Search for traces:
# - Service: "aigent-orchestration" OR "Module-01-Intake"
# - Operation: "orchestration-run" OR "lead-capture"
# - Lookback: Last hour

# If no traces found:
# - Check Jaeger collector logs: docker logs jaeger-collector
# - Verify agent sending spans: docker logs jaeger-agent | grep "Span reported"
```

---

## Support

### Documentation

- **Enterprise Guide:** This file (module_10_enterprise_README.md)
- **Workflow JSON:** workflow_system_orchestration_manager.json (in 10_System_Orchestration/V1/)
- **n8n Documentation:** https://docs.n8n.io
- **Kubernetes Docs:** https://kubernetes.io/docs
- **Istio Docs:** https://istio.io/docs
- **Jaeger Docs:** https://www.jaegertracing.io/docs

### Community

- **Forum:** https://community.n8n.io (for n8n questions)
- **Stack Overflow:** Tag questions with `n8n`, `kubernetes`, `orchestration`
- **GitHub Issues:** https://github.com/n8n-io/n8n/issues

### Professional Support

- **Email:** enterprise-support@aigent.company
- **Priority Support:** Included with Enterprise plan
- **Infrastructure Setup:** Professional services available ($2,000-$5,000 one-time setup)
- **Custom Workflow Templates:** Development services ($200-$500 per template)
- **Kubernetes Migration:** Assistance with container orchestration ($3,000-$8,000)
- **Service Mesh Implementation:** Istio/Linkerd setup ($2,000-$5,000)
- **Monitoring Stack Setup:** Prometheus + Grafana + Jaeger ($1,500-$3,000)
- **24/7 On-Call Support:** Available on request (pricing varies)

---

## License

**Proprietary - Aigent Company**
Enterprise version requires valid license for production use.

---

**Version:** enterprise-1.0.0
**Last Updated:** 2025-11-06
**Previous Module:** [Module 09 Enterprise: Compliance & Audit](module_09_enterprise_README.md)
**Next Module:** None (Module 10 is the final orchestration layer)

**Ready to deploy enterprise-grade orchestration? Set up infrastructure and import the workflow!**
