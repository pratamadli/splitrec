'use client'

import { useState, useEffect } from 'react'
import { PurchaseCard } from '@/src/components/organisms/PurchaseCard'
import { Button } from '@/src/components/atoms/Button'
import { Input } from '@/src/components/atoms/Input'
import { CurrencyInput } from '@/src/components/atoms/CurrencyInput'
import { EmptyState } from '@/src/components/atoms/EmptyState'
import type { BillData } from '@/src/types/bill.types'

type ItemConsumer = { participantId: string; quantity: number }
type ItemFormData = { name: string; price: number; note: string | null; consumers: ItemConsumer[] }

interface PurchaseListProps {
  bill: BillData
  isOwner: boolean
  onAddPurchase: (data: { title: string; paidBy: string; totalAmount: number }) => Promise<void>
  onDeletePurchase: (id: string) => Promise<void>
  onAddItem: (purchaseId: string, data: ItemFormData) => Promise<void>
  onEditItem: (itemId: string, data: ItemFormData) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
}

export function PurchaseList({
  bill,
  isOwner,
  onAddPurchase,
  onDeletePurchase,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: PurchaseListProps) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [paidBy, setPaidBy] = useState(bill.participants[0]?.id ?? '')
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Sync paidBy saat participants berubah — state tidak auto-update dari prop
  useEffect(() => {
    const ids = bill.participants.map((p) => p.id)
    if (!paidBy || !ids.includes(paidBy)) {
      setPaidBy(bill.participants[0]?.id ?? '')
    }
  }, [bill.participants, paidBy])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !paidBy || totalAmount <= 0) return
    setLoading(true)
    try {
      await onAddPurchase({ title, paidBy, totalAmount })
      setTitle('')
      setTotalAmount(0)
      setAdding(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="px-4 py-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-brand-blue">Transaksi</h2>

      {bill.purchases.length === 0 && !adding && (
        <EmptyState
          title="Belum ada transaksi"
          subtitle="Tambah transaksi pertama kamu"
        />
      )}

      {bill.purchases.map((p) => (
        <PurchaseCard
          key={p.id}
          purchase={p}
          participants={bill.participants}
          isOwner={isOwner}
          splitMode={bill.splitMode as 'equal' | 'item'}
          onDeletePurchase={onDeletePurchase}
          onAddItem={onAddItem}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      ))}

      {isOwner && (
        adding ? (
          <form onSubmit={handleAdd} className="flex flex-col gap-3 bg-gray-50 rounded-2xl p-4">
            <Input
              label="Nama transaksi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Makan siang, Bensin"
              maxLength={200}
              required
              autoFocus
            />
            <CurrencyInput label="Total" value={totalAmount} onChange={setTotalAmount} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Dibayar oleh</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {bill.participants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setAdding(false)} className="flex-1">
                Batal
              </Button>
              <Button type="submit" isLoading={loading} disabled={!title.trim() || totalAmount <= 0} className="flex-1">
                Tambah
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            onClick={() => setAdding(true)}
            disabled={bill.participants.length === 0}
            className="w-full"
          >
            + Tambah Transaksi
          </Button>
        )
      )}
    </section>
  )
}
