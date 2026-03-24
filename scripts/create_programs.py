"""
Create 90j and 180j study programs from the imported courses.
Distributes courses evenly across program days by module.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import requests, json, math

SUPABASE_URL   = "https://wgkihkjhojnolndznvyz.supabase.co"
SERVICE_ROLE   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2loa2pob2pub2xuZHpudnl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEyNjQxOSwiZXhwIjoyMDg5NzAyNDE5fQ.IGzZ9uIAjcly_B-ayYDdKH-GCv-4icEAThTQ4cMlpGw"

HEADERS = {
    "apikey": SERVICE_ROLE,
    "Authorization": f"Bearer {SERVICE_ROLE}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

def get(table, params=None):
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, params=params)
    return r.json() if r.status_code == 200 else []

def post(table, data):
    r = requests.post(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, json=data)
    if r.status_code not in (200, 201):
        print(f"  ERROR {r.status_code}: {r.text[:100]}")
        return None
    result = r.json()
    return result[0] if isinstance(result, list) else result

def delete(table, col, val):
    requests.delete(f"{SUPABASE_URL}/rest/v1/{table}?{col}=eq.{val}", headers=HEADERS)

def create_program(ptype, title, description, total_days, courses_by_module):
    """Create a program with program_days."""
    print(f"\n=== Creating {title} ({total_days} days) ===")

    # Delete existing
    existing = get("programs", {"type": f"eq.{ptype}", "select": "id"})
    for p in existing:
        delete("program_days", "program_id", p["id"])
        delete("programs", "id", p["id"])

    # Create program
    prog = post("programs", {
        "type": ptype,
        "title": title,
        "description": description,
        "total_days": total_days,
        "is_active": True,
    })
    if not prog:
        return

    prog_id = prog["id"]
    print(f"  Created program: {prog_id}")

    # Distribute courses across days
    # Each day gets ~3 courses (for 90j) or ~1.5 courses (for 180j)
    # Interleave modules for variety

    # Flatten courses with module info, interleaved
    modules_order = ['anatomie-biologie', 'medecine', 'chirurgie', 'urgences-medicales', 'urgences-chirurgicales']
    all_courses_interleaved = []

    max_len = max(len(c) for c in courses_by_module.values()) if courses_by_module else 0
    for i in range(max_len):
        for mod in modules_order:
            courses = courses_by_module.get(mod, [])
            if i < len(courses):
                all_courses_interleaved.append((mod, courses[i]))

    total_courses = len(all_courses_interleaved)
    courses_per_day = math.ceil(total_courses / total_days)
    courses_per_day = max(1, min(courses_per_day, 5))  # 1-5 courses per day

    print(f"  Total courses: {total_courses}, ~{courses_per_day} per day")

    # Module names for day titles
    MODULE_NAMES = {
        'anatomie-biologie': 'Anatomie & Biologie',
        'medecine': 'Pathologie Médicale',
        'chirurgie': 'Pathologie Chirurgicale',
        'urgences-medicales': 'Urgences Médicales',
        'urgences-chirurgicales': 'Urgences Chirurgicales',
    }

    day_num = 1
    course_idx = 0
    days_created = 0

    while day_num <= total_days and course_idx < total_courses:
        # Pick courses for this day
        day_courses = all_courses_interleaved[course_idx:course_idx + courses_per_day]
        course_idx += courses_per_day

        if not day_courses:
            break

        # Day title: based on primary module(s) for today
        mod_counts: dict[str, int] = {}
        for mod, _ in day_courses:
            mod_counts[mod] = mod_counts.get(mod, 0) + 1
        primary_mod = max(mod_counts, key=lambda k: mod_counts[k])
        day_title = f"Jour {day_num} — {MODULE_NAMES.get(primary_mod, primary_mod)}"

        course_ids = [c["id"] for _, c in day_courses]
        titles = [c["title"] for _, c in day_courses]

        estimated_hours = round(len(day_courses) * 0.75, 1)

        day_data = {
            "program_id": prog_id,
            "day_number": day_num,
            "title": day_title,
            "description": f"Cours : {', '.join(t[:40] for t in titles[:3])}{'...' if len(titles) > 3 else ''}",
            "objectives": [f"Maîtriser : {t[:60]}" for t in titles[:3]],
            "course_ids": course_ids,
            "qcm_count": len(day_courses) * 5,  # 5 QCM per course
            "estimated_hours": estimated_hours,
        }

        result = post("program_days", day_data)
        if result:
            days_created += 1
            if day_num % 30 == 1 or day_num <= 3:
                print(f"  Day {day_num}: {day_title} ({len(course_ids)} courses)")

        day_num += 1

    # Fill remaining days (review days)
    while day_num <= total_days:
        review_courses = all_courses_interleaved[:courses_per_day]  # repeat from start
        course_ids = [c["id"] for _, c in review_courses]

        day_data = {
            "program_id": prog_id,
            "day_number": day_num,
            "title": f"Jour {day_num} — Révision générale",
            "description": "Révision et consolidation des connaissances acquises.",
            "objectives": ["Réviser les points clés de chaque module", "Pratiquer avec des QCM"],
            "course_ids": course_ids,
            "qcm_count": 20,
            "estimated_hours": 2.0,
        }
        post("program_days", day_data)
        days_created += 1
        day_num += 1

    print(f"  Created {days_created} days")

def main():
    print("Fetching modules and courses...")

    # Fetch all modules
    modules = get("modules", {"select": "id,slug", "is_active": "eq.true"})
    slug_to_id = {m["slug"]: m["id"] for m in modules}
    print(f"  Modules: {list(slug_to_id.keys())}")

    # Fetch all courses grouped by module
    courses_by_module: dict[str, list] = {}
    for slug, mid in slug_to_id.items():
        courses = get("courses", {
            "module_id": f"eq.{mid}",
            "is_published": "eq.true",
            "select": "id,title,order_index",
            "order": "order_index",
        })
        courses_by_module[slug] = courses
        print(f"  {slug}: {len(courses)} courses")

    # Create 90j program
    create_program(
        "90j",
        "Programme 90 Jours — UM6SS",
        "Programme intensif de 90 jours couvrant tous les modules pour l'internat UM6SS.",
        90,
        courses_by_module,
    )

    # Create 180j program
    create_program(
        "180j",
        "Programme 180 Jours — UM6SS",
        "Programme complet de 180 jours avec révisions approfondies pour l'internat UM6SS.",
        180,
        courses_by_module,
    )

    print("\n✅ Programs created!")

if __name__ == "__main__":
    main()
