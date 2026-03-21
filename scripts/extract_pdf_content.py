#!/usr/bin/env python3
"""
Extract text content from medical exam prep PDFs.
Usage: python scripts/extract_pdf_content.py
Output: scripts/extracted_content.json
"""

import json
import re
import sys
from pathlib import Path

# Try PyMuPDF first, fall back to pdfplumber
try:
    import fitz  # PyMuPDF
    PDF_BACKEND = "fitz"
except ImportError:
    try:
        import pdfplumber
        PDF_BACKEND = "pdfplumber"
    except ImportError:
        print("ERROR: Neither PyMuPDF nor pdfplumber is installed.")
        print("Install with: pip install PyMuPDF  OR  pip install pdfplumber")
        sys.exit(1)

# Load .env.local if available
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / ".env.local"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

# Paths
SCRIPT_DIR = Path(__file__).parent
TUTOR_DIR = SCRIPT_DIR.parent
PDF_DIR = TUTOR_DIR.parent / "tutor-courses"
OUTPUT_FILE = SCRIPT_DIR / "extracted_content.json"
CHUNK_SIZE = 2000

# Module keyword mapping (regex patterns -> module slug)
MODULE_PATTERNS = [
    (re.compile(r"urg.*chir|urgences.chirurgicales", re.IGNORECASE), "urgences-chirurgicales"),
    (re.compile(r"urg.*med|urgences.medicales", re.IGNORECASE), "urgences-medicales"),
    (re.compile(r"anatom|biolog|anatomy", re.IGNORECASE), "anatomie-biologie"),
    (re.compile(r"chirurgi|surgery", re.IGNORECASE), "chirurgie"),
    (re.compile(r"medecin|médecin|patholog", re.IGNORECASE), "medecine"),
]


def detect_module(filename: str) -> str:
    """Determine which module a PDF belongs to based on filename keywords."""
    name = filename.lower()
    for pattern, slug in MODULE_PATTERNS:
        if pattern.search(name):
            return slug
    # Default to medecine if no match found
    return "medecine"


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> list[str]:
    """Split text into chunks of approximately chunk_size characters."""
    if not text.strip():
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end < len(text):
            # Try to break at a sentence or paragraph boundary
            for sep in ["\n\n", "\n", ". ", " "]:
                pos = text.rfind(sep, start, end)
                if pos > start:
                    end = pos + len(sep)
                    break
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end
    return chunks


def extract_with_fitz(pdf_path: Path) -> list[dict]:
    """Extract pages using PyMuPDF."""
    pages = []
    doc = fitz.open(str(pdf_path))
    try:
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            if text.strip():
                pages.append({"page": page_num + 1, "text": text})
    finally:
        doc.close()
    return pages


def extract_with_pdfplumber(pdf_path: Path) -> list[dict]:
    """Extract pages using pdfplumber."""
    pages = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page_num, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            if text.strip():
                pages.append({"page": page_num + 1, "text": text})
    return pages


def extract_pdf(pdf_path: Path) -> list[dict]:
    """Extract text from a PDF, returning list of page dicts."""
    if PDF_BACKEND == "fitz":
        return extract_with_fitz(pdf_path)
    else:
        return extract_with_pdfplumber(pdf_path)


def process_pdf(pdf_path: Path) -> dict | None:
    """Process a single PDF file and return structured data."""
    filename = pdf_path.name
    module = detect_module(filename)

    print(f"  Processing: {filename} -> module: {module}")

    try:
        raw_pages = extract_pdf(pdf_path)
    except Exception as e:
        print(f"  ERROR extracting {filename}: {e}")
        return None

    if not raw_pages:
        print(f"  WARNING: No text extracted from {filename}")
        return None

    # Build chunks, tagging each with page number
    chunks = []
    for page_data in raw_pages:
        page_num = page_data["page"]
        page_text = page_data["text"]
        page_chunks = chunk_text(page_text)
        for chunk in page_chunks:
            chunks.append({"page": page_num, "text": chunk})

    print(f"  -> {len(raw_pages)} pages, {len(chunks)} chunks")

    return {
        "module": module,
        "source_file": filename,
        "chunks": chunks,
    }


def main():
    if not PDF_DIR.exists():
        print(f"ERROR: PDF directory not found: {PDF_DIR}")
        print("Expected location: ../tutor-courses/ (sibling of tutor/ directory)")
        sys.exit(1)

    pdf_files = sorted(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        pdf_files = sorted(PDF_DIR.rglob("*.pdf"))

    if not pdf_files:
        print(f"ERROR: No PDF files found in {PDF_DIR}")
        sys.exit(1)

    print(f"Found {len(pdf_files)} PDF file(s) in {PDF_DIR}")
    print(f"Using PDF backend: {PDF_BACKEND}")
    print()

    results = []
    for i, pdf_path in enumerate(pdf_files, 1):
        print(f"[{i}/{len(pdf_files)}] {pdf_path.name}")
        result = process_pdf(pdf_path)
        if result:
            results.append(result)
        print()

    total_chunks = sum(len(r["chunks"]) for r in results)
    print(f"Extraction complete: {len(results)} files, {total_chunks} total chunks")

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"Output saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
