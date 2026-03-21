# TUTOR — Plateforme de Préparation aux Concours Médicaux

## Stack Technique

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (Auth, PostgreSQL, Storage, RLS)
- **Paiements:** Stripe (Checkout, Customer Portal, Webhooks)
- **IA:** Anthropic Claude (mindmaps, QCM, flashcards, journal, Q&A)
- **Audio:** OpenAI TTS (voix nova)
- **Email:** Resend
- **State:** Zustand

## Installation

```bash
npm install
cp .env.example .env.local
# Remplir les variables d'environnement
npm run dev
```

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pages d'authentification
│   ├── (app)/             # Application (protégée)
│   ├── (marketing)/       # Landing page
│   └── api/               # API routes
├── components/            # Composants réutilisables
├── lib/                   # Clients (Supabase, Stripe, AI)
├── store/                 # Zustand store
└── types/                 # TypeScript types
supabase/
├── migrations/            # SQL migrations
└── seed.sql               # Données initiales
```

## Base de Données

14 tables principales avec RLS activé :
- `users` — Profils et abonnements
- `modules` — 5 modules médicaux
- `courses` — 563+ cours
- `qcm_questions` — Questions QCM
- `flashcards` — Flashcards
- `programs` — Programmes 90j/180j
- `program_days` — Jours de programme
- `user_progress` — Progression par cours
- `day_completions` — Complétion des jours
- `journal_entries` — Journal de révision
- `mock_exam_results` — Résultats examens blancs
- `flashcard_reviews` — Révision espacée
- `user_uploads` — Fichiers PDF uploadés
- `user_generated_content` — Contenu généré (mindmaps, QCM, flashcards)

## Design System

- **Couleurs:** Navy `#0c1222` + Or `#e8a83e`
- **Polices:** Bricolage Grotesque + Instrument Serif
- **Langue UI:** Français uniquement
