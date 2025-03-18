import { Express } from 'express';
import { AgentCoordinator } from '../core/coordinator';

export function setupWebAdapter(app: Express, coordinator: AgentCoordinator) {
  // Endpoint para la interfaz web
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, threadId } = req.body;
      const response = await coordinator.handleRequest('web', {
        content: message,
        threadId: threadId || Date.now().toString()
      });
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Error processing message' });
    }
  });
}