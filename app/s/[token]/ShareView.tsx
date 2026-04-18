'use client'

import { ShareLayout } from '@/src/components/templates/ShareLayout'
import { BillHeader } from '@/src/components/organisms/BillHeader'
import { SettlementResult } from '@/src/components/organisms/SettlementResult'
import { ShareButton } from '@/src/components/molecules/ShareButton'
import type { BillData } from '@/src/types/bill.types'

interface ShareViewProps {
  bill: BillData
}

export function ShareView({ bill }: ShareViewProps) {
  return (
    <ShareLayout
      header={
        <BillHeader
          bill={bill}
          onUpdateTitle={async () => {}}
          onUpdateSplitMode={async () => {}}
          isOwner={false}
        />
      }
      result={
        <>
          <SettlementResult
            bill={bill}
            result={null}
            isCalculating={false}
            isOwner={false}
            onCalculate={async () => {}}
          />
          <div className="px-4 pb-8">
            <ShareButton shareToken={bill.shareToken} billId={bill.id} />
          </div>
        </>
      }
    />
  )
}
