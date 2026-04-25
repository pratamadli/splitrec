export type SplitMode = 'equal' | 'item'

export interface ParticipantData {
  id: string
  name: string
}

export interface ItemData {
  id: string
  name: string
  price: number
  quantity: number
  note: string | null
  consumers: { participant: ParticipantData; quantity: number }[]
}

export interface PurchaseData {
  id: string
  title: string
  totalAmount: number
  payer: ParticipantData
  items: ItemData[]
}

export interface DebtData {
  id: string
  amount: number
  from: ParticipantData
  to: ParticipantData
}

export interface BillData {
  id: string
  title: string
  shareToken: string
  splitMode: SplitMode
  currency: string
  createdAt: string
  updatedAt: string
  participants: ParticipantData[]
  purchases: PurchaseData[]
  debts: DebtData[]
}
