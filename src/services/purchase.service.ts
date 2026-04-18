import { eq } from 'drizzle-orm'
import { db } from '@/src/db'
import { purchases } from '@/src/db/schema'

export async function addPurchase(
  billId: string,
  title: string,
  paidBy: string,
  totalAmount: number
) {
  const [purchase] = await db
    .insert(purchases)
    .values({ billId, title: title.trim(), paidBy, totalAmount: String(totalAmount) })
    .returning()
  return purchase
}

export async function updatePurchase(
  id: string,
  data: Partial<{ title: string; paidBy: string; totalAmount: number }>
) {
  const set: Record<string, unknown> = {}
  if (data.title !== undefined) set.title = data.title.trim()
  if (data.paidBy !== undefined) set.paidBy = data.paidBy
  if (data.totalAmount !== undefined) set.totalAmount = String(data.totalAmount)
  const [updated] = await db.update(purchases).set(set).where(eq(purchases.id, id)).returning()
  return updated
}

export async function deletePurchase(id: string) {
  await db.delete(purchases).where(eq(purchases.id, id))
}

export async function getPurchaseBillId(purchaseId: string): Promise<string | null> {
  const p = await db.query.purchases.findFirst({
    where: eq(purchases.id, purchaseId),
    columns: { billId: true },
  })
  return p?.billId ?? null
}
