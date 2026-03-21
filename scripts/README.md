# Scripts — Pipeline de contenu TUTOR

## Installation
```bash
pip install -r scripts/requirements.txt
```

## Utilisation

### 1. Extraire le texte des PDFs
```bash
python scripts/extract_pdf_content.py
# → scripts/extracted_content.json
```

### 2. Générer les cours avec l'API
```bash
python scripts/generate_courses.py          # tous les chunks
python scripts/generate_courses.py --limit 5  # test (5 premiers)
# → scripts/generated_courses.json
# Requiert: ANTHROPIC_API_KEY
```

### 3. Insérer les cours en base
```bash
python scripts/seed_courses.py --dry-run   # simulation
python scripts/seed_courses.py             # insertion réelle
# Requiert: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

### 4. Générer les QCM
```bash
python scripts/generate_qcm.py             # tous les cours
python scripts/generate_qcm.py --limit 10  # test (10 premiers)
# Requiert: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

## Variables d'environnement
Copiez `.env.example` → `.env.local` et remplissez les valeurs.
