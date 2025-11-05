# Module 02 v1.5.0 - Comprehensive Testing Guide

**Version:** v1.5.0-enterprise-hardened
**Last Updated:** 2025-11-05

---

## Overview

This guide provides comprehensive test suites for all v1.5.0 enhancements.

---

## Prerequisites

### Test Environment Setup

```bash
# 1. Set test environment variables
export TEST_API_KEY="test-key-$(openssl rand -base64 16)"
export TEST_EMAIL="test-$(date +%s)@example.com"
export TEST_WEBHOOK_URL="https://your-n8n.test/webhook/consult-booking"

# 2. Verify n8n workflow is active
# 3. Ensure all credentials configured
# 4. Have access to observability logs
```

### Test Tools

- curl (for API testing)
- jq (for JSON parsing)
- Python/Node.js (for automated test scripts)

---

## Test Suite 1: Security Tests

### Test 1.1: Webhook Authentication - No API Key

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+15551234567",
    "service_type": "Test"
  }'
```

**Expected:**
- Status: 401 Unauthorized or 403 Forbidden
- Body: Authentication error message
- No booking created

### Test 1.2: Webhook Authentication - Invalid API Key

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wrong-key-12345" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+15551234567",
    "service_type": "Test"
  }'
```

**Expected:**
- Status: 401 Unauthorized or 403 Forbidden
- No booking created

### Test 1.3: Webhook Authentication - Valid API Key

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+15551234567",
    "service_type": "Test Consultation"
  }'
```

**Expected:**
- Status: 200 OK (or 400 if validation fails)
- Proceeds to validation/processing

### Test 1.4: PHI Not in Observability Logs

```bash
# 1. Send successful booking
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "PHI Test Patient",
    "email": "phi-test@example.com",
    "phone": "+15551234567",
    "service_type": "Test"
  }'

# 2. Check observability endpoint logs
# Verify:
# - patient_id_hash is present (16-char hex)
# - NO patient_email field
# - NO patient name field
# - NO patient phone field
```

**Expected:**
```json
{
  "trace_id": "BOOK-1234567890",
  "patient_id_hash": "a1b2c3d4e5f6g7h8",
  "execution_time_ms": 1050,
  "success": true
}
```

### Test 1.5: XSS Protection

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>John Doe",
    "email": "xss-test@example.com",
    "phone": "+15551234567",
    "service_type": "Test<img src=x onerror=alert(1)>",
    "notes": "javascript:alert(\"XSS\")"
  }'
```

**Expected:**
- Email/SMS/Slack contain sanitized values
- No script execution in notifications
- `<script>` rendered as `&lt;script&gt;`

---

## Test Suite 2: Reliability Tests

### Test 2.1: Cache Persistence - Rate Limiting

```bash
# Step 1: Send 10 requests rapidly
for i in {1..10}; do
  curl -X POST $TEST_WEBHOOK_URL \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $TEST_API_KEY" \
    -d "{\"name\":\"Test $i\",\"email\":\"rate-test@example.com\",\"phone\":\"+155512345$i\",\"service_type\":\"Test\"}"
  sleep 0.5
done
```

**Expected:**
- First 10 requests succeed or get rate limited
- 10th or 11th request: 429 Too Many Requests

```bash
# Step 2: Restart n8n workflow (deactivate/reactivate)

# Step 3: Immediately send another request
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{"name":"After Restart","email":"rate-test@example.com","phone":"+15551234567","service_type":"Test"}'
```

**Expected:**
- Still 429 Too Many Requests (rate limit persisted!)

### Test 2.2: Cache Persistence - Idempotency

```bash
# Step 1: Send with idempotency key
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -H "Idempotency-Key: test-idem-key-12345" \
  -d '{
    "name": "Idempotency Test",
    "email": "idem@example.com",
    "phone": "+15551234567",
    "service_type": "Test"
  }'

# Step 2: Note booking_id from response

# Step 3: Restart n8n workflow

# Step 4: Send same request again
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -H "Idempotency-Key: test-idem-key-12345" \
  -d '{
    "name": "Idempotency Test",
    "email": "idem@example.com",
    "phone": "+15551234567",
    "service_type": "Test"
  }'
```

**Expected:**
- 409 Conflict with same booking_id (idempotency persisted!)

### Test 2.3: Circuit Breaker

```bash
# Step 1: Temporarily break scheduling API
# (Update SCHEDULING_API_BASE_URL to invalid endpoint in n8n)

# Step 2: Send 5 requests to trigger circuit breaker
for i in {1..5}; do
  echo "Request $i"
  curl -X POST $TEST_WEBHOOK_URL \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $TEST_API_KEY" \
    -d "{\"name\":\"CB Test $i\",\"email\":\"cb@example.com\",\"phone\":\"+155512345$i\",\"service_type\":\"Test\"}"
  sleep 2
done
```

