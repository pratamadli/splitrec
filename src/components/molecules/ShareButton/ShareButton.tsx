'use client'

import { useState } from 'react'
import { Button } from '@/src/components/atoms/Button'
import { useLang } from '@/src/contexts/LanguageContext'

interface ShareButtonProps {
  shareToken: string
  billId: string
  createdAt: string
}

export function ShareButton({ shareToken, billId, createdAt }: ShareButtonProps) {
  const { t, lang } = useLang()
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

  const expiryDate = new Date(new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000)
  const formattedExpiry = expiryDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="primary"
        onClick={handleShare}
        className="bg-brand-green hover:bg-brand-green/90 w-full"
      >
        {copied ? t('share.copy_success') : t('share.share_bill')}
      </Button>
      <p className="text-xs text-gray-400 dark:text-gray-500">{t('share.link_valid')} {formattedExpiry}</p>
    </div>
  )
}
