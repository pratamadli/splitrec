import { eq } from 'drizzle-orm'
import { db } from '@/src/db'
import { items, itemConsumers } from '@/src/db/schema'

export async function addItem(
  purchaseId: string,
  name: string,
  price: number,
  note: string | null,
  consumers: { participantId: string; quantity: number }[]
) {
  const [item] = await db
    .insert(items)
    .values({ purchaseId, name: name.trim(), price: String(price), quantity: 1, note })
    .returning()

  if (consumers.length > 0) {
    await db
      .insert(itemConsumers)
      .values(consumers.map(({ participantId, quantity }) => ({ itemId: item.id, participantId, quantity })))
  }

  return item
}

export async function updateItem(
  id: string,
  data: Partial<{
    name: string
    price: number
    note: string | null
    consumers: { participantId: string; quantity: number }[]
  }>
) {
  const set: Record<string, unknown> = {}
  if (data.name !== undefined) set.name = data.name.trim()
  if (data.price !== undefined) set.price = String(data.price)
  if (data.note !== undefined) set.note = data.note

  if (Object.keys(set).length > 0) {
    await db.update(items).set(set).where(eq(items.id, id))
  }

  if (data.consumers !== undefined) {
    await db.delete(itemConsumers).where(eq(itemConsumers.itemId, id))
    if (data.consumers.length > 0) {
      await db
        .insert(itemConsumers)
        .values(data.consumers.map(({ participantId, quantity }) => ({ itemId: id, participantId, quantity })))
    }
  }

  const [item] = await db.select().from(items).where(eq(items.id, id))
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
