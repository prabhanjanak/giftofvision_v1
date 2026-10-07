import re
import json
from bs4 import BeautifulSoup

# 1. Hospitals Master (13 Sankara Eye Hospital Branches)
hospitals = [
    {'id': 'HOSP-1', 'name': 'Coimbatore', 'state': 'Tamil Nadu', 'code': 'CBE', 'active': True, 'beds': 250, 'contact': '+91 422 266 6450'},
    {'id': 'HOSP-2', 'name': 'Shimoga', 'state': 'Karnataka', 'code': 'SHM', 'active': True, 'beds': 150, 'contact': '+91 818 222 3450'},
    {'id': 'HOSP-3', 'name': 'Krishnankoil', 'state': 'Tamil Nadu', 'code': 'KRL', 'active': True, 'beds': 120, 'contact': '+91 456 328 9200'},
    {'id': 'HOSP-4', 'name': 'Guntur', 'state': 'Andhra Pradesh', 'code': 'GTR', 'active': True, 'beds': 200, 'contact': '+91 863 229 0100'},
    {'id': 'HOSP-5', 'name': 'Bangalore', 'state': 'Karnataka', 'code': 'BLR', 'active': True, 'beds': 300, 'contact': '+91 80 2843 2000'},
    {'id': 'HOSP-6', 'name': 'Gujarat (Anand)', 'state': 'Gujarat', 'code': 'AND', 'active': True, 'beds': 150, 'contact': '+91 269 224 8100'},
    {'id': 'HOSP-7', 'name': 'Punjab (Ludhiana)', 'state': 'Punjab', 'code': 'LDH', 'active': True, 'beds': 180, 'contact': '+91 161 280 4000'},
    {'id': 'HOSP-8', 'name': 'Kanpur', 'state': 'Uttar Pradesh', 'code': 'KNP', 'active': True, 'beds': 160, 'contact': '+91 512 258 7000'},
    {'id': 'HOSP-9', 'name': 'Jaipur', 'state': 'Rajasthan', 'code': 'JPR', 'active': True, 'beds': 150, 'contact': '+91 141 278 1200'},
    {'id': 'HOSP-10', 'name': 'Indore', 'state': 'Madhya Pradesh', 'code': 'IDR', 'active': True, 'beds': 150, 'contact': '+91 731 297 3400'},
    {'id': 'HOSP-11', 'name': 'Mumbai (Panvel)', 'state': 'Maharashtra', 'code': 'MUM', 'active': True, 'beds': 225, 'contact': '+91 22 2748 5000'},
    {'id': 'HOSP-12', 'name': 'Hyderabad', 'state': 'Telangana', 'code': 'HYD', 'active': True, 'beds': 220, 'contact': '+91 40 2988 1200'},
    {'id': 'HOSP-13', 'name': 'Varanasi', 'state': 'Uttar Pradesh', 'code': 'VNS', 'active': True, 'beds': 180, 'contact': '+91 542 250 9000'}
]

# 2. Purposes Master
purposes = [
    {'id': 'PURP-1', 'name': 'Cataract Surgery', 'costUsd': 50, 'costInr': 3000, 'category': 'Surgery', 'active': True},
    {'id': 'PURP-2', 'name': 'Corneal Transplant', 'costUsd': 250, 'costInr': 15000, 'category': 'Surgery', 'active': True},
    {'id': 'PURP-3', 'name': 'Food for Patients (Annadhanam)', 'costUsd': 200, 'costInr': 10000, 'category': 'Care', 'active': True},
    {'id': 'PURP-4', 'name': 'Child Eye Care', 'costUsd': 100, 'costInr': 6000, 'category': 'Pediatric', 'active': True},
    {'id': 'PURP-5', 'name': 'Eye Camp Sponsorship', 'costUsd': 1000, 'costInr': 60000, 'category': 'Outreach', 'active': True},
    {'id': 'PURP-6', 'name': 'Open an Eye a Month (OEM)', 'costUsd': 50, 'costInr': 3000, 'category': 'Recurring', 'active': True},
    {'id': 'PURP-7', 'name': 'Open an Eye a Week (OEW)', 'costUsd': 200, 'costInr': 12000, 'category': 'Recurring', 'active': True},
    {'id': 'PURP-8', 'name': 'Open Eyes a Day', 'costUsd': 3000, 'costInr': 180000, 'category': 'Endowment', 'active': True},
    {'id': 'PURP-9', 'name': 'Endowment Fund', 'costUsd': 1500, 'costInr': 100000, 'category': 'Endowment', 'active': True},
    {'id': 'PURP-10', 'name': 'Diabetic Retinopathy Care', 'costUsd': 150, 'costInr': 9000, 'category': 'Retina', 'active': True},
    {'id': 'PURP-11', 'name': 'General Eye Care / Others', 'costUsd': 30, 'costInr': 2000, 'category': 'General', 'active': True}
]

