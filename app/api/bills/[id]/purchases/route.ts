import { NextResponse } from 'next/server'
import { addPurchase } from '@/src/services/purchase.service'
import { apiError, verifyBillOwnership, getDeviceId } from '@/src/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const isOwner = await verifyBillOwnership(id, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    const body = await request.json()
    const { title, paidBy, totalAmount } = body as {
      title?: string
      paidBy?: string
      totalAmount?: number
    }

    if (!title?.trim()) return apiError('title is required', 400, { field: 'title' })
    if (!paidBy) return apiError('paidBy is required', 400, { field: 'paidBy' })
    if (totalAmount === undefined || totalAmount <= 0)
      return apiError('totalAmount must be positive', 400, { field: 'totalAmount' })
    if (totalAmount > 999_999_999.99)
      return apiError('totalAmount too large', 400, { field: 'totalAmount' })

    const purchase = await addPurchase(id, title, paidBy, totalAmount)
    return NextResponse.json(
      { id: purchase.id, title: purchase.title, totalAmount: Number(purchase.totalAmount) },
      { status: 201 }
    )
  } catch {
    return apiError('Internal server error', 500)
  }
}
