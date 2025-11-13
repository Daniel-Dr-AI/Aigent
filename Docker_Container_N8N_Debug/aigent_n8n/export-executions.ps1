# =============================================
# n8n Workflow + Execution Exporter (All statuses)
# Target: C:\Users\bluel\Projects\aigent_n8n\executions
# =============================================

$BaseUrl  = "http://localhost:5678/api/v1"
$ApiKey   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwY2M4NzQzMC04MjU5LTQzNjctOTI5My1kOWZiMzYyMWU4ZmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyNjAwOTQ0LCJleHAiOjE3NjUxNDg0MDB9.jYpeYCZlkqOIgmOVFKBVyUyL6dDzoUSGla2z-Nz6NMU"    
$OutDir   = "C:\Users\bluel\Projects\aigent_n8n\executions"

if (!(Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

try {
    # --- Get most recent execution (any status) ---
    $LatestExec = Invoke-RestMethod -Uri "$BaseUrl/executions?limit=1" `
        -Headers @{ "X-N8N-API-KEY" = $ApiKey }

    if ($LatestExec.data.Count -eq 0) {
        Write-Host "No executions found in n8n."
        exit
    }

    $ExecId   = $LatestExec.data[0].id
    $Status   = $LatestExec.data[0].status
    $Workflow = $LatestExec.data[0].workflow
    $WfId     = $Workflow.id
    $WfName   = ($Workflow.name -replace '[^a-zA-Z0-9_-]', '_')

    Write-Host "Found latest execution ID $ExecId ($Status) for workflow '$WfName'"

    # --- Export execution data ---
    $ExecFile = Join-Path $OutDir "execution_${WfName}_${ExecId}_${Status}.json"
    Invoke-RestMethod -Uri "$BaseUrl/executions/$ExecId" `
        -Headers @{ "X-N8N-API-KEY" = $ApiKey } |
        ConvertTo-Json -Depth 10 | Out-File $ExecFile
    Write-Host "Exported execution data to $ExecFile"

    # --- Export workflow definition ---
    $WfFile = Join-Path $OutDir "workflow_${WfName}_${WfId}.json"
    Invoke-RestMethod -Uri "$BaseUrl/workflows/$WfId" `
        -Headers @{ "X-N8N-API-KEY" = $ApiKey } |
        ConvertTo-Json -Depth 10 | Out-File $WfFile
    Write-Host "Exported workflow definition to $WfFile"

} catch {
    Write-Host "Failed to export. Error: $($_.Exception.Message)"
}
