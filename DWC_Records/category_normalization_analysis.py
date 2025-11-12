#!/usr/bin/env python3
"""
Comprehensive category normalization analysis for DWC RECORDS
Identifies similar categories across all Excel files
"""
import pandas as pd
from pathlib import Path
from collections import defaultdict
import re

def clean_string(s):
    """Basic string cleaning"""
    if pd.isna(s):
        return ""
    s = str(s).strip()
    # Normalize whitespace
    s = re.sub(r'\s+', ' ', s)
    return s

def analyze_all_files():
    """Analyze all Excel files and identify normalization opportunities"""

    print("="*80)
    print("CATEGORY NORMALIZATION ANALYSIS - DWC RECORDS")
    print("="*80)

    # Find all Excel files
    dwc_path = Path("DWC RECORDS")
    excel_files = list(dwc_path.rglob("*.xlsx"))
    # Filter out temp files
    excel_files = [f for f in excel_files if not f.name.startswith('~$')]

    print(f"\nFound {len(excel_files)} Excel files to analyze\n")

    # Collect all unique values for key columns across all files
    patient_procedures = set()
    patient_descriptions = set()
    patient_providers = set()
    patient_genders = set()

    payment_procedure_codes = set()
    payment_tran_types = set()
    payment_types = set()

    print("Reading all files...")
    for file_path in excel_files:
        try:
            df = pd.read_excel(file_path)

            if 'Patient Research' in str(file_path):
                if 'Procedure' in df.columns:
                    patient_procedures.update(df['Procedure'].apply(clean_string).unique())
                if 'Description' in df.columns:
                    patient_descriptions.update(df['Description'].apply(clean_string).unique())
                if 'Provider' in df.columns:
                    patient_providers.update(df['Provider'].apply(clean_string).unique())
                if 'Gender' in df.columns:
                    patient_genders.update(df['Gender'].apply(clean_string).unique())

            elif 'Payment Distribution' in str(file_path):
                if 'Procedure Code' in df.columns:
                    payment_procedure_codes.update(df['Procedure Code'].apply(clean_string).unique())
                if 'Tran Type' in df.columns:
                    payment_tran_types.update(df['Tran Type'].apply(clean_string).unique())
                if 'Type' in df.columns:
                    payment_types.update(df['Type'].apply(clean_string).unique())

        except Exception as e:
            print(f"  Error reading {file_path}: {e}")

    # Remove empty strings
    patient_procedures = {p for p in patient_procedures if p}
    patient_descriptions = {d for d in patient_descriptions if d}
    patient_providers = {p for p in patient_providers if p}
    patient_genders = {g for g in patient_genders if g}
    payment_procedure_codes = {c for c in payment_procedure_codes if c}
    payment_tran_types = {t for t in payment_tran_types if t}
    payment_types = {t for t in payment_types if t}

    print("\n" + "="*80)
    print("NORMALIZATION OPPORTUNITIES")
    print("="*80)

    # Analyze Patient Research Files
    print("\n### PATIENT RESEARCH FILES ###\n")

    print(f"1. GENDER ({len(patient_genders)} unique values):")
    for gender in sorted(patient_genders):
        print(f"   - '{gender}'")
    if len(patient_genders) > 2:
        print("   ⚠️ NEEDS NORMALIZATION - should have 2-3 standard values (male/female/other)")

    print(f"\n2. PROVIDER ({len(patient_providers)} unique values):")
    for provider in sorted(patient_providers):
        print(f"   - '{provider}'")
    duplicates = [p for p in patient_providers if ' ' in p and p.count(p.split()[0]) > 1]
    if duplicates:
        print("   ⚠️ NEEDS NORMALIZATION - contains duplicated text")

    print(f"\n3. PROCEDURE ({len(patient_procedures)} unique values):")
    print("   Top values:")
    for proc in sorted(patient_procedures)[:20]:
        print(f"   - '{proc}'")
    if len(patient_procedures) > 20:
        print(f"   ... and {len(patient_procedures) - 20} more")

    # Analyze Payment Distribution Files
    print("\n\n### PAYMENT DISTRIBUTION FILES ###\n")

    print(f"1. TRAN TYPE ({len(payment_tran_types)} unique values):")
    for tran in sorted(payment_tran_types):
        display = tran.replace(' ', '·')  # Show spaces
        print(f"   - '{display}'")

    # Check for issues
    issues = []
    for tran in payment_tran_types:
        if tran != tran.strip():
            issues.append(f"Extra whitespace: '{tran}'")
        if 'referrel' in tran.lower():
            issues.append(f"Misspelling: '{tran}' (should be 'referral')")

    if issues:
        print("   ⚠️ ISSUES FOUND:")
        for issue in issues:
            print(f"      - {issue}")

    print(f"\n2. PROCEDURE CODE ({len(payment_procedure_codes)} unique values):")
    print("   Top values:")
    for code in sorted(payment_procedure_codes)[:20]:
        print(f"   - '{code}'")
    if len(payment_procedure_codes) > 20:
        print(f"   ... and {len(payment_procedure_codes) - 20} more")

    print(f"\n3. TYPE ({len(payment_types)} unique values):")
    for ptype in sorted(payment_types):
        print(f"   - '{ptype}'")

    # Summary
    print("\n" + "="*80)
    print("NORMALIZATION RECOMMENDATIONS")
    print("="*80)
    print("""
1. **Tran Type** - HIGH PRIORITY
   - Strip extra whitespace from ' None Entered '
   - Fix misspelling: 'patient referrel' → 'Patient Referral'
   - Standardize capitalization across all types

2. **Gender** - MEDIUM PRIORITY
   - Review and standardize gender values
   - Ensure consistent capitalization

3. **Provider** - MEDIUM PRIORITY
   - Remove duplicate text (e.g., "New Patient Clermont New Patient Clermont")

4. **Procedure/Procedure Code** - LOW PRIORITY (Manual Review Recommended)
   - Many unique values - need domain knowledge
   - Possible fuzzy matching for similar codes
    """)

    return {
        'patient_procedures': patient_procedures,
        'patient_descriptions': patient_descriptions,
        'patient_providers': patient_providers,
        'patient_genders': patient_genders,
        'payment_procedure_codes': payment_procedure_codes,
        'payment_tran_types': payment_tran_types,
        'payment_types': payment_types
    }

if __name__ == "__main__":
    results = analyze_all_files()
