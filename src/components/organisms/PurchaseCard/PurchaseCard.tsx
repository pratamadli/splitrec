'use client'

import { useState } from 'react'
import { PurchaseHeader } from '@/src/components/molecules/PurchaseHeader'
import { ItemRow } from '@/src/components/molecules/ItemRow'
import { AddItemForm } from '@/src/components/molecules/AddItemForm'
import { Button } from '@/src/components/atoms/Button'
import { ConfirmDialog } from '@/src/components/molecules/ConfirmDialog'
import type { PurchaseData, ParticipantData } from '@/src/types/bill.types'

interface PurchaseCardProps {
  purchase: PurchaseData
  participants: ParticipantData[]
  isOwner: boolean
  splitMode: 'equal' | 'item'
  onDeletePurchase: (id: string) => Promise<void>
  onAddItem: (
    purchaseId: string,
    data: { name: string; price: number; quantity: number; note: string | null; consumerIds: string[] }
  ) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
}

export function PurchaseCard({
  purchase,
  participants,
  isOwner,
  splitMode,
  onDeletePurchase,
  onAddItem,
  onDeleteItem,
}: PurchaseCardProps) {
  const [addingItem, setAddingItem] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDeletePurchase = async () => {
    setDeleting(true)
    try { await onDeletePurchase(purchase.id) } finally { setDeleting(false) }
  }

  const handleAddItem = async (data: {
    name: string; price: number; quantity: number; note: string | null; consumerIds: string[]
  }) => {
    await onAddItem(purchase.id, data)
    setAddingItem(false)
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
          {purchase.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              participants={participants}
              onDelete={isOwner ? () => onDeleteItem(item.id) : undefined}
            />
          ))}

          {isOwner && (
            <div className="px-4 pb-4 pt-2">
              {addingItem ? (
                <AddItemForm
                  participants={participants}
                  onSubmit={handleAddItem}
                  onCancel={() => setAddingItem(false)}
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingItem(true)}
                  className="w-full border border-dashed border-brand-blue/40"
                >
                  + Tambah Item
                </Button>
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
