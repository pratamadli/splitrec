import { NextResponse } from 'next/server'
import { db } from '@/src/db'
import { events } from '@/src/db/schema'
import { gte, sql } from 'drizzle-orm'

// Protected by CRON_SECRET (same as cleanup endpoint)
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const querySecret = new URL(request.url).searchParams.get('secret')
  const provided = authHeader?.replace('Bearer ', '') ?? querySecret

  if (!process.env.CRON_SECRET || provided !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // All-time totals per event name
  const totalsRaw = await db
    .select({
      eventName: events.eventName,
      count: sql<number>`count(*)::int`,
    })
    .from(events)
    .groupBy(events.eventName)

  // Daily breakdown for last 30 days
  const dailyRaw = await db
    .select({
      date: sql<string>`date_trunc('day', ${events.createdAt})::date::text`,
      eventName: events.eventName,
      count: sql<number>`count(*)::int`,
    })
    .from(events)
    .where(gte(events.createdAt, since30d))
    .groupBy(sql`date_trunc('day', ${events.createdAt})`, events.eventName)
    .orderBy(sql`date_trunc('day', ${events.createdAt})`)

  // Build summary map
  const totals: Record<string, number> = {}
  for (const row of totalsRaw) totals[row.eventName] = row.count

  const billsCreated = totals['bill_created'] ?? 0
  const splitsCompleted = totals['split_completed'] ?? 0
  const completionRate =
    billsCreated > 0 ? Math.round((splitsCompleted / billsCreated) * 100) : 0

  // Pivot daily rows: [{ date, bill_created: n, split_completed: n, ... }]
  const dailyMap: Record<string, Record<string, number>> = {}
  for (const row of dailyRaw) {
    if (!dailyMap[row.date]) dailyMap[row.date] = {}
    dailyMap[row.date][row.eventName] = row.count
  }
  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }))

  return NextResponse.json({
    summary: {
      billsCreated,
      splitsCompleted,
      participantsAdded: totals['participant_added'] ?? 0,
      sharesCopied: totals['share_link_copied'] ?? 0,
      billsViewed: totals['bill_viewed_shared'] ?? 0,
      completionRate,
    },
    last30Days: daily,
  })
}
