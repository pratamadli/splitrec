'use client'

import { Avatar } from '@/src/components/atoms/Avatar'
import { IconButton } from '@/src/components/atoms/IconButton'
import type { ParticipantData } from '@/src/types/bill.types'

interface ParticipantChipProps {
  participant: ParticipantData
  onDelete?: () => void
}

export function ParticipantChip({ participant, onDelete }: ParticipantChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-gray-100 pl-1 pr-2 py-1">
      <Avatar name={participant.name} size="sm" />
      <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
        {participant.name}
      </span>
      {onDelete && (
        <IconButton label={`Hapus ${participant.name}`} variant="ghost" className="h-5 w-5 text-xs" onClick={onDelete}>
          ✕
        </IconButton>
      )}
    </div>
  )
}