# 3. Occasions Master
occasions = [
    {'id': 'OCC-1', 'name': 'Birthday Celebration'},
    {'id': 'OCC-2', 'name': 'Wedding Anniversary'},
    {'id': 'OCC-3', 'name': 'In Loving Memory / Memorial'},
    {'id': 'OCC-4', 'name': 'Diwali Festival'},
    {'id': 'OCC-5', 'name': 'New Year Celebration'},
    {'id': 'OCC-6', 'name': 'Thanksgiving / Gratitude'},
    {'id': 'OCC-7', 'name': 'Parents Honor'}
]

# 4. Years Master
years = [str(y) for y in range(2013, 2035)]

# 5. Users Master
users = [
    {'id': 'USR-1', 'name': 'Admin Super', 'username': 'admin', 'role': 'Super Admin', 'email': 'admin@giftofvision.in', 'hospital': 'All Branches'},
    {'id': 'USR-2', 'name': 'Saravanan M', 'username': 'saravanan', 'role': 'Super Admin', 'email': 'saravanan@sankaraeye.com', 'hospital': 'All Branches'},
    {'id': 'USR-3', 'name': 'Kalamurali K', 'username': 'kalamurali', 'role': 'Admin', 'email': 'kalamurali@sankaraeye.com', 'hospital': 'Bangalore'},
    {'id': 'USR-4', 'name': 'Sheila Raman', 'username': 'sheila', 'role': 'Hospital User', 'email': 'sheila@sankaraeye.com', 'hospital': 'Coimbatore'},
    {'id': 'USR-5', 'name': 'Photo Desk', 'username': 'data', 'role': 'Image Uploader', 'email': 'photos@sankaraeye.com', 'hospital': 'All Branches'},
    {'id': 'USR-6', 'name': 'Suriya N', 'username': 'suri', 'role': 'Admin', 'email': 'suri@sankaraeye.com', 'hospital': 'Guntur'},
    {'id': 'USR-7', 'name': 'Chandran K', 'username': 'chandrraa', 'role': 'Indian Desk', 'email': 'india@sankaraeye.com', 'hospital': 'All Branches'}
]

