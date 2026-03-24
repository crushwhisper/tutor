"""Remove duplicate programs, keeping the one with the most days for each type."""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import requests

SUPABASE_URL = "https://wgkihkjhojnolndznvyz.supabase.co"
SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2loa2pob2pub2xuZHpudnl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEyNjQxOSwiZXhwIjoyMDg5NzAyNDE5fQ.IGzZ9uIAjcly_B-ayYDdKH-GCv-4icEAThTQ4cMlpGw"
HEADERS = {"apikey": SERVICE_ROLE, "Authorization": f"Bearer {SERVICE_ROLE}", "Content-Type": "application/json", "Prefer": "return=representation"}

def get(table, params=None):
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, params=params)
    return r.json() if r.status_code == 200 else []

def delete(table, params):
    r = requests.delete(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, params=params)
    return r.status_code

# Fetch all programs
programs = get("programs", {"select": "id,type,name", "order": "created_at"})
print(f"Total programs found: {len(programs)}")
for p in programs:
    print(f"  {p['type']}: {p['id']} — {p['name']}")

# Group by type
by_type = {}
for p in programs:
    by_type.setdefault(p['type'], []).append(p)

# For each type, count days per program and keep the best
for ptype, progs in by_type.items():
    if len(progs) <= 1:
        print(f"\n{ptype}: only 1 program, nothing to clean")
        continue

    print(f"\n{ptype}: {len(progs)} programs found, finding best...")
    best_id = None
    best_count = -1
    counts = {}
    for p in progs:
        days = get("program_days", {"program_id": f"eq.{p['id']}", "select": "id"})
        counts[p['id']] = len(days)
        print(f"  {p['id']}: {len(days)} days")
        if len(days) > best_count:
            best_count = len(days)
            best_id = p['id']

    print(f"  Keeping: {best_id} ({best_count} days)")
    for p in progs:
        if p['id'] != best_id:
            # Delete its days first
            status = delete("program_days", {"program_id": f"eq.{p['id']}"})
            print(f"  Deleted days for {p['id']}: HTTP {status}")
            # Delete the program
            status = delete("programs", {"id": f"eq.{p['id']}"})
            print(f"  Deleted program {p['id']}: HTTP {status}")

print("\nCleanup complete!")
