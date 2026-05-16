import { NextResponse } from 'next/server'
import { logEvent } from '@/src/services/event.service'
import { apiError } from '@/src/lib/api'

// Allowlist agar hanya event dari client yang valid bisa masuk
const ALLOWED_EVENTS = ['share_link_copied', 'bill_viewed_shared'] as const
type AllowedEvent = (typeof ALLOWED_EVENTS)[number]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { deviceId, eventName, metadata } = body as {
      deviceId?: string
      eventName?: string
      metadata?: Record<string, unknown>
    }

    if (!eventName || !(ALLOWED_EVENTS as readonly string[]).includes(eventName)) {
      return apiError('invalid eventName', 400, { field: 'eventName' })
    }

    void logEvent(deviceId ?? null, eventName as AllowedEvent, metadata)
    return NextResponse.json({ ok: true })
  } catch {
    return apiError('Internal server error', 500)
  }
}
