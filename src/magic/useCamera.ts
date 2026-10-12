import { useCallback, useEffect, useRef, useState } from 'react'

function cameraMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'Camera access was denied. Allow camera access in your browser settings and try again.'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No compatible camera was found. Try switching cameras or reconnecting your device.'
  if (name === 'NotReadableError' || name === 'AbortError') return 'The camera could not start. It may be in use by another app.'
  if (name === 'TimeoutError') return 'Camera initialization took too long. Check device access and try again.'
  if (!navigator.mediaDevices?.getUserMedia) return 'Camera access needs a supported browser and a secure HTTPS connection (localhost is also supported).'
  return 'The camera could not start. Check your browser permission and try again.'
}
async function requestCamera(constraints: MediaStreamConstraints): Promise<MediaStream> {
  let timedOut = false
  let timer = 0
  const pending = navigator.mediaDevices.getUserMedia(constraints).then((media) => { if (timedOut) media.getTracks().forEach(track => track.stop()); return media })
  const timeout = new Promise<MediaStream>((_resolve, reject) => { timer = window.setTimeout(() => { timedOut = true; reject(new DOMException('Camera initialization timed out.', 'TimeoutError')) }, 15000) })
  try { return await Promise.race([pending, timeout]) } finally { window.clearTimeout(timer) }
}
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const startingRef = useRef(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceIndex, setDeviceIndex] = useState(0)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const [flashEffect, setFlashEffect] = useState(true)
  const [flashVisible, setFlashVisible] = useState(false)

  const stop = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => { track.onended = null; track.stop() })
    streamRef.current = null; setStream(null)
  }, [])
  useEffect(() => () => { streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null }, [])
  useEffect(() => {
    if (!stream || !navigator.mediaDevices?.addEventListener) return
    const refresh = () => { void navigator.mediaDevices.enumerateDevices().then(inputs => setDevices(inputs.filter(device => device.kind === 'videoinput'))) }
    navigator.mediaDevices.addEventListener('devicechange', refresh)
    return () => navigator.mediaDevices.removeEventListener('devicechange', refresh)
  }, [stream])

  const start = useCallback(async (deviceId?: string): Promise<boolean> => {
    if (startingRef.current) return false
    startingRef.current = true; setStarting(true); setError(''); stop()
    if (!navigator.mediaDevices?.getUserMedia) { setError(cameraMessage(null)); startingRef.current = false; setStarting(false); return false }
    try {
      const media = await requestCamera({ audio: false, video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1440 } } })
      streamRef.current = media; setStream(media)
      media.getVideoTracks().forEach(track => { track.onended = () => { if (streamRef.current === media) { stop(); setError('The camera disconnected. Reconnect it and start the camera again.') } } })
      const inputs = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput')
      setDevices(inputs); if (deviceId) setDeviceIndex(Math.max(0, inputs.findIndex(device => device.deviceId === deviceId)))
      return true
    } catch (cause) { stop(); setError(cameraMessage(cause)); return false }
    finally { startingRef.current = false; setStarting(false) }
  }, [stop])
  const switchCamera = useCallback(async () => {
    if (devices.length < 2 || startingRef.current) return
    await start(devices[(deviceIndex + 1) % devices.length].deviceId)
  }, [devices, deviceIndex, start])
  const capture = useCallback(async () => {
    if (flashEffect) { setFlashVisible(true); window.setTimeout(() => setFlashVisible(false), 150) }
    const video = videoRef.current
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) { setError('Wait for the camera preview to finish starting.'); return null }
    const scale = Math.min(1, 2560 / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas'); canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale)
    const context = canvas.getContext('2d')
    if (!context) { setError('Your browser could not capture this frame.'); return null }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const image = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', .94))
    if (!image) { setError('The photo could not be created. Please try again.'); return null }
    setError(''); return image
  }, [flashEffect])
  return { videoRef, stream, devices, deviceIndex, error, starting, flashEffect, flashVisible, setFlashEffect, setError, start, stop, switchCamera, capture }
}

