'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
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
import { Button } from '@/src/components/atoms/Button'
import { ToastContainer } from '@/src/components/atoms/Toast'
import { Spinner } from '@/src/components/atoms/Spinner'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BillPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { bill, isLoading, mutate, updateTitle, deviceId } = useBill(id)
  const { addParticipant, deleteParticipant } = useBillParticipants(id, mutate)
  const { addPurchase, updatePurchase, deletePurchase, addItem, updateItem, deleteItem } = usePurchase(id, mutate)
  const { calculate, isCalculating } = useSettlement(id, mutate)
  const { toasts, addToast, dismiss } = useToast()

  const isOwner = !!deviceId

  const handleCalculate = async () => {
    const result = await calculate()
    if (result) {
      router.push(`/bills/${id}/result`)
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

  const handleAddPurchase = async (data: { title: string; paidBy: string; totalAmount: number }): Promise<string | undefined> => {
    try {
      return await addPurchase(data)
    } catch {
      addToast('Gagal menambah transaksi', 'error')
    }
  }

  const handleEditPurchase = async (
    purchaseId: string,
    data: Parameters<typeof updatePurchase>[1]
  ) => {
    try {
      await updatePurchase(purchaseId, data)
    } catch {
      addToast('Gagal mengupdate transaksi', 'error')
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
    data: { name: string; price: number; note: string | null; consumers: { participantId: string; quantity: number }[] }
  ) => {
    try {
      await addItem(purchaseId, data)
    } catch {
      addToast('Gagal menambah item', 'error')
    }
  }

  const handleEditItem = async (
    itemId: string,
    data: { name: string; price: number; note: string | null; consumers: { participantId: string; quantity: number }[] }
  ) => {
    try {
      await updateItem(itemId, data)
    } catch {
      addToast('Gagal mengupdate item', 'error')
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
            onEditPurchase={handleEditPurchase}
            onDeletePurchase={handleDeletePurchase}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        }
      />
      {isOwner && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 pb-6">
          <Button
            onClick={handleCalculate}
            isLoading={isCalculating}
            className="w-full h-14 text-base font-semibold"
          >
            Hitung Pembagian
          </Button>
        </div>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
