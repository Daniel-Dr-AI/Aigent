import pandas as pd
import math

input_file = "PaymentDistributionReportJan-1-2015-Jan-1-2020.xlsx"  # exact filename, include .xlsx
max_rows = 50000  # adjust as needed

print("Loading workbook...")
df = pd.read_excel(input_file)
print(f"Total rows: {len(df)}")

n = math.ceil(len(df) / max_rows)

for i in range(n):
    part = df.iloc[i * max_rows:(i + 1) * max_rows]
    out = f"part_{i + 1}.xlsx"
    part.to_excel(out, index=False)
    print(f"Saved {out} ({len(part)} rows)")

print("Done.")
