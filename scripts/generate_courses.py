#!/usr/bin/env python3
"""
Generate course content using Claude from extracted PDF text.
Usage: python scripts/generate_courses.py [--limit N]
Output: scripts/generated_courses.json
Requires: ANTHROPIC_API_KEY env var
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

# Load .env.local if available
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / ".env.local"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic package not installed. Run: pip install anthropic")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
INPUT_FILE = SCRIPT_DIR / "extracted_content.json"
OUTPUT_FILE = SCRIPT_DIR / "generated_courses.json"

MODEL = "claude-haiku-4-5-20251001"
RATE_LIMIT_SECONDS = 1


def slugify(text: str) -> str:
    """Convert French title to kebab-case slug."""
    # Normalize accented characters
    replacements = {
        "à": "a", "â": "a", "ä": "a",
        "é": "e", "è": "e", "ê": "e", "ë": "e",
        "î": "i", "ï": "i",
        "ô": "o", "ö": "o",
        "ù": "u", "û": "u", "ü": "u",
        "ç": "c", "ñ": "n",
    }
    text = text.lower()
    for accented, plain in replacements.items():
        text = text.replace(accented, plain)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text.strip())
    text = re.sub(r"-+", "-", text)
    return text[:80]


def build_prompt(chunk: dict, module_slug: str) -> str:
    """Build French prompt for Claude to generate a course from a PDF chunk."""
    text_excerpt = chunk["text"][:1500]
    return f"""Tu es un expert en médecine et en pédagogie médicale. À partir de l'extrait de cours médical ci-dessous, génère un cours structuré en français.

Module : {module_slug}
Extrait source (page {chunk.get('page', '?')}) :
---
{text_excerpt}
---

Génère un objet JSON avec exactement ces champs :
- "title": titre court et précis du cours (en français, 4-8 mots)
- "slug": version kebab-case du titre (lettres minuscules, tirets, sans accents)
- "description": résumé en 1-2 phrases (en français)
- "content": contenu pédagogique en Markdown (en français), entre 300 et 600 mots, structuré avec des titres (##), des listes et des points clés
- "difficulty": niveau parmi "facile", "moyen" ou "difficile" (basé sur la complexité du contenu)
- "tags": liste de 3 à 5 mots-clés médicaux pertinents (en français)

Règles importantes :
- Tout le contenu doit être en français.
- Ne mentionne jamais l'origine ou la source du texte.
- Ne fais aucune référence à une technologie, un logiciel ou un outil numérique.
- Le contenu doit être rigoureux, précis et utile pour des étudiants en médecine.
- Réponds uniquement avec le JSON, sans aucun texte avant ou après.

Exemple de format attendu :
{{
  "title": "Insuffisance cardiaque aiguë",
  "slug": "insuffisance-cardiaque-aigue",
  "description": "Présentation clinique et prise en charge de l'insuffisance cardiaque aiguë en pratique hospitalière.",
  "content": "## Introduction\\n\\nL'insuffisance cardiaque aiguë...",
  "difficulty": "moyen",
  "tags": ["cardiologie", "insuffisance cardiaque", "urgences", "dyspnée", "oedème"]
}}"""


def parse_json_from_response(text: str) -> dict | None:
    """Extract JSON object from Claude's response."""
    text = text.strip()
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Try to find JSON block in markdown
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    # Try to find raw JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return None


def generate_course(client: anthropic.Anthropic, chunk: dict, module_slug: str, source_file: str) -> dict | None:
    """Call Claude to generate a course from a text chunk."""
    prompt = build_prompt(chunk, module_slug)
    try:
        message = client.messages.create(
            model=MODEL,
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )
        response_text = message.content[0].text
        course = parse_json_from_response(response_text)
        if course is None:
            print(f"    WARNING: Could not parse JSON response")
            return None

        # Ensure required fields are present
        required = ["title", "slug", "description", "content", "difficulty", "tags"]
        for field in required:
            if field not in course:
                print(f"    WARNING: Missing field '{field}' in response")
                return None

        # Normalize difficulty
        if course["difficulty"] not in ("facile", "moyen", "difficile"):
            course["difficulty"] = "moyen"

        # Ensure slug is valid
        if not course.get("slug"):
            course["slug"] = slugify(course["title"])

        # Attach metadata
        course["module"] = module_slug
        course["source_file"] = source_file
        course["source_page"] = chunk.get("page", 0)

        return course

    except Exception as e:
        print(f"    ERROR calling Claude: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Generate course content using Claude")
    parser.add_argument("--limit", type=int, default=None, help="Process only first N chunks")
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)

    if not INPUT_FILE.exists():
        print(f"ERROR: Input file not found: {INPUT_FILE}")
        print("Run extract_pdf_content.py first.")
        sys.exit(1)

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        extracted = json.load(f)

    # Flatten all chunks with module info
    all_chunks = []
    for file_data in extracted:
        module = file_data["module"]
        source_file = file_data["source_file"]
        for chunk in file_data["chunks"]:
            all_chunks.append((chunk, module, source_file))

    if args.limit:
        all_chunks = all_chunks[: args.limit]

    total = len(all_chunks)
    print(f"Processing {total} chunk(s) with model {MODEL}")
    print()

    client = anthropic.Anthropic(api_key=api_key)
    courses = []
    errors = 0

    for i, (chunk, module_slug, source_file) in enumerate(all_chunks, 1):
        print(f"[{i}/{total}] {source_file} p.{chunk.get('page', '?')} ({module_slug})")
        course = generate_course(client, chunk, module_slug, source_file)
        if course:
            courses.append(course)
            print(f"  -> '{course['title']}' [{course['difficulty']}]")
        else:
            errors += 1

        if i < total:
            time.sleep(RATE_LIMIT_SECONDS)

    print()
    print(f"Done: {len(courses)} courses generated, {errors} errors")

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)

    print(f"Output saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
