import {
pgTable,
uuid,
text,
numeric,
timestamp,
boolean,
json
} from "drizzle-orm/pg-core";

// USERS
export const users = pgTable("users", {
id: uuid("id").primaryKey().defaultRandom(),
name: text("name"),
createdAt: timestamp("created_at").defaultNow(),
});

// BILL
export const bills = pgTable("bills", {
id: uuid("id").primaryKey().defaultRandom(),
title: text("title"),
createdBy: uuid("created_by").references(() => users.id),
totalAmount: numeric("total_amount"),
createdAt: timestamp("created_at").defaultNow(),
});

// PARTICIPANTS
export const participants = pgTable("participants", {
id: uuid("id").primaryKey().defaultRandom(),
billId: uuid("bill_id").references(() => bills.id),
name: text("name"),
});

// ITEMS
export const items = pgTable("items", {
id: uuid("id").primaryKey().defaultRandom(),
billId: uuid("bill_id").references(() => bills.id),
name: text("name"),
price: numeric("price"),
});

// ITEM SPLIT (many-to-many)
export const itemSplits = pgTable("item_splits", {
id: uuid("id").primaryKey().defaultRandom(),
itemId: uuid("item_id").references(() => items.id),
participantId: uuid("participant_id").references(() => participants.id),
});

// SUMMARY / DEBT
export const debts = pgTable("debts", {
id: uuid("id").primaryKey().defaultRandom(),
billId: uuid("bill_id").references(() => bills.id),
fromParticipantId: uuid("from_participant_id"),
toParticipantId: uuid("to_participant_id"),
amount: numeric("amount"),
});

// EVENT LOG (IMPORTANT for Ads & Analytics)
export const events = pgTable("events", {
id: uuid("id").primaryKey().defaultRandom(),
userId: uuid("user_id"),
eventName: text("event_name"), // "split_completed"
metadata: json("metadata"),
createdAt: timestamp("created_at").defaultNow(),
});

// FEATURE FLAG (for rewarded ads later)
export const featureFlags = pgTable("feature_flags", {
id: uuid("id").primaryKey().defaultRandom(),
userId: uuid("user_id"),
feature: text("feature"), // "receipt_scan"
enabled: boolean("enabled").default(false),
});

// FUTURE: PAYMENT
export const settlements = pgTable("settlements", {
id: uuid("id").primaryKey().defaultRandom(),
billId: uuid("bill_id"),
fromParticipantId: uuid("from_participant_id"),
toParticipantId: uuid("to_participant_id"),
amount: numeric("amount"),
status: text("status"), // pending, paid
});
