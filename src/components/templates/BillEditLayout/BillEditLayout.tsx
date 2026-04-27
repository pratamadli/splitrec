import type { ReactNode } from 'react'

interface BillEditLayoutProps {
  header: ReactNode
  summary: ReactNode
  participants: ReactNode
  purchases: ReactNode
  footer?: ReactNode
}

export function BillEditLayout({ header, summary, participants, purchases, footer }: BillEditLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <div className="sticky top-0 z-10">{header}</div>
      <div className="flex-1 flex flex-col pb-8">
        {summary}
        {participants}
        {purchases}
        {footer && <div className="px-4 pt-2 pb-6">{footer}</div>}
      </div>
    </div>
  )
}
