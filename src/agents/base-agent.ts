import { StateGraph } from '@langchain/langgraph';
import { MySQLSaver } from '../core/mysql-checkpoint';
import { knowledgeTool } from '../tools/knowledge-tool';

export class ToolRegistry {
  private tools: Record<string, any> = {};

  registerTool(name: string, tool: any) {
    this.tools[name] = tool;
  }

  getTool(name: string) {
    return this.tools[name];
  }
}

export abstract class BaseAgent {
  protected workflow!: StateGraph<any>;
  protected checkpointer: MySQLSaver;
  protected toolRegistry: ToolRegistry;

  constructor() {
    this.checkpointer = new MySQLSaver();
    this.toolRegistry = new ToolRegistry();
    this.initializeWorkflow();
  }

  protected abstract initializeWorkflow(): void;

  async processMessage(context: { threadId: string; content: string }) {
    const app = this.workflow.compile({ checkpointer: this.checkpointer });

    const result = await app.invoke(
      { messages: [context.content] },
      { 
        recursionLimit: 15,
        configurable: { thread_id: context.threadId }
      }
    );

    return this.formatResponse(result);
  }

  private formatResponse(result: any) {
    return {
      content: result.messages[result.messages.length - 1]?.content || '',
      threadId: result.configurable.thread_id,
      timestamp: new Date().toISOString()
    };
  }

  protected initializeWorkflow() {
    this.workflow = new StateGraph({});
    this.toolRegistry.registerTool('knowledgeTool', knowledgeTool);
  }
}
