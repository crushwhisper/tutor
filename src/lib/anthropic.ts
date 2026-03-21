import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const PROMPTS = {
  MINDMAP: (content: string) => `Tu es un expert en médecine et pédagogie. Crée une carte mentale détaillée en Markdown au format Markmap pour le cours suivant.
Utilise des # pour les niveaux hiérarchiques. Sois précis, exhaustif et structuré.
N'inclus que le Markdown, pas d'explications.

Cours:
${content}`,

  QCM: (content: string, count = 10) => `Tu es un expert en préparation aux concours médicaux. Génère ${count} QCM originaux basés sur ce cours.
Format JSON strict:
[{
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct_answer": 0,
  "explanation": "..."
}]
correct_answer est l'index (0-3) de la bonne réponse.

Cours:
${content}`,

  FLASHCARDS: (content: string, count = 15) => `Tu es un expert pédagogique médical. Génère ${count} flashcards pour mémoriser ce cours.
Format JSON strict:
[{
  "front": "Question ou terme médical",
  "back": "Réponse ou définition complète"
}]

Cours:
${content}`,

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
