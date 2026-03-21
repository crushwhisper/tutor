#!/usr/bin/env python3
"""
Seed the database with generated course content.
Usage: python scripts/seed_courses.py [--dry-run]
Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY env vars
"""

import argparse
import json
import os
import re
import sys
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
    from supabase import create_client, Client
except ImportError:
    print("ERROR: supabase package not installed. Run: pip install supabase")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
INPUT_FILE = SCRIPT_DIR / "generated_courses.json"

# Module UUIDs from supabase/seed.sql
MODULE_IDS = {
    "anatomie-biologie": "11111111-1111-1111-1111-111111111111",
    "medecine": "22222222-2222-2222-2222-222222222222",
    "chirurgie": "33333333-3333-3333-3333-333333333333",
    "urgences-medicales": "44444444-4444-4444-4444-444444444444",
    "urgences-chirurgicales": "55555555-5555-5555-5555-555555555555",
}


def make_unique_slug(base_slug: str, existing_slugs: set[str]) -> str:
    """Append -2, -3, etc. to make a slug unique."""
    if base_slug not in existing_slugs:
        return base_slug
    counter = 2
    while True:
        candidate = f"{base_slug}-{counter}"
        if candidate not in existing_slugs:
            return candidate
        counter += 1


def fetch_existing_slugs(supabase: "Client") -> set[str]:
    """Fetch all existing course slugs from the database."""
    response = supabase.table("courses").select("slug").execute()
    return {row["slug"] for row in (response.data or [])}


def main():
    parser = argparse.ArgumentParser(description="Seed the database with generated courses")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be inserted without writing")
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(1)

    if not INPUT_FILE.exists():
        print(f"ERROR: Input file not found: {INPUT_FILE}")
        print("Run generate_courses.py first.")
        sys.exit(1)

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        courses = json.load(f)

    print(f"Loaded {len(courses)} courses from {INPUT_FILE}")

    supabase: Client = create_client(supabase_url, service_role_key)

    if args.dry_run:
        print("[DRY RUN] No data will be written to the database.\n")
        existing_slugs = set()
    else:
        existing_slugs = fetch_existing_slugs(supabase)
        print(f"Found {len(existing_slugs)} existing slugs in the database\n")

    # Track order_index per module
    order_counters: dict[str, int] = {slug: 0 for slug in MODULE_IDS}

    # Pre-fetch existing order indices if not dry run
    if not args.dry_run:
        for module_slug, module_id in MODULE_IDS.items():
            response = (
                supabase.table("courses")
                .select("order_index")
                .eq("module_id", module_id)
                .order("order_index", desc=True)
                .limit(1)
                .execute()
            )
            if response.data:
                order_counters[module_slug] = response.data[0]["order_index"]

    inserted_count = 0
    skipped_count = 0
    modules_used: set[str] = set()
    used_slugs = set(existing_slugs)

    for course in courses:
        module_slug = course.get("module", "medecine")
        module_id = MODULE_IDS.get(module_slug)

        if not module_id:
            print(f"  WARNING: Unknown module '{module_slug}', skipping course '{course.get('title')}'")
            skipped_count += 1
            continue

        base_slug = course.get("slug") or ""
        if not base_slug:
            title = course.get("title", "cours-sans-titre")
            base_slug = re.sub(r"[^a-z0-9-]", "-", title.lower())[:80]

        unique_slug = make_unique_slug(base_slug, used_slugs)
        used_slugs.add(unique_slug)

        order_counters[module_slug] += 1
        order_index = order_counters[module_slug]
        modules_used.add(module_slug)

        row = {
            "module_id": module_id,
            "title": course.get("title", "Sans titre"),
            "slug": unique_slug,
            "description": course.get("description", ""),
            "content": course.get("content", ""),
            "difficulty": course.get("difficulty", "moyen"),
            "tags": course.get("tags", []),
            "order_index": order_index,
            "is_active": True,
            "is_premium": False,
        }

        if args.dry_run:
            print(f"  [DRY RUN] Would insert: [{module_slug}] '{row['title']}' (slug: {unique_slug}, order: {order_index})")
            inserted_count += 1
        else:
            try:
                supabase.table("courses").insert(row).execute()
                print(f"  Inserted: [{module_slug}] '{row['title']}' (slug: {unique_slug})")
                inserted_count += 1
            except Exception as e:
                print(f"  ERROR inserting '{row['title']}': {e}")
                skipped_count += 1

    print()
    action = "Would insert" if args.dry_run else "Inserted"
    print(f"{action} {inserted_count} courses across {len(modules_used)} module(s)")
    if skipped_count:
        print(f"Skipped {skipped_count} course(s) due to errors")


if __name__ == "__main__":
    main()
