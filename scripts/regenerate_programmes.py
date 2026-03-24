"""
Régénération des programmes 90j et 180j avec des cours valides et une séquence logique.

Stratégie :
- Filtrer les cours valides (pas de sous-sections, contenu substantiel)
- Conserver l'ordre_index (= ordre PDF = ordre pédagogique naturel)
- 90j : 4 cours/jour, séquence module par module
- 180j : 4-5 cours/jour, couverture plus large
"""

import os, re, time, sys
import requests

SUPABASE_URL = "https://wgkihkjhojnolndznvyz.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2loa2pob2pub2xuZHpudnl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEyNjQxOSwiZXhwIjoyMDg5NzAyNDE5fQ.IGzZ9uIAjcly_B-ayYDdKH-GCv-4icEAThTQ4cMlpGw"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}


# ── Helpers ────────────────────────────────────────────────────────────────

def sb_get(path: str, params: dict = None):
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{path}", params=params, headers=HEADERS, timeout=15)
    r.raise_for_status()
    return r.json()


def is_valid_course(c: dict) -> bool:
    t = c["title"].strip()
    if len(t) <= 5:
        return False
    if t.startswith("CONTENU"):
        return False
    # Numbered sections: "3 – ", "1. ", "2-"
    if re.match(r"^\d+\s*[\u2013\u2014\-\.]\s", t):
        return False
    # Lettered subsections: "A – ", "B. ", "C- "
    if re.match(r"^[A-Z]{1,3}[\s\u2013\u2014\-\.]\s", t):
        return False
    # Headers ending with colon
    if t.endswith(" :") or t.endswith(":"):
        return False
    # Roman numerals: "I. ", "II. "
    if re.match(r"^[IVX]+\.\s", t):
        return False
    # Bullet starts
    if re.match(r"^[•·▪\-–—]", t):
        return False
    # Short content
    content_len = len(c.get("content") or "")
    if content_len < 500:
        return False
    return True


def fetch_valid_courses(module_id: str) -> list:
    """Fetch all published courses for a module, paginated, sorted by order_index."""
    all_courses = []
    page = 0
    while True:
        data = sb_get(
            "courses",
            {
                "module_id": f"eq.{module_id}",
                "is_published": "eq.true",
                "select": "id,title,order_index,content",
                "order": "order_index.asc",
                "offset": page * 1000,
                "limit": 1000,
            },
        )
        if not data:
            break
        all_courses.extend(data)
        if len(data) < 1000:
            break
        page += 1

    valid = [c for c in all_courses if is_valid_course(c)]
    return valid


def chunk(lst: list, n: int) -> list:
    return [lst[i : i + n] for i in range(0, len(lst), n)]


# ── Programme definitions ──────────────────────────────────────────────────

# Module slugs in pedagogical order
MODULE_ORDER = [
    "anatomie-biologie",
    "medecine",
    "chirurgie",
    "urgences-medicales",
    "urgences-chirurgicales",
]

MODULE_NAMES = {
    "anatomie-biologie":      "Anatomie & Biologie",
    "medecine":               "Médecine",
    "chirurgie":              "Chirurgie",
    "urgences-medicales":     "Urgences Médicales",
    "urgences-chirurgicales": "Urgences Chirurgicales",
}

# How many courses per day (programme_type -> courses_per_day)
COURSES_PER_DAY = {"90j": 4, "180j": 5}

# Target total days
TOTAL_DAYS = {"90j": 90, "180j": 180}

# QCM / hours per day
QCM_PER_DAY   = 10
HOURS_PER_DAY = 3.0


