import clsx from 'clsx'

const sizes = {
  sm: 'h-12 w-12 rounded-lg',
  md: 'h-14 w-14 rounded-xl',
  lg: 'h-20 w-20 rounded-2xl sm:h-24 sm:w-24',
}

interface ArtworkProps {
  src?: string | null
  alt?: string
  size?: keyof typeof sizes
  glow?: boolean
  className?: string
}

function VinylPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center bg-surface-muted',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-text-secondary/50" fill="currentColor">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </div>
  )
}

export function Artwork({ src, alt = '', size = 'md', glow = false, className }: ArtworkProps) {
  const sizeClass = sizes[size]

  return (
    <div className={clsx('relative shrink-0', className)}>
      {glow && src ? (
        <div
          className={clsx('absolute inset-0 scale-110 blur-xl opacity-40', sizeClass)}
          aria-hidden
        >
          <img src={src} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      {src ? (
        <img
          src={src}
          alt={alt}
          className={clsx('relative object-cover shadow-lg shadow-black/30', sizeClass)}
        />
      ) : (
        <VinylPlaceholder className={sizeClass} />
      )}
    </div>
  )
}
