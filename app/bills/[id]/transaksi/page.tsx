'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useBill } from '@/src/hooks/useBill'
import { usePurchase } from '@/src/hooks/usePurchase'
import { useSettlement } from '@/src/hooks/useSettlement'
import { useToast } from '@/src/hooks/useToast'
import { BillEditLayout } from '@/src/components/templates/BillEditLayout'
import { BillHeader } from '@/src/components/organisms/BillHeader'
import { PurchaseList } from '@/src/components/organisms/PurchaseList'
import { computeItemTotal } from '@/src/components/organisms/PurchaseCard'
import { StepIndicator } from '@/src/components/molecules/StepIndicator/StepIndicator'
import { Button } from '@/src/components/atoms/Button'
import { ToastContainer } from '@/src/components/atoms/Toast'
import { Spinner } from '@/src/components/atoms/Spinner'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BillTransaksiPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { bill, isLoading, mutate, updateTitle, deviceId } = useBill(id)
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
    data: { name: string; price: number; note: string | null; discount: number; consumers: { participantId: string; quantity: number }[] }
  ) => {
    try {
      await addItem(purchaseId, data)
    } catch {
      addToast('Gagal menambah item', 'error')
    }
  }

  const handleEditItem = async (
    itemId: string,
    data: { name: string; price: number; note: string | null; discount: number; consumers: { participantId: string; quantity: number }[] }
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

  const r2 = (n: number) => Math.round(n * 100) / 100
  const hasTransactions = bill.purchases.length > 0
  const allPerItemPurchasesBalanced = bill.purchases.every((purchase) => {
    if (purchase.items.length === 0) return true
    const charges = purchase.charges ?? { tax: 0, serviceCharge: 0, gratuity: 0, discount: 0 }
    const net = r2(computeItemTotal(purchase.items) + charges.tax + charges.serviceCharge + charges.gratuity)
    return net <= r2(purchase.totalAmount) + 0.01
  })

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
        stepIndicator={
          isOwner ? (
            <StepIndicator
              participantCount={bill.participants.length}
              hasTransactions={hasTransactions}
              currentStep={2}
            />
          ) : undefined
        }
        content={
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
        footer={
          isOwner ? (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push(`/bills/${id}`)}
                className="flex-1 h-14 border border-gray-200"
              >
                ← Peserta
              </Button>
              <Button
                onClick={handleCalculate}
                isLoading={isCalculating}
                disabled={!hasTransactions || !allPerItemPurchasesBalanced}
                className="flex-[2] h-14 text-base font-semibold"
              >
                Hitung Pembagian
              </Button>
            </div>
          ) : undefined
        }
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
