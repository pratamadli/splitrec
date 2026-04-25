'use client'

import { IconButton } from '@/src/components/atoms/IconButton'
import { formatIDR } from '@/src/lib/format'
import type { ItemData } from '@/src/types/bill.types'

interface ItemRowProps {
  item: ItemData
  onEdit?: () => void
  onDelete?: () => void
}

export function ItemRow({ item, onEdit, onDelete }: ItemRowProps) {
  const consumerNames =
    item.consumers.length === 0
      ? 'Semua pemesan'
      : item.consumers
          .map((c) => (c.quantity > 1 ? `${c.participant.name} (${c.quantity}×)` : c.participant.name))
          .join(', ')

  const totalAmount =
    item.consumers.length === 0
      ? item.price * item.quantity
      : item.price * item.consumers.reduce((s, c) => s + c.quantity, 0)

  return (
    <div className="flex items-center gap-3 py-2.5 px-4 border-t border-gray-100">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
        <p className="text-xs text-brand-gray truncate">{consumerNames}</p>
        {item.note && <p className="text-xs text-brand-gray italic">{item.note}</p>}
      </div>
      <p className="text-sm font-medium text-gray-700 shrink-0">{formatIDR(totalAmount)}</p>
      {onEdit && (
        <IconButton label="Edit item" onClick={onEdit}>
          ✏️
        </IconButton>
      )}
      {onDelete && (
        <IconButton label="Hapus item" variant="danger" onClick={onDelete}>
          🗑
        </IconButton>
      )}
    </div>
  )
}
