import { motion } from 'motion/react'
import { Artwork } from '@/components/ui/Artwork'

interface AnalyzeHeroProps {
  title: string
  subtitle?: string | null
  artworkSrc?: string | null
  mosaic?: string[]
  analyzing?: boolean
}

export function AnalyzeHero({ title, subtitle, artworkSrc, mosaic = [], analyzing }: AnalyzeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-surface">
      {artworkSrc ? (
        <div className="pointer-events-none absolute inset-0">
          <img src={artworkSrc} alt="" className="h-full w-full scale-125 object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-canvas/30 to-canvas" />
        </div>
      ) : null}
      <div className="relative flex min-w-0 flex-col items-center gap-5 px-5 py-8 lg:flex-row lg:items-end lg:px-8 lg:py-10">
        <motion.div layoutId="analyze-hero" className="w-48 max-w-full lg:w-56">
          {artworkSrc ? (
            <Artwork src={artworkSrc} alt="" className="aspect-square w-full rounded-2xl" />
          ) : mosaic.length ? (
            <div className="grid aspect-square grid-cols-2 overflow-hidden rounded-2xl">
              {mosaic.slice(0, 4).map((src) => (
                <Artwork key={src} src={src} className="h-full w-full" />
              ))}
            </div>
          ) : (
            <Artwork className="aspect-square w-full rounded-2xl" />
          )}
        </motion.div>
        <div className="min-w-0 max-w-full text-center lg:text-left">
          <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">DgLabs</p>
          <h1 className="mt-2 break-words text-3xl font-extrabold tracking-tight text-text-primary lg:text-4xl">
            {analyzing ? 'Reading the link' : title}
          </h1>
          {subtitle ? <p className="mt-2 text-sm text-text-secondary">{subtitle}</p> : null}
        </div>
      </div>
    </section>
  )
}
