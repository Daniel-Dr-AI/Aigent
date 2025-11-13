# Config
$Base = "http://localhost:5678/api/v1"
$Key  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwY2M4NzQzMC04MjU5LTQzNjctOTI5My1kOWZiMzYyMWU4ZmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyNjAwOTQ0LCJleHAiOjE3NjUxNDg0MDB9.jYpeYCZlkqOIgmOVFKBVyUyL6dDzoUSGla2z-Nz6NMU"   
$Out  = "C:\Users\bluel\Projects\aigent_n8n\executions"
if (!(Test-Path $Out)) { New-Item -ItemType Directory -Path $Out | Out-Null }

# 1) Get most recent execution (any status)
$latest = Invoke-RestMethod -Uri "$Base/executions?limit=1" -Headers @{ "X-N8N-API-KEY" = $Key }
if ($latest.data.Count -eq 0) { Write-Host "No executions found."; exit 0 }

$execId   = $latest.data[0].id
$status   = $latest.data[0].status
$wfId     = $latest.data[0].workflow.id
$wfName   = ($latest.data[0].workflow.name -replace '[^a-zA-Z0-9_-]', '_')
$stamp    = Get-Date -Format yyyyMMdd_HHmmss

# 2) Full execution with node I/O
$execFile = Join-Path $Out "execution_${wfName}_${execId}_${status}_${stamp}.json"
Invoke-RestMethod -Uri "$Base/executions/$execId" -Headers @{ "X-N8N-API-KEY" = $Key } `
  | ConvertTo-Json -Depth 12 | Out-File $execFile

# 3) Matching workflow definition
$wfFile = Join-Path $Out "workflow_${wfName}_${wfId}_${stamp}.json"
Invoke-RestMethod -Uri "$Base/workflows/$wfId" -Headers @{ "X-N8N-API-KEY" = $Key } `
  | ConvertTo-Json -Depth 12 | Out-File $wfFile

Write-Host "Saved:"
Write-Host "  $execFile"
Write-Host "  $wfFile"
