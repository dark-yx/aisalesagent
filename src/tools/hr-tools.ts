import { tool } from '@langchain/core/tools';
import { OpenAIEmbeddings } from '@langchain/openai';
import { query as mysqlQuery } from '../database/mysql-connection';
import { z } from 'zod';

export class ToolRegistry {
  private embeddings = new OpenAIEmbeddings();

  async employeeSearch(query: string, n = 5) {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    
    return mysqlQuery(
      `SELECT employee_id, full_name, metadata,
              JSON_EXTRACT(embedding, '$') AS embedding,
              DOT_PRODUCT(JSON_EXTRACT(embedding, '$'), CAST(? AS JSON)) AS similarity
       FROM employees
       ORDER BY similarity DESC
       LIMIT ?`,
      [JSON.stringify(queryEmbedding), n]
    );
  }
}

export const employeeLookupTool = tool(
  async ({ query: searchQuery }: { query: string }) => {
    const registry = new ToolRegistry();
    return registry.employeeSearch(searchQuery);
  },
  {
    name: "employee_search",
    description: "Búsqueda de empleados por similitud semántica",
    schema: z.object({
      query: z.string().describe("Consulta de búsqueda en lenguaje natural")
    })
  }
);