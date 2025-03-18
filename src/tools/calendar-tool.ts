import { tool } from '@langchain/core/tools';
import { google } from 'googleapis';
import { z } from 'zod';

const calendar = google.calendar('v3');

export const calendarTool = tool(
  async ({ action, eventDetails }: {
    action: 'create' | 'update' | 'list';
    eventDetails?: any;
  }) => {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(Buffer.from(process.env.GOOGLE_CALENDAR_CREDS, 'base64').toString()),
      scopes: ['https://www.googleapis.com/auth/calendar']
    });

    const authClient = await auth.getClient();

    switch (action) {
      case 'create':
        return calendar.events.insert({
          calendarId: 'primary',
          auth: authClient,
          requestBody: eventDetails
        });
      case 'update':
        return calendar.events.update({
          calendarId: 'primary',
          eventId: eventDetails.id,
          auth: authClient,
          requestBody: eventDetails
        });
      case 'list':
        return calendar.events.list({
          calendarId: 'primary',
          auth: authClient,
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