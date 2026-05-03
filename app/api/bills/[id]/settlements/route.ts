import { NextResponse } from 'next/server'
import { markSettlement, getBillDeviceId } from '@/src/services/bill.service'
import { apiError } from '@/src/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const billDeviceId = await getBillDeviceId(id)
    if (!billDeviceId) return apiError('Bill not found', 404)

    const body = await request.json()
    const { fromParticipantId, toParticipantId, paid } = body as {
      fromParticipantId?: string
      toParticipantId?: string
      paid?: boolean
    }
    if (!fromParticipantId || !toParticipantId || typeof paid !== 'boolean')
      return apiError('Invalid body', 400)

    await markSettlement(id, fromParticipantId, toParticipantId, paid)
    return NextResponse.json({ ok: true })
  } catch {
    return apiError('Internal server error', 500)
  }
}
