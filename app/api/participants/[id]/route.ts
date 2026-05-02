import { NextResponse } from 'next/server'
import { renameParticipant, updateParticipantBankInfo, deleteParticipant } from '@/src/services/participant.service'
import { apiError, verifyBillOwnership, getDeviceId, resolveParticipantBillId } from '@/src/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const billId = await resolveParticipantBillId(id)
    if (!billId) return apiError('Participant not found', 404)
    const isOwner = await verifyBillOwnership(billId, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    const body = await request.json()
    const { name, bankName, bankAccount } = body as {
      name?: string
      bankName?: string | null
      bankAccount?: string | null
    }

    if (bankName !== undefined || bankAccount !== undefined) {
      const p = await updateParticipantBankInfo(
        id,
        bankName?.trim() || null,
        bankAccount?.trim() || null,
      )
      return NextResponse.json({ id: p.id, name: p.name, bankName: p.bankName, bankAccount: p.bankAccount })
    }

    if (!name?.trim()) return apiError('name is required', 400, { field: 'name' })
    if (name.trim().length > 100) return apiError('name too long', 400, { field: 'name' })

    const participant = await renameParticipant(id, name)
    return NextResponse.json({ id: participant.id, name: participant.name })
  } catch {
    return apiError('Internal server error', 500)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const billId = await resolveParticipantBillId(id)
    if (!billId) return apiError('Participant not found', 404)
    const isOwner = await verifyBillOwnership(billId, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    await deleteParticipant(id)
    return new NextResponse(null, { status: 204 })
  } catch {
    return apiError('Internal server error', 500)
  }
}
