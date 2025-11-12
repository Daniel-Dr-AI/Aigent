#!/usr/bin/env python3
"""
Analyze Excel files to understand structure and identify categories for normalization
"""
import pandas as pd
import sys
from pathlib import Path

def analyze_excel_file(file_path):
    """Analyze a single Excel file and return structure info"""
    print(f"\n{'='*80}")
    print(f"Analyzing: {file_path}")
    print(f"{'='*80}")

    try:
        # Read the Excel file
        df = pd.read_excel(file_path)

        # Basic info
        print(f"\nRows: {len(df)}")
        print(f"Columns: {len(df.columns)}")
        print(f"\nColumn Names:")
        for i, col in enumerate(df.columns, 1):
            print(f"  {i}. {col}")

        # Show first few rows
        print(f"\nFirst 5 rows:")
        print(df.head().to_string())

        # For each column, show data types and unique value counts
        print(f"\nColumn Analysis:")
        for col in df.columns:
            unique_count = df[col].nunique()
            null_count = df[col].isnull().sum()
            dtype = df[col].dtype
            print(f"\n  {col}:")
            print(f"    - Data Type: {dtype}")
            print(f"    - Unique Values: {unique_count}")
            print(f"    - Null Values: {null_count}")

            # If it looks like a category column (reasonable number of unique values)
            if unique_count < 100 and unique_count > 1:
                print(f"    - Sample values:")
                sample_values = df[col].value_counts().head(10)
                for val, count in sample_values.items():
                    print(f"      '{val}': {count} occurrences")

        return df

    except Exception as e:
        print(f"Error reading file: {e}")
        return None

if __name__ == "__main__":
    # Analyze Patient Research file
    patient_file = "DWC RECORDS/Patient Research/PatientResearchReportJan-1-2000-Jan-1-2005.xlsx"
    print("PATIENT RESEARCH FILE ANALYSIS")
    df_patient = analyze_excel_file(patient_file)

    # Analyze Payment Distribution file
    payment_file = "DWC RECORDS/Payment Distribution/PaymentDistributionReportJan-1-2010-Jan-1-2015.xlsx"
    print("\n\nPAYMENT DISTRIBUTION FILE ANALYSIS")
    df_payment = analyze_excel_file(payment_file)
