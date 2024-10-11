import { relations } from "drizzle-orm";
import {
  timestamp,
  pgTable,
  text,
  integer,
  serial,
  doublePrecision,
  date,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

// ENUM

export const typeEnum = pgEnum("type", ["income", "expense"]);

// auth tables

export const users = pgTable("users", {
  user_id: text("user_id").primaryKey().notNull(),
  currency: integer("currency_id")
    .default(0)
    .references(() => currencies.id),
});

// other tables

export const currencies = pgTable("currency", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  value: integer("value").default(0),
});

export const categories = pgTable("category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transaction", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  amount: doublePrecision().notNull(),
  description: text("description").notNull(),
  date: date().notNull(),
  type: typeEnum(),
  userId: text("user_id").references(() => users.user_id),
  categoryId: integer("category_id").references(() => categories.id),
});


export const userOnCategories = pgTable(
  "users_categories",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.user_id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
  },
  ({ userId, categoryId }) => ({
    pk: primaryKey({ columns: [userId, categoryId] }),
  })
);

// relations

export const usersRelations = relations(users, ({ one, many }) => ({
  currency: one(currencies, {
    fields: [users.user_id],
    references: [currencies.id],
  }),
  transactions: many(transactions),
  categories: many(userOnCategories),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.id],
    references: [users.user_id],
  }),
  category: one(categories, {
    fields: [transactions.id],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
  users: many(userOnCategories),
}));

export const currenciesRelations = relations(currencies, ({ many }) => ({
  currencies: many(users),
}));

export const userOnCategoriesRelations = relations(
  userOnCategories,
  ({ one }) => ({
    users: one(users, {
      fields: [userOnCategories.userId],
      references: [users.user_id],
    }),
    categories: one(categories, {
      fields: [userOnCategories.categoryId],
      references: [categories.id],
    }),
  })
);

// export const userMessagesRelations = relations(users, ({ one }) => ({
//   currency: one(currencies, {
//     fields: [users.user_id],
//     references: [currencies.id],
//   }),
// }));

// export const transactionRelations = relations(transactions, ({ one }) => ({
//   user: one(users, {
//     fields: [transactions.id],
//     references: [users.user_id],
//   }),
//   category: one(categories, {
//     fields: [transactions.id],
//     references: [categories.id],
//   }),
// }));
