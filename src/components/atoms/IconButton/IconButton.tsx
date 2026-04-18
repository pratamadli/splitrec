'use client'

import { cn } from '@/src/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: 'ghost' | 'danger'
}

export function IconButton({ label, variant = 'ghost', className, children, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        'h-9 w-9 flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:opacity-50',
        variant === 'ghost' && 'text-brand-gray hover:bg-gray-100',
        variant === 'danger' && 'text-destructive hover:bg-destructive/10',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
