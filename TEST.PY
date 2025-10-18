import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Parameters
start_date = datetime(2025, 10, 17)
end_date = datetime(2026, 2, 20)
annual_rate = 0.1767
daily_rate = annual_rate / 365

# Existing investment
existing_amount = 6384.99
existing_days = (end_date - start_date).days
existing_future_value = existing_amount * (1 + daily_rate) ** existing_days

# One-time investment
one_time_date = datetime(2025, 11, 1)
one_time_amount = 6000
one_time_days = (end_date - one_time_date).days
one_time_future_value = one_time_amount * (1 + daily_rate) ** one_time_days

# Daily investment setup
daily_investment_amount = 50
daily_investment_start = datetime(2025, 10, 18)
daily_investment_days = (end_date - daily_investment_start).days

# Create a DataFrame to hold daily investments
dates = [daily_investment_start + timedelta(days=i) for i in range(daily_investment_days)]
future_values = [daily_investment_amount * (1 + daily_rate) ** (daily_investment_days - i) for i in range(daily_investment_days)]

df_daily = pd.DataFrame({
    "Date": dates,
    "Daily Investment (GHS)": daily_investment_amount,
    "Days to Feb 20": [daily_investment_days - i for i in range(daily_investment_days)],
    "Future Value on Feb 20": future_values
})

# Summarize
total_daily_future_value = sum(future_values)
total_future_value = existing_future_value + one_time_future_value + total_daily_future_value

# Create a summary DataFrame
df_summary = pd.DataFrame({
    "Component": ["Existing Investment", "One-time GHS 6,000", "Daily GHS 50 x 125 days", "Total Projected Portfolio"],
    "Value on Feb 20, 2026 (GHS)": [
        round(existing_future_value, 2),
        round(one_time_future_value, 2),
        round(total_daily_future_value, 2),
        round(total_future_value, 2)
    ]
})

# Save to Excel
with pd.ExcelWriter("Investment_Projection_Feb2026.xlsx", engine="xlsxwriter") as writer:
    df_summary.to_excel(writer, sheet_name="Summary", index=False)
    df_daily.to_excel(writer, sheet_name="Daily Investments", index=False)

print("✅ Excel file 'Investment_Projection_Feb2026.xlsx' has been created.")
