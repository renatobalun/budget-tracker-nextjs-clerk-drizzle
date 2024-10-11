import { relations } from "drizzle-orm"
import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  boolean,
  serial,
  doublePrecision,
  date,
  pgEnum
} from "drizzle-orm/pg-core"

// ENUM

export const typeEnum = pgEnum('type', ['income', 'expense']);

// auth tables

export const userMessages = pgTable('user_messages', {
  user_id: text('user_id').primaryKey().notNull(),
  createTs: timestamp('create_ts').defaultNow().notNull(),
  message: text('message').notNull(),
  currency: integer("currency_id")
  .references(() => currencies.id)
})

// other tables

export const currencies = pgTable(
  "currency",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    value: integer("value").default(0)
  }
)

export const categories = pgTable(
  "category",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    icon: text("name").notNull().unique(),
    created_at: timestamp("timestamp")
    .defaultNow()
    .notNull(),
  }
)

export const transactions = pgTable(
  "transaction",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    created_at: timestamp("timestamp")
    .defaultNow()
    .notNull(),
    updated_at: timestamp("timestamp")
    .defaultNow()
    .notNull(),
    amount: doublePrecision()
    .notNull(),
    description: text("description").notNull(),
    date: date().notNull(),
    type: typeEnum(),  
    userId: integer("user_id")
    .references(() => userMessages.user_id),
    categoryId: integer("category_id")
    .references(() => categories.id),
  }
)

// relations

export const userMessagesRelations = relations(userMessages, ({one}) => ({
  currency: one(currencies, {
    fields: [userMessages.user_id],
    references: [currencies.id]
  }),
}))

export const transactionRelations = relations(transactions, ({one}) => ({
  user: one(userMessages, {
    fields: [transactions.id],
    references: [userMessages.user_id]
  }),
  category: one(categories, {
    fields: [transactions.id],
    references: [categories.id]
  }),
}))
