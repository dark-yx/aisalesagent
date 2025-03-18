import "dotenv/config";
import express, { Express, Request, Response } from "express";
import { connectMySQL } from "./database/mysql-connection";
import { AgentCoordinator } from "./core/coordinator";
import { SecurityLayer } from "./core/security";
import { setupWhatsAppAdapter } from "./adapters/whatsapp-adapter";
import { setupWebAdapter } from "./adapters/web-adapter";
import { KnowledgeManager } from "./core/knowledge-manager";
import path from "path";

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.static(path.join(__dirname, "../public")));

app.use((err: Error, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

async function bootstrap() {
  await connectMySQL();

  const security = new SecurityLayer();
  const coordinator = new AgentCoordinator(security);

  const knowledgeManager = new KnowledgeManager();
  await knowledgeManager.loadKnowledgeBase();

  setupWhatsAppAdapter(app, coordinator);
  setupWebAdapter(app, coordinator);

  app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Error de inicio:", err);
  process.exit(1);
});
