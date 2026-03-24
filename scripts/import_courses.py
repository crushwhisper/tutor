"""
Extract courses from UM6SS MED.pdf and QCM banks, then import to Supabase.

Module page boundaries (1-indexed):
  Anatomie:              pages 4-79
  Biologie:              pages 80-181
  Pathologie Médicale:   pages 182-402
  Pathologie Chirurgicale: pages 403-485
  Urgences Médicales:    pages 486-618
  Urgences Chirurgicales: pages 619-698

Run: python import_courses.py [--dry-run] [--skip-qcm] [--skip-courses]
"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import re
import json
import time
import argparse
import unicodedata
import pdfplumber
import requests

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SUPABASE_URL   = "https://wgkihkjhojnolndznvyz.supabase.co"
SERVICE_ROLE   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2loa2pob2pub2xuZHpudnl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEyNjQxOSwiZXhwIjoyMDg5NzAyNDE5fQ.IGzZ9uIAjcly_B-ayYDdKH-GCv-4icEAThTQ4cMlpGw"

PDF_MAIN  = r"C:\Users\X1 Carbon\Desktop\TUTOR\UM6SS MED.pdf"
QCM_FILES = {
    "anatomie-biologie": [
        r"C:\Users\X1 Carbon\Desktop\TUTOR\Banque Anatomie UM6SS candidats.pdf",
        r"C:\Users\X1 Carbon\Desktop\TUTOR\Banque Biologie UM6SS Candidats.pdf",
    ],
    "medecine": [
        r"C:\Users\X1 Carbon\Desktop\TUTOR\Banque Médecine UM6SS Candidats.pdf",
        r"C:\Users\X1 Carbon\Desktop\TUTOR\BANQUE QCM URG MEDECINE A TITRE INDICATIF.pdf",
    ],
    "chirurgie": [
        r"C:\Users\X1 Carbon\Desktop\TUTOR\Banque Chirurgie UM6SS Candidats.pdf",
        r"C:\Users\X1 Carbon\Desktop\TUTOR\BANQUE QCM ADMISSION CHIRURGIE A TITRE INDICATIF.pdf",
    ],
}

# Module definitions with page boundaries (1-indexed, inclusive)
MODULES = [
    {
        "slug": "anatomie-biologie",
        "name": "Anatomie & Biologie",
        "description": "Anatomie macroscopique et biologie cellulaire et moléculaire",
        "icon": "Heart",
        "color": "#3B82F6",
        "order_index": 1,
        "page_start": 4,
        "page_end": 181,
    },
    {
        "slug": "medecine",
        "name": "Pathologie Médicale",
        "description": "Pathologies médicales : endocrinologie, cardiologie, pneumologie...",
        "icon": "Stethoscope",
        "color": "#10B981",
        "order_index": 2,
        "page_start": 182,
        "page_end": 402,
    },
    {
        "slug": "chirurgie",
        "name": "Pathologie Chirurgicale",
        "description": "Chirurgie orthopédique, viscérale, urologique...",
        "icon": "Scissors",
        "color": "#F59E0B",
        "order_index": 3,
        "page_start": 403,
        "page_end": 485,
    },
    {
        "slug": "urgences-medicales",
        "name": "Urgences Médicales",
        "description": "Prise en charge des urgences médicales et pédiatriques",
        "icon": "FirstAid",
        "color": "#EF4444",
        "order_index": 4,
        "page_start": 486,
        "page_end": 618,
    },
    {
        "slug": "urgences-chirurgicales",
        "name": "Urgences Chirurgicales",
        "description": "Prise en charge des urgences chirurgicales",
        "icon": "Bandaids",
        "color": "#8B5CF6",
        "order_index": 5,
        "page_start": 619,
        "page_end": 698,
    },
]

# ─── HELPERS ───────────────────────────────────────────────────────────────────
def slugify(text: str) -> str:
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text.strip())
    text = re.sub(r"-+", "-", text)
    return text[:80]

def supa_post(table: str, data: dict | list, dry_run: bool = False) -> dict | None:
    if dry_run:
        preview = json.dumps(data if isinstance(data, dict) else data[0], ensure_ascii=False)[:120]
        print(f"  [dry-run] POST {table}: {preview}...")
        return {"id": "dry-run-id"}

    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SERVICE_ROLE,
        "Authorization": f"Bearer {SERVICE_ROLE}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    resp = requests.post(url, json=data, headers=headers)
    if resp.status_code not in (200, 201):
        print(f"  ERROR {resp.status_code}: {resp.text[:200]}")
        return None
    result = resp.json()
    return result[0] if isinstance(result, list) else result

def supa_get(table: str, params: dict = None) -> list:
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SERVICE_ROLE,
        "Authorization": f"Bearer {SERVICE_ROLE}",
    }
    resp = requests.get(url, headers=headers, params=params)
    if resp.status_code != 200:
        return []
    return resp.json()

def supa_delete_where(table: str, column: str, value: str, dry_run: bool = False):
    if dry_run:
        print(f"  [dry-run] DELETE FROM {table} WHERE {column}={value}")
        return
    url = f"{SUPABASE_URL}/rest/v1/{table}?{column}=eq.{value}"
    headers = {
        "apikey": SERVICE_ROLE,
        "Authorization": f"Bearer {SERVICE_ROLE}",
    }
    requests.delete(url, headers=headers)

# ─── MODULE IMPORT ─────────────────────────────────────────────────────────────
def import_modules(dry_run: bool) -> dict[str, str]:
    """Upsert modules, return slug→id mapping."""
    print("\n=== IMPORTING MODULES ===")
    slug_to_id = {}

    for mod in MODULES:
        payload = {
            "slug": mod["slug"],
            "name": mod["name"],
            "description": mod["description"],
            "icon": mod["icon"],
            "color": mod["color"],
            "order_index": mod["order_index"],
            "is_active": True,
        }
        result = supa_post("modules", payload, dry_run)
        if result:
            mod_id = result.get("id", f"dry-{mod['slug']}")
            slug_to_id[mod["slug"]] = mod_id
            print(f"  ✓ {mod['name']} → {mod_id}")
        else:
            # Module might already exist; fetch it
            existing = supa_get("modules", {"slug": f"eq.{mod['slug']}", "select": "id,slug"})
            if existing:
                slug_to_id[mod["slug"]] = existing[0]["id"]
                print(f"  ~ {mod['name']} already exists → {existing[0]['id']}")

    return slug_to_id

# ─── COURSE EXTRACTION ─────────────────────────────────────────────────────────
def get_module_for_page(page_num: int) -> str:
    """Return module slug for a given page number (1-indexed)."""
    for mod in MODULES:
        if mod["page_start"] <= page_num <= mod["page_end"]:
            return mod["slug"]
    return "anatomie-biologie"  # fallback

def is_chapter_title_line(line: str) -> bool:
    """Detect if a single line is likely a chapter title."""
    line = line.strip()
    if not line or len(line) < 4 or len(line) > 120:
        return False
    # Skip lines starting with bullets, dashes, numbers-dot, lowercase
    if line[0].islower():
        return False
    if re.match(r'^[-•▪▸→o]', line):
        return False
    if re.match(r'^\d+[\.\)]\s', line):
        return False
    # Skip continuation lines (paragraph sentences are long and have commas/conjunctions mid-text)
    # A title is usually a noun phrase, no verb conjugations
    return True

CONTENT_STARTERS = [
    'INTRODUCTION', 'Introduction', 'DÉFINITION', 'DEFINITION', 'Définition',
    'GÉNÉRALITÉS', 'GENERALITES', 'RAPPEL', 'PHYSIOPATHOLOGIE', 'Physiopathologie',
    'SITUATION', 'ÉPIDÉMIOLOGIE', 'Épidémiologie', 'EPIDEMIOLOGIE',
    'ÉTIOLOGIE', 'Étiologie', 'ETIOLOGIE', 'DIAGNOSTIC', 'Diagnostic',
    'CLASSIFICATION', 'Classification', 'I.', 'I-', 'I –', '1.', '1 –',
    'A.', 'A –', 'A-', 'Historique', 'HISTORIQUE', 'PLAN',
    'CAT', 'Conduite', 'CONDUITE', 'SYMPTÔMES', 'Symptômes', 'Définition',
]

def page_starts_chapter(lines: list[str]) -> tuple[bool, str]:
    """Detect if a page starts a new chapter."""
    if not lines:
        return False, ""
    first = lines[0].strip()

    # Skip very long first lines (paragraph continuation)
    if len(first) > 120:
        return False, ""
    # Skip section headers (TOC pages)
    if first in ('ANATOMIE', 'BIOLOGIE', 'LA PATHOLOGIE', 'URGENCES', 'ADMISSIBILITE', 'ADMISSION'):
        return False, ""
    # Must start with uppercase
    if first and first[0].islower():
        return False, ""
    # Skip cover/TOC markers
    if any(marker in first for marker in ['WWW.', 'HTTP', 'EDITION', 'PAGES', '©']):
        return False, ""

    # Look for content starter in next few lines
    next_lines = lines[1:6]
    for line in next_lines:
        ls = line.strip()
        for starter in CONTENT_STARTERS:
            if ls.startswith(starter) and len(ls) > 2:
                return True, first
    return False, ""

def extract_courses_from_pdf() -> list[dict]:
    """Extract all courses from UM6SS MED.pdf."""
    print("\n=== EXTRACTING COURSES FROM PDF ===")
    courses = []

    with pdfplumber.open(PDF_MAIN) as pdf:
        total = len(pdf.pages)
        print(f"Reading {total} pages...")

        # First pass: find all chapter start pages
        chapter_pages = []  # list of (page_num_1indexed, title)

        for i in range(3, total):  # start from page 4 (0-indexed: 3)
            if (i + 1) % 100 == 0:
                print(f"  Scanning page {i+1}/{total}...")
            page = pdf.pages[i]
            text = page.extract_text() or ""
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            is_chapter, title = page_starts_chapter(lines)
            if is_chapter:
                chapter_pages.append((i + 1, title))  # 1-indexed

        print(f"Found {len(chapter_pages)} chapter starts")

        # Second pass: extract content for each chapter
        for idx, (start_page, title) in enumerate(chapter_pages):
            end_page = chapter_pages[idx + 1][0] - 1 if idx + 1 < len(chapter_pages) else total
            # Cap at module boundary
            mod_slug = get_module_for_page(start_page)
            # Don't cross module boundaries
            for mod in MODULES:
                if mod["slug"] == mod_slug:
                    end_page = min(end_page, mod["page_end"])
                    break

            # Extract text from pages start_page..end_page
            content_parts = []
            for p in range(start_page - 1, min(end_page, total)):  # 0-indexed
                page = pdf.pages[p]
                text = page.extract_text() or ""
                if text.strip():
                    content_parts.append(text.strip())

            content = "\n\n".join(content_parts)
            # Remove the title from the beginning if duplicated
            lines_all = content.split('\n')
            if lines_all and lines_all[0].strip() == title:
                content = '\n'.join(lines_all[1:]).strip()

            # Build summary from first 300 chars of content
            summary_text = re.sub(r'\s+', ' ', content[:500]).strip()
            summary = summary_text[:300] if len(summary_text) > 300 else summary_text

            courses.append({
                "module_slug": mod_slug,
                "title": title,
                "slug_base": slugify(title),
                "content": content,
                "summary": summary,
                "start_page": start_page,
                "end_page": end_page,
            })

    # Deduplicate slugs
    slug_counts: dict[str, int] = {}
    for c in courses:
        base = c["slug_base"]
        if base in slug_counts:
            slug_counts[base] += 1
            c["slug"] = f"{base}-{slug_counts[base]}"
        else:
            slug_counts[base] = 0
            c["slug"] = base

    print(f"Extracted {len(courses)} courses")
    return courses

def import_courses(courses: list[dict], module_ids: dict[str, str], dry_run: bool) -> dict[str, str]:
    """Import courses to Supabase, return title→id mapping."""
    print(f"\n=== IMPORTING {len(courses)} COURSES ===")
    title_to_id = {}
    errors = 0

    # Delete existing courses first (clean import)
    for mod in MODULES:
        if not dry_run:
            mid = module_ids.get(mod["slug"])
            if mid:
                supa_delete_where("courses", "module_id", mid, dry_run=False)

    for i, course in enumerate(courses):
        mod_id = module_ids.get(course["module_slug"])
        if not mod_id:
            print(f"  SKIP (no module_id): {course['title'][:50]}")
            continue

        # Estimate duration: ~200 words/minute reading speed
        word_count = len(course["content"].split())
        duration = max(15, min(60, word_count // 40))

        payload = {
            "module_id": mod_id,
            "slug": course["slug"],
            "title": course["title"],
            "content": course["content"],
            "summary": course["summary"],
            "duration_minutes": duration,
            "difficulty": "moyen",
            "is_premium": False,
            "is_published": True,
            "order_index": i,
            "course_metadata": {"source": "UM6SS MED.pdf", "pages": f"{course['start_page']}-{course['end_page']}"},
        }

        result = supa_post("courses", payload, dry_run)
        if result:
            cid = result.get("id", f"dry-{i}")
            title_to_id[course["title"]] = cid
            if i % 20 == 0 or dry_run:
                print(f"  [{i+1}/{len(courses)}] ✓ {course['title'][:60]}")
        else:
            errors += 1
            print(f"  [{i+1}] ERROR: {course['title'][:60]}")

        # Rate limit
        if not dry_run and i % 50 == 49:
            time.sleep(0.5)

    print(f"Imported {len(title_to_id)} courses ({errors} errors)")
    return title_to_id

# ─── QCM EXTRACTION ────────────────────────────────────────────────────────────
def extract_qcm_from_pdf(pdf_path: str) -> list[dict]:
    """
    Extract QCM questions from a QCM bank PDF.

    Format in PDF:
      1 Question text here :
      - Option A text
      - Option B text
      - Option C text
      - Option D text
      2 Next question...
    """
    questions = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text() or ""
                full_text += text + "\n"
    except Exception as e:
        print(f"  ERROR reading {pdf_path}: {e}")
        return []

    lines = full_text.split('\n')

    # Pattern 1: "1 Question text" (space after number)
    # Pattern 2: "1- Question text" (dash after number)
    q_pattern = re.compile(r'^(\d+)[-\s]\s*(.+)')
    # Option: starts with dash (- or –), with or without space
    opt_pattern = re.compile(r'^[-–]\s*(.+)')

    current_q_num = None
    current_q_text = ""
    current_options = []

    def save_question():
        if current_q_text and len(current_options) >= 2:
            q_text = re.sub(r'\s+', ' ', current_q_text).strip()
            opts = [re.sub(r'\s+', ' ', o).strip() for o in current_options[:5]]
            while len(opts) < 4:
                opts.append("—")
            questions.append({
                "question": q_text,
                "options": opts[:5],
                "correct_answer": 0,  # placeholder - no correct answers in source
                "difficulty": "moyen",
            })

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        # Skip header lines
        if any(skip in line_stripped.upper() for skip in ['BANQUE QCM', 'A TITRE INDICATIF', 'WWW.', 'HTTP']):
            continue

        # Check for new question (starts with number space text)
        m = q_pattern.match(line_stripped)
        if m:
            qnum = int(m.group(1))
            # Valid question numbers are sequential-ish, not > 500
            if 1 <= qnum <= 500:
                save_question()
                current_q_num = qnum
                current_q_text = m.group(2).strip()
                current_options = []
                continue

        # Check for option (dash prefix)
        if current_q_num is not None:
            m2 = opt_pattern.match(line_stripped)
            if m2:
                opt_text = m2.group(1).strip()
                if len(opt_text) > 1:
                    current_options.append(opt_text)
                continue

            # Continuation of question text (before any options)
            if not current_options and len(line_stripped) > 2:
                # Don't append if it looks like a header
                if not re.match(r'^[A-Z]{3,}\s*$', line_stripped):
                    current_q_text += " " + line_stripped

    save_question()
    return questions

def import_qcm(module_ids: dict[str, str], dry_run: bool):
    """Extract and import QCM questions."""
    print("\n=== IMPORTING QCM QUESTIONS ===")
    total_imported = 0

    for mod_slug, pdf_paths in QCM_FILES.items():
        mod_id = module_ids.get(mod_slug)
        if not mod_id:
            print(f"  SKIP {mod_slug}: no module_id")
            continue

        for pdf_path in pdf_paths:
            print(f"\n  Reading: {pdf_path.split('\\')[-1]}")
            questions = extract_qcm_from_pdf(pdf_path)
            print(f"  Found {len(questions)} questions")

            # Delete existing QCM for this module first (only once)
            if not dry_run and total_imported == 0:
                for mod in MODULES:
                    mid = module_ids.get(mod["slug"])
                    if mid:
                        supa_delete_where("qcm_questions", "module_id", mid, dry_run=False)

            for i, q in enumerate(questions):
                payload = {
                    "module_id": mod_id,
                    "course_id": None,
                    "question": q["question"],
                    "options": q["options"],
                    "correct_answer": q["correct_answer"],
                    "explanation": None,
                    "difficulty": q["difficulty"],
                    "tags": [mod_slug],
                    "is_active": True,
                }

                result = supa_post("qcm_questions", payload, dry_run)
                if result:
                    total_imported += 1
                    if i % 30 == 0 or dry_run:
                        print(f"    [{i+1}/{len(questions)}] ✓ Q: {q['question'][:50]}")
                else:
                    print(f"    ERROR Q: {q['question'][:50]}")

            if not dry_run:
                time.sleep(0.2)

    print(f"\nTotal QCM imported: {total_imported}")

# ─── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Import TUTOR courses to Supabase")
    parser.add_argument("--dry-run", action="store_true", help="Dry run (no writes to DB)")
    parser.add_argument("--skip-qcm", action="store_true", help="Skip QCM import")
    parser.add_argument("--skip-courses", action="store_true", help="Skip course import")
    parser.add_argument("--qcm-only", action="store_true", help="Only import QCM")
    args = parser.parse_args()

    if args.dry_run:
        print("=== DRY RUN MODE (no DB writes) ===")

    # Step 1: Import modules
    module_ids = import_modules(args.dry_run)

    if not args.dry_run and not module_ids:
        print("ERROR: Could not create/fetch modules. Check Supabase connection.")
        return

    # Step 2: Extract and import courses
    if not args.skip_courses and not args.qcm_only:
        courses = extract_courses_from_pdf()
        if courses:
            # Save intermediate for debugging
            with open("courses_extracted.json", "w", encoding="utf-8") as f:
                json.dump([{k: v for k, v in c.items() if k != 'content'} for c in courses],
                          f, ensure_ascii=False, indent=2)
            print(f"Course metadata saved to courses_extracted.json")
            import_courses(courses, module_ids, args.dry_run)

    # Step 3: Extract and import QCM
    if not args.skip_qcm:
        import_qcm(module_ids, args.dry_run)

    print("\n✅ Import complete!")

if __name__ == "__main__":
    main()