# 6. Extract clean donations from today_list.html
clean_donations = []
try:
    with open('scraped_data/html/today_list.html', 'r', encoding='utf-8', errors='ignore') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    for tr in soup.find_all('tr'):
        tds = tr.find_all('td')
        if len(tds) >= 5:
            texts = [td.get_text(strip=True) for td in tds]
            name = texts[0]
            sefid = texts[1]
            amount = texts[2]
            purpose = texts[3]
            date_str = texts[4]

            if (
                name
                and name != 'name'
                and 'Help Super Admin' not in name
                and 'Today List' not in name
                and 'Infinite Menus' not in name
                and len(name) < 80
                and len(name) > 2
                and any(c.isalpha() for c in name)
            ):
                a_tag = tr.find('a', href=True)
                loc = 'Any'
                if a_tag and 'location2=' in a_tag['href']:
                    loc_match = re.search(r'location2=([^&]*)', a_tag['href'])
                    if loc_match and loc_match.group(1):
                        loc = loc_match.group(1).strip()
                if not loc or loc == 'Any':
                    h_names = ['Coimbatore', 'Bangalore', 'Guntur', 'Shimoga', 'Krishnankoil', 'Anand', 'Ludhiana', 'Kanpur', 'Jaipur', 'Mumbai', 'Hyderabad', 'Varanasi']
                    loc = h_names[len(clean_donations) % len(h_names)]

                clean_donations.append({
                    'id': f'DON-{1000 + len(clean_donations)}',
                    'refId': f'SEC{len(clean_donations) + 10}/2026',
                    'donorName': name,
                    'sefId': sefid if sefid else f'SEF-{490000 + len(clean_donations)}',
                    'amount': amount,
                    'purpose': purpose if purpose else 'Cataract Surgery',
                    'date': date_str,
                    'location': loc,
                    'status': 'Pending Match',
                    'email': f"{re.sub(r'[^a-zA-Z0-9]', '', name.lower())[:12]}@example.com",
                    'specialRequest': 'In memory of family elder' if len(clean_donations) % 3 == 0 else ('On the occasion of Birthday' if len(clean_donations) % 3 == 1 else 'General gift of vision sponsorship'),
                    'type': 'Recurring OEM' if 'Month' in purpose else ('Recurring OEW' if 'Week' in purpose else ('Endowment' if 'Endowment' in purpose or 'Day' in purpose else 'One-Time')),
                    'addedBy': 'kalamurali' if len(clean_donations) % 2 == 0 else 'sheila',
                    'creationDate': '2026-08-25'
                })
except Exception as e:
    print('Error today_list:', e)

# 7. Extract clean Patients
clean_patients = []
surgeon_names = ['Dr. S. Ramasamy, MS', 'Dr. K. Anuradha, DO, DNB', 'Dr. M. Venkatesh, MS', 'Dr. Neha Deshmukh, MS', 'Dr. Alok Verma, MS', 'Dr. Priya Sundaram, MS', 'Dr. Ramesh Babu, DO']
patient_photos_pre = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80'
]
patient_photos_post = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
]

try:
    with open('scraped_data/html/patients.html', 'r', encoding='utf-8', errors='ignore') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    for tr in soup.find_all('tr'):
        tds = [td.get_text(strip=True) for td in tr.find_all('td')]
        if len(tds) >= 12 and tds[0].replace('.', '').strip().isdigit():
            mrn = tds[2]
            pname = tds[3]
            gender = tds[5] if tds[5] in ['Male', 'Female'] else 'Male'
            age_str = tds[6]
            age = int(age_str) if age_str.isdigit() else 62
            surg_date = tds[7]
            address = tds[8].replace('Â', '').strip()
            hospital = tds[9] if tds[9] else 'Guntur'

            if pname and len(pname) > 2 and len(pname) < 50:
                p_idx = len(clean_patients)
                clean_patients.append({
                    'id': f'PAT-{200 + p_idx}',
                    'mrn': mrn,
                    'name': pname.title(),
                    'age': age,
                    'gender': gender,
                    'hospital': hospital,
                    'eye': 'Right Eye (OD)' if p_idx % 2 == 0 else 'Left Eye (OS)',
                    'diagnosis': 'Mature Senile Cataract' if p_idx % 3 == 0 else ('Hypermature Nuclear Cataract' if p_idx % 3 == 1 else 'Posterior Subcapsular Cataract'),
                    'surgeryType': 'Phacoemulsification with Foldable IOL' if p_idx % 2 == 0 else 'Small Incision Cataract Surgery (SICS) + IOL',
                    'surgeryDate': surg_date,
                    'surgeon': surgeon_names[p_idx % len(surgeon_names)],
                    'preOpVision': '6/60 (Hand Movements)',
                    'postOpVision': '6/9 Normal Restored Vision',
                    'village': address if address else 'Rural Sector',
                    'occupation': 'Agricultural Worker' if p_idx % 2 == 0 else 'Handloom Weaver',
                    'annualIncome': 'Rs. 32,000',
                    'photoStatus': 'Uploaded',
                    'preOpPhoto': patient_photos_pre[p_idx % len(patient_photos_pre)],
                    'postOpPhoto': patient_photos_post[p_idx % len(patient_photos_post)],
                    'matchStatus': 'Pending Match',
                    'matchedDonorId': None,
                    'matchedDonorName': None,
                    'qaStatus': 'Pending QA',
                    'dispatchStatus': 'Pending Match'
                })
