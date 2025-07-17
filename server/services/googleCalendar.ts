import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { storage } from '../storage';
import { User } from '../../shared/schema';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Override the redirect URI to match the production URL configured in Google Cloud Console
const REDIRECT_URI = 'https://judicial-ai-assistant-bryce91.replit.app/api/google-calendar/callback';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  status?: string;
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
  }

  // Generate authorization URL for Google Calendar OAuth with state parameter
  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    // Use state parameter to maintain user context through OAuth flow
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: userId // Pass userId as state to maintain context
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Set up authenticated client for a user
  private async setupAuthenticatedClient(user: User) {
    if (!user.googleAccessToken) {
      throw new Error('User has not connected Google Calendar');
    }

    this.oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    // Check if token needs refresh
    if (user.googleTokenExpiry && user.googleTokenExpiry < new Date()) {
      await this.refreshToken(user);
    }

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Refresh expired tokens
  private async refreshToken(user: User) {
    if (!user.googleRefreshToken) {
      throw new Error('No refresh token available');
    }

    this.oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    
    // Update user tokens in database
    await storage.updateUser(user.id, {
      googleAccessToken: credentials.access_token,
      googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
    });
  }

  // Get user's calendar events for a specific date range
  async getCalendarEvents(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const calendar = await this.setupAuthenticatedClient(user);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  // Create a new calendar event
  async createCalendarEvent(userId: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const calendar = await this.setupAuthenticatedClient(user);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData,
    });

    return response.data;
  }

  // Update an existing calendar event
  async updateCalendarEvent(userId: string, eventId: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const calendar = await this.setupAuthenticatedClient(user);

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: eventData,
    });

    return response.data;
  }

  // Delete a calendar event
  async deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const calendar = await this.setupAuthenticatedClient(user);

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
  }

  // Sync calendar events with local database
  async syncCalendarEvents(userId: string, startDate: Date, endDate: Date): Promise<void> {
    const events = await this.getCalendarEvents(userId, startDate, endDate);
    
    for (const event of events) {
      if (!event.id) continue;

      const eventData = {
        userId,
        googleEventId: event.id,
        calendarId: 'primary',
        title: event.summary || 'Untitled Event',
        description: event.description || null,
        startTime: new Date(event.start.dateTime || event.start.date || ''),
        endTime: new Date(event.end.dateTime || event.end.date || ''),
        location: event.location || null,
        attendees: event.attendees || null,
        isAllDay: !!event.start.date,
        status: event.status || 'confirmed',
      };

      await storage.upsertGoogleCalendarEvent(eventData);
    }
  }

  // Check if user has Google Calendar connected
  async isConnected(userId: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    return !!(user?.googleAccessToken);
  }
}

export const googleCalendarService = new GoogleCalendarService();