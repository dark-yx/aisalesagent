import 'dotenv/config';
import express from 'express';
import { connectMySQL } from './database/mysql-connection';
import { AgentCoordinator } from './core/coordinator';
import { SecurityLayer } from './core/security';
import { setupWhatsAppAdapter } from './adapters/whatsapp-adapter';
import { setupWebAdapter } from './adapters/web-adapter';
import { KnowledgeManager } from './core/knowledge-manager';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

async function bootstrap() {
  await connectMySQL();
  
  const security = new SecurityLayer();
  const coordinator = new AgentCoordinator(security);

  // Cargar la base de conocimientos
  const knowledgeManager = new KnowledgeManager();
  await knowledgeManager.loadKnowledgeBase();
    
  
  // Configurar adaptadores
  setupWhatsAppAdapter(app, coordinator);
  setupWebAdapter(app, coordinator);
  
  // Ruta para la interfaz web
  app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('Error de inicio:', err);
  process.exit(1);
});
