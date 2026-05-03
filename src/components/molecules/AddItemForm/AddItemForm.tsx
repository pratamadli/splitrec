'use client'

import { useState } from 'react'
import { Input } from '@/src/components/atoms/Input'
import { CurrencyInput } from '@/src/components/atoms/CurrencyInput'
import { Button } from '@/src/components/atoms/Button'
import { ParticipantSelector } from '@/src/components/molecules/ParticipantSelector'
import { useLang } from '@/src/contexts/LanguageContext'
import type { ParticipantData } from '@/src/types/bill.types'

type ItemConsumer = { participantId: string; quantity: number }

interface AddItemFormProps {
  participants: ParticipantData[]
  initialValues?: {
    name: string
    price: number
    note: string
    discount: number
    consumers: ItemConsumer[]
  }
  submitLabel?: string
  onSubmit: (data: {
    name: string
    price: number
    note: string | null
    discount: number
    consumers: ItemConsumer[]
  }) => Promise<void>
  onCancel: () => void
}

function buildDefaultQtys(ids: string[]): Record<string, string> {
  return Object.fromEntries(ids.map((id) => [id, '1']))
}

export function AddItemForm({
  participants,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: AddItemFormProps) {
  const { t } = useLang()
  const isEditMode = !!initialValues
  const initialTotalQty = initialValues?.consumers.reduce((s, c) => s + c.quantity, 0) ?? 1

  const [name, setName] = useState(initialValues?.name ?? '')
  const [price, setPrice] = useState(
    initialValues ? Math.round(initialValues.price * Math.max(initialTotalQty, 1)) : 0
  )
  const [discount, setDiscount] = useState(initialValues?.discount ?? 0)
  const [note, setNote] = useState(initialValues?.note ?? '')
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialValues?.consumers.map((c) => c.participantId) ?? []
  )
  const [qtys, setQtys] = useState<Record<string, string>>(
    initialValues
      ? Object.fromEntries(initialValues.consumers.map((c) => [c.participantId, String(c.quantity)]))
      : {}
  )
  const [loading, setLoading] = useState(false)

  const handleSelectChange = (ids: string[]) => {
    setSelectedIds(ids)
    setQtys((prev) => {
      const next: Record<string, string> = {}
      for (const id of ids) next[id] = prev[id] ?? '1'
      return next
    })
  }

  const handleQtyChange = (id: string, raw: string) => {
    const cleaned = raw.replace(/\D/g, '')
    const capped = cleaned && parseInt(cleaned, 10) > 999 ? '999' : cleaned
    setQtys((prev) => ({ ...prev, [id]: capped }))
  }

  const parsedQtys = Object.fromEntries(
    Object.entries(qtys).map(([id, s]) => [id, parseInt(s || '0', 10)])
  )
  const allQtysValid = selectedIds.every((id) => (parsedQtys[id] ?? 0) >= 1)

  const resetForm = () => {
    const ids = participants.map((p) => p.id)
    setName('')
    setPrice(0)
    setDiscount(0)
    setNote('')
    setSelectedIds(ids)
    setQtys(buildDefaultQtys(ids))
  }

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault()
    if (!name.trim() || price <= 0 || !allQtysValid) return
    setLoading(true)
    try {
      const consumers = selectedIds.map((id) => ({ participantId: id, quantity: parsedQtys[id] ?? 1 }))
      const totalQty = consumers.reduce((s, c) => s + c.quantity, 0)
      const pricePerPortion = price / Math.max(totalQty, 1)
      await onSubmit({ name, price: pricePerPortion, note: note || null, discount, consumers })
      if (!isEditMode) {
        resetForm()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <Input
        label={t('items.item_name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('items.item_name_placeholder')}
        maxLength={200}
        required
        autoFocus={!isEditMode}
      />
      <CurrencyInput label={t('items.total_price')} value={price} onChange={setPrice} />
      <CurrencyInput label={t('items.discount')} value={discount} onChange={setDiscount} />
      <Input
        label={t('items.note')}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('items.note_placeholder')}
        maxLength={200}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && selectedIds.length === 0) {
            e.preventDefault()
            handleSubmit()
          }
        }}
      />
      {participants.length > 0 && (
        <ParticipantSelector
          participants={participants}
          selectedIds={selectedIds}
          onChange={handleSelectChange}
        />
      )}
      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-brand-gray font-medium">{t('items.qty_per_person')}</p>
          {selectedIds.map((id, idx) => {
            const participant = participants.find((p) => p.id === id)
            if (!participant) return null
            const isLast = idx === selectedIds.length - 1
            return (
              <div key={id} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-200 flex-1 truncate">{participant.name}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qtys[id] ?? '1'}
                  onChange={(e) => handleQtyChange(id, e.target.value)}
                  placeholder="1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isLast) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  className={`w-16 h-9 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-blue ${
                    (parsedQtys[id] ?? 0) < 1 ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
            )
          })}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={loading} disabled={!name.trim() || price <= 0 || selectedIds.length === 0 || !allQtysValid} className="flex-1">
          {submitLabel ?? t('items.add_item').replace('+ ', '')}
        </Button>
      </div>
    </form>
  )
}
