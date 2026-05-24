'use client'

import { useState, useCallback } from 'react'

export function useOcr() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const recognize = useCallback(async (file: File): Promise<string> => {
    setLoading(true)
    setProgress(0)
    setError(null)
    try {
      // Dynamic import — avoids SSR bundle, downloads model lazily on first use
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker(['ind', 'eng'], 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      return text
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OCR failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { recognize, loading, progress, error }
}
