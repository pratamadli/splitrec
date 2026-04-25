import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const bills = pgTable(
  'bills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    shareToken: text('share_token').notNull().unique(),
    deviceId: text('device_id').notNull(),
    splitMode: text('split_mode').notNull().default('item'),
    currency: text('currency').notNull().default('IDR'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('bills_share_token_idx').on(t.shareToken)]
)

export const participants = pgTable(
  'participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    billId: uuid('bill_id')
      .notNull()
      .references(() => bills.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
  },
  (t) => [index('participants_bill_id_idx').on(t.billId)]
)

export const purchases = pgTable(
  'purchases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    billId: uuid('bill_id')
      .notNull()
      .references(() => bills.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    paidBy: uuid('paid_by')
      .notNull()
      .references(() => participants.id, { onDelete: 'cascade' }),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  },
  (t) => [index('purchases_bill_id_idx').on(t.billId)]
)

export const items = pgTable(
  'items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    purchaseId: uuid('purchase_id')
      .notNull()
      .references(() => purchases.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    price: numeric('price', { precision: 15, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull().default(1),
    note: text('note'),
  },
  (t) => [index('items_purchase_id_idx').on(t.purchaseId)]
)

export const itemConsumers = pgTable(
  'item_consumers',
  {
    itemId: uuid('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    participantId: uuid('participant_id')
      .notNull()
      .references(() => participants.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.participantId] })]
)

export const debts = pgTable('debts', {
  id: uuid('id').primaryKey().defaultRandom(),
  billId: uuid('bill_id')
    .notNull()
    .references(() => bills.id, { onDelete: 'cascade' }),
  fromParticipantId: uuid('from_participant_id')
    .notNull()
    .references(() => participants.id, { onDelete: 'cascade' }),
  toParticipantId: uuid('to_participant_id')
    .notNull()
    .references(() => participants.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
})

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deviceId: text('device_id'),
    eventName: text('event_name').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('events_event_name_idx').on(t.eventName),
    index('events_device_id_idx').on(t.deviceId),
  ]
)

export const featureFlags = pgTable(
  'feature_flags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deviceId: text('device_id').notNull(),
    feature: text('feature').notNull(),
    enabled: boolean('enabled').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('feature_flags_device_feature_idx').on(t.deviceId, t.feature)]
)

export const settlements = pgTable('settlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  billId: uuid('bill_id')
    .notNull()
    .references(() => bills.id, { onDelete: 'cascade' }),
  fromParticipantId: uuid('from_participant_id')
    .notNull()
    .references(() => participants.id, { onDelete: 'cascade' }),
  toParticipantId: uuid('to_participant_id')
    .notNull()
    .references(() => participants.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// Relations
export const billsRelations = relations(bills, ({ many }) => ({
  participants: many(participants),
  purchases: many(purchases),
  debts: many(debts),
  settlements: many(settlements),
}))

export const participantsRelations = relations(participants, ({ one, many }) => ({
  bill: one(bills, { fields: [participants.billId], references: [bills.id] }),
  itemConsumers: many(itemConsumers),
}))

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  bill: one(bills, { fields: [purchases.billId], references: [bills.id] }),
  payer: one(participants, { fields: [purchases.paidBy], references: [participants.id] }),
  items: many(items),
}))

export const itemsRelations = relations(items, ({ one, many }) => ({
  purchase: one(purchases, { fields: [items.purchaseId], references: [purchases.id] }),
  consumers: many(itemConsumers),
}))

export const itemConsumersRelations = relations(itemConsumers, ({ one }) => ({
  item: one(items, { fields: [itemConsumers.itemId], references: [items.id] }),
  participant: one(participants, {
    fields: [itemConsumers.participantId],
    references: [participants.id],
  }),
}))

export const debtsRelations = relations(debts, ({ one }) => ({
  bill: one(bills, { fields: [debts.billId], references: [bills.id] }),
  from: one(participants, { fields: [debts.fromParticipantId], references: [participants.id] }),
  to: one(participants, { fields: [debts.toParticipantId], references: [participants.id] }),
}))

// Exported types
export type Bill = typeof bills.$inferSelect
export type NewBill = typeof bills.$inferInsert
export type Participant = typeof participants.$inferSelect
export type NewParticipant = typeof participants.$inferInsert
export type Purchase = typeof purchases.$inferSelect
export type NewPurchase = typeof purchases.$inferInsert
export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
export type ItemConsumer = typeof itemConsumers.$inferSelect
export type Debt = typeof debts.$inferSelect
export type Event = typeof events.$inferSelect
export type FeatureFlag = typeof featureFlags.$inferSelect
