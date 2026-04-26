import { NextResponse } from 'next/server'
import { updatePurchase, deletePurchase } from '@/src/services/purchase.service'
import { apiError, verifyBillOwnership, getDeviceId, resolvePurchaseBillId } from '@/src/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const billId = await resolvePurchaseBillId(id)
    if (!billId) return apiError('Purchase not found', 404)
    const isOwner = await verifyBillOwnership(billId, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    const body = await request.json()
    const { title, paidBy, totalAmount, charges } = body as {
      title?: string
      paidBy?: string
      totalAmount?: number
      charges?: import('@/src/types/bill.types').PurchaseCharges | null
    }

    if (totalAmount !== undefined && totalAmount <= 0)
      return apiError('totalAmount must be positive', 400, { field: 'totalAmount' })

    const purchase = await updatePurchase(id, { title, paidBy, totalAmount, charges })
    return NextResponse.json({
      id: purchase.id,
      title: purchase.title,
      totalAmount: Number(purchase.totalAmount),
      charges: purchase.charges ?? null,
    })
  } catch {
    return apiError('Internal server error', 500)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const billId = await resolvePurchaseBillId(id)
    if (!billId) return apiError('Purchase not found', 404)
    const isOwner = await verifyBillOwnership(billId, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    await deletePurchase(id)
    return new NextResponse(null, { status: 204 })
  } catch {
    return apiError('Internal server error', 500)
  }
}
