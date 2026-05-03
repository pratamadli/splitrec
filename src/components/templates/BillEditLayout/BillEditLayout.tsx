import type { ReactNode } from 'react'

interface BillEditLayoutProps {
  header: ReactNode
  stepIndicator?: ReactNode
  content: ReactNode
  footer?: ReactNode
}

export function BillEditLayout({ header, stepIndicator, content, footer }: BillEditLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col max-w-lg mx-auto">
      <div>
        {header}
        {stepIndicator}
      </div>
      <div className="flex-1 flex flex-col pb-8">
        {content}
        {footer && <div className="px-4 pt-2 pb-6">{footer}</div>}
      </div>
    </div>
  )
}
