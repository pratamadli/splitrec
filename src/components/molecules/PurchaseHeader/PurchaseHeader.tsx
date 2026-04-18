'use client'

import { Avatar } from '@/src/components/atoms/Avatar'
import { IconButton } from '@/src/components/atoms/IconButton'
import { formatIDR } from '@/src/lib/format'

interface PurchaseHeaderProps {
  purchase: { id: string; title: string; totalAmount: number }
  payer: { id: string; name: string }
  onEdit?: () => void
  onDelete?: () => void
}

export function PurchaseHeader({ purchase, payer, onEdit, onDelete }: PurchaseHeaderProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Avatar name={payer.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-brand-blue truncate">{purchase.title}</p>
        <p className="text-xs text-brand-gray">Dibayar {payer.name}</p>
      </div>
      <p className="font-semibold text-gray-800 shrink-0 text-sm">{formatIDR(purchase.totalAmount)}</p>
      {onEdit && (
        <IconButton label="Edit" onClick={onEdit}>
          ✏️
        </IconButton>
      )}
      {onDelete && (
        <IconButton label="Hapus" variant="danger" onClick={onDelete}>
          🗑
        </IconButton>
      )}
    </div>
  )
}
