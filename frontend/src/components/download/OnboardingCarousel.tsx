import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getSetting, setSetting } from '@/db/libraryRepository'

const slides = [
  {
    title: 'Install DgLabs',
    body: 'Tap Install App on the home screen to launch DgLabs without the browser URL bar.',
  },
  {
    title: 'Paste any YouTube link',
    body: 'Supports single videos, playlists, and album-style playlists.',
  },
  {
    title: 'Open Samsung Music',
    body: 'Downloaded MP3 files save to Downloads. Samsung Music picks them up with full metadata.',
  },
]

export function OnboardingCarousel() {
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    void getSetting('onboardingComplete').then((value) => {
      if (value !== 'true') setVisible(true)
    })
  }, [])

  if (!visible) return null

  const slide = slides[index]
  const isLast = index === slides.length - 1

  const finish = async () => {
    await setSetting('onboardingComplete', 'true')
    setVisible(false)
  }

  return (
    <Card className="animate-fade-in-up mb-4 space-y-4 border-accent/20 bg-accent/5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Step {index + 1} of {slides.length}
        </p>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-4 gradient-accent' : 'w-1.5 bg-surface-muted'
              }`}
            />
          ))}
        </div>
      </div>
      <div key={index} className="animate-fade-in-up space-y-2">
        <h2 className="text-base font-semibold text-text-primary">{slide.title}</h2>
        <p className="text-sm text-text-secondary">{slide.body}</p>
      </div>
      <div className="flex min-w-0 gap-2">
        {!isLast ? (
          <Button
            fullWidth
            onClick={() => setIndex((current) => Math.min(current + 1, slides.length - 1))}
          >
            Next
          </Button>
        ) : (
          <Button fullWidth onClick={() => void finish()}>
            Get started
          </Button>
        )}
        <Button variant="ghost" onClick={() => void finish()} className="shrink-0">
          Skip
        </Button>
      </div>
    </Card>
  )
}
