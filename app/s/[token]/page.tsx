import { notFound } from 'next/navigation'
import { getBillByToken } from '@/src/services/bill.service'
import { logEvent } from '@/src/services/event.service'
import { ShareView } from './ShareView'
import type { BillData } from '@/src/types/bill.types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const raw = await getBillByToken(token)
  if (!raw) return {}
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://splitrec.vercel.app'
  const title = `${raw.title} — Splitrec`
  const description = `Lihat hasil pembagian tagihan "${raw.title}" di Splitrec.`
  return {
    title,
    description,
    alternates: { canonical: `${base}/s/${token}` },
    openGraph: { title, description, images: [{ url: '/logo.png' }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/logo.png'] },
  }
}

export default async function SharePage({ params }: PageProps) {
  const { token } = await params
  const raw = await getBillByToken(token)
  if (!raw) notFound()

  const bill: BillData = {
    id: raw.id,
    title: raw.title,
    shareToken: raw.shareToken,
    splitMode: raw.splitMode as 'equal' | 'item',
    currency: raw.currency,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt),
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : String(raw.updatedAt),
    participants: raw.participants.map((p) => ({ id: p.id, name: p.name, bankName: p.bankName, bankAccount: p.bankAccount })),
    purchases: raw.purchases.map((p) => ({
      id: p.id,
      title: p.title,
      totalAmount: Number(p.totalAmount),
      payer: { id: p.payer.id, name: p.payer.name },
      charges: p.charges ?? null,
      items: p.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        discount: Number(item.discount ?? 0),
        note: item.note,
        consumers: item.consumers.map((c) => ({
          participant: { id: c.participant.id, name: c.participant.name },
          quantity: c.quantity,
        })),
      })),
    })),
    debts: (() => {
      const paidSet = new Set(
        raw.settlements
          .filter((s) => s.status === 'paid')
          .map((s) => `${s.fromParticipantId}:${s.toParticipantId}`)
      )
      return raw.debts.map((d) => ({
        id: d.id,
        amount: Number(d.amount),
        from: { id: d.from.id, name: d.from.name },
        to: { id: d.to.id, name: d.to.name },
        paid: paidSet.has(`${d.fromParticipantId}:${d.toParticipantId}`),
      }))
    })(),
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://splitrec.vercel.app'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${raw.title} — Splitrec`,
    description: `Lihat hasil pembagian tagihan "${raw.title}" di Splitrec.`,
    url: `${base}/s/${token}`,
    isPartOf: { '@type': 'WebSite', name: 'Splitrec', url: base },
  }

  void logEvent(null, 'bill_viewed_shared', { billId: raw.id })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShareView bill={bill} />
    </>
  )
}
