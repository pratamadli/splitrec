import { eq } from 'drizzle-orm'
import { db } from '@/src/db'
import { participants, bills } from '@/src/db/schema'

export async function addParticipant(billId: string, name: string) {
  const [participant] = await db
    .insert(participants)
    .values({ billId, name: name.trim() })
    .returning()
  return participant
}

export async function getParticipantsByBill(billId: string) {
  return db.query.participants.findMany({ where: eq(participants.billId, billId) })
}

export async function renameParticipant(id: string, name: string) {
  const [updated] = await db
    .update(participants)
    .set({ name: name.trim() })
    .where(eq(participants.id, id))
    .returning()
  return updated
}

export async function deleteParticipant(id: string) {
  await db.delete(participants).where(eq(participants.id, id))
}

export async function getParticipantBillId(participantId: string): Promise<string | null> {
  const p = await db.query.participants.findFirst({
    where: eq(participants.id, participantId),
    columns: { billId: true },
  })
  return p?.billId ?? null
}
