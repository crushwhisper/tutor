#!/usr/bin/env python3
"""
Complete re-extraction of course content from TUTOR PDFs.
Uses PyMuPDF to detect chapter boundaries via font size analysis.
Replaces incomplete/chunked DB content with the full raw text.

Usage:
    pip install PyMuPDF python-dotenv requests
    python scripts/reextract_complete.py [--dry-run] [--module MODULE_SLUG]

PDFs location: C:\\Users\\X1 Carbon\\Desktop\\TUTOR
"""

import json
import re
import sys
import time
import argparse
from pathlib import Path
from typing import Optional

try:
    import fitz  # PyMuPDF
except ImportError:
    print("ERROR: PyMuPDF not installed. Run: pip install PyMuPDF")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip install requests")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    import os
    env_path = Path(__file__).parent.parent / ".env.local"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    import os

# -- Config ---------------------------------------------------------------

PDF_DIR = Path(r"C:\Users\X1 Carbon\Desktop\TUTOR")
SCRIPT_DIR = Path(__file__).parent

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip('"')
SERVICE_KEY  = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip('"')

if not SUPABASE_URL or not SERVICE_KEY:
    env_file = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
                SUPABASE_URL = line.split("=", 1)[1].strip().strip('"')
            elif line.startswith("SUPABASE_SERVICE_ROLE_KEY="):
                SERVICE_KEY = line.split("=", 1)[1].strip().strip('"')

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# PDF -> module slug mapping
PDF_MODULE_MAP = {
    "Anatomie-et-Biologie.pdf":                         "anatomie-biologie",
    "Pathologie-medicale-et-chirurgicale-1.pdf":         ["medecine", "chirurgie"],
    "2URGENCES-CHIRURGICALES-2020-EL-OUAGARI-.pdf":      "urgences-chirurgicales",
    "2URGENCES-MEDICALES-2020-ELOUAGARI.pdf":            "urgences-medicales",
    "RABAT MED DONE.pdf":                                "anatomie-biologie",
    "UM6SS MED.pdf":                                     "anatomie-biologie",
}

# Pages to skip at the start of each PDF (cover + TOC)
PDF_SKIP_PAGES = {
    "Anatomie-et-Biologie.pdf":                         1,
    "Pathologie-medicale-et-chirurgicale-1.pdf":         1,
    "2URGENCES-CHIRURGICALES-2020-EL-OUAGARI-.pdf":      2,
    "2URGENCES-MEDICALES-2020-ELOUAGARI.pdf":            2,
    "RABAT MED DONE.pdf":                                3,
    "UM6SS MED.pdf":                                     3,
}

# Absolute minimum font size for a chapter title line
CHAPTER_MIN_FONT = 13.5

# Relative threshold: title line must be >= this fraction of page's max font
CHAPTER_REL_THRESHOLD = 0.88

# Patterns that indicate a SUB-SECTION (not a chapter boundary)
SUBSECTION_PATTERNS = [
    re.compile(r"^[A-Z]\s*[\u2013\u2014\-]\s"),   # A – something
    re.compile(r"^[IVX]+[\.\s]\s"),                 # I. II. III.
    re.compile(r"^\d+\s*[\u2013\u2014\-\.]\s"),    # 1 – / 1. / 2-
    re.compile(r"^[a-z]\s*-"),                       # a- b-
    re.compile(r"^INTRODUCTION\s*:?\s*$"),           # lone INTRODUCTION
    re.compile(r"^CONCLUSION\s*:?\s*$"),             # lone CONCLUSION
    re.compile(r"^RAPPELS?\s*:?\s*$"),               # lone RAPPELS
    re.compile(r"^DEFINITION\s*:?\s*$"),             # lone DEFINITION
]


def slugify(text: str) -> str:
    replacements = {"a":"a","a":"a","a":"a","e":"e","e":"e","e":"e","e":"e",
                    "i":"i","i":"i","o":"o","o":"o","u":"u","u":"u","u":"u",
                    "c":"c","n":"n","oe":"oe","ae":"ae",
                    "\u00e0":"a","\u00e2":"a","\u00e4":"a","\u00e9":"e","\u00e8":"e",
                    "\u00ea":"e","\u00eb":"e","\u00ee":"i","\u00ef":"i",
                    "\u00f4":"o","\u00f6":"o","\u00f9":"u","\u00fb":"u","\u00fc":"u",
                    "\u00e7":"c","\u00f1":"n","\u0153":"oe","\u00e6":"ae",
                    "\u00c9":"e","\u00c8":"e","\u00c2":"a"}
    t = text.lower()
    for acc, plain in replacements.items():
        t = t.replace(acc, plain)
    t = re.sub(r"[^a-z0-9\s\-]", "", t)
    t = re.sub(r"[\s_]+", "-", t.strip())
    return re.sub(r"-+", "-", t)[:80]


