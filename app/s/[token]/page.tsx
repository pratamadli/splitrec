import { notFound } from 'next/navigation'
import { getBillByToken } from '@/src/services/bill.service'
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
  const title = `${raw.title} — Splitrec`
  const description = `Lihat hasil pembagian tagihan "${raw.title}" di Splitrec.`
  return {
    title,
    description,
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
    participants: raw.participants.map((p) => ({ id: p.id, name: p.name })),
    purchases: raw.purchases.map((p) => ({
      id: p.id,
      title: p.title,
      totalAmount: Number(p.totalAmount),
      payer: { id: p.payer.id, name: p.payer.name },
      items: p.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        note: item.note,
        consumers: item.consumers.map((c) => ({
          participant: { id: c.participant.id, name: c.participant.name },
          quantity: c.quantity,
        })),
      })),
    })),
    debts: raw.debts.map((d) => ({
      id: d.id,
      amount: Number(d.amount),
      from: { id: d.from.id, name: d.from.name },
      to: { id: d.to.id, name: d.to.name },
    })),
  }

  return <ShareView bill={bill} />
}
