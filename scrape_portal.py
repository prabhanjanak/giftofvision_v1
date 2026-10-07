import os
import json
import requests
from bs4 import BeautifulSoup
import warnings

warnings.filterwarnings("ignore")

DATA_DIR = "scraped_data"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(f"{DATA_DIR}/html", exist_ok=True)
os.makedirs(f"{DATA_DIR}/json", exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

session = requests.Session()
print("[*] Logging in...")
login_res = session.post('https://www.giftofvision.in/login.php', data={'username': 'Admin', 'password': 'Ish2011'}, headers=headers)
if "index.php" in login_res.url or "Administrator" in login_res.text or "Logout" in login_res.text:
    print("[+] Login Successful!")
else:
    print("[-] Login Failed!")
    exit(1)

endpoints = [
    # Masters
    ("hospitals", "https://www.giftofvision.in/admin/hospital_list.php"),
    ("purposes", "https://www.giftofvision.in/admin/purpose_list.php"),
    ("occasions", "https://www.giftofvision.in/admin/occasion_list.php"),
    ("years", "https://www.giftofvision.in/admin/year_list.php"),
    ("birthdays", "https://www.giftofvision.in/admin/birth_list.php"),
    ("users", "https://www.giftofvision.in/admin/admin_user_list.php"),
    
    # Matching / Operations
    ("today_list", "https://www.giftofvision.in/admin/index.php"),
    ("match_list", "https://www.giftofvision.in/admin/match_list.php"),
    ("match_list_endowment", "https://www.giftofvision.in/admin/match_liste.php"),
    ("open_list", "https://www.giftofvision.in/admin/open_list.php"),
    ("open_list_endowment", "https://www.giftofvision.in/admin/open_liste.php"),
    ("qa_list", "https://www.giftofvision.in/admin/qa_list.php"),
    ("qa_list_endowment", "https://www.giftofvision.in/admin/qa_liste.php"),
    ("dispatch_list", "https://www.giftofvision.in/admin/dispatch_list.php"),
    ("dispatch_list_endowment", "https://www.giftofvision.in/admin/dispatch_liste.php"),
    ("feedback_once", "https://www.giftofvision.in/admin/feed_list.php"),
    ("feedback_endowment", "https://www.giftofvision.in/admin/feed_liste.php"),
    ("reports_once", "https://www.giftofvision.in/admin/feed_listo.php"),
    
    # Reports & Logs
    ("reports_excel", "https://www.giftofvision.in/admin/reports_excel.php"),
    ("reports_word", "https://www.giftofvision.in/admin/reports_word.php"),
    ("logs", "https://www.giftofvision.in/admin/log.php"),
    
    # Entry Lists
    ("donors_once", "https://www.giftofvision.in/admin/donor_list.php"),
    ("donors_endowment", "https://www.giftofvision.in/admin/donor1_list.php"),
    ("donors_bulk", "https://www.giftofvision.in/admin/bulk_list.php"),
    ("patients", "https://www.giftofvision.in/admin/patients_list.php"),
]

def parse_html_tables(html):
    soup = BeautifulSoup(html, 'html.parser')
    tables_data = []
    for t_idx, table in enumerate(soup.find_all('table')):
        rows = []
        for tr in table.find_all('tr'):
            cols = [td.get_text(separator=" ", strip=True) for td in tr.find_all(['th', 'td'])]
            if cols and any(cols):
                # Also capture links if present
                link_data = []
                for td in tr.find_all(['th', 'td']):
                    a_tag = td.find('a')
                    if a_tag and a_tag.get('href'):
                        link_data.append({'text': a_tag.get_text(strip=True), 'href': a_tag['href']})
                rows.append({'columns': cols, 'links': link_data})
        if rows:
            tables_data.append({'table_index': t_idx, 'row_count': len(rows), 'rows': rows})
    return tables_data

summary = {}

for name, url in endpoints:
    print(f"[*] Fetching {name} ({url})...")
    try:
        res = session.get(url, headers=headers, timeout=25)
        html_file = f"{DATA_DIR}/html/{name}.html"
        with open(html_file, "w", encoding="utf-8", errors="ignore") as f:
            f.write(res.text)
            
        tables = parse_html_tables(res.text)
        json_file = f"{DATA_DIR}/json/{name}.json"
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(tables, f, indent=2)
            
        total_records = sum(t['row_count'] for t in tables)
        summary[name] = {
            'status': res.status_code,
            'html_size_kb': round(len(res.text)/1024, 2),
            'tables_count': len(tables),
            'total_rows': total_records
        }
        print(f"  -> Saved {name}: {len(res.text)//1024} KB, {len(tables)} tables, {total_records} rows")
    except Exception as e:
        print(f"  -> Error {name}: {e}")
        summary[name] = {'error': str(e)}

with open(f"{DATA_DIR}/summary.json", "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)

print("\n[+] Scraping complete! Summary:")
print(json.dumps(summary, indent=2))
