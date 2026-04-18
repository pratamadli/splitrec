'use client'

import { cn } from '@/src/lib/cn'
import { useState } from 'react'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  error?: string
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function CurrencyInput({
  value,
  onChange,
  label,
  error,
  className,
  disabled,
  placeholder = '0',
}: CurrencyInputProps) {
  const [focused, setFocused] = useState(false)

  const display = focused
    ? value === 0 ? '' : String(value)
    : value === 0 ? '' : value.toLocaleString('id-ID')

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div
        className={cn(
          'flex h-11 w-full items-center rounded-lg border border-gray-200 bg-white px-3 gap-2',
          'focus-within:ring-2 focus-within:ring-brand-blue focus-within:border-transparent',
          error && 'border-destructive',
          disabled && 'bg-gray-50',
          className
        )}
      >
        <span className="text-sm text-brand-gray shrink-0">Rp</span>
        <input
          type="number"
          inputMode="numeric"
          value={focused ? (value === 0 ? '' : value) : undefined}
          defaultValue={!focused ? undefined : undefined}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const n = parseFloat(e.target.value)
            onChange(isNaN(n) ? 0 : n)
          }}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
