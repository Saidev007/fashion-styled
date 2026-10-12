export type FilterName = 'Natural' | 'Cinematic' | 'Vintage' | 'Cool Blue' | 'Warm Sunset' | 'Black & White' | 'Dreamy' | 'Retro Film' | 'Neon Night' | 'Soft Portrait'
export type OverlayName = 'None' | 'Futuristic blue' | 'Polaroid' | 'Neon' | 'Minimal white' | 'Starry night' | 'Sparkles'
export type Adjustments = { brightness: number; contrast: number; saturation: number; warmth: number; rotation: number; flip: boolean }
export type GalleryPhoto = { id: string; createdAt: number; caption: string; original: Blob; final: Blob; filter: FilterName; overlay: OverlayName; adjustments: Adjustments; aiImage?: Blob }
export const defaultAdjustments: Adjustments = { brightness: 100, contrast: 100, saturation: 100, warmth: 0, rotation: 0, flip: false }
export const filters: { name: FilterName; css: string }[] = [
  { name: 'Natural', css: 'none' }, { name: 'Cinematic', css: 'contrast(1.12) saturate(.82) sepia(.12)' }, { name: 'Vintage', css: 'sepia(.32) contrast(.94) saturate(.8)' },
  { name: 'Cool Blue', css: 'hue-rotate(12deg) saturate(.86) contrast(1.05)' }, { name: 'Warm Sunset', css: 'sepia(.22) saturate(1.22) hue-rotate(-8deg)' }, { name: 'Black & White', css: 'grayscale(1) contrast(1.08)' },
  { name: 'Dreamy', css: 'brightness(1.08) saturate(.8) blur(.25px)' }, { name: 'Retro Film', css: 'sepia(.18) contrast(1.18) saturate(.74)' }, { name: 'Neon Night', css: 'saturate(1.55) contrast(1.14) hue-rotate(8deg)' }, { name: 'Soft Portrait', css: 'brightness(1.05) saturate(.9) contrast(.94)' },
]
export const overlays: OverlayName[] = ['None', 'Futuristic blue', 'Polaroid', 'Neon', 'Minimal white', 'Starry night', 'Sparkles']
export const filterFor = (name: FilterName) => filters.find((filter) => filter.name === name)?.css ?? 'none'
