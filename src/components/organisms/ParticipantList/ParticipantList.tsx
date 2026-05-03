'use client'

import { useState } from 'react'
import { ParticipantChip } from '@/src/components/molecules/ParticipantChip'
import { AddParticipantForm } from '@/src/components/molecules/AddParticipantForm'
import { ConfirmDialog } from '@/src/components/molecules/ConfirmDialog'
import { useLang } from '@/src/contexts/LanguageContext'
import type { ParticipantData } from '@/src/types/bill.types'

interface ParticipantListProps {
  participants: ParticipantData[]
  isOwner: boolean
  onAdd: (name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  showWarning?: boolean
}

export function ParticipantList({
  participants,
  isOwner,
  onAdd,
  onDelete,
  showWarning,
}: ParticipantListProps) {
  const { t } = useLang()
  const [deleting, setDeleting] = useState<ParticipantData | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAdd = async (name: string) => {
    setLoading(true)
    try {
      await onAdd(name)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setLoading(true)
    try {
      await onDelete(deleting.id)
    } finally {
      setLoading(false)
      setDeleting(null)
    }
  }

  return (
    <section className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
      <h2 className="text-sm font-semibold text-brand-blue mb-3">{t('participants.title')}</h2>
      {isOwner && (
        <AddParticipantForm
          onSubmit={handleAdd}
          isLoading={loading}
          showHint={participants.length < 2}
        />
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {participants.map((p) => (
          <ParticipantChip
            key={p.id}
            participant={p}
            onDelete={isOwner ? () => setDeleting(p) : undefined}
          />
        ))}
      </div>
      {deleting && (
        <ConfirmDialog
          title={t('participants.confirm_delete_title')}
          description={t('participants.confirm_delete_desc', { name: deleting.name })}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          isLoading={loading}
        />
      )}
    </section>
  )
}
