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
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  googleTokenExpiry: timestamp("google_token_expiry"),
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
  textContent: text("text_content"), // Extracted text content from the document
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
  googleEventId: varchar("google_event_id"), // Link to Google Calendar event
  createdAt: timestamp("created_at").defaultNow(),
});

// Google Calendar events table
export const googleCalendarEvents = pgTable("google_calendar_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  googleEventId: varchar("google_event_id").notNull().unique(),
  calendarId: varchar("calendar_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: varchar("location"),
  attendees: jsonb("attendees"),
  isAllDay: boolean("is_all_day").default(false),
  status: varchar("status").default("confirmed"),
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Drafts table for saving work-in-progress across all tools
export const drafts = pgTable("drafts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  caseId: integer("case_id").references(() => cases.id),
  toolType: varchar("tool_type").notNull(), // case-briefer, legal-research, order-drafter, etc.
  title: varchar("title").notNull(),
  formData: jsonb("form_data").notNull(), // Form inputs/state
  partialOutput: jsonb("partial_output"), // Any partial results/outputs
  status: varchar("status").default("draft"), // draft, in-progress, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export type InsertGoogleCalendarEvent = typeof googleCalendarEvents.$inferInsert;
export type GoogleCalendarEvent = typeof googleCalendarEvents.$inferSelect;

export type InsertDraft = typeof drafts.$inferInsert;
export type Draft = typeof drafts.$inferSelect;

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

export const insertGoogleCalendarEventSchema = createInsertSchema(googleCalendarEvents).omit({
  id: true,
  createdAt: true,
  lastSyncAt: true,
});

export const insertDraftSchema = createInsertSchema(drafts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
