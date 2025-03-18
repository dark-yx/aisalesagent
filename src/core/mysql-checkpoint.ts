import { createPool, Pool } from 'mysql2/promise';

let pool: Pool;

export async function connectMySQL() {
  pool = createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  return pool;
}

export async function query(sql: string, values?: any) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(sql, values);
    return rows;
  } finally {
    conn.release();
  }
}

export class MySQLSaver {
  async saveState(threadId: string, state: any) {
    return query(
      "INSERT INTO agent_states (thread_id, state) VALUES (?, ?) ON DUPLICATE KEY UPDATE state = VALUES(state)",
      [threadId, JSON.stringify(state)]
    );
  }

  async loadState(threadId: string) {
    const result = await query("SELECT state FROM agent_states WHERE thread_id = ?", [threadId]);
    const rows = Array.isArray(result) ? result : [result];
    if (Array.isArray(rows) && rows.length > 0 && 'state' in rows[0]) {
      return JSON.parse(rows[0].state as string);
    }
    return null;
  }
}
