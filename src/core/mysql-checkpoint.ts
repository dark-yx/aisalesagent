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
    const rows = await query("SELECT state FROM agent_states WHERE thread_id = ?", [threadId]);
    return rows.length ? JSON.parse(rows[0].state) : null;
  }
}
