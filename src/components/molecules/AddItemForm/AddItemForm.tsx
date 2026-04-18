'use client'

import { useState } from 'react'
import { Input } from '@/src/components/atoms/Input'
import { CurrencyInput } from '@/src/components/atoms/CurrencyInput'
import { Button } from '@/src/components/atoms/Button'
import { ParticipantSelector } from '@/src/components/molecules/ParticipantSelector'
import type { ParticipantData } from '@/src/types/bill.types'

interface AddItemFormProps {
  participants: ParticipantData[]
  onSubmit: (data: {
    name: string
    price: number
    quantity: number
    note: string | null
    consumerIds: string[]
  }) => Promise<void>
  onCancel: () => void
}

export function AddItemForm({ participants, onSubmit, onCancel }: AddItemFormProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [consumerIds, setConsumerIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || price <= 0) return
    setLoading(true)
    try {
      await onSubmit({ name, price, quantity, note: note || null, consumerIds })
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
      <div className="flex gap-2">
        <div className="flex-1">
          <CurrencyInput label="Harga" value={price} onChange={setPrice} />
        </div>
        <div className="w-20">
          <Input
            label="Qty"
            type="number"
            min={1}
            max={999}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>
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
          selectedIds={consumerIds}
          onChange={setConsumerIds}
          label="Siapa yang makan? (kosongkan = dibagi rata)"
        />
      )}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button type="submit" isLoading={loading} disabled={!name.trim() || price <= 0} className="flex-1">
          Tambah Item
        </Button>
      </div>
    </form>
  )
}
