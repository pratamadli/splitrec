import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  subtitle?: string
  cta?: ReactNode
}

export function EmptyState({ title, subtitle, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="text-4xl">📋</div>
      <div>
        <p className="font-semibold text-brand-blue">{title}</p>
        {subtitle && <p className="mt-1 text-sm text-brand-gray">{subtitle}</p>}
      </div>
      {cta}
    </div>
  )
}
