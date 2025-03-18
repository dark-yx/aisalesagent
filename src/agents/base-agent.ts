
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { MySQLSaver } from '../core/mysql-checkpoint';
import { ToolRegistry } from '../tools/tool-registry';

export abstract class BaseAgent {
    protected model: ChatOpenAI;
    protected workflow: RunnableSequence;
    protected checkpointer: MySQLSaver;
    protected toolRegistry: ToolRegistry;

    constructor() {
        this.model = new ChatOpenAI({
            modelName: "gpt-4-turbo-preview",
            temperature: 0
        });
        
        this.workflow = RunnableSequence.from([
            ChatPromptTemplate.fromMessages([
                ["human", ""],
                new MessagesPlaceholder("messages")
            ]),
            this.model
        ]);
        this.checkpointer = new MySQLSaver();
        this.toolRegistry = new ToolRegistry();
        this.model = new ChatOpenAI({
            modelName: "gpt-4-turbo-preview",
            temperature: 0
        });
        this.initializeWorkflow();
    }

    protected abstract initializeWorkflow(): void;

    async processMessage(context: { threadId: string; content: string }) {
        const prevState = await this.checkpointer.loadState(context.threadId);
        
        const result = await this.workflow.invoke({
            messages: prevState?.messages || [new HumanMessage(context.content)],
            thread_id: context.threadId
        });

        await this.checkpointer.saveState(context.threadId, result);
        return this.formatResponse(result);
    }

    protected formatResponse(result: any) {
        return {
            content: result.messages[result.messages.length - 1]?.content || '',
            threadId: result.thread_id,
            timestamp: new Date().toISOString()
        };
    }
}
