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
    <Card className="mb-4 space-y-3 border-accent/20 bg-accent/5">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">
        Step {index + 1} of {slides.length}
      </p>
      <h2 className="text-base font-semibold text-text-primary">{slide.title}</h2>
      <p className="text-sm text-text-secondary">{slide.body}</p>
      <div className="flex gap-2">
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
        <Button variant="ghost" onClick={() => void finish()}>
          Skip
        </Button>
      </div>
    </Card>
  )
}
