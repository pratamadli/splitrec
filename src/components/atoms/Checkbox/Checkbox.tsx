'use client'

import { cn } from '@/src/lib/cn'

interface CheckboxProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function Checkbox({ id, label, checked, onChange, className }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn('flex items-center gap-2 cursor-pointer', className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-brand-blue accent-brand-blue cursor-pointer"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}
