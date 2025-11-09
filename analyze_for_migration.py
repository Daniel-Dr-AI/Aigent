#!/usr/bin/env python3
"""
Analyze procedure codes to prepare for migration to Square/Calendar system
This will categorize procedures into products vs services and identify standardization needs
"""
import pandas as pd
from pathlib import Path
from collections import defaultdict, Counter
import re

def categorize_procedure(procedure_str, description_str=""):
    """Categorize procedures into service types"""
    proc = str(procedure_str).lower()
    desc = str(description_str).lower()

    # Service patterns
    if any(x in proc or x in desc for x in ['consultation', 'consult', 'visit', 'exam', 'follow', 'new patient']):
        return 'CONSULTATION'
    elif any(x in proc or x in desc for x in ['lipo', 'injection', 'shot', 'wkly', 'weekly']):
        return 'INJECTION_SERVICE'
    elif any(x in proc or x in desc for x in ['month', 'mo ', 'week', 'year', 'plan']):
        return 'PROGRAM_SUBSCRIPTION'
    elif any(x in proc or x in desc for x in ['phen', 'hctz', 'diet', 'natural', 'nat']):
        return 'MEDICATION_PRODUCT'
    elif any(x in proc or x in desc for x in ['nic', 'cleanse', 'mv', 'vitamin', 'supplement']):
        return 'SUPPLEMENT_PRODUCT'
    elif any(x in proc or x in desc for x in ['bracelet', 'jewelry', 'product']):
        return 'RETAIL_PRODUCT'
    else:
        return 'UNCATEGORIZED'

def extract_price_from_code(code_str):
    """Try to extract pricing hints from procedure codes"""
    # Look for patterns like "37.5" or dollar amounts
    matches = re.findall(r'\d+\.?\d*', str(code_str))
    return matches if matches else []

def analyze_procedures_for_migration():
    """Comprehensive procedure analysis for Square/Calendar migration"""

    print("="*80)
    print("PROCEDURE CODE MIGRATION ANALYSIS")
    print("Preparing data for Square App + Calendar Integration")
    print("="*80)

    # Collect all procedures
    dwc_path = Path("DWC RECORDS")
    excel_files = [f for f in dwc_path.rglob("*.xlsx") if not f.name.startswith('~$')]

    procedure_data = []

    print(f"\nAnalyzing {len(excel_files)} files...")

    for file_path in excel_files:
        try:
            df = pd.read_excel(file_path)

            # Patient Research files
            if 'Procedure' in df.columns and 'Description' in df.columns:
                for _, row in df.iterrows():
                    proc = str(row['Procedure']).strip()
                    desc = str(row['Description']).strip()
                    amount = row.get('Amount', 0) if 'Amount' in df.columns else 0

                    if proc and proc != 'nan':
                        procedure_data.append({
                            'code': proc,
                            'description': desc,
                            'amount': amount,
                            'category': categorize_procedure(proc, desc),
                            'source': 'Patient Research'
                        })

            # Payment Distribution files
            elif 'Procedure Code' in df.columns:
                for _, row in df.iterrows():
                    proc = str(row['Procedure Code']).strip()
                    charge = row.get('Charge', 0) if 'Charge' in df.columns else 0

                    if proc and proc != 'nan':
                        procedure_data.append({
                            'code': proc,
                            'description': '',
                            'amount': charge,
                            'category': categorize_procedure(proc, ''),
                            'source': 'Payment Distribution'
                        })
        except Exception as e:
            print(f"  Skipping {file_path.name}: {e}")

    # Create DataFrame for analysis
    df_procedures = pd.DataFrame(procedure_data)

    # Get unique procedures with most common description and pricing
    unique_procedures = {}
    for code in df_procedures['code'].unique():
        code_data = df_procedures[df_procedures['code'] == code]

        # Get most common description
        descriptions = [d for d in code_data['description'] if d and d != 'nan']
        most_common_desc = Counter(descriptions).most_common(1)[0][0] if descriptions else ''

        # Get pricing info
        amounts = code_data['amount'].dropna()
        prices = amounts[amounts > 0].tolist()

        unique_procedures[code] = {
            'description': most_common_desc,
            'category': code_data['category'].iloc[0],
            'prices': list(set(prices)),
            'usage_count': len(code_data)
        }

    # Print categorized analysis
    print(f"\n{'='*80}")
    print(f"FOUND {len(unique_procedures)} UNIQUE PROCEDURES")
    print(f"{'='*80}\n")

    categories = defaultdict(list)
    for code, data in unique_procedures.items():
        categories[data['category']].append((code, data))

    # Sort categories by priority
    category_order = [
        'CONSULTATION',
        'PROGRAM_SUBSCRIPTION',
        'INJECTION_SERVICE',
        'MEDICATION_PRODUCT',
        'SUPPLEMENT_PRODUCT',
        'RETAIL_PRODUCT',
        'UNCATEGORIZED'
    ]

    migration_recommendations = []

    for category in category_order:
        if category not in categories:
            continue

        items = sorted(categories[category], key=lambda x: x[1]['usage_count'], reverse=True)

        print(f"\n{category}")
        print("="*80)

        for code, data in items[:15]:  # Show top 15 per category
            prices_str = ', '.join([f"${p:.2f}" for p in sorted(data['prices'])[:5]]) if data['prices'] else 'No price'
            print(f"  {code:20} | {data['description'][:40]:40} | {prices_str:30} | Used {data['usage_count']:5}x")

            # Add to migration recommendations
            migration_recommendations.append({
                'Current Code': code,
                'Description': data['description'],
                'Category': category,
                'Suggested Square Category': get_square_category(category),
                'Calendar Booking Required': 'Yes' if category in ['CONSULTATION', 'INJECTION_SERVICE'] else 'No',
                'Pricing': prices_str,
                'Usage Count': data['usage_count'],
                'Migration Priority': 'HIGH' if data['usage_count'] > 100 else 'MEDIUM' if data['usage_count'] > 10 else 'LOW'
            })

        if len(items) > 15:
            print(f"  ... and {len(items) - 15} more")

    # Save migration mapping
    df_migration = pd.DataFrame(migration_recommendations)
    df_migration = df_migration.sort_values(['Migration Priority', 'Usage Count'], ascending=[True, False])

    output_file = 'SQUARE_MIGRATION_MAPPING.xlsx'
    df_migration.to_excel(output_file, index=False)
    print(f"\n{'='*80}")
    print(f"✅ Migration mapping saved to: {output_file}")
    print(f"{'='*80}\n")

    return df_migration, unique_procedures

def get_square_category(internal_category):
    """Map internal categories to Square categories"""
    mapping = {
        'CONSULTATION': 'Services > Consultations',
        'PROGRAM_SUBSCRIPTION': 'Services > Subscription Programs',
        'INJECTION_SERVICE': 'Services > Treatments',
        'MEDICATION_PRODUCT': 'Products > Medications',
        'SUPPLEMENT_PRODUCT': 'Products > Supplements',
        'RETAIL_PRODUCT': 'Products > Retail',
        'UNCATEGORIZED': 'NEEDS REVIEW'
    }
    return mapping.get(internal_category, 'NEEDS REVIEW')

if __name__ == "__main__":
    df_migration, procedures = analyze_procedures_for_migration()

    print("\n" + "="*80)
    print("MIGRATION STATISTICS")
    print("="*80)
    print(f"\nBy Priority:")
    print(df_migration['Migration Priority'].value_counts())
    print(f"\nBy Square Category:")
    print(df_migration['Suggested Square Category'].value_counts())
    print(f"\nCalendar Booking Required:")
    print(df_migration['Calendar Booking Required'].value_counts())