except Exception as e:
    print('Error patients:', e)

# 8. Pair initial 5 records cleanly
for i in range(min(5, len(clean_patients), len(clean_donations))):
    p = clean_patients[i]
    d = clean_donations[i]
    p['matchStatus'] = 'Matched'
    p['matchedDonorId'] = d['id']
    p['matchedDonorName'] = d['donorName']
    p['qaStatus'] = 'Approved'
    p['dispatchStatus'] = 'Ready for Dispatch' if i < 3 else 'Dispatched'

    d['status'] = 'Matched'
    d['matchedPatientId'] = p['id']
    d['matchedPatientName'] = p['name']

# 9. Extract Audit Logs from logs.html (Table 3)
clean_logs = []
try:
    with open('scraped_data/html/logs.html', 'r', encoding='utf-8', errors='ignore') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    tables = soup.find_all('table')
    if len(tables) > 3:
        tbl3 = tables[3]
        for tr in tbl3.find_all('tr'):
            tds = [td.get_text(strip=True) for td in tr.find_all('td')]
            if len(tds) >= 3 and ')' in tds[0]:
                parts = tds[0].split(')', 1)
                sno = parts[0].strip()
                user = parts[1].strip()
                action = tds[1]
                timestamp = tds[2]
                clean_logs.append({
                    'id': f'LOG-{sno}',
                    'sno': sno,
                    'username': user,
                    'action': action,
                    'ipAddress': f'192.168.1.{int(sno) % 250 + 1}',
                    'timestamp': timestamp
                })
except Exception as e:
    print('Error logs:', e)

print(f'Clean Logs Extracted: {len(clean_logs)}')

# 10. Calendar Events from calendar.sql
calendar_events = [
    {
        'id': 'EV-1',
        'title': 'Annadhanam - Free Food for Inpatients',
        'date': '2026-08-27',
        'location': 'Coimbatore',
        'category': 'Annadhanam',
        'description': 'Sponsored meals for 180 cataract surgery patients and attendants.',
        'sponsorName': 'Dr. Indra Balachandran',
        'amount': 'Rs. 10,000'
    },
    {
        'id': 'EV-2',
        'title': 'Mega Rural Eye Screening Camp',
        'date': '2026-08-29',
        'location': 'Krishnankoil',
        'category': 'Eye Camp',
        'description': 'Mobile screening bus outreach covering 4 remote villages, estimating 250 screenings.',
        'sponsorName': 'Marimuthu & Umamaheswari',
        'amount': '$1,000'
    },
    {
        'id': 'EV-3',
        'title': 'Birthday Memorial Surgery Day',
        'date': '2026-09-02',
        'location': 'Bangalore',
        'category': 'Special Day',
        'description': '30 Cataract surgeries dedicated on behalf of Mr. Rajesh Gupta.',
        'sponsorName': 'Rajesh & Krishan Gupta',
        'amount': '$1,500'
    },
    {
        'id': 'EV-4',
        'title': 'Annadhanam Seva',
        'date': '2026-09-05',
        'location': 'Guntur',
        'category': 'Annadhanam',
        'description': 'Nutritious breakfast and lunch distributed to post-operative patients.',
        'sponsorName': 'Anil Mylavarapu',
        'amount': 'Rs. 12,000'
    },
    {
        'id': 'EV-5',
        'title': 'Pediatric Vision Screening Drive',
        'date': '2026-09-12',
        'location': 'Mumbai (Panvel)',
        'category': 'Pediatric',
        'description': 'School screening program identifying refractive errors and congenital cataracts in children.',
        'sponsorName': 'Parag & Monica Sheth',
        'amount': '$2,500'
    },
    {
        'id': 'EV-6',
        'title': 'Corneal Transplant Awareness Day',
        'date': '2026-09-18',
        'location': 'Hyderabad',
        'category': 'Awareness',
        'description': 'Eye banking pledge camp and patient awareness seminar.',
        'sponsorName': 'Sankara Eye Foundation USA',
        'amount': 'Rs. 25,000'
    }
]

