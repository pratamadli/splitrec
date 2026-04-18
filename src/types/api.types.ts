export interface ApiError {
  error: string
  field?: string
  reason?: string
}

export interface BalanceResult {
  participantId: string
  name: string
  paid: number
  consumed: number
  balance: number
}

export interface DebtResult {
  fromParticipantId: string
  fromName: string
  toParticipantId: string
  toName: string
  amount: number
}

export interface CalculateResult {
  splitMode: 'equal' | 'item'
  balances: BalanceResult[]
  debts: DebtResult[]
}
