'use client'

import { useEffect, useState } from 'react'
import { generateDeviceId } from '@/src/lib/device'

export function useDeviceId(): string {
  const [deviceId, setDeviceId] = useState('')

  useEffect(() => {
    setDeviceId(generateDeviceId())
  }, [])

  return deviceId
}
