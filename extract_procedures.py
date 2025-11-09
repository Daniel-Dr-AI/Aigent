#!/usr/bin/env python3
"""
Extract distinct procedure codes and procedures from DWC Records Excel files.
"""

import pandas as pd
import os
from pathlib import Path
from collections import defaultdict
import re

def extract_procedure_codes():
    """Extract distinct Procedure Codes from Payment Distribution files (Column C)."""
    procedure_codes = set()

    # Paths to check
    paths = [
        "DWC_Records/01_Original/Payment_Distribution",
        "DWC_Records/02_Normalized/Payment_Distribution"
    ]

    for path in paths:
        if not os.path.exists(path):
            continue

        for file in Path(path).glob("*.xlsx"):
            print(f"Processing payment file: {file.name}")
            try:
                # Read Excel file
                df = pd.read_excel(file)

                # Column C should be index 2 (0-based)
                # Get column name (might be "Procedure Code" or similar)
                if len(df.columns) > 2:
                    col_c = df.iloc[:, 2]  # Column C (index 2)
                    # Add non-null values to set
                    codes = col_c.dropna().astype(str).unique()
                    procedure_codes.update(codes)
                    print(f"  Found {len(codes)} unique codes in this file")
            except Exception as e:
                print(f"  Error processing {file.name}: {e}")

    return sorted(procedure_codes)

def extract_procedures_and_descriptions():
    """Extract distinct Procedure and Description pairs from Patient Research files (Columns O and P)."""
    procedure_pairs = {}  # {procedure: set(descriptions)}

    # Paths to check
    paths = [
        "DWC_Records/01_Original/Patient_Research",
        "DWC_Records/02_Normalized/Patient_Research"
    ]

    for path in paths:
        if not os.path.exists(path):
            continue

        for file in Path(path).glob("*.xlsx"):
            print(f"Processing patient file: {file.name}")
            try:
                # Read Excel file
                df = pd.read_excel(file)

                # Column O is index 14, Column P is index 15 (0-based)
                if len(df.columns) > 15:
                    col_o = df.iloc[:, 14]  # Column O (Procedure)
                    col_p = df.iloc[:, 15]  # Column P (Description)

                    # Combine into pairs
                    for proc, desc in zip(col_o, col_p):
                        if pd.notna(proc):
                            proc_str = str(proc).strip()
                            desc_str = str(desc).strip() if pd.notna(desc) else ""

                            if proc_str not in procedure_pairs:
                                procedure_pairs[proc_str] = set()
                            if desc_str:
                                procedure_pairs[proc_str].add(desc_str)

                    print(f"  Found {len(col_o.dropna())} procedures in this file")
            except Exception as e:
                print(f"  Error processing {file.name}: {e}")

    return procedure_pairs

def group_procedure_codes(codes):
    """Group similar procedure codes together."""
    grouped = defaultdict(list)

    for code in codes:
        code_str = str(code).strip()
        if not code_str or code_str.lower() == 'nan':
            continue

        # Try to extract prefix for grouping
        # Look for patterns like D1234, 1234, etc.
        match = re.match(r'^([A-Z]+)', code_str)
        if match:
            prefix = match.group(1)
            grouped[prefix].append(code_str)
        elif code_str[0].isdigit():
            grouped['NUMERIC'].append(code_str)
        else:
            grouped['OTHER'].append(code_str)

    return grouped

def main():
    print("=" * 80)
    print("EXTRACTING PROCEDURE CODES FROM PAYMENT DISTRIBUTION FILES")
    print("=" * 80)
    procedure_codes = extract_procedure_codes()
    print(f"\nTotal distinct procedure codes: {len(procedure_codes)}\n")

    print("=" * 80)
    print("EXTRACTING PROCEDURES AND DESCRIPTIONS FROM PATIENT RESEARCH FILES")
    print("=" * 80)
    procedure_pairs = extract_procedures_and_descriptions()
    print(f"\nTotal distinct procedures: {len(procedure_pairs)}\n")

    # Create Procedure codes file with grouping
    print("Creating 'Procedure codes.txt'...")
    grouped_codes = group_procedure_codes(procedure_codes)

    with open("DWC_Records/Documentation/Procedure codes.txt", "w", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write("DISTINCT PROCEDURE CODES FROM PAYMENT DISTRIBUTION REPORTS\n")
        f.write("Extracted from Column C of all Payment Distribution Excel files\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Total Distinct Codes: {len(procedure_codes)}\n\n")

        # Write grouped codes
        for group_name in sorted(grouped_codes.keys()):
            f.write(f"\n{'=' * 80}\n")
            f.write(f"GROUP: {group_name}\n")
            f.write(f"{'=' * 80}\n")
            for code in sorted(grouped_codes[group_name]):
                f.write(f"  {code}\n")

    print(f"  Written {len(procedure_codes)} codes to file\n")

    # Create Procedure List for normalization file
    print("Creating 'Procedure List for normalization.txt'...")

    with open("DWC_Records/Documentation/Procedure List for normalization.txt", "w", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write("DISTINCT PROCEDURES AND DESCRIPTIONS FROM PATIENT RESEARCH REPORTS\n")
        f.write("Extracted from Columns O (Procedure) and P (Description)\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Total Distinct Procedures: {len(procedure_pairs)}\n\n")
        f.write("Format: PROCEDURE -> Description(s)\n")
        f.write("Note: Multiple descriptions indicate variations found in the data\n\n")

        # Sort procedures
        for procedure in sorted(procedure_pairs.keys()):
            descriptions = procedure_pairs[procedure]

            if len(descriptions) == 0:
                f.write(f"\n{procedure}\n")
                f.write(f"  (No description)\n")
            elif len(descriptions) == 1:
                f.write(f"\n{procedure}\n")
                f.write(f"  {list(descriptions)[0]}\n")
            else:
                # Multiple descriptions - flag for normalization
                f.write(f"\n{procedure}  *** MULTIPLE DESCRIPTIONS - NEEDS REVIEW ***\n")
                for i, desc in enumerate(sorted(descriptions), 1):
                    f.write(f"  [{i}] {desc}\n")

    print(f"  Written {len(procedure_pairs)} procedures to file\n")

    print("=" * 80)
    print("EXTRACTION COMPLETE!")
    print("=" * 80)
    print(f"Files created:")
    print(f"  - DWC_Records/Documentation/Procedure codes.txt")
    print(f"  - DWC_Records/Documentation/Procedure List for normalization.txt")

if __name__ == "__main__":
    main()
