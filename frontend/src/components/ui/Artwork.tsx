import clsx from 'clsx'
import { Music2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ArtworkProps {
  src?: string | null
  blob?: Blob | null
  alt?: string
  className?: string
  sizes?: string
}

export function Artwork({ src, blob, alt = '', className, sizes }: ArtworkProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
    if (!blob) {
      setBlobUrl(null)
      return
    }
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [blob])

  const imageSrc = blobUrl ?? src ?? null
  const showImage = Boolean(imageSrc) && !failed

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-surface-muted text-text-secondary',
        className,
      )}
    >
      {showImage ? (
        <img
          src={imageSrc ?? undefined}
          alt={alt}
          sizes={sizes}
          className="h-full w-full object-cover transition duration-200 ease-out"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Music2 className="h-1/3 w-1/3 max-h-12 max-w-12 opacity-50" aria-hidden />
        </div>
      )}
    </div>
  )
}
