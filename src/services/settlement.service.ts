import { eq } from 'drizzle-orm'
import { db } from '@/src/db'
import { featureFlags } from '@/src/db/schema'

export async function isFeatureEnabled(deviceId: string, feature: string): Promise<boolean> {
  const flag = await db.query.featureFlags.findFirst({
    where: (ff, { and }) =>
      and(eq(ff.deviceId, deviceId), eq(ff.feature, feature)),
  })
  return flag?.enabled ?? false
}
