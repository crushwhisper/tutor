import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'

export const maxDuration = 60

interface SmartImage {
  title: string
  url: string
  thumbUrl: string
}

const SMART_UA = 'TutorMedical/1.0 (educational; contact: tutor@antigravity.app)'

async function extractKeywords(content: string, title: string): Promise<string[]> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `You are a medical expert. Given this French medical course title, generate English search terms for the Servier Medical Art (SMART) illustration library.

Course title (French): ${title}
Content excerpt: ${content.slice(0, 400)}

Generate 4 highly focused English search terms directly related to the course title:
- Term 1: Direct English translation of the French title (e.g. "plis du coude" → "elbow", "foie" → "liver", "genou" → "knee", "cœur" → "heart")
- Terms 2-4: Only the most directly related anatomical structures (e.g. for elbow: "elbow joint", "humerus", "radius")

RULES:
- Use SIMPLE common English words, NOT Latin/technical jargon
- Stay TIGHTLY focused on the title topic — do NOT broaden to related systems
- If the title is about one specific organ/region, all 4 terms must be about that same organ/region

Reply ONLY with 4 English terms separated by commas, no explanation.`,
    }],
  })
  const text = (message.content[0] as { text: string }).text.trim()
  return text
    .split(',')
    .map(k => k.trim().replace(/[^a-zA-Z\s-]/g, '').trim())
    .filter(k => k.length > 2)
    .slice(0, 4)
}

// Extract image URL + title pairs from SMART search HTML
function parseSmartHtml(html: string, limit: number): SmartImage[] {
  // Match thumbnail images in wp-content/uploads/YYYY/MM/ (excludes logos)
  const imgRegex = /src="(https:\/\/smart\.servier\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"]+\.(?:png|jpg|jpeg))"/gi
  const thumbUrls = [...html.matchAll(imgRegex)].map(m => m[1])

  // Match h3 titles from search results
  const titleRegex = /<h3[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/g
  const titles = [...html.matchAll(titleRegex)].map(m => m[1].trim())

  const images: SmartImage[] = []
  const seenUrls = new Set<string>()

  for (let i = 0; i < Math.min(thumbUrls.length, limit); i++) {
    const thumbUrl = thumbUrls[i]
    // Convert thumbnail (filename-144x300.png) to full-size (filename.png)
    const fullUrl = thumbUrl.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1')
    if (seenUrls.has(fullUrl)) continue
    seenUrls.add(fullUrl)
    images.push({
      title: titles[i] || '',
      url: fullUrl,
      thumbUrl,
    })
  }
  return images
}

async function searchSmartImages(keyword: string, limit: number): Promise<SmartImage[]> {
  const url = `https://smart.servier.com/?s=${encodeURIComponent(keyword)}&post_type=smart_image`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': SMART_UA, Accept: 'text/html' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const html = await res.text()
    return parseSmartHtml(html, limit)
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { content, title } = await req.json()
  if (!content && !title) return NextResponse.json({ error: 'Contenu manquant' }, { status: 400 })

  try {
    // 1. Extract 8 simple English keywords, title first
    const keywords = await extractKeywords(content ?? '', title ?? '')
    if (keywords.length === 0) return NextResponse.json({ images: [], keywords: [] })

    // 2. Search SMART directly in parallel — all keywords get full results
    const searchResults = await Promise.all(
      keywords.map((kw, i) => searchSmartImages(kw, i === 0 ? 20 : 15))
    )

    // 3. Deduplicate, title-keyword results first — no hard cap
    const seenUrls = new Set<string>()
    const images: SmartImage[] = []

    for (const results of searchResults) {
      for (const img of results) {
        if (!seenUrls.has(img.url)) {
          seenUrls.add(img.url)
          images.push(img)
        }
      }
    }

    return NextResponse.json({ images, keywords })
  } catch (error) {
    console.error('SMART image search error:', error)
    return NextResponse.json({ error: 'Recherche échouée' }, { status: 500 })
  }
}
