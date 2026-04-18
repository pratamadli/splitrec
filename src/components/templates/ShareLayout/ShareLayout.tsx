import type { ReactNode } from 'react'

interface ShareLayoutProps {
  header: ReactNode
  result: ReactNode
}

export function ShareLayout({ header, result }: ShareLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto pb-12">
      <div className="sticky top-0 z-10">{header}</div>
      {result}
    </div>
  )
}
