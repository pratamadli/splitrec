'use client'

import { use } from 'react'
import { useBill } from '@/src/hooks/useBill'
import { useBillParticipants } from '@/src/hooks/useBillParticipants'
import { usePurchase } from '@/src/hooks/usePurchase'
import { useSettlement } from '@/src/hooks/useSettlement'
import { useToast } from '@/src/hooks/useToast'
import { BillEditLayout } from '@/src/components/templates/BillEditLayout'
import { BillHeader } from '@/src/components/organisms/BillHeader'
import { BillSummary } from '@/src/components/organisms/BillSummary'
import { ParticipantList } from '@/src/components/organisms/ParticipantList'
import { PurchaseList } from '@/src/components/organisms/PurchaseList'
import { SettlementResult } from '@/src/components/organisms/SettlementResult'
import { ShareButton } from '@/src/components/molecules/ShareButton'
import { ToastContainer } from '@/src/components/atoms/Toast'
import { Spinner } from '@/src/components/atoms/Spinner'
import { useState } from 'react'
import type { CalculateResult } from '@/src/types/api.types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BillPage({ params }: PageProps) {
  const { id } = use(params)
  const { bill, isLoading, mutate, updateTitle, updateSplitMode, deviceId } = useBill(id)
  const { addParticipant, deleteParticipant } = useBillParticipants(id, mutate)
  const { addPurchase, deletePurchase, addItem, deleteItem } = usePurchase(id, mutate)
  const [calcResult, setCalcResult] = useState<CalculateResult | null>(null)
  const { calculate, isCalculating } = useSettlement(id, mutate)
  const { toasts, addToast, dismiss } = useToast()

  // deviceId is '' during SSR hydration, non-empty once localStorage is read.
  // For /bills/[id], only the creator has this URL — isOwner = deviceId is set.
  // Mutations will 403 server-side if deviceId doesn't match; errors surface via toast.
  const isOwner = !!deviceId

  const handleCalculate = async () => {
    const result = await calculate()
    if (result) {
      setCalcResult(result)
      addToast('Hasil pembagian diperbarui')
    } else {
      addToast('Gagal menghitung. Coba lagi.', 'error')
    }
  }

  const handleAddParticipant = async (name: string) => {
    try {
      await addParticipant(name)
    } catch {
      addToast('Gagal menambah peserta', 'error')
    }
  }

  const handleDeleteParticipant = async (participantId: string) => {
    try {
      await deleteParticipant(participantId)
    } catch {
      addToast('Gagal menghapus peserta', 'error')
    }
  }

  const handleAddPurchase = async (data: { title: string; paidBy: string; totalAmount: number }) => {
    try {
      await addPurchase(data)
    } catch {
      addToast('Gagal menambah transaksi', 'error')
    }
  }

  const handleDeletePurchase = async (purchaseId: string) => {
    try {
      await deletePurchase(purchaseId)
    } catch {
      addToast('Gagal menghapus transaksi', 'error')
    }
  }

  const handleAddItem = async (
    purchaseId: string,
    data: { name: string; price: number; quantity: number; note: string | null; consumerIds: string[] }
  ) => {
    try {
      await addItem(purchaseId, data)
    } catch {
      addToast('Gagal menambah item', 'error')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId)
    } catch {
      addToast('Gagal menghapus item', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Tagihan tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <>
      <BillEditLayout
        header={
          <BillHeader
            bill={bill}
            onUpdateTitle={updateTitle}
            onUpdateSplitMode={updateSplitMode}
            isOwner={isOwner}
          />
        }
        summary={<BillSummary bill={bill} />}
        participants={
          <ParticipantList
            participants={bill.participants}
            isOwner={isOwner}
            onAdd={handleAddParticipant}
            onDelete={handleDeleteParticipant}
          />
        }
        purchases={
          <PurchaseList
            bill={bill}
            isOwner={isOwner}
            onAddPurchase={handleAddPurchase}
            onDeletePurchase={handleDeletePurchase}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
          />
        }
        result={
          <SettlementResult
            bill={bill}
            result={calcResult}
            isCalculating={isCalculating}
            isOwner={isOwner}
            onCalculate={handleCalculate}
          />
        }
      />
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 pb-6">
        <ShareButton shareToken={bill.shareToken} billId={bill.id} />
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
