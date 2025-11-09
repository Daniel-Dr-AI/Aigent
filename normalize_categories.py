#!/usr/bin/env python3
"""
Category Normalization Script for DWC RECORDS

This script normalizes categories across all Excel files:
1. Fixes misspellings and typos
2. Standardizes capitalization
3. Removes duplicate text
4. Provides fuzzy matching for similar procedure codes (optional)
"""
import pandas as pd
from pathlib import Path
import re
from fuzzywuzzy import fuzz, process
from collections import defaultdict
import json

# NORMALIZATION MAPPINGS
# These define how to normalize specific values

TRAN_TYPE_MAPPING = {
    'patient referrel': 'Patient Referral',
    'empolyee discount': 'Employee Discount',
    'None Entered': 'None Entered',
    'Credit Card': 'Credit Card',
    'Debit Card': 'Debit Card',
    'Cash': 'Cash',
    'Check': 'Check',
    'Coupon': 'Coupon',
    'transfer': 'Transfer',
}

GENDER_MAPPING = {
    'person': 'Other',  # or 'Unknown' - you can change this
    'female': 'Female',
    'male': 'Male',
}

def normalize_provider(provider_str):
    """Fix provider names with duplicated text"""
    if pd.isna(provider_str):
        return provider_str

    provider = str(provider_str).strip()

    # Remove duplicate text (e.g., "New Patient Clermont New Patient Clermont")
    words = provider.split()
    if len(words) >= 4:
        half = len(words) // 2
        first_half = ' '.join(words[:half])
        second_half = ' '.join(words[half:2*half])
        if first_half == second_half:
            return first_half

    return provider

def normalize_tran_type(tran_type):
    """Normalize transaction type"""
    if pd.isna(tran_type):
        return tran_type

    tran_str = str(tran_type).strip()
    return TRAN_TYPE_MAPPING.get(tran_str, tran_str)

def normalize_gender(gender):
    """Normalize gender values"""
    if pd.isna(gender):
        return gender

    gender_str = str(gender).strip().lower()
    for key, value in GENDER_MAPPING.items():
        if gender_str == key.lower():
            return value

    return str(gender).strip().capitalize()

def normalize_procedure_code(code):
    """Basic normalization for procedure codes"""
    if pd.isna(code):
        return code

    code_str = str(code).strip()
    # Remove extra whitespace
    code_str = re.sub(r'\s+', ' ', code_str)
    return code_str

