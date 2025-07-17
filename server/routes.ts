import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCaseSchema,
  insertDocumentSchema,
  insertActivityHistorySchema,
  insertGeneratedOrderSchema,
  insertDocketEntrySchema 
} from "@shared/schema";
import { 
  generateCaseBrief,
  performLegalResearch,
  exploreCaseLaw,
  analyzeEvidence,
  generateOrder,
  generateJuryInstructions,
  coachOralArgument 
} from "./services/gemini";
import { processFileUpload } from "./services/fileUpload";
import { googleCalendarService } from "./services/googleCalendar";

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Case management routes
  app.post('/api/cases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const caseData = insertCaseSchema.parse({ ...req.body, userId });
      const newCase = await storage.createCase(caseData);
      res.json(newCase);
    } catch (error) {
      console.error("Error creating case:", error);
      res.status(500).json({ message: "Failed to create case" });
    }
  });

  app.get('/api/cases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cases = await storage.getCases(userId);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.get('/api/cases/:id', isAuthenticated, async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const caseItem = await storage.getCaseById(caseId);
      if (!caseItem) {
        return res.status(404).json({ message: "Case not found" });
      }
      res.json(caseItem);
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  // Document upload routes
  app.post('/api/documents/upload', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const documentData = insertDocumentSchema.parse({
        userId,
        caseId: req.body.caseId ? parseInt(req.body.caseId) : null,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        filePath: file.path,
      });

      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const caseId = req.query.caseId ? parseInt(req.query.caseId as string) : undefined;
      const documents = await storage.getDocuments(userId, caseId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Case Briefer routes
  app.post('/api/case-briefer/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { documentIds, caseDetails } = req.body;
      
      const brief = await generateCaseBrief(documentIds, caseDetails);
      
      // Save to activity history
      await storage.createActivityHistory({
        userId,
        type: 'case-briefer',
        title: `Case Brief: ${caseDetails.caseName}`,
        input: { documentIds, caseDetails },
        output: brief,
      });

      res.json(brief);
    } catch (error) {
      console.error("Error generating case brief:", error);
      res.status(500).json({ message: "Failed to generate case brief" });
    }
  });

  // Legal Research routes
  app.post('/api/legal-research/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query, filters } = req.body;
      
      const results = await performLegalResearch(query, filters);
      
      // Save to activity history
      await storage.createActivityHistory({
        userId,
        type: 'legal-research',
        title: `Legal Research: ${query}`,
        input: { query, filters },
        output: results,
      });

      res.json(results);
    } catch (error) {
      console.error("Error performing legal research:", error);
      res.status(500).json({ message: "Failed to perform legal research" });
    }
  });

  // Case Law Explorer routes
  app.post('/api/case-law/explore', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { topic, jurisdiction, dateRange } = req.body;
      
      const cases = await exploreCaseLaw(topic, jurisdiction, dateRange);
      
      // Save to activity history
      await storage.createActivityHistory({
        userId,
        type: 'case-law-explorer',
        title: `Case Law: ${topic}`,
        input: { topic, jurisdiction, dateRange },
        output: cases,
      });

      res.json(cases);
    } catch (error) {
      console.error("Error exploring case law:", error);
      res.status(500).json({ message: "Failed to explore case law" });
    }
  });

  // Evidence Analyzer routes
  app.post('/api/evidence/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { documentIds, analysisType } = req.body;
      
      const analysis = await analyzeEvidence(documentIds, analysisType);
      
      // Save to activity history
      await storage.createActivityHistory({
        userId,
        type: 'evidence-analyzer',
        title: `Evidence Analysis: ${analysisType}`,
        input: { documentIds, analysisType },
        output: analysis,
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing evidence:", error);
      res.status(500).json({ message: "Failed to analyze evidence" });
    }
  });

  // Order Drafter routes
  app.post('/api/orders/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderType, caseDetails, rulingDetails } = req.body;
      
      const order = await generateOrder(orderType, caseDetails, rulingDetails);
      
      // Save generated order
      const generatedOrder = await storage.createGeneratedOrder({
        userId,
        caseId: caseDetails.caseId,
        orderType,
        content: order.content,
      });

      // Save to activity history
      await storage.createActivityHistory({
        userId,
        type: 'order-drafter',
        title: `Order: ${orderType}`,
        input: { orderType, caseDetails, rulingDetails },
        output: order,
      });

      res.json({ ...order, id: generatedOrder.id });
    } catch (error) {
      console.error("Error generating order:", error);
      res.status(500).json({ message: "Failed to generate order" });
    }
  });

  // Jury Instruction Drafter routes
  app.post('/api/jury-instructions/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { caseDetails, charges, specificPoints } = req.body;
      
      const instructions = await generateJuryInstructions(caseDetails, charges, specificPoints);
      
      // Save to activity history
      await storage.createActivityHistory({
        userId,
        type: 'jury-instruction-drafter',
        title: `Jury Instructions: ${caseDetails.caseName}`,
        input: { caseDetails, charges, specificPoints },
        output: instructions,
      });

      res.json(instructions);
    } catch (error) {
      console.error("Error generating jury instructions:", error);
      res.status(500).json({ message: "Failed to generate jury instructions" });
    }
  });

  // Daily Docket routes
  app.post('/api/docket/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertDocketEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createDocketEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating docket entry:", error);
      res.status(500).json({ message: "Failed to create docket entry" });
    }
  });

  app.get('/api/docket/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const entries = await storage.getDocketEntries(userId, date);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching docket entries:", error);
      res.status(500).json({ message: "Failed to fetch docket entries" });
    }
  });

  // Google Calendar integration routes
  app.get('/api/google-calendar/auth-url', isAuthenticated, async (req: any, res) => {
    try {
      const authUrl = googleCalendarService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating Google Calendar auth URL:", error);
      res.status(500).json({ message: "Failed to generate auth URL" });
    }
  });

  app.post('/api/google-calendar/callback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      
      const tokens = await googleCalendarService.getTokens(code);
      
      // Store tokens in user record
      await storage.updateUser(userId, {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      });
      
      res.json({ success: true, message: "Google Calendar connected successfully" });
    } catch (error) {
      console.error("Error connecting Google Calendar:", error);
      res.status(500).json({ message: "Failed to connect Google Calendar" });
    }
  });

  app.get('/api/google-calendar/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const isConnected = await googleCalendarService.isConnected(userId);
      res.json({ connected: isConnected });
    } catch (error) {
      console.error("Error checking Google Calendar status:", error);
      res.status(500).json({ message: "Failed to check Google Calendar status" });
    }
  });

  app.get('/api/google-calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const events = await googleCalendarService.getCalendarEvents(userId, startDate, endDate);
      res.json(events);
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post('/api/google-calendar/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
      const endDate = req.body.endDate ? new Date(req.body.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await googleCalendarService.syncCalendarEvents(userId, startDate, endDate);
      res.json({ success: true, message: "Calendar events synced successfully" });
    } catch (error) {
      console.error("Error syncing Google Calendar events:", error);
      res.status(500).json({ message: "Failed to sync calendar events" });
    }
  });

  app.post('/api/google-calendar/disconnect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Remove Google tokens from user record
      await storage.updateUser(userId, {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      });
      
      res.json({ success: true, message: "Google Calendar disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
      res.status(500).json({ message: "Failed to disconnect Google Calendar" });
    }
  });

  // Oral Argument Coach routes
  app.post('/api/oral-argument/coach', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { caseDetails, argumentsText, practiceMode } = req.body;
      
      const coaching = await coachOralArgument(caseDetails, argumentsText, practiceMode);
      
      // Save to activity history
      await storage.createActivityHistory({
        userId,
        type: 'oral-argument-coach',
        title: `Oral Argument Coaching: ${caseDetails.caseName}`,
        input: { caseDetails, argumentsText, practiceMode },
        output: coaching,
      });

      res.json(coaching);
    } catch (error) {
      console.error("Error coaching oral argument:", error);
      res.status(500).json({ message: "Failed to coach oral argument" });
    }
  });

  // Activity History routes
  app.get('/api/activity-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const type = req.query.type as string;
      const history = await storage.getActivityHistory(userId, type);
      res.json(history);
    } catch (error) {
      console.error("Error fetching activity history:", error);
      res.status(500).json({ message: "Failed to fetch activity history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
