'use client'

import { useState } from 'react'
import { Logo } from '@/src/components/atoms/Logo'
import { Input } from '@/src/components/atoms/Input'
import { ThemeToggle } from '@/src/components/atoms/ThemeToggle'
import { LangToggle } from '@/src/components/atoms/LangToggle'
import type { BillData } from '@/src/types/bill.types'

interface BillHeaderProps {
  bill: BillData
  onUpdateTitle: (title: string) => Promise<void>
  isOwner: boolean
}

export function BillHeader({ bill, onUpdateTitle, isOwner }: BillHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(bill.title)

  const handleTitleBlur = async () => {
    setEditing(false)
    if (title.trim() && title.trim() !== bill.title) {
      await onUpdateTitle(title.trim())
    } else {
      setTitle(bill.title)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Logo size="sm" />
        <div className="ml-auto flex items-center gap-1">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
      {editing && isOwner ? (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
          maxLength={200}
          autoFocus
        />
      ) : isOwner ? (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 text-left group w-fit max-w-full"
        >
          <h1 className="text-xl font-semibold text-brand-blue truncate group-hover:underline">
            {bill.title}
          </h1>
          <span className="text-base text-brand-gray opacity-50 group-hover:opacity-100 transition-opacity shrink-0">✏️</span>
        </button>
      ) : (
        <h1 className="text-xl font-semibold text-brand-blue">{bill.title}</h1>
      )}
    </div>
  )
}
