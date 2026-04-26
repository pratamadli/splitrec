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
  const initialTotalQty = initialValues?.consumers.reduce((s, c) => s + c.quantity, 0) ?? 1
  const [name, setName] = useState(initialValues?.name ?? '')
  const [price, setPrice] = useState(
    initialValues ? Math.round(initialValues.price * Math.max(initialTotalQty, 1)) : 0
  )
  const [note, setNote] = useState(initialValues?.note ?? '')
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialValues?.consumers.map((c) => c.participantId) ?? []
  )
  // Store qty as string so users can clear the field and retype freely
  const [qtys, setQtys] = useState<Record<string, string>>(
    Object.fromEntries(initialValues?.consumers.map((c) => [c.participantId, String(c.quantity)]) ?? [])
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
    // Allow empty string or digits only, cap at 999
    const cleaned = raw.replace(/\D/g, '')
    const capped = cleaned && parseInt(cleaned, 10) > 999 ? '999' : cleaned
    setQtys((prev) => ({ ...prev, [id]: capped }))
  }

  const parsedQtys = Object.fromEntries(
    Object.entries(qtys).map(([id, s]) => [id, parseInt(s || '0', 10)])
  )
  const allQtysValid = selectedIds.every((id) => (parsedQtys[id] ?? 0) >= 1)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || price <= 0 || !allQtysValid) return
    setLoading(true)
    try {
      const consumers = selectedIds.map((id) => ({ participantId: id, quantity: parsedQtys[id] ?? 1 }))
      const totalQty = consumers.reduce((s, c) => s + c.quantity, 0)
      const pricePerPortion = price / Math.max(totalQty, 1)
      await onSubmit({ name, price: pricePerPortion, note: note || null, consumers })
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
      <CurrencyInput label="Harga total" value={price} onChange={setPrice} />
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
                  value={qtys[id] ?? '1'}
                  onChange={(e) => handleQtyChange(id, e.target.value)}
                  placeholder="1"
                  className={`w-16 h-9 rounded-lg border bg-white px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-blue ${
                    (parsedQtys[id] ?? 0) < 1 ? 'border-red-300' : 'border-gray-200'
                  }`}
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
        <Button type="submit" isLoading={loading} disabled={!name.trim() || price <= 0 || !allQtysValid} className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
