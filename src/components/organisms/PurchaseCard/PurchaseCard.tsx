'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PurchaseHeader } from '@/src/components/molecules/PurchaseHeader'
import { ItemRow } from '@/src/components/molecules/ItemRow'
import { AddItemForm } from '@/src/components/molecules/AddItemForm'
import { Button } from '@/src/components/atoms/Button'
import { Input } from '@/src/components/atoms/Input'
import { CurrencyInput } from '@/src/components/atoms/CurrencyInput'
import { ConfirmDialog } from '@/src/components/molecules/ConfirmDialog'
import { formatIDR } from '@/src/lib/format'
import { useLang } from '@/src/contexts/LanguageContext'
import type { PurchaseData, ParticipantData, PurchaseCharges } from '@/src/types/bill.types'

type ItemConsumer = { participantId: string; quantity: number }
type ItemFormData = { name: string; price: number; note: string | null; discount: number; consumers: ItemConsumer[] }

interface PurchaseCardProps {
  purchase: PurchaseData
  participants: ParticipantData[]
  isOwner: boolean
  defaultAddingItem?: boolean
  onEditPurchase: (
    purchaseId: string,
    data: { title?: string; paidBy?: string; totalAmount?: number; charges?: PurchaseCharges | null }
  ) => Promise<void>
  onDeletePurchase: (id: string) => Promise<void>
  onAddItem: (purchaseId: string, data: ItemFormData) => Promise<void>
  onEditItem: (itemId: string, data: ItemFormData) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
}

const r2 = (n: number) => Math.round(n * 100) / 100

export function computeItemTotal(items: PurchaseData['items']): number {
  return r2(items.reduce((s, item) => {
    const itemDiscount = item.discount ?? 0
    if (item.consumers.length === 0) {
      return r2(s + r2(item.price * item.quantity - itemDiscount))
    }
    const consumerQtySum = item.consumers.reduce((cq, c) => cq + c.quantity, 0)
    let itemSum = 0
    for (const c of item.consumers) {
      const ds = consumerQtySum > 0 ? r2(itemDiscount * c.quantity / consumerQtySum) : 0
      itemSum = r2(itemSum + r2(item.price * c.quantity - ds))
    }
    return r2(s + itemSum)
  }, 0))
}

const EMPTY_CHARGES: PurchaseCharges = {
  tax: 0,
  serviceCharge: 0,
  gratuity: 0,
  discount: 0,
  discountMode: 'equal',
}

// ─── Charges Panel ────────────────────────────────────────────────────────────

interface ChargesPanelProps {
  purchase: PurchaseData
  isOwner: boolean
  onSave: (charges: PurchaseCharges) => Promise<void>
}

function ChargesPanel({ purchase, isOwner, onSave }: ChargesPanelProps) {
  const { t } = useLang()
  const [charges, setCharges] = useState<PurchaseCharges>(
    purchase.charges ?? { ...EMPTY_CHARGES }
  )
  const [saving, setSaving] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSaveRef = useRef(onSave)
  useEffect(() => { onSaveRef.current = onSave })

  useEffect(() => {
    setCharges(purchase.charges ?? { ...EMPTY_CHARGES })
  }, [purchase.charges])

  const itemTotal = computeItemTotal(purchase.items)
  const others = Math.max(
    0,
    r2(purchase.totalAmount + charges.discount - itemTotal - charges.tax - charges.serviceCharge - charges.gratuity)
  )

  const scheduleAutoSave = useCallback((next: PurchaseCharges) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true)
      try { await onSaveRef.current(next) } finally { setSaving(false) }
    }, 800)
  }, [])

  const update = (key: keyof Omit<PurchaseCharges, 'discountMode'>, value: number) => {
    const next = { ...charges, [key]: value }
    setCharges(next)
    scheduleAutoSave(next)
  }

  const hasAnyCharge =
    purchase.charges &&
    (purchase.charges.tax > 0 ||
      purchase.charges.serviceCharge > 0 ||
      purchase.charges.gratuity > 0 ||
      purchase.charges.discount > 0)

  if (!isOwner) {
    if (!hasAnyCharge) return null
    const savedCharges = purchase.charges!
    const savedItemTotal = computeItemTotal(purchase.items)
    const savedOthers = Math.max(
      0,
      r2(purchase.totalAmount + savedCharges.discount - savedItemTotal - savedCharges.tax - savedCharges.serviceCharge - savedCharges.gratuity)
    )
    return (
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col gap-1">
        <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide mb-1">{t('charges.additional')}</p>
        {savedCharges.tax > 0 && <ChargesRow label={t('charges.tax')} value={savedCharges.tax} />}
        {savedCharges.serviceCharge > 0 && <ChargesRow label={t('charges.service_charge')} value={savedCharges.serviceCharge} />}
        {savedCharges.gratuity > 0 && <ChargesRow label={t('charges.gratuity')} value={savedCharges.gratuity} />}
        {savedOthers > 0 && <ChargesRow label={t('charges.others')} value={savedOthers} />}
        {savedCharges.discount > 0 && <ChargesRow label={t('charges.discount')} value={-savedCharges.discount} />}
      </div>
    )
  }

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50/30 dark:bg-gray-800/20">
      <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide mb-1">
        {t('charges.additional')}
        {saving && <span className="ml-2 text-xs font-normal text-brand-gray/60">{t('charges.saving')}</span>}
      </p>
      <div className="flex flex-col gap-2 mt-2">
        <CurrencyInput label={t('charges.tax')} value={charges.tax} onChange={(v) => update('tax', v)} />
        <CurrencyInput label={t('charges.service_charge')} value={charges.serviceCharge} onChange={(v) => update('serviceCharge', v)} />
        <CurrencyInput label={t('charges.gratuity')} value={charges.gratuity} onChange={(v) => update('gratuity', v)} />

        <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 dark:border-gray-700 px-3 py-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('charges.others')}</span>
          <span className="text-sm font-semibold text-brand-blue">{formatIDR(others)}</span>
        </div>

        <CurrencyInput label={t('charges.discount')} value={charges.discount} onChange={(v) => update('discount', v)} />

        {others === 0 && r2(itemTotal + charges.tax + charges.serviceCharge + charges.gratuity - charges.discount) > r2(purchase.totalAmount) + 0.01 && (
          <p className="text-xs text-red-500 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 px-3 py-2">
            {t('charges.unbalanced')}
          </p>
        )}
      </div>
    </div>
  )
}

function ChargesRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={value < 0 ? 'text-brand-green font-medium' : 'text-gray-700 dark:text-gray-200'}>{formatIDR(Math.abs(value))}{value < 0 ? ' off' : ''}</span>
    </div>
  )
}

// ─── PurchaseCard ─────────────────────────────────────────────────────────────

export function PurchaseCard({
  purchase,
  participants,
  isOwner,
  defaultAddingItem = false,
  onEditPurchase,
  onDeletePurchase,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: PurchaseCardProps) {
  const { t } = useLang()
  const [addingItem, setAddingItem] = useState(defaultAddingItem)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(purchase.title)
  const [editPaidBy, setEditPaidBy] = useState(purchase.payer.id)
  const [editTotalAmount, setEditTotalAmount] = useState(purchase.totalAmount)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (defaultAddingItem) setAddingItem(true)
  }, [defaultAddingItem])

  const isPerItem = purchase.items.length > 0 || defaultAddingItem

  const handleStartEdit = () => {
    setEditTitle(purchase.title)
    setEditPaidBy(purchase.payer.id)
    setEditTotalAmount(purchase.totalAmount)
    setIsEditing(true)
  }

  const handleSaveEdit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editTitle.trim() || editTotalAmount <= 0) return
    setSaving(true)
    try {
      await onEditPurchase(purchase.id, {
        title: editTitle,
        paidBy: editPaidBy,
        totalAmount: editTotalAmount,
      })
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCharges = async (charges: PurchaseCharges) => {
    await onEditPurchase(purchase.id, { charges })
  }

  const handleDeletePurchase = async () => {
    setDeleting(true)
    try { await onDeletePurchase(purchase.id) } finally { setDeleting(false) }
  }

  const handleAddItem = async (data: ItemFormData) => {
    await onAddItem(purchase.id, data)
    setAddingItem(false)
  }

  const handleEditItem = async (itemId: string, data: ItemFormData) => {
    await onEditItem(itemId, data)
    setEditingItemId(null)
  }

  const showItemsSection = purchase.items.length > 0 || (defaultAddingItem && isOwner)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 p-4">
          <Input
            label={t('purchases.transaction_name')}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            maxLength={200}
            required
            autoFocus
          />
          <CurrencyInput label={t('purchases.total')} value={editTotalAmount} onChange={setEditTotalAmount} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('purchases.paid_by')}</label>
            <select
              value={editPaidBy}
              onChange={(e) => setEditPaidBy(e.target.value)}
              className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {participants.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={saving}
              disabled={!editTitle.trim() || editTotalAmount <= 0}
              className="flex-1"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      ) : (
        <PurchaseHeader
          purchase={purchase}
          payer={purchase.payer}
          badge={isPerItem ? t('purchases.per_item') : t('purchases.equal_split')}
          onEdit={isOwner ? handleStartEdit : undefined}
          onDelete={isOwner ? () => setConfirmDelete(true) : undefined}
        />
      )}

      {!isEditing && showItemsSection && (
        <>
          {purchase.items.map((item) =>
            isOwner && editingItemId === item.id ? (
              <div key={item.id} className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                <AddItemForm
                  participants={participants}
                  initialValues={{
                    name: item.name,
                    price: item.price,
                    note: item.note ?? '',
                    discount: item.discount ?? 0,
                    consumers: item.consumers.map((c) => ({
                      participantId: c.participant.id,
                      quantity: c.quantity,
                    })),
                  }}
                  submitLabel={t('common.save')}
                  onSubmit={(data) => handleEditItem(item.id, data)}
                  onCancel={() => setEditingItemId(null)}
                />
              </div>
            ) : (
              <ItemRow
                key={item.id}
                item={item}
                onEdit={isOwner ? () => { setEditingItemId(item.id); setAddingItem(false) } : undefined}
                onDelete={isOwner ? () => onDeleteItem(item.id) : undefined}
              />
            )
          )}

          {isOwner && (
            <div className="px-4 pb-3 pt-2">
              {addingItem ? (
                <AddItemForm
                  participants={participants}
                  onSubmit={handleAddItem}
                  onCancel={() => setAddingItem(false)}
                />
              ) : (
                !editingItemId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddingItem(true)}
                    className="w-full border border-dashed border-brand-blue/40"
                  >
                    {t('items.add_item')}
                  </Button>
                )
              )}
            </div>
          )}
        </>
      )}

      {!isEditing && purchase.items.length > 0 && (
        <ChargesPanel
          purchase={purchase}
          isOwner={isOwner}
          onSave={handleSaveCharges}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={t('purchases.confirm_delete_title')}
          description={t('purchases.confirm_delete_desc', { title: purchase.title })}
          onConfirm={handleDeletePurchase}
          onCancel={() => setConfirmDelete(false)}
          isLoading={deleting}
        />
      )}
    </div>
  )
}
