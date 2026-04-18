'use client'

import { useState } from 'react'
import { Button } from '@/src/components/atoms/Button'

interface ShareButtonProps {
  shareToken: string
  billId: string
}

export function ShareButton({ shareToken, billId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const getUrl = () => `${window.location.origin}/s/${shareToken}`

  const handleShare = async () => {
    const url = getUrl()
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Splitrec', url })
        fetch('/api/bills/' + billId + '/log-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'share_link_copied' }),
        }).catch(() => {})
        return
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="primary"
      onClick={handleShare}
      className="bg-brand-green hover:bg-brand-green/90 w-full"
    >
      {copied ? '✓ Disalin!' : '🔗 Bagikan Tagihan'}
    </Button>
  )
}
