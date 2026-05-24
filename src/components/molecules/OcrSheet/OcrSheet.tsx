'use client'

import { useState, useRef, useCallback } from 'react'
import { useOcr } from '@/src/hooks/useOcr'
import { parseReceipt } from '@/src/lib/receipt-parser'
import { Button } from '@/src/components/atoms/Button'
import { Input } from '@/src/components/atoms/Input'
import { Spinner } from '@/src/components/atoms/Spinner'
import { formatIDR } from '@/src/lib/format'
import { useLang } from '@/src/contexts/LanguageContext'
import type { ParticipantData, PurchaseCharges } from '@/src/types/bill.types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OcrItem {
  name: string
  price: number
  consumers: { participantId: string; quantity: number }[]
}

export interface OcrSubmitData {
  title: string
  paidBy: string
  totalAmount: number
  charges: PurchaseCharges | null
  items: { name: string; price: number; consumers: { participantId: string; quantity: number }[] }[]
}

interface OcrSheetProps {
  mode: 'equal' | 'item'
  participants: ParticipantData[]
  onSubmit: (data: OcrSubmitData) => Promise<void>
  onCancel: () => void
}

type Phase = 'upload' | 'processing' | 'review'

const r2 = (n: number) => Math.round(n * 100) / 100

function formatNum(n: number): string {
  return n === 0 ? '' : n.toLocaleString('id-ID')
}

