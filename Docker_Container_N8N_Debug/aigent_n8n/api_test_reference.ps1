param([string]$ConnectorId)

$baseUrl = "http://localhost:5678"
$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwY2M4NzQzMC04MjU5LTQzNjctOTI5My1kOWZiMzYyMWU4ZmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyNjAwOTQ0LCJleHAiOjE3NjUxNDg0MDB9.jYpeYCZlkqOIgmOVFKBVyUyL6dDzoUSGla2z-Nz6NMU"
$cachePath = "C:\Users\bluel\Projects\aigent_n8n\Aigent_Modules_Core\cache\last_test_results.json"
$headers = @{ "X-N8N-API-KEY" = $apiKey }

Write-Host "=== Aigent Module 11 Diagnostic ==="

Write-Host ""
Write-Host "[1] Checking API access..."
try {
    $workflows = Invoke-RestMethod -Headers $headers -Uri "$baseUrl/api/v1/workflows?active=true"
    $count = $workflows.data.Count
    Write-Host ("  API OK — " + $count + " active workflows.")
    foreach ($wf in $workflows.data) { Write-Host ("   - " + $wf.name) }
} catch {
    Write-Host ("  API connection failed: " + $_.Exception.Message)
    exit 1
}

Write-Host ""
Write-Host "[2] Running connector test harness..."
try {
    $body = @{ test_mode = "all" } | ConvertTo-Json
    $r = Invoke-RestMethod -Headers $headers -Uri "$baseUrl/webhook/connector-test" -Method POST -ContentType "application/json" -Body $body
    Write-Host ("  Trace ID: " + $r.trace_id)
    Write-Host ("  Success rate: " + $r.success_rate + "%")
    Write-Host ("  Avg latency: " + $r.average_latency_ms + " ms")
} catch {
    Write-Host ("  Test failed: " + $_.Exception.Message)
}

Write-Host ""
Write-Host "[3] Checking cached results..."
if (Test-Path $cachePath) {
    try {
        $c = Get-Content $cachePath -Raw | ConvertFrom-Json
        Write-Host ("  Cache timestamp: " + $c.timestamp)
        Write-Host ("  Connectors: " + $c.total_connectors)
        Write-Host ("  Success: " + $c.success_rate + "%")
        Write-Host ("  Avg latency: " + $c.average_latency_ms + " ms")
    } catch {
        Write-Host ("  Cache parse error: " + $_.Exception.Message)
    }
} else {
    Write-Host ("  No cache file found at " + $cachePath)
}

if ($ConnectorId) {
    Write-Host ""
    Write-Host ("[4] Testing connector: " + $ConnectorId)
    try {
        $b = @{ test_mode = "single"; connector_id = $ConnectorId } | ConvertTo-Json
        $s = Invoke-RestMethod -Headers $headers -Uri "$baseUrl/webhook/connector-test" -Method POST -ContentType "application/json" -Body $b
        Write-Host ("  Single test success rate: " + $s.success_rate + "%")
    } catch {
        Write-Host ("  Single test failed: " + $_.Exception.Message)
    }
}

Write-Host ""
Write-Host "=== Diagnostic Complete ==="