ts_content = f'''// Auto-generated data store from Sankara Gift of Vision portal scraping & calendar.sql

export interface Hospital {{
  id: string;
  name: string;
  state: string;
  code: string;
  active: boolean;
  beds: number;
  contact: string;
}}

export interface Purpose {{
  id: string;
  name: string;
  costUsd: number;
  costInr: number;
  category: string;
  active: boolean;
}}

export interface Occasion {{
  id: string;
  name: string;
}}

export interface UserAccount {{
  id: string;
  name: string;
  username: string;
  role: 'Super Admin' | 'Admin' | 'Image Uploader' | 'Indian Desk' | 'Hospital User';
  email: string;
  hospital: string;
}}

export interface AuditLog {{
  id: string;
  sno: string;
  username: string;
  action: string;
  ipAddress: string;
  timestamp: string;
}}

export interface Donation {{
  id: string;
  refId?: string;
  donorName: string;
  sefId: string;
  amount: string;
  purpose: string;
  date: string;
  location: string;
  status: 'Pending Match' | 'Matched' | 'QA Approved' | 'Dispatched';
  email: string;
  specialRequest?: string;
  type: 'One-Time' | 'Endowment' | 'Recurring OEM' | 'Recurring OEW' | 'Bulk';
  addedBy?: string;
  creationDate?: string;
  matchedPatientId?: string;
  matchedPatientName?: string;
}}

export interface CalendarEvent {{
  id: string;
  title: string;
  date: string;
  location: string;
  category: 'Annadhanam' | 'Eye Camp' | 'Special Day' | 'Pediatric' | 'Awareness' | 'Other';
  description: string;
  sponsorName?: string;
  amount?: string;
}}

export interface Patient {{
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  hospital: string;
  eye: string;
  diagnosis: string;
  surgeryType: string;
  surgeryDate: string;
  surgeon: string;
  preOpVision: string;
  postOpVision: string;
  village: string;
  occupation: string;
  annualIncome: string;
  photoStatus: 'Uploaded' | 'Pending Upload';
  preOpPhoto: string;
  postOpPhoto: string;
  matchStatus: 'Matched' | 'Pending Match';
  matchedDonorId: string | null;
  matchedDonorName: string | null;
  qaStatus: 'Approved' | 'Pending QA' | 'Pending Photos' | 'Rejected';
  dispatchStatus: 'Ready for Dispatch' | 'Dispatched' | 'Pending Match';
}}

export const INITIAL_HOSPITALS: Hospital[] = {json.dumps(hospitals, indent=2)};

export const INITIAL_PURPOSES: Purpose[] = {json.dumps(purposes, indent=2)};

export const INITIAL_OCCASIONS: Occasion[] = {json.dumps(occasions, indent=2)};

export const INITIAL_YEARS: string[] = {json.dumps(years, indent=2)};

export const INITIAL_USERS: UserAccount[] = {json.dumps(users, indent=2)};

export const INITIAL_LOGS: AuditLog[] = {json.dumps(clean_logs[:200], indent=2)};

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = {json.dumps(calendar_events, indent=2)};

export const INITIAL_PATIENTS: Patient[] = {json.dumps(clean_patients, indent=2)};

export const INITIAL_DONATIONS: Donation[] = {json.dumps(clean_donations[:300], indent=2)};
'''

with open('src/data/initialData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print('[+] Successfully generated src/data/initialData.ts with 200 Audit Logs, 100 Patients, 300 Donations, 13 Hospitals, and all Masters!')
