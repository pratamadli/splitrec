'use client'

import { Logo } from '@/src/components/atoms/Logo'
import { SettlementResult } from '@/src/components/organisms/SettlementResult'
import { ShareButton } from '@/src/components/molecules/ShareButton'
import type { BillData } from '@/src/types/bill.types'

interface ShareViewProps {
  bill: BillData
}

export function ShareView({ bill }: ShareViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
        </div>
        <div className="mt-3">
          <h1 className="text-xl font-semibold text-brand-blue">Hasil Pembagian</h1>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 pb-4">
        <SettlementResult bill={bill} result={null} />
      </div>

      {/* Share button */}
      <div className="px-4 pb-8">
        <ShareButton shareToken={bill.shareToken} billId={bill.id} createdAt={bill.createdAt} />
      </div>
    </div>
  )
}