def is_subsection(text: str) -> bool:
    for pat in SUBSECTION_PATTERNS:
        if pat.match(text):
            return True
    return False


def is_chapter_title_line(font_size: float, page_max_font: float) -> bool:
    """True if this line's font qualifies as a chapter title."""
    if font_size < CHAPTER_MIN_FONT:
        return False
    if font_size < page_max_font * CHAPTER_REL_THRESHOLD:
        return False
    return True


def is_valid_chapter_title(title: str) -> bool:
    """Filter out garbage titles that pass font detection but aren't real chapters."""
    if len(title) < 4:
        return False
    if is_subsection(title):
        return False
    # Reject dotted-line TOC entries: "……………………… 95" or "............. 1"
    non_dot = re.sub(r'[.\u2026\s\d]', '', title)
    if len(non_dot) < 3:
        return False
    # Reject letter-by-letter spaced text: "R é g u l a t i o n"
    if re.match(r'^([A-Za-z\u00c0-\u017e]\s){3}', title) and len(title) < 70:
        return False
    return True


def clean_chapter_title(title: str) -> str:
    """
    Remove common formatting artifacts from chapter titles:
    - 'Cours N :' prefix (urgences PDFs)
    - 'Dg + CAT' / 'Physiopathologie + ...' suffixes
    - Trailing colons
    """
    # Remove "Cours N :" prefix
    title = re.sub(r"^Cours\s+\d+\s*:\s*", "", title)
    # Remove physiopathologie suffix
    title = re.sub(r"\s*:?\s*Physiopathologie\s*\+.*$", "", title, flags=re.IGNORECASE)
    # Remove "Dg + CAT" suffix
    title = re.sub(r"\s*:?\s*Dg\s*\+\s*CAT.*$", "", title, flags=re.IGNORECASE)
    # Remove trailing colon
    title = re.sub(r"\s*:\s*$", "", title)
    return title.strip()


def extract_chapters_from_pdf(pdf_path: Path, skip_pages: int = 0) -> list[dict]:
    """
    Open a PDF, detect chapter boundaries by font-size analysis,
    and return a list of {title, content} dicts.
    """
    doc = fitz.open(str(pdf_path))
    chapters = []
    current_title: Optional[str] = None
    current_lines: list[str] = []

    print(f"  Pages: {len(doc)} (skipping first {skip_pages})")

    for page_num in range(skip_pages, len(doc)):
        page = doc[page_num]

        # Get all text blocks with font sizes
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]

        # Find max font size on this page
        all_sizes = []
        for block in blocks:
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    if span.get("text", "").strip():
                        all_sizes.append(span["size"])

        page_max_font = max(all_sizes) if all_sizes else 12.0

        # Build list of (text, font_size) for all lines
        page_lines: list[tuple[str, float]] = []
        for block in blocks:
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                line_text = ""
                line_max_size = 0.0
                for span in line.get("spans", []):
                    line_text += span.get("text", "")
                    line_max_size = max(line_max_size, span.get("size", 10.0))
                if line_text.strip():
                    page_lines.append((line_text.strip(), line_max_size))

        # Process lines: collect consecutive title-font lines as one chapter boundary
        i = 0
        while i < len(page_lines):
            text, size = page_lines[i]

            if is_chapter_title_line(size, page_max_font):
                # Collect consecutive title-font lines (multi-line chapter titles)
                title_parts = [text]
                while i + 1 < len(page_lines):
                    next_text, next_size = page_lines[i + 1]
                    if is_chapter_title_line(next_size, page_max_font):
                        title_parts.append(next_text)
                        i += 1
                    else:
                        break

                raw_title = " ".join(title_parts)
                cleaned = clean_chapter_title(raw_title)

                if is_valid_chapter_title(cleaned):
                    # Save previous chapter
                    if current_title and current_lines:
                        content = "\n".join(current_lines).strip()
                        if len(content) > 200:
                            chapters.append({"title": current_title, "content": content})
                    current_title = cleaned
                    current_lines = []
                else:
                    # Not a valid chapter title — treat as content
                    current_lines.append(raw_title)
            else:
                current_lines.append(text)

            i += 1

    # Save last chapter
    if current_title and current_lines:
        content = "\n".join(current_lines).strip()
        if len(content) > 200:
            chapters.append({"title": current_title, "content": content})

    doc.close()
    return chapters


