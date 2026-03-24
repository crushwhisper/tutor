/**
 * Converts raw medical PDF-extracted text to clean markdown.
 * Handles: ALL_CAPS headers, A-/B-, 1-/2-, a-/b- subsections,
 * bullet points, sub-bullets, and line-wrapped paragraphs.
 */

// Check if a string is mostly uppercase (a section header)
function isAllCapsHeader(line: string): boolean {
  const stripped = line.replace(/\s*:.*$/, '').trim()
  if (stripped.length < 3) return false
  // Remove allowed non-alpha chars, check remaining is uppercase
  const lettersOnly = stripped.replace(/[\s\d\/\-–\(\)'.,&°]/g, '')
  if (lettersOnly.length === 0) return false
  return lettersOnly === lettersOnly.toUpperCase() && /[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝ]/.test(lettersOnly)
}

// A– / B– / C– lettered main section
function isLetteredSection(line: string): boolean {
  return /^[A-Z]\s*[–\-]\s+\S/.test(line)
}

// 1– / 2– numbered sub-section
function isNumberedSection(line: string): boolean {
  return /^\d+\s*[–\-]\s+\S/.test(line)
}

// a- / b- small-letter sub-section
function isSmallLetterSection(line: string): boolean {
  return /^[a-z]\s*-\s*\S/.test(line)
}

// Bullet point: starts with - (but not a lettered section like A-)
function isBullet(line: string): boolean {
  return /^-\S/.test(line) || /^-\s+\S/.test(line)
}

// Sub-bullet: starts with "o " or "° "
function isSubBullet(line: string): boolean {
  return /^[o°]\s+\S/.test(line)
}

// A line that starts with lowercase → continuation of previous
function isContinuation(line: string): boolean {
  return /^[a-zàáâãäåæçèéêëìíîïðñòóôõöùúûüý]/.test(line)
}

export function formatMedicalContent(raw: string): string {
  if (!raw) return ''

  const lines = raw.split('\n').map(l => l.trimEnd())
  const out: string[] = []
  let prevType = 'empty'

  function flush(text: string, type: string) {
    if (text.trim() === '') {
      if (prevType !== 'empty') out.push('')
      prevType = 'empty'
      return
    }
    out.push(text)
    prevType = type
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()

    if (!line) {
      flush('', 'empty')
      i++
      continue
    }

    // --- ALL CAPS HEADER ---
    if (isAllCapsHeader(line)) {
      const colonIdx = line.indexOf(' :')
      const colonIdx2 = line.indexOf(':')
      let headerText: string
      let trailingText: string = ''

      if (colonIdx !== -1 && isAllCapsHeader(line.substring(0, colonIdx).trim())) {
        headerText = line.substring(0, colonIdx).trim()
        trailingText = line.substring(colonIdx + 2).trim()
      } else if (colonIdx2 !== -1 && colonIdx2 < line.length - 1 && isAllCapsHeader(line.substring(0, colonIdx2).trim())) {
        headerText = line.substring(0, colonIdx2).trim()
        trailingText = line.substring(colonIdx2 + 1).trim()
      } else {
        headerText = line.replace(/:$/, '').trim()
      }

      if (prevType !== 'empty') out.push('')
      flush(`## ${headerText}`, 'h2')
      if (trailingText && trailingText !== '') flush('\n' + trailingText, 'text')
      i++
      continue
    }

    // --- A– / B– LETTERED SECTION ---
    if (isLetteredSection(line)) {
      const clean = line.replace(/:$/, '').trim()
      if (prevType !== 'empty') out.push('')
      flush(`### ${clean}`, 'h3')
      i++
      continue
    }

    // --- 1– / 2– NUMBERED SECTION ---
    if (isNumberedSection(line)) {
      const clean = line.replace(/:$/, '').trim()
      if (prevType !== 'empty' && prevType !== 'h3') out.push('')
      flush(`#### ${clean}`, 'h4')
      i++
      continue
    }

    // --- a- / b- SMALL LETTER SECTION ---
    if (isSmallLetterSection(line)) {
      const clean = line.replace(/:$/, '').trim()
      if (prevType !== 'empty') out.push('')
      flush(`**${clean}**`, 'bold')
      i++
      continue
    }

    // --- SUB-BULLET: o / ° ---
    if (isSubBullet(line)) {
      const text = line.replace(/^[o°]\s+/, '').trim()
      flush(`  - ${text}`, 'subbullet')
      i++
      continue
    }

    // --- BULLET: - ---
    if (isBullet(line)) {
      const text = line.replace(/^-\s*/, '').trim()
      // Collect continuation lines
      let full = text
      while (i + 1 < lines.length) {
        const next = lines[i + 1].trim()
        if (!next) break
        if (isContinuation(next) && !isSubBullet(next) && !isBullet(next) && !isLetteredSection(next) && !isNumberedSection(next) && !isSmallLetterSection(next) && !isAllCapsHeader(next)) {
          full += ' ' + next
          i++
        } else break
      }
      flush(`- ${full}`, 'bullet')
      i++
      continue
    }

    // --- REGULAR TEXT (possibly continuation) ---
    let text = line
    // Join wrapped continuation lines
    while (i + 1 < lines.length) {
      const next = lines[i + 1].trim()
      if (!next) break
      if (
        isContinuation(next) &&
        !isSubBullet(next) &&
        !isBullet(next) &&
        !isLetteredSection(next) &&
        !isNumberedSection(next) &&
        !isSmallLetterSection(next) &&
        !isAllCapsHeader(next)
      ) {
        // Join with hyphen-broken words
        if (text.endsWith('-')) {
          text = text.slice(0, -1) + next
        } else {
          text += ' ' + next
        }
        i++
      } else break
    }

    flush(text, 'text')
    i++
  }

  return out.join('\n')
}
