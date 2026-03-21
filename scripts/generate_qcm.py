#!/usr/bin/env python3
"""
Generate QCM questions from seeded courses.
Usage: python scripts/generate_qcm.py [--limit N]
Requires: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY env vars
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

try:
    from supabase import create_client, Client  # type: ignore[import]
except ImportError:
    print("ERROR: supabase package not installed. Run: pip install supabase")
    sys.exit(1)

# Module UUIDs from supabase/seed.sql
MODULE_IDS = {
    "anatomie-biologie": "11111111-1111-1111-1111-111111111111",
    "medecine": "22222222-2222-2222-2222-222222222222",
    "chirurgie": "33333333-3333-3333-3333-333333333333",
    "urgences-medicales": "44444444-4444-4444-4444-444444444444",
    "urgences-chirurgicales": "55555555-5555-5555-5555-555555555555",
}

MODEL = "claude-haiku-4-5-20251001"
RATE_LIMIT_SECONDS = 1
QUESTIONS_PER_COURSE = 3


def build_qcm_prompt(course: dict) -> str:
    """Build French prompt asking Claude to generate QCM questions."""
    title = course.get("title", "Cours médical")
    content = course.get("content", "")[:2000]
    difficulty = course.get("difficulty", "moyen")

    return f"""Tu es un examinateur médical expert. À partir du cours ci-dessous, génère exactement {QUESTIONS_PER_COURSE} questions à choix multiples (QCM) rigoureuses pour des étudiants en médecine.

Titre du cours : {title}
Niveau de difficulté : {difficulty}

Contenu du cours :
---
{content}
---

Génère un tableau JSON contenant exactement {QUESTIONS_PER_COURSE} objets, chacun avec ces champs :
- "question": la question médicale posée (en français, précise et non ambiguë)
- "options": liste de exactement 4 propositions de réponses (["A. ...", "B. ...", "C. ...", "D. ..."])
- "correct_answer": index (0, 1, 2 ou 3) de la bonne réponse dans la liste options
- "explanation": explication claire de la bonne réponse (en français, 2-4 phrases)

Règles importantes :
- Toutes les questions et réponses doivent être en français.
- Les questions doivent être cliniquement pertinentes et directement liées au contenu du cours.
- Les options incorrectes doivent être plausibles mais clairement différenciables pour un étudiant attentif.
- Varie les types de questions : symptômes, diagnostic, traitement, mécanismes physiopathologiques.
- Réponds uniquement avec le tableau JSON, sans aucun texte avant ou après.

Exemple de format :
[
  {{
    "question": "Quelle est la première ligne de traitement de l'hypertension artérielle essentielle sans comorbidités ?",
    "options": ["A. Bêta-bloquants", "B. Inhibiteurs calciques", "C. Mesures hygiéno-diététiques", "D. Diurétiques thiazidiques"],
    "correct_answer": 2,
    "explanation": "Les mesures hygiéno-diététiques (régime sans sel, perte de poids, activité physique) constituent la première étape thérapeutique avant tout traitement médicamenteux."
  }}
]"""


def parse_qcm_response(text: str) -> list[dict] | None:
    """Extract JSON array from Claude's response."""
    text = text.strip()
    # Direct parse
    try:
        result = json.loads(text)
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass
    # Markdown code block
    match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", text, re.DOTALL)
    if match:
        try:
            result = json.loads(match.group(1))
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass
    # Raw JSON array
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        try:
            result = json.loads(match.group(0))
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass
    return None


def validate_question(q: dict) -> bool:
    """Check that a QCM question has the required structure."""
    required = ["question", "options", "correct_answer", "explanation"]
    for field in required:
        if field not in q:
            return False
    if not isinstance(q["options"], list) or len(q["options"]) != 4:
        return False
    if not isinstance(q["correct_answer"], int) or q["correct_answer"] not in range(4):
        return False
    return True


def fetch_courses(supabase: "Client", limit: int | None) -> list[dict]:
    """Fetch courses from Supabase."""
    query = supabase.table("courses").select("id, module_id, title, content, difficulty, slug").eq("is_active", True)
    if limit:
        query = query.limit(limit)
    response = query.execute()
    return response.data or []


def get_module_slug_from_id(module_id: str) -> str:
    """Reverse lookup of module slug from UUID."""
    for slug, uid in MODULE_IDS.items():
        if uid == module_id:
            return slug
    return "medecine"


def main():
    parser = argparse.ArgumentParser(description="Generate QCM questions from seeded courses")
    parser.add_argument("--limit", type=int, default=None, help="Process only first N courses")
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    supabase_url = os.environ.get("SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    missing = []
    if not api_key:
        missing.append("ANTHROPIC_API_KEY")
    if not supabase_url:
        missing.append("SUPABASE_URL")
    if not service_role_key:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        print(f"ERROR: Missing environment variables: {', '.join(missing)}")
        sys.exit(1)

    supabase: Client = create_client(supabase_url, service_role_key)
    claude = anthropic.Anthropic(api_key=api_key)

    print("Fetching courses from Supabase...")
    courses = fetch_courses(supabase, args.limit)
    total = len(courses)
    print(f"Found {total} course(s) to process\n")

    if total == 0:
        print("No courses found. Run seed_courses.py first.")
        sys.exit(0)

    inserted_total = 0
    error_total = 0

    for i, course in enumerate(courses, 1):
        course_id = course["id"]
        module_id = course["module_id"]
        module_slug = get_module_slug_from_id(module_id)
        title = course.get("title", "Sans titre")

        print(f"[{i}/{total}] '{title}' [{module_slug}]")

        if not course.get("content", "").strip():
            print("  WARNING: Empty content, skipping")
            error_total += 1
            # No API call was made, so no rate limit needed here
            continue

        prompt = build_qcm_prompt(course)

        try:
            message = claude.messages.create(
                model=MODEL,
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )
            response_text = message.content[0].text
        except Exception as e:
            print(f"  ERROR calling Claude: {e}")
            error_total += 1
            if i < total:
                time.sleep(RATE_LIMIT_SECONDS)
            continue

        questions = parse_qcm_response(response_text)
        if questions is None:
            print("  WARNING: Could not parse QCM response")
            error_total += 1
            if i < total:
                time.sleep(RATE_LIMIT_SECONDS)
            continue

        course_difficulty = course.get("difficulty", "moyen")
        inserted_for_course = 0

        for q in questions:
            if not validate_question(q):
                print(f"  WARNING: Invalid question structure, skipping")
                continue

            row = {
                "module_id": module_id,
                "course_id": course_id,
                "question": q["question"],
                "options": q["options"],
                "correct_answer": q["correct_answer"],
                "explanation": q["explanation"],
                "difficulty": course_difficulty,
                "is_active": True,
            }

            try:
                supabase.table("qcm_questions").insert(row).execute()
                inserted_for_course += 1
            except Exception as e:
                print(f"  ERROR inserting question: {e}")

        inserted_total += inserted_for_course
        print(f"  -> {inserted_for_course} question(s) inserted")

        if i < total:
            time.sleep(RATE_LIMIT_SECONDS)

    print()
    print(f"Done: {inserted_total} QCM question(s) inserted, {error_total} course(s) with errors")


if __name__ == "__main__":
    main()
