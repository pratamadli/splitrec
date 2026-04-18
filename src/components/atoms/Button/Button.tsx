'use client'

import { cn } from '@/src/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md'
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'md' && 'h-11 px-5 text-sm min-w-[44px]',
        size === 'sm' && 'h-8 px-3 text-xs min-w-[44px]',
        variant === 'primary' && 'bg-brand-blue text-white hover:bg-brand-blue/90',
        variant === 'ghost' && 'bg-transparent text-brand-blue hover:bg-brand-blue/10',
        variant === 'danger' && 'bg-destructive text-white hover:bg-destructive/90',
        variant === 'outline' &&
          'border border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue/5',
        className
      )}
      {...props}
    >
      {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : children}
    </button>
  )
}
