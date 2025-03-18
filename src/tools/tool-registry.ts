
import { OpenAIEmbeddings } from '@langchain/openai';
import { Tool } from '@langchain/core/tools';

export class ToolRegistry {
    private tools: Tool[] = [];
    embeddings = new OpenAIEmbeddings();

    registerTool(tool: Tool) {
        this.tools.push(tool);
    }

    getTools(): Tool[] {
        return this.tools;
    }
}
