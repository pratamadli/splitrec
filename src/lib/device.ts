import { v4 as uuidv4 } from 'uuid'

const DEVICE_ID_KEY = 'splitrec_device_id'

export function generateDeviceId(): string {
  if (typeof window === 'undefined') return ''
  const existing = localStorage.getItem(DEVICE_ID_KEY)
  if (existing) return existing
  const id = uuidv4()
  localStorage.setItem(DEVICE_ID_KEY, id)
  return id
}

export function getDeviceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(DEVICE_ID_KEY)
}
