import fs from 'fs';
import path from 'path';
import { OpenAIEmbeddings } from '@langchain/openai';
import { query } from '../database/mysql-connection';

export class KnowledgeManager {
  private embeddings = new OpenAIEmbeddings();
  private basePath = path.join(__dirname, '../../knowledge-base');

  async loadKnowledgeBase() {
    const directories = await fs.promises.readdir(this.basePath);
    
    for (const dir of directories) {
      const dirPath = path.join(this.basePath, dir);
      const files = await fs.promises.readdir(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        await this.processFile(dir, filePath);
      }
    }
  }

  private async processFile(category: string, filePath: string) {
    const content = await this.readFileContent(filePath);
    const embedding = await this.embeddings.embedQuery(content);

    await query(
      `INSERT INTO knowledge_base 
       (category, file_name, content, embedding) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         content = VALUES(content),
         embedding = VALUES(embedding)`,
      [category, path.basename(filePath), content, JSON.stringify(embedding)]
    );
  }

  private async readFileContent(filePath: string): Promise<string> {
    if (filePath.endsWith('.md')) {
      return fs.promises.readFile(filePath, 'utf-8');
    } else if (filePath.endsWith('.pdf')) {
      // Usar una librería para extraer texto de PDFs
      const { extractText } = await import('pdf-text-extract');
      const pages = await extractText(filePath);
      return pages.join('\n');
    }
    return '';
  }
}