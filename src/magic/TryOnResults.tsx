import { useEffect, useState } from 'react'
import { Check, Shirt } from 'lucide-react'
import './tryOnResults.css'

function TryOnImage({ image, index, onChoose }: { image: Blob; index: number; onChoose: (image: Blob) => void }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const objectUrl = URL.createObjectURL(image)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [image])

  return <article className="tryon-card">
    {url && <img src={url} alt={`Virtual try-on option ${index + 1}`} />}
    <div className="tryon-card-footer">
      <span>Look {index + 1}</span>
      <button className="magic-primary" onClick={() => onChoose(image)}><Check size={15} /> Use this look</button>
    </div>
  </article>
}

export default function TryOnResults({ images, busy, onChoose }: { images: Blob[]; busy: boolean; onChoose: (image: Blob) => void }) {
  return <>
    {busy && <div className="tryon-loading" role="status"><span className="tryon-spinner" />Creating your try-on looks. This can take a minute.</div>}
    {!busy && images.length > 0 && <section className="tryon-results" aria-label="Generated try-on looks">
      <h3><Shirt size={17} /> Your try-on looks</h3>
      <div className="tryon-grid">{images.map((image, index) => <TryOnImage key={`${index}-${image.size}`} image={image} index={index} onChoose={onChoose} />)}</div>
    </section>}
  </>
}
