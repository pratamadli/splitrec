'use client'

import { useState } from 'react'
import { Input } from '@/src/components/atoms/Input'
import { CurrencyInput } from '@/src/components/atoms/CurrencyInput'
import { Button } from '@/src/components/atoms/Button'
import { ParticipantSelector } from '@/src/components/molecules/ParticipantSelector'
import type { ParticipantData } from '@/src/types/bill.types'

type ItemConsumer = { participantId: string; quantity: number }

interface AddItemFormProps {
  participants: ParticipantData[]
  initialValues?: {
    name: string
    price: number
    note: string
    consumers: ItemConsumer[]
  }
  submitLabel?: string
  onSubmit: (data: {
    name: string
    price: number
    note: string | null
    consumers: ItemConsumer[]
  }) => Promise<void>
  onCancel: () => void
}

export function AddItemForm({
  participants,
  initialValues,
  submitLabel = 'Tambah Item',
  onSubmit,
  onCancel,
}: AddItemFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [price, setPrice] = useState(initialValues?.price ?? 0)
  const [note, setNote] = useState(initialValues?.note ?? '')
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialValues?.consumers.map((c) => c.participantId) ?? []
  )
  const [qtys, setQtys] = useState<Record<string, number>>(
    Object.fromEntries(initialValues?.consumers.map((c) => [c.participantId, c.quantity]) ?? [])
  )
  const [loading, setLoading] = useState(false)

  const handleSelectChange = (ids: string[]) => {
    setSelectedIds(ids)
    setQtys((prev) => {
      const next: Record<string, number> = {}
      for (const id of ids) next[id] = prev[id] ?? 1
      return next
    })
  }

  const handleQtyChange = (id: string, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    const n = digits ? parseInt(digits, 10) : 1
    setQtys((prev) => ({ ...prev, [id]: n < 1 ? 1 : n > 999 ? 999 : n }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || price <= 0) return
    setLoading(true)
    try {
      const consumers = selectedIds.map((id) => ({ participantId: id, quantity: qtys[id] ?? 1 }))
      await onSubmit({ name, price, note: note || null, consumers })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl">
      <Input
        label="Nama item"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="cth. Nasi goreng"
        maxLength={200}
        required
      />
      <CurrencyInput label="Harga per porsi" value={price} onChange={setPrice} />
      <Input
        label="Catatan (opsional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="cth. pedas, tanpa bawang"
        maxLength={200}
      />
      {participants.length > 0 && (
        <ParticipantSelector
          participants={participants}
          selectedIds={selectedIds}
          onChange={handleSelectChange}
          label="Siapa yang makan? (kosongkan = dibagi ke pemesan)"
        />
      )}
      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-brand-gray font-medium">Qty per orang</p>
          {selectedIds.map((id) => {
            const participant = participants.find((p) => p.id === id)
            if (!participant) return null
            return (
              <div key={id} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 flex-1 truncate">{participant.name}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qtys[id] ?? 1}
                  onChange={(e) => handleQtyChange(id, e.target.value)}
                  className="w-16 h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            )
          })}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button type="submit" isLoading={loading} disabled={!name.trim() || price <= 0} className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
