import { Router } from 'express'
import { z } from 'zod'
import { env } from '../config/env.js'


const router = Router()
const schema = z.object({ consent: z.literal(true), image: z.string().min(100).max(4_000_000), mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']), style: z.string().trim().min(3).max(80).optional(), clothing: z.string().trim().min(3).max(300).optional(), prompt: z.string().trim().max(300).default(''), count: z.number().int().min(1).max(3).default(1) }).refine(input => input.style || input.clothing, 'A style or clothing description is required.')
const attempts = new Map<string, { count: number; reset: number }>()
router.post('/transform', async (req, res) => {
  const ip = req.ip ?? 'unknown'; const now = Date.now(); const limit = attempts.get(ip)
  if (!limit || limit.reset < now) attempts.set(ip, { count: 1, reset: now + 60_000 })
  else if (limit.count >= 3) return res.status(429).json({ success: false, message: 'Too many image transformations. Please wait a minute and try again.' })
  else limit.count += 1
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, message: 'A valid image, style, and explicit consent are required.' })
  if (env.AI_PROVIDER !== 'openai' || !env.AI_API_KEY) return res.status(503).json({ success: false, message: 'AI image transformation is not configured. Set AI_PROVIDER=openai and AI_API_KEY on the server.' })
  try {
    const input = parsed.data
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(input.image)) return res.status(400).json({ success: false, message: 'The image data is invalid.' })
    const buffer = Buffer.from(input.image, 'base64')
    if (buffer.length > 5 * 1024 * 1024) return res.status(413).json({ success: false, message: 'Choose an image smaller than 5 MB for AI transformation.' })
    if (!validImageContent(buffer, input.mimeType)) return res.status(400).json({ success: false, message: 'Use a valid image at least 64 pixels across and no larger than 8192 pixels per side.' })
    const form = new FormData()
    form.append('model', env.AI_MODEL || 'gpt-image-2')
    const styleText = input.clothing
      ? `Create a photorealistic virtual try-on image using the supplied photograph as the reference for the exact same person. Preserve their identity, face, skin tone, body shape, pose, camera angle, background, and lighting. Change only their clothing to: ${input.clothing}. Make the garments look naturally fitted and realistic, with accurate fabric, colors, and construction. Do not add text or logos. ${input.prompt}`
      : `Transform this photograph into ${input.style}. Preserve the subject and main composition. Do not add text or logos. ${input.prompt}`
    form.append('prompt', styleText)
    form.append('image[]', new Blob([buffer], { type: input.mimeType }), `photo.${input.mimeType.split('/')[1]}`)
    form.append('n', String(input.count))
    form.append('quality', 'medium')
    form.append('output_format', 'jpeg')
    form.append('output_compression', '70')
    const response = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${env.AI_API_KEY}` }, body: form, signal: AbortSignal.timeout(170_000) })
    const result = await response.json() as { data?: Array<{ b64_json?: string }>; error?: { message?: string } }
    if (!response.ok) return res.status(response.status === 429 ? 503 : 502).json({ success: false, message: response.status === 429 ? 'The image provider is busy. Please retry shortly.' : result.error?.message || 'The image provider could not process this photo.' })
    const images = result.data?.map(item => item.b64_json).filter((image): image is string => typeof image === 'string') ?? []
    if (images.length !== input.count) return res.status(502).json({ success: false, message: 'The image provider did not return all requested variations. Please try again.' })
    if (images.some(image => image.length > 4_000_000) || images.reduce((total, image) => total + image.length, 0) > 4_000_000) {
      return res.status(502).json({ success: false, message: 'The generated images are too large to return. Try again with a smaller input.' })
    }
    return res.json(input.count === 1
      ? { success: true, images, image: images[0], mimeType: 'image/jpeg' }
      : { success: true, images, mimeType: 'image/jpeg' })
  } catch (error) {
    const timeout = error instanceof Error && error.name === 'TimeoutError'
    return res.status(timeout ? 504 : 502).json({ success: false, message: timeout ? 'Image transformation took too long. Please try again.' : 'The image provider is unavailable right now.' })
  }
})
export default router





function validImageContent(buffer: Buffer, mimeType: string) {
  let width = 0; let height = 0
  if (mimeType === 'image/png' && buffer.length > 24 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) { width = buffer.readUInt32BE(16); height = buffer.readUInt32BE(20) }
  else if (mimeType === 'image/jpeg' && buffer[0] === 255 && buffer[1] === 216) {
    let offset = 2
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 255) { offset += 1; continue }
      while (buffer[offset] === 255) offset += 1
      const marker = buffer[offset++]
      if (marker === 217 || marker === 218) break
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker) && offset + 7 < buffer.length) { height = buffer.readUInt16BE(offset + 3); width = buffer.readUInt16BE(offset + 5); break }
      if (offset + 1 >= buffer.length) break
      const length = buffer.readUInt16BE(offset); if (length < 2) break; offset += length
    }
  } else if (mimeType === 'image/webp' && buffer.length > 30 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buffer.toString('ascii', 12, 16)
    if (chunk === 'VP8X') { width = 1 + buffer.readUIntLE(24, 3); height = 1 + buffer.readUIntLE(27, 3) }
    else if (chunk === 'VP8 ' && buffer[23] === 157 && buffer[24] === 1 && buffer[25] === 42) { width = buffer.readUInt16LE(26) & 16383; height = buffer.readUInt16LE(28) & 16383 }
    else if (chunk === 'VP8L' && buffer[20] === 47) { const a=buffer[21] ?? 0; const b=buffer[22] ?? 0; const c=buffer[23] ?? 0; const d=buffer[24] ?? 0; width=1+a+((b&63)<<8); height=1+(b>>6)+(c<<2)+((d&15)<<10) }
  }
  return width >= 64 && height >= 64 && width <= 8192 && height <= 8192 && width * height <= 40_000_000
}