_module_id_cache: dict[str, Optional[str]] = {}

def get_module_id(module_slug: str) -> Optional[str]:
    if module_slug in _module_id_cache:
        return _module_id_cache[module_slug]
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/modules",
        params={"slug": f"eq.{module_slug}", "select": "id"},
        headers=HEADERS,
        timeout=10,
    )
    data = r.json()
    result = data[0]["id"] if data else None
    _module_id_cache[module_slug] = result
    return result


def get_existing_course_ids(module_id: str) -> list[str]:
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/courses",
        params={"module_id": f"eq.{module_id}", "select": "id"},
        headers=HEADERS,
        timeout=10,
    )
    return [d["id"] for d in r.json()]


def determine_module_for_chapter(title: str, content: str, pdf_module) -> str:
    """For PDFs that map to multiple modules, classify based on content."""
    if isinstance(pdf_module, str):
        return pdf_module
    # pdf_module is a list like ["medecine", "chirurgie"]
    combined = (title + " " + content[:500]).lower()
    chirurgie_kw = ["chirurgi", "operatoire", "appendic", "peritonite",
                     "hernies", "cholecystite", "occlusion", "trauma", "fracture",
                     "orthopedie", "orthopedique"]
    medecine_kw = ["cardiologie", "pneumologie", "gastro", "hematologie", "endocrin",
                    "nephro", "neurolog", "psychiatr", "rhumatolog", "infectieux",
                    "cardio", "respiratoire", "hepat", "diabete", "hypertension"]
    chir_score = sum(1 for kw in chirurgie_kw if kw in combined)
    med_score  = sum(1 for kw in medecine_kw if kw in combined)
    if chir_score > med_score:
        return "chirurgie"
    return "medecine"  # default


def _request_with_retry(method, url, max_retries=3, **kwargs):
    """Make an HTTP request with exponential-backoff retry on connection errors."""
    for attempt in range(max_retries):
        try:
            return getattr(requests, method)(url, **kwargs)
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            if attempt == max_retries - 1:
                raise
            wait = 2 ** attempt
            print(f"    Connection error (attempt {attempt+1}), retrying in {wait}s...")
            time.sleep(wait)


def upsert_course(module_id: str, title: str, slug: str, content: str,
                   order_index: int, dry_run: bool) -> bool:
    """Insert or update a course in Supabase."""
    words = len(content) / 5
    duration = max(10, min(120, int(words / 200 * 1.5)))

    payload = {
        "module_id": module_id,
        "slug": slug,
        "title": title,
        "content": content,
        "summary": None,
        "duration_minutes": duration,
        "difficulty": "moyen",
        "is_premium": False,
        "is_published": True,
        "order_index": order_index,
        "course_metadata": {},
    }

    if dry_run:
        print(f"    [DRY-RUN] Would upsert: '{title}' ({len(content)} chars)")
        return True

    # Check if slug already exists
    r = _request_with_retry(
        "get",
        f"{SUPABASE_URL}/rest/v1/courses",
        params={"slug": f"eq.{slug}", "select": "id"},
        headers=HEADERS,
        timeout=10,
    )
    existing = r.json()

    if existing:
        course_id = existing[0]["id"]
        r = _request_with_retry(
            "patch",
            f"{SUPABASE_URL}/rest/v1/courses?id=eq.{course_id}",
            json={"content": content, "title": title, "duration_minutes": duration, "is_published": True},
            headers=HEADERS,
            timeout=10,
        )
        if r.status_code in (200, 204):
            print(f"    OK Updated: '{title}'")
            return True
        else:
            print(f"    ERR Update failed ({r.status_code}): {r.text[:100]}")
            return False
    else:
        r = _request_with_retry(
            "post",
            f"{SUPABASE_URL}/rest/v1/courses",
            json=payload,
            headers=HEADERS,
            timeout=10,
        )
        if r.status_code in (200, 201):
            print(f"    OK Inserted: '{title}'")
            return True
        else:
            print(f"    ERR Insert failed ({r.status_code}): {r.text[:100]}")
            return False


