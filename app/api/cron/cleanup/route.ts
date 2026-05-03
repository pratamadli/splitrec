import { NextResponse } from 'next/server'
import { db } from '@/src/db'
import { bills, events } from '@/src/db/schema'
import { lte } from 'drizzle-orm'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // bills cascade-deletes: participants, purchases, items, item_consumers, debts, settlements
  await db.delete(bills).where(lte(bills.createdAt, cutoff))
  await db.delete(events).where(lte(events.createdAt, cutoff))

  return NextResponse.json({ success: true, cutoff: cutoff.toISOString() })
}