def build_day_plan(valid_courses_by_module: dict, total_days: int, cpd: int) -> list:
    """
    Returns a list of day dicts, length = total_days.
    Courses are distributed module-by-module in original PDF order.
    """

    # 1. Compute how many days each module gets (proportional to course count, minimum 1)
    total_valid = sum(len(v) for v in valid_courses_by_module.values())
    # If we have enough courses, allocate proportionally
    days_per_module = {}
    leftover = total_days
    for i, slug in enumerate(MODULE_ORDER):
        courses = valid_courses_by_module.get(slug, [])
        if i == len(MODULE_ORDER) - 1:
            # Last module gets remaining days
            days_per_module[slug] = leftover
        else:
            n = max(1, round(len(courses) / total_valid * total_days))
            # Don't allocate more days than needed
            n = min(n, max(1, len(courses) // cpd + (1 if len(courses) % cpd else 0)))
            days_per_module[slug] = n
            leftover -= n

    days = []
    global_day = 1

    for slug in MODULE_ORDER:
        courses = valid_courses_by_module.get(slug, [])
        n_days = days_per_module[slug]
        module_name = MODULE_NAMES[slug]

        if not courses:
            # Empty placeholder days
            for _ in range(n_days):
                if global_day > total_days:
                    break
                days.append({
                    "day_number": global_day,
                    "title": f"Jour {global_day} — {module_name}",
                    "description": None,
                    "objectives": [],
                    "course_ids": [],
                    "qcm_count": 0,
                    "estimated_hours": HOURS_PER_DAY,
                })
                global_day += 1
            continue

        # Distribute courses across n_days
        groups = chunk(courses, cpd)
        # If we have more groups than days, trim; if fewer, last day is partial
        for i in range(n_days):
            if global_day > total_days:
                break
            grp = groups[i] if i < len(groups) else []
            obj = [f"Maîtriser : {c['title']}" for c in grp[:3]]
            days.append({
                "day_number": global_day,
                "title": f"Jour {global_day} — {module_name}",
                "description": None,
                "objectives": obj,
                "course_ids": [c["id"] for c in grp],
                "qcm_count": QCM_PER_DAY if grp else 0,
                "estimated_hours": HOURS_PER_DAY,
            })
            global_day += 1

    # If we still have remaining days (because modules ran out early), fill with rest
    while global_day <= total_days:
        days.append({
            "day_number": global_day,
            "title": f"Jour {global_day} — Révisions",
            "description": "Révision et consolidation des acquis",
            "objectives": [],
            "course_ids": [],
            "qcm_count": QCM_PER_DAY,
            "estimated_hours": HOURS_PER_DAY,
        })
        global_day += 1

    return days[:total_days]


def patch_with_retry(program_id: str, day_number: int, payload: dict, max_retries: int = 4):
    for attempt in range(max_retries):
        try:
            r = requests.patch(
                f"{SUPABASE_URL}/rest/v1/program_days",
                params={"program_id": f"eq.{program_id}", "day_number": f"eq.{day_number}"},
                json=payload,
                headers=HEADERS,
                timeout=20,
            )
            return r
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
            if attempt == max_retries - 1:
                raise
            wait = 2 ** attempt
            print(f"    Connexion perdue (tentative {attempt+1}), retry dans {wait}s...")
            time.sleep(wait)


def update_programme(program_type: str, day_plans: list):
    data = sb_get("programs", {"type": f"eq.{program_type}", "select": "id"})
    program_id = data[0]["id"]
    print(f"\n  Programme {program_type}: id={program_id}")

    success = 0
    for d in day_plans:
        payload = {k: v for k, v in d.items() if k != "day_number"}
        r = patch_with_retry(program_id, d["day_number"], payload)
        if r.status_code not in (200, 204):
            print(f"    ERR day {d['day_number']}: {r.status_code} {r.text[:80]}")
        else:
            success += 1
        time.sleep(0.15)

    print(f"  Updated {success}/{len(day_plans)} days")


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    print("Fetching modules...")
    modules = sb_get("modules", {"is_active": "eq.true", "select": "id,slug,name"})
    module_by_slug = {m["slug"]: m for m in modules}

    print("Fetching valid courses per module...")
    valid_by_module = {}
    for slug in MODULE_ORDER:
        m = module_by_slug.get(slug)
        if not m:
            print(f"  WARNING: module '{slug}' not found")
            continue
        courses = fetch_valid_courses(m["id"])
        valid_by_module[slug] = courses
        print(f"  {slug}: {len(courses)} valid courses")

    for prog_type in ["90j", "180j"]:
        print(f"\n=== Génération {prog_type} ===")
        total = TOTAL_DAYS[prog_type]
        cpd = COURSES_PER_DAY[prog_type]

        day_plans = build_day_plan(valid_by_module, total, cpd)

        # Stats
        days_with_courses = sum(1 for d in day_plans if d["course_ids"])
        total_courses_assigned = sum(len(d["course_ids"]) for d in day_plans)
        print(f"  {days_with_courses}/{total} jours avec cours ({total_courses_assigned} cours assignés)")

        # Preview first 5 days
        print("  Aperçu :")
        for d in day_plans[:5]:
            print(f"    Jour {d['day_number']}: {d['title']} — {len(d['course_ids'])} cours")
            for obj in d["objectives"][:2]:
                print(f"      · {obj[:60]}")

        update_programme(prog_type, day_plans)

    print("\nDone.")


if __name__ == "__main__":
    main()
