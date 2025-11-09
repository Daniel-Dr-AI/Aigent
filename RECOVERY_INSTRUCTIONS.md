# File Recovery Instructions

If you don't see the migration files after checkout, follow these steps:

## Quick Recovery (PowerShell)

```powershell
# 1. Navigate to your repository
cd "C:\Users\bluel\Dropbox\Daniels Docs\Daniel\Aigent"

# 2. Close ALL open files (Excel, text editors, etc.)
taskkill /F /IM EXCEL.EXE

# 3. Fetch all data from remote
git fetch origin --all

# 4. Hard reset to the latest commit
git reset --hard origin/claude/dwc-records-011CUxEqi4pC9KFwTZ582Yyc

# 5. Clean any untracked files
git clean -fd

# 6. Verify files are present
.\VERIFY_FILES.ps1
```

## What You Should See

After successful recovery, you should have:

### Files:
- ✅ `MIGRATION_STRATEGY_GUIDE.md` - Complete 8-week migration plan
- ✅ `SQUARE_MIGRATION_MAPPING.xlsx` - All 380 procedures mapped
- ✅ `analyze_for_migration.py` - Migration analysis script
- ✅ `category_normalization_analysis.py` - Category analysis
- ✅ `normalize_categories.py` - Normalization script
- ✅ `analyze_excel.py` - Excel file analyzer

### Folders:
- ✅ `DWC RECORDS NORMALIZED/`
  - ✅ `Patient Research/` (14 normalized Excel files)
  - ✅ `Payment Distribution/` (4 normalized Excel files)
  - ✅ `NORMALIZATION_REPORT.txt`

## If Files Are Still Missing

### Option 1: Download as ZIP from GitHub
1. Go to your GitHub repository
2. Navigate to branch: `claude/dwc-records-011CUxEqi4pC9KFwTZ582Yyc`
3. Click "Code" → "Download ZIP"
4. Extract to your Aigent folder

### Option 2: Fresh Clone
```powershell
# Navigate to parent folder
cd "C:\Users\bluel\Dropbox\Daniels Docs\Daniel"

# Rename current folder
Rename-Item "Aigent" "Aigent_backup"

# Fresh clone
git clone <your-repo-url> Aigent
cd Aigent
git checkout claude/dwc-records-011CUxEqi4pC9KFwTZ582Yyc
```

## Verification

Run the verification script:
```powershell
.\VERIFY_FILES.ps1
```

This will show:
- ✓ Green checkmarks for files that exist
- ✗ Red X's for missing files
- File counts for normalized data

## Still Having Issues?

If files are still missing after these steps:

1. Check your commit:
   ```powershell
   git log --oneline -1
   ```
   Should show: `c5c47f3 feat: Add Square/Calendar migration strategy and analysis`

2. Check what files git knows about:
   ```powershell
   git ls-tree -r --name-only HEAD | Select-String "MIGRATION"
   ```

3. If the commit is correct but files don't appear, there may be a Windows file system issue. Try:
   ```powershell
   # Refresh file system
   git checkout HEAD -- .
   ```

## Important Notes

- **Close Excel** before running git commands (files get locked)
- **Don't use `-f` (force) checkout** if you have local changes you want to keep
- **Backup first** if you have any local modifications
- The files ARE on the remote - this is just a local sync issue

## What Each File Does

| File | Purpose |
|------|---------|
| `MIGRATION_STRATEGY_GUIDE.md` | Complete 8-week implementation plan for Square/Calendar |
| `SQUARE_MIGRATION_MAPPING.xlsx` | 380 procedures categorized with pricing and priorities |
| `DWC RECORDS NORMALIZED/` | 521,854 records cleaned and standardized |
| `*.py` scripts | Automation tools for analysis and normalization |

## Quick Start After Recovery

1. Open `SQUARE_MIGRATION_MAPPING.xlsx`
2. Filter by "Migration Priority" = HIGH
3. Review the 69 top procedures (80% of your business)
4. Read `MIGRATION_STRATEGY_GUIDE.md` for step-by-step plan

---

**All files are committed to: `claude/dwc-records-011CUxEqi4pC9KFwTZ582Yyc`**

**Latest commit: `c5c47f3`**
