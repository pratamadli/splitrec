import { db } from '@/src/db'
import { events } from '@/src/db/schema'

export async function logEvent(
  deviceId: string | null,
  eventName: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await db.insert(events).values({ deviceId, eventName, metadata })
  } catch {
    // fire-and-forget — never throws
  }
}