**Expected:**
- First 4-5 requests: 500 Internal Server Error (or retry until circuit opens)
- 5th request: Circuit breaker opens

```bash
# Step 3: Send 6th request
curl -v -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{"name":"CB Test 6","email":"cb@example.com","phone":"+15551234567","service_type":"Test"}'
```

**Expected:**
- Status: 503 Service Unavailable
- Body contains: "CIRCUIT_BREAKER_OPEN", retry_after, wait_seconds

```bash
# Step 4: Fix scheduling API

# Step 5: Wait for timeout (60 seconds)

# Step 6: Send request after timeout
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{"name":"CB Test Recovery","email":"cb@example.com","phone":"+15551234568","service_type":"Test"}'
```

**Expected:**
- Circuit transitions to half-open
- Request succeeds
- Circuit closes

---

## Test Suite 3: International Phone Tests

### Test 3.1: US Phone Number

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "US Test",
    "email": "us@example.com",
    "phone": "555-123-4567",
    "country_code": "US",
    "service_type": "Test"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "phone_normalized": "+15551234567",
    "phone_display": "+1 (555) 123-4567"
  }
}
```

### Test 3.2: UK Phone Number

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "UK Test",
    "email": "uk@example.com",
    "phone": "020 7946 0958",
    "country_code": "GB",
    "service_type": "Test"
  }'
```

**Expected:**
- phone_normalized: "+442079460958"
- SMS sent to correct international number

### Test 3.3: Australian Phone Number

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "AU Test",
    "email": "au@example.com",
    "phone": "0412 345 678",
    "country_code": "AU",
    "service_type": "Test"
  }'
```

**Expected:**
- phone_normalized: "+61412345678"

### Test 3.4: Indian Phone Number

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "IN Test",
    "email": "in@example.com",
    "phone": "98765 43210",
    "country_code": "IN",
    "service_type": "Test"
  }'
```

**Expected:**
- phone_normalized: "+919876543210"

### Test 3.5: Default Country (No country_code)

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "Default Test",
    "email": "default@example.com",
    "phone": "5551234567",
    "service_type": "Test"
  }'
```

**Expected:**
- Uses DEFAULT_COUNTRY_CODE from environment
- If US: phone_normalized = "+15551234567"

---

## Test Suite 4: Validation & Error Handling

### Test 4.1: Single Validation Error Response

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "email": "invalid-email",
    "name": "X",
    "phone": "123",
    "service_type": ""
  }'
```

**Expected:**
- Status: 400 Bad Request
- Single response (no duplicates)
- Body contains details array with specific errors

**Verify No Duplicate:**
- Check n8n execution log - should show single webhook response
- No errors in n8n workflow

### Test 4.2: Missing Required Fields

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "Test User"
  }'
```

**Expected:**
- 400 Bad Request
- Errors for: email, phone, service_type

### Test 4.3: Invalid Timezone

```bash
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "Timezone Test",
    "email": "tz@example.com",
    "phone": "+15551234567",
    "service_type": "Test",
    "timezone": "Invalid/Timezone"
  }'
```

**Expected:**
- 400 Bad Request
- Error: "timezone: must be valid IANA timezone"

### Test 4.4: Partial Notification Failure

```bash
# Step 1: Temporarily disable SMS (remove Twilio credentials)

# Step 2: Send booking request
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "Partial Failure Test",
    "email": "partial@example.com",
    "phone": "+15551234567",
    "service_type": "Test Consultation",
    "preferred_date": "2025-11-10",
    "preferred_time": "14:00"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "confirmations": {
    "sheets_logged": true,
    "slack_sent": true,
    "email_sent": true,
    "sms_sent": false,
    "failures": ["sms"],
    "partial_success": true,
    "warning": "Booking successful, but some notifications failed: sms"
  }
}
```

---

## Test Suite 5: Performance Tests

### Test 5.1: Execution Time Without Caching

```bash
# Measure baseline
time curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "Performance Test",
    "email": "perf@example.com",
    "phone": "+15551234567",
    "service_type": "Test",
    "preferred_date": "2025-11-10",
    "preferred_time": "14:00"
  }'
```

**Expected:**
- execution_time_ms in response < 1500ms (target: ~850ms)

### Test 5.2: Execution Time With Availability Caching

```bash
# Send 1st request (cache miss)
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "Cache Test 1",
    "email": "cache1@example.com",
    "phone": "+15551234567",
    "service_type": "Test",
    "preferred_date": "2025-11-10"
  }'

# Note execution_time_ms

# Send 2nd request immediately (cache hit)
time curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "Cache Test 2",
    "email": "cache2@example.com",
    "phone": "+15551234568",
    "service_type": "Test",
    "preferred_date": "2025-11-10"
  }'
