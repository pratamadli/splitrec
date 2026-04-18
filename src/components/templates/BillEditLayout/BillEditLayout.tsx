import type { ReactNode } from 'react'

interface BillEditLayoutProps {
  header: ReactNode
  summary: ReactNode
  participants: ReactNode
  purchases: ReactNode
  result: ReactNode
}

export function BillEditLayout({ header, summary, participants, purchases, result }: BillEditLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <div className="sticky top-0 z-10">{header}</div>
      <div className="flex-1 flex flex-col pb-24">
        {summary}
        {participants}
        {purchases}
        {result}
      </div>
    </div>
  )
}
