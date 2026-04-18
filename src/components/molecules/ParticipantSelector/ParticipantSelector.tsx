'use client'

import { Checkbox } from '@/src/components/atoms/Checkbox'
import type { ParticipantData } from '@/src/types/bill.types'

interface ParticipantSelectorProps {
  participants: ParticipantData[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  label?: string
}

export function ParticipantSelector({
  participants,
  selectedIds,
  onChange,
  label = 'Pilih konsumen',
}: ParticipantSelectorProps) {
  const toggle = (id: string, checked: boolean) => {
    onChange(checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id))
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-xs text-brand-gray font-medium">{label}</p>}
      <div className="flex flex-wrap gap-3">
        {participants.map((p) => (
          <Checkbox
            key={p.id}
            id={`consumer-${p.id}`}
            label={p.name}
            checked={selectedIds.includes(p.id)}
            onChange={(checked) => toggle(p.id, checked)}
          />
        ))}
      </div>
    </div>
  )
}
