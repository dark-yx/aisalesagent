import { SecurityLayer } from './security';
import { HRAgent } from '../agents/hr-agent';
import { ToolRegistry } from '../tools/hr-tools';
import { query } from '../database/mysql-connection';
import { knowledgeTool } from '../tools/knowledge-tool'; // Nueva importación

export class AgentCoordinator {
  private agents: Record<string, any> = {};
  private toolRegistry: ToolRegistry;

  constructor(private security: SecurityLayer) {
    this.initializeAgents();
    this.toolRegistry = new ToolRegistry();
    this.registerTools(); // Nuevo método
  }

  private registerTools() {
        if (this.toolRegistry && 'tools' in this.toolRegistry) {
            (this.toolRegistry as any).tools.push(knowledgeTool);
        }
        // Registrar otras herramientas aquí
    }

  async handleRequest(channel: string, message: any) {
    await this.security.validateRequest({
      token: message.token,
      encryptedData: message.encryptedData
    });

    const agentType = this.determineAgentType(message.content);
    const agent = this.agents[agentType];

    const response = await agent.processMessage({
      threadId: message.threadId,
      content: message.content,
      channel: channel
    });

    return {
      ...response,
      securityToken: this.security.generateToken(response.threadId)
    };
  }

  private initializeAgents() {
    this.agents["hr"] = new HRAgent();
    // Agregar otros agentes si existen
}


  private determineAgentType(content: string): string {
    if (content.toLowerCase().includes("empleado")) return "hr";
    if (content.toLowerCase().includes("conocimiento")) return "knowledge"; // Nuevo tipo
    return "support";
  }
}