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

function formatWithDots(value: number): string {
  if (value === 0) return ''
  return value.toLocaleString('id-ID')
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
  const [rawInput, setRawInput] = useState('')
  const [focused, setFocused] = useState(false)

  const displayValue = focused ? rawInput : formatWithDots(value)

  const handleFocus = () => {
    setFocused(true)
    setRawInput(value === 0 ? '' : String(value))
  }

  const handleBlur = () => {
    setFocused(false)
    const digits = rawInput.replace(/\D/g, '')
    const n = digits ? parseInt(digits, 10) : 0
    onChange(n)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    setRawInput(digits)
    const n = digits ? parseInt(digits, 10) : 0
    onChange(n)
  }

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
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
