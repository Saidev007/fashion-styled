import type { Adjustments, FilterName, OverlayName } from './types'
import { defaultAdjustments, filterFor } from './types'

export function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This image could not be opened.')) }
    image.src = url
  })
}
function star(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath()
  for (let point = 0; point < 10; point++) {
    const angle = Math.PI * point / 5 - Math.PI / 2
    const r = point % 2 ? radius * .42 : radius
    const px = x + Math.cos(angle) * r; const py = y + Math.sin(angle) * r
    point ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
  }
  ctx.closePath(); ctx.fill()
}

export async function renderPhoto(source: Blob, filter: FilterName, adjustments: Adjustments, overlay: OverlayName, caption = ''): Promise<Blob> {
  const image = await loadImage(source)
  const rotate = ((adjustments.rotation % 360) + 360) % 360
  const quarterTurn = rotate === 90 || rotate === 270
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  const scale = Math.min(1, 4096 / Math.max(sourceWidth, sourceHeight))
  const width = Math.round(sourceWidth * scale)
  const height = Math.round(sourceHeight * scale)
  const outputWidth = quarterTurn ? height : width
  const outputHeight = quarterTurn ? width : height
  const pad = overlay === 'Polaroid' ? Math.round(outputHeight * .16) : 0
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth; canvas.height = outputHeight + pad
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Your browser could not prepare the image export.')
  ctx.fillStyle = overlay === 'Polaroid' ? '#fffdf7' : '#07111f'; ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.save(); ctx.translate(outputWidth / 2, outputHeight / 2); ctx.rotate(rotate * Math.PI / 180); if (adjustments.flip) ctx.scale(-1, 1)
  const warmth = adjustments.warmth
  const brightness = Math.max(0, adjustments.brightness + Math.abs(warmth) * .12)
  const contrast = Math.max(0, adjustments.contrast)
  const saturation = Math.max(0, adjustments.saturation)
  const css = filterFor(filter)
  ctx.filter = `${css === 'none' ? '' : `${css} `}brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${warmth >= 0 ? `sepia(${warmth / 250})` : `hue-rotate(${Math.abs(warmth) / 2}deg)`}`
  const drawW = width; const drawH = height
  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH); ctx.restore(); ctx.filter = 'none'
  if (overlay === 'Futuristic blue') { ctx.strokeStyle = '#56d8ff'; ctx.lineWidth = Math.max(8, outputWidth * .012); ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, outputWidth - ctx.lineWidth * 2, outputHeight - ctx.lineWidth * 2) }
  if (overlay === 'Minimal white') { ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(12, outputWidth * .025); ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, outputWidth - ctx.lineWidth, outputHeight - ctx.lineWidth) }
  if (overlay === 'Neon') { ctx.save(); ctx.shadowColor = '#44d8ff'; ctx.shadowBlur = outputWidth * .035; ctx.strokeStyle = '#7ce8ff'; ctx.lineWidth = Math.max(5, outputWidth * .009); ctx.strokeRect(8, 8, outputWidth - 16, outputHeight - 16); ctx.restore() }
  if (overlay === 'Starry night' || overlay === 'Sparkles') { ctx.save(); ctx.fillStyle = '#fff5c7'; const positions = [[.12,.15],[.83,.19],[.72,.78],[.2,.83],[.91,.53],[.4,.1]]; positions.forEach(([x,y], index) => star(ctx, outputWidth*x, outputHeight*y, Math.max(8, outputWidth*(index%2?.009:.015)))); ctx.restore() }
  if (overlay === 'Polaroid') { ctx.fillStyle = '#514c46'; ctx.font = `${Math.max(14, outputWidth * .027)}px Georgia, serif`; ctx.textAlign = 'center'; ctx.fillText(caption || 'A little moment', outputWidth / 2, outputHeight + pad * .64, outputWidth * .84) }
  const mime = 'image/jpeg'
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The edited image could not be exported.')), mime, .93))
}
export function resetAdjustments(): Adjustments { return { ...defaultAdjustments } }