def process_file(file_path, output_dir, changes_log):
    """Process a single Excel file and apply normalizations"""
    print(f"\nProcessing: {file_path.name}")

    try:
        df = pd.read_excel(file_path)
        original_df = df.copy()
        file_changes = defaultdict(list)

        # Apply normalizations based on file type
        if 'Patient Research' in str(file_path):
            # Normalize Gender
            if 'Gender' in df.columns:
                df['Gender'] = df['Gender'].apply(normalize_gender)
                changed_indices = df[df['Gender'] != original_df['Gender']].index
                if len(changed_indices) > 0:
                    file_changes['Gender'] = len(changed_indices)
                    print(f"  ✓ Normalized {len(changed_indices)} Gender values")

            # Normalize Provider
            if 'Provider' in df.columns:
                df['Provider'] = df['Provider'].apply(normalize_provider)
                changed_indices = df[df['Provider'] != original_df['Provider']].index
                if len(changed_indices) > 0:
                    file_changes['Provider'] = len(changed_indices)
                    print(f"  ✓ Normalized {len(changed_indices)} Provider values")

            # Normalize Procedure
            if 'Procedure' in df.columns:
                df['Procedure'] = df['Procedure'].apply(normalize_procedure_code)
                changed_indices = df[df['Procedure'] != original_df['Procedure']].index
                if len(changed_indices) > 0:
                    file_changes['Procedure'] = len(changed_indices)
                    print(f"  ✓ Normalized {len(changed_indices)} Procedure values")

        elif 'Payment Distribution' in str(file_path):
            # Normalize Tran Type
            if 'Tran Type' in df.columns:
                df['Tran Type'] = df['Tran Type'].apply(normalize_tran_type)
                changed_indices = df[df['Tran Type'] != original_df['Tran Type']].index
                if len(changed_indices) > 0:
                    file_changes['Tran Type'] = len(changed_indices)
                    print(f"  ✓ Normalized {len(changed_indices)} Tran Type values")

            # Normalize Procedure Code
            if 'Procedure Code' in df.columns:
                df['Procedure Code'] = df['Procedure Code'].apply(normalize_procedure_code)
                changed_indices = df[df['Procedure Code'] != original_df['Procedure Code']].index
                if len(changed_indices) > 0:
                    file_changes['Procedure Code'] = len(changed_indices)
                    print(f"  ✓ Normalized {len(changed_indices)} Procedure Code values")

        # Save normalized file
        output_path = output_dir / file_path.name
        df.to_excel(output_path, index=False)
        print(f"  ✓ Saved to: {output_path}")

        # Log changes
        if file_changes:
            changes_log[str(file_path)] = dict(file_changes)

        return True

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def generate_report(changes_log, output_dir):
    """Generate a summary report of all changes"""
    report_path = output_dir / "NORMALIZATION_REPORT.txt"

    with open(report_path, 'w') as f:
        f.write("="*80 + "\n")
        f.write("DWC RECORDS - CATEGORY NORMALIZATION REPORT\n")
        f.write("="*80 + "\n\n")

        f.write("APPLIED NORMALIZATIONS:\n\n")

        f.write("1. Transaction Type (Tran Type):\n")
        for old, new in TRAN_TYPE_MAPPING.items():
            if old != new:
                f.write(f"   '{old}' → '{new}'\n")

        f.write("\n2. Gender:\n")
        for old, new in GENDER_MAPPING.items():
            if old != new:
                f.write(f"   '{old}' → '{new}'\n")

        f.write("\n3. Provider:\n")
        f.write("   Removed duplicate text from provider names\n")

        f.write("\n4. Procedure/Procedure Code:\n")
        f.write("   Removed extra whitespace and standardized formatting\n")

        f.write("\n" + "="*80 + "\n")
        f.write("CHANGES BY FILE:\n")
        f.write("="*80 + "\n\n")

        total_changes = 0
        for file_path, changes in changes_log.items():
            f.write(f"{Path(file_path).name}:\n")
            for column, count in changes.items():
                f.write(f"  - {column}: {count} changes\n")
                total_changes += count
            f.write("\n")

        f.write("="*80 + "\n")
        f.write(f"TOTAL CHANGES: {total_changes}\n")
        f.write("="*80 + "\n")

    print(f"\n📊 Report saved to: {report_path}")

def main():
    """Main function to normalize all files"""
    print("="*80)
    print("DWC RECORDS - CATEGORY NORMALIZATION")
    print("="*80)

    # Find all Excel files
    dwc_path = Path("DWC RECORDS")
    excel_files = list(dwc_path.rglob("*.xlsx"))
    # Filter out temp files
    excel_files = [f for f in excel_files if not f.name.startswith('~$')]

    print(f"\nFound {len(excel_files)} files to process")

    # Create output directory
    output_dir = Path("DWC RECORDS NORMALIZED")
    output_dir.mkdir(exist_ok=True)

    # Recreate subdirectory structure
    (output_dir / "Patient Research").mkdir(exist_ok=True)
    (output_dir / "Payment Distribution").mkdir(exist_ok=True)

    # Process all files
    changes_log = {}
    success_count = 0

    for file_path in excel_files:
        # Determine output subdirectory
        if 'Patient Research' in str(file_path):
            out_dir = output_dir / "Patient Research"
        elif 'Payment Distribution' in str(file_path):
            out_dir = output_dir / "Payment Distribution"
        else:
            out_dir = output_dir

        if process_file(file_path, out_dir, changes_log):
            success_count += 1

    # Generate report
    generate_report(changes_log, output_dir)

    print("\n" + "="*80)
    print(f"✅ SUCCESS: Processed {success_count}/{len(excel_files)} files")
    print(f"📁 Normalized files saved to: {output_dir}")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