def hide_subsection_courses(dry_run: bool):
    """Mark clearly-subsection courses as unpublished."""
    print("\n-- Hiding subsection courses --")
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/courses",
        params={"select": "id,title,content", "is_published": "eq.true", "limit": "1000"},
        headers=HEADERS,
        timeout=15,
    )
    courses = r.json()
    hidden = 0
    for c in courses:
        t = (c.get("title") or "").strip()
        content_len = len(c.get("content") or "")
        should_hide = (
            t.endswith(" :") or t.endswith(":") or
            bool(re.match(r"^\d+\s*[\u2013\u2014\-\.]\s", t)) or
            bool(re.match(r"^[A-Z]{1,3}[\s\u2013\u2014\-\.]\s", t)) or
            bool(re.match(r"^[IVX]+[\.\s]\s", t)) or
            content_len < 300
        )
        if should_hide:
            if dry_run:
                print(f"  [DRY-RUN] Would hide: '{t}'")
            else:
                requests.patch(
                    f"{SUPABASE_URL}/rest/v1/courses?id=eq.{c['id']}",
                    json={"is_published": False},
                    headers=HEADERS,
                    timeout=10,
                )
                print(f"  Hidden: '{t}'")
            hidden += 1
    print(f"  Total hidden: {hidden}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Preview only, don't write to DB")
    parser.add_argument("--module", help="Only process this module slug")
    parser.add_argument("--pdf", help="Only process this PDF filename")
    parser.add_argument("--hide-subsections", action="store_true", help="Only run the hide-subsections step")
    args = parser.parse_args()

    print(f"SUPABASE_URL: {SUPABASE_URL[:40]}...")
    print(f"DRY RUN: {args.dry_run}")
    print(f"PDF DIR: {PDF_DIR}")
    print()

    if args.hide_subsections:
        hide_subsection_courses(args.dry_run)
        return

    # First hide subsection courses
    hide_subsection_courses(args.dry_run)

    # Process PDFs
    pdfs = sorted(PDF_DIR.glob("*.pdf"))
    total_chapters = 0
    total_ok = 0

    for pdf_path in pdfs:
        if args.pdf and pdf_path.name != args.pdf:
            continue
        if pdf_path.name not in PDF_MODULE_MAP:
            print(f"Skipping (not in map): {pdf_path.name}")
            continue

        pdf_module = PDF_MODULE_MAP[pdf_path.name]
        skip_pages = PDF_SKIP_PAGES.get(pdf_path.name, 1)
        print(f"\n{'='*60}")
        print(f"PDF: {pdf_path.name}")
        print(f"Module: {pdf_module}")

        print(f"  Extracting chapters...")
        try:
            chapters = extract_chapters_from_pdf(pdf_path, skip_pages=skip_pages)
        except Exception as e:
            print(f"  ERROR: {e}")
            continue

        print(f"  Found {len(chapters)} chapters")
        if not chapters:
            print("  No chapters found -- check font size detection.")
            continue

        for i, ch in enumerate(chapters):
            module_slug = determine_module_for_chapter(ch["title"], ch["content"], pdf_module)
            if args.module and module_slug != args.module:
                continue

            module_id = get_module_id(module_slug)
            if not module_id:
                print(f"  ERR Module '{module_slug}' not found in DB")
                continue

            slug = slugify(ch["title"])
            if not slug:
                continue

            print(f"\n  [{i+1}/{len(chapters)}] '{ch['title']}' -> {module_slug} ({len(ch['content'])} chars)")
            total_chapters += 1
            ok = upsert_course(module_id, ch["title"], slug, ch["content"], i + 1, args.dry_run)
            if ok:
                total_ok += 1

            if not args.dry_run:
                time.sleep(0.2)  # gentle rate limit

    print(f"\n{'='*60}")
    print(f"Done: {total_ok}/{total_chapters} chapters upserted")
    if args.dry_run:
        print("(DRY RUN -- nothing written to DB)")


if __name__ == "__main__":
    main()
