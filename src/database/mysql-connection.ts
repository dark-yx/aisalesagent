import { createPool, Pool } from 'mysql2/promise';

let pool: Pool;

export async function connectMySQL() {
  try {
    pool = createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Verificar conexión
    await pool.getConnection().then(conn => {
      console.log('MySQL conectado exitosamente');
      conn.release();
    });
    
    return pool;
  } catch (error) {
    console.error('Error al conectar con MySQL:', error);
    throw error;
  }
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