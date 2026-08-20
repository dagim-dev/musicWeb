export class SaveCancelledError extends Error {
  constructor() {
    super('Save cancelled')
    this.name = 'SaveCancelledError'
  }
}

export class PlaybackUnavailableError extends Error {
  constructor(message = 'This file is not available for playback') {
    super(message)
    this.name = 'PlaybackUnavailableError'
  }
}

export function classifyError(error: unknown): { title: string; hint: string } {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()

  if (error instanceof SaveCancelledError || lower.includes('abort')) {
    return {
      title: 'Save cancelled',
      hint: 'The file was not written. Retry to pick a location and save again.',
    }
  }

  if (lower.includes('quota') || lower.includes('disk') || lower.includes('space') || lower.includes('enospc')) {
    return {
      title: 'Not enough storage',
      hint: 'Free up space on this device, then retry the failed tracks.',
    }
  }

  if (lower.includes('permission') || lower.includes('notallowed') || lower.includes('denied')) {
    return {
      title: 'Permission denied',
      hint: 'Allow file access and retry. On the web, you may need to relink the file.',
    }
  }

  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('load failed')) {
    return {
      title: 'Server unreachable',
      hint: 'Keep DgLabs open and confirm the local backend is running, then retry.',
    }
  }

  if (lower.includes('404') || lower.includes('not found') || lower.includes('unavailable')) {
    return {
      title: 'Source unavailable',
      hint: 'The original video may be private or gone. Try another link.',
    }
  }

  return {
    title: message || 'Download failed',
    hint: 'You can retry failed tracks without restarting the whole queue.',
  }
}
