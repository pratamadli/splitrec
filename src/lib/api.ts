import { NextResponse } from 'next/server'
import { getBillDeviceId } from '@/src/services/bill.service'
import { getParticipantBillId } from '@/src/services/participant.service'
import { getPurchaseBillId } from '@/src/services/purchase.service'
import { getItemPurchaseId } from '@/src/services/item.service'

export function apiError(message: string, status: number, extra?: object) {
  return NextResponse.json({ error: message, ...extra }, { status })
}

export async function verifyBillOwnership(
  billId: string,
  deviceId: string | null
): Promise<boolean> {
  if (!deviceId) return false
  const stored = await getBillDeviceId(billId)
  return stored === deviceId
}

export async function resolveParticipantBillId(participantId: string): Promise<string | null> {
  return getParticipantBillId(participantId)
}

export async function resolvePurchaseBillId(purchaseId: string): Promise<string | null> {
  return getPurchaseBillId(purchaseId)
}

export async function resolveItemBillId(itemId: string): Promise<string | null> {
  const purchaseId = await getItemPurchaseId(itemId)
  if (!purchaseId) return null
  return getPurchaseBillId(purchaseId)
}

export function getDeviceId(request: Request): string | null {
  return request.headers.get('x-device-id')
}
