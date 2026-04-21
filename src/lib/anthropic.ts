import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const PROMPTS = {
  MINDMAP: (content: string) => `Tu es un expert en médecine et pédagogie spécialisé dans la préparation aux concours médicaux (PCEM, ECN, résidanat).

Génère une carte mentale COMPLÈTE et EXHAUSTIVE au format Markmap (Markdown hiérarchique).

RÈGLES STRICTES :
- Commence par "# [Titre du cours]" (nœud racine)
- Utilise ## pour les grandes catégories (max 6-8)
- Utilise ### pour les sous-catégories
- Utilise #### pour les détails précis
- Utilise des listes à puces (-) pour les éléments feuilles
- Inclus TOUS les chiffres clés, valeurs normales, seuils importants entre parenthèses
- Inclus les mnémotechniques si pertinents
- Ajoute des emojis devant chaque ## pour la lisibilité (ex: 🔬 Physiopathologie, 💊 Traitement, ⚠️ Complications)
- NE JAMAIS inclure d'explications hors du markdown
- Minimum 40 nœuds, maximum 80 nœuds
- Réponds UNIQUEMENT avec le markdown, sans balises de code

Cours à transformer :
${content}`,

  QCM: (content: string, count = 10) => `Tu es un expert en préparation aux concours médicaux (UM6SS, résidanat).

Génère ${count} QCM UNIQUEMENT à partir du contenu ci-dessous. Chaque question doit porter sur un fait précis présent dans ce cours (chiffre, définition, mécanisme, traitement, complication).

RÈGLES STRICTES :
- Les questions doivent être 100% basées sur le texte fourni, pas sur des connaissances générales
- 4 options par question, une seule bonne réponse
- correct_answer = index 0-3 de la bonne réponse
- explanation = pourquoi cette réponse est correcte (avec la référence dans le cours)

Format JSON strict (uniquement le tableau, rien d'autre) :
[{
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct_answer": 0,
  "explanation": "..."
}]

Cours à utiliser :
${content.slice(0, 4000)}`,

  FLASHCARDS: (content: string, count = 15) => `Tu es un expert pédagogique médical.

Génère ${count} flashcards UNIQUEMENT à partir du contenu ci-dessous. Chaque flashcard doit porter sur un élément clé de CE cours spécifiquement (définition, chiffre important, mécanisme, signe clinique, traitement).

Format JSON strict (uniquement le tableau) :
[{
  "front": "Question ou terme médical du cours",
  "back": "Réponse ou définition tirée du cours"
}]

Cours :
${content.slice(0, 4000)}`,

  SUMMARY: (content: string) => `Tu es un expert médical. Rédige un résumé structuré et concis de ce cours en français.
Inclus: points clés, définitions importantes, chiffres à retenir.
Format Markdown clair.

Cours:
${content}`,

  JOURNAL_FEEDBACK: (entry: string) => `Tu es un coach bienveillant spécialisé en préparation aux concours médicaux.
Analyse ce journal de révision et donne un feedback constructif, motivant et personnalisé en français.
Identifie les points forts, les axes d'amélioration, et donne des conseils pratiques.
Sois chaleureux et encourageant.

Journal:
${entry}`,

  DIRECT_QUESTION: (question: string, context?: string) => `Tu es un expert médical et pédagogue. Réponds à cette question de manière précise, claire et éducative en français.
${context ? `Contexte du cours: ${context}` : ''}

Question: ${question}`,

  UPLOAD_ANALYSIS: (content: string) => `Tu es un expert en médecine. Analyse ce document et identifie les concepts clés, les points importants à retenir pour un concours médical. Réponds en français de manière structurée.

Document:
${content}`,
} as const
