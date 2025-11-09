# DWC Records - Organized Structure

This directory contains DWC (Dental/Medical) records organized into a clean, logical structure.

## Directory Structure

```
DWC_Records/
├── 01_Original/          # Original unmodified Excel files
│   ├── Patient_Research/
│   │   ├── Historical data by period (2000-2005, 2005-2010, 2010-2015, 2015-2020)
│   │   └── Full range Ocoee data (2000-2025, split into parts)
│   └── Payment_Distribution/
│       ├── Full range (2000-2025)
│       └── Period-specific reports
├── 02_Normalized/        # Data-cleaned versions with quality improvements
│   ├── Patient_Research/
│   └── Payment_Distribution/
├── Documentation/
│   └── NORMALIZATION_REPORT.txt  # Details of all data quality improvements
└── Utilities/
    └── split_excel.py             # Tool used for splitting large Excel files
```

## File Organization

### Patient Research Files
- **By Period**: Data split by 5-year periods (2000-2005, 2005-2010, etc.)
- **Large Files**: Split into multiple parts when exceeding Excel row limits
- **Ocoee Data**: Comprehensive data from Jan 1, 2000 to Oct 28, 2025

### Payment Distribution Files
- **Full Range**: Complete payment data from 2000-2025
- **Period-Specific**: Focused reports for specific time ranges

## Data Normalization

The `02_Normalized/` directory contains cleaned data with:
- **521,854 total changes** applied across all files
- Gender values standardized (person → Other, female → Female, male → Male)
- Transaction types corrected (patient referrel → Patient Referral, empolyee discount → Employee Discount)
- Provider names deduplicated
- Procedure codes and names formatted consistently

See `Documentation/NORMALIZATION_REPORT.txt` for complete details.

## Usage Recommendations

- **For Analysis**: Use files in `02_Normalized/` for data analysis and reporting
- **For Audit/Compliance**: Reference files in `01_Original/` for unmodified source data
- **For Reference**: Check `Documentation/` for details on changes made

## File Counts

- **Original Files**: 18 Excel files
- **Normalized Files**: 18 Excel files
- **Total Size**: Contains patient research and payment distribution data spanning 25 years
