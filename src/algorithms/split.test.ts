import { describe, it, expect } from 'vitest'
import { calculateSplit } from './split'

const p = (id: string, name = id) => ({ id, name })

const c = (participantId: string, quantity = 1) => ({ participantId, quantity })

const purchase = (
  id: string,
  paidBy: string,
  totalAmount: number,
  items = [] as { id: string; price: number; quantity: number; consumers: { participantId: string; quantity: number }[] }[]
) => ({ id, paidBy, totalAmount, items })

const item = (
  id: string,
  price: number,
  quantity: number,
  consumers: { participantId: string; quantity: number }[]
) => ({ id, price, quantity, consumers })

describe('calculateSplit — equal mode', () => {
  it('splits evenly among all participants', () => {
    const result = calculateSplit({
      splitMode: 'equal',
      participants: [p('a'), p('b'), p('c')],
      purchases: [purchase('p1', 'a', 90000)],
    })
    expect(result.balances.find(b => b.participantId === 'a')?.paid).toBe(90000)
    expect(result.balances.every(b => b.consumed === 30000)).toBe(true)
    expect(result.debts).toHaveLength(2)
    const total = result.debts.reduce((s, d) => s + d.amount, 0)
    expect(total).toBe(60000)
  })

  it('zero debts when single participant', () => {
    const result = calculateSplit({
      splitMode: 'equal',
      participants: [p('a')],
      purchases: [purchase('p1', 'a', 50000)],
    })
    expect(result.debts).toHaveLength(0)
    expect(result.balances[0].balance).toBe(0)
  })

  it('zero debts when all balances are zero', () => {
    const result = calculateSplit({
      splitMode: 'equal',
      participants: [p('a'), p('b')],
      purchases: [purchase('p1', 'a', 50000), purchase('p2', 'b', 50000)],
    })
    expect(result.debts).toHaveLength(0)
  })
})

describe('calculateSplit — item mode', () => {
  it('assigns item costs to consumers', () => {
    const result = calculateSplit({
      splitMode: 'item',
      participants: [p('a'), p('b')],
      purchases: [
        purchase('p1', 'a', 100000, [
          item('i1', 60000, 1, [c('a')]),
          item('i2', 40000, 1, [c('b')]),
        ]),
      ],
    })
    const ba = result.balances.find(b => b.participantId === 'a')!
    const bb = result.balances.find(b => b.participantId === 'b')!
    expect(ba.consumed).toBe(60000)
    expect(bb.consumed).toBe(40000)
    expect(ba.balance).toBe(40000)
    expect(result.debts[0]).toMatchObject({ fromParticipantId: 'b', toParticipantId: 'a', amount: 40000 })
  })

  it('assigns item to payer when no consumers', () => {
    const result = calculateSplit({
      splitMode: 'item',
      participants: [p('a'), p('b')],
      purchases: [
        purchase('p1', 'a', 50000, [item('i1', 50000, 1, [])]),
      ],
    })
    const ba = result.balances.find(b => b.participantId === 'a')!
    expect(ba.consumed).toBe(50000)
    expect(result.debts).toHaveLength(0)
  })

  it('splits shared item evenly when each consumer has qty 1', () => {
    const result = calculateSplit({
      splitMode: 'item',
      participants: [p('a'), p('b'), p('c')],
      purchases: [
        purchase('p1', 'a', 90000, [item('i1', 30000, 1, [c('a'), c('b'), c('c')])]),
      ],
    })
    expect(result.balances.every(b => b.consumed === 30000)).toBe(true)
  })

  it('handles per-consumer quantity correctly', () => {
    const result = calculateSplit({
      splitMode: 'item',
      participants: [p('a'), p('b')],
      purchases: [
        purchase('p1', 'a', 60000, [item('i1', 30000, 1, [c('a'), c('b')])]),
      ],
    })
    const ba = result.balances.find(b => b.participantId === 'a')!
    const bb = result.balances.find(b => b.participantId === 'b')!
    expect(ba.consumed).toBe(30000)
    expect(bb.consumed).toBe(30000)
  })

  it('handles different per-consumer quantities', () => {
    const result = calculateSplit({
      splitMode: 'item',
      participants: [p('a'), p('b')],
      purchases: [
        purchase('p1', 'a', 90000, [item('i1', 30000, 1, [c('a', 2), c('b', 1)])]),
      ],
    })
    const ba = result.balances.find(b => b.participantId === 'a')!
    const bb = result.balances.find(b => b.participantId === 'b')!
    expect(ba.consumed).toBe(60000)
    expect(bb.consumed).toBe(30000)
  })
})

describe('calculateSplit — debt minimization', () => {
  it('minimizes number of transactions', () => {
    const result = calculateSplit({
      splitMode: 'equal',
      participants: [p('a'), p('b'), p('c')],
      purchases: [purchase('p1', 'a', 90000)],
    })
    expect(result.debts).toHaveLength(2)
    result.debts.forEach(d => {
      expect(d.toParticipantId).toBe('a')
      expect(d.amount).toBe(30000)
    })
  })

  it('chains debts when needed', () => {
    const result = calculateSplit({
      splitMode: 'item',
      participants: [p('a'), p('b'), p('c')],
      purchases: [
        purchase('p1', 'a', 30000, [item('i1', 30000, 1, [c('b')])]),
        purchase('p2', 'b', 30000, [item('i2', 30000, 1, [c('c')])]),
        purchase('p3', 'c', 30000, [item('i3', 30000, 1, [c('a')])]),
      ],
    })
    expect(result.debts).toHaveLength(0)
  })
})
