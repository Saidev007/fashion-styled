import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Aperture, ArrowLeft, ChevronLeft, ChevronRight, Download, FlipHorizontal, Images, LoaderCircle, RotateCcw, Save, Sparkles, SwitchCamera, Trash2, X } from 'lucide-react'
import { clearPhotos, deletePhoto, listPhotos, savePhoto } from './gallery'
import { loadImage, renderPhoto } from './imageProcessing'
import { useCamera } from './useCamera'
import { defaultAdjustments, filters, overlays, type Adjustments, type FilterName, type GalleryPhoto, type OverlayName, filterFor } from './types'

type Screen = 'permission' | 'camera' | 'print' | 'editor' | 'ai' | 'gallery'
function blobUrl(blob: Blob) { return URL.createObjectURL(blob) }
async function prepareAIImage(blob: Blob): Promise<Blob> {
  const image = await loadImage(blob)
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(64, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(64, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('The photo could not be prepared for AI processing.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const exportBlob = (quality: number) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
  let output = await exportBlob(.78)
  if (!output) throw new Error('The photo could not be prepared for AI processing.')
  if (output.size > 2_800_000) output = await exportBlob(.55)
  if (!output || output.size > 2_800_000) throw new Error('This photo is too large to send securely. Choose a smaller image.')
  return output
}
function downloadBlob(blob: Blob, filename: string) {
  const url = blobUrl(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}
function saveFileName() { const date = new Date(); const pad = (number: number) => String(number).padStart(2, '0'); return `magic-photo-${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}.jpg` }

export default function MagicCamera({ notify }: { notify: (message: string) => void }) {
  const [open, setOpen] = useState(false)
  const [screen, setScreen] = useState<Screen>('permission')
  const camera = useCamera()
  const [originalPhoto, setOriginalPhoto] = useState<Blob | null>(null)
  const [source, setSource] = useState<Blob | null>(null)
  const [sourceLabel, setSourceLabel] = useState('')
  const [filter, setFilter] = useState<FilterName>('Natural')
  const [overlay, setOverlay] = useState<OverlayName>('None')
  const [adjustments, setAdjustments] = useState<Adjustments>({ ...defaultAdjustments })
  const [caption, setCaption] = useState('')
  const [gallery, setGallery] = useState<GalleryPhoto[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [busy, setBusy] = useState(false)
  const [consent, setConsent] = useState(false)
  const [aiStyle, setAiStyle] = useState('Dreamlike illustration')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiBlob, setAiBlob] = useState<Blob | null>(null)
  const [aiError, setAiError] = useState('')
  const [compare, setCompare] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const notifyRef = useRef(notify)
  useEffect(() => { notifyRef.current = notify }, [notify])
  const originalUrl = useMemo(() => originalPhoto ? blobUrl(originalPhoto) : '', [originalPhoto])
  const sourceUrl = useMemo(() => source ? blobUrl(source) : '', [source])
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({})
  useEffect(() => () => { if (originalUrl) URL.revokeObjectURL(originalUrl) }, [originalUrl])
  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl) }, [sourceUrl])
  useEffect(() => { if (!camera.stream || !camera.videoRef.current) return; camera.videoRef.current.srcObject = camera.stream; void camera.videoRef.current.play().catch(() => camera.setError('The live preview could not play. Try another camera.')) }, [camera.stream, screen, camera.setError])
  useEffect(() => {
    let active = true
    if (screen !== 'gallery') return
    listPhotos().then((photos) => { if (active) { setGallery(photos); const urls: Record<string, string> = {}; photos.forEach(photo => { urls[photo.id] = URL.createObjectURL(photo.final) }); setThumbUrls(urls) } }).catch(error => notifyRef.current(error instanceof Error ? error.message : 'Gallery could not be loaded.'))
    return () => { active = false; setThumbUrls(current => { Object.values(current).forEach(URL.revokeObjectURL); return {} }) }
  }, [screen])
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) closeCamera() }
    window.addEventListener('keydown', onKeyDown); document.body.classList.add('magic-camera-open')
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.classList.remove('magic-camera-open') }
  }, [open, busy])
  useEffect(() => { if (!open) camera.stop() }, [open])
  useEffect(() => { listPhotos().then(setGallery).catch(() => undefined) }, [])

  const closeCamera = useCallback(() => { camera.stop(); setOpen(false); setBusy(false) }, [camera.stop])
  const launch = () => { setOpen(true); setScreen('permission') }
  const startCamera = async () => { if (await camera.start()) setScreen('camera') }
  const capture = async () => { const image = await camera.capture(); if (!image) return; setOriginalPhoto(image); setSource(image); setSourceLabel(''); setSelectedId(''); setCaption(''); setFilter('Natural'); setOverlay('None'); setAdjustments({ ...defaultAdjustments }); setAiBlob(null); setScreen('print'); camera.stop() }
  const openEditor = () => { if (!source) return; setScreen('editor'); setCompare(false) }
  const makeExport = async () => { if (!source) throw new Error('No photo is ready to export.'); return renderPhoto(source, filter, adjustments, overlay, caption) }
  const download = async () => { setBusy(true); try { const blob = await makeExport(); downloadBlob(blob, saveFileName()); notify('Your finished photo was downloaded.') } catch (error) { notify(error instanceof Error ? error.message : 'The photo could not be exported.') } finally { setBusy(false) } }
  const refreshGallery = async () => setGallery(await listPhotos())
  const saveToGallery = async () => {
    if (!source) return
    setBusy(true)
    try {
      const final = await makeExport(); const photo: GalleryPhoto = { id: selectedId || crypto.randomUUID(), createdAt: Date.now(), caption: caption.trim(), original: originalPhoto ?? source, final, filter, overlay, adjustments: { ...adjustments }, ...(aiBlob ? { aiImage: aiBlob } : {}) }
      await savePhoto(photo); setSelectedId(photo.id); await refreshGallery(); notify('Saved in this browserâ€™s Magic Gallery.')
    } catch (error) { notify(error instanceof Error ? error.message : 'Photo could not be saved. Check browser storage space.') }
    finally { setBusy(false) }
  }
  const retake = () => { setOriginalPhoto(null); setSource(null); setSourceLabel(''); setSelectedId(''); setCaption(''); setAiBlob(null); setScreen('permission') }
  const openSaved = async (photo: GalleryPhoto) => { setSelectedId(photo.id); setOriginalPhoto(photo.original); setSource(photo.final); setFilter('Natural'); setOverlay('None'); setAdjustments({ ...defaultAdjustments }); setCaption(photo.caption); setAiBlob(photo.aiImage ?? null); setSourceLabel(photo.caption || 'Saved photo'); setScreen('print') }
  const deleteSaved = async (id: string) => { if (!window.confirm('Delete this photo from your local gallery?')) return; try { await deletePhoto(id); await refreshGallery(); notify('Photo deleted from this browser.') } catch (error) { notify(error instanceof Error ? error.message : 'Photo could not be deleted.') } }
  const clearGallery = async () => { if (!window.confirm('Delete every photo in this browserâ€™s gallery? This cannot be undone.')) return; try { await clearPhotos(); await refreshGallery(); notify('The local gallery is clear.') } catch (error) { notify(error instanceof Error ? error.message : 'Gallery could not be cleared.') } }
  const openFile = async (file: File) => { if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) { notify('Choose a JPEG, PNG, or WebP photo under 12 MB.'); return } try { const bitmap = await createImageBitmap(file); const valid = bitmap.width >= 64 && bitmap.height >= 64 && bitmap.width <= 12000 && bitmap.height <= 12000; bitmap.close(); if (!valid) { notify('Choose a photo between 64 and 12000 pixels on each side.'); return } } catch { notify('This image could not be opened.'); return } setSource(file); setOriginalPhoto(file); setSourceLabel(file.name); setSelectedId(''); setCaption(''); setAiBlob(null); setFilter('Natural'); setOverlay('None'); setAdjustments({ ...defaultAdjustments }); setScreen('print') }
  const aiTransform = async () => {
    if (!source || !consent) return
    setBusy(true); setAiError(''); setAiBlob(null)
    try {
      const aiInput = await prepareAIImage(source)
      const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] || ''); reader.onerror = () => reject(new Error('The photo could not be prepared.')); reader.readAsDataURL(aiInput) })
      const response = await fetch('/api/v1/ai/transform', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ consent: true, image: base64, mimeType: 'image/jpeg', style: aiStyle, prompt: aiPrompt }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'AI transformation is unavailable.')
      const binary = atob(data.image); const bytes = Uint8Array.from(binary, char => char.charCodeAt(0)); const result = new Blob([bytes], { type: data.mimeType || 'image/png' })
      setAiBlob(result); setSource(result); setSourceLabel('AI styled photo'); setFilter('Natural'); setAdjustments({ ...defaultAdjustments }); setOverlay('None'); setScreen('print'); notify('Your transformed version is ready. The original remains in the gallery record.')
    } catch (error) { setAiError(error instanceof Error ? error.message : 'AI transformation is unavailable.') }
    finally { setBusy(false) }
  }
  const useOriginal = () => { if (!source) return; if (originalPhoto) setSource(originalPhoto); setAiBlob(null); setSourceLabel('Original photo'); setScreen('print') }
  const setAdjustment = (key: keyof Adjustments, value: number | boolean) => setAdjustments(current => ({ ...current, [key]: value }))
  const previewCss = `${filterFor(filter)} brightness(${Math.max(0, adjustments.brightness + Math.abs(adjustments.warmth)*.12)}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) ${adjustments.warmth >= 0 ? `sepia(${adjustments.warmth/250})` : `hue-rotate(${Math.abs(adjustments.warmth)/2}deg)`})`

  return <>
    <button className="magic-launcher" onClick={launch} aria-label="Open Magic Camera"><Aperture size={21} /><span>Magic Camera</span></button>
    {open && <div className="magic-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) closeCamera() }}>
      <section className="magic-modal" role="dialog" aria-modal="true" aria-labelledby="magic-title">
        <header className="magic-header"><div className="magic-brand"><span className="magic-brand-mark"><Aperture size={19} /></span><span><strong id="magic-title">Magic Camera</strong><small>Make a little moment last.</small></span></div><div className="magic-header-actions"><button className="magic-icon-button" onClick={() => { camera.stop(); setScreen('gallery') }} aria-label="Open photo gallery"><Images size={19} /><span className="gallery-count">{gallery.length}</span></button><button className="magic-icon-button" onClick={closeCamera} aria-label="Close Magic Camera"><X size={21} /></button></div></header>
        <div className={`magic-content magic-screen-${screen}`}>{camera.flashVisible && <div className="shutter-flash global" aria-hidden="true" />}
          {screen === 'permission' && <div className="magic-permission"><div className="magic-orbit"><div className="magic-pocket"><Aperture size={58} /><span className="pocket-sparkle">âœ¦</span></div></div><p className="magic-kicker">A POCKET-SIZED PHOTO STUDIO</p><h2>Keep a little<br /><em>magic in the moment.</em></h2><p className="magic-lede">Your camera stays on this device. We only ask for access when you start the camera.</p>{camera.error && <p className="magic-error" role="alert">{camera.error}</p>}<div className="magic-permission-actions"><button className="magic-primary" disabled={camera.starting} onClick={() => void startCamera()}>{camera.starting ? <><LoaderCircle className="spin" size={17} /> Starting cameraâ€¦</> : <><Aperture size={17} /> Start camera</>}</button><button className="magic-secondary" onClick={() => fileRef.current?.click()}>Choose a photo instead</button></div><small className="magic-privacy-note">Photos stay in this browser unless you explicitly choose an AI transformation.</small><input ref={fileRef} type="file" accept="image/*" hidden onChange={event => { const file = event.target.files?.[0]; if (file) void openFile(file); event.currentTarget.value = '' }} /></div>}
          {screen === 'camera' && <div className="magic-camera-stage"><div className="magic-video-wrap"><video ref={camera.videoRef} autoPlay muted playsInline aria-label="Live camera preview" /><div className="viewfinder viewfinder-a" /><div className="viewfinder viewfinder-b" /><div className="camera-live"><i /> LIVE PREVIEW</div>{camera.error && <div className="camera-overlay-error" role="alert">{camera.error}</div>}</div><div className="camera-controls"><button className="magic-icon-button" onClick={() => void camera.switchCamera()} disabled={camera.devices.length < 2} aria-label="Switch camera"><SwitchCamera size={21} /></button><button className={`magic-icon-button ${camera.flashEffect ? "is-on" : ""}`} onClick={() => camera.setFlashEffect(value => !value)} aria-label={camera.flashEffect ? "Turn off visual flash effect" : "Turn on visual flash effect"} aria-pressed={camera.flashEffect}><Sparkles size={18} /></button><button className="shutter-button" onClick={() => void capture()} aria-label="Take photo"><span /></button><button className="magic-icon-button" onClick={() => void camera.start()} aria-label="Restart camera"><RotateCcw size={19} /></button></div><div className="camera-device-note">{camera.devices[camera.deviceIndex]?.label || 'Camera ready'} <span>Â·</span> flash effect is visual only</div></div>}
          {screen === 'print' && source && <div className="instant-stage"><div className="instant-glow" /><div className="instant-card" key={sourceLabel + selectedId}><div className="instant-image"><img src={sourceUrl} alt="Your captured photograph" style={{ filter: previewCss, transform: `rotate(${adjustments.rotation}deg) scaleX(${adjustments.flip ? -1 : 1})` }} />{overlay === 'Futuristic blue' && <span className="preview-frame blue-frame" />}{overlay === 'Neon' && <span className="preview-frame neon-frame" />}{overlay === 'Minimal white' && <span className="preview-frame white-frame" />}{(overlay === 'Sparkles' || overlay === 'Starry night') && <span className="preview-stars">âœ¦ã€€Â·ã€€âœ§ã€€ã€€âœ¦</span>}</div><div className="instant-caption">{overlay === 'Polaroid' ? <input value={caption} maxLength={48} onChange={event => setCaption(event.target.value)} aria-label="Photo caption" placeholder="A little moment" /> : <><span>{sourceLabel || 'A MOMENT, KEPT'}</span><small>{new Date().toLocaleDateString()}</small></>}</div></div><div className="print-caption"><span className="magic-kicker">âœ¦ YOUR INSTANT PHOTO IS READY âœ¦</span><h2>A moment,<br /><em>made yours.</em></h2><p>Your original stays safe while you make it your own.</p></div><div className="instant-actions"><button className="magic-secondary" onClick={retake}><RotateCcw size={16} /> Retake</button><button className="magic-primary" onClick={openEditor}><Sparkles size={16} /> Edit photo</button><button className="magic-secondary" onClick={() => { setScreen('ai'); setConsent(false); setAiError('') }}><Sparkles size={16} /> AI style</button>{originalPhoto && source !== originalPhoto && <button className="magic-secondary" onClick={useOriginal}>Use original</button>}<button className="magic-secondary" disabled={busy} onClick={() => void saveToGallery()}><Save size={16} /> Save</button><button className="magic-secondary" disabled={busy} onClick={() => void download()}><Download size={16} /> Download</button></div></div>}
          {screen === 'editor' && source && <div className="magic-editor"><div className="editor-toolbar"><button className="magic-back" onClick={() => setScreen('print')}><ArrowLeft size={17} /> Photo</button><div className="editor-title"><span className="magic-kicker">YOUR EDITING DESK</span><strong>Make it yours</strong></div><button className="magic-small" onClick={() => { setFilter('Natural'); setOverlay('None'); setAdjustments({ ...defaultAdjustments }); setCaption('') }}><RotateCcw size={15} /> Reset</button></div><div className="editor-body"><div className="editor-preview-wrap"><div className="editor-photo"><img src={compare && originalUrl ? originalUrl : sourceUrl} alt="Photo being edited" style={{ filter: compare ? 'none' : previewCss, transform: compare ? "none" : `rotate(${adjustments.rotation}deg) scaleX(${adjustments.flip ? -1 : 1})` }} />{!compare && overlay !== 'None' && <span className={`editor-overlay editor-overlay-${overlay.toLowerCase().replace(/ /g,'-').replace('&','and')}`}>{overlay === 'Sparkles' || overlay === 'Starry night' ? 'âœ¦ã€€âœ§ã€€âœ¦' : overlay === 'Polaroid' ? caption || 'A little moment' : ''}</span>}</div><button className="compare-button" onClick={() => setCompare(value => !value)} aria-pressed={compare}><ChevronLeft size={14} /> {compare ? "Show edits" : "Show original"} <ChevronRight size={14} /></button></div><div className="editor-tools"><section className="tool-section"><h3>Looks</h3><div className="filter-strip">{filters.map(option => <button className={`filter-option ${filter === option.name ? 'active' : ''}`} key={option.name} onClick={() => setFilter(option.name)}><span className="filter-swatch"><img src={sourceUrl} alt="" style={{ filter: option.css }} /></span><span>{option.name}</span></button>)}</div></section><section className="tool-section"><h3>Adjust</h3>{([['brightness','Brightness',50,150],['contrast','Contrast',50,160],['saturation','Saturation',0,180],['warmth','Warmth',-100,100]] as const).map(([key,label,min,max]) => <label className="adjust-row" key={key}><span>{label}</span><input aria-label={label} type="range" min={min} max={max} value={adjustments[key]} onChange={event => setAdjustment(key, Number(event.target.value))} /><output>{key === 'warmth' ? adjustments[key] : `${adjustments[key]}%`}</output></label>)}<div className="rotate-controls"><button className="magic-small" onClick={() => setAdjustment('rotation', (adjustments.rotation + 270) % 360)}><RotateCcw size={15} /> Rotate</button><button className="magic-small" onClick={() => setAdjustment('flip', !adjustments.flip)}><FlipHorizontal size={15} /> Flip</button></div></section><section className="tool-section"><h3>Frames & details</h3><div className="overlay-options">{overlays.map(option => <button className={overlay === option ? 'selected' : ''} key={option} onClick={() => setOverlay(option)}>{option}</button>)}</div></section><div className="editor-final-actions"><button className="magic-primary" disabled={busy} onClick={() => void saveToGallery()}><Save size={16} /> Save to gallery</button><button className="magic-secondary" disabled={busy} onClick={() => void download()}><Download size={16} /> Download finished photo</button></div></div></div></div>}
          {screen === 'ai' && source && <div className="ai-screen"><button className="magic-back" onClick={() => setScreen('print')}><ArrowLeft size={17} /> Back to photo</button><div className="ai-heading"><div className="ai-orb"><Sparkles size={27} /></div><p className="magic-kicker">A NEW WAY TO SEE IT</p><h2>Give your photo<br /><em>a different world.</em></h2><p>AI styling sends this image to the configured image provider for processing. Your original remains unchanged.</p></div><div className="ai-form"><label htmlFor="ai-style">Choose a style</label><select id="ai-style" value={aiStyle} onChange={event => setAiStyle(event.target.value)}>{['Dreamlike illustration','Watercolor storybook','Retro travel poster','Cel-shaded adventure','Soft 3D miniature','Paper collage'].map(style => <option key={style}>{style}</option>)}</select><label htmlFor="ai-prompt">Add a direction <span>optional</span></label><textarea id="ai-prompt" value={aiPrompt} maxLength={300} onChange={event => setAiPrompt(event.target.value)} placeholder="Add soft blue details and a twilight skyâ€¦" />{aiError && <p role="alert" className="magic-error">{aiError}</p>}<label className="ai-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} /><span>I understand this photo will be sent to an external AI provider. I choose to continue.</span></label><button className="magic-primary ai-submit" disabled={!consent || busy} onClick={() => void aiTransform()}>{busy ? <><LoaderCircle className="spin" size={17} /> Creatingâ€¦</> : <><Sparkles size={17} /> Transform this photo</>}</button><small>AI output is a new version. You can return to your original at any time.</small></div><button className="magic-secondary" onClick={useOriginal}>Use original photo</button></div>}
          {screen === 'gallery' && <div className="magic-gallery"><div className="gallery-heading"><div><p className="magic-kicker">ONLY ON THIS DEVICE</p><h2>Your Magic <em>Gallery.</em></h2><p>Saved locally in this browser. It wonâ€™t sync to other devices.</p></div><div className="gallery-heading-actions"><button className="magic-secondary" onClick={() => fileRef.current?.click()}>Add photo</button>{gallery.length > 0 && <button className="magic-small danger" onClick={() => void clearGallery()}><Trash2 size={15} /> Clear all</button>}</div></div><input ref={fileRef} type="file" accept="image/*" hidden onChange={event => { const file = event.target.files?.[0]; if (file) void openFile(file); event.currentTarget.value = '' }} />{gallery.length ? <div className="magic-gallery-grid">{gallery.map(photo => <article className="gallery-card" key={photo.id}><button className="gallery-thumb" onClick={() => void openSaved(photo)} aria-label={`Open ${photo.caption || 'saved photo'}`}><img src={thumbUrls[photo.id]} alt={photo.caption || 'Saved photo'} loading="lazy" /></button><div><span>{new Date(photo.createdAt).toLocaleDateString()}</span><button aria-label="Delete photo" onClick={() => void deleteSaved(photo.id)}><Trash2 size={15} /></button></div><button className="gallery-edit-link" onClick={() => void openSaved(photo)}>{photo.caption || 'Edit this photo'} <ChevronRight size={14} /></button></article>)}</div> : <div className="gallery-empty"><div className="magic-orbit small"><div className="magic-pocket"><Images size={31} /></div></div><h3>Your little gallery is waiting.</h3><p>Capture a moment or open a photo to make your first instant print.</p><button className="magic-primary" onClick={() => setScreen('permission')}><Aperture size={16} /> Take a photo</button></div>}</div>}
        </div>
        <footer className="magic-footer"><span><i /> PRIVATE BY DEFAULT</span><span>Photos remain in your browser unless you choose AI processing.</span></footer>
      </section>
    </div>}
  </>
}











