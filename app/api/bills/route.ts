import { NextResponse } from 'next/server'
import { createBill } from '@/src/services/bill.service'
import { logEvent } from '@/src/services/event.service'
import { apiError } from '@/src/lib/api'
import type { SplitMode } from '@/src/types/bill.types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, deviceId, splitMode } = body as {
      title?: string
      deviceId?: string
      splitMode?: SplitMode
    }

    if (!title?.trim()) return apiError('title is required', 400, { field: 'title' })
    if (title.trim().length > 200) return apiError('title too long', 400, { field: 'title' })
    if (!deviceId) return apiError('deviceId is required', 400, { field: 'deviceId' })
    if (splitMode && !['equal', 'item'].includes(splitMode))
      return apiError('invalid splitMode', 400, { field: 'splitMode' })

    const bill = await createBill(title, deviceId, splitMode ?? 'item')
    logEvent(deviceId, 'bill_created', { billId: bill.id, splitMode: bill.splitMode })

    return NextResponse.json(
      {
        id: bill.id,
        title: bill.title,
        shareToken: bill.shareToken,
        splitMode: bill.splitMode,
        createdAt: bill.createdAt,
      },
      { status: 201 }
    )
  } catch {
    return apiError('Internal server error', 500)
  }
}
