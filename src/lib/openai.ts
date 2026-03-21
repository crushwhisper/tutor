import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function generateSpeech(text: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
    response_format: 'mp3',
  })
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