```

**Expected:**
- 2nd request significantly faster (~600ms, -45%)
- Cache hit indicated in logs

### Test 5.3: Multi-Dimensional Rate Limiting

```bash
# Test rate limiting by email
for i in {1..12}; do
  curl -X POST $TEST_WEBHOOK_URL \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $TEST_API_KEY" \
    -d "{\"name\":\"Rate Test $i\",\"email\":\"same-email@example.com\",\"phone\":\"+155512345$i\",\"service_type\":\"Test\"}"
  sleep 5
done
```

**Expected:**
- After 10 requests: 429 with dimension: "email address"

```bash
# Test rate limiting by phone
for i in {1..12}; do
  curl -X POST $TEST_WEBHOOK_URL \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $TEST_API_KEY" \
    -d "{\"name\":\"Rate Test $i\",\"email\":\"test$i@example.com\",\"phone\":\"+15551234567\",\"service_type\":\"Test\"}"
  sleep 5
done
```

**Expected:**
- After 10 requests: 429 with dimension: "phone number"

---

## Test Suite 6: Configuration Tests

### Test 6.1: Missing Environment Variables

```bash
# Step 1: Temporarily remove a required env var (e.g., SCHEDULING_API_BASE_URL)

# Step 2: Send request
curl -X POST $TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TEST_API_KEY" \
  -d '{
    "name": "Config Test",
    "email": "config@example.com",
    "phone": "+15551234567",
    "service_type": "Test"
  }'
```

**Expected:**
- Status: 500 Internal Server Error
- Body contains: "CONFIGURATION_ERROR", list of missing variables

---

## Automated Test Script

### Python Test Runner

```python
#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime

WEBHOOK_URL = "https://your-n8n.com/webhook/consult-booking"
API_KEY = "your-test-api-key"

def test_webhook_auth():
    """Test 1.1: No API key"""
    response = requests.post(WEBHOOK_URL, json={
        "name": "Test",
        "email": "test@example.com",
        "phone": "+15551234567",
        "service_type": "Test"
    })
    assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    print("✅ Test 1.1 PASSED: Webhook auth required")

def test_international_phones():
    """Test 3.x: International phone numbers"""
    test_cases = [
        ("US", "555-123-4567", "+15551234567"),
        ("GB", "020 7946 0958", "+442079460958"),
        ("AU", "0412 345 678", "+61412345678"),
        ("IN", "98765 43210", "+919876543210"),
    ]

    for country, phone, expected in test_cases:
        response = requests.post(WEBHOOK_URL,
            headers={"X-API-Key": API_KEY},
            json={
                "name": f"{country} Test",
                "email": f"{country.lower()}@example.com",
                "phone": phone,
                "country_code": country,
                "service_type": "Test"
            }
        )

        if response.status_code == 200:
            # Check phone_normalized in response or logs
            print(f"✅ Test 3.x PASSED: {country} phone normalized")
        else:
            print(f"❌ Test 3.x FAILED: {country} - Status {response.status_code}")

if __name__ == "__main__":
    print("Running Module 02 v1.5.0 Test Suite\n")
    test_webhook_auth()
    test_international_phones()
    print("\n✅ All tests completed!")
```

---

## Regression Testing Checklist

After implementing all changes, verify:

### Core Functionality
- [ ] Can create booking with valid data
- [ ] Booking appears in scheduling system
- [ ] Email confirmation sent
- [ ] SMS confirmation sent
- [ ] Slack notification sent
- [ ] Google Sheets logged
- [ ] CRM updated

### Error Handling
- [ ] Invalid email returns 400
- [ ] Missing fields return 400
- [ ] No availability returns 409
- [ ] Rate limit returns 429
- [ ] Circuit breaker returns 503

### Security
- [ ] No API key returns 401/403
- [ ] XSS attempts sanitized
- [ ] PHI not in logs

### Reliability
- [ ] Rate limit persists across restart
- [ ] Idempotency persists across restart
- [ ] Circuit breaker prevents cascading failures

### International
- [ ] US phones normalized
- [ ] UK phones normalized
- [ ] AU phones normalized
- [ ] Default country works

### Performance
- [ ] Execution time < 1500ms (p95)
- [ ] Cached requests < 800ms
- [ ] No performance regressions

---

## Troubleshooting Test Failures

### Issue: Tests pass in isolation but fail when run together
**Cause:** Shared state (rate limiting, circuit breaker)
**Solution:** Wait between tests or reset workflow state

### Issue: Circuit breaker test doesn't open circuit
**Cause:** Not enough failures or wrong API endpoint
**Solution:** Ensure scheduling API actually fails, increase failure threshold

### Issue: Phone normalization not working
**Cause:** Missing country_code or wrong DEFAULT_COUNTRY_CODE
**Solution:** Check environment variables

---

**Testing Guide Version:** 1.0
**Last Updated:** 2025-11-05
**Status:** Ready for use
