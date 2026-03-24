"""
Quick script to explore the TOC structure of UM6SS MED.pdf
Run first to understand the chapter/module layout before importing.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import pdfplumber
import re

PDF_PATH = r"C:\Users\X1 Carbon\Desktop\TUTOR\UM6SS MED.pdf"

def explore():
    with pdfplumber.open(PDF_PATH) as pdf:
        total = len(pdf.pages)
        print(f"Total pages: {total}")
        print("=" * 60)

        # Pages 1-6: cover + TOC
        for i in range(min(6, total)):
            page = pdf.pages[i]
            text = page.extract_text() or ""
            print(f"\n--- PAGE {i+1} ---")
            print(text[:2000])
            print()

        # Sample every 50 pages to find section boundaries
        print("\n" + "=" * 60)
        print("SECTION SAMPLES (every 50 pages)")
        print("=" * 60)
        for i in range(0, total, 50):
            page = pdf.pages[i]
            text = page.extract_text() or ""
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            print(f"\n--- PAGE {i+1} ---")
            for line in lines[:8]:
                print(repr(line))

if __name__ == "__main__":
    explore()
