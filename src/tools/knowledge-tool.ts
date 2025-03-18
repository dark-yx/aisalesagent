import { tool } from '@langchain/core/tools';
import { OpenAIEmbeddings } from '@langchain/openai';
import { query } from '../database/mysql-connection';
import { z } from 'zod';

export const knowledgeTool = tool(
  async ({ query: searchQuery, category }: { query: string; category?: string }) => {
    const embeddings = new OpenAIEmbeddings();
    const queryEmbedding = await embeddings.embedQuery(searchQuery);

    const results = await query(
      `SELECT category, file_name, content,
              DOT_PRODUCT(JSON_EXTRACT(embedding, '$'), CAST(? AS JSON)) AS similarity
       FROM knowledge_base
       WHERE (? IS NULL OR category = ?)
       ORDER BY similarity DESC
       LIMIT 5`,
      [JSON.stringify(queryEmbedding), category, category]
    );

    return results.map((r: any) => ({
      category: r.category,
      file: r.file_name,
      content: r.content.slice(0, 500) + '...', // Limitar el contenido
      similarity: r.similarity
    }));
  },
  {
    name: "knowledge_search",
    description: "Busca información en la base de conocimientos de la empresa",
    schema: z.object({
      query: z.string().describe("Consulta de búsqueda"),
      category: z.string().optional().describe("Categoría específica para buscar")
    })
  }
);