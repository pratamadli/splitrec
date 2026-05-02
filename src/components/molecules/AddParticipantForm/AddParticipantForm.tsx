'use client'

import { useState } from 'react'
import { Input } from '@/src/components/atoms/Input'
import { Button } from '@/src/components/atoms/Button'

interface AddParticipantFormProps {
  onSubmit: (name: string) => Promise<void>
  isLoading?: boolean
  autoFocus?: boolean
  showHint?: boolean
}

export function AddParticipantForm({ onSubmit, isLoading, autoFocus, showHint }: AddParticipantFormProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(true)
      return
    }
    setError(false)
    await onSubmit(name.trim())
    setName('')
  }

  return (
    <div className="w-full flex flex-col gap-1 my-2">
      <form onSubmit={handleSubmit} className="w-full flex flex-row gap-2 justify-between">
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); if (error) setError(false) }}
          placeholder="Nama Pacrticipant"
          className="w-full"
          maxLength={100}
          disabled={isLoading}
          autoFocus={autoFocus}
        />
        <Button type="submit" isLoading={isLoading} className="w-1/5" >
          Tambah
        </Button>
      </form>
      {error && (
        <p className="text-xs text-destructive mt-0.5">Nama tidak boleh kosong</p>
      )}
      {!error && showHint && (
        <p className="text-xs text-brand-gray mt-0.5">
          Tambah minimal 2 orang untuk mulai split bill
        </p>
      )}
    </div>
  )
}
