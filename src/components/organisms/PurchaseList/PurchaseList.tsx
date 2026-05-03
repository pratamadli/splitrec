'use client'

import { useState, useEffect } from 'react'
import { PurchaseCard } from '@/src/components/organisms/PurchaseCard'
import { Button } from '@/src/components/atoms/Button'
import { Input } from '@/src/components/atoms/Input'
import { CurrencyInput } from '@/src/components/atoms/CurrencyInput'
import { EmptyState } from '@/src/components/atoms/EmptyState'
import { cn } from '@/src/lib/cn'
import { useLang } from '@/src/contexts/LanguageContext'
import type { BillData } from '@/src/types/bill.types'

type ItemConsumer = { participantId: string; quantity: number }
type ItemFormData = { name: string; price: number; note: string | null; discount: number; consumers: ItemConsumer[] }

interface PurchaseListProps {
  bill: BillData
  isOwner: boolean
  onAddPurchase: (data: { title: string; paidBy: string; totalAmount: number }) => Promise<string | undefined>
  onEditPurchase: (purchaseId: string, data: { title?: string; paidBy?: string; totalAmount?: number; charges?: import('@/src/types/bill.types').PurchaseCharges | null }) => Promise<void>
  onDeletePurchase: (id: string) => Promise<void>
  onAddItem: (purchaseId: string, data: ItemFormData) => Promise<void>
  onEditItem: (itemId: string, data: ItemFormData) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
}

type AddStep = 'closed' | 'choose' | 'form'
type AddMode = 'equal' | 'item'

export function PurchaseList({
  bill,
  isOwner,
  onAddPurchase,
  onEditPurchase,
  onDeletePurchase,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: PurchaseListProps) {
  const { t } = useLang()
  const [addStep, setAddStep] = useState<AddStep>('closed')
  const [addMode, setAddMode] = useState<AddMode>('equal')
  const [justAddedItemPurchaseId, setJustAddedItemPurchaseId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [paidBy, setPaidBy] = useState(bill.participants[0]?.id ?? '')
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ids = bill.participants.map((p) => p.id)
    if (!paidBy || !ids.includes(paidBy)) {
      setPaidBy(bill.participants[0]?.id ?? '')
    }
  }, [bill.participants, paidBy])

  const handleChooseMode = (mode: AddMode) => {
    setAddMode(mode)
    setAddStep('form')
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !paidBy || totalAmount <= 0) return
    setLoading(true)
    try {
      const newId = await onAddPurchase({ title, paidBy, totalAmount })
      setTitle('')
      setTotalAmount(0)
      setAddStep('closed')
      if (addMode === 'item' && newId) {
        setJustAddedItemPurchaseId(newId)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setAddStep('closed')
    setTitle('')
    setTotalAmount(0)
  }

  return (
    <section className="px-4 py-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-brand-blue">{t('purchases.title')}</h2>

      {bill.purchases.length === 0 && addStep === 'closed' && isOwner && (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-5 text-center space-y-3">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t('purchases.empty_owner')}</p>
          <p className="text-xs text-brand-gray">{t('purchases.empty_hint')}</p>
        </div>
      )}
      {bill.purchases.length === 0 && addStep === 'closed' && !isOwner && (
        <EmptyState
          title={t('purchases.empty_owner')}
          subtitle={t('purchases.empty_viewer')}
        />
      )}

      {bill.purchases.map((p) => (
        <PurchaseCard
          key={p.id}
          purchase={p}
          participants={bill.participants}
          isOwner={isOwner}
          defaultAddingItem={p.id === justAddedItemPurchaseId}
          onEditPurchase={onEditPurchase}
          onDeletePurchase={onDeletePurchase}
          onAddItem={onAddItem}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      ))}

      {isOwner && (
        addStep === 'choose' ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('purchases.choose_type')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleChooseMode('equal')}
                className="flex flex-col items-center gap-1 p-4 rounded-xl border-2 border-brand-blue/20 bg-white dark:bg-gray-900 text-center hover:border-brand-blue transition-colors"
              >
                <span className="text-2xl">⚖️</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('purchases.equal_split')}</span>
                <span className="text-xs text-brand-gray">{t('purchases.equal_split_desc')}</span>
              </button>
              <button
                onClick={() => handleChooseMode('item')}
                className="flex flex-col items-center gap-1 p-4 rounded-xl border-2 border-brand-blue/20 bg-white dark:bg-gray-900 text-center hover:border-brand-blue transition-colors"
              >
                <span className="text-2xl">🧾</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('purchases.per_item')}</span>
                <span className="text-xs text-brand-gray">{t('purchases.per_item_desc')}</span>
              </button>
            </div>
            <Button type="button" variant="ghost" onClick={handleCancel} className="w-full">
              {t('common.cancel')}
            </Button>
          </div>
        ) : addStep === 'form' ? (
          <form onSubmit={handleAdd} className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            {addMode === 'item' && (
              <div className="flex items-center gap-2 bg-brand-blue/5 rounded-lg px-3 py-2">
                <span className="text-xs">🧾</span>
                <p className="text-xs font-medium text-brand-blue">{t('purchases.per_item_hint')}</p>
              </div>
            )}
            <Input
              label={t('purchases.transaction_name')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('purchases.transaction_placeholder')}
              maxLength={200}
              required
              autoFocus
            />
            <CurrencyInput label={t('purchases.total')} value={totalAmount} onChange={setTotalAmount} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('purchases.paid_by')}</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {bill.participants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={handleCancel} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                disabled={!title.trim() || totalAmount <= 0}
                className={cn('flex-1', addMode === 'item' && 'bg-brand-blue')}
              >
                {addMode === 'item' ? t('purchases.add_and_enter') : t('common.add')}
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            onClick={() => setAddStep('choose')}
            disabled={bill.participants.length === 0}
            className="w-full"
          >
            {t('purchases.add_transaction')}
          </Button>
        )
      )}
    </section>
  )
}
