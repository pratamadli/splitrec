import { cn } from '@/src/lib/cn'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'danger'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'success' && 'bg-brand-green/15 text-brand-green',
        variant === 'warning' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        variant === 'info' && 'bg-brand-blue-light/15 text-brand-blue-light',
        variant === 'neutral' && 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
        variant === 'danger' && 'bg-destructive/10 text-destructive',
        className
      )}
    >
      {children}
    </span>
  )
}
