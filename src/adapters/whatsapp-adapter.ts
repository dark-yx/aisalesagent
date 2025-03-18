import { Express } from 'express';
import { AgentCoordinator } from '../core/coordinator';

export function setupWhatsAppAdapter(app: Express, coordinator: AgentCoordinator) {
  app.post('/webhook/whatsapp', async (req, res) => {
    try {
      const message = {
        content: req.body.Body,
        from: req.body.From,
        threadId: req.body.MessageSid
      };
      
      const response = await coordinator.handleRequest('whatsapp', message);
      
      res.json({
        ...response,
        channel: 'whatsapp',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process WhatsApp message' });
    }
  });
}