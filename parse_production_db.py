import csv
import io
import json
import re

sql_file = 'sankara_sankara (2).sql'

def parse_sql_values_line(line):
    line = line.strip()
    if line.startswith('('):
        if line.endswith('),') or line.endswith(');'):
            line = line[1:-2]
        elif line.endswith(')'):
            line = line[1:-1]

        try:
            reader = csv.reader(
                io.StringIO(line),
                delimiter=',',
                quotechar="'",
                escapechar='\\',
                skipinitialspace=True
            )
            return next(reader)
        except Exception:
            return None
    return None

def extract_table_rows(table_name, max_limit=1000):
    rows = []
    with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
        in_table = False
        for line in f:
            if f"INSERT INTO `{table_name}`" in line:
                in_table = True
                continue
            if in_table:
                if line.strip().startswith('('):
                    parsed = parse_sql_values_line(line)
                    if parsed:
                        rows.append(parsed)
                        if len(rows) >= max_limit:
                            break
                if line.strip().endswith(';'):
                    in_table = False
    return rows

print('Extracting master tables from production database...')

admin_users_raw = extract_table_rows('admin_users', 50)
hospital_raw = extract_table_rows('hospital', 50)
purpose_raw = extract_table_rows('purpose', 50)
occasion_raw = extract_table_rows('occasion', 50)
year_raw = extract_table_rows('year', 50)
surgery_raw = extract_table_rows('surgery', 50)
calendar_raw = extract_table_rows('calendar', 100)
once_raw = extract_table_rows('once', 400)
endow_raw = extract_table_rows('endow', 200)
bulk_raw = extract_table_rows('bulk', 100)
patient_raw = extract_table_rows('patient', 300)
log_raw = extract_table_rows('log', 200)

print(f'Admin Users: {len(admin_users_raw)}')
print(f'Hospitals: {len(hospital_raw)}')
print(f'Purposes: {len(purpose_raw)}')
print(f'Surgeries: {len(surgery_raw)}')
print(f'Occasions: {len(occasion_raw)}')
print(f'Calendar Events: {len(calendar_raw)}')
print(f'Once Donors: {len(once_raw)}')
print(f'Endow Donors: {len(endow_raw)}')
print(f'Patients: {len(patient_raw)}')
print(f'Audit Logs: {len(log_raw)}')
