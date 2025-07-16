import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cases table for managing legal cases
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  caseName: varchar("case_name").notNull(),
  caseNumber: varchar("case_number").notNull(),
  court: varchar("court"),
  dateFiled: timestamp("date_filed"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table for uploaded files
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  caseId: integer("case_id").references(() => cases.id),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: varchar("file_type").notNull(),
  filePath: varchar("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Activity history table
export const activityHistory = pgTable("activity_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // case-briefer, legal-research, etc.
  title: varchar("title").notNull(),
  input: jsonb("input").notNull(),
  output: jsonb("output").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated orders table
export const generatedOrders = pgTable("generated_orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  caseId: integer("case_id").references(() => cases.id),
  orderType: varchar("order_type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Docket entries table
export const docketEntries = pgTable("docket_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  caseId: integer("case_id").references(() => cases.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  type: varchar("type").notNull(), // hearing, motion, trial
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertCase = typeof cases.$inferInsert;
export type Case = typeof cases.$inferSelect;

export type InsertDocument = typeof documents.$inferInsert;
export type Document = typeof documents.$inferSelect;

export type InsertActivityHistory = typeof activityHistory.$inferInsert;
export type ActivityHistory = typeof activityHistory.$inferSelect;

export type InsertGeneratedOrder = typeof generatedOrders.$inferInsert;
export type GeneratedOrder = typeof generatedOrders.$inferSelect;

export type InsertDocketEntry = typeof docketEntries.$inferInsert;
export type DocketEntry = typeof docketEntries.$inferSelect;

// Zod schemas
export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertActivityHistorySchema = createInsertSchema(activityHistory).omit({
  id: true,
  createdAt: true,
});

export const insertGeneratedOrderSchema = createInsertSchema(generatedOrders).omit({
  id: true,
  createdAt: true,
});

export const insertDocketEntrySchema = createInsertSchema(docketEntries).omit({
  id: true,
  createdAt: true,
});
