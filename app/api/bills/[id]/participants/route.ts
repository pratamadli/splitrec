import { NextResponse } from 'next/server'
import { addParticipant, getParticipantsByBill } from '@/src/services/participant.service'
import { logEvent } from '@/src/services/event.service'
import { apiError, verifyBillOwnership, getDeviceId } from '@/src/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const list = await getParticipantsByBill(id)
    return NextResponse.json(list.map((p) => ({ id: p.id, name: p.name })))
  } catch {
    return apiError('Internal server error', 500)
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const isOwner = await verifyBillOwnership(id, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    const body = await request.json()
    const { name } = body as { name?: string }
    if (!name?.trim()) return apiError('name is required', 400, { field: 'name' })
    if (name.trim().length > 100) return apiError('name too long', 400, { field: 'name' })

    const participant = await addParticipant(id, name)
    const all = await getParticipantsByBill(id)
    logEvent(deviceId, 'participant_added', { billId: id, participantCount: all.length })

    return NextResponse.json({ id: participant.id, name: participant.name }, { status: 201 })
  } catch {
    return apiError('Internal server error', 500)
  }
}
