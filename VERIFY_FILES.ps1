# PowerShell script to verify all files are present after checkout
# Run this to check what you should have

Write-Host "="*80 -ForegroundColor Green
Write-Host "AIGENT DWC RECORDS - FILE VERIFICATION" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green

Write-Host "`nChecking Git Status..." -ForegroundColor Yellow
git status

Write-Host "`n`nChecking Current Branch..." -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "Current Branch: $branch" -ForegroundColor Cyan

Write-Host "`n`nChecking Latest Commits..." -ForegroundColor Yellow
git log --oneline -5

Write-Host "`n`n"
Write-Host "="*80 -ForegroundColor Green
Write-Host "EXPECTED FILES CHECK" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green

$expectedFiles = @(
    "MIGRATION_STRATEGY_GUIDE.md",
    "SQUARE_MIGRATION_MAPPING.xlsx",
    "analyze_for_migration.py",
    "category_normalization_analysis.py",
    "normalize_categories.py",
    "analyze_excel.py"
)

$expectedFolders = @(
    "DWC RECORDS NORMALIZED",
    "DWC RECORDS NORMALIZED\Patient Research",
    "DWC RECORDS NORMALIZED\Payment Distribution"
)

Write-Host "`nChecking Key Files:" -ForegroundColor Yellow
foreach ($file in $expectedFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ MISSING: $file" -ForegroundColor Red
    }
}

Write-Host "`nChecking Key Folders:" -ForegroundColor Yellow
foreach ($folder in $expectedFolders) {
    if (Test-Path $folder) {
        Write-Host "  ✓ $folder" -ForegroundColor Green
    } else {
        Write-Host "  ✗ MISSING: $folder" -ForegroundColor Red
    }
}

Write-Host "`n`nChecking Normalized Files Count:" -ForegroundColor Yellow
if (Test-Path "DWC RECORDS NORMALIZED") {
    $patientFiles = (Get-ChildItem "DWC RECORDS NORMALIZED\Patient Research" -Filter "*.xlsx" -ErrorAction SilentlyContinue).Count
    $paymentFiles = (Get-ChildItem "DWC RECORDS NORMALIZED\Payment Distribution" -Filter "*.xlsx" -ErrorAction SilentlyContinue).Count
    Write-Host "  Patient Research Files: $patientFiles (should be 14)" -ForegroundColor Cyan
    Write-Host "  Payment Distribution Files: $paymentFiles (should be 4)" -ForegroundColor Cyan
} else {
    Write-Host "  DWC RECORDS NORMALIZED folder not found!" -ForegroundColor Red
}

Write-Host "`n"
Write-Host "="*80 -ForegroundColor Green
Write-Host "TROUBLESHOOTING" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green

Write-Host "`nIf files are missing, run these commands:" -ForegroundColor Yellow
Write-Host "  1. git fetch origin --all" -ForegroundColor White
Write-Host "  2. git reset --hard origin/claude/dwc-records-011CUxEqi4pC9KFwTZ582Yyc" -ForegroundColor White
Write-Host "  3. git clean -fd" -ForegroundColor White
Write-Host "  4. Run this script again to verify" -ForegroundColor White

Write-Host "`n"
