"""
Scan UM6SS MED.pdf to detect all chapter starts and module boundaries.
Outputs a JSON file with all detected chapters.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import pdfplumber
import json
import re

PDF_PATH = r"C:\Users\X1 Carbon\Desktop\TUTOR\UM6SS MED.pdf"

# Known section headers that mark module boundaries (will be detected)
MODULE_MARKERS = [
    'ANATOMIE',
    'BIOLOGIE',
    'PATHOLOGIE MEDICALE',
    'PATHOLOGIE CHIRURGICALE',
    'URGENCES MEDICALES',
    'URGENCES CHIRURGICALES',
]

def is_likely_section_header(line: str) -> bool:
    """Detect lines that are module section headers (ALL CAPS, short)."""
    line = line.strip()
    if not line or len(line) > 60:
        return False
    # ALL CAPS or mostly caps
    if line.upper() == line and len(line) > 3:
        return True
    return False

def is_likely_chapter_title(lines: list[str]) -> tuple[bool, str]:
    """
    Detect if a page starts with a chapter title.
    Returns (is_title, title_text).
    """
    if not lines:
        return False, ""

    first = lines[0].strip()

    # Skip too long (paragraph text)
    if len(first) > 120:
        return False, ""

    # Skip if it starts with a bullet or dash
    if first.startswith(('-', '•', '▪', 'o ', '1.', '2.')):
        return False, ""

    # Skip if it looks like a continuation (starts with lowercase)
    if first and first[0].islower():
        return False, ""

    # Check second line for INTRODUCTION or similar keywords that confirm it's a new chapter
    content_starters = ['INTRODUCTION', 'Introduction', 'DÉFINITION', 'DEFINITION',
                        'GÉNÉRALITÉS', 'GENERALITES', 'RAPPEL', 'PLAN', 'I.', 'I-',
                        'SITUATION', 'ANATOMIE', 'PHYSIOPATHOLOGIE', 'ÉPIDÉMIOLOGIE',
                        'ÉTIOLOGIE', 'DIAGNOSTIC', 'CLASSIFICATION', 'HISTORIQUE']

    has_content_starter = False
    for i, line in enumerate(lines[1:5]):  # Check next 4 lines
        line_stripped = line.strip()
        for starter in content_starters:
            if line_stripped.startswith(starter):
                has_content_starter = True
                break
        if has_content_starter:
            break

    # A title is likely if it's short, starts with capital, and next lines have content keywords
    if (len(first) >= 4 and len(first) <= 100 and
        first[0].isupper() and has_content_starter):
        return True, first

    return False, ""

def scan_pdf():
    chapters = []
    current_module = "ANATOMIE"  # Start with Anatomie

    with pdfplumber.open(PDF_PATH) as pdf:
        total = len(pdf.pages)
        print(f"Scanning {total} pages...")

        for page_num in range(3, total):  # Start from page 4 (0-indexed: 3)
            if page_num % 50 == 0:
                print(f"  Progress: page {page_num+1}/{total}")

            page = pdf.pages[page_num]
            text = page.extract_text() or ""
            lines = [l.strip() for l in text.split('\n') if l.strip()]

            if not lines:
                continue

            first_line = lines[0].strip()

            # Detect module section headers
            upper_first = first_line.upper()
            for marker in MODULE_MARKERS:
                if marker in upper_first and len(first_line) < 80:
                    # Could be a section header page
                    if len(lines) <= 5:  # Section header pages are usually short
                        current_module = marker
                        print(f"  MODULE BOUNDARY: {marker} at page {page_num+1}")
                        break

            # Detect chapter titles
            is_title, title = is_likely_chapter_title(lines)
            if is_title:
                chapters.append({
                    "page": page_num + 1,  # 1-indexed
                    "title": title,
                    "module_hint": current_module,
                    "first_lines": lines[:3]
                })

    return chapters

def main():
    print("Scanning PDF for chapter titles...")
    chapters = scan_pdf()

    output_path = r"C:\Users\X1 Carbon\Desktop\antigravity\tutor\scripts\chapters.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(chapters, f, ensure_ascii=False, indent=2)

    print(f"\nFound {len(chapters)} chapters")
    print(f"Results saved to {output_path}")

    # Print summary grouped by module
    print("\nSAMPLE CHAPTERS:")
    for ch in chapters[:5]:
        print(f"  p{ch['page']:3d}: [{ch['module_hint']}] {ch['title']}")
    print("  ...")
    for ch in chapters[-5:]:
        print(f"  p{ch['page']:3d}: [{ch['module_hint']}] {ch['title']}")

if __name__ == "__main__":
    main()
