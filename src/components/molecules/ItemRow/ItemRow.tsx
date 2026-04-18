'use client'

import { IconButton } from '@/src/components/atoms/IconButton'
import { formatIDR } from '@/src/lib/format'
import type { ItemData, ParticipantData } from '@/src/types/bill.types'

interface ItemRowProps {
  item: ItemData
  participants: ParticipantData[]
  onEdit?: () => void
  onDelete?: () => void
}

export function ItemRow({ item, participants, onEdit, onDelete }: ItemRowProps) {
  const consumerNames = item.consumers
    .map((c) => c.participant.name)
    .join(', ') || 'Semua pemesan'

  return (
    <div className="flex items-center gap-3 py-2.5 px-4 border-t border-gray-100">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {item.name} {item.quantity > 1 && <span className="text-brand-gray">×{item.quantity}</span>}
        </p>
        <p className="text-xs text-brand-gray truncate">{consumerNames}</p>
        {item.note && <p className="text-xs text-brand-gray italic">{item.note}</p>}
      </div>
      <p className="text-sm font-medium text-gray-700 shrink-0">
        {formatIDR(item.price * item.quantity)}
      </p>
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
