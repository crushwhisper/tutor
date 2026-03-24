"""Complete the 90j program that was interrupted."""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import requests, json, math, time

SUPABASE_URL = "https://wgkihkjhojnolndznvyz.supabase.co"
SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2loa2pob2pub2xuZHpudnl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEyNjQxOSwiZXhwIjoyMDg5NzAyNDE5fQ.IGzZ9uIAjcly_B-ayYDdKH-GCv-4icEAThTQ4cMlpGw"
HEADERS = {"apikey": SERVICE_ROLE, "Authorization": f"Bearer {SERVICE_ROLE}", "Content-Type": "application/json", "Prefer": "return=representation"}

def get(table, params=None):
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, params=params)
    return r.json() if r.status_code == 200 else []

def post_with_retry(table, data, retries=3):
    for attempt in range(retries):
        try:
            r = requests.post(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, json=data, timeout=15)
            if r.status_code in (200, 201):
                result = r.json()
                return result[0] if isinstance(result, list) else result
            if r.status_code == 409:  # duplicate
                return {"id": "exists"}
            print(f"  ERROR {r.status_code}: {r.text[:80]}")
        except Exception as e:
            print(f"  Retry {attempt+1}: {e}")
            time.sleep(2)
    return None

MODULE_NAMES = {
    'anatomie-biologie': 'Anatomie & Biologie',
    'medecine': 'Pathologie Médicale',
    'chirurgie': 'Pathologie Chirurgicale',
    'urgences-medicales': 'Urgences Médicales',
    'urgences-chirurgicales': 'Urgences Chirurgicales',
}

# Get the 90j program
progs = get("programs", {"type": "eq.90j", "select": "id"})
prog_id = progs[0]["id"] if progs else None
print(f"90j program ID: {prog_id}")
if not prog_id:
    print("ERROR: no 90j program found!")
    sys.exit(1)

# Get existing days to find max day_number
existing_days = get("program_days", {"program_id": f"eq.{prog_id}", "select": "day_number", "order": "day_number.desc", "limit": "1"})
max_day = existing_days[0]["day_number"] if existing_days else 0
print(f"Existing days: 1-{max_day}, need to complete up to 90")

if max_day >= 90:
    print("90j program is already complete!")
    sys.exit(0)

# Fetch all courses
modules = get("modules", {"select": "id,slug", "is_active": "eq.true"})
slug_to_id = {m["slug"]: m["id"] for m in modules}
modules_order = ['anatomie-biologie', 'medecine', 'chirurgie', 'urgences-medicales', 'urgences-chirurgicales']

courses_by_module = {}
for slug in modules_order:
    mid = slug_to_id.get(slug)
    if mid:
        courses = get("courses", {"module_id": f"eq.{mid}", "is_published": "eq.true", "select": "id,title,order_index", "order": "order_index", "limit": "500"})
        courses_by_module[slug] = courses
        print(f"  {slug}: {len(courses)} courses")

# Build interleaved course list (same logic as create_programs.py)
all_courses = []
max_len = max(len(c) for c in courses_by_module.values()) if courses_by_module else 0
for i in range(max_len):
    for mod in modules_order:
        c_list = courses_by_module.get(mod, [])
        if i < len(c_list):
            all_courses.append((mod, c_list[i]))

total_courses = len(all_courses)
courses_per_day = max(1, math.ceil(total_courses / 90))
print(f"Total courses: {total_courses}, {courses_per_day} per day")

# Create missing days (from max_day+1 to 90)
created = 0
for day_num in range(max_day + 1, 91):
    course_idx = ((day_num - 1) * courses_per_day) % total_courses
    day_courses = all_courses[course_idx:course_idx + courses_per_day]
    if not day_courses:
        day_courses = all_courses[:courses_per_day]  # wrap around

    mod_counts = {}
    for mod, _ in day_courses:
        mod_counts[mod] = mod_counts.get(mod, 0) + 1
    primary_mod = max(mod_counts, key=lambda k: mod_counts[k])
    day_title = f"Jour {day_num} — {MODULE_NAMES.get(primary_mod, primary_mod)}"

    course_ids = [c["id"] for _, c in day_courses]
    titles = [c["title"] for _, c in day_courses]

    data = {
        "program_id": prog_id,
        "day_number": day_num,
        "title": day_title,
        "description": f"Cours : {', '.join(t[:40] for t in titles[:2])}{'...' if len(titles) > 2 else ''}",
        "objectives": [f"Maîtriser : {t[:60]}" for t in titles[:2]],
        "course_ids": course_ids,
        "qcm_count": len(day_courses) * 5,
        "estimated_hours": round(len(day_courses) * 0.75, 1),
    }
    result = post_with_retry("program_days", data)
    if result:
        created += 1
        if day_num % 10 == 1 or day_num == max_day + 1:
            print(f"  Day {day_num}: {day_title[:50]}")

print(f"\nCreated {created} more days. 90j program is now complete!")
