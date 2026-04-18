'use client'

import { useState } from 'react'
import { Input } from '@/src/components/atoms/Input'
import { Button } from '@/src/components/atoms/Button'

interface AddParticipantFormProps {
  onSubmit: (name: string) => Promise<void>
  isLoading?: boolean
}

export function AddParticipantForm({ onSubmit, isLoading }: AddParticipantFormProps) {
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSubmit(name.trim())
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama peserta..."
        className="flex-1"
        maxLength={100}
        disabled={isLoading}
      />
      <Button type="submit" isLoading={isLoading} disabled={!name.trim()}>
        Tambah
      </Button>
    </form>
  )
}
