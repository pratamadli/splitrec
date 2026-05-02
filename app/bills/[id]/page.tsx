'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useBill } from '@/src/hooks/useBill'
import { useBillParticipants } from '@/src/hooks/useBillParticipants'
import { useToast } from '@/src/hooks/useToast'
import { BillEditLayout } from '@/src/components/templates/BillEditLayout'
import { BillHeader } from '@/src/components/organisms/BillHeader'
import { ParticipantList } from '@/src/components/organisms/ParticipantList'
import { StepIndicator } from '@/src/components/molecules/StepIndicator/StepIndicator'
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
  const { toasts, addToast, dismiss } = useToast()

  const isOwner = !!deviceId

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

  const hasTransactions = bill.purchases.length > 0
  const canProceed = bill.participants.length >= 2

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
              currentStep={1}
            />
          ) : undefined
        }
        content={
          <ParticipantList
            participants={bill.participants}
            isOwner={isOwner}
            onAdd={handleAddParticipant}
            onDelete={handleDeleteParticipant}
          />
        }
        footer={
          isOwner ? (
            <div className="flex flex-col gap-2">
              {!canProceed && (
                <p className="text-xs text-center text-brand-gray">
                  Tambah minimal 2 peserta untuk melanjutkan
                </p>
              )}
              <Button
                onClick={() => router.push(`/bills/${id}/transaksi`)}
                disabled={!canProceed}
                className="w-full h-14 text-base font-semibold"
              >
                Lanjut ke Transaksi
              </Button>
            </div>
          ) : undefined
        }
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
