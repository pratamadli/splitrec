import { eq } from 'drizzle-orm'
import { db } from '@/src/db'
import { bills, participants, purchases, items, itemConsumers, debts } from '@/src/db/schema'
import type { SplitMode } from '@/src/types/bill.types'
import { v4 as uuidv4 } from 'uuid'

export async function createBill(title: string, deviceId: string, splitMode: SplitMode = 'item') {
  const shareToken = uuidv4().replace(/-/g, '').slice(0, 12)
  const [bill] = await db
    .insert(bills)
    .values({ title: title.trim(), deviceId, splitMode, shareToken })
    .returning()
  return bill
}

export async function getBillById(id: string) {
  const bill = await db.query.bills.findFirst({
    where: eq(bills.id, id),
    with: {
      participants: true,
      purchases: {
        with: {
          payer: true,
          items: {
            with: {
              consumers: {
                with: { participant: true },
              },
            },
          },
        },
      },
      debts: {
        with: { from: true, to: true },
      },
    },
  })
  return bill ?? null
}

export async function getBillByToken(token: string) {
  const bill = await db.query.bills.findFirst({
    where: eq(bills.shareToken, token),
    with: {
      participants: true,
      purchases: {
        with: {
          payer: true,
          items: {
            with: {
              consumers: {
                with: { participant: true },
              },
            },
          },
        },
      },
      debts: {
        with: { from: true, to: true },
      },
    },
  })
  return bill ?? null
}

export async function updateBill(
  id: string,
  data: Partial<{ title: string; splitMode: SplitMode }>
) {
  const [updated] = await db
    .update(bills)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(bills.id, id))
    .returning()
  return updated
}

export async function deleteBill(id: string) {
  await db.delete(bills).where(eq(bills.id, id))
}

export async function getBillDeviceId(billId: string): Promise<string | null> {
  const bill = await db.query.bills.findFirst({
    where: eq(bills.id, billId),
    columns: { deviceId: true },
  })
  return bill?.deviceId ?? null
}

export async function saveBillDebts(
  billId: string,
  debtList: { fromParticipantId: string; toParticipantId: string; amount: number }[]
) {
  await db.delete(debts).where(eq(debts.billId, billId))
  if (debtList.length > 0) {
    await db.insert(debts).values(
      debtList.map((d) => ({ billId, ...d, amount: String(d.amount) }))
    )
  }
}
