'use client'

import { Button } from '@/src/components/atoms/Button'

interface ConfirmDialogProps {
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmDialog({ title, description, onConfirm, onCancel, isLoading }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
        <h3 className="font-semibold text-brand-blue text-lg">{title}</h3>
        <p className="mt-2 text-sm text-brand-gray">{description}</p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} isLoading={isLoading}>
            Hapus
          </Button>
        </div>
      </div>
    </div>
  )
}
