'use client'

import { useState } from 'react'
import { Logo } from '@/src/components/atoms/Logo'
import { Input } from '@/src/components/atoms/Input'
import { SplitModeToggle } from '@/src/components/molecules/SplitModeToggle'
import type { BillData, SplitMode } from '@/src/types/bill.types'

interface BillHeaderProps {
  bill: BillData
  onUpdateTitle: (title: string) => Promise<void>
  onUpdateSplitMode: (mode: SplitMode) => Promise<void>
  isOwner: boolean
}

export function BillHeader({ bill, onUpdateTitle, onUpdateSplitMode, isOwner }: BillHeaderProps) {
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
    <div className="bg-white border-b border-gray-100 px-4 py-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Logo size="sm" />
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
      ) : (
        <h1
          className="text-xl font-semibold text-brand-blue cursor-pointer"
          onClick={() => isOwner && setEditing(true)}
        >
          {bill.title}
        </h1>
      )}
      {isOwner && (
        <SplitModeToggle
          mode={bill.splitMode as SplitMode}
          onChange={onUpdateSplitMode}
        />
      )}
    </div>
  )
}
