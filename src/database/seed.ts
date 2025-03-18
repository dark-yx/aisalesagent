import { OpenAIEmbeddings } from '@langchain/openai';
import { query } from './mysql-connection';

export async function seedDatabase() {
    // Generar datos sintéticos (similar al original)
    interface Employee {
        id: string;
        firstName: string;
        lastName: string;
        position: string;
        metadata: any;
    }
    const employees: Employee[] = []; 
    
    const embeddings = new OpenAIEmbeddings();
    
    for (const employee of employees) {
        const summary = `${employee.firstName} ${employee.lastName}, ${employee.position}`;
        const embedding = await embeddings.embedQuery(summary);
        
        await query(
            `INSERT INTO employees 
             (employee_id, first_name, last_name, embedding, metadata)
             VALUES (?, ?, ?, JSON_ARRAY_PACK(?), ?)`,
            [
                employee.id,
                employee.firstName,
                employee.lastName,
                JSON.stringify(embedding),
                JSON.stringify(employee.metadata)
            ]
        );
    }
}