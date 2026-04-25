'use client'

import { useState } from 'react'
import { PurchaseHeader } from '@/src/components/molecules/PurchaseHeader'
import { ItemRow } from '@/src/components/molecules/ItemRow'
import { AddItemForm } from '@/src/components/molecules/AddItemForm'
import { Button } from '@/src/components/atoms/Button'
import { ConfirmDialog } from '@/src/components/molecules/ConfirmDialog'
import type { PurchaseData, ParticipantData } from '@/src/types/bill.types'

type ItemConsumer = { participantId: string; quantity: number }
type ItemFormData = { name: string; price: number; note: string | null; consumers: ItemConsumer[] }

interface PurchaseCardProps {
  purchase: PurchaseData
  participants: ParticipantData[]
  isOwner: boolean
  splitMode: 'equal' | 'item'
  onDeletePurchase: (id: string) => Promise<void>
  onAddItem: (purchaseId: string, data: ItemFormData) => Promise<void>
  onEditItem: (itemId: string, data: ItemFormData) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
}

export function PurchaseCard({
  purchase,
  participants,
  isOwner,
  splitMode,
  onDeletePurchase,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: PurchaseCardProps) {
  const [addingItem, setAddingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDeletePurchase = async () => {
    setDeleting(true)
    try { await onDeletePurchase(purchase.id) } finally { setDeleting(false) }
  }

  const handleAddItem = async (data: ItemFormData) => {
    await onAddItem(purchase.id, data)
    setAddingItem(false)
  }

  const handleEditItem = async (itemId: string, data: ItemFormData) => {
    await onEditItem(itemId, data)
    setEditingItemId(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <PurchaseHeader
        purchase={purchase}
        payer={purchase.payer}
        onDelete={isOwner ? () => setConfirmDelete(true) : undefined}
      />

      {splitMode === 'item' && (
        <>
          {purchase.items.map((item) =>
            isOwner && editingItemId === item.id ? (
              <div key={item.id} className="px-4 py-2 border-t border-gray-100">
                <AddItemForm
                  participants={participants}
                  initialValues={{
                    name: item.name,
                    price: item.price,
                    note: item.note ?? '',
                    consumers: item.consumers.map((c) => ({
                      participantId: c.participant.id,
                      quantity: c.quantity,
                    })),
                  }}
                  submitLabel="Simpan"
                  onSubmit={(data) => handleEditItem(item.id, data)}
                  onCancel={() => setEditingItemId(null)}
                />
              </div>
            ) : (
              <ItemRow
                key={item.id}
                item={item}
                onEdit={isOwner ? () => { setEditingItemId(item.id); setAddingItem(false) } : undefined}
                onDelete={isOwner ? () => onDeleteItem(item.id) : undefined}
              />
            )
          )}

          {isOwner && (
            <div className="px-4 pb-4 pt-2">
              {addingItem ? (
                <AddItemForm
                  participants={participants}
                  onSubmit={handleAddItem}
                  onCancel={() => setAddingItem(false)}
                />
              ) : (
                !editingItemId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddingItem(true)}
                    className="w-full border border-dashed border-brand-blue/40"
                  >
                    + Tambah Item
                  </Button>
                )
              )}
            </div>
          )}
        </>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Hapus transaksi?"
          description={`"${purchase.title}" dan semua itemnya akan dihapus.`}
          onConfirm={handleDeletePurchase}
          onCancel={() => setConfirmDelete(false)}
          isLoading={deleting}
        />
      )}
    </div>
  )
}
