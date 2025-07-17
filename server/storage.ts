import {
  users,
  cases,
  documents,
  activityHistory,
  generatedOrders,
  docketEntries,
  googleCalendarEvents,
  drafts,
  type User,
  type UpsertUser,
  type Case,
  type InsertCase,
  type Document,
  type InsertDocument,
  type ActivityHistory,
  type InsertActivityHistory,
  type GeneratedOrder,
  type InsertGeneratedOrder,
  type DocketEntry,
  type InsertDocketEntry,
  type GoogleCalendarEvent,
  type InsertGoogleCalendarEvent,
  type Draft,
  type InsertDraft,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  
  // Case operations
  createCase(caseData: InsertCase): Promise<Case>;
  getCases(userId: string): Promise<Case[]>;
  getCaseById(id: number): Promise<Case | undefined>;
  updateCase(id: number, updates: Partial<InsertCase>): Promise<Case>;
  
  // Document operations
  createDocument(documentData: InsertDocument): Promise<Document>;
  getDocuments(userId: string, caseId?: number): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  
  // Activity history operations
  createActivityHistory(activityData: InsertActivityHistory): Promise<ActivityHistory>;
  getActivityHistory(userId: string, type?: string): Promise<ActivityHistory[]>;
  
  // Generated order operations
  createGeneratedOrder(orderData: InsertGeneratedOrder): Promise<GeneratedOrder>;
  getGeneratedOrders(userId: string, caseId?: number): Promise<GeneratedOrder[]>;
  
  // Docket operations
  createDocketEntry(entryData: InsertDocketEntry): Promise<DocketEntry>;
  getDocketEntries(userId: string, date?: Date): Promise<DocketEntry[]>;
  updateDocketEntry(id: number, updates: Partial<InsertDocketEntry>): Promise<DocketEntry>;
  
  // Google Calendar operations
  createGoogleCalendarEvent(eventData: InsertGoogleCalendarEvent): Promise<GoogleCalendarEvent>;
  getGoogleCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<GoogleCalendarEvent[]>;
  upsertGoogleCalendarEvent(eventData: InsertGoogleCalendarEvent): Promise<GoogleCalendarEvent>;
  deleteGoogleCalendarEvent(userId: string, googleEventId: string): Promise<void>;
  
  // Draft operations
  createDraft(draftData: InsertDraft): Promise<Draft>;
  getDrafts(userId: string, toolType?: string): Promise<Draft[]>;
  getDraftById(id: number): Promise<Draft | undefined>;
  updateDraft(id: number, updates: Partial<InsertDraft>): Promise<Draft>;
  deleteDraft(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Case operations
  async createCase(caseData: InsertCase): Promise<Case> {
    const [newCase] = await db.insert(cases).values(caseData).returning();
    return newCase;
  }

  async getCases(userId: string): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(eq(cases.userId, userId))
      .orderBy(desc(cases.createdAt));
  }

  async getCaseById(id: number): Promise<Case | undefined> {
    const [caseItem] = await db.select().from(cases).where(eq(cases.id, id));
    return caseItem;
  }

  async updateCase(id: number, updates: Partial<InsertCase>): Promise<Case> {
    const [updatedCase] = await db
      .update(cases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cases.id, id))
      .returning();
    return updatedCase;
  }

  // Document operations
  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }

  async getDocuments(userId: string, caseId?: number): Promise<Document[]> {
    const whereClause = caseId 
      ? and(eq(documents.userId, userId), eq(documents.caseId, caseId))
      : eq(documents.userId, userId);
    
    return await db
      .select()
      .from(documents)
      .where(whereClause)
      .orderBy(desc(documents.uploadedAt));
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  // Activity history operations
  async createActivityHistory(activityData: InsertActivityHistory): Promise<ActivityHistory> {
    const [activity] = await db.insert(activityHistory).values(activityData).returning();
    return activity;
  }

  async getActivityHistory(userId: string, type?: string): Promise<ActivityHistory[]> {
    const whereClause = type 
      ? and(eq(activityHistory.userId, userId), eq(activityHistory.type, type))
      : eq(activityHistory.userId, userId);
    
    return await db
      .select()
      .from(activityHistory)
      .where(whereClause)
      .orderBy(desc(activityHistory.createdAt));
  }

  // Generated order operations
  async createGeneratedOrder(orderData: InsertGeneratedOrder): Promise<GeneratedOrder> {
    const [order] = await db.insert(generatedOrders).values(orderData).returning();
    return order;
  }

  async getGeneratedOrders(userId: string, caseId?: number): Promise<GeneratedOrder[]> {
    const whereClause = caseId 
      ? and(eq(generatedOrders.userId, userId), eq(generatedOrders.caseId, caseId))
      : eq(generatedOrders.userId, userId);
    
    return await db
      .select()
      .from(generatedOrders)
      .where(whereClause)
      .orderBy(desc(generatedOrders.createdAt));
  }

  // Docket operations
  async createDocketEntry(entryData: InsertDocketEntry): Promise<DocketEntry> {
    const [entry] = await db.insert(docketEntries).values(entryData).returning();
    return entry;
  }

  async getDocketEntries(userId: string, date?: Date): Promise<DocketEntry[]> {
    let whereClause = eq(docketEntries.userId, userId);
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause = and(
        eq(docketEntries.userId, userId),
        gte(docketEntries.scheduledTime, startOfDay),
        lte(docketEntries.scheduledTime, endOfDay)
      )!;
    }
    
    return await db
      .select()
      .from(docketEntries)
      .where(whereClause)
      .orderBy(docketEntries.scheduledTime);
  }

  async updateDocketEntry(id: number, updates: Partial<InsertDocketEntry>): Promise<DocketEntry> {
    const [updatedEntry] = await db
      .update(docketEntries)
      .set(updates)
      .where(eq(docketEntries.id, id))
      .returning();
    return updatedEntry;
  }

  // Google Calendar operations
  async createGoogleCalendarEvent(eventData: InsertGoogleCalendarEvent): Promise<GoogleCalendarEvent> {
    const [event] = await db.insert(googleCalendarEvents).values(eventData).returning();
    return event;
  }

  async getGoogleCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<GoogleCalendarEvent[]> {
    let whereClause = eq(googleCalendarEvents.userId, userId);
    
    if (startDate && endDate) {
      whereClause = and(
        eq(googleCalendarEvents.userId, userId),
        gte(googleCalendarEvents.startTime, startDate),
        lte(googleCalendarEvents.endTime, endDate)
      )!;
    }
    
    return await db
      .select()
      .from(googleCalendarEvents)
      .where(whereClause)
      .orderBy(googleCalendarEvents.startTime);
  }

  async upsertGoogleCalendarEvent(eventData: InsertGoogleCalendarEvent): Promise<GoogleCalendarEvent> {
    const [event] = await db
      .insert(googleCalendarEvents)
      .values(eventData)
      .onConflictDoUpdate({
        target: googleCalendarEvents.googleEventId,
        set: {
          ...eventData,
          lastSyncAt: new Date(),
        },
      })
      .returning();
    return event;
  }

  async deleteGoogleCalendarEvent(userId: string, googleEventId: string): Promise<void> {
    await db
      .delete(googleCalendarEvents)
      .where(and(
        eq(googleCalendarEvents.userId, userId),
        eq(googleCalendarEvents.googleEventId, googleEventId)
      ));
  }

  // Draft operations
  async createDraft(draftData: InsertDraft): Promise<Draft> {
    const [draft] = await db.insert(drafts).values(draftData).returning();
    return draft;
  }

  async getDrafts(userId: string, toolType?: string): Promise<Draft[]> {
    let whereClause = eq(drafts.userId, userId);
    
    if (toolType) {
      whereClause = and(eq(drafts.userId, userId), eq(drafts.toolType, toolType))!;
    }
    
    return await db
      .select()
      .from(drafts)
      .where(whereClause)
      .orderBy(desc(drafts.updatedAt));
  }

  async getDraftById(id: number): Promise<Draft | undefined> {
    const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
    return draft;
  }

  async updateDraft(id: number, updates: Partial<InsertDraft>): Promise<Draft> {
    const [updatedDraft] = await db
      .update(drafts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(drafts.id, id))
      .returning();
    return updatedDraft;
  }

  async deleteDraft(id: number): Promise<void> {
    await db.delete(drafts).where(eq(drafts.id, id));
  }
}

export const storage = new DatabaseStorage();
