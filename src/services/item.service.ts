import { eq, inArray } from 'drizzle-orm'
import { db } from '@/src/db'
import { items, itemConsumers, purchases } from '@/src/db/schema'

export async function addItem(
  purchaseId: string,
  name: string,
  price: number,
  quantity: number,
  note: string | null,
  consumerIds: string[]
) {
  const [item] = await db
    .insert(items)
    .values({ purchaseId, name: name.trim(), price: String(price), quantity, note })
    .returning()

  if (consumerIds.length > 0) {
    await db
      .insert(itemConsumers)
      .values(consumerIds.map((participantId) => ({ itemId: item.id, participantId })))
  }

  return item
}

export async function updateItem(
  id: string,
  data: Partial<{
    name: string
    price: number
    quantity: number
    note: string | null
    consumerIds: string[]
  }>
) {
  const set: Record<string, unknown> = {}
  if (data.name !== undefined) set.name = data.name.trim()
  if (data.price !== undefined) set.price = String(data.price)
  if (data.quantity !== undefined) set.quantity = data.quantity
  if (data.note !== undefined) set.note = data.note

  const [item] = await db.update(items).set(set).where(eq(items.id, id)).returning()

  if (data.consumerIds !== undefined) {
    await db.delete(itemConsumers).where(eq(itemConsumers.itemId, id))
    if (data.consumerIds.length > 0) {
      await db
        .insert(itemConsumers)
        .values(data.consumerIds.map((participantId) => ({ itemId: id, participantId })))
    }
  }

  return item
}

export async function deleteItem(id: string) {
  await db.delete(items).where(eq(items.id, id))
}

export async function getItemPurchaseId(itemId: string): Promise<string | null> {
  const item = await db.query.items.findFirst({
    where: eq(items.id, itemId),
    columns: { purchaseId: true },
  })
  return item?.purchaseId ?? null
}