function parseNum(s: string): number {
  const digits = s.replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

// ─── OcrSheet ─────────────────────────────────────────────────────────────────

export function OcrSheet({ mode, participants, onSubmit, onCancel }: OcrSheetProps) {
  const { t } = useLang()
  const { recognize, progress } = useOcr()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('upload')
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [items, setItems] = useState<OcrItem[]>([])
  const [charges, setCharges] = useState({ tax: 0, serviceCharge: 0, gratuity: 0, discount: 0 })
  const [title, setTitle] = useState('')
  const [paidBy, setPaidBy] = useState(participants[0]?.id ?? '')
  const [submitting, setSubmitting] = useState(false)

  const blankConsumers = () => participants.map((p) => ({ participantId: p.id, quantity: 0 }))

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset so the same file can be re-selected after an error
    e.target.value = ''

    setPhase('processing')
    setOcrError(null)
    try {
      const text = await recognize(file)
      const parsed = parseReceipt(text)
      setItems(parsed.items.map((item) => ({ ...item, consumers: blankConsumers() })))
      setCharges(parsed.charges)
      setPhase('review')
    } catch {
      setOcrError(t('ocr.error'))
      setPhase('upload')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognize, participants, t])

  const updateItemField = (idx: number, field: 'name', value: string) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))

  const updateItemPrice = (idx: number, raw: string) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, price: parseNum(raw) } : item)))

  const updateConsumerQty = (itemIdx: number, participantId: string, raw: string) => {
    const qty = Math.max(0, parseInt(raw.replace(/\D/g, '') || '0', 10))
    setItems((prev) =>
      prev.map((item, i) =>
        i !== itemIdx
          ? item
          : { ...item, consumers: item.consumers.map((c) => c.participantId === participantId ? { ...c, quantity: qty } : c) }
      )
    )
  }

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const addBlankItem = () =>
    setItems((prev) => [...prev, { name: '', price: 0, consumers: blankConsumers() }])

  const validItems = items.filter((i) => i.name.trim() && i.price > 0)
  const itemsTotal = r2(validItems.reduce((s, i) => s + i.price, 0))
  const chargesNet = r2(charges.tax + charges.serviceCharge + charges.gratuity - charges.discount)
  const grandTotal = r2(itemsTotal + chargesNet)
  const hasCharges = charges.tax > 0 || charges.serviceCharge > 0 || charges.gratuity > 0 || charges.discount > 0

  const allConsumersAssigned =
    mode === 'equal' || validItems.every((i) => i.consumers.some((c) => c.quantity > 0))
  const canSubmit = title.trim() !== '' && grandTotal > 0 && allConsumersAssigned

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const chargesPayload: PurchaseCharges | null = hasCharges
        ? { tax: charges.tax, serviceCharge: charges.serviceCharge, gratuity: charges.gratuity, discount: charges.discount, discountMode: 'equal' }
        : null

      if (mode === 'equal') {
        await onSubmit({ title, paidBy, totalAmount: grandTotal, charges: null, items: [] })
      } else {
        await onSubmit({
          title,
          paidBy,
          totalAmount: grandTotal,
          charges: chargesPayload,
          items: validItems.map((item) => ({
            name: item.name,
            price: item.price,
            consumers: item.consumers.filter((c) => c.quantity > 0),
          })),
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Upload phase ──────────────────────────────────────────────────────────

  if (phase === 'upload') {
    return (
      <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="text-sm text-brand-gray hover:text-brand-blue transition-colors"
          >
            {t('ocr.back')}
          </button>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('ocr.title')}</p>
        </div>

        {ocrError && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2">
            {ocrError}
          </p>
        )}

        <div
          role="button"
          tabIndex={0}
          className="flex flex-col items-center gap-3 border-2 border-dashed border-brand-blue/30 rounded-xl p-8 cursor-pointer hover:border-brand-blue/60 hover:bg-brand-blue/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <span className="text-5xl">📷</span>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('ocr.upload_prompt')}</p>
            <p className="text-xs text-brand-gray mt-1">{t('ocr.upload_hint')}</p>
          </div>
        </div>

        {/* capture="environment" opens rear camera on mobile */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleFileChange}
        />

        <Button variant="ghost" onClick={onCancel} className="w-full">
          {t('common.cancel')}
        </Button>
      </div>
    )
  }

  // ─── Processing phase ──────────────────────────────────────────────────────

  if (phase === 'processing') {
    return (
      <div className="flex flex-col items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-2xl p-10">
        <Spinner size="md" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('ocr.processing')}</p>
        {progress > 0 && (
          <div className="w-full flex flex-col gap-1.5">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-brand-blue h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-brand-gray text-right">{progress}%</p>
          </div>
        )}
      </div>
    )
  }

  // ─── Review phase ──────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPhase('upload')}
          className="text-sm text-brand-gray hover:text-brand-blue transition-colors"
        >
          {t('ocr.back')}
        </button>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('ocr.review_title')}</p>
      </div>

      {/* Purchase metadata */}
      <Input
        label={t('purchases.transaction_name')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('purchases.transaction_placeholder')}
        maxLength={200}
        required
        autoFocus
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('purchases.paid_by')}
        </label>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide">
          {t('ocr.items_detected', { count: String(items.length) })}
        </p>

        {items.length === 0 && (
          <p className="text-xs text-brand-gray bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 rounded-lg px-3 py-2">
            {t('ocr.no_items')}
          </p>
        )}

        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex flex-col gap-2"
          >
            {/* Name + price + delete */}
            <div className="flex items-center gap-2">
              <input
                className="flex-1 min-w-0 text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                value={item.name}
                onChange={(e) => updateItemField(idx, 'name', e.target.value)}
                placeholder={t('ocr.item_name_placeholder')}
              />
              <input
                type="text"
                inputMode="numeric"
                className="w-28 text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue text-right"
                value={formatNum(item.price)}
                onChange={(e) => updateItemPrice(idx, e.target.value)}
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
                aria-label={t('common.delete')}
              >
                ✕
              </button>
            </div>

            {/* Consumer selection + qty — per-item mode only */}
            {mode === 'item' && (
              <div className="flex flex-wrap gap-1.5 items-center">
                {/* Only show selected participants */}
                {item.consumers.filter((c) => c.quantity > 0).map((c) => {
                  const p = participants.find((p) => p.id === c.participantId)
                  if (!p) return null
                  return (
                    <div key={c.participantId} className="flex items-center rounded-full border border-brand-blue bg-brand-blue text-white text-xs">
                      <span className="pl-2.5 pr-1 py-1">{p.name}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={String(c.quantity)}
                        onChange={(e) => updateConsumerQty(idx, c.participantId, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 text-center bg-white/20 border-l border-white/30 py-1 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateConsumerQty(idx, c.participantId, '0')}
                        className="px-1.5 py-1 hover:bg-white/20 rounded-r-full transition-colors"
                        aria-label="Hapus"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}

                {/* Dropdown to add unselected participant */}
                {item.consumers.some((c) => c.quantity === 0) && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) updateConsumerQty(idx, e.target.value, '1')
                    }}
                    className="text-xs border border-dashed border-brand-blue/50 rounded-full px-2.5 py-1 bg-white dark:bg-gray-800 text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
                  >
                    <option value="">{t('ocr.add_consumer')}</option>
                    {item.consumers.filter((c) => c.quantity === 0).map((c) => {
                      const p = participants.find((p) => p.id === c.participantId)
                      return p ? <option key={p.id} value={p.id}>{p.name}</option> : null
                    })}
                  </select>
                )}
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addBlankItem}
          className="text-xs text-brand-blue border border-dashed border-brand-blue/40 rounded-lg px-3 py-2 hover:border-brand-blue/70 hover:bg-brand-blue/5 transition-colors"
        >
          {t('ocr.add_item_manual')}
        </button>
      </div>

      {/* Detected charges (editable) */}
      {hasCharges && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide">
            {t('ocr.charges_detected')}
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex flex-col gap-2">
            {charges.tax > 0 && (
              <ChargeRow label={t('charges.tax')} value={charges.tax} onChange={(v) => setCharges((c) => ({ ...c, tax: v }))} />
            )}
            {charges.serviceCharge > 0 && (
              <ChargeRow label={t('charges.service_charge')} value={charges.serviceCharge} onChange={(v) => setCharges((c) => ({ ...c, serviceCharge: v }))} />
            )}
            {charges.gratuity > 0 && (
              <ChargeRow label={t('charges.gratuity')} value={charges.gratuity} onChange={(v) => setCharges((c) => ({ ...c, gratuity: v }))} />
            )}
            {charges.discount > 0 && (
              <ChargeRow label={t('charges.discount')} value={charges.discount} onChange={(v) => setCharges((c) => ({ ...c, discount: v }))} />
            )}
          </div>
        </div>
      )}

      {/* Grand total */}
      <div className="flex items-center justify-between px-1 py-1 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Total</span>
        <span className="text-lg font-bold text-brand-blue">{formatIDR(grandTotal)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={submitting}
          disabled={!canSubmit}
          className="flex-1"
        >
          {t('ocr.save_items', { count: String(validItems.length) })}
        </Button>
      </div>
    </div>
  )
}

// ─── ChargeRow ─────────────────────────────────────────────────────────────────

function ChargeRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        className="w-28 text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue text-right"
        value={value === 0 ? '' : value.toLocaleString('id-ID')}
        onChange={(e) => onChange(parseNum(e.target.value))}
      />
    </div>
  )
}
