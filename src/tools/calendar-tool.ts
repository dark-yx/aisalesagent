
import { tool } from '@langchain/core/tools';
import { google, calendar_v3 } from 'googleapis';
import { z } from 'zod';

const calendar = google.calendar('v3');

export const calendarTool = tool(
  async ({ action, eventDetails }: {
    action: 'create' | 'update' | 'list';
    eventDetails?: calendar_v3.Schema$Event;
  }) => {
    const auth = new google.auth.GoogleAuth({
      credentials: process.env.GOOGLE_CALENDAR_CREDS ? 
        JSON.parse(Buffer.from(process.env.GOOGLE_CALENDAR_CREDS, 'base64').toString()) : 
        undefined,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });

    const authClient = await auth.getClient();

    switch (action) {
      case 'create':
        return await calendar.events.insert({
          calendarId: 'primary',
          auth: authClient as any,
          requestBody: eventDetails
        });
      case 'update':
        return await calendar.events.update({
          calendarId: 'primary',
          eventId: eventDetails?.id || '',
          auth: authClient as any,
          requestBody: eventDetails
        });
      case 'list':
        return await calendar.events.list({
          calendarId: 'primary',
          auth: authClient as any,
          timeMin: new Date().toISOString()
        });
      default:
        throw new Error('Invalid calendar action');
    }
  },
  {
    name: "calendar_manager",
    description: "Manage Google Calendar events",
    schema: z.object({
      action: z.enum(['create', 'update', 'list']),
      eventDetails: z.any().optional()
    })
  }
);
